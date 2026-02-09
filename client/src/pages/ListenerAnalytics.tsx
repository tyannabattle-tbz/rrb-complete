import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import {
  Users, Activity, TrendingUp, TrendingDown, Minus,
  Radio, BarChart3, Clock, Zap, Eye,
  Heart, Share2, Bookmark, SkipForward, RefreshCw,
  ArrowLeft, Headphones, Signal, ChevronRight,
  MapPin, DollarSign, Lightbulb, Globe,
} from 'lucide-react';
import { toast } from 'sonner';

type ViewMode = 'overview' | 'channels' | 'heatmap' | 'recommend' | 'revenue' | 'engagement';

export default function ListenerAnalytics() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const overviewQuery = trpc.listenerAnalytics.getPlatformOverview.useQuery(undefined, { refetchInterval: 15000 });
  const channelsQuery = trpc.listenerAnalytics.getChannelAnalytics.useQuery(undefined, { refetchInterval: 15000 });
  const engagementQuery = trpc.listenerAnalytics.getRecentEngagement.useQuery(30, { refetchInterval: 10000 });
  const regionQuery = trpc.listenerAnalytics.getRegionData.useQuery(undefined, { refetchInterval: 30000 });
  const stateQuery = trpc.listenerAnalytics.getRegionsByState.useQuery(undefined, { refetchInterval: 30000 });
  const recommendQuery = trpc.listenerAnalytics.getScheduleRecommendations.useQuery(undefined, { refetchInterval: 60000 });
  const revenueQuery = trpc.listenerAnalytics.getRevenueMetrics.useQuery(undefined, { refetchInterval: 30000 });

  const overview = overviewQuery.data;
  const channels = channelsQuery.data || [];
  const engagement = engagementQuery.data || [];
  const regions = regionQuery.data || [];
  const states = stateQuery.data || [];
  const recommendations = recommendQuery.data || [];
  const revenue = revenueQuery.data;

  const fmt = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toLocaleString();
  };
  const fmtUsd = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtDur = (ms: number) => { const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000); return `${h}h ${m}m`; };

  const trendIcon = (t: string) => t === 'up' ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : t === 'down' ? <TrendingDown className="w-3 h-3 text-red-400" /> : <Minus className="w-3 h-3 text-gray-400" />;
  const trendClr = (t: string) => t === 'up' ? 'text-emerald-400' : t === 'down' ? 'text-red-400' : 'text-gray-400';
  const evtIcon = (t: string) => {
    const m: Record<string, React.ReactNode> = { tune_in: <Radio className="w-3 h-3 text-emerald-400" />, tune_out: <Radio className="w-3 h-3 text-red-400" />, skip: <SkipForward className="w-3 h-3 text-amber-400" />, like: <Heart className="w-3 h-3 text-pink-400" />, share: <Share2 className="w-3 h-3 text-blue-400" />, save: <Bookmark className="w-3 h-3 text-purple-400" /> };
    return m[t] || <Activity className="w-3 h-3 text-gray-400" />;
  };
  const evtLabel = (t: string) => ({ tune_in: 'Tuned In', tune_out: 'Tuned Out', skip: 'Skipped', like: 'Liked', share: 'Shared', save: 'Saved' }[t] || t);
  const chTypeClr = (t: string) => ({ radio: 'bg-blue-500/20 text-blue-400', podcast: 'bg-purple-500/20 text-purple-400', streaming: 'bg-cyan-500/20 text-cyan-400', emergency: 'bg-red-500/20 text-red-400' }[t] || 'bg-gray-500/20 text-gray-400');

  const HourlyChart = ({ data }: { data: { hour: number; listeners: number }[] }) => {
    const max = Math.max(...data.map(d => d.listeners), 1);
    const cur = new Date().getHours();
    return (
      <div className="flex items-end gap-[2px] h-16" role="img" aria-label="Hourly listener chart">
        {data.map(d => (
          <div key={d.hour} className="flex-1 relative group" title={`${d.hour}:00 - ${fmt(d.listeners)}`}>
            <div className={`w-full rounded-t-sm transition-all ${d.hour === cur ? 'bg-cyan-400' : 'bg-cyan-500/40 group-hover:bg-cyan-500/60'}`} style={{ height: `${Math.max(2, (d.listeners / max) * 100)}%` }} />
            {d.hour % 6 === 0 && <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[8px] text-gray-600">{d.hour}</span>}
          </div>
        ))}
      </div>
    );
  };

  const Bar = ({ value, max, color }: { value: number; max: number; color: string }) => (
    <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex-1">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  );

  const views: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'channels', label: 'Channels', icon: <Radio className="w-3.5 h-3.5" /> },
    { id: 'heatmap', label: 'Heatmap', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'recommend', label: 'AI Recs', icon: <Lightbulb className="w-3.5 h-3.5" /> },
    { id: 'revenue', label: 'Revenue', icon: <DollarSign className="w-3.5 h-3.5" /> },
    { id: 'engagement', label: 'Live', icon: <Activity className="w-3.5 h-3.5" /> },
  ];

  const refreshAll = () => {
    overviewQuery.refetch(); channelsQuery.refetch(); engagementQuery.refetch();
    regionQuery.refetch(); stateQuery.refetch(); recommendQuery.refetch(); revenueQuery.refetch();
    toast.success('Analytics refreshed');
  };

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
              <Button size="sm" variant="outline" className="h-7 text-xs border-white/20" onClick={refreshAll}>
                <RefreshCw className="w-3 h-3 mr-1" /> Refresh
              </Button>
            </div>
          </div>
        </div>
        {/* Scrollable Tab Navigation */}
        <div className="flex overflow-x-auto border-t border-white/5 no-scrollbar">
          {views.map(v => (
            <button key={v.id} onClick={() => { setViewMode(v.id); setSelectedChannel(null); }}
              className={`flex items-center justify-center gap-1 px-3 py-2.5 text-[11px] font-medium whitespace-nowrap transition-all ${viewMode === v.id ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5' : 'text-gray-500 hover:text-gray-300'}`}>
              {v.icon} {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4 pb-24">

        {/* ===== OVERVIEW TAB ===== */}
        {viewMode === 'overview' && overview && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Headphones className="w-4 h-4 text-emerald-400" />, label: 'Active Listeners', value: fmt(overview.totalActiveListeners), sub: `across ${overview.activeChannels} channels`, grad: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20', clr: 'text-emerald-400' },
                { icon: <TrendingUp className="w-4 h-4 text-cyan-400" />, label: '24h Peak', value: fmt(overview.peakListeners24h), sub: 'highest concurrent', grad: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20', clr: 'text-cyan-400' },
                { icon: <Activity className="w-4 h-4 text-purple-400" />, label: 'Engagement', value: `${overview.avgEngagement}%`, sub: 'avg interaction rate', grad: 'from-purple-500/10 to-purple-500/5 border-purple-500/20', clr: 'text-purple-400' },
                { icon: <Clock className="w-4 h-4 text-amber-400" />, label: 'Avg Session', value: `${overview.avgSessionDuration}m`, sub: 'per listener', grad: 'from-amber-500/10 to-amber-500/5 border-amber-500/20', clr: 'text-amber-400' },
              ].map((m, i) => (
                <Card key={i} className={`bg-gradient-to-br ${m.grad}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">{m.icon}<span className="text-[10px] text-gray-400">{m.label}</span></div>
                    <p className={`text-xl font-bold ${m.clr}`}>{m.value}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{m.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1">Top Performing Channel</p>
                    <p className="text-sm font-bold">{overview.topChannel}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{fmt(overview.topChannelListeners)} active listeners</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center">
                    <Radio className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-white/10">
              <CardHeader className="pb-2 pt-3 px-4"><CardTitle className="text-xs text-gray-400 flex items-center gap-1"><Zap className="w-3 h-3 text-cyan-400" /> Platform Status</CardTitle></CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {[
                  ['Total Sessions Today', fmt(overview.totalSessionsToday)],
                  ['Total Channels', String(overview.totalChannels)],
                  ['Platform Uptime', fmtDur(overview.platformUptime)],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between items-center text-xs"><span className="text-gray-400">{l}</span><span className="font-medium">{v}</span></div>
                ))}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">QUMUS Autonomy</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full" style={{ width: `${overview.autonomyLevel}%` }} /></div>
                    <span className="font-medium">{overview.autonomyLevel}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h3 className="text-xs font-medium text-gray-500 flex items-center gap-1"><Radio className="w-3 h-3" /> Channel Performance</h3>
            {channels.slice(0, 5).map(ch => (
              <Card key={ch.channelId} className="bg-gray-900/50 border-white/10 hover:border-white/20 transition-all cursor-pointer" onClick={() => { setSelectedChannel(ch.channelId); setViewMode('channels'); }}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex flex-col items-center"><span className="text-sm font-bold">{fmt(ch.currentListeners)}</span><span className="text-[8px] text-gray-500">listeners</span></div>
                      <div className="min-w-0"><p className="text-xs font-medium truncate">{ch.channelName}</p><p className="text-[10px] text-gray-500 truncate">{ch.topContent}</p></div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className={`flex items-center gap-0.5 text-[10px] ${trendClr(ch.trend)}`}>{trendIcon(ch.trend)}{ch.trendPercent > 0 ? '+' : ''}{ch.trendPercent}%</div>
                      <ChevronRight className="w-3 h-3 text-gray-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ===== CHANNELS TAB ===== */}
        {viewMode === 'channels' && (
          <div className="space-y-3">
            {selectedChannel ? (() => {
              const ch = channels.find(c => c.channelId === selectedChannel);
              if (!ch) return <p className="text-gray-400 text-sm">Channel not found</p>;
              return (
                <div className="space-y-3">
                  <button onClick={() => setSelectedChannel(null)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"><ArrowLeft className="w-3 h-3" /> Back</button>
                  <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3"><div><h2 className="text-sm font-bold">{ch.channelName}</h2><p className="text-[10px] text-gray-400">{ch.topContent}</p></div><Badge className={`text-[10px] ${chTypeClr(ch.contentType)}`}>{ch.contentType}</Badge></div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center"><p className="text-lg font-bold text-emerald-400">{fmt(ch.currentListeners)}</p><p className="text-[9px] text-gray-500">Current</p></div>
                        <div className="text-center"><p className="text-lg font-bold text-cyan-400">{fmt(ch.peakListeners24h)}</p><p className="text-[9px] text-gray-500">24h Peak</p></div>
                        <div className="text-center"><p className="text-lg font-bold text-purple-400">{ch.engagement}%</p><p className="text-[9px] text-gray-500">Engagement</p></div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900/50 border-white/10"><CardHeader className="pb-2 pt-3 px-4"><CardTitle className="text-xs text-gray-400">24h Listener Activity</CardTitle></CardHeader><CardContent className="px-4 pb-4"><HourlyChart data={ch.hourlyData} /><div className="flex justify-between mt-4 text-[8px] text-gray-600"><span>12AM</span><span>6AM</span><span>12PM</span><span>6PM</span><span>12AM</span></div></CardContent></Card>
                  <Card className="bg-gray-900/50 border-white/10"><CardHeader className="pb-2 pt-3 px-4"><CardTitle className="text-xs text-gray-400">Detailed Metrics</CardTitle></CardHeader>
                    <CardContent className="px-4 pb-4 space-y-2">
                      {[['Total Listeners (24h)', fmt(ch.totalListeners24h)], ['Avg Session Duration', `${ch.avgSessionDuration}m`]].map(([l, v]) => (<div key={l} className="flex justify-between items-center text-xs"><span className="text-gray-400">{l}</span><span className="font-medium">{v}</span></div>))}
                      <div className="flex justify-between items-center text-xs"><span className="text-gray-400">Trend</span><div className={`flex items-center gap-1 ${trendClr(ch.trend)}`}>{trendIcon(ch.trend)}<span className="font-medium">{ch.trendPercent > 0 ? '+' : ''}{ch.trendPercent}%</span></div></div>
                      <div className="flex justify-between items-center text-xs"><span className="text-gray-400">Engagement Score</span><div className="flex items-center gap-2"><Bar value={ch.engagement} max={100} color="bg-gradient-to-r from-emerald-500 to-cyan-500" /><span className="font-medium w-8 text-right">{ch.engagement}%</span></div></div>
                    </CardContent>
                  </Card>
                </div>
              );
            })() : (
              <>
                <div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-gray-300">All Channels</h2><Badge variant="outline" className="text-[10px] border-white/20 text-gray-400">{channels.length} total</Badge></div>
                {channels.map(ch => (
                  <Card key={ch.channelId} className="bg-gray-900/50 border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer" onClick={() => setSelectedChannel(ch.channelId)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0"><div className="flex items-center gap-2 mb-1"><h3 className="text-sm font-semibold truncate">{ch.channelName}</h3><Badge className={`text-[10px] ${chTypeClr(ch.contentType)}`}>{ch.contentType}</Badge></div><p className="text-[10px] text-gray-400 truncate">{ch.topContent}</p></div>
                        <div className={`flex items-center gap-0.5 text-xs ${trendClr(ch.trend)}`}>{trendIcon(ch.trend)}{ch.trendPercent > 0 ? '+' : ''}{ch.trendPercent}%</div>
                      </div>
                      <div className="mb-3"><HourlyChart data={ch.hourlyData} /></div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="flex items-center gap-1 text-gray-400"><Users className="w-3 h-3" />{fmt(ch.currentListeners)} now</span>
                        <span className="flex items-center gap-1 text-gray-400"><TrendingUp className="w-3 h-3" />{fmt(ch.peakListeners24h)} peak</span>
                        <span className="flex items-center gap-1 text-gray-400"><Activity className="w-3 h-3" />{ch.engagement}% eng</span>
                        <span className="flex items-center gap-1 text-gray-400"><Clock className="w-3 h-3" />{ch.avgSessionDuration}m</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}

        {/* ===== HEATMAP TAB ===== */}
        {viewMode === 'heatmap' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-300">Geographic Distribution</h2>
              <Badge className="bg-blue-500/20 text-blue-400 text-[10px] border-blue-500/30"><Globe className="w-3 h-3 mr-1" /> 20 Regions</Badge>
            </div>

            {/* US Map Visualization - Bubble overlay */}
            <Card className="bg-gray-900/50 border-white/10 overflow-hidden">
              <CardContent className="p-0 relative">
                <div className="w-full h-64 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden" role="img" aria-label="Geographic listener heatmap showing US metro areas">
                  {/* US outline approximation */}
                  <div className="absolute inset-4 border border-white/5 rounded-lg" />
                  {/* Region bubbles positioned on approximate US map coordinates */}
                  {regions.map(r => {
                    const maxL = Math.max(...regions.map(rr => rr.listeners));
                    const size = Math.max(12, Math.min(48, (r.listeners / maxL) * 48));
                    // Map lat/lng to percentage positions within the container
                    const x = ((r.lng + 125) / 60) * 100; // -125 to -65 → 0% to 100%
                    const y = ((50 - r.lat) / 28) * 100;  // 50 to 22 → 0% to 100%
                    const intensity = r.engagement / 100;
                    return (
                      <div key={r.id} className="absolute group" style={{ left: `${Math.min(95, Math.max(5, x))}%`, top: `${Math.min(90, Math.max(5, y))}%`, transform: 'translate(-50%, -50%)' }}>
                        <div
                          className="rounded-full transition-all duration-300 group-hover:scale-125 cursor-pointer"
                          style={{
                            width: `${size}px`, height: `${size}px`,
                            background: `radial-gradient(circle, rgba(16, 185, 129, ${0.4 + intensity * 0.5}) 0%, rgba(6, 182, 212, ${0.2 + intensity * 0.3}) 70%, transparent 100%)`,
                            boxShadow: `0 0 ${size / 2}px rgba(16, 185, 129, ${0.3 + intensity * 0.3})`,
                          }}
                        />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                          <div className="bg-gray-800 border border-white/20 rounded-lg px-2 py-1.5 text-[10px] whitespace-nowrap shadow-xl">
                            <p className="font-bold text-white">{r.name}</p>
                            <p className="text-emerald-400">{fmt(r.listeners)} listeners</p>
                            <p className="text-gray-400">{r.engagement}% engagement</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Legend */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-2 text-[8px] text-gray-500">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500/30" />Low</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500/60" />Med</div>
                    <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-emerald-500/90" />High</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* State Aggregation */}
            <h3 className="text-xs font-medium text-gray-500">Top States by Listeners</h3>
            {states.slice(0, 8).map((s, i) => {
              const maxState = states[0]?.totalListeners || 1;
              return (
                <div key={s.state} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-900/50 border border-white/5">
                  <span className="text-xs font-bold text-gray-500 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{s.state}</span>
                      <span className="text-xs text-emerald-400 font-bold">{fmt(s.totalListeners)}</span>
                    </div>
                    <Bar value={s.totalListeners} max={maxState} color="bg-gradient-to-r from-emerald-500 to-cyan-500" />
                    <div className="flex justify-between mt-1 text-[9px] text-gray-500">
                      <span>{s.regions} metro area{s.regions > 1 ? 's' : ''}</span>
                      <span>{s.avgEngagement}% engagement</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Region Detail List */}
            <h3 className="text-xs font-medium text-gray-500 mt-2">All Metro Areas</h3>
            {regions.sort((a, b) => b.listeners - a.listeners).map(r => (
              <Card key={r.id} className="bg-gray-900/50 border-white/10">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span className="text-xs font-semibold">{r.name}</span>
                      <Badge variant="outline" className="text-[8px] border-white/10 text-gray-500">{r.state}</Badge>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">{fmt(r.listeners)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1">
                    <span>Peak: {fmt(r.peakListeners)}</span>
                    <span>Eng: {r.engagement}%</span>
                    <span>Avg: {r.avgSessionMin}m</span>
                    <span className="text-amber-400">{fmtUsd(r.revenueUsd)}</span>
                  </div>
                  <p className="text-[9px] text-gray-600 mt-1">Top: {r.topChannel}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ===== RECOMMENDATIONS TAB ===== */}
        {viewMode === 'recommend' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-300">AI Schedule Recommendations</h2>
              <Badge className="bg-amber-500/20 text-amber-400 text-[10px] border-amber-500/30"><Lightbulb className="w-3 h-3 mr-1" /> QUMUS AI</Badge>
            </div>

            <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
              <CardContent className="p-4">
                <p className="text-xs text-gray-300">QUMUS analyzes 24h listener patterns, engagement trends, and content performance to recommend optimal scheduling slots for each channel.</p>
                <p className="text-[10px] text-gray-500 mt-2">{recommendations.length} recommendations generated</p>
              </CardContent>
            </Card>

            {recommendations.map((rec, i) => (
              <Card key={i} className="bg-gray-900/50 border-white/10 hover:border-amber-500/20 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Lightbulb className="w-3 h-3 text-amber-400" />
                        <span className="text-xs font-bold">{rec.channelName}</span>
                      </div>
                      <Badge className="bg-cyan-500/20 text-cyan-400 text-[10px]">{rec.suggestedSlot}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">+{rec.predictedLift}%</p>
                      <p className="text-[9px] text-gray-500">predicted lift</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 mb-2">{rec.reason}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500">Confidence:</span>
                      <div className="w-16">
                        <Bar value={rec.confidence} max={100} color={rec.confidence > 80 ? 'bg-emerald-500' : rec.confidence > 60 ? 'bg-amber-500' : 'bg-red-500'} />
                      </div>
                      <span className="text-[10px] font-medium">{rec.confidence}%</span>
                    </div>
                    <span className="text-[9px] text-gray-600">{rec.basedOn}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ===== REVENUE TAB ===== */}
        {viewMode === 'revenue' && revenue && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-300">Revenue Analytics</h2>
              <Badge className="bg-green-500/20 text-green-400 text-[10px] border-green-500/30"><DollarSign className="w-3 h-3 mr-1" /> Live</Badge>
            </div>

            {/* Revenue Summary */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1"><DollarSign className="w-4 h-4 text-green-400" /><span className="text-[10px] text-gray-400">Total Revenue</span></div>
                  <p className="text-xl font-bold text-green-400">{fmtUsd(revenue.totalRevenue)}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">all channels combined</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1"><Activity className="w-4 h-4 text-blue-400" /><span className="text-[10px] text-gray-400">Monthly Recurring</span></div>
                  <p className="text-xl font-bold text-blue-400">{fmtUsd(revenue.monthlyRecurring)}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">subscriptions</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1"><Heart className="w-4 h-4 text-purple-400" /><span className="text-[10px] text-gray-400">One-time Donations</span></div>
                  <p className="text-xl font-bold text-purple-400">{fmtUsd(revenue.oneTimeDonations)}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">community support</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1"><Users className="w-4 h-4 text-amber-400" /><span className="text-[10px] text-gray-400">Rev/Listener</span></div>
                  <p className="text-xl font-bold text-amber-400">{fmtUsd(revenue.avgRevenuePerListener)}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">average RPL</p>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Trend */}
            <Card className="bg-gray-900/50 border-white/10">
              <CardHeader className="pb-2 pt-3 px-4"><CardTitle className="text-xs text-gray-400">Monthly Revenue Trend</CardTitle></CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex items-end gap-2 h-24">
                  {revenue.monthlyTrend.map((m, i) => {
                    const maxRev = Math.max(...revenue.monthlyTrend.map(mm => mm.revenue));
                    const h = Math.max(4, (m.revenue / maxRev) * 100);
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center group">
                        <div className="text-[8px] text-gray-500 mb-1 hidden group-hover:block">{fmtUsd(m.revenue)}</div>
                        <div className="w-full rounded-t-sm bg-gradient-to-t from-green-500/40 to-green-500/70 group-hover:from-green-500/60 group-hover:to-green-500/90 transition-all" style={{ height: `${h}%` }} />
                        <span className="text-[9px] text-gray-500 mt-1">{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Tier */}
            <Card className="bg-gray-900/50 border-white/10">
              <CardHeader className="pb-2 pt-3 px-4"><CardTitle className="text-xs text-gray-400">Revenue by Tier</CardTitle></CardHeader>
              <CardContent className="px-4 pb-4 space-y-2.5">
                {revenue.revenueByTier.map(t => {
                  const maxTier = Math.max(...revenue.revenueByTier.map(tt => tt.revenue));
                  const colors: Record<string, string> = { Platinum: 'bg-gradient-to-r from-gray-300 to-gray-400', Gold: 'bg-gradient-to-r from-amber-400 to-yellow-500', Silver: 'bg-gradient-to-r from-gray-400 to-gray-500', Bronze: 'bg-gradient-to-r from-orange-600 to-orange-700' };
                  return (
                    <div key={t.tier}>
                      <div className="flex justify-between text-xs mb-1"><span className="font-medium">{t.tier} <span className="text-gray-500 font-normal">({t.count} members)</span></span><span className="text-green-400 font-bold">{fmtUsd(t.revenue)}</span></div>
                      <Bar value={t.revenue} max={maxTier} color={colors[t.tier] || 'bg-gray-500'} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Revenue by Channel */}
            <h3 className="text-xs font-medium text-gray-500">Revenue by Channel</h3>
            {revenue.revenueByChannel.map(ch => (
              <div key={ch.channelId} className="flex items-center gap-3 p-3 rounded-lg bg-gray-900/50 border border-white/5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium truncate">{ch.channelName}</span>
                    <span className="text-xs font-bold text-green-400">{fmtUsd(ch.revenue)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span>{fmt(ch.listeners)} listeners</span>
                    <span>RPL: {fmtUsd(ch.rpl)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== LIVE ENGAGEMENT TAB ===== */}
        {viewMode === 'engagement' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-300">Live Engagement Feed</h2>
              <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] border-emerald-500/30 animate-pulse"><Eye className="w-3 h-3 mr-1" /> Real-time</Badge>
            </div>
            <Card className="bg-gray-900/50 border-white/10">
              <CardContent className="p-3">
                <div className="grid grid-cols-3 gap-2">
                  {(() => {
                    const ti = engagement.filter(e => e.type === 'tune_in').length;
                    const lk = engagement.filter(e => e.type === 'like').length;
                    const sh = engagement.filter(e => e.type === 'share').length;
                    return [
                      { icon: <Radio className="w-3 h-3 text-emerald-400" />, val: ti, clr: 'text-emerald-400', lbl: 'Tune-ins' },
                      { icon: <Heart className="w-3 h-3 text-pink-400" />, val: lk, clr: 'text-pink-400', lbl: 'Likes' },
                      { icon: <Share2 className="w-3 h-3 text-blue-400" />, val: sh, clr: 'text-blue-400', lbl: 'Shares' },
                    ].map(s => (
                      <div key={s.lbl} className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">{s.icon}<span className={`text-lg font-bold ${s.clr}`}>{s.val}</span></div>
                        <p className="text-[9px] text-gray-500">{s.lbl}</p>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>
            <div className="space-y-1.5">
              {engagement.map(event => {
                const ch = channels.find(c => c.channelId === event.channelId);
                const ago = Math.floor((Date.now() - event.timestamp) / 60000);
                return (
                  <div key={event.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-900/50 border border-white/5 hover:border-white/10 transition-all">
                    <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">{evtIcon(event.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5"><span className="text-xs font-medium">{evtLabel(event.type)}</span><Badge className={`text-[8px] ${chTypeClr(ch?.contentType || 'radio')}`}>{ch?.channelName || 'Unknown'}</Badge></div>
                      {event.contentTitle && <p className="text-[10px] text-gray-500 truncate">{event.contentTitle}</p>}
                    </div>
                    <span className="text-[10px] text-gray-600 flex-shrink-0">{ago < 1 ? 'now' : ago < 60 ? `${ago}m` : `${Math.floor(ago / 60)}h`}</span>
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
