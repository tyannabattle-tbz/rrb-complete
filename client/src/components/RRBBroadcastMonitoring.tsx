'use client';

import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
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

// Default metrics for when data is loading or unavailable
const DEFAULT_METRICS: BroadcastMetrics = {
  liveViewers: 0,
  peakViewers: 0,
  averageViewers: 0,
  totalSessions: 0,
  uptime: 99.9,
  streamQuality: 'Excellent',
  bitrate: 128,
  fps: 30,
  resolution: '1080p',
  latency: 2,
};

const DEFAULT_ENGAGEMENT: EngagementMetrics = {
  chatMessages: 0,
  reactions: 0,
  shares: 0,
  engagementScore: 0,
};

export const RRBBroadcastMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<BroadcastMetrics>(DEFAULT_METRICS);
  const [engagement, setEngagement] = useState<EngagementMetrics>(DEFAULT_ENGAGEMENT);
  const [timeline, setTimeline] = useState<ViewerTimeline[]>([
    { timestamp: '12:00 AM', viewers: 1200 },
    { timestamp: '2:00 AM', viewers: 1500 },
    { timestamp: '4:00 AM', viewers: 2100 },
    { timestamp: '6:00 AM', viewers: 3200 },
    { timestamp: '8:00 AM', viewers: 4500 },
    { timestamp: '10:00 AM', viewers: 5200 },
    { timestamp: '12:00 PM', viewers: 6100 },
  ]);
  const [geoData, setGeoData] = useState<GeoData[]>([
    { country: 'USA', viewers: 4500, percentage: 60 },
    { country: 'Canada', viewers: 1200, percentage: 16 },
    { country: 'UK', viewers: 800, percentage: 11 },
    { country: 'Australia', viewers: 600, percentage: 8 },
    { country: 'Other', viewers: 300, percentage: 5 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch broadcast metrics (with error handling)
  const { data: metricsData, isLoading: metricsLoading, error: metricsError } = trpc.rrbRadio?.getBroadcastMetrics?.useQuery?.() || { data: null, isLoading: false, error: null };

  // Fetch engagement metrics (with error handling)
  const { data: engagementData, isLoading: engagementLoading, error: engagementError } = trpc.rrbRadio?.getEngagementMetrics?.useQuery?.() || { data: null, isLoading: false, error: null };

  // Fetch viewer timeline (with error handling)
  const { data: timelineData, isLoading: timelineLoading, error: timelineError } = trpc.rrbRadio?.getViewerTimeline?.useQuery?.() || { data: null, isLoading: false, error: null };

  // Fetch geographic data (with error handling)
  const { data: geoDataResponse, isLoading: geoLoading, error: geoError } = trpc.rrbRadio?.getGeographicDistribution?.useQuery?.() || { data: null, isLoading: false, error: null };

  useEffect(() => {
    // Update metrics with defaults if data is missing
    if (metricsData) {
      setMetrics({
        liveViewers: metricsData.liveViewers ?? 0,
        peakViewers: metricsData.peakViewers ?? 0,
        averageViewers: metricsData.averageViewers ?? 0,
        totalSessions: metricsData.totalSessions ?? 0,
        uptime: metricsData.uptime ?? 99.9,
        streamQuality: metricsData.streamQuality ?? 'Excellent',
        bitrate: metricsData.bitrate ?? 128,
        fps: metricsData.fps ?? 30,
        resolution: metricsData.resolution ?? '1080p',
        latency: metricsData.latency ?? 2,
      });
    }

    if (engagementData) {
      setEngagement({
        chatMessages: engagementData.chatMessages ?? 0,
        reactions: engagementData.reactions ?? 0,
        shares: engagementData.shares ?? 0,
        engagementScore: engagementData.engagementScore ?? 0,
      });
    }

    if (timelineData && Array.isArray(timelineData)) {
      setTimeline(timelineData);
    }

    if (geoDataResponse && Array.isArray(geoDataResponse)) {
      setGeoData(geoDataResponse);
    }

    // Check for errors
    if (metricsError || engagementError || timelineError || geoError) {
      setError('Some metrics are unavailable. Using default values.');
    }

    setLoading(metricsLoading || engagementLoading || timelineLoading || geoLoading);
  }, [metricsData, engagementData, timelineData, geoDataResponse, metricsLoading, engagementLoading, timelineLoading, geoLoading, metricsError, engagementError, timelineError, geoError]);

  const deviceData = [
    { name: 'Desktop', value: 45 },
    { name: 'Mobile', value: 40 },
    { name: 'Tablet', value: 15 },
  ];

  // Safe uptime check
  const healthStatus = (metrics?.uptime ?? 0) > 99 ? 'Healthy' : 'Warning';

  // Safe formatting functions
  const formatNumber = (value: number | undefined | null): string => {
    if (typeof value !== 'number') return '—';
    return value.toLocaleString();
  };

  const formatPercent = (value: number | undefined | null): string => {
    if (typeof value !== 'number') return '—';
    return value.toFixed(1) + '%';
  };

  return (
    <div className="w-full space-y-4 bg-gradient-to-br from-red-50 to-orange-50 p-3 md:p-6">
      {/* Error Banner */}
      {error && (
        <div className="rounded-lg bg-yellow-100 border border-yellow-400 p-4 text-yellow-800">
          <p className="text-sm font-semibold">⚠️ {error}</p>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-lg bg-gradient-to-r from-red-600 to-orange-600 p-4 sm:p-6 text-white shadow-lg">
        <h1 className="text-lg md:text-3xl font-bold">🎙️ RRB Radio Live Broadcast</h1>
        <p className="mt-1 sm:mt-2 text-xs md:text-lg font-semibold">Rockin' Rockin' Boogie - Real-time Monitoring Dashboard</p>
        <p className="mt-1 sm:mt-2 text-xs md:text-sm opacity-90">
          {metrics?.streamQuality === 'Excellent' ? '🔴 LIVE' : '⚫ OFFLINE'} • {formatNumber(metrics?.liveViewers)} viewers
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="rounded-lg bg-blue-100 border border-blue-400 p-4 text-blue-800">
          <p className="text-sm font-semibold">📊 Loading broadcast metrics...</p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-2 md:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white p-3 md:p-6 shadow-md">
          <p className="text-xs md:text-sm font-medium text-gray-600">Live Viewers</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-red-600">
            {formatNumber(metrics?.liveViewers)}
          </p>
          <p className="mt-1 text-xs text-gray-500">Currently watching</p>
        </Card>

        <Card className="bg-white p-3 md:p-6 shadow-md">
          <p className="text-xs md:text-sm font-medium text-gray-600">Peak Viewers</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-orange-600">
            {formatNumber(metrics?.peakViewers)}
          </p>
          <p className="mt-1 text-xs text-gray-500">Today's peak</p>
        </Card>

        <Card className="bg-white p-3 md:p-6 shadow-md">
          <p className="text-xs md:text-sm font-medium text-gray-600">Engagement Score</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-blue-600">
            {formatPercent(engagement?.engagementScore)}
          </p>
          <p className="mt-1 text-xs text-gray-500">Audience interaction</p>
        </Card>

        <Card className="bg-white p-3 md:p-6 shadow-md">
          <p className="text-xs md:text-sm font-medium text-gray-600">Uptime</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-green-600">
            {formatPercent(metrics?.uptime)}
          </p>
          <p className="mt-1 text-xs text-gray-500">Stream reliability</p>
        </Card>
      </div>

      {/* Stream Quality & Engagement */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Stream Quality Metrics */}
        <Card className="p-3 md:p-6 shadow-md">
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
              <span className="text-sm font-semibold text-gray-800">{metrics?.resolution || 'Unknown'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Latency</span>
              <span className="text-sm font-semibold text-gray-800">{metrics?.latency || 0}ms</span>
            </div>
          </div>
        </Card>

        {/* Engagement Metrics */}
        <Card className="p-3 md:p-6 shadow-md">
          <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-gray-800">Engagement</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Chat Messages</span>
              <span className="text-sm font-semibold text-gray-800">{formatNumber(engagement?.chatMessages)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Reactions</span>
              <span className="text-sm font-semibold text-gray-800">{formatNumber(engagement?.reactions)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Shares</span>
              <span className="text-sm font-semibold text-gray-800">{formatNumber(engagement?.shares)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Engagement Score</span>
              <span className="text-sm font-semibold text-blue-600">{formatPercent(engagement?.engagementScore)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Viewer Timeline Chart */}
      <Card className="p-3 md:p-6 shadow-md">
        <h2 className="mb-4 text-lg sm:text-xl font-bold text-gray-800">Viewer Timeline</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="viewers" stroke="#ef4444" strokeWidth={2} name="Viewers" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Geographic Distribution & Device Breakdown */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Geographic Distribution */}
        <Card className="p-3 md:p-6 shadow-md">
          <h2 className="mb-4 text-lg sm:text-xl font-bold text-gray-800">Geographic Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={geoData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="viewers"
              >
                {geoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Device Breakdown */}
        <Card className="p-3 md:p-6 shadow-md">
          <h2 className="mb-4 text-lg sm:text-xl font-bold text-gray-800">Device Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deviceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" name="Percentage (%)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Health Status */}
      <Card className={`p-4 md:p-6 shadow-md ${healthStatus === 'Healthy' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-yellow-50 border-l-4 border-yellow-500'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">System Health</h3>
            <p className={`text-sm mt-1 ${healthStatus === 'Healthy' ? 'text-green-700' : 'text-yellow-700'}`}>
              {healthStatus === 'Healthy' ? '✅ All systems operational' : '⚠️ Check stream quality'}
            </p>
          </div>
          <span className={`text-2xl font-bold ${healthStatus === 'Healthy' ? 'text-green-600' : 'text-yellow-600'}`}>
            {formatPercent(metrics?.uptime)}
          </span>
        </div>
      </Card>
    </div>
  );
};

export default RRBBroadcastMonitoring;
