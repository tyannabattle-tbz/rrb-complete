import { publicProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import {
  getAllAudioTracks,
  getAudioTrackById,
  searchAudioTracks,
  getAudioTracksByFrequency,
  getAudioTracksByGenre,
  getTopListenedTracks,
  getRecentlyAddedTracks,
  getStreamingStats,
  createLiveStream,
} from '../audio-streaming';
import { TIER_PRICING, createCheckoutSession } from '../stripe-integration';

export const audioRouter = router({
  // Get all audio tracks
  getAllTracks: publicProcedure.query(async () => {
    return getAllAudioTracks();
  }),

  // Get track by ID
  getTrackById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return getAudioTrackById(input.id);
  }),

  // Search tracks
  searchTracks: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      return searchAudioTracks(input.query);
    }),

  // Get tracks by frequency
  getTracksByFrequency: publicProcedure
    .input(z.object({ frequency: z.number() }))
    .query(async ({ input }) => {
      return getAudioTracksByFrequency(input.frequency);
    }),

  // Get tracks by genre
  getTracksByGenre: publicProcedure
    .input(z.object({ genre: z.string() }))
    .query(async ({ input }) => {
      return getAudioTracksByGenre(input.genre);
    }),

  // Get top listened tracks
  getTopTracks: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      return getTopListenedTracks(input.limit);
    }),

  // Get recently added tracks
  getRecentTracks: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      return getRecentlyAddedTracks(input.limit);
    }),

  // Get streaming statistics
  getStats: publicProcedure.query(async () => {
    return getStreamingStats();
  }),

  // Create live stream
  createLiveStream: publicProcedure
    .input(
      z.object({
        title: z.string(),
        frequency: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createLiveStream(input.title, input.frequency);
    }),

  // Get tier pricing
  getTierPricing: publicProcedure.query(async () => {
    return TIER_PRICING;
  }),

  // Create checkout session
  createCheckout: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        userEmail: z.string().email(),
        tier: z.enum(['professional', 'advanced']),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await createCheckoutSession(
          input.userId,
          input.userEmail,
          input.tier,
          input.successUrl,
          input.cancelUrl
        );
        return result;
      } catch (error) {
        throw new Error(`Failed to create checkout session: ${(error as Error).message}`);
      }
    }),
});
