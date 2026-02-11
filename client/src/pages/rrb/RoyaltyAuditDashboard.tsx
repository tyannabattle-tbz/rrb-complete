import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  ArrowLeft, DollarSign, AlertTriangle, CheckCircle, Clock, Play, Square,
  RefreshCw, BarChart3, Music, Shield, FileText, TrendingUp, XCircle, Globe, Search, Upload,
} from "lucide-react";

export default function RoyaltyAuditDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: summary, refetch: refetchSummary } = trpc.royaltyAudit.getAuditSummary.useQuery(undefined, { refetchInterval: 30000 });
  const { data: sources } = trpc.royaltyAudit.getSources.useQuery({});
  const { data: discrepancies, refetch: refetchDisc } = trpc.royaltyAudit.getDiscrepancies.useQuery({});
  const { data: reports } = trpc.royaltyAudit.getAuditReports.useQuery();
  const { data: scheduler } = trpc.royaltyAudit.getSchedulerStatus.useQuery(undefined, { refetchInterval: 10000 });
  const { data: mbCrossRefs, refetch: refetchMB } = trpc.royaltyAudit.getMusicBrainzCrossRefs.useQuery();
  const { data: mbResults } = trpc.royaltyAudit.getMusicBrainzResults.useQuery();
  const { data: importHistory } = trpc.royaltyAudit.getImportHistory.useQuery();
  const [csvContent, setCsvContent] = useState('');
  const [csvPlatform, setCsvPlatform] = useState('');

  const importCSVMut = trpc.royaltyAudit.importCSV.useMutation({
    onSuccess: (data) => {
      toast.success(`CSV Import Complete — ${data.totalRows} rows processed, ${data.sourcesUpdated} updated, ${data.sourcesCreated} created, ${data.discrepanciesDetected} discrepancies detected`);
      setCsvContent('');
      refetchSummary();
      refetchDisc();
    },
    onError: (err) => toast.error(`Import Failed — ${err.message}`),
  });

  const runAuditMut = trpc.royaltyAudit.runAudit.useMutation({
    onSuccess: () => {
      toast.success("Audit Complete — Royalty audit has been executed successfully");
      refetchSummary();
      refetchDisc();
    },
  });

  const startSchedulerMut = trpc.royaltyAudit.startScheduler.useMutation({
    onSuccess: () => toast.success("Scheduler Started — Royalty audit scheduler is now active"),
  });

  const stopSchedulerMut = trpc.royaltyAudit.stopScheduler.useMutation({
    onSuccess: () => toast.info("Scheduler Stopped"),
  });

  const crossRefMBMut = trpc.royaltyAudit.crossReferenceMusicBrainz.useMutation({
    onSuccess: () => {
      toast.success("MusicBrainz cross-reference complete");
      refetchMB();
    },
    onError: () => toast.error("MusicBrainz cross-reference failed"),
  });

  const acknowledgeMut = trpc.royaltyAudit.acknowledgeDiscrepancy.useMutation({
    onSuccess: () => { refetchDisc(); toast.info("Discrepancy Acknowledged"); },
  });

  const escalateMut = trpc.royaltyAudit.escalateDiscrepancy.useMutation({
    onSuccess: () => { refetchDisc(); toast.warning("Discrepancy Escalated — Flagged for legal review"); },
  });

  const severityColor = (s: string) => {
    switch (s) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-zinc-500/20 text-zinc-400';
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'verified': return 'text-green-400';
      case 'discrepancy': return 'text-red-400';
      case 'missing': return 'text-red-500';
      case 'pending': return 'text-amber-400';
      case 'disputed': return 'text-orange-400';
      default: return 'text-zinc-400';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link href="/rrb/qumus/admin" className="text-zinc-400 hover:text-amber-400 text-sm flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> QUMUS Admin
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-500" />
            Royalty Audit Dashboard
          </h1>
          <p className="text-zinc-400 text-sm mt-1">QUMUS 12th Policy — 88% Autonomy | Cross-reference BMI with streaming payouts</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => runAuditMut.mutate()}
            disabled={runAuditMut.isPending}
            className="gap-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
          >
            <BarChart3 className="w-4 h-4" />
            {runAuditMut.isPending ? 'Auditing...' : 'Run Audit'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetchSummary()} className="gap-1">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 pb-3 text-center">
            <Music className="w-5 h-5 mx-auto mb-1 text-blue-400" />
            <div className="text-2xl font-bold">{summary?.totalSources || 0}</div>
            <div className="text-xs text-zinc-500">Royalty Sources</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 pb-3 text-center">
            <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-400" />
            <div className="text-2xl font-bold">{summary?.verifiedSources || 0}</div>
            <div className="text-xs text-zinc-500">Verified</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 pb-3 text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-amber-400" />
            <div className="text-2xl font-bold">{summary?.pendingSources || 0}</div>
            <div className="text-xs text-zinc-500">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 pb-3 text-center">
            <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-red-400" />
            <div className="text-2xl font-bold">{summary?.totalDiscrepancies || 0}</div>
            <div className="text-xs text-zinc-500">Discrepancies</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 pb-3 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
            <div className="text-2xl font-bold">{summary?.healthGrade || '—'}</div>
            <div className="text-xs text-zinc-500">Health Grade</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 pb-3 text-center">
            <BarChart3 className="w-5 h-5 mx-auto mb-1 text-purple-400" />
            <div className="text-2xl font-bold">{summary?.totalAudits || 0}</div>
            <div className="text-xs text-zinc-500">Audits Run</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sources">Sources ({sources?.length || 0})</TabsTrigger>
          <TabsTrigger value="discrepancies">Discrepancies ({discrepancies?.length || 0})</TabsTrigger>
          <TabsTrigger value="reports">Reports ({reports?.length || 0})</TabsTrigger>
          <TabsTrigger value="scheduler">Scheduler</TabsTrigger>
          <TabsTrigger value="musicbrainz">MusicBrainz</TabsTrigger>
          <TabsTrigger value="csvimport">CSV Import</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Platform Breakdown */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-400" /> Platform Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {summary?.platformBreakdown && Object.entries(summary.platformBreakdown).map(([platform, count]) => (
                  <div key={platform} className="flex justify-between items-center p-2 bg-zinc-800/50 rounded">
                    <span className="text-sm capitalize">{platform.replace(/_/g, ' ')}</span>
                    <Badge variant="outline" className="text-xs">{count} source(s)</Badge>
                  </div>
                ))}
                {!summary?.platformBreakdown && <p className="text-zinc-500 text-sm">No data yet — run an audit</p>}
              </CardContent>
            </Card>

            {/* Health Score */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" /> Audit Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-6xl font-bold mb-2" style={{
                    color: (summary?.healthScore || 0) >= 80 ? '#4ade80' : (summary?.healthScore || 0) >= 60 ? '#fbbf24' : '#f87171'
                  }}>
                    {summary?.healthScore ?? '—'}
                  </div>
                  <div className="text-zinc-400 text-sm">Health Score / 100</div>
                  <div className="text-xs text-zinc-500 mt-2">
                    {summary?.songCount || 0} songs across {summary?.platformCount || 0} platforms
                  </div>
                </div>
                <div className="mt-4 p-3 bg-zinc-800/50 rounded text-xs text-zinc-400">
                  Last audit: {summary?.lastAuditRun ? new Date(summary.lastAuditRun).toLocaleString() : 'Never'}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources" className="space-y-3">
          {sources?.map((source: any) => (
            <Card key={source.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{source.songTitle}</span>
                      <Badge variant="outline" className="text-xs capitalize">{source.platform.replace(/_/g, ' ')}</Badge>
                      <Badge variant="outline" className="text-xs">{source.type}</Badge>
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">{source.artist}</div>
                    {source.notes && <div className="text-xs text-zinc-500 mt-1">{source.notes}</div>}
                    {source.ipi && <div className="text-xs text-zinc-600 mt-1">IPI: {source.ipi}</div>}
                  </div>
                  <div className={`text-xs font-medium ${statusColor(source.status)}`}>
                    {source.status === 'verified' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                    {source.status === 'pending' && <Clock className="w-4 h-4 inline mr-1" />}
                    {source.status === 'discrepancy' && <AlertTriangle className="w-4 h-4 inline mr-1" />}
                    {source.status.toUpperCase()}
                  </div>
                </div>
                {source.totalPlays !== undefined && source.totalPlays > 0 && (
                  <div className="mt-2 flex gap-4 text-xs text-zinc-500">
                    <span>Plays: {source.totalPlays.toLocaleString()}</span>
                    <span>Rate: ${(source.expectedRate / 100).toFixed(4)}/stream</span>
                    {source.actualRate !== undefined && source.actualRate > 0 && (
                      <span>Actual: ${(source.actualRate / 100).toFixed(4)}/stream</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {(!sources || sources.length === 0) && (
            <div className="text-center py-12 text-zinc-500">No royalty sources configured</div>
          )}
        </TabsContent>

        {/* Discrepancies Tab */}
        <TabsContent value="discrepancies" className="space-y-3">
          {discrepancies && discrepancies.length > 0 ? discrepancies.map((disc: any) => (
            <Card key={disc.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={severityColor(disc.severity)}>{disc.severity}</Badge>
                      <span className="font-semibold text-sm">{disc.songTitle}</span>
                      <Badge variant="outline" className="text-xs capitalize">{disc.platform}</Badge>
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">
                      {disc.type.replace(/_/g, ' ')} — {disc.artist}
                    </div>
                    {disc.difference > 0 && (
                      <div className="text-xs text-red-400 mt-1">
                        Difference: ${(disc.difference / 100).toFixed(2)}
                      </div>
                    )}
                    <div className="text-xs text-zinc-600 mt-1">
                      Detected: {new Date(disc.detectedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {disc.status === 'open' && (
                      <>
                        <Button size="sm" variant="outline" className="text-xs h-7"
                          onClick={() => acknowledgeMut.mutate({ id: disc.id })}>
                          Ack
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs h-7 text-red-400 border-red-500/30"
                          onClick={() => escalateMut.mutate({ id: disc.id })}>
                          Escalate
                        </Button>
                      </>
                    )}
                    <Badge variant="outline" className="text-xs">{disc.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500/50 mb-3" />
              <p className="text-zinc-400">No discrepancies detected</p>
              <p className="text-zinc-600 text-sm mt-1">Run an audit to check for royalty discrepancies</p>
            </div>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-3">
          {reports && reports.length > 0 ? reports.map((report: any) => (
            <Card key={report.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      {report.title}
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">
                      Generated: {new Date(report.generatedAt).toLocaleString()}
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-zinc-500">
                      <span>Sources: {report.totalSources}</span>
                      <span>Discrepancies: {report.totalDiscrepancies}</span>
                    </div>
                    {report.recommendations?.length > 0 && (
                      <div className="mt-2 text-xs text-amber-400">
                        Recommendation: {report.recommendations[0]}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-12 text-zinc-500">
              <FileText className="w-12 h-12 mx-auto text-zinc-700 mb-3" />
              <p>No audit reports yet</p>
              <p className="text-xs text-zinc-600 mt-1">Run an audit to generate the first report</p>
            </div>
          )}
        </TabsContent>

        {/* MusicBrainz Tab */}
        <TabsContent value="musicbrainz" className="space-y-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-400" /> MusicBrainz Cross-Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-400">
                Cross-reference all monitored royalty sources against the MusicBrainz open database to verify
                song registrations, collaborator credits, ISRCs, and publisher information.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-zinc-800/50 rounded text-center">
                  <div className="text-xs text-zinc-500 mb-1">Songs Checked</div>
                  <div className="text-lg font-bold text-purple-400">{mbCrossRefs?.length || 0}</div>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded text-center">
                  <div className="text-xs text-zinc-500 mb-1">Verified</div>
                  <div className="text-lg font-bold text-green-400">
                    {mbCrossRefs?.filter((r: any) => r.creditsMatch === 'verified').length || 0}
                  </div>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded text-center">
                  <div className="text-xs text-zinc-500 mb-1">Partial</div>
                  <div className="text-lg font-bold text-amber-400">
                    {mbCrossRefs?.filter((r: any) => r.creditsMatch === 'partial').length || 0}
                  </div>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded text-center">
                  <div className="text-xs text-zinc-500 mb-1">Issues</div>
                  <div className="text-lg font-bold text-red-400">
                    {mbCrossRefs?.filter((r: any) => ['mismatch', 'missing', 'not_found'].includes(r.creditsMatch)).length || 0}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => crossRefMBMut.mutate()}
                disabled={crossRefMBMut.isPending}
                className="gap-2 bg-purple-600 hover:bg-purple-700"
              >
                <Search className="w-4 h-4" />
                {crossRefMBMut.isPending ? 'Scanning MusicBrainz...' : 'Run Cross-Reference Scan'}
              </Button>

              {/* Cross-reference results */}
              {mbCrossRefs && mbCrossRefs.length > 0 ? (
                <div className="space-y-2">
                  {mbCrossRefs.map((ref: any, i: number) => (
                    <div key={i} className="p-3 bg-zinc-800/50 rounded border border-zinc-700">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-sm flex items-center gap-2">
                          <Music className="w-4 h-4 text-purple-400" />
                          {ref.songTitle}
                          <span className="text-zinc-500 text-xs">by {ref.artist}</span>
                        </div>
                        <Badge variant="outline" className={`text-xs ${
                          ref.creditsMatch === 'verified' ? 'border-green-500/30 text-green-400' :
                          ref.creditsMatch === 'partial' ? 'border-amber-500/30 text-amber-400' :
                          'border-red-500/30 text-red-400'
                        }`}>
                          {ref.creditsMatch.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">{ref.details}</div>
                      {ref.mbRecordingId && (
                        <a
                          href={`https://musicbrainz.org/recording/${ref.mbRecordingId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-400 hover:text-purple-300 mt-1 inline-flex items-center gap-1"
                        >
                          <Globe className="w-3 h-3" /> View on MusicBrainz
                        </a>
                      )}
                      <div className="text-[10px] text-zinc-600 mt-1">
                        Checked: {new Date(ref.checkedAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  <Globe className="w-12 h-12 mx-auto text-zinc-700 mb-3" />
                  <p>No MusicBrainz cross-references yet</p>
                  <p className="text-xs text-zinc-600 mt-1">Run a cross-reference scan to verify song registrations</p>
                </div>
              )}

              {/* Recent MusicBrainz lookup results */}
              {mbResults && mbResults.length > 0 && (
                <Card className="bg-zinc-800/30 border-zinc-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-zinc-400">Recent MusicBrainz Lookups</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {mbResults.slice(0, 10).map((r: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs p-1">
                        <span className="text-zinc-300">{r.title} — {r.artist}</span>
                        <span className="text-zinc-500">Score: {r.score} | MBID: {r.mbid?.slice(0, 8)}...</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduler Tab */}
        <TabsContent value="csvimport" className="space-y-4">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Upload className="w-4 h-4 text-green-400" />
                Import Streaming Payout Data (CSV)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-zinc-400">
                Upload CSV payout reports from DistroKid, TuneCore, CD Baby, Spotify for Artists, or Apple Music Analytics.
                The system auto-detects columns: song/title/track, artist, plays/streams, earnings/revenue, platform/store, period/date.
              </p>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500">Platform (optional — auto-detected from CSV if present)</label>
                <select
                  value={csvPlatform}
                  onChange={(e) => setCsvPlatform(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200"
                >
                  <option value="">Auto-detect from CSV</option>
                  <option value="spotify">Spotify</option>
                  <option value="apple_music">Apple Music</option>
                  <option value="youtube">YouTube Music</option>
                  <option value="amazon_music">Amazon Music</option>
                  <option value="tidal">Tidal</option>
                  <option value="deezer">Deezer</option>
                  <option value="distrokid">DistroKid</option>
                  <option value="tunecore">TuneCore</option>
                  <option value="cd_baby">CD Baby</option>
                  <option value="soundexchange">SoundExchange</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500">Paste CSV content or upload file</label>
                <textarea
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  placeholder={`title,artist,streams,earnings,platform,period\n"Rockin' Rockin' Boogie","Seabrun Candy Hunter",15420,6.17,spotify,2026-Q1`}
                  className="w-full h-40 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs font-mono text-zinc-200 resize-y"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => setCsvContent(ev.target?.result as string || '');
                        reader.readAsText(file);
                      }
                    }}
                    className="text-xs text-zinc-400"
                  />
                </div>
              </div>
              <Button
                onClick={() => importCSVMut.mutate({ csvContent, platform: csvPlatform || undefined })}
                disabled={importCSVMut.isPending || !csvContent.trim()}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <Upload className="w-4 h-4" />
                {importCSVMut.isPending ? 'Importing...' : 'Import Payout Data'}
              </Button>
            </CardContent>
          </Card>

          {/* Import History */}
          {importHistory && importHistory.length > 0 && (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-sm">Import History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {importHistory.map((imp, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded text-xs">
                      <div>
                        <span className="text-zinc-200">{imp.platform}</span>
                        <span className="text-zinc-500 ml-2">{new Date(imp.importedAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-400">{imp.totalRows} rows</span>
                        <Badge variant="outline" className="text-green-400 border-green-500/30">{imp.sourcesUpdated} updated</Badge>
                        <Badge variant="outline" className="text-blue-400 border-blue-500/30">{imp.sourcesCreated} created</Badge>
                        {imp.discrepanciesDetected > 0 && (
                          <Badge variant="outline" className="text-red-400 border-red-500/30">{imp.discrepanciesDetected} discrepancies</Badge>
                        )}
                        {imp.errors.length > 0 && (
                          <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">{imp.errors.length} errors</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* CSV Format Guide */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm">Supported CSV Formats</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-zinc-400 space-y-2">
              <p><strong className="text-zinc-300">DistroKid:</strong> Title, Artist, Streams, Earnings, Store, Reporting Month</p>
              <p><strong className="text-zinc-300">TuneCore:</strong> Song, Artist Name, Quantity, Revenue, Platform, Period</p>
              <p><strong className="text-zinc-300">CD Baby:</strong> Track, Performer, Units, Amount, Service, Date</p>
              <p><strong className="text-zinc-300">Spotify for Artists:</strong> Track, Streams, Earnings (single platform)</p>
              <p><strong className="text-zinc-300">Apple Music Analytics:</strong> Title, Plays, Payout (single platform)</p>
              <p className="text-zinc-500 pt-2">The system auto-detects column names. If your CSV uses non-standard headers, select the platform override above.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduler" className="space-y-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" /> Audit Scheduler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-zinc-800/50 rounded text-center">
                  <div className="text-xs text-zinc-500 mb-1">Status</div>
                  <div className={`text-lg font-bold ${scheduler?.enabled ? 'text-green-400' : 'text-zinc-500'}`}>
                    {scheduler?.enabled ? 'ACTIVE' : 'STOPPED'}
                  </div>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded text-center">
                  <div className="text-xs text-zinc-500 mb-1">Interval</div>
                  <div className="text-lg font-bold text-cyan-400">{scheduler?.intervalHuman || '—'}</div>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded text-center">
                  <div className="text-xs text-zinc-500 mb-1">Total Audits</div>
                  <div className="text-lg font-bold">{scheduler?.totalAudits || 0}</div>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded text-center">
                  <div className="text-xs text-zinc-500 mb-1">Last Run</div>
                  <div className="text-sm font-medium text-zinc-300">
                    {scheduler?.lastRun ? new Date(scheduler.lastRun).toLocaleTimeString() : 'Never'}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {!scheduler?.enabled ? (
                  <Button
                    onClick={() => startSchedulerMut.mutate({})}
                    disabled={startSchedulerMut.isPending}
                    className="gap-1 bg-green-600 hover:bg-green-700"
                  >
                    <Play className="w-4 h-4" /> Start Scheduler
                  </Button>
                ) : (
                  <Button
                    onClick={() => stopSchedulerMut.mutate()}
                    disabled={stopSchedulerMut.isPending}
                    variant="outline"
                    className="gap-1 border-red-500/30 text-red-400"
                  >
                    <Square className="w-4 h-4" /> Stop Scheduler
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-[10px] text-zinc-600 pt-4">
        A Canryn Production and its subsidiaries — Past, Protection, Presentation, and Preservation
      </div>
    </div>
  );
}
