import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { recordingService } from '../services/broadcastRecordingService';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const productionRecordingRouter = router({
  /**
   * Start recording a broadcast
   */
  startRecording: protectedProcedure
    .input(
      z.object({
        broadcastId: z.number(),
        operatorId: z.number(),
        quality: z.enum(['480p', '720p', '1080p']),
        format: z.enum(['mp4', 'webm', 'hls']),
        autoArchive: z.boolean().default(true),
        generateTranscript: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const session = await recordingService.startRecording(input);
        return {
          success: true,
          recordingId: session.recordingId,
          startTime: session.startTime,
          status: session.status,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to start recording',
        });
      }
    }),

  /**
   * Stop recording and generate VOD
   */
  stopRecording: protectedProcedure
    .input(z.object({ recordingId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const session = await recordingService.stopRecording(input.recordingId);

        if (!session) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Recording session not found',
          });
        }

        return {
          success: true,
          recordingId: session.recordingId,
          duration: session.duration,
          vodUrl: session.vodUrl,
          transcriptUrl: session.transcriptUrl,
          status: session.status,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to stop recording',
        });
      }
    }),

  /**
   * Get recording session details
   */
  getRecording: protectedProcedure
    .input(z.object({ recordingId: z.string() }))
    .query(({ input }) => {
      const session = recordingService.getSession(input.recordingId);

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recording not found',
        });
      }

      return {
        recordingId: session.recordingId,
        broadcastId: session.broadcastId,
        operatorId: session.operatorId,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.duration,
        fileSize: session.fileSize,
        quality: session.quality,
        status: session.status,
        vodUrl: session.vodUrl,
        transcriptUrl: session.transcriptUrl,
        s3Key: session.s3Key,
      };
    }),

  /**
   * Archive old recordings
   */
  archiveOldRecordings: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        daysOld: z.number().default(30),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const archivedCount = await recordingService.archiveOldRecordings(
          input.operatorId,
          input.daysOld
        );

        return {
          success: true,
          archivedCount,
          message: `${archivedCount} recordings archived`,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to archive recordings',
        });
      }
    }),

  /**
   * Delete recording
   */
  deleteRecording: protectedProcedure
    .input(z.object({ recordingId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const deleted = await recordingService.deleteRecording(input.recordingId);

        if (!deleted) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Recording not found or already deleted',
          });
        }

        return {
          success: true,
          message: 'Recording deleted successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete recording',
        });
      }
    }),

  /**
   * Get recording statistics
   */
  getStatistics: protectedProcedure
    .input(z.object({ operatorId: z.number() }))
    .query(({ input }) => {
      const stats = recordingService.getStatistics(input.operatorId);

      return {
        totalRecordings: stats.totalRecordings,
        totalDuration: stats.totalDuration,
        totalSize: stats.totalSize,
        averageQuality: stats.averageQuality,
        completedCount: stats.completedCount,
        archivedCount: stats.archivedCount,
        storageUsed: `${(stats.totalSize / (1024 * 1024 * 1024)).toFixed(2)} GB`,
      };
    }),
});
