import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Wifi, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { getWebSocketService, MeshNode, NetworkMetrics } from '@/lib/websocketService';
import { toast } from 'sonner';

export function MeshNetworkVisualizationEnhanced() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<MeshNode[]>([]);
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    totalNodes: 64,
    activeNodes: 62,
    avgLatency: 45,
    avgBandwidth: 125.5,
    networkHealth: 96.8,
    timestamp: Date.now(),
  });
  const [selectedNode, setSelectedNode] = useState<MeshNode | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const wsServiceRef = useRef(getWebSocketService());

  // Initialize WebSocket and nodes
  useEffect(() => {
    const wsService = wsServiceRef.current;

    // Initialize mock nodes (in production, these come from WebSocket)
    const initialNodes: MeshNode[] = Array.from({ length: 64 }, (_, i) => ({
      id: i,
      sector: Math.floor(i / 8),
      x: (i % 8) * 60 + 30,
      y: Math.floor(i / 8) * 60 + 30,
      active: Math.random() > 0.1,
      signalStrength: Math.random() * 100,
      latency: Math.random() * 100 + 20,
      bandwidth: Math.random() * 150 + 50,
      status: Math.random() > 0.15 ? 'online' : 'degraded',
      lastUpdate: Date.now(),
    }));

    setNodes(initialNodes);

    // Setup WebSocket listeners
    const unsubscribeNodeUpdate = wsService.on('node_update', (node: MeshNode) => {
      setNodes((prev) =>
        prev.map((n) => (n.id === node.id ? node : n))
      );
    });

    const unsubscribeMetricsUpdate = wsService.on('metrics_update', (newMetrics: NetworkMetrics) => {
      setMetrics(newMetrics);
    });

    const unsubscribeAlert = wsService.on('alert', (alert: any) => {
      toast.error(`Alert: ${alert.message}`, { description: `Severity: ${alert.severity}` });
    });

    const unsubscribeConnectionFailed = wsService.on('connection_failed', (data: any) => {
      setConnectionStatus(`Connection Failed: ${data.reason}`);
      setIsConnected(false);
    });

    // Attempt to connect
    wsService.connect()
      .then(() => {
        setIsConnected(true);
        setConnectionStatus('Connected');
        wsService.requestMetricsUpdate();
        toast.success('Connected to mesh network');
      })
      .catch((error) => {
        console.error('Failed to connect:', error);
        setConnectionStatus('Connection Failed - Using Mock Data');
        setIsConnected(false);
        // Continue with mock data
      });

    // Simulate real-time updates when not connected
    if (!isConnected) {
      const updateInterval = setInterval(() => {
        setNodes((prev) =>
          prev.map((node) => ({
            ...node,
            signalStrength: Math.max(0, Math.min(100, node.signalStrength + (Math.random() - 0.5) * 10)),
            latency: Math.max(20, Math.min(150, node.latency + (Math.random() - 0.5) * 5)),
            bandwidth: Math.max(50, Math.min(200, node.bandwidth + (Math.random() - 0.5) * 10)),
            status: Math.random() > 0.95 ? 'degraded' : node.status,
            lastUpdate: Date.now(),
          }))
        );

        setMetrics((prev) => ({
          ...prev,
          avgLatency: Math.max(30, Math.min(100, prev.avgLatency + (Math.random() - 0.5) * 5)),
          avgBandwidth: Math.max(50, Math.min(200, prev.avgBandwidth + (Math.random() - 0.5) * 10)),
          networkHealth: Math.max(90, Math.min(100, prev.networkHealth + (Math.random() - 0.5) * 2)),
          timestamp: Date.now(),
        }));
      }, 2000);

      return () => {
        clearInterval(updateInterval);
        unsubscribeNodeUpdate();
        unsubscribeMetricsUpdate();
        unsubscribeAlert();
        unsubscribeConnectionFailed();
      };
    }

    return () => {
      unsubscribeNodeUpdate();
      unsubscribeMetricsUpdate();
      unsubscribeAlert();
      unsubscribeConnectionFailed();
    };
  }, []);

  // Draw mesh network on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 60, 0);
      ctx.lineTo(i * 60, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * 60);
      ctx.lineTo(canvas.width, i * 60);
      ctx.stroke();
    }

    // Draw connections between adjacent nodes
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    nodes.forEach((node) => {
      const adjacentIndices = [
        node.id - 1, node.id + 1, // Left/Right
        node.id - 8, node.id + 8, // Up/Down
      ];

      adjacentIndices.forEach((adjId) => {
        const adjNode = nodes.find((n) => n.id === adjId);
        if (adjNode && adjNode.active && node.active) {
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(adjNode.x, adjNode.y);
          ctx.stroke();
        }
      });
    });

    // Draw nodes
    nodes.forEach((node) => {
      const isSelected = selectedNode?.id === node.id;

      // Node circle
      ctx.fillStyle =
        node.status === 'online'
          ? '#10b981'
          : node.status === 'degraded'
            ? '#f59e0b'
            : '#ef4444';

      ctx.beginPath();
      ctx.arc(node.x, node.y, isSelected ? 8 : 5, 0, Math.PI * 2);
      ctx.fill();

      // Selection ring
      if (isSelected) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 12, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Signal strength indicator
      if (node.active) {
        ctx.strokeStyle = `rgba(16, 185, 129, ${node.signalStrength / 100})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 15, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Draw labels for selected node
    if (selectedNode) {
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px monospace';
      ctx.fillText(`Node ${selectedNode.id}`, selectedNode.x + 20, selectedNode.y - 10);
      ctx.fillText(`Lat: ${selectedNode.latency.toFixed(0)}ms`, selectedNode.x + 20, selectedNode.y + 5);
      ctx.fillText(`BW: ${selectedNode.bandwidth.toFixed(0)}Mbps`, selectedNode.x + 20, selectedNode.y + 20);
    }
  }, [nodes, selectedNode]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked node
    const clicked = nodes.find((node) => {
      const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
      return distance < 10;
    });

    setSelectedNode(clicked || null);
  };

  const handleRefresh = () => {
    wsServiceRef.current.requestMetricsUpdate();
    wsServiceRef.current.requestTopologyUpdate();
    toast.success('Requested network update');
  };

  const handlePingNode = () => {
    if (selectedNode) {
      wsServiceRef.current.requestNodeUpdate(selectedNode.id);
      toast.success(`Pinging node ${selectedNode.id}...`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-400';
      case 'degraded':
        return 'text-yellow-400';
      case 'offline':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wifi className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Mesh Network Visualization</h2>
              <p className="text-sm text-slate-400">Real-Time Topology (WebSocket Sync)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 ${isConnected ? 'text-green-400' : 'text-yellow-400'}`}>
              <Activity className="w-4 h-4" />
              <span className="text-xs font-medium">{connectionStatus}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Canvas */}
      <Card className="p-4 bg-slate-900 border border-slate-700">
        <canvas
          ref={canvasRef}
          width={540}
          height={540}
          onClick={handleCanvasClick}
          className="w-full border border-slate-700 rounded-lg cursor-pointer bg-slate-950"
        />
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-3 bg-slate-900 border border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Active Nodes</div>
          <div className="text-2xl font-bold text-cyan-400">{metrics.activeNodes}/{metrics.totalNodes}</div>
        </Card>
        <Card className="p-3 bg-slate-900 border border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Avg Latency</div>
          <div className="text-2xl font-bold text-blue-400">{metrics.avgLatency.toFixed(0)}ms</div>
        </Card>
        <Card className="p-3 bg-slate-900 border border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Bandwidth</div>
          <div className="text-2xl font-bold text-purple-400">{metrics.avgBandwidth.toFixed(0)}Mbps</div>
        </Card>
        <Card className="p-3 bg-slate-900 border border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Health</div>
          <div className="text-2xl font-bold text-green-400">{metrics.networkHealth.toFixed(1)}%</div>
        </Card>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <Card className="p-4 bg-slate-900 border border-cyan-700/50">
          <h3 className="font-semibold text-white mb-3">Node {selectedNode.id} Details</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-slate-400 mb-1">Status</div>
              <div className={`font-medium ${getStatusColor(selectedNode.status)}`}>
                {selectedNode.status.toUpperCase()}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Signal Strength</div>
              <div className="font-medium text-cyan-400">{selectedNode.signalStrength.toFixed(0)}%</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Latency</div>
              <div className="font-medium text-blue-400">{selectedNode.latency.toFixed(0)}ms</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Bandwidth</div>
              <div className="font-medium text-purple-400">{selectedNode.bandwidth.toFixed(0)}Mbps</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handlePingNode} className="bg-cyan-600 hover:bg-cyan-700 text-white flex-1">
              Ping Node
            </Button>
            <Button onClick={() => setSelectedNode(null)} className="bg-slate-700 hover:bg-slate-600 text-white flex-1">
              Deselect
            </Button>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleRefresh} className="bg-cyan-600 hover:bg-cyan-700 text-white flex-1">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Topology
        </Button>
      </div>

      {/* Info */}
      <Card className="p-4 bg-slate-900 border border-slate-700">
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <span className="text-slate-300">WebSocket real-time sync enabled</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <span className="text-slate-300">Automatic reconnection with exponential backoff</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <span className="text-slate-300">Click nodes to view detailed metrics</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
