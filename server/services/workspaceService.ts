export interface Workspace {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  id: number;
  workspaceId: number;
  userId: number;
  role: "owner" | "admin" | "editor" | "viewer";
  joinedAt: Date;
}

export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";

const rolePermissions: Record<WorkspaceRole, string[]> = {
  owner: ["read", "write", "delete", "manage_members", "manage_settings"],
  admin: ["read", "write", "delete", "manage_members"],
  editor: ["read", "write"],
  viewer: ["read"],
};

export function hasPermission(role: WorkspaceRole, permission: string): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function canAccessWorkspace(userRole: WorkspaceRole | null, permission: string): boolean {
  if (!userRole) return false;
  return hasPermission(userRole, permission);
}

export function canManageMembers(userRole: WorkspaceRole | null): boolean {
  return canAccessWorkspace(userRole, "manage_members");
}

export function canDeleteWorkspace(userRole: WorkspaceRole | null): boolean {
  return canAccessWorkspace(userRole, "delete") && canAccessWorkspace(userRole, "manage_settings");
}

export function getWorkspaceRoleColor(role: WorkspaceRole): string {
  const colors: Record<WorkspaceRole, string> = {
    owner: "bg-purple-100 text-purple-800",
    admin: "bg-blue-100 text-blue-800",
    editor: "bg-green-100 text-green-800",
    viewer: "bg-gray-100 text-gray-800",
  };
  return colors[role];
}

export function getWorkspaceRoleLabel(role: WorkspaceRole): string {
  const labels: Record<WorkspaceRole, string> = {
    owner: "Owner",
    admin: "Administrator",
    editor: "Editor",
    viewer: "Viewer",
  };
  return labels[role];
}
