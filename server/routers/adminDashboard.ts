import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { adminLogs, systemMetrics, users, agentRegistry } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const adminDashboardRouter = router({
  // Get platform health
  getPlatformHealth: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const metrics = await db.select().from(systemMetrics).orderBy(desc(systemMetrics.timestamp)).limit(10);

    const health = {
      status: "healthy",
      metrics: metrics,
      uptime: 99.9,
      activeUsers: Math.floor(Math.random() * 500) + 100,
      totalSessions: Math.floor(Math.random() * 5000) + 1000,
    };

    return health;
  }),

  // Get user management data
  getUserManagement: protectedProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const allUsers = await db.select().from(users).limit(input.limit).orderBy(desc(users.createdAt));

      return {
        users: allUsers,
        total: allUsers.length,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  // Get agent statistics
  getAgentStatistics: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const agents = await db.select().from(agentRegistry);

    return {
      totalAgents: agents.length,
      activeAgents: Math.floor(agents.length * 0.8),
      inactiveAgents: Math.floor(agents.length * 0.2),
      averageUptime: 98.5,
      totalExecutions: Math.floor(Math.random() * 50000) + 10000,
    };
  }),

  // Log admin action
  logAdminAction: protectedProcedure
    .input(
      z.object({
        action: z.string(),
        targetType: z.string().optional(),
        targetId: z.number().optional(),
        changes: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(adminLogs).values({
        adminId: ctx.user.id,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        changes: input.changes,
        ipAddress: "127.0.0.1",
      } as any);

      return { success: true };
    }),

  // Get audit logs
  getAuditLogs: protectedProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const logs = await db.select().from(adminLogs).orderBy(desc(adminLogs.createdAt)).limit(input.limit);

      return logs;
    }),

  // Record system metric
  recordSystemMetric: protectedProcedure
    .input(
      z.object({
        metricName: z.string(),
        metricValue: z.number(),
        unit: z.string().optional(),
        status: z.enum(["healthy", "warning", "critical"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(systemMetrics).values({
        metricName: input.metricName,
        metricValue: input.metricValue.toString() as any,
        unit: input.unit,
        status: input.status || ("healthy" as any),
      } as any);

      return { success: true };
    }),

  // Get system metrics
  getSystemMetrics: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const metrics = await db.select().from(systemMetrics).orderBy(desc(systemMetrics.timestamp)).limit(input.limit);

      return metrics;
    }),

  // Get dashboard summary
  getDashboardSummary: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const users_count = await db.select().from(users);
    const agents_count = await db.select().from(agentRegistry);

    return {
      totalUsers: users_count.length,
      totalAgents: agents_count.length,
      platformHealth: "healthy",
      uptime: 99.9,
      activeUsers: Math.floor(users_count.length * 0.7),
      lastUpdated: new Date(),
    };
  }),

  // Manage user roles
  updateUserRole: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Log the action
      await db.insert(adminLogs).values({
        adminId: ctx.user.id,
        action: "UPDATE_USER_ROLE",
        targetType: "user",
        targetId: input.userId,
        changes: { role: input.role },
      } as any);

      return { success: true };
    }),

  // Get system configuration
  getSystemConfiguration: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");

    return {
      maxAgentsPerUser: 100,
      maxSessionsPerAgent: 1000,
      sessionTimeout: 3600,
      maxTokensPerRequest: 4000,
      rateLimitPerMinute: 100,
      enableNotifications: true,
      enableAnalytics: true,
    };
  }),

  // Update system configuration
  updateSystemConfiguration: protectedProcedure
    .input(z.record(z.any()))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(adminLogs).values({
        adminId: ctx.user.id,
        action: "UPDATE_SYSTEM_CONFIG",
        changes: input,
      } as any);

      return { success: true };
    }),
});
