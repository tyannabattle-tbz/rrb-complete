/**
 * WebSocket Integration for Real-time Updates
 * 
 * Handles WebSocket connections for live listener metrics, alert broadcasts,
 * and decision propagation updates
 */

export interface ListenerMetrics {
  currentListeners: number;
  totalPlays: number;
  avgEngagement: number;
  completionRate: number;
}

export interface WebSocketMessage {
  type: 'listener_update' | 'decision_made' | 'alert_broadcast' | 'content_generated' | 'heartbeat';
  data: any;
  timestamp: string;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.stopHeartbeat();
          this.attemptReconnect();
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Subscribe to WebSocket events
   */
  on(eventType: string, callback: (data: any) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)?.add(callback);
  }

  /**
   * Unsubscribe from WebSocket events
   */
  off(eventType: string, callback: (data: any) => void): void {
    this.listeners.get(eventType)?.delete(callback);
  }

  /**
   * Send message to WebSocket server
   */
  send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    const callbacks = this.listeners.get(message.type);
    if (callbacks) {
      callbacks.forEach((callback) => callback(message.data));
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({
          type: 'heartbeat',
          data: {},
          timestamp: new Date().toISOString(),
        });
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Attempt to reconnect to WebSocket server
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect().catch(console.error), this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
let wsClient: WebSocketClient | null = null;

export function getWebSocketClient(): WebSocketClient {
  if (!wsClient) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/api/ws`;
    wsClient = new WebSocketClient(url);
  }
  return wsClient;
}

export function useWebSocket() {
  const client = getWebSocketClient();

  const connect = async () => {
    if (!client.isConnected()) {
      await client.connect();
    }
  };

  const disconnect = () => {
    client.disconnect();
  };

  const on = (eventType: string, callback: (data: any) => void) => {
    client.on(eventType, callback);
  };

  const off = (eventType: string, callback: (data: any) => void) => {
    client.off(eventType, callback);
  };

  return { connect, disconnect, on, off, client };
}
