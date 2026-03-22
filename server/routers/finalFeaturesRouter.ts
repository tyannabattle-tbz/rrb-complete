import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { listenerNotificationService } from '../services/listenerNotificationService';
import { affiliateProgramService } from '../services/affiliateProgramService';
import { realtimeLeaderboardService } from '../services/realtimeLeaderboardService';

export const finalFeaturesRouter = router({
  // Listener Notifications
  notifications: router({
    setPreferences: protectedProcedure
      .input(
        z.object({
          emailNotifications: z.boolean().optional(),
          smsNotifications: z.boolean().optional(),
          favoriteChannelAlerts: z.boolean().optional(),
          newEpisodeAlerts: z.boolean().optional(),
          sponsorshipAlerts: z.boolean().optional(),
          dailyDigest: z.boolean().optional(),
          notificationFrequency: z.enum(['immediate', 'daily', 'weekly', 'never']).optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        return listenerNotificationService.setNotificationPreferences(ctx.user!.id, input);
      }),

    getPreferences: protectedProcedure.query(({ ctx }) => {
      return listenerNotificationService.getNotificationPreferences(ctx.user!.id);
    }),

    getNotifications: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(({ ctx, input }) => {
        return listenerNotificationService.getNotifications(ctx.user!.id, input.limit);
      }),

    getUnread: protectedProcedure.query(({ ctx }) => {
      return listenerNotificationService.getUnreadNotifications(ctx.user!.id);
    }),

    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.string() }))
      .mutation(({ input }) => {
        return listenerNotificationService.markAsRead(input.notificationId);
      }),

    markAllAsRead: protectedProcedure.mutation(({ ctx }) => {
      return listenerNotificationService.markAllAsRead(ctx.user!.id);
    }),

    deleteNotification: protectedProcedure
      .input(z.object({ notificationId: z.string() }))
      .mutation(({ input }) => {
        return listenerNotificationService.deleteNotification(input.notificationId);
      }),

    getStatistics: protectedProcedure.query(({ ctx }) => {
      return listenerNotificationService.getStatistics(ctx.user!.id);
    }),

    getDailyDigest: protectedProcedure.query(({ ctx }) => {
      return listenerNotificationService.createDailyDigest(ctx.user!.id);
    }),

    sendChannelAlert: protectedProcedure
      .input(
        z.object({
          listenerId: z.string(),
          channelName: z.string(),
          status: z.enum(['live', 'offline']),
        })
      )
      .mutation(({ input }) => {
        return listenerNotificationService.sendFavoriteChannelAlert(
          input.listenerId,
          input.channelName,
          input.status
        );
      }),

    sendEpisodeAlert: protectedProcedure
      .input(
        z.object({
          listenerId: z.string(),
          podcastTitle: z.string(),
          episodeTitle: z.string(),
          episodeLink: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        return listenerNotificationService.sendNewEpisodeAlert(
          input.listenerId,
          input.podcastTitle,
          input.episodeTitle,
          input.episodeLink
        );
      }),

    sendSponsorshipAlert: protectedProcedure
      .input(
        z.object({
          listenerId: z.string(),
          sponsorName: z.string(),
          offer: z.string(),
          link: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        return listenerNotificationService.sendSponsorshipAlert(
          input.listenerId,
          input.sponsorName,
          input.offer,
          input.link
        );
      }),
  }),

  // Affiliate Program
  affiliate: router({
    createAccount: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          email: z.string().email(),
          commissionRate: z.number().default(10),
        })
      )
      .mutation(({ input }) => {
        return affiliateProgramService.createAffiliateAccount(
          input.name,
          input.email,
          input.commissionRate
        );
      }),

    getProfile: protectedProcedure.query(({ ctx }) => {
      return affiliateProgramService.getAffiliateProfile(ctx.user!.id);
    }),

    generateReferralLink: protectedProcedure.mutation(({ ctx }) => {
      return affiliateProgramService.generateReferralLink(ctx.user!.id);
    }),

    getReferralLinks: protectedProcedure.query(({ ctx }) => {
      return affiliateProgramService.getAffiliateReferralLinks(ctx.user!.id);
    }),

    trackClick: publicProcedure
      .input(z.object({ code: z.string() }))
      .mutation(({ input }) => {
        return affiliateProgramService.trackReferralClick(input.code);
      }),

    trackConversion: publicProcedure
      .input(
        z.object({
          code: z.string(),
          revenue: z.number(),
        })
      )
      .mutation(({ input }) => {
        return affiliateProgramService.trackReferralConversion(input.code, input.revenue);
      }),

    getCommissions: protectedProcedure
      .input(z.object({ status: z.string().optional() }))
      .query(({ ctx, input }) => {
        return affiliateProgramService.getAffiliateCommissions(ctx.user!.id, input.status);
      }),

    approveCommission: protectedProcedure
      .input(z.object({ commissionId: z.string() }))
      .mutation(({ input }) => {
        return affiliateProgramService.approveCommission(input.commissionId);
      }),

    requestPayout: protectedProcedure
      .input(z.object({ method: z.enum(['bank_transfer', 'paypal', 'check']) }))
      .mutation(({ ctx, input }) => {
        return affiliateProgramService.requestPayout(ctx.user!.id, input.method);
      }),

    getPayouts: protectedProcedure.query(({ ctx }) => {
      return affiliateProgramService.getAffiliatePayouts(ctx.user!.id);
    }),

    getAnalytics: protectedProcedure.query(({ ctx }) => {
      return affiliateProgramService.getAffiliateAnalytics(ctx.user!.id);
    }),

    getTopAffiliates: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(({ input }) => {
        return affiliateProgramService.getTopAffiliates(input.limit);
      }),

    getProgramStatistics: publicProcedure.query(() => {
      return affiliateProgramService.getProgramStatistics();
    }),
  }),

  // Real-Time Leaderboard
  leaderboard: router({
    updateDonor: protectedProcedure
      .input(
        z.object({
          donorId: z.string(),
          donorName: z.string(),
          totalDonations: z.number(),
          donationCount: z.number(),
        })
      )
      .mutation(({ input }) => {
        return realtimeLeaderboardService.updateDonorLeaderboard(
          input.donorId,
          input.donorName,
          input.totalDonations,
          input.donationCount
        );
      }),

    updateChannel: protectedProcedure
      .input(
        z.object({
          channelId: z.string(),
          channelName: z.string(),
          currentListeners: z.number(),
          totalListeners: z.number(),
          averageListenTime: z.number(),
        })
      )
      .mutation(({ input }) => {
        return realtimeLeaderboardService.updateChannelLeaderboard(
          input.channelId,
          input.channelName,
          input.currentListeners,
          input.totalListeners,
          input.averageListenTime
        );
      }),

    updateEpisode: protectedProcedure
      .input(
        z.object({
          episodeId: z.string(),
          episodeTitle: z.string(),
          podcastName: z.string(),
          plays: z.number(),
          averagePlayTime: z.number(),
        })
      )
      .mutation(({ input }) => {
        return realtimeLeaderboardService.updateEpisodeLeaderboard(
          input.episodeId,
          input.episodeTitle,
          input.podcastName,
          input.plays,
          input.averagePlayTime
        );
      }),

    getTopDonors: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(({ input }) => {
        return realtimeLeaderboardService.getTopDonors(input.limit);
      }),

    getTopChannels: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(({ input }) => {
        return realtimeLeaderboardService.getTopChannels(input.limit);
      }),

    getTrendingEpisodes: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(({ input }) => {
        return realtimeLeaderboardService.getTrendingEpisodes(input.limit);
      }),

    getComplete: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(({ input }) => {
        return realtimeLeaderboardService.getCompleteLeaderboard(input.limit);
      }),

    getDonorRank: publicProcedure
      .input(z.object({ donorId: z.string() }))
      .query(({ input }) => {
        return realtimeLeaderboardService.getDonorRank(input.donorId);
      }),

    getChannelRank: publicProcedure
      .input(z.object({ channelId: z.string() }))
      .query(({ input }) => {
        return realtimeLeaderboardService.getChannelRank(input.channelId);
      }),

    getEpisodeRank: publicProcedure
      .input(z.object({ episodeId: z.string() }))
      .query(({ input }) => {
        return realtimeLeaderboardService.getEpisodeRank(input.episodeId);
      }),

    getStatistics: publicProcedure.query(() => {
      return realtimeLeaderboardService.getLeaderboardStatistics();
    }),

    compareDonors: publicProcedure
      .input(
        z.object({
          donorId1: z.string(),
          donorId2: z.string(),
        })
      )
      .query(({ input }) => {
        return realtimeLeaderboardService.compareDonors(input.donorId1, input.donorId2);
      }),

    compareChannels: publicProcedure
      .input(
        z.object({
          channelId1: z.string(),
          channelId2: z.string(),
        })
      )
      .query(({ input }) => {
        return realtimeLeaderboardService.compareChannels(input.channelId1, input.channelId2);
      }),

    updateRankings: protectedProcedure.mutation(() => {
      realtimeLeaderboardService.updateRankings();
      return { success: true };
    }),
  }),
});
