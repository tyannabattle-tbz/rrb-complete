import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  DollarSign,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Zap,
  RefreshCw,
  Download,
  Filter,
} from 'lucide-react';

interface RealtimeMetric {
  label: string;
  value: number | string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface StreamMetric {
  timestamp: string;
  viewers: number;
  engagement: number;
  revenue: number;
  bitrate: number;
}

const REALTIME_METRICS: RealtimeMetric[] = [
  { label: 'Live Viewers', value: '12,450', change: 8.2, icon: <Eye className="w-6 h-6" />, color: 'text-blue-500' },
  { label: 'Active Streams', value: '324', change: 12.5, icon: <Activity className="w-6 h-6" />, color: 'text-green-500' },
  { label: 'Revenue/Hour', value: '$2,450', change: 23.1, icon: <DollarSign className="w-6 h-6" />, color: 'text-yellow-500' },
  { label: 'Engagement Rate', value: '8.2%', change: 15.3, icon: <Heart className="w-6 h-6" />, color: 'text-red-500' },
];

const STREAM_DATA: StreamMetric[] = [
  { timestamp: '00:00', viewers: 5200, engagement: 6.2, revenue: 450, bitrate: 2500 },
  { timestamp: '01:00', viewers: 7850, engagement: 7.1, revenue: 620, bitrate: 3200 },
  { timestamp: '02:00', viewers: 9200, engagement: 7.8, revenue: 780, bitrate: 3800 },
  { timestamp: '03:00', viewers: 12450, engagement: 8.2, revenue: 1050, bitrate: 4200 },
  { timestamp: '04:00', viewers: 10800, engagement: 7.9, revenue: 920, bitrate: 3900 },
];

export function RealtimeAnalyticsDashboard() {
  const [metrics, setMetrics] = useState(REALTIME_METRICS);
  const [streamData, setStreamData] = useState(STREAM_DATA);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Simulate WebSocket updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Update metrics with random variations
      setMetrics((prev) =>
        prev.map((m, idx) => ({
          ...m,
          value:
            typeof m.value === 'number'
              ? m.value + Math.floor(Math.random() * 100 - 50)
              : m.value,
          change: Math.random() * 30 - 10,
        }))
      );

      // Update stream data
      setStreamData((prev) => [
        ...prev.slice(1),
        {
          timestamp: new Date().toLocaleTimeString(),
          viewers: Math.floor(Math.random() * 15000 + 5000),
          engagement: Math.random() * 10,
          revenue: Math.floor(Math.random() * 1500 + 500),
          bitrate: Math.floor(Math.random() * 5000 + 2000),
        },
      ]);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black bg-opacity-50 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Zap className="w-8 h-8 text-yellow-500" /> Real-time Analytics Dashboard
            </h1>
            <div className="flex gap-2">
              <Button
                variant={autoRefresh ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" /> {autoRefresh ? 'Live' : 'Paused'}
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" /> Export
              </Button>
            </div>
          </div>

          {/* Refresh Interval Control */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Update Interval:</span>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="bg-gray-700 border border-gray-600 text-white rounded px-3 py-1 text-sm"
            >
              <option value={1000}>1 second</option>
              <option value={5000}>5 seconds</option>
              <option value={10000}>10 seconds</option>
              <option value={30000}>30 seconds</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, idx) => (
            <Card
              key={`item-${idx}`}
              className="bg-gray-800 border-gray-700 p-6 hover:bg-gray-750 transition cursor-pointer"
              onClick={() => setSelectedMetric(metric.label)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{metric.label}</p>
                  <p className="text-3xl font-bold text-white mt-2">{metric.value}</p>
                  <p
                    className={`text-sm mt-2 ${
                      metric.change > 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}% this hour
                  </p>
                </div>
                <div className={metric.color}>{metric.icon}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Live Stream Chart */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-500" /> Live Stream Performance
            </h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" /> Filter
            </Button>
          </div>

          {/* Mini Chart */}
          <div className="h-64 bg-gray-700 rounded border border-gray-600 p-4 flex items-end justify-between gap-2">
            {streamData.map((data, idx) => (
              <div key={`item-${idx}`} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded"
                  style={{
                    height: `${(data.viewers / 15000) * 200}px`,
                  }}
                />
                <span className="text-xs text-gray-400">{data.timestamp}</span>
              </div>
            ))}
          </div>

          {/* Data Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-2 px-3 text-gray-400">Time</th>
                  <th className="text-left py-2 px-3 text-gray-400">Viewers</th>
                  <th className="text-left py-2 px-3 text-gray-400">Engagement</th>
                  <th className="text-left py-2 px-3 text-gray-400">Revenue</th>
                  <th className="text-left py-2 px-3 text-gray-400">Bitrate</th>
                </tr>
              </thead>
              <tbody>
                {streamData.map((data, idx) => (
                  <tr key={`item-${idx}`} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-2 px-3 text-white">{data.timestamp}</td>
                    <td className="py-2 px-3 text-blue-400">{data.viewers.toLocaleString()}</td>
                    <td className="py-2 px-3 text-green-400">{data.engagement.toFixed(1)}%</td>
                    <td className="py-2 px-3 text-yellow-400">${data.revenue}</td>
                    <td className="py-2 px-3 text-purple-400">{data.bitrate} kbps</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Engagement Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Comments', value: 2450, icon: MessageSquare, color: 'text-blue-500' },
            { label: 'Likes', value: 8920, icon: Heart, color: 'text-red-500' },
            { label: 'Shares', value: 1240, icon: Share2, color: 'text-green-500' },
          ].map((item, idx) => (
            <Card key={`item-${idx}`} className="bg-gray-800 border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{item.label}</p>
                  <p className="text-3xl font-bold text-white mt-2">{item.value.toLocaleString()}</p>
                </div>
                <div className={`${item.color} text-4xl opacity-20`}>
                  <item.icon className="w-12 h-12" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Active Streams */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Active Streams</h2>
          <div className="space-y-3">
            {[
              { title: 'Live Broadcast #1', viewers: 2450, duration: '2h 15m', quality: '1080p' },
              { title: 'Podcast Recording', viewers: 1850, duration: '1h 30m', quality: '720p' },
              { title: 'Gaming Stream', viewers: 3200, duration: '45m', quality: '1080p' },
              { title: 'Music Session', viewers: 4950, duration: '1h 20m', quality: '4K' },
            ].map((stream, idx) => (
              <div key={`item-${idx}`} className="p-4 bg-gray-700 rounded border border-gray-600 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{stream.title}</p>
                  <p className="text-gray-400 text-sm">{stream.viewers.toLocaleString()} viewers • {stream.duration}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-1 bg-blue-900 text-blue-200 rounded">{stream.quality}</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
