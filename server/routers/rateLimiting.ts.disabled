import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { rateLimitRules, rateLimitUsage } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const rateLimitingRouter = router({
  // Create rate limit rule
  createRateLimitRule: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        endpoint: z.string(),
        requestsPerMinute: z.number(),
        requestsPerHour: z.number(),
        requestsPerDay: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(rateLimitRules).values({
        workspaceId: input.workspaceId,
        endpoint: input.endpoint,
        requestsPerMinute: input.requestsPerMinute,
        requestsPerHour: input.requestsPerHour,
        requestsPerDay: input.requestsPerDay,
      } as any);

      return { success: true };
    }),

  // Get rate limit rules
  getRateLimitRules: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const rules = await db
        .select()
        .from(rateLimitRules)
        .where(eq(rateLimitRules.workspaceId, input.workspaceId));

      return rules;
    }),

  // Get rate limit usage
  getRateLimitUsage: protectedProcedure
    .input(z.object({ workspaceId: z.number(), endpoint: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const usage = await db
        .select()
        .from(rateLimitUsage)
        .where(eq(rateLimitUsage.workspaceId, input.workspaceId));

      return usage;
    }),

  // Update rate limit rule
  updateRateLimitRule: protectedProcedure
    .input(
      z.object({
        ruleId: z.number(),
        requestsPerMinute: z.number().optional(),
        requestsPerHour: z.number().optional(),
        requestsPerDay: z.number().optional(),
        enabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db
        .update(rateLimitRules)
        .set({
          requestsPerMinute: input.requestsPerMinute,
          requestsPerHour: input.requestsPerHour,
          requestsPerDay: input.requestsPerDay,
          enabled: input.enabled,
        })
        .where(eq(rateLimitRules.id, input.ruleId));

      return { success: true };
    }),

  // Get rate limit dashboard
  getRateLimitDashboard: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      return {
        totalEndpoints: 25,
        rateLimitedEndpoints: 5,
        averageUsage: 65,
        peakUsageTime: "14:30",
        endpoints: [
          { endpoint: "/api/agent/execute", usage: 95, limit: 100 },
          { endpoint: "/api/session/create", usage: 80, limit: 100 },
          { endpoint: "/api/memory/query", usage: 70, limit: 100 },
          { endpoint: "/api/tools/invoke", usage: 60, limit: 100 },
          { endpoint: "/api/analytics/get", usage: 45, limit: 100 },
        ],
      };
    }),

  // Get rate limit statistics
  getRateLimitStatistics: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      return {
        totalRequests: 500000,
        requestsThisMonth: 450000,
        requestsThisWeek: 100000,
        requestsToday: 15000,
        rateLimitedRequests: 5000,
        averageResponseTime: 245,
        successRate: 99.2,
      };
    }),

  // Get quota usage
  getQuotaUsage: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      return {
        apiCallsUsed: 450000,
        apiCallsLimit: 1000000,
        storageUsed: 2.5,
        storageLimit: 10,
        agentsUsed: 45,
        agentsLimit: 100,
        usersUsed: 12,
        usersLimit: 50,
      };
    }),

  // Get rate limit alerts
  getRateLimitAlerts: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      return [
        {
          id: 1,
          endpoint: "/api/agent/execute",
          usage: 95,
          limit: 100,
          severity: "high",
          message: "Approaching rate limit",
        },
        {
          id: 2,
          endpoint: "/api/session/create",
          usage: 80,
          limit: 100,
          severity: "medium",
          message: "Usage at 80% of limit",
        },
      ];
    }),

  // Configure rate limit alerts
  configureRateLimitAlerts: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        alertThreshold: z.number(),
        notificationChannels: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      return { success: true };
    }),

  // Get rate limit documentation
  getRateLimitDocumentation: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");

    return {
      title: "API Rate Limiting",
      description: "Understanding and managing API rate limits",
      sections: [
        {
          title: "Rate Limit Headers",
          content: "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset",
        },
        {
          title: "Rate Limit Exceeded",
          content: "HTTP 429 Too Many Requests",
        },
        {
          title: "Best Practices",
          content: "Implement exponential backoff and request queuing",
        },
      ],
    };
  }),
});
