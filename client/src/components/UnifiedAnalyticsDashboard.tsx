import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { Heart, Share2, MessageCircle, Eye, TrendingUp } from 'lucide-react';

interface PlatformStats {
  platform: string;
  totalPosts: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  totalViews: number;
  totalImpressions: number;
  avgEngagementRate: string;
}

export const UnifiedAnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const { data: analyticsData } = trpc.analytics.getUnifiedMetrics.useQuery({
    dateRange,
    platform: selectedPlatform,
  });

  const { data: platformComparison } = trpc.analytics.comparePlatforms.useQuery({
    dateRange,
  });

  const { data: engagementTrend } = trpc.analytics.getEngagementTrend.useQuery({
    dateRange,
  });

  const platformColors: Record<string, string> = {
    twitter: '#1DA1F2',
    youtube: '#FF0000',
    facebook: '#1877F2',
    instagram: '#E4405F',
    all: '#8B5CF6',
  };

  const metrics = [
    {
      label: 'Total Likes',
      value: analyticsData?.totalLikes || 0,
      icon: Heart,
      color: 'text-red-500',
    },
    {
      label: 'Total Shares',
      value: analyticsData?.totalShares || 0,
      icon: Share2,
      color: 'text-blue-500',
    },
    {
      label: 'Total Comments',
      value: analyticsData?.totalComments || 0,
      icon: MessageCircle,
      color: 'text-green-500',
    },
    {
      label: 'Total Views',
      value: analyticsData?.totalViews || 0,
      icon: Eye,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-background">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-4">Analytics Dashboard</h1>

        {/* Controls */}
        <div className="flex gap-4 mb-6">
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange(range)}
                className="capitalize"
              >
                {range}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            {['all', 'twitter', 'youtube', 'facebook', 'instagram'].map((platform) => (
              <Button
                key={platform}
                variant={selectedPlatform === platform ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPlatform(platform)}
                className="capitalize"
              >
                {platform}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {metric.value.toLocaleString()}
                  </p>
                </div>
                <Icon className={`w-8 h-8 ${metric.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Engagement Rate */}
      {analyticsData && (
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Engagement Rate</p>
              <p className="text-3xl font-bold text-foreground">
                {analyticsData.averageEngagementRate}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-500" />
          </div>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Platform Comparison */}
        {platformComparison && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Platform Comparison</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalLikes" fill="#FF6B6B" />
                <Bar dataKey="totalShares" fill="#4ECDC4" />
                <Bar dataKey="totalComments" fill="#45B7D1" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Engagement Trend */}
        {engagementTrend && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Engagement Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="engagement" stroke="#8B5CF6" />
                <Line type="monotone" dataKey="impressions" stroke="#F59E0B" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Platform Distribution */}
      {platformComparison && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Platform Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={platformComparison}
                dataKey="totalPosts"
                nameKey="platform"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {platformComparison.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={platformColors[entry.platform] || '#8B5CF6'}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Detailed Metrics Table */}
      {platformComparison && (
        <Card className="p-6 mt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Detailed Metrics</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-2 px-4 font-semibold">Platform</th>
                  <th className="text-right py-2 px-4 font-semibold">Posts</th>
                  <th className="text-right py-2 px-4 font-semibold">Likes</th>
                  <th className="text-right py-2 px-4 font-semibold">Shares</th>
                  <th className="text-right py-2 px-4 font-semibold">Comments</th>
                  <th className="text-right py-2 px-4 font-semibold">Views</th>
                  <th className="text-right py-2 px-4 font-semibold">Engagement Rate</th>
                </tr>
              </thead>
              <tbody>
                {platformComparison.map((platform) => (
                  <tr key={platform.platform} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium capitalize">{platform.platform}</td>
                    <td className="text-right py-3 px-4">{platform.totalPosts}</td>
                    <td className="text-right py-3 px-4">{platform.totalLikes.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">{platform.totalShares.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">
                      {platform.totalComments.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4">{platform.totalViews.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">{platform.avgEngagementRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UnifiedAnalyticsDashboard;
