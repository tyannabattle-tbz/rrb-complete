import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Send,
  Radio,
  Zap,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Terminal,
  Layers,
} from 'lucide-react';

export default function TyOSCommandDashboard() {
  const [commandType, setCommandType] = useState<'update' | 'control' | 'query' | 'override' | 'schedule' | 'broadcast'>(
    'control'
  );
  const [targetSystem, setTargetSystem] = useState<'rrb-radio' | 'hybridcast' | 'canryn' | 'sweet-miracles' | 'all'>(
    'rrb-radio'
  );
  const [action, setAction] = useState('');
  const [params, setParams] = useState('{}');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'critical'>('normal');
  const [commandHistory, setCommandHistory] = useState<any[]>([]);
  const [ecosystemStatus, setEcosystemStatus] = useState<any>(null);
  const [recentDecisions, setRecentDecisions] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // Simulate loading ecosystem status
    const mockStatus = {
      qumusHealth: {
        isRunning: true,
        subsystems: 18,
        policies: 20,
        autonomyLevel: 90,
        decisions24h: 1247,
      },
      subsystems: {
        'rrb-radio': { status: 'operational', health: 100, listeners: 3847 },
        'hybridcast': { status: 'operational', health: 95, channels: 8 },
        'canryn': { status: 'operational', health: 98 },
        'sweet-miracles': { status: 'operational', health: 96 },
      },
    };
    setEcosystemStatus(mockStatus);

    // Simulate recent decisions
    setRecentDecisions([
      {
        policyId: 'cache_optimization',
        decision: 'Optimized cache for peak load',
        timestamp: Date.now() - 300000,
        impact: 'Improved response time by 12%',
      },
      {
        policyId: 'auto_scaling',
        decision: 'Scaled up RRB Radio capacity',
        timestamp: Date.now() - 600000,
        impact: 'Handled 3,847 concurrent listeners',
      },
    ]);
  }, []);

  const handleSendCommand = async () => {
    if (!action.trim()) {
      alert('Please enter an action');
      return;
    }

    try {
      const parsedParams = JSON.parse(params);

      const command = {
        commandType,
        target: targetSystem,
        action,
        params: parsedParams,
        priority,
      };

      // Add to history
      setCommandHistory((prev) => [
        {
          id: `cmd_${Date.now()}`,
          ...command,
          timestamp: Date.now(),
          status: 'sent',
        },
        ...prev.slice(0, 9),
      ]);

      // Clear inputs
      setAction('');
      setParams('{}');

      console.log('[Ty OS] Command sent to QUMUS:', command);
    } catch (error) {
      alert('Invalid JSON in params: ' + String(error));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500/20 text-green-300 border-green-500';
      case 'degraded':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500';
      case 'offline':
        return 'bg-red-500/20 text-red-300 border-red-500';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Ty OS Command Dashboard</h1>
              <p className="text-slate-300">Send commands to QUMUS/Trinity for ecosystem orchestration</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400 mb-2">QUMUS Status</div>
              <Badge className="bg-green-500 text-white">CONNECTED</Badge>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="command" className="space-y-4">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="command" className="text-slate-300">
              <Send className="w-4 h-4 mr-2" />
              Send Command
            </TabsTrigger>
            <TabsTrigger value="status" className="text-slate-300">
              <Activity className="w-4 h-4 mr-2" />
              Ecosystem Status
            </TabsTrigger>
            <TabsTrigger value="decisions" className="text-slate-300">
              <Brain className="w-4 h-4 mr-2" />
              Recent Decisions
            </TabsTrigger>
            <TabsTrigger value="history" className="text-slate-300">
              <Terminal className="w-4 h-4 mr-2" />
              Command History
            </TabsTrigger>
          </TabsList>

          {/* Send Command Tab */}
          <TabsContent value="command" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Command Builder */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Command Builder</CardTitle>
                  <CardDescription className="text-slate-400">Compose and send commands to QUMUS</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Command Type */}
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Command Type</label>
                    <select
                      value={commandType}
                      onChange={(e) => setCommandType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded"
                    >
                      <option value="update">Update</option>
                      <option value="control">Control</option>
                      <option value="query">Query</option>
                      <option value="override">Override</option>
                      <option value="schedule">Schedule</option>
                      <option value="broadcast">Broadcast</option>
                    </select>
                  </div>

                  {/* Target System */}
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Target System</label>
                    <select
                      value={targetSystem}
                      onChange={(e) => setTargetSystem(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded"
                    >
                      <option value="rrb-radio">RRB Radio</option>
                      <option value="hybridcast">HybridCast</option>
                      <option value="canryn">Canryn</option>
                      <option value="sweet-miracles">Sweet Miracles</option>
                      <option value="all">All Systems</option>
                    </select>
                  </div>

                  {/* Action */}
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Action</label>
                    <Input
                      value={action}
                      onChange={(e) => setAction(e.target.value)}
                      placeholder="e.g., start_broadcast, update_metadata, sync_all"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  {/* Parameters */}
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Parameters (JSON)</label>
                    <textarea
                      value={params}
                      onChange={(e) => setParams(e.target.value)}
                      placeholder='{"key": "value"}'
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded font-mono text-sm"
                      rows={4}
                    />
                  </div>

                  {/* Send Button */}
                  <Button
                    onClick={handleSendCommand}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Command to QUMUS
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                  <CardDescription className="text-slate-400">Common commands</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={() => {
                      setCommandType('query');
                      setTargetSystem('all');
                      setAction('get_status');
                      setParams('{}');
                    }}
                    className="w-full justify-start bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Query All Systems
                  </Button>
                  <Button
                    onClick={() => {
                      setCommandType('control');
                      setTargetSystem('rrb-radio');
                      setAction('start_broadcast');
                      setParams('{}');
                    }}
                    className="w-full justify-start bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    <Radio className="w-4 h-4 mr-2" />
                    Start RRB Broadcast
                  </Button>
                  <Button
                    onClick={() => {
                      setCommandType('broadcast');
                      setTargetSystem('all');
                      setAction('sync_all');
                      setParams('{}');
                    }}
                    className="w-full justify-start bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Sync All Systems
                  </Button>
                  <Button
                    onClick={() => {
                      setCommandType('override');
                      setTargetSystem('all');
                      setAction('reduce_autonomy');
                      setParams('{"level": 50}');
                    }}
                    className="w-full justify-start bg-red-700 hover:bg-red-600 text-white"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Human Override
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Ecosystem Status Tab */}
          <TabsContent value="status" className="space-y-4">
            {ecosystemStatus && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* QUMUS Health */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">QUMUS Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Status:</span>
                      <Badge className="bg-green-500/20 text-green-300">Running</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Subsystems:</span>
                      <span className="text-white font-semibold">{ecosystemStatus.qumusHealth.subsystems}/18</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Policies:</span>
                      <span className="text-white font-semibold">{ecosystemStatus.qumusHealth.policies}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Autonomy:</span>
                      <span className="text-white font-semibold">{ecosystemStatus.qumusHealth.autonomyLevel}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Decisions (24h):</span>
                      <span className="text-white font-semibold">{ecosystemStatus.qumusHealth.decisions24h}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Subsystems Status */}
                {Object.entries(ecosystemStatus.subsystems).map(([name, data]: any) => (
                  <Card key={name} className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white capitalize">{name.replace('-', ' ')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-300">Status:</span>
                        <Badge className={getStatusColor(data.status)}>{data.status}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Health:</span>
                        <span className="text-white font-semibold">{data.health.toFixed(1)}%</span>
                      </div>
                      {data.listeners && (
                        <div className="flex justify-between">
                          <span className="text-slate-300">Listeners:</span>
                          <span className="text-white font-semibold">{data.listeners.toLocaleString()}</span>
                        </div>
                      )}
                      {data.channels && (
                        <div className="flex justify-between">
                          <span className="text-slate-300">Channels:</span>
                          <span className="text-white font-semibold">{data.channels}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Recent Decisions Tab */}
          <TabsContent value="decisions" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent QUMUS Decisions</CardTitle>
                <CardDescription className="text-slate-400">Autonomous policy executions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentDecisions.map((decision, idx) => (
                    <div key={idx} className="p-4 bg-slate-700 rounded border border-slate-600">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-white font-semibold">{decision.decision}</p>
                          <p className="text-xs text-slate-400 mt-1">Policy: {decision.policyId}</p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <p className="text-sm text-slate-300 mb-2">{decision.impact}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(decision.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Command History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Command History</CardTitle>
                <CardDescription className="text-slate-400">Recent commands sent to QUMUS</CardDescription>
              </CardHeader>
              <CardContent>
                {commandHistory.length === 0 ? (
                  <p className="text-slate-400">No commands sent yet</p>
                ) : (
                  <div className="space-y-3">
                    {commandHistory.map((cmd) => (
                      <div key={cmd.id} className="p-3 bg-slate-700 rounded border border-slate-600 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-purple-300">{cmd.commandType}</span>
                          <Badge className="bg-green-500/20 text-green-300">{cmd.status}</Badge>
                        </div>
                        <p className="text-slate-300">
                          {cmd.target} → {cmd.action}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(cmd.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Import Brain icon
import { Brain } from 'lucide-react';
