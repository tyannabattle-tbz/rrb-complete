/**
 * Listener Analytics Router
 * Real-time channel metrics and engagement tracking endpoints
 */
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getListenerAnalytics } from "../services/listenerAnalyticsService";

export const listenerAnalyticsRouter = router({
  // Get platform-wide overview metrics
  getPlatformOverview: publicProcedure.query(() => {
    const analytics = getListenerAnalytics();
    return analytics.getPlatformOverview();
  }),

  // Get per-channel analytics
  getChannelAnalytics: publicProcedure.query(() => {
    const analytics = getListenerAnalytics();
    return analytics.getChannelAnalytics();
  }),

  // Get recent engagement events
  getRecentEngagement: publicProcedure
    .input(z.number().min(1).max(100).optional())
    .query(({ input }) => {
      const analytics = getListenerAnalytics();
      return analytics.getRecentEngagement(input || 50);
    }),

  // Get engagement breakdown by channel
  getChannelEngagement: publicProcedure
    .input(z.string())
    .query(({ input }) => {
      const analytics = getListenerAnalytics();
      return analytics.getEngagementByChannel(input);
    }),

  // Record an engagement event (tune in, tune out, like, share, etc.)
  recordEvent: publicProcedure
    .input(z.object({
      type: z.enum(['tune_in', 'tune_out', 'skip', 'like', 'share', 'save']),
      channelId: z.string(),
      userId: z.string().optional(),
      contentTitle: z.string().optional(),
    }))
    .mutation(({ input }) => {
      const analytics = getListenerAnalytics();
      return analytics.recordEvent(input);
    }),
});
