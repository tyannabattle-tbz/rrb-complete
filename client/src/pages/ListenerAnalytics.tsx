import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import {
  Users, Activity, TrendingUp, TrendingDown, Minus,
  Radio, BarChart3, Clock, Zap, Eye,
  Heart, Share2, Bookmark, SkipForward, RefreshCw,
  ArrowLeft, Headphones, Signal, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

type ViewMode = 'overview' | 'channels' | 'engagement';

export default function ListenerAnalytics() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const overviewQuery = trpc.listenerAnalytics.getPlatformOverview.useQuery(undefined, {
    refetchInterval: 15000,
  });
  const channelsQuery = trpc.listenerAnalytics.getChannelAnalytics.useQuery(undefined, {
    refetchInterval: 15000,
  });
  const engagementQuery = trpc.listenerAnalytics.getRecentEngagement.useQuery(30, {
    refetchInterval: 10000,
  });

  const overview = overviewQuery.data;
  const channels = channelsQuery.data || [];
  const engagement = engagementQuery.data || [];

  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${mins}m`;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-emerald-400" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-red-400" />;
    return <Minus className="w-3 h-3 text-gray-400" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-emerald-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-gray-400';
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'tune_in': return <Radio className="w-3 h-3 text-emerald-400" />;
      case 'tune_out': return <Radio className="w-3 h-3 text-red-400" />;
      case 'skip': return <SkipForward className="w-3 h-3 text-amber-400" />;
      case 'like': return <Heart className="w-3 h-3 text-pink-400" />;
      case 'share': return <Share2 className="w-3 h-3 text-blue-400" />;
      case 'save': return <Bookmark className="w-3 h-3 text-purple-400" />;
      default: return <Activity className="w-3 h-3 text-gray-400" />;
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'tune_in': return 'Tuned In';
      case 'tune_out': return 'Tuned Out';
      case 'skip': return 'Skipped';
      case 'like': return 'Liked';
      case 'share': return 'Shared';
      case 'save': return 'Saved';
      default: return type;
    }
  };

  const getChannelTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      radio: 'bg-blue-500/20 text-blue-400',
      podcast: 'bg-purple-500/20 text-purple-400',
      streaming: 'bg-cyan-500/20 text-cyan-400',
      emergency: 'bg-red-500/20 text-red-400',
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400';
  };

  // Simple bar chart renderer using divs
  const HourlyChart = ({ data }: { data: { hour: number; listeners: number }[] }) => {
    const maxVal = Math.max(...data.map(d => d.listeners), 1);
    const currentHour = new Date().getHours();
    return (
      <div className="flex items-end gap-[2px] h-16" role="img" aria-label="Hourly listener chart">
        {data.map(d => {
          const height = Math.max(2, (d.listeners / maxVal) * 100);
          const isCurrent = d.hour === currentHour;
          return (
            <div
              key={d.hour}
              className="flex-1 relative group"
              title={`${d.hour}:00 - ${formatNumber(d.listeners)} listeners`}
            >
              <div
                className={`w-full rounded-t-sm transition-all ${
                  isCurrent ? 'bg-cyan-400' : 'bg-cyan-500/40 group-hover:bg-cyan-500/60'
                }`}
                style={{ height: `${height}%` }}
              />
              {d.hour % 6 === 0 && (
                <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[8px] text-gray-600">
                  {d.hour}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Engagement bar chart
  const EngagementBar = ({ value, max, color }: { value: number; max: number; color: string }) => (
    <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex-1">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  );

  const views: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'channels', label: 'Channels', icon: <Radio className="w-4 h-4" /> },
    { id: 'engagement', label: 'Live Feed', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-lg border-b border-white/10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold">Listener Analytics</h1>
                <p className="text-[10px] text-gray-400">Real-time Channel Metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] border-emerald-500/30">
                <Signal className="w-3 h-3 mr-1" /> LIVE
              </Badge>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-white/20"
                onClick={() => {
                  overviewQuery.refetch();
                  channelsQuery.refetch();
                  engagementQuery.refetch();
                  toast.success('Analytics refreshed');
                }}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* View Navigation */}
        <div className="flex border-t border-white/5">
          {views.map(view => (
            <button
              key={view.id}
              onClick={() => { setViewMode(view.id); setSelectedChannel(null); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all ${
                viewMode === view.id
                  ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {view.icon}
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 pb-24">
        {/* Overview Tab */}
        {viewMode === 'overview' && overview && (
          <div className="space-y-4">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Headphones className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] text-gray-400">Active Listeners</span>
                  </div>
                  <p className="text-xl font-bold text-emerald-400">{formatNumber(overview.totalActiveListeners)}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">across {overview.activeChannels} channels</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] text-gray-400">24h Peak</span>
                  </div>
                  <p className="text-xl font-bold text-cyan-400">{formatNumber(overview.peakListeners24h)}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">highest concurrent</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <span className="text-[10px] text-gray-400">Engagement</span>
                  </div>
                  <p className="text-xl font-bold text-purple-400">{overview.avgEngagement}%</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">avg interaction rate</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] text-gray-400">Avg Session</span>
                  </div>
                  <p className="text-xl font-bold text-amber-400">{overview.avgSessionDuration}m</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">per listener</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Channel */}
            <Card className="bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1">Top Performing Channel</p>
                    <p className="text-sm font-bold">{overview.topChannel}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {formatNumber(overview.topChannelListeners)} active listeners
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center">
                    <Radio className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Stats */}
            <Card className="bg-gray-900/50 border-white/10">
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-xs text-gray-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" /> Platform Status
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Total Sessions Today</span>
                  <span className="font-medium">{formatNumber(overview.totalSessionsToday)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Total Channels</span>
                  <span className="font-medium">{overview.totalChannels}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Platform Uptime</span>
                  <span className="font-medium">{formatDuration(overview.platformUptime)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">QUMUS Autonomy</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
                        style={{ width: `${overview.autonomyLevel}%` }}
                      />
                    </div>
                    <span className="font-medium">{overview.autonomyLevel}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Channel Overview */}
            <h3 className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <Radio className="w-3 h-3" /> Channel Performance
            </h3>
            {channels.slice(0, 5).map(ch => (
              <Card
                key={ch.channelId}
                className="bg-gray-900/50 border-white/10 hover:border-white/20 transition-all cursor-pointer"
                onClick={() => { setSelectedChannel(ch.channelId); setViewMode('channels'); }}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold">{formatNumber(ch.currentListeners)}</span>
                        <span className="text-[8px] text-gray-500">listeners</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{ch.channelName}</p>
                        <p className="text-[10px] text-gray-500 truncate">{ch.topContent}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className={`flex items-center gap-0.5 text-[10px] ${getTrendColor(ch.trend)}`}>
                        {getTrendIcon(ch.trend)}
                        {ch.trendPercent > 0 ? '+' : ''}{ch.trendPercent}%
                      </div>
                      <ChevronRight className="w-3 h-3 text-gray-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Channels Tab */}
        {viewMode === 'channels' && (
          <div className="space-y-3">
            {selectedChannel ? (
              // Channel Detail View
              (() => {
                const ch = channels.find(c => c.channelId === selectedChannel);
                if (!ch) return <p className="text-gray-400 text-sm">Channel not found</p>;
                return (
                  <div className="space-y-3">
                    <button
                      onClick={() => setSelectedChannel(null)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-3 h-3" /> Back to channels
                    </button>

                    <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h2 className="text-sm font-bold">{ch.channelName}</h2>
                            <p className="text-[10px] text-gray-400">{ch.topContent}</p>
                          </div>
                          <Badge className={`text-[10px] ${getChannelTypeColor(ch.contentType)}`}>
                            {ch.contentType}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center">
                            <p className="text-lg font-bold text-emerald-400">{formatNumber(ch.currentListeners)}</p>
                            <p className="text-[9px] text-gray-500">Current</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-cyan-400">{formatNumber(ch.peakListeners24h)}</p>
                            <p className="text-[9px] text-gray-500">24h Peak</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-purple-400">{ch.engagement}%</p>
                            <p className="text-[9px] text-gray-500">Engagement</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Hourly Listener Chart */}
                    <Card className="bg-gray-900/50 border-white/10">
                      <CardHeader className="pb-2 pt-3 px-4">
                        <CardTitle className="text-xs text-gray-400">24h Listener Activity</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        <HourlyChart data={ch.hourlyData} />
                        <div className="flex justify-between mt-4 text-[8px] text-gray-600">
                          <span>12AM</span>
                          <span>6AM</span>
                          <span>12PM</span>
                          <span>6PM</span>
                          <span>12AM</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Channel Stats */}
                    <Card className="bg-gray-900/50 border-white/10">
                      <CardHeader className="pb-2 pt-3 px-4">
                        <CardTitle className="text-xs text-gray-400">Detailed Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">Total Listeners (24h)</span>
                          <span className="font-medium">{formatNumber(ch.totalListeners24h)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">Avg Session Duration</span>
                          <span className="font-medium">{ch.avgSessionDuration}m</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">Trend</span>
                          <div className={`flex items-center gap-1 ${getTrendColor(ch.trend)}`}>
                            {getTrendIcon(ch.trend)}
                            <span className="font-medium">{ch.trendPercent > 0 ? '+' : ''}{ch.trendPercent}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">Engagement Score</span>
                          <div className="flex items-center gap-2">
                            <EngagementBar value={ch.engagement} max={100} color="bg-gradient-to-r from-emerald-500 to-cyan-500" />
                            <span className="font-medium w-8 text-right">{ch.engagement}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()
            ) : (
              // Channel List View
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-300">All Channels</h2>
                  <Badge variant="outline" className="text-[10px] border-white/20 text-gray-400">
                    {channels.length} total
                  </Badge>
                </div>

                {channels.map(ch => (
                  <Card
                    key={ch.channelId}
                    className="bg-gray-900/50 border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer"
                    onClick={() => setSelectedChannel(ch.channelId)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold truncate">{ch.channelName}</h3>
                            <Badge className={`text-[10px] ${getChannelTypeColor(ch.contentType)}`}>
                              {ch.contentType}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-gray-400 truncate">{ch.topContent}</p>
                        </div>
                        <div className={`flex items-center gap-0.5 text-xs ${getTrendColor(ch.trend)}`}>
                          {getTrendIcon(ch.trend)}
                          {ch.trendPercent > 0 ? '+' : ''}{ch.trendPercent}%
                        </div>
                      </div>

                      {/* Mini Chart */}
                      <div className="mb-3">
                        <HourlyChart data={ch.hourlyData} />
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="flex items-center gap-1 text-gray-400">
                          <Users className="w-3 h-3" />
                          {formatNumber(ch.currentListeners)} now
                        </span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <TrendingUp className="w-3 h-3" />
                          {formatNumber(ch.peakListeners24h)} peak
                        </span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <Activity className="w-3 h-3" />
                          {ch.engagement}% eng
                        </span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <Clock className="w-3 h-3" />
                          {ch.avgSessionDuration}m avg
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}

        {/* Engagement Live Feed Tab */}
        {viewMode === 'engagement' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-300">Live Engagement Feed</h2>
              <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] border-emerald-500/30 animate-pulse">
                <Eye className="w-3 h-3 mr-1" /> Real-time
              </Badge>
            </div>

            {/* Engagement Summary */}
            <Card className="bg-gray-900/50 border-white/10">
              <CardContent className="p-3">
                <div className="grid grid-cols-3 gap-2">
                  {(() => {
                    const tuneIns = engagement.filter(e => e.type === 'tune_in').length;
                    const likes = engagement.filter(e => e.type === 'like').length;
                    const shares = engagement.filter(e => e.type === 'share').length;
                    return (
                      <>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Radio className="w-3 h-3 text-emerald-400" />
                            <span className="text-lg font-bold text-emerald-400">{tuneIns}</span>
                          </div>
                          <p className="text-[9px] text-gray-500">Tune-ins</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Heart className="w-3 h-3 text-pink-400" />
                            <span className="text-lg font-bold text-pink-400">{likes}</span>
                          </div>
                          <p className="text-[9px] text-gray-500">Likes</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Share2 className="w-3 h-3 text-blue-400" />
                            <span className="text-lg font-bold text-blue-400">{shares}</span>
                          </div>
                          <p className="text-[9px] text-gray-500">Shares</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Event Feed */}
            <div className="space-y-1.5">
              {engagement.map(event => {
                const channel = channels.find(c => c.channelId === event.channelId);
                const timeAgo = Math.floor((Date.now() - event.timestamp) / 60000);
                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-900/50 border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium">{getEventLabel(event.type)}</span>
                        <Badge className={`text-[8px] ${getChannelTypeColor(channel?.contentType || 'radio')}`}>
                          {channel?.channelName || 'Unknown'}
                        </Badge>
                      </div>
                      {event.contentTitle && (
                        <p className="text-[10px] text-gray-500 truncate">{event.contentTitle}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-600 flex-shrink-0">
                      {timeAgo < 1 ? 'now' : timeAgo < 60 ? `${timeAgo}m` : `${Math.floor(timeAgo / 60)}h`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
