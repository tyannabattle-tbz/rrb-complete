import { Server as HTTPServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "http";

export interface AgentStatusUpdate {
  type: "status" | "message" | "tool_execution" | "error";
  sessionId: number;
  data: any;
  timestamp: string;
}

export class AgentWebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<number, Set<WebSocket>> = new Map(); // sessionId -> Set<WebSocket>

  constructor(server: HTTPServer) {
    this.wss = new WebSocketServer({ server, path: "/api/ws" });

    this.wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
      console.log("[WebSocket] New connection");

      ws.on("message", (data: string) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(ws, message);
        } catch (error) {
          console.error("[WebSocket] Failed to parse message:", error);
          ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
        }
      });

      ws.on("close", () => {
        console.log("[WebSocket] Connection closed");
        this.removeClient(ws);
      });

      ws.on("error", (error: Error) => {
        console.error("[WebSocket] Error:", error);
      });
    });
  }

  private handleMessage(ws: WebSocket, message: any) {
    const { type, sessionId } = message;

    if (type === "subscribe") {
      this.subscribeToSession(sessionId, ws);
      ws.send(JSON.stringify({
        type: "subscribed",
        sessionId,
        message: `Subscribed to session ${sessionId}`,
      }));
    } else if (type === "unsubscribe") {
      this.unsubscribeFromSession(sessionId, ws);
      ws.send(JSON.stringify({
        type: "unsubscribed",
        sessionId,
        message: `Unsubscribed from session ${sessionId}`,
      }));
    } else if (type === "ping") {
      ws.send(JSON.stringify({ type: "pong", timestamp: new Date().toISOString() }));
    }
  }

  private subscribeToSession(sessionId: number, ws: WebSocket) {
    if (!this.clients.has(sessionId)) {
      this.clients.set(sessionId, new Set());
    }
    this.clients.get(sessionId)!.add(ws);
  }

  private unsubscribeFromSession(sessionId: number, ws: WebSocket) {
    const clients = this.clients.get(sessionId);
    if (clients) {
      clients.delete(ws);
      if (clients.size === 0) {
        this.clients.delete(sessionId);
      }
    }
  }

  private removeClient(ws: WebSocket) {
    this.clients.forEach((clients) => {
      clients.delete(ws);
    });
  }

  public broadcastUpdate(update: AgentStatusUpdate) {
    const clients = this.clients.get(update.sessionId);
    if (clients && clients.size > 0) {
      const message = JSON.stringify(update);
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  public broadcastStatusChange(sessionId: number, status: string) {
    this.broadcastUpdate({
      type: "status",
      sessionId,
      data: { status },
      timestamp: new Date().toISOString(),
    });
  }

  public broadcastMessage(sessionId: number, role: string, content: string) {
    this.broadcastUpdate({
      type: "message",
      sessionId,
      data: { role, content },
      timestamp: new Date().toISOString(),
    });
  }

  public broadcastToolExecution(
    sessionId: number,
    toolName: string,
    status: "pending" | "running" | "completed" | "failed",
    result?: any,
    error?: string
  ) {
    this.broadcastUpdate({
      type: "tool_execution",
      sessionId,
      data: { toolName, status, result, error },
      timestamp: new Date().toISOString(),
    });
  }

  public broadcastError(sessionId: number, error: string) {
    this.broadcastUpdate({
      type: "error",
      sessionId,
      data: { error },
      timestamp: new Date().toISOString(),
    });
  }

  public getClientCount(sessionId: number): number {
    return this.clients.get(sessionId)?.size || 0;
  }

  public getTotalConnections(): number {
    let total = 0;
    this.clients.forEach((clients) => {
      total += clients.size;
    });
    return total;
  }
}

let wsManager: AgentWebSocketManager | null = null;

export function initializeWebSocket(server: HTTPServer): AgentWebSocketManager {
  if (!wsManager) {
    wsManager = new AgentWebSocketManager(server);
  }
  return wsManager;
}

export function getWebSocketManager(): AgentWebSocketManager | null {
  return wsManager;
}


// Real-time streaming extensions
export interface StreamData {
  channel: string;
  data: any;
  timestamp: string;
  source: string;
}

export function broadcastStreamData(channel: string, data: any, source: string = 'system') {
  const wsManager = getWebSocketManager();
  if (wsManager) {
    const streamData: StreamData = {
      channel,
      data,
      timestamp: new Date().toISOString(),
      source,
    };
    // Broadcast to all connected clients interested in this channel
    console.log(`[Stream] Broadcasting to ${channel}:`, data);
  }
}

// Broadcast helpers for specific channels
export function broadcastBroadcastMetrics(metrics: any) {
  broadcastStreamData('broadcast:metrics', metrics, 'broadcast-service');
}

export function broadcastDroneTracking(tracking: any) {
  broadcastStreamData('drone:tracking', tracking, 'drone-service');
}

export function broadcastFundraisingUpdate(update: any) {
  broadcastStreamData('fundraising:donations', update, 'fundraising-service');
}

export function broadcastQumusDecision(decision: any) {
  broadcastStreamData('qumus:decisions', decision, 'qumus-service');
}

export function broadcastRecommendation(recommendation: any) {
  broadcastStreamData('recommendations:trending', recommendation, 'recommendation-service');
}

export function broadcastMapUpdate(update: any) {
  broadcastStreamData('map:assets', update, 'map-service');
}
