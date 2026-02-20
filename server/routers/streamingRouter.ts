/**
 * Streaming Router — tRPC procedures for audio streaming
 * 
 * Provides public procedures for:
 * - Getting channel configurations and HLS URLs
 * - Registering/unregistering listener connections
 * - Getting current and upcoming segments
 * - Real-time streaming metrics
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure } from "../_core/trpc";
import { router } from "../_core/trpc";
import { getStreamingInfrastructure, type ChannelId } from "../services/streaming-infrastructure";

const CHANNEL_IDS = [
  'legacy_restored',
  'healing_frequencies',
  'proof_vault',
  'qmunity',
  'sweet_miracles',
  'music_radio',
  'studio_sessions',
] as const;

export const streamingRouter = router({
  // Get all available channels
  getAllChannels: publicProcedure.query(() => {
    const infrastructure = getStreamingInfrastructure();
    return infrastructure.getAllChannels();
  }),

  // Get specific channel configuration
  getChannel: publicProcedure
    .input(z.object({
      channelId: z.enum(CHANNEL_IDS),
    }))
    .query(({ input }) => {
      const infrastructure = getStreamingInfrastructure();
      return infrastructure.getChannelConfig(input.channelId as ChannelId);
    }),

  // Get HLS manifest URL for a channel
  getHLSManifest: publicProcedure
    .input(z.object({
      channelId: z.enum(CHANNEL_IDS),
      bitrate: z.number().optional(),
    }))
    .query(({ input }) => {
      const infrastructure = getStreamingInfrastructure();
      const config = infrastructure.getChannelConfig(input.channelId as ChannelId);
      if (!config) throw new Error('Channel not found');

      const bitrate = input.bitrate || config.defaultBitrate;
      const url = infrastructure.getHLSManifestUrl(input.channelId as ChannelId, bitrate);

      return {
        url,
        bitrate,
        availableBitrates: config.bitrates,
        codec: config.codec,
      };
    }),

  // Get WebSocket URL for real-time streaming
  getWebSocketUrl: publicProcedure
    .input(z.object({
      channelId: z.enum(CHANNEL_IDS),
    }))
    .query(({ input }) => {
      const infrastructure = getStreamingInfrastructure();
      return {
        url: infrastructure.getWebSocketUrl(input.channelId as ChannelId),
        channelId: input.channelId,
      };
    }),

  // Get channel health status
  getChannelHealth: publicProcedure
    .input(z.object({
      channelId: z.enum(CHANNEL_IDS),
    }))
    .query(({ input }) => {
      const infrastructure = getStreamingInfrastructure();
      return infrastructure.getChannelHealth(input.channelId as ChannelId);
    }),

  // Get all channel health statuses
  getAllChannelHealth: publicProcedure.query(() => {
    const infrastructure = getStreamingInfrastructure();
    return infrastructure.getAllChannelHealth();
  }),

  // Get current segment playing on a channel
  getCurrentSegment: publicProcedure
    .input(z.object({
      channelId: z.enum(CHANNEL_IDS),
    }))
    .query(({ input }) => {
      const infrastructure = getStreamingInfrastructure();
      return infrastructure.getCurrentSegment(input.channelId as ChannelId);
    }),

  // Get next segment for a channel
  getNextSegment: publicProcedure
    .input(z.object({
      channelId: z.enum(CHANNEL_IDS),
    }))
    .query(({ input }) => {
      const infrastructure = getStreamingInfrastructure();
      return infrastructure.getNextSegment(input.channelId as ChannelId);
    }),

  // Get upcoming segments for a channel
  getUpcomingSegments: publicProcedure
    .input(z.object({
      channelId: z.enum(CHANNEL_IDS),
      count: z.number().min(1).max(20).optional(),
    }))
    .query(({ input }) => {
      const infrastructure = getStreamingInfrastructure();
      return infrastructure.getUpcomingSegments(input.channelId as ChannelId, input.count || 5);
    }),

  // Get channel metrics
  getChannelMetrics: publicProcedure
    .input(z.object({
      channelId: z.enum(CHANNEL_IDS),
    }))
    .query(({ input }) => {
      const infrastructure = getStreamingInfrastructure();
      return infrastructure.getChannelMetrics(input.channelId as ChannelId);
    }),

  // Get all channel metrics
  getAllMetrics: publicProcedure.query(() => {
    const infrastructure = getStreamingInfrastructure();
    return infrastructure.getAllMetrics();
  }),

  // Get active listeners for a channel
  getChannelListeners: publicProcedure
    .input(z.object({
      channelId: z.enum(CHANNEL_IDS),
    }))
    .query(({ input }) => {
      const infrastructure = getStreamingInfrastructure();
      const listeners = infrastructure.getChannelListeners(input.channelId as ChannelId);
      return {
        channelId: input.channelId,
        activeListeners: listeners.length,
        listeners: listeners.map(l => ({
          id: l.id,
          bitrate: l.bitrate,
          connectedAt: l.connectedAt,
          bytesReceived: l.bytesReceived,
        })),
      };
    }),

  // Register a listener connection (protected)
  registerListener: protectedProcedure
    .input(z.object({
      channelId: z.enum(CHANNEL_IDS),
      bitrate: z.number().min(64).max(320),
    }))
    .mutation(({ input, ctx }) => {
      const infrastructure = getStreamingInfrastructure();
      const connectionId = infrastructure.registerListener(
        input.channelId as ChannelId,
        ctx.req.ip || 'unknown',
        ctx.req.headers['user-agent'] || 'unknown',
        input.bitrate,
        ctx.user?.id.toString()
      );

      return {
        connectionId,
        channelId: input.channelId,
        bitrate: input.bitrate,
      };
    }),

  // Unregister a listener connection (protected)
  unregisterListener: protectedProcedure
    .input(z.object({
      connectionId: z.string(),
    }))
    .mutation(({ input }) => {
      const infrastructure = getStreamingInfrastructure();
      infrastructure.unregisterListener(input.connectionId);
      return { success: true };
    }),

  // Update listener heartbeat (protected)
  updateListenerHeartbeat: protectedProcedure
    .input(z.object({
      connectionId: z.string(),
      bytesReceived: z.number().min(0),
    }))
    .mutation(({ input }) => {
      const infrastructure = getStreamingInfrastructure();
      infrastructure.updateListenerHeartbeat(input.connectionId, input.bytesReceived);
      return { success: true };
    }),

  // Export streaming infrastructure state (protected)
  exportState: protectedProcedure.query(() => {
    const infrastructure = getStreamingInfrastructure();
    return infrastructure.exportState();
  }),
});
