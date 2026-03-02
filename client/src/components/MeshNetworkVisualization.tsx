import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, Zap, AlertCircle, CheckCircle } from 'lucide-react';

interface NetworkNode {
  id: number;
  x: number;
  y: number;
  status: 'active' | 'inactive' | 'warning';
  sector: number;
  signal: number;
}

export function MeshNetworkVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [networkHealth, setNetworkHealth] = useState(95);

  // Initialize network nodes
  useEffect(() => {
    const newNodes: NetworkNode[] = [];
    const cols = 8;
    const rows = 8;
    const nodeSpacing = 60;
    const startX = 40;
    const startY = 40;

    for (let i = 0; i < cols * rows; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      newNodes.push({
        id: i + 1,
        x: startX + col * nodeSpacing,
        y: startY + row * nodeSpacing,
        status: Math.random() > 0.1 ? 'active' : 'warning',
        sector: Math.floor(i / 8) + 1,
        signal: Math.floor(Math.random() * 40 + 60),
      });
    }
    setNodes(newNodes);
  }, []);

  // Draw mesh network
  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 60) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 60) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw connections between adjacent nodes
    nodes.forEach((node, index) => {
      const col = index % 8;
      const row = Math.floor(index / 8);

      // Connect to right neighbor
      if (col < 7) {
        const rightNode = nodes[index + 1];
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(rightNode.x, rightNode.y);
        ctx.stroke();
      }

      // Connect to bottom neighbor
      if (row < 7) {
        const bottomNode = nodes[index + 8];
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(bottomNode.x, bottomNode.y);
        ctx.stroke();
      }
    });

    // Draw nodes
    nodes.forEach((node) => {
      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);

      if (node.status === 'active') {
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
        ctx.strokeStyle = '#fbbf24';
      } else if (node.status === 'warning') {
        ctx.fillStyle = '#f87171';
        ctx.fill();
        ctx.strokeStyle = '#f87171';
      } else {
        ctx.fillStyle = '#6b7280';
        ctx.fill();
        ctx.strokeStyle = '#6b7280';
      }

      ctx.lineWidth = 2;
      ctx.stroke();

      // Node label
      ctx.fillStyle = '#e5e7eb';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.id.toString(), node.x, node.y);

      // Highlight selected node
      if (selectedNode === node.id) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 14, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }, [nodes, selectedNode]);

  // Update network health periodically
  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setNetworkHealth((prev) => {
        const change = (Math.random() - 0.5) * 5;
        const newHealth = Math.max(85, Math.min(100, prev + change));
        return Math.round(newHealth);
      });

      // Randomly update node statuses
      setNodes((prevNodes) =>
        prevNodes.map((node) => ({
          ...node,
          status: Math.random() > 0.05 ? 'active' : 'warning',
          signal: Math.floor(Math.random() * 40 + 60),
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked node
    const clicked = nodes.find((node) => {
      const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
      return distance < 12;
    });

    if (clicked) {
      setSelectedNode(clicked.id);
    }
  };

  const selectedNodeData = nodes.find((n) => n.id === selectedNode);

  return (
    <div className="space-y-4">
      {/* Canvas */}
      <Card className="p-4 bg-slate-900 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Wifi className="w-5 h-5 text-cyan-400" />
          Mesh Network Topology (64 Nodes)
        </h3>

        <canvas
          ref={canvasRef}
          width={540}
          height={540}
          onClick={handleCanvasClick}
          className="w-full border border-slate-700 rounded-lg cursor-pointer bg-slate-950"
        />

        <div className="mt-4 text-xs text-slate-400">
          Click on any node to view details. Yellow = Active, Red = Warning
        </div>
      </Card>

      {/* Network Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-900 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400">Network Health</div>
              <div className="text-3xl font-bold text-cyan-400">{networkHealth}%</div>
            </div>
            <div className={`p-3 rounded-lg ${networkHealth > 90 ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
              {networkHealth > 90 ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-400" />
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-900 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400">Active Nodes</div>
              <div className="text-3xl font-bold text-green-400">
                {nodes.filter((n) => n.status === 'active').length}/{nodes.length}
              </div>
            </div>
            <Zap className="w-6 h-6 text-green-400" />
          </div>
        </Card>

        <Card className="p-4 bg-slate-900 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400">Latency</div>
              <div className="text-3xl font-bold text-blue-400">&lt;50ms</div>
            </div>
            <Wifi className="w-6 h-6 text-blue-400" />
          </div>
        </Card>
      </div>

      {/* Selected Node Details */}
      {selectedNodeData && (
        <Card className="p-4 bg-slate-900 border border-slate-700">
          <h4 className="text-lg font-semibold text-white mb-4">Node {selectedNodeData.id} Details</h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-slate-400 mb-1">Node ID</div>
              <div className="text-lg font-bold text-cyan-400">{selectedNodeData.id}</div>
            </div>

            <div>
              <div className="text-xs text-slate-400 mb-1">Status</div>
              <div className={`text-lg font-bold ${selectedNodeData.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>
                {selectedNodeData.status.toUpperCase()}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400 mb-1">Signal Strength</div>
              <div className="text-lg font-bold text-blue-400">{selectedNodeData.signal}%</div>
            </div>

            <div>
              <div className="text-xs text-slate-400 mb-1">Sector</div>
              <div className="text-lg font-bold text-purple-400">{selectedNodeData.sector}</div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm">Ping</Button>
            <Button className="bg-slate-700 hover:bg-slate-600 text-white text-sm">Configure</Button>
            <Button className="bg-slate-700 hover:bg-slate-600 text-white text-sm">Diagnostics</Button>
          </div>
        </Card>
      )}

      {/* Controls */}
      <Card className="p-4 bg-slate-900 border border-slate-700">
        <div className="flex gap-2">
          <Button
            onClick={() => setIsAnimating(!isAnimating)}
            className={`${isAnimating ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
          >
            {isAnimating ? 'Pause' : 'Resume'} Animation
          </Button>
          <Button className="bg-slate-700 hover:bg-slate-600 text-white">Export Topology</Button>
          <Button className="bg-slate-700 hover:bg-slate-600 text-white">Network Report</Button>
        </div>
      </Card>
    </div>
  );
}
