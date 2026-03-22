/**
 * Advanced Monetization tRPC Router
 * Handles analytics, monetization, and social media publishing
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { listenerAnalyticsService } from '../services/listenerAnalyticsService';
import { podcastMonetizationService } from '../services/podcastMonetizationService';
import { socialMediaAutoPublishingService } from '../services/socialMediaAutoPublishingService';

export const advancedMonetizationRouter = router({
  // Listener Analytics Procedures
  analytics: router({
    startSession: publicProcedure
      .input(
        z.object({
          listenerId: z.string(),
          channelId: z.string(),
          channelName: z.string(),
          deviceType: z.enum(['web', 'mobile', 'app', 'smart-speaker']),
          location: z.string().optional()
        })
      )
      .mutation(({ input }) => {
        return listenerAnalyticsService.startSession(
          input.listenerId,
          input.channelId,
          input.channelName,
          input.deviceType,
          input.location
        );
      }),

    endSession: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(({ input }) => {
        return listenerAnalyticsService.endSession(input.sessionId);
      }),

    updateEngagement: publicProcedure
      .input(
        z.object({
          sessionId: z.string(),
          engagement: z.enum(['low', 'medium', 'high'])
        })
      )
      .mutation(({ input }) => {
        listenerAnalyticsService.updateEngagement(input.sessionId, input.engagement);
        return { success: true };
      }),

    getChannelMetrics: publicProcedure
      .input(z.object({ channelId: z.string() }))
      .query(({ input }) => {
        return listenerAnalyticsService.getChannelMetrics(input.channelId);
      }),

    getAllChannelMetrics: publicProcedure.query(() => {
      return listenerAnalyticsService.getAllChannelMetrics();
    }),

    recordPodcastPlay: publicProcedure
      .input(
        z.object({
          episodeId: z.string(),
          title: z.string(),
          duration: z.number(),
          completed: z.boolean()
        })
      )
      .mutation(({ input }) => {
        listenerAnalyticsService.recordPodcastPlay(
          input.episodeId,
          input.title,
          input.duration,
          input.completed
        );
        return { success: true };
      }),

    getPodcastMetrics: publicProcedure
      .input(z.object({ episodeId: z.string() }))
      .query(({ input }) => {
        return listenerAnalyticsService.getPodcastMetrics(input.episodeId);
      }),

    getRealTimeDashboard: publicProcedure.query(() => {
      return listenerAnalyticsService.getRealTimeDashboard();
    })
  }),

  // Podcast Monetization Procedures
  monetization: router({
    createPremiumEpisode: protectedProcedure
      .input(
        z.object({
          episodeId: z.string(),
          title: z.string(),
          price: z.number(),
          currency: z.string(),
          description: z.string(),
          releaseDate: z.date(),
          accessLevel: z.enum(['free', 'premium', 'vip']).optional()
        })
      )
      .mutation(({ input }) => {
        return podcastMonetizationService.createPremiumEpisode(
          input.episodeId,
          input.title,
          input.price,
          input.currency,
          input.description,
          input.releaseDate,
          input.accessLevel
        );
      }),

    createSponsorship: protectedProcedure
      .input(
        z.object({
          episodeId: z.string(),
          sponsorName: z.string(),
          amount: z.number(),
          currency: z.string(),
          duration: z.number(),
          description: z.string()
        })
      )
      .mutation(({ input }) => {
        return podcastMonetizationService.createSponsorship(
          input.episodeId,
          input.sponsorName,
          input.amount,
          input.currency,
          input.duration,
          input.description
        );
      }),

    recordDonation: publicProcedure
      .input(
        z.object({
          listenerId: z.string(),
          amount: z.number(),
          currency: z.string(),
          message: z.string().optional()
        })
      )
      .mutation(({ input }) => {
        return podcastMonetizationService.recordDonation(
          input.listenerId,
          input.amount,
          input.currency,
          input.message
        );
      }),

    getRevenueReport: protectedProcedure
      .input(z.object({ period: z.string().optional() }))
      .query(({ input }) => {
        return podcastMonetizationService.getRevenueReport(input.period);
      }),

    getMonetizationDashboard: protectedProcedure.query(() => {
      return podcastMonetizationService.getMonetizationDashboard();
    })
  }),

  // Social Media Auto-Publishing Procedures
  socialMedia: router({
    createPost: protectedProcedure
      .input(
        z.object({
          episodeId: z.string(),
          platform: z.enum(['twitter', 'instagram', 'tiktok', 'facebook', 'linkedin']),
          content: z.string(),
          hashtags: z.array(z.string()),
          mediaUrl: z.string().optional(),
          caption: z.string().optional()
        })
      )
      .mutation(({ input }) => {
        return socialMediaAutoPublishingService.createPost(
          input.episodeId,
          input.platform,
          input.content,
          input.hashtags,
          input.mediaUrl,
          input.caption
        );
      }),

    schedulePost: protectedProcedure
      .input(
        z.object({
          postId: z.string(),
          scheduledTime: z.date()
        })
      )
      .mutation(({ input }) => {
        return socialMediaAutoPublishingService.schedulePost(input.postId, input.scheduledTime);
      }),

    publishPost: protectedProcedure
      .input(z.object({ postId: z.string() }))
      .mutation(({ input }) => {
        return socialMediaAutoPublishingService.publishPost(input.postId);
      }),

    generateAIClip: protectedProcedure
      .input(
        z.object({
          episodeId: z.string(),
          duration: z.number(),
          format: z.enum(['short', 'medium', 'long']),
          platforms: z.array(z.enum(['twitter', 'instagram', 'tiktok'])),
          caption: z.string(),
          hashtags: z.array(z.string())
        })
      )
      .mutation(({ input }) => {
        return socialMediaAutoPublishingService.generateAIClip(
          input.episodeId,
          input.duration,
          input.format,
          input.platforms,
          input.caption,
          input.hashtags
        );
      }),

    autoPublishEpisode: protectedProcedure
      .input(
        z.object({
          episodeId: z.string(),
          title: z.string(),
          description: z.string(),
          platforms: z.array(z.enum(['twitter', 'instagram', 'tiktok', 'facebook', 'linkedin'])),
          autoGenerateClips: z.boolean().optional()
        })
      )
      .mutation(({ input }) => {
        return socialMediaAutoPublishingService.autoPublishEpisode(
          input.episodeId,
          input.title,
          input.description,
          input.platforms,
          input.autoGenerateClips
        );
      }),

    getEpisodePosts: publicProcedure
      .input(z.object({ episodeId: z.string() }))
      .query(({ input }) => {
        return socialMediaAutoPublishingService.getEpisodePosts(input.episodeId);
      }),

    getSocialMediaDashboard: protectedProcedure.query(() => {
      return socialMediaAutoPublishingService.getSocialMediaDashboard();
    })
  })
});
