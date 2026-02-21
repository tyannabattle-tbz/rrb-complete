import { useEffect } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook to redirect user to their intended destination after OAuth login
 * Reads the return-to URL from localStorage and redirects there
 * Prevents infinite redirect loops by checking current path
 */
export function usePostAuthRedirect() {
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Don't do anything while loading
    if (loading) return;
    if (typeof window === 'undefined') return;

    // Only redirect if user is authenticated
    if (!isAuthenticated || !user) return;

    // Get the return-to URL from localStorage
    const returnTo = localStorage.getItem('auth-return-to');
    
    if (returnTo && returnTo !== '/' && !returnTo.includes('/oauth') && !returnTo.includes('/legal')) {
      const currentPath = window.location.pathname;
      
      // Only redirect if we're not already on that page
      if (currentPath !== returnTo) {
        console.log('[PostAuthRedirect] Redirecting to', returnTo);
        
        // Clear the stored URL
        localStorage.removeItem('auth-return-to');
        
        // Redirect to the intended destination
        window.location.href = returnTo;
      } else {
        // We're already on the right page, just clear the stored URL
        localStorage.removeItem('auth-return-to');
      }
    } else {
      // Clear the stored URL if it's not valid
      localStorage.removeItem('auth-return-to');
    }
  }, [user, loading, isAuthenticated]);
}
