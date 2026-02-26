import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

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

export interface WebSocketMessage {
  type: 'metrics' | 'command' | 'status' | 'error';
  data: any;
  timestamp: number;
}

class QumusWebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocket> = new Map();
  private metricsBuffer: Map<string, ARMetrics[]> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupConnections();
  }

  private setupConnections() {
    this.wss.on('connection', (ws: WebSocket, req) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, ws);

      console.log(`[WebSocket] Client connected: ${clientId}`);

      ws.on('message', (data: string) => {
        try {
          const message: WebSocketMessage = JSON.parse(data);
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error('[WebSocket] Message parse error:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`[WebSocket] Client disconnected: ${clientId}`);
      });

      ws.on('error', (error) => {
        console.error(`[WebSocket] Client error (${clientId}):`, error);
      });
    });
  }

  private handleMessage(clientId: string, message: WebSocketMessage) {
    switch (message.type) {
      case 'metrics':
        this.broadcastMetrics(message.data as ARMetrics);
        break;
      case 'command':
        this.handleCommand(clientId, message.data);
        break;
      case 'status':
        this.sendStatus(clientId);
        break;
      default:
        console.log('[WebSocket] Unknown message type:', message.type);
    }
  }

  public broadcastMetrics(metrics: ARMetrics) {
    const message: WebSocketMessage = {
      type: 'metrics',
      data: metrics,
      timestamp: Date.now(),
    };

    // Buffer metrics for late joiners
    if (!this.metricsBuffer.has(metrics.taskId)) {
      this.metricsBuffer.set(metrics.taskId, []);
    }
    this.metricsBuffer.get(metrics.taskId)!.push(metrics);

    // Keep only last 100 metrics per task
    const buffer = this.metricsBuffer.get(metrics.taskId)!;
    if (buffer.length > 100) {
      buffer.shift();
    }

    // Broadcast to all connected clients
    this.broadcast(message);
  }

  public broadcastCommand(command: any) {
    const message: WebSocketMessage = {
      type: 'command',
      data: command,
      timestamp: Date.now(),
    };
    this.broadcast(message);
  }

  private handleCommand(clientId: string, command: any) {
    console.log(`[WebSocket] Command from ${clientId}:`, command);
    // Process command and broadcast result
    this.broadcastCommand({
      ...command,
      status: 'executed',
      clientId,
    });
  }

  private sendStatus(clientId: string) {
    const ws = this.clients.get(clientId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: 'status',
        data: {
          connectedClients: this.clients.size,
          bufferedMetrics: this.metricsBuffer.size,
        },
        timestamp: Date.now(),
      };
      ws.send(JSON.stringify(message));
    }
  }

  private broadcast(message: WebSocketMessage) {
    const data = JSON.stringify(message);
    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  }

  private generateClientId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public getClientCount(): number {
    return this.clients.size;
  }

  public getMetricsBuffer(taskId: string): ARMetrics[] {
    return this.metricsBuffer.get(taskId) || [];
  }
}

export function initializeWebSocket(server: Server): QumusWebSocketManager {
  return new QumusWebSocketManager(server);
}

export default QumusWebSocketManager;
