/**
 * Content Generation Policy tRPC Router
 * 
 * Exposes QUMUS content generation policy to frontend
 */

import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { contentGenerationPolicy } from "../qumus/contentGenerationPolicy";

export const contentGenerationPolicyRouter = router({
  /**
   * Evaluate and make content generation decision
   */
  evaluateDecision: protectedProcedure
    .input(
      z.object({
        currentListenerCount: z.number(),
        timeOfDay: z.number().min(0).max(23),
        dayOfWeek: z.number().min(0).max(6),
        recentEngagementRate: z.number().min(0).max(100),
        contentTypePreference: z.string(),
        availableTopics: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const decision = await contentGenerationPolicy.evaluateAndDecide(input);
      return decision;
    }),

  /**
   * Execute content generation decision
   */
  executeDecision: protectedProcedure
    .input(
      z.object({
        policyId: z.string(),
        contentType: z.enum(["podcast", "audiobook", "radio"]),
        topic: z.string(),
        theme: z.string().optional(),
        targetAudience: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "critical"]),
        scheduledTime: z.date(),
        expectedDuration: z.number(),
        estimatedListeners: z.number(),
        confidence: z.number(),
        reasoning: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await contentGenerationPolicy.executeDecision(input);
      return { success, decision: input };
    }),

  /**
   * Get policy metrics
   */
  getMetrics: publicProcedure.query(() => {
    return contentGenerationPolicy.getMetrics();
  }),

  /**
   * Get recent decisions
   */
  getDecisions: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
      })
    )
    .query(({ input }) => {
      return contentGenerationPolicy.getDecisions(input.limit);
    }),

  /**
   * Reset policy metrics
   */
  resetMetrics: protectedProcedure.mutation(() => {
    contentGenerationPolicy.resetMetrics();
    return { success: true };
  }),
});
