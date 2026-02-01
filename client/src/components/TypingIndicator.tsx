import React from "react";
import { Sparkles } from "lucide-react";

interface TypingIndicatorProps {
  userName?: string;
  isAI?: boolean;
}

export default function TypingIndicator({
  userName = "AI Assistant",
  isAI = true,
}: TypingIndicatorProps) {
  return (
    <div className="flex gap-3 animate-slide-in-up">
      {isAI && (
        <div className="size-8 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="size-4 text-primary" />
        </div>
      )}

      <div className="max-w-4xl group">
        <div className="rounded-lg px-4 py-3 bg-card border border-border text-foreground">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {userName} is typing
            </span>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>
      </div>

      {!isAI && (
        <div className="size-8 shrink-0 mt-1 rounded-full bg-secondary flex items-center justify-center">
          <span className="text-xs font-bold text-secondary-foreground">U</span>
        </div>
      )}
    </div>
  );
}
