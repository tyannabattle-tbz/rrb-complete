import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Bot,
  FileText,
  CheckCircle,
  XCircle,
  Send,
  Clock,
  Sparkles,
  Play,
  Square,
  RefreshCw,
  Zap,
} from "lucide-react";

export default function AIContentDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "templates" | "content" | "reports" | "scheduler">("overview");

  const { data: summary } = trpc.aiContentGeneration.getSummary.useQuery();
  const { data: templates } = trpc.aiContentGeneration.getTemplates.useQuery({});
  const { data: content } = trpc.aiContentGeneration.getGeneratedContent.useQuery({});
  const { data: reports } = trpc.aiContentGeneration.getReports.useQuery();
  const { data: scheduler } = trpc.aiContentGeneration.getSchedulerStatus.useQuery();

  const utils = trpc.useUtils();

  const runGeneration = trpc.aiContentGeneration.runGeneration.useMutation({
    onSuccess: (report) => {
      toast.success(`Generated ${report.contentGenerated} items (${report.autoApproved} auto-approved)`);
      utils.aiContentGeneration.invalidate();
    },
    onError: () => toast.error("Generation failed"),
  });

  const approveContent = trpc.aiContentGeneration.approveContent.useMutation({
    onSuccess: () => { toast.success("Content approved"); utils.aiContentGeneration.invalidate(); },
    onError: () => toast.error("Approve failed — please log in"),
  });

  const rejectContent = trpc.aiContentGeneration.rejectContent.useMutation({
    onSuccess: () => { toast.success("Content rejected"); utils.aiContentGeneration.invalidate(); },
    onError: () => toast.error("Reject failed — please log in"),
  });

  const publishContent = trpc.aiContentGeneration.publishContent.useMutation({
    onSuccess: () => { toast.success("Content published"); utils.aiContentGeneration.invalidate(); },
    onError: () => toast.error("Publish failed — please log in"),
  });

  const startScheduler = trpc.aiContentGeneration.startScheduler.useMutation({
    onSuccess: () => { toast.success("Scheduler started"); utils.aiContentGeneration.invalidate(); },
    onError: () => toast.error("Failed — please log in"),
  });

  const stopScheduler = trpc.aiContentGeneration.stopScheduler.useMutation({
    onSuccess: () => { toast.success("Scheduler stopped"); utils.aiContentGeneration.invalidate(); },
    onError: () => toast.error("Failed — please log in"),
  });

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: Sparkles },
    { id: "templates" as const, label: "Templates", icon: FileText },
    { id: "content" as const, label: "Generated", icon: Bot },
    { id: "reports" as const, label: "Reports", icon: Zap },
    { id: "scheduler" as const, label: "Scheduler", icon: Clock },
  ];

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      active: "bg-green-500/20 text-green-400",
      paused: "bg-yellow-500/20 text-yellow-400",
      draft: "bg-gray-500/20 text-gray-400",
      approved: "bg-green-500/20 text-green-400",
      pending_review: "bg-yellow-500/20 text-yellow-400",
      rejected: "bg-red-500/20 text-red-400",
      published: "bg-blue-500/20 text-blue-400",
    };
    return map[s] || "bg-gray-500/20 text-gray-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="container max-w-7xl py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/rrb/qumus/admin">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bot className="h-8 w-8 text-violet-400" />
              AI Content Generation
              <Badge className="bg-violet-500/20 text-violet-300 text-xs">Policy #14</Badge>
            </h1>
            <p className="text-gray-400 mt-1">Auto-generate show descriptions, social posts, broadcast schedules & promotional content</p>
          </div>
          <Button onClick={() => runGeneration.mutate()} disabled={runGeneration.isPending} className="bg-violet-600 hover:bg-violet-700">
            <Sparkles className="h-4 w-4 mr-2" />
            {runGeneration.isPending ? "Generating..." : "Run Generation"}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(t => (
            <Button key={t.id} variant={activeTab === t.id ? "default" : "outline"} size="sm"
              onClick={() => setActiveTab(t.id)}
              className={activeTab === t.id ? "bg-violet-600" : "border-gray-700 text-gray-300"}>
              <t.icon className="h-4 w-4 mr-2" />{t.label}
            </Button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-violet-400">{summary?.totalTemplates ?? 0}</div>
                  <div className="text-sm text-gray-400">Templates</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-green-400">{summary?.totalGenerated ?? 0}</div>
                  <div className="text-sm text-gray-400">Generated</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-yellow-400">{summary?.pendingReview ?? 0}</div>
                  <div className="text-sm text-gray-400">Pending Review</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-blue-400">{summary?.published ?? 0}</div>
                  <div className="text-sm text-gray-400">Published</div>
                </CardContent>
              </Card>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader><CardTitle className="text-white">Autonomy Status</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-gray-400">Autonomy Level</span><span className="text-violet-400 font-bold">82%</span></div>
                    <div className="w-full bg-gray-700 rounded-full h-3"><div className="bg-violet-500 h-3 rounded-full" style={{ width: "82%" }} /></div>
                    <div className="flex justify-between"><span className="text-gray-400">Avg Confidence</span><span className="text-green-400">{summary?.avgConfidence ?? 0}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Top Channel</span><span className="text-amber-400">{summary?.topChannel ?? "none"}</span></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader><CardTitle className="text-white">Recent Activity</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-gray-300">{summary?.recentActivity ?? "No generation runs yet"}</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between"><span className="text-gray-400">Active Templates</span><span className="text-green-400">{summary?.activeTemplates ?? 0}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Approved</span><span className="text-green-400">{summary?.approved ?? 0}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Scheduler</span><Badge className={scheduler?.running ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>{scheduler?.running ? "Running" : "Stopped"}</Badge></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === "templates" && (
          <div className="space-y-4">
            {templates?.map(t => (
              <Card key={t.id} className="bg-gray-800/50 border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{t.name}</h3>
                        <Badge className={statusColor(t.status)}>{t.status}</Badge>
                        <Badge variant="outline" className="border-gray-600 text-gray-400">{t.type.replace(/_/g, ' ')}</Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{t.prompt.substring(0, 120)}...</p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>Channel: {t.channel}</span>
                        <span>Tone: {t.tone}</span>
                        <span>Max: {t.maxLength} chars</span>
                        <span>Generated: {t.generationCount}x</span>
                        {t.lastGenerated && <span>Last: {new Date(t.lastGenerated).toLocaleString()}</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Generated Content Tab */}
        {activeTab === "content" && (
          <div className="space-y-4">
            {(!content || content.length === 0) && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="pt-6 text-center text-gray-400">
                  <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No content generated yet. Click "Run Generation" to create content from your templates.</p>
                </CardContent>
              </Card>
            )}
            {content?.map(c => (
              <Card key={c.id} className="bg-gray-800/50 border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{c.templateName}</h3>
                        <Badge className={statusColor(c.status)}>{c.status.replace(/_/g, ' ')}</Badge>
                      </div>
                      <div className="flex gap-3 text-xs text-gray-500">
                        <span>{c.channel}</span>
                        <span>{c.wordCount} words</span>
                        <span>{c.confidence}% confidence</span>
                        <span>{new Date(c.generatedAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {c.status === "pending_review" && (
                        <>
                          <Button size="sm" variant="outline" className="border-green-600 text-green-400 hover:bg-green-600/20" onClick={() => approveContent.mutate({ id: c.id })}>
                            <CheckCircle className="h-4 w-4 mr-1" />Approve
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-600/20" onClick={() => rejectContent.mutate({ id: c.id })}>
                            <XCircle className="h-4 w-4 mr-1" />Reject
                          </Button>
                        </>
                      )}
                      {c.status === "approved" && (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => publishContent.mutate({ id: c.id })}>
                          <Send className="h-4 w-4 mr-1" />Publish
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 text-gray-300 text-sm whitespace-pre-wrap">{c.content}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            {(!reports || reports.length === 0) && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="pt-6 text-center text-gray-400">
                  <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No generation reports yet. Run a generation to see reports here.</p>
                </CardContent>
              </Card>
            )}
            {reports?.map(r => (
              <Card key={r.id} className="bg-gray-800/50 border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-violet-400" />
                      <span className="font-semibold text-white">{r.id}</span>
                      <span className="text-gray-400 text-sm">{new Date(r.timestamp).toLocaleString()}</span>
                    </div>
                    <Badge className="bg-violet-500/20 text-violet-300">{r.avgConfidence}% avg</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div><div className="text-lg font-bold text-white">{r.templatesProcessed}</div><div className="text-xs text-gray-500">Templates</div></div>
                    <div><div className="text-lg font-bold text-green-400">{r.contentGenerated}</div><div className="text-xs text-gray-500">Generated</div></div>
                    <div><div className="text-lg font-bold text-blue-400">{r.autoApproved}</div><div className="text-xs text-gray-500">Auto-Approved</div></div>
                    <div><div className="text-lg font-bold text-yellow-400">{r.escalatedForReview}</div><div className="text-xs text-gray-500">Escalated</div></div>
                    <div><div className="text-lg font-bold text-red-400">{r.errors}</div><div className="text-xs text-gray-500">Errors</div></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Scheduler Tab */}
        {activeTab === "scheduler" && (
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader><CardTitle className="text-white flex items-center gap-2"><Clock className="h-5 w-5 text-violet-400" />Scheduler Control</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold text-white">Status: <span className={scheduler?.running ? "text-green-400" : "text-gray-400"}>{scheduler?.running ? "RUNNING" : "STOPPED"}</span></div>
                      <div className="text-sm text-gray-400">Interval: 4 hours (auto-generate content for all active templates)</div>
                    </div>
                    <div className="flex gap-2">
                      {!scheduler?.running ? (
                        <Button onClick={() => startScheduler.mutate({})} className="bg-green-600 hover:bg-green-700">
                          <Play className="h-4 w-4 mr-2" />Start
                        </Button>
                      ) : (
                        <Button onClick={() => stopScheduler.mutate()} variant="destructive">
                          <Square className="h-4 w-4 mr-2" />Stop
                        </Button>
                      )}
                      <Button variant="outline" className="border-gray-600" onClick={() => runGeneration.mutate()} disabled={runGeneration.isPending}>
                        <RefreshCw className="h-4 w-4 mr-2" />Run Now
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center bg-gray-900/50 rounded-lg p-4">
                    <div><div className="text-2xl font-bold text-violet-400">{scheduler?.totalRuns ?? 0}</div><div className="text-xs text-gray-500">Total Runs</div></div>
                    <div><div className="text-2xl font-bold text-green-400">{summary?.totalGenerated ?? 0}</div><div className="text-xs text-gray-500">Total Generated</div></div>
                    <div><div className="text-sm text-gray-300">{scheduler?.lastRun ? new Date(scheduler.lastRun).toLocaleString() : "Never"}</div><div className="text-xs text-gray-500">Last Run</div></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
