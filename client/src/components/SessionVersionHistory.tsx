import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Download, RotateCcw, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";

interface SessionVersionHistoryProps {
  sessionId: number;
}

export function SessionVersionHistory({ sessionId }: SessionVersionHistoryProps) {
  const [expandedVersions, setExpandedVersions] = useState<Set<number>>(new Set());
  const [selectedVersions, setSelectedVersions] = useState<{ v1: number | null; v2: number | null }>({
    v1: null,
    v2: null,
  });

  const { data: versionHistory, isLoading } = trpc.sessionAutoSave.getVersionHistory.useQuery({
    sessionId,
    limit: 50,
  });

  const restoreMutation = trpc.sessionAutoSave.restoreVersion.useMutation();
  const createSnapshotMutation = trpc.sessionAutoSave.createSnapshot.useMutation();

  const handleRestore = async (versionId: number) => {
    try {
      await restoreMutation.mutateAsync({
        sessionId,
        versionId,
      });
      alert("Session restored successfully!");
    } catch (error) {
      alert(`Failed to restore: ${error}`);
    }
  };

  const handleCreateSnapshot = async () => {
    try {
      await createSnapshotMutation.mutateAsync({
        sessionId,
        description: "Manual snapshot",
      });
      alert("Snapshot created successfully!");
    } catch (error) {
      alert(`Failed to create snapshot: ${error}`);
    }
  };

  const toggleExpanded = (versionId: number) => {
    const newSet = new Set(expandedVersions);
    if (newSet.has(versionId)) {
      newSet.delete(versionId);
    } else {
      newSet.add(versionId);
    }
    setExpandedVersions(newSet);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading version history...</div>;
  }

  const versions = versionHistory?.versions || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <div>
              <CardTitle>Session Version History</CardTitle>
              <CardDescription>Manage and restore session snapshots</CardDescription>
            </div>
          </div>
          <Button onClick={handleCreateSnapshot} size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Create Snapshot
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No versions yet. Create a snapshot to get started.</div>
          ) : (
            versions.map((version: any) => (
              <div key={version.id} className="border rounded-lg p-3 hover:bg-accent/50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">v{version.versionNumber}</Badge>
                      <span className="font-medium text-sm">{version.description}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {version.messageCount} messages • {version.toolExecutionCount} executions • {version.taskCount} tasks
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleExpanded(version.id)}
                      className="p-1"
                    >
                      <ChevronDown className={`w-4 h-4 transition ${expandedVersions.has(version.id) ? "rotate-180" : ""}`} />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Restore
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Restore Version {version.versionNumber}?</DialogTitle>
                          <DialogDescription>
                            This will restore the session to this version. A backup of the current state will be created automatically.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-3 justify-end">
                          <Button variant="outline">Cancel</Button>
                          <Button
                            onClick={() => {
                              handleRestore(version.id);
                            }}
                          >
                            Restore
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {expandedVersions.has(version.id) && (
                  <div className="mt-3 pt-3 border-t text-xs space-y-1 text-muted-foreground">
                    <div>Created by: User #{version.createdBy}</div>
                    <div>Full timestamp: {new Date(version.createdAt).toLocaleString()}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
