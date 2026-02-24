import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Users, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StreamMetric {
  channelId: string;
  channelName: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: number; // percentage
  bitrate: number;
  listeners: number;
  latency: number; // ms
  lastChecked: Date;
  trend: 'up' | 'down' | 'stable';
}

export const StreamHealthStatus: React.FC = () => {
  const [metrics, setMetrics] = useState<StreamMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  // Simulated stream health data
  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockMetrics: StreamMetric[] = [
          {
            channelId: 'radio-paradise',
            channelName: 'Radio Paradise',
            status: 'online',
            uptime: 99.8,
            bitrate: 128,
            listeners: 2847,
            latency: 45,
            lastChecked: new Date(),
            trend: 'up',
          },
          {
            channelId: 'bbc-radio-1',
            channelName: 'BBC Radio 1',
            status: 'online',
            uptime: 99.9,
            bitrate: 128,
            listeners: 5234,
            latency: 52,
            lastChecked: new Date(),
            trend: 'stable',
          },
          {
            channelId: 'france-inter',
            channelName: 'France Inter',
            status: 'online',
            uptime: 99.5,
            bitrate: 128,
            listeners: 1654,
            latency: 78,
            lastChecked: new Date(),
            trend: 'down',
          },
          {
            channelId: 'deutschlandfunk',
            channelName: 'Deutschlandfunk',
            status: 'degraded',
            uptime: 98.2,
            bitrate: 96,
            listeners: 987,
            latency: 125,
            lastChecked: new Date(),
            trend: 'down',
          },
          {
            channelId: 'rfi-english',
            channelName: 'RFI English',
            status: 'online',
            uptime: 99.7,
            bitrate: 128,
            listeners: 1234,
            latency: 95,
            lastChecked: new Date(),
            trend: 'stable',
          },
        ];

        setMetrics(mockMetrics);
      } catch (error) {
        console.error('Failed to fetch stream metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'offline':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500/10 border-green-500/30';
      case 'degraded':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'offline':
        return 'bg-red-500/10 border-red-500/30';
      default:
        return 'bg-slate-500/10 border-slate-500/30';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
      default:
        return <Zap className="w-4 h-4 text-slate-400" />;
    }
  };

  const overallHealth = {
    totalChannels: metrics.length,
    onlineChannels: metrics.filter(m => m.status === 'online').length,
    avgUptime: metrics.length > 0 ? (metrics.reduce((sum, m) => sum + m.uptime, 0) / metrics.length).toFixed(1) : 0,
    totalListeners: metrics.reduce((sum, m) => sum + m.listeners, 0),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Activity className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading stream health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Stream Health Status</h1>
          <p className="text-slate-400">Real-time monitoring of all RRB streaming channels</p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Channels</p>
                <p className="text-2xl font-bold text-white">{overallHealth.totalChannels}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Online</p>
                <p className="text-2xl font-bold text-green-400">{overallHealth.onlineChannels}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Avg Uptime</p>
                <p className="text-2xl font-bold text-amber-400">{overallHealth.avgUptime}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Listeners</p>
                <p className="text-2xl font-bold text-purple-400">{overallHealth.totalListeners.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Channel Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Channel Status</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {metrics.map(metric => (
              <Card
                key={metric.channelId}
                className={`p-4 border cursor-pointer transition-all hover:shadow-lg ${getStatusColor(metric.status)}`}
                onClick={() => setSelectedChannel(selectedChannel === metric.channelId ? null : metric.channelId)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(metric.status)}
                    <div>
                      <h3 className="font-semibold text-white">{metric.channelName}</h3>
                      <p className="text-xs text-slate-400 capitalize">{metric.status}</p>
                    </div>
                  </div>
                  {getTrendIcon(metric.trend)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-slate-400">Uptime</p>
                    <p className="text-white font-semibold">{metric.uptime}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Bitrate</p>
                    <p className="text-white font-semibold">{metric.bitrate} kbps</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Listeners</p>
                    <p className="text-white font-semibold">{metric.listeners.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Latency</p>
                    <p className="text-white font-semibold">{metric.latency}ms</p>
                  </div>
                </div>

                {selectedChannel === metric.channelId && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-xs text-slate-400">
                      Last checked: {metric.lastChecked.toLocaleTimeString()}
                    </p>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Uptime Trend</span>
                        <span className={metric.trend === 'up' ? 'text-green-400' : metric.trend === 'down' ? 'text-red-400' : 'text-slate-400'}>
                          {metric.trend === 'up' ? '↑ Improving' : metric.trend === 'down' ? '↓ Declining' : '→ Stable'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
          <h3 className="text-sm font-semibold text-white mb-3">Status Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-slate-300">Online - Stream is working normally</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span className="text-slate-300">Degraded - Stream has issues but is accessible</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-slate-300">Offline - Stream is not available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamHealthStatus;
