import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { parse } from 'url';
import { IncomingMessage } from 'http';

export interface WSMessage {
  type: 'policy_decision' | 'task_update' | 'metrics_update' | 'subscription_change' | 'error';
  data: any;
  timestamp: number;
  userId?: number;
}

export class QumusWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, Set<WebSocket>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/api/ws' });

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      const url = parse(req.url || '', true);
      const userId = url.query.userId as string;
      const sessionId = url.query.sessionId as string;

      if (!userId) {
        ws.close(1008, 'User ID required');
        return;
      }

      // Add client to tracking map
      const clientKey = `${userId}-${sessionId}`;
      if (!this.clients.has(userId)) {
        this.clients.set(userId, new Set());
      }
      this.clients.get(userId)!.add(ws);

      console.log(`[WebSocket] Client connected: ${clientKey}`);

      // Send welcome message
      this.send(ws, {
        type: 'subscription_change',
        data: { status: 'connected', message: 'WebSocket connected successfully' },
        timestamp: Date.now(),
      });

      // Handle incoming messages
      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, userId, message);
        } catch (error) {
          console.error('[WebSocket] Message parse error:', error);
          this.send(ws, {
            type: 'error',
            data: { error: 'Invalid message format' },
            timestamp: Date.now(),
          });
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        const userClients = this.clients.get(userId);
        if (userClients) {
          userClients.delete(ws);
          if (userClients.size === 0) {
            this.clients.delete(userId);
          }
        }
        console.log(`[WebSocket] Client disconnected: ${clientKey}`);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('[WebSocket] Client error:', error);
      });
    });

    console.log('[WebSocket] Server initialized on /api/ws');
  }

  /**
   * Send message to specific WebSocket
   */
  private send(ws: WebSocket, message: WSMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Broadcast message to all clients for a user
   */
  broadcastToUser(userId: number, message: WSMessage): void {
    const userClients = this.clients.get(userId.toString());
    if (userClients) {
      userClients.forEach((client) => {
        this.send(client, message);
      });
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcastToAll(message: WSMessage): void {
    this.clients.forEach((userClients) => {
      userClients.forEach((client) => {
        this.send(client, message);
      });
    });
  }

  /**
   * Send policy decision update
   */
  sendPolicyDecision(userId: number, decision: any): void {
    this.broadcastToUser(userId, {
      type: 'policy_decision',
      data: decision,
      timestamp: Date.now(),
      userId,
    });
  }

  /**
   * Send task execution update
   */
  sendTaskUpdate(userId: number, taskUpdate: any): void {
    this.broadcastToUser(userId, {
      type: 'task_update',
      data: taskUpdate,
      timestamp: Date.now(),
      userId,
    });
  }

  /**
   * Send metrics update
   */
  sendMetricsUpdate(userId: number, metrics: any): void {
    this.broadcastToUser(userId, {
      type: 'metrics_update',
      data: metrics,
      timestamp: Date.now(),
      userId,
    });
  }

  /**
   * Send subscription change notification
   */
  sendSubscriptionChange(userId: number, subscription: any): void {
    this.broadcastToUser(userId, {
      type: 'subscription_change',
      data: subscription,
      timestamp: Date.now(),
      userId,
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(ws: WebSocket, userId: string, message: any): void {
    console.log(`[WebSocket] Message from ${userId}:`, message.type);

    // Echo back for heartbeat/ping
    if (message.type === 'ping') {
      this.send(ws, {
        type: 'subscription_change',
        data: { type: 'pong' },
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Get connection stats
   */
  getStats(): { totalUsers: number; totalConnections: number } {
    let totalConnections = 0;
    this.clients.forEach((userClients) => {
      totalConnections += userClients.size;
    });

    return {
      totalUsers: this.clients.size,
      totalConnections,
    };
  }

  /**
   * Close all connections
   */
  close(): void {
    this.wss.close();
    this.clients.clear();
  }
}

// Export singleton instance
let wsServer: QumusWebSocketServer | null = null;

export function initializeWebSocketServer(server: Server): QumusWebSocketServer {
  if (!wsServer) {
    wsServer = new QumusWebSocketServer(server);
  }
  return wsServer;
}

export function getWebSocketServer(): QumusWebSocketServer | null {
  return wsServer;
}
