import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Radio, Wifi, WifiOff, Server, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface EmergencyBroadcastNode {
  id: string;
  name: string;
  region: string;
  status: 'active' | 'standby' | 'offline' | 'degraded';
  coverage: number;
  redundancy: 'primary' | 'secondary' | 'tertiary';
  offlineCapable: boolean;
  aiEnhanced: boolean;
  lastTest?: number;
  emergencyReady: boolean;
}

interface BroadcastMetrics {
  nodeId: string;
  signalStrength: number;
  coverage: number;
  latency: number;
  reliability: number;
  offlineCache: number;
}

export default function HybridCastBroadcastManagement() {
  const { isConnected, updates } = useWebSocket();
  const [nodes, setNodes] = useState<EmergencyBroadcastNode[]>([
    {
      id: 'node1',
      name: 'Primary Emergency Hub',
      region: 'North America',
      status: 'active',
      coverage: 98.5,
      redundancy: 'primary',
      offlineCapable: true,
      aiEnhanced: true,
      lastTest: Date.now() - 86400000,
      emergencyReady: true,
    },
    {
      id: 'node2',
      name: 'Secondary Emergency Hub',
      region: 'Europe',
      status: 'active',
      coverage: 97.2,
      redundancy: 'secondary',
      offlineCapable: true,
      aiEnhanced: true,
      lastTest: Date.now() - 172800000,
      emergencyReady: true,
    },
    {
      id: 'node3',
      name: 'Tertiary Emergency Hub',
      region: 'Asia-Pacific',
      status: 'standby',
      coverage: 95.8,
      redundancy: 'tertiary',
      offlineCapable: true,
      aiEnhanced: true,
      lastTest: Date.now() - 259200000,
      emergencyReady: true,
    },
  ]);

  const [metrics, setMetrics] = useState<BroadcastMetrics[]>([
    {
      nodeId: 'node1',
      signalStrength: 98,
      coverage: 98.5,
      latency: 8,
      reliability: 99.98,
      offlineCache: 85,
    },
    {
      nodeId: 'node2',
      signalStrength: 96,
      coverage: 97.2,
      latency: 12,
      reliability: 99.95,
      offlineCache: 82,
    },
    {
      nodeId: 'node3',
      signalStrength: 94,
      coverage: 95.8,
      latency: 15,
      reliability: 99.92,
      offlineCache: 78,
    },
  ]);

  const [selectedNode, setSelectedNode] = useState<string>('node1');
  const [emergencyMode, setEmergencyMode] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'standby':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'offline':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'degraded':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Emergency Alert */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                HybridCast Emergency Broadcasting
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Emergency broadcast system with on/offline capabilities and AI-integrated infrastructure
              </p>
            </div>
            <Button
              onClick={() => setEmergencyMode(!emergencyMode)}
              className={`gap-2 ${
                emergencyMode
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
              }`}
            >
              <Radio className="w-4 h-4" />
              {emergencyMode ? 'EMERGENCY MODE ACTIVE' : 'Emergency Mode'}
            </Button>
          </div>

          {emergencyMode && (
            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-4">
              <p className="text-red-800 dark:text-red-200 font-medium">
                ⚠️ EMERGENCY BROADCAST MODE ACTIVATED - All systems prioritized for emergency communications
              </p>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Emergency Broadcast Nodes */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Broadcast Nodes</h2>
            {nodes.map((node) => (
              <Card
                key={node.id}
                className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                  selectedNode === node.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedNode(node.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1 text-slate-600 dark:text-slate-400">
                      <Server className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white">{node.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{node.region}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(node.status)}`}>
                      {node.status.toUpperCase()}
                    </span>
                    {node.emergencyReady && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 rounded text-xs text-green-800 dark:text-green-200 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Ready
                      </span>
                    )}
                  </div>
                </div>

                {/* Node Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 p-3 bg-slate-50 dark:bg-slate-700 rounded">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Coverage</p>
                    <p className="font-bold text-slate-900 dark:text-white">{node.coverage}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Redundancy</p>
                    <p className="font-bold text-slate-900 dark:text-white uppercase text-sm">{node.redundancy}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Offline Mode</p>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {node.offlineCapable ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Last Test</p>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {node.lastTest ? Math.floor((Date.now() - node.lastTest) / 3600000) + 'h ago' : 'Never'}
                    </p>
                  </div>
                </div>

                {/* Capabilities */}
                <div className="flex gap-2 mb-3">
                  {node.offlineCapable && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs text-blue-800 dark:text-blue-200 flex items-center gap-1">
                      <Wifi className="w-3 h-3" />
                      Offline-Capable
                    </span>
                  )}
                  {node.aiEnhanced && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded text-xs text-purple-800 dark:text-purple-200">
                      🤖 AI-Enhanced
                    </span>
                  )}
                </div>

                {/* Controls */}
                <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <Button size="sm" variant="outline" className="gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Test
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Diagnostics
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Node Details & Metrics */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Node Metrics</h2>
            {metrics
              .filter((m) => m.nodeId === selectedNode)
              .map((metric) => (
                <Card
                  key={metric.nodeId}
                  className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4"
                >
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Signal Strength</p>
                      <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${metric.signalStrength}%` }}
                        ></div>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{metric.signalStrength}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Coverage</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{metric.coverage}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Latency</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{metric.latency}ms</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Reliability</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{metric.reliability}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Offline Cache</p>
                      <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${metric.offlineCache}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{metric.offlineCache}% cached</p>
                    </div>
                  </div>
                </Card>
              ))}

            {/* Emergency Features */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3">Emergency Features</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-slate-700 dark:text-slate-300">Multi-Region Failover</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-slate-700 dark:text-slate-300">Offline Broadcasting</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-slate-700 dark:text-slate-300">AI-Powered Routing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-slate-700 dark:text-slate-300">Real-Time Monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-slate-700 dark:text-slate-300">Automated Alerts</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
