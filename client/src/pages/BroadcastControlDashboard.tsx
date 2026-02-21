import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Play, Pause, Square, Settings, Users, MessageSquare, BarChart3, Eye, Zap } from 'lucide-react';
import { trpc } from '@/lib/trpc';
// import { useAuth } from '@/hooks/useAuth';

interface BroadcastStream {
  id: string;
  platform: string;
  streamUrl: string;
  bitrate: number;
  resolution: string;
  status: 'active' | 'inactive' | 'error';
}

interface BroadcastMetrics {
  viewerCount: number;
  peakViewers: number;
  averageBitrate: number;
  bufferEvents: number;
  chatMessages: number;
  engagementRate: number;
}

export default function BroadcastControlDashboard() {
  // const { user } = useAuth();
  const user = null; // Placeholder for auth
  const [broadcastStatus, setBroadcastStatus] = useState<'idle' | 'live' | 'paused'>('idle');
  const [selectedBroadcast, setSelectedBroadcast] = useState<string>('');
  const [metrics, setMetrics] = useState<BroadcastMetrics>({
    viewerCount: 0,
    peakViewers: 0,
    averageBitrate: 0,
    bufferEvents: 0,
    chatMessages: 0,
    engagementRate: 0,
  });
  const [streams, setStreams] = useState<BroadcastStream[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  // Fetch broadcasts
  const { data: broadcasts } = trpc.broadcast.listBroadcasts.useQuery();

  // Fetch current metrics
  useEffect(() => {
    if (!selectedBroadcast) return;

    const interval = setInterval(() => {
      // Simulate real-time metrics update
      setMetrics(prev => ({
        ...prev,
        viewerCount: Math.max(0, prev.viewerCount + Math.floor(Math.random() * 20 - 10)),
        peakViewers: Math.max(prev.peakViewers, prev.viewerCount),
        averageBitrate: 4500 + Math.floor(Math.random() * 1000),
        bufferEvents: prev.bufferEvents + (Math.random() > 0.95 ? 1 : 0),
        chatMessages: prev.chatMessages + Math.floor(Math.random() * 5),
        engagementRate: Math.min(100, 65 + Math.random() * 20),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedBroadcast]);

  const handleStartBroadcast = async () => {
    if (!selectedBroadcast) return;
    setBroadcastStatus('live');
    setMetrics(prev => ({ ...prev, viewerCount: Math.floor(Math.random() * 1000) + 100 }));
  };

  const handlePauseBroadcast = () => {
    setBroadcastStatus('paused');
  };

  const handleStopBroadcast = () => {
    setBroadcastStatus('idle');
    setMetrics({
      viewerCount: 0,
      peakViewers: metrics.peakViewers,
      averageBitrate: 0,
      bufferEvents: 0,
      chatMessages: 0,
      engagementRate: 0,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'idle':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStreamStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500">Inactive</Badge>;
      case 'error':
        return <Badge className="bg-red-500">Error</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎙️ Broadcast Control Center</h1>
          <p className="text-slate-400">UN WCS Parallel Event - March 17th, 2026</p>
        </div>

        {/* Main Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Broadcast Selection */}
          <Card className="lg:col-span-1 bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Select Broadcast</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedBroadcast} onValueChange={setSelectedBroadcast}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Choose a broadcast" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {broadcasts?.map((broadcast: any) => (
                    <SelectItem key={broadcast.id} value={broadcast.id} className="text-white">
                      {broadcast.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <p className="text-sm text-slate-400">Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(broadcastStatus)}`}></div>
                  <span className="text-white font-semibold capitalize">{broadcastStatus}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Control Buttons */}
          <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Broadcast Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={handleStartBroadcast}
                  disabled={broadcastStatus === 'live' || !selectedBroadcast}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </Button>
                <Button
                  onClick={handlePauseBroadcast}
                  disabled={broadcastStatus !== 'live'}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
                <Button
                  onClick={handleStopBroadcast}
                  disabled={broadcastStatus === 'idle'}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </div>

              <Button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                Stream Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Live Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Viewers */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" />
                Live Viewers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-400">{metrics.viewerCount.toLocaleString()}</div>
              <p className="text-sm text-slate-400 mt-2">Peak: {metrics.peakViewers.toLocaleString()}</p>
            </CardContent>
          </Card>

          {/* Bitrate */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Average Bitrate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-400">{metrics.averageBitrate.toLocaleString()} kbps</div>
              <p className="text-sm text-slate-400 mt-2">Optimal: 4000-6000 kbps</p>
            </CardContent>
          </Card>

          {/* Engagement */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-400" />
                Engagement Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-400">{metrics.engagementRate.toFixed(1)}%</div>
              <p className="text-sm text-slate-400 mt-2">Chat: {metrics.chatMessages} messages</p>
            </CardContent>
          </Card>
        </div>

        {/* Streams Management */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Active Streams
            </CardTitle>
            <CardDescription className="text-slate-400">
              Multi-platform distribution status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['custom', 'youtube', 'facebook', 'twitch'].map(platform => (
                <div key={platform} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-white font-semibold capitalize">{platform}</span>
                  </div>
                  <Badge className="bg-green-500">Active</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Audience & Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Audience Info */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Audience Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Desktop</span>
                  <span className="text-white font-semibold">65%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Mobile</span>
                  <span className="text-white font-semibold">30%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Tablet</span>
                  <span className="text-white font-semibold">5%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Activity */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Chat Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Messages/min</span>
                  <span className="text-white font-semibold">{Math.floor(metrics.chatMessages / 5)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Active Users</span>
                  <span className="text-white font-semibold">{Math.floor(metrics.viewerCount * 0.15)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Moderation Queue</span>
                  <span className="text-white font-semibold">2</span>
                </div>
              </div>
              <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white mt-4">
                Open Chat Moderation
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Alert */}
        {metrics.bufferEvents > 5 && (
          <div className="mt-8 p-4 bg-red-900 border border-red-700 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-200 font-semibold">Stream Quality Alert</h3>
              <p className="text-red-300 text-sm">High buffer events detected. Check network connection and bitrate.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
