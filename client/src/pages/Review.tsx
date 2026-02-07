import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  timestamp: Date;
  helpful: number;
  category: 'content' | 'experience' | 'platform' | 'support';
  verified: boolean;
}

export default function Review() {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      author: 'Sarah M.',
      rating: 5,
      title: 'Amazing Platform for Music Preservation',
      content: 'This platform has been instrumental in preserving and sharing the musical legacy. The interface is intuitive and the community is supportive. Highly recommended!',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      helpful: 24,
      category: 'platform',
      verified: true,
    },
    {
      id: '2',
      author: 'James L.',
      rating: 4,
      title: 'Great Content, Excellent Support',
      content: 'The audio quality is exceptional and the support team is responsive. Would love to see more collaboration features in the future.',
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      helpful: 18,
      category: 'support',
      verified: true,
    },
    {
      id: '3',
      author: 'Maria G.',
      rating: 5,
      title: 'Healing Frequencies Changed My Life',
      content: 'The Solbones frequency game is incredible. I use it daily for meditation and healing. The Solfeggio frequencies are authentic and powerful.',
      timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      helpful: 42,
      category: 'content',
      verified: true,
    },
  ]);

  const [newReview, setNewReview] = useState({
    title: '',
    content: '',
    rating: 5,
    category: 'platform' as const,
  });

  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');

  const handleSubmitReview = () => {
    if (newReview.title && newReview.content) {
      const review: Review = {
        id: `review-${Date.now()}`,
        author: 'You',
        rating: newReview.rating,
        title: newReview.title,
        content: newReview.content,
        timestamp: new Date(),
        helpful: 0,
        category: newReview.category,
        verified: true,
      };
      setReviews([review, ...reviews]);
      setNewReview({ title: '', content: '', rating: 5, category: 'platform' });
    }
  };

  const filteredReviews = reviews
    .filter((r) => !filterRating || r.rating === filterRating)
    .filter((r) => !filterCategory || r.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'recent') return b.timestamp.getTime() - a.timestamp.getTime();
      if (sortBy === 'helpful') return b.helpful - a.helpful;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-400';
    if (rating >= 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      content: 'from-purple-500 to-purple-600',
      experience: 'from-blue-500 to-blue-600',
      platform: 'from-green-500 to-green-600',
      support: 'from-orange-500 to-orange-600',
    };
    return colors[category] || colors.platform;
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
              <div className="text-gray-400">Based on {reviews.length} reviews</div>
            </div>

            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter((r) => r.rating === rating).length;
                const percentage = (count / reviews.length) * 100;
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
                <option value="content">Content Quality</option>
                <option value="experience">User Experience</option>
                <option value="platform">Platform Features</option>
                <option value="support">Customer Support</option>
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
              disabled={!newReview.title || !newReview.content}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3"
            >
              Submit Review
            </Button>
          </div>
        </Card>

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
              <option value="content">Content Quality</option>
              <option value="experience">User Experience</option>
              <option value="platform">Platform Features</option>
              <option value="support">Customer Support</option>
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
                      {review.author[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{review.author}</div>
                      <div className="text-xs text-gray-400">
                        {review.timestamp.toLocaleDateString()}
                        {review.verified && ' • ✓ Verified'}
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
                    {review.category}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{review.title}</h3>
              <p className="text-gray-300 mb-4">{review.content}</p>

              <div className="flex items-center gap-4">
                <button className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">
                  👍 Helpful ({review.helpful})
                </button>
                <button className="text-gray-400 hover:text-red-400 transition-colors text-sm">
                  👎 Not Helpful
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
