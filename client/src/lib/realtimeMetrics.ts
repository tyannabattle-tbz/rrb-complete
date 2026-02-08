/**
 * Real-time metrics service for QUMUS
 * Handles WebSocket connections and metric updates
 */

export interface BroadcastMetrics {
  totalBroadcasts: number;
  activeBroadcasts: number;
  completedBroadcasts: number;
  totalViewers: number;
  avgViewersPerBroadcast: number;
  peakViewers: number;
  totalDuration: number;
  avgDuration: number;
}

export interface ViewerMetrics {
  currentViewers: number;
  peakViewers: number;
  avgViewerDuration: number;
  geolocation: Record<string, number>;
  deviceTypes: Record<string, number>;
  platforms: Record<string, number>;
}

export interface DecisionMetrics {
  totalDecisions: number;
  autonomousDecisions: number;
  approvedDecisions: number;
  rejectedDecisions: number;
  avgAutonomyLevel: number;
  decisionsByType: Record<string, number>;
}

export class RealtimeMetricsService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor(url: string = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`) {
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
          console.log('[RealtimeMetrics] Connected to WebSocket server');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[RealtimeMetrics] Error parsing message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[RealtimeMetrics] WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[RealtimeMetrics] WebSocket closed');
          this.attemptReconnect();
        };
      } catch (error) {
        console.error('[RealtimeMetrics] Connection error:', error);
        reject(error);
      }
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: any): void {
    const { type, data, timestamp } = message;

    // Emit event to all listeners
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener({ ...data, timestamp });
        } catch (error) {
          console.error(`[RealtimeMetrics] Error in listener for ${type}:`, error);
        }
      });
    }
  }

  /**
   * Subscribe to metric updates
   */
  subscribe(type: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    const listeners = this.listeners.get(type)!;
    listeners.add(callback);

    // Send subscription message
    this.send({
      type: `subscribe-${type.split('-')[0]}`,
      timestamp: Date.now(),
    });

    // Return unsubscribe function
    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.listeners.delete(type);
      }
    };
  }

  /**
   * Send message to WebSocket server
   */
  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('[RealtimeMetrics] WebSocket not connected');
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `[RealtimeMetrics] Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connect().catch((error) => {
          console.error('[RealtimeMetrics] Reconnection failed:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('[RealtimeMetrics] Max reconnection attempts reached');
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
    console.log('[RealtimeMetrics] Disconnected from WebSocket server');
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection status
   */
  getStatus(): string {
    if (!this.ws) return 'disconnected';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }
}

// Singleton instance
let metricsService: RealtimeMetricsService | null = null;

/**
 * Get or create metrics service
 */
export function getRealtimeMetricsService(): RealtimeMetricsService {
  if (!metricsService) {
    metricsService = new RealtimeMetricsService();
  }
  return metricsService;
}
