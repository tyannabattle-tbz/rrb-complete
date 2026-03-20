import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Heart, Share2, MessageCircle, TrendingUp, Trophy, Twitter } from 'lucide-react';

export default function SocialEngagementDashboard() {
  const [socialMetrics] = useState({
    totalPosts: 124,
    postedPosts: 98,
    totalEngagement: 12847,
    averageLikes: 131,
    leaderboardEntries: 156,
  });

  const [engagementTimeline] = useState([
    { date: 'Mon', posts: 8, likes: 245, shares: 34, comments: 56 },
    { date: 'Tue', posts: 12, likes: 389, shares: 52, comments: 78 },
    { date: 'Wed', posts: 10, likes: 312, shares: 41, comments: 63 },
    { date: 'Thu', posts: 15, likes: 467, shares: 68, comments: 92 },
    { date: 'Fri', posts: 18, likes: 534, shares: 79, comments: 108 },
    { date: 'Sat', posts: 14, likes: 421, shares: 58, comments: 81 },
    { date: 'Sun', posts: 11, likes: 298, shares: 39, comments: 67 },
  ]);

  const [recentPosts] = useState([
    {
      id: 'post_001',
      platform: 'twitter',
      content: '🎯 NEW GRANT OPPORTUNITY: $50K NIH Grant available! Match Score: 92%. Auto-applying now with FlowPay. #GrantFunding',
      timestamp: new Date(Date.now() - 30 * 60000),
      status: 'posted',
      engagement: { likes: 234, shares: 45, comments: 28 },
    },
    {
      id: 'post_002',
      platform: 'twitter',
      content: '🚀 FUNDING CAMPAIGN LIVE: Community Emergency Fund. Goal: $50K. Progress: 97%! Help us reach the finish line. Donate now! #CommunityFunding',
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      status: 'posted',
      engagement: { likes: 189, shares: 32, comments: 19 },
    },
    {
      id: 'post_003',
      platform: 'twitter',
      content: '🏆 TOP DONORS LEADERBOARD: Congratulations to our community heroes! Thank you for supporting our mission. #CommunityHeroes #FlowPay',
      timestamp: new Date(Date.now() - 4 * 60 * 60000),
      status: 'posted',
      engagement: { likes: 156, shares: 28, comments: 15 },
    },
  ]);

  const [leaderboard] = useState([
    {
      rank: 1,
      userName: 'Alice Chen',
      totalContributed: 15000,
      badge: 'platinum',
      socialShares: 234,
    },
    {
      rank: 2,
      userName: 'Bob Martinez',
      totalContributed: 12500,
      badge: 'gold',
      socialShares: 189,
    },
    {
      rank: 3,
      userName: 'Carol Singh',
      totalContributed: 9800,
      badge: 'gold',
      socialShares: 156,
    },
    {
      rank: 4,
      userName: 'David Kim',
      totalContributed: 7200,
      badge: 'silver',
      socialShares: 98,
    },
    {
      rank: 5,
      userName: 'Emma Johnson',
      totalContributed: 5600,
      badge: 'silver',
      socialShares: 67,
    },
  ]);

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'platinum':
        return 'bg-purple-500/20 text-purple-300';
      case 'gold':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'silver':
        return 'bg-gray-500/20 text-gray-300';
      case 'bronze':
        return 'bg-orange-500/20 text-orange-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Social Engagement Dashboard</h1>
        <p className="text-gray-400 mt-1">Twitter/X posts, leaderboards, and community engagement</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Posts</p>
                <p className="text-2xl font-bold text-blue-400">{socialMetrics.totalPosts}</p>
              </div>
              <Twitter className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Posted</p>
                <p className="text-2xl font-bold text-purple-400">{socialMetrics.postedPosts}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Engagement</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {(socialMetrics.totalEngagement / 1000).toFixed(1)}K
                </p>
              </div>
              <Heart className="w-8 h-8 text-cyan-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Likes/Post</p>
                <p className="text-2xl font-bold text-green-400">{socialMetrics.averageLikes}</p>
              </div>
              <Heart className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Leaderboard</p>
                <p className="text-2xl font-bold text-emerald-400">{socialMetrics.leaderboardEntries}</p>
              </div>
              <Trophy className="w-8 h-8 text-emerald-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Timeline */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Engagement Timeline (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Legend />
              <Bar dataKey="likes" fill="#ec4899" name="Likes" />
              <Bar dataKey="shares" fill="#3b82f6" name="Shares" />
              <Bar dataKey="comments" fill="#8b5cf6" name="Comments" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Posts */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Social Posts</CardTitle>
          <CardDescription>Autonomous social engagement (LLM-powered)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-400">{post.platform.toUpperCase()}</span>
                    <Badge className="bg-green-500/20 text-green-300">{post.status}</Badge>
                  </div>
                  <span className="text-xs text-gray-400">
                    {post.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-white mb-3">{post.content}</p>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1 text-pink-400">
                    <Heart className="w-4 h-4" />
                    <span>{post.engagement.likes}</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-400">
                    <Share2 className="w-4 h-4" />
                    <span>{post.engagement.shares}</span>
                  </div>
                  <div className="flex items-center gap-1 text-purple-400">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.engagement.comments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Community Leaderboard</CardTitle>
          <CardDescription>Top supporters with social sharing enabled</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className="flex items-center justify-between bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-purple-400">#{entry.rank}</div>
                  <div>
                    <p className="font-bold text-white">{entry.userName}</p>
                    <p className="text-xs text-gray-400">
                      {entry.socialShares} social shares
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-white">
                      ${entry.totalContributed.toLocaleString()}
                    </p>
                    <Badge className={getBadgeColor(entry.badge)}>
                      {entry.badge.toUpperCase()}
                    </Badge>
                  </div>
                  <Button variant="outline" className="text-white border-slate-600">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Social Integration Info */}
      <Card className="bg-gradient-to-r from-blue-900 to-purple-900 border-blue-700">
        <CardHeader>
          <CardTitle className="text-white">Social Integration Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-300 text-sm font-bold mb-2">📱 Autonomous Posting</p>
              <p className="text-gray-400 text-sm">
                LLM-powered social posts about grants, campaigns, and leaderboards. Every 2 hours.
              </p>
            </div>
            <div>
              <p className="text-gray-300 text-sm font-bold mb-2">🏆 Leaderboard Sharing</p>
              <p className="text-gray-400 text-sm">
                Donors can share their leaderboard position on social media. Shareable links with unique tracking.
              </p>
            </div>
            <div>
              <p className="text-gray-300 text-sm font-bold mb-2">📊 Engagement Tracking</p>
              <p className="text-gray-400 text-sm">
                Real-time metrics for likes, shares, comments. Analytics dashboard for campaign performance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
