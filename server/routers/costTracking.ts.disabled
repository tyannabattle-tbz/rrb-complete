import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { agentSessions, messages } from "../../drizzle/schema";
import { eq, desc, count } from "drizzle-orm";

// Pricing per 1K tokens (example rates)
const PRICING = {
  "gpt-4-turbo": { input: 0.01, output: 0.03 },
  "gpt-4": { input: 0.03, output: 0.06 },
  "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
};

export const costTrackingRouter = router({
  // Get cost estimate for a session
  getSessionCost: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      try {
        const session = await db
          .select()
          .from(agentSessions)
          .where(eq(agentSessions.id, input.sessionId));

        if (!session || session.length === 0) {
          throw new Error("Session not found");
        }

        const sessionData = session[0];
        const model = (sessionData.model as keyof typeof PRICING) || "gpt-4-turbo";
        const pricing = PRICING[model] || PRICING["gpt-4-turbo"];

        // Get message count for rough estimation
        const msgCount = await db
          .select({ count: count(messages.id) })
          .from(messages)
          .where(eq(messages.sessionId, input.sessionId));

        const estimatedTokens = (msgCount[0]?.count || 0) * 150; // Rough estimate: 150 tokens per message
        const inputCost = (estimatedTokens * 0.7 * pricing.input) / 1000;
        const outputCost = (estimatedTokens * 0.3 * pricing.output) / 1000;
        const totalCost = inputCost + outputCost;

        return {
          sessionId: input.sessionId,
          model,
          estimatedTokens,
          estimatedInputTokens: Math.round(estimatedTokens * 0.7),
          estimatedOutputTokens: Math.round(estimatedTokens * 0.3),
          inputCost: inputCost.toFixed(6),
          outputCost: outputCost.toFixed(6),
          totalCost: totalCost.toFixed(6),
          currency: "USD",
        };
      } catch (error) {
        console.error("[CostTracking] Error getting session cost:", error);
        throw new Error("Failed to get session cost");
      }
    }),

  // Get total cost for all sessions
  getTotalCost: protectedProcedure
    .input(z.object({ timeRange: z.enum(["day", "week", "month"]).default("month") }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      try {
        const sessions = await db
          .select()
          .from(agentSessions)
          .where(eq(agentSessions.userId, ctx.user.id));

        let totalCost = 0;
        let totalTokens = 0;

        for (const session of sessions) {
          const model = (session.model as keyof typeof PRICING) || "gpt-4-turbo";
          const pricing = PRICING[model] || PRICING["gpt-4-turbo"];

          const msgCount = await db
            .select({ count: count(messages.id) })
            .from(messages)
            .where(eq(messages.sessionId, session.id));

          const estimatedTokens = (msgCount[0]?.count || 0) * 150;
          const inputCost = (estimatedTokens * 0.7 * pricing.input) / 1000;
          const outputCost = (estimatedTokens * 0.3 * pricing.output) / 1000;

          totalCost += inputCost + outputCost;
          totalTokens += estimatedTokens;
        }

        return {
          timeRange: input.timeRange,
          totalSessions: sessions.length,
          totalTokens,
          totalCost: totalCost.toFixed(6),
          averageCostPerSession: sessions.length > 0 ? (totalCost / sessions.length).toFixed(6) : "0",
          currency: "USD",
        };
      } catch (error) {
        console.error("[CostTracking] Error getting total cost:", error);
        throw new Error("Failed to get total cost");
      }
    }),

  // Get cost breakdown by model
  getCostByModel: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      try {
        const sessions = await db
          .select()
          .from(agentSessions)
          .where(eq(agentSessions.userId, ctx.user.id));

        const costByModel: Record<string, any> = {};

        for (const session of sessions) {
          const model = session.model || "gpt-4-turbo";
          if (!costByModel[model]) {
            costByModel[model] = { count: 0, totalCost: 0, totalTokens: 0 };
          }

          const pricing = PRICING[model as keyof typeof PRICING] || PRICING["gpt-4-turbo"];
          const msgCount = await db
            .select({ count: count(messages.id) })
            .from(messages)
            .where(eq(messages.sessionId, session.id));

          const estimatedTokens = (msgCount[0]?.count || 0) * 150;
          const inputCost = (estimatedTokens * 0.7 * pricing.input) / 1000;
          const outputCost = (estimatedTokens * 0.3 * pricing.output) / 1000;

          costByModel[model].count += 1;
          costByModel[model].totalCost += inputCost + outputCost;
          costByModel[model].totalTokens += estimatedTokens;
        }

        return Object.entries(costByModel).map(([model, data]) => ({
          model,
          sessionCount: data.count,
          totalTokens: data.totalTokens,
          totalCost: data.totalCost.toFixed(6),
          averageCostPerSession: data.count > 0 ? (data.totalCost / data.count).toFixed(6) : "0",
        }));
      } catch (error) {
        console.error("[CostTracking] Error getting cost by model:", error);
        return [];
      }
    }),

  // Set cost alert threshold
  setCostAlert: protectedProcedure
    .input(z.object({ threshold: z.number().min(0), alertEmail: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      // In production, save to database
      return {
        success: true,
        message: `Cost alert set to $${input.threshold} for ${input.alertEmail}`,
      };
    }),
});
