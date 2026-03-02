/**
 * WebSocket Service for Real-Time Mesh Network Synchronization
 * Handles live node updates, topology changes, and network metrics
 */

export interface MeshNode {
  id: number;
  sector: number;
  x: number;
  y: number;
  active: boolean;
  signalStrength: number;
  latency: number;
  bandwidth: number;
  status: 'online' | 'degraded' | 'offline';
  lastUpdate: number;
}

export interface NetworkMetrics {
  totalNodes: number;
  activeNodes: number;
  avgLatency: number;
  avgBandwidth: number;
  networkHealth: number;
  timestamp: number;
}

export interface WebSocketMessage {
  type: 'node_update' | 'metrics_update' | 'topology_change' | 'alert' | 'ping' | 'pong';
  data: any;
  timestamp: number;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private messageQueue: WebSocketMessage[] = [];
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(url: string = 'ws://localhost:3001') {
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
          console.log('[WebSocket] Connected to mesh network');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.flushMessageQueue();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Connection error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[WebSocket] Connection closed');
          this.stopHeartbeat();
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
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
   * Send message to server
   */
  send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for later delivery
      this.messageQueue.push(message);
    }
  }

  /**
   * Subscribe to message type
   */
  on(type: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(type)?.delete(callback);
    };
  }

  /**
   * Emit event to all listeners
   */
  private emit(type: string, data: any): void {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[WebSocket] Error in listener for ${type}:`, error);
        }
      });
    }
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'node_update':
        this.emit('node_update', message.data as MeshNode);
        break;
      case 'metrics_update':
        this.emit('metrics_update', message.data as NetworkMetrics);
        break;
      case 'topology_change':
        this.emit('topology_change', message.data);
        break;
      case 'alert':
        this.emit('alert', message.data);
        break;
      case 'pong':
        this.emit('pong', message.data);
        break;
      default:
        console.warn('[WebSocket] Unknown message type:', message.type);
    }
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.send({
        type: 'ping',
        data: { timestamp: Date.now() },
        timestamp: Date.now(),
      });
    }, 30000); // Every 30 seconds
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
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch((error) => {
          console.error('[WebSocket] Reconnection failed:', error);
        });
      }, delay);
    } else {
      console.error('[WebSocket] Max reconnection attempts reached');
      this.emit('connection_failed', { reason: 'Max reconnection attempts reached' });
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Request node update
   */
  requestNodeUpdate(nodeId: number): void {
    this.send({
      type: 'node_update',
      data: { nodeId, action: 'request' },
      timestamp: Date.now(),
    });
  }

  /**
   * Request metrics update
   */
  requestMetricsUpdate(): void {
    this.send({
      type: 'metrics_update',
      data: { action: 'request' },
      timestamp: Date.now(),
    });
  }

  /**
   * Request topology update
   */
  requestTopologyUpdate(): void {
    this.send({
      type: 'topology_change',
      data: { action: 'request' },
      timestamp: Date.now(),
    });
  }

  /**
   * Send alert
   */
  sendAlert(severity: 'critical' | 'high' | 'medium' | 'low', message: string): void {
    this.send({
      type: 'alert',
      data: { severity, message },
      timestamp: Date.now(),
    });
  }
}

// Singleton instance
let wsServiceInstance: WebSocketService | null = null;

export function getWebSocketService(url?: string): WebSocketService {
  if (!wsServiceInstance) {
    wsServiceInstance = new WebSocketService(url);
  }
  return wsServiceInstance;
}

export default WebSocketService;
