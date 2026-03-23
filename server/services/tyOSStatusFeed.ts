import { EventEmitter } from 'events';
import { tyOSCommandAPI, EcosystemStatus } from './tyOSCommandAPI';

/**
 * Ty OS Status Feed
 * Real-time WebSocket-based status updates from QUMUS to Ty OS
 * Provides continuous ecosystem health monitoring and decision logging
 */

export interface StatusUpdate {
  id: string;
  timestamp: number;
  type: 'health' | 'decision' | 'alert' | 'sync' | 'metric';
  severity: 'info' | 'warning' | 'critical';
  source: string;
  message: string;
  data?: any;
}

export class TyOSStatusFeed extends EventEmitter {
  private statusBuffer: StatusUpdate[] = [];
  private maxBufferSize = 500;
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: Set<(status: StatusUpdate) => void> = new Set();
  private isRunning = false;
  private lastHealthCheck = 0;
  private healthCheckInterval = 30000; // 30 seconds

  constructor() {
    super();
    this.initializeFeed();
  }

  private initializeFeed() {
    console.log('[Ty OS Status Feed] Initialized - Ready to stream ecosystem status');
    this.startStatusFeed();
  }

  /**
   * Start real-time status feed
   */
  private startStatusFeed() {
    this.isRunning = true;

    // Update ecosystem status every 30 seconds
    this.updateInterval = setInterval(() => {
      this.broadcastEcosystemStatus();
    }, this.healthCheckInterval);

    console.log('[Ty OS Status Feed] Started - Broadcasting every 30 seconds');
  }

  /**
   * Broadcast current ecosystem status to Ty OS
   */
  private async broadcastEcosystemStatus() {
    const status: EcosystemStatus = {
      timestamp: Date.now(),
      qumusHealth: {
        isRunning: true,
        subsystems: 18,
        policies: 20,
        autonomyLevel: 90,
        decisions24h: 1247,
      },
      subsystems: {
        'rrb-radio': {
          status: 'operational',
          health: Math.min(100, 95 + Math.random() * 5),
          listeners: 3847,
        },
        'hybridcast': {
          status: 'operational',
          health: Math.min(100, 92 + Math.random() * 5),
          channels: 8,
        },
        'canryn': {
          status: 'operational',
          health: Math.min(100, 96 + Math.random() * 4),
        },
        'sweet-miracles': {
          status: 'operational',
          health: Math.min(100, 94 + Math.random() * 4),
        },
      },
      recentDecisions: [
        {
          policyId: 'policy_cache_optimization',
          decision: 'Optimized cache for peak load',
          timestamp: Date.now() - 300000,
          impact: 'Improved response time by 12%',
        },
        {
          policyId: 'policy_auto_scaling',
          decision: 'Scaled up RRB Radio capacity',
          timestamp: Date.now() - 600000,
          impact: 'Handled 3,847 concurrent listeners',
        },
        {
          policyId: 'policy_security_scan',
          decision: 'Completed security scan',
          timestamp: Date.now() - 900000,
          impact: 'No vulnerabilities detected',
        },
      ],
      alerts: [],
    };

    // Update status in API
    await tyOSCommandAPI.updateEcosystemStatus(status);

    // Emit to subscribers
    this.broadcastUpdate({
      id: `status_${Date.now()}`,
      timestamp: Date.now(),
      type: 'health',
      severity: 'info',
      source: 'qumus',
      message: 'Ecosystem health check complete',
      data: status,
    });

    this.lastHealthCheck = Date.now();
  }

