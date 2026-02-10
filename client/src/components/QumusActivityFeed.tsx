/**
 * QUMUS Activity Feed Widget
 * Shows the latest autonomous decisions, escalations, agent communications,
 * and grant discoveries in real time — giving instant ecosystem visibility
 */
import { useState, useEffect, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity, Brain, Shield, Radio, Heart, Zap, AlertTriangle,
  CheckCircle, Clock, RefreshCw, ChevronDown, ChevronUp,
  Network, Search, DollarSign
} from 'lucide-react';

interface FeedItem {
  id: string;
  type: 'decision' | 'escalation' | 'agent_comm' | 'grant' | 'broadcast' | 'notification';
  title: string;
  description: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'critical' | 'success';
  source: string;
  metadata?: Record<string, any>;
}

const SEVERITY_COLORS = {
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  decision: <Brain className="w-4 h-4" />,
  escalation: <AlertTriangle className="w-4 h-4" />,
  agent_comm: <Network className="w-4 h-4" />,
  grant: <Search className="w-4 h-4" />,
  broadcast: <Radio className="w-4 h-4" />,
  notification: <Zap className="w-4 h-4" />,
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function QumusActivityFeed() {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  // Fetch live data from QUMUS engine
  const { data: dashboardData } = trpc.rrbQumusComplete.getDashboardData.useQuery(undefined, {
    refetchInterval: 15000,
  });
  const { data: recentActions } = trpc.rrbQumusComplete.getRecentActions.useQuery(
    { limit: 20 },
    { refetchInterval: 15000 }
  );
  const { data: humanReviews } = trpc.rrbQumusComplete.getHumanReviews.useQuery(
    { status: 'pending', limit: 10 },
    { refetchInterval: 20000 }
  );
  const { data: networkStatus } = trpc.rrbQumusComplete.getNetworkStatus.useQuery(undefined, {
    refetchInterval: 30000,
  });

  // Build feed items from live data
  const feedItems = useMemo(() => {
    const items: FeedItem[] = [];

    // Add recent autonomous decisions
    if (recentActions && Array.isArray(recentActions)) {
      for (const action of recentActions.slice(0, 10)) {
        items.push({
          id: `action-${action.id || Math.random()}`,
          type: 'decision',
          title: `${action.status === 'completed' ? 'Autonomous' : 'Pending'}: ${action.policyId || 'Unknown Policy'}`,
          description: action.actionType || action.description || 'Decision processed',
          timestamp: new Date(action.createdAt || Date.now()),
          severity: action.status === 'completed' ? 'success' : 'info',
          source: 'QUMUS Engine',
          metadata: { confidence: action.confidence, policyId: action.policyId },
        });
      }
    }

    // Add human review escalations
    if (humanReviews && Array.isArray(humanReviews)) {
      for (const review of humanReviews.slice(0, 5)) {
        items.push({
          id: `review-${review.id || Math.random()}`,
          type: 'escalation',
          title: `Escalated: ${review.escalationReason || 'Needs Human Review'}`,
          description: review.originalInput ? `Input: ${typeof review.originalInput === 'string' ? review.originalInput.slice(0, 100) : JSON.stringify(review.originalInput).slice(0, 100)}` : 'Awaiting human decision',
          timestamp: new Date(review.createdAt || Date.now()),
          severity: 'warning',
          source: review.policyId || 'QUMUS',
        });
      }
    }

    // Add agent network events
    if (networkStatus && typeof networkStatus === 'object') {
      const ns = networkStatus as any;
      if (ns.agents && Array.isArray(ns.agents)) {
        for (const agent of ns.agents.slice(0, 3)) {
          items.push({
            id: `agent-${agent.id || Math.random()}`,
            type: 'agent_comm',
            title: `${agent.name || agent.id}: ${agent.status || 'online'}`,
            description: `Autonomy: ${agent.autonomyLevel || 0}% | Messages: ${agent.messagesSent || 0} sent, ${agent.messagesReceived || 0} received`,
            timestamp: new Date(agent.lastHeartbeat || Date.now()),
            severity: agent.status === 'online' ? 'success' : 'warning',
            source: 'Agent Network',
          });
        }
      }
    }

    // Add dashboard summary as a feed item
    if (dashboardData && typeof dashboardData === 'object') {
      const dd = dashboardData as any;
      items.push({
        id: 'dashboard-summary',
        type: 'notification',
        title: 'QUMUS Engine Status',
        description: `${dd.totalDecisions || 0} total decisions | ${(dd.autonomyPercentage || 0).toFixed(1)}% autonomy | ${dd.activePolicies || 0} active policies`,
        timestamp: new Date(),
        severity: (dd.autonomyPercentage || 0) >= 85 ? 'success' : 'info',
        source: 'Dashboard',
      });
    }

    // Sort by timestamp (newest first)
    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [recentActions, humanReviews, networkStatus, dashboardData]);

  const filteredItems = filter === 'all' ? feedItems : feedItems.filter(i => i.type === filter);
  const displayItems = expanded ? filteredItems : filteredItems.slice(0, 8);

  const counts = {
    all: feedItems.length,
    decision: feedItems.filter(i => i.type === 'decision').length,
    escalation: feedItems.filter(i => i.type === 'escalation').length,
    agent_comm: feedItems.filter(i => i.type === 'agent_comm').length,
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Live Activity Feed
          </CardTitle>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
        {/* Filter tabs */}
        <div className="flex gap-1 flex-wrap mt-2">
          {[
            { key: 'all', label: 'All', count: counts.all },
            { key: 'decision', label: 'Decisions', count: counts.decision },
            { key: 'escalation', label: 'Escalations', count: counts.escalation },
            { key: 'agent_comm', label: 'Agents', count: counts.agent_comm },
          ].map(f => (
            <Button
              key={f.key}
              variant={filter === f.key ? 'default' : 'ghost'}
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => setFilter(f.key)}
            >
              {f.label} ({f.count})
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {displayItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No activity yet. QUMUS is warming up...</p>
          </div>
        ) : (
          displayItems.map(item => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${SEVERITY_COLORS[item.severity]} transition-all hover:scale-[1.01]`}
            >
              <div className="mt-0.5 shrink-0">
                {TYPE_ICONS[item.type] || <Activity className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium truncate">{item.title}</span>
                  <Badge variant="outline" className="text-[10px] h-4 px-1 shrink-0">
                    {item.source}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {item.description}
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                {timeAgo(item.timestamp)}
              </span>
            </div>
          ))
        )}

        {filteredItems.length > 8 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>Show Less <ChevronUp className="w-3 h-3 ml-1" /></>
            ) : (
              <>Show {filteredItems.length - 8} More <ChevronDown className="w-3 h-3 ml-1" /></>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
