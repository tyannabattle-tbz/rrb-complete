/**
 * Listener Engagement Heatmap Widget
 * Real-time geographic heatmap showing peak engagement by channel
 * Displays trending content and optimal broadcast timing
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, MapPin, Users, Clock, Radio } from 'lucide-react';

interface EngagementMetric {
  region: string;
  channel: string;
  listenerCount: number;
  engagementRate: number;
  peakTime: string;
  trend: number; // percentage change
  contentType: string;
}

interface ChannelPerformance {
  name: string;
  listeners: number;
  engagement: number;
  trending: boolean;
  peakHour: number;
  topRegion: string;
}

interface TrendingContent {
  title: string;
  channel: string;
  plays: number;
  engagement: number;
  duration: string;
}

const ListenerEngagementHeatmap: React.FC = () => {
  const [metrics, setMetrics] = useState<EngagementMetric[]>([]);
  const [channelPerformance, setChannelPerformance] = useState<ChannelPerformance[]>([]);
  const [trendingContent, setTrendingContent] = useState<TrendingContent[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEngagementData();
  }, [timeRange]);

  const loadEngagementData = async () => {
    try {
      setLoading(true);

      // Simulate loading engagement metrics
      const mockMetrics: EngagementMetric[] = [
        {
          region: 'North America',
          channel: 'Neo-Soul',
          listenerCount: 8500,
          engagementRate: 0.94,
          peakTime: '19:00-21:00',
          trend: 12.5,
          contentType: 'Music',
        },
        {
          region: 'Europe',
          channel: 'Healing Frequencies',
          listenerCount: 6200,
          engagementRate: 0.89,
          peakTime: '20:00-22:00',
          trend: 8.3,
          contentType: 'Meditation',
        },
        {
          region: 'Asia Pacific',
          channel: 'Global Community',
          listenerCount: 5800,
          engagementRate: 0.87,
          peakTime: '09:00-11:00',
          trend: 15.2,
          contentType: 'Talk',
        },
        {
          region: 'South America',
          channel: 'Latin Rhythms',
          listenerCount: 4200,
          engagementRate: 0.92,
          peakTime: '21:00-23:00',
          trend: 6.8,
          contentType: 'Music',
        },
        {
          region: 'Africa',
          channel: 'Community Voice',
          listenerCount: 3500,
          engagementRate: 0.85,
          peakTime: '18:00-20:00',
          trend: 22.1,
          contentType: 'News',
        },
        {
          region: 'Middle East',
          channel: 'Cultural Exchange',
          listenerCount: 2800,
          engagementRate: 0.88,
          peakTime: '20:00-22:00',
          trend: 11.4,
          contentType: 'Music',
        },
      ];

      const mockChannelPerformance: ChannelPerformance[] = [
        {
          name: 'Neo-Soul',
          listeners: 12500,
          engagement: 0.94,
          trending: true,
          peakHour: 20,
          topRegion: 'North America',
        },
        {
          name: 'Healing Frequencies',
          listeners: 9800,
          engagement: 0.91,
          trending: true,
          peakHour: 21,
          topRegion: 'Europe',
        },
        {
          name: 'Global Community',
          listeners: 8200,
          engagement: 0.87,
          trending: false,
          peakHour: 10,
          topRegion: 'Asia Pacific',
        },
        {
          name: 'Latin Rhythms',
          listeners: 7500,
          engagement: 0.89,
          trending: true,
          peakHour: 22,
          topRegion: 'South America',
        },
        {
          name: 'Community Voice',
          listeners: 5200,
          engagement: 0.85,
          trending: true,
          peakHour: 19,
          topRegion: 'Africa',
        },
      ];

      const mockTrendingContent: TrendingContent[] = [
        {
          title: 'Midnight Jazz Sessions',
          channel: 'Neo-Soul',
          plays: 15420,
          engagement: 0.96,
          duration: '2h 30m',
        },
        {
          title: 'Deep Sleep Meditation',
          channel: 'Healing Frequencies',
          plays: 12850,
          engagement: 0.93,
          duration: '45m',
        },
        {
          title: 'Global Voices Podcast',
          channel: 'Global Community',
          plays: 9320,
          engagement: 0.88,
          duration: '1h 15m',
        },
        {
          title: 'Latin Beats Mix',
          channel: 'Latin Rhythms',
          plays: 8750,
          engagement: 0.91,
          duration: '3h',
        },
        {
          title: 'Community Stories',
          channel: 'Community Voice',
          plays: 6420,
          engagement: 0.87,
          duration: '50m',
        },
      ];

      setMetrics(mockMetrics);
      setChannelPerformance(mockChannelPerformance);
      setTrendingContent(mockTrendingContent);
    } catch (error) {
      console.error('Failed to load engagement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEngagementColor = (rate: number) => {
    if (rate >= 0.9) return 'bg-green-100 text-green-800';
    if (rate >= 0.85) return 'bg-blue-100 text-blue-800';
    if (rate >= 0.80) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getTrendColor = (trend: number) => {
    if (trend > 10) return 'text-green-400';
    if (trend > 5) return 'text-blue-400';
    return 'text-slate-400';
  };

  const getOptimalBroadcastTime = (peakHour: number) => {
    const hour = peakHour % 24;
    return `${String(hour).padStart(2, '0')}:00 - ${String((hour + 2) % 24).padStart(2, '0')}:00`;
  };

  const totalListeners = metrics.reduce((sum, m) => sum + m.listenerCount, 0);
  const avgEngagement = metrics.length > 0 ? (metrics.reduce((sum, m) => sum + m.engagementRate, 0) / metrics.length) * 100 : 0;
  const trendingChannels = channelPerformance.filter(c => c.trending).length;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Listener Engagement Heatmap</h1>
          <p className="text-slate-400">Real-time geographic distribution and peak engagement analysis</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-8">
          {(['1h', '24h', '7d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded transition-all ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {range === '1h' ? 'Last Hour' : range === '24h' ? 'Last 24h' : 'Last 7 Days'}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm mb-2">Total Listeners</p>
                <p className="text-3xl font-bold text-white">{totalListeners.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm mb-2">Avg Engagement</p>
                <p className="text-3xl font-bold text-white">{avgEngagement.toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <Radio className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm mb-2">Trending Channels</p>
                <p className="text-3xl font-bold text-white">{trendingChannels}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm mb-2">Regions Active</p>
                <p className="text-3xl font-bold text-white">{metrics.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Geographic Heatmap */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Geographic Distribution</CardTitle>
                <CardDescription>Listener engagement by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loading ? (
                    <p className="text-slate-400">Loading heatmap data...</p>
                  ) : (
                    metrics.map(metric => (
                      <div
                        key={`${metric.region}_${metric.channel}`}
                        onClick={() => setSelectedRegion(metric.region)}
                        className={`p-4 rounded border cursor-pointer transition-all ${
                          selectedRegion === metric.region
                            ? 'bg-blue-900 border-blue-500'
                            : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-white flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {metric.region}
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">{metric.channel}</p>
                          </div>
                          <Badge className={getEngagementColor(metric.engagementRate)}>
                            {(metric.engagementRate * 100).toFixed(0)}%
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                          <div>
                            <p className="text-slate-500">Listeners</p>
                            <p className="text-white font-semibold">{metric.listenerCount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Peak Time</p>
                            <p className="text-white font-semibold text-xs">{metric.peakTime}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Trend</p>
                            <p className={`font-semibold ${getTrendColor(metric.trend)}`}>
                              {metric.trend > 0 ? '+' : ''}{metric.trend.toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        {/* Engagement Bar */}
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${metric.engagementRate * 100}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Channel Performance & Trending */}
          <div className="space-y-4">
            {/* Channel Performance */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Top Channels</CardTitle>
                <CardDescription>Current performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {channelPerformance.slice(0, 5).map(channel => (
                    <div key={channel.name} className="p-3 bg-slate-700 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white text-sm">{channel.name}</h4>
                        {channel.trending && <Badge className="bg-green-600 text-white text-xs">Trending</Badge>}
                      </div>
                      <div className="text-xs text-slate-400 space-y-1">
                        <p>Listeners: {channel.listeners.toLocaleString()}</p>
                        <p>Peak: {getOptimalBroadcastTime(channel.peakHour)}</p>
                        <p>Top Region: {channel.topRegion}</p>
                      </div>
                      <div className="mt-2 w-full bg-slate-600 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-1.5 rounded-full"
                          style={{ width: `${channel.engagement * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trending Content */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Trending Content</CardTitle>
                <CardDescription>Most played today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trendingContent.slice(0, 5).map((content, idx) => (
                    <div key={idx} className="p-3 bg-slate-700 rounded">
                      <h4 className="font-semibold text-white text-sm">{content.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{content.channel}</p>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-slate-400">{content.plays.toLocaleString()} plays</span>
                        <Badge className="bg-blue-600 text-white">{(content.engagement * 100).toFixed(0)}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Optimal Broadcast Timing */}
        <Card className="bg-slate-800 border-slate-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Optimal Broadcast Timing</CardTitle>
            <CardDescription>Recommended schedule for maximum reach</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {channelPerformance.map(channel => (
                <div key={channel.name} className="p-4 bg-slate-700 rounded">
                  <h4 className="font-semibold text-white mb-3">{channel.name}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-slate-300">Peak: {getOptimalBroadcastTime(channel.peakHour)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-400" />
                      <span className="text-slate-300">Top Region: {channel.topRegion}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300">{channel.listeners.toLocaleString()} listeners</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ListenerEngagementHeatmap;
