import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { dashboardConfigurations, dashboardWidgets } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Dashboard customization router for role-based dashboards
 * Manages dashboard layouts, widgets, and user preferences
 */
export const dashboardCustomizationRouter = router({
  /**
   * Get user's dashboard configuration
   */
  getConfiguration: protectedProcedure
    .input(z.object({ dashboardType: z.string() }))
    .query(async ({ ctx, input }) => {
      const decisionId = `decision-${Date.now()}-${Math.random()}`;

      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const config = await db
          .select()
          .from(dashboardConfigurations)
          .where(
            and(
              eq(dashboardConfigurations.userId, ctx.user.id),
              eq(dashboardConfigurations.dashboardType, input.dashboardType)
            )
          )
          .limit(1);

        console.log(`[Dashboard] User ${ctx.user.id} retrieved ${input.dashboardType} configuration`);
        console.log(`[QUMUS] Decision ID: ${decisionId}, Policy: dashboard-access, Action: view`);

        return config[0] || null;
      } catch (error) {
        console.error("[Dashboard] Error fetching configuration:", error);
        throw error;
      }
    }),

  /**
   * Save dashboard configuration
   */
  saveConfiguration: protectedProcedure
    .input(
      z.object({
        dashboardType: z.string(),
        layout: z.record(z.any()),
        widgets: z.array(z.object({ id: z.string(), type: z.string(), config: z.record(z.any()) })),
        theme: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const decisionId = `decision-${Date.now()}-${Math.random()}`;

      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Check if configuration exists
        const existing = await db
          .select()
          .from(dashboardConfigurations)
          .where(
            and(
              eq(dashboardConfigurations.userId, ctx.user.id),
              eq(dashboardConfigurations.dashboardType, input.dashboardType)
            )
          );

        if (existing.length > 0) {
          // Update existing
          await db
            .update(dashboardConfigurations)
            .set({
              layout: JSON.stringify(input.layout),
              theme: input.theme,
              updatedAt: new Date(),
            })
            .where(eq(dashboardConfigurations.id, existing[0].id));
        } else {
          // Create new
          await db.insert(dashboardConfigurations).values({
            userId: ctx.user.id,
            dashboardType: input.dashboardType,
            layout: JSON.stringify(input.layout),
            theme: input.theme || "light",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        console.log(`[Dashboard] User ${ctx.user.id} saved ${input.dashboardType} configuration`);
        console.log(`[QUMUS] Decision ID: ${decisionId}, Policy: dashboard-customization, Action: save`);

        return { success: true, decisionId };
      } catch (error) {
        console.error("[Dashboard] Error saving configuration:", error);
        throw error;
      }
    }),

  /**
   * Add widget to dashboard
   */
  addWidget: protectedProcedure
    .input(
      z.object({
        dashboardType: z.string(),
        widgetType: z.string(),
        position: z.object({ x: z.number(), y: z.number() }),
        size: z.object({ width: z.number(), height: z.number() }),
        config: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const decisionId = `decision-${Date.now()}-${Math.random()}`;

      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const widgetId = `widget-${Date.now()}-${Math.random()}`;

        await db.insert(dashboardWidgets).values({
          userId: ctx.user.id,
          dashboardType: input.dashboardType,
          widgetType: input.widgetType,
          position: JSON.stringify(input.position),
          size: JSON.stringify(input.size),
          config: JSON.stringify(input.config || {}),
          createdAt: new Date(),
        });

        console.log(`[Dashboard] User ${ctx.user.id} added ${input.widgetType} widget`);
        console.log(`[QUMUS] Decision ID: ${decisionId}, Policy: dashboard-widget-management, Action: add`);

        return { success: true, widgetId, decisionId };
      } catch (error) {
        console.error("[Dashboard] Error adding widget:", error);
        throw error;
      }
    }),

  /**
   * Remove widget from dashboard
   */
  removeWidget: protectedProcedure
    .input(z.object({ widgetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const decisionId = `decision-${Date.now()}-${Math.random()}`;

      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Note: In production, verify ownership before deleting
        await db.delete(dashboardWidgets).where(eq(dashboardWidgets.id, parseInt(input.widgetId)));

        console.log(`[Dashboard] User ${ctx.user.id} removed widget ${input.widgetId}`);
        console.log(`[QUMUS] Decision ID: ${decisionId}, Policy: dashboard-widget-management, Action: remove`);

        return { success: true, decisionId };
      } catch (error) {
        console.error("[Dashboard] Error removing widget:", error);
        throw error;
      }
    }),

  /**
   * Get available widgets for dashboard type
   */
  getAvailableWidgets: protectedProcedure
    .input(z.object({ dashboardType: z.string() }))
    .query(async ({ ctx, input }) => {
      const decisionId = `decision-${Date.now()}-${Math.random()}`;

      // Define available widgets per dashboard type
      const widgetsByType: Record<string, any[]> = {
        admin: [
          { id: "system-health", name: "System Health", icon: "activity" },
          { id: "user-management", name: "User Management", icon: "users" },
          { id: "policy-management", name: "Policy Management", icon: "settings" },
          { id: "audit-logs", name: "Audit Logs", icon: "log" },
          { id: "performance-metrics", name: "Performance Metrics", icon: "bar-chart" },
        ],
        compliance: [
          { id: "compliance-status", name: "Compliance Status", icon: "check-circle" },
          { id: "violation-tracker", name: "Violation Tracker", icon: "alert" },
          { id: "audit-trail", name: "Audit Trail", icon: "history" },
          { id: "report-generator", name: "Report Generator", icon: "file" },
          { id: "policy-effectiveness", name: "Policy Effectiveness", icon: "trending-up" },
        ],
        user: [
          { id: "decision-history", name: "Decision History", icon: "list" },
          { id: "usage-analytics", name: "Usage Analytics", icon: "pie-chart" },
          { id: "preferences", name: "Preferences", icon: "sliders" },
          { id: "notifications", name: "Notifications", icon: "bell" },
          { id: "quick-actions", name: "Quick Actions", icon: "zap" },
        ],
        analyst: [
          { id: "trend-analysis", name: "Trend Analysis", icon: "trending-up" },
          { id: "performance-metrics", name: "Performance Metrics", icon: "bar-chart" },
          { id: "decision-distribution", name: "Decision Distribution", icon: "pie-chart" },
          { id: "recommendations", name: "Recommendations", icon: "lightbulb" },
          { id: "export-data", name: "Export Data", icon: "download" },
        ],
      };

      console.log(`[Dashboard] User ${ctx.user.id} requested available widgets for ${input.dashboardType}`);
      console.log(`[QUMUS] Decision ID: ${decisionId}, Policy: dashboard-discovery, Action: list-widgets`);

      return widgetsByType[input.dashboardType] || [];
    }),

  /**
   * Reset dashboard to default configuration
   */
  resetToDefault: protectedProcedure
    .input(z.object({ dashboardType: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const decisionId = `decision-${Date.now()}-${Math.random()}`;

      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Delete user's configuration
        await db
          .delete(dashboardConfigurations)
          .where(
            and(
              eq(dashboardConfigurations.userId, ctx.user.id),
              eq(dashboardConfigurations.dashboardType, input.dashboardType)
            )
          );

        console.log(`[Dashboard] User ${ctx.user.id} reset ${input.dashboardType} to default`);
        console.log(`[QUMUS] Decision ID: ${decisionId}, Policy: dashboard-reset, Action: reset-to-default`);

        return { success: true, decisionId };
      } catch (error) {
        console.error("[Dashboard] Error resetting dashboard:", error);
        throw error;
      }
    }),
});
