import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Radio, AlertTriangle } from 'lucide-react';

export default function QumusPort3000() {
  const [systemStatus, setSystemStatus] = useState({
    qumus: { status: 'online', autonomyLevel: '90%' },
    rrb: { status: 'checking', listeners: 0 },
    hybridcast: { status: 'checking', alerts: 0 },
  });

  const [metrics, setMetrics] = useState({
    activeTasks: 0,
    successRate: '0%',
    commandsExecuted: 0,
    systemUptime: '0h',
  });

  useEffect(() => {
    // Fetch system status from all ports
    const checkSystemStatus = async () => {
      try {
        const [qumusRes, rrbRes, hybridcastRes] = await Promise.allSettled([
          fetch('http://localhost:3000/api/qumus/status').then((r) => r.json()),
          fetch('http://localhost:3001/api/rrb/status').then((r) => r.json()),
          fetch('http://localhost:3002/api/hybridcast/status').then((r) => r.json()),
        ]);

        setSystemStatus({
          qumus: qumusRes.status === 'fulfilled' ? qumusRes.value : { status: 'offline' },
          rrb: rrbRes.status === 'fulfilled' ? rrbRes.value : { status: 'offline' },
          hybridcast: hybridcastRes.status === 'fulfilled' ? hybridcastRes.value : { status: 'offline' },
        });
      } catch (error) {
        console.error('Failed to fetch system status:', error);
      }
    };

    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const allSystemsOnline =
    systemStatus.qumus.status === 'online' &&
    systemStatus.rrb.status === 'online' &&
    systemStatus.hybridcast.status === 'online';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Zap className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">QUMUS</h1>
                <p className="text-sm text-purple-300">Orchestration Engine • Port 3000</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={`${
                  allSystemsOnline
                    ? 'bg-green-500/20 text-green-400 border-green-500/50 animate-pulse'
                    : 'bg-red-500/20 text-red-400 border-red-500/50'
                }`}
              >
                {allSystemsOnline ? '🟢 All Systems Online' : '🔴 System Issues'}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">Autonomous Orchestration</h2>
          <p className="text-xl text-purple-300 mb-8 max-w-3xl mx-auto">
            90% autonomous control. Qumus manages all RRB ecosystem systems, makes intelligent decisions,
            and executes tasks autonomously. Monitor and control everything from this dashboard.
          </p>
        </div>

        {/* System Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Qumus Status */}
          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  Qumus Core
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
              <CardDescription>Orchestration Engine</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-purple-300">Autonomy Level</p>
                  <p className="text-2xl font-bold text-purple-400">{systemStatus.qumus.autonomyLevel}</p>
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Control Panel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* RRB Status */}
          <Card className="bg-slate-800/50 border-pink-500/20 hover:border-pink-500/50 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-pink-400" />
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
              <CardDescription>Port 3001</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-purple-300">Active Listeners</p>
                  <p className="text-2xl font-bold text-pink-400">{systemStatus.rrb.listeners || 0}</p>
                </div>
                <Button className="w-full bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700">
                  Go to RRB
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* HybridCast Status */}
          <Card className="bg-slate-800/50 border-red-500/20 hover:border-red-500/50 transition-all">
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
              <CardDescription>Port 3002</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-purple-300">Active Alerts</p>
                  <p className="text-2xl font-bold text-red-400">{systemStatus.hybridcast.alerts || 0}</p>
                </div>
                <Button className="w-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700">
                  Emergency Panel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Active Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{metrics.activeTasks}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-300">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{metrics.successRate}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-300">Commands Executed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{metrics.commandsExecuted}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-300">System Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">{metrics.systemUptime}</div>
            </CardContent>
          </Card>
        </div>

        {/* Control Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle>Qumus Controls</CardTitle>
              <CardDescription>Manage orchestration engine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                📊 Dashboard
              </Button>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                ⚙️ Policies
              </Button>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                📋 Task Queue
              </Button>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                🔍 Audit Trail
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle>System Commands</CardTitle>
              <CardDescription>Send commands to RRB & HybridCast</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700">
                📻 Command RRB
              </Button>
              <Button className="w-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700">
                🚨 Command HybridCast
              </Button>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                🔄 Sync All Systems
              </Button>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                📡 System Status
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Autonomous Features */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle>Autonomous Features</CardTitle>
            <CardDescription>What Qumus handles automatically</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                '24/7 Radio Scheduling',
                'Listener Management',
                'Emergency Alert Routing',
                'Donation Processing',
                'Inventory Management',
                'Policy Evaluation',
                'Task Execution',
                'System Monitoring',
                'Report Generation',
                'Resource Optimization',
                'User Request Handling',
                'Cross-System Coordination',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-green-400">✓</span>
                  <span className="text-purple-300">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-purple-300">
          <p>Qumus Orchestration Engine • 90% Autonomous • 10% Human Override</p>
          <p className="text-sm mt-2">RRB (3001) • HybridCast (3002)</p>
        </div>
      </footer>
    </div>
  );
}
