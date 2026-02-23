import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

/**
 * Real-Time Service using Socket.io
 * Handles WebSocket connections for live updates
 */

export interface RealtimeClient {
  id: string;
  userId: string;
  role: 'listener' | 'operator' | 'admin';
  connectedAt: Date;
}

export interface CallQueueUpdate {
  callId: string;
  callerId: string;
  callerName: string;
  queuePosition: number;
  estimatedWaitTime: number;
  status: 'queued' | 'ringing' | 'connected' | 'ended';
}

export interface ListenerUpdate {
  totalListeners: number;
  activeListeners: number;
  timestamp: Date;
}

export interface EmergencyBroadcastUpdate {
  broadcastId: string;
  type: 'weather' | 'public_safety' | 'health' | 'critical';
  title: string;
  message: string;
  regions: string[];
  deliveryRate: number;
  recipients: number;
  createdAt: Date;
}

class RealtimeService {
  private io: SocketIOServer | null = null;
  private clients: Map<string, RealtimeClient> = new Map();
  private callQueue: CallQueueUpdate[] = [];
  private listenerMetrics: ListenerUpdate = {
    totalListeners: 0,
    activeListeners: 0,
    timestamp: new Date(),
  };

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    this.setupEventHandlers();
    console.log('[Realtime] WebSocket server initialized');
  }

  /**
   * Setup Socket.io event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      console.log(`[Realtime] Client connected: ${socket.id}`);

      // Client authentication and registration
      socket.on('register', (data: { userId: string; role: string }) => {
        const client: RealtimeClient = {
          id: socket.id,
          userId: data.userId,
          role: data.role as 'listener' | 'operator' | 'admin',
          connectedAt: new Date(),
        };

        this.clients.set(socket.id, client);

        // Join role-specific rooms
        socket.join(`role:${client.role}`);
        socket.join(`user:${client.userId}`);

        console.log(`[Realtime] Client registered: ${client.userId} (${client.role})`);

        // Send initial state
        socket.emit('initial_state', {
          callQueue: this.callQueue,
          listenerMetrics: this.listenerMetrics,
        });
      });

      // Call queue updates
      socket.on('call_queued', (data: CallQueueUpdate) => {
        this.updateCallQueue(data);
        this.broadcastCallQueueUpdate(data);
      });

      socket.on('call_status_changed', (data: CallQueueUpdate) => {
        this.updateCallQueue(data);
        this.broadcastCallQueueUpdate(data);
      });

      // Listener metrics
      socket.on('listener_count_update', (data: { count: number }) => {
        this.updateListenerMetrics(data.count);
        this.broadcastListenerUpdate();
      });

      // Emergency broadcast
      socket.on('emergency_broadcast', (data: EmergencyBroadcastUpdate) => {
        this.broadcastEmergencyAlert(data);
      });

      // Disconnect
      socket.on('disconnect', () => {
        this.clients.delete(socket.id);
        console.log(`[Realtime] Client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Update call queue
   */
  private updateCallQueue(update: CallQueueUpdate): void {
    const index = this.callQueue.findIndex(c => c.callId === update.callId);

    if (index >= 0) {
      this.callQueue[index] = update;
    } else {
      this.callQueue.push(update);
    }

    // Remove ended calls
    this.callQueue = this.callQueue.filter(c => c.status !== 'ended');
  }

  /**
   * Broadcast call queue update
   */
  private broadcastCallQueueUpdate(update: CallQueueUpdate): void {
    if (!this.io) return;

    // Send to all operators and admins
    this.io.to('role:operator').emit('call_queue_update', update);
    this.io.to('role:admin').emit('call_queue_update', update);

    // Send to specific caller
    this.io.to(`user:${update.callerId}`).emit('queue_position_update', {
      queuePosition: update.queuePosition,
      estimatedWaitTime: update.estimatedWaitTime,
      status: update.status,
    });
  }

  /**
   * Update listener metrics
   */
  private updateListenerMetrics(count: number): void {
    this.listenerMetrics = {
      totalListeners: count,
      activeListeners: count,
      timestamp: new Date(),
    };
  }

  /**
   * Broadcast listener update
   */
  private broadcastListenerUpdate(): void {
    if (!this.io) return;

    this.io.emit('listener_update', this.listenerMetrics);
  }

  /**
   * Broadcast emergency alert
   */
  private broadcastEmergencyAlert(broadcast: EmergencyBroadcastUpdate): void {
    if (!this.io) return;

    // Broadcast to all connected clients
    this.io.emit('emergency_broadcast', broadcast);

    // Also send to specific regions
    for (const region of broadcast.regions) {
      this.io.to(`region:${region}`).emit('emergency_broadcast', broadcast);
    }

    console.log(`[Realtime] Emergency broadcast sent: ${broadcast.title}`);
  }

  /**
   * Send notification to specific user
   */
  sendToUser(userId: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Send notification to role
   */
  sendToRole(role: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(`role:${role}`).emit(event, data);
  }

  /**
   * Get current call queue
   */
  getCallQueue(): CallQueueUpdate[] {
    return [...this.callQueue];
  }

  /**
   * Get listener metrics
   */
  getListenerMetrics(): ListenerUpdate {
    return { ...this.listenerMetrics };
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(): number {
    return this.clients.size;
  }

  /**
   * Get clients by role
   */
  getClientsByRole(role: string): RealtimeClient[] {
    return Array.from(this.clients.values()).filter(c => c.role === role);
  }
}

export const realtimeService = new RealtimeService();
