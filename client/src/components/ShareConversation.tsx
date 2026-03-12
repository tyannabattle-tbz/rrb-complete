import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Share2, Lock, Earth } from "lucide-react";
import { toast } from "sonner";

interface ShareConversationProps {
  sessionId?: number;
  sessionName?: string;
  onClose?: () => void;
}

export default function ShareConversation({
  sessionId,
  sessionName = "conversation",
  onClose,
}: ShareConversationProps) {
  const [shareLink, setShareLink] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateShareLink = async () => {
    setIsGenerating(true);
    try {
      // Simulate generating a share link
      const link = `${window.location.origin}/share/${sessionId || "unknown"}-${Date.now()}`;
      setShareLink(link);
      toast.success("Share link generated!");
    } catch (error) {
      toast.error("Failed to generate share link");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success("Share link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-muted rounded-lg border border-border">
      <div className="flex items-center gap-2">
        <Share2 size={18} />
        <h3 className="font-semibold text-sm">Share Conversation</h3>
      </div>

      <div className="flex items-center gap-2 p-2 bg-background rounded border border-border">
        <Button
          variant={isPublic ? "default" : "outline"}
          size="sm"
          onClick={() => setIsPublic(true)}
          className="flex-1"
        >
          <Earth size={16} className="mr-1" />
          Public
        </Button>
        <Button
          variant={!isPublic ? "default" : "outline"}
          size="sm"
          onClick={() => setIsPublic(false)}
          className="flex-1"
        >
          <Lock size={16} className="mr-1" />
          Private
        </Button>
      </div>

      {shareLink ? (
        <div className="flex gap-2">
          <Input
            value={shareLink}
            readOnly
            className="text-xs"
          />
          <Button
            size="sm"
            onClick={copyToClipboard}
            className="flex-shrink-0"
          >
            <Copy size={16} className="mr-1" />
            Copy
          </Button>
        </div>
      ) : (
        <Button
          onClick={generateShareLink}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? "Generating..." : "Generate Share Link"}
        </Button>
      )}

      <p className="text-xs text-muted-foreground">
        {isPublic
          ? "Anyone with the link can view this conversation"
          : "Only people you share the link with can view this conversation"}
      </p>
    </div>
  );
}
