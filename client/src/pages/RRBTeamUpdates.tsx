import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Bell, CheckCircle, Clock, AlertTriangle, Shield, Zap,
  Send, Earth, ChevronDown, ChevronUp, Rocket, Users,
  FileText, Radio, Settings, ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  major: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  minor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  patch: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const CATEGORY_ICONS: Record<string, typeof Zap> = {
  feature: Rocket,
  bugfix: Shield,
  security: Shield,
  content: FileText,
  infrastructure: Settings,
};

export default function RRBTeamUpdates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPublish, setShowPublish] = useState(false);
  const [expandedUpdate, setExpandedUpdate] = useState<number | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookService, setWebhookService] = useState<"slack" | "discord" | "teams" | "custom">("slack");

  // Form state for publishing
  const [newUpdate, setNewUpdate] = useState({
    version: "",
    title: "",
    changelog: "",
    category: "feature" as const,
    severity: "minor" as const,
    affectedSystems: "QUMUS, RRB, HybridCast, Sweet Miracles",
  });

  // Queries
  const updatesQuery = trpc.chunk5.teamUpdates.getUpdates.useQuery({ limit: 50 });
  const statsQuery = trpc.chunk5.teamUpdates.getDeliveryStats.useQuery();
  const pendingQuery = trpc.chunk5.teamUpdates.getMyPendingUpdates.useQuery(undefined, {
    enabled: !!user,
  });

  // Mutations
  const publishMutation = trpc.chunk5.teamUpdates.publishUpdate.useMutation({
    onSuccess: (data) => {
      toast({ title: "Update Published", description: `v${data.version} — ${data.notifiedCount} team members notified` });
      setShowPublish(false);
      setNewUpdate({ version: "", title: "", changelog: "", category: "feature", severity: "minor", affectedSystems: "QUMUS, RRB, HybridCast, Sweet Miracles" });
      updatesQuery.refetch();
      statsQuery.refetch();
      pendingQuery.refetch();
    },
    onError: (err) => toast({ title: "Publish Failed", description: err.message, variant: "destructive" }),
  });

  const acknowledgeMutation = trpc.chunk5.teamUpdates.acknowledgeUpdate.useMutation({
    onSuccess: () => {
      toast({ title: "Update Acknowledged" });
      pendingQuery.refetch();
      updatesQuery.refetch();
    },
  });

  const applyMutation = trpc.chunk5.teamUpdates.applyUpdate.useMutation({
    onSuccess: () => {
      toast({ title: "Update Applied", description: "Your environment is now up to date" });
      pendingQuery.refetch();
      updatesQuery.refetch();
      statsQuery.refetch();
    },
  });

  const webhookMutation = trpc.chunk5.teamUpdates.dispatchWebhook.useMutation({
    onSuccess: (data) => {
      if (data.delivered) {
        toast({ title: "Webhook Sent", description: `Successfully dispatched to ${data.service}` });
      } else {
        toast({ title: "Webhook Failed", description: data.error || "Unknown error", variant: "destructive" });
      }
    },
  });

  const stats = statsQuery.data;
  const pending = pendingQuery.data || [];
  const updates = updatesQuery.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-gray-950/80 backdrop-blur-sm">
        <div className="container py-6">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/qumus" className="text-purple-400 hover:text-purple-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-amber-500 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
                RRB Team Updates
              </h1>
              <p className="text-sm text-gray-400">Seamless update delivery for the entire Canryn Production team</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Updates", value: stats?.totalUpdates || 0, icon: Rocket, color: "purple" },
            { label: "Notifications Sent", value: stats?.totalNotifications || 0, icon: Send, color: "amber" },
            { label: "Delivery Rate", value: `${stats?.deliveredRate || 0}%`, icon: CheckCircle, color: "emerald" },
            { label: "Acknowledged", value: `${stats?.acknowledgedRate || 0}%`, icon: Users, color: "blue" },
            { label: "Applied", value: `${stats?.appliedRate || 0}%`, icon: Zap, color: "amber" },
          ].map((stat, i) => (
            <Card key={i} className="bg-gray-900/60 border-purple-500/20">
              <CardContent className="pt-4 pb-4 text-center">
                <stat.icon className={`w-5 h-5 mx-auto mb-1 text-${stat.color}-400`} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pending Updates Alert */}
        {pending.length > 0 && (
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-400 flex items-center gap-2 text-lg">
                <AlertTriangle className="w-5 h-5" />
                {pending.length} Pending Update{pending.length > 1 ? "s" : ""} Require Your Attention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pending.map((update) => (
                <div key={update.id} className="flex items-center justify-between bg-gray-900/60 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Badge className={SEVERITY_COLORS[update.severity || "minor"]}>
                      {update.severity}
                    </Badge>
                    <div>
                      <span className="font-semibold text-white">v{update.version}</span>
                      <span className="text-gray-400 ml-2">{update.title}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!update.acknowledgedAt && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                        onClick={() => acknowledgeMutation.mutate({ updateId: update.id })}
                        disabled={acknowledgeMutation.isPending}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" /> Acknowledge
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500"
                      onClick={() => applyMutation.mutate({ updateId: update.id })}
                      disabled={applyMutation.isPending}
                    >
                      <Zap className="w-3 h-3 mr-1" /> Apply Update
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Publish New Update (Admin) */}
        {user && (
          <Card className="bg-gray-900/60 border-purple-500/20">
            <CardHeader className="cursor-pointer" onClick={() => setShowPublish(!showPublish)}>
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2 text-purple-400">
                  <Rocket className="w-5 h-5" /> Publish New Update
                </span>
                {showPublish ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </CardTitle>
            </CardHeader>
            {showPublish && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Version</label>
                    <Input
                      placeholder="e.g. 3.2.0"
                      value={newUpdate.version}
                      onChange={(e) => setNewUpdate(prev => ({ ...prev, version: e.target.value }))}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Category</label>
                    <select
                      value={newUpdate.category}
                      onChange={(e) => setNewUpdate(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full h-10 rounded-md bg-gray-800 border border-gray-700 text-white px-3"
                    >
                      <option value="feature">Feature</option>
                      <option value="bugfix">Bug Fix</option>
                      <option value="security">Security</option>
                      <option value="content">Content</option>
                      <option value="infrastructure">Infrastructure</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Severity</label>
                    <select
                      value={newUpdate.severity}
                      onChange={(e) => setNewUpdate(prev => ({ ...prev, severity: e.target.value as any }))}
                      className="w-full h-10 rounded-md bg-gray-800 border border-gray-700 text-white px-3"
                    >
                      <option value="critical">Critical</option>
                      <option value="major">Major</option>
                      <option value="minor">Minor</option>
                      <option value="patch">Patch</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Title</label>
                  <Input
                    placeholder="Brief description of the update"
                    value={newUpdate.title}
                    onChange={(e) => setNewUpdate(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Changelog (Markdown supported)</label>
                  <Textarea
                    placeholder="Detailed changelog with all changes, fixes, and improvements..."
                    value={newUpdate.changelog}
                    onChange={(e) => setNewUpdate(prev => ({ ...prev, changelog: e.target.value }))}
                    className="bg-gray-800 border-gray-700 min-h-[120px]"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Affected Systems</label>
                  <Input
                    placeholder="QUMUS, RRB, HybridCast, Sweet Miracles"
                    value={newUpdate.affectedSystems}
                    onChange={(e) => setNewUpdate(prev => ({ ...prev, affectedSystems: e.target.value }))}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500"
                    onClick={() => publishMutation.mutate(newUpdate)}
                    disabled={publishMutation.isPending || !newUpdate.version || !newUpdate.title || !newUpdate.changelog}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {publishMutation.isPending ? "Publishing..." : "Publish & Notify Team"}
                  </Button>
                </div>

                {/* Webhook Dispatch */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <Earth className="w-4 h-4" /> External Webhook Dispatch
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select
                      value={webhookService}
                      onChange={(e) => setWebhookService(e.target.value as any)}
                      className="h-10 rounded-md bg-gray-800 border border-gray-700 text-white px-3"
                    >
                      <option value="slack">Slack</option>
                      <option value="discord">Discord</option>
                      <option value="teams">Microsoft Teams</option>
                      <option value="custom">Custom Webhook</option>
                    </select>
                    <Input
                      placeholder="https://hooks.slack.com/services/..."
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="bg-gray-800 border-gray-700 md:col-span-2"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Dispatch update notifications to Slack, Discord, Teams, or any custom webhook endpoint.
                    The payload is automatically formatted for each service.
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Update History / Changelog Feed */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" /> Update History
          </h2>
          {updates.length === 0 ? (
            <Card className="bg-gray-900/60 border-purple-500/20">
              <CardContent className="py-12 text-center">
                <Radio className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">No updates published yet. Use the form above to publish the first update.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {updates.map((update) => {
                const CategoryIcon = CATEGORY_ICONS[update.category || "feature"] || Rocket;
                const isExpanded = expandedUpdate === update.id;
                return (
                  <Card key={update.id} className="bg-gray-900/60 border-purple-500/20 hover:border-purple-500/40 transition-colors">
                    <CardContent className="pt-4 pb-4">
                      <div
                        className="flex items-start justify-between cursor-pointer"
                        onClick={() => setExpandedUpdate(isExpanded ? null : update.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mt-1">
                            <CategoryIcon className="w-4 h-4 text-purple-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white">v{update.version}</span>
                              <Badge className={SEVERITY_COLORS[update.severity || "minor"]} variant="outline">
                                {update.severity}
                              </Badge>
                              <Badge variant="outline" className="border-gray-600 text-gray-400">
                                {update.category}
                              </Badge>
                              {update.status === "deployed" && (
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30" variant="outline">
                                  <CheckCircle className="w-3 h-3 mr-1" /> Deployed
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-white font-semibold mt-1">{update.title}</h3>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {update.publishedAt ? new Date(update.publishedAt).toLocaleDateString() : "Draft"}
                              </span>
                              {update.publishedBy && (
                                <span>by {update.publishedBy}</span>
                              )}
                              {update.affectedSystems && (
                                <span className="text-purple-400">{update.affectedSystems}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pl-11 space-y-3">
                          <div className="bg-gray-800/60 rounded-lg p-4 text-sm text-gray-300 whitespace-pre-wrap border border-gray-700/50">
                            {update.changelog}
                          </div>
                          <div className="flex gap-2">
                            {user && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    acknowledgeMutation.mutate({ updateId: update.id });
                                  }}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" /> Acknowledge
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    applyMutation.mutate({ updateId: update.id });
                                  }}
                                >
                                  <Zap className="w-3 h-3 mr-1" /> Apply
                                </Button>
                                {webhookUrl && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      webhookMutation.mutate({
                                        updateId: update.id,
                                        webhookUrl,
                                        service: webhookService,
                                      });
                                    }}
                                  >
                                    <Earth className="w-3 h-3 mr-1" /> Send to {webhookService}
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-purple-500/10">
          <p className="text-xs text-gray-500">
            Canryn Production — QUMUS Autonomous Orchestration Engine
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Updates are automatically dispatched to all team members via in-app notifications, email digests, and configured webhooks.
          </p>
        </div>
      </div>
    </div>
  );
}
