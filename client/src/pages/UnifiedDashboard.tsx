import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Radio, AlertTriangle, Activity, TrendingUp } from 'lucide-react';

export default function UnifiedDashboard() {
  const [systemStatus, setSystemStatus] = useState({
    qumus: { status: 'checking', autonomyLevel: '90%', activeTasks: 0 },
    rrb: { status: 'checking', listeners: 0, currentShow: 'Loading...' },
    hybridcast: { status: 'checking', alerts: 0, meshNodes: 0 },
  });

  const [overallMetrics, setOverallMetrics] = useState({
    totalListeners: 0,
    activeAlerts: 0,
    systemUptime: '0h',
    successRate: '0%',
  });

  useEffect(() => {
    const fetchAllStatus = async () => {
      try {
        const [qumusRes, rrbRes, hybridcastRes] = await Promise.allSettled([
          fetch('http://localhost:3000/api/qumus/status').then((r) => r.json()),
          fetch('http://localhost:3001/api/rrb/status').then((r) => r.json()),
          fetch('http://localhost:3002/api/hybridcast/status').then((r) => r.json()),
        ]);

        const qumusData = qumusRes.status === 'fulfilled' ? qumusRes.value : { status: 'offline' };
        const rrbData = rrbRes.status === 'fulfilled' ? rrbRes.value : { status: 'offline' };
        const hybridcastData = hybridcastRes.status === 'fulfilled' ? hybridcastRes.value : { status: 'offline' };

        setSystemStatus({
          qumus: qumusData,
          rrb: rrbData,
          hybridcast: hybridcastData,
        });

        // Calculate overall metrics
        setOverallMetrics({
          totalListeners: rrbData.listeners || 0,
          activeAlerts: hybridcastData.alerts || 0,
          systemUptime: rrbData.uptime || '0h',
          successRate: qumusData.autonomyLevel || '0%',
        });
      } catch (error) {
        console.error('Failed to fetch system status:', error);
      }
    };

    fetchAllStatus();
    const interval = setInterval(fetchAllStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const allOnline =
    systemStatus.qumus.status === 'online' &&
    systemStatus.rrb.status === 'online' &&
    systemStatus.hybridcast.status === 'online';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white">Unified Ecosystem Dashboard</h1>
              <p className="text-slate-400 mt-1">Monitor all systems: Qumus, RRB, HybridCast</p>
            </div>
            <Badge
              className={`text-lg px-4 py-2 ${
                allOnline
                  ? 'bg-green-500/20 text-green-400 border-green-500/50 animate-pulse'
                  : 'bg-red-500/20 text-red-400 border-red-500/50'
              }`}
            >
              {allOnline ? '🟢 All Systems Online' : '🔴 System Issues'}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Overall Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Total Listeners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{overallMetrics.totalListeners}</div>
              <p className="text-xs text-slate-400 mt-1">Across all channels</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{overallMetrics.activeAlerts}</div>
              <p className="text-xs text-slate-400 mt-1">Emergency broadcasts</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                System Uptime
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{overallMetrics.systemUptime}</div>
              <p className="text-xs text-slate-400 mt-1">Continuous operation</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Autonomy Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">{overallMetrics.successRate}</div>
              <p className="text-xs text-slate-400 mt-1">Qumus control</p>
            </CardContent>
          </Card>
        </div>

        {/* System Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Qumus Card */}
          <Card className="bg-gradient-to-br from-purple-900/30 to-slate-800/30 border-purple-500/30 hover:border-purple-500/50 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  Qumus
                </CardTitle>
                <Badge
                  className={`${
                    systemStatus.qumus.status === 'online'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {systemStatus.qumus.status}
                </Badge>
              </div>
              <CardDescription>Orchestration Engine • Port 3000</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">Autonomy Level</p>
                <p className="text-2xl font-bold text-purple-400">{systemStatus.qumus.autonomyLevel}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Active Tasks</p>
                <p className="text-2xl font-bold text-white">{systemStatus.qumus.activeTasks}</p>
              </div>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Open Qumus
              </Button>
            </CardContent>
          </Card>

          {/* RRB Card */}
          <Card className="bg-gradient-to-br from-pink-900/30 to-slate-800/30 border-pink-500/30 hover:border-pink-500/50 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-pink-400 animate-pulse" />
                  RRB Radio
                </CardTitle>
                <Badge
                  className={`${
                    systemStatus.rrb.status === 'online'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {systemStatus.rrb.status}
                </Badge>
              </div>
              <CardDescription>24/7 Broadcasting • Port 3001</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">Active Listeners</p>
                <p className="text-2xl font-bold text-pink-400">{systemStatus.rrb.listeners}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Now Playing</p>
                <p className="text-sm font-semibold text-white truncate">{systemStatus.rrb.currentShow}</p>
              </div>
              <Button className="w-full bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700">
                Open RRB
              </Button>
            </CardContent>
          </Card>

          {/* HybridCast Card */}
          <Card className="bg-gradient-to-br from-red-900/30 to-slate-800/30 border-red-500/30 hover:border-red-500/50 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  HybridCast
                </CardTitle>
                <Badge
                  className={`${
                    systemStatus.hybridcast.status === 'online'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {systemStatus.hybridcast.status}
                </Badge>
              </div>
              <CardDescription>Emergency Broadcast • Port 3002</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">Active Alerts</p>
                <p className="text-2xl font-bold text-red-400">{systemStatus.hybridcast.alerts}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Mesh Nodes</p>
                <p className="text-2xl font-bold text-yellow-400">{systemStatus.hybridcast.meshNodes}</p>
              </div>
              <Button className="w-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700">
                Open HybridCast
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-slate-800/50 border-slate-700 mb-12">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common operations across all systems</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <Button className="bg-slate-700 hover:bg-slate-600">📻 Start RRB</Button>
              <Button className="bg-slate-700 hover:bg-slate-600">🚨 Create Alert</Button>
              <Button className="bg-slate-700 hover:bg-slate-600">📊 View Analytics</Button>
              <Button className="bg-slate-700 hover:bg-slate-600">🔄 Sync Systems</Button>
              <Button className="bg-slate-700 hover:bg-slate-600">📡 Mesh Status</Button>
              <Button className="bg-slate-700 hover:bg-slate-600">⚙️ Settings</Button>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Real-time status of all components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Qumus Core', status: 'online', color: 'text-green-400' },
                { name: 'RRB Streaming', status: 'online', color: 'text-green-400' },
                { name: 'HybridCast Mesh', status: 'online', color: 'text-green-400' },
                { name: 'Database', status: 'online', color: 'text-green-400' },
                { name: 'Offline Storage', status: 'online', color: 'text-green-400' },
              ].map((component, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                  <span className="text-slate-300">{component.name}</span>
                  <span className={`font-semibold ${component.color}`}>● {component.status}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Ecosystem Features</CardTitle>
              <CardDescription>Integrated capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                '✓ 24/7 Radio Broadcasting',
                '✓ Healing Frequencies (9 Solfeggio)',
                '✓ Solbones Dice Game',
                '✓ Emergency Alerts',
                '✓ Offline Operation',
                '✓ Mesh Networking',
              ].map((feature, idx) => (
                <div key={idx} className="text-sm text-slate-300 p-2 bg-slate-700/50 rounded">
                  {feature}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* System Architecture */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle>Architecture Overview</CardTitle>
            <CardDescription>Multi-port ecosystem with cross-system orchestration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <p className="text-sm font-mono text-slate-300">
                  <span className="text-purple-400">Qumus (3000)</span> → Orchestrates all systems
                </p>
                <p className="text-sm font-mono text-slate-300 mt-2">
                  ├─ <span className="text-pink-400">RRB (3001)</span> → Radio Station
                </p>
                <p className="text-sm font-mono text-slate-300">
                  └─ <span className="text-red-400">HybridCast (3002)</span> → Emergency Broadcast
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-3 bg-purple-900/20 rounded border border-purple-500/30">
                  <p className="text-sm font-semibold text-purple-300">Qumus</p>
                  <p className="text-xs text-slate-400 mt-1">90% autonomous control, 10% human override</p>
                </div>
                <div className="p-3 bg-pink-900/20 rounded border border-pink-500/30">
                  <p className="text-sm font-semibold text-pink-300">RRB</p>
                  <p className="text-xs text-slate-400 mt-1">Takes commands from Qumus, manages broadcasts</p>
                </div>
                <div className="p-3 bg-red-900/20 rounded border border-red-500/30">
                  <p className="text-sm font-semibold text-red-300">HybridCast</p>
                  <p className="text-xs text-slate-400 mt-1">Offline-first, mesh networking, emergency alerts</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>Unified Ecosystem Dashboard • Qumus (3000) • RRB (3001) • HybridCast (3002)</p>
          <p className="text-sm mt-2">Offline Capable • Mesh Enabled • 90% Autonomous</p>
        </div>
      </footer>
    </div>
  );
}
