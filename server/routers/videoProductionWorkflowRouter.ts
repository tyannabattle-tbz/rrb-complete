import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

/**
 * Video Production Workflow Router
 * Manages complete end-to-end workflow from video generation through RRB Radio broadcast
 * Handles: generation → processing → production scheduling → RRB Radio broadcast
 */

const videoProductionSchema = z.object({
  videoId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  duration: z.number(),
  generatedAt: z.date(),
  videoUrl: z.string(),
  thumbnailUrl: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const broadcastScheduleSchema = z.object({
  videoId: z.string(),
  rrbRadioStationId: z.string(),
  scheduledTime: z.date(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  autoRepeat: z.boolean().optional(),
  repeatInterval: z.string().optional(), // cron expression
});

// In-memory storage for demo purposes
// In production, these would be persisted to database
const videoRegistry = new Map<string, any>();
const broadcastSchedules = new Map<string, any>();
const broadcasts = new Map<string, any>();

export const videoProductionWorkflowRouter = router({
  // Register generated video for production workflow
  registerGeneratedVideo: protectedProcedure
    .input(videoProductionSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Store video metadata
        const videoRecord = {
          id: input.videoId,
          userId: String(ctx.user.id),
          title: input.title,
          description: input.description || '',
          duration: input.duration,
          videoUrl: input.videoUrl,
          thumbnailUrl: input.thumbnailUrl || '',
          status: 'generated',
          createdAt: new Date(),
          metadata: input.metadata || {},
        };

        videoRegistry.set(input.videoId, videoRecord);

        // Trigger production workflow
        return {
          success: true,
          videoId: input.videoId,
          status: 'registered_for_production',
          nextStep: 'processing',
        };
      } catch (error) {
        console.error('Error registering video:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to register video for production',
        });
      }
    }),

  // Get video production status
  getVideoStatus: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input }) => {
      try {
        const video = videoRegistry.get(input.videoId);

        if (!video) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Video not found',
          });
        }

        return {
          videoId: video.id,
          title: video.title,
          status: video.status,
          createdAt: video.createdAt,
          videoUrl: video.videoUrl,
          productionStage: getProductionStage(video.status),
        };
      } catch (error) {
        console.error('Error getting video status:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get video status',
        });
      }
    }),

  // Schedule video for RRB Radio broadcast
  scheduleForRRBRadio: protectedProcedure
    .input(broadcastScheduleSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get video details
        const video = videoRegistry.get(input.videoId);

        if (!video) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Video not found',
          });
        }

        // Create broadcast schedule record
        const scheduleId = `schedule-${input.videoId}-${Date.now()}`;

        const schedule = {
          id: scheduleId,
          videoId: input.videoId,
          stationId: input.rrbRadioStationId,
          scheduledTime: input.scheduledTime,
          priority: input.priority || 'medium',
          autoRepeat: input.autoRepeat || false,
          repeatInterval: input.repeatInterval,
          status: 'scheduled',
          createdAt: new Date(),
          createdBy: String(ctx.user.id),
        };

        broadcastSchedules.set(scheduleId, schedule);

        // Update video status
        video.status = 'scheduled_for_broadcast';
        videoRegistry.set(input.videoId, video);

        return {
          success: true,
          scheduleId,
          videoId: input.videoId,
          rrbRadioStationId: input.rrbRadioStationId,
          scheduledTime: input.scheduledTime,
          status: 'scheduled_for_broadcast',
        };
      } catch (error) {
        console.error('Error scheduling for RRB Radio:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to schedule video for broadcast',
        });
      }
    }),

  // Get all scheduled broadcasts for RRB Radio
  getScheduledBroadcasts: protectedProcedure
    .input(z.object({ stationId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      try {
        const userSchedules = Array.from(broadcastSchedules.values()).filter(
          (s) => s.createdBy === String(ctx.user.id) && (!input.stationId || s.stationId === input.stationId)
        );

        return userSchedules.map((broadcast) => ({
          scheduleId: broadcast.id,
          videoId: broadcast.videoId,
          stationId: broadcast.stationId,
          scheduledTime: broadcast.scheduledTime,
          status: broadcast.status,
          priority: broadcast.priority,
          autoRepeat: broadcast.autoRepeat,
        }));
      } catch (error) {
        console.error('Error getting scheduled broadcasts:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get scheduled broadcasts',
        });
      }
    }),

  // Trigger immediate broadcast to RRB Radio
  broadcastNow: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
        rrbRadioStationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const video = videoRegistry.get(input.videoId);

        if (!video) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Video not found',
          });
        }

        // Create immediate broadcast record
        const broadcastId = `broadcast-${input.videoId}-${Date.now()}`;

        const broadcast = {
          id: broadcastId,
          videoId: input.videoId,
          stationId: input.rrbRadioStationId,
          startTime: new Date(),
          endTime: null,
          status: 'live',
          viewerCount: 0,
          createdBy: String(ctx.user.id),
        };

        broadcasts.set(broadcastId, broadcast);

        // Update video status
        video.status = 'broadcasting';
        videoRegistry.set(input.videoId, video);

        return {
          success: true,
          broadcastId,
          videoId: input.videoId,
          stationId: input.rrbRadioStationId,
          status: 'broadcasting',
          startTime: new Date(),
        };
      } catch (error) {
        console.error('Error broadcasting video:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to broadcast video',
        });
      }
    }),

  // Get broadcast history
  getBroadcastHistory: protectedProcedure
    .input(z.object({ videoId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      try {
        const userBroadcasts = Array.from(broadcasts.values()).filter(
          (b) => b.createdBy === String(ctx.user.id) && (!input.videoId || b.videoId === input.videoId)
        );

        return userBroadcasts.map((broadcast) => ({
          broadcastId: broadcast.id,
          videoId: broadcast.videoId,
          stationId: broadcast.stationId,
          startTime: broadcast.startTime,
          endTime: broadcast.endTime,
          status: broadcast.status,
          viewerCount: broadcast.viewerCount || 0,
        }));
      } catch (error) {
        console.error('Error getting broadcast history:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get broadcast history',
        });
      }
    }),

  // Get production workflow statistics
  getWorkflowStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userVideos = Array.from(videoRegistry.values()).filter(
        (v) => v.userId === String(ctx.user.id)
      );

      const userBroadcasts = Array.from(broadcasts.values()).filter(
        (b) => b.createdBy === String(ctx.user.id)
      );

      const statusCounts = {
        generated: userVideos.filter((v) => v.status === 'generated').length,
        processing: userVideos.filter((v) => v.status === 'processing').length,
        scheduled: userVideos.filter((v) => v.status === 'scheduled_for_broadcast').length,
        broadcasting: userVideos.filter((v) => v.status === 'broadcasting').length,
        completed: userVideos.filter((v) => v.status === 'completed').length,
      };

      const totalViewers = userBroadcasts.reduce((sum, b) => sum + (b.viewerCount || 0), 0);

      return {
        totalVideos: userVideos.length,
        totalBroadcasts: userBroadcasts.length,
        statusCounts,
        totalViewers,
        averageViewersPerBroadcast:
          userBroadcasts.length > 0 ? Math.round(totalViewers / userBroadcasts.length) : 0,
      };
    } catch (error) {
      console.error('Error getting workflow stats:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get workflow statistics',
      });
    }
  }),
});

/**
 * Helper function to determine production stage
 */
function getProductionStage(status: string): string {
  const stages: Record<string, string> = {
    generated: 'Video Generated',
    processing: 'Processing for Production',
    scheduled_for_broadcast: 'Scheduled for Broadcast',
    broadcasting: 'Live on RRB Radio',
    completed: 'Broadcast Completed',
  };
  return stages[status] || 'Unknown Stage';
}
