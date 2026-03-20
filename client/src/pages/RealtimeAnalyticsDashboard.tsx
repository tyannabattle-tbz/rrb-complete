import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Activity, Zap, Users, DollarSign, Heart } from 'lucide-react';

export default function RealtimeAnalyticsDashboard() {
  const [metrics, setMetrics] = useState({
    wealthStreams: { active: 12, totalIncome: 45000, lastUpdate: new Date() },
    grantApplications: { pending: 8, approved: 24, rejected: 3, totalValue: 450000 },
    campaigns: { active: 5, totalRaised: 85000, totalGoal: 100000, completionPercentage: 85 },
    socialEngagement: { totalPosts: 124, totalEngagement: 12847, averageLikes: 131 },
    trustMetrics: { averageTrustScore: 72, platinumUsers: 45, goldUsers: 92, silverUsers: 78 },
    webhookMetrics: { totalEvents: 2847, processedEvents: 2734, failedEvents: 18, averageLatency: 245 },
  });

  const [liveTimeline] = useState([
    { time: '00:00', income: 1200, grants: 3, campaigns: 2, engagement: 245 },
    { time: '04:00', income: 1850, grants: 5, campaigns: 1, engagement: 389 },
    { time: '08:00', income: 2100, grants: 4, campaigns: 3, engagement: 312 },
    { time: '12:00', income: 3200, grants: 8, campaigns: 2, engagement: 467 },
    { time: '16:00', income: 4100, grants: 6, campaigns: 4, engagement: 534 },
    { time: '20:00', income: 3500, grants: 7, campaigns: 3, engagement: 421 },
    { time: '24:00', income: 2800, grants: 5, campaigns: 2, engagement: 298 },
  ]);

  const [systemHealth] = useState({
    qumusSubsystems: 20,
    autonomyLevel: 92,
    eventProcessingRate: 98.5,
    systemUptime: 99.9,
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        wealthStreams: {
          ...prev.wealthStreams,
          totalIncome: prev.wealthStreams.totalIncome + Math.floor(Math.random() * 500),
          lastUpdate: new Date(),
        },
        campaigns: {
          ...prev.campaigns,
          totalRaised: prev.campaigns.totalRaised + Math.floor(Math.random() * 200),
          completionPercentage: Math.min(100, prev.campaigns.completionPercentage + 0.5),
        },
        socialEngagement: {
          ...prev.socialEngagement,
          totalEngagement: prev.socialEngagement.totalEngagement + Math.floor(Math.random() * 50),
        },
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Real-Time Analytics Dashboard</h1>
        <p className="text-gray-400 mt-1">Live metrics across wealth, grants, campaigns, and engagement</p>
      </div>

      {/* System Health */}
      <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-700">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-gray-300 text-sm mb-1">QUMUS Subsystems</p>
              <p className="text-3xl font-bold text-purple-400">{systemHealth.qumusSubsystems}/20</p>
              <Badge className="mt-2 bg-green-500/20 text-green-300">Healthy</Badge>
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-sm mb-1">Autonomy Level</p>
              <p className="text-3xl font-bold text-blue-400">{systemHealth.autonomyLevel}%</p>
              <Badge className="mt-2 bg-blue-500/20 text-blue-300">Active</Badge>
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-sm mb-1">Event Processing</p>
              <p className="text-3xl font-bold text-cyan-400">{systemHealth.eventProcessingRate}%</p>
              <Badge className="mt-2 bg-cyan-500/20 text-cyan-300">Optimal</Badge>
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-sm mb-1">System Uptime</p>
              <p className="text-3xl font-bold text-emerald-400">{systemHealth.systemUptime}%</p>
              <Badge className="mt-2 bg-emerald-500/20 text-emerald-300">Excellent</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Income</p>
                <p className="text-2xl font-bold text-green-400">
                  ${(metrics.wealthStreams.totalIncome / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {metrics.wealthStreams.active} active streams
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Campaign Progress</p>
                <p className="text-2xl font-bold text-blue-400">
                  ${(metrics.campaigns.totalRaised / 1000).toFixed(0)}K / ${(metrics.campaigns.totalGoal / 1000).toFixed(0)}K
                </p>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                  <div
                    className="h-2 rounded-full bg-blue-500 transition-all"
                    style={{ width: `${metrics.campaigns.completionPercentage}%` }}
                  />
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Social Engagement</p>
                <p className="text-2xl font-bold text-pink-400">
                  {(metrics.socialEngagement.totalEngagement / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {metrics.socialEngagement.totalPosts} posts
                </p>
              </div>
              <Heart className="w-8 h-8 text-pink-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Grants Approved</p>
                <p className="text-2xl font-bold text-purple-400">{metrics.grantApplications.approved}</p>
                <p className="text-xs text-gray-500 mt-1">
                  ${(metrics.grantApplications.totalValue / 1000).toFixed(0)}K total
                </p>
              </div>
              <Zap className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Trust Score</p>
                <p className="text-2xl font-bold text-cyan-400">{metrics.trustMetrics.averageTrustScore}/100</p>
                <p className="text-xs text-gray-500 mt-1">
                  {metrics.trustMetrics.platinumUsers + metrics.trustMetrics.goldUsers} premium users
                </p>
              </div>
              <Users className="w-8 h-8 text-cyan-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Webhook Health</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {Math.round((metrics.webhookMetrics.processedEvents / metrics.webhookMetrics.totalEvents) * 100)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {metrics.webhookMetrics.averageLatency}ms avg latency
                </p>
              </div>
              <Activity className="w-8 h-8 text-emerald-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Timeline */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Live Activity Timeline (Last 24 Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={liveTimeline}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorIncome)"
                name="Income"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Multi-Metric Chart */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Ecosystem Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={liveTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Legend />
              <Bar dataKey="grants" fill="#8b5cf6" name="Grants" />
              <Bar dataKey="campaigns" fill="#3b82f6" name="Campaigns" />
              <Bar dataKey="engagement" fill="#ec4899" name="Engagement" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Ecosystem Status */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Ecosystem Integration Status</CardTitle>
          <CardDescription>Real-time sync across all systems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-white">HybridCast</h4>
                <Badge className="bg-green-500/20 text-green-300">Synced</Badge>
              </div>
              <p className="text-sm text-gray-400">Donation links, grant opportunities, emergency broadcasts</p>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-white">SQUADD Radio</h4>
                <Badge className="bg-green-500/20 text-green-300">Synced</Badge>
              </div>
              <p className="text-sm text-gray-400">Listener tips, funding campaigns, monetization</p>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-white">Content Calendar</h4>
                <Badge className="bg-green-500/20 text-green-300">Synced</Badge>
              </div>
              <p className="text-sm text-gray-400">Campaign links, monetization options, grant opportunities</p>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-cyan-500">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-white">Twitter/X</h4>
                <Badge className="bg-green-500/20 text-green-300">Active</Badge>
              </div>
              <p className="text-sm text-gray-400">Autonomous posts, leaderboards, social sharing</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Update */}
      <div className="text-center text-gray-400 text-sm">
        Last updated: {metrics.wealthStreams.lastUpdate.toLocaleTimeString()} • Auto-refresh every 5 seconds
      </div>
    </div>
  );
}
