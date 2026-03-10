import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { 
  Radio, Heart, Zap, Users, TrendingUp, Activity, 
  Settings, RefreshCw, AlertCircle, Wifi, Volume2,
  BarChart3, Bell, Shield, Globe, Clock, Headphones,
  Megaphone, Target, Layers, ChevronRight, Tv
} from 'lucide-react';

export default function EcosystemMasterDashboard() {
  const [, navigate] = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);

  // ─── Live Data Connections ───────────────────────────────
  const productionStatus = trpc.productionIntegration.getProductionStatus.useQuery(
    undefined, { refetchInterval: 30000, queryKey: ['prodStatus', refreshKey] }
  );
  const subsystemStatus = trpc.productionIntegration.getSubsystemStatus.useQuery(
    undefined, { refetchInterval: 30000, queryKey: ['subsys', refreshKey] }
  );
  const scheduleStats = trpc.contentScheduler.getStats.useQuery(
    undefined, { refetchInterval: 60000, queryKey: ['schedStats', refreshKey] }
  );
  const listenerStats = trpc.listenerAnalytics.getRealtimeStats.useQuery(
    undefined, { refetchInterval: 15000, queryKey: ['listenerStats', refreshKey] }
  );
  const adPerformance = trpc.listenerAnalytics.getAdPerformance.useQuery(
    undefined, { refetchInterval: 60000, queryKey: ['adPerf', refreshKey] }
  );
  const deliveryStats = trpc.teamUpdates.getDeliveryStats.useQuery(
    undefined, { refetchInterval: 60000, queryKey: ['delivStats', refreshKey] }
  );
  const nowPlaying = trpc.contentScheduler.getNowPlayingWithAds.useQuery(
    undefined, { refetchInterval: 15000, queryKey: ['nowPlaying', refreshKey] }
  );

  const ps = productionStatus.data;
  const ss = subsystemStatus.data;
  const sched = scheduleStats.data;
  const listeners = listenerStats.data;
  const ads = adPerformance.data;
  const delivery = deliveryStats.data;
  const np = nowPlaying.data;

  const handleRefresh = () => setRefreshKey(k => k + 1);
  const isLoading = productionStatus.isLoading;

  const healthyCount = ss ? Object.values(ss).filter((s: any) => s?.status === 'operational').length : 0;
  const totalSubs = ss ? Object.keys(ss).length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Activity className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Production Command Center</h1>
                <p className="text-sm text-purple-300">
                  QUMUS Autonomous Orchestration &bull; {ps?.autonomyLevel ?? 90}% Autonomous
                  {ps && <span className="ml-2 text-green-400">&bull; {ps.systemHealth}% Health</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={`${ps?.isOperational ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${ps?.isOperational ? 'bg-green-400' : 'bg-red-400'}`} />
                {ps?.isOperational ? 'OPERATIONAL' : isLoading ? 'CONNECTING...' : 'DEGRADED'}
              </Badge>
              <Button onClick={handleRefresh} size="sm" variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
                <RefreshCw className={`w-4 h-4 mr-1 ${productionStatus.isFetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Top Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: 'Subsystems', value: `${healthyCount}/${totalSubs}`, icon: Layers, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Active Channels', value: sched?.uniqueChannels ?? '\u2014', icon: Radio, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { label: 'Now Playing', value: np?.programming?.length ?? 0, icon: Volume2, color: 'text-pink-400', bg: 'bg-pink-500/10' },
            { label: 'Listeners (1h)', value: listeners?.hourlyEvents ?? 0, icon: Headphones, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Ad Impressions', value: ads?.dailyImpressions ?? 0, icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Active Ads', value: ads?.activeAds ?? 0, icon: Megaphone, color: 'text-orange-400', bg: 'bg-orange-500/10' },
            { label: 'Updates', value: delivery?.totalUpdates ?? 0, icon: Bell, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            { label: 'Webhooks', value: ps?.databaseMetrics?.activeWebhooks ?? 0, icon: Globe, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
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

        {/* Subsystem Health Grid */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  Subsystem Health Monitor
                </CardTitle>
                <CardDescription className="text-purple-300">Real-time status of all connected subsystems</CardDescription>
              </div>
              <Badge className="bg-purple-600">{healthyCount}/{totalSubs} Healthy</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {ss && Object.entries(ss).map(([key, val]: [string, any]) => (
                <div key={key} className="flex items-center gap-2 p-2 rounded bg-slate-700/30">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${val?.status === 'operational' ? 'bg-green-400' : val?.status === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'}`} />
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-xs text-gray-400">{val?.status ?? 'unknown'}</p>
                  </div>
                </div>
              ))}
              {!ss && Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-12 rounded bg-slate-700/20 animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Two Column: Now Playing + Schedule Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Now Playing */}
          <Card className="bg-slate-800/50 border-pink-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-pink-400" />
                Now Playing Across Channels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {np?.programming?.slice(0, 8).map((prog: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-700/30">
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge variant="outline" className="border-pink-500/30 text-pink-300 text-xs flex-shrink-0">
                        CH {prog.channelId}
                      </Badge>
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate font-medium">{prog.showName}</p>
                        <p className="text-xs text-gray-400 truncate">{prog.host || 'QUMUS Auto'}</p>
                      </div>
                    </div>
                    <Badge className={`text-xs flex-shrink-0 ${
                      prog.showType === 'music' ? 'bg-purple-600' :
                      prog.showType === 'healing' ? 'bg-green-600' :
                      prog.showType === 'talk' ? 'bg-blue-600' :
                      prog.showType === 'gospel' ? 'bg-amber-600' :
                      prog.showType === 'emergency' ? 'bg-red-600' : 'bg-slate-600'
                    }`}>{prog.showType}</Badge>
                  </div>
                ))}
                {(!np?.programming || np.programming.length === 0) && (
                  <p className="text-sm text-gray-400 text-center py-4">No active programming &mdash; seed the schedule first</p>
                )}
              </div>
              {np?.adPool && np.adPool.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <p className="text-xs text-amber-400 mb-2 font-medium">Ad Pool ({np.adPool.length} active)</p>
                  <div className="flex flex-wrap gap-1">
                    {np.adPool.map((ad: any) => (
                      <Badge key={ad.id} variant="outline" className="border-amber-500/30 text-amber-300 text-xs">
                        {ad.sponsor} ({ad.duration}s)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Schedule Stats */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                Content Schedule Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded bg-slate-700/30">
                  <p className="text-2xl font-bold text-purple-400">{sched?.totalEntries ?? 0}</p>
                  <p className="text-xs text-gray-400">Total Entries</p>
                </div>
                <div className="p-3 rounded bg-slate-700/30">
                  <p className="text-2xl font-bold text-green-400">{sched?.activeEntries ?? 0}</p>
                  <p className="text-xs text-gray-400">Active</p>
                </div>
                <div className="p-3 rounded bg-slate-700/30">
                  <p className="text-2xl font-bold text-pink-400">{sched?.uniqueChannels ?? 0}</p>
                  <p className="text-xs text-gray-400">Channels</p>
                </div>
                <div className="p-3 rounded bg-slate-700/30">
                  <p className="text-2xl font-bold text-cyan-400">{sched?.qumusManaged ?? 0}</p>
                  <p className="text-xs text-gray-400">QUMUS Managed</p>
                </div>
              </div>
              {sched?.byType && Object.keys(sched.byType).length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2 font-medium">Content by Type</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(sched.byType).map(([type, count]) => (
                      <Badge key={type} variant="outline" className="border-purple-500/30 text-purple-300 text-xs">
                        {type}: {count as number}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {sched?.hosts && (sched.hosts as string[]).length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-2 font-medium">Active Hosts</p>
                  <div className="flex flex-wrap gap-1">
                    {(sched.hosts as string[]).map((host: string) => (
                      <Badge key={host} className="bg-slate-700 text-xs">{host}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Listener & Ad Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Listener Analytics */}
          <Card className="bg-slate-800/50 border-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Headphones className="w-5 h-5 text-blue-400" />
                Listener Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 rounded bg-slate-700/30 text-center">
                  <p className="text-xl font-bold text-blue-400">{listeners?.hourlyEvents ?? 0}</p>
                  <p className="text-xs text-gray-400">Events (1h)</p>
                </div>
                <div className="p-2 rounded bg-slate-700/30 text-center">
                  <p className="text-xl font-bold text-blue-400">{listeners?.dailyEvents ?? 0}</p>
                  <p className="text-xs text-gray-400">Events (24h)</p>
                </div>
                <div className="p-2 rounded bg-slate-700/30 text-center">
                  <p className="text-xl font-bold text-cyan-400">{listeners?.uniqueSessions ?? 0}</p>
                  <p className="text-xs text-gray-400">Unique Sessions</p>
                </div>
                <div className="p-2 rounded bg-slate-700/30 text-center">
                  <p className="text-xl font-bold text-cyan-400">{listeners?.avgSessionDurationSeconds ?? 0}s</p>
                  <p className="text-xs text-gray-400">Avg Duration</p>
                </div>
              </div>
              {listeners?.topChannels && (listeners.topChannels as any[]).length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1 font-medium">Top Channels</p>
                  {(listeners.topChannels as any[]).slice(0, 3).map((ch: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm py-1">
                      <span className="text-gray-300">Channel {ch.channelId}</span>
                      <span className="text-blue-400 font-medium">{ch.eventCount} events</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ad Performance */}
          <Card className="bg-slate-800/50 border-amber-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                Ad Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 rounded bg-slate-700/30 text-center">
                  <p className="text-xl font-bold text-amber-400">{ads?.dailyImpressions ?? 0}</p>
                  <p className="text-xs text-gray-400">Daily Impressions</p>
                </div>
                <div className="p-2 rounded bg-slate-700/30 text-center">
                  <p className="text-xl font-bold text-amber-400">{ads?.activeAds ?? 0}</p>
                  <p className="text-xs text-gray-400">Active Ads</p>
                </div>
                <div className="p-2 rounded bg-slate-700/30 text-center">
                  <p className="text-xl font-bold text-green-400">{ads?.impressionRate ?? 0}%</p>
                  <p className="text-xs text-gray-400">Impression Rate</p>
                </div>
                <div className="p-2 rounded bg-slate-700/30 text-center">
                  <p className="text-xl font-bold text-green-400">{ads?.totalPlaysAllTime ?? 0}</p>
                  <p className="text-xs text-gray-400">Total Plays</p>
                </div>
              </div>
              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-300">
                  Est. Revenue: ${((ads?.estimatedRevenueCents ?? 0) / 100).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Team Updates */}
          <Card className="bg-slate-800/50 border-cyan-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-cyan-400" />
                Team Update Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 rounded bg-slate-700/30 text-center">
                  <p className="text-xl font-bold text-cyan-400">{delivery?.totalUpdates ?? 0}</p>
                  <p className="text-xs text-gray-400">Total Updates</p>
                </div>
                <div className="p-2 rounded bg-slate-700/30 text-center">
                  <p className="text-xl font-bold text-cyan-400">{delivery?.totalNotifications ?? 0}</p>
                  <p className="text-xs text-gray-400">Notifications</p>
                </div>
                <div className="p-2 rounded bg-slate-700/30 text-center">
                  <p className="text-xl font-bold text-green-400">{delivery?.deliveredRate ?? 0}%</p>
                  <p className="text-xs text-gray-400">Delivered</p>
                </div>
                <div className="p-2 rounded bg-slate-700/30 text-center">
                  <p className="text-xl font-bold text-green-400">{delivery?.appliedRate ?? 0}%</p>
                  <p className="text-xs text-gray-400">Applied</p>
                </div>
              </div>
              {delivery?.recentUpdates && (delivery.recentUpdates as any[]).length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1 font-medium">Recent Updates</p>
                  {(delivery.recentUpdates as any[]).slice(0, 3).map((u: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm py-1">
                      <span className="text-gray-300 truncate mr-2">{u.title}</span>
                      <Badge className={`text-xs flex-shrink-0 ${
                        u.severity === 'critical' ? 'bg-red-600' :
                        u.severity === 'major' ? 'bg-amber-600' : 'bg-slate-600'
                      }`}>{u.severity}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Navigation Grid */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white">Quick Navigation &mdash; All Systems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { label: 'QUMUS Dashboard', path: '/qumus', icon: Zap, color: 'bg-purple-600 hover:bg-purple-700' },
                { label: 'RRB Broadcast', path: '/rrb/broadcast-manager', icon: Radio, color: 'bg-pink-600 hover:bg-pink-700' },
                { label: 'Content Scheduler', path: '/rrb-radio', icon: Clock, color: 'bg-indigo-600 hover:bg-indigo-700' },
                { label: 'Listener Analytics', path: '/listener-analytics', icon: BarChart3, color: 'bg-blue-600 hover:bg-blue-700' },
                { label: 'Ad Rotation', path: '/rrb/broadcast', icon: Target, color: 'bg-amber-600 hover:bg-amber-700' },
                { label: 'Webhook Manager', path: '/webhook-manager', icon: Globe, color: 'bg-teal-600 hover:bg-teal-700' },
                { label: 'Team Updates', path: '/rrb-team-updates', icon: Bell, color: 'bg-cyan-600 hover:bg-cyan-700' },
                { label: 'Emergency Broadcast', path: '/hybridcast', icon: AlertCircle, color: 'bg-red-600 hover:bg-red-700' },
                { label: 'Sweet Miracles', path: '/sweet-miracles', icon: Heart, color: 'bg-green-600 hover:bg-green-700' },
                { label: 'QUMUS Chat', path: '/qumus-chat', icon: Users, color: 'bg-violet-600 hover:bg-violet-700' },
                { label: 'Production Status', path: '/production', icon: Activity, color: 'bg-slate-600 hover:bg-slate-700' },
                { label: 'Conference Hub', path: '/conference', icon: Globe, color: 'bg-amber-600 hover:bg-amber-700' },
                { label: 'Restream Studio', path: 'https://studio.restream.io/enk-osex-pju', icon: Tv, color: 'bg-purple-600 hover:bg-purple-700' },
                { label: 'Convention Hub', path: '/convention-hub', icon: Users, color: 'bg-indigo-600 hover:bg-indigo-700' },
                { label: 'SQUADD Goals', path: '/squadd', icon: Shield, color: 'bg-yellow-600 hover:bg-yellow-700' },
                { label: 'Admin Panel', path: '/admin', icon: Settings, color: 'bg-gray-600 hover:bg-gray-700' },
              ].map((item, i) => (
                <Button
                  key={i}
                  onClick={() => item.path.startsWith('http') ? window.open(item.path, '_blank') : navigate(item.path)}
                  className={`${item.color} justify-between h-auto py-3 px-4`}
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* QUMUS Engine Status */}
        {ps && (
          <Card className="bg-slate-800/50 border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-400" />
                QUMUS Engine Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="p-3 rounded bg-slate-700/30 text-center">
                  <p className="text-xl font-bold text-green-400">{ps.activePolicies}</p>
                  <p className="text-xs text-gray-400">Active Policies</p>
                </div>
                <div className="p-3 rounded bg-slate-700/30 text-center">
                  <p className="text-xl font-bold text-green-400">{ps.autonomyLevel}%</p>
                  <p className="text-xs text-gray-400">Autonomy Level</p>
                </div>
                <div className="p-3 rounded bg-slate-700/30 text-center">
                  <p className="text-xl font-bold text-green-400">{ps.systemHealth}%</p>
                  <p className="text-xs text-gray-400">System Health</p>
                </div>
                <div className="p-3 rounded bg-slate-700/30 text-center">
                  <p className="text-xl font-bold text-purple-400">{ps.databaseMetrics?.activeAds ?? 0}</p>
                  <p className="text-xs text-gray-400">Active Ads</p>
                </div>
                <div className="p-3 rounded bg-slate-700/30 text-center">
                  <p className="text-xl font-bold text-blue-400">{ps.databaseMetrics?.uniqueListeners ?? 0}</p>
                  <p className="text-xs text-gray-400">Recent Listeners</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 mt-8 py-6">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="mb-1">Production Command Center &bull; Canryn Production &amp; Subsidiaries</p>
          <p className="text-sm">Powered by QUMUS Autonomous Orchestration &bull; Supporting Sweet Miracles 501(c)(3)</p>
          <p className="text-xs mt-1 text-gray-500">Last refresh: {np?.timestamp ? new Date(np.timestamp).toLocaleString() : 'N/A'}</p>
        </div>
      </footer>
    </div>
  );
}
