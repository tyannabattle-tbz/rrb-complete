import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { aiContentRecommendationsService } from '../services/aiContentRecommendations';

export const aiContentRecommendationsRouter = router({
  /**
   * Get personalized recommendations for listener
   */
  getPersonalizedRecommendations: publicProcedure
    .input(z.object({ listenerId: z.string(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      return await aiContentRecommendationsService.getPersonalizedRecommendations(
        input.listenerId,
        input.limit || 10
      );
    }),

  /**
   * Get trending content recommendations
   */
  getTrendingRecommendations: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      return await aiContentRecommendationsService.getTrendingRecommendations(input.limit || 10);
    }),

  /**
   * Get similar content recommendations
   */
  getSimilarContent: publicProcedure
    .input(z.object({ contentId: z.string(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      return await aiContentRecommendationsService.getSimilarContent(
        input.contentId,
        input.limit || 5
      );
    }),

  /**
   * Get listener profile for recommendations
   */
  getListenerProfile: publicProcedure
    .input(z.object({ listenerId: z.string() }))
    .query(async ({ input }) => {
      return await aiContentRecommendationsService.getListenerProfile(input.listenerId);
    }),

  /**
   * Record recommendation feedback
   */
  recordRecommendationFeedback: publicProcedure
    .input(
      z.object({
        recommendationId: z.string(),
        listenerId: z.string(),
        contentId: z.string(),
        action: z.enum(['clicked', 'played', 'completed', 'skipped', 'disliked']),
        sessionDuration: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await aiContentRecommendationsService.recordRecommendationFeedback({
        ...input,
        timestamp: new Date(),
      });
    }),

  /**
   * Get A/B test recommendations
   */
  getABTestRecommendations: publicProcedure
    .input(z.object({ listenerId: z.string() }))
    .query(async ({ input }) => {
      return await aiContentRecommendationsService.getABTestRecommendations(input.listenerId);
    }),

  /**
   * Get recommendation confidence scores
   */
  getRecommendationConfidence: publicProcedure
    .input(z.object({ contentId: z.string(), listenerId: z.string() }))
    .query(async ({ input }) => {
      return await aiContentRecommendationsService.getRecommendationConfidence(
        input.contentId,
        input.listenerId
      );
    }),

  /**
   * Get recommendation impact metrics
   */
  getRecommendationImpact: publicProcedure
    .input(z.object({ listenerId: z.string() }))
    .query(async ({ input }) => {
      return await aiContentRecommendationsService.getRecommendationImpact(input.listenerId);
    }),
});
