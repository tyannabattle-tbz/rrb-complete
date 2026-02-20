import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Zap, TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface MetricsData {
  timestamp: number;
  cpuUsage: number;
  memoryUsage: number;
  requestsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
}

export function AutonomousDashboard() {
  const [entityId, setEntityId] = useState('entity_1');
  const [metricsHistory, setMetricsHistory] = useState<MetricsData[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d'>('1h');

  // Fetch current metrics
  const { data: metricsData, isLoading: metricsLoading } = trpc.qumusAutonomousScaling.getCurrentMetrics.useQuery(
    { entityId },
    { refetchInterval: 5000 } // Refresh every 5 seconds
  );

  // Fetch entity status
  const { data: entityStatus } = trpc.qumusAutonomousEntity.getEntityStatus.useQuery(
    { entityId },
    { refetchInterval: 10000 }
  );

  // Fetch analytics
  const { data: analytics } = trpc.qumusAutonomousEntity.getEntityAnalytics.useQuery(
    { entityId },
    { refetchInterval: 30000 }
  );

  // Fetch scaling recommendations
  const { data: recommendations } = trpc.qumusAutonomousScaling.getScalingRecommendations.useQuery(
    { entityId },
    { refetchInterval: 30000 }
  );

  // Simulate metrics history for charts
  useEffect(() => {
    if (metricsData?.current) {
      setMetricsHistory(prev => {
        const newHistory = [...prev, metricsData.current];
        return newHistory.slice(-60); // Keep last 60 data points
      });
    }
  }, [metricsData?.current]);

  const autonomyStatus = entityStatus?.entity.autonomyLevel ?? 0;
  const autonomyColor = autonomyStatus >= 75 ? 'text-green-600' : autonomyStatus >= 50 ? 'text-yellow-600' : 'text-orange-600';

  const decisionsByImpactData = analytics?.decisionsByImpact
    ? Object.entries(analytics.decisionsByImpact).map(([impact, count]) => ({
        name: impact.charAt(0).toUpperCase() + impact.slice(1),
        value: count,
      }))
    : [];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#dc2626'];

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">QUMUS Autonomous Dashboard</h1>
          <p className="text-slate-500 mt-1">Real-time monitoring and control of autonomous entity operations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Refresh</Button>
          <Button size="sm">View Full Analytics</Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Autonomy Level */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Autonomy Level</CardTitle>
            <CardDescription>Current operational autonomy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${autonomyColor}`}>{autonomyStatus}%</div>
            <Progress value={autonomyStatus} className="mt-3" />
            <p className="text-xs text-slate-500 mt-2">
              Status: <span className="font-semibold">{entityStatus?.entity.status}</span>
            </p>
          </CardContent>
        </Card>

        {/* CPU Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metricsData?.current?.cpuUsage.toFixed(1)}%</div>
            <Progress value={metricsData?.current?.cpuUsage ?? 0} className="mt-3" />
            <p className="text-xs text-slate-500 mt-2">Avg: {metricsData?.averages?.cpu.toFixed(1)}%</p>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metricsData?.current?.memoryUsage.toFixed(1)}%</div>
            <Progress value={metricsData?.current?.memoryUsage ?? 0} className="mt-3" />
            <p className="text-xs text-slate-500 mt-2">Avg: {metricsData?.averages?.memory.toFixed(1)}%</p>
          </CardContent>
        </Card>

        {/* Response Time */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metricsData?.current?.averageResponseTime.toFixed(0)}ms</div>
            <p className="text-xs text-slate-500 mt-3">Avg: {metricsData?.averages?.responseTime.toFixed(0)}ms</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>CPU, Memory, and Response Time over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metricsHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cpuUsage" stroke="#ef4444" name="CPU %" />
                <Line type="monotone" dataKey="memoryUsage" stroke="#3b82f6" name="Memory %" />
                <Line type="monotone" dataKey="averageResponseTime" stroke="#f59e0b" name="Response Time (ms)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Decisions by Impact */}
        {decisionsByImpactData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Autonomous Decisions by Impact</CardTitle>
              <CardDescription>Distribution of decision impacts</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={decisionsByImpactData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {decisionsByImpactData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recommendations & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scaling Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Scaling Recommendations
            </CardTitle>
            <CardDescription>Suggested optimizations based on current metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations?.recommendations && recommendations.recommendations.length > 0 ? (
                recommendations.recommendations.map((rec, idx) => (
                  <div key={`item-${idx}`} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-900">{rec}</p>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-900">All systems operating optimally</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Entity Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Entity Statistics</CardTitle>
            <CardDescription>Operational metrics and performance data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm text-slate-600">Total Decisions</span>
                <span className="font-semibold">{analytics?.decisionCount ?? 0}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm text-slate-600">Average Confidence</span>
                <span className="font-semibold">{((analytics?.averageConfidence ?? 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm text-slate-600">Governance Policies</span>
                <span className="font-semibold">{analytics?.policyCount ?? 0}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm text-slate-600">Uptime</span>
                <span className="font-semibold">{((analytics?.uptime ?? 0) / 1000 / 60).toFixed(1)} min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Requests/sec</span>
                <span className="font-semibold">{metricsData?.current?.requestsPerSecond.toFixed(0) ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline">View Decision History</Button>
        <Button variant="outline">Manage Governance Policies</Button>
        <Button variant="outline">Adjust Autonomy Level</Button>
        <Button>View Approval Queue</Button>
      </div>
    </div>
  );
}
