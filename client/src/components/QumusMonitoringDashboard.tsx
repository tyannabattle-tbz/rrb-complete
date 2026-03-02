'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface DecisionEvent {
  id: string;
  policy: string;
  timestamp: Date;
  autonomous: boolean;
  action: string;
  result: string;
}

interface SystemMetrics {
  timestamp: Date;
  cpu: number;
  memory: number;
  disk: number;
  uptime: number;
}

export default function QumusMonitoringDashboard() {
  const [decisionHistory, setDecisionHistory] = useState<DecisionEvent[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  const [autonomyStats, setAutonomyStats] = useState({
    autonomousDecisions: 0,
    humanOversightEvents: 0,
    autonomyPercentage: 0,
    averageDecisionTime: 0,
  });

  // Fetch Qumus status
  const { data: qumusStatus } = trpc.qumusFinalization.getStatus.useQuery();

  // Fetch decision history
  const { data: historyData } = trpc.qumusFinalization.getDecisionHistory.useQuery(
    { limit: 50, policyFilter: selectedPolicy || undefined },
    { refetchInterval: 5000 } // Refresh every 5 seconds
  );

  // Fetch metrics
  const { data: metricsData } = trpc.qumusFinalization.getMetrics.useQuery(
    undefined,
    { refetchInterval: 10000 } // Refresh every 10 seconds
  );

  // Update state when data arrives
  useEffect(() => {
    if (historyData?.decisions) {
      setDecisionHistory(historyData.decisions);
    }
  }, [historyData]);

  useEffect(() => {
    if (metricsData) {
      setAutonomyStats({
        autonomousDecisions: metricsData.autonomyMetrics.autonomousDecisions,
        humanOversightEvents: metricsData.autonomyMetrics.humanOversightEvents,
        autonomyPercentage: metricsData.autonomyMetrics.autonomyPercentage,
        averageDecisionTime: metricsData.autonomyMetrics.averageDecisionTime,
      });

      // Add to metrics history
      setMetrics(prev => [...prev.slice(-59), {
        timestamp: new Date(),
        cpu: metricsData.systemHealth.cpu,
        memory: metricsData.systemHealth.memory,
        disk: metricsData.systemHealth.disk,
        uptime: metricsData.systemHealth.uptime,
      }]);
    }
  }, [metricsData]);

  // Decision type distribution
  const decisionDistribution = [
    { name: 'Autonomous', value: autonomyStats.autonomousDecisions, fill: '#10b981' },
    { name: 'Human Oversight', value: autonomyStats.humanOversightEvents, fill: '#f59e0b' },
  ];

  // Policy performance data
  const policyPerformance = [
    { name: 'Broadcast Mgmt', decisions: 287, autonomy: 95 },
    { name: 'Content Rec', decisions: 156, autonomy: 85 },
    { name: 'Fundraising', decisions: 98, autonomy: 80 },
    { name: 'Drone Ops', decisions: 412, autonomy: 90 },
    { name: 'Tactical Map', decisions: 167, autonomy: 88 },
    { name: 'Emergency', decisions: 42, autonomy: 75 },
    { name: 'Health Monitor', decisions: 523, autonomy: 92 },
    { name: 'Security', decisions: 89, autonomy: 70 },
  ];

  return (
    <div className="w-full bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Qumus Autonomous Monitoring</h1>
          <p className="text-muted-foreground">Real-time orchestration and decision tracking</p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Autonomy Level */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Autonomy Level</CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{autonomyStats.autonomyPercentage.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">90% target</p>
            </CardContent>
          </Card>

          {/* Autonomous Decisions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Autonomous Decisions</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{autonomyStats.autonomousDecisions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total today</p>
            </CardContent>
          </Card>

          {/* Human Oversight */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Human Oversight</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{autonomyStats.humanOversightEvents}</div>
              <p className="text-xs text-muted-foreground">Override events</p>
            </CardContent>
          </Card>

          {/* Avg Decision Time */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Decision Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{autonomyStats.averageDecisionTime}ms</div>
              <p className="text-xs text-muted-foreground">Per decision</p>
            </CardContent>
          </Card>
        </div>

        {/* System Health */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>System Health Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cpu" stroke="#ef4444" name="CPU %" />
                <Line type="monotone" dataKey="memory" stroke="#f59e0b" name="Memory %" />
                <Line type="monotone" dataKey="disk" stroke="#8b5cf6" name="Disk %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Decision Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Decision Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={decisionDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {decisionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Policy Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={policyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="autonomy" fill="#10b981" name="Autonomy %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Decision History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Decision History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Time</th>
                    <th className="text-left py-2 px-4">Policy</th>
                    <th className="text-left py-2 px-4">Action</th>
                    <th className="text-left py-2 px-4">Type</th>
                    <th className="text-left py-2 px-4">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {decisionHistory.slice(0, 10).map((decision) => (
                    <tr key={decision.id} className="border-b hover:bg-accent">
                      <td className="py-2 px-4 text-xs">
                        {new Date(decision.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2 px-4 font-medium">{decision.policy}</td>
                      <td className="py-2 px-4">{decision.action}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          decision.autonomous
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {decision.autonomous ? 'Autonomous' : 'Oversight'}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          decision.result === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {decision.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
