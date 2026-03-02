import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Trash2, Reply, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

interface Comment {
  commentId: string;
  username: string;
  avatar: string;
  content: string;
  createdAt: Date;
  likes: number;
  replies: number;
  userLiked: boolean;
}

interface VideoCommentsProps {
  videoId: string;
  comments: Comment[];
  onAddComment?: (content: string) => void;
  onLikeComment?: (commentId: string) => void;
}

export default function VideoComments({
  videoId,
  comments,
  onAddComment,
  onLikeComment,
}: VideoCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      onAddComment?.(newComment);
      setNewComment("");
      toast.success("Comment added!");
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReply = (commentId: string) => {
    if (!replyText.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    onAddComment?.(replyText);
    setReplyText("");
    setReplyingTo(null);
    toast.success("Reply added!");
  };

  const handleLikeComment = (commentId: string) => {
    onLikeComment?.(commentId);
  };

  return (
    <div className="space-y-6">
      {/* Comment Input */}
      <Card className="p-4">
        <div className="space-y-3">
          <h3 className="font-semibold">Add a comment</h3>
          <Textarea
            placeholder="Share your thoughts about this video..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="resize-none"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setNewComment("")}
              disabled={!newComment.trim()}
            >
              Cancel
            </Button>
            <Button onClick={handleAddComment} disabled={isLoading || !newComment.trim()}>
              {isLoading ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">
          {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
        </h3>

        {comments.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.commentId} className="p-4">
              <div className="flex gap-3">
                {/* Avatar */}
                <img
                  src={comment.avatar}
                  alt={comment.username}
                  className="w-10 h-10 rounded-full"
                />

                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{comment.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm mb-3 break-words">{comment.content}</p>

                  {/* Actions */}
                  <div className="flex gap-4 text-xs">
                    <button
                      onClick={() => handleLikeComment(comment.commentId)}
                      className={`flex items-center gap-1 hover:text-primary transition-colors ${
                        comment.userLiked ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{comment.likes}</span>
                    </button>

                    <button
                      onClick={() => setReplyingTo(comment.commentId)}
                      className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Reply className="w-3 h-3" />
                      <span>Reply</span>
                    </button>

                    {comment.replies > 0 && (
                      <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                        <MessageCircle className="w-3 h-3" />
                        <span>{comment.replies} replies</span>
                      </button>
                    )}
                  </div>

                  {/* Reply Input */}
                  {replyingTo === comment.commentId && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="resize-none"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAddReply(comment.commentId)}
                          disabled={!replyText.trim()}
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Delete Button */}
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
