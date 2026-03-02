import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const customDashboardBuilderRouter = router({
  // Create custom dashboard
  createDashboard: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        isPublic: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dashboardId = Math.random().toString(36).substr(2, 9);
      return {
        success: true,
        dashboardId,
        message: "Dashboard created",
        name: input.name,
        createdAt: new Date(),
      };
    }),

  // Add widget to dashboard
  addWidget: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        widgetType: z.enum([
          "spending_summary",
          "cost_breakdown",
          "budget_progress",
          "usage_trends",
          "top_projects",
          "top_users",
          "alerts",
          "forecasts",
        ]),
        config: z.record(z.string(), z.any()),
        position: z.object({ x: z.number(), y: z.number() }),
        size: z.object({ width: z.number(), height: z.number() }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const widgetId = Math.random().toString(36).substr(2, 9);
      return {
        success: true,
        widgetId,
        message: "Widget added",
        dashboardId: input.dashboardId,
      };
    }),

  // Remove widget from dashboard
  removeWidget: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        widgetId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Widget removed",
        dashboardId: input.dashboardId,
        widgetId: input.widgetId,
      };
    }),

  // Update widget config
  updateWidget: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        widgetId: z.string(),
        config: z.record(z.string(), z.any()).optional(),
        position: z.object({ x: z.number(), y: z.number() }).optional(),
        size: z.object({ width: z.number(), height: z.number() }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Widget updated",
        dashboardId: input.dashboardId,
        widgetId: input.widgetId,
      };
    }),

  // Get dashboard
  getDashboard: protectedProcedure
    .input(z.object({ dashboardId: z.string() }))
    .query(async ({ ctx, input }) => {
      return {
        dashboardId: input.dashboardId,
        name: "My Dashboard",
        description: "Personal spending dashboard",
        isPublic: false,
        widgets: [
          {
            widgetId: "widget1",
            type: "spending_summary",
            position: { x: 0, y: 0 },
            size: { width: 4, height: 2 },
            data: { totalSpend: 2500, change: 19 },
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),

  // List user dashboards
  listDashboards: protectedProcedure.query(async ({ ctx }) => {
    return {
      dashboards: [
        {
          dashboardId: "dash1",
          name: "My Dashboard",
          description: "Personal spending dashboard",
          isPublic: false,
          widgetCount: 5,
          createdAt: new Date(),
        },
      ],
    };
  }),

  // Duplicate dashboard
  duplicateDashboard: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        newName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newDashboardId = Math.random().toString(36).substr(2, 9);
      return {
        success: true,
        newDashboardId,
        message: "Dashboard duplicated",
        name: input.newName,
      };
    }),

  // Share dashboard
  shareDashboard: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        shareWith: z.array(z.string().email()),
        permission: z.enum(["view", "edit"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Dashboard shared",
        dashboardId: input.dashboardId,
        sharedWith: input.shareWith.length,
      };
    }),

  // Delete dashboard
  deleteDashboard: protectedProcedure
    .input(z.object({ dashboardId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Dashboard deleted",
        dashboardId: input.dashboardId,
      };
    }),
});
