import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { sessionMetrics, toolUsageStats, performanceTrends } from "../../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export const analyticsRouter = router({
  // Get session metrics
  getSessionMetrics: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      const metrics = await db
        .select()
        .from(sessionMetrics)
        .where(eq(sessionMetrics.sessionId, input.sessionId))
        .limit(1);
      
      return metrics[0] || null;
    }),

  // Get tool usage statistics
  getToolUsageStats: protectedProcedure
    .input(z.object({
      limit: z.number().default(10),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      const stats = await db
        .select()
        .from(toolUsageStats)
        .where(eq(toolUsageStats.userId, ctx.user.id))
        .limit(input.limit);
      
      return stats;
    }),

  // Get performance trends
  getPerformanceTrends: protectedProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      const trends = await db
        .select()
        .from(performanceTrends)
        .where(
          and(
            eq(performanceTrends.userId, ctx.user.id),
            gte(performanceTrends.date, input.startDate),
            lte(performanceTrends.date, input.endDate)
          )
        );
      
      return trends;
    }),

  // Get analytics summary
  getAnalyticsSummary: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      // Get recent metrics
      const recentMetrics = await db
        .select()
        .from(sessionMetrics)
        .limit(10);
      
      // Calculate aggregates
      const totalSessions = recentMetrics.length;
      const avgDuration = recentMetrics.length > 0
        ? Math.round(
            recentMetrics.reduce((sum: number, m: any) => sum + (m.duration || 0), 0) / recentMetrics.length
          )
        : 0;
      
      const avgSuccessRate = recentMetrics.length > 0
        ? (
            recentMetrics.reduce((sum: number, m: any) => sum + parseFloat(m.successRate?.toString() || "0"), 0) /
            recentMetrics.length
          ).toFixed(2)
        : "0";
      
      return {
        totalSessions,
        avgDuration,
        avgSuccessRate: parseFloat(avgSuccessRate),
        totalToolExecutions: recentMetrics.reduce((sum: number, m: any) => sum + (m.toolExecutionCount || 0), 0),
        successfulExecutions: recentMetrics.reduce((sum: number, m: any) => sum + (m.successfulToolExecutions || 0), 0),
      };
    }),
});
