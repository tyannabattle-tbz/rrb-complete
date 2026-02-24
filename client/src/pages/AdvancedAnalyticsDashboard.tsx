import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, AlertCircle } from 'lucide-react';

export default function AdvancedAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('decisions');

  // Sample data for decision trends
  const decisionTrends = [
    { time: '00:00', decisions: 45, overrides: 2, errors: 1 },
    { time: '04:00', decisions: 52, overrides: 3, errors: 2 },
    { time: '08:00', decisions: 78, overrides: 4, errors: 1 },
    { time: '12:00', decisions: 95, overrides: 5, errors: 3 },
    { time: '16:00', decisions: 87, overrides: 3, errors: 2 },
    { time: '20:00', decisions: 64, overrides: 2, errors: 1 },
    { time: '23:59', decisions: 41, overrides: 1, errors: 0 },
  ];

  // Policy effectiveness data
  const policyEffectiveness = [
    { name: 'Content Policy', effectiveness: 94, decisions: 234 },
    { name: 'User Policy', effectiveness: 91, decisions: 189 },
    { name: 'Payment Policy', effectiveness: 97, decisions: 156 },
    { name: 'Security Policy', effectiveness: 99, decisions: 203 },
    { name: 'Compliance Policy', effectiveness: 88, decisions: 142 },
    { name: 'Performance Policy', effectiveness: 93, decisions: 167 },
    { name: 'Engagement Policy', effectiveness: 86, decisions: 119 },
    { name: 'System Policy', effectiveness: 95, decisions: 178 },
  ];

  // Service performance data
  const servicePerformance = [
    { name: 'Stripe', uptime: 99.9, latency: 45 },
    { name: 'Slack', uptime: 99.8, latency: 32 },
    { name: 'Email', uptime: 99.7, latency: 28 },
    { name: 'Analytics', uptime: 99.6, latency: 52 },
    { name: 'Webhooks', uptime: 99.5, latency: 38 },
    { name: 'Auth', uptime: 99.9, latency: 18 },
    { name: 'Recommendations', uptime: 99.4, latency: 65 },
    { name: 'WebSocket', uptime: 99.8, latency: 22 },
    { name: 'Compliance', uptime: 99.9, latency: 35 },
    { name: 'Notifications', uptime: 99.7, latency: 42 },
    { name: 'LLM', uptime: 99.3, latency: 1200 },
  ];

  // Override patterns
  const overridePatterns = [
    { name: 'Content', value: 35, color: '#3b82f6' },
    { name: 'User', value: 25, color: '#10b981' },
    { name: 'Payment', value: 15, color: '#f59e0b' },
    { name: 'Security', value: 10, color: '#ef4444' },
    { name: 'Other', value: 15, color: '#8b5cf6' },
  ];

  const exportAnalytics = () => {
    const data = {
      timestamp: new Date().toISOString(),
      timeRange,
      decisionTrends,
      policyEffectiveness,
      servicePerformance,
      overridePatterns,
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qumus-analytics-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">QUMUS Analytics</h1>
            <p className="text-slate-400">Real-time autonomous decision analytics and performance metrics</p>
          </div>
          <Button onClick={exportAnalytics} className="gap-2">
            <Download className="w-4 h-4" />
            Export Analytics
          </Button>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-8">
          {['1h', '24h', '7d', '30d'].map((range, idx) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              onClick={() => setTimeRange(range)}
              className="text-sm"
            >
              {range}
            </Button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="text-slate-400 text-sm mb-2">Total Decisions</div>
            <div className="text-3xl font-bold text-white">12,847</div>
            <div className="text-green-400 text-sm mt-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> +12% vs last period
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="text-slate-400 text-sm mb-2">Policy Effectiveness</div>
            <div className="text-3xl font-bold text-white">93.1%</div>
            <div className="text-green-400 text-sm mt-2">Average across all policies</div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="text-slate-400 text-sm mb-2">Service Uptime</div>
            <div className="text-3xl font-bold text-white">99.7%</div>
            <div className="text-green-400 text-sm mt-2">All services healthy</div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="text-slate-400 text-sm mb-2">Human Overrides</div>
            <div className="text-3xl font-bold text-white">247</div>
            <div className="text-amber-400 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> 1.9% of decisions
            </div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Decision Trends */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Decision Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={decisionTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Legend />
                <Line type="monotone" dataKey="decisions" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="overrides" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Override Patterns */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Override Patterns</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={overridePatterns}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {overridePatterns.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Policy Effectiveness */}
          <Card className="bg-slate-800 border-slate-700 p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4">Policy Effectiveness</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={policyEffectiveness}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Bar dataKey="effectiveness" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Service Performance Table */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Service Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-4 text-slate-400">Service</th>
                  <th className="text-left py-2 px-4 text-slate-400">Uptime</th>
                  <th className="text-left py-2 px-4 text-slate-400">Latency (ms)</th>
                  <th className="text-left py-2 px-4 text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {servicePerformance.map((service, idx) => (
                  <tr key={`item-${idx}`} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-3 px-4 text-white">{service.name}</td>
                    <td className="py-3 px-4 text-green-400">{service.uptime}%</td>
                    <td className="py-3 px-4 text-slate-300">{service.latency}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      <span className="text-green-400">Healthy</span>
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
