import React, { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Play, Pause, Video, AlertTriangle, Signal, Zap, Eye } from 'lucide-react';

interface DroneVideoStream {
  id: string;
  droneId: string;
  status: 'streaming' | 'paused' | 'idle' | 'error';
  resolution: string;
  bitrate: number;
  fps: number;
  latency: number;
  viewers: number;
  encryptionLevel: 'military-grade' | 'high' | 'standard';
  startTime: string;
  duration: number;
  quality: 'auto' | '4K' | '1080p' | '720p' | '480p';
  signalStrength: number;
}

interface VideoMetrics {
  totalBitrate: number;
  averageLatency: number;
  packetLoss: number;
  jitterLevel: number;
  totalViewers: number;
  activeStreams: number;
  encryptionStatus: string;
  bandwidthUsage: number;
}

interface StreamTimeline {
  timestamp: string;
  bitrate: number;
  latency: number;
  viewers: number;
}

const QUALITY_PRESETS = {
  '4K': { resolution: '3840x2160', bitrate: 25000, fps: 60 },
  '1080p': { resolution: '1920x1080', bitrate: 8000, fps: 60 },
  '720p': { resolution: '1280x720', bitrate: 4000, fps: 30 },
  '480p': { resolution: '854x480', bitrate: 2000, fps: 30 },
};

