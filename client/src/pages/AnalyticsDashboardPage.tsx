import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Heart, Share2, Download, SkipForward } from 'lucide-react';

export default function AnalyticsDashboardPage() {
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const { data: contentStats } = trpc.analytics.getContentStats.useQuery(
    { contentId: selectedContentId || '' },
    { enabled: !!selectedContentId }
  );

  const { data: trendingContent } = trpc.analytics.getTrendingContent.useQuery({
    contentType: 'song',
    days: timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90,
  });

  const { data: dailyStats } = trpc.analytics.getDailyStats.useQuery(
    { contentId: selectedContentId || '', days: timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90 },
    { enabled: !!selectedContentId }
  );

  const { data: engagementMetrics } = trpc.analytics.getEngagementMetrics.useQuery(
    { contentId: selectedContentId || '' },
    { enabled: !!selectedContentId }
  );

  const COLORS = ['#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-slate-300">Track listener statistics and engagement metrics</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              className={
                timeRange === range
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </Button>
          ))}
        </div>

        {/* Key Metrics */}
        {contentStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card className="bg-slate-800 border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Plays</p>
                  <p className="text-2xl font-bold text-white">
                    {contentStats.plays?.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-amber-500" />
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Likes</p>
                  <p className="text-2xl font-bold text-white">
                    {contentStats.likes?.toLocaleString()}
                  </p>
                </div>
                <Heart className="w-8 h-8 text-red-500" />
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Shares</p>
                  <p className="text-2xl font-bold text-white">
                    {contentStats.shares?.toLocaleString()}
                  </p>
                </div>
                <Share2 className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Downloads</p>
                  <p className="text-2xl font-bold text-white">
                    {contentStats.downloads?.toLocaleString()}
                  </p>
                </div>
                <Download className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Skips</p>
                  <p className="text-2xl font-bold text-white">
                    {contentStats.skips?.toLocaleString()}
                  </p>
                </div>
                <SkipForward className="w-8 h-8 text-purple-500" />
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Listeners</p>
                  <p className="text-2xl font-bold text-white">
                    {contentStats.uniqueListeners?.toLocaleString()}
                  </p>
                </div>
                <Users className="w-8 h-8 text-cyan-500" />
              </div>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Plays Chart */}
          {dailyStats && dailyStats.length > 0 && (
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Daily Plays</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="plays"
                    stroke="#f59e0b"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Engagement Breakdown */}
          {engagementMetrics && (
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Engagement Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Likes', value: engagementMetrics.likes },
                      { name: 'Comments', value: engagementMetrics.comments },
                      { name: 'Shares', value: engagementMetrics.shares },
                      { name: 'Downloads', value: engagementMetrics.downloads },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>

        {/* Trending Content */}
        {trendingContent && trendingContent.length > 0 && (
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Trending Content</h3>
            <div className="space-y-3">
              {trendingContent.slice(0, 10).map((item, index) => (
                <div
                  key={item.contentId}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded hover:bg-slate-700 transition-colors cursor-pointer"
                  onClick={() => setSelectedContentId(item.contentId)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-amber-500 font-bold w-6">#{index + 1}</span>
                    <span className="text-white">{item.contentId}</span>
                  </div>
                  <span className="text-slate-400">{item.score} plays</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
