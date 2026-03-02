import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Send, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface MessageEditorProps {
  messageId: string;
  originalContent: string;
  onSave: (messageId: string, newContent: string) => Promise<void>;
  onRegenerate?: (messageId: string) => Promise<void>;
  onCancel: () => void;
}

export default function MessageEditor({
  messageId,
  originalContent,
  onSave,
  onRegenerate,
  onCancel,
}: MessageEditorProps) {
  const [editedContent, setEditedContent] = useState(originalContent);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleSave = async () => {
    if (!editedContent.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    if (editedContent === originalContent) {
      toast.info("No changes made");
      onCancel();
      return;
    }

    setIsSaving(true);
    try {
      await onSave(messageId, editedContent);
      toast.success("Message updated successfully");
      onCancel();
    } catch (error) {
      toast.error("Failed to update message");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = async () => {
    if (!onRegenerate) return;

    setIsRegenerating(true);
    try {
      await onRegenerate(messageId);
      toast.success("Response regenerated");
      onCancel();
    } catch (error) {
      toast.error("Failed to regenerate response");
      console.error(error);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-muted rounded-lg border border-border">
      <Textarea
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        placeholder="Edit message..."
        className="min-h-20 resize-none"
      />
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSaving || isRegenerating}
        >
          <X size={16} className="mr-1" />
          Cancel
        </Button>
        {onRegenerate && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isSaving || isRegenerating}
          >
            <RotateCcw size={16} className="mr-1" />
            Regenerate
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving || isRegenerating}
        >
          <Send size={16} className="mr-1" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
