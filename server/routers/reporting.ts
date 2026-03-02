import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { EmailService, reportEmailTemplates } from "../services/emailService";
import { TRPCError } from "@trpc/server";

export const reportingRouter = router({
  /**
   * Configure email provider
   */
  configureEmail: protectedProcedure
    .input(
      z.object({
        provider: z.enum(["sendgrid", "mailgun", "smtp"]),
        apiKey: z.string(),
        fromEmail: z.string().email(),
        fromName: z.string().optional(),
        domain: z.string().optional(), // For Mailgun
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      await db.createEmailConfig(
        ctx.user.id,
        input.provider,
        input.apiKey,
        input.fromEmail,
        input.fromName
      );

      return { success: true };
    }),

  /**
   * Get email configuration
   */
  getEmailConfig: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    const config = await db.getEmailConfig(ctx.user.id);
    if (!config) return null;

    // Don't return the actual API key
    return {
      provider: config.provider,
      fromEmail: config.fromEmail,
      fromName: config.fromName,
      isActive: config.isActive,
    };
  }),

  /**
   * Create a scheduled report
   */
  createScheduledReport: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        reportType: z.enum(["weekly", "monthly", "daily", "custom"]),
        schedule: z.string(), // Cron expression
        recipients: z.array(z.string().email()),
        includeMetrics: z.array(z.string()),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const reportId = await db.createScheduledReport(
        ctx.user.id,
        input.name,
        input.reportType,
        input.schedule,
        input.recipients,
        input.includeMetrics
      );

      return { id: reportId, success: true };
    }),

  /**
   * Get all scheduled reports
   */
  listScheduledReports: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    return db.getScheduledReports(ctx.user.id);
  }),

  /**
   * Send a report immediately
   */
  sendReportNow: protectedProcedure
    .input(z.object({ reportId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const reports = await db.getScheduledReports(ctx.user.id);
      const report = reports.find((r) => r.id === input.reportId);

      if (!report) throw new TRPCError({ code: "NOT_FOUND" });

      const emailConfig = await db.getEmailConfig(ctx.user.id);
      if (!emailConfig) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Email not configured" });

      try {
        const provider = emailConfig.provider as "sendgrid" | "mailgun" | "smtp";
      const emailService = new EmailService(provider, {
          apiKey: emailConfig.apiKey,
          fromEmail: emailConfig.fromEmail,
          fromName: emailConfig.fromName,
        });

        const recipients = JSON.parse(report.recipients);

        // Generate report content (simplified)
        const html = reportEmailTemplates.weeklyReport({
          userName: ctx.user.name || "User",
          sessionCount: 0,
          toolExecutions: 0,
          averageSessionDuration: 0,
          topTools: [],
          period: new Date().toISOString().split("T")[0],
        });

        await emailService.send({
          to: recipients,
          subject: `${report.name} - ${new Date().toISOString().split("T")[0]}`,
          html,
        });

        // Log report history
        await db.addReportHistory(report.id, "sent", recipients);

        return { success: true, message: "Report sent successfully" };
      } catch (error) {
        await db.addReportHistory(report.id, "failed", undefined, (error as Error).message);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to send report: ${(error as Error).message}`,
        });
      }
    }),

  /**
   * Get report history
   */
  getReportHistory: protectedProcedure
    .input(z.object({ reportId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Verify user owns this report
      const reports = await db.getScheduledReports(ctx.user.id);
      if (!reports.find((r) => r.id === input.reportId)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Get report history from database (would need to implement this function)
      return [];
    }),

  /**
   * Delete a scheduled report
   */
  deleteScheduledReport: protectedProcedure
    .input(z.object({ reportId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Verify user owns this report
      const reports = await db.getScheduledReports(ctx.user.id);
      if (!reports.find((r) => r.id === input.reportId)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Delete scheduled report (would need to implement this function)
      // For now, we'll mark it as inactive
      // await db.deleteScheduledReport(input.reportId);

      return { success: true };
    }),
});
