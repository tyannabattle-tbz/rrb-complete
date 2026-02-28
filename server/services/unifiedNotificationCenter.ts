/**
 * Unified Notification Center
 * Manages push notifications across Qumus, RRB, and HybridCast
 * Supports all notification types: alerts, updates, emergencies, analytics
 */

import { db } from '../db';
import { invokeLLM } from '../_core/llm';
import { notifyOwner } from '../_core/notification';

export interface NotificationPayload {
  id: string;
  system: 'qumus' | 'rrb' | 'hybridcast';
  type: 'alert' | 'update' | 'emergency' | 'analytics' | 'task' | 'broadcast';
  priority: 'low' | 'normal' | 'high' | 'critical';
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{ action: string; title: string; icon?: string }>;
  data?: Record<string, any>;
  timestamp: number;
  targetUsers?: string[];
  targetGroups?: string[];
}

export interface NotificationSubscription {
  userId: string;
  endpoint: string;
  auth: string;
  p256dh: string;
  system: 'qumus' | 'rrb' | 'hybridcast' | 'all';
  notificationTypes: string[];
  priority: 'all' | 'high' | 'critical';
  createdAt: number;
  lastActive: number;
}

export class UnifiedNotificationCenter {
  private subscriptions: Map<string, NotificationSubscription[]> = new Map();
  private notificationQueue: NotificationPayload[] = [];
  private isProcessing = false;

  constructor() {
    this.loadSubscriptions();
    this.startQueueProcessor();
  }

  /**
   * Load subscriptions from database
   */
  private async loadSubscriptions() {
    try {
      const subs = await db.query.notificationSubscriptions.findMany();
      subs.forEach((sub) => {
        const key = `${sub.userId}-${sub.system}`;
        if (!this.subscriptions.has(key)) {
          this.subscriptions.set(key, []);
        }
        this.subscriptions.get(key)!.push(sub as NotificationSubscription);
      });
    } catch (error) {
      console.error('[Notification] Failed to load subscriptions:', error);
    }
  }

  /**
   * Subscribe user to notifications
   */
  async subscribe(
    userId: string,
    subscription: PushSubscription,
    system: 'qumus' | 'rrb' | 'hybridcast' | 'all',
    notificationTypes: string[] = ['all'],
    priority: 'all' | 'high' | 'critical' = 'all'
  ): Promise<void> {
    try {
      const notifSub: NotificationSubscription = {
        userId,
        endpoint: subscription.endpoint,
        auth: subscription.getKey('auth')?.toString() || '',
        p256dh: subscription.getKey('p256dh')?.toString() || '',
        system,
        notificationTypes,
        priority,
        createdAt: Date.now(),
        lastActive: Date.now(),
      };

      const key = `${userId}-${system}`;
      if (!this.subscriptions.has(key)) {
        this.subscriptions.set(key, []);
      }
      this.subscriptions.get(key)!.push(notifSub);

      // Save to database
      await db.insert(db.schema.notificationSubscriptions).values(notifSub);

      console.log(`[Notification] User ${userId} subscribed to ${system}`);
    } catch (error) {
      console.error('[Notification] Subscription failed:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe user from notifications
   */
  async unsubscribe(userId: string, system: string): Promise<void> {
    try {
      const key = `${userId}-${system}`;
      this.subscriptions.delete(key);

      // Remove from database
      await db.delete(db.schema.notificationSubscriptions).where(
        (t) => t.userId === userId && t.system === system
      );

      console.log(`[Notification] User ${userId} unsubscribed from ${system}`);
    } catch (error) {
      console.error('[Notification] Unsubscription failed:', error);
      throw error;
    }
  }

  /**
   * Send notification
   */
  async send(payload: NotificationPayload): Promise<void> {
    this.notificationQueue.push(payload);
  }

  /**
   * Send notification to specific users
   */
  async sendToUsers(payload: NotificationPayload, userIds: string[]): Promise<void> {
    payload.targetUsers = userIds;
    this.notificationQueue.push(payload);
  }

  /**
   * Send notification to user groups
   */
  async sendToGroups(payload: NotificationPayload, groups: string[]): Promise<void> {
    payload.targetGroups = groups;
    this.notificationQueue.push(payload);
  }

  /**
   * Broadcast notification to all users of a system
   */
  async broadcast(payload: NotificationPayload): Promise<void> {
    this.notificationQueue.push(payload);
  }

  /**
   * Process notification queue
   */
  private startQueueProcessor() {
    setInterval(() => {
      if (!this.isProcessing && this.notificationQueue.length > 0) {
        this.processQueue();
      }
    }, 1000);
  }

  private async processQueue() {
    if (this.isProcessing || this.notificationQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.notificationQueue.length > 0) {
        const payload = this.notificationQueue.shift()!;
        await this.deliverNotification(payload);
      }
    } catch (error) {
      console.error('[Notification] Queue processing error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Deliver notification to subscribed users
   */
  private async deliverNotification(payload: NotificationPayload): Promise<void> {
    try {
      let targetSubscriptions: NotificationSubscription[] = [];

      // Get target subscriptions
      if (payload.targetUsers && payload.targetUsers.length > 0) {
        // Send to specific users
        for (const userId of payload.targetUsers) {
          const key = `${userId}-${payload.system}`;
          const subs = this.subscriptions.get(key) || [];
          targetSubscriptions.push(...subs);
        }
      } else if (payload.targetGroups && payload.targetGroups.length > 0) {
        // Send to user groups (would need group membership lookup)
        // For now, broadcast to all
        this.subscriptions.forEach((subs) => {
          targetSubscriptions.push(...subs);
        });
      } else {
        // Broadcast to all subscribers of this system
        this.subscriptions.forEach((subs) => {
          const systemSubs = subs.filter((s) => s.system === payload.system || s.system === 'all');
          targetSubscriptions.push(...systemSubs);
        });
      }

      // Filter by priority if needed
      if (payload.priority !== 'low') {
        targetSubscriptions = targetSubscriptions.filter(
          (s) => s.priority === 'all' || s.priority === 'critical' || payload.priority === 'critical'
        );
      }

      // Filter by notification type
      targetSubscriptions = targetSubscriptions.filter((s) => {
        return s.notificationTypes.includes('all') || s.notificationTypes.includes(payload.type);
      });

      // Send to each subscription
      const results = await Promise.allSettled(
        targetSubscriptions.map((sub) => this.sendPushNotification(sub, payload))
      );

      // Count successes and failures
      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      console.log(
        `[Notification] Delivered to ${succeeded} users, ${failed} failed (${payload.type})`
      );

      // Log notification
      await this.logNotification(payload, succeeded, failed);
    } catch (error) {
      console.error('[Notification] Delivery error:', error);
    }
  }

  /**
   * Send push notification via Web Push API
   */
  private async sendPushNotification(
    subscription: NotificationSubscription,
    payload: NotificationPayload
  ): Promise<void> {
    try {
      const webpush = await import('web-push');

      const pushPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || `/icon-${payload.system}.png`,
        badge: payload.badge || `/badge-${payload.system}.png`,
        tag: payload.tag || payload.type,
        requireInteraction: payload.requireInteraction || payload.priority === 'critical',
        actions: payload.actions || [],
        data: {
          ...payload.data,
          system: payload.system,
          type: payload.type,
          timestamp: payload.timestamp,
        },
      });

      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            auth: subscription.auth,
            p256dh: subscription.p256dh,
          },
        },
        pushPayload
      );

      // Update last active
      subscription.lastActive = Date.now();
    } catch (error: any) {
      if (error.statusCode === 410) {
        // Subscription expired, remove it
        await this.unsubscribe(subscription.userId, subscription.system);
      }
      throw error;
    }
  }

