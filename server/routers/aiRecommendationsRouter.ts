/**
 * AI Recommendations tRPC Router
 * Machine learning recommendation procedures
 * A Canryn Production
 */
import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { aiRecommendationsService } from '../services/ai-recommendations-service';

export const aiRecommendationsRouter = router({
  trackWatch: publicProcedure
    .input(z.object({
      userId: z.string(),
      videoId: z.string(),
      tags: z.array(z.string()),
      duration: z.number(),
      watchedDuration: z.number(),
    }))
    .mutation(({ input }) => {
      aiRecommendationsService.trackWatch(
        input.userId,
        input.videoId,
        input.tags,
        input.duration,
        input.watchedDuration
      );
      return { success: true };
    }),

  trackEngagement: publicProcedure
    .input(z.object({
      userId: z.string(),
      videoId: z.string(),
      engagementType: z.enum(['like', 'comment', 'share']),
      tags: z.array(z.string()),
    }))
    .mutation(({ input }) => {
      aiRecommendationsService.trackEngagement(
        input.userId,
        input.videoId,
        input.engagementType,
        input.tags
      );
      return { success: true };
    }),

  getRecommendations: publicProcedure
    .input(z.object({
      userId: z.string(),
      allVideos: z.array(z.any()),
      limit: z.number().default(10),
    }))
    .query(({ input }) => {
      return aiRecommendationsService.getRecommendations(
        input.userId,
        input.allVideos,
        input.limit
      );
    }),

  getTrendingRecommendations: publicProcedure
    .input(z.object({
      allVideos: z.array(z.any()),
      limit: z.number().default(10),
    }))
    .query(({ input }) => {
      return aiRecommendationsService.getTrendingRecommendations(
        input.allVideos,
        input.limit
      );
    }),

  getSimilarVideos: publicProcedure
    .input(z.object({
      videoId: z.string(),
      allVideos: z.array(z.any()),
      limit: z.number().default(5),
    }))
    .query(({ input }) => {
      return aiRecommendationsService.getSimilarVideos(
        input.videoId,
        input.allVideos,
        input.limit
      );
    }),

  findSimilarUsers: publicProcedure
    .input(z.object({
      userId: z.string(),
      limit: z.number().default(5),
    }))
    .query(({ input }) => {
      const allProfiles = Array.from(
        new Map(
          Array.from({ length: 10 }, (_, i) => [
            `user-${i}`,
            aiRecommendationsService.getUserProfile(`user-${i}`) || {
              userId: `user-${i}`,
              watchHistory: [],
              preferences: new Map(),
              engagementScores: new Map(),
            },
          ])
        ).values()
      );
      return aiRecommendationsService.findSimilarUsers(
        input.userId,
        allProfiles,
        input.limit
      );
    }),

  getUserProfile: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      return aiRecommendationsService.getUserProfile(input.userId);
    }),

  clearUserHistory: publicProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(({ input }) => {
      aiRecommendationsService.clearUserHistory(input.userId);
      return { success: true };
    }),
});
