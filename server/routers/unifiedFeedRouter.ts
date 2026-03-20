/**
 * Unified Feed Router
 * Serves Ty OS registry to QUMUS, RRB, and all subsystems
 */

import { router, publicProcedure } from '../_core/trpc';
import { tyOSFeedService } from '../services/tyOSUnifiedFeedService';
import { z } from 'zod';

export const unifiedFeedRouter = router({
  /**
   * Get all channels (for QUMUS and RRB)
   */
  getAllChannels: publicProcedure.query(async () => {
    return tyOSFeedService.getAllChannels();
  }),

  /**
   * Get single channel by ID
   */
  getChannel: publicProcedure
    .input(z.object({ numericId: z.number() }))
    .query(async ({ input }) => {
      return tyOSFeedService.getChannel(input.numericId);
    }),

  /**
   * Get channels by genre (for QUMUS filtering)
   */
  getChannelsByGenre: publicProcedure
    .input(z.object({ genre: z.string() }))
    .query(async ({ input }) => {
      return tyOSFeedService.getChannelsByGenre(input.genre);
    }),

  /**
   * Get feed for QUMUS (full metadata)
   */
  getFeedForQUMUS: publicProcedure.query(async () => {
    return tyOSFeedService.getFeedForQUMUS();
  }),

  /**
   * Get feed for RRB (stream URLs only)
   */
  getFeedForRRB: publicProcedure.query(async () => {
    return tyOSFeedService.getFeedForRRB();
  }),

  /**
   * Get channel status
   */
  getChannelStatus: publicProcedure
    .input(z.object({ numericId: z.number() }))
    .query(async ({ input }) => {
      return tyOSFeedService.getChannelStatus(input.numericId);
    }),

  /**
   * Get all channel statuses
   */
  getAllChannelStatuses: publicProcedure.query(async () => {
    return tyOSFeedService.getAllChannelStatuses();
  }),

  /**
   * Get sync status
   */
  getSyncStatus: publicProcedure.query(async () => {
    return tyOSFeedService.getSyncStatus();
  }),


});
