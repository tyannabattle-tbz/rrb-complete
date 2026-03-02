import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, RefreshCw, TrendingUp } from 'lucide-react';
import { useLocation } from 'wouter';

// Mock analytics data
const generateMockAnalytics = () => {
  const categories = ['Network', 'Communication', 'Emergency', 'Health', 'Security', 'Operations', 'Accessibility'];
  const tabs = [
    'GPS', 'LIVE', 'AUDIO', 'CHAT', 'ALERT', 'SCHED', 'DRILL', 'TEAM', 'ALERTS', 'TRAIN',
    'HISTORY', 'LOG', 'STATS', 'RADAR', 'QUMUS', 'NET', 'TOPO', 'GEO', 'WX', 'MESH'
  ];

  return {
    tabUsage: tabs.map((tab, idx) => ({
      name: tab,
      usage: Math.floor(Math.random() * 500) + 50,
      avgTime: Math.floor(Math.random() * 15) + 2,
    })).sort((a, b) => b.usage - a.usage).slice(0, 10),

    categoryDistribution: categories.map((cat) => ({
      name: cat,
      value: Math.floor(Math.random() * 1000) + 200,
    })),

    hourlyTrend: Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      users: Math.floor(Math.random() * 500) + 100,
      actions: Math.floor(Math.random() * 2000) + 500,
    })),

    tabEngagement: tabs.map((tab) => ({
      name: tab,
      clicks: Math.floor(Math.random() * 1000),
      avgSessionTime: Math.floor(Math.random() * 30) + 5,
    })).slice(0, 8),

    userSegments: [
      { name: 'Admin', value: 120, color: '#ef4444' },
      { name: 'Coordinator', value: 340, color: '#3b82f6' },
      { name: 'Viewer', value: 540, color: '#10b981' },
    ],

    featureAdoption: [
      { feature: 'Search', adoption: 85 },
      { feature: 'Favorites', adoption: 62 },
      { feature: 'Groups', adoption: 48 },
      { feature: 'Analytics', adoption: 35 },
      { feature: 'Keyboard Shortcuts', adoption: 72 },
    ],
  };
};

export default function HybridCastAnalyticsDashboard() {
  const [, navigate] = useLocation();
  const [analytics, setAnalytics] = useState(generateMockAnalytics());
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleRefresh = () => {
    setAnalytics(generateMockAnalytics());
  };

  const handleDownload = () => {
    const data = JSON.stringify(analytics, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hybridcast-analytics-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Calculate statistics
  const totalUsage = analytics.tabUsage.reduce((sum, tab) => sum + tab.usage, 0);
  const avgEngagement = Math.round(analytics.tabUsage.reduce((sum, tab) => sum + tab.avgTime, 0) / analytics.tabUsage.length);
  const totalUsers = analytics.userSegments.reduce((sum, seg) => sum + seg.value, 0);
  const topTab = analytics.tabUsage[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">HybridCast Analytics</h1>
              <p className="text-slate-400 text-sm mt-1">Platform usage and engagement metrics</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={handleDownload}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {['24h', '7d', '30d', '90d'].map((range) => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`${
                timeRange === range
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 bg-slate-800 border border-slate-700">
          <div className="text-sm text-slate-400 mb-2">Total Tab Usage</div>
          <div className="text-3xl font-bold text-cyan-400">{totalUsage.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-2">
            <TrendingUp className="w-3 h-3 inline mr-1 text-green-400" />
            +12% from last period
          </div>
        </Card>

        <Card className="p-6 bg-slate-800 border border-slate-700">
          <div className="text-sm text-slate-400 mb-2">Avg Engagement Time</div>
          <div className="text-3xl font-bold text-blue-400">{avgEngagement}m</div>
          <div className="text-xs text-slate-500 mt-2">Per session</div>
        </Card>

        <Card className="p-6 bg-slate-800 border border-slate-700">
          <div className="text-sm text-slate-400 mb-2">Active Users</div>
          <div className="text-3xl font-bold text-green-400">{totalUsers}</div>
          <div className="text-xs text-slate-500 mt-2">
            <TrendingUp className="w-3 h-3 inline mr-1 text-green-400" />
            +8% growth
          </div>
        </Card>

        <Card className="p-6 bg-slate-800 border border-slate-700">
          <div className="text-sm text-slate-400 mb-2">Top Tab</div>
          <div className="text-3xl font-bold text-purple-400">{topTab?.name}</div>
          <div className="text-xs text-slate-500 mt-2">{topTab?.usage} uses</div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top 10 Tabs */}
        <Card className="p-6 bg-slate-800 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Top 10 Most Used Tabs</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.tabUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="usage" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Hourly Trend */}
        <Card className="p-6 bg-slate-800 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">24-Hour Activity Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.hourlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="hour" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="actions" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Distribution & User Segments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Category Distribution */}
          <Card className="p-6 bg-slate-800 border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4">Category Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.categoryDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={['#06b6d4', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'][index]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* User Segments */}
          <Card className="p-6 bg-slate-800 border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4">User Segments</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.userSegments}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.userSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Feature Adoption */}
        <Card className="p-6 bg-slate-800 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Feature Adoption Rate</h2>
          <div className="space-y-4">
            {analytics.featureAdoption.map((feature) => (
              <div key={feature.feature}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-300">{feature.feature}</span>
                  <span className="text-sm font-semibold text-cyan-400">{feature.adoption}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${feature.adoption}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Tab Engagement Details */}
        <Card className="p-6 bg-slate-800 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Tab Engagement Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-4 text-slate-400">Tab</th>
                  <th className="text-right py-2 px-4 text-slate-400">Clicks</th>
                  <th className="text-right py-2 px-4 text-slate-400">Avg Session (min)</th>
                  <th className="text-right py-2 px-4 text-slate-400">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {analytics.tabEngagement.map((tab) => (
                  <tr key={tab.name} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-2 px-4 text-slate-300">{tab.name}</td>
                    <td className="text-right py-2 px-4 text-cyan-400">{tab.clicks.toLocaleString()}</td>
                    <td className="text-right py-2 px-4 text-blue-400">{tab.avgSessionTime}</td>
                    <td className="text-right py-2 px-4">
                      <div className="inline-block px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                        {Math.round((tab.clicks / 1000) * 100)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
