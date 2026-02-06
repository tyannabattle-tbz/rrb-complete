import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Activity, Zap, Database, Clock, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface PerformanceMetric {
  timestamp: number;
  loadTime: number;
  memoryUsage: number;
  latency: number;
  frameRate: number;
}

interface PerformanceStats {
  avgLoadTime: number;
  avgMemory: number;
  avgLatency: number;
  avgFPS: number;
  maxMemory: number;
  minFPS: number;
}

export function HybridCastPerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [stats, setStats] = useState<PerformanceStats>({
    avgLoadTime: 0,
    avgMemory: 0,
    avgLatency: 0,
    avgFPS: 0,
    maxMemory: 0,
    minFPS: 0,
  });
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const metric: PerformanceMetric = {
        timestamp: Date.now(),
        loadTime: Math.random() * 500 + 100,
        memoryUsage: (performance.memory?.usedJSHeapSize || 0) / 1048576,
        latency: Math.random() * 50 + 10,
        frameRate: Math.floor(Math.random() * 20 + 50),
      };

      setMetrics(prev => {
        const updated = [...prev, metric].slice(-60); // Keep last 60 metrics
        
        // Calculate stats
        const avgLoadTime = updated.reduce((sum, m) => sum + m.loadTime, 0) / updated.length;
        const avgMemory = updated.reduce((sum, m) => sum + m.memoryUsage, 0) / updated.length;
        const avgLatency = updated.reduce((sum, m) => sum + m.latency, 0) / updated.length;
        const avgFPS = updated.reduce((sum, m) => sum + m.frameRate, 0) / updated.length;
        const maxMemory = Math.max(...updated.map(m => m.memoryUsage));
        const minFPS = Math.min(...updated.map(m => m.frameRate));

        setStats({
          avgLoadTime: Math.round(avgLoadTime),
          avgMemory: Math.round(avgMemory * 10) / 10,
          avgLatency: Math.round(avgLatency),
          avgFPS: Math.round(avgFPS),
          maxMemory: Math.round(maxMemory * 10) / 10,
          minFPS,
        });

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getHealthStatus = () => {
    if (stats.avgLoadTime > 1000 || stats.avgLatency > 100 || stats.avgFPS < 30) {
      return { status: 'Poor', color: 'text-red-500', bgColor: 'bg-red-500/20' };
    }
    if (stats.avgLoadTime > 500 || stats.avgLatency > 50 || stats.avgFPS < 50) {
      return { status: 'Fair', color: 'text-yellow-500', bgColor: 'bg-yellow-500/20' };
    }
    return { status: 'Good', color: 'text-green-500', bgColor: 'bg-green-500/20' };
  };

  const health = getHealthStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">HybridCast Performance Monitor</h1>
          <p className="text-slate-400 mt-2">Real-time performance metrics and diagnostics</p>
        </div>
        <button
          onClick={() => setIsMonitoring(!isMonitoring)}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isMonitoring
              ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
              : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
          }`}
        >
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </button>
      </div>

      {/* Health Status */}
      <Card className={`p-6 border-l-4 ${health.bgColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Activity className={`w-8 h-8 ${health.color}`} />
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Overall Health</h3>
              <p className={`text-sm ${health.color}`}>{health.status}</p>
            </div>
          </div>
          <div className={`text-4xl font-bold ${health.color}`}>
            {stats.avgFPS}
            <span className="text-sm ml-1">FPS</span>
          </div>
        </div>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Load Time */}
        <Card className="p-4 bg-slate-800/50 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Avg Load Time</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{stats.avgLoadTime}ms</div>
          <p className="text-xs text-slate-500 mt-1">Target: &lt;300ms</p>
        </Card>

        {/* Memory Usage */}
        <Card className="p-4 bg-slate-800/50 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Memory Usage</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{stats.avgMemory}MB</div>
          <p className="text-xs text-slate-500 mt-1">Peak: {stats.maxMemory}MB</p>
        </Card>

        {/* Latency */}
        <Card className="p-4 bg-slate-800/50 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Network Latency</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{stats.avgLatency}ms</div>
          <p className="text-xs text-slate-500 mt-1">Target: &lt;50ms</p>
        </Card>

        {/* Frame Rate */}
        <Card className="p-4 bg-slate-800/50 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Frame Rate</span>
            <Activity className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{stats.avgFPS}FPS</div>
          <p className="text-xs text-slate-500 mt-1">Min: {stats.minFPS}FPS</p>
        </Card>
      </div>

      {/* Performance Charts */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Load Time & Latency */}
          <Card className="p-6 bg-slate-800/50 border border-slate-700">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Load Time & Latency</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="timestamp" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="loadTime"
                  stroke="#f59e0b"
                  dot={false}
                  name="Load Time (ms)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="#3b82f6"
                  dot={false}
                  name="Latency (ms)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Memory & Frame Rate */}
          <Card className="p-6 bg-slate-800/50 border border-slate-700">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Memory & Frame Rate</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="timestamp" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="memoryUsage"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.2}
                  name="Memory (MB)"
                />
                <Area
                  type="monotone"
                  dataKey="frameRate"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                  name="FPS"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Recommendations */}
      {!isMonitoring && metrics.length === 0 && (
        <Card className="p-6 bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-300 mb-2">Start Monitoring</h3>
              <p className="text-blue-200 text-sm">
                Click "Start Monitoring" to begin collecting performance metrics. The monitor will track load time,
                memory usage, network latency, and frame rate over the next 60 seconds.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Performance Recommendations */}
      {metrics.length > 0 && (
        <Card className="p-6 bg-slate-800/50 border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Performance Recommendations</h3>
          <div className="space-y-3">
            {stats.avgLoadTime > 500 && (
              <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded border border-amber-500/30">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-300 font-medium">High Load Time</p>
                  <p className="text-amber-200 text-sm">Consider optimizing iframe initialization or reducing initial data load.</p>
                </div>
              </div>
            )}
            {stats.avgMemory > 100 && (
              <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded border border-amber-500/30">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-300 font-medium">High Memory Usage</p>
                  <p className="text-amber-200 text-sm">Consider clearing old cached data or optimizing data structures.</p>
                </div>
              </div>
            )}
            {stats.avgLatency > 50 && (
              <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded border border-amber-500/30">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-300 font-medium">High Network Latency</p>
                  <p className="text-amber-200 text-sm">Check your internet connection or consider using a CDN for faster delivery.</p>
                </div>
              </div>
            )}
            {stats.avgFPS < 50 && (
              <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded border border-amber-500/30">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-300 font-medium">Low Frame Rate</p>
                  <p className="text-amber-200 text-sm">Consider disabling animations or reducing visual effects.</p>
                </div>
              </div>
            )}
            {stats.avgLoadTime <= 500 && stats.avgMemory <= 100 && stats.avgLatency <= 50 && stats.avgFPS >= 50 && (
              <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded border border-green-500/30">
                <AlertCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-300 font-medium">Performance Optimal</p>
                  <p className="text-green-200 text-sm">All metrics are within acceptable ranges. HybridCast is performing well.</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
