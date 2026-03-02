import { useState } from "react";
import { MessageCircle, Trash2, Edit2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Comment {
  id: number;
  author: string;
  authorId: number;
  content: string;
  timestamp: Date;
  resolved: boolean;
  replies?: Comment[];
}

interface SessionCommentsProps {
  sessionId: number;
  comments?: Comment[];
  currentUserId?: number;
  onAddComment?: (content: string) => void;
  onDeleteComment?: (commentId: number) => void;
  onResolveComment?: (commentId: number) => void;
}

export default function SessionComments({
  sessionId,
  comments = [],
  currentUserId = 1,
  onAddComment,
  onDeleteComment,
  onResolveComment,
}: SessionCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(
    new Set()
  );

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    if (onAddComment) {
      onAddComment(newComment);
    }

    toast.success("Comment added");
    setNewComment("");
  };

  const handleDeleteComment = (commentId: number) => {
    if (onDeleteComment) {
      onDeleteComment(commentId);
    }
    toast.success("Comment deleted");
  };

  const handleResolveComment = (commentId: number) => {
    if (onResolveComment) {
      onResolveComment(commentId);
    }
    toast.success("Comment marked as resolved");
  };

  const toggleReplies = (commentId: number) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <div
      key={comment.id}
      className={`space-y-2 ${
        isReply ? "ml-8 pl-4 border-l-2 border-muted" : ""
      }`}
    >
      <Card
        className={`p-4 ${
          comment.resolved ? "bg-muted/50 opacity-60" : ""
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">
              {comment.author.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold">{comment.author}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(comment.timestamp)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {comment.resolved && (
              <Badge variant="secondary" className="text-xs">
                Resolved
              </Badge>
            )}

            {currentUserId === comment.authorId && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingId(comment.id);
                    setEditContent(comment.content);
                  }}
                >
                  <Edit2 size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            )}
          </div>
        </div>

        {editingId === comment.id ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-20"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setEditingId(null);
                  toast.success("Comment updated");
                }}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingId(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground mb-3">{comment.content}</p>
        )}

        <div className="flex gap-2 pt-2 border-t">
          {!comment.resolved && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleResolveComment(comment.id)}
              className="text-xs"
            >
              Mark Resolved
            </Button>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleReplies(comment.id)}
              className="text-xs"
            >
              {expandedReplies.has(comment.id)
                ? `Hide ${comment.replies.length} replies`
                : `Show ${comment.replies.length} replies`}
            </Button>
          )}
        </div>
      </Card>

      {/* Replies */}
      {comment.replies &&
        comment.replies.length > 0 &&
        expandedReplies.has(comment.id) && (
          <div className="space-y-2">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageCircle size={20} className="text-muted-foreground" />
        <div>
          <h3 className="font-semibold">Session Comments</h3>
          <p className="text-sm text-muted-foreground">
            {comments.length} comment{comments.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* New Comment Input */}
      <Card className="p-4 space-y-3">
        <Textarea
          placeholder="Add a comment or annotation..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-24"
        />

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => setNewComment("")}
            disabled={!newComment.trim()}
          >
            Clear
          </Button>
          <Button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="gap-2"
          >
            <Send size={16} />
            Post Comment
          </Button>
        </div>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </Card>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>

      {/* Comment Statistics */}
      {comments.length > 0 && (
        <Card className="p-4 bg-muted/30">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="font-semibold">
                {comments.filter((c) => !c.resolved).length}
              </p>
              <p className="text-muted-foreground">Open</p>
            </div>
            <div>
              <p className="font-semibold">
                {comments.filter((c) => c.resolved).length}
              </p>
              <p className="text-muted-foreground">Resolved</p>
            </div>
            <div>
              <p className="font-semibold">
                {comments.reduce((sum, c) => sum + (c.replies?.length || 0), 0)}
              </p>
              <p className="text-muted-foreground">Replies</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
