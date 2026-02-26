import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Zap, TrendingUp } from 'lucide-react';

export interface ARMetrics {
  taskId: string;
  successRate: number;
  executionTime: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    storage: number;
  };
  timestamp: number;
}

export function RealtimeARMetrics() {
  const [metrics, setMetrics] = useState<ARMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    try {
      const websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        console.log('[RealtimeARMetrics] Connected to WebSocket');
        setIsConnected(true);
      };

      websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'metrics') {
            setMetrics(message.data);
          }
        } catch (error) {
          console.error('[RealtimeARMetrics] Message parse error:', error);
        }
      };

      websocket.onerror = (error) => {
        console.error('[RealtimeARMetrics] WebSocket error:', error);
        setIsConnected(false);
      };

      websocket.onclose = () => {
        console.log('[RealtimeARMetrics] Disconnected from WebSocket');
        setIsConnected(false);
      };

      setWs(websocket);

      return () => {
        websocket.close();
      };
    } catch (error) {
      console.error('[RealtimeARMetrics] Failed to connect:', error);
    }
  }, []);

  if (!metrics) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity size={18} className="text-cyan-400" />
            Real-time AR Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            </div>
            <p className="text-slate-400 mt-4">
              {isConnected ? 'Waiting for metrics...' : 'Connecting to stream...'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity size={18} className="text-cyan-400" />
          Real-time AR Metrics
          <span className={`ml-auto text-xs px-2 py-1 rounded ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {isConnected ? '● Live' : '● Offline'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Success Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-400" />
              Success Rate
            </span>
            <span className="text-lg font-bold text-emerald-400">
              {(metrics.successRate * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${metrics.successRate * 100}%` }}
            />
          </div>
        </div>

        {/* Execution Time */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-2">
              <Zap size={14} className="text-blue-400" />
              Execution Time
            </span>
            <span className="text-lg font-bold text-blue-400">
              {metrics.executionTime.toFixed(2)}s
            </span>
          </div>
        </div>

        {/* Resource Usage */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-700 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">CPU</p>
            <p className="text-lg font-bold text-orange-400">
              {metrics.resourceUsage.cpu.toFixed(1)}%
            </p>
            <div className="w-full bg-slate-600 rounded-full h-1 mt-2">
              <div
                className="bg-orange-500 h-1 rounded-full"
                style={{ width: `${metrics.resourceUsage.cpu}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Memory</p>
            <p className="text-lg font-bold text-purple-400">
              {metrics.resourceUsage.memory.toFixed(1)}%
            </p>
            <div className="w-full bg-slate-600 rounded-full h-1 mt-2">
              <div
                className="bg-purple-500 h-1 rounded-full"
                style={{ width: `${metrics.resourceUsage.memory}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Storage</p>
            <p className="text-lg font-bold text-cyan-400">
              {metrics.resourceUsage.storage.toFixed(1)}%
            </p>
            <div className="w-full bg-slate-600 rounded-full h-1 mt-2">
              <div
                className="bg-cyan-500 h-1 rounded-full"
                style={{ width: `${metrics.resourceUsage.storage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <p className="text-xs text-slate-500 text-right">
          Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
}
