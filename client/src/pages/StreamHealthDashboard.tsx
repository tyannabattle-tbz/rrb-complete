/**
 * Stream Health Dashboard — Visual monitoring of all 54 RRB Radio channels
 * Shows uptime timeline, circuit breaker status, outage root causes, and per-channel health.
 */
import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Activity, Radio, Shield, AlertTriangle, CheckCircle, XCircle,
  Clock, Zap, RefreshCw, TrendingUp, Server, Wifi, WifiOff
} from 'lucide-react';

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function UptimeBar({ percent }: { percent: number }) {
  const color = percent >= 95 ? 'bg-green-500' : percent >= 80 ? 'bg-yellow-500' : percent >= 50 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    healthy: 'bg-green-500',
    degraded: 'bg-yellow-500',
    down: 'bg-red-500',
    unknown: 'bg-gray-500',
  };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status] || 'bg-gray-500'}`} />;
}

function RootCauseBadge({ cause }: { cause: string }) {
  const styles: Record<string, string> = {
    provider_outage: 'bg-red-900/40 text-red-400 border-red-700/30',
    network_issue: 'bg-orange-900/40 text-orange-400 border-orange-700/30',
    individual_failure: 'bg-yellow-900/40 text-yellow-400 border-yellow-700/30',
    unknown: 'bg-gray-900/40 text-gray-400 border-gray-700/30',
  };
  const labels: Record<string, string> = {
    provider_outage: 'Provider Outage',
    network_issue: 'Network Issue',
    individual_failure: 'Individual Failure',
    unknown: 'Unknown',
  };
  return (
    <Badge className={`text-[10px] ${styles[cause] || styles.unknown}`}>
      {labels[cause] || cause}
    </Badge>
  );
}

export default function StreamHealthDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: status, refetch: refetchStatus } = trpc.streamHealth.getStatus.useQuery(undefined, {
    refetchInterval: autoRefresh ? 30000 : false,
  });
  const { data: latest, refetch: refetchLatest } = trpc.streamHealth.getLatest.useQuery(undefined, {
    refetchInterval: autoRefresh ? 30000 : false,
  });
  const { data: history } = trpc.streamHealth.getHistory.useQuery(undefined, {
    refetchInterval: autoRefresh ? 60000 : false,
  });
  const { data: outages } = trpc.streamHealth.getOutages.useQuery(undefined, {
    refetchInterval: autoRefresh ? 60000 : false,
  });

  const runCheckMutation = trpc.streamHealth.runCheck.useMutation({
    onSuccess: (data) => {
      toast({ title: 'Health check complete', description: `${data.healthy}/${data.totalChannels} healthy (${data.uptimePercent.toFixed(1)}%)` });
      refetchStatus();
      refetchLatest();
    },
    onError: () => {
      toast({ title: 'Health check failed', variant: 'destructive' });
    },
  });

  // Auto-refresh timer display
  const [refreshCountdown, setRefreshCountdown] = useState(30);
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      setRefreshCountdown(prev => prev <= 1 ? 30 : prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [autoRefresh]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E8E0D0]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0a1a0a] via-[#0D0D0D] to-[#0a0a1a] border-b border-green-500/20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-green-400">Stream Health Dashboard</h1>
                <p className="text-[#E8E0D0]/60 text-sm">QUMUS Policy #19 — Real-time Channel Monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                className={`border-green-500/30 text-green-400 hover:bg-green-900/20 text-xs ${autoRefresh ? 'bg-green-900/10' : ''}`}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                {autoRefresh ? `Auto (${refreshCountdown}s)` : 'Paused'}
              </Button>
              {user && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white text-xs"
                  onClick={() => runCheckMutation.mutate()}
                  disabled={runCheckMutation.isPending}
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${runCheckMutation.isPending ? 'animate-spin' : ''}`} />
                  {runCheckMutation.isPending ? 'Checking...' : 'Run Check Now'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Top Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-[#111111] border-green-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{status?.healthyChannels || 0}</div>
              <div className="text-xs text-[#E8E0D0]/50 mt-1">Healthy</div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#D4A843]/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-[#D4A843]">{status?.totalChannels || 0}</div>
              <div className="text-xs text-[#E8E0D0]/50 mt-1">Total Channels</div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-green-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{status?.currentUptime?.toFixed(1) || '—'}%</div>
              <div className="text-xs text-[#E8E0D0]/50 mt-1">Uptime</div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-blue-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{status?.healedThisCycle || 0}</div>
              <div className="text-xs text-[#E8E0D0]/50 mt-1">Auto-Healed</div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-red-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-red-400">{status?.stillDownThisCycle || 0}</div>
              <div className="text-xs text-[#E8E0D0]/50 mt-1">Still Down</div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-purple-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">{status?.totalChecks || 0}</div>
              <div className="text-xs text-[#E8E0D0]/50 mt-1">Total Checks</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column — Uptime Timeline + Circuit Breaker */}
          <div className="lg:col-span-2 space-y-6">
            {/* Circuit Breaker Status */}
            <Card className="bg-[#111111] border-[#D4A843]/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-[#D4A843] flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Circuit Breaker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                    status?.circuitBreaker?.tripped 
                      ? 'bg-red-900/30 border border-red-500/30' 
                      : 'bg-green-900/30 border border-green-500/30'
                  }`}>
                    {status?.circuitBreaker?.tripped 
                      ? <AlertTriangle className="w-8 h-8 text-red-400" />
                      : <CheckCircle className="w-8 h-8 text-green-400" />
                    }
                  </div>
                  <div>
                    <div className="text-lg font-bold">
                      {status?.circuitBreaker?.tripped 
                        ? <span className="text-red-400">TRIPPED — Auto-healing paused</span>
                        : <span className="text-green-400">NORMAL — Auto-healing active</span>
                      }
                    </div>
                    <p className="text-sm text-[#E8E0D0]/50">
                      Threshold: {status?.circuitBreaker?.threshold || '50%'} of channels down triggers pause.
                      {status?.circuitBreaker?.lastTrippedAt && (
                        <span> Last tripped: {formatDate(status.circuitBreaker.lastTrippedAt)}</span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Uptime Timeline */}
            <Card className="bg-[#111111] border-green-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-400 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" /> Uptime Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {status?.uptimeHistory && status.uptimeHistory.length > 0 ? (
                  <div className="space-y-3">
                    {status.uptimeHistory.map((h: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-[#E8E0D0]/50 w-16 shrink-0">{formatTime(h.timestamp)}</span>
                        <div className="flex-1">
                          <UptimeBar percent={h.uptimePercent} />
                        </div>
                        <span className="text-xs font-mono w-14 text-right">
                          <span className={h.uptimePercent >= 95 ? 'text-green-400' : h.uptimePercent >= 80 ? 'text-yellow-400' : 'text-red-400'}>
                            {h.uptimePercent.toFixed(1)}%
                          </span>
                        </span>
                        <span className="text-xs text-[#E8E0D0]/40 w-16 text-right">{h.healthy}/{h.total}</span>
                        {h.healed > 0 && (
                          <Badge className="bg-blue-900/30 text-blue-400 border-blue-700/30 text-[10px]">
                            +{h.healed} healed
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#E8E0D0]/40">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No uptime data yet. Run a health check to start tracking.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Channel Grid */}
            <Card className="bg-[#111111] border-[#D4A843]/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-[#D4A843] flex items-center gap-2">
                  <Radio className="w-5 h-5" /> Channel Status ({latest?.channels?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latest?.channels && latest.channels.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {latest.channels.map((ch: any, i: number) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                          ch.status === 'healthy' ? 'border-green-500/10 bg-green-900/5' :
                          ch.status === 'degraded' ? 'border-yellow-500/10 bg-yellow-900/5' :
                          ch.status === 'down' ? 'border-red-500/10 bg-red-900/5' :
                          'border-gray-500/10 bg-gray-900/5'
                        }`}
                      >
                        <StatusDot status={ch.status} />
                        <span className="text-xs font-medium truncate flex-1">{ch.name}</span>
                        <span className="text-[10px] text-[#E8E0D0]/40 font-mono">{ch.responseTime}ms</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#E8E0D0]/40">
                    <Server className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No channel data yet. Run a health check to see status.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column — Outage History + Down Channels */}
          <div className="space-y-6">
            {/* Currently Down */}
            <Card className="bg-[#111111] border-red-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-red-400 flex items-center gap-2">
                  <XCircle className="w-5 h-5" /> Currently Down ({status?.downChannels?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {status?.downChannels && status.downChannels.length > 0 ? (
                  <div className="space-y-2">
                    {status.downChannels.map((ch: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-900/10 border border-red-500/10">
                        <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{ch.name}</div>
                          {ch.genre && <div className="text-[10px] text-[#E8E0D0]/40">{ch.genre}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-green-400/60">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">All channels operational</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Outage History */}
            <Card className="bg-[#111111] border-orange-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-orange-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Outage History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {outages && outages.length > 0 ? (
                  <div className="space-y-3">
                    {outages.slice().reverse().map((o: any, i: number) => (
                      <div key={i} className="px-3 py-3 rounded-lg bg-[#0D0D0D] border border-[#D4A843]/10">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-[#E8E0D0]/50">{formatDate(o.timestamp)}</span>
                          <RootCauseBadge cause={o.rootCause} />
                        </div>
                        <div className="text-sm font-medium">
                          {o.channelsAffected}/{o.totalChannels} channels affected
                        </div>
                        <p className="text-xs text-[#E8E0D0]/40 mt-1">{o.details}</p>
                        <div className="flex items-center gap-1 mt-2">
                          {o.resolved 
                            ? <Badge className="bg-green-900/30 text-green-400 border-green-700/30 text-[10px]">Resolved</Badge>
                            : <Badge className="bg-red-900/30 text-red-400 border-red-700/30 text-[10px]">Active</Badge>
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-[#E8E0D0]/40">
                    <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No outages recorded</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monitor Info */}
            <Card className="bg-[#111111] border-purple-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-purple-400 flex items-center gap-2">
                  <Zap className="w-5 h-5" /> Monitor Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#E8E0D0]/50">Status</span>
                  <Badge className={status?.isRunning ? 'bg-green-900/30 text-green-400 border-green-700/30' : 'bg-red-900/30 text-red-400 border-red-700/30'}>
                    {status?.isRunning ? 'Running' : 'Stopped'}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#E8E0D0]/50">Check Interval</span>
                  <span className="text-[#E8E0D0]">15 minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#E8E0D0]/50">Last Check</span>
                  <span className="text-[#E8E0D0]">{status?.lastCheckAt ? formatDate(status.lastCheckAt) : 'Never'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#E8E0D0]/50">Total Checks</span>
                  <span className="text-[#E8E0D0]">{status?.totalChecks || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#E8E0D0]/50">Backup Strategy</span>
                  <span className="text-[#E8E0D0]">Genre-matched</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
