import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Trash2, Flag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface CommentsSectionProps {
  contentId: string;
  contentType: 'song' | 'podcast' | 'video' | 'article';
}

export function CommentsSection({
  contentId,
  contentType,
}: CommentsSectionProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const { data: comments, refetch } = trpc.comments.getThreadedComments.useQuery({
    contentId,
    contentType,
  });

  const { data: commentCount } = trpc.comments.getCommentCount.useQuery({
    contentId,
    contentType,
  });

  const createMutation = trpc.comments.createComment.useMutation({
    onSuccess: () => {
      refetch();
      setNewComment('');
      setReplyingTo(null);
    },
  });

  const likeMutation = trpc.comments.likeComment.useMutation({
    onSuccess: () => refetch(),
  });

  const deleteMutation = trpc.comments.deleteComment.useMutation({
    onSuccess: () => refetch(),
  });

  const handlePostComment = () => {
    if (!user || !newComment.trim()) return;

    createMutation.mutate({
      contentId,
      contentType,
      userId: user.id,
      userName: user.name || 'Anonymous',
      content: newComment,
      parentCommentId: replyingTo,
    });
  };

  const CommentItem = ({ comment, isReply = false }: any) => (
    <Card
      className={`bg-slate-700/50 border-slate-600 p-4 ${
        isReply ? 'ml-8 mt-2' : 'mb-4'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-white">{comment.userName}</h4>
          <p className="text-xs text-slate-400">
            {comment.createdAt
              ? new Date(comment.createdAt).toLocaleDateString()
              : 'Just now'}
          </p>
        </div>
        {user?.id === comment.userId && (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300"
            onClick={() =>
              deleteMutation.mutate({
                commentId: comment.id,
                userId: user.id,
              })
            }
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <p className="text-slate-300 mb-3">{comment.content}</p>

      <div className="flex items-center gap-4">
        <button
          onClick={() => likeMutation.mutate({ commentId: comment.id })}
          className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors"
        >
          <Heart className="w-4 h-4" />
          <span className="text-sm">{comment.likes || 0}</span>
        </button>
        <button
          onClick={() => setReplyingTo(comment.id)}
          className="flex items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">Reply</span>
        </button>
        <button className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors">
          <Flag className="w-4 h-4" />
          <span className="text-sm">Report</span>
        </button>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-2">
          {comment.replies.map((reply: any) => (
            <CommentItem key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Comments</h3>
        <p className="text-slate-400">{commentCount || 0} comments</p>
      </div>

      {/* Comment Input */}
      {user ? (
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="space-y-3">
            {replyingTo && (
              <div className="text-sm text-slate-400 flex items-center justify-between">
                <span>Replying to comment...</span>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-slate-500 hover:text-slate-300"
                >
                  ✕
                </button>
              </div>
            )}
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setNewComment('');
                  setReplyingTo(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePostComment}
                disabled={!newComment.trim()}
                className="flex-1 bg-amber-500 hover:bg-amber-600"
              >
                Post Comment
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="bg-slate-800 border-slate-700 p-4 text-center">
          <p className="text-slate-400 mb-3">Sign in to leave a comment</p>
          <Button className="bg-amber-500 hover:bg-amber-600">Sign In</Button>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <Card className="bg-slate-800 border-slate-700 p-8 text-center">
            <p className="text-slate-400">No comments yet. Be the first to comment!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
