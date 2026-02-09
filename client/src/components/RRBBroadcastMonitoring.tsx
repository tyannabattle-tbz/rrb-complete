import React, { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { AudioPlayer } from '@/components/AudioPlayer';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BroadcastMetrics {
  liveViewers: number;
  peakViewers: number;
  averageViewers: number;
  totalSessions: number;
  uptime: number;
  streamQuality: string;
  bitrate: number;
  fps: number;
  resolution: string;
  latency: number;
}

interface EngagementMetrics {
  chatMessages: number;
  reactions: number;
  shares: number;
  engagementScore: number;
}

interface ViewerTimeline {
  timestamp: string;
  viewers: number;
}

interface GeoData {
  country: string;
  viewers: number;
  percentage: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const RRBBroadcastMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<BroadcastMetrics | null>(null);
  const [engagement, setEngagement] = useState<EngagementMetrics | null>(null);
  const [timeline, setTimeline] = useState<ViewerTimeline[]>([]);
  const [geoData, setGeoData] = useState<GeoData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch broadcast metrics
  const { data: metricsData } = trpc.rrbRadio.getBroadcastMetrics.useQuery();

  // Fetch engagement metrics
  const { data: engagementData } = trpc.rrbRadio.getEngagementMetrics.useQuery();

  // Fetch viewer timeline
  const { data: timelineData } = trpc.rrbRadio.getViewerTimeline.useQuery();

  // Fetch geographic data
  const { data: geoDataResponse } = trpc.rrbRadio.getGeographicDistribution.useQuery();

  useEffect(() => {
    if (metricsData) setMetrics(metricsData);
    if (engagementData) setEngagement(engagementData);
    if (timelineData) setTimeline(timelineData);
    if (geoDataResponse) setGeoData(geoDataResponse);
    setLoading(false);
  }, [metricsData, engagementData, timelineData, geoDataResponse]);

  if (loading) {
    return <div className="p-4">Loading broadcast metrics...</div>;
  }

  const deviceData = [
    { name: 'Desktop', value: 45 },
    { name: 'Mobile', value: 40 },
    { name: 'Tablet', value: 15 },
  ];

  const healthStatus = metrics?.uptime || 0 > 99 ? 'Healthy' : 'Warning';

  return (
    <div className="w-full space-y-4 bg-gradient-to-br from-red-50 to-orange-50 p-3 sm:p-6">
      {/* Header Banner */}
      <div className="rounded-lg bg-gradient-to-r from-red-600 to-orange-600 p-4 sm:p-6 text-white shadow-lg">
        <h1 className="text-xl sm:text-3xl font-bold">RRB Radio Live Broadcast</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-lg font-semibold">Rockin' Rockin' Boogie - Real-time Monitoring Dashboard</p>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm opacity-90">
          {metrics?.streamQuality === 'Excellent' ? '🔴 LIVE' : '⚫ OFFLINE'} • {metrics?.liveViewers.toLocaleString()} viewers
        </p>
      </div>

      {/* Audio Player */}
      <AudioPlayer
        streamUrl="https://stream.example.com/rrb-radio/live"
        title="RRB Radio - Rockin' Rockin' Boogie"
        isLive={true}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white p-3 sm:p-6 shadow-md">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Live Viewers</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-red-600">
            {(metrics?.liveViewers || 0).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-gray-500">Currently watching</p>
        </Card>

        <Card className="bg-white p-3 sm:p-6 shadow-md">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Peak Viewers</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-orange-600">
            {(metrics?.peakViewers || 0).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-gray-500">Today's peak</p>
        </Card>

        <Card className="bg-white p-3 sm:p-6 shadow-md">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Engagement Score</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-blue-600">
            {engagement?.engagementScore || 0}%
          </p>
          <p className="mt-1 text-xs text-gray-500">Audience interaction</p>
        </Card>

        <Card className="bg-white p-3 sm:p-6 shadow-md">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Uptime</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-green-600">
            {(metrics?.uptime || 0).toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-gray-500">Stream reliability</p>
        </Card>
      </div>

      {/* Stream Quality & Engagement */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Stream Quality Metrics */}
        <Card className="p-3 sm:p-6 shadow-md">
          <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-gray-800">Stream Quality</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Status</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                metrics?.streamQuality === 'Excellent'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {metrics?.streamQuality || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Bitrate</span>
              <span className="text-sm font-semibold text-gray-800">{metrics?.bitrate || 0} kbps</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">FPS</span>
              <span className="text-sm font-semibold text-gray-800">{metrics?.fps || 0} fps</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Resolution</span>
              <span className="text-sm font-semibold text-gray-800">{metrics?.resolution || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Latency</span>
              <span className={`text-sm font-semibold ${
                (metrics?.latency || 0) < 3 ? 'text-green-600' : 'text-orange-600'
              }`}>
                {(metrics?.latency || 0).toFixed(1)}s
              </span>
            </div>
          </div>
        </Card>

        {/* Engagement Metrics */}
        <Card className="p-3 sm:p-6 shadow-md">
          <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-gray-800">Audience Engagement</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Chat Messages</span>
              <span className="text-sm font-semibold text-gray-800">{(engagement?.chatMessages || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Reactions</span>
              <span className="text-sm font-semibold text-gray-800">{(engagement?.reactions || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Shares</span>
              <span className="text-sm font-semibold text-gray-800">{(engagement?.shares || 0).toLocaleString()}</span>
            </div>
            <div className="mt-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-3">
              <p className="text-xs font-medium text-gray-600">Engagement Score</p>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: `${engagement?.engagementScore || 0}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Viewer Timeline */}
      <Card className="p-3 sm:p-6 shadow-md">
        <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-gray-800">Viewer Timeline (Last 24 Hours)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip formatter={(value) => value.toLocaleString()} />
            <Legend />
            <Line
              type="monotone"
              dataKey="viewers"
              stroke="#dc2626"
              name="Concurrent Viewers"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Geographic & Device Distribution */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Geographic Distribution */}
        <Card className="p-3 sm:p-6 shadow-md">
          <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-gray-800">Geographic Distribution</h2>
          <div className="space-y-3">
            {geoData.map((geo) => (
              <div key={geo.country} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{geo.country}</p>
                  <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500"
                      style={{ width: `${geo.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-semibold text-gray-800">{geo.viewers}</p>
                  <p className="text-xs text-gray-500">{geo.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Device Distribution */}
        <Card className="p-3 sm:p-6 shadow-md">
          <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-gray-800">Device Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Health Status */}
      <Card className="p-3 sm:p-6 shadow-md">
        <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-gray-800">Broadcast Health Status</h2>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
          <div className={`rounded-lg p-4 ${
            healthStatus === 'Healthy'
              ? 'bg-green-50'
              : 'bg-yellow-50'
          }`}>
            <p className={`text-sm font-medium ${
              healthStatus === 'Healthy'
                ? 'text-green-700'
                : 'text-yellow-700'
            }`}>
              Overall Status
            </p>
            <p className={`mt-2 text-2xl font-bold ${
              healthStatus === 'Healthy'
                ? 'text-green-600'
                : 'text-yellow-600'
            }`}>
              {healthStatus}
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-700">Total Sessions</p>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {(metrics?.totalSessions || 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-purple-50 p-4">
            <p className="text-sm font-medium text-purple-700">Avg Viewers</p>
            <p className="mt-2 text-2xl font-bold text-purple-600">
              {(metrics?.averageViewers || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RRBBroadcastMonitoring;
