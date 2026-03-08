import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Radio, Play, Square, Clock, Volume2, RefreshCw,
  Zap, Target, Users, Activity, Settings, AlertCircle
} from "lucide-react";

export default function RRBBroadcastManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  // ─── Live Data ───────────────────────────────
  const nowPlaying = trpc.contentScheduler.getNowPlayingWithAds.useQuery(
    undefined, { refetchInterval: 10000, queryKey: ['nowPlaying', refreshKey] }
  );
  const scheduleStats = trpc.contentScheduler.getStats.useQuery(
    undefined, { refetchInterval: 30000, queryKey: ['schedStats', refreshKey] }
  );
  const schedule = trpc.contentScheduler.getSchedule.useQuery(
    undefined, { refetchInterval: 60000, queryKey: ['schedule', refreshKey] }
  );
  const adStats = trpc.adRotation.getStats.useQuery(
    undefined, { refetchInterval: 30000, queryKey: ['adStats', refreshKey] }
  );
  const productionStatus = trpc.productionIntegration.getProductionStatus.useQuery(
    undefined, { refetchInterval: 30000, queryKey: ['prodStatus', refreshKey] }
  );

  const np = nowPlaying.data;
  const stats = scheduleStats.data;
  const sched = schedule.data;
  const ads = adStats.data;
  const ps = productionStatus.data;

  const seedMutation = trpc.contentScheduler.seedDefaultSchedule.useMutation({
    onSuccess: () => {
      toast({ title: "Schedule seeded", description: "Default 24/7 schedule has been created" });
      setRefreshKey(k => k + 1);
    },
    onError: (err) => toast({ title: "Seed failed", description: err.message, variant: "destructive" }),
  });

  const startBroadcastMutation = trpc.productionIntegration.startBroadcastWithAds.useMutation({
    onSuccess: (data) => {
      toast({ title: "Broadcast started", description: `${data.channelName} is now live with ${data.adsQueued} ads queued` });
      setRefreshKey(k => k + 1);
    },
    onError: (err) => toast({ title: "Broadcast failed", description: err.message, variant: "destructive" }),
  });

  const handleRefresh = () => setRefreshKey(k => k + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-pink-900/30 to-slate-900">
      {/* Header */}
      <header className="border-b border-pink-500/20 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Radio className="w-8 h-8 text-pink-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">RRB Broadcast Manager</h1>
                <p className="text-sm text-pink-300">
                  24/7 Broadcasting &bull; {stats?.activeEntries ?? 0} active programs &bull; {stats?.uniqueChannels ?? 0} channels
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={`${ps?.isOperational ? 'border-green-500 text-green-400' : 'border-yellow-500 text-yellow-400'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${ps?.isOperational ? 'bg-green-400' : 'bg-yellow-400'}`} />
                {ps?.isOperational ? 'ON AIR' : 'STANDBY'}
              </Badge>
              <Button onClick={handleRefresh} size="sm" variant="outline" className="border-pink-500/30 text-pink-300 hover:bg-pink-500/20">
                <RefreshCw className={`w-4 h-4 mr-1 ${nowPlaying.isFetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Total Programs', value: stats?.totalEntries ?? 0, icon: Radio, color: 'text-pink-400', bg: 'bg-pink-500/10' },
            { label: 'Active Now', value: stats?.activeEntries ?? 0, icon: Play, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Channels', value: stats?.uniqueChannels ?? 0, icon: Volume2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { label: 'QUMUS Managed', value: stats?.qumusManaged ?? 0, icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            { label: 'Active Ads', value: ads?.activeAds ?? 0, icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          ].map((m, i) => (
            <Card key={i} className={`${m.bg} border-slate-700/50`}>
              <CardContent className="p-3 text-center">
                <m.icon className={`w-5 h-5 mx-auto mb-1 ${m.color}`} />
                <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                <p className="text-xs text-gray-400">{m.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Now Playing Grid */}
        <Card className="bg-slate-800/50 border-pink-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-pink-400" />
                  Now Playing
                </CardTitle>
                <CardDescription className="text-pink-300">Live programming across all channels</CardDescription>
              </div>
              {(!np?.programming || np.programming.length === 0) && (
                <Button
                  onClick={() => seedMutation.mutate()}
                  disabled={seedMutation.isPending}
                  size="sm"
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  {seedMutation.isPending ? 'Seeding...' : 'Seed 24/7 Schedule'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {np?.programming?.map((prog: any, i: number) => (
                <div key={i} className="p-3 rounded bg-slate-700/30 border border-slate-600/30">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="border-pink-500/30 text-pink-300 text-xs">
                      CH {prog.channelId}
                    </Badge>
                    <Badge className={`text-xs ${
                      prog.showType === 'music' ? 'bg-purple-600' :
                      prog.showType === 'healing' ? 'bg-green-600' :
                      prog.showType === 'talk' ? 'bg-blue-600' :
                      prog.showType === 'gospel' ? 'bg-amber-600' :
                      prog.showType === 'emergency' ? 'bg-red-600' : 'bg-slate-600'
                    }`}>{prog.showType}</Badge>
                  </div>
                  <p className="text-sm text-white font-medium truncate">{prog.showName}</p>
                  <p className="text-xs text-gray-400">{prog.host || 'QUMUS Auto'}</p>
                  <p className="text-xs text-gray-500 mt-1">{prog.startTime} - {prog.endTime}</p>
                  {user && (
                    <Button
                      onClick={() => startBroadcastMutation.mutate({
                        channelId: prog.channelId,
                        channelName: `Channel ${prog.channelId}`,
                        programTitle: prog.showName,
                      })}
                      disabled={startBroadcastMutation.isPending}
                      size="sm"
                      className="w-full mt-2 bg-green-600 hover:bg-green-700 text-xs"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Start Broadcast
                    </Button>
                  )}
                </div>
              ))}
              {(!np?.programming || np.programming.length === 0) && (
                <div className="col-span-full text-center py-8">
                  <Radio className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-400">No active programming</p>
                  <p className="text-sm text-gray-500">Seed the default schedule to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ad Pool */}
        {np?.adPool && np.adPool.length > 0 && (
          <Card className="bg-slate-800/50 border-amber-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                Active Ad Pool ({np.adPool.length} ads)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {np.adPool.map((ad: any) => (
                  <div key={ad.id} className="p-3 rounded bg-slate-700/30 border border-amber-500/10">
                    <p className="text-sm text-white font-medium truncate">{ad.sponsor}</p>
                    <p className="text-xs text-gray-400 truncate">{ad.campaignName}</p>
                    <div className="flex justify-between mt-2">
                      <Badge variant="outline" className="border-amber-500/30 text-amber-300 text-xs">{ad.duration}s</Badge>
                      <span className="text-xs text-gray-500">W:{ad.rotationWeight}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Full Schedule */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Full Schedule ({sched?.length ?? 0} entries)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto space-y-1">
              {sched?.slice(0, 50).map((entry: any) => (
                <div key={entry.id} className="flex items-center justify-between p-2 rounded bg-slate-700/20 text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-xs flex-shrink-0">
                      CH {entry.channelId}
                    </Badge>
                    <span className="text-white truncate">{entry.showName}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400">{entry.startTime}-{entry.endTime}</span>
                    <Badge className={`text-xs ${entry.isActive ? 'bg-green-600' : 'bg-slate-600'}`}>
                      {entry.isActive ? 'Active' : 'Scheduled'}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!sched || sched.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-4">No schedule entries &mdash; seed the default schedule above</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content Type Breakdown */}
        {stats?.byType && Object.keys(stats.byType).length > 0 && (
          <Card className="bg-slate-800/50 border-cyan-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Content Mix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} className="p-3 rounded bg-slate-700/30 text-center">
                    <p className="text-lg font-bold text-cyan-400">{count as number}</p>
                    <p className="text-xs text-gray-400 capitalize">{type}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="border-t border-pink-500/20 bg-slate-900/50 mt-8 py-6">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="text-sm">RRB Broadcast Manager &bull; Canryn Production &bull; Powered by QUMUS</p>
        </div>
      </footer>
    </div>
  );
}