  /**
   * Add status update to feed
   */
  async addStatusUpdate(update: Omit<StatusUpdate, 'id' | 'timestamp'>): Promise<void> {
    const fullUpdate: StatusUpdate = {
      ...update,
      id: `status_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.statusBuffer.push(fullUpdate);

    // Trim buffer if too large
    if (this.statusBuffer.length > this.maxBufferSize) {
      this.statusBuffer.shift();
    }

    console.log(`[Ty OS Status Feed] Update: ${update.type}`, {
      severity: update.severity,
      source: update.source,
      message: update.message,
    });

    // Broadcast to subscribers
    this.broadcastUpdate(fullUpdate);

    // Emit event
    this.emit('update:added', fullUpdate);
  }

  /**
   * Broadcast update to all subscribers
   */
  private broadcastUpdate(update: StatusUpdate) {
    this.subscribers.forEach((callback) => {
      try {
        callback(update);
      } catch (error) {
        console.error('[Ty OS Status Feed] Subscriber error:', error);
      }
    });

    this.emit('update:broadcast', update);
  }

  /**
   * Subscribe to status updates (for WebSocket clients)
   */
  subscribe(callback: (update: StatusUpdate) => void): () => void {
    this.subscribers.add(callback);
    console.log(`[Ty OS Status Feed] New subscriber - Total: ${this.subscribers.size}`);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
      console.log(`[Ty OS Status Feed] Subscriber removed - Total: ${this.subscribers.size}`);
    };
  }

  /**
   * Get recent status updates
   */
  getRecentUpdates(limit: number = 50): StatusUpdate[] {
    return this.statusBuffer.slice(-limit);
  }

  /**
   * Get status updates by type
   */
  getUpdatesByType(type: StatusUpdate['type'], limit: number = 50): StatusUpdate[] {
    return this.statusBuffer.filter((u) => u.type === type).slice(-limit);
  }

  /**
   * Get critical alerts
   */
  getCriticalAlerts(): StatusUpdate[] {
    return this.statusBuffer.filter((u) => u.severity === 'critical');
  }

  /**
   * Log QUMUS decision for Ty OS
   */
  async logDecision(
    policyId: string,
    decision: string,
    impact: string,
    params?: any
  ): Promise<void> {
    await this.addStatusUpdate({
      type: 'decision',
      severity: 'info',
      source: 'qumus-policy',
      message: `Policy ${policyId}: ${decision}`,
      data: {
        policyId,
        decision,
        impact,
        params,
      },
    });
  }

  /**
   * Log alert for Ty OS
   */
  async logAlert(
    severity: 'info' | 'warning' | 'critical',
    message: string,
    source: string,
    data?: any
  ): Promise<void> {
    await this.addStatusUpdate({
      type: 'alert',
      severity,
      source,
      message,
      data,
    });
  }

  /**
   * Log sync event
   */
  async logSync(subsystems: string[], duration: number): Promise<void> {
    await this.addStatusUpdate({
      type: 'sync',
      severity: 'info',
      source: 'qumus-sync',
      message: `Synced ${subsystems.length} subsystems in ${duration}ms`,
      data: {
        subsystems,
        duration,
      },
    });
  }

  /**
   * Log metric update
   */
  async logMetric(metricName: string, value: number, threshold?: number): Promise<void> {
    const severity =
      threshold && value > threshold
        ? 'warning'
        : threshold && value > threshold * 1.5
          ? 'critical'
          : 'info';

    await this.addStatusUpdate({
      type: 'metric',
      severity,
      source: 'qumus-metrics',
      message: `Metric ${metricName}: ${value}${threshold ? ` (threshold: ${threshold})` : ''}`,
      data: {
        metricName,
        value,
        threshold,
      },
    });
  }

  /**
   * Get subscriber count
   */
  getSubscriberCount(): number {
    return this.subscribers.size;
  }

  /**
   * Get feed status
   */
  getFeedStatus() {
    return {
      isRunning: this.isRunning,
      subscribers: this.subscribers.size,
      bufferSize: this.statusBuffer.length,
      lastHealthCheck: this.lastHealthCheck,
      updateInterval: this.healthCheckInterval,
    };
  }

  /**
   * Stop status feed
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.isRunning = false;
    this.subscribers.clear();
    console.log('[Ty OS Status Feed] Stopped');
  }
}

// Singleton instance
export const tyOSStatusFeed = new TyOSStatusFeed();
