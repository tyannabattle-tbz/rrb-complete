import React, { useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  [key: string]: any;
}

/**
 * ProtectedRoute wrapper that ensures user is authenticated before rendering
 * Handles the auth redirect flow properly without infinite loops
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    // Store the current location so we can redirect back after login
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    if (typeof window !== 'undefined' && currentPath !== '/') {
      localStorage.setItem('auth-return-to', currentPath);
    }
    
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = getLoginUrl();
    }
    return null;
  }

  // User is authenticated, render the component
  return <Component {...rest} />;
};

export default ProtectedRoute;
