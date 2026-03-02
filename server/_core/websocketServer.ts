import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

interface WebSocketMessage {
  type: "presence" | "typing" | "message" | "cursor" | "subscribe" | "unsubscribe";
  sessionId?: number;
  userId?: number;
  data?: any;
  timestamp?: number;
}

interface ActiveUser {
  userId: number;
  sessionId: number;
  isTyping: boolean;
  lastActive: number;
  cursorPosition?: { x: number; y: number };
}

class WebSocketManager {
  private wss: WebSocketServer;
  private activeUsers: Map<string, ActiveUser> = new Map();
  private sessionSubscribers: Map<number, Set<WebSocket>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupConnections();
  }

  private setupConnections() {
    this.wss.on("connection", (ws: WebSocket) => {
      console.log("[WebSocket] New client connected");

      ws.on("message", (data: string) => {
        try {
          const message: WebSocketMessage = JSON.parse(data);
          this.handleMessage(ws, message);
        } catch (error) {
          console.error("[WebSocket] Error parsing message:", error);
        }
      });

      ws.on("close", () => {
        console.log("[WebSocket] Client disconnected");
        this.removeUser(ws);
      });

      ws.on("error", (error) => {
        console.error("[WebSocket] Error:", error);
      });
    });
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage) {
    switch (message.type) {
      case "subscribe":
        this.subscribeToSession(ws, message.sessionId || 0, message.userId || 0);
        break;
      case "unsubscribe":
        this.unsubscribeFromSession(ws, message.sessionId || 0);
        break;
      case "presence":
        this.broadcastPresence(message);
        break;
      case "typing":
        this.broadcastTyping(message);
        break;
      case "cursor":
        this.broadcastCursor(message);
        break;
      case "message":
        this.broadcastMessage(message);
        break;
    }
  }

  private subscribeToSession(ws: WebSocket, sessionId: number, userId: number) {
    const key = `${userId}-${sessionId}`;
    this.activeUsers.set(key, {
      userId,
      sessionId,
      isTyping: false,
      lastActive: Date.now(),
    });

    if (!this.sessionSubscribers.has(sessionId)) {
      this.sessionSubscribers.set(sessionId, new Set());
    }
    this.sessionSubscribers.get(sessionId)!.add(ws);

    // Send confirmation
    ws.send(
      JSON.stringify({
        type: "subscribed",
        sessionId,
        timestamp: Date.now(),
      })
    );

    // Broadcast presence to all subscribers
    this.broadcastToSession(sessionId, {
      type: "user_joined",
      userId,
      timestamp: Date.now(),
    });
  }

  private unsubscribeFromSession(ws: WebSocket, sessionId: number) {
    const subscribers = this.sessionSubscribers.get(sessionId);
    if (subscribers) {
      subscribers.delete(ws);
      if (subscribers.size === 0) {
        this.sessionSubscribers.delete(sessionId);
      }
    }
  }

  private broadcastPresence(message: WebSocketMessage) {
    if (!message.sessionId) return;
    this.broadcastToSession(message.sessionId, {
      type: "presence_update",
      userId: message.userId,
      data: message.data,
      timestamp: Date.now(),
    });
  }

  private broadcastTyping(message: WebSocketMessage) {
    if (!message.sessionId) return;
    const key = `${message.userId}-${message.sessionId}`;
    const user = this.activeUsers.get(key);
    if (user) {
      user.isTyping = message.data?.isTyping || false;
    }
    this.broadcastToSession(message.sessionId, {
      type: "typing_update",
      userId: message.userId,
      isTyping: message.data?.isTyping,
      timestamp: Date.now(),
    });
  }

  private broadcastCursor(message: WebSocketMessage) {
    if (!message.sessionId) return;
    this.broadcastToSession(message.sessionId, {
      type: "cursor_update",
      userId: message.userId,
      position: message.data?.position,
      timestamp: Date.now(),
    });
  }

  private broadcastMessage(message: WebSocketMessage) {
    if (!message.sessionId) return;
    this.broadcastToSession(message.sessionId, {
      type: "new_message",
      userId: message.userId,
      content: message.data?.content,
      timestamp: Date.now(),
    });
  }

  private broadcastToSession(sessionId: number, data: any) {
    const subscribers = this.sessionSubscribers.get(sessionId);
    if (!subscribers) return;

    const payload = JSON.stringify(data);
    subscribers.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    });
  }

  private removeUser(ws: WebSocket) {
    // Find and remove user from active users
    const keysToDelete: string[] = [];
    this.activeUsers.forEach((user, key) => {
      const subscribers = this.sessionSubscribers.get(user.sessionId);
      if (subscribers?.has(ws)) {
        subscribers.delete(ws);
        keysToDelete.push(key);
        this.broadcastToSession(user.sessionId, {
          type: "user_left",
          userId: user.userId,
          timestamp: Date.now(),
        });
      }
    });
    keysToDelete.forEach((key) => this.activeUsers.delete(key));
  }

  public getActiveUsers(sessionId: number): ActiveUser[] {
    const users: ActiveUser[] = [];
    this.activeUsers.forEach((user) => {
      if (user.sessionId === sessionId) {
        users.push(user);
      }
    });
    return users;
  }
}

let wsManager: WebSocketManager | null = null;

export function initializeWebSocketServer(server: Server) {
  if (!wsManager) {
    wsManager = new WebSocketManager(server);
    console.log("[WebSocket] Manager initialized");
  }
  return wsManager;
}

export function getWebSocketManager() {
  return wsManager;
}
