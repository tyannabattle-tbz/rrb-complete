import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import * as scheduleService from '../services/channelScheduleService';

export const channelScheduleRouter = router({
  /**
   * Get current show for a channel
   */
  getCurrentShow: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ input }) => {
      return await scheduleService.getCurrentShow(input.channelId);
    }),

  /**
   * Get next show for a channel
   */
  getNextShow: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ input }) => {
      return await scheduleService.getNextShow(input.channelId);
    }),

  /**
   * Get channel schedule for a date range
   */
  getChannelSchedule: publicProcedure
    .input(
      z.object({
        channelId: z.string(),
        startTime: z.number(),
        endTime: z.number(),
      })
    )
    .query(async ({ input }) => {
      return await scheduleService.getChannelSchedule(
        input.channelId,
        input.startTime,
        input.endTime
      );
    }),

  /**
   * Get full channel schedule with current and next shows
   */
  getFullChannelSchedule: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ input }) => {
      return await scheduleService.getFullChannelSchedule(input.channelId);
    }),

  /**
   * Get all shows for a channel
   */
  getChannelShows: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ input }) => {
      return await scheduleService.getChannelShows(input.channelId);
    }),

  /**
   * Create a scheduled show (protected - requires authentication)
   */
  createScheduledShow: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        title: z.string(),
        artist: z.string(),
        startTime: z.number(),
        endTime: z.number(),
        description: z.string(),
        isRecurring: z.boolean().default(false),
        recurringDays: z.array(z.number()).optional(),
        duration: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const show = {
        id: `show-${Date.now()}-${Math.random()}`,
        ...input,
      };
      return await scheduleService.createScheduledShow(show);
    }),

  /**
   * Update a scheduled show (protected)
   */
  updateScheduledShow: protectedProcedure
    .input(
      z.object({
        showId: z.string(),
        title: z.string().optional(),
        artist: z.string().optional(),
        startTime: z.number().optional(),
        endTime: z.number().optional(),
        description: z.string().optional(),
        isRecurring: z.boolean().optional(),
        recurringDays: z.array(z.number()).optional(),
        duration: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { showId, ...updates } = input;
      return await scheduleService.updateScheduledShow(showId, updates);
    }),

  /**
   * Delete a scheduled show (protected)
   */
  deleteScheduledShow: protectedProcedure
    .input(z.object({ showId: z.string() }))
    .mutation(async ({ input }) => {
      return await scheduleService.deleteScheduledShow(input.showId);
    }),

  /**
   * Create a channel schedule
   */
  createChannelSchedule: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        channelName: z.string(),
        autoRotate: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      return await scheduleService.createChannelSchedule(
        input.channelId,
        input.channelName,
        input.autoRotate
      );
    }),

  /**
   * Update channel schedule settings
   */
  updateChannelSchedule: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        autoRotate: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { channelId, ...updates } = input;
      return await scheduleService.updateChannelSchedule(channelId, updates);
    }),

  /**
   * Get all channel schedules
   */
  getAllChannelSchedules: publicProcedure.query(async () => {
    return await scheduleService.getAllChannelSchedules();
  }),

  /**
   * Get upcoming shows across all channels
   */
  getUpcomingShows: publicProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ input }) => {
      return await scheduleService.getUpcomingShows(input.limit);
    }),

  /**
   * Get trending shows (currently playing)
   */
  getTrendingShows: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      return await scheduleService.getTrendingShows(input.limit);
    }),
});
