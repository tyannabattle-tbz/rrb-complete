import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Activity, RefreshCw, Zap, Shield, Clock, Wrench, ExternalLink, BarChart3, Radio, Image, Route, Code, Package, Archive, DollarSign, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function QumusAdminDashboard() {
  const { data: dashboardData, isLoading, refetch } = trpc.qumusComplete.getDashboardData.useQuery(undefined, {
    refetchInterval: 10000,
  });
  const { data: policies } = trpc.qumusComplete.getPolicies.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const { data: allMetrics } = trpc.qumusComplete.getAllMetrics.useQuery(undefined, {
    refetchInterval: 15000,
  });
  const { data: recentActions } = trpc.qumusComplete.getRecentActions.useQuery({ limit: 20 }, {
    refetchInterval: 10000,
  });
  const { data: recommendations } = trpc.qumusComplete.getPolicyRecommendations.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const systemHealth = dashboardData?.systemHealth;
  const totalDecisions = systemHealth?.totalDecisions || 0;
  const autonomyRate = systemHealth?.autonomyPercentage || 0;
  const activePolicies = systemHealth?.activePolicies || 0;
  const policyCount = systemHealth?.policyCount || 0;

  const avgSuccessRate = useMemo(() => {
    if (!allMetrics || allMetrics.length === 0) return 0;
    return allMetrics.reduce((sum: number, m: any) => sum + (m.successRate || 0), 0) / allMetrics.length;
  }, [allMetrics]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-foreground/60">Loading QUMUS Engine Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">QUMUS Admin Dashboard</h1>
            <p className="text-foreground/60 mt-2">
              Autonomous Orchestration Engine — Real-time Monitoring & Control
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={systemHealth?.status === 'healthy' ? 'bg-green-500/20 text-green-600 border-green-500/30' : 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30'}>
              {systemHealth?.status === 'healthy' ? '● Engine Healthy' : '● Engine Status Unknown'}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" /> System Autonomy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{autonomyRate.toFixed(1)}%</div>
              <p className="text-xs text-foreground/60 mt-2">Target: 90%+ across all policies</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" /> Active Policies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{activePolicies}/{policyCount}</div>
              <p className="text-xs text-foreground/60 mt-2">All policies operational</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500" /> Total Decisions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {totalDecisions.toLocaleString()}
              </div>
              <p className="text-xs text-foreground/60 mt-2">Lifetime decisions processed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">
                {avgSuccessRate.toFixed(1)}%
              </div>
              <p className="text-xs text-foreground/60 mt-2">Average across all policies</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <Link href="/rrb/qumus/code-maintenance">
            <Card className="cursor-pointer hover:border-amber-500/50 transition-all group">
              <CardContent className="pt-4 pb-3 text-center">
                <Wrench className="w-6 h-6 mx-auto mb-2 text-amber-500 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium">Code Maintenance</div>
                <div className="text-xs text-foreground/50">Policy #9</div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/rrb/qumus/performance-monitoring">
            <Card className="cursor-pointer hover:border-cyan-500/50 transition-all group">
              <CardContent className="pt-4 pb-3 text-center">
                <BarChart3 className="w-6 h-6 mx-auto mb-2 text-cyan-500 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium">Performance</div>
                <div className="text-xs text-foreground/50">Policy #10</div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/rrb/qumus/content-archival">
            <Card className="cursor-pointer hover:border-blue-500/50 transition-all group">
              <CardContent className="pt-4 pb-3 text-center">
                <Archive className="w-6 h-6 mx-auto mb-2 text-blue-500 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium">Content Archival</div>
                <div className="text-xs text-foreground/50">Policy #11</div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/rrb/qumus/royalty-audit">
            <Card className="cursor-pointer hover:border-green-500/50 transition-all group">
              <CardContent className="pt-4 pb-3 text-center">
                <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-500 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium">Royalty Audit</div>
                <div className="text-xs text-foreground/50">Policy #12</div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/rrb/qumus/community-engagement">
            <Card className="cursor-pointer hover:border-pink-500/50 transition-all group">
              <CardContent className="pt-4 pb-3 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-pink-500 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium">Community</div>
                <div className="text-xs text-foreground/50">Policy #13</div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/rrb/qumus/monitoring">
            <Card className="cursor-pointer hover:border-purple-500/50 transition-all group">
              <CardContent className="pt-4 pb-3 text-center">
                <Activity className="w-6 h-6 mx-auto mb-2 text-purple-500 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium">Monitoring</div>
                <div className="text-xs text-foreground/50">Real-time</div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/rrb/qumus/human-review">
            <Card className="cursor-pointer hover:border-orange-500/50 transition-all group">
              <CardContent className="pt-4 pb-3 text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-orange-500 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium">Human Review</div>
                <div className="text-xs text-foreground/50">Escalations</div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/rrb/qumus/analytics">
            <Card className="cursor-pointer hover:border-purple-500/50 transition-all group">
              <CardContent className="pt-4 pb-3 text-center">
                <BarChart3 className="w-6 h-6 mx-auto mb-2 text-purple-500 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium">Analytics</div>
                <div className="text-xs text-foreground/50">Policy Data</div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/rrb/qumus/command-console">
            <Card className="cursor-pointer hover:border-green-500/50 transition-all group">
              <CardContent className="pt-4 pb-3 text-center">
                <Zap className="w-6 h-6 mx-auto mb-2 text-green-500 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium">Command Console</div>
                <div className="text-xs text-foreground/50">Direct Control</div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Policies</TabsTrigger>
            <TabsTrigger value="decisions">Recent Decisions</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="analytics">Recommendations</TabsTrigger>
          </TabsList>

          {/* Policies Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Decision Policies Status</CardTitle>
                <CardDescription>
                  {activePolicies} autonomous policies operating at {autonomyRate.toFixed(0)}%+ autonomy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allMetrics && allMetrics.length > 0 ? allMetrics.map((metric: any) => (
                    <div
                      key={metric.policyId}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-foreground">{metric.name}</h4>
                          <Badge variant="outline">{metric.autonomyLevel}% autonomy</Badge>
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                            active
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-foreground/60">
                          <div>Decisions: {(metric.totalDecisions || 0).toLocaleString()}</div>
                          <div>Success Rate: {(metric.successRate || 0).toFixed(1)}%</div>
                          <div>Escalation Rate: {(metric.escalationRate || 0).toFixed(1)}%</div>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${metric.autonomyLevel || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-foreground/50">
                      <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Loading policy data from engine...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Decisions Tab */}
          <TabsContent value="decisions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Autonomous Actions</CardTitle>
                <CardDescription>Latest decisions made by the QUMUS engine</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActions && recentActions.length > 0 ? (
                  <div className="space-y-3">
                    {recentActions.map((action: any, i: number) => (
                      <div key={action.id || i} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground">{action.policyId || 'Unknown Policy'}</span>
                            <Badge className={
                              action.result === 'success' ? 'bg-green-500/10 text-green-600' :
                              action.result === 'failure' ? 'bg-red-500/10 text-red-600' :
                              'bg-yellow-500/10 text-yellow-600'
                            }>
                              {action.result || action.status || 'pending'}
                            </Badge>
                            {action.autonomousFlag && (
                              <Badge variant="outline" className="text-purple-600 border-purple-300">
                                Autonomous
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-foreground/60">
                            Confidence: {action.confidence || 'N/A'}% | 
                            Execution: {action.executionTime || 'N/A'}ms |
                            {action.timestamp && ` ${new Date(action.timestamp).toLocaleString()}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-foreground/50">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No recent decisions yet. The engine is ready and waiting for requests.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Policy Configuration</CardTitle>
                <CardDescription>Current autonomy levels for each policy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {policies && policies.map((policy: any) => (
                    <div key={policy.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-foreground">
                            {policy.name}
                          </label>
                          <p className="text-xs text-foreground/50">{policy.description}</p>
                        </div>
                        <span className="text-sm font-semibold text-purple-600">
                          {policy.autonomyLevel}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all"
                          style={{ width: `${policy.autonomyLevel}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Policy Optimization Recommendations</CardTitle>
                <CardDescription>AI-generated suggestions to improve system performance</CardDescription>
              </CardHeader>
              <CardContent>
                {recommendations && recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {recommendations.map((rec: any, i: number) => (
                      <div key={i} className="p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={
                            rec.impact === 'high' ? 'bg-red-500/10 text-red-600' :
                            rec.impact === 'medium' ? 'bg-yellow-500/10 text-yellow-600' :
                            'bg-blue-500/10 text-blue-600'
                          }>
                            {rec.impact} impact
                          </Badge>
                          <span className="text-sm font-medium text-foreground">{rec.policyId}</span>
                        </div>
                        <p className="text-foreground/70 text-sm">{rec.recommendation}</p>
                        <div className="flex gap-4 mt-2 text-xs text-foreground/50">
                          <span>Current: {rec.currentValue}</span>
                          <span>Recommended: {rec.recommendedValue}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-foreground/50">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500 opacity-50" />
                    <p>All policies are performing optimally. No recommendations at this time.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
