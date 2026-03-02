import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { GitBranch, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Branch {
  id: string;
  name: string;
  fromMessageId: string;
  createdAt: Date;
  messageCount: number;
}

interface SessionBranchingProps {
  branches: Branch[];
  currentBranchId?: string;
  onCreateBranch: (fromMessageId: string, branchName: string) => void;
  onSwitchBranch: (branchId: string) => void;
  onDeleteBranch: (branchId: string) => void;
}

export default function SessionBranching({
  branches,
  currentBranchId,
  onCreateBranch,
  onSwitchBranch,
  onDeleteBranch,
}: SessionBranchingProps) {
  const [showBranchPanel, setShowBranchPanel] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState("");

  const handleCreateBranch = () => {
    if (!branchName.trim()) {
      toast.error("Branch name is required");
      return;
    }
    if (!selectedMessageId) {
      toast.error("Please select a message to branch from");
      return;
    }
    onCreateBranch(selectedMessageId, branchName);
    setBranchName("");
    setSelectedMessageId("");
    setShowBranchPanel(false);
    toast.success("Branch created successfully");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch size={18} />
          <span className="text-sm font-medium">Conversation Branches</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowBranchPanel(!showBranchPanel)}
          className="h-8 px-3"
        >
          <Plus size={16} className="mr-1" />
          New Branch
        </Button>
      </div>

      {showBranchPanel && (
        <div className="p-3 bg-muted rounded-lg space-y-2">
          <input
            type="text"
            placeholder="Branch name (e.g., 'Alternative approach')"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-border rounded"
          />
          <input
            type="text"
            placeholder="Message ID to branch from"
            value={selectedMessageId}
            onChange={(e) => setSelectedMessageId(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-border rounded"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleCreateBranch}
              className="flex-1"
            >
              Create
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBranchPanel(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {branches.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No branches yet. Create one to explore alternative conversation paths.
        </p>
      ) : (
        <div className="space-y-2">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className={`p-2 rounded-lg border cursor-pointer transition ${
                currentBranchId === branch.id
                  ? "bg-primary/10 border-primary"
                  : "bg-muted border-border hover:bg-muted/80"
              }`}
              onClick={() => onSwitchBranch(branch.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">{branch.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {branch.messageCount} messages • Created{" "}
                    {new Date(branch.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBranch(branch.id);
                    toast.success("Branch deleted");
                  }}
                  className="h-6 w-6 p-0"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
