import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

const STORAGE_KEY = "qumus_user_session";

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
        console.log('[Auth] Extracted token from URL and stored in localStorage');
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const user = JSON.parse(cached);
        setCachedUser(user);
        console.log("[Auth] Loaded cached user from localStorage:", user?.name);
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
    refetchOnWindowFocus: true,
    refetchOnMount: "stale",
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
      try {
        localStorage.removeItem(STORAGE_KEY);
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
      } catch (e) {
        console.error("[Auth] Failed to clear cached user", e);
      }
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  // Mark that we've tried to fetch
  useEffect(() => {
    if (!meQuery.isLoading) {
      setHasTriedFetch(true);
    }
  }, [meQuery.isLoading]);

  // Cache successful user data
  useEffect(() => {
    if (meQuery.data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(meQuery.data));
        console.log("[Auth] Cached user to localStorage:", meQuery.data?.name);
      } catch (e) {
        console.error("[Auth] Failed to cache user", e);
      }
    }
  }, [meQuery.data]);

  // Determine which user to use: fresh data, cached data, or null
  const user = meQuery.data ?? (hasTriedFetch && cachedUser ? cachedUser : null);

  const state = useMemo(() => {
    return {
      user,
      loading: meQuery.isLoading && !user, // Only show loading if we don't have any user data
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

  // Force initial refetch on mount
  useEffect(() => {
    console.log("[Auth] Component mounted, forcing refetch");
    meQuery.refetch();
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
