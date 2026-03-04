import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import EngagementWebhooksService from '../services/engagementWebhooks';

export const engagementWebhooksRouter = router({
  // Get real-time metrics
  getRealTimeMetrics: protectedProcedure
    .input(z.object({ stationId: z.number() }))
    .query(async ({ input }) => {
      const metrics = await EngagementWebhooksService.getRealTimeMetrics(input.stationId);
      return metrics;
    }),

  // Get aggregated metrics
  getAggregatedMetrics: protectedProcedure
    .input(z.object({ stationId: z.number() }))
    .query(async ({ input }) => {
      const metrics = await EngagementWebhooksService.getAggregatedMetrics(input.stationId);
      return metrics;
    }),

  // Get anomaly alerts
  getAnomalyAlerts: protectedProcedure
    .input(z.object({ stationId: z.number() }))
    .query(async ({ input }) => {
      const alerts = await EngagementWebhooksService.getAnomalyAlerts(input.stationId);
      return alerts;
    }),

  // Acknowledge alert
  acknowledgeAlert: protectedProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ input }) => {
      const result = await EngagementWebhooksService.acknowledgeAlert(input.alertId);
      return { success: result };
    }),

  // Get engagement trend
  getEngagementTrend: protectedProcedure
    .input(
      z.object({
        stationId: z.number(),
        platform: z.string(),
        days: z.number().optional().default(7),
      })
    )
    .query(async ({ input }) => {
      const trend = await EngagementWebhooksService.getEngagementTrend(
        input.stationId,
        input.platform,
        input.days
      );

      return trend;
    }),

  // Get platform comparison
  getPlatformComparison: protectedProcedure
    .input(z.object({ stationId: z.number() }))
    .query(async ({ input }) => {
      const comparison = await EngagementWebhooksService.getPlatformComparison(input.stationId);
      return comparison;
    }),

  // Handle webhook event (public endpoint)
  handleWebhookEvent: publicProcedure
    .input(
      z.object({
        platform: z.enum(['twitter', 'youtube', 'facebook', 'instagram']),
        eventType: z.enum(['like', 'share', 'comment', 'view', 'follow']),
        stationId: z.number(),
        userId: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await EngagementWebhooksService.handleWebhookEvent({
        platform: input.platform,
        eventType: input.eventType,
        stationId: input.stationId,
        userId: input.userId,
        timestamp: new Date(),
        metadata: input.metadata,
      });

      return { success: result };
    }),

  // Initialize webhooks
  initializeWebhooks: protectedProcedure.mutation(async () => {
    EngagementWebhooksService.initializeAllWebhooks();
    return { success: true, message: 'All webhooks initialized' };
  }),
});

export default engagementWebhooksRouter;
