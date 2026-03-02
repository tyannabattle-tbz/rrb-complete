/**
 * Qumus WebSocket Manager - PRODUCTION READY
 * Real-time dashboard updates and event streaming
 * Handles task execution events, policy decisions, and system metrics
 */

import { EventEmitter } from 'events';

export interface WebSocketClient {
  id: string;
  userId: number;
  send: (message: any) => void;
}

export interface TaskEvent {
  taskId: string;
  eventType: 'submitted' | 'started' | 'step_completed' | 'completed' | 'failed' | 'requires_review';
  status: string;
  progress: number;
  timestamp: string;
  details?: any;
}

export interface PolicyDecisionEvent {
  taskId: string;
  policyName: string;
  decision: 'approved' | 'rejected' | 'requires_review';
  confidence: number;
  reasoning: string;
  timestamp: string;
}

export interface MetricsUpdate {
  activeTaskCount: number;
  queuedTaskCount: number;
  successRate: number;
  averageExecutionTime: number;
  totalTasksProcessed: number;
  failedTaskCount: number;
  timestamp: string;
}

class QumusWebSocketManager extends EventEmitter {
  private clients = new Map<string, WebSocketClient>();
  private taskSubscriptions = new Map<string, Set<string>>(); // taskId -> clientIds
  private userSubscriptions = new Map<number, Set<string>>(); // userId -> clientIds
  private metricsSubscribers = new Set<string>(); // clientIds subscribed to metrics

  /**
   * Register a WebSocket client
   */
  registerClient(client: WebSocketClient): void {
    this.clients.set(client.id, client);
    console.log(`[WebSocket] Client ${client.id} registered`);

    // Send initial connection message
    client.send({
      type: 'connection_established',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Unregister a WebSocket client
   */
  unregisterClient(clientId: string): void {
    this.clients.delete(clientId);

    // Remove from all subscriptions
    this.taskSubscriptions.forEach((subscribers) => {
      subscribers.delete(clientId);
    });

    this.userSubscriptions.forEach((subscribers) => {
      subscribers.delete(clientId);
    });

    this.metricsSubscribers.delete(clientId);

    console.log(`[WebSocket] Client ${clientId} unregistered`);
  }

  /**
   * Subscribe client to task events
   */
  subscribeToTask(clientId: string, taskId: string): void {
    if (!this.taskSubscriptions.has(taskId)) {
      this.taskSubscriptions.set(taskId, new Set());
    }
    this.taskSubscriptions.get(taskId)!.add(clientId);

    const client = this.clients.get(clientId);
    if (client) {
      client.send({
        type: 'subscription_confirmed',
        subscriptionType: 'task',
        taskId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Subscribe client to user events
   */
  subscribeToUser(clientId: string, userId: number): void {
    if (!this.userSubscriptions.has(userId)) {
      this.userSubscriptions.set(userId, new Set());
    }
    this.userSubscriptions.get(userId)!.add(clientId);

    const client = this.clients.get(clientId);
    if (client) {
      client.send({
        type: 'subscription_confirmed',
        subscriptionType: 'user',
        userId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Subscribe client to metrics updates
   */
  subscribeToMetrics(clientId: string): void {
    this.metricsSubscribers.add(clientId);

    const client = this.clients.get(clientId);
    if (client) {
      client.send({
        type: 'subscription_confirmed',
        subscriptionType: 'metrics',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Broadcast task event to subscribers
   */
  broadcastTaskEvent(event: TaskEvent): void {
    const subscribers = this.taskSubscriptions.get(event.taskId);
    if (!subscribers || subscribers.size === 0) return;

    const message = {
      type: 'task_event',
      event,
      timestamp: new Date().toISOString(),
    };

    subscribers.forEach((clientId) => {
      const client = this.clients.get(clientId);
      if (client) {
        try {
          client.send(message);
        } catch (error) {
          console.error(`[WebSocket] Error sending to client ${clientId}:`, error);
          this.unregisterClient(clientId);
        }
      }
    });
  }

  /**
   * Broadcast policy decision event
   */
  broadcastPolicyDecision(event: PolicyDecisionEvent): void {
    const subscribers = this.taskSubscriptions.get(event.taskId);
    if (!subscribers || subscribers.size === 0) return;

    const message = {
      type: 'policy_decision',
      event,
      timestamp: new Date().toISOString(),
    };

    subscribers.forEach((clientId) => {
      const client = this.clients.get(clientId);
      if (client) {
        try {
          client.send(message);
        } catch (error) {
          console.error(`[WebSocket] Error sending to client ${clientId}:`, error);
          this.unregisterClient(clientId);
        }
      }
    });
  }

  /**
   * Broadcast metrics update
   */
  broadcastMetrics(metrics: MetricsUpdate): void {
    if (this.metricsSubscribers.size === 0) return;

    const message = {
      type: 'metrics_update',
      metrics,
      timestamp: new Date().toISOString(),
    };

    this.metricsSubscribers.forEach((clientId) => {
      const client = this.clients.get(clientId);
      if (client) {
        try {
          client.send(message);
        } catch (error) {
          console.error(`[WebSocket] Error sending to client ${clientId}:`, error);
          this.unregisterClient(clientId);
        }
      }
    });
  }

  /**
   * Broadcast to all user's clients
   */
  broadcastToUser(userId: number, message: any): void {
    const subscribers = this.userSubscriptions.get(userId);
    if (!subscribers || subscribers.size === 0) return;

    subscribers.forEach((clientId) => {
      const client = this.clients.get(clientId);
      if (client) {
        try {
          client.send(message);
        } catch (error) {
          console.error(`[WebSocket] Error sending to client ${clientId}:`, error);
          this.unregisterClient(clientId);
        }
      }
    });
  }

  /**
   * Get connection stats
   */
  getStats(): {
    totalClients: number;
    taskSubscriptions: number;
    userSubscriptions: number;
    metricsSubscribers: number;
  } {
    return {
      totalClients: this.clients.size,
      taskSubscriptions: this.taskSubscriptions.size,
      userSubscriptions: this.userSubscriptions.size,
      metricsSubscribers: this.metricsSubscribers.size,
    };
  }
}

export const qumusWebSocketManager = new QumusWebSocketManager();
