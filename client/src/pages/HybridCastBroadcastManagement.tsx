import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Server, Database, Zap, AlertCircle, CheckCircle } from 'lucide-react';

interface BroadcastNode {
  id: string;
  name: string;
  type: 'primary' | 'secondary' | 'edge';
  status: 'online' | 'offline' | 'degraded';
  uptime: number;
  capacity: number;
  utilization: number;
  offlineMode: boolean;
  aiEnhanced: boolean;
}

interface BroadcastMetrics {
  nodeId: string;
  bandwidth: number;
  latency: number;
  packetLoss: number;
  throughput: number;
  activeConnections: number;
}

export default function HybridCastBroadcastManagement() {
  const [nodes, setNodes] = useState<BroadcastNode[]>([
    {
      id: 'node1',
      name: 'Primary Broadcast Hub - US East',
      type: 'primary',
      status: 'online',
      uptime: 99.98,
      capacity: 1000,
      utilization: 65,
      offlineMode: true,
      aiEnhanced: true,
    },
    {
      id: 'node2',
      name: 'Secondary Broadcast Hub - EU Central',
      type: 'secondary',
      status: 'online',
      uptime: 99.95,
      capacity: 800,
      utilization: 48,
      offlineMode: true,
      aiEnhanced: true,
    },
    {
      id: 'node3',
      name: 'Edge Node - Asia Pacific',
      type: 'edge',
      status: 'online',
      uptime: 99.92,
      capacity: 500,
      utilization: 72,
      offlineMode: true,
      aiEnhanced: true,
    },
  ]);

  const [metrics, setMetrics] = useState<BroadcastMetrics[]>([
    {
      nodeId: 'node1',
      bandwidth: 850,
      latency: 12,
      packetLoss: 0.01,
      throughput: 2500,
      activeConnections: 45230,
    },
    {
      nodeId: 'node2',
      bandwidth: 620,
      latency: 18,
      packetLoss: 0.02,
      throughput: 1800,
      activeConnections: 32150,
    },
    {
      nodeId: 'node3',
      bandwidth: 480,
      latency: 25,
      packetLoss: 0.03,
      throughput: 1400,
      activeConnections: 28900,
    },
  ]);

  const [selectedNode, setSelectedNode] = useState<string>('node1');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'offline':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'degraded':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'primary':
        return <Server className="w-5 h-5" />;
      case 'secondary':
        return <Database className="w-5 h-5" />;
      case 'edge':
        return <Zap className="w-5 h-5" />;
      default:
        return <Server className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">HybridCast Infrastructure</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Broadcast system with on/offline capabilities and AI-integrated infrastructure management
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Broadcast Nodes */}
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
                    <div className="mt-1 text-slate-600 dark:text-slate-400">{getTypeIcon(node.type)}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white">{node.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {node.type.charAt(0).toUpperCase() + node.type.slice(1)} Node
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(node.status)}`}>
                    {node.status.toUpperCase()}
                  </span>
                </div>

                {/* Node Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 p-3 bg-slate-50 dark:bg-slate-700 rounded">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Uptime</p>
                    <p className="font-bold text-slate-900 dark:text-white">{node.uptime}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Capacity</p>
                    <p className="font-bold text-slate-900 dark:text-white">{node.capacity} Gbps</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Utilization</p>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full ${
                          node.utilization > 80
                            ? 'bg-red-500'
                            : node.utilization > 60
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${node.utilization}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{node.utilization}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Mode</p>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {node.offlineMode ? 'Hybrid' : 'Online'}
                    </p>
                  </div>
                </div>

                {/* Capabilities */}
                <div className="flex gap-2 mb-3">
                  {node.offlineMode && (
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
                    Monitor
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
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
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Bandwidth</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{metric.bandwidth} Gbps</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Latency</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{metric.latency}ms</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Packet Loss</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{metric.packetLoss}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Throughput</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{metric.throughput} Mbps</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Active Connections</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {metric.activeConnections.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}

            {/* AI Infrastructure */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3">AI Infrastructure</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-slate-700 dark:text-slate-300">Adaptive Routing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-slate-700 dark:text-slate-300">Predictive Load Balancing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-slate-700 dark:text-slate-300">Offline Caching</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-slate-700 dark:text-slate-300">Anomaly Detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-slate-700 dark:text-slate-300">Auto-Failover</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
