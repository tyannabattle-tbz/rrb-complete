/**
 * QUMUS Policy Analytics Dashboard
 * Real-time analytics and performance metrics for all QUMUS policies
 * Uses live data from the QUMUS engine via tRPC
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';

/**
 * Maps engine metric fields to display-friendly names.
 * Engine returns: policyId, policyType, name, autonomyLevel, totalDecisions,
 *   autonomousCount, escalatedCount, approvedCount, rejectedCount,
 *   autonomyPercentage, averageConfidence, successRate, failureRate,
 *   avgExecutionTime, escalationRate
 */
interface EngineMetric {
  policyId: string;
  policyType: string;
  name: string;
  autonomyLevel: number;
  totalDecisions: number;
  autonomousCount: number;
  escalatedCount: number;
  approvedCount: number;
  rejectedCount: number;
  autonomyPercentage: number;
  averageConfidence: number;
  successRate: number;
  failureRate: number;
  avgExecutionTime: number;
  escalationRate: number;
}

export default function QumusPolicyAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);

  const { data: metrics, isLoading, refetch } = trpc.qumusComplete.getPolicyMetrics.useQuery({
    timeRange,
  });
  const { data: systemHealth } = trpc.qumusComplete.getSystemHealth.useQuery();
  const { data: recommendations } = trpc.qumusComplete.getPolicyRecommendations.useQuery();

  const selectedMetrics = metrics?.find((m: EngineMetric) => m.policyId === selectedPolicy);

  const getAutonomyColor = (rate: number) => {
    if (rate >= 90) return 'text-green-500';
    if (rate >= 75) return 'text-blue-500';
    if (rate >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTrend = (metric: EngineMetric): 'up' | 'down' | 'stable' => {
    if (metric.successRate >= 90) return 'up';
    if (metric.successRate < 50 && metric.totalDecisions > 0) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-blue-500" />;
  };

  const avgAutonomy = metrics && metrics.length > 0
    ? metrics.reduce((sum: number, m: EngineMetric) => sum + (m.autonomyLevel || 0), 0) / metrics.length
    : 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Policy Analytics</h1>
            <p className="text-foreground/60 mt-2">Real-time performance metrics for all QUMUS policies</p>
          </div>
          <div className="flex gap-2">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-card border-border">
            <p className="text-sm text-foreground/60 mb-2">System Uptime</p>
            <p className="text-3xl font-bold text-green-500">
              {systemHealth?.uptime || 'N/A'}
            </p>
          </Card>
          <Card className="p-6 bg-card border-border">
            <p className="text-sm text-foreground/60 mb-2">Active Policies</p>
            <p className="text-3xl font-bold text-foreground">
              {systemHealth?.activePolicies || 0}/{systemHealth?.policyCount || 0}
            </p>
          </Card>
          <Card className="p-6 bg-card border-border">
            <p className="text-sm text-foreground/60 mb-2">Total Decisions</p>
            <p className="text-3xl font-bold text-foreground">
              {metrics?.reduce((sum: number, m: EngineMetric) => sum + m.totalDecisions, 0) || 0}
            </p>
          </Card>
          <Card className="p-6 bg-card border-border">
            <p className="text-sm text-foreground/60 mb-2">Avg Autonomy</p>
            <p className={`text-3xl font-bold ${getAutonomyColor(avgAutonomy)}`}>
              {avgAutonomy.toFixed(1)}%
            </p>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Policies List */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-bold text-foreground">Policies ({metrics?.length || 0})</h2>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-6 text-center text-foreground/60">Loading...</div>
                ) : metrics && metrics.length > 0 ? (
                  <div className="divide-y divide-border">
                    {metrics.map((metric: EngineMetric) => (
                      <button
                        key={metric.policyId}
                        onClick={() => setSelectedPolicy(metric.policyId)}
                        className={`w-full text-left p-4 hover:bg-background/50 transition-colors ${
                          selectedPolicy === metric.policyId ? 'bg-accent/10' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {metric.name}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              {getTrendIcon(getTrend(metric))}
                              <p className={`text-xs font-bold ${getAutonomyColor(metric.autonomyLevel)}`}>
                                {(metric.autonomyLevel || 0).toFixed(1)}% autonomous
                              </p>
                            </div>
                            <p className="text-xs text-foreground/40 mt-1">
                              {metric.totalDecisions} decisions
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-foreground/60">No policies found</div>
                )}
              </div>
            </Card>
          </div>

          {/* Detailed Metrics */}
          <div className="lg:col-span-2">
            {selectedMetrics ? (
              <Card className="bg-card border-border">
                <div className="p-6 border-b border-border">
                  <h2 className="text-lg font-bold text-foreground">{selectedMetrics.name}</h2>
                </div>

                <div className="p-6 space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background p-4 rounded border border-border">
                      <p className="text-xs text-foreground/60 mb-2">Total Decisions</p>
                      <p className="text-2xl font-bold text-foreground">
                        {selectedMetrics.totalDecisions}
                      </p>
                    </div>
                    <div className="bg-background p-4 rounded border border-border">
                      <p className="text-xs text-foreground/60 mb-2">Autonomy Level</p>
                      <p className={`text-2xl font-bold ${getAutonomyColor(selectedMetrics.autonomyLevel)}`}>
                        {(selectedMetrics.autonomyLevel || 0).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-background p-4 rounded border border-border">
                      <p className="text-xs text-foreground/60 mb-2">Success Rate</p>
                      <p className="text-2xl font-bold text-green-500">
                        {(selectedMetrics.successRate || 0).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-background p-4 rounded border border-border">
                      <p className="text-xs text-foreground/60 mb-2">Avg Execution Time</p>
                      <p className="text-2xl font-bold text-foreground">
                        {(selectedMetrics.avgExecutionTime || 0).toFixed(0)}ms
                      </p>
                    </div>
                  </div>

                  {/* Decision Breakdown */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground/60 mb-3">Decision Breakdown</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-foreground">Autonomous</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-background rounded overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{
                                width: `${selectedMetrics.totalDecisions > 0 ? (selectedMetrics.autonomousCount / selectedMetrics.totalDecisions) * 100 : 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            {selectedMetrics.autonomousCount}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-foreground">Escalated</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-background rounded overflow-hidden">
                            <div
                              className="h-full bg-orange-500"
                              style={{
                                width: `${selectedMetrics.totalDecisions > 0 ? (selectedMetrics.escalatedCount / selectedMetrics.totalDecisions) * 100 : 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            {selectedMetrics.escalatedCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Confidence Stats */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground/60 mb-3">Confidence Stats</h3>
                    <div className="bg-background p-4 rounded border border-border">
                      <p className="text-sm text-foreground/60 mb-2">Average Confidence Score</p>
                      <p className="text-3xl font-bold text-foreground">
                        {(selectedMetrics.averageConfidence || 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="bg-card border-border p-12 text-center">
                <Activity className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
                <p className="text-foreground/60">Select a policy to view detailed metrics</p>
              </Card>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="mt-8">
            <Card className="bg-card border-border">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Policy Recommendations
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {recommendations.map((rec: any, idx: number) => (
                  <div key={`item-${idx}`} className="p-4 bg-background rounded border border-border">
                    <p className="font-semibold text-foreground mb-2">{rec.policyId}</p>
                    <p className="text-sm text-foreground/70">{rec.recommendation}</p>
                    <div className="flex gap-4 mt-2 text-xs text-foreground/50">
                      <span>Current: {rec.currentValue}</span>
                      <span>Recommended: {rec.recommendedValue}</span>
                      <span className={`font-semibold ${rec.impact === 'high' ? 'text-red-500' : rec.impact === 'medium' ? 'text-yellow-500' : 'text-blue-500'}`}>
                        {rec.impact} impact
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
