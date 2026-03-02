import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Radio, AlertCircle, Heart, ShoppingCart, Zap } from 'lucide-react';

/**
 * Comprehensive Analytics Dashboard
 * Real-time metrics across Qumus, RRB, and HybridCast
 * Listeners, donations, task completion, autonomous decisions
 */

interface SystemMetrics {
  system: 'qumus' | 'rrb' | 'hybridcast';
  activeUsers: number;
  totalEvents: number;
  successRate: number;
  avgResponseTime: number;
  uptime: number;
}

interface AnalyticsData {
  qumusMetrics: {
    activeTasks: number;
    completedTasks: number;
    failedTasks: number;
    successRate: number;
    autonomyLevel: number;
    decisionsPerHour: number;
    policyExecutions: Record<string, number>;
  };
  rrbMetrics: {
    activeListeners: number;
    totalListeners: number;
    averageSessionDuration: number;
    channelsActive: number;
    broadcastsScheduled: number;
    frequencyPreference: Record<string, number>;
  };
  hybridcastMetrics: {
    alertsTriggered: number;
    meshNodesActive: number;
    emergencyBroadcasts: number;
    offlineCapability: number;
    responseTime: number;
  };
  donations: {
    totalDonations: number;
    donorCount: number;
    averageDonation: number;
    impactMetrics: Record<string, number>;
  };
  engagement: {
    hourlyActiveUsers: Array<{ hour: string; users: number }>;
    eventTypes: Record<string, number>;
    contentPerformance: Array<{ content: string; views: number; engagement: number }>;
  };
}

export const ComprehensiveAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [selectedSystem, setSelectedSystem] = useState<'all' | 'qumus' | 'rrb' | 'hybridcast'>('all');
  const [loading, setLoading] = useState(true);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/analytics?timeRange=${timeRange}&system=${selectedSystem}`);
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('[Analytics] Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [timeRange, selectedSystem]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <p className="text-red-400">Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Analytics Dashboard</h1>
        <div className="flex gap-4 flex-wrap">
          {/* Time Range Selector */}
          <div className="flex gap-2">
            {(['1h', '24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* System Selector */}
          <div className="flex gap-2">
            {(['all', 'qumus', 'rrb', 'hybridcast'] as const).map((system) => (
              <button
                key={system}
                onClick={() => setSelectedSystem(system)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedSystem === system
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {system.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Qumus Metrics */}
        <div className="p-6 bg-slate-800 rounded-lg border-2 border-purple-500/50 hover:border-purple-500 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Qumus</h3>
            <Zap className="w-6 h-6 text-purple-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Active Tasks:</span>
              <span className="text-white font-bold">{analytics.qumusMetrics.activeTasks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Success Rate:</span>
              <span className="text-green-400 font-bold">{analytics.qumusMetrics.successRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Autonomy:</span>
              <span className="text-cyan-400 font-bold">{analytics.qumusMetrics.autonomyLevel}%</span>
            </div>
          </div>
        </div>

        {/* RRB Metrics */}
        <div className="p-6 bg-slate-800 rounded-lg border-2 border-pink-500/50 hover:border-pink-500 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">RRB</h3>
            <Radio className="w-6 h-6 text-pink-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Active Listeners:</span>
              <span className="text-white font-bold">{analytics.rrbMetrics.activeListeners}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Channels:</span>
              <span className="text-white font-bold">{analytics.rrbMetrics.channelsActive}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Avg Duration:</span>
              <span className="text-white font-bold">{analytics.rrbMetrics.averageSessionDuration}m</span>
            </div>
          </div>
        </div>

        {/* HybridCast Metrics */}
        <div className="p-6 bg-slate-800 rounded-lg border-2 border-red-500/50 hover:border-red-500 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">HybridCast</h3>
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Alerts:</span>
              <span className="text-white font-bold">{analytics.hybridcastMetrics.alertsTriggered}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mesh Nodes:</span>
              <span className="text-white font-bold">{analytics.hybridcastMetrics.meshNodesActive}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Offline Ready:</span>
              <span className="text-green-400 font-bold">{analytics.hybridcastMetrics.offlineCapability}%</span>
            </div>
          </div>
        </div>

        {/* Donations Metrics */}
        <div className="p-6 bg-slate-800 rounded-lg border-2 border-green-500/50 hover:border-green-500 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Donations</h3>
            <Heart className="w-6 h-6 text-green-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Total:</span>
              <span className="text-white font-bold">${analytics.donations.totalDonations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Donors:</span>
              <span className="text-white font-bold">{analytics.donations.donorCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Avg:</span>
              <span className="text-white font-bold">${analytics.donations.averageDonation}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Hourly Active Users */}
        <div className="p-6 bg-slate-800 rounded-lg border-2 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Hourly Active Users</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.engagement.hourlyActiveUsers}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="hour" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="users" stroke="#06b6d4" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Event Types Distribution */}
        <div className="p-6 bg-slate-800 rounded-lg border-2 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Event Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(analytics.engagement.eventTypes).map(([name, value]) => ({
                  name,
                  value,
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.entries(analytics.engagement.eventTypes).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={['#06b6d4', '#ec4899', '#f59e0b', '#10b981'][index % 4]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Task Completion */}
        <div className="p-6 bg-slate-800 rounded-lg border-2 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Task Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                {
                  name: 'Tasks',
                  completed: analytics.qumusMetrics.completedTasks,
                  failed: analytics.qumusMetrics.failedTasks,
                  active: analytics.qumusMetrics.activeTasks,
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Bar dataKey="completed" fill="#10b981" />
              <Bar dataKey="active" fill="#f59e0b" />
              <Bar dataKey="failed" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Content Performance */}
        <div className="p-6 bg-slate-800 rounded-lg border-2 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Top Content</h3>
          <div className="space-y-3">
            {analytics.engagement.contentPerformance.slice(0, 5).map((content, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-slate-300">{content.content}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400"
                      style={{ width: `${(content.engagement / 100) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-400">{content.engagement}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Policy Execution Breakdown */}
      <div className="p-6 bg-slate-800 rounded-lg border-2 border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Qumus Policy Executions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(analytics.qumusMetrics.policyExecutions).map(([policy, count]) => (
            <div key={policy} className="p-4 bg-slate-700 rounded-lg">
              <p className="text-sm text-slate-400 mb-2">{policy}</p>
              <p className="text-2xl font-bold text-cyan-400">{count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveAnalyticsDashboard;
