import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Calendar, TrendingUp } from 'lucide-react';

interface MetricPoint {
  timestamp: number;
  successRate: number;
  executionTime: number;
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
}

interface MetricsAggregate {
  taskId: string;
  totalExecutions: number;
  averageSuccessRate: number;
  averageExecutionTime: number;
  averageCpuUsage: number;
  averageMemoryUsage: number;
  averageStorageUsage: number;
  peakCpuUsage: number;
  peakMemoryUsage: number;
  peakStorageUsage: number;
}

export function HistoricalMetricsViewer() {
  const [metrics, setMetrics] = useState<MetricPoint[]>([]);
  const [aggregate, setAggregate] = useState<MetricsAggregate | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, [dateRange]);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      // Generate mock historical data
      const data: MetricPoint[] = [];
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        data.push({
          timestamp: date.getTime(),
          successRate: Math.floor(Math.random() * 30) + 70,
          executionTime: Math.random() * 5 + 1,
          cpuUsage: Math.floor(Math.random() * 40) + 30,
          memoryUsage: Math.floor(Math.random() * 50) + 40,
          storageUsage: Math.floor(Math.random() * 30) + 20,
        });
      }

      setMetrics(data);

      // Calculate aggregate
      if (data.length > 0) {
        const avgSuccessRate = data.reduce((sum, m) => sum + m.successRate, 0) / data.length;
        const avgExecutionTime = data.reduce((sum, m) => sum + m.executionTime, 0) / data.length;
        const avgCpuUsage = data.reduce((sum, m) => sum + m.cpuUsage, 0) / data.length;
        const avgMemoryUsage = data.reduce((sum, m) => sum + m.memoryUsage, 0) / data.length;
        const avgStorageUsage = data.reduce((sum, m) => sum + m.storageUsage, 0) / data.length;

        setAggregate({
          taskId: 'all-tasks',
          totalExecutions: data.length,
          averageSuccessRate: avgSuccessRate,
          averageExecutionTime: avgExecutionTime,
          averageCpuUsage: avgCpuUsage,
          averageMemoryUsage: avgMemoryUsage,
          averageStorageUsage: avgStorageUsage,
          peakCpuUsage: Math.max(...data.map((m) => m.cpuUsage)),
          peakMemoryUsage: Math.max(...data.map((m) => m.memoryUsage)),
          peakStorageUsage: Math.max(...data.map((m) => m.storageUsage)),
        });
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (metrics.length === 0) return;

    const headers = [
      'Date',
      'Success Rate (%)',
      'Execution Time (s)',
      'CPU Usage (%)',
      'Memory Usage (%)',
      'Storage Usage (%)',
    ];

    const rows = metrics.map((m) => [
      new Date(m.timestamp).toISOString(),
      m.successRate.toFixed(2),
      m.executionTime.toFixed(2),
      m.cpuUsage.toFixed(2),
      m.memoryUsage.toFixed(2),
      m.storageUsage.toFixed(2),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metrics-${dateRange}-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const chartData = metrics.map((m) => ({
    date: new Date(m.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    ...m,
  }));

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar size={24} className="text-cyan-400" />
            Historical Metrics
          </h2>
          <p className="text-slate-400 text-sm mt-1">Track performance trends over time</p>
        </div>

        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              onClick={() => setDateRange(range)}
              variant={dateRange === range ? 'default' : 'outline'}
              className={dateRange === range ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}

          <Button onClick={handleExportCSV} className="bg-purple-600 hover:bg-purple-700">
            <Download size={16} className="mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {aggregate && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div>
                <p className="text-slate-400 text-sm mb-2">Avg Success Rate</p>
                <p className="text-3xl font-bold text-green-400">{aggregate.averageSuccessRate.toFixed(1)}%</p>
                <p className="text-xs text-slate-500 mt-2">Peak: {aggregate.peakCpuUsage.toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div>
                <p className="text-slate-400 text-sm mb-2">Avg Execution Time</p>
                <p className="text-3xl font-bold text-blue-400">{aggregate.averageExecutionTime.toFixed(2)}s</p>
                <p className="text-xs text-slate-500 mt-2">Total Runs: {aggregate.totalExecutions}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div>
                <p className="text-slate-400 text-sm mb-2">Avg Resource Usage</p>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="text-slate-400">CPU:</span>{' '}
                    <span className="text-yellow-400 font-semibold">{aggregate.averageCpuUsage.toFixed(1)}%</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-slate-400">Memory:</span>{' '}
                    <span className="text-purple-400 font-semibold">{aggregate.averageMemoryUsage.toFixed(1)}%</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success Rate Trend */}
      {chartData.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Success Rate Trend</CardTitle>
            <CardDescription>Percentage of successful task executions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="successRate"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorSuccess)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Resource Usage Trend */}
      {chartData.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Resource Usage Trend</CardTitle>
            <CardDescription>CPU, Memory, and Storage utilization over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cpuUsage"
                  stroke="#fbbf24"
                  name="CPU Usage (%)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="memoryUsage"
                  stroke="#a78bfa"
                  name="Memory Usage (%)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="storageUsage"
                  stroke="#60a5fa"
                  name="Storage Usage (%)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Execution Time Trend */}
      {chartData.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Execution Time Trend</CardTitle>
            <CardDescription>Average task execution time in seconds</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="executionTime"
                  stroke="#3b82f6"
                  name="Execution Time (s)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      )}
    </div>
  );
}
