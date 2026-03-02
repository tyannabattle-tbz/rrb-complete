import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as rrbChannels from "../rrbChannels";

/**
 * RRB 40+ Channel Streaming Router
 * Manages channels, stream sources, frequencies, and listening history
 */

export const rrbChannelsRouter = router({
  // ============ CHANNEL OPERATIONS ============

  /**
   * Get all active channels
   */
  getAllChannels: publicProcedure.query(async () => {
    return await rrbChannels.getAllChannels();
  }),

  /**
   * Get channel by ID
   */
  getChannelById: publicProcedure
    .input(z.object({ channelId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return await rrbChannels.getChannelById(input.channelId);
    }),

  /**
   * Search channels by name, description, or genre
   */
  searchChannels: publicProcedure
    .input(z.object({ query: z.string().min(1).max(100) }))
    .query(async ({ input }) => {
      return await rrbChannels.searchChannels(input.query);
    }),

  /**
   * Get channels by category (music, healing, talk, community, special)
   */
  getChannelsByCategory: publicProcedure
    .input(z.object({ category: z.string().min(1).max(64) }))
    .query(async ({ input }) => {
      return await rrbChannels.getChannelsByCategory(input.category);
    }),

  /**
   * Create new channel (admin only)
   */
  createChannel: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        category: z.string().min(1).max(64),
        description: z.string().max(1000).optional(),
        genre: z.string().max(64).optional(),
        artwork: z.string().url().optional(),
        priority: z.number().int().default(100),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only admins can create channels
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized: Only admins can create channels");
      }

      const channelId = await rrbChannels.createChannel(
        input.name,
        input.category,
        input.description,
        input.genre,
        input.artwork,
        input.priority
      );

      return { id: channelId, ...input };
    }),

  /**
   * Update channel (admin only)
   */
  updateChannel: protectedProcedure
    .input(
      z.object({
        channelId: z.number().int().positive(),
        name: z.string().max(255).optional(),
        description: z.string().max(1000).optional(),
        genre: z.string().max(64).optional(),
        artwork: z.string().url().optional(),
        priority: z.number().int().optional(),
        isActive: z.number().int().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized: Only admins can update channels");
      }

      const { channelId, ...updates } = input;
      const success = await rrbChannels.updateChannel(channelId, updates as any);
      return { success };
    }),

  // ============ STREAM SOURCE OPERATIONS ============

  /**
   * Get stream sources for a channel (with fallback priority)
   */
  getStreamSources: publicProcedure
    .input(z.object({ channelId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return await rrbChannels.getStreamSourcesForChannel(input.channelId);
    }),

  /**
   * Get the best available stream source for a channel (with fallback logic)
   */
  getBestStreamSource: publicProcedure
    .input(z.object({ channelId: z.number().int().positive() }))
    .query(async ({ input }) => {
      // Try healthy source first
      let source = await rrbChannels.getHealthyStreamSource(input.channelId);
      
      // Fall back to any available source
      if (!source) {
        source = await rrbChannels.getFallbackStreamSource(input.channelId);
      }

      if (!source) {
        throw new Error(`No stream sources available for channel ${input.channelId}`);
      }

      return source;
    }),

  /**
   * Add stream source to channel (admin only)
   */
  addStreamSource: protectedProcedure
    .input(
      z.object({
        channelId: z.number().int().positive(),
        url: z.string().url(),
        sourceType: z.enum(["soma", "icecast", "shoutcast", "generic", "custom"]),
        priority: z.number().int().default(100),
        bitrate: z.number().int().optional(),
        format: z.string().max(32).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized: Only admins can add stream sources");
      }

      const sourceId = await rrbChannels.addStreamSource(
        input.channelId,
        input.url,
        input.sourceType,
        input.priority,
        input.bitrate,
        input.format
      );

      return { id: sourceId, ...input };
    }),

  /**
   * Check health of a stream source
   */
  checkStreamHealth: publicProcedure
    .input(z.object({ sourceId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const isHealthy = await rrbChannels.checkStreamHealth(input.sourceId);
      return { sourceId: input.sourceId, isHealthy };
    }),

  /**
   * Check health of all streams (admin only)
   */
  checkAllStreamsHealth: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized: Only admins can check all streams");
    }

    await rrbChannels.checkAllChannelHealth();
    return { success: true };
  }),

  // ============ FREQUENCY OPERATIONS ============

  /**
   * Get all available Solfeggio frequencies
   */
  getAllFrequencies: publicProcedure.query(async () => {
    return await rrbChannels.getAllFrequencies();
  }),

  /**
   * Get default frequency (432Hz)
   */
  getDefaultFrequency: publicProcedure.query(async () => {
    return await rrbChannels.getDefaultFrequency();
  }),

  /**
   * Get frequency by ID
   */
  getFrequencyById: publicProcedure
    .input(z.object({ frequencyId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return await rrbChannels.getFrequencyById(input.frequencyId);
    }),

  // ============ LISTENING HISTORY ============

  /**
   * Start a listening session
   */
  startListeningSession: protectedProcedure
    .input(
      z.object({
        channelId: z.number().int().positive(),
        frequencyId: z.number().int().positive().optional(),
        deviceType: z.string().max(64).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userAgent = ctx.req?.headers["user-agent"] || undefined;
      const sessionId = await rrbChannels.recordListeningSession(
        ctx.user?.id || null,
        input.channelId,
        input.frequencyId || null,
        input.deviceType,
        userAgent
      );

      return { sessionId };
    }),

  /**
   * End a listening session
   */
  endListeningSession: protectedProcedure
    .input(z.object({ sessionId: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const success = await rrbChannels.endListeningSession(input.sessionId);
      return { success };
    }),

  /**
   * Get user's listening history
   */
  getListeningHistory: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(50) }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.id) {
        throw new Error("User not authenticated");
      }

      return await rrbChannels.getUserListeningHistory(ctx.user.id, input.limit);
    }),

  // ============ CHANNEL STATISTICS ============

  /**
   * Get channel statistics for the last N days
   */
  getChannelStats: publicProcedure
    .input(
      z.object({
        channelId: z.number().int().positive(),
        days: z.number().int().min(1).max(365).default(7),
      })
    )
    .query(async ({ input }) => {
      return await rrbChannels.getChannelStats(input.channelId, input.days);
    }),

  /**
   * Update channel statistics (internal use)
   */
  updateChannelStats: protectedProcedure
    .input(
      z.object({
        channelId: z.number().int().positive(),
        totalListeners: z.number().int().min(0),
        peakListeners: z.number().int().min(0),
        averageSessionDuration: z.number().int().min(0),
        totalStreamTime: z.number().int().min(0),
        uptime: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized: Only admins can update channel stats");
      }

      const success = await rrbChannels.updateChannelStats(
        input.channelId,
        input.totalListeners,
        input.peakListeners,
        input.averageSessionDuration,
        input.totalStreamTime,
        input.uptime
      );

      return { success };
    }),

  // ============ BULK OPERATIONS ============

  /**
   * Import channels from SomaFM or Icecast (admin only)
   */
  importChannels: protectedProcedure
    .input(
      z.object({
        source: z.enum(["soma", "icecast", "custom"]),
        channels: z.array(
          z.object({
            name: z.string(),
            category: z.string(),
            description: z.string().optional(),
            genre: z.string().optional(),
            artwork: z.string().optional(),
            streamUrl: z.string().url(),
            priority: z.number().int().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized: Only admins can import channels");
      }

      const imported: any[] = [];

      for (const channel of input.channels) {
        const channelId = await rrbChannels.createChannel(
          channel.name,
          channel.category,
          channel.description,
          channel.genre,
          channel.artwork,
          channel.priority || 100
        );

        await rrbChannels.addStreamSource(
          channelId,
          channel.streamUrl,
          input.source,
          100
        );

        imported.push({ channelId, ...channel });
      }

      return { imported, count: imported.length };
    }),
});
