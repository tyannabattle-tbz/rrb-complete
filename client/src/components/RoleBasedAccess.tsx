/**
 * Role-Based Access Control Component
 * Shows/hides UI elements based on user's platform role
 */

import React, { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

export type PlatformRole = 'viewer' | 'moderator' | 'broadcaster' | 'admin';

interface RoleBasedAccessProps {
  userRole: PlatformRole | null;
  requiredRole: PlatformRole | PlatformRole[];
  children: ReactNode;
  fallback?: ReactNode;
  platformId?: string;
}

/**
 * Get role hierarchy level
 */
function getRoleHierarchy(role: PlatformRole): number {
  const hierarchy: Record<PlatformRole, number> = {
    viewer: 0,
    moderator: 1,
    broadcaster: 2,
    admin: 3,
  };
  return hierarchy[role];
}

/**
 * Check if user has required role
 */
function hasRequiredRole(userRole: PlatformRole | null, requiredRole: PlatformRole | PlatformRole[]): boolean {
  if (!userRole) return false;

  const required = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const userHierarchy = getRoleHierarchy(userRole);

  return required.some((role) => userHierarchy >= getRoleHierarchy(role));
}

/**
 * RoleBasedAccess Component
 * Conditionally renders content based on user's platform role
 */
export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  userRole,
  requiredRole,
  children,
  fallback,
  platformId,
}) => {
  if (hasRequiredRole(userRole, requiredRole)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return null;
};

/**
 * BroadcasterOnly Component
 * Shows content only to broadcasters and admins
 */
export const BroadcasterOnly: React.FC<{
  userRole: PlatformRole | null;
  children: ReactNode;
  fallback?: ReactNode;
  platformId?: string;
}> = ({ userRole, children, fallback, platformId }) => {
  return (
    <RoleBasedAccess
      userRole={userRole}
      requiredRole="broadcaster"
      fallback={fallback}
      platformId={platformId}
    >
      {children}
    </RoleBasedAccess>
  );
};

/**
 * ModeratorOnly Component
 * Shows content only to moderators and admins
 */
export const ModeratorOnly: React.FC<{
  userRole: PlatformRole | null;
  children: ReactNode;
  fallback?: ReactNode;
  platformId?: string;
}> = ({ userRole, children, fallback, platformId }) => {
  return (
    <RoleBasedAccess
      userRole={userRole}
      requiredRole="moderator"
      fallback={fallback}
      platformId={platformId}
    >
      {children}
    </RoleBasedAccess>
  );
};

/**
 * AdminOnly Component
 * Shows content only to admins
 */
export const AdminOnly: React.FC<{
  userRole: PlatformRole | null;
  children: ReactNode;
  fallback?: ReactNode;
  platformId?: string;
}> = ({ userRole, children, fallback, platformId }) => {
  return (
    <RoleBasedAccess
      userRole={userRole}
      requiredRole="admin"
      fallback={fallback}
      platformId={platformId}
    >
      {children}
    </RoleBasedAccess>
  );
};

/**
 * RestrictedFeature Component
 * Shows a placeholder when user doesn't have required role
 */
export const RestrictedFeature: React.FC<{
  userRole: PlatformRole | null;
  requiredRole: PlatformRole;
  featureName: string;
  children: ReactNode;
  platformId?: string;
}> = ({ userRole, requiredRole, featureName, children, platformId }) => {
  const hasAccess = hasRequiredRole(userRole, requiredRole);

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="p-6 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-gray-800">{featureName} - Restricted</p>
          <p className="text-gray-600 text-sm mt-1">
            This feature requires {requiredRole} role or higher{platformId ? ` on ${platformId}` : ''}.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Contact an administrator to request access.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Hook to check if user has role
 */
export function useHasRole(
  userRole: PlatformRole | null,
  requiredRole: PlatformRole | PlatformRole[]
): boolean {
  return hasRequiredRole(userRole, requiredRole);
}

/**
 * Hook to get role hierarchy level
 */
export function useRoleHierarchy(role: PlatformRole | null): number {
  if (!role) return -1;
  return getRoleHierarchy(role);
}
