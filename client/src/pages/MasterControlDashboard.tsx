import React, { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Zap, Radio, Headphones, TrendingUp } from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  healthPercentage: number;
  subsystemsHealthy: number;
  subsystemsTotal: number;
  responseTime: number;
}

export function MasterControlDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Real-time queries
  const { data: systemStatus, isLoading: statusLoading } = trpc.unifiedIntegration.getSystemStatus.useQuery(undefined, {
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const { data: metrics, isLoading: metricsLoading } = trpc.unifiedIntegration.getUnifiedMetrics.useQuery(undefined, {
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const { data: analytics, isLoading: analyticsLoading } = trpc.unifiedIntegration.getCrossSystemAnalytics.useQuery(undefined, {
    refetchInterval: autoRefresh ? 15000 : false,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500/20 text-green-700 border-green-200';
      case 'degraded':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-200';
      case 'offline':
        return 'bg-red-500/20 text-red-700 border-red-200';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'degraded':
        return <AlertCircle className="w-4 h-4" />;
      case 'offline':
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
              <h1 className="text-4xl font-bold text-white mb-2">QUMUS Master Control</h1>
              <p className="text-slate-400">Unified Ecosystem Orchestration Platform</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={systemStatus?.isOperational ? 'default' : 'destructive'}>
                {systemStatus?.isOperational ? 'All Systems Operational' : 'System Alert'}
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

        {/* Overall Health */}
        <Card className="mb-8 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">System Health Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <div className="text-sm text-slate-400 mb-2">Overall Health</div>
                <div className="text-3xl font-bold text-white">
                  {systemStatus?.overallHealth.toFixed(1)}%
                </div>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <div className="text-sm text-slate-400 mb-2">Active Listeners</div>
                <div className="text-3xl font-bold text-blue-400">
                  {metrics?.activeListeners.toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <div className="text-sm text-slate-400 mb-2">Total Channels</div>
                <div className="text-3xl font-bold text-purple-400">
                  {metrics?.totalChannels}
                </div>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <div className="text-sm text-slate-400 mb-2">Live Broadcasts</div>
                <div className="text-3xl font-bold text-green-400">
                  {metrics?.totalBroadcasts}
                </div>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <div className="text-sm text-slate-400 mb-2">Revenue (24h)</div>
                <div className="text-3xl font-bold text-yellow-400">
                  ${analytics?.revenue.todayRevenue.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {systemStatus?.services.map((service: ServiceStatus) => (
            <Card key={service.name} className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-white">{service.name}</CardTitle>
                  <Badge className={`${getStatusColor(service.status)} border`}>
                    <span className="mr-1">{getStatusIcon(service.status)}</span>
                    {service.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Health</div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${service.healthPercentage}%` }}
                    />
                  </div>
                  <div className="text-sm font-semibold text-white mt-1">
                    {service.healthPercentage}%
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  {service.subsystemsHealthy}/{service.subsystemsTotal} Subsystems
                </div>
                <div className="text-xs text-slate-500">
                  Response: {service.responseTime}ms
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Listener Analytics */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Headphones className="w-5 h-5" />
                Listener Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Listeners</span>
                  <span className="text-white font-semibold">{metrics?.totalListeners.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Active Now</span>
                  <span className="text-green-400 font-semibold">{metrics?.activeListeners.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Avg Engagement</span>
                  <span className="text-blue-400 font-semibold">{(metrics?.averageEngagement || 0).toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Analytics */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Revenue Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Revenue</span>
                  <span className="text-white font-semibold">${analytics?.revenue.totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Today</span>
                  <span className="text-yellow-400 font-semibold">${analytics?.revenue.todayRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Transactions</span>
                  <span className="text-purple-400 font-semibold">{analytics?.revenue.transactionCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Channel Breakdown */}
        {analytics?.channels.channels && (
          <Card className="mt-8 bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Radio className="w-5 h-5" />
                Active Channels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {analytics.channels.channels.slice(0, 8).map((channel: any) => (
                  <div key={channel.id} className="bg-slate-700/50 p-3 rounded-lg">
                    <div className="font-semibold text-white text-sm mb-1">{channel.name}</div>
                    <div className="text-xs text-slate-400 mb-2">
                      {channel.currentListeners} listeners
                    </div>
                    <Badge variant={channel.status === 'active' ? 'default' : 'secondary'}>
                      {channel.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Status Footer */}
        <div className="mt-8 text-center text-xs text-slate-500">
          Last updated: {new Date().toLocaleTimeString()} • Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
        </div>
      </div>
    </div>
  );
}

export default MasterControlDashboard;
