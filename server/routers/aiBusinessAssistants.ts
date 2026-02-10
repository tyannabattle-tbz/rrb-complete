/**
 * AI Business Assistants Router — tRPC endpoints for managing and querying
 * the 5 AI-powered business operation bots.
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getAIBusinessAssistants } from "../services/ai-business-assistants";

export const aiBusinessAssistantsRouter = router({
  /** Get status of all AI business bots */
  getStatus: publicProcedure.query(async () => {
    const engine = getAIBusinessAssistants();
    return engine.getStatus();
  }),

  /** Get all bots */
  getBots: publicProcedure.query(async () => {
    const engine = getAIBusinessAssistants();
    return engine.getBots();
  }),

  /** Get a specific bot */
  getBot: publicProcedure
    .input(z.object({ botId: z.string() }))
    .query(async ({ input }) => {
      const engine = getAIBusinessAssistants();
      return engine.getBot(input.botId) || null;
    }),

  /** Get recent actions from all bots */
  getRecentActions: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).optional() }).optional())
    .query(async ({ input }) => {
      const engine = getAIBusinessAssistants();
      return engine.getRecentActions(input?.limit || 50);
    }),

  /** Get actions for a specific bot */
  getActionsByBot: publicProcedure
    .input(z.object({ botId: z.string(), limit: z.number().min(1).max(100).optional() }))
    .query(async ({ input }) => {
      const engine = getAIBusinessAssistants();
      return engine.getActionsByBot(input.botId, input.limit || 20);
    }),

  /** Get AI insights */
  getInsights: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).optional() }).optional())
    .query(async ({ input }) => {
      const engine = getAIBusinessAssistants();
      return engine.getInsights(input?.limit || 20);
    }),

  /** Acknowledge a bot action */
  acknowledgeAction: protectedProcedure
    .input(z.object({ actionId: z.string() }))
    .mutation(async ({ input }) => {
      const engine = getAIBusinessAssistants();
      return { success: engine.acknowledgeAction(input.actionId) };
    }),

  /** Enable a bot */
  enableBot: protectedProcedure
    .input(z.object({ botId: z.string() }))
    .mutation(async ({ input }) => {
      const engine = getAIBusinessAssistants();
      return { success: engine.enableBot(input.botId) };
    }),

  /** Disable a bot */
  disableBot: protectedProcedure
    .input(z.object({ botId: z.string() }))
    .mutation(async ({ input }) => {
      const engine = getAIBusinessAssistants();
      return { success: engine.disableBot(input.botId) };
    }),

  /** Manually trigger a bot run */
  triggerBot: protectedProcedure
    .input(z.object({ botId: z.string() }))
    .mutation(async ({ input }) => {
      const engine = getAIBusinessAssistants();
      const actions = await engine.runBot(input.botId);
      return { success: true, actionsGenerated: actions.length, actions };
    }),

  /** Get combined activity feed (all bots + QUMUS decisions) for home page widget */
  getActivityFeed: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).optional() }).optional())
    .query(async ({ input }) => {
      const engine = getAIBusinessAssistants();
      const limit = input?.limit || 30;
      const actions = engine.getRecentActions(limit);
      const status = engine.getStatus();

      return {
        actions,
        summary: {
          totalBots: status.totalBots,
          activeBots: status.activeBots,
          totalActions: status.totalActions,
          isRunning: status.isRunning,
          uptime: status.uptime,
        },
      };
    }),
});
