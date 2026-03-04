import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity,
  Zap,
  Radio,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface SystemMetrics {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeConnections: number;
  errorRate: number;
  lastHealthCheck: string;
  responseTime: number;
}

export default function SystemHealthPage() {
  const [systems, setSystems] = useState<SystemMetrics[]>([
    {
      name: 'QUMUS Core',
      status: 'online',
      uptime: '45d 12h 34m',
      cpuUsage: 34,
      memoryUsage: 62,
      diskUsage: 48,
      networkLatency: 2.3,
      activeConnections: 156,
      errorRate: 0.02,
      lastHealthCheck: '2026-03-04 13:50:00',
      responseTime: 145,
    },
    {
      name: 'RRB Radio',
      status: 'online',
      uptime: '42d 8h 15m',
      cpuUsage: 45,
      memoryUsage: 78,
      diskUsage: 62,
      networkLatency: 3.1,
      activeConnections: 342,
      errorRate: 0.01,
      lastHealthCheck: '2026-03-04 13:50:15',
      responseTime: 234,
    },
    {
      name: 'HybridCast',
      status: 'online',
      uptime: '38d 20h 45m',
      cpuUsage: 28,
      memoryUsage: 51,
      diskUsage: 35,
      networkLatency: 1.8,
      activeConnections: 89,
      errorRate: 0.00,
      lastHealthCheck: '2026-03-04 13:50:30',
      responseTime: 98,
    },
    {
      name: 'Analytics Engine',
      status: 'degraded',
      uptime: '35d 14h 22m',
      cpuUsage: 78,
      memoryUsage: 92,
      diskUsage: 85,
      networkLatency: 12.4,
      activeConnections: 234,
      errorRate: 2.34,
      lastHealthCheck: '2026-03-04 13:50:45',
      responseTime: 1245,
    },
  ]);

  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSystems(prev => prev.map(sys => ({
        ...sys,
        cpuUsage: Math.max(0, Math.min(100, sys.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(0, Math.min(100, sys.memoryUsage + (Math.random() - 0.5) * 5)),
        networkLatency: Math.max(0, sys.networkLatency + (Math.random() - 0.5) * 2),
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500/20 text-green-400';
      case 'degraded':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'offline':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getMetricColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-400';
    if (value >= thresholds.warning) return 'text-yellow-400';
    return 'text-green-400';
  };

  const MetricBar = ({ label, value, unit, threshold }: any) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className={`font-semibold ${getMetricColor(value, threshold)}`}>
          {value.toFixed(1)}{unit}
        </span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            value >= threshold.critical
              ? 'bg-red-500'
              : value >= threshold.warning
              ? 'bg-yellow-500'
              : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-8 h-8 text-purple-400" />
          <h1 className="text-4xl font-bold text-white">System Health Monitor</h1>
        </div>
        <p className="text-purple-300">Real-time monitoring of all ecosystem systems</p>
      </div>

      {/* Overall Status */}
      <Card className="bg-slate-800/50 border-purple-500/20 mb-8">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <p className="text-sm text-slate-400">Systems Online</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <p className="text-sm text-slate-400">Degraded</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                <span className="text-2xl font-bold text-white">99.8%</span>
              </div>
              <p className="text-sm text-slate-400">Avg Uptime</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Wifi className="w-6 h-6 text-purple-400" />
                <span className="text-2xl font-bold text-white">2.4ms</span>
              </div>
              <p className="text-sm text-slate-400">Avg Latency</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Systems Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {systems.map((system) => (
          <Card
            key={system.name}
            className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer"
            onClick={() => setSelectedSystem(selectedSystem === system.name ? null : system.name)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{system.name}</CardTitle>
                  <CardDescription>Uptime: {system.uptime}</CardDescription>
                </div>
                <Badge className={getStatusColor(system.status)}>
                  {system.status === 'online' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {system.status === 'degraded' && <AlertCircle className="w-3 h-3 mr-1" />}
                  {system.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <MetricBar
                label="CPU Usage"
                value={system.cpuUsage}
                unit="%"
                threshold={{ warning: 70, critical: 90 }}
              />
              <MetricBar
                label="Memory Usage"
                value={system.memoryUsage}
                unit="%"
                threshold={{ warning: 75, critical: 90 }}
              />
              <MetricBar
                label="Disk Usage"
                value={system.diskUsage}
                unit="%"
                threshold={{ warning: 80, critical: 95 }}
              />

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                <div>
                  <p className="text-xs text-slate-400">Network Latency</p>
                  <p className={`text-lg font-semibold ${getMetricColor(system.networkLatency, { warning: 5, critical: 10 })}`}>
                    {system.networkLatency.toFixed(1)}ms
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Response Time</p>
                  <p className={`text-lg font-semibold ${getMetricColor(system.responseTime, { warning: 500, critical: 1000 })}`}>
                    {system.responseTime}ms
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Active Connections</p>
                  <p className="text-lg font-semibold text-blue-400">{system.activeConnections}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Error Rate</p>
                  <p className={`text-lg font-semibold ${getMetricColor(system.errorRate, { warning: 1, critical: 5 })}`}>
                    {system.errorRate.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-500 pt-2 border-t border-slate-700">
                Last health check: {system.lastHealthCheck}
              </div>

              {selectedSystem === system.name && (
                <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                  <h4 className="font-semibold text-white mb-2">Detailed Metrics</h4>
                  <div className="space-y-2 text-sm text-slate-400">
                    <div className="flex justify-between">
                      <span>CPU Cores Used:</span>
                      <span className="text-white">{(system.cpuUsage * 16 / 100).toFixed(1)} / 16</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Memory Allocated:</span>
                      <span className="text-white">{(system.memoryUsage * 64 / 100).toFixed(1)} / 64 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Disk Space Used:</span>
                      <span className="text-white">{(system.diskUsage * 500 / 100).toFixed(0)} / 500 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Network Bandwidth:</span>
                      <span className="text-white">{(system.networkLatency * 10).toFixed(1)} Mbps</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
