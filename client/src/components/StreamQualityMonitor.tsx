'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, AlertTriangle, CheckCircle, TrendingDown, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface StreamMetrics {
  id: string;
  name: string;
  bitrate: number;
  latency: number;
  packetLoss: number;
  jitter: number;
  health: 'excellent' | 'good' | 'fair' | 'poor';
  status: 'online' | 'degraded' | 'offline';
}

export function StreamQualityMonitor() {
  const [streams, setStreams] = useState<StreamMetrics[]>([
    {
      id: 'stream-1',
      name: '432 Hz Pure',
      bitrate: 320,
      latency: 45,
      packetLoss: 0.2,
      jitter: 2.1,
      health: 'excellent',
      status: 'online',
    },
    {
      id: 'stream-2',
      name: '528 Hz Miracle Tone',
      bitrate: 256,
      latency: 62,
      packetLoss: 0.5,
      jitter: 3.2,
      health: 'good',
      status: 'online',
    },
    {
      id: 'stream-3',
      name: 'Soul & R&B Classics',
      bitrate: 192,
      latency: 85,
      packetLoss: 1.2,
      jitter: 5.1,
      health: 'fair',
      status: 'degraded',
    },
  ]);

  const [autoFailover, setAutoFailover] = useState(true);

  // Simulate real-time metric updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStreams((prevStreams) =>
        prevStreams.map((stream) => {
          const newBitrate = Math.max(128, stream.bitrate + (Math.random() - 0.5) * 40);
          const newLatency = Math.max(20, stream.latency + (Math.random() - 0.5) * 20);
          const newPacketLoss = Math.max(0, stream.packetLoss + (Math.random() - 0.5) * 0.5);
          const newJitter = Math.max(0.5, stream.jitter + (Math.random() - 0.5) * 2);

          let health: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
          if (newPacketLoss > 2 || newLatency > 150) health = 'poor';
          else if (newPacketLoss > 1 || newLatency > 100) health = 'fair';
          else if (newPacketLoss > 0.5 || newLatency > 75) health = 'good';

          let status: 'online' | 'degraded' | 'offline' = 'online';
          if (health === 'poor') status = 'degraded';
          if (newPacketLoss > 5) status = 'offline';

          // Trigger failover if needed
          if (autoFailover && status === 'offline') {
            toast.warning(`Auto-failover activated for ${stream.name}`);
          }

          return {
            ...stream,
            bitrate: newBitrate,
            latency: newLatency,
            packetLoss: newPacketLoss,
            jitter: newJitter,
            health,
            status,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [autoFailover]);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'good':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'fair':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'poor':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'fair':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'poor':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default:
        return <Activity className="w-5 h-5 text-slate-400" />;
    }
  };

  const getMetricHealth = (value: number, type: string) => {
    if (type === 'bitrate') return value >= 256 ? 100 : (value / 256) * 100;
    if (type === 'latency') return value <= 50 ? 100 : Math.max(0, 100 - (value - 50) / 2);
    if (type === 'packetLoss') return value <= 0.5 ? 100 : Math.max(0, 100 - value * 20);
    if (type === 'jitter') return value <= 3 ? 100 : Math.max(0, 100 - value * 10);
    return 50;
  };

  return (
    <div className="space-y-6">
      {/* Global Controls */}
      <Card className="bg-slate-800/40 border-slate-700/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white mb-1">Auto-Failover</h3>
              <p className="text-sm text-slate-400">
                {autoFailover ? 'Enabled - Automatic stream switching' : 'Disabled - Manual control'}
              </p>
            </div>
            <button
              onClick={() => setAutoFailover(!autoFailover)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                autoFailover
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-slate-600 hover:bg-slate-700 text-white'
              }`}
            >
              {autoFailover ? 'ON' : 'OFF'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Stream Metrics */}
      <div className="space-y-4">
        {streams.map((stream) => (
          <Card key={stream.id} className="bg-slate-800/40 border-slate-700/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getHealthIcon(stream.health)}
                  <div>
                    <CardTitle className="text-white">{stream.name}</CardTitle>
                    <CardDescription className="text-slate-400">
                      {stream.status === 'online' ? 'Streaming' : 'Degraded Connection'}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={getHealthColor(stream.health)}>
                  {stream.health.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bitrate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Bitrate</span>
                  <span className="text-sm font-semibold text-white">{Math.round(stream.bitrate)} kbps</span>
                </div>
                <Progress
                  value={getMetricHealth(stream.bitrate, 'bitrate')}
                  className="h-2 bg-slate-700"
                />
              </div>

              {/* Latency */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Latency</span>
                  <span className="text-sm font-semibold text-white">{Math.round(stream.latency)} ms</span>
                </div>
                <Progress
                  value={getMetricHealth(stream.latency, 'latency')}
                  className="h-2 bg-slate-700"
                />
              </div>

              {/* Packet Loss */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Packet Loss</span>
                  <span className="text-sm font-semibold text-white">{stream.packetLoss.toFixed(2)}%</span>
                </div>
                <Progress
                  value={getMetricHealth(stream.packetLoss, 'packetLoss')}
                  className="h-2 bg-slate-700"
                />
              </div>

              {/* Jitter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Jitter</span>
                  <span className="text-sm font-semibold text-white">{stream.jitter.toFixed(1)} ms</span>
                </div>
                <Progress
                  value={getMetricHealth(stream.jitter, 'jitter')}
                  className="h-2 bg-slate-700"
                />
              </div>

              {/* Status Indicator */}
              <div className="pt-2 border-t border-slate-700/30">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      stream.status === 'online'
                        ? 'bg-green-500'
                        : stream.status === 'degraded'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                  />
                  <span className="text-sm text-slate-300">
                    {stream.status === 'online'
                      ? 'Excellent connection'
                      : stream.status === 'degraded'
                        ? 'Connection degraded - Failover ready'
                        : 'Connection lost - Failover active'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card className="bg-slate-800/40 border-slate-700/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Network Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Avg Bitrate</div>
              <div className="text-2xl font-bold text-white">
                {Math.round(streams.reduce((a, b) => a + b.bitrate, 0) / streams.length)} kbps
              </div>
            </div>
            <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Avg Latency</div>
              <div className="text-2xl font-bold text-white">
                {Math.round(streams.reduce((a, b) => a + b.latency, 0) / streams.length)} ms
              </div>
            </div>
            <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Avg Packet Loss</div>
              <div className="text-2xl font-bold text-white">
                {(streams.reduce((a, b) => a + b.packetLoss, 0) / streams.length).toFixed(2)}%
              </div>
            </div>
            <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Streams Online</div>
              <div className="text-2xl font-bold text-green-400">
                {streams.filter((s) => s.status === 'online').length}/{streams.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
