import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

// Session persistence key
const SESSION_CACHE_KEY = 'manus-session-cache';
const SESSION_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getSessionCache() {
  try {
    const cached = localStorage.getItem(SESSION_CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    // Return cached session if still valid (within TTL)
    if (Date.now() - timestamp < SESSION_CACHE_TTL) {
      return data;
    }
    localStorage.removeItem(SESSION_CACHE_KEY);
    return null;
  } catch {
    return null;
  }
}

function setSessionCache(data: any) {
  try {
    localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

function clearSessionCache() {
  try {
    localStorage.removeItem(SESSION_CACHE_KEY);
  } catch {
    // Silently fail
  }
}

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    // Increased retry attempts with exponential backoff
    retry: (failureCount, error: any) => {
      // Don't retry on 401 Unauthorized (real auth failure)
      if (error?.data?.code === 'UNAUTHORIZED') return false;
      // Retry up to 5 times for network/server errors
      return failureCount < 5;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 60000),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    // Only refetch every 15 minutes (not 5), reduces forced logouts
    refetchInterval: 15 * 60 * 1000,
    // Use stale data while refetching in background
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Store the current URL before redirecting to login
  const getReturnToUrl = useCallback(() => {
    if (typeof window === 'undefined') return '/';
    const current = window.location.pathname + window.location.search + window.location.hash;
    // Don't return to login page or oauth callback
    if (current.includes('/oauth') || current.includes('/legal') || current === '/') return '/';
    return current;
  }, []);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      clearSessionCache();
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    clearSessionCache();
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
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    // Prefer fresh data, fall back to cache if query fails
    const userData = meQuery.data ?? getSessionCache();
    
    // Cache successful auth data
    if (meQuery.data) {
      setSessionCache(meQuery.data);
      localStorage.setItem(
        "manus-runtime-user-info",
        JSON.stringify(meQuery.data)
      );
    }
    
    return {
      user: userData ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(userData), // Use cached data for auth state
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    // Only redirect if we're sure the user is not authenticated
    // Don't redirect while loading or if we have cached session data
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return; // User is authenticated (either fresh or cached)
    if (typeof window === "undefined") return;
    
    const currentPath = window.location.pathname;
    
    // Don't redirect if already on login page or oauth callback
    if (currentPath === redirectPath || currentPath.includes('/oauth') || currentPath.includes('/legal')) return;

    // Only redirect if we got an explicit auth error, not just a loading state
    if (meQuery.isError) {
      // Store the return-to URL in localStorage before redirecting to login
      const returnTo = getReturnToUrl();
      if (returnTo !== '/') {
        localStorage.setItem('auth-return-to', returnTo);
      }
      
      // Use a small delay to prevent redirect loops
      const timer = setTimeout(() => {
        window.location.href = redirectPath;
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    meQuery.isError,
    state.user,
    getReturnToUrl,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
    // Expose cache management for advanced use cases
    clearCache: clearSessionCache,
  };
}
