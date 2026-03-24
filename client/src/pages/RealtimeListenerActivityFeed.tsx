'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Radio, TrendingUp, MapPin, Clock } from 'lucide-react';

interface ActiveListener {
  id: string;
  username: string;
  channel: string;
  currentContent: string;
  engagementScore: number;
  location: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  listeningDuration: number;
  joinedAt: number;
}

interface ChannelMetrics {
  channelId: string;
  channelName: string;
  activeListeners: number;
  totalEngagement: number;
  currentContent: string;
  peakListeners: number;
}

interface TrendingTopic {
  topic: string;
  mentions: number;
  trend: 'up' | 'down' | 'stable';
  engagement: number;
}

export default function RealtimeListenerActivityFeed() {
  const [activeListeners, setActiveListeners] = useState<ActiveListener[]>([]);
  const [channelMetrics, setChannelMetrics] = useState<ChannelMetrics[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [totalListeners, setTotalListeners] = useState(0);
  const [averageEngagement, setAverageEngagement] = useState(0);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    // Generate mock data
    const mockListeners: ActiveListener[] = [
      {
        id: '1',
        username: 'Alex_Stream',
        channel: 'Ty OS Radio',
        currentContent: 'Morning Vibes Mix',
        engagementScore: 0.87,
        location: 'New York, USA',
        deviceType: 'mobile',
        listeningDuration: 1245,
        joinedAt: Date.now() - 1245000,
      },
      {
        id: '2',
        username: 'Jordan_Music',
        channel: 'Healing Frequencies',
        currentContent: '432Hz Meditation',
        engagementScore: 0.92,
        location: 'Los Angeles, USA',
        deviceType: 'desktop',
        listeningDuration: 2340,
        joinedAt: Date.now() - 2340000,
      },
      {
        id: '3',
        username: 'Sam_Podcast',
        channel: 'RRB Legacy',
        currentContent: 'Episode 45: Stories',
        engagementScore: 0.78,
        location: 'Chicago, USA',
        deviceType: 'tablet',
        listeningDuration: 890,
        joinedAt: Date.now() - 890000,
      },
      {
        id: '4',
        username: 'Taylor_Live',
        channel: 'Ty OS Radio',
        currentContent: 'Afternoon Drive',
        engagementScore: 0.85,
        location: 'Houston, USA',
        deviceType: 'mobile',
        listeningDuration: 567,
        joinedAt: Date.now() - 567000,
      },
      {
        id: '5',
        username: 'Morgan_Chill',
        channel: 'Ambient Soundscapes',
        currentContent: 'Ocean Waves',
        engagementScore: 0.91,
        location: 'Miami, USA',
        deviceType: 'desktop',
        listeningDuration: 3120,
        joinedAt: Date.now() - 3120000,
      },
    ];

    const mockChannels: ChannelMetrics[] = [
      {
        channelId: 'ch1',
        channelName: 'Ty OS Radio',
        activeListeners: 1245,
        totalEngagement: 0.88,
        currentContent: 'Afternoon Drive Show',
        peakListeners: 2100,
      },
      {
        channelId: 'ch2',
        channelName: 'Healing Frequencies',
        activeListeners: 856,
        totalEngagement: 0.91,
        currentContent: '528Hz Healing Session',
        peakListeners: 1500,
      },
      {
        channelId: 'ch3',
        channelName: 'RRB Legacy',
        activeListeners: 623,
        totalEngagement: 0.82,
        currentContent: 'Podcast Archive',
        peakListeners: 950,
      },
      {
        channelId: 'ch4',
        channelName: 'Ambient Soundscapes',
        activeListeners: 445,
        totalEngagement: 0.89,
        currentContent: 'Nature Sounds',
        peakListeners: 780,
      },
    ];

    const mockTrending: TrendingTopic[] = [
      { topic: 'Healing Music', mentions: 1245, trend: 'up', engagement: 0.92 },
      { topic: 'Meditation', mentions: 987, trend: 'up', engagement: 0.88 },
      { topic: 'Live Streaming', mentions: 756, trend: 'stable', engagement: 0.85 },
      { topic: 'Podcast Stories', mentions: 634, trend: 'down', engagement: 0.78 },
      { topic: 'Music Discovery', mentions: 512, trend: 'up', engagement: 0.81 },
    ];

    setActiveListeners(mockListeners);
    setChannelMetrics(mockChannels);
    setTrendingTopics(mockTrending);
    setTotalListeners(mockChannels.reduce((sum, ch) => sum + ch.activeListeners, 0));
    setAverageEngagement(
      mockChannels.reduce((sum, ch) => sum + ch.totalEngagement, 0) / mockChannels.length
    );

    // Simulate real-time updates every 5 seconds
    const interval = setInterval(() => {
      setActiveListeners(prev =>
        prev.map(listener => ({
          ...listener,
          listeningDuration: listener.listeningDuration + 5,
          engagementScore: Math.min(1, listener.engagementScore + (Math.random() - 0.5) * 0.05),
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile':
        return '📱';
      case 'desktop':
        return '💻';
      case 'tablet':
        return '📱';
      default:
        return '📡';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Real-Time Listener Activity</h1>
          <p className="text-slate-400">Live dashboard of active listeners across all 54 channels</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Listeners</p>
                  <p className="text-3xl font-bold text-white">{totalListeners.toLocaleString()}</p>
                </div>
                <Users className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Avg Engagement</p>
                  <p className="text-3xl font-bold text-white">{(averageEngagement * 100).toFixed(0)}%</p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Channels</p>
                  <p className="text-3xl font-bold text-white">{channelMetrics.length}</p>
                </div>
                <Radio className="w-12 h-12 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Peak Today</p>
                  <p className="text-3xl font-bold text-white">
                    {Math.max(...channelMetrics.map(ch => ch.peakListeners)).toLocaleString()}
                  </p>
                </div>
                <Clock className="w-12 h-12 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Listeners */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Active Listeners</CardTitle>
                <CardDescription>Real-time listener activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {activeListeners.map(listener => (
                    <div
                      key={listener.id}
                      className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-white font-semibold">{listener.username}</p>
                          <p className="text-slate-400 text-sm">{listener.currentContent}</p>
                        </div>
                        <Badge className="bg-green-600">{listener.channel}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {listener.location}
                        </div>
                        <div className="flex items-center gap-1">
                          {getDeviceIcon(listener.deviceType)} {listener.deviceType}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(listener.listeningDuration)}
                        </div>
                        <div>Engagement: {(listener.engagementScore * 100).toFixed(0)}%</div>
                      </div>

                      <Progress value={listener.engagementScore * 100} className="h-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Channel Metrics */}
          <div>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Channel Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {channelMetrics.map(channel => (
                    <div
                      key={channel.channelId}
                      className="bg-slate-700 rounded-lg p-3 cursor-pointer hover:bg-slate-600 transition"
                      onClick={() => setSelectedChannel(channel.channelId)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-semibold text-sm">{channel.channelName}</p>
                        <Badge variant="outline">{channel.activeListeners}</Badge>
                      </div>
                      <p className="text-slate-400 text-xs mb-2 truncate">{channel.currentContent}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Engagement</span>
                          <span>{(channel.totalEngagement * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={channel.totalEngagement * 100} className="h-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trending Topics */}
        <Card className="bg-slate-800 border-slate-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Trending Topics</CardTitle>
            <CardDescription>Most discussed topics in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {trendingTopics.map(topic => (
                <div key={topic.topic} className="bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">{getTrendIcon(topic.trend)}</div>
                  <p className="text-white font-semibold text-sm mb-2">{topic.topic}</p>
                  <div className="space-y-1 text-xs text-slate-400">
                    <p>{topic.mentions.toLocaleString()} mentions</p>
                    <p>Engagement: {(topic.engagement * 100).toFixed(0)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
