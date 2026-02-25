import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { AdminService } from "../services/adminService";
import { TRPCError } from "@trpc/server";

export const adminRouter = router({
  /**
   * Get dashboard statistics (admin only)
   */
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return AdminService.getDashboardStats();
  }),

  /**
   * Get system health status (admin only)
   */
  getSystemHealth: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return AdminService.getSystemHealth();
  }),

  /**
   * Get metrics history (admin only)
   */
  getMetricsHistory: protectedProcedure
    .input(z.object({ hours: z.number().min(1).max(720).optional() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return AdminService.getMetricsHistory(input.hours || 24);
    }),

  /**
   * Get system alerts (admin only)
   */
  getAlerts: protectedProcedure
    .input(z.object({ status: z.enum(["active", "acknowledged", "resolved"]).optional() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return AdminService.getAlerts(input.status);
    }),

  /**
   * Acknowledge alert (admin only)
   */
  acknowledgeAlert: protectedProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await AdminService.acknowledgeAlert(input.alertId, ctx.user.id);
      return { success: true };
    }),

  /**
   * Resolve alert (admin only)
   */
  resolveAlert: protectedProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await AdminService.resolveAlert(input.alertId);
      return { success: true };
    }),

  /**
   * Get audit logs (admin only)
   */
  getAuditLogs: protectedProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        action: z.string().optional(),
        resource: z.string().optional(),
        status: z.enum(["success", "failure"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return AdminService.getAuditLogs(input);
    }),

  /**
   * Get user management data (admin only)
   */
  getUserManagement: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return AdminService.getUserManagementData();
  }),

  /**
   * Get API usage statistics (admin only)
   */
  getApiUsageStats: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return AdminService.getApiUsageStats();
  }),

  /**
   * Export system report (admin only)
   */
  exportReport: protectedProcedure
    .input(z.object({ format: z.enum(["pdf", "csv"]).optional() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const report = await AdminService.exportSystemReport(input.format || "pdf");
      return {
        success: true,
        report,
        filename: `system-report-${new Date().toISOString().split("T")[0]}.${input.format || "pdf"}`,
      };
    }),
});
