import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isTyping?: boolean;
}

interface CollaborationPanelProps {
  sessionId?: number;
  collaborators?: Collaborator[];
  onAddCollaborator?: (email: string) => Promise<void>;
  onRemoveCollaborator?: (collaboratorId: string) => Promise<void>;
}

export default function CollaborationPanel({
  sessionId,
  collaborators = [],
  onAddCollaborator,
  onRemoveCollaborator,
}: CollaborationPanelProps) {
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAddCollaborator = async () => {
    if (!newCollaboratorEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);
    try {
      await onAddCollaborator?.(newCollaboratorEmail);
      setNewCollaboratorEmail("");
      toast.success("Collaborator added!");
    } catch (error) {
      toast.error("Failed to add collaborator");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySessionLink = async () => {
    const link = `${window.location.origin}/share/${sessionId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Session link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
      console.error(error);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-muted rounded-lg border border-border">
      <div className="flex items-center gap-2">
        <Users size={18} />
        <h3 className="font-semibold text-sm">Collaboration</h3>
      </div>

      {/* Current Collaborators */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">
          Active Collaborators ({collaborators.length})
        </p>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {collaborators.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No collaborators yet. Share this session to invite others.
            </p>
          ) : (
            collaborators.map((collab) => (
              <div
                key={collab.id}
                className="flex items-center justify-between p-2 bg-background rounded border border-border text-xs"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    {collab.avatar ? (
                      <img
                        src={collab.avatar}
                        alt={collab.name}
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      <span className="text-xs font-semibold">
                        {collab.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{collab.name}</p>
                    {collab.isTyping && (
                      <p className="text-xs text-muted-foreground">typing...</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveCollaborator?.(collab.id)}
                  className="h-6 w-6 p-0 flex-shrink-0"
                >
                  ✕
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Collaborator */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">
          Add Collaborator
        </p>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Email address"
            value={newCollaboratorEmail}
            onChange={(e) => setNewCollaboratorEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddCollaborator();
            }}
            className="text-xs h-8"
          />
          <Button
            size="sm"
            onClick={handleAddCollaborator}
            disabled={isLoading}
            className="h-8"
          >
            Add
          </Button>
        </div>
      </div>

      {/* Share Link */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">
          Share Session
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopySessionLink}
          className="w-full justify-start text-xs h-8"
        >
          {copied ? (
            <>
              <Check size={14} className="mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy size={14} className="mr-2" />
              Copy Session Link
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