  /**
   * Log notification for analytics
   */
  private async logNotification(
    payload: NotificationPayload,
    succeeded: number,
    failed: number
  ): Promise<void> {
    try {
      await db.insert(db.schema.notificationLogs).values({
        id: payload.id,
        system: payload.system,
        type: payload.type,
        priority: payload.priority,
        title: payload.title,
        body: payload.body,
        delivered: succeeded,
        failed,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('[Notification] Failed to log notification:', error);
    }
  }

  /**
   * Get notification history for user
   */
  async getHistory(userId: string, limit: number = 50): Promise<any[]> {
    try {
      return await db.query.notificationLogs
        .findMany({
          where: (t) => t.userId === userId,
          orderBy: (t) => t.timestamp,
          limit,
        });
    } catch (error) {
      console.error('[Notification] Failed to get history:', error);
      return [];
    }
  }

  /**
   * Get notification statistics
   */
  async getStats(): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    totalNotificationsSent: number;
    systemBreakdown: Record<string, number>;
    typeBreakdown: Record<string, number>;
  }> {
    try {
      let totalSubscriptions = 0;
      let activeSubscriptions = 0;

      this.subscriptions.forEach((subs) => {
        totalSubscriptions += subs.length;
        const now = Date.now();
        activeSubscriptions += subs.filter((s) => now - s.lastActive < 30 * 24 * 60 * 60 * 1000)
          .length; // 30 days
      });

      const logs = await db.query.notificationLogs.findMany();

      const systemBreakdown: Record<string, number> = {};
      const typeBreakdown: Record<string, number> = {};

      logs.forEach((log) => {
        systemBreakdown[log.system] = (systemBreakdown[log.system] || 0) + log.delivered;
        typeBreakdown[log.type] = (typeBreakdown[log.type] || 0) + log.delivered;
      });

      return {
        totalSubscriptions,
        activeSubscriptions,
        totalNotificationsSent: logs.reduce((sum, log) => sum + log.delivered, 0),
        systemBreakdown,
        typeBreakdown,
      };
    } catch (error) {
      console.error('[Notification] Failed to get stats:', error);
      return {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        totalNotificationsSent: 0,
        systemBreakdown: {},
        typeBreakdown: {},
      };
    }
  }

  /**
   * Send critical alert to owner
   */
  async sendCriticalAlert(system: string, message: string): Promise<void> {
    try {
      await notifyOwner({
        title: `🚨 CRITICAL: ${system.toUpperCase()}`,
        content: message,
      });

      // Also broadcast to all users
      await this.broadcast({
        id: `critical-${Date.now()}`,
        system: system as any,
        type: 'emergency',
        priority: 'critical',
        title: `Critical Alert - ${system}`,
        body: message,
        requireInteraction: true,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('[Notification] Failed to send critical alert:', error);
    }
  }
}

// Export singleton instance
export const notificationCenter = new UnifiedNotificationCenter();
