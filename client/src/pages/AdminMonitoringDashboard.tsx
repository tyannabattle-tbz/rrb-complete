import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Activity,
  TrendingUp,
  Users,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

export const AdminMonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    voiceCommands: 0,
    batchJobs: 0,
    storyboards: 0,
    activeUsers: 0,
    systemLoad: 0,
    successRate: 0,
  });

  const [chartData, setChartData] = useState([
    { time: '00:00', commands: 12, jobs: 8, storyboards: 5 },
    { time: '04:00', commands: 19, jobs: 12, storyboards: 8 },
    { time: '08:00', commands: 35, jobs: 24, storyboards: 15 },
    { time: '12:00', commands: 42, jobs: 31, storyboards: 22 },
    { time: '16:00', commands: 38, jobs: 28, storyboards: 18 },
    { time: '20:00', commands: 28, jobs: 18, storyboards: 12 },
  ]);

  const [jobStatus, setJobStatus] = useState([
    { name: 'Completed', value: 245, color: '#10b981' },
    { name: 'Processing', value: 42, color: '#3b82f6' },
    { name: 'Queued', value: 18, color: '#f59e0b' },
    { name: 'Failed', value: 5, color: '#ef4444' },
  ]);

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'voice',
      description: 'Voice command executed',
      status: 'success',
      time: '2 minutes ago',
    },
    {
      id: 2,
      type: 'batch',
      description: 'Batch job completed',
      status: 'success',
      time: '5 minutes ago',
    },
    {
      id: 3,
      type: 'storyboard',
      description: 'Storyboard generated',
      status: 'success',
      time: '8 minutes ago',
    },
    {
      id: 4,
      type: 'batch',
      description: 'Batch job failed',
      status: 'error',
      time: '12 minutes ago',
    },
    {
      id: 5,
      type: 'voice',
      description: 'Voice command recognized',
      status: 'success',
      time: '15 minutes ago',
    },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        voiceCommands: prev.voiceCommands + Math.floor(Math.random() * 5),
        batchJobs: prev.batchJobs + Math.floor(Math.random() * 3),
        storyboards: prev.storyboards + Math.floor(Math.random() * 2),
        activeUsers: Math.floor(Math.random() * 50) + 10,
        systemLoad: Math.floor(Math.random() * 100),
        successRate: 95 + Math.floor(Math.random() * 5),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Admin Monitoring</h1>
          <p className="text-slate-400">
            Real-time analytics and system monitoring dashboard
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">Voice Commands</p>
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-white">
                {metrics.voiceCommands}
              </p>
              <p className="text-xs text-green-400">↑ +12% today</p>
            </div>
          </Card>

          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">Batch Jobs</p>
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-white">{metrics.batchJobs}</p>
              <p className="text-xs text-green-400">↑ +8% today</p>
            </div>
          </Card>

          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">Storyboards</p>
                <TrendingUp className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-white">
                {metrics.storyboards}
              </p>
              <p className="text-xs text-green-400">↑ +5% today</p>
            </div>
          </Card>

          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">Active Users</p>
                <Users className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-white">
                {metrics.activeUsers}
              </p>
              <p className="text-xs text-slate-400">Real-time</p>
            </div>
          </Card>

          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">System Load</p>
                <Activity className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-white">
                {metrics.systemLoad}%
              </p>
              <p className="text-xs text-slate-400">CPU + Memory</p>
            </div>
          </Card>

          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">Success Rate</p>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-white">
                {metrics.successRate}%
              </p>
              <p className="text-xs text-green-400">↑ Excellent</p>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700">
            <TabsTrigger value="activity">Activity Trends</TabsTrigger>
            <TabsTrigger value="status">Job Status</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          </TabsList>

          {/* Activity Trends */}
          <TabsContent value="activity">
            <Card className="p-6 bg-slate-800 border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">
                24-Hour Activity Trends
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="commands"
                    stroke="#3b82f6"
                    name="Voice Commands"
                  />
                  <Line
                    type="monotone"
                    dataKey="jobs"
                    stroke="#f59e0b"
                    name="Batch Jobs"
                  />
                  <Line
                    type="monotone"
                    dataKey="storyboards"
                    stroke="#8b5cf6"
                    name="Storyboards"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* Job Status */}
          <TabsContent value="status">
            <Card className="p-6 bg-slate-800 border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">Job Status</h3>
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={jobStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {jobStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {jobStatus.map((status) => (
                    <div key={status.name} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {status.name}
                        </p>
                        <p className="text-xs text-slate-400">{status.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Recent Activity */}
          <TabsContent value="recent">
            <Card className="p-6 bg-slate-800 border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-slate-700 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-center gap-3">
                      {activity.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {activity.description}
                        </p>
                        <p className="text-xs text-slate-400">{activity.time}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        activity.status === 'success'
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-red-900/30 text-red-400'
                      }`}
                    >
                      {activity.status === 'success' ? 'Success' : 'Error'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* System Health */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">System Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">API Response Time</p>
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <div className="bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: '35%' }}
                />
              </div>
              <p className="text-xs text-slate-400">45ms average</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Database Health</p>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div className="bg-slate-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: '98%' }}
                />
              </div>
              <p className="text-xs text-slate-400">98% uptime</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Storage Usage</p>
                <Activity className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="bg-slate-700 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: '62%' }}
                />
              </div>
              <p className="text-xs text-slate-400">62% used</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminMonitoringDashboard;
