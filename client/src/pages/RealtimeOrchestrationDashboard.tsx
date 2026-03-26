import React, { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock, Zap, Activity, TrendingUp } from 'lucide-react';

interface PolicyDecision {
  id: string;
  policyName: string;
  decision: any;
  timestamp: Date;
  autonomous: boolean;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export function RealtimeOrchestrationDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyDecision | null>(null);

  // Real-time queries
  const { data: stats, isLoading: statsLoading } = trpc.realtimeOrchestration.getStats.useQuery(undefined, {
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const { data: eventHistory, isLoading: eventsLoading } = trpc.realtimeOrchestration.getEventHistory.useQuery(
    { limit: 50 },
    { refetchInterval: autoRefresh ? 10000 : false }
  );

  const { data: policyHistory, isLoading: policiesLoading } = trpc.realtimeOrchestration.getPolicyHistory.useQuery(
    { limit: 50 },
    { refetchInterval: autoRefresh ? 10000 : false }
  );

  const { data: health } = trpc.realtimeOrchestration.getHealth.useQuery(undefined, {
    refetchInterval: autoRefresh ? 5000 : false,
  });

  // Mutations
  const executeAutonomous = trpc.realtimeOrchestration.executeAutonomousPolicy.useMutation();
  const executeManual = trpc.realtimeOrchestration.executeManualPolicy.useMutation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-700 border-green-200';
      case 'executing':
        return 'bg-blue-500/20 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-200';
      case 'failed':
        return 'bg-red-500/20 text-red-700 border-red-200';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'executing':
        return <Activity className="w-4 h-4 animate-pulse" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Real-Time Orchestration</h1>
              <p className="text-slate-400">Autonomous Policy Execution & Event Broadcasting</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={health?.isHealthy ? 'default' : 'destructive'}>
                {health?.isHealthy ? 'Healthy' : 'Issues Detected'}
              </Badge>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                {autoRefresh ? '⏸ Pause' : '▶ Resume'} Updates
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Active Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.activeClients || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{stats?.totalEvents || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Completed Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{stats?.completedPolicies || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Failed Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{stats?.failedPolicies || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Policy Execution */}
        <Card className="mb-8 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Policy Execution Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {policyHistory && policyHistory.length > 0 ? (
                policyHistory.map((policy: PolicyDecision) => (
                  <div
                    key={policy.id}
                    onClick={() => setSelectedPolicy(policy)}
                    className="bg-slate-700/50 p-4 rounded-lg cursor-pointer hover:bg-slate-700 transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(policy.status)}
                        <div>
                          <div className="font-semibold text-white">{policy.policyName}</div>
                          <div className="text-xs text-slate-400">
                            {new Date(policy.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(policy.status)} border`}>
                          {policy.status}
                        </Badge>
                        {policy.autonomous && (
                          <Badge className="bg-purple-500/20 text-purple-700 border-purple-200 border">
                            Autonomous
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 py-8">No policies executed yet</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Event History */}
        <Card className="mb-8 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {eventHistory && eventHistory.length > 0 ? (
                eventHistory.map((event: any, index: number) => (
                  <div key={index} className="bg-slate-700/50 p-3 rounded-lg text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-slate-300">{event.type}</span>
                        <span className="text-slate-500 ml-2">from {event.service}</span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 py-8">No events yet</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Policy Details */}
        {selectedPolicy && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Policy Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400">Policy Name</label>
                  <div className="text-white font-semibold">{selectedPolicy.policyName}</div>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Status</label>
                  <Badge className={`${getStatusColor(selectedPolicy.status)} border`}>
                    {selectedPolicy.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Decision</label>
                  <pre className="bg-slate-900 p-3 rounded text-xs text-slate-300 overflow-x-auto">
                    {JSON.stringify(selectedPolicy.decision, null, 2)}
                  </pre>
                </div>
                {selectedPolicy.result && (
                  <div>
                    <label className="text-sm text-slate-400">Result</label>
                    <pre className="bg-slate-900 p-3 rounded text-xs text-slate-300 overflow-x-auto">
                      {JSON.stringify(selectedPolicy.result, null, 2)}
                    </pre>
                  </div>
                )}
                {selectedPolicy.error && (
                  <div>
                    <label className="text-sm text-slate-400">Error</label>
                    <div className="bg-red-900/20 p-3 rounded text-sm text-red-400">{selectedPolicy.error}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-500">
          Last updated: {new Date().toLocaleTimeString()} • Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
        </div>
      </div>
    </div>
  );
}

export default RealtimeOrchestrationDashboard;
