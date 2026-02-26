import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

const STORAGE_KEY = "qumus_user_session";
const TOKEN_EXPIRY_KEY = "session_token_expires";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();
  const [cachedUser, setCachedUser] = useState<any>(null);
  const [hasTriedFetch, setHasTriedFetch] = useState(false);

  // Load cached user on mount and extract token from URL
  useEffect(() => {
    try {
      // Extract token from URL parameter (from OAuth callback)
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get('token');
      if (tokenFromUrl) {
        localStorage.setItem('session_token', tokenFromUrl);
        // Store token expiration time (24 hours from now)
        const expiresAt = new Date().getTime() + SESSION_DURATION;
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
        console.log('[Auth] Extracted token from URL and stored in localStorage (expires in 24h)');
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      // Check if session token is still valid
      const tokenExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (tokenExpiry && new Date().getTime() > parseInt(tokenExpiry)) {
        console.log('[Auth] Session token expired, clearing cache');
        localStorage.removeItem('session_token');
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
        localStorage.removeItem(STORAGE_KEY);
      } else {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const user = JSON.parse(cached);
          setCachedUser(user);
          console.log("[Auth] Loaded cached user from localStorage:", user?.name);
        }
      }
    } catch (e) {
      console.error("[Auth] Failed to load cached user", e);
    }
  }, []);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: (failureCount) => {
      // Retry up to 3 times with exponential backoff
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false, // Don't refetch on every window focus to reduce API calls
    refetchOnMount: false, // Use cached data on mount if available
    staleTime: 30 * 60 * 1000, // Keep data fresh for 30 minutes
    gcTime: 60 * 60 * 1000, // Keep in garbage collection for 1 hour
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('session_token');
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
      } catch (e) {
        console.error("[Auth] Failed to clear cached user", e);
      }
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('session_token');
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
      } catch (e) {
        console.error("[Auth] Failed to clear cached user", e);
      }
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  // Mark that we've tried to fetch and log status
  useEffect(() => {
    if (!meQuery.isLoading) {
      setHasTriedFetch(true);
      if (meQuery.error) {
        console.error("[Auth] Query error:", meQuery.error);
      }
      if (meQuery.data) {
        console.log("[Auth] User authenticated:", meQuery.data.name);
      }
    }
  }, [meQuery.isLoading, meQuery.error, meQuery.data]);

  // Cache successful user data and extend session expiry
  useEffect(() => {
    if (meQuery.data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(meQuery.data));
        // Extend session expiry on each successful auth check
        const expiresAt = new Date().getTime() + SESSION_DURATION;
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
        console.log("[Auth] Cached user to localStorage and extended session:", meQuery.data?.name);
      } catch (e) {
        console.error("[Auth] Failed to cache user", e);
      }
    }
  }, [meQuery.data]);

  // Determine which user to use: fresh data, cached data, or null
  const user = meQuery.data ?? (hasTriedFetch && cachedUser ? cachedUser : null);

  const state = useMemo(() => {
    const isLoading = meQuery.isLoading && !user && !cachedUser; // Show loading only if no data at all
    return {
      user,
      loading: isLoading,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(user),
      isCached: !meQuery.data && !!cachedUser,
    };
  }, [
    user,
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
    cachedUser,
  ]);

  // Initial fetch on mount
  useEffect(() => {
    console.log("[Auth] Component mounted");
    console.log("[Auth] Token in localStorage:", localStorage.getItem('session_token') ? 'YES' : 'NO');
    console.log("[Auth] Cached user:", cachedUser?.name || 'NONE');
    // Only refetch if we don't have cached data
    if (!cachedUser) {
      meQuery.refetch();
    }
  }, []);

  // Handle redirect on unauthenticated
  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading && !user) return; // Still loading, don't redirect yet
    if (logoutMutation.isPending) return;
    if (state.user) return; // User is authenticated
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    console.log("[Auth] Redirecting to login:", redirectPath);
    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
    user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
