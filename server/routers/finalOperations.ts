import { router, publicProcedure, protectedProcedure } from "../\_core/trpc";
import { z } from "zod";
import { IncidentNotificationsService } from "../services/incidentNotificationsService";
import { RunbookMarketplaceService } from "../services/runbookMarketplaceService";
import { DisasterRecoveryService } from "../services/disasterRecoveryService";

const incidentNotificationsService = new IncidentNotificationsService();
const runbookMarketplaceService = new RunbookMarketplaceService();
const disasterRecoveryService = new DisasterRecoveryService();

export const finalOperationsRouter = router({
  // Incident Notifications
  addNotificationChannel: protectedProcedure
    .input(z.object({
      type: z.enum(["slack", "email", "pagerduty", "webhook"]),
      config: z.record(z.string(), z.string()),
    }))
    .mutation(async ({ input }) => {
      const channelId = `channel-${Date.now()}`;
      const channel = {
        id: channelId,
        type: input.type as "slack" | "email" | "pagerduty" | "webhook",
        config: input.config as Record<string, string>,
        enabled: true,
      };
      incidentNotificationsService.addChannel(channel);
      return { success: true, channelId };
    }),

  getNotificationStats: protectedProcedure.query(() => {
    return incidentNotificationsService.getNotificationStats();
  }),

  // Runbook Marketplace
  searchRunbooks: publicProcedure
    .input(z.object({
      query: z.string(),
      category: z.string().optional(),
      minRating: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return runbookMarketplaceService.searchTemplates(input.query, {
        category: input.category,
        minRating: input.minRating,
      });
    }),

  getFeaturedRunbooks: publicProcedure.query(() => {
    return runbookMarketplaceService.getFeaturedTemplates();
  }),

  getMarketplaceStats: publicProcedure.query(() => {
    return runbookMarketplaceService.getMarketplaceStats();
  }),

  // Disaster Recovery Testing
  getDRStats: protectedProcedure.query(() => {
    return disasterRecoveryService.getDRStats();
  }),

  getDRTestHistory: protectedProcedure.query(() => {
    return disasterRecoveryService.getDRTestHistory();
  }),
});
