import React from "react";
import { Copy, Check, Trash2, ThumbsUp, ThumbsDown } from "lucide-react";
import { useState, useRef } from "react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/formatTime";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  isLoading?: boolean;
  onDelete?: () => void;
  onReaction?: (reaction: "thumbs_up" | "thumbs_down") => void;
  userReaction?: "thumbs_up" | "thumbs_down" | null;
}

export default function ChatMessage({
  role,
  content,
  timestamp,
  isLoading,
  onDelete,
  onReaction,
  userReaction,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const touchStartX = useRef(0);
  const messageRef = useRef<HTMLDivElement>(null);

  const handleReaction = (reaction: "thumbs_up" | "thumbs_down") => {
    if (onReaction) {
      onReaction(reaction);
      toast.success(reaction === "thumbs_up" ? "Helpful!" : "Thanks for feedback");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Message copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteMessage = () => {
    if (onDelete) {
      onDelete();
      toast.success("Message deleted");
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;
    const isUserMsg = role === "user";
    if (isUserMsg && diff < 0) {
      setSwipeX(Math.max(diff, -100));
    }
  };

  const handleTouchEnd = () => {
    if (swipeX < -50 && role === "user") {
      handleDeleteMessage();
    }
    setSwipeX(0);
  };

  const isUser = role === "user";
  const isSystem = role === "system";

  return (
    <div
      className={`flex gap-3 animate-slide-in-up ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        ref={messageRef}
        className={`max-w-4xl group ${
          isUser ? "order-2" : "order-1"
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: swipeX === 0 ? 'transform 0.2s ease-out' : 'none',
        }}
      >
        <div
          className={`rounded-lg px-4 py-3 transition-all ${
            isUser
              ? "bg-primary text-primary-foreground"
              : isSystem
              ? "bg-muted/50 text-muted-foreground border border-border"
              : "bg-card border border-border text-foreground"
          } ${isLoading ? "animate-pulse" : ""}`}
        >
          {isUser || isSystem ? (
            <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
          ) : (
            <Streamdown className="text-sm">{content}</Streamdown>
          )}
        </div>

        {/* Message Actions */}
        {!isLoading && (
          <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-muted/20 rounded transition-colors"
              title="Copy message (or swipe left on mobile)"
            >
              {copied ? (
                <Check size={16} className="text-success" />
              ) : (
                <Copy size={16} className="text-muted-foreground" />
              )}
            </button>
            {!isUser && onReaction && (
              <>
                <button
                  onClick={() => handleReaction("thumbs_up")}
                  className={`p-1.5 rounded transition-colors ${
                    userReaction === "thumbs_up"
                      ? "bg-success/20 text-success"
                      : "hover:bg-muted/20 text-muted-foreground"
                  }`}
                  title="Helpful"
                >
                  <ThumbsUp size={16} fill={userReaction === "thumbs_up" ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={() => handleReaction("thumbs_down")}
                  className={`p-1.5 rounded transition-colors ${
                    userReaction === "thumbs_down"
                      ? "bg-destructive/20 text-destructive"
                      : "hover:bg-muted/20 text-muted-foreground"
                  }`}
                  title="Not helpful"
                >
                  <ThumbsDown size={16} fill={userReaction === "thumbs_down" ? "currentColor" : "none"} />
                </button>
              </>
            )}
            {isUser && onDelete && (
              <button
                onClick={handleDeleteMessage}
                className="p-1.5 hover:bg-muted/20 rounded transition-colors"
                title="Delete message"
              >
                <Trash2 size={16} className="text-destructive" />
              </button>
            )}
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <p className="text-xs text-muted-foreground mt-1" title={timestamp.toLocaleString()}>
            {formatRelativeTime(timestamp)}
          </p>
        )}
      </div>

      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : isSystem
            ? "bg-muted text-muted-foreground"
            : "bg-accent text-accent-foreground"
        } ${isUser ? "order-1" : "order-2"}`}
      >
        {isUser ? "U" : isSystem ? "S" : "A"}
      </div>
    </div>
  );
}
