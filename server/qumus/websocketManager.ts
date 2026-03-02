/**
 * QUMUS WebSocket Manager
 * 
 * Manages real-time updates across all connected clients.
 * Broadcasts decision updates, propagation status, and metrics in real-time.
 */

import { EventEmitter } from "events";

export interface WebSocketEvent {
  type: string;
  timestamp: Date;
  data: Record<string, any>;
}

export interface ClientConnection {
  id: string;
  userId: number;
  subscriptions: Set<string>;
  isConnected: boolean;
  lastHeartbeat: Date;
}

/**
 * WebSocket Event Types
 */
export enum WebSocketEventType {
  DECISION_MADE = "decision_made",
  ACTION_COMPLETED = "action_completed",
  PROPAGATION_COMPLETE = "propagation_complete",
  PROPAGATION_FAILED = "propagation_failed",
  LISTENER_UPDATE = "listener_update",
  ALERT_BROADCAST = "alert_broadcast",
  POLICY_TRIGGERED = "policy_triggered",
  COMPLIANCE_ALERT = "compliance_alert",
  SYSTEM_STATUS = "system_status",
  CONNECTION_ESTABLISHED = "connection_established",
  CONNECTION_LOST = "connection_lost",
  HEARTBEAT = "heartbeat",
}

/**
 * WebSocket Manager
 */
