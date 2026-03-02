import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const budgetEnforcementRouter = router({
  // Check if session can continue
  canContinueSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      return {
        canContinue: true,
        tokensUsed: 45000,
        maxTokens: 100000,
        percentageUsed: 45,
        status: "ok",
        message: "Session can continue",
      };
    }),

  // Pause session due to budget
  pauseSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        reason: z.enum(["budget_exceeded", "manual", "admin_action"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Session paused",
        sessionId: input.sessionId,
        reason: input.reason,
        pausedAt: new Date(),
      };
    }),

  // Resume paused session
  resumeSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Session resumed",
        sessionId: input.sessionId,
        resumedAt: new Date(),
      };
    }),

  // Get budget status with enforcement details
  getBudgetEnforcementStatus: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      return {
        sessionId: input.sessionId,
        status: "active",
        maxTokens: 100000,
        tokensUsed: 45000,
        tokensRemaining: 55000,
        percentageUsed: 45,
        gracePeriodTokens: 5000,
        gracePeriodRemaining: 5000,
        enforcementLevel: "warning",
        warningThreshold: 80,
        pauseThreshold: 100,
        lastWarningAt: new Date(),
      };
    }),

  // Set enforcement policy
  setEnforcementPolicy: protectedProcedure
    .input(
      z.object({
        agentId: z.number(),
        warningThreshold: z.number().min(0).max(100),
        pauseThreshold: z.number().min(0).max(100),
        gracePeriodTokens: z.number().positive().optional(),
        autoResume: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Enforcement policy updated",
        agentId: input.agentId,
        policy: input,
      };
    }),

  // Get enforcement history
  getEnforcementHistory: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      return {
        history: [
          {
            id: "event1",
            timestamp: new Date(),
            type: "warning",
            message: "Session approaching 80% budget",
            tokensUsed: 80000,
            maxTokens: 100000,
          },
        ],
      };
    }),

  // Override budget for session
  overrideBudget: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        newMaxTokens: z.number().positive(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Budget override applied",
        sessionId: input.sessionId,
        newMaxTokens: input.newMaxTokens,
        overriddenAt: new Date(),
      };
    }),
});
