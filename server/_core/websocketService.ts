import { WebSocketServer } from 'ws';
import { Server } from 'http';

export interface RealtimeUpdate {
  type: 'policy_decision' | 'service_alert' | 'override_request' | 'analytics_update';
  data: any;
  timestamp: number;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private clients = new Set<any>();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupConnections();
  }

  private setupConnections() {
    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      console.log(`WebSocket client connected. Total clients: ${this.clients.size}`);

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`WebSocket client disconnected. Total clients: ${this.clients.size}`);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }

  broadcast(update: RealtimeUpdate) {
    const message = JSON.stringify(update);
    this.clients.forEach((client) => {
      if (client.readyState === 1) { // OPEN
        client.send(message);
      }
    });
  }

  broadcastPolicyDecision(decision: any) {
    this.broadcast({
      type: 'policy_decision',
      data: decision,
      timestamp: Date.now(),
    });
  }

  broadcastServiceAlert(alert: any) {
    this.broadcast({
      type: 'service_alert',
      data: alert,
      timestamp: Date.now(),
    });
  }

  broadcastOverrideRequest(request: any) {
    this.broadcast({
      type: 'override_request',
      data: request,
      timestamp: Date.now(),
    });
  }

  broadcastAnalyticsUpdate(analytics: any) {
    this.broadcast({
      type: 'analytics_update',
      data: analytics,
      timestamp: Date.now(),
    });
  }

  getClientCount() {
    return this.clients.size;
  }

  close() {
    this.wss.close();
  }
}

// Global instance
let wsService: WebSocketService | null = null;

export function initializeWebSocketService(server: Server) {
  wsService = new WebSocketService(server);
  return wsService;
}

export function getWebSocketService() {
  return wsService;
}
