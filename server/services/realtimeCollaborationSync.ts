import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';

interface CollaborationEvent {
  type: 'edit' | 'comment' | 'playback' | 'cursor' | 'selection';
  projectId: string;
  userId: string;
  userName: string;
  timestamp: number;
  data: any;
}

interface ActiveUser {
  id: string;
  name: string;
  email: string;
  cursor?: { x: number; y: number };
  color: string;
}

export class RealtimeCollaborationSync extends EventEmitter {
  private wss: WebSocketServer | null = null;
  private projectConnections: Map<string, Set<WebSocket>> = new Map();
  private userColors: Map<string, string> = new Map();
  private activeUsers: Map<string, Map<string, ActiveUser>> = new Map();

  constructor(port?: number) {
    super();
    if (port) {
      this.wss = new WebSocketServer({ port });
      this.setupWebSocketServer();
    }
  }

  private setupWebSocketServer() {
    if (!this.wss) return;

    this.wss.on('connection', (ws: WebSocket) => {
      let projectId: string | null = null;
      let userId: string | null = null;
      let userName: string | null = null;

      ws.on('message', (message: string) => {
        try {
          const event: CollaborationEvent = JSON.parse(message);

          if (event.type === 'join') {
            projectId = event.projectId;
            userId = event.userId;
            userName = event.userName;

            this.handleUserJoin(projectId, userId, userName, ws);
          } else if (projectId && userId) {
            this.broadcastToProject(projectId, event, ws);
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        if (projectId && userId) {
          this.handleUserLeave(projectId, userId);
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  private handleUserJoin(projectId: string, userId: string, userName: string, ws: WebSocket) {
    // Add to project connections
    if (!this.projectConnections.has(projectId)) {
      this.projectConnections.set(projectId, new Set());
    }
    this.projectConnections.get(projectId)!.add(ws);

    // Assign color to user
    const color = this.generateUserColor();
    this.userColors.set(userId, color);

    // Track active users
    if (!this.activeUsers.has(projectId)) {
      this.activeUsers.set(projectId, new Map());
    }
    this.activeUsers.get(projectId)!.set(userId, {
      id: userId,
      name: userName,
      email: '', // Set from context
      color,
    });

    // Broadcast user joined
    this.broadcastToProject(projectId, {
      type: 'user-joined',
      projectId,
      userId,
      userName,
      data: { color, activeUsers: Array.from(this.activeUsers.get(projectId)!.values()) },
      timestamp: Date.now(),
    } as any);
  }

  private handleUserLeave(projectId: string, userId: string) {
    // Remove from active users
    const projectUsers = this.activeUsers.get(projectId);
    if (projectUsers) {
      projectUsers.delete(userId);
    }

    // Broadcast user left
    this.broadcastToProject(projectId, {
      type: 'user-left',
      projectId,
      userId,
      timestamp: Date.now(),
    } as any);
  }

  private broadcastToProject(projectId: string, event: CollaborationEvent, excludeWs?: WebSocket) {
    const connections = this.projectConnections.get(projectId);
    if (!connections) return;

    const message = JSON.stringify(event);
    connections.forEach((ws) => {
      if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  private generateUserColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A9DFBF',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // tRPC procedures
  async getActiveUsers(projectId: string): Promise<ActiveUser[]> {
    const users = this.activeUsers.get(projectId);
    return users ? Array.from(users.values()) : [];
  }

  async broadcastEdit(event: CollaborationEvent): Promise<void> {
    this.broadcastToProject(event.projectId, event);
  }

  async broadcastComment(projectId: string, userId: string, content: string): Promise<void> {
    this.broadcastToProject(projectId, {
      type: 'comment',
      projectId,
      userId,
      userName: '',
      timestamp: Date.now(),
      data: { content },
    });
  }

  async broadcastPlaybackPosition(projectId: string, userId: string, position: number): Promise<void> {
    this.broadcastToProject(projectId, {
      type: 'playback',
      projectId,
      userId,
      userName: '',
      timestamp: Date.now(),
      data: { position },
    });
  }

  async broadcastCursorPosition(projectId: string, userId: string, x: number, y: number): Promise<void> {
    const projectUsers = this.activeUsers.get(projectId);
    if (projectUsers && projectUsers.has(userId)) {
      const user = projectUsers.get(userId)!;
      user.cursor = { x, y };
    }

    this.broadcastToProject(projectId, {
      type: 'cursor',
      projectId,
      userId,
      userName: '',
      timestamp: Date.now(),
      data: { x, y },
    });
  }

  close(): void {
    if (this.wss) {
      this.wss.close();
    }
  }
}

// Export singleton instance
export const collaborationSync = new RealtimeCollaborationSync();
