import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import * as db from '../db';

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

export const videoProductionWorkflowRouter = router({
  // Register generated video for production workflow
  registerGeneratedVideo: protectedProcedure
    .input(videoProductionSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Store video metadata in database
        const videoRecord = await db.query.videos.findFirst({
          where: (videos, { eq }) => eq(videos.id, input.videoId),
        });

        if (!videoRecord) {
          // Create new video record
          await db.insert(db.videos).values({
            id: input.videoId,
            userId: String(ctx.user.id),
            title: input.title,
            description: input.description || '',
            duration: input.duration,
            videoUrl: input.videoUrl,
            thumbnailUrl: input.thumbnailUrl || '',
            status: 'generated',
            createdAt: new Date(),
            metadata: JSON.stringify(input.metadata || {}),
          });
        }

        // Trigger production workflow
        return {
          success: true,
          videoId: input.videoId,
          status: 'registered_for_production',
          nextStep: 'processing',
        };
      } catch (error) {
        console.error('Error registering video:', error);
        throw new Error('Failed to register video for production');
      }
    }),

  // Get video production status
  getVideoStatus: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input }) => {
      try {
        const video = await db.query.videos.findFirst({
          where: (videos, { eq }) => eq(videos.id, input.videoId),
        });

        if (!video) {
          throw new Error('Video not found');
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
        throw new Error('Failed to get video status');
      }
    }),

  // Schedule video for RRB Radio broadcast
  scheduleForRRBRadio: protectedProcedure
    .input(broadcastScheduleSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get video details
        const video = await db.query.videos.findFirst({
          where: (videos, { eq }) => eq(videos.id, input.videoId),
        });

        if (!video) {
          throw new Error('Video not found');
        }

        // Create broadcast schedule record
        const scheduleId = `schedule-${input.videoId}-${Date.now()}`;
        
        await db.insert(db.broadcastSchedules).values({
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
        });

        // Update video status
        await db.update(db.videos)
          .set({ status: 'scheduled_for_broadcast' })
          .where((videos) => videos.id === input.videoId);

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
        throw new Error('Failed to schedule video for broadcast');
      }
    }),

  // Get all scheduled broadcasts for RRB Radio
  getScheduledBroadcasts: protectedProcedure
    .input(z.object({ stationId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      try {
        const broadcasts = await db.query.broadcastSchedules.findMany({
          where: (schedules, { eq, and }) =>
            input.stationId
              ? and(
                  eq(schedules.createdBy, String(ctx.user.id)),
                  eq(schedules.stationId, input.stationId)
                )
              : eq(schedules.createdBy, String(ctx.user.id)),
        });

        return broadcasts.map((broadcast) => ({
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
        throw new Error('Failed to get scheduled broadcasts');
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
        const video = await db.query.videos.findFirst({
          where: (videos, { eq }) => eq(videos.id, input.videoId),
        });

        if (!video) {
          throw new Error('Video not found');
        }

        // Create immediate broadcast record
        const broadcastId = `broadcast-${input.videoId}-${Date.now()}`;

        await db.insert(db.broadcasts).values({
          id: broadcastId,
          videoId: input.videoId,
          stationId: input.rrbRadioStationId,
          startTime: new Date(),
          status: 'live',
          createdBy: String(ctx.user.id),
        });

        // Update video status
        await db.update(db.videos)
          .set({ status: 'broadcasting' })
          .where((videos) => videos.id === input.videoId);

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
        throw new Error('Failed to broadcast video');
      }
    }),

  // Get broadcast history
  getBroadcastHistory: protectedProcedure
    .input(z.object({ videoId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      try {
        const broadcasts = await db.query.broadcasts.findMany({
          where: (broadcasts, { eq, and }) =>
            input.videoId
              ? and(
                  eq(broadcasts.createdBy, String(ctx.user.id)),
                  eq(broadcasts.videoId, input.videoId)
                )
              : eq(broadcasts.createdBy, String(ctx.user.id)),
        });

        return broadcasts.map((broadcast) => ({
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
        throw new Error('Failed to get broadcast history');
      }
    }),

  // Get production workflow statistics
  getWorkflowStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const videos = await db.query.videos.findMany({
        where: (videos, { eq }) => eq(videos.userId, String(ctx.user.id)),
      });

      const broadcasts = await db.query.broadcasts.findMany({
        where: (broadcasts, { eq }) => eq(broadcasts.createdBy, String(ctx.user.id)),
      });

      const statusCounts = {
        generated: videos.filter((v) => v.status === 'generated').length,
        processing: videos.filter((v) => v.status === 'processing').length,
        scheduled: videos.filter((v) => v.status === 'scheduled_for_broadcast').length,
        broadcasting: videos.filter((v) => v.status === 'broadcasting').length,
        completed: videos.filter((v) => v.status === 'completed').length,
      };

      const totalViewers = broadcasts.reduce((sum, b) => sum + (b.viewerCount || 0), 0);

      return {
        totalVideos: videos.length,
        totalBroadcasts: broadcasts.length,
        statusCounts,
        totalViewers,
        averageViewersPerBroadcast:
          broadcasts.length > 0 ? Math.round(totalViewers / broadcasts.length) : 0,
      };
    } catch (error) {
      console.error('Error getting workflow stats:', error);
      throw new Error('Failed to get workflow statistics');
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
