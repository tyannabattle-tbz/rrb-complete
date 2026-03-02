import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HardDrive, Download, Trash2, Plus } from "lucide-react";

export function BackupManagement() {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      // Mock data for demonstration
      setBackups([
        {
          backupId: "backup_user_1704067200000",
          createdAt: new Date(Date.now() - 86400000),
          status: "completed",
          dataSize: 5242880,
          fileCount: 156,
          storageUrl: "https://example.com/backup1.tar.gz",
        },
        {
          backupId: "backup_user_1704153600000",
          createdAt: new Date(Date.now() - 172800000),
          status: "completed",
          dataSize: 5368709,
          fileCount: 162,
          storageUrl: "https://example.com/backup2.tar.gz",
        },
      ]);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch backups:", error);
      setLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      // Mock backup creation
      alert("Backup creation initiated. This may take a few minutes.");
      fetchBackups();
    } catch (error) {
      console.error("Failed to create backup:", error);
    }
  };

  const restoreBackup = async (backupId: string) => {
    try {
      const confirmed = confirm("Are you sure you want to restore this backup? This will overwrite current data.");
      if (confirmed) {
        alert("Backup restoration initiated. This may take several minutes.");
      }
    } catch (error) {
      console.error("Failed to restore backup:", error);
    }
  };

  const deleteBackup = async (backupId: string) => {
    try {
      const confirmed = confirm("Are you sure you want to delete this backup?");
      if (confirmed) {
        setBackups(backups.filter((b) => b.backupId !== backupId));
      }
    } catch (error) {
      console.error("Failed to delete backup:", error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading backups...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Backup Management</h1>
          <p className="text-gray-600 mt-2">Manage your automated backups and disaster recovery</p>
        </div>
        <Button onClick={createBackup} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Backup Now
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup Configuration</CardTitle>
          <CardDescription>Automatic backups are scheduled daily at 2:00 AM UTC</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Frequency</label>
              <p className="text-gray-600">Daily</p>
            </div>
            <div>
              <label className="text-sm font-medium">Retention Period</label>
              <p className="text-gray-600">90 days</p>
            </div>
            <div>
              <label className="text-sm font-medium">Include Videos</label>
              <p className="text-gray-600">Yes</p>
            </div>
            <div>
              <label className="text-sm font-medium">Include Metadata</label>
              <p className="text-gray-600">Yes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Backups</h2>
        {backups.map((backup) => (
          <Card key={backup.backupId}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <HardDrive className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium">{backup.backupId}</p>
                    <p className="text-sm text-gray-600">
                      {backup.createdAt.toLocaleDateString()} at {backup.createdAt.toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(backup.dataSize / 1024 / 1024).toFixed(2)} MB • {backup.fileCount} files
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => restoreBackup(backup.backupId)}>
                    Restore
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={backup.storageUrl} download>
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteBackup(backup.backupId)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
