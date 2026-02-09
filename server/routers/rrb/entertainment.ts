/**
 * Entertainment Platform tRPC Router
 * Procedures for media studio, audio streaming, recommendations, and monetization
 */

import { router, protectedProcedure, publicProcedure } from '../../_core/trpc';
import { z } from 'zod';
import * as mediaStudio from '../../entertainment-media-studio';
import * as audioStreaming from '../../entertainment-audio-streaming';
import * as recommendations from '../../entertainment-ai-recommendations';
import * as monetization from '../../entertainment-monetization';

export const entertainmentRouter = router({
  // ============================================
  // Media Studio Procedures
  // ============================================

  createProject: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        projectType: z.enum(['video', 'podcast', 'live_stream', 'shorts', 'music', 'other']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return mediaStudio.createMediaProject({
        userId: ctx.user.id,
        ...input,
      });
    }),

  getProjects: protectedProcedure.query(async ({ ctx }) => {
    return mediaStudio.getUserProjects(ctx.user.id);
  }),

  getProject: publicProcedure.input(z.object({ projectId: z.string() })).query(async ({ input }) => {
    return mediaStudio.getProjectDetails(input.projectId);
  }),

  updateProjectStatus: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        status: z.enum(['draft', 'recording', 'editing', 'published', 'archived']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return mediaStudio.updateProjectStatus(input.projectId, input.status, ctx.user.id);
    }),

  generateAIContent: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        contentType: z.enum(['title', 'description', 'tags', 'thumbnail_prompt']),
      })
    )
    .mutation(async ({ input }) => {
      return mediaStudio.generateAIContent({
        projectId: input.projectId,
        contentType: input.contentType,
        context: {},
      });
    }),

  publishProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        platforms: z.array(
          z.enum(['youtube', 'spotify', 'tiktok', 'instagram', 'facebook', 'twitter', 'linkedin', 'podcast_host', 'direct'])
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return mediaStudio.publishProject(input, ctx.user.id);
    }),

  getProjectAnalytics: publicProcedure.input(z.object({ projectId: z.string() })).query(async ({ input }) => {
    return mediaStudio.getProjectAnalytics(input.projectId);
  }),

  getTrendingProjects: publicProcedure.query(async () => {
    return mediaStudio.getTrendingProjects(10);
  }),

  // ============================================
  // Audio Streaming Procedures
  // ============================================

  getAudioContent: publicProcedure.input(z.object({ contentId: z.string() })).query(async ({ input }) => {
    return audioStreaming.getAudioContent(input.contentId);
  }),

  getAudioByType: publicProcedure
    .input(z.object({ contentType: z.string(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      return audioStreaming.getAudioByType(input.contentType, input.limit);
    }),

  getAudioByCategory: publicProcedure
    .input(z.object({ category: z.string(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      return audioStreaming.getAudioByCategory(input.category, input.limit);
    }),

  recordPlayback: protectedProcedure
    .input(
      z.object({
        contentId: z.string(),
        playDuration: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return audioStreaming.recordPlayback({
        userId: ctx.user.id,
        contentId: input.contentId,
        playDuration: input.playDuration,
      });
    }),

  addToFavorites: protectedProcedure
    .input(z.object({ contentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return audioStreaming.addToFavorites(ctx.user.id, input.contentId);
    }),

  removeFromFavorites: protectedProcedure
    .input(z.object({ contentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return audioStreaming.removeFromFavorites(ctx.user.id, input.contentId);
    }),

  rateAudio: protectedProcedure
    .input(z.object({ contentId: z.string(), rating: z.number().min(0).max(5) }))
    .mutation(async ({ input, ctx }) => {
      return audioStreaming.rateAudioContent(ctx.user.id, input.contentId, input.rating);
    }),

  getUserFavorites: protectedProcedure.query(async ({ ctx }) => {
    return audioStreaming.getUserFavorites(ctx.user.id);
  }),

  getTrendingAudio: publicProcedure.query(async () => {
    return audioStreaming.getTrendingAudio(10);
  }),

  getTopRatedAudio: publicProcedure.query(async () => {
    return audioStreaming.getTopRatedAudio(10);
  }),

  searchAudio: publicProcedure.input(z.object({ query: z.string() })).query(async ({ input }) => {
    return audioStreaming.searchAudio(input.query);
  }),

  // ============================================
  // Recommendation Procedures
  // ============================================

  getPersonalizedRecommendations: protectedProcedure.query(async ({ ctx }) => {
    return recommendations.generatePersonalizedRecommendations({
      userId: ctx.user.id,
      limit: 10,
    });
  }),

  getTrendingRecommendations: protectedProcedure.query(async ({ ctx }) => {
    return recommendations.generateTrendingRecommendations({
      userId: ctx.user.id,
      limit: 10,
    });
  }),

  getSimilarRecommendations: protectedProcedure
    .input(z.object({ contentId: z.string() }))
    .query(async ({ input, ctx }) => {
      return recommendations.generateSimilarRecommendations(input.contentId, ctx.user.id);
    }),

  getNewReleaseRecommendations: protectedProcedure.query(async ({ ctx }) => {
    return recommendations.generateNewReleaseRecommendations({
      userId: ctx.user.id,
      limit: 10,
    });
  }),

  trackRecommendationClick: protectedProcedure
    .input(z.object({ recommendationId: z.string() }))
    .mutation(async ({ input }) => {
      return recommendations.trackRecommendationClick(input.recommendationId);
    }),

  getRecommendationMetrics: protectedProcedure.query(async ({ ctx }) => {
    return recommendations.getRecommendationMetrics(ctx.user.id);
  }),

  // ============================================
  // Monetization Procedures
  // ============================================

  recordMonetizationEvent: protectedProcedure
    .input(
      z.object({
        contentId: z.string().optional(),
        projectId: z.string().optional(),
        eventType: z.enum(['ad_impression', 'ad_click', 'subscription', 'donation', 'merchandise', 'sponsorship', 'affiliate']),
        platform: z.string().optional(),
        revenue: z.number(),
        currency: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return monetization.recordMonetizationEvent({
        userId: ctx.user.id,
        ...input,
      });
    }),

  getUserTotalRevenue: protectedProcedure.query(async ({ ctx }) => {
    return monetization.getUserTotalRevenue(ctx.user.id);
  }),

  getRevenueByEventType: protectedProcedure.query(async ({ ctx }) => {
    return monetization.getRevenueByEventType(ctx.user.id);
  }),

  getRevenueByPlatform: protectedProcedure.query(async ({ ctx }) => {
    return monetization.getRevenueByPlatform(ctx.user.id);
  }),

  getRevenueByContent: protectedProcedure.query(async ({ ctx }) => {
    return monetization.getRevenueByContent(ctx.user.id);
  }),

  getRevenueReport: protectedProcedure
    .input(z.object({ period: z.enum(['daily', 'weekly', 'monthly', 'yearly']) }))
    .query(async ({ input, ctx }) => {
      return monetization.getRevenueReport({
        userId: ctx.user.id,
        period: input.period,
      });
    }),

  getPayoutHistory: protectedProcedure.query(async ({ ctx }) => {
    return monetization.getPayoutHistory(ctx.user.id);
  }),

  getPlatformRevenueMetrics: publicProcedure.query(async () => {
    return monetization.getPlatformRevenueMetrics();
  }),

  getMonetizationSettings: protectedProcedure.query(async ({ ctx }) => {
    return monetization.getMonetizationSettings(ctx.user.id);
  }),
});
