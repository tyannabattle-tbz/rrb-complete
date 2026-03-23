/**
 * Audio Stream Health Monitoring Router
 * tRPC procedures for stream health monitoring
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { audioStreamHealthMonitor } from '../services/audioStreamHealthMonitor';

export const audioStreamHealthRouter = router({
  /**
   * Start monitoring a stream
   */
  startMonitoring: protectedProcedure
    .input(z.object({
      streamUrl: z.string().url(),
      streamId: z.string(),
    }))
    .mutation(({ input }) => {
      audioStreamHealthMonitor.startMonitoring(input.streamUrl, input.streamId);
      return { success: true, message: `Monitoring started for stream ${input.streamId}` };
    }),

  /**
   * Stop monitoring a stream
   */
  stopMonitoring: protectedProcedure
    .input(z.object({
      streamId: z.string(),
    }))
    .mutation(({ input }) => {
      audioStreamHealthMonitor.stopMonitoring(input.streamId);
      return { success: true, message: `Monitoring stopped for stream ${input.streamId}` };
    }),

  /**
   * Get stream health status
   */
  getStreamStatus: publicProcedure
    .input(z.object({
      streamId: z.string(),
    }))
    .query(({ input }) => {
      const status = audioStreamHealthMonitor.getStreamStatus(input.streamId);
      return status || { error: 'Stream not found' };
    }),

  /**
   * Get all stream statuses
   */
  getAllStreamStatuses: publicProcedure
    .query(() => {
      const statuses = audioStreamHealthMonitor.getAllStreamStatuses();
      return Object.fromEntries(statuses);
    }),

  /**
   * Get stream metrics
   */
  getStreamMetrics: publicProcedure
    .input(z.object({
      streamId: z.string(),
    }))
    .query(({ input }) => {
      const metrics = audioStreamHealthMonitor.getStreamMetrics(input.streamId);
      return metrics || { error: 'Stream not found' };
    }),

  /**
   * Force reconnection attempt
   */
  forceReconnect: protectedProcedure
    .input(z.object({
      streamId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const success = await audioStreamHealthMonitor.forceReconnect(input.streamId);
      return {
        success,
        message: success ? 'Reconnection successful' : 'Reconnection failed',
      };
    }),

  /**
   * Reset stream health
   */
  resetStream: protectedProcedure
    .input(z.object({
      streamId: z.string(),
    }))
    .mutation(({ input }) => {
      audioStreamHealthMonitor.resetStream(input.streamId);
      return { success: true, message: `Stream ${input.streamId} reset` };
    }),

  /**
   * Get health report
   */
  getHealthReport: publicProcedure
    .query(() => {
      return audioStreamHealthMonitor.getHealthReport();
    }),

  /**
   * Get real-time health dashboard data
   */
  getDashboardData: publicProcedure
    .query(() => {
      const report = audioStreamHealthMonitor.getHealthReport();
      const statuses = audioStreamHealthMonitor.getAllStreamStatuses();
      
      return {
        report,
        streams: Array.from(statuses.entries()).map(([id, status]) => ({
          id,
          ...status,
        })),
        timestamp: Date.now(),
      };
    }),

  /**
   * Get stream health history (for analytics)
   */
  getHealthHistory: publicProcedure
    .input(z.object({
      streamId: z.string(),
      timeRange: z.enum(['1h', '24h', '7d']).optional(),
    }))
    .query(({ input }) => {
      const status = audioStreamHealthMonitor.getStreamStatus(input.streamId);
      if (!status) return { error: 'Stream not found' };

      // Return current status as history point
      return {
        streamId: input.streamId,
        currentStatus: status,
        timeRange: input.timeRange || '1h',
        dataPoints: [
          {
            timestamp: status.lastCheckTime,
            isConnected: status.isConnected,
            latency: status.latency,
            successRate: status.successRate,
          },
        ],
      };
    }),

  /**
   * Get stream recommendations
   */
  getRecommendations: publicProcedure
    .input(z.object({
      streamId: z.string(),
    }))
    .query(({ input }) => {
      const status = audioStreamHealthMonitor.getStreamStatus(input.streamId);
      if (!status) return { error: 'Stream not found', recommendations: [] };

      const recommendations: string[] = [];

      if (!status.isConnected) {
        recommendations.push('Stream is currently disconnected. Attempting automatic reconnection.');
      }

      if (status.latency > 1000) {
        recommendations.push('High latency detected. Consider switching to a closer server.');
      }

      if (status.successRate < 95) {
        recommendations.push('Stream reliability is below 95%. Check your network connection.');
      }

      if (status.consecutiveFailures > 2) {
        recommendations.push('Multiple connection failures detected. Resetting stream...');
      }

      if (recommendations.length === 0) {
        recommendations.push('Stream health is optimal.');
      }

      return {
        streamId: input.streamId,
        recommendations,
        status: status.isConnected ? 'healthy' : 'unhealthy',
      };
    }),
});
