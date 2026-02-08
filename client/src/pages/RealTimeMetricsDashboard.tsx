import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, Users, Radio, Zap, AlertCircle } from 'lucide-react';

interface MetricData {
  timestamp: string;
  activeStreams: number;
  viewerCount: number;
  bandwidth: number;
  cpuUsage: number;
  memoryUsage: number;
}

interface RuleExecution {
  ruleId: string;
  ruleName: string;
  lastExecuted: string;
  status: 'success' | 'failed' | 'pending';
  executionCount: number;
  avgDuration: number;
}

export default function RealTimeMetricsDashboard() {
  const [metrics, setMetrics] = useState<MetricData[]>([
    { timestamp: '00:00', activeStreams: 5, viewerCount: 1200, bandwidth: 45, cpuUsage: 35, memoryUsage: 42 },
    { timestamp: '04:00', activeStreams: 8, viewerCount: 1850, bandwidth: 62, cpuUsage: 48, memoryUsage: 55 },
    { timestamp: '08:00', activeStreams: 12, viewerCount: 3200, bandwidth: 95, cpuUsage: 68, memoryUsage: 72 },
    { timestamp: '12:00', activeStreams: 15, viewerCount: 4500, bandwidth: 128, cpuUsage: 82, memoryUsage: 85 },
    { timestamp: '16:00', activeStreams: 18, viewerCount: 5200, bandwidth: 145, cpuUsage: 88, memoryUsage: 89 },
    { timestamp: '20:00', activeStreams: 22, viewerCount: 6800, bandwidth: 165, cpuUsage: 92, memoryUsage: 91 },
  ]);

  const [ruleExecutions, setRuleExecutions] = useState<RuleExecution[]>([
    { ruleId: '1', ruleName: 'Auto Schedule Next Broadcast', lastExecuted: '2 min ago', status: 'success', executionCount: 145, avgDuration: 2.3 },
    { ruleId: '2', ruleName: 'Generate Content', lastExecuted: '5 min ago', status: 'success', executionCount: 142, avgDuration: 3.8 },
    { ruleId: '3', ruleName: 'Insert Commercials', lastExecuted: '8 min ago', status: 'success', executionCount: 138, avgDuration: 1.2 },
    { ruleId: '4', ruleName: 'Update Analytics', lastExecuted: '1 min ago', status: 'success', executionCount: 156, avgDuration: 0.9 },
  ]);

  const [systemHealth, setSystemHealth] = useState({
    uptime: '45d 12h 34m',
    errorRate: 0.2,
    avgResponseTime: 245,
    successRate: 99.8,
  });

  const [topBroadcasts, setTopBroadcasts] = useState([
    { name: 'Morning Show', viewers: 2400, engagement: 85 },
    { name: 'News Update', viewers: 1800, engagement: 72 },
    { name: 'Music Hour', viewers: 1600, engagement: 68 },
    { name: 'Talk Radio', viewers: 1200, engagement: 65 },
    { name: 'Evening News', viewers: 1000, engagement: 58 },
  ]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const statusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Activity className="w-8 h-8 text-cyan-400" />
              Real-Time Metrics Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Live monitoring of broadcast system performance and automation rules</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">System Status</div>
            <Badge className="bg-green-500 text-white mt-1">All Systems Operational</Badge>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                Active Streams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">22</div>
              <p className="text-xs text-green-400 mt-1">↑ 5 from 4h ago</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Total Viewers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">6,800</div>
              <p className="text-xs text-green-400 mt-1">↑ 2,600 from 4h ago</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Bandwidth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">165 Mbps</div>
              <p className="text-xs text-green-400 mt-1">↑ 120 Mbps from 4h ago</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">99.8%</div>
              <p className="text-xs text-green-400 mt-1">↑ 0.1% from yesterday</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="metrics" className="text-gray-400">Live Metrics</TabsTrigger>
            <TabsTrigger value="rules" className="text-gray-400">Automation Rules</TabsTrigger>
            <TabsTrigger value="broadcasts" className="text-gray-400">Top Broadcasts</TabsTrigger>
            <TabsTrigger value="health" className="text-gray-400">System Health</TabsTrigger>
          </TabsList>

          {/* Live Metrics Tab */}
          <TabsContent value="metrics" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Viewer Count & Active Streams</CardTitle>
                <CardDescription className="text-gray-400">Last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="timestamp" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="viewerCount" stroke="#3b82f6" strokeWidth={2} name="Viewers" />
                    <Line type="monotone" dataKey="activeStreams" stroke="#10b981" strokeWidth={2} name="Active Streams" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">System Resources</CardTitle>
                <CardDescription className="text-gray-400">CPU and Memory usage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="timestamp" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="cpuUsage" fill="#f59e0b" name="CPU %" />
                    <Bar dataKey="memoryUsage" fill="#ef4444" name="Memory %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Rules Tab */}
          <TabsContent value="rules" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Active Automation Rules</CardTitle>
                <CardDescription className="text-gray-400">Real-time execution status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ruleExecutions.map((rule) => (
                    <div key={rule.ruleId} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-white">{rule.ruleName}</div>
                        <div className="text-sm text-gray-400 mt-1">
                          Executed {rule.executionCount} times • Avg duration: {rule.avgDuration}ms
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-400">{rule.lastExecuted}</div>
                        <Badge className={statusColor(rule.status)}>
                          {rule.status.charAt(0).toUpperCase() + rule.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Broadcasts Tab */}
          <TabsContent value="broadcasts" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Top Broadcasts by Viewers</CardTitle>
                <CardDescription className="text-gray-400">Current session</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={topBroadcasts}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, viewers }) => `${name}: ${viewers}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="viewers"
                    >
                      {topBroadcasts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Broadcast Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topBroadcasts.map((broadcast, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <div className="font-medium text-white">{broadcast.name}</div>
                      </div>
                      <div className="text-sm text-gray-400">
                        {broadcast.viewers} viewers • {broadcast.engagement}% engagement
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="health" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">System Uptime</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400">{systemHealth.uptime}</div>
                  <p className="text-sm text-gray-400 mt-2">Continuous operation without interruption</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400">{systemHealth.successRate}%</div>
                  <p className="text-sm text-gray-400 mt-2">Error rate: {systemHealth.errorRate}%</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Avg Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-400">{systemHealth.avgResponseTime}ms</div>
                  <p className="text-sm text-gray-400 mt-2">Within optimal range</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-400">No active alerts</div>
                  <p className="text-xs text-gray-500 mt-2">All systems operating normally</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
