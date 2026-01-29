import React from "react";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Streamdown } from "streamdown";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  isLoading?: boolean;
}

export default function ChatMessage({
  role,
  content,
  timestamp,
  isLoading,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        className={`max-w-2xl group ${
          isUser ? "order-2" : "order-1"
        }`}
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
              title="Copy message"
            >
              {copied ? (
                <Check size={16} className="text-success" />
              ) : (
                <Copy size={16} className="text-muted-foreground" />
              )}
            </button>
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <p className="text-xs text-muted-foreground mt-1">
            {timestamp.toLocaleTimeString()}
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
