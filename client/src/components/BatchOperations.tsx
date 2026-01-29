import { useState } from "react";
import { Trash2, Download, Tag, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Session {
  id: number;
  name: string;
  status: "completed" | "failed" | "running";
  timestamp: Date;
}

interface BatchOperationsProps {
  sessions: Session[];
  onBatchDelete?: (sessionIds: number[]) => void;
  onBatchExport?: (sessionIds: number[]) => void;
  onBatchTag?: (sessionIds: number[], tag: string) => void;
}

export default function BatchOperations({
  sessions,
  onBatchDelete,
  onBatchExport,
  onBatchTag,
}: BatchOperationsProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const handleSelectAll = () => {
    if (selectedIds.size === sessions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sessions.map((s) => s.id)));
    }
  };

  const handleSelectSession = (sessionId: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(sessionId)) {
      newSelected.delete(sessionId);
    } else {
      newSelected.add(sessionId);
    }
    setSelectedIds(newSelected);
  };

  const handleDelete = () => {
    if (onBatchDelete) {
      onBatchDelete(Array.from(selectedIds));
    }
    setSelectedIds(new Set());
    setShowDeleteDialog(false);
  };

  const handleExport = () => {
    if (onBatchExport) {
      onBatchExport(Array.from(selectedIds));
    }
  };

  const handleTag = () => {
    if (onBatchTag && tagInput.trim()) {
      onBatchTag(Array.from(selectedIds), tagInput);
      setTagInput("");
      setShowTagDialog(false);
    }
  };

  const isAllSelected = selectedIds.size === sessions.length && sessions.length > 0;
  const hasSelection = selectedIds.size > 0;

  return (
    <div className="space-y-4">
      {/* Batch Operations Toolbar */}
      {hasSelection && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedIds.size} selected</Badge>
              <span className="text-sm text-muted-foreground">
                {selectedIds.size} of {sessions.length} sessions
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download size={16} />
                Export
              </Button>

              <Button
                onClick={() => setShowTagDialog(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Tag size={16} />
                Tag
              </Button>

              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="destructive"
                size="sm"
                className="gap-2"
              >
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Sessions List with Checkboxes */}
      <div className="space-y-2">
        {/* Select All */}
        <div className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg">
          <button
            onClick={handleSelectAll}
            className="p-1 hover:bg-muted rounded"
          >
            {isAllSelected ? (
              <CheckSquare size={20} className="text-primary" />
            ) : (
              <Square size={20} />
            )}
          </button>
          <span className="font-semibold text-sm">
            {isAllSelected ? "Deselect All" : "Select All"}
          </span>
        </div>

        {/* Individual Sessions */}
        {sessions.map((session) => {
          const isSelected = selectedIds.has(session.id);
          return (
            <div
              key={session.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                isSelected
                  ? "bg-primary/10 border-2 border-primary"
                  : "hover:bg-muted/50 border-2 border-transparent"
              }`}
            >
              <button
                onClick={() => handleSelectSession(session.id)}
                className="p-1 hover:bg-muted rounded"
              >
                {isSelected ? (
                  <CheckSquare size={20} className="text-primary" />
                ) : (
                  <Square size={20} />
                )}
              </button>

              <div className="flex-1">
                <p className="font-medium">{session.name}</p>
                <p className="text-sm text-muted-foreground">
                  Session #{session.id} • {session.timestamp.toLocaleDateString()}
                </p>
              </div>

              <Badge
                variant={
                  session.status === "completed"
                    ? "default"
                    : session.status === "failed"
                      ? "destructive"
                      : "secondary"
                }
              >
                {session.status}
              </Badge>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sessions</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.size} session
              {selectedIds.size !== 1 ? "s" : ""}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tag Dialog */}
      {showTagDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm">
            <div className="p-4 space-y-4">
              <h2 className="text-lg font-bold">Add Tag</h2>
              <input
                type="text"
                placeholder="Enter tag name..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleTag();
                  }
                }}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowTagDialog(false);
                    setTagInput("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleTag} className="flex-1">
                  Add Tag
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
