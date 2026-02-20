import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Activity, Wifi, Zap, Shield, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface NetworkMetrics {
  latency: number;
  uptime: number;
  bandwidth: number;
  packetLoss: number;
  activeNodes: number;
  totalNodes: number;
  encryption: string;
  protocol: string;
  status: 'online' | 'degraded' | 'offline';
  lastSync: number;
}

export function NetworkStatusDashboard() {
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    latency: 45,
    uptime: 99.9,
    bandwidth: 125.5,
    packetLoss: 0.02,
    activeNodes: 62,
    totalNodes: 64,
    encryption: 'AES-256',
    protocol: 'HYBRID-BROADCAST-v1',
    status: 'online',
    lastSync: Date.now(),
  });

  const [history, setHistory] = useState<number[]>([45]);

  // Simulate real-time metric updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => {
        const newLatency = Math.max(30, Math.min(100, prev.latency + (Math.random() - 0.5) * 20));
        const newBandwidth = Math.max(50, Math.min(200, prev.bandwidth + (Math.random() - 0.5) * 30));
        const newUptime = Math.max(98, Math.min(100, prev.uptime + (Math.random() - 0.5) * 0.5));
        const newPacketLoss = Math.max(0, Math.min(1, prev.packetLoss + (Math.random() - 0.5) * 0.1));
        const newActiveNodes = Math.max(50, Math.min(64, prev.activeNodes + Math.floor((Math.random() - 0.5) * 4)));

        return {
          ...prev,
          latency: Math.round(newLatency),
          bandwidth: Math.round(newBandwidth * 10) / 10,
          uptime: Math.round(newUptime * 10) / 10,
          packetLoss: Math.round(newPacketLoss * 100) / 100,
          activeNodes: newActiveNodes,
          lastSync: Date.now(),
        };
      });

      setHistory((prev) => {
        const newHistory = [...prev, metrics.latency];
        return newHistory.slice(-60); // Keep last 60 data points
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [metrics.latency]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-400 bg-green-500/20';
      case 'degraded':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'offline':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 50) return 'text-green-400';
    if (latency < 100) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Network Status Dashboard</h2>
              <p className="text-sm text-slate-400">Real-time system metrics</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg font-semibold ${getStatusColor(metrics.status)}`}>
            {metrics.status.toUpperCase()}
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Latency */}
        <Card className="p-4 bg-slate-900 border border-slate-700">
          <div className="flex items-start justify-between mb-2">
            <div className="text-sm font-medium text-slate-400">Latency</div>
            <Zap className={`w-4 h-4 ${getLatencyColor(metrics.latency)}`} />
          </div>
          <div className={`text-3xl font-bold ${getLatencyColor(metrics.latency)}`}>{metrics.latency}ms</div>
          <div className="text-xs text-slate-500 mt-1">Target: &lt;50ms</div>
        </Card>

        {/* Bandwidth */}
        <Card className="p-4 bg-slate-900 border border-slate-700">
          <div className="flex items-start justify-between mb-2">
            <div className="text-sm font-medium text-slate-400">Bandwidth</div>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-blue-400">{metrics.bandwidth}Mbps</div>
          <div className="text-xs text-slate-500 mt-1">Available capacity</div>
        </Card>

        {/* Uptime */}
        <Card className="p-4 bg-slate-900 border border-slate-700">
          <div className="flex items-start justify-between mb-2">
            <div className="text-sm font-medium text-slate-400">Uptime</div>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400">{metrics.uptime}%</div>
          <div className="text-xs text-slate-500 mt-1">System reliability</div>
        </Card>

        {/* Packet Loss */}
        <Card className="p-4 bg-slate-900 border border-slate-700">
          <div className="flex items-start justify-between mb-2">
            <div className="text-sm font-medium text-slate-400">Packet Loss</div>
            <AlertCircle className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-yellow-400">{(metrics.packetLoss * 100).toFixed(2)}%</div>
          <div className="text-xs text-slate-500 mt-1">Data integrity</div>
        </Card>
      </div>

      {/* Network Health */}
      <Card className="p-4 bg-slate-900 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Network Health</h3>

        <div className="space-y-4">
          {/* Nodes */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-400">Active Nodes</span>
              <span className="text-sm font-medium text-cyan-400">
                {metrics.activeNodes}/{metrics.totalNodes}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${(metrics.activeNodes / metrics.totalNodes) * 100}%` }}
              />
            </div>
          </div>

          {/* Latency Trend */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-400">Latency Trend</span>
              <span className="text-sm font-medium text-slate-300">Last 60 seconds</span>
            </div>
            <div className="flex items-end gap-1 h-12 bg-slate-800 p-2 rounded-lg">
              {history.map((value, index) => (
                <div
                  key={`status-${index}`}
                  className="flex-1 bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t transition-all"
                  style={{
                    height: `${Math.max(5, (value / 150) * 100)}%`,
                    opacity: 0.5 + (index / history.length) * 0.5,
                  }}
                  title={`${value}ms`}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* System Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Security */}
        <Card className="p-4 bg-slate-900 border border-slate-700">
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            Security
          </h4>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Encryption</span>
              <span className="text-cyan-400 font-medium">{metrics.encryption}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Protocol</span>
              <span className="text-cyan-400 font-medium">{metrics.protocol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Certificate</span>
              <span className="text-green-400 font-medium">Valid</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Firewall</span>
              <span className="text-green-400 font-medium">Active</span>
            </div>
          </div>
        </Card>

        {/* Connection Info */}
        <Card className="p-4 bg-slate-900 border border-slate-700">
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Wifi className="w-4 h-4 text-blue-400" />
            Connection
          </h4>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Status</span>
              <span className="text-green-400 font-medium">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Edge Node</span>
              <span className="text-cyan-400 font-medium">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mesh Network</span>
              <span className="text-green-400 font-medium">Operational</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Last Sync</span>
              <span className="text-slate-300 font-medium">{formatTime(metrics.lastSync)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts */}
      <Card className="p-4 bg-slate-900 border border-slate-700">
        <h4 className="font-semibold text-white mb-3">System Alerts</h4>

        <div className="space-y-2">
          <div className="flex items-start gap-2 p-2 bg-green-500/10 rounded border border-green-500/30">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-300">All systems operational</div>
          </div>

          <div className="flex items-start gap-2 p-2 bg-blue-500/10 rounded border border-blue-500/30">
            <Activity className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-300">Network latency within acceptable range</div>
          </div>

          <div className="flex items-start gap-2 p-2 bg-cyan-500/10 rounded border border-cyan-500/30">
            <Wifi className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-300">Mesh network synchronized across all nodes</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
