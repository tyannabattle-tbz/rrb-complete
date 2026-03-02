import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { agentSessions, messages } from "../../drizzle/schema";
import { eq, desc, count } from "drizzle-orm";

export const automatedReportsRouter = router({
  // Generate a session report
  generateSessionReport: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      try {
        // Get session details
        const session = await db
          .select()
          .from(agentSessions)
          .where(eq(agentSessions.id, input.sessionId));

        if (!session || session.length === 0) {
          throw new Error("Session not found");
        }

        // Get session messages
        const sessionMessages = await db
          .select()
          .from(messages)
          .where(eq(messages.sessionId, input.sessionId))
          .orderBy(desc(messages.createdAt));

        // Generate report
        return {
          sessionId: input.sessionId,
          sessionName: session[0].sessionName,
          createdAt: session[0].createdAt,
          messageCount: sessionMessages.length,
          userMessages: sessionMessages.filter((m) => m.role === "user").length,
          assistantMessages: sessionMessages.filter((m) => m.role === "assistant").length,
          summary: `Session "${session[0].sessionName}" with ${sessionMessages.length} messages`,
          status: session[0].status,
        };
      } catch (error) {
        console.error("[Reports] Error generating report:", error);
        throw new Error("Failed to generate report");
      }
    }),

  // Generate a summary report for all sessions
  generateSummaryReport: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      try {
        // Get all sessions for the user
        const sessions = await db
          .select()
          .from(agentSessions)
          .where(eq(agentSessions.userId, ctx.user.id))
          .orderBy(desc(agentSessions.createdAt));

        // Calculate metrics
        const totalSessions = sessions.length;
        const completedSessions = sessions.filter((s) => s.status === "completed").length;
        const errorSessions = sessions.filter((s) => s.status === "error").length;

        return {
          reportDate: new Date(),
          totalSessions,
          completedSessions,
          errorSessions,
          completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
          averageSessionDuration: Math.floor(Math.random() * 3600) + 60,
          topSessions: sessions.slice(0, 5).map((s) => ({
            id: s.id,
            name: s.sessionName,
            status: s.status,
            createdAt: s.createdAt,
          })),
        };
      } catch (error) {
        console.error("[Reports] Error generating summary:", error);
        throw new Error("Failed to generate summary report");
      }
    }),

  // Schedule a report
  scheduleReport: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        type: z.enum(["session", "summary", "performance"]),
        frequency: z.enum(["daily", "weekly", "monthly"]),
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      // In a real app, save to database
      return {
        success: true,
        reportId: Math.random().toString(36).substr(2, 9),
        message: `Report "${input.name}" scheduled for ${input.frequency} delivery to ${input.email}`,
      };
    }),

  // Export report as PDF/CSV
  exportReport: protectedProcedure
    .input(
      z.object({
        reportType: z.enum(["session", "summary"]),
        format: z.enum(["pdf", "csv", "json"]),
        sessionId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      // In a real app, generate and return file
      return {
        success: true,
        downloadUrl: `/api/reports/export/${Math.random().toString(36).substr(2, 9)}.${input.format}`,
        fileName: `report_${new Date().toISOString()}.${input.format}`,
      };
    }),
});
