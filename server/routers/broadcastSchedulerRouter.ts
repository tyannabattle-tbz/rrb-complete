/**
 * Broadcast Scheduler Router — tRPC procedures for schedule management
 * 
 * Provides public and protected procedures for:
 * - Getting current and next schedule entries
 * - Viewing 24-hour schedule for each channel
 * - Managing commercial rotation rules
 * - Real-time broadcast statistics
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure } from "../_core/trpc";
import { router } from "../_core/trpc";
import { getBroadcastScheduler, type ChannelId } from "../services/broadcast-scheduler";

export const broadcastSchedulerRouter = router({
  // Get current entry playing on a channel
  getCurrentEntry: publicProcedure
    .input(z.object({
      channelId: z.enum([
        'legacy_restored',
        'healing_frequencies',
        'proof_vault',
        'qmunity',
        'sweet_miracles',
        'music_radio',
        'studio_sessions',
      ]),
    }))
    .query(({ input }) => {
      const scheduler = getBroadcastScheduler();
      return scheduler.getCurrentEntry(input.channelId as ChannelId);
    }),

  // Get next scheduled entry for a channel
  getNextEntry: publicProcedure
    .input(z.object({
      channelId: z.enum([
        'legacy_restored',
        'healing_frequencies',
        'proof_vault',
        'qmunity',
        'sweet_miracles',
        'music_radio',
        'studio_sessions',
      ]),
    }))
    .query(({ input }) => {
      const scheduler = getBroadcastScheduler();
      return scheduler.getNextEntry(input.channelId as ChannelId);
    }),

  // Get next 24 hours of schedule for a channel
  getNext24Hours: publicProcedure
    .input(z.object({
      channelId: z.enum([
        'legacy_restored',
        'healing_frequencies',
        'proof_vault',
        'qmunity',
        'sweet_miracles',
        'music_radio',
        'studio_sessions',
      ]),
    }))
    .query(({ input }) => {
      const scheduler = getBroadcastScheduler();
      return scheduler.getNext24Hours(input.channelId as ChannelId);
    }),

  // Get schedule for a specific time window
  getScheduleWindow: publicProcedure
    .input(z.object({
      channelId: z.enum([
        'legacy_restored',
        'healing_frequencies',
        'proof_vault',
        'qmunity',
        'sweet_miracles',
        'music_radio',
        'studio_sessions',
      ]),
      startTime: z.number(),
      endTime: z.number(),
    }))
    .query(({ input }) => {
      const scheduler = getBroadcastScheduler();
      return scheduler.getScheduleWindow(
        input.channelId as ChannelId,
        input.startTime,
        input.endTime
      );
    }),

  // Get statistics for a single channel
  getChannelStats: publicProcedure
    .input(z.object({
      channelId: z.enum([
        'legacy_restored',
        'healing_frequencies',
        'proof_vault',
        'qmunity',
        'sweet_miracles',
        'music_radio',
        'studio_sessions',
      ]),
    }))
    .query(({ input }) => {
      const scheduler = getBroadcastScheduler();
      return scheduler.getChannelStats(input.channelId as ChannelId);
    }),

  // Get statistics for all channels
  getAllChannelStats: publicProcedure.query(() => {
    const scheduler = getBroadcastScheduler();
    return scheduler.getAllChannelStats();
  }),

  // Get next commercial break for a channel
  getNextCommercialBreak: publicProcedure
    .input(z.object({
      channelId: z.enum([
        'legacy_restored',
        'healing_frequencies',
        'proof_vault',
        'qmunity',
        'sweet_miracles',
        'music_radio',
        'studio_sessions',
      ]),
    }))
    .query(({ input }) => {
      const scheduler = getBroadcastScheduler();
      return scheduler.getNextCommercialBreak(input.channelId as ChannelId);
    }),

  // Get active commercial rules for a channel (protected)
  getCommercialRules: protectedProcedure
    .input(z.object({
      channelId: z.enum([
        'legacy_restored',
        'healing_frequencies',
        'proof_vault',
        'qmunity',
        'sweet_miracles',
        'music_radio',
        'studio_sessions',
      ]).optional(),
    }))
    .query(({ input }) => {
      const scheduler = getBroadcastScheduler();
      if (input?.channelId) {
        return scheduler.getActiveRulesForChannel(input.channelId as ChannelId);
      }
      return scheduler.getCommercialRules();
    }),

  // Add a commercial rotation rule (protected)
  addCommercialRule: protectedProcedure
    .input(z.object({
      commercialId: z.string(),
      channels: z.array(z.enum([
        'legacy_restored',
        'healing_frequencies',
        'proof_vault',
        'qmunity',
        'sweet_miracles',
        'music_radio',
        'studio_sessions',
      ])),
      frequency: z.number().min(1).max(60),
      priority: z.number().min(1).max(10),
      dayOfWeek: z.array(z.number().min(0).max(6)).optional(),
      hourStart: z.number().min(0).max(23).optional(),
      hourEnd: z.number().min(0).max(23).optional(),
      maxPlaysPerDay: z.number().optional(),
      minGapBetweenPlays: z.number().optional(),
    }))
    .mutation(({ input }) => {
      const scheduler = getBroadcastScheduler();
      scheduler.addCommercialRule({
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        commercialId: input.commercialId,
        channels: input.channels as ChannelId[],
        frequency: input.frequency,
        priority: input.priority,
        dayOfWeek: input.dayOfWeek,
        hourStart: input.hourStart,
        hourEnd: input.hourEnd,
        maxPlaysPerDay: input.maxPlaysPerDay,
        minGapBetweenPlays: input.minGapBetweenPlays,
        isActive: true,
      });
      return { success: true };
    }),

  // Mark an entry as played (protected)
  markAsPlayed: protectedProcedure
    .input(z.object({ entryId: z.string() }))
    .mutation(({ input }) => {
      const scheduler = getBroadcastScheduler();
      scheduler.markAsPlayed(input.entryId);
      return { success: true };
    }),

  // Update entry status (protected)
  updateEntryStatus: protectedProcedure
    .input(z.object({
      entryId: z.string(),
      status: z.enum(['scheduled', 'playing', 'completed', 'skipped', 'error']),
    }))
    .mutation(({ input }) => {
      const scheduler = getBroadcastScheduler();
      scheduler.updateEntryStatus(input.entryId, input.status);
      return { success: true };
    }),

  // Export schedule as JSON (protected)
  exportSchedule: protectedProcedure.query(() => {
    const scheduler = getBroadcastScheduler();
    return scheduler.exportSchedule();
  }),
});
