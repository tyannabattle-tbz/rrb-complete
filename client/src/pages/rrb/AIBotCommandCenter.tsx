/**
 * AI Bot Command Center — Central management for all AI business assistants
 * Shows real-time status, controls, activity feeds, and insights for all 5 bots
 * plus QUMUS autonomous decision engine status.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { AIAssistantPanel } from "@/components/rrb/AIAssistantPanel";

const BOT_META: Record<string, { icon: string; gradient: string; label: string }> = {
  bot_bookkeeping: { icon: "📊", gradient: "from-emerald-600 to-emerald-800", label: "Bookkeeping" },
  bot_hr: { icon: "👥", gradient: "from-blue-600 to-blue-800", label: "Human Resources" },
  bot_accounting: { icon: "💰", gradient: "from-amber-600 to-amber-800", label: "Accounting" },
  bot_legal: { icon: "⚖️", gradient: "from-purple-600 to-purple-800", label: "Legal & Compliance" },
  bot_radio_directory: { icon: "📻", gradient: "from-rose-600 to-rose-800", label: "Radio Directory" },
  bot_social_media: { icon: "📱", gradient: "from-cyan-600 to-cyan-800", label: "Social Media" },
  bot_content_calendar: { icon: "📅", gradient: "from-indigo-600 to-indigo-800", label: "Content Calendar" },
  bot_engagement: { icon: "💬", gradient: "from-pink-600 to-pink-800", label: "Community Engagement" },
  bot_grant_discovery: { icon: "🔍", gradient: "from-teal-600 to-teal-800", label: "Grant Discovery" },
  bot_emergency: { icon: "🚨", gradient: "from-red-600 to-red-800", label: "Emergency & Crisis" },
};

function formatUptime(ms: number): string {
  if (ms < 60000) return `${Math.floor(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
}

export default function AIBotCommandCenter() {
  const [selectedBot, setSelectedBot] = useState<string | null>(null);

  const { data: status, refetch: refetchStatus } = trpc.aiBusinessAssistants.getStatus.useQuery(
    undefined,
    { refetchInterval: 15000 }
  );

  const { data: recentActions } = trpc.aiBusinessAssistants.getRecentActions.useQuery(
    { limit: 30 },
    { refetchInterval: 20000 }
  );

  const { data: insights } = trpc.aiBusinessAssistants.getInsights.useQuery(
    { limit: 10 },
    { refetchInterval: 30000 }
  );

  const enableMutation = trpc.aiBusinessAssistants.enableBot.useMutation({
    onSuccess: () => { toast.success("Bot enabled"); refetchStatus(); },
    onError: (e) => toast.error(e.message),
  });

  const disableMutation = trpc.aiBusinessAssistants.disableBot.useMutation({
    onSuccess: () => { toast.success("Bot disabled"); refetchStatus(); },
    onError: (e) => toast.error(e.message),
  });

  const triggerMutation = trpc.aiBusinessAssistants.triggerBot.useMutation({
    onSuccess: (data) => {
      toast.success(`Generated ${data.actionsGenerated} new insights`);
      refetchStatus();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-accent/20 via-background to-purple-900/20 border-b border-border">
        <div className="container py-8 sm:py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-2xl" role="img" aria-label="AI Brain">🧠</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">AI Bot Command Center</h1>
              <p className="text-muted-foreground text-sm">
                QUMUS Autonomous Business Operations — 90% AI / 10% Human Override
              </p>
            </div>
          </div>

          {/* System Status Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-lg font-bold flex items-center gap-2">
                {status?.isRunning ? (
                  <><span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" /> Active</>
                ) : (
                  <><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Stopped</>
                )}
              </p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground">Active Bots</p>
              <p className="text-lg font-bold">{status?.activeBots || 0} / {status?.totalBots || 5}</p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground">Total Actions</p>
              <p className="text-lg font-bold">{status?.totalActions || 0}</p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground">Total Runs</p>
              <p className="text-lg font-bold">{status?.totalRuns || 0}</p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground">Uptime</p>
              <p className="text-lg font-bold">{formatUptime(status?.uptime || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 sm:py-8">
        {/* Bot Cards Grid */}
        <h2 className="text-xl font-bold mb-4">AI Business Assistants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {status?.bots?.map(bot => {
            const meta = BOT_META[bot.id] || { icon: "🤖", gradient: "from-gray-600 to-gray-800", label: bot.name };
            return (
              <div
                key={bot.id}
                className={`rounded-xl border border-border overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                  selectedBot === bot.id ? 'ring-2 ring-accent' : ''
                }`}
                onClick={() => setSelectedBot(selectedBot === bot.id ? null : bot.id)}
                role="button"
                aria-expanded={selectedBot === bot.id}
                aria-label={`${meta.label} bot - ${bot.status}`}
              >
                <div className={`bg-gradient-to-r ${meta.gradient} p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{meta.icon}</span>
                      <div>
                        <h3 className="font-bold text-white">{meta.label}</h3>
                        <p className="text-xs text-white/70">{bot.runCount} runs · {bot.successCount} successful</p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      bot.status === 'active' ? 'bg-green-400 animate-pulse' :
                      bot.status === 'error' ? 'bg-red-400' :
                      'bg-gray-400'
                    }`} />
                  </div>
                </div>
                <div className="p-3 bg-card">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>Last run: {bot.lastRun ? new Date(bot.lastRun).toLocaleTimeString() : 'Never'}</span>
                    <span className={bot.errorCount > 0 ? 'text-red-400' : 'text-green-400'}>
                      {bot.errorCount} errors
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); triggerMutation.mutate({ botId: bot.id }); }}
                      disabled={triggerMutation.isPending || bot.status === 'disabled'}
                      className="flex-1 text-xs px-2 py-1.5 rounded bg-accent text-accent-foreground hover:bg-accent/80 disabled:opacity-50 transition-colors"
                    >
                      Run Now
                    </button>
                    {bot.status === 'disabled' ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); enableMutation.mutate({ botId: bot.id }); }}
                        className="text-xs px-2 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 transition-colors"
                      >
                        Enable
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); disableMutation.mutate({ botId: bot.id }); }}
                        className="text-xs px-2 py-1.5 rounded bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
                      >
                        Disable
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Bot Detail */}
        {selectedBot && (
          <div className="mb-8">
            <AIAssistantPanel botId={selectedBot} compact={false} />
          </div>
        )}

        {/* Two Column Layout: Activity Feed + Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-bold text-foreground">Recent Activity</h2>
              <p className="text-xs text-muted-foreground">All bot actions across the ecosystem</p>
            </div>
            <div className="max-h-[400px] overflow-y-auto divide-y divide-border/30">
              {(!recentActions || recentActions.length === 0) ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Bots are initializing. Activity will appear shortly.
                </div>
              ) : (
                recentActions.map(action => {
                  const meta = BOT_META[action.botId] || { icon: "🤖" };
                  return (
                    <div key={action.id} className="p-3 hover:bg-muted/10 transition-colors">
                      <div className="flex items-start gap-2">
                        <span className="text-sm mt-0.5">{meta.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-accent">{action.botName}</span>
                            <span className="text-xs text-muted-foreground/60">
                              {new Date(action.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{action.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{action.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-bold text-foreground">AI Insights</h2>
              <p className="text-xs text-muted-foreground">Actionable intelligence from business analysis</p>
            </div>
            <div className="max-h-[400px] overflow-y-auto divide-y divide-border/30">
              {(!insights || insights.length === 0) ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Insights will be generated as bots analyze business data.
                </div>
              ) : (
                insights.map((insight, i) => {
                  const meta = BOT_META[insight.botId] || { icon: "🤖" };
                  return (
                    <div key={i} className="p-3 hover:bg-muted/10 transition-colors">
                      <div className="flex items-start gap-2">
                        <span className="text-sm mt-0.5">{meta.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-accent/20 text-accent">
                              {insight.category.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {insight.confidence}% confidence
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{insight.insight}</p>
                          {insight.suggestedAction && (
                            <p className="text-xs text-accent mt-1">→ {insight.suggestedAction}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* QUMUS Autonomy Stats */}
        <div className="mt-8 bg-gradient-to-r from-accent/10 to-purple-900/10 border border-accent/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl" role="img" aria-label="QUMUS">🧠</span>
            <div>
              <h2 className="font-bold text-foreground">QUMUS Autonomous Orchestration</h2>
              <p className="text-xs text-muted-foreground">
                Central AI brain controlling all business operations with 90% autonomy
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
            <p className="text-2xl font-bold text-accent">10</p>
            <p className="text-xs text-muted-foreground">AI Assistants</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">8+</p>
              <p className="text-xs text-muted-foreground">Decision Policies</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">90%</p>
              <p className="text-xs text-muted-foreground">Autonomous Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">24/7</p>
              <p className="text-xs text-muted-foreground">Active Monitoring</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
