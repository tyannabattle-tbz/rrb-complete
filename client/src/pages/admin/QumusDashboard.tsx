/**
 * QUMUS Dashboard
 * Central control panel for autonomous orchestration engine
 * Displays metrics, policies, decisions, and system integration
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, Brain, Zap, TrendingUp, Settings, RefreshCw } from 'lucide-react';

interface Policy {
  id: string;
  name: string;
  description: string;
  autonomyLevel: number;
  enabled: boolean;
  executionCount: number;
  lastExecuted: number | null;
}

interface Decision {
  id: string;
  policyId: string;
  timestamp: number;
  autonomous: boolean;
  action: string;
  result: string;
  systemsAffected: string[];
}

interface Metrics {
  totalDecisions: number;
  autonomousDecisions: number;
  humanOverrides: number;
  autonomyPercentage: number;
  policies: number;
  enabledPolicies: number;
}

export function QumusDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const QUMUS_API = process.env.VITE_QUMUS_API_URL || 'http://localhost:3001';

  // Fetch metrics
  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${QUMUS_API}/api/metrics`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  };

  // Fetch policies
  const fetchPolicies = async () => {
    try {
      const response = await fetch(`${QUMUS_API}/api/policies`);
      if (response.ok) {
        const data = await response.json();
        setPolicies(data);
      }
    } catch (err) {
      console.error('Failed to fetch policies:', err);
    }
  };

  // Fetch decisions
  const fetchDecisions = async () => {
    try {
      const response = await fetch(`${QUMUS_API}/api/decisions?limit=20`);
      if (response.ok) {
        const data = await response.json();
        setDecisions(data);
      }
    } catch (err) {
      console.error('Failed to fetch decisions:', err);
    }
  };

  // Initial load and setup refresh
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMetrics(), fetchPolicies(), fetchDecisions()]);
      setLoading(false);
    };

    loadData();

    const interval = setInterval(loadData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Prepare chart data
  const chartData = decisions.slice(-10).map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString(),
    autonomous: d.autonomous ? 1 : 0,
    manual: d.autonomous ? 0 : 1,
  }));

  const autonomyData = [
    { name: 'Autonomous', value: metrics?.autonomousDecisions || 0, fill: '#3b82f6' },
    { name: 'Human Override', value: metrics?.humanOverrides || 0, fill: '#ef4444' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p>Loading QUMUS Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-400" />
              <h1 className="text-4xl font-bold text-white">QUMUS Dashboard</h1>
            </div>
            <Button
              onClick={() => Promise.all([fetchMetrics(), fetchPolicies(), fetchDecisions()])}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
          <p className="text-slate-400 mt-2">Autonomous Orchestration Engine - Central Brain</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Autonomy Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{metrics?.autonomyPercentage || 0}%</div>
              <p className="text-xs text-slate-500 mt-1">90% target</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Decisions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{metrics?.totalDecisions || 0}</div>
              <p className="text-xs text-slate-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Autonomous</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">{metrics?.autonomousDecisions || 0}</div>
              <p className="text-xs text-slate-500 mt-1">No human intervention</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Active Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400">
                {metrics?.enabledPolicies}/{metrics?.policies}
              </div>
              <p className="text-xs text-slate-500 mt-1">Enabled</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="decisions">Decisions</TabsTrigger>
            <TabsTrigger value="systems">Connected Systems</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Autonomy Chart */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Autonomy Distribution</CardTitle>
                  <CardDescription>Autonomous vs Human Override</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={autonomyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                      />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Decision Timeline */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Decision Timeline</CardTitle>
                  <CardDescription>Last 10 decisions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="time" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="autonomous" stroke="#3b82f6" name="Autonomous" />
                      <Line type="monotone" dataKey="manual" stroke="#ef4444" name="Manual" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>12 Autonomous Decision Policies</CardTitle>
                <CardDescription>Configure autonomy levels and enable/disable policies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {policies.map((policy) => (
                    <div
                      key={policy.id}
                      className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{policy.name}</h3>
                        <p className="text-sm text-slate-400">{policy.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-slate-500">
                            Executions: {policy.executionCount}
                          </span>
                          {policy.lastExecuted && (
                            <span className="text-xs text-slate-500">
                              Last: {new Date(policy.lastExecuted).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-400">
                            {policy.autonomyLevel}%
                          </div>
                          <p className="text-xs text-slate-500">Autonomy</p>
                        </div>
                        <Button
                          variant={policy.enabled ? 'default' : 'outline'}
                          size="sm"
                          className={policy.enabled ? 'bg-green-600' : ''}
                        >
                          {policy.enabled ? 'Enabled' : 'Disabled'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Decisions Tab */}
          <TabsContent value="decisions">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Recent Decisions</CardTitle>
                <CardDescription>Last 20 decisions made by QUMUS</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {decisions.map((decision) => (
                    <div
                      key={decision.id}
                      className="flex items-center justify-between p-3 bg-slate-700 rounded border border-slate-600 text-sm"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-white">{decision.action}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(decision.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {decision.autonomous ? (
                          <span className="px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded">
                            Autonomous
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-900 text-red-200 text-xs rounded">
                            Manual
                          </span>
                        )}
                        <span className="text-xs text-slate-500">{decision.result}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connected Systems Tab */}
          <TabsContent value="systems">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['RRB', 'HybridCast', 'Canryn', 'Sweet Miracles'].map((system) => (
                <Card key={system} className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-400" />
                      {system}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-400">Status: <span className="text-green-400">Connected</span></p>
                      <p className="text-sm text-slate-400">Last Sync: <span className="text-slate-300">Just now</span></p>
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default QumusDashboard;
