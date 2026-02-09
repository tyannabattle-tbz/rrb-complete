import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, TrendingUp, Users, Zap, CheckCircle, AlertTriangle } from 'lucide-react';

interface PolicyMetrics {
  id: string;
  name: string;
  autonomyLevel: number;
  totalDecisions: number;
  autonomousDecisions: number;
  escalatedDecisions: number;
  successRate: number;
  errorRate: number;
  lastExecuted: string;
}

interface SystemMetrics {
  totalActions: number;
  autonomousActions: number;
  humanReviewActions: number;
  failedActions: number;
  autonomyRate: number;
  averageResponseTime: number;
  systemHealth: 'healthy' | 'degraded' | 'critical';
}

export default function QumusMonitoringDashboard() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalActions: 2847,
    autonomousActions: 2543,
    humanReviewActions: 287,
    failedActions: 17,
    autonomyRate: 89.3,
    averageResponseTime: 145,
    systemHealth: 'healthy',
  });

  const [policyMetrics, setPolicyMetrics] = useState<PolicyMetrics[]>([
    {
      id: 'policy_user_registration',
      name: 'User Registration',
      autonomyLevel: 95,
      totalDecisions: 342,
      autonomousDecisions: 325,
      escalatedDecisions: 17,
      successRate: 98.5,
      errorRate: 1.5,
      lastExecuted: '2 minutes ago',
    },
    {
      id: 'policy_payment_processing',
      name: 'Payment Processing',
      autonomyLevel: 85,
      totalDecisions: 521,
      autonomousDecisions: 442,
      escalatedDecisions: 79,
      successRate: 96.2,
      errorRate: 3.8,
      lastExecuted: '5 minutes ago',
    },
    {
      id: 'policy_content_moderation',
      name: 'Content Moderation',
      autonomyLevel: 75,
      totalDecisions: 1203,
      autonomousDecisions: 902,
      escalatedDecisions: 301,
      successRate: 94.1,
      errorRate: 5.9,
      lastExecuted: '1 minute ago',
    },
    {
      id: 'policy_performance_alert',
      name: 'Performance Alert',
      autonomyLevel: 90,
      totalDecisions: 156,
      autonomousDecisions: 140,
      escalatedDecisions: 16,
      successRate: 97.4,
      errorRate: 2.6,
      lastExecuted: '3 minutes ago',
    },
    {
      id: 'policy_subscription_management',
      name: 'Subscription Management',
      autonomyLevel: 88,
      totalDecisions: 234,
      autonomousDecisions: 206,
      escalatedDecisions: 28,
      successRate: 95.7,
      errorRate: 4.3,
      lastExecuted: '7 minutes ago',
    },
    {
      id: 'policy_analytics_aggregation',
      name: 'Analytics Aggregation',
      autonomyLevel: 98,
      totalDecisions: 89,
      autonomousDecisions: 87,
      escalatedDecisions: 2,
      successRate: 99.1,
      errorRate: 0.9,
      lastExecuted: '1 minute ago',
    },
    {
      id: 'policy_compliance_reporting',
      name: 'Compliance Reporting',
      autonomyLevel: 80,
      totalDecisions: 45,
      autonomousDecisions: 36,
      escalatedDecisions: 9,
      successRate: 93.3,
      errorRate: 6.7,
      lastExecuted: '12 minutes ago',
    },
    {
      id: 'policy_recommendation_engine',
      name: 'Recommendation Engine',
      autonomyLevel: 92,
      totalDecisions: 257,
      autonomousDecisions: 236,
      escalatedDecisions: 21,
      successRate: 96.9,
      errorRate: 3.1,
      lastExecuted: '2 minutes ago',
    },
  ]);

  const [timeSeriesData, setTimeSeriesData] = useState([
    { time: '00:00', autonomy: 85, decisions: 120 },
    { time: '04:00', autonomy: 87, decisions: 145 },
    { time: '08:00', autonomy: 89, decisions: 230 },
    { time: '12:00', autonomy: 91, decisions: 380 },
    { time: '16:00', autonomy: 90, decisions: 420 },
    { time: '20:00', autonomy: 88, decisions: 350 },
    { time: '24:00', autonomy: 89, decisions: 272 },
  ]);

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      severity: 'warning',
      title: 'Content Moderation Escalation Rate High',
      message: 'Escalation rate at 25% - consider policy adjustment',
      timestamp: '5 minutes ago',
    },
    {
      id: 2,
      severity: 'info',
      title: 'Analytics Aggregation Complete',
      message: 'Daily analytics aggregation completed successfully',
      timestamp: '1 minute ago',
    },
    {
      id: 3,
      severity: 'success',
      title: 'System Health Optimal',
      message: 'All policies operating within normal parameters',
      timestamp: 'Just now',
    },
  ]);

  const autonomyDistribution = [
    { name: 'Autonomous', value: systemMetrics.autonomousActions, fill: '#10b981' },
    { name: 'Human Review', value: systemMetrics.humanReviewActions, fill: '#f59e0b' },
    { name: 'Failed', value: systemMetrics.failedActions, fill: '#ef4444' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">QUMUS Orchestration Dashboard</h1>
          <p className="text-slate-400">Real-time autonomous decision-making monitoring</p>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Actions</p>
                <p className="text-3xl font-bold mt-2">{systemMetrics.totalActions.toLocaleString()}</p>
              </div>
              <Zap className="w-12 h-12 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Autonomy Rate</p>
                <p className="text-3xl font-bold mt-2">{systemMetrics.autonomyRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-12 h-12 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Avg Response Time</p>
                <p className="text-3xl font-bold mt-2">{systemMetrics.averageResponseTime}ms</p>
              </div>
              <CheckCircle className="w-12 h-12 opacity-50" />
            </div>
          </div>

          <div className={`bg-gradient-to-br ${systemMetrics.systemHealth === 'healthy' ? 'from-emerald-600 to-emerald-700' : 'from-yellow-600 to-yellow-700'} rounded-lg p-6 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">System Health</p>
                <p className="text-3xl font-bold mt-2 capitalize">{systemMetrics.systemHealth}</p>
              </div>
              <AlertCircle className="w-12 h-12 opacity-50" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Autonomy Over Time */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Autonomy Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Line type="monotone" dataKey="autonomy" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Decision Distribution */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Decision Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={autonomyDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {autonomyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Policy Metrics Table */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Policy Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Policy</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Autonomy</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Total</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Autonomous</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Escalated</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Success Rate</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Last Executed</th>
                </tr>
              </thead>
              <tbody>
                {policyMetrics.map((policy) => (
                  <tr key={policy.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-3 px-4 text-white font-medium">{policy.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${policy.autonomyLevel}%` }}
                          />
                        </div>
                        <span className="text-slate-300">{policy.autonomyLevel}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{policy.totalDecisions}</td>
                    <td className="py-3 px-4 text-green-400">{policy.autonomousDecisions}</td>
                    <td className="py-3 px-4 text-yellow-400">{policy.escalatedDecisions}</td>
                    <td className="py-3 px-4">
                      <span className="text-green-400">{policy.successRate.toFixed(1)}%</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{policy.lastExecuted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">Recent Alerts</h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.severity === 'warning'
                    ? 'bg-yellow-900/20 border-yellow-500'
                    : alert.severity === 'error'
                    ? 'bg-red-900/20 border-red-500'
                    : alert.severity === 'success'
                    ? 'bg-green-900/20 border-green-500'
                    : 'bg-blue-900/20 border-blue-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${
                    alert.severity === 'warning'
                      ? 'text-yellow-500'
                      : alert.severity === 'error'
                      ? 'text-red-500'
                      : alert.severity === 'success'
                      ? 'text-green-500'
                      : 'text-blue-500'
                  }`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{alert.title}</h3>
                    <p className="text-slate-400 text-sm mt-1">{alert.message}</p>
                    <p className="text-slate-500 text-xs mt-2">{alert.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
