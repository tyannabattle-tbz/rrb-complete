import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link } from 'wouter';
import {
  Shield, Activity, AlertTriangle, CheckCircle2, XCircle,
  RefreshCw, Image, Radio, Route, Code, Package, ArrowLeft,
  Eye, EyeOff, Wrench, Clock, BarChart3, Zap
} from 'lucide-react';

type ScanCategory = 'cdn_assets' | 'route_health' | 'audio_streams' | 'dead_links' | 'code_quality' | 'dependency_health';
type IssueSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
type IssueStatus = 'open' | 'auto_fixed' | 'escalated' | 'resolved' | 'ignored';

interface CodeIssue {
  id: string;
  category: ScanCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  title: string;
  description: string;
  filePath?: string;
  lineNumber?: number;
  currentValue?: string;
  suggestedFix?: string;
  autoFixable: boolean;
  detectedAt: number;
  resolvedAt?: number;
  resolvedBy?: 'auto' | 'human';
}

const CATEGORY_META: Record<ScanCategory, { icon: typeof Image; label: string; color: string }> = {
  cdn_assets: { icon: Image, label: 'CDN Assets', color: 'text-blue-400' },
  route_health: { icon: Route, label: 'Route Health', color: 'text-green-400' },
  audio_streams: { icon: Radio, label: 'Audio Streams', color: 'text-purple-400' },
  dead_links: { icon: XCircle, label: 'Dead Links', color: 'text-red-400' },
  code_quality: { icon: Code, label: 'Code Quality', color: 'text-yellow-400' },
  dependency_health: { icon: Package, label: 'Dependencies', color: 'text-cyan-400' },
};

const SEVERITY_COLORS: Record<IssueSeverity, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-black',
  low: 'bg-blue-500 text-white',
  info: 'bg-gray-500 text-white',
};

