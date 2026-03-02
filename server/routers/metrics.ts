import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { MetricsService } from "../services/metricsService";
import { TRPCError } from "@trpc/server";

export const metricsRouter = router({
  /**
   * Get comprehensive metrics snapshot
   */
  getSnapshot: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    return MetricsService.getMetricsSnapshot(ctx.user.id);
  }),

  /**
   * Generate performance report
   */
  generateReport: protectedProcedure
    .input(z.object({ period: z.enum(["daily", "weekly", "monthly"]).optional() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      return MetricsService.generatePerformanceReport(ctx.user.id, input.period || "weekly");
    }),

  /**
   * Get quota status and usage
   */
  getQuotaStatus: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    return MetricsService.getQuotaStatus(ctx.user.id);
  }),

  /**
   * Record a performance metric
   */
  recordMetric: protectedProcedure
    .input(
      z.object({
        metricType: z.string(),
        value: z.number(),
        unit: z.string().optional(),
        sessionId: z.number().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      await db.recordMetric(
        ctx.user.id,
        input.metricType,
        input.value,
        input.unit,
        input.sessionId,
        input.metadata
      );

      return { success: true };
    }),

  /**
   * Record API usage
   */
  recordApiUsage: protectedProcedure
    .input(
      z.object({
        requestCount: z.number(),
        tokenCount: z.number(),
        errorCount: z.number(),
        totalDuration: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      await db.recordApiUsage(
        ctx.user.id,
        input.requestCount,
        input.tokenCount,
        input.errorCount,
        input.totalDuration
      );

      return { success: true };
    }),

  /**
   * Export metrics as CSV
   */
  exportAsCSV: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    const csv = await MetricsService.exportMetricsAsCSV(ctx.user.id);
    return { csv, filename: `metrics-${new Date().toISOString().split("T")[0]}.csv` };
  }),

  /**
   * Get API usage history
   */
  getApiUsageHistory: protectedProcedure
    .input(z.object({ days: z.number().min(1).max(90).optional() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      return db.getApiUsage(ctx.user.id, input.days || 30);
    }),

  /**
   * Get or create user quota
   */
  getQuota: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    return db.getOrCreateQuota(ctx.user.id);
  }),

  /**
   * Update user quota (admin only)
   */
  updateQuota: protectedProcedure
    .input(
      z.object({
        requestsPerDay: z.number().optional(),
        tokensPerDay: z.number().optional(),
        concurrentSessions: z.number().optional(),
        storageGB: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Update quota in database
      // This would require implementing an update function in db.ts

      return { success: true };
    }),
});
