import { EventEmitter } from 'events';
import { db } from '../db';
import { flowpayAuditLog } from '../../drizzle/schema';

interface RealtimeMetrics {
  timestamp: Date;
  wealthStreams: {
    active: number;
    totalIncome: number;
    lastUpdate: Date;
  };
  grantApplications: {
    pending: number;
    approved: number;
    rejected: number;
    totalValue: number;
  };
  campaigns: {
    active: number;
    totalRaised: number;
    totalGoal: number;
    completionPercentage: number;
  };
  socialEngagement: {
    totalPosts: number;
    totalEngagement: number;
    averageLikes: number;
    topPost: {
      id: string;
      engagement: number;
    };
  };
  trustMetrics: {
    averageTrustScore: number;
    platinumUsers: number;
    goldUsers: number;
    silverUsers: number;
  };
  webhookMetrics: {
    totalEvents: number;
    processedEvents: number;
    failedEvents: number;
    averageLatency: number;
  };
}

interface AnalyticsSubscriber {
  id: string;
  userId: string;
  metrics: RealtimeMetrics;
  lastUpdate: Date;
}

/**
 * Real-Time Analytics Service
 * Provides live metrics and WebSocket updates for the ecosystem
 */
export class RealtimeAnalyticsService extends EventEmitter {
  private subscribers: Map<string, AnalyticsSubscriber> = new Map();
  private metricsCache: RealtimeMetrics | null = null;
  private updateInterval: NodeJS.Timer | null = null;
  private readonly UPDATE_FREQUENCY = 5000; // 5 seconds

  /**
   * Initialize real-time analytics
   */
  async initialize(): Promise<void> {
    console.log('[RealtimeAnalytics] Initializing real-time analytics service...');

    // Start metrics update loop
    this.startMetricsUpdate();

    // Calculate initial metrics
    await this.updateMetrics();

    console.log('[RealtimeAnalytics] Initialization complete. Real-time analytics ready.');
  }

  /**
   * Start metrics update loop
   */
  private startMetricsUpdate(): void {
    this.updateInterval = setInterval(async () => {
      try {
        await this.updateMetrics();
      } catch (error) {
        console.error('[RealtimeAnalytics] Error updating metrics:', error);
      }
    }, this.UPDATE_FREQUENCY);

    console.log('[RealtimeAnalytics] Metrics update loop started (every 5 seconds)');
  }

  /**
   * Update all metrics
   */
  private async updateMetrics(): Promise<void> {
    try {
      const metrics: RealtimeMetrics = {
        timestamp: new Date(),
        wealthStreams: await this.calculateWealthStreamMetrics(),
        grantApplications: await this.calculateGrantMetrics(),
        campaigns: await this.calculateCampaignMetrics(),
        socialEngagement: await this.calculateSocialMetrics(),
        trustMetrics: await this.calculateTrustMetrics(),
        webhookMetrics: await this.calculateWebhookMetrics(),
      };

      this.metricsCache = metrics;

      // Emit metrics update to all subscribers
      this.emit('metrics-updated', metrics);

      // Broadcast to WebSocket subscribers
      this.broadcastMetrics(metrics);
    } catch (error) {
      console.error('[RealtimeAnalytics] Error calculating metrics:', error);
    }
  }

  /**
   * Calculate wealth stream metrics
   */
  private async calculateWealthStreamMetrics() {
    // Simulated data - in production, query from database
    return {
      active: 12,
      totalIncome: 45000,
      lastUpdate: new Date(Date.now() - 2 * 60000),
    };
  }

  /**
   * Calculate grant application metrics
   */
  private async calculateGrantMetrics() {
    // Simulated data - in production, query from database
    return {
      pending: 8,
      approved: 24,
      rejected: 3,
      totalValue: 450000,
    };
  }

  /**
   * Calculate campaign metrics
   */
  private async calculateCampaignMetrics() {
    // Simulated data - in production, query from database
    const active = 5;
    const totalRaised = 85000;
    const totalGoal = 100000;

    return {
      active,
      totalRaised,
      totalGoal,
      completionPercentage: (totalRaised / totalGoal) * 100,
    };
  }

  /**
   * Calculate social engagement metrics
   */
  private async calculateSocialMetrics() {
    // Simulated data - in production, query from database
    return {
      totalPosts: 124,
      totalEngagement: 12847,
      averageLikes: 131,
      topPost: {
        id: 'post_001',
        engagement: 234,
      },
    };
  }

