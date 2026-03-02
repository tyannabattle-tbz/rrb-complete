import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { agentSessions, messages } from "../../drizzle/schema";
import { eq, desc, count } from "drizzle-orm";

export const customDashboardsRouter = router({
  // Get dashboard metrics
  getMetrics: protectedProcedure
    .input(z.object({ timeRange: z.enum(["day", "week", "month"]).default("week") }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      try {
        // Get total sessions
        const sessions = await db
          .select({ count: count(agentSessions.id) })
          .from(agentSessions)
          .where(eq(agentSessions.userId, ctx.user.id));

        // Get total messages
        const messageCount = await db
          .select({ count: count(messages.id) })
          .from(messages);

        // Calculate time-based metrics
        const now = new Date();
        const timeRangeMs = input.timeRange === "day" ? 24 * 60 * 60 * 1000 : 
                           input.timeRange === "week" ? 7 * 24 * 60 * 60 * 1000 :
                           30 * 24 * 60 * 60 * 1000;
        const startTime = new Date(now.getTime() - timeRangeMs);

        return {
          totalSessions: sessions[0]?.count || 0,
          totalMessages: messageCount[0]?.count || 0,
          averageSessionDuration: Math.floor(Math.random() * 3600) + 60, // Mock data
          successRate: Math.floor(Math.random() * 40) + 60, // Mock data
        };
      } catch (error) {
        console.error("[Dashboard] Error getting metrics:", error);
        throw new Error("Failed to get metrics");
      }
    }),

  // Get recent sessions for dashboard
  getRecentSessions: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(5) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      try {
        const sessions = await db
          .select()
          .from(agentSessions)
          .where(eq(agentSessions.userId, ctx.user.id))
          .orderBy(desc(agentSessions.createdAt))
          .limit(input.limit);

        return sessions;
      } catch (error) {
        console.error("[Dashboard] Error getting recent sessions:", error);
        return [];
      }
    }),

  // Save custom widget configuration
  saveWidgetConfig: protectedProcedure
    .input(
      z.object({
        widgetId: z.string(),
        type: z.enum(["metrics", "recentSessions", "performanceChart", "activityTimeline"]),
        position: z.object({ x: z.number(), y: z.number() }),
        size: z.object({ width: z.number(), height: z.number() }),
        config: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      // In a real app, save to database
      return {
        success: true,
        widgetId: input.widgetId,
      };
    }),

  // Get dashboard layout
  getDashboardLayout: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      // Return default layout
      return {
        widgets: [
          {
            id: "metrics",
            type: "metrics",
            position: { x: 0, y: 0 },
            size: { width: 4, height: 2 },
          },
          {
            id: "recentSessions",
            type: "recentSessions",
            position: { x: 4, y: 0 },
            size: { width: 4, height: 2 },
          },
          {
            id: "performanceChart",
            type: "performanceChart",
            position: { x: 0, y: 2 },
            size: { width: 8, height: 3 },
          },
        ],
      };
    }),
});
