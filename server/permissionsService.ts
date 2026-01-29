/**
 * Permissions Service
 * Handles fine-grained access control at session level
 */

export type PermissionLevel = "viewer" | "commenter" | "editor" | "admin";

export interface SessionPermission {
  id: string;
  sessionId: number;
  userId: string;
  permissionLevel: PermissionLevel;
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
}

export interface PermissionAction {
  action:
    | "view"
    | "comment"
    | "edit"
    | "delete"
    | "share"
    | "export"
    | "manage_permissions";
  allowedFor: PermissionLevel[];
}

export class PermissionsManager {
  private static readonly PERMISSION_MATRIX: Record<
    PermissionLevel,
    PermissionAction[]
  > = {
    viewer: [
      { action: "view", allowedFor: ["viewer", "commenter", "editor", "admin"] },
    ],
    commenter: [
      { action: "view", allowedFor: ["commenter", "editor", "admin"] },
      { action: "comment", allowedFor: ["commenter", "editor", "admin"] },
    ],
    editor: [
      { action: "view", allowedFor: ["editor", "admin"] },
      { action: "comment", allowedFor: ["editor", "admin"] },
      { action: "edit", allowedFor: ["editor", "admin"] },
      { action: "export", allowedFor: ["editor", "admin"] },
    ],
    admin: [
      { action: "view", allowedFor: ["admin"] },
      { action: "comment", allowedFor: ["admin"] },
      { action: "edit", allowedFor: ["admin"] },
      { action: "delete", allowedFor: ["admin"] },
      { action: "share", allowedFor: ["admin"] },
      { action: "export", allowedFor: ["admin"] },
      { action: "manage_permissions", allowedFor: ["admin"] },
    ],
  };

  /**
   * Check if user can perform an action
   */
  static canPerformAction(
    userPermissionLevel: PermissionLevel,
    action: PermissionAction["action"]
  ): boolean {
    const actions = this.PERMISSION_MATRIX[userPermissionLevel] || [];
    return actions.some((a) => a.action === action);
  }

  /**
   * Grant permission to user
   */
  static grantPermission(
    sessionId: number,
    userId: string,
    permissionLevel: PermissionLevel,
    grantedBy: string,
    expiresAt?: Date
  ): SessionPermission {
    return {
      id: `perm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      userId,
      permissionLevel,
      grantedBy,
      grantedAt: new Date(),
      expiresAt,
    };
  }

  /**
   * Revoke permission
   */
  static revokePermission(permissions: SessionPermission[], permissionId: string): SessionPermission[] {
    return permissions.filter((p) => p.id !== permissionId);
  }

  /**
   * Update permission level
   */
  static updatePermissionLevel(
    permission: SessionPermission,
    newLevel: PermissionLevel
  ): SessionPermission {
    return {
      ...permission,
      permissionLevel: newLevel,
    };
  }

  /**
   * Get user's permission level for a session
   */
  static getUserPermissionLevel(
    permissions: SessionPermission[],
    userId: string
  ): PermissionLevel | null {
    const permission = permissions.find((p) => p.userId === userId);
    if (!permission) return null;

    // Check if permission has expired
    if (permission.expiresAt && permission.expiresAt < new Date()) {
      return null;
    }

    return permission.permissionLevel;
  }

  /**
   * Get all permissions for a session
   */
  static getSessionPermissions(
    permissions: SessionPermission[],
    sessionId: number
  ): SessionPermission[] {
    return permissions.filter((p) => p.sessionId === sessionId);
  }

  /**
   * Check if user can manage permissions
   */
  static canManagePermissions(
    userPermissionLevel: PermissionLevel | null
  ): boolean {
    if (!userPermissionLevel) return false;
    return this.canPerformAction(userPermissionLevel, "manage_permissions");
  }

  /**
   * Get permission summary
   */
  static getPermissionSummary(permission: SessionPermission): string {
    const level = permission.permissionLevel;
    const expiry = permission.expiresAt
      ? ` (expires ${permission.expiresAt.toLocaleDateString()})`
      : "";
    return `${permission.userId}: ${level}${expiry}`;
  }

  /**
   * Get allowed actions for permission level
   */
  static getAllowedActions(permissionLevel: PermissionLevel): PermissionAction["action"][] {
    const actions = this.PERMISSION_MATRIX[permissionLevel] || [];
    return actions.map((a) => a.action);
  }

  /**
   * Validate permission hierarchy
   */
  static isValidPermissionHierarchy(
    currentLevel: PermissionLevel,
    newLevel: PermissionLevel
  ): boolean {
    const hierarchy: PermissionLevel[] = ["viewer", "commenter", "editor", "admin"];
    const currentIndex = hierarchy.indexOf(currentLevel);
    const newIndex = hierarchy.indexOf(newLevel);
    return currentIndex >= newIndex;
  }
}
