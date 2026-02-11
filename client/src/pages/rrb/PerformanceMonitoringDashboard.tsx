/**
 * Performance Monitoring Dashboard — QUMUS 10th Policy
 * Tracks page load times, API response latency, memory usage, and stream performance
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  Activity, Gauge, Clock, Zap, Server, Wifi, BarChart3, 
  RefreshCw, Play, Pause, ArrowLeft, AlertTriangle, CheckCircle2,
  XCircle, Timer, Database, Globe, Radio
} from 'lucide-react';
import { Link } from 'wouter';

type MetricCategory = 'all' | 'page_load' | 'api_latency' | 'memory_usage' | 'stream_health' | 'error_rate' | 'uptime';

const categoryConfig: Record<string, { label: string; icon: typeof Activity; color: string }> = {
  all: { label: 'All Metrics', icon: BarChart3, color: 'text-white' },
  page_load: { label: 'Page Load', icon: Globe, color: 'text-blue-400' },
  api_latency: { label: 'API Latency', icon: Zap, color: 'text-amber-400' },
  memory_usage: { label: 'Memory', icon: Server, color: 'text-purple-400' },
  stream_health: { label: 'Streams', icon: Radio, color: 'text-green-400' },
  error_rate: { label: 'Errors', icon: AlertTriangle, color: 'text-red-400' },
  uptime: { label: 'Uptime', icon: Activity, color: 'text-cyan-400' },
};

function getGradeColor(grade: string) {
  switch (grade) {
    case 'A': return 'text-green-400 bg-green-500/20 border-green-500/30';
    case 'B': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    case 'C': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    case 'D': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    case 'F': return 'text-red-400 bg-red-500/20 border-red-500/30';
    default: return 'text-stone-400 bg-stone-500/20 border-stone-500/30';
  }
}

function getSeverityBadge(severity: string) {
  switch (severity) {
    case 'normal': return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Normal</Badge>;
    case 'warning': return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Warning</Badge>;
    case 'critical': return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Critical</Badge>;
    case 'emergency': return <Badge className="bg-red-600/30 text-red-300 border-red-500/40">Emergency</Badge>;
    default: return <Badge className="bg-stone-500/20 text-stone-400">Unknown</Badge>;
  }
}

export default function PerformanceMonitoringDashboard() {
  const [activeCategory, setActiveCategory] = useState<MetricCategory>('all');
  const [latestSnapshot, setLatestSnapshot] = useState<any>(null);

  const summaryQuery = trpc.performanceMonitoring.getSummary.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const alertsQuery = trpc.performanceMonitoring.getAlerts.useQuery(undefined, {
    refetchInterval: 15000,
  });

  const schedulerQuery = trpc.performanceMonitoring.getMonitoringStatus.useQuery(undefined, {
    refetchInterval: 10000,
  });

  const snapshotMutation = trpc.performanceMonitoring.snapshot.useMutation({
    onSuccess: (data) => {
      setLatestSnapshot(data);
      toast.success(`Benchmark complete — Grade: ${data.grade} (${data.overallScore}/100)`);
      summaryQuery.refetch();
      alertsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const startMonitoringMutation = trpc.performanceMonitoring.startMonitoring.useMutation({
    onSuccess: () => {
      toast.success('Performance monitoring started');
      schedulerQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const stopMonitoringMutation = trpc.performanceMonitoring.stopMonitoring.useMutation({
    onSuccess: () => {
      toast.success('Performance monitoring paused');
      schedulerQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateIntervalMutation = trpc.performanceMonitoring.updateInterval.useMutation({
    onSuccess: (data) => {
      toast.success(`Interval updated to ${data.intervalHuman}`);
      schedulerQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const summary = summaryQuery.data;
  const alerts = alertsQuery.data ?? [];
  const scheduler = schedulerQuery.data;
  const snapshot = latestSnapshot;

  const filteredMetrics = snapshot?.metrics
    ? activeCategory === 'all'
      ? snapshot.metrics
      : snapshot.metrics.filter((m: any) => m.category === activeCategory)
    : [];

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Header */}
      <div className="border-b border-stone-800/50 bg-stone-950/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/rrb/qumus/admin">
                <span className="p-2 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer">
                  <ArrowLeft className="w-5 h-5 text-stone-400" />
                </span>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-cyan-400" />
                  Performance Monitoring
                </h1>
                <p className="text-xs text-stone-500">QUMUS Policy #10 — 92% Autonomy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                className="border-stone-700 text-stone-300 hover:bg-stone-800"
                onClick={() => snapshotMutation.mutate()}
                disabled={snapshotMutation.isPending}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${snapshotMutation.isPending ? 'animate-spin' : ''}`} />
                Run Benchmark
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Overall Health Grade + Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-stone-900/60 border-stone-800/50">
            <CardContent className="pt-6 text-center">
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">Performance Grade</p>
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full border-2 text-4xl font-bold ${getGradeColor(snapshot?.grade ?? summary?.currentGrade ?? '—')}`}>
                {snapshot?.grade ?? summary?.currentGrade ?? '—'}
              </div>
              <p className="text-stone-500 text-xs mt-2">
                {snapshot ? `Score: ${snapshot.overallScore}/100` : summary ? `Avg Score: ${summary.averageScore}/100` : 'Run benchmark to see score'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-stone-900/60 border-stone-800/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <p className="text-xs text-stone-500 uppercase tracking-wider">Total Snapshots</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {summary?.totalSnapshots ?? 0}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                {summary?.lastSnapshotAt ? `Last: ${new Date(summary.lastSnapshotAt).toLocaleTimeString()}` : 'No snapshots yet'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-stone-900/60 border-stone-800/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <p className="text-xs text-stone-500 uppercase tracking-wider">Active Alerts</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {summary?.activeAlerts ?? 0}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                {summary ? `${summary.acknowledgedAlerts} acknowledged, ${summary.resolvedAlerts} resolved` : 'No alerts'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-stone-900/60 border-stone-800/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-green-400" />
                <p className="text-xs text-stone-500 uppercase tracking-wider">Metrics Tracked</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {snapshot?.metrics?.length ?? 6}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Across 6 categories
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Scheduler Control */}
        <Card className="bg-stone-900/60 border-stone-800/50">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Timer className="w-5 h-5 text-cyan-400" />
              Automated Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${scheduler?.enabled ? 'bg-green-500 animate-pulse' : 'bg-stone-600'}`} />
                <span className="text-sm text-stone-300">
                  {scheduler?.enabled ? `Active — ${scheduler.intervalHuman}` : 'Monitoring Paused'}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={scheduler?.enabled ? 'outline' : 'default'}
                  className={scheduler?.enabled ? 'border-stone-700' : 'bg-cyan-600 hover:bg-cyan-500'}
                  onClick={() => scheduler?.enabled ? stopMonitoringMutation.mutate() : startMonitoringMutation.mutate({})}
                  disabled={startMonitoringMutation.isPending || stopMonitoringMutation.isPending}
                >
                  {scheduler?.enabled ? <Pause className="w-3.5 h-3.5 mr-1.5" /> : <Play className="w-3.5 h-3.5 mr-1.5" />}
                  {scheduler?.enabled ? 'Pause' : 'Start'}
                </Button>
              </div>

              <div className="flex gap-1.5">
                {[
                  { ms: 60000, label: '1m' },
                  { ms: 300000, label: '5m' },
                  { ms: 900000, label: '15m' },
                  { ms: 3600000, label: '1h' },
                ].map(({ ms, label }) => (
                  <Button
                    key={ms}
                    size="sm"
                    variant="outline"
                    className={`text-xs px-2.5 ${scheduler?.intervalMs === ms ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10' : 'border-stone-700 text-stone-400'}`}
                    onClick={() => updateIntervalMutation.mutate({ intervalMs: ms })}
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {scheduler?.lastCheck && (
                <span className="text-xs text-stone-600">
                  Last check: {new Date(scheduler.lastCheck).toLocaleTimeString()} | Total: {scheduler.totalChecks}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <Button
                key={key}
                size="sm"
                variant="outline"
                className={`text-xs ${activeCategory === key ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10' : 'border-stone-700 text-stone-400 hover:bg-stone-800'}`}
                onClick={() => setActiveCategory(key as MetricCategory)}
              >
                <Icon className={`w-3.5 h-3.5 mr-1.5 ${config.color}`} />
                {config.label}
              </Button>
            );
          })}
        </div>

        {/* Metrics Grid */}
        {!snapshot && !snapshotMutation.isPending ? (
          <div className="text-center py-16">
            <Gauge className="w-12 h-12 text-stone-700 mx-auto mb-4" />
            <p className="text-stone-500 mb-4">No benchmark data yet. Click "Run Benchmark" to start.</p>
            <Button
              onClick={() => snapshotMutation.mutate()}
              className="bg-cyan-600 hover:bg-cyan-500"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Run First Benchmark
            </Button>
          </div>
        ) : snapshotMutation.isPending ? (
          <div className="text-center py-16">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
            <p className="text-stone-400">Running performance benchmark...</p>
          </div>
        ) : filteredMetrics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMetrics.map((metric: any, idx: number) => {
              const catConfig = categoryConfig[metric.category];
              const CatIcon = catConfig?.icon ?? Activity;
              return (
                <Card key={idx} className={`bg-stone-900/60 border-stone-800/50 ${metric.severity !== 'normal' ? 'border-amber-800/40' : ''}`}>
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CatIcon className={`w-4 h-4 ${catConfig?.color ?? 'text-stone-400'}`} />
                        <span className="text-sm text-stone-300">{metric.name}</span>
                      </div>
                      {getSeverityBadge(metric.severity)}
                    </div>
                    <p className="text-2xl font-bold text-white">{metric.value}{metric.unit}</p>
                    <p className="text-xs text-stone-600 mt-1">
                      Threshold: warn {metric.threshold.warning}{metric.unit} / crit {metric.threshold.critical}{metric.unit}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : null}

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <Card className="bg-stone-900/60 border-stone-800/50">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Active Alerts ({alerts.filter((a: any) => !a.resolvedAt).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.filter((a: any) => !a.resolvedAt).slice(0, 10).map((alert: any) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 bg-stone-800/50 rounded-lg">
                    {alert.severity === 'critical' || alert.severity === 'emergency'
                      ? <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      : <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    }
                    <div className="flex-1">
                      <p className="text-sm text-stone-300">{alert.message}</p>
                      <p className="text-xs text-stone-600 mt-1">{new Date(alert.triggeredAt).toLocaleString()}</p>
                    </div>
                    {getSeverityBadge(alert.severity)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {snapshot?.recommendations && snapshot.recommendations.length > 0 && (
          <Card className="bg-stone-900/60 border-stone-800/50">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {snapshot.recommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-stone-800/50 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-stone-300">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
