import React, { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Recommendation {
  videoId: string;
  title: string;
  category: string;
  score: number;
  estimatedEngagement: number;
  thumbnail?: string;
}

interface Playlist {
  id: string;
  name: string;
  videos: Recommendation[];
  totalDuration: number;
}

interface TrendingVideo {
  videoId: string;
  title: string;
  views: number;
  trend: string;
  trendScore: number;
}

interface RecommendationMetrics {
  totalRecommendations: number;
  avgRelevanceScore: number;
  clickThroughRate: number;
  conversionRate: number;
  userSatisfaction: number;
}

export const ContentRecommendationEngine: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [trending, setTrending] = useState<TrendingVideo[]>([]);
  const [metrics, setMetrics] = useState<RecommendationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch personalized recommendations
  const { data: recommendationsData } = trpc.contentRecommendation.getPersonalizedRecommendations.useQuery();

  // Fetch playlist recommendations
  const { data: playlistsData } = trpc.contentRecommendation.getPlaylistRecommendations.useQuery();

  // Fetch trending content
  const { data: trendingData } = trpc.contentRecommendation.getTrendingContent.useQuery();

  // Fetch recommendation metrics
  const { data: metricsData } = trpc.contentRecommendation.getRecommendationMetrics.useQuery();

  useEffect(() => {
    if (recommendationsData) setRecommendations(recommendationsData);
    if (playlistsData) setPlaylists(playlistsData);
    if (trendingData) setTrending(trendingData);
    if (metricsData) setMetrics(metricsData);
    setLoading(false);
  }, [recommendationsData, playlistsData, trendingData, metricsData]);

  if (loading) {
    return <div className="p-4">Loading recommendations...</div>;
  }

  const filteredRecommendations = selectedCategory === 'all'
    ? recommendations
    : recommendations.filter(r => r.category === selectedCategory);

  const categories = ['all', ...new Set(recommendations.map(r => r.category))];

  // Prepare trending trend data for chart
  const trendingChartData = trending.map(t => ({
    title: t.title.substring(0, 15),
    views: t.views,
    score: Math.round(t.trendScore * 100),
  }));

  return (
    <div className="w-full space-y-4 bg-gradient-to-br from-purple-50 to-blue-50 p-3 sm:p-6">
      {/* Header Banner */}
      <div className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 text-white shadow-lg">
        <h1 className="text-xl sm:text-3xl font-bold">Content Recommendation Engine</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-lg font-semibold">Powered by Qumus AI</p>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm opacity-90">Personalized video suggestions based on your viewing history and preferences</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white p-3 sm:p-6 shadow-md">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Recommendations</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-purple-600">
            {metrics?.totalRecommendations || 0}
          </p>
          <p className="mt-1 text-xs text-gray-500">Generated for you</p>
        </Card>

        <Card className="bg-white p-3 sm:p-6 shadow-md">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Avg Relevance</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-blue-600">
            {(metrics?.avgRelevanceScore || 0).toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-gray-500">Out of 1.0</p>
        </Card>

        <Card className="bg-white p-3 sm:p-6 shadow-md">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Click-Through Rate</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-green-600">
            {(metrics?.clickThroughRate || 0).toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-gray-500">User engagement</p>
        </Card>

        <Card className="bg-white p-3 sm:p-6 shadow-md">
          <p className="text-xs sm:text-sm font-medium text-gray-600">User Satisfaction</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-orange-600">
            {(metrics?.userSatisfaction || 0).toFixed(1)}/5
          </p>
          <p className="mt-1 text-xs text-gray-500">Average rating</p>
        </Card>
      </div>

      {/* Personalized Recommendations */}
      <Card className="p-3 sm:p-6 shadow-md">
        <div className="mb-3 sm:mb-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Personalized for You</h2>
          <div className="flex gap-2">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="capitalize"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecommendations.slice(0, 6).map((rec) => (
            <div key={rec.videoId} className="rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {rec.thumbnail && (
                <img
                  src={rec.thumbnail}
                  alt={rec.title}
                  className="h-32 w-full object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 line-clamp-2">{rec.title}</h3>
                <p className="text-xs text-gray-500 mt-1 capitalize">{rec.category}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Relevance</p>
                    <p className="text-sm font-bold text-purple-600">{(rec.score * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Engagement</p>
                    <p className="text-sm font-bold text-blue-600">{(rec.estimatedEngagement * 100).toFixed(0)}%</p>
                  </div>
                </div>
                <Button className="mt-3 w-full" size="sm">
                  Watch Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Trending Content */}
      <Card className="p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Trending Now</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={trendingChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="title" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="views" fill="#3b82f6" name="Views" />
            <Bar yAxisId="right" dataKey="score" fill="#f59e0b" name="Trend Score" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Recommended Playlists */}
      <Card className="p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Recommended Playlists</h2>
        <div className="space-y-4">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{playlist.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {playlist.videos.length} videos • {playlist.totalDuration.toFixed(1)} hours
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {playlist.videos.slice(0, 3).map((video) => (
                      <span key={video.videoId} className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                        {video.title.substring(0, 20)}...
                      </span>
                    ))}
                    {playlist.videos.length > 3 && (
                      <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        +{playlist.videos.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <Button size="sm" className="ml-4">
                  Play
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommendation Quality Metrics */}
      <Card className="p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Recommendation Quality</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 p-4">
            <p className="text-sm font-medium text-gray-700">Conversion Rate</p>
            <p className="mt-2 text-2xl font-bold text-purple-600">
              {(metrics?.conversionRate || 0).toFixed(1)}%
            </p>
            <div className="mt-3 h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                style={{ width: `${metrics?.conversionRate || 0}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-600">Of recommendations watched</p>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-4">
            <p className="text-sm font-medium text-gray-700">Satisfaction Score</p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {((metrics?.userSatisfaction || 0) / 5 * 100).toFixed(0)}%
            </p>
            <div className="mt-3 h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                style={{ width: `${(metrics?.userSatisfaction || 0) / 5 * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-600">User satisfaction rating</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ContentRecommendationEngine;
