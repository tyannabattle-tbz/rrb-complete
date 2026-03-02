/**
 * QUMUS Orchestration tRPC Router
 * Exposes autonomous decision-making capabilities to the frontend
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  qumusEngine,
  generateRecommendations,
  distributePodcastContent,
  checkStudioPerformance,
  processBatchVideoJob,
} from "../qumus-orchestration";

export const qumusRouter = router({
  /**
   * Get all available policies
   */
  getPolicies: publicProcedure.query(() => {
    return qumusEngine.getPolicies();
  }),

  /**
   * Get a specific policy details
   */
  getPolicy: publicProcedure
    .input(z.object({ policyId: z.string() }))
    .query(({ input }) => {
      return qumusEngine.getPolicy(input.policyId);
    }),

  /**
   * Generate personalized recommendations
   */
  generateRecommendations: protectedProcedure
    .input(
      z.object({
        preferences: z.array(z.string()),
        watchHistory: z.array(z.string()),
        engagementLevel: z.number().min(0).max(10),
      })
    )
    .query(async ({ input, ctx }) => {
      return await generateRecommendations(ctx.user.id, {
        preferences: input.preferences,
        watchHistory: input.watchHistory,
        engagementLevel: input.engagementLevel,
      });
    }),

  /**
   * Distribute podcast episode to channels
   */
  distributePodcastContent: protectedProcedure
    .input(
      z.object({
        episodeId: z.string(),
        channels: z.array(z.string()),
        title: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await distributePodcastContent(ctx.user.id, {
        episodeId: input.episodeId,
        channels: input.channels,
        title: input.title,
      });
    }),

  /**
   * Check Studio performance and alert
   */
  checkStudioPerformance: protectedProcedure
    .input(
      z.object({
        responseTime: z.number(),
        errorRate: z.number(),
        cpuUsage: z.number(),
        memoryUsage: z.number(),
        viewerCount: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await checkStudioPerformance(ctx.user.id, {
        responseTime: input.responseTime,
        errorRate: input.errorRate,
        cpuUsage: input.cpuUsage,
        memoryUsage: input.memoryUsage,
        viewerCount: input.viewerCount,
      });
    }),

  /**
   * Process batch video job
   */
  processBatchVideoJob: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        videoCount: z.number(),
        watermarkId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await processBatchVideoJob(ctx.user.id, {
        jobId: input.jobId,
        videoCount: input.videoCount,
        watermarkId: input.watermarkId,
      });
    }),

  /**
   * Get decision history
   */
  getDecisionHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(({ input }) => {
      return qumusEngine.getDecisionHistory(input.limit);
    }),

  /**
   * Get metrics for a policy
   */
  getMetrics: publicProcedure
    .input(z.object({ policyId: z.string() }))
    .query(({ input }) => {
      return qumusEngine.getMetrics(input.policyId);
    }),

  /**
   * Get all metrics
   */
  getAllMetrics: publicProcedure.query(() => {
    return qumusEngine.getAllMetrics();
  }),

  /**
   * Get system statistics
   */
  getStatistics: publicProcedure.query(() => {
    return qumusEngine.getStatistics();
  }),

  /**
   * Approve a human review decision
   */
  approveDecision: protectedProcedure
    .input(z.object({ decisionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // In production, verify user is admin
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can approve decisions");
      }
      return await qumusEngine.approveDecision(input.decisionId);
    }),

  /**
   * Reject a human review decision
   */
  rejectDecision: protectedProcedure
    .input(
      z.object({
        decisionId: z.string(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // In production, verify user is admin
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can reject decisions");
      }
      return await qumusEngine.rejectDecision(input.decisionId, input.reason);
    }),
});
