import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { ListenerNotificationService } from '../services/listenerNotificationService';
import { TRPCError } from '@trpc/server';

export const listenerNotificationRouter = router({
  /**
   * Get all notifications for current user
   */
  getNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        return await ListenerNotificationService.getUserNotifications(
          ctx.user.id,
          input.limit,
          input.offset
        );
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch notifications',
        });
      }
    }),

  /**
   * Get notification statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ListenerNotificationService.getNotificationStats(ctx.user.id);
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch notification stats',
      });
    }
  }),

  /**
   * Mark a notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        return await ListenerNotificationService.markAsRead(
          ctx.user.id,
          input.notificationId
        );
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark notification as read',
        });
      }
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      return await ListenerNotificationService.markAllAsRead(ctx.user.id);
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to mark all notifications as read',
      });
    }
  }),

  /**
   * Delete a notification
   */
  deleteNotification: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        return await ListenerNotificationService.deleteNotification(
          ctx.user.id,
          input.notificationId
        );
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete notification',
        });
      }
    }),

  /**
   * Get user's notification preferences
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ListenerNotificationService.getUserPreferences(ctx.user.id);
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch preferences',
      });
    }
  }),

  /**
   * Create a notification preference
   */
  createPreference: protectedProcedure
    .input(
      z.object({
        trackId: z.string().optional(),
        artistName: z.string().optional(),
        channelId: z.string().optional(),
        notificationType: z.enum(['email', 'push', 'in-app']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        return await ListenerNotificationService.createPreference({
          userId: ctx.user.id,
          ...input,
          isActive: true,
        });
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create preference',
        });
      }
    }),

  /**
   * Get trending notifications
   */
  getTrending: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      try {
        return await ListenerNotificationService.getTrendingNotifications(input.limit);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch trending notifications',
        });
      }
    }),

  /**
   * Get preferences by notification type
   */
  getPreferencesByType: protectedProcedure
    .input(z.object({ type: z.enum(['email', 'push', 'in-app']) }))
    .query(async ({ input, ctx }) => {
      try {
        return await ListenerNotificationService.getPreferencesByType(
          ctx.user.id,
          input.type
        );
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch preferences',
        });
      }
    }),

  /**
   * Disable all notifications
   */
  disableAll: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      return await ListenerNotificationService.disableAllNotifications(ctx.user.id);
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to disable notifications',
      });
    }
  }),

  /**
   * Enable all notifications
   */
  enableAll: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      return await ListenerNotificationService.enableAllNotifications(ctx.user.id);
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to enable notifications',
      });
    }
  }),
});
