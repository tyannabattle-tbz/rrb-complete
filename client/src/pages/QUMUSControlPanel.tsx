import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Activity, Zap, Settings, BarChart3, Brain, Radio, Shield } from 'lucide-react';

export default function QUMUSControlPanel() {
  const [autonomyLevel, setAutonomyLevel] = useState(90);
  const [systemHealth, setSystemHealth] = useState({
    overallHealth: 98,
    subsystems: {
      'rrb-radio': 100,
      'hybridcast': 95,
      'canryn': 98,
      'sweet-miracles': 96,
      'admin': 99,
    },
  });
  const [activeDecisions, setActiveDecisions] = useState(0);
  const [policies, setPolicies] = useState(0);
  const [syncStatus, setSyncStatus] = useState('synchronized');
  const [alerts, setAlerts] = useState<Array<{ id: string; message: string; severity: 'critical' | 'warning' }>>([]);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setSystemHealth((prev) => ({
        ...prev,
        overallHealth: Math.min(100, prev.overallHealth + Math.random() * 2 - 0.5),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">QUMUS Control Panel</h1>
              <p className="text-purple-200">Autonomous Ecosystem Management & Orchestration</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-300 mb-2">System Status</div>
              <Badge className="bg-green-500 text-white">OPERATIONAL</Badge>
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {alerts.map((alert) => (
              <Alert key={alert.id} className={alert.severity === 'critical' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-200">System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{systemHealth.overallHealth.toFixed(1)}%</div>
              <p className="text-xs text-purple-300 mt-1">All subsystems nominal</p>
              <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                  style={{ width: `${systemHealth.overallHealth}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-200">Autonomy Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{autonomyLevel}%</div>
              <p className="text-xs text-blue-300 mt-1">Decision authority</p>
              <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                  style={{ width: `${autonomyLevel}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-200">Active Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">20</div>
              <p className="text-xs text-orange-300 mt-1">Decision frameworks</p>
              <div className="mt-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Enabled:</span>
                  <span className="font-semibold">18</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-pink-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-pink-200">Sync Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">100%</div>
              <p className="text-xs text-pink-300 mt-1">All systems synced</p>
              <Badge className="mt-3 bg-green-500/20 text-green-300 border-green-500">SYNCHRONIZED</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-slate-800 border border-purple-500">
            <TabsTrigger value="overview" className="text-purple-200">
              <Activity className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="subsystems" className="text-purple-200">
              <Radio className="w-4 h-4 mr-2" />
              Subsystems
            </TabsTrigger>
            <TabsTrigger value="policies" className="text-purple-200">
              <Brain className="w-4 h-4 mr-2" />
              Policies
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-purple-200">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-purple-200">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-800 border-purple-500">
                <CardHeader>
                  <CardTitle className="text-white">Autonomous Operations</CardTitle>
                  <CardDescription className="text-purple-300">Last 24 hours</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-200">Decisions Made</span>
                      <span className="text-white font-semibold">1,247</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-200">Success Rate</span>
                      <span className="text-green-400 font-semibold">94.2%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-200">Auto-Healed Issues</span>
                      <span className="text-blue-400 font-semibold">23</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-200">Human Overrides</span>
                      <span className="text-orange-400 font-semibold">3</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-blue-500">
                <CardHeader>
                  <CardTitle className="text-white">System Performance</CardTitle>
                  <CardDescription className="text-blue-300">Real-time metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-200">Avg Response Time</span>
                      <span className="text-white font-semibold">124ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-200">CPU Usage</span>
                      <span className="text-white font-semibold">34%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-200">Memory Usage</span>
                      <span className="text-white font-semibold">52%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-200">Network Latency</span>
                      <span className="text-white font-semibold">45ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subsystems Tab */}
          <TabsContent value="subsystems" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(systemHealth.subsystems).map(([subsystem, health]) => (
                <Card key={subsystem} className="bg-slate-800 border-purple-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white capitalize">{subsystem.replace('-', ' ')}</CardTitle>
                      <Badge className={health >= 90 ? 'bg-green-500' : health >= 70 ? 'bg-yellow-500' : 'bg-red-500'}>
                        {health}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          health >= 90
                            ? 'bg-green-500'
                            : health >= 70
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${health}%` }}
                      />
                    </div>
                    <p className="text-xs text-purple-300 mt-2">Status: {health >= 90 ? 'Optimal' : 'Degraded'}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-4">
            <Card className="bg-slate-800 border-purple-500">
              <CardHeader>
                <CardTitle className="text-white">Active Decision Policies</CardTitle>
                <CardDescription className="text-purple-300">20 policies managing autonomous decisions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Cache Optimization', category: 'Performance', status: 'active' },
                    { name: 'Database Indexing', category: 'Optimization', status: 'active' },
                    { name: 'Security Scanning', category: 'Security', status: 'active' },
                    { name: 'Auto Scaling', category: 'Performance', status: 'active' },
                    { name: 'Content Scheduling', category: 'Content', status: 'active' },
                    { name: 'Listener Retention', category: 'UX', status: 'active' },
                  ].map((policy) => (
                    <div key={policy.name} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                      <div>
                        <p className="text-white font-medium">{policy.name}</p>
                        <p className="text-xs text-purple-300">{policy.category}</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500">ACTIVE</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card className="bg-slate-800 border-purple-500">
              <CardHeader>
                <CardTitle className="text-white">System Analytics</CardTitle>
                <CardDescription className="text-purple-300">Performance and decision metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-700 rounded">
                    <p className="text-sm text-purple-300 mb-1">Decision Accuracy</p>
                    <p className="text-2xl font-bold text-green-400">94.2%</p>
                  </div>
                  <div className="p-4 bg-slate-700 rounded">
                    <p className="text-sm text-purple-300 mb-1">System Uptime</p>
                    <p className="text-2xl font-bold text-blue-400">99.98%</p>
                  </div>
                  <div className="p-4 bg-slate-700 rounded">
                    <p className="text-sm text-purple-300 mb-1">Avg Response Time</p>
                    <p className="text-2xl font-bold text-cyan-400">124ms</p>
                  </div>
                  <div className="p-4 bg-slate-700 rounded">
                    <p className="text-sm text-purple-300 mb-1">Learning Improvement</p>
                    <p className="text-2xl font-bold text-purple-400">+8.3%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-slate-800 border-purple-500">
              <CardHeader>
                <CardTitle className="text-white">System Configuration</CardTitle>
                <CardDescription className="text-purple-300">Manage QUMUS autonomous settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-white font-medium block mb-2">Autonomy Level: {autonomyLevel}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={autonomyLevel}
                    onChange={(e) => setAutonomyLevel(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-purple-300 mt-2">Higher autonomy = fewer human approvals required</p>
                </div>

                <div className="space-y-2">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Zap className="w-4 h-4 mr-2" />
                    Trigger Full System Sync
                  </Button>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Shield className="w-4 h-4 mr-2" />
                    Run Security Scan
                  </Button>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    <Activity className="w-4 h-4 mr-2" />
                    Generate System Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
