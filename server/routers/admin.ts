import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { AdminService } from "../services/adminService";
import { adminDatabaseService } from "../services/adminDatabaseService";
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

  /**
   * Get all responders with current status
   */
  getResponders: protectedProcedure
    .input(z.object({ role: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Mock data - replace with database query
      const responders = [
        {
          id: "resp-1",
          name: "Dr. Sarah Johnson",
          role: "medical",
          status: "on-duty",
          currentCallCount: 2,
          maxConcurrentCalls: 3,
          successRate: 98,
          totalCallsHandled: 156,
          responseTime: 45,
          specializations: ["cardiac", "trauma"],
        },
        {
          id: "resp-2",
          name: "Officer Mike Chen",
          role: "security",
          status: "on-duty",
          currentCallCount: 1,
          maxConcurrentCalls: 3,
          successRate: 95,
          totalCallsHandled: 142,
          responseTime: 60,
          specializations: ["threat-assessment", "de-escalation"],
        },
      ];

      if (input?.role) {
        return responders.filter((r) => r.role === input.role);
      }

      return responders;
    }),

  /**
   * Get active call queue
   */
  getCallQueue: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return [
      {
        callId: "call-001",
        callerId: "caller-1",
        callerName: "John Smith",
        alertType: "medical",
        severity: "high",
        position: 1,
        estimatedWait: 2,
        createdAt: new Date(Date.now() - 120000),
      },
      {
        callId: "call-002",
        callerId: "caller-2",
        callerName: "Jane Doe",
        alertType: "security",
        severity: "medium",
        position: 2,
        estimatedWait: 5,
        createdAt: new Date(Date.now() - 60000),
      },
    ];
  }),

  /**
   * Update responder status
   */
  updateResponderStatus: protectedProcedure
    .input(
      z.object({
        responderId: z.string(),
        status: z.enum(["active", "inactive", "on-duty", "off-duty"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      console.log(`[Admin] Updated responder ${input.responderId} status to ${input.status}`);
      return {
        success: true,
        responderId: input.responderId,
        newStatus: input.status,
        timestamp: new Date(),
      };
    }),

  /**
   * Assign call to responder
   */
  assignCall: protectedProcedure
    .input(
      z.object({
        callId: z.string(),
        responderId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      console.log(`[Admin] Assigned call ${input.callId} to responder ${input.responderId}`);
      return {
        success: true,
        callId: input.callId,
        responderId: input.responderId,
        timestamp: new Date(),
      };
    }),
});
