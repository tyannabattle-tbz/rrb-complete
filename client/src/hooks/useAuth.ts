/**
 * useAuth Hook
 * Provides authentication state and user information
 */

import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';

export interface AuthUser {
  id: number;
  email: string;
  name?: string;
  avatar?: string;
  role: 'admin' | 'user' | 'creator';
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current user
  const { data: authData, isLoading: authLoading, error: authError } = trpc.auth.me.useQuery();

  useEffect(() => {
    if (authData) {
      setUser(authData as AuthUser);
      setIsLoading(false);
    } else if (authError) {
      setError(authError.message);
      setIsLoading(false);
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [authData, authError, authLoading]);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
  };
}

/**
 * Get login URL
 */
export function getLoginUrl(): string {
  const baseUrl = process.env.VITE_OAUTH_PORTAL_URL || 'https://oauth.manus.im';
  const appId = process.env.VITE_APP_ID || '';
  const redirectUrl = `${window.location.origin}/api/oauth/callback`;
  
  return `${baseUrl}/login?app_id=${appId}&redirect_uri=${encodeURIComponent(redirectUrl)}`;
}
