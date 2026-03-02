import { useState } from "react";
import { Shield, Trash2, Edit2, Plus, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type PermissionLevel = "viewer" | "commenter" | "editor" | "admin";

interface Permission {
  id: string;
  userId: string;
  permissionLevel: PermissionLevel;
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
}

interface PermissionsManagerProps {
  permissions: Permission[];
  currentUserLevel?: PermissionLevel;
  onGrantPermission?: (userId: string, level: PermissionLevel) => void;
  onRevokePermission?: (permissionId: string) => void;
  onUpdatePermission?: (permissionId: string, level: PermissionLevel) => void;
}

const PERMISSION_DESCRIPTIONS: Record<PermissionLevel, string> = {
  viewer: "Can view session and history",
  commenter: "Can view and add comments",
  editor: "Can view, comment, and edit content",
  admin: "Full access including permissions management",
};

const PERMISSION_HIERARCHY: PermissionLevel[] = [
  "viewer",
  "commenter",
  "editor",
  "admin",
];

export default function PermissionsManager({
  permissions,
  currentUserLevel = "admin",
  onGrantPermission,
  onRevokePermission,
  onUpdatePermission,
}: PermissionsManagerProps) {
  const [newUserId, setNewUserId] = useState("");
  const [newPermissionLevel, setNewPermissionLevel] =
    useState<PermissionLevel>("viewer");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLevel, setEditLevel] = useState<PermissionLevel>("viewer");

  const canManagePermissions =
    currentUserLevel === "admin" ||
    currentUserLevel === "editor";

  const handleGrant = () => {
    if (newUserId.trim() && onGrantPermission) {
      onGrantPermission(newUserId, newPermissionLevel);
      setNewUserId("");
      setNewPermissionLevel("viewer");
    }
  };

  const handleStartEdit = (permission: Permission) => {
    setEditingId(permission.id);
    setEditLevel(permission.permissionLevel);
  };

  const handleSaveEdit = (permissionId: string) => {
    if (onUpdatePermission) {
      onUpdatePermission(permissionId, editLevel);
      setEditingId(null);
    }
  };

  const getPermissionColor = (level: PermissionLevel) => {
    switch (level) {
      case "viewer":
        return "bg-blue-100 text-blue-800";
      case "commenter":
        return "bg-green-100 text-green-800";
      case "editor":
        return "bg-orange-100 text-orange-800";
      case "admin":
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <div className="space-y-4">
      {/* Permissions Summary */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={20} />
          <h3 className="font-semibold">Permissions</h3>
        </div>

        {/* Current User Level */}
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Your Permission Level
          </p>
          <Badge className={getPermissionColor(currentUserLevel)}>
            {currentUserLevel.charAt(0).toUpperCase() +
              currentUserLevel.slice(1)}
          </Badge>
        </div>

        {/* Grant Permission Form */}
        {canManagePermissions && (
          <div className="space-y-3 p-3 bg-muted/30 rounded-lg mb-4">
            <p className="text-sm font-medium">Grant Permission</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="User ID or email"
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select
                value={newPermissionLevel}
                onChange={(e) =>
                  setNewPermissionLevel(e.target.value as PermissionLevel)
                }
                className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {PERMISSION_HIERARCHY.map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
              <Button onClick={handleGrant} size="sm">
                <Plus size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Permissions List */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Current Permissions ({permissions.length})
          </p>
          {permissions.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No permissions granted
            </p>
          ) : (
            permissions.map((permission) => (
              <div
                key={permission.id}
                className="flex items-center justify-between p-3 bg-background border border-border rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{permission.userId}</p>
                  <p className="text-xs text-muted-foreground">
                    {PERMISSION_DESCRIPTIONS[permission.permissionLevel]}
                  </p>
                  {permission.expiresAt && (
                    <p className="text-xs text-warning mt-1">
                      Expires:{" "}
                      {permission.expiresAt.toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {editingId === permission.id ? (
                    <>
                      <select
                        value={editLevel}
                        onChange={(e) =>
                          setEditLevel(e.target.value as PermissionLevel)
                        }
                        className="px-2 py-1 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {PERMISSION_HIERARCHY.map((level) => (
                          <option key={level} value={level}>
                            {level.charAt(0).toUpperCase() +
                              level.slice(1)}
                          </option>
                        ))}
                      </select>
                      <Button
                        onClick={() => handleSaveEdit(permission.id)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <Check size={16} />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Badge
                        className={getPermissionColor(
                          permission.permissionLevel
                        )}
                      >
                        {permission.permissionLevel.charAt(0).toUpperCase() +
                          permission.permissionLevel.slice(1)}
                      </Badge>
                      {canManagePermissions && (
                        <>
                          <Button
                            onClick={() => handleStartEdit(permission)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            onClick={() =>
                              onRevokePermission &&
                              onRevokePermission(permission.id)
                            }
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Permission Levels Info */}
      <Card className="p-4 bg-muted/30">
        <p className="text-xs font-medium text-muted-foreground mb-3">
          Permission Levels
        </p>
        <div className="space-y-2">
          {PERMISSION_HIERARCHY.map((level) => (
            <div key={level} className="flex items-start gap-2">
              <Badge className={`${getPermissionColor(level)} mt-0.5`}>
                {level.charAt(0).toUpperCase()}
              </Badge>
              <div>
                <p className="text-sm font-medium">
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {PERMISSION_DESCRIPTIONS[level]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
