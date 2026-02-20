import { useEffect } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook to redirect user to their intended destination after OAuth login
 * Reads the return-to URL from localStorage and redirects there
 */
export function usePostAuthRedirect() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Only run after user is authenticated and loading is done
    if (loading || !user) return;
    if (typeof window === 'undefined') return;

    // Check if we just completed auth (auth-complete cookie set by server)
    const authComplete = document.cookie.includes('auth-complete=true');
    if (!authComplete) return;

    // Get the return-to URL from localStorage
    const returnTo = localStorage.getItem('auth-return-to');
    
    if (returnTo && returnTo !== '/' && !returnTo.includes('/oauth') && !returnTo.includes('/legal')) {
      console.log('[PostAuthRedirect] Redirecting to', returnTo);
      
      // Clear the stored URL
      localStorage.removeItem('auth-return-to');
      
      // Redirect to the intended destination
      window.location.href = returnTo;
    } else {
      // Clear the stored URL if it's not valid
      localStorage.removeItem('auth-return-to');
    }
  }, [user, loading]);
}
