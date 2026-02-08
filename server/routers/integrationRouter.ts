import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import { rockinBoogieService } from '../rockinBoogieIntegration';
import { hybridcastService } from '../hybridcastIntegration';
import { z } from 'zod';

export const integrationRouter = router({
  // Rockin Rockin Boogie procedures
  rockinBoogie: router({
    // Schedule broadcast
    scheduleBroadcast: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string(),
          startTime: z.number(),
          endTime: z.number(),
          contentType: z.enum(['music', 'talk', 'news', 'mixed']),
        })
      )
      .mutation(({ input, ctx }) => {
        const broadcast = rockinBoogieService.scheduleBroadcast({
          title: input.title,
          description: input.description,
          startTime: input.startTime,
          endTime: input.endTime,
          musicTracks: [],
          commercials: [],
          contentType: input.contentType,
          autonomyLevel: 75,
          status: 'scheduled',
          createdBy: ctx.user?.id || 'unknown',
        });
        return broadcast;
      }),

    // Get upcoming broadcasts
    getUpcomingBroadcasts: publicProcedure.query(() => {
      return rockinBoogieService.getUpcomingBroadcasts(10);
    }),

    // Get all broadcasts
    getAllBroadcasts: publicProcedure.query(() => {
      return rockinBoogieService.getAllBroadcasts();
    }),

    // Start broadcast
    startBroadcast: protectedProcedure
      .input(z.object({ broadcastId: z.string() }))
      .mutation(({ input }) => {
        const success = rockinBoogieService.startBroadcast(input.broadcastId);
        return { success, broadcastId: input.broadcastId };
      }),

    // End broadcast
    endBroadcast: protectedProcedure
      .input(z.object({ broadcastId: z.string() }))
      .mutation(({ input }) => {
        const success = rockinBoogieService.endBroadcast(input.broadcastId);
        return { success, broadcastId: input.broadcastId };
      }),

    // Add music track
    addTrack: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          artist: z.string(),
          duration: z.number(),
          genre: z.string(),
          url: z.string(),
        })
      )
      .mutation(({ input }) => {
        return rockinBoogieService.addTrack(input);
      }),

    // Get all tracks
    getAllTracks: publicProcedure.query(() => {
      return rockinBoogieService.getAllTracks();
    }),

    // Get popular tracks
    getPopularTracks: publicProcedure.query(() => {
      return rockinBoogieService.getPopularTracks(10);
    }),

    // Play track
    playTrack: publicProcedure
      .input(z.object({ trackId: z.string() }))
      .mutation(({ input }) => {
        const success = rockinBoogieService.playTrack(input.trackId);
        return { success, trackId: input.trackId };
      }),

    // Add commercial
    addCommercial: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          duration: z.number(),
          advertiser: z.string(),
          url: z.string(),
        })
      )
      .mutation(({ input }) => {
        return rockinBoogieService.addCommercial(input);
      }),

    // Get all commercials
    getAllCommercials: publicProcedure.query(() => {
      return rockinBoogieService.getAllCommercials();
    }),

    // Auto-generate broadcast
    autoGenerateBroadcast: protectedProcedure
      .input(z.object({ title: z.string(), duration: z.number().optional() }))
      .mutation(({ input }) => {
        return rockinBoogieService.autoGenerateBroadcast(input.title, input.duration);
      }),

    // Get statistics
    getStatistics: publicProcedure.query(() => {
      return rockinBoogieService.getStatistics();
    }),

    // Get live listeners
    getLiveListeners: publicProcedure.query(() => {
      return rockinBoogieService.getLiveListeners();
    }),
  }),

  // HybridCast procedures
  hybridcast: router({
    // Create streaming session
    createSession: protectedProcedure
      .input(z.object({ broadcastId: z.string(), platform: z.string().optional() }))
      .mutation(({ input }) => {
        return hybridcastService.createSession(input.broadcastId, input.platform);
      }),

    // Get active sessions
    getActiveSessions: publicProcedure.query(() => {
      return hybridcastService.getActiveSessions();
    }),

    // Get all sessions
    getAllSessions: publicProcedure.query(() => {
      return hybridcastService.getAllSessions();
    }),

    // Update viewer count
    updateViewerCount: publicProcedure
      .input(z.object({ sessionId: z.string(), count: z.number() }))
      .mutation(({ input }) => {
        const success = hybridcastService.updateViewerCount(input.sessionId, input.count);
        return { success, sessionId: input.sessionId, viewers: input.count };
      }),

    // End session
    endSession: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(({ input }) => {
        const success = hybridcastService.endSession(input.sessionId);
        return { success, sessionId: input.sessionId };
      }),

    // Create distribution
    createDistribution: protectedProcedure
      .input(z.object({ broadcastId: z.string(), platforms: z.array(z.string()) }))
      .mutation(({ input }) => {
        return hybridcastService.createDistribution(input.broadcastId, input.platforms);
      }),

    // Get all distributions
    getAllDistributions: publicProcedure.query(() => {
      return hybridcastService.getAllDistributions();
    }),

    // Update distribution status
    updateDistributionStatus: protectedProcedure
      .input(z.object({ distributionId: z.string(), status: z.enum(['pending', 'distributing', 'live', 'completed']) }))
      .mutation(({ input }) => {
        const success = hybridcastService.updateDistributionStatus(input.distributionId, input.status);
        return { success, distributionId: input.distributionId };
      }),

    // Update platform viewers
    updatePlatformViewers: publicProcedure
      .input(z.object({ distributionId: z.string(), platform: z.string(), viewers: z.number() }))
      .mutation(({ input }) => {
        const success = hybridcastService.updatePlatformViewers(
          input.distributionId,
          input.platform,
          input.viewers
        );
        return { success, distributionId: input.distributionId, platform: input.platform };
      }),

    // Get statistics
    getStatistics: publicProcedure.query(() => {
      return hybridcastService.getStatistics();
    }),

    // Get geolocation distribution
    getGeolocationDistribution: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(({ input }) => {
        return hybridcastService.getGeolocationDistribution(input.sessionId);
      }),

    // Get device distribution
    getDeviceDistribution: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(({ input }) => {
        return hybridcastService.getDeviceDistribution(input.sessionId);
      }),

    // Get engagement metrics
    getEngagementMetrics: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(({ input }) => {
        return hybridcastService.calculateEngagementMetrics(input.sessionId);
      }),
  }),
});
