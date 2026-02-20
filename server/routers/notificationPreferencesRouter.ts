/**
 * Notification Preferences tRPC Router
 * User notification settings and preferences
 * A Canryn Production
 */
import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { notificationPreferencesService } from '../services/notification-preferences-service';

export const notificationPreferencesRouter = router({
  // Get user notification settings
  getUserSettings: protectedProcedure
    .query(({ ctx }) => {
      return notificationPreferencesService.getUserSettings(ctx.user.id.toString());
    }),

  // Update notification preference
  updatePreference: protectedProcedure
    .input(z.object({
      notificationType: z.enum(['likes', 'replies', 'recommendations', 'playlist_shares', 'new_videos', 'system']),
      enabled: z.boolean().optional(),
      frequency: z.enum(['instant', 'daily', 'weekly', 'never']).optional(),
    }))
    .mutation(({ ctx, input }) => {
      return notificationPreferencesService.updatePreference(
        ctx.user.id.toString(),
        input.notificationType,
        {
          enabled: input.enabled,
          frequency: input.frequency,
        }
      );
    }),

  // Update notification channels
  updateChannels: protectedProcedure
    .input(z.object({
      notificationType: z.enum(['likes', 'replies', 'recommendations', 'playlist_shares', 'new_videos', 'system']),
      push: z.boolean().optional(),
      email: z.boolean().optional(),
      in_app: z.boolean().optional(),
    }))
    .mutation(({ ctx, input }) => {
      return notificationPreferencesService.updateChannels(
        ctx.user.id.toString(),
        input.notificationType,
        {
          push: input.push,
          email: input.email,
          in_app: input.in_app,
        }
      );
    }),

  // Update frequency level
  updateFrequency: protectedProcedure
    .input(z.object({
      notificationType: z.enum(['likes', 'replies', 'recommendations', 'playlist_shares', 'new_videos', 'system']),
      frequency: z.enum(['instant', 'daily', 'weekly', 'never']),
    }))
    .mutation(({ ctx, input }) => {
      return notificationPreferencesService.updateFrequency(
        ctx.user.id.toString(),
        input.notificationType,
        input.frequency
      );
    }),

  // Toggle notification type
  toggleNotificationType: protectedProcedure
    .input(z.object({
      notificationType: z.enum(['likes', 'replies', 'recommendations', 'playlist_shares', 'new_videos', 'system']),
      enabled: z.boolean(),
    }))
    .mutation(({ ctx, input }) => {
      return notificationPreferencesService.toggleNotificationType(
        ctx.user.id.toString(),
        input.notificationType,
        input.enabled
      );
    }),

  // Set do-not-disturb hours
  setDoNotDisturb: protectedProcedure
    .input(z.object({
      startTime: z.string(), // HH:MM format
      endTime: z.string(),   // HH:MM format
      enabled: z.boolean(),
    }))
    .mutation(({ ctx, input }) => {
      return notificationPreferencesService.setDoNotDisturb(
        ctx.user.id.toString(),
        input.startTime,
        input.endTime,
        input.enabled
      );
    }),

  // Check if in do-not-disturb period
  isInDoNotDisturb: protectedProcedure
    .query(({ ctx }) => {
      const isInDND = notificationPreferencesService.isInDoNotDisturb(ctx.user.id.toString());
      return { inDoNotDisturb: isInDND };
    }),

  // Check if notification should be sent
  shouldSendNotification: protectedProcedure
    .input(z.object({
      notificationType: z.enum(['likes', 'replies', 'recommendations', 'playlist_shares', 'new_videos', 'system']),
      channel: z.enum(['push', 'email', 'in_app']),
    }))
    .query(({ ctx, input }) => {
      const should = notificationPreferencesService.shouldSendNotification(
        ctx.user.id.toString(),
        input.notificationType,
        input.channel
      );
      return { shouldSend: should };
    }),

  // Export preferences
  exportPreferences: protectedProcedure
    .query(({ ctx }) => {
      const data = notificationPreferencesService.exportPreferences(ctx.user.id.toString());
      return {
        data,
        exportedAt: new Date(),
      };
    }),

  // Import preferences
  importPreferences: protectedProcedure
    .input(z.object({ jsonData: z.string() }))
    .mutation(({ ctx, input }) => {
      const result = notificationPreferencesService.importPreferences(ctx.user.id.toString(), input.jsonData);
      return {
        success: result !== null,
        settings: result,
      };
    }),
});
