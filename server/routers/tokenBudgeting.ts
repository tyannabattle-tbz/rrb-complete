import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const tokenBudgetingRouter = router({
  // Set session token budget
  setSessionBudget: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        maxTokens: z.number().positive(),
        alertThreshold: z.number().min(0).max(100).default(80),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Session budget set",
        sessionId: input.sessionId,
        maxTokens: input.maxTokens,
        alertThreshold: input.alertThreshold,
      };
    }),

  // Get session budget
  getSessionBudget: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      return {
        sessionId: input.sessionId,
        maxTokens: 100000,
        usedTokens: 45000,
        remainingTokens: 55000,
        percentageUsed: 45,
        alertThreshold: 80,
        status: "on_track",
      };
    }),

  // Set agent-wide budget
  setAgentBudget: protectedProcedure
    .input(
      z.object({
        agentId: z.number(),
        monthlyBudget: z.number().positive(),
        dailyLimit: z.number().positive().optional(),
        alertEmails: z.array(z.string().email()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Agent budget configured",
        agentId: input.agentId,
        monthlyBudget: input.monthlyBudget,
        dailyLimit: input.dailyLimit,
      };
    }),

  // Get agent budget status
  getAgentBudgetStatus: protectedProcedure
    .input(z.object({ agentId: z.number() }))
    .query(async ({ ctx, input }) => {
      return {
        agentId: input.agentId,
        monthlyBudget: 10000,
        monthlySpent: 4500,
        monthlyRemaining: 5500,
        dailyLimit: 500,
        dailySpent: 150,
        percentageUsed: 45,
        daysRemaining: 15,
        projectedMonthlySpend: 9000,
        status: "on_track",
      };
    }),

  // Get budget alerts
  getBudgetAlerts: protectedProcedure.query(async ({ ctx }) => {
    return {
      alerts: [
        {
          id: "alert1",
          type: "threshold_reached",
          level: "warning",
          message: "Session approaching 80% token budget",
          sessionId: 1,
          timestamp: new Date(),
          dismissed: false,
        },
      ],
    };
  }),

  // Dismiss budget alert
  dismissAlert: protectedProcedure
    .input(z.object({ alertId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return { success: true, message: "Alert dismissed" };
    }),

  // Adjust budget mid-session
  adjustBudget: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        newMaxTokens: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Budget adjusted",
        sessionId: input.sessionId,
        newMaxTokens: input.newMaxTokens,
      };
    }),
});
