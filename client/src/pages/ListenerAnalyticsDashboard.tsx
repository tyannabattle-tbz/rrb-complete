import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import {
  Users, TrendingUp, Radio, Clock, Earth, Heart,
  RefreshCw, Headphones, BarChart3, Activity, Zap, Target
} from 'lucide-react';

export default function ListenerAnalyticsDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  // ─── Live Data ───────────────────────────────
  const realtimeStats = trpc.listenerAnalytics.getRealtimeStats.useQuery(
    undefined, { refetchInterval: 10000, queryKey: ['rtStats', refreshKey] }
  );
  const adPerformance = trpc.listenerAnalytics.getAdPerformance.useQuery(
    undefined, { refetchInterval: 30000, queryKey: ['adPerf', refreshKey] }
  );
  const hourlyTrends = trpc.listenerAnalytics.getHourlyTrends.useQuery(
    { hours: 24 }, { refetchInterval: 60000, queryKey: ['hourly', refreshKey] }
  );
  const channelHeatmap = trpc.listenerAnalytics.getChannelHeatmap.useQuery(
    undefined, { refetchInterval: 60000, queryKey: ['heatmap', refreshKey] }
  );
  const engagementScore = trpc.listenerAnalytics.getEngagementScores.useQuery(
    undefined, { refetchInterval: 60000, queryKey: ['engagement', refreshKey] }
  );

  const rt = realtimeStats.data;
  const ads = adPerformance.data;
  const trends = hourlyTrends.data;
  const heatmap = channelHeatmap.data;
  const engagement = engagementScore.data;

  const handleRefresh = () => setRefreshKey(k => k + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-blue-500/20 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BarChart3 className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Listener Analytics</h1>
                <p className="text-sm text-blue-300">
                  Real-time audience intelligence &bull; RRB Radio Network
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-green-500 text-green-400">
                <div className="w-2 h-2 rounded-full mr-2 bg-green-400" />
                LIVE
              </Badge>
              <Button onClick={handleRefresh} size="sm" variant="outline" className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20">
                <RefreshCw className={`w-4 h-4 mr-1 ${realtimeStats.isFetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Top Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: 'Events (1h)', value: rt?.hourlyEvents ?? 0, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Events (24h)', value: rt?.dailyEvents ?? 0, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { label: 'Unique Sessions', value: rt?.uniqueSessions ?? 0, icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            { label: 'Avg Duration', value: `${rt?.avgSessionDurationSeconds ?? 0}s`, icon: Clock, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Active Ads', value: ads?.activeAds ?? 0, icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Engagement', value: engagement ? `${engagement.score}/100` : '\u2014', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10' },
          ].map((m, i) => (
            <Card key={i} className={`${m.bg} border-slate-700/50`}>
              <CardContent className="p-3 text-center">
                <m.icon className={`w-5 h-5 mx-auto mb-1 ${m.color}`} />
                <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{m.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Engagement Score Breakdown */}
        {engagement && (
          <Card className="bg-slate-800/50 border-pink-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                Engagement Score: {engagement.score}/100
              </CardTitle>
              <CardDescription className="text-pink-300">
                Grade: {engagement.grade} &bull; {engagement.factors?.length ?? 0} contributing factors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-slate-700/50 rounded-full h-4 mb-4">
                <div
                  className={`h-4 rounded-full ${
                    engagement.score >= 80 ? 'bg-green-500' :
                    engagement.score >= 60 ? 'bg-blue-500' :
                    engagement.score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${engagement.score}%` }}
                />
              </div>
              {engagement.factors && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(engagement.factors as any[]).map((f: any, i: number) => (
                    <div key={i} className="p-2 rounded bg-slate-700/30 text-center">
                      <p className="text-lg font-bold text-pink-400">{f.value}</p>
                      <p className="text-xs text-gray-400">{f.name}</p>
                      <p className="text-xs text-gray-500">Weight: {f.weight}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Channels */}
          <Card className="bg-slate-800/50 border-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-blue-400" />
                Top Channels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rt?.topChannels && (rt.topChannels as any[]).length > 0 ? (
                  (rt.topChannels as any[]).map((ch: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-700/30">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                          CH {ch.channelId}
                        </Badge>
                        <span className="text-sm text-gray-300">{ch.eventCount} events</span>
                      </div>
                      <div className="w-24 bg-slate-700/50 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${Math.min(100, (ch.eventCount / Math.max(1, (rt.topChannels as any[])[0]?.eventCount ?? 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">No channel data yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Event Types */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Event Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rt?.topEventTypes && (rt.topEventTypes as any[]).length > 0 ? (
                  (rt.topEventTypes as any[]).map((et: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-700/30">
                      <Badge className="bg-purple-600 text-xs">{et.eventType}</Badge>
                      <span className="text-sm font-medium text-purple-400">{et.eventCount} events</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">No event type data yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hourly Trends */}
        <Card className="bg-slate-800/50 border-cyan-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              24-Hour Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trends && (trends as any[]).length > 0 ? (
              <div className="flex items-end gap-1 h-32">
                {(trends as any[]).map((t: any, i: number) => {
                  const maxEvents = Math.max(...(trends as any[]).map((x: any) => x.events || 0), 1);
                  const height = ((t.events || 0) / maxEvents) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${t.hour}: ${t.events} events`}>
                      <div
                        className="w-full bg-cyan-500/60 rounded-t"
                        style={{ height: `${Math.max(2, height)}%` }}
                      />
                      {i % 4 === 0 && (
                        <span className="text-xs text-gray-500">{t.hour}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No hourly trend data yet &mdash; events will appear as listeners interact</p>
            )}
          </CardContent>
        </Card>

        {/* Channel Heatmap */}
        <Card className="bg-slate-800/50 border-green-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Earth className="w-5 h-5 text-green-400" />
              Channel Activity Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            {heatmap && (heatmap as any[]).length > 0 ? (
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {(heatmap as any[]).map((cell: any, i: number) => {
                  const maxEvents = Math.max(...(heatmap as any[]).map((x: any) => x.totalEvents || 0), 1);
                  const intensity = (cell.totalEvents || 0) / maxEvents;
                  return (
                    <div
                      key={i}
                      className="p-2 rounded text-center"
                      style={{ backgroundColor: `rgba(34, 197, 94, ${0.1 + intensity * 0.7})` }}
                      title={`CH ${cell.channelId}: ${cell.totalEvents} events, ${cell.uniqueSessions} sessions`}
                    >
                      <p className="text-xs font-bold text-white">CH {cell.channelId}</p>
                      <p className="text-xs text-gray-300">{cell.totalEvents}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No heatmap data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Ad Performance */}
        <Card className="bg-slate-800/50 border-amber-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-400" />
              Ad Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3 rounded bg-slate-700/30 text-center">
                <p className="text-xl font-bold text-amber-400">{ads?.activeAds ?? 0}</p>
                <p className="text-xs text-gray-400">Active Ads</p>
              </div>
              <div className="p-3 rounded bg-slate-700/30 text-center">
                <p className="text-xl font-bold text-amber-400">{ads?.dailyImpressions ?? 0}</p>
                <p className="text-xs text-gray-400">Daily Impressions</p>
              </div>
              <div className="p-3 rounded bg-slate-700/30 text-center">
                <p className="text-xl font-bold text-green-400">{ads?.impressionRate ?? 0}%</p>
                <p className="text-xs text-gray-400">Impression Rate</p>
              </div>
              <div className="p-3 rounded bg-slate-700/30 text-center">
                <p className="text-xl font-bold text-green-400">{ads?.totalPlaysAllTime ?? 0}</p>
                <p className="text-xs text-gray-400">Total Plays</p>
              </div>
              <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20 text-center">
                <p className="text-xl font-bold text-amber-300">${((ads?.estimatedRevenueCents ?? 0) / 100).toFixed(2)}</p>
                <p className="text-xs text-amber-400">Est. Revenue</p>
              </div>
            </div>
            {ads?.topPerformers && (ads.topPerformers as any[]).length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2 font-medium">Top Performing Ads</p>
                <div className="space-y-2">
                  {(ads.topPerformers as any[]).slice(0, 5).map((ad: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-700/30">
                      <div>
                        <span className="text-sm text-white font-medium">{ad.sponsor}</span>
                        <span className="text-xs text-gray-400 ml-2">{ad.campaignName}</span>
                      </div>
                      <Badge className="bg-amber-600 text-xs">{ad.totalPlays} plays</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="border-t border-blue-500/20 bg-slate-900/50 mt-8 py-6">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="text-sm">Listener Analytics &bull; RRB Radio Network &bull; Powered by QUMUS</p>
        </div>
      </footer>
    </div>
  );
}
