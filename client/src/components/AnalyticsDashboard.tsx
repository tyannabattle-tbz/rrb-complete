/**
 * Analytics Dashboard Component
 * User engagement metrics and platform statistics
 * A Canryn Production
 */
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EngagementStats {
  totalWatchTime: number;
  chatMessagesCount: number;
  playlistsCreated: number;
  totalLikes: number;
  engagementScore: number;
}

interface PlatformStats {
  totalUsers: number;
  totalVideos: number;
  totalWatchTime: number;
  avgEngagementScore: number;
}

export const AnalyticsDashboard: React.FC = () => {
  const [userStats, setUserStats] = useState<EngagementStats | null>(null);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setUserStats({
        totalWatchTime: 4320,
        chatMessagesCount: 156,
        playlistsCreated: 12,
        totalLikes: 89,
        engagementScore: 78,
      });
      setPlatformStats({
        totalUsers: 2450,
        totalVideos: 340,
        totalWatchTime: 125000,
        avgEngagementScore: 72,
      });
      setLoading(false);
    }, 500);
  }, []);

  const engagementData = [
    { name: 'Watch Time', value: userStats?.totalWatchTime || 0 },
    { name: 'Chat Messages', value: (userStats?.chatMessagesCount || 0) * 30 },
    { name: 'Playlists', value: (userStats?.playlistsCreated || 0) * 100 },
    { name: 'Likes', value: (userStats?.totalLikes || 0) * 50 },
  ];

  const platformData = [
    { name: 'Users', value: platformStats?.totalUsers || 0 },
    { name: 'Videos', value: platformStats?.totalVideos || 0 },
  ];

  if (loading) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Button>Export Report</Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((userStats?.totalWatchTime || 0) / 60)} hrs</div>
            <p className="text-xs text-gray-500">Total hours watched</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Chat Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.chatMessagesCount}</div>
            <p className="text-xs text-gray-500">Messages sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Playlists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.playlistsCreated}</div>
            <p className="text-xs text-gray-500">Created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.engagementScore}/100</div>
            <p className="text-xs text-gray-500">Your score</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Engagement Breakdown</CardTitle>
            <CardDescription>Activity distribution across platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
            <CardDescription>Total users and videos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Trend</CardTitle>
          <CardDescription>Last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { day: 'Mon', engagement: 65 },
              { day: 'Tue', engagement: 72 },
              { day: 'Wed', engagement: 68 },
              { day: 'Thu', engagement: 78 },
              { day: 'Fri', engagement: 85 },
              { day: 'Sat', engagement: 82 },
              { day: 'Sun', engagement: 78 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="engagement" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