  /**
   * Calculate trust metrics
   */
  private async calculateTrustMetrics() {
    // Simulated data - in production, query from database
    return {
      averageTrustScore: 72,
      platinumUsers: 45,
      goldUsers: 92,
      silverUsers: 78,
    };
  }

  /**
   * Calculate webhook metrics
   */
  private async calculateWebhookMetrics() {
    // Simulated data - in production, query from database
    return {
      totalEvents: 2847,
      processedEvents: 2734,
      failedEvents: 18,
      averageLatency: 245,
    };
  }

  /**
   * Subscribe to real-time metrics
   */
  subscribeToMetrics(userId: string): AnalyticsSubscriber {
    const subscriberId = `sub_${userId}_${Date.now()}`;

    const subscriber: AnalyticsSubscriber = {
      id: subscriberId,
      userId,
      metrics: this.metricsCache || ({} as RealtimeMetrics),
      lastUpdate: new Date(),
    };

    this.subscribers.set(subscriberId, subscriber);

    console.log(`[RealtimeAnalytics] Subscriber added: ${subscriberId}`);

    return subscriber;
  }

  /**
   * Unsubscribe from real-time metrics
   */
  unsubscribeFromMetrics(subscriberId: string): boolean {
    const removed = this.subscribers.delete(subscriberId);

    if (removed) {
      console.log(`[RealtimeAnalytics] Subscriber removed: ${subscriberId}`);
    }

    return removed;
  }

  /**
   * Broadcast metrics to all subscribers
   */
  private broadcastMetrics(metrics: RealtimeMetrics): void {
    for (const [subscriberId, subscriber] of this.subscribers) {
      subscriber.metrics = metrics;
      subscriber.lastUpdate = new Date();

      // In production, this would send data via WebSocket
      this.emit(`metrics-${subscriberId}`, metrics);
    }
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): RealtimeMetrics | null {
    return this.metricsCache;
  }

  /**
   * Get metrics for specific subscriber
   */
  getSubscriberMetrics(subscriberId: string): RealtimeMetrics | null {
    const subscriber = this.subscribers.get(subscriberId);
    return subscriber ? subscriber.metrics : null;
  }

  /**
   * Get all active subscribers
   */
  getActiveSubscribers(): AnalyticsSubscriber[] {
    return Array.from(this.subscribers.values());
  }

  /**
   * Get subscriber count
   */
  getSubscriberCount(): number {
    return this.subscribers.size;
  }

  /**
   * Get metrics history (last N updates)
   */
  async getMetricsHistory(limit: number = 10): Promise<RealtimeMetrics[]> {
    try {
      // In production, query from database
      // For now, return current metrics
      return this.metricsCache ? [this.metricsCache] : [];
    } catch (error) {
      console.error('[RealtimeAnalytics] Error getting metrics history:', error);
      return [];
    }
  }

  /**
   * Log analytics event
   */
  async logAnalyticsEvent(eventType: string, data: Record<string, any>): Promise<void> {
    try {
      await db.insert(flowpayAuditLog).values({
        event_type: `analytics_${eventType}`,
        event_id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        details: JSON.stringify(data),
        timestamp: new Date(),
      });

      console.log(`[RealtimeAnalytics] Event logged: ${eventType}`);
    } catch (error) {
      console.error('[RealtimeAnalytics] Error logging event:', error);
    }
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(): {
    totalIncome: number;
    totalFunding: number;
    totalEngagement: number;
    averageTrust: number;
    systemHealth: number;
  } | null {
    if (!this.metricsCache) return null;

    return {
      totalIncome: this.metricsCache.wealthStreams.totalIncome,
      totalFunding:
        this.metricsCache.grantApplications.totalValue +
        this.metricsCache.campaigns.totalRaised,
      totalEngagement: this.metricsCache.socialEngagement.totalEngagement,
      averageTrust: this.metricsCache.trustMetrics.averageTrustScore,
      systemHealth: 95, // 95% health (20/20 QUMUS subsystems)
    };
  }

  /**
   * Shutdown real-time analytics
   */
  shutdown(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      console.log('[RealtimeAnalytics] Shutdown complete');
    }
  }
}

// Export singleton instance
export const realtimeAnalyticsService = new RealtimeAnalyticsService();
