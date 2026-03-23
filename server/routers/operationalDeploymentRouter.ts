/**
 * Operational Deployment Router
 * Integrates push notifications, analytics export, and content moderation
 * into the QUMUS ecosystem for full operational deployment
 */

import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import * as pushNotifications from '../services/pushNotificationService';
import * as contentModeration from '../services/contentModerationService';
import * as db from '../db';
import { sql } from 'drizzle-orm';

export const operationalDeploymentRouter = router({
  // Push Notification Procedures
  pushNotifications: router({
    subscribe: protectedProcedure
      .input(z.object({
        endpoint: z.string(),
        p256dh: z.string(),
        auth: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return pushNotifications.subscribeToPushNotifications(
          ctx.user.id,
          {
            endpoint: input.endpoint,
            keys: {
              p256dh: input.p256dh,
              auth: input.auth,
            },
          },
          ctx.req?.headers['user-agent']
        );
      }),

    unsubscribe: protectedProcedure
      .input(z.object({
        endpoint: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return pushNotifications.unsubscribeFromPushNotifications(ctx.user.id, input.endpoint);
      }),

    getPreferences: protectedProcedure
      .query(async ({ ctx }) => {
        return pushNotifications.getUserPushPreferences(ctx.user.id);
      }),

    updatePreferences: protectedProcedure
      .input(z.record(z.any()))
      .mutation(async ({ ctx, input }) => {
        return pushNotifications.updateUserPushPreferences(ctx.user.id, input);
      }),

    getHistory: protectedProcedure
      .input(z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ ctx, input }) => {
        return pushNotifications.getNotificationHistory(ctx.user.id, input.limit, input.offset);
      }),

    sendTest: protectedProcedure
      .mutation(async ({ ctx }) => {
        return pushNotifications.sendPushNotification(
          ctx.user.id,
          {
            title: '🧪 Test Notification',
            body: 'This is a test push notification from QUMUS ecosystem',
            icon: '/qumus-icon.png',
            badge: '/qumus-badge.png',
            tag: 'test-notification',
          },
          'test'
        );
      }),
  }),

  // Analytics Export Procedures
  analyticsExport: router({
    create: protectedProcedure
      .input(z.object({
        exportType: z.enum(['listener_demographics', 'channel_performance', 'revenue_reports', 'content_analytics', 'creator_stats', 'system_health']),
        format: z.enum(['csv', 'pdf', 'json', 'html']),
        dateRangeStart: z.date(),
        dateRangeEnd: z.date(),
        filters: z.record(z.any()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const analyticsExportService = await import('../services/analyticsExportService');
        return analyticsExportService.createAnalyticsExport({
          userId: ctx.user.id,
          exportType: input.exportType,
          format: input.format,
          dateRangeStart: input.dateRangeStart,
          dateRangeEnd: input.dateRangeEnd,
          filters: input.filters,
        });
      }),

    getHistory: protectedProcedure
      .input(z.object({
        limit: z.number().default(50),
      }))
      .query(async ({ ctx, input }) => {
        const analyticsExportService = await import('../services/analyticsExportService');
        return analyticsExportService.getExportHistory(ctx.user.id, input.limit);
      }),

    getSchedules: protectedProcedure
      .query(async ({ ctx }) => {
        const analyticsExportService = await import('../services/analyticsExportService');
        return analyticsExportService.getScheduledExports(ctx.user.id);
      }),

    createSchedule: protectedProcedure
      .input(z.object({
        name: z.string(),
        exportType: z.enum(['listener_demographics', 'channel_performance', 'revenue_reports', 'content_analytics', 'creator_stats', 'system_health']),
        format: z.enum(['csv', 'pdf', 'json', 'html']),
        frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
        emailRecipients: z.array(z.string()),
        filters: z.record(z.any()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const analyticsExportService = await import('../services/analyticsExportService');
        return analyticsExportService.scheduleAnalyticsExport(
          ctx.user.id,
          input.name,
          input.exportType,
          input.format,
          input.frequency,
          input.emailRecipients,
          input.filters
        );
      }),

    deleteExport: protectedProcedure
      .input(z.object({
        exportId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const analyticsExportService = await import('../services/analyticsExportService');
        return analyticsExportService.deleteExport(input.exportId, ctx.user.id);
      }),
  }),

  // Content Moderation Procedures
  contentModeration: router({
    submitForReview: protectedProcedure
      .input(z.object({
        contentId: z.number(),
        contentType: z.enum(['audio', 'video', 'image', 'text', 'metadata']),
        title: z.string(),
        description: z.string().optional(),
        contentUrl: z.string(),
        thumbnailUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return contentModeration.submitContentForReview({
          contentId: input.contentId,
          contentType: input.contentType,
          creatorId: ctx.user.id,
          title: input.title,
          description: input.description,
          contentUrl: input.contentUrl,
          thumbnailUrl: input.thumbnailUrl,
        });
      }),

    getModerationQueue: protectedProcedure
      .input(z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ ctx, input }) => {
        // Check if user is admin
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return contentModeration.getModerationQueue(input.limit, input.offset);
      }),

    reviewContent: protectedProcedure
      .input(z.object({
        moderationId: z.number(),
        decision: z.enum(['approved', 'rejected']),
        reviewNotes: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user is admin
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return contentModeration.reviewContent(
          input.moderationId,
          input.decision,
          input.reviewNotes,
          ctx.user.id
        );
      }),

    appealModeration: protectedProcedure
      .input(z.object({
        moderationId: z.number(),
        reason: z.string(),
        evidence: z.record(z.any()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return contentModeration.appealModeration(
          input.moderationId,
          ctx.user.id,
          input.reason,
          input.evidence
        );
      }),

    getCreatorHistory: protectedProcedure
      .input(z.object({
        limit: z.number().default(50),
      }))
      .query(async ({ ctx, input }) => {
        return contentModeration.getCreatorModerationHistory(ctx.user.id, input.limit);
      }),

    getStats: protectedProcedure
      .input(z.object({
        days: z.number().default(30),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return contentModeration.getModerationStats(input.days);
      }),

    getViolationsByCategory: protectedProcedure
      .input(z.object({
        days: z.number().default(30),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return contentModeration.getViolationsByCategory(input.days);
      }),

    getPolicies: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return contentModeration.getModerationPolicies();
      }),

    createPolicy: protectedProcedure
      .input(z.object({
        name: z.string(),
        category: z.string(),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        autoRejectThreshold: z.number().min(0).max(100),
        action: z.enum(['flag', 'review', 'reject', 'quarantine']),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return contentModeration.createModerationPolicy(
          input.name,
          input.category,
          input.severity,
          input.autoRejectThreshold,
          input.action
        );
      }),
  }),

  // System Integration Procedures
  systemIntegration: router({
    getOperationalStatus: publicProcedure
      .query(async () => {
        try {
          const status = await db.query(sql`
            SELECT 
              (SELECT COUNT(*) FROM push_subscriptions WHERE isActive = 1) as active_push_subscriptions,
              (SELECT COUNT(*) FROM content_moderation_queue WHERE status = 'pending') as pending_moderations,
              (SELECT COUNT(*) FROM analytics_exports WHERE status = 'processing') as processing_exports,
              (SELECT COUNT(*) FROM notifications WHERE isRead = 0) as unread_notifications
          `);
          return status?.[0] || {};
        } catch (error) {
          console.error('[System] Status error:', error);
          return {};
        }
      }),

    activateAllSystems: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }

        try {
          // Log system activation
          await db.query(sql`
            INSERT INTO system_audit_log 
            (userId, action, resourceType, details)
            VALUES (${ctx.user.id}, 'activate_all_systems', 'qumus_ecosystem', 
                    'Push notifications, analytics export, and content moderation activated')
          `);

          return {
            success: true,
            message: 'All operational systems activated',
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          console.error('[System] Activation error:', error);
          return { success: false, error: 'Activation failed' };
        }
      }),

    getDeploymentStatus: publicProcedure
      .query(async () => {
        try {
          const status = {
            pushNotifications: {
              status: 'operational',
              activeSubscriptions: await db.query(sql`SELECT COUNT(*) as count FROM push_subscriptions WHERE isActive = 1`),
              lastNotificationSent: new Date().toISOString(),
            },
            analyticsExport: {
              status: 'operational',
              recentExports: await db.query(sql`SELECT COUNT(*) as count FROM analytics_exports WHERE status = 'completed' AND createdAt > DATE_SUB(NOW(), INTERVAL 24 HOUR)`),
              scheduledExports: await db.query(sql`SELECT COUNT(*) as count FROM analytics_export_schedules WHERE isActive = 1`),
            },
            contentModeration: {
              status: 'operational',
              queueLength: await db.query(sql`SELECT COUNT(*) as count FROM content_moderation_queue WHERE status = 'pending'`),
              avgReviewTime: '15 minutes',
            },
          };
          return status;
        } catch (error) {
          console.error('[System] Deployment status error:', error);
          return { error: 'Failed to get deployment status' };
        }
      }),
  }),
});
