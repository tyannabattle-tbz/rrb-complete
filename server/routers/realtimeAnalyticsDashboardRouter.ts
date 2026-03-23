import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { realtimeAnalyticsDashboardService } from '../services/realtimeAnalyticsDashboard';

export const realtimeAnalyticsDashboardRouter = router({
  /**
   * Get live listener metrics for all 54 channels
   */
  getLiveListenerMetrics: publicProcedure.query(async () => {
    return await realtimeAnalyticsDashboardService.getLiveListenerMetrics();
  }),

  /**
   * Get engagement heatmap for specific channel
   */
  getEngagementHeatmap: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ input }) => {
      return await realtimeAnalyticsDashboardService.getEngagementHeatmap(input.channelId);
    }),

  /**
   * Get revenue metrics for all channels
   */
  getRevenueMetrics: publicProcedure.query(async () => {
    return await realtimeAnalyticsDashboardService.getRevenueMetrics();
  }),

  /**
   * Get listener retention analysis
   */
  getListenerRetention: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ input }) => {
      return await realtimeAnalyticsDashboardService.getListenerRetention(input.channelId);
    }),

  /**
   * Get geographic distribution analytics
   */
  getGeographicDistribution: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ input }) => {
      return await realtimeAnalyticsDashboardService.getGeographicDistribution(input.channelId);
    }),

  /**
   * Get device and platform breakdown
   */
  getDeviceBreakdown: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ input }) => {
      return await realtimeAnalyticsDashboardService.getDeviceBreakdown(input.channelId);
    }),

  /**
   * Get content performance analytics
   */
  getContentPerformance: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ input }) => {
      return await realtimeAnalyticsDashboardService.getContentPerformance(input.channelId);
    }),

  /**
   * Get real-time listener activity stream
   */
  getListenerActivityStream: publicProcedure
    .input(z.object({ channelId: z.string(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      return await realtimeAnalyticsDashboardService.getListenerActivityStream(
        input.channelId,
        input.limit
      );
    }),

  /**
   * Export analytics report
   */
  exportAnalyticsReport: publicProcedure
    .input(z.object({ channelId: z.string(), format: z.enum(['pdf', 'csv', 'json']) }))
    .mutation(async ({ input }) => {
      return await realtimeAnalyticsDashboardService.exportAnalyticsReport(
        input.channelId,
        input.format
      );
    }),

  /**
   * Get predictive analytics
   */
  getPredictiveAnalytics: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ input }) => {
      return await realtimeAnalyticsDashboardService.getPredictiveAnalytics(input.channelId);
    }),
});
