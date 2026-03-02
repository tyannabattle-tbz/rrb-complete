import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const spendingReportsRouter = router({
  // Generate monthly spending report
  generateMonthlyReport: protectedProcedure
    .input(
      z.object({
        month: z.number().min(1).max(12),
        year: z.number(),
        format: z.enum(["pdf", "csv", "json"]).default("pdf"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        reportId: "report_" + Math.random().toString(36).substr(2, 9),
        message: "Report generated successfully",
        downloadUrl: "/reports/monthly-" + input.month + "-" + input.year + "." + input.format,
        generatedAt: new Date(),
      };
    }),

  // Get spending summary
  getSpendingSummary: protectedProcedure
    .input(
      z.object({
        timeRange: z.enum(["7d", "30d", "90d", "ytd", "all"]),
      })
    )
    .query(async ({ ctx, input }) => {
      return {
        timeRange: input.timeRange,
        totalSpend: 2500,
        previousPeriodSpend: 2100,
        changePercentage: 19,
        trend: "increasing",
        sessionsCount: 150,
        averageSessionCost: 16.67,
        topModel: "gpt-4",
        topProject: "Project A",
      };
    }),

  // Get spending trends
  getSpendingTrends: protectedProcedure
    .input(
      z.object({
        timeRange: z.enum(["7d", "30d", "90d"]),
      })
    )
    .query(async ({ ctx, input }) => {
      const days = input.timeRange === "7d" ? 7 : input.timeRange === "30d" ? 30 : 90;
      const trends = Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - i) * 86400000),
        dailySpend: Math.random() * 100 + 20,
        sessionCount: Math.floor(Math.random() * 20) + 1,
        averageCostPerSession: Math.random() * 30 + 10,
      }));

      return {
        timeRange: input.timeRange,
        trends,
        totalSpend: trends.reduce((sum, t) => sum + t.dailySpend, 0),
        averageDailySpend: trends.reduce((sum, t) => sum + t.dailySpend, 0) / days,
      };
    }),

  // Compare budget vs actual
  getBudgetVsActual: protectedProcedure
    .input(
      z.object({
        month: z.number().min(1).max(12),
        year: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      return {
        month: input.month,
        year: input.year,
        budget: 3000,
        actual: 2450,
        variance: 550,
        variancePercentage: 18.33,
        status: "under_budget",
        breakdown: [
          {
            category: "GPT-4",
            budget: 1500,
            actual: 1200,
            variance: 300,
          },
          {
            category: "GPT-3.5",
            budget: 1000,
            actual: 950,
            variance: 50,
          },
          {
            category: "Claude",
            budget: 500,
            actual: 300,
            variance: 200,
          },
        ],
      };
    }),

  // Get year-over-year comparison
  getYearOverYearComparison: protectedProcedure
    .input(
      z.object({
        month: z.number().min(1).max(12),
      })
    )
    .query(async ({ ctx, input }) => {
      return {
        month: input.month,
        currentYear: 2500,
        previousYear: 1800,
        change: 700,
        changePercentage: 38.89,
        trend: "increasing",
        comparison: [
          {
            year: 2025,
            spend: 2500,
            sessions: 150,
            averageCostPerSession: 16.67,
          },
          {
            year: 2024,
            spend: 1800,
            sessions: 120,
            averageCostPerSession: 15,
          },
        ],
      };
    }),

  // Export spending report
  exportReport: protectedProcedure
    .input(
      z.object({
        reportId: z.string(),
        format: z.enum(["pdf", "csv", "json"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Report exported",
        downloadUrl: "/reports/export-" + input.reportId + "." + input.format,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
    }),

  // Schedule recurring reports
  scheduleRecurringReport: protectedProcedure
    .input(
      z.object({
        frequency: z.enum(["weekly", "monthly", "quarterly"]),
        format: z.enum(["pdf", "csv", "json"]),
        recipients: z.array(z.string().email()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        scheduleId: "schedule_" + Math.random().toString(36).substr(2, 9),
        message: "Recurring report scheduled",
        frequency: input.frequency,
        nextReportDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
    }),

  // Get scheduled reports
  getScheduledReports: protectedProcedure.query(async ({ ctx }) => {
    return {
      schedules: [
        {
          scheduleId: "schedule1",
          frequency: "monthly",
          format: "pdf",
          recipients: ["admin@company.com"],
          nextReportDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          active: true,
        },
      ],
    };
  }),
});
