import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

interface Review {
  id: number;
  userId: number;
  rating: number;
  title: string;
  content: string;
  category: string;
  isVerified: boolean;
  createdAt: Date;
  helpfulCount: number;
  notHelpfulCount: number;
}

interface UserProfile {
  id: number;
  email: string;
  name: string;
  subscriptionTier: string;
  totalDonations: number;
  createdAt: Date;
}

export default function AdminModeration() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'reviews' | 'users' | 'analytics' | 'content'>('reviews');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'flagged'>('all');

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-8 flex items-center justify-center">
        <Card className="bg-gray-900 border-red-500 p-8 text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-300">You do not have permission to access the admin dashboard.</p>
        </Card>
      </div>
    );
  }

  // tRPC queries
  const reviewsQuery = trpc.reviews.getReviews.useQuery({ limit: 100 });
  const statsQuery = trpc.reviews.getStats.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
            🛡️ Admin Dashboard
          </h1>
          <p className="text-gray-300">Manage content, users, and platform analytics</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {(['reviews', 'users', 'analytics', 'content'] as const).map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tab === 'reviews' && '📝 Reviews'}
              {tab === 'users' && '👥 Users'}
              {tab === 'analytics' && '📊 Analytics'}
              {tab === 'content' && '📁 Content'}
            </Button>
          ))}
        </div>

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Filter Controls */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-indigo-500/50 p-6">
              <h2 className="text-xl font-bold text-indigo-300 mb-4">Filter Reviews</h2>
              <div className="flex gap-4 flex-wrap">
                {(['all', 'pending', 'approved', 'flagged'] as const).map((status) => (
                  <Button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      filterStatus === status
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Reviews List */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white mb-4">Recent Reviews</h3>
              {reviewsQuery.data && reviewsQuery.data.length > 0 ? (
                reviewsQuery.data.map((review) => (
                  <Card key={review.id} className="bg-gradient-to-br from-slate-800 to-slate-900 border-indigo-500/50 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-yellow-400">
                            {'⭐'.repeat(review.rating)}
                          </div>
                          <span className="text-cyan-300 text-sm">
                            {review.isVerified ? '✓ Verified' : 'Unverified'}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white">{review.title}</h3>
                        <p className="text-gray-400 text-sm mt-1">
                          User #{review.userId} • {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold capitalize">
                        {review.category.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-gray-300 mb-4">{review.content}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      <div className="flex space-x-4">
                        <span className="text-gray-400 text-sm">👍 {review.helpfulCount}</span>
                        <span className="text-gray-400 text-sm">👎 {review.notHelpfulCount}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm">
                          Approve
                        </Button>
                        <Button className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm">
                          Flag
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-indigo-500/50 p-8 text-center">
                  <p className="text-gray-400">No reviews to moderate</p>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Key Metrics */}
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-indigo-500/50 p-6">
                <div className="text-gray-400 text-sm mb-2">Total Reviews</div>
                <div className="text-3xl font-bold text-indigo-400">{statsQuery.data?.count || 0}</div>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-indigo-500/50 p-6">
                <div className="text-gray-400 text-sm mb-2">Average Rating</div>
                <div className="text-3xl font-bold text-indigo-400">
                  {statsQuery.data?.average ? parseFloat(statsQuery.data.average.toString()).toFixed(1) : '0'}
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-indigo-500/50 p-6">
                <div className="text-gray-400 text-sm mb-2">Active Users</div>
                <div className="text-3xl font-bold text-indigo-400">0</div>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-indigo-500/50 p-6">
                <div className="text-gray-400 text-sm mb-2">Total Donations</div>
                <div className="text-3xl font-bold text-indigo-400">$0</div>
              </Card>
            </div>

            {/* Analytics Charts */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-indigo-500/50 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Platform Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Reviews Submitted</span>
                    <span className="text-indigo-400 font-semibold">85%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">User Engagement</span>
                    <span className="text-indigo-400 font-semibold">72%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Content Quality</span>
                    <span className="text-indigo-400 font-semibold">91%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{ width: '91%' }}></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-indigo-500/50 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">User Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-300">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="pb-3 text-indigo-400">Email</th>
                    <th className="pb-3 text-indigo-400">Subscription</th>
                    <th className="pb-3 text-indigo-400">Total Donations</th>
                    <th className="pb-3 text-indigo-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700 hover:bg-gray-800/50">
                    <td className="py-3">user@example.com</td>
                    <td className="py-3"><span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-sm">Gold</span></td>
                    <td className="py-3">$250</td>
                    <td className="py-3">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                        View
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-indigo-500/50 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Content Management</h2>
            <p className="text-gray-400">Manage user-uploaded content and media files</p>
          </Card>
        )}
      </div>
    </div>
  );
}
