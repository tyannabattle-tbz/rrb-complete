import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Reaction {
  emoji: string;
  label: string;
  count: number;
  userReacted: boolean;
}

interface EmojiReactionsProps {
  messageId: string;
  reactions?: Record<string, { count: number; userReacted: boolean }>;
  onReact: (messageId: string, emoji: string) => void;
}

const EMOJI_OPTIONS = [
  { emoji: "👍", label: "thumbs_up" },
  { emoji: "👎", label: "thumbs_down" },
  { emoji: "❤️", label: "heart" },
  { emoji: "🎉", label: "celebrate" },
  { emoji: "🤔", label: "thinking" },
];

export default function EmojiReactions({
  messageId,
  reactions = {},
  onReact,
}: EmojiReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleReact = (emoji: string) => {
    onReact(messageId, emoji);
    setShowPicker(false);
    toast.success(`Added ${emoji} reaction`);
  };

  const reactionList = EMOJI_OPTIONS.map((opt) => ({
    ...opt,
    count: reactions[opt.label]?.count || 0,
    userReacted: reactions[opt.label]?.userReacted || false,
  })).filter(r => r.count > 0);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {reactionList.map((reaction) => (
        <Button
          key={reaction.label}
          variant={reaction.userReacted ? "default" : "outline"}
          size="sm"
          onClick={() => handleReact(reaction.emoji)}
          className="h-7 px-2 text-xs"
        >
          {reaction.emoji} {reaction.count}
        </Button>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowPicker(!showPicker)}
        className="h-7 w-7 p-0"
        title="Add reaction"
      >
        +
      </Button>
      {showPicker && (
        <div className="absolute bg-background border border-border rounded-lg p-2 shadow-lg z-50 flex gap-1">
          {EMOJI_OPTIONS.map((opt) => (
            <Button
              key={opt.label}
              variant="ghost"
              size="sm"
              onClick={() => handleReact(opt.emoji)}
              className="h-8 w-8 p-0 text-lg hover:bg-muted"
            >
              {opt.emoji}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
