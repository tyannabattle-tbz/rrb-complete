import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Search, Download, Pin, Share2, Paperclip, X } from "lucide-react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import MessageSearch from "./MessageSearch";
import MessageEditor from "./MessageEditor";
import ConversationExport from "./ConversationExport";
import PinnedMessages from "./PinnedMessages";
import ShareConversation from "./ShareConversation";
import EmojiReactions from "./EmojiReactions";
import ConversationTemplates from "./ConversationTemplates";
import CollaborationPanel from "./CollaborationPanel";
import VoiceInput from "./VoiceInput";
import SessionBranching from "./SessionBranching";
import PersonalityProfiles from "./PersonalityProfiles";
import MobileDrawer from "./MobileDrawer";
import { OfflineMode } from "./OfflineMode";
import { BookmarkedConversations } from "./BookmarkedConversations";
import { ConversationAnalytics } from "./ConversationAnalytics";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  userReaction?: "thumbs_up" | "thumbs_down" | null;
  isPinned?: boolean;
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
  const [messageCount, setMessageCount] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [showBranching, setShowBranching] = useState(false);
  const [showPersonality, setShowPersonality] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [personalityProfiles, setPersonalityProfiles] = useState<any[]>([]);
  const [activePersonalityId, setActivePersonalityId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024;
  const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'audio/mpeg', 'audio/wav', 'audio/ogg',
    'video/mp4', 'video/webm', 'video/ogg',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  // Auto-scroll to bottom only when new messages arrive
  useEffect(() => {
    if (messages.length > messageCount) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);
      setMessageCount(messages.length);
    }
  }, [messages.length, messageCount]);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles([...uploadedFiles, ...newFiles]);
      toast.success(`${newFiles.length} file(s) added`);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setUploadedFiles([...uploadedFiles, ...files]);
      toast.success(`${files.length} file(s) added`);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleReaction = (messageId: string, reaction: "thumbs_up" | "thumbs_down") => {
    toast.success(reaction === "thumbs_up" ? "Helpful feedback recorded!" : "Thanks for the feedback!");
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    toast.success("Message updated (backend integration needed)");
  };

  const handleRegenerateResponse = async (messageId: string) => {
    toast.success("Regenerating response (backend integration needed)");
  };

  const handlePinMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && message.role !== "system" && !pinnedMessages.find(m => m.id === messageId)) {
      setPinnedMessages([...pinnedMessages, { ...message, role: message.role as "user" | "assistant" }]);
      toast.success("Message pinned");
    }
  };

  const handleUnpinMessage = (messageId: string) => {
    setPinnedMessages(pinnedMessages.filter(m => m.id !== messageId));
  };

  const handleSelectTemplate = (prompt: string) => {
    setInput(prompt);
    setShowTemplates(false);
    inputRef.current?.focus();
    toast.success("Template loaded!");
  };

  const handleEmojiReaction = (messageId: string, emoji: string) => {
    // In a real app, this would send the reaction to the backend
    toast.success(`Reacted with ${emoji}`);
  };

  return (
    <div
      className={`flex flex-col h-full bg-background text-foreground transition-colors ${
        isDragging ? 'bg-primary/5 border-2 border-primary/50' : ''
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      ref={chatContainerRef}
    >   {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 border-b border-border overflow-x-auto md:overflow-visible">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSearch(!showSearch)}
          className="h-8 w-8 p-0"
          title="Search messages"
        >
          <Search size={18} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowExport(!showExport)}
          className="h-8 w-8 p-0"
          title="Export conversation"
        >
          <Download size={18} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowShare(!showShare)}
          className="h-8 w-8 p-0"
          title="Share conversation"
        >
          <Share2 size={18} />
        </Button>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTemplates(!showTemplates)}
          className="h-8 px-3 hidden sm:flex"
          title="Quick start templates"
        >
          ✨ Templates
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCollaboration(!showCollaboration)}
          className="h-8 px-3 hidden sm:flex"
          title="Collaboration settings"
        >
          👥 Collaborate
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowVoice(!showVoice)}
          className="h-8 px-3 hidden sm:flex"
          title="Voice input/output"
        >
          🎤 Voice
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowBranching(!showBranching)}
          className="h-8 px-3 hidden sm:flex"
          title="Session branching"
        >
          🌿 Branch
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPersonality(!showPersonality)}
          className="h-8 px-3 hidden sm:flex"
          title="Personality profiles"
        >
          🎭 Personality
        </Button>
      </div>

      {/* Search Bar - Desktop */}
      {showSearch && (
        <div className="px-3 py-2 border-b border-border hidden md:block">
          <MessageSearch
            messages={messages}
            onClose={() => setShowSearch(false)}
          />
        </div>
      )}

      {/* Search Bar - Mobile */}
      <MobileDrawer
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        title="Search Messages"
      >
        <MessageSearch
          messages={messages}
          onClose={() => setShowSearch(false)}
        />
      </MobileDrawer>

      {/* Export Panel - Desktop */}
      {showExport && (
        <div className="px-3 py-2 border-b border-border hidden md:block">
          <ConversationExport
            messages={messages}
            sessionName={`Session-${sessionId || "unknown"}`}
            onClose={() => setShowExport(false)}
          />
        </div>
      )}

      {/* Export Panel - Mobile */}
      <MobileDrawer
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        title="Export Conversation"
      >
        <ConversationExport
          messages={messages}
          sessionName={`Session-${sessionId || "unknown"}`}
          onClose={() => setShowExport(false)}
        />
      </MobileDrawer>

      {/* Share Panel - Desktop */}
      {showShare && (
        <div className="px-3 py-2 border-b border-border hidden md:block">
          <ShareConversation
            sessionId={sessionId}
            sessionName={`Session-${sessionId || "unknown"}`}
            onClose={() => setShowShare(false)}
          />
        </div>
      )}

      {/* Share Panel - Mobile */}
      <MobileDrawer
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        title="Share Conversation"
      >
        <ShareConversation
          sessionId={sessionId}
          sessionName={`Session-${sessionId || "unknown"}`}
          onClose={() => setShowShare(false)}
        />
      </MobileDrawer>

      {/* Pinned Messages */}
      {pinnedMessages.length > 0 && (
        <PinnedMessages
          pinnedMessages={pinnedMessages.filter(m => m.role !== "system")}
          onUnpin={handleUnpinMessage}
        />
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-elegant p-4 md:p-6 space-y-4 scroll-smooth" style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Welcome to QUMUS
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
                onReaction={(reaction) => handleReaction(message.id, reaction)}
                userReaction={message.userReaction}
              />
            ))}
            {isLoading && (
              <TypingIndicator userName="AI Assistant" isAI={true} />
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Templates Panel */}
      {showTemplates && (
        <div className="px-3 py-2 border-b border-border max-h-48 overflow-y-auto">
          <ConversationTemplates onSelectTemplate={handleSelectTemplate} />
        </div>
      )}

      {/* Collaboration Panel */}
      {showCollaboration && (
        <div className="px-3 py-2 border-b border-border max-h-48 overflow-y-auto">
          <CollaborationPanel sessionId={sessionId} />
        </div>
      )}

      {/* Voice Panel */}
      {showVoice && (
        <div className="px-3 py-2 border-b border-border max-h-48 overflow-y-auto">
          <VoiceInput
            onTranscript={(text) => setInput(text)}
            onVoicePlay={() => toast.success("Playing audio")}
          />
        </div>
      )}

      {/* Branching Panel */}
      {showBranching && (
        <div className="px-3 py-2 border-b border-border max-h-48 overflow-y-auto">
          <SessionBranching
            branches={branches}
            onCreateBranch={(fromMessageId, branchName) => {
              const newBranch = {
                id: `branch-${Date.now()}`,
                name: branchName,
                fromMessageId,
                createdAt: new Date(),
                messageCount: messages.length,
              };
              setBranches([...branches, newBranch]);
            }}
            onSwitchBranch={(branchId) => {
              toast.success(`Switched to branch`);
            }}
            onDeleteBranch={(branchId) => {
              setBranches(branches.filter((b) => b.id !== branchId));
            }}
          />
        </div>
      )}

      {/* Personality Panel */}
      {showPersonality && (
        <div className="px-3 py-2 border-b border-border max-h-48 overflow-y-auto">
          <PersonalityProfiles
            profiles={personalityProfiles}
            activeProfileId={activePersonalityId || undefined}
            onSelectProfile={(profileId) => {
              setActivePersonalityId(profileId);
              toast.success(`Personality switched`);
            }}
            onCreateProfile={(profile) => {
              const newProfile = {
                ...profile,
                id: `profile-${Date.now()}`,
              };
              setPersonalityProfiles([...personalityProfiles, newProfile]);
            }}
            onDeleteProfile={(profileId) => {
              setPersonalityProfiles(personalityProfiles.filter((p) => p.id !== profileId));
            }}
            onUpdateProfile={(profileId, updates) => {
              setPersonalityProfiles(
                personalityProfiles.map((p) =>
                  p.id === profileId ? { ...p, ...updates } : p
                )
              );
            }}
          />
        </div>
      )}

      {/* Offline Mode Indicator */}
      <div className="px-3 py-2 border-b border-border">
        <OfflineMode />
      </div>

      {/* Bookmarked Conversations */}
      <div className="px-3 py-2 border-b border-border max-h-48 overflow-y-auto">
        <BookmarkedConversations
          onSelectBookmark={(sessionId) => {
            toast.success(`Opened bookmarked conversation`);
          }}
        />
      </div>

      {/* Conversation Analytics */}
      <div className="px-3 py-2 border-b border-border">
        <ConversationAnalytics />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-border bg-card p-3 md:p-4 space-y-2 md:space-y-3 safe-area-inset-bottom">
        {!sessionId && (
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg text-sm text-warning">
            Please create or select a session to start chatting
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-sm"
              >
                <Paperclip size={14} />
                <span className="truncate max-w-xs">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="ml-1 hover:text-destructive"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 md:gap-3 items-end">
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            variant="outline"
            className="shrink-0"
            title="Attach files"
          >
            <Paperclip size={20} />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
          />
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