const STATUS_COLORS: Record<IssueStatus, string> = {
  open: 'bg-red-500/20 text-red-400 border-red-500/30',
  auto_fixed: 'bg-green-500/20 text-green-400 border-green-500/30',
  escalated: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  resolved: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ignored: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function CodeMaintenanceDashboard() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanReport, setScanReport] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<ScanCategory | 'all'>('all');

  const summaryQuery = trpc.codeMaintenance.getSummary.useQuery();
  const issuesQuery = trpc.codeMaintenance.getIssues.useQuery(
    activeFilter !== 'all' ? { category: activeFilter as ScanCategory } : undefined
  );
  const historyQuery = trpc.codeMaintenance.getScanHistory.useQuery();
  const schedulerQuery = trpc.codeMaintenance.getSchedulerStatus.useQuery(undefined, { refetchInterval: 30000 });

  const startSchedulerMut = trpc.codeMaintenance.startScheduler.useMutation({
    onSuccess: () => { schedulerQuery.refetch(); toast('Scheduler started'); },
  });
  const stopSchedulerMut = trpc.codeMaintenance.stopScheduler.useMutation({
    onSuccess: () => { schedulerQuery.refetch(); toast('Scheduler stopped'); },
  });
  const updateIntervalMut = trpc.codeMaintenance.updateSchedulerInterval.useMutation({
    onSuccess: () => { schedulerQuery.refetch(); toast('Interval updated'); },
  });

  const fullScanMutation = trpc.codeMaintenance.runFullScan.useMutation({
    onSuccess: (report) => {
      setScanReport(report);
      setIsScanning(false);
      summaryQuery.refetch();
      issuesQuery.refetch();
      historyQuery.refetch();
      toast({
        title: `Scan Complete — Grade ${report.healthGrade}`,
        description: `${report.totalIssues} issues found, ${report.autoFixedCount} auto-fixed, health: ${report.overallHealth}%`,
      });
    },
    onError: (err) => {
      setIsScanning(false);
      toast({ title: 'Scan Failed', description: err.message, variant: 'destructive' });
    },
  });

  const resolveIssueMutation = trpc.codeMaintenance.resolveIssue.useMutation({
    onSuccess: () => {
      issuesQuery.refetch();
      summaryQuery.refetch();
      toast({ title: 'Issue Resolved' });
    },
  });

  const ignoreIssueMutation = trpc.codeMaintenance.ignoreIssue.useMutation({
    onSuccess: () => {
      issuesQuery.refetch();
      summaryQuery.refetch();
      toast({ title: 'Issue Ignored' });
    },
  });

  const handleFullScan = () => {
    setIsScanning(true);
    fullScanMutation.mutate();
  };

  const summary = summaryQuery.data;
  const issues = issuesQuery.data || [];
  const history = historyQuery.data || [];

  const healthGrade = scanReport?.healthGrade || (summary ? (
    summary.openIssues === 0 ? 'A' :
    summary.openIssues <= 2 ? 'B' :
    summary.openIssues <= 5 ? 'C' :
    summary.openIssues <= 10 ? 'D' : 'F'
  ) : '—');

  const healthScore = scanReport?.overallHealth || (summary ? Math.max(0, 100 - (summary.openIssues * 10)) : 0);

  const gradeColor = healthGrade === 'A' ? 'text-green-400' :
    healthGrade === 'B' ? 'text-blue-400' :
    healthGrade === 'C' ? 'text-yellow-400' :
    healthGrade === 'D' ? 'text-orange-400' : 'text-red-400';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/rrb/qumus/admin">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-1" /> QUMUS Admin
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-700" />
            <Shield className="w-6 h-6 text-amber-400" />
            <div>
              <h1 className="text-lg font-bold">Code Maintenance</h1>
              <p className="text-xs text-gray-400">QUMUS Policy #9 — Autonomous Asset Health</p>
            </div>
          </div>
          <Button
            onClick={handleFullScan}
            disabled={isScanning}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isScanning ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Scanning...</>
            ) : (
              <><Zap className="w-4 h-4 mr-2" /> Run Full Scan</>
            )}
          </Button>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Health Grade */}
          <Card className="bg-gray-900/60 border-gray-800">
            <CardContent className="pt-6 text-center">
              <div className={`text-6xl font-black ${gradeColor}`}>{healthGrade}</div>
              <div className="text-sm text-gray-400 mt-1">Health Grade</div>
              <div className="text-xs text-gray-500 mt-1">{healthScore}% overall</div>
            </CardContent>
          </Card>

          {/* Issue Counts */}
          <Card className="bg-gray-900/60 border-gray-800">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Open Issues</span>
                <span className="text-xl font-bold text-red-400">{summary?.openIssues || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Auto-Fixed</span>
                <span className="text-xl font-bold text-green-400">{summary?.autoFixedIssues || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Escalated</span>
                <span className="text-xl font-bold text-orange-400">{summary?.escalatedIssues || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Scan Stats */}
          <Card className="bg-gray-900/60 border-gray-800">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Total Scans</span>
                <span className="text-xl font-bold">{summary?.scanCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Total Issues</span>
                <span className="text-xl font-bold">{summary?.totalIssues || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Resolved</span>
                <span className="text-xl font-bold text-blue-400">{summary?.resolvedIssues || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Last Scan */}
          <Card className="bg-gray-900/60 border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Last Scan</span>
              </div>
              <div className="text-lg font-semibold">
                {summary?.lastScanAt
                  ? new Date(summary.lastScanAt).toLocaleString()
                  : 'No scans yet'}
              </div>
              {scanReport && (
                <div className="mt-3 space-y-1">
                  {scanReport.recommendations?.map((rec: string, i: number) => (
                    <p key={i} className="text-xs text-gray-400">• {rec}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Scheduler Control */}
        <Card className="bg-gray-900/60 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold">Automated Scan Scheduler</h3>
              </div>
              <Badge variant="outline" className={schedulerQuery.data?.enabled ? 'border-green-500 text-green-400' : 'border-gray-600 text-gray-400'}>
                {schedulerQuery.data?.enabled ? '● Active' : '○ Stopped'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
              <div>
                <p className="text-xs text-gray-400 mb-1">Interval</p>
                <p className="text-lg font-bold">{schedulerQuery.data?.intervalHuman || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Scheduled Scans</p>
                <p className="text-lg font-bold">{schedulerQuery.data?.totalScheduledScans ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Next Scan</p>
                <p className="text-sm font-medium">
                  {schedulerQuery.data?.nextScanEstimate
                    ? new Date(schedulerQuery.data.nextScanEstimate).toLocaleTimeString()
                    : '—'}
                </p>
              </div>
              <div className="flex gap-2">
                {schedulerQuery.data?.enabled ? (
                  <Button size="sm" variant="outline" className="text-red-400 border-red-500/30 hover:bg-red-500/10" onClick={() => stopSchedulerMut.mutate()}>Stop</Button>
                ) : (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => startSchedulerMut.mutate()}>Start</Button>
                )}
              </div>
              <div className="flex gap-1">
                {[1, 3, 6, 12].map(h => (
                  <Button
                    key={h}
                    size="sm"
                    variant="outline"
                    className={`text-xs px-2 ${
                      schedulerQuery.data?.intervalMs === h * 60 * 60 * 1000
                        ? 'border-amber-500 text-amber-400'
                        : 'border-gray-700 text-gray-400'
                    }`}
                    onClick={() => updateIntervalMut.mutate({ intervalMs: h * 60 * 60 * 1000 })}
                  >
                    {h}h
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {(Object.entries(CATEGORY_META) as [ScanCategory, typeof CATEGORY_META[ScanCategory]][]).map(([cat, meta]) => {
            const Icon = meta.icon;
            const count = summary?.categoryCounts?.[cat] || 0;
            const isActive = activeFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(isActive ? 'all' : cat)}
                className={`p-3 rounded-lg border transition-all text-left ${
                  isActive
                    ? 'bg-amber-600/20 border-amber-500/50'
                    : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${meta.color} mb-1`} />
                <div className="text-xs font-medium truncate">{meta.label}</div>
                <div className="text-lg font-bold">{count}</div>
              </button>
            );
          })}
        </div>

        {/* Scan Report Results */}
        {scanReport && (
          <Card className="bg-gray-900/60 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                Latest Scan Report
              </CardTitle>
              <CardDescription>
                {scanReport.scanResults?.length || 0} categories scanned at{' '}
                {new Date(scanReport.generatedAt).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scanReport.scanResults?.map((result: any) => {
                  const meta = CATEGORY_META[result.category as ScanCategory];
                  if (!meta) return null;
                  const Icon = meta.icon;
                  return (
                    <div key={result.scanId} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-4 h-4 ${meta.color}`} />
                        <span className="text-sm font-medium">{meta.label}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-bold">{result.itemsScanned}</div>
                          <div className="text-xs text-gray-500">Scanned</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-red-400">{result.issuesFound}</div>
                          <div className="text-xs text-gray-500">Issues</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-400">{result.issuesAutoFixed}</div>
                          <div className="text-xs text-gray-500">Fixed</div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {result.completedAt - result.startedAt}ms
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Issues List */}
        <Card className="bg-gray-900/60 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Issues
              {activeFilter !== 'all' && (
                <Badge variant="outline" className="ml-2">
                  {CATEGORY_META[activeFilter]?.label}
                  <button onClick={() => setActiveFilter('all')} className="ml-1 text-gray-400 hover:text-white">×</button>
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {issues.length} issue{issues.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {issues.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500/50" />
                <p className="text-lg font-medium">All Clear</p>
                <p className="text-sm">No issues detected. Run a scan to check ecosystem health.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {issues.map((issue: CodeIssue) => {
                  const catMeta = CATEGORY_META[issue.category];
                  const CatIcon = catMeta?.icon || AlertTriangle;
                  return (
                    <div key={issue.id} className="p-4 rounded-lg bg-gray-800/40 border border-gray-700 hover:border-gray-600 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <CatIcon className={`w-5 h-5 mt-0.5 ${catMeta?.color || 'text-gray-400'}`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{issue.title}</span>
                              <Badge className={SEVERITY_COLORS[issue.severity]} variant="outline">
                                {issue.severity}
                              </Badge>
                              <Badge className={STATUS_COLORS[issue.status]} variant="outline">
                                {issue.status.replace('_', ' ')}
                              </Badge>
                              {issue.autoFixable && (
                                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                                  <Wrench className="w-3 h-3 mr-1" /> Auto-fixable
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{issue.description}</p>
                            {issue.suggestedFix && (
                              <p className="text-xs text-amber-400/80 mt-1">
                                Suggested fix: {issue.suggestedFix}
                              </p>
                            )}
                            {issue.filePath && (
                              <p className="text-xs text-gray-500 mt-1 font-mono">
                                {issue.filePath}{issue.lineNumber ? `:${issue.lineNumber}` : ''}
                              </p>
                            )}
                            <p className="text-xs text-gray-600 mt-1">
                              Detected: {new Date(issue.detectedAt).toLocaleString()}
                              {issue.resolvedAt && ` • Resolved: ${new Date(issue.resolvedAt).toLocaleString()}`}
                              {issue.resolvedBy && ` by ${issue.resolvedBy}`}
                            </p>
                          </div>
                        </div>
                        {issue.status === 'open' && (
                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-400 border-green-500/30 hover:bg-green-500/10"
                              onClick={() => resolveIssueMutation.mutate({ issueId: issue.id })}
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Resolve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-gray-400 border-gray-600 hover:bg-gray-700"
                              onClick={() => ignoreIssueMutation.mutate({ issueId: issue.id })}
                            >
                              <EyeOff className="w-3 h-3 mr-1" /> Ignore
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scan History */}
        {history.length > 0 && (
          <Card className="bg-gray-900/60 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                Scan History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" role="table" aria-label="Scan history">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="text-left py-2 pr-4">Category</th>
                      <th className="text-right py-2 px-4">Scanned</th>
                      <th className="text-right py-2 px-4">Issues</th>
                      <th className="text-right py-2 px-4">Auto-Fixed</th>
                      <th className="text-right py-2 px-4">Duration</th>
                      <th className="text-right py-2 pl-4">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice(0, 20).map((scan: any) => {
                      const meta = CATEGORY_META[scan.category as ScanCategory];
                      return (
                        <tr key={scan.scanId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="py-2 pr-4">
                            <span className={meta?.color || 'text-gray-400'}>{meta?.label || scan.category}</span>
                          </td>
                          <td className="text-right py-2 px-4">{scan.itemsScanned}</td>
                          <td className="text-right py-2 px-4">
                            <span className={scan.issuesFound > 0 ? 'text-red-400' : 'text-green-400'}>
                              {scan.issuesFound}
                            </span>
                          </td>
                          <td className="text-right py-2 px-4 text-green-400">{scan.issuesAutoFixed}</td>
                          <td className="text-right py-2 px-4 text-gray-500">{scan.completedAt - scan.startedAt}ms</td>
                          <td className="text-right py-2 pl-4 text-gray-500 text-xs">
                            {new Date(scan.startedAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Policy Info */}
        <Card className="bg-gray-900/60 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              About Code Maintenance Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-400 space-y-3">
            <p>
              The Code Maintenance policy is QUMUS's 9th autonomous decision policy, operating at 90% autonomy.
              It continuously monitors the ecosystem for broken images, dead links, stale CDN assets, audio stream
              failures, and code health issues.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                <h4 className="font-medium text-white mb-2">Autonomous Actions (90%)</h4>
                <ul className="space-y-1 text-xs">
                  <li>• CDN asset validation and health scoring</li>
                  <li>• Audio stream availability monitoring</li>
                  <li>• Route registry consistency checks</li>
                  <li>• Code pattern anti-pattern detection</li>
                  <li>• Dependency version monitoring</li>
                  <li>• Auto-fix for known safe patterns</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                <h4 className="font-medium text-white mb-2">Human Review (10%)</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Broken CDN images requiring re-upload</li>
                  <li>• Multiple audio streams down simultaneously</li>
                  <li>• Critical dependency vulnerabilities</li>
                  <li>• Code changes that affect multiple pages</li>
                  <li>• New anti-patterns not in the known list</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
