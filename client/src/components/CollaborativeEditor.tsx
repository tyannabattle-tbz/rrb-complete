import React, { useState, useCallback, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Send, Undo2, Redo2 } from "lucide-react";

interface Operation {
  type: "insert" | "delete";
  position: number;
  content?: string;
  length?: number;
  userId: number;
  timestamp: number;
}

interface Presence {
  userId: number;
  username: string;
  cursorPosition: number;
  color: string;
  lastSeen: number;
}

export function CollaborativeEditor({ sessionId }: { sessionId: number }) {
  const [content, setContent] = useState("");
  const [operations, setOperations] = useState<Operation[]>([]);
  const [presence, setPresence] = useState<Presence[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const { data: user } = trpc.auth.me.useQuery();

  // Handle text changes
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      const position = e.currentTarget.selectionStart;

      // Calculate operation
      if (newContent.length > content.length) {
        // Insert operation
        const insertedText = newContent.substring(position - 1, position);
        const op: Operation = {
          type: "insert",
          position: position - 1,
          content: insertedText,
          userId: user?.id || 0,
          timestamp: Date.now(),
        };
        setOperations([...operations, op]);
      } else if (newContent.length < content.length) {
        // Delete operation
        const op: Operation = {
          type: "delete",
          position,
          length: content.length - newContent.length,
          userId: user?.id || 0,
          timestamp: Date.now(),
        };
        setOperations([...operations, op]);
      }

      setContent(newContent);
      setCursorPosition(position);

      // Update history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newContent);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [content, operations, history, historyIndex, user]
  );

  // Undo operation
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setContent(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  // Redo operation
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setContent(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  // Transform operations for concurrent edits (simplified OT)
  const transformOperations = useCallback((op1: Operation, op2: Operation): Operation => {
    if (op1.type === "insert" && op2.type === "insert") {
      if (op1.position < op2.position) {
        return op2;
      } else if (op1.position > op2.position) {
        return { ...op2, position: op2.position + (op1.content?.length || 0) };
      }
      return op2;
    }
    return op2;
  }, []);

  // Apply operations
  const applyOperation = useCallback(
    (op: Operation, currentContent: string): string => {
      if (op.type === "insert") {
        return currentContent.slice(0, op.position) + op.content + currentContent.slice(op.position);
      } else if (op.type === "delete") {
        return currentContent.slice(0, op.position) + currentContent.slice(op.position + (op.length || 0));
      }
      return currentContent;
    },
    []
  );

  // Simulate receiving operations from other users
  useEffect(() => {
    const timer = setInterval(() => {
      // Mock presence update
      if (user?.id) {
        setPresence([
          {
            userId: user.id,
            username: "You",
            cursorPosition,
            color: "#3b82f6",
            lastSeen: Date.now(),
          },
        ]);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [user, cursorPosition]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Collaborative Editor</CardTitle>
              <CardDescription>Real-time collaborative editing with conflict resolution</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{presence.length} active</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Active Users */}
      {presence.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2 flex-wrap">
              {presence.map((p) => (
                <Badge key={p.userId} variant="outline" className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  {p.username}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editor Toolbar */}
      <div className="flex gap-2">
        <Button
          onClick={handleUndo}
          disabled={historyIndex === 0}
          variant="outline"
          size="sm"
        >
          <Undo2 className="w-4 h-4" />
          Undo
        </Button>
        <Button
          onClick={handleRedo}
          disabled={historyIndex === history.length - 1}
          variant="outline"
          size="sm"
        >
          <Redo2 className="w-4 h-4" />
          Redo
        </Button>
        <div className="flex-1" />
        <span className="text-sm text-gray-500">
          {operations.length} operations • {content.length} characters
        </span>
      </div>

      {/* Editor */}
      <Card>
        <CardContent className="pt-6">
          <textarea
            ref={editorRef}
            value={content}
            onChange={handleChange}
            className="w-full h-96 p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Start typing... Your changes will be synced in real-time."
          />
        </CardContent>
      </Card>

      {/* Operations Log */}
      {operations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {operations.slice(-10).map((op, idx) => (
                <div key={`item-${idx}`} className="text-xs p-2 bg-gray-50 rounded flex justify-between">
                  <span>
                    {op.type === "insert" ? "➕" : "➖"} {op.type === "insert" ? `Inserted "${op.content}"` : `Deleted ${op.length} chars`} at position {op.position}
                  </span>
                  <span className="text-gray-500">
                    {new Date(op.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
