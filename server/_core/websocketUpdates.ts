import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { getRedis } from './redis';

export interface RealtimeUpdate {
  type: 'policy-decision' | 'metrics-update' | 'compliance-alert' | 'subscription-change';
  decisionId: string;
  userId: string;
  timestamp: number;
  data: Record<string, any>;
}

export class WebSocketManager {
  private io: SocketIOServer;
  private userSockets: Map<string, Set<string>> = new Map();
  private redis = getRedis();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    this.setupConnectionHandlers();
    this.setupRedisSubscriptions();
  }

  private setupConnectionHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[WebSocket] Client connected: ${socket.id}`);

      socket.on('authenticate', (userId: string) => {
        if (!this.userSockets.has(userId)) {
          this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId)!.add(socket.id);
        socket.data.userId = userId;
        console.log(`[WebSocket] User ${userId} authenticated with socket ${socket.id}`);
      });

      socket.on('subscribe-metrics', () => {
        socket.join('metrics');
        console.log(`[WebSocket] Client ${socket.id} subscribed to metrics`);
      });

      socket.on('subscribe-compliance', () => {
        socket.join('compliance');
        console.log(`[WebSocket] Client ${socket.id} subscribed to compliance`);
      });

      socket.on('subscribe-policies', () => {
        socket.join('policies');
        console.log(`[WebSocket] Client ${socket.id} subscribed to policies`);
      });

      socket.on('disconnect', () => {
        const userId = socket.data.userId;
        if (userId) {
          const userSockets = this.userSockets.get(userId);
          if (userSockets) {
            userSockets.delete(socket.id);
            if (userSockets.size === 0) {
              this.userSockets.delete(userId);
            }
          }
        }
        console.log(`[WebSocket] Client disconnected: ${socket.id}`);
      });
    });
  }

  private setupRedisSubscriptions() {
    const subscriber = this.redis.duplicate();
    subscriber.subscribe('qumus:updates').then(() => {
      subscriber.on('message', (channel: string, message: string) => {
        if (channel === 'qumus:updates') {
          try {
            const update: RealtimeUpdate = JSON.parse(message);
            this.broadcastUpdate(update);
          } catch (error) {
            console.error('[WebSocket] Failed to parse Redis message:', error);
          }
        }
      });
    }).catch((error: any) => {
      console.error('[WebSocket] Failed to subscribe to Redis:', error);
    });
  }

  public broadcastUpdate(update: RealtimeUpdate) {
    switch (update.type) {
      case 'policy-decision':
        this.io.to('policies').emit('policy-decision', update);
        this.notifyUser(update.userId, 'policy-decision', update);
        break;

      case 'metrics-update':
        this.io.to('metrics').emit('metrics-update', update);
        this.notifyUser(update.userId, 'metrics-update', update);
        break;

      case 'compliance-alert':
        this.io.to('compliance').emit('compliance-alert', update);
        this.notifyUser(update.userId, 'compliance-alert', update);
        break;

      case 'subscription-change':
        this.notifyUser(update.userId, 'subscription-change', update);
        break;
    }

    console.log(`[WebSocket] Broadcasted ${update.type} to relevant clients`);
  }

  private notifyUser(userId: string, event: string, data: any) {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.forEach(socketId => {
        this.io.to(socketId).emit(event, data);
      });
    }
  }

  public async publishUpdate(update: RealtimeUpdate) {
    try {
      await this.redis.publish('qumus:updates', JSON.stringify(update));
      console.log(`[WebSocket] Published ${update.type} to Redis channel`);
    } catch (error) {
      console.error('[WebSocket] Failed to publish update to Redis:', error);
    }
  }

  public getConnectedUsers(): number {
    return this.userSockets.size;
  }

  public getConnectedSockets(): number {
    return this.io.engine.clientsCount;
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

let wsManager: WebSocketManager | null = null;

export function initializeWebSocket(httpServer: HTTPServer): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager(httpServer);
  }
  return wsManager;
}

export function getWebSocketManager(): WebSocketManager {
  if (!wsManager) {
    throw new Error('WebSocket manager not initialized');
  }
  return wsManager;
}
