import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Activity, Zap, Shield, RefreshCw, Clock, Radio,
  Target, Bell, Earth, Users, Heart, AlertCircle,
  CheckCircle, XCircle, MinusCircle
} from 'lucide-react';

export default function ProductionDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  // ─── Live Data ───────────────────────────────
  const productionStatus = trpc.productionIntegration.getProductionStatus.useQuery(
    undefined, { refetchInterval: 15000, queryKey: ['prodStatus', refreshKey] }
  );
  const subsystemStatus = trpc.productionIntegration.getSubsystemStatus.useQuery(
    undefined, { refetchInterval: 15000, queryKey: ['subsys', refreshKey] }
  );
  const eventLog = trpc.productionIntegration.getEventLog.useQuery(
    { limit: 50 }, { refetchInterval: 15000, queryKey: ['events', refreshKey], enabled: !!user }
  );

  const emitEvent = trpc.productionIntegration.emitEvent.useMutation({
    onSuccess: () => {
      toast({ title: "Event emitted", description: "Production event dispatched to all subsystems" });
      setRefreshKey(k => k + 1);
    },
    onError: (err) => toast({ title: "Emit failed", description: err.message, variant: "destructive" }),
  });

  const ps = productionStatus.data;
  const ss = subsystemStatus.data;
  const events = eventLog.data;

  const handleRefresh = () => setRefreshKey(k => k + 1);

  const healthyCount = ss ? Object.values(ss).filter((s: any) => s?.status === 'operational').length : 0;
  const degradedCount = ss ? Object.values(ss).filter((s: any) => s?.status === 'degraded').length : 0;
  const downCount = ss ? Object.values(ss).filter((s: any) => s?.status !== 'operational' && s?.status !== 'degraded').length : 0;
  const totalSubs = ss ? Object.keys(ss).length : 0;

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'operational') return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (status === 'degraded') return <MinusCircle className="w-4 h-4 text-yellow-400" />;
    return <XCircle className="w-4 h-4 text-red-400" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-600/30 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-green-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Production Status</h1>
                <p className="text-sm text-gray-400">
                  System health: {ps?.systemHealth ?? 0}% &bull; Autonomy: {ps?.autonomyLevel ?? 0}% &bull; {ps?.activePolicies ?? 0} policies
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={`${ps?.isOperational ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${ps?.isOperational ? 'bg-green-400' : 'bg-red-400'}`} />
                {ps?.isOperational ? 'ALL SYSTEMS GO' : 'DEGRADED'}
              </Badge>
              <Button onClick={handleRefresh} size="sm" variant="outline" className="border-slate-500/30 text-gray-300 hover:bg-slate-500/20">
                <RefreshCw className={`w-4 h-4 mr-1 ${productionStatus.isFetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Health Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <p className="text-3xl font-bold text-green-400">{healthyCount}</p>
              <p className="text-sm text-gray-400">Operational</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-500/10 border-yellow-500/20">
            <CardContent className="p-4 text-center">
              <MinusCircle className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <p className="text-3xl font-bold text-yellow-400">{degradedCount}</p>
              <p className="text-sm text-gray-400">Degraded</p>
            </CardContent>
          </Card>
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-4 text-center">
              <XCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <p className="text-3xl font-bold text-red-400">{downCount}</p>
              <p className="text-sm text-gray-400">Down</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-500/10 border-purple-500/20">
            <CardContent className="p-4 text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <p className="text-3xl font-bold text-purple-400">{ps?.activePolicies ?? 0}</p>
              <p className="text-sm text-gray-400">QUMUS Policies</p>
            </CardContent>
          </Card>
        </div>

        {/* Subsystem Detail Grid */}
        <Card className="bg-slate-800/50 border-slate-600/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Subsystem Status ({totalSubs} systems)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ss && Object.entries(ss).map(([key, val]: [string, any]) => (
                <div key={key} className="flex items-center gap-3 p-3 rounded bg-slate-700/30 border border-slate-600/20">
                  <StatusIcon status={val?.status ?? 'unknown'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-xs text-gray-400">{val?.description ?? val?.status ?? 'unknown'}</p>
                  </div>
                  <Badge className={`text-xs flex-shrink-0 ${
                    val?.status === 'operational' ? 'bg-green-600' :
                    val?.status === 'degraded' ? 'bg-yellow-600' : 'bg-red-600'
                  }`}>{val?.status ?? 'unknown'}</Badge>
                </div>
              ))}
              {!ss && Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 rounded bg-slate-700/20 animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Database Metrics */}
        {ps?.databaseMetrics && (
          <Card className="bg-slate-800/50 border-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Earth className="w-5 h-5 text-blue-400" />
                Database Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3 rounded bg-slate-700/30 text-center">
                  <p className="text-xl font-bold text-blue-400">{ps.databaseMetrics.activeWebhooks}</p>
                  <p className="text-xs text-gray-400">Active Webhooks</p>
                </div>
                <div className="p-3 rounded bg-slate-700/30 text-center">
                  <p className="text-xl font-bold text-amber-400">{ps.databaseMetrics.activeAds}</p>
                  <p className="text-xs text-gray-400">Active Ads</p>
                </div>
                <div className="p-3 rounded bg-slate-700/30 text-center">
                  <p className="text-xl font-bold text-cyan-400">{ps.databaseMetrics.uniqueListeners}</p>
                  <p className="text-xs text-gray-400">Recent Listeners</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Event Log */}
        {user && (
          <Card className="bg-slate-800/50 border-slate-600/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  Event Log ({events?.length ?? 0} events)
                </CardTitle>
                <Button
                  onClick={() => emitEvent.mutate({
                    type: 'system_health_check',
                    source: 'production_dashboard',
                    data: { triggeredBy: user.name || 'admin', timestamp: Date.now() },
                    severity: 'info',
                  })}
                  disabled={emitEvent.isPending}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Emit Health Check
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 overflow-y-auto space-y-1">
                {events?.map((evt: any) => (
                  <div key={evt.id} className="flex items-center gap-3 p-2 rounded bg-slate-700/20 text-sm">
                    <Badge className={`text-xs flex-shrink-0 ${
                      evt.severity === 'critical' ? 'bg-red-600' :
                      evt.severity === 'warning' ? 'bg-amber-600' : 'bg-slate-600'
                    }`}>{evt.severity}</Badge>
                    <span className="text-gray-300 truncate flex-1">{evt.type} &mdash; {evt.source}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
                {(!events || events.length === 0) && (
                  <p className="text-sm text-gray-400 text-center py-4">No events yet &mdash; emit a health check to start</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="border-t border-slate-600/30 bg-slate-900/50 mt-8 py-6">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="text-sm">Production Status &bull; Canryn Production &bull; QUMUS Autonomous Orchestration</p>
        </div>
      </footer>
    </div>
  );
}

export { ProductionDashboard };
