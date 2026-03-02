/**
 * Metrics Streaming Service
 * Handles WebSocket connections for real-time metrics and autonomous decision updates
 */

export interface MetricsUpdate {
  entityId: string;
  timestamp: number;
  cpuUsage: number;
  memoryUsage: number;
  requestsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
}

export interface DecisionUpdate {
  id: string;
  entityId: string;
  domain: string;
  decision: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'executed' | 'approved' | 'rejected';
  timestamp: number;
}

export interface ScalingUpdate {
  id: string;
  entityId: string;
  type: 'scale_up' | 'scale_down' | 'cache_optimization' | 'query_optimization' | 'load_balancing';
  result: 'success' | 'pending' | 'failed';
  timestamp: number;
}

type MetricsCallback = (metrics: MetricsUpdate) => void;
type DecisionCallback = (decision: DecisionUpdate) => void;
type ScalingCallback = (scaling: ScalingUpdate) => void;

class MetricsStreamingService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private isConnecting = false;

  private metricsCallbacks: Map<string, MetricsCallback[]> = new Map();
  private decisionCallbacks: Map<string, DecisionCallback[]> = new Map();
  private scalingCallbacks: Map<string, ScalingCallback[]> = new Map();

  constructor() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.url = `${protocol}//${window.location.host}/api/metrics-stream`;
  }

  /**
   * Connect to metrics streaming WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('[Metrics Stream] Connected to server');
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('[Metrics Stream] Failed to parse message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[Metrics Stream] WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[Metrics Stream] Connection closed');
          this.isConnecting = false;
          this.attemptReconnect();
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Handle incoming messages from server
   */
  private handleMessage(data: any): void {
    const { type, payload } = data;

    switch (type) {
      case 'metrics':
        this.emitMetricsUpdate(payload);
        break;
      case 'decision':
        this.emitDecisionUpdate(payload);
        break;
      case 'scaling':
        this.emitScalingUpdate(payload);
        break;
      default:
        console.warn('[Metrics Stream] Unknown message type:', type);
    }
  }

  /**
   * Subscribe to metrics updates for an entity
   */
  onMetricsUpdate(entityId: string, callback: MetricsCallback): () => void {
    if (!this.metricsCallbacks.has(entityId)) {
      this.metricsCallbacks.set(entityId, []);
    }
    this.metricsCallbacks.get(entityId)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.metricsCallbacks.get(entityId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Subscribe to decision updates for an entity
   */
  onDecisionUpdate(entityId: string, callback: DecisionCallback): () => void {
    if (!this.decisionCallbacks.has(entityId)) {
      this.decisionCallbacks.set(entityId, []);
    }
    this.decisionCallbacks.get(entityId)!.push(callback);

    return () => {
      const callbacks = this.decisionCallbacks.get(entityId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Subscribe to scaling updates for an entity
   */
  onScalingUpdate(entityId: string, callback: ScalingCallback): () => void {
    if (!this.scalingCallbacks.has(entityId)) {
      this.scalingCallbacks.set(entityId, []);
    }
    this.scalingCallbacks.get(entityId)!.push(callback);

    return () => {
      const callbacks = this.scalingCallbacks.get(entityId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Emit metrics update to all subscribers
   */
  private emitMetricsUpdate(metrics: MetricsUpdate): void {
    const callbacks = this.metricsCallbacks.get(metrics.entityId) || [];
    callbacks.forEach(callback => {
      try {
        callback(metrics);
      } catch (error) {
        console.error('[Metrics Stream] Error in metrics callback:', error);
      }
    });
  }

  /**
   * Emit decision update to all subscribers
   */
  private emitDecisionUpdate(decision: DecisionUpdate): void {
    const callbacks = this.decisionCallbacks.get(decision.entityId) || [];
    callbacks.forEach(callback => {
      try {
        callback(decision);
      } catch (error) {
        console.error('[Metrics Stream] Error in decision callback:', error);
      }
    });
  }

  /**
   * Emit scaling update to all subscribers
   */
  private emitScalingUpdate(scaling: ScalingUpdate): void {
    const callbacks = this.scalingCallbacks.get(scaling.entityId) || [];
    callbacks.forEach(callback => {
      try {
        callback(scaling);
      } catch (error) {
        console.error('[Metrics Stream] Error in scaling callback:', error);
      }
    });
  }

  /**
   * Attempt to reconnect to WebSocket
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[Metrics Stream] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[Metrics Stream] Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('[Metrics Stream] Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Send message to server
   */
  send(type: string, payload: any): void {
    if (!this.isConnected()) {
      console.warn('[Metrics Stream] WebSocket not connected');
      return;
    }

    try {
      this.ws!.send(JSON.stringify({ type, payload }));
    } catch (error) {
      console.error('[Metrics Stream] Failed to send message:', error);
    }
  }
}

// Export singleton instance
export const metricsStreamingService = new MetricsStreamingService();

/**
 * React hook for using metrics streaming
 */
export function useMetricsStream(entityId: string) {
  const [isConnected, setIsConnected] = React.useState(false);
  const [metrics, setMetrics] = React.useState<MetricsUpdate | null>(null);
  const [decisions, setDecisions] = React.useState<DecisionUpdate[]>([]);
  const [scaling, setScaling] = React.useState<ScalingUpdate[]>([]);

  React.useEffect(() => {
    // Connect to streaming service
    metricsStreamingService.connect()
      .then(() => setIsConnected(true))
      .catch(error => console.error('Failed to connect to metrics stream:', error));

    // Subscribe to updates
    const unsubscribeMetrics = metricsStreamingService.onMetricsUpdate(entityId, (update) => {
      setMetrics(update);
    });

    const unsubscribeDecisions = metricsStreamingService.onDecisionUpdate(entityId, (update) => {
      setDecisions(prev => [update, ...prev].slice(0, 50)); // Keep last 50
    });

    const unsubscribeScaling = metricsStreamingService.onScalingUpdate(entityId, (update) => {
      setScaling(prev => [update, ...prev].slice(0, 50)); // Keep last 50
    });

    // Cleanup
    return () => {
      unsubscribeMetrics();
      unsubscribeDecisions();
      unsubscribeScaling();
    };
  }, [entityId]);

  return {
    isConnected,
    metrics,
    decisions,
    scaling,
  };
}

// Import React at the top for the hook
import React from 'react';
