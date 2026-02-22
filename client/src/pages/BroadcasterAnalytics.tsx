import React, { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, MessageSquare, DollarSign, Video, TrendingUp, Eye, Clock, Radio } from 'lucide-react';

interface AnalyticsData {
  liveViewers: number;
  totalViewers: number;
  chatMessages: number;
  donations: number;
  recordingStatus: 'recording' | 'paused' | 'stopped';
  recordingDuration: number;
  streamHealth: number;
  bitrate: number;
  fps: number;
  resolution: string;
}

interface ViewerTrend {
  time: string;
  viewers: number;
}

interface EngagementMetric {
  name: string;
  value: number;
  color: string;
}

export default function BroadcasterAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    liveViewers: 342,
    totalViewers: 1250,
    chatMessages: 487,
    donations: 2150,
    recordingStatus: 'recording',
    recordingDuration: 1847, // seconds
    streamHealth: 98,
    bitrate: 5000, // kbps
    fps: 60,
    resolution: '1080p',
  });

  const [viewerTrends, setViewerTrends] = useState<ViewerTrend[]>([
    { time: '00:00', viewers: 50 },
    { time: '05:00', viewers: 120 },
    { time: '10:00', viewers: 280 },
    { time: '15:00', viewers: 342 },
    { time: '20:00', viewers: 310 },
    { time: '25:00', viewers: 290 },
  ]);

  const [engagementData, setEngagementData] = useState<EngagementMetric[]>([
    { name: 'Chat', value: 35, color: '#3B82F6' },
    { name: 'Reactions', value: 28, color: '#8B5CF6' },
    { name: 'Donations', value: 22, color: '#EC4899' },
    { name: 'Shares', value: 15, color: '#F59E0B' },
  ]);

  const [moderatorActivity, setModeratorActivity] = useState([
    { name: 'Karen Jones', actions: 12, status: 'active', lastAction: '2 min ago' },
    { name: 'Jessica Smith', actions: 8, status: 'active', lastAction: '5 min ago' },
    { name: 'Marcus Brown', actions: 5, status: 'idle', lastAction: '15 min ago' },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalytics(prev => ({
        ...prev,
        liveViewers: Math.max(300, prev.liveViewers + Math.floor((Math.random() - 0.5) * 20)),
        chatMessages: prev.chatMessages + Math.floor(Math.random() * 5),
        recordingDuration: prev.recordingDuration + 1,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">📊 Broadcaster Analytics</h1>
          <p className="text-slate-600">Real-time broadcast performance and audience engagement metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Live Viewers */}
          <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Live Viewers</p>
                  <p className="text-2xl font-bold text-slate-900">{analytics.liveViewers}</p>
                </div>
              </div>
              <div className="text-green-600 text-sm font-semibold">↑ 12%</div>
            </div>
            <p className="text-xs text-slate-500">Total: {analytics.totalViewers}</p>
          </Card>

          {/* Chat Messages */}
          <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Chat Messages</p>
                  <p className="text-2xl font-bold text-slate-900">{analytics.chatMessages}</p>
                </div>
              </div>
              <div className="text-green-600 text-sm font-semibold">↑ 8%</div>
            </div>
            <p className="text-xs text-slate-500">Engagement rate: 38%</p>
          </Card>

          {/* Donations */}
          <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Donations</p>
                  <p className="text-2xl font-bold text-slate-900">${(analytics.donations / 100).toFixed(0)}</p>
                </div>
              </div>
              <div className="text-green-600 text-sm font-semibold">↑ 15%</div>
            </div>
            <p className="text-xs text-slate-500">Avg: $6.28 per donor</p>
          </Card>

          {/* Recording Status */}
          <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Video className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Recording</p>
                  <p className="text-2xl font-bold text-slate-900">{formatDuration(analytics.recordingDuration)}</p>
                </div>
              </div>
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            </div>
            <p className="text-xs text-slate-500">Status: {analytics.recordingStatus}</p>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Viewer Trends */}
          <Card className="p-6 bg-white shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Viewer Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={viewerTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="viewers" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Engagement Breakdown */}
          <Card className="p-6 bg-white shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Radio className="w-5 h-5 text-purple-600" />
              Engagement Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={engagementData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {engagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Stream Health & Moderators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stream Health */}
          <Card className="p-6 bg-white shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Stream Health</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">Overall Health</span>
                  <span className="text-sm font-bold text-green-600">{analytics.streamHealth}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div className="bg-green-600 h-3 rounded-full" style={{ width: `${analytics.streamHealth}%` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Bitrate</p>
                  <p className="text-lg font-bold text-slate-900">{analytics.bitrate} kbps</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">FPS</p>
                  <p className="text-lg font-bold text-slate-900">{analytics.fps}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Resolution</p>
                  <p className="text-lg font-bold text-slate-900">{analytics.resolution}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Latency</p>
                  <p className="text-lg font-bold text-slate-900">2.3s</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Moderator Activity */}
          <Card className="p-6 bg-white shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Moderator Activity</h3>
            <div className="space-y-3">
              {moderatorActivity.map((mod, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${mod.status === 'active' ? 'bg-green-600' : 'bg-slate-400'}`}></div>
                    <div>
                      <p className="font-medium text-slate-900">{mod.name}</p>
                      <p className="text-xs text-slate-500">{mod.lastAction}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{mod.actions} actions</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
