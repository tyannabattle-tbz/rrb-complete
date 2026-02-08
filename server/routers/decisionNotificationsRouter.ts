/**
 * Decision Notifications Router
 * Provides real-time notification system for autonomous decisions
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';

// In-memory notification storage (will be replaced with database and WebSocket)
const notificationsStore: any[] = [];
const preferencesStore: any[] = [];

export const decisionNotificationsRouter = router({
  /**
   * Create a new notification
   */
  createNotification: protectedProcedure
    .input(
      z.object({
        decisionId: z.string(),
        userId: z.string(),
        notificationType: z.enum(['approval_required', 'decision_executed', 'escalation_alert', 'policy_violation', 'threshold_breach']),
        title: z.string(),
        message: z.string(),
        priority: z.enum(['low', 'medium', 'high', 'critical']),
        actionUrl: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        decisionId: input.decisionId,
        userId: input.userId,
        notificationType: input.notificationType,
        title: input.title,
        message: input.message,
        priority: input.priority,
        isRead: 0,
        readAt: null,
        actionUrl: input.actionUrl,
        metadata: input.metadata,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      };

      notificationsStore.push(notification);

      // TODO: Emit WebSocket event for real-time updates
      console.log(`[Notification] Created notification for user ${input.userId}:`, input.title);

      return {
        success: true,
        notification,
      };
    }),

  /**
   * Get user's notifications
   */
  getUserNotifications: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().default(50).optional(),
        offset: z.number().default(0).optional(),
        unreadOnly: z.boolean().default(false).optional(),
      })
    )
    .query(({ input }) => {
      let filtered = notificationsStore.filter((n) => n.userId === input.userId);

      if (input.unreadOnly) {
        filtered = filtered.filter((n) => n.isRead === 0);
      }

      const sorted = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const paginated = sorted.slice(input.offset, input.offset + (input.limit || 50));

      return {
        notifications: paginated,
        total: sorted.length,
        unreadCount: filtered.filter((n) => n.isRead === 0).length,
        limit: input.limit || 50,
        offset: input.offset || 0,
      };
    }),

  /**
   * Mark notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(({ input }) => {
      const notification = notificationsStore.find((n) => n.id === input.notificationId);

      if (!notification) {
        return { success: false, error: 'Notification not found' };
      }

      notification.isRead = 1;
      notification.readAt = new Date();

      return { success: true, notification };
    }),

  /**
   * Mark all notifications as read for a user
   */
  markAllAsRead: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(({ input }) => {
      const userNotifications = notificationsStore.filter((n) => n.userId === input.userId && n.isRead === 0);

      userNotifications.forEach((n) => {
        n.isRead = 1;
        n.readAt = new Date();
      });

      return {
        success: true,
        updatedCount: userNotifications.length,
      };
    }),

  /**
   * Delete a notification
   */
  deleteNotification: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(({ input }) => {
      const index = notificationsStore.findIndex((n) => n.id === input.notificationId);

      if (index === -1) {
        return { success: false, error: 'Notification not found' };
      }

      notificationsStore.splice(index, 1);

      return { success: true };
    }),

  /**
   * Set notification preferences for a user
   */
  setPreferences: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        notificationType: z.enum(['approval_required', 'decision_executed', 'escalation_alert', 'policy_violation', 'threshold_breach']),
        enabled: z.boolean(),
        channels: z.array(z.enum(['email', 'push', 'in_app', 'webhook'])).optional(),
        frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']).optional(),
      })
    )
    .mutation(({ input }) => {
      const existing = preferencesStore.find(
        (p) => p.userId === input.userId && p.notificationType === input.notificationType
      );

      const preference = {
        id: existing?.id || `pref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: input.userId,
        notificationType: input.notificationType,
        enabled: input.enabled ? 1 : 0,
        channels: input.channels || ['in_app'],
        frequency: input.frequency || 'immediate',
        createdAt: existing?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      if (existing) {
        Object.assign(existing, preference);
      } else {
        preferencesStore.push(preference);
      }

      return {
        success: true,
        preference,
      };
    }),

  /**
   * Get user's notification preferences
   */
  getPreferences: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      const preferences = preferencesStore.filter((p) => p.userId === input.userId);

      return {
        userId: input.userId,
        preferences,
        totalPreferences: preferences.length,
      };
    }),

  /**
   * Get notification statistics
   */
  getStatistics: publicProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(({ input }) => {
      let filtered = input.userId ? notificationsStore.filter((n) => n.userId === input.userId) : notificationsStore;

      const typeBreakdown: Record<string, number> = {};
      const priorityBreakdown: Record<string, number> = {};

      filtered.forEach((n) => {
        typeBreakdown[n.notificationType] = (typeBreakdown[n.notificationType] || 0) + 1;
        priorityBreakdown[n.priority] = (priorityBreakdown[n.priority] || 0) + 1;
      });

      return {
        totalNotifications: filtered.length,
        unreadCount: filtered.filter((n) => n.isRead === 0).length,
        readCount: filtered.filter((n) => n.isRead === 1).length,
        typeBreakdown,
        priorityBreakdown,
        criticalCount: filtered.filter((n) => n.priority === 'critical').length,
      };
    }),

  /**
   * Get notifications by type
   */
  getByType: publicProcedure
    .input(
      z.object({
        notificationType: z.enum(['approval_required', 'decision_executed', 'escalation_alert', 'policy_violation', 'threshold_breach']),
        limit: z.number().default(50).optional(),
      })
    )
    .query(({ input }) => {
      const filtered = notificationsStore.filter((n) => n.notificationType === input.notificationType);
      const sorted = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const paginated = sorted.slice(0, input.limit || 50);

      return {
        notificationType: input.notificationType,
        notifications: paginated,
        total: sorted.length,
        limit: input.limit || 50,
      };
    }),

  /**
   * Get critical notifications
   */
  getCriticalNotifications: publicProcedure
    .input(z.object({ limit: z.number().default(20).optional() }))
    .query(({ input }) => {
      const critical = notificationsStore.filter((n) => n.priority === 'critical');
      const sorted = critical.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const paginated = sorted.slice(0, input.limit || 20);

      return {
        notifications: paginated,
        total: sorted.length,
        limit: input.limit || 20,
      };
    }),

  /**
   * Bulk delete expired notifications
   */
  cleanupExpired: protectedProcedure.mutation(() => {
    const now = new Date();
    const initialCount = notificationsStore.length;

    const filtered = notificationsStore.filter((n) => new Date(n.expiresAt) > now);

    notificationsStore.length = 0;
    notificationsStore.push(...filtered);

    return {
      success: true,
      deletedCount: initialCount - filtered.length,
      remainingCount: filtered.length,
    };
  }),
});
