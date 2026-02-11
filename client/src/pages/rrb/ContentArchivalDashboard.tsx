/**
 * Content Archival Dashboard — QUMUS 11th Policy
 * Monitor external links, detect link rot, manage Wayback Machine archives
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import {
  Archive, Globe, AlertTriangle, CheckCircle, XCircle, Clock,
  RefreshCw, Play, Square, ExternalLink, Shield, Search, Loader2,
  ArrowLeft, Timer, Link2, AlertCircle, Database
} from 'lucide-react';
import { toast } from 'sonner';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    alive: { bg: 'bg-green-500/20', text: 'text-green-500', icon: <CheckCircle className="w-3 h-3" /> },
    degraded: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', icon: <AlertTriangle className="w-3 h-3" /> },
    dead: { bg: 'bg-red-500/20', text: 'text-red-500', icon: <XCircle className="w-3 h-3" /> },
    unknown: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: <Clock className="w-3 h-3" /> },
    archived: { bg: 'bg-blue-500/20', text: 'text-blue-500', icon: <Archive className="w-3 h-3" /> },
  };
  const s = styles[status] || styles.unknown;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      {s.icon} {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-500',
    high: 'bg-orange-500/20 text-orange-500',
    medium: 'bg-blue-500/20 text-blue-400',
    low: 'bg-gray-500/20 text-gray-400',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[priority] || colors.low}`}>
      {priority}
    </span>
  );
}

export default function ContentArchivalDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'links' | 'alerts' | 'scans' | 'scheduler'>('overview');
  
  const { data: summary, refetch: refetchSummary } = trpc.contentArchival.getSummary.useQuery();
  const { data: links, refetch: refetchLinks } = trpc.contentArchival.getLinks.useQuery({});
  const { data: alerts, refetch: refetchAlerts } = trpc.contentArchival.getAlerts.useQuery({});
  const { data: scans, refetch: refetchScans } = trpc.contentArchival.getScanHistory.useQuery();
  const { data: schedulerStatus, refetch: refetchScheduler } = trpc.contentArchival.getSchedulerStatus.useQuery();

  const scanMutation = trpc.contentArchival.scan.useMutation({
    onSuccess: () => {
      toast.success('Archival scan completed');
      refetchSummary(); refetchLinks(); refetchAlerts(); refetchScans();
    },
    onError: (e) => toast.error(`Scan failed: ${e.message}`),
  });

  const archiveMutation = trpc.contentArchival.archiveToWayback.useMutation({
    onSuccess: (data) => {
      toast.success(data.success ? 'Link archived to Wayback Machine' : 'Archive request sent (may take time to process)');
      refetchLinks();
    },
    onError: (e) => toast.error(`Archive failed: ${e.message}`),
  });

  const checkWaybackMutation = trpc.contentArchival.checkAllWayback.useMutation({
    onSuccess: (data) => {
      toast.success(`Wayback check: ${data.available} available, ${data.missing} missing`);
      refetchLinks();
    },
  });

  const startSchedulerMutation = trpc.contentArchival.startScheduler.useMutation({
    onSuccess: () => { toast.success('Archival scheduler started'); refetchScheduler(); },
  });

  const stopSchedulerMutation = trpc.contentArchival.stopScheduler.useMutation({
    onSuccess: () => { toast.success('Archival scheduler stopped'); refetchScheduler(); },
  });

  const acknowledgeAlertMutation = trpc.contentArchival.acknowledgeAlert.useMutation({
    onSuccess: () => { refetchAlerts(); refetchSummary(); },
  });

  const resolveAlertMutation = trpc.contentArchival.resolveAlert.useMutation({
    onSuccess: () => { refetchAlerts(); refetchSummary(); },
  });

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Archive },
    { id: 'links' as const, label: 'Monitored Links', icon: Link2 },
    { id: 'alerts' as const, label: 'Alerts', icon: AlertCircle },
    { id: 'scans' as const, label: 'Scan History', icon: Search },
    { id: 'scheduler' as const, label: 'Scheduler', icon: Timer },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/rrb/qumus-admin">
              <span className="text-foreground/50 hover:text-foreground cursor-pointer">
                <ArrowLeft className="w-5 h-5" />
              </span>
            </Link>
            <Archive className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Content Archival</h1>
              <p className="text-sm text-foreground/60">QUMUS 11th Policy — Link Monitoring & Wayback Preservation</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-foreground/60 hover:text-foreground hover:bg-muted'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => scanMutation.mutate()}
                disabled={scanMutation.isPending}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {scanMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Run Full Scan
              </Button>
              <Button
                onClick={() => checkWaybackMutation.mutate()}
                disabled={checkWaybackMutation.isPending}
                variant="outline"
              >
                {checkWaybackMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}
                Check Wayback
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-foreground">{summary?.totalLinks || 0}</div>
                  <div className="text-sm text-foreground/60">Monitored Links</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-green-500">{summary?.aliveLinks || 0}</div>
                  <div className="text-sm text-foreground/60">Alive</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-500">{summary?.degradedLinks || 0}</div>
                  <div className="text-sm text-foreground/60">Degraded</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-red-500">{summary?.deadLinks || 0}</div>
                  <div className="text-sm text-foreground/60">Dead</div>
                </CardContent>
              </Card>
            </div>

            {/* Health Score */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  Archival Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-4xl font-bold text-foreground">{summary?.healthScore || 0}<span className="text-lg text-foreground/40">/100</span></div>
                    <div className="text-sm text-foreground/60">Health Score ({summary?.healthGrade || 'N/A'})</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-blue-500">{summary?.archivedLinks || 0}</div>
                    <div className="text-sm text-foreground/60">Wayback Archives</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-orange-500">{summary?.linkRotRate || 0}%</div>
                    <div className="text-sm text-foreground/60">Link Rot Rate</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-foreground/70">{summary?.averageResponseTime || 0}<span className="text-sm text-foreground/40">ms</span></div>
                    <div className="text-sm text-foreground/60">Avg Response Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            {summary?.categoryBreakdown && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Links by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(summary.categoryBreakdown)
                      .filter(([_, count]) => count > 0)
                      .map(([cat, count]) => (
                        <div key={cat} className="bg-muted/50 rounded-lg p-3 text-center">
                          <div className="text-xl font-bold text-foreground">{count}</div>
                          <div className="text-xs text-foreground/50 capitalize">{cat.replace(/_/g, ' ')}</div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Links Tab */}
        {activeTab === 'links' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Monitored Links ({links?.length || 0})</h2>
              <Button
                onClick={() => scanMutation.mutate()}
                disabled={scanMutation.isPending}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600"
              >
                {scanMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Scan All
              </Button>
            </div>

            {links?.map((link: any) => (
              <Card key={link.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-foreground text-sm">{link.title}</h3>
                        <StatusBadge status={link.status} />
                        <PriorityBadge priority={link.priority} />
                      </div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline truncate block"
                      >
                        {link.url}
                      </a>
                      {link.notes && (
                        <p className="text-xs text-foreground/50 mt-1">{link.notes}</p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-foreground/40">
                        {link.responseTime !== null && <span>Response: {link.responseTime}ms</span>}
                        {link.httpStatus !== null && <span>HTTP {link.httpStatus}</span>}
                        {link.checkCount > 0 && <span>Checked {link.checkCount}x</span>}
                        {link.failCount > 0 && <span className="text-red-400">Fails: {link.failCount}</span>}
                        {link.waybackUrl && (
                          <a href={link.waybackUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                            <Archive className="w-3 h-3" /> Wayback
                          </a>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => archiveMutation.mutate({ linkId: link.id })}
                      disabled={archiveMutation.isPending}
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0"
                    >
                      <Archive className="w-3 h-3 mr-1" />
                      Archive
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Archival Alerts ({alerts?.length || 0})</h2>
            {(!alerts || alerts.length === 0) ? (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-foreground/60">No alerts — all monitored links are healthy</p>
                </CardContent>
              </Card>
            ) : (
              alerts.map((alert: any) => (
                <Card key={alert.id} className={`bg-card border-border ${alert.resolvedAt ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {alert.severity === 'critical' ? (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          ) : alert.severity === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-blue-400" />
                          )}
                          <span className="text-sm font-medium text-foreground">{alert.type.replace(/_/g, ' ')}</span>
                          {alert.resolvedAt && <span className="text-xs text-green-500">Resolved</span>}
                        </div>
                        <p className="text-sm text-foreground/70">{alert.message}</p>
                        <p className="text-xs text-foreground/40 mt-1">
                          {new Date(alert.triggeredAt).toLocaleString()}
                        </p>
                      </div>
                      {!alert.resolvedAt && (
                        <div className="flex gap-2">
                          {!alert.acknowledged && (
                            <Button
                              onClick={() => acknowledgeAlertMutation.mutate({ alertId: alert.id })}
                              size="sm"
                              variant="outline"
                            >
                              Ack
                            </Button>
                          )}
                          <Button
                            onClick={() => resolveAlertMutation.mutate({ alertId: alert.id })}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Resolve
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Scans Tab */}
        {activeTab === 'scans' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Scan History ({scans?.length || 0})</h2>
              <Button
                onClick={() => scanMutation.mutate()}
                disabled={scanMutation.isPending}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600"
              >
                {scanMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                New Scan
              </Button>
            </div>

            {(!scans || scans.length === 0) ? (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <Search className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
                  <p className="text-foreground/60">No scans yet — run your first scan to check link health</p>
                </CardContent>
              </Card>
            ) : (
              scans.map((scan: any) => (
                <Card key={scan.scanId} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-foreground">
                        {new Date(scan.completedAt).toLocaleString()}
                      </span>
                      <span className="text-xs text-foreground/40">
                        Duration: {((scan.completedAt - scan.startedAt) / 1000).toFixed(1)}s
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-500">{scan.alive}</div>
                        <div className="text-xs text-foreground/50">Alive</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-500">{scan.degraded}</div>
                        <div className="text-xs text-foreground/50">Degraded</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-500">{scan.dead}</div>
                        <div className="text-xs text-foreground/50">Dead</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-500">{scan.newArchives}</div>
                        <div className="text-xs text-foreground/50">Archived</div>
                      </div>
                    </div>
                    {scan.recommendations.length > 0 && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        {scan.recommendations.map((rec: string, idx: number) => (
                          <p key={idx} className="text-xs text-foreground/60">{rec}</p>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Scheduler Tab */}
        {activeTab === 'scheduler' && (
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-blue-500" />
                  Archival Scheduler
                </CardTitle>
                <CardDescription>Automated periodic scanning of all monitored links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className={`text-lg font-bold ${schedulerStatus?.enabled ? 'text-green-500' : 'text-red-500'}`}>
                      {schedulerStatus?.enabled ? 'ACTIVE' : 'STOPPED'}
                    </div>
                    <div className="text-xs text-foreground/50">Status</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-foreground">{schedulerStatus?.intervalHuman || '6h'}</div>
                    <div className="text-xs text-foreground/50">Interval</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-foreground">{schedulerStatus?.totalChecks || 0}</div>
                    <div className="text-xs text-foreground/50">Total Checks</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-sm font-medium text-foreground/70">
                      {schedulerStatus?.lastCheck ? new Date(schedulerStatus.lastCheck).toLocaleTimeString() : 'Never'}
                    </div>
                    <div className="text-xs text-foreground/50">Last Check</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  {schedulerStatus?.enabled ? (
                    <Button
                      onClick={() => stopSchedulerMutation.mutate()}
                      disabled={stopSchedulerMutation.isPending}
                      variant="outline"
                      className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop Scheduler
                    </Button>
                  ) : (
                    <Button
                      onClick={() => startSchedulerMutation.mutate({})}
                      disabled={startSchedulerMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Scheduler
                    </Button>
                  )}
                </div>

                <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground/60">
                  <p className="font-medium text-foreground/80 mb-1">How it works:</p>
                  <p>The archival scheduler automatically scans all monitored links at the configured interval (default: every 6 hours). 
                  It checks link availability, detects link rot, and automatically archives critical evidence links to the Wayback Machine. 
                  Alerts are generated for dead or degraded links, with critical evidence links receiving highest priority.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
