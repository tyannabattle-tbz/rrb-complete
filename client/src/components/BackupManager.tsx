import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Download, Trash2, Tag, Plus } from "lucide-react";

interface Backup {
  id: string;
  createdAt: Date;
  createdBy: string;
  size: number;
  label?: string;
  isManual: boolean;
}

interface BackupManagerProps {
  backups: Backup[];
  onCreateBackup?: () => void;
  onRestoreBackup?: (backupId: string) => void;
  onDeleteBackup?: (backupId: string) => void;
  onLabelBackup?: (backupId: string, label: string) => void;
  isLoading?: boolean;
}

export const BackupManager: React.FC<BackupManagerProps> = ({
  backups,
  onCreateBackup,
  onRestoreBackup,
  onDeleteBackup,
  onLabelBackup,
  isLoading = false,
}) => {
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleSaveLabel = (backupId: string) => {
    if (newLabel.trim() && onLabelBackup) {
      onLabelBackup(backupId, newLabel);
      setEditingLabel(null);
      setNewLabel("");
    }
  };

  const manualBackups = backups.filter((b) => b.isManual);
  const autoBackups = backups.filter((b) => !b.isManual);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Backup Manager</CardTitle>
              <CardDescription>
                Manage automatic and manual session backups
              </CardDescription>
            </div>
            <Button
              onClick={onCreateBackup}
              disabled={isLoading}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Backup
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">
                All ({backups.length})
              </TabsTrigger>
              <TabsTrigger value="manual">
                Manual ({manualBackups.length})
              </TabsTrigger>
              <TabsTrigger value="auto">
                Automatic ({autoBackups.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-2">
              {backups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No backups yet. Create one to get started.
                </div>
              ) : (
                backups.map((backup) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {backup.label || `Backup ${backup.id.slice(-8)}`}
                        </span>
                        {backup.isManual && (
                          <Badge variant="outline" className="text-xs">
                            Manual
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {backup.createdAt.toLocaleString()} • {formatFileSize(backup.size)} • by {backup.createdBy}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingLabel(backup.id)}
                        className="gap-2"
                      >
                        <Tag className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRestoreBackup?.(backup.id)}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Restore
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteBackup?.(backup.id)}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="manual" className="space-y-2">
              {manualBackups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No manual backups. Create one to get started.
                </div>
              ) : (
                manualBackups.map((backup) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {backup.label || `Backup ${backup.id.slice(-8)}`}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Manual
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {backup.createdAt.toLocaleString()} • {formatFileSize(backup.size)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRestoreBackup?.(backup.id)}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Restore
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteBackup?.(backup.id)}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="auto" className="space-y-2">
              {autoBackups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No automatic backups yet.
                </div>
              ) : (
                autoBackups.map((backup) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {backup.label || `Backup ${backup.id.slice(-8)}`}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {backup.createdAt.toLocaleString()} • {formatFileSize(backup.size)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRestoreBackup?.(backup.id)}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Restore
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteBackup?.(backup.id)}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>

          {editingLabel && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-96">
                <CardHeader>
                  <CardTitle>Label Backup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Enter backup label..."
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSaveLabel(editingLabel)}
                      className="flex-1"
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingLabel(null);
                        setNewLabel("");
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupManager;
