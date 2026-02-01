import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: Message[];
  isLoading?: boolean;
  onSendMessage: (message: string) => Promise<void>;
  sessionId?: number;
}

export default function ChatInterface({
  messages,
  isLoading,
  onSendMessage,
  sessionId,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isSending) return;

    const message = input.trim();
    setInput("");
    setIsSending(true);

    try {
      await onSendMessage(message);
    } catch (error) {
      console.error("Failed to send message:", error);
      setInput(message); // Restore input on error
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-elegant p-4 md:p-6 space-y-4 scroll-smooth" style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Welcome to Manus Agent
              </h2>
              <p className="text-muted-foreground">
                Start a conversation to interact with your autonomous agent
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
              />
            ))}
            {isLoading && (
              <TypingIndicator userName="AI Assistant" isAI={true} />
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-border bg-card p-3 md:p-4 space-y-2 md:space-y-3 safe-area-inset-bottom">
        {!sessionId && (
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg text-sm text-warning">
            Please create or select a session to start chatting
          </div>
        )}

        <div className="flex gap-2 md:gap-3 items-end">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isSending || !sessionId}
            className="flex-1 text-sm md:text-base"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isSending || !input.trim() || !sessionId}
            size="sm"
            className="gap-1 md:gap-2 shrink-0"
          >
            {isSending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground hidden md:block">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
