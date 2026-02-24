/**
 * Stream Router
 * Provides tRPC endpoints for stream proxying and health checks
 */

import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { StreamProxyService } from '../services/streamProxyService';
import { StreamFallbackService } from '../services/streamFallbackService';

export const streamRouter = router({
  /**
   * Get stream health status
   */
  checkHealth: publicProcedure
    .input(z.object({ url: z.string().url() }))
    .query(async ({ input }) => {
      const isHealthy = await StreamProxyService.checkStreamHealth(input.url);
      return { healthy: isHealthy, url: input.url };
    }),

  /**
   * Get stream metadata
   */
  getMetadata: publicProcedure
    .input(z.object({ url: z.string().url() }))
    .query(async ({ input }) => {
      const metadata = await StreamProxyService.getStreamMetadata(input.url);
      return metadata || { error: 'Could not fetch metadata' };
    }),

  /**
   * Verify stream is accessible
   */
  verify: publicProcedure
    .input(z.object({ url: z.string().url() }))
    .query(async ({ input }) => {
      try {
        const healthy = await StreamProxyService.checkStreamHealth(input.url);
        const metadata = await StreamProxyService.getStreamMetadata(input.url);
        return {
          accessible: healthy,
          metadata,
          url: input.url,
        };
      } catch (error) {
        return {
          accessible: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          url: input.url,
        };
      }
    }),

  /**
   * Get best available stream with automatic fallback
   */
  getBestStream: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ input }) => {
      const result = await StreamFallbackService.getBestStream(input.channelId);
      return result;
    }),

  /**
   * Get all registered channels
   */
  getChannels: publicProcedure.query(() => {
    return StreamFallbackService.getChannels();
  }),

  /**
   * Get channel configuration with fallbacks
   */
  getChannelConfig: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .query(({ input }) => {
      return StreamFallbackService.getChannelConfig(input.channelId);
    }),

  /**
   * Get cache statistics
   */
  getCacheStats: publicProcedure.query(() => {
    return StreamFallbackService.getCacheStats();
  }),

  /**
   * Clear health cache
   */
  clearCache: publicProcedure
    .input(z.object({ url: z.string().optional() }))
    .mutation(({ input }) => {
      StreamFallbackService.clearCache(input.url);
      return { success: true };
    }),
});
