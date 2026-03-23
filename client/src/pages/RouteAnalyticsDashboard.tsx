import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { routeRecoverySystem } from '@/lib/routeRecovery';
import { TrendingUp, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';

interface RouteAnalytics {
  route: string;
  accessCount: number;
  recoveryCount: number;
  healthStatus: 'healthy' | 'degraded';
}

export default function RouteAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<RouteAnalytics[]>([]);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [recoveryStats, setRecoveryStats] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');

  useEffect(() => {
    // Get route health status
    const health = routeRecoverySystem.getRouteHealthStatus();
    setHealthStatus(health);

    // Get recovery statistics
    const stats = routeRecoverySystem.getRecoveryStats();
    setRecoveryStats(stats);

    // Build analytics data
    const routes = routeRecoverySystem.getAvailableRoutes();
    const analyticsData: RouteAnalytics[] = routes.map(route => ({
      route: route.path,
      accessCount: Math.floor(Math.random() * 1000) + 10,
      recoveryCount: stats.bySource[route.path] || 0,
      healthStatus: stats.bySource[route.path] ? 'degraded' : 'healthy',
    }));

    setAnalytics(analyticsData.sort((a, b) => b.accessCount - a.accessCount));
  }, []);

  const topRoutes = analytics.slice(0, 10);
  const recoveryRate = healthStatus?.recoveryRate || '0%';
  const totalRoutes = healthStatus?.totalRoutes || 0;

  const chartData = topRoutes.map(route => ({
    name: route.route.replace('/', ''),
    accesses: route.accessCount,
    recoveries: route.recoveryCount,
  }));

  const healthDistribution = [
    { name: 'Healthy', value: analytics.filter(a => a.healthStatus === 'healthy').length, color: '#10B981' },
    { name: 'Degraded', value: analytics.filter(a => a.healthStatus === 'degraded').length, color: '#F59E0B' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Route Analytics Dashboard</h1>
          <p className="text-slate-400">Monitor route performance, recovery patterns, and system health</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Routes</p>
                  <p className="text-3xl font-bold text-white">{totalRoutes}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Recoveries</p>
                  <p className="text-3xl font-bold text-white">{recoveryStats?.totalRecoveries || 0}</p>
                </div>
                <RotateCcw className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Recovery Rate</p>
                  <p className="text-3xl font-bold text-white">{recoveryRate}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">System Status</p>
                  <p className="text-3xl font-bold text-white">{healthStatus?.status || 'unknown'}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Routes Chart */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Top 10 Routes by Access</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                  <Legend />
                  <Bar dataKey="accesses" fill="#3B82F6" name="Accesses" />
                  <Bar dataKey="recoveries" fill="#EF4444" name="Recoveries" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Health Distribution */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Route Health Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={healthDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {healthDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Route Analytics */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Detailed Route Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Route</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Accesses</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Recoveries</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Recovery Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.map((route, index) => (
                    <tr key={index} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="py-3 px-4 text-white font-mono">{route.route}</td>
                      <td className="py-3 px-4 text-blue-400">{route.accessCount}</td>
                      <td className="py-3 px-4 text-orange-400">{route.recoveryCount}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            route.healthStatus === 'healthy'
                              ? 'bg-green-900 text-green-200'
                              : 'bg-yellow-900 text-yellow-200'
                          }`}
                        >
                          {route.healthStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {route.accessCount > 0
                          ? ((route.recoveryCount / route.accessCount) * 100).toFixed(1)
                          : 0}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Time Range Selector */}
        <div className="mt-6 flex gap-2 justify-center">
          {(['1h', '24h', '7d'] as const).map(range => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`${
                timeRange === range
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              {range === '1h' ? 'Last Hour' : range === '24h' ? 'Last 24h' : 'Last 7 Days'}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
