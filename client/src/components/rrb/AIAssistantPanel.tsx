/**
 * AI Assistant Panel — Embeddable AI chat panel for each business module
 * Shows the bot's recent actions, insights, and allows manual triggering.
 * Accessible and screen-reader friendly.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AIAssistantPanelProps {
  botId: string;
  title?: string;
  compact?: boolean;
}

const BOT_META: Record<string, { icon: string; color: string; label: string }> = {
  bot_bookkeeping: { icon: "📊", color: "emerald", label: "Bookkeeping AI" },
  bot_hr: { icon: "👥", color: "blue", label: "HR AI" },
  bot_accounting: { icon: "💰", color: "amber", label: "Accounting AI" },
  bot_legal: { icon: "⚖️", color: "purple", label: "Legal AI" },
  bot_radio_directory: { icon: "📻", color: "rose", label: "Radio Directory AI" },
  bot_social_media: { icon: "📱", color: "cyan", label: "Social Media AI" },
  bot_content_calendar: { icon: "📅", color: "indigo", label: "Content Calendar AI" },
  bot_engagement: { icon: "💬", color: "pink", label: "Engagement AI" },
  bot_grant_discovery: { icon: "🔍", color: "teal", label: "Grant Discovery AI" },
  bot_emergency: { icon: "🚨", color: "red", label: "Emergency AI" },
};

export function AIAssistantPanel({ botId, title, compact = false }: AIAssistantPanelProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const meta = BOT_META[botId] || { icon: "🤖", color: "gray", label: "AI Assistant" };

  const { data: bot } = trpc.aiBusinessAssistants.getBot.useQuery(
    { botId },
    { refetchInterval: 30000 }
  );

  const { data: actions, refetch: refetchActions } = trpc.aiBusinessAssistants.getActionsByBot.useQuery(
    { botId, limit: compact ? 5 : 15 },
    { refetchInterval: 30000 }
  );

  const triggerMutation = trpc.aiBusinessAssistants.triggerBot.useMutation({
    onSuccess: (data) => {
      toast.success(`${meta.label} generated ${data.actionsGenerated} new insights`);
      refetchActions();
    },
    onError: (err) => {
      toast.error(`${meta.label} error: ${err.message}`);
    },
  });

  const displayTitle = title || meta.label;

  return (
    <div
      className={`border border-border rounded-xl overflow-hidden bg-card/30 backdrop-blur-sm`}
      role="region"
      aria-label={`${displayTitle} Assistant Panel`}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-muted/20 transition-colors"
        aria-expanded={isExpanded}
        aria-controls={`ai-panel-${botId}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg" role="img" aria-label={displayTitle}>{meta.icon}</span>
          <span className="text-sm font-semibold text-foreground">{displayTitle}</span>
          {bot && (
            <span className={`w-2 h-2 rounded-full ${
              bot.status === 'active' ? 'bg-green-500 animate-pulse' :
              bot.status === 'error' ? 'bg-red-500' :
              'bg-gray-500'
            }`} aria-label={`Status: ${bot.status}`} />
          )}
        </div>
        <div className="flex items-center gap-2">
          {bot && (
            <span className="text-xs text-muted-foreground">
              {bot.runCount} runs · {bot.successCount} ok
            </span>
          )}
          <span className="text-xs text-muted-foreground">{isExpanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div id={`ai-panel-${botId}`} className="border-t border-border">
          {/* Quick Actions */}
          <div className="p-3 flex items-center gap-2 border-b border-border/50">
            <button
              onClick={() => triggerMutation.mutate({ botId })}
              disabled={triggerMutation.isPending}
              className="text-xs px-3 py-1.5 rounded-lg bg-accent text-accent-foreground hover:bg-accent/80 transition-colors disabled:opacity-50 font-medium"
              aria-label={`Run ${displayTitle} analysis now`}
            >
              {triggerMutation.isPending ? "Analyzing..." : "Run Analysis Now"}
            </button>
            {bot?.lastRun && (
              <span className="text-xs text-muted-foreground">
                Last run: {new Date(bot.lastRun).toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* Recent Actions */}
          <div className="max-h-64 overflow-y-auto divide-y divide-border/30">
            {(!actions || actions.length === 0) ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                <p>No insights yet. Click "Run Analysis Now" to generate.</p>
              </div>
            ) : (
              actions.map(action => (
                <div key={action.id} className="p-3 hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      action.actionType === 'alert' ? 'bg-amber-500/20 text-amber-400' :
                      action.actionType === 'recommendation' ? 'bg-blue-500/20 text-blue-400' :
                      action.actionType === 'auto_action' ? 'bg-green-500/20 text-green-400' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {action.actionType.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-muted-foreground/60">
                      {new Date(action.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{action.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-3">{action.description}</p>
                </div>
              ))
            )}
          </div>

          {/* Bot Capabilities */}
          {bot && (
            <div className="p-3 border-t border-border/50 bg-muted/5">
              <p className="text-xs font-medium text-muted-foreground mb-1">Capabilities:</p>
              <div className="flex flex-wrap gap-1">
                {(bot.capabilities || []).slice(0, 3).map((cap, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {cap.length > 40 ? cap.substring(0, 40) + '...' : cap}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AIAssistantPanel;
