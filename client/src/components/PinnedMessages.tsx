import React from "react";
import { Button } from "@/components/ui/button";
import { X, Pin } from "lucide-react";
import { toast } from "sonner";

interface PinnedMessagesProps {
  pinnedMessages: Array<{
    id: string;
    content: string;
    role: "user" | "assistant" | "system";
    timestamp: Date;
  }>;
  onUnpin: (messageId: string) => void;
  onMessageClick?: (messageId: string) => void;
}

export default function PinnedMessages({
  pinnedMessages,
  onUnpin,
  onMessageClick,
}: PinnedMessagesProps) {
  if (pinnedMessages.length === 0) {
    return null;
  }

  const handleUnpin = (messageId: string) => {
    onUnpin(messageId);
    toast.success("Message unpinned");
  };

  return (
    <div className="bg-muted border-b border-border p-3">
      <div className="flex items-center gap-2 mb-2">
        <Pin size={16} className="text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground">
          PINNED ({pinnedMessages.length})
        </span>
      </div>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {pinnedMessages.map((msg) => (
          <div
            key={msg.id}
            className="flex items-start gap-2 p-2 bg-background rounded border border-border hover:border-primary cursor-pointer transition-colors"
            onClick={() => onMessageClick?.(msg.id)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                {msg.role === "user" ? "You" : "Assistant"}
              </p>
              <p className="text-sm line-clamp-2 text-foreground">
                {msg.content}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleUnpin(msg.id);
              }}
              className="h-6 w-6 p-0 flex-shrink-0"
            >
              <X size={14} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
