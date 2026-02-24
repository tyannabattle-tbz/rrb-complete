/**
 * Radio Features Router
 * Handles listener sync, channel history, and recommendations
 */

import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { listenerSyncService } from '../services/listenerSyncService';
import { channelHistoryService } from '../services/channelHistoryService';
import { channelRecommendationService } from '../services/channelRecommendationService';

export const radioFeaturesRouter = router({
  // Listener Sync
  listeners: router({
    /**
     * Get current listener counts for all channels
     */
    getCurrent: publicProcedure.query(async () => {
      const counts = listenerSyncService.getListenerCounts();
      return Object.fromEntries(counts);
    }),

    /**
     * Get trending channels
     */
    getTrending: publicProcedure
      .input(z.object({ limit: z.number().default(5).max(20) }))
      .query(async ({ input }) => {
        return listenerSyncService.getTrendingChannels(input.limit);
      }),

    /**
     * Get statistics for a specific channel
     */
    getChannelStats: publicProcedure
      .input(z.object({ channelId: z.string() }))
      .query(async ({ input }) => {
        return listenerSyncService.getChannelStats(input.channelId);
      }),

    /**
     * Start listener sync service
     */
    startSync: protectedProcedure.mutation(async () => {
      listenerSyncService.start();
      return { status: 'started' };
    }),

    /**
     * Stop listener sync service
     */
    stopSync: protectedProcedure.mutation(async () => {
      listenerSyncService.stop();
      return { status: 'stopped' };
    }),
  }),

  // Channel History
  history: router({
    /**
     * Record a channel play
     */
    recordPlay: protectedProcedure
      .input(z.object({
        channelId: z.string(),
        channelName: z.string(),
        duration: z.number(),
        genre: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        channelHistoryService.recordPlay(ctx.user.id, {
          channelId: input.channelId,
          channelName: input.channelName,
          duration: input.duration,
          genre: input.genre,
        });
        return { success: true };
      }),

    /**
     * Get recently played channels
     */
    getRecent: protectedProcedure
      .input(z.object({ limit: z.number().default(10).max(50) }))
      .query(async ({ input, ctx }) => {
        return channelHistoryService.getRecentlyPlayed(ctx.user.id, input.limit);
      }),

    /**
     * Get most played channels
     */
    getMostPlayed: protectedProcedure
      .input(z.object({ limit: z.number().default(5).max(20) }))
      .query(async ({ input, ctx }) => {
        return channelHistoryService.getMostPlayed(ctx.user.id, input.limit);
      }),

    /**
     * Get favorite genres
     */
    getFavoriteGenres: protectedProcedure
      .input(z.object({ limit: z.number().default(5).max(20) }))
      .query(async ({ input, ctx }) => {
        return channelHistoryService.getFavoriteGenres(ctx.user.id, input.limit);
      }),

    /**
     * Get total listening time
     */
    getTotalTime: protectedProcedure.query(async ({ ctx }) => {
      const ms = channelHistoryService.getTotalListeningTime(ctx.user.id);
      const hours = Math.floor(ms / (1000 * 60 * 60));
      const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      return { milliseconds: ms, hours, minutes };
    }),

    /**
     * Clear all history
     */
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      channelHistoryService.clearHistory(ctx.user.id);
      return { success: true };
    }),

    /**
     * Export history
     */
    export: protectedProcedure.query(async ({ ctx }) => {
      return channelHistoryService.exportHistory(ctx.user.id);
    }),
  }),

  // Recommendations
  recommendations: router({
    /**
     * Get recommendations based on current channel
     */
    forChannel: publicProcedure
      .input(z.object({
        channelId: z.string(),
        limit: z.number().default(5).max(20),
      }))
      .query(async ({ input }) => {
        return channelRecommendationService.getRecommendationsForChannel(
          input.channelId,
          input.limit
        );
      }),

    /**
     * Get personalized recommendations for logged-in user
     */
    personalized: protectedProcedure
      .input(z.object({ limit: z.number().default(5).max(20) }))
      .query(async ({ input, ctx }) => {
        return channelRecommendationService.getPersonalizedRecommendations(
          ctx.user.id,
          input.limit
        );
      }),

    /**
     * Get trending recommendations
     */
    trending: publicProcedure
      .input(z.object({ limit: z.number().default(5).max(20) }))
      .query(async ({ input }) => {
        return channelRecommendationService.getTrendingRecommendations(input.limit);
      }),

    /**
     * Get discovery recommendations (new genres)
     */
    discovery: protectedProcedure
      .input(z.object({ limit: z.number().default(5).max(20) }))
      .query(async ({ input, ctx }) => {
        return channelRecommendationService.getDiscoveryRecommendations(
          ctx.user.id,
          input.limit
        );
      }),
  }),
});