export class WebSocketManager extends EventEmitter {
  private clients: Map<string, ClientConnection> = new Map();
  private eventHistory: WebSocketEvent[] = [];
  private maxHistorySize = 1000;
  private heartbeatInterval = 30000; // 30 seconds
  private heartbeatTimer: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.startHeartbeat();
  }

  /**
   * Register a new client connection
   */
  registerClient(clientId: string, userId: number): ClientConnection {
    const client: ClientConnection = {
      id: clientId,
      userId,
      subscriptions: new Set(),
      isConnected: true,
      lastHeartbeat: new Date(),
    };

    this.clients.set(clientId, client);

    // Broadcast connection event
    this.broadcastEvent({
      type: WebSocketEventType.CONNECTION_ESTABLISHED,
      timestamp: new Date(),
      data: {
        clientId,
        userId,
        totalClients: this.clients.size,
      },
    });

    return client;
  }

  /**
   * Unregister a client connection
   */
  unregisterClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.isConnected = false;
      this.clients.delete(clientId);

      this.broadcastEvent({
        type: WebSocketEventType.CONNECTION_LOST,
        timestamp: new Date(),
        data: {
          clientId,
          totalClients: this.clients.size,
        },
      });
    }
  }

  /**
   * Subscribe client to event type
   */
  subscribe(clientId: string, eventType: string): boolean {
    const client = this.clients.get(clientId);
    if (!client) return false;

    client.subscriptions.add(eventType);
    return true;
  }

  /**
   * Unsubscribe client from event type
   */
  unsubscribe(clientId: string, eventType: string): boolean {
    const client = this.clients.get(clientId);
    if (!client) return false;

    client.subscriptions.delete(eventType);
    return true;
  }

  /**
   * Broadcast event to all subscribed clients
   */
  broadcastEvent(event: WebSocketEvent): void {
    // Store in history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Send to subscribed clients
    this.clients.forEach((client) => {
      if (client.isConnected && client.subscriptions.has(event.type)) {
        this.sendToClient(client.id, event);
      }
    });

    // Emit for internal listeners
    this.emit(event.type, event);
  }

  /**
   * Send event to specific client
   */
  sendToClient(clientId: string, event: WebSocketEvent): void {
    const client = this.clients.get(clientId);
    if (client && client.isConnected) {
      // In real implementation, this would send via WebSocket
      this.emit(`client:${clientId}`, event);
    }
  }

  /**
   * Broadcast decision made event
   */
  broadcastDecisionMade(decisionId: string, policyId: string, severity: string, affectedPlatforms: string[]): void {
    this.broadcastEvent({
      type: WebSocketEventType.DECISION_MADE,
      timestamp: new Date(),
      data: {
        decisionId,
        policyId,
        severity,
        affectedPlatforms,
      },
    });
  }

  /**
   * Broadcast action completed event
   */
  broadcastActionCompleted(decisionId: string, actionId: string, platform: string, status: string): void {
    this.broadcastEvent({
      type: WebSocketEventType.ACTION_COMPLETED,
      timestamp: new Date(),
      data: {
        decisionId,
        actionId,
        platform,
        status,
      },
    });
  }

  /**
   * Broadcast propagation complete event
   */
  broadcastPropagationComplete(
    decisionId: string,
    totalActions: number,
    successCount: number,
    failureCount: number
  ): void {
    this.broadcastEvent({
      type: WebSocketEventType.PROPAGATION_COMPLETE,
      timestamp: new Date(),
      data: {
        decisionId,
        totalActions,
        successCount,
        failureCount,
        successRate: (successCount / totalActions) * 100,
      },
    });
  }

  /**
   * Broadcast propagation failed event
   */
  broadcastPropagationFailed(decisionId: string, reason: string): void {
    this.broadcastEvent({
      type: WebSocketEventType.PROPAGATION_FAILED,
      timestamp: new Date(),
      data: {
        decisionId,
        reason,
      },
    });
  }

  /**
   * Broadcast listener update event
   */
  broadcastListenerUpdate(platform: string, listenerCount: number, activeStreams: number): void {
    this.broadcastEvent({
      type: WebSocketEventType.LISTENER_UPDATE,
      timestamp: new Date(),
      data: {
        platform,
        listenerCount,
        activeStreams,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Broadcast alert broadcast event
   */
  broadcastAlertBroadcast(alertId: string, channelCount: number, estimatedReach: number): void {
    this.broadcastEvent({
      type: WebSocketEventType.ALERT_BROADCAST,
      timestamp: new Date(),
      data: {
        alertId,
        channelCount,
        estimatedReach,
        broadcastTime: new Date(),
      },
    });
  }

  /**
   * Broadcast policy triggered event
   */
  broadcastPolicyTriggered(policyId: string, reason: string, autonomyLevel: number): void {
    this.broadcastEvent({
      type: WebSocketEventType.POLICY_TRIGGERED,
      timestamp: new Date(),
      data: {
        policyId,
        reason,
        autonomyLevel,
      },
    });
  }

  /**
   * Broadcast compliance alert
   */
  broadcastComplianceAlert(alertId: string, severity: string, message: string): void {
    this.broadcastEvent({
      type: WebSocketEventType.COMPLIANCE_ALERT,
      timestamp: new Date(),
      data: {
        alertId,
        severity,
        message,
      },
    });
  }

  /**
   * Broadcast system status
   */
  broadcastSystemStatus(
    activePolicies: number,
    totalDecisions: number,
    avgAutonomy: number,
    systemHealth: string
  ): void {
    this.broadcastEvent({
      type: WebSocketEventType.SYSTEM_STATUS,
      timestamp: new Date(),
      data: {
        activePolicies,
        totalDecisions,
        avgAutonomy,
        systemHealth,
        connectedClients: this.clients.size,
      },
    });
  }

  /**
   * Get client connection info
   */
  getClient(clientId: string): ClientConnection | undefined {
    return this.clients.get(clientId);
  }

  /**
   * Get all connected clients
   */
  getConnectedClients(): ClientConnection[] {
    const connected: ClientConnection[] = [];
    this.clients.forEach((client) => {
      if (client.isConnected) {
        connected.push(client);
      }
    });
    return connected;
  }

  /**
   * Get event history
   */
  getEventHistory(eventType?: string, limit: number = 100): WebSocketEvent[] {
    let history = this.eventHistory;

    if (eventType) {
      history = history.filter((e) => e.type === eventType);
    }

    return history.slice(-limit);
  }

  /**
   * Update client heartbeat
   */
  updateHeartbeat(clientId: string): boolean {
    const client = this.clients.get(clientId);
    if (client) {
      client.lastHeartbeat = new Date();
      return true;
    }
    return false;
  }

  /**
   * Start heartbeat mechanism
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      const now = new Date();
      const timeout = 90000; // 90 seconds

      this.clients.forEach((client) => {
        if (client.isConnected) {
          const timeSinceLastHeartbeat = now.getTime() - client.lastHeartbeat.getTime();

          if (timeSinceLastHeartbeat > timeout) {
            // Client is stale, disconnect
            this.unregisterClient(client.id);
          } else {
            // Send heartbeat
            this.sendToClient(client.id, {
              type: WebSocketEventType.HEARTBEAT,
              timestamp: now,
              data: { clientId: client.id },
            });
          }
        }
      });
    }, this.heartbeatInterval);
  }

  /**
   * Stop heartbeat mechanism
   */
  stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Get statistics
   */
  getStatistics(): Record<string, any> {
    const connectedClients = this.getConnectedClients();
    const subscriptionStats: Record<string, number> = {};

    connectedClients.forEach((client) => {
      client.subscriptions.forEach((subscription) => {
        subscriptionStats[subscription] = (subscriptionStats[subscription] || 0) + 1;
      });
    });

    return {
      totalClients: this.clients.size,
      connectedClients: connectedClients.length,
      eventHistorySize: this.eventHistory.length,
      subscriptions: subscriptionStats,
      averageSubscriptionsPerClient:
        connectedClients.length > 0
          ? connectedClients.reduce((sum, c) => sum + c.subscriptions.size, 0) / connectedClients.length
          : 0,
    };
  }

  /**
   * Clear old events from history
   */
  clearOldEvents(beforeDate: Date): number {
    const initialLength = this.eventHistory.length;
    this.eventHistory = this.eventHistory.filter((e) => e.timestamp >= beforeDate);
    return initialLength - this.eventHistory.length;
  }

  /**
   * Shutdown WebSocket manager
   */
  shutdown(): void {
    this.stopHeartbeat();
    this.clients.clear();
    this.eventHistory = [];
    this.removeAllListeners();
  }
}

// Export singleton instance
export const websocketManager = new WebSocketManager();
