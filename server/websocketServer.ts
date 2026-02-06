import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { MeshNode, NetworkMetrics } from '../client/src/lib/websocketService';

interface ConnectedClient {
  id: string;
  userId: string;
  role: 'admin' | 'coordinator' | 'viewer';
  connectedAt: number;
  lastHeartbeat: number;
}

interface BroadcastSchedule {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  scheduledTime: number;
  timezone: string;
  recurring?: {
    pattern: 'daily' | 'weekly' | 'monthly';
    endDate?: number;
  };
  channels: string[];
  createdBy: string;
  createdAt: number;
  status: 'scheduled' | 'sent' | 'cancelled';
}

export class WebSocketServer {
  private io: SocketIOServer;
  private connectedClients: Map<string, ConnectedClient> = new Map();
  private meshNodes: Map<number, MeshNode> = new Map();
  private broadcastSchedules: Map<string, BroadcastSchedule> = new Map();
  private auditLog: Array<{
    timestamp: number;
    userId: string;
    action: string;
    details: any;
  }> = [];

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.initializeMeshNodes();
    this.startPeriodicUpdates();
  }

  private setupMiddleware() {
    this.io.use((socket, next) => {
      const userId = socket.handshake.auth.userId || 'anonymous';
      const role = socket.handshake.auth.role || 'viewer';

      if (!['admin', 'coordinator', 'viewer'].includes(role)) {
        return next(new Error('Invalid role'));
      }

      socket.data.userId = userId;
      socket.data.role = role;
      next();
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      const client: ConnectedClient = {
        id: socket.id,
        userId: socket.data.userId,
        role: socket.data.role,
        connectedAt: Date.now(),
        lastHeartbeat: Date.now(),
      };

      this.connectedClients.set(socket.id, client);
      console.log(`[WebSocket] Client connected: ${socket.id} (${client.userId}, ${client.role})`);

      // Send initial state
      socket.emit('initial_state', {
        nodes: Array.from(this.meshNodes.values()),
        metrics: this.getNetworkMetrics(),
        schedules: Array.from(this.broadcastSchedules.values()),
      });

      // Handle node ping
      socket.on('ping_node', (nodeId: number) => {
        this.logAudit(client.userId, 'ping_node', { nodeId });
        this.io.emit('node_pinged', { nodeId, timestamp: Date.now() });
      });

      // Handle request node update
      socket.on('request_node_update', (nodeId: number) => {
        const node = this.meshNodes.get(nodeId);
        if (node) {
          socket.emit('node_update', node);
        }
      });

      // Handle request metrics update
      socket.on('request_metrics_update', () => {
        socket.emit('metrics_update', this.getNetworkMetrics());
      });

      // Handle request topology update
      socket.on('request_topology_update', () => {
        socket.emit('topology_change', {
          nodes: Array.from(this.meshNodes.values()),
          timestamp: Date.now(),
        });
      });

      // Handle broadcast creation (admin/coordinator only)
      socket.on('create_broadcast', (data: any) => {
        if (!this.hasPermission(client.role, 'create_broadcast')) {
          socket.emit('error', { message: 'Insufficient permissions' });
          return;
        }

        this.logAudit(client.userId, 'create_broadcast', data);
        this.io.emit('broadcast_created', { ...data, createdBy: client.userId, createdAt: Date.now() });
      });

      // Handle broadcast scheduling (admin/coordinator only)
      socket.on('schedule_broadcast', (data: any) => {
        if (!this.hasPermission(client.role, 'schedule_broadcast')) {
          socket.emit('error', { message: 'Insufficient permissions' });
          return;
        }

        const schedule: BroadcastSchedule = {
          id: `schedule-${Date.now()}`,
          ...data,
          createdBy: client.userId,
          createdAt: Date.now(),
          status: 'scheduled',
        };

        this.broadcastSchedules.set(schedule.id, schedule);
        this.logAudit(client.userId, 'schedule_broadcast', schedule);
        this.io.emit('broadcast_scheduled', schedule);
      });

      // Handle alert
      socket.on('send_alert', (data: any) => {
        if (!this.hasPermission(client.role, 'send_alert')) {
          socket.emit('error', { message: 'Insufficient permissions' });
          return;
        }

        this.logAudit(client.userId, 'send_alert', data);
        this.io.emit('alert', { ...data, sentBy: client.userId, timestamp: Date.now() });
      });

      // Handle heartbeat
      socket.on('heartbeat', () => {
        const client = this.connectedClients.get(socket.id);
        if (client) {
          client.lastHeartbeat = Date.now();
        }
        socket.emit('heartbeat_ack', { timestamp: Date.now() });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        this.connectedClients.delete(socket.id);
        console.log(`[WebSocket] Client disconnected: ${socket.id}`);
      });
    });
  }

  private initializeMeshNodes() {
    // Initialize 64 mesh nodes
    for (let i = 0; i < 64; i++) {
      const node: MeshNode = {
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
      };
      this.meshNodes.set(i, node);
    }
  }

  private startPeriodicUpdates() {
    // Update node metrics every 2 seconds
    setInterval(() => {
      this.meshNodes.forEach((node) => {
        node.signalStrength = Math.max(0, Math.min(100, node.signalStrength + (Math.random() - 0.5) * 10));
        node.latency = Math.max(20, Math.min(150, node.latency + (Math.random() - 0.5) * 5));
        node.bandwidth = Math.max(50, Math.min(200, node.bandwidth + (Math.random() - 0.5) * 10));
        node.status = Math.random() > 0.95 ? 'degraded' : node.status;
        node.lastUpdate = Date.now();
      });

      this.io.emit('nodes_update', Array.from(this.meshNodes.values()));
    }, 2000);

    // Update metrics every 3 seconds
    setInterval(() => {
      this.io.emit('metrics_update', this.getNetworkMetrics());
    }, 3000);

    // Check scheduled broadcasts every minute
    setInterval(() => {
      const now = Date.now();
      this.broadcastSchedules.forEach((schedule) => {
        if (schedule.status === 'scheduled' && schedule.scheduledTime <= now) {
          schedule.status = 'sent';
          this.logAudit('system', 'broadcast_sent', schedule);
          this.io.emit('broadcast_sent', schedule);
        }
      });
    }, 60000);
  }

  private getNetworkMetrics(): NetworkMetrics {
    const nodes = Array.from(this.meshNodes.values());
    const activeNodes = nodes.filter((n) => n.active).length;
    const avgLatency = nodes.reduce((sum, n) => sum + n.latency, 0) / nodes.length;
    const avgBandwidth = nodes.reduce((sum, n) => sum + n.bandwidth, 0) / nodes.length;

    return {
      totalNodes: nodes.length,
      activeNodes,
      avgLatency: Math.round(avgLatency),
      avgBandwidth: Math.round(avgBandwidth * 10) / 10,
      networkHealth: Math.round((activeNodes / nodes.length) * 100 * 10) / 10,
      timestamp: Date.now(),
    };
  }

  private hasPermission(role: string, action: string): boolean {
    const permissions: Record<string, string[]> = {
      admin: ['create_broadcast', 'schedule_broadcast', 'send_alert', 'view_audit_log', 'manage_users'],
      coordinator: ['create_broadcast', 'schedule_broadcast', 'send_alert'],
      viewer: ['view_broadcasts', 'view_metrics'],
    };

    return permissions[role]?.includes(action) || false;
  }

  private logAudit(userId: string, action: string, details: any) {
    this.auditLog.push({
      timestamp: Date.now(),
      userId,
      action,
      details,
    });

    // Keep only last 10000 entries
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-10000);
    }

    // Emit audit log to admin clients
    this.io.to('admin').emit('audit_log_entry', {
      timestamp: Date.now(),
      userId,
      action,
      details,
    });
  }

  public getAuditLog(limit: number = 100): typeof this.auditLog {
    return this.auditLog.slice(-limit);
  }

  public getConnectedClients(): ConnectedClient[] {
    return Array.from(this.connectedClients.values());
  }

  public getBroadcastSchedules(): BroadcastSchedule[] {
    return Array.from(this.broadcastSchedules.values());
  }
}

export default WebSocketServer;
