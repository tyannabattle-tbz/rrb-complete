import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';

interface ReviewFormData {
  title: string;
  content: string;
  rating: number;
  category: 'content_quality' | 'user_experience' | 'platform_features' | 'customer_support' | 'general';
}

export default function Review() {
  const { user } = useAuth();
  const [newReview, setNewReview] = useState<ReviewFormData>({
    title: '',
    content: '',
    rating: 5,
    category: 'general',
  });

  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');

  // tRPC queries and mutations
  const reviewsQuery = trpc.reviews.getReviews.useQuery({ limit: 20 });
  const statsQuery = trpc.reviews.getStats.useQuery();
  const createReviewMutation = trpc.reviews.createReview.useMutation();
  const markHelpfulMutation = trpc.reviews.markHelpful.useMutation();

  const handleSubmitReview = async () => {
    if (!user || !newReview.title || !newReview.content) return;

    createReviewMutation.mutate(
      {
        rating: newReview.rating,
        title: newReview.title,
        content: newReview.content,
        category: newReview.category,
      },
      {
        onSuccess: () => {
          setNewReview({ title: '', content: '', rating: 5, category: 'general' });
          reviewsQuery.refetch();
          statsQuery.refetch();
        },
      }
    );
  };

  const handleMarkHelpful = (reviewId: number, isHelpful: boolean) => {
    markHelpfulMutation.mutate(
      { reviewId, isHelpful },
      {
        onSuccess: () => {
          reviewsQuery.refetch();
        },
      }
    );
  };

  const reviews = reviewsQuery.data || [];
  const filteredReviews = reviews
    .filter((r) => !filterRating || r.rating === filterRating)
    .filter((r) => !filterCategory || r.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'helpful') return b.helpfulCount - a.helpfulCount;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  const averageRating = statsQuery.data?.average ? parseFloat(statsQuery.data.average.toString()).toFixed(1) : '4.7';
  const reviewCount = statsQuery.data?.count || reviews.length;

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      content_quality: 'from-purple-500 to-purple-600',
      user_experience: 'from-blue-500 to-blue-600',
      platform_features: 'from-green-500 to-green-600',
      customer_support: 'from-orange-500 to-orange-600',
      general: 'from-indigo-500 to-indigo-600',
    };
    return colors[category] || colors.general;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
            👤 Reviews & Ratings
          </h1>
          <p className="text-gray-300">Share your experience with our community</p>
        </div>

        {/* Rating Summary */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-indigo-500/50 p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center justify-center">
              <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
                {averageRating}
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.round(parseFloat(averageRating)) ? 'text-yellow-400' : 'text-gray-500'}>
                    ★
                  </span>
                ))}
              </div>
              <div className="text-gray-400">Based on {reviewCount} reviews</div>
            </div>

            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter((r) => r.rating === rating).length;
                const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="w-12 text-right">
                      <span className="font-semibold text-white">{rating}★</span>
                    </div>
                    <div className="flex-grow bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-8 text-right text-gray-400 text-sm">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Write Review Section */}
        {user && (
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-indigo-500/50 p-8 mb-8">
            <h2 className="text-2xl font-bold text-indigo-300 mb-6">Write a Review</h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 block mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setNewReview({ ...newReview, rating })}
                      className={`text-3xl transition-transform hover:scale-110 ${
                        rating <= newReview.rating ? 'text-yellow-400' : 'text-gray-500'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-2">Category</label>
                <select
                  value={newReview.category}
                  onChange={(e) => setNewReview({ ...newReview, category: e.target.value as any })}
                  className="w-full bg-slate-700 text-white rounded-lg p-3"
                >
                  <option value="general">General</option>
                  <option value="content_quality">Content Quality</option>
                  <option value="user_experience">User Experience</option>
                  <option value="platform_features">Platform Features</option>
                  <option value="customer_support">Customer Support</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 block mb-2">Title</label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  placeholder="Summarize your experience..."
                  className="w-full bg-slate-700 text-white rounded-lg p-3 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-2">Review</label>
                <textarea
                  value={newReview.content}
                  onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                  placeholder="Share your detailed thoughts..."
                  rows={5}
                  className="w-full bg-slate-700 text-white rounded-lg p-3 placeholder-gray-500"
                />
              </div>

              <Button
                onClick={handleSubmitReview}
                disabled={!newReview.title || !newReview.content || createReviewMutation.isPending}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3"
              >
                {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </Card>
        )}

        {/* Filters and Sorting */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="text-gray-400 block mb-2 text-sm">Filter by Rating</label>
            <select
              value={filterRating || ''}
              onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full bg-slate-700 text-white rounded-lg p-2 text-sm"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div>
            <label className="text-gray-400 block mb-2 text-sm">Filter by Category</label>
            <select
              value={filterCategory || ''}
              onChange={(e) => setFilterCategory(e.target.value || null)}
              className="w-full bg-slate-700 text-white rounded-lg p-2 text-sm"
            >
              <option value="">All Categories</option>
              <option value="content_quality">Content Quality</option>
              <option value="user_experience">User Experience</option>
              <option value="platform_features">Platform Features</option>
              <option value="customer_support">Customer Support</option>
              <option value="general">General</option>
            </select>
          </div>

          <div>
            <label className="text-gray-400 block mb-2 text-sm">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-700 text-white rounded-lg p-2 text-sm"
            >
              <option value="recent">Most Recent</option>
              <option value="helpful">Most Helpful</option>
              <option value="rating">Highest Rating</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="bg-gradient-to-br from-slate-800 to-slate-900 border-indigo-500/50 p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold">
                      {review.id}
                    </div>
                    <div>
                      <div className="font-semibold text-white">User #{review.userId}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                        {review.isVerified ? ' • ✓ Verified' : ''}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={i < review.rating ? 'text-yellow-400' : 'text-gray-500'}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className={`bg-gradient-to-r ${getCategoryColor(review.category)} text-white px-3 py-1 rounded-full text-xs font-semibold capitalize`}>
                    {review.category.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{review.title}</h3>
              <p className="text-gray-300 mb-4">{review.content}</p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleMarkHelpful(review.id, true)}
                  className="text-gray-400 hover:text-indigo-400 transition-colors text-sm"
                >
                  👍 Helpful ({review.helpfulCount})
                </button>
                <button
                  onClick={() => handleMarkHelpful(review.id, false)}
                  className="text-gray-400 hover:text-red-400 transition-colors text-sm"
                >
                  👎 Not Helpful ({review.notHelpfulCount})
                </button>
              </div>
            </Card>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-indigo-500/50 p-8 text-center">
            <div className="text-gray-400">No reviews match your filters. Try adjusting them!</div>
          </Card>
        )}
      </div>
    </div>
  );
}
