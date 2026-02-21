import { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, TrendingUp, BarChart3 } from 'lucide-react';
import {
  submitRating,
  getRatings,
  getUserRating,
  getAggregateRating,
  getRatingStats,
  getTopRated,
  getMostVoted,
  getRatingDistribution,
  exportRatingsAsJSON,
  exportRatingsAsCSV
} from '@/lib/listenerRatingService';
import { useAuth } from '@/_core/hooks/useAuth';

interface RatingPanelProps {
  targetId: string;
  targetType: 'stream' | 'channel' | 'playlist';
  targetLabel?: string;
  compact?: boolean;
  onRatingSubmit?: (rating: number, vote: string) => void;
}

export function RatingPanel({
  targetId,
  targetType,
  targetLabel = 'This content',
  compact = false,
  onRatingSubmit
}: RatingPanelProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [vote, setVote] = useState<'thumbs_up' | 'thumbs_down' | 'neutral' | null>(null);
  const [comment, setComment] = useState('');
  const [hasRated, setHasRated] = useState(false);
  const [aggregateRating, setAggregateRating] = useState<ReturnType<typeof getAggregateRating> | null>(null);
  const [stats, setStats] = useState<ReturnType<typeof getRatingStats> | null>(null);
  const [showComment, setShowComment] = useState(false);

  // Load user's existing rating and aggregate data
  useEffect(() => {
    if (user?.id) {
      const userRating = getUserRating(user.id, targetId, targetType);
      if (userRating) {
        setRating(userRating.rating);
        setVote(userRating.vote);
        setComment(userRating.comment || '');
        setHasRated(true);
      }
    }

    const aggregate = getAggregateRating(targetId, targetType);
    setAggregateRating(aggregate);

    const ratingStats = getRatingStats(targetId, targetType);
    setStats(ratingStats);
  }, [user?.id, targetId, targetType]);

  const handleSubmitRating = () => {
    if (!user?.id || rating === 0) return;

    submitRating(user.id, targetId, targetType, rating, vote || 'neutral', comment);
    setHasRated(true);
    onRatingSubmit?.(rating, vote || 'neutral');

    // Refresh aggregate data
    const aggregate = getAggregateRating(targetId, targetType);
    setAggregateRating(aggregate);

    const ratingStats = getRatingStats(targetId, targetType);
    setStats(ratingStats);
  };

  const handleExport = (format: 'json' | 'csv') => {
    const data = format === 'json' ? exportRatingsAsJSON() : exportRatingsAsCSV();
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ratings-${targetId}-${new Date().toISOString()}.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (compact) {
    return (
      <div className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-900">Rate this</span>
          {aggregateRating && aggregateRating.totalRatings > 0 && (
            <span className="text-xs text-amber-700 font-bold">
              {aggregateRating.averageRating.toFixed(1)}★ ({aggregateRating.totalRatings})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => {
                setRating(star);
                handleSubmitRating();
              }}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-4 h-4 ${
                  star <= (hoverRating || rating)
                    ? 'fill-amber-500 text-amber-500'
                    : 'text-slate-300'
                }`}
              />
            </button>
          ))}
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => {
              setVote('thumbs_up');
              handleSubmitRating();
            }}
            className={`flex-1 p-1 rounded text-xs font-medium transition-colors ${
              vote === 'thumbs_up'
                ? 'bg-green-500 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            👍
          </button>
          <button
            onClick={() => {
              setVote('thumbs_down');
              handleSubmitRating();
            }}
            className={`flex-1 p-1 rounded text-xs font-medium transition-colors ${
              vote === 'thumbs_down'
                ? 'bg-red-500 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            👎
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-500" />
          Rate {targetLabel}
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Help other listeners find quality content
        </p>
      </div>

      {/* Rating Section */}
      <div className="p-6 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            How would you rate this?
          </label>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? 'fill-amber-500 text-amber-500'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-sm text-amber-700 font-semibold mt-2">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          )}
        </div>

        {/* Vote Buttons */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            Quick feedback
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setVote(vote === 'thumbs_up' ? null : 'thumbs_up')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                vote === 'thumbs_up'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-green-500 hover:text-green-600'
              }`}
            >
              <ThumbsUp className="w-5 h-5" />
              I like it
            </button>
            <button
              onClick={() => setVote(vote === 'thumbs_down' ? null : 'thumbs_down')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                vote === 'thumbs_down'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-red-500 hover:text-red-600'
              }`}
            >
              <ThumbsDown className="w-5 h-5" />
              Not for me
            </button>
          </div>
        </div>

        {/* Comment Section */}
        <div className="mb-6">
          <button
            onClick={() => setShowComment(!showComment)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <MessageSquare className="w-4 h-4" />
            {showComment ? 'Hide' : 'Add a comment'}
          </button>

          {showComment && (
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your thoughts... (optional)"
              className="w-full mt-2 p-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
              rows={3}
            />
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmitRating}
          disabled={rating === 0 || !user?.id}
          className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
            rating === 0 || !user?.id
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg'
          }`}
        >
          {hasRated ? '✓ Update Rating' : 'Submit Rating'}
        </button>
      </div>

      {/* Aggregate Stats */}
      {aggregateRating && aggregateRating.totalRatings > 0 && (
        <div className="p-6 rounded-lg bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200">
          <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Community Feedback
          </h4>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-1">Average Rating</p>
              <div className="flex items-center justify-center gap-1">
                <span className="text-3xl font-bold text-amber-600">
                  {aggregateRating.averageRating.toFixed(1)}
                </span>
                <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-1">Total Ratings</p>
              <p className="text-3xl font-bold text-blue-600">
                {aggregateRating.totalRatings}
              </p>
            </div>
          </div>

          {/* Sentiment */}
          {stats && (
            <div className="mb-6 p-3 rounded-lg bg-white border border-slate-200">
              <p className="text-sm text-slate-600 mb-2">Community Sentiment</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${
                      stats.sentiment === 'positive'
                        ? 'bg-green-500'
                        : stats.sentiment === 'negative'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                    }`}
                    style={{
                      width: `${
                        stats.sentiment === 'positive'
                          ? 75
                          : stats.sentiment === 'negative'
                          ? 25
                          : 50
                      }%`
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {stats.sentiment.toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {/* Vote Distribution */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 rounded bg-green-50 border border-green-200">
              <ThumbsUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-slate-600">Thumbs Up</p>
              <p className="text-lg font-bold text-green-600">{aggregateRating.thumbsUp}</p>
            </div>
            <div className="text-center p-2 rounded bg-yellow-50 border border-yellow-200">
              <MessageSquare className="w-4 h-4 text-yellow-600 mx-auto mb-1" />
              <p className="text-xs text-slate-600">Neutral</p>
              <p className="text-lg font-bold text-yellow-600">{aggregateRating.neutral}</p>
            </div>
            <div className="text-center p-2 rounded bg-red-50 border border-red-200">
              <ThumbsDown className="w-4 h-4 text-red-600 mx-auto mb-1" />
              <p className="text-xs text-slate-600">Thumbs Down</p>
              <p className="text-lg font-bold text-red-600">{aggregateRating.thumbsDown}</p>
            </div>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="flex gap-2">
        <button
          onClick={() => handleExport('json')}
          className="flex-1 py-2 px-4 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 font-medium text-sm transition-colors"
        >
          Export JSON
        </button>
        <button
          onClick={() => handleExport('csv')}
          className="flex-1 py-2 px-4 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 font-medium text-sm transition-colors"
        >
          Export CSV
        </button>
      </div>
    </div>
  );
}
