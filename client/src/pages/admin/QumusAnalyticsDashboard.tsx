/**
 * QUMUS Analytics Dashboard
 * Advanced analytics showing decision patterns, policy effectiveness, and system performance
 */

import React, { useEffect, useState } from 'react';
import { LineChart, BarChart, PieChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { qumusClient } from '@/lib/qumusClient';

interface AnalyticsData {
  decisionTrends: Array<{ time: string; autonomous: number; override: number }>;
  policyEffectiveness: Array<{ policy: string; effectiveness: number; executions: number }>;
  autonomyDistribution: Array<{ name: string; value: number }>;
  systemPerformance: Array<{ system: string; avgResponseTime: number; errorRate: number }>;
  decisionBreakdown: Array<{ type: string; count: number; percentage: number }>;
}

export function QumusAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await qumusClient.getAnalytics(timeRange);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">QUMUS Analytics</h1>
          <p className="text-muted-foreground">Decision patterns and system performance metrics</p>
        </div>
        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245ms</div>
            <p className="text-xs text-muted-foreground">↓ 12% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              System Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.98%</div>
            <p className="text-xs text-muted-foreground">↑ 0.02% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Error Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.02%</div>
            <p className="text-xs text-muted-foreground">↓ 0.01% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Autonomy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">↑ 2% from last period</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Decision Trends</TabsTrigger>
          <TabsTrigger value="policies">Policy Effectiveness</TabsTrigger>
          <TabsTrigger value="systems">System Performance</TabsTrigger>
          <TabsTrigger value="breakdown">Decision Breakdown</TabsTrigger>
        </TabsList>

        {/* Decision Trends */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Decision Trends</CardTitle>
              <CardDescription>
                Autonomous vs Human Override decisions over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.decisionTrends && (
                <LineChart width={800} height={300} data={analytics.decisionTrends}>
                  <line type="monotone" dataKey="autonomous" stroke="#10b981" />
                  <line type="monotone" dataKey="override" stroke="#f59e0b" />
                </LineChart>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policy Effectiveness */}
        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>Policy Effectiveness</CardTitle>
              <CardDescription>Success rate and execution count by policy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.policyEffectiveness.map((policy) => (
                  <div key={policy.policy} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{policy.policy}</span>
                      <span className="text-sm text-muted-foreground">
                        {policy.executions} executions
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                        style={{ width: `${policy.effectiveness}%` }}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">{policy.effectiveness}% effective</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Performance */}
        <TabsContent value="systems">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>Response time and error rate by connected system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.systemPerformance.map((system) => (
                  <div key={system.system} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium">{system.system}</p>
                      <p className="text-sm text-muted-foreground">
                        Response: {system.avgResponseTime}ms | Error Rate: {system.errorRate}%
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        system.errorRate < 0.1
                          ? 'bg-green-500/20 text-green-700'
                          : system.errorRate < 1
                            ? 'bg-yellow-500/20 text-yellow-700'
                            : 'bg-red-500/20 text-red-700'
                      }`}
                    >
                      {system.errorRate < 0.1 ? 'Healthy' : system.errorRate < 1 ? 'Warning' : 'Critical'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Decision Breakdown */}
        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <CardTitle>Decision Breakdown</CardTitle>
              <CardDescription>Distribution of decision types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analytics?.decisionBreakdown.map((item) => (
                  <div key={item.type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">{item.type}</span>
                      <span className="text-sm text-muted-foreground">{item.count} decisions</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          item.type === 'autonomous'
                            ? 'bg-green-500'
                            : item.type === 'override'
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">{item.percentage}% of total</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
