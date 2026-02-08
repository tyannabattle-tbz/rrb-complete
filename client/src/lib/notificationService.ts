import { io, Socket } from 'socket.io-client';

export interface Notification {
  id: string;
  userId: string;
  decisionId: string;
  notificationType: 'approval_required' | 'decision_executed' | 'escalation_alert' | 'policy_violation' | 'threshold_breach';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: number;
  createdAt: Date;
  actionUrl?: string;
}

class NotificationService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  /**
   * Initialize WebSocket connection
   */
  connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host = window.location.host;
        const socketUrl = `${protocol}://${host}`;

        this.socket = io(socketUrl, {
          path: '/socket.io',
          reconnection: true,
          reconnectionDelay: this.reconnectDelay,
          reconnectionDelayMax: 10000,
          reconnectionAttempts: this.maxReconnectAttempts,
          query: {
            userId,
          },
        });

        this.socket.on('connect', () => {
          console.log('[NotificationService] Connected to WebSocket');
          this.reconnectAttempts = 0;
          this.emit('connected', { userId });
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('[NotificationService] Disconnected from WebSocket');
          this.emit('disconnected', {});
        });

        this.socket.on('notification', (notification: Notification) => {
          console.log('[NotificationService] Received notification:', notification);
          this.emit('notification', notification);
        });

        this.socket.on('decision_executed', (data: any) => {
          console.log('[NotificationService] Decision executed:', data);
          this.emit('decision_executed', data);
        });

        this.socket.on('approval_required', (data: any) => {
          console.log('[NotificationService] Approval required:', data);
          this.emit('approval_required', data);
        });

        this.socket.on('escalation_alert', (data: any) => {
          console.log('[NotificationService] Escalation alert:', data);
          this.emit('escalation_alert', data);
        });

        this.socket.on('policy_violation', (data: any) => {
          console.log('[NotificationService] Policy violation:', data);
          this.emit('policy_violation', data);
        });

        this.socket.on('threshold_breach', (data: any) => {
          console.log('[NotificationService] Threshold breach:', data);
          this.emit('threshold_breach', data);
        });

        this.socket.on('error', (error: any) => {
          console.error('[NotificationService] WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        });
      } catch (error) {
        console.error('[NotificationService] Connection failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Subscribe to notification events
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Unsubscribe from notification events
   */
  off(event: string, callback: Function): void {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[NotificationService] Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Send notification to server
   */
  sendNotification(notification: Partial<Notification>): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('send_notification', notification);
    } else {
      console.warn('[NotificationService] WebSocket not connected');
    }
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('mark_as_read', { notificationId });
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
