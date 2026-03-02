import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { alertRules, alerts } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const monitoringRouter = router({
  // Create alert rule
  createAlertRule: protectedProcedure
    .input(
      z.object({
        ruleName: z.string(),
        metricName: z.string(),
        threshold: z.number(),
        operator: z.enum(["gt", "lt", "eq", "gte", "lte"]),
        severity: z.enum(["low", "medium", "high", "critical"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(alertRules).values({
        userId: ctx.user.id,
        ruleName: input.ruleName,
        metricName: input.metricName,
        threshold: input.threshold.toString() as any,
        operator: input.operator as any,
        severity: input.severity || ("medium" as any),
      } as any);

      return { success: true };
    }),

  // Get alert rules
  getAlertRules: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const rules = await db.select().from(alertRules).where(eq(alertRules.userId, ctx.user.id));

    return rules;
  }),

  // Get active alerts
  getActiveAlerts: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const activeAlerts = await db
      .select()
      .from(alerts)
      .where(eq(alerts.status, "triggered" as any))
      .orderBy(desc(alerts.createdAt))
      .limit(50);

    return activeAlerts;
  }),

  // Acknowledge alert
  acknowledgeAlert: protectedProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db
        .update(alerts)
        .set({
          status: "acknowledged" as any,
          acknowledgedAt: new Date(),
        })
        .where(eq(alerts.id, input.alertId));

      return { success: true };
    }),

  // Resolve alert
  resolveAlert: protectedProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db
        .update(alerts)
        .set({
          status: "resolved" as any,
          resolvedAt: new Date(),
        })
        .where(eq(alerts.id, input.alertId));

      return { success: true };
    }),

  // Get alert history
  getAlertHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const history = await db.select().from(alerts).orderBy(desc(alerts.createdAt)).limit(input.limit);

      return history;
    }),

  // Get monitoring dashboard
  getMonitoringDashboard: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");

    return {
      systemHealth: "healthy",
      uptime: 99.9,
      activeAlerts: 3,
      acknowledgedAlerts: 5,
      resolvedAlerts: 42,
      criticalAlerts: 0,
      highAlerts: 2,
      mediumAlerts: 1,
      lowAlerts: 0,
      metrics: {
        cpuUsage: 45.5,
        memoryUsage: 62.3,
        diskUsage: 78.9,
        networkLatency: 12.5,
      },
    };
  }),

  // Get alert statistics
  getAlertStatistics: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");

    return {
      totalAlerts: 50,
      triggeredAlerts: 3,
      acknowledgedAlerts: 5,
      resolvedAlerts: 42,
      averageResolutionTime: 245,
      alertsPerDay: 2.5,
      criticalAlertRate: 0,
    };
  }),

  // Configure notification channels
  configureNotificationChannels: protectedProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
        slack: z.string().optional(),
        sms: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      return { success: true, channels: input };
    }),

  // Get notification preferences
  getNotificationPreferences: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");

    return {
      email: true,
      slack: true,
      sms: false,
      criticalOnly: false,
      quietHours: { start: "22:00", end: "08:00" },
    };
  }),
});
