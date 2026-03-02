import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { alertRules, alerts } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

/**
 * Alert Rules Engine Router
 * Manages creation, configuration, and triggering of alert rules for all platforms
 */
export const alertRulesEngineRouter = router({
  // Create a new alert rule
  createRule: protectedProcedure
    .input(
      z.object({
        ruleName: z.string().min(1),
        metricName: z.string().min(1),
        threshold: z.number().positive(),
        operator: z.enum(["gt", "lt", "eq", "gte", "lte"]),
        severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const result = await db.insert(alertRules).values({
          userId: ctx.user.id,
          ruleName: input.ruleName,
          metricName: input.metricName,
          threshold: input.threshold as any,
          operator: input.operator,
          severity: input.severity,
          enabled: true,
        });

        notifyOwner({
          title: "Alert Rule Created",
          content: `Created alert rule "${input.ruleName}" for ${input.metricName} with threshold ${input.threshold}`,
        }).catch(err => console.error("Notification failed:", err));

        return {
          success: true,
          ruleId: (result as any).insertId || 0,
          ruleName: input.ruleName,
          message: `Alert rule "${input.ruleName}" created successfully`,
        };
      } catch (error) {
        console.error("[Alert Rules] Error creating rule:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create alert rule",
        });
      }
    }),

  // Get all alert rules for the user
  getRules: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    try {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const rules = await db
        .select()
        .from(alertRules)
        .where(eq(alertRules.userId, ctx.user.id));

      return {
        success: true,
        rules: rules.map(rule => ({
          id: rule.id,
          name: rule.ruleName,
          metric: rule.metricName,
          threshold: Number(rule.threshold),
          operator: rule.operator,
          severity: rule.severity,
          enabled: rule.enabled,
          lastTriggered: rule.createdAt,
          createdAt: rule.createdAt,
        })),
        totalRules: rules.length,
      };
    } catch (error) {
      console.error("[Alert Rules] Error fetching rules:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch alert rules",
      });
    }
  }),

  // Check if a metric triggers any alert rules
  checkMetricThreshold: publicProcedure
    .input(
      z.object({
        metricName: z.string(),
        currentValue: z.number(),
        userId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const rules = await db
          .select()
          .from(alertRules)
          .where(
            and(
              eq(alertRules.metricName, input.metricName),
              eq(alertRules.enabled, true),
              input.userId ? eq(alertRules.userId, input.userId) : undefined
            )
          );

        const triggeredAlerts: Array<{ruleId: number; ruleName: string; severity: string; message: string; alertId: number}> = [];

        for (const rule of rules as any) {
          let isTriggered = false;
          const threshold = Number(rule.threshold);

          switch (rule.operator) {
            case "gt":
              isTriggered = input.currentValue > threshold;
              break;
            case "lt":
              isTriggered = input.currentValue < threshold;
              break;
            case "eq":
              isTriggered = input.currentValue === threshold;
              break;
            case "gte":
              isTriggered = input.currentValue >= threshold;
              break;
            case "lte":
              isTriggered = input.currentValue <= threshold;
              break;
          }

          if (isTriggered) {
            // Create alert record
            const alertResult = await db.insert(alerts).values({
              alertRuleId: rule.id,
              status: "triggered",
              value: String(input.currentValue),
              message: `Alert triggered: ${rule.ruleName} - ${input.metricName} is ${input.currentValue} (threshold: ${threshold})`,
            });

            triggeredAlerts.push({
              ruleId: rule.id,
              ruleName: rule.ruleName,
              severity: rule.severity,
              message: `${rule.ruleName}: ${input.metricName} = ${input.currentValue}`,
              alertId: (alertResult as any).insertId || 0,
            });

            // Notify owner
            notifyOwner({
              title: `🚨 ${rule.severity.toUpperCase()} Alert: ${rule.ruleName}`,
              content: `${input.metricName} is ${input.currentValue} (threshold: ${threshold})`,
            }).catch(err => console.error("Notification failed:", err));
          }
        }

        return {
          success: true,
          triggered: triggeredAlerts.length > 0,
          alerts: triggeredAlerts,
          count: triggeredAlerts.length,
        };
      } catch (error) {
        console.error("[Alert Rules] Error checking thresholds:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check alert thresholds",
        });
      }
    }),

  // Get alert history
  getAlertHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const alertHistory: any[] = await db
          .select()
          .from(alerts)
          .innerJoin(alertRules, eq(alerts.alertRuleId, alertRules.id))
          .where(eq(alertRules.userId, ctx.user.id))
          .limit(input.limit)
          .offset(input.offset);

        return {
          success: true,
          alerts: alertHistory.map((item: any) => {const a = item.alerts; const r = item.alert_rules; return {
            alertId: a.id,
            ruleName: r.ruleName,
            status: a.status,
            value: Number(a.value),
            message: a.message,
            triggeredAt: a.createdAt,
          };}),
          total: alertHistory.length,
        };
      } catch (error) {
        console.error("[Alert Rules] Error fetching history:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch alert history",
        });
      }
    }),

  // Acknowledge an alert
  acknowledgeAlert: protectedProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        await db
          .update(alerts)
          .set({ status: "acknowledged", acknowledgedAt: new Date() })
          .where(eq(alerts.id, input.alertId));

        return {
          success: true,
          alertId: input.alertId,
          message: "Alert acknowledged",
        };
      } catch (error) {
        console.error("[Alert Rules] Error acknowledging alert:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to acknowledge alert",
        });
      }
    }),

  // Resolve an alert
  resolveAlert: protectedProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        await db
          .update(alerts)
          .set({ status: "resolved", resolvedAt: new Date() })
          .where(eq(alerts.id, input.alertId));

        return {
          success: true,
          alertId: input.alertId,
          message: "Alert resolved",
        };
      } catch (error) {
        console.error("[Alert Rules] Error resolving alert:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to resolve alert",
        });
      }
    }),
});
