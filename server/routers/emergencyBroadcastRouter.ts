/**
 * Emergency Broadcast Router — tRPC procedures for emergency broadcasts
 * 
 * Provides protected procedures for:
 * - Creating and managing emergency broadcasts
 * - Broadcasting across multiple channels
 * - Sending alerts and notifications
 * - Viewing broadcast history and statistics
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure } from "../_core/trpc";
import { router } from "../_core/trpc";
import { getEmergencyBroadcastScheduler, type ChannelId, type EmergencyLevel, type EmergencyType } from "../services/emergency-broadcast-scheduler";

const CHANNEL_IDS = [
  'legacy_restored',
  'healing_frequencies',
  'proof_vault',
  'qmunity',
  'sweet_miracles',
  'music_radio',
  'studio_sessions',
] as const;

export const emergencyBroadcastRouter = router({
  // Create a new emergency broadcast (protected)
  createBroadcast: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      description: z.string().min(1).max(1000),
      content: z.string().min(1),
      level: z.enum(['critical', 'high', 'medium', 'low']),
      type: z.enum(['weather', 'health', 'security', 'infrastructure', 'community', 'general']),
      channels: z.array(z.enum(CHANNEL_IDS)).min(1),
      duration: z.number().min(10).max(3600),
      audioUrl: z.string().optional(),
      notifyListeners: z.boolean().optional(),
      repeatOnChannels: z.boolean().optional(),
      autoRepeatInterval: z.number().optional(),
    }))
    .mutation(({ input, ctx }) => {
      const scheduler = getEmergencyBroadcastScheduler();
      return scheduler.createBroadcast(
        input.title,
        input.description,
        input.content,
        {
          level: input.level as EmergencyLevel,
          type: input.type as EmergencyType,
          channels: input.channels as ChannelId[],
          duration: input.duration,
          audioUrl: input.audioUrl,
          createdBy: ctx.user.id.toString(),
          notifyListeners: input.notifyListeners,
          repeatOnChannels: input.repeatOnChannels,
          autoRepeatInterval: input.autoRepeatInterval,
        }
      );
    }),

  // Start broadcasting (protected)
  startBroadcast: protectedProcedure
    .input(z.object({
      broadcastId: z.string(),
    }))
    .mutation(({ input }) => {
      const scheduler = getEmergencyBroadcastScheduler();
      const success = scheduler.startBroadcast(input.broadcastId);
      return { success };
    }),

  // Stop broadcasting (protected)
  stopBroadcast: protectedProcedure
    .input(z.object({
      broadcastId: z.string(),
    }))
    .mutation(({ input }) => {
      const scheduler = getEmergencyBroadcastScheduler();
      const success = scheduler.stopBroadcast(input.broadcastId);
      return { success };
    }),

  // Cancel broadcast (protected)
  cancelBroadcast: protectedProcedure
    .input(z.object({
      broadcastId: z.string(),
    }))
    .mutation(({ input }) => {
      const scheduler = getEmergencyBroadcastScheduler();
      const success = scheduler.cancelBroadcast(input.broadcastId);
      return { success };
    }),

  // Get active broadcasts (public)
  getActiveBroadcasts: publicProcedure.query(() => {
    const scheduler = getEmergencyBroadcastScheduler();
    return scheduler.getActiveBroadcasts();
  }),

  // Get broadcasts for a channel (public)
  getBroadcastsForChannel: publicProcedure
    .input(z.object({
      channelId: z.enum(CHANNEL_IDS),
    }))
    .query(({ input }) => {
      const scheduler = getEmergencyBroadcastScheduler();
      return scheduler.getBroadcastsForChannel(input.channelId as ChannelId);
    }),

  // Get current broadcast for a channel (public)
  getCurrentBroadcast: publicProcedure
    .input(z.object({
      channelId: z.enum(CHANNEL_IDS),
    }))
    .query(({ input }) => {
      const scheduler = getEmergencyBroadcastScheduler();
      return scheduler.getCurrentBroadcast(input.channelId as ChannelId);
    }),

  // Get broadcast by ID (public)
  getBroadcast: publicProcedure
    .input(z.object({
      broadcastId: z.string(),
    }))
    .query(({ input }) => {
      const scheduler = getEmergencyBroadcastScheduler();
      return scheduler.getBroadcast(input.broadcastId);
    }),

  // Get all broadcasts (protected)
  getAllBroadcasts: protectedProcedure.query(() => {
    const scheduler = getEmergencyBroadcastScheduler();
    return scheduler.getAllBroadcasts();
  }),

  // Get alerts for a broadcast (protected)
  getAlertsForBroadcast: protectedProcedure
    .input(z.object({
      broadcastId: z.string(),
    }))
    .query(({ input }) => {
      const scheduler = getEmergencyBroadcastScheduler();
      return scheduler.getAlertsForBroadcast(input.broadcastId);
    }),

  // Get broadcast history (protected)
  getHistory: protectedProcedure
    .input(z.object({
      broadcastId: z.string().optional(),
    }))
    .query(({ input }) => {
      const scheduler = getEmergencyBroadcastScheduler();
      return scheduler.getHistory(input.broadcastId);
    }),

  // Get statistics (protected)
  getStatistics: protectedProcedure.query(() => {
    const scheduler = getEmergencyBroadcastScheduler();
    return scheduler.getStatistics();
  }),

  // Export all data (protected)
  exportData: protectedProcedure.query(() => {
    const scheduler = getEmergencyBroadcastScheduler();
    return scheduler.exportData();
  }),
});
