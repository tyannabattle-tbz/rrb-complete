import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle, Activity } from "lucide-react";
import AICollaborationHub from "@/components/rrb/AICollaborationHub";

export default function EcosystemDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch ecosystem overview
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = trpc.ecosystem.getOverview.useQuery();

  // Fetch real-time metrics
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = trpc.ecosystem.getMetrics.useQuery();

  // Fetch QUMUS decisions
  const { data: decisions, isLoading: decisionsLoading, refetch: refetchDecisions } = trpc.ecosystem.getQumusDecisions.useQuery({ limit: 10 });

  // Fetch human review queue
  const { data: reviewQueue, isLoading: reviewLoading, refetch: refetchQueue } = trpc.ecosystem.getHumanReviewQueue.useQuery();

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetchOverview();
      refetchMetrics();
      refetchDecisions();
      refetchQueue();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, refetchOverview, refetchMetrics, refetchDecisions, refetchQueue]);

  const isLoading = overviewLoading || metricsLoading || decisionsLoading || reviewLoading;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* AI Collaboration Hub - Upper Left */}
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 mb-6">
          <div>
            <AICollaborationHub />
          </div>
          <div />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Unified Ecosystem Dashboard</h1>
            <p className="text-foreground/60 mt-2">Real-time monitoring and control center</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
              size="sm"
            >
              {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </Button>
            <Button onClick={() => { refetchOverview(); refetchMetrics(); refetchDecisions(); refetchQueue(); }} size="sm">
              Refresh Now
            </Button>
          </div>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60">System Status</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {overview?.systemHealth?.status === "operational" ? "✓ Operational" : "⚠ Issues"}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div>
              <p className="text-sm text-foreground/60">Uptime</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {overview?.systemHealth?.uptime ? Math.floor(overview.systemHealth.uptime / 60) : 0}m
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div>
              <p className="text-sm text-foreground/60">Active Services</p>
              <p className="text-2xl font-bold text-foreground mt-2">{metrics?.services ? Object.keys(metrics.services).length : 0}</p>
            </div>
          </Card>

          <Card className="p-6">
            <div>
              <p className="text-sm text-foreground/60">Pending Reviews</p>
              <p className="text-2xl font-bold text-foreground mt-2">{reviewQueue?.count || 0}</p>
            </div>
          </Card>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Service Status */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Service Status</h2>
            {metricsLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <div className="space-y-3">
                {metrics?.services && Object.entries(metrics.services).map(([name, service]: any) => (
                  <div key={name} className="flex items-center justify-between p-3 bg-card rounded-lg">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-foreground capitalize">
                        {name.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-foreground/60">{service.latency}ms</p>
                      <p className="text-xs font-semibold text-green-500">{service.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Database Metrics */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Database Health</h2>
            {metricsLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-card rounded-lg">
                  <span className="text-sm text-foreground">Active Connections</span>
                  <span className="font-bold text-foreground">{metrics?.database?.connections}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-card rounded-lg">
                  <span className="text-sm text-foreground">Active Queries</span>
                  <span className="font-bold text-foreground">{metrics?.database?.activeQueries}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-card rounded-lg">
                  <span className="text-sm text-foreground">Avg Query Time</span>
                  <span className="font-bold text-foreground">{metrics?.database?.avgQueryTime}ms</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Event Bus & QUMUS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event Bus Stats */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Event Bus</h2>
            {overviewLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-card rounded-lg">
                  <span className="text-sm text-foreground">Total Events</span>
                  <span className="font-bold text-foreground">{overview?.eventBus?.totalEvents || 0}</span>
                </div>
                <div className="flex justify-between p-3 bg-card rounded-lg">
                  <span className="text-sm text-foreground">Events/sec</span>
                  <span className="font-bold text-foreground">{overview?.eventBus?.eventsPerSecond || 0}</span>
                </div>
                <div className="flex justify-between p-3 bg-card rounded-lg">
                  <span className="text-sm text-foreground">Failed Events</span>
                  <span className="font-bold text-red-500">{overview?.eventBus?.failedEvents || 0}</span>
                </div>
              </div>
            )}
          </Card>

          {/* QUMUS Stats */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">QUMUS Orchestration</h2>
            {overviewLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-card rounded-lg">
                  <span className="text-sm text-foreground">Total Decisions</span>
                  <span className="font-bold text-foreground">{overview?.qumus?.totalDecisions || 0}</span>
                </div>
                <div className="flex justify-between p-3 bg-card rounded-lg">
                  <span className="text-sm text-foreground">Autonomy Score</span>
                  <span className="font-bold text-blue-500">{overview?.qumus?.autonomyScore || 0}%</span>
                </div>
                <div className="flex justify-between p-3 bg-card rounded-lg">
                  <span className="text-sm text-foreground">Pending Review</span>
                  <span className="font-bold text-yellow-500">{overview?.qumus?.pendingReview || 0}</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Recent Decisions */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Recent QUMUS Decisions</h2>
          {decisionsLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : decisions?.decisions && decisions.decisions.length > 0 ? (
            <div className="space-y-3">
              {decisions.decisions.map((decision: any) => (
                <div key={decision.id} className="p-4 bg-card rounded-lg border border-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-foreground">{decision.policy}</p>
                      <p className="text-sm text-foreground/60 mt-1">{decision.description}</p>
                      <p className="text-xs text-foreground/40 mt-2">
                        {new Date(decision.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      decision.status === "approved" ? "bg-green-500/20 text-green-500" :
                      decision.status === "rejected" ? "bg-red-500/20 text-red-500" :
                      "bg-yellow-500/20 text-yellow-500"
                    }`}>
                      {decision.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-foreground/60">No recent decisions</p>
          )}
        </Card>

        {/* Human Review Queue */}
        {reviewQueue && reviewQueue.count > 0 && (
          <Card className="p-6 mt-8 border-yellow-500/50 bg-yellow-500/5">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Human Review Required ({reviewQueue.count})
            </h2>
            <div className="space-y-3">
              {reviewQueue.queue.map((item: any) => (
                <div key={item.id} className="p-4 bg-card rounded-lg border border-yellow-500/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-foreground">{item.policy}</p>
                      <p className="text-sm text-foreground/60 mt-1">{item.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="default">Approve</Button>
                      <Button size="sm" variant="outline">Reject</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
