/**
 * QUMUS Activity Feed Widget — Real-time AI Bot Activity
 * Shows live decisions, actions, and insights from all 10 AI assistants
 * plus the QUMUS autonomous decision engine.
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

const BOT_ICONS: Record<string, string> = {
  bot_bookkeeping: "📊",
  bot_hr: "👥",
  bot_accounting: "💰",
  bot_legal: "⚖️",
  bot_radio_directory: "📻",
  bot_social_media: "📱",
  bot_content_calendar: "📅",
  bot_engagement: "💬",
  bot_grant_discovery: "🔍",
  bot_emergency: "🚨",
};

const BOT_COLORS: Record<string, string> = {
  bot_bookkeeping: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
  bot_hr: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  bot_accounting: "from-amber-500/20 to-amber-600/10 border-amber-500/30",
  bot_legal: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
  bot_radio_directory: "from-rose-500/20 to-rose-600/10 border-rose-500/30",
  bot_social_media: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30",
  bot_content_calendar: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30",
  bot_engagement: "from-pink-500/20 to-pink-600/10 border-pink-500/30",
  bot_grant_discovery: "from-teal-500/20 to-teal-600/10 border-teal-500/30",
  bot_emergency: "from-red-500/20 to-red-600/10 border-red-500/30",
};

const SEVERITY_COLORS: Record<string, string> = {
  info: "text-blue-400",
  warning: "text-amber-400",
  critical: "text-red-400",
};

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export function QUMUSActivityFeed() {
  const [expanded, setExpanded] = useState(false);

  const { data: feedData, isLoading } = trpc.aiBusinessAssistants.getActivityFeed.useQuery(
    { limit: expanded ? 50 : 10 },
    { refetchInterval: 30000 } // Refresh every 30 seconds
  );

  const { data: botStatus } = trpc.aiBusinessAssistants.getStatus.useQuery(
    undefined,
    { refetchInterval: 60000 }
  );

  if (isLoading) {
    return (
      <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6" role="status" aria-label="Loading activity feed">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-48" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const actions = feedData?.actions || [];
  const summary = feedData?.summary;

  return (
    <section
      className="bg-card/50 backdrop-blur-sm border border-border rounded-xl overflow-hidden"
      aria-label="QUMUS AI Activity Feed"
    >
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-border">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
              <span className="text-lg" role="img" aria-label="AI Brain">🧠</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">QUMUS AI Activity</h3>
              <p className="text-xs text-muted-foreground">
                {summary?.activeBots || 0} bots active · {summary?.totalActions || 0} actions logged
              </p>
            </div>
          </div>

          {/* Bot Status Indicators */}
          <div className="flex items-center gap-1.5" aria-label="Bot status indicators">
            {botStatus?.bots?.map(bot => (
              <div
                key={bot.id}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border ${
                  bot.status === 'active'
                    ? 'bg-green-500/20 border-green-500/40'
                    : bot.status === 'error'
                    ? 'bg-red-500/20 border-red-500/40'
                    : 'bg-gray-500/20 border-gray-500/40'
                }`}
                title={`${bot.name}: ${bot.status} (${bot.runCount} runs)`}
                role="status"
                aria-label={`${bot.name} is ${bot.status}`}
              >
                {BOT_ICONS[bot.id] || "🤖"}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Stream */}
      <div
        className={`divide-y divide-border/50 ${expanded ? 'max-h-[600px]' : 'max-h-[320px]'} overflow-y-auto`}
        role="feed"
        aria-label="AI bot activity stream"
      >
        {actions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <span className="text-3xl block mb-2" role="img" aria-label="Initializing">⏳</span>
            <p className="text-sm">AI assistants are initializing...</p>
            <p className="text-xs mt-1">First insights will appear within 5 minutes</p>
          </div>
        ) : (
          actions.map((action, index) => (
            <article
              key={action.id}
              className={`p-3 sm:p-4 hover:bg-muted/30 transition-colors ${
                !action.acknowledged ? 'bg-muted/10' : ''
              }`}
              role="article"
              aria-label={`${action.botName}: ${action.title}`}
            >
              <div className="flex gap-3">
                {/* Bot Icon */}
                <div
                  className={`w-9 h-9 rounded-lg bg-gradient-to-br flex-shrink-0 flex items-center justify-center text-sm border ${
                    BOT_COLORS[action.botId] || 'from-gray-500/20 to-gray-600/10 border-gray-500/30'
                  }`}
                >
                  {BOT_ICONS[action.botId] || "🤖"}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-accent">{action.botName}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      action.actionType === 'alert' ? 'bg-amber-500/20 text-amber-400' :
                      action.actionType === 'recommendation' ? 'bg-blue-500/20 text-blue-400' :
                      action.actionType === 'auto_action' ? 'bg-green-500/20 text-green-400' :
                      action.actionType === 'escalation' ? 'bg-red-500/20 text-red-400' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {action.actionType.replace('_', ' ')}
                    </span>
                    <span className={`text-xs ${SEVERITY_COLORS[action.severity] || 'text-muted-foreground'}`}>
                      {action.severity !== 'info' && `● ${action.severity}`}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground mt-0.5">{action.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{action.description}</p>
                  <span className="text-xs text-muted-foreground/60 mt-1 block">{timeAgo(action.timestamp)}</span>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-accent hover:text-accent/80 transition-colors font-medium"
          aria-expanded={expanded}
        >
          {expanded ? "Show Less" : `Show All (${summary?.totalActions || 0})`}
        </button>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
          <span>Live — refreshing every 30s</span>
        </div>
      </div>
    </section>
  );
}

export default QUMUSActivityFeed;