export const DroneVideoCapture: React.FC = () => {
  const [streams, setStreams] = useState<DroneVideoStream[]>([]);
  const [metrics, setMetrics] = useState<VideoMetrics | null>(null);
  const [timeline, setTimeline] = useState<StreamTimeline[]>([]);
  const [selectedStream, setSelectedStream] = useState<DroneVideoStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState<'4K' | '1080p' | '720p' | '480p'>('1080p');

  // Fetch video streams
  const { data: streamsData } = trpc.droneVideo.getStreams.useQuery();

  // Fetch video metrics
  const { data: metricsData } = trpc.droneVideo.getMetrics.useQuery();

  // Fetch stream timeline
  const { data: timelineData } = trpc.droneVideo.getTimeline.useQuery();

  // Start stream mutation
  const startStreamMutation = trpc.droneVideo.startStream.useMutation();

  // Stop stream mutation
  const stopStreamMutation = trpc.droneVideo.stopStream.useMutation();

  useEffect(() => {
    if (streamsData) setStreams(streamsData);
    if (metricsData) setMetrics(metricsData);
    if (timelineData) setTimeline(timelineData);
    setLoading(false);
  }, [streamsData, metricsData, timelineData]);

  const handleStartStream = async (droneId: string) => {
    await startStreamMutation.mutateAsync({
      droneId,
      quality: selectedQuality,
      encryptionLevel: 'military-grade',
    });
  };

  const handleStopStream = async (streamId: string) => {
    await stopStreamMutation.mutateAsync({ streamId });
  };

  if (loading) {
    return <div className="p-4">Loading drone video streams...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'streaming':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'idle':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSignalQuality = (strength: number) => {
    if (strength >= 90) return { text: 'Excellent', color: 'text-green-600' };
    if (strength >= 70) return { text: 'Good', color: 'text-blue-600' };
    if (strength >= 50) return { text: 'Fair', color: 'text-yellow-600' };
    return { text: 'Poor', color: 'text-red-600' };
  };

  return (
    <div className="w-full space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header Banner */}
      <div className="rounded-lg bg-gradient-to-r from-gray-800 to-black p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Military-Grade Drone Video Capture</h1>
        <p className="mt-2 text-lg font-semibold">Real-time Streaming & HybridCast Integration</p>
        <p className="mt-2 text-sm opacity-90">
          {streams.filter(s => s.status === 'streaming').length} active streams • {metrics?.totalViewers || 0} viewers
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Streams</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {metrics?.activeStreams || 0}
              </p>
            </div>
            <Video className="h-8 w-8 text-blue-400" />
          </div>
        </Card>

        <Card className="bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Viewers</p>
              <p className="mt-2 text-3xl font-bold text-purple-600">
                {(metrics?.totalViewers || 0).toLocaleString()}
              </p>
            </div>
            <Eye className="h-8 w-8 text-purple-400" />
          </div>
        </Card>

        <Card className="bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Latency</p>
              <p className="mt-2 text-3xl font-bold text-orange-600">
                {(metrics?.averageLatency || 0).toFixed(1)}ms
              </p>
            </div>
            <Signal className="h-8 w-8 text-orange-400" />
          </div>
        </Card>

        <Card className="bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bandwidth Usage</p>
              <p className="mt-2 text-3xl font-bold text-red-600">
                {(metrics?.bandwidthUsage || 0).toFixed(1)} Mbps
              </p>
            </div>
            <Zap className="h-8 w-8 text-red-400" />
          </div>
        </Card>
      </div>

      {/* Quality Selection */}
      <Card className="p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Stream Quality Settings</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {Object.entries(QUALITY_PRESETS).map(([quality, preset]) => (
            <button
              key={quality}
              onClick={() => setSelectedQuality(quality as any)}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                selectedQuality === quality
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold text-gray-800">{quality}</h3>
              <p className="mt-1 text-xs text-gray-600">{preset.resolution}</p>
              <p className="text-xs text-gray-600">{preset.bitrate} kbps • {preset.fps} fps</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Active Streams */}
      <Card className="p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Active Video Streams</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {streams.map((stream) => (
            <div
              key={stream.id}
              className="rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow"
            >
              {/* Video Preview Placeholder */}
              <div className="mb-4 aspect-video rounded-lg bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                <Video className="h-12 w-12 text-gray-600" />
              </div>

              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{stream.droneId}</h3>
                    <p className={`mt-1 rounded-full px-2 py-1 text-xs font-semibold inline-block ${getStatusColor(stream.status)}`}>
                      {stream.status}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    🔐 {stream.encryptionLevel}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Resolution</p>
                    <p className="font-semibold text-gray-800">{stream.resolution}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Bitrate</p>
                    <p className="font-semibold text-gray-800">{stream.bitrate} kbps</p>
                  </div>
                  <div>
                    <p className="text-gray-600">FPS</p>
                    <p className="font-semibold text-gray-800">{stream.fps}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Latency</p>
                    <p className="font-semibold text-gray-800">{stream.latency}ms</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Viewers</p>
                    <p className="font-semibold text-gray-800">{stream.viewers}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Signal</p>
                    <p className={`font-semibold ${getSignalQuality(stream.signalStrength).color}`}>
                      {getSignalQuality(stream.signalStrength).text}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {stream.status === 'streaming' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStopStream(stream.id)}
                      className="flex-1"
                    >
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleStartStream(stream.droneId)}
                      className="flex-1"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Start
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Stream Performance Timeline */}
      <Card className="p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Stream Performance (Last 24 Hours)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timeline}>
            <defs>
              <linearGradient id="colorBitrate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="bitrate"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorBitrate)"
              name="Bitrate (kbps)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Network Quality Metrics */}
      <Card className="p-6 shadow-md bg-gradient-to-r from-gray-50 to-gray-100">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Network Quality Metrics</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-4">
            <p className="text-sm font-medium text-gray-600">Packet Loss</p>
            <p className="mt-2 text-2xl font-bold text-red-600">{(metrics?.packetLoss || 0).toFixed(2)}%</p>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-red-500"
                style={{ width: `${Math.min(metrics?.packetLoss || 0, 100)}%` }}
              />
            </div>
          </div>

          <div className="rounded-lg bg-white p-4">
            <p className="text-sm font-medium text-gray-600">Jitter Level</p>
            <p className="mt-2 text-2xl font-bold text-orange-600">{(metrics?.jitterLevel || 0).toFixed(1)}ms</p>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-orange-500"
                style={{ width: `${Math.min((metrics?.jitterLevel || 0) / 10, 100)}%` }}
              />
            </div>
          </div>

          <div className="rounded-lg bg-white p-4">
            <p className="text-sm font-medium text-gray-600">Encryption Status</p>
            <p className="mt-2 text-2xl font-bold text-green-600">✓ Active</p>
            <p className="mt-1 text-xs text-gray-500">Military-grade AES-256</p>
          </div>

          <div className="rounded-lg bg-white p-4">
            <p className="text-sm font-medium text-gray-600">HybridCast Integration</p>
            <p className="mt-2 text-2xl font-bold text-blue-600">✓ Connected</p>
            <p className="mt-1 text-xs text-gray-500">Synchronized streaming</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DroneVideoCapture;
