import { useState, useEffect } from "react";
import { Users, MessageCircle, Dot } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
  color: string;
  isOnline: boolean;
  lastActive: Date;
  cursor?: { x: number; y: number };
}

interface Annotation {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  replies: Annotation[];
}

interface RealtimeCollaborationProps {
  sessionId: number;
  currentUserId: string;
  onSendAnnotation?: (content: string) => void;
}

export default function RealtimeCollaboration({
  sessionId,
  currentUserId,
  onSendAnnotation,
}: RealtimeCollaborationProps) {
  const [users, setUsers] = useState<User[]>([
    {
      id: "user-1",
      name: "You",
      color: "#3b82f6",
      isOnline: true,
      lastActive: new Date(),
    },
    {
      id: "user-2",
      name: "Alice Johnson",
      color: "#ef4444",
      isOnline: true,
      lastActive: new Date(Date.now() - 5000),
    },
    {
      id: "user-3",
      name: "Bob Smith",
      color: "#10b981",
      isOnline: false,
      lastActive: new Date(Date.now() - 600000),
    },
  ]);

  const [annotations, setAnnotations] = useState<Annotation[]>([
    {
      id: "ann-1",
      userId: "user-2",
      userName: "Alice Johnson",
      content: "Great analysis! The tool execution was efficient.",
      timestamp: new Date(Date.now() - 120000),
      replies: [
        {
          id: "ann-1-reply-1",
          userId: "user-1",
          userName: "You",
          content: "Thanks! I optimized the query parameters.",
          timestamp: new Date(Date.now() - 60000),
          replies: [],
        },
      ],
    },
  ]);

  const [annotationInput, setAnnotationInput] = useState("");
  const [showAnnotationPanel, setShowAnnotationPanel] = useState(true);

  const handleSendAnnotation = () => {
    if (annotationInput.trim()) {
      const newAnnotation: Annotation = {
        id: `ann-${Date.now()}`,
        userId: currentUserId,
        userName: "You",
        content: annotationInput,
        timestamp: new Date(),
        replies: [],
      };
      setAnnotations([...annotations, newAnnotation]);
      setAnnotationInput("");
      if (onSendAnnotation) {
        onSendAnnotation(annotationInput);
      }
    }
  };

  const onlineUsers = users.filter((u) => u.isOnline);
  const offlineUsers = users.filter((u) => !u.isOnline);

  return (
    <div className="space-y-4">
      {/* Presence Indicators */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Users size={18} />
              Team Members ({onlineUsers.length} online)
            </h3>
          </div>

          {/* Online Users */}
          {onlineUsers.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">ONLINE</p>
              {onlineUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50"
                >
                  <div
                    className="w-3 h-3 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: user.color }}
                  >
                    <Dot size={8} className="text-white" />
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    now
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Offline Users */}
          {offlineUsers.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">OFFLINE</p>
              {offlineUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 p-2 rounded-lg opacity-60"
                >
                  <div
                    className="w-3 h-3 rounded-full opacity-40"
                    style={{ backgroundColor: user.color }}
                  />
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {Math.round(
                      (Date.now() - user.lastActive.getTime()) / 60000
                    )}{" "}
                    min ago
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Annotations Panel */}
      {showAnnotationPanel && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageCircle size={18} />
                Collaborative Annotations
              </h3>
              <Button
                onClick={() => setShowAnnotationPanel(false)}
                variant="ghost"
                size="sm"
              >
                Hide
              </Button>
            </div>

            {/* Annotations List */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {annotations.map((annotation) => (
                <div key={annotation.id} className="space-y-2">
                  {/* Main Annotation */}
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{
                          backgroundColor: annotation.userId === currentUserId
                            ? "#3b82f6"
                            : "#ef4444",
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {annotation.userName}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(
                              (Date.now() - annotation.timestamp.getTime()) /
                                60000
                            )}{" "}
                            min ago
                          </span>
                        </div>
                        <p className="text-sm text-foreground mt-1">
                          {annotation.content}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Replies */}
                  {annotation.replies.map((reply) => (
                    <div key={reply.id} className="ml-4 bg-muted/30 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{
                            backgroundColor: reply.userId === currentUserId
                              ? "#3b82f6"
                              : "#10b981",
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              {reply.userName}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {Math.round(
                                (Date.now() - reply.timestamp.getTime()) /
                                  60000
                              )}{" "}
                              min ago
                            </span>
                          </div>
                          <p className="text-sm text-foreground mt-1">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add annotation..."
                value={annotationInput}
                onChange={(e) => setAnnotationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendAnnotation();
                  }
                }}
                className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <Button
                onClick={handleSendAnnotation}
                size="sm"
                disabled={!annotationInput.trim()}
              >
                Send
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
