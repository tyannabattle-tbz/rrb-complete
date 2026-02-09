/**
 * QUMUS Complete tRPC Router
 * Procedures for autonomous decision-making, policy management, and monitoring
 */

import { router, protectedProcedure, publicProcedure, adminProcedure } from '../../_core/trpc';
import { z } from 'zod';
import QumusCompleteEngine, { CORE_POLICIES } from '../../qumus-complete-engine';

export const qumusCompleteRouter = router({
  /**
   * Get all 8 core policies with autonomy levels
   */
  getPolicies: publicProcedure.query(async () => {
    const policies = Object.values(CORE_POLICIES).map((policy) => ({
      id: policy.id,
      name: policy.name,
      type: policy.type,
      autonomyLevel: policy.autonomyLevel,
      description: policy.description,
    }));
    return policies;
  }),

  /**
   * Get specific policy details
   */
  getPolicy: publicProcedure
    .input(z.object({ policyId: z.string() }))
    .query(async ({ input }) => {
      const policy = CORE_POLICIES[input.policyId as keyof typeof CORE_POLICIES];
      if (!policy) {
        throw new Error(`Policy not found: ${input.policyId}`);
      }
      return policy;
    }),

  /**
   * Make autonomous decision with confidence-based routing
   */
  makeDecision: protectedProcedure
    .input(
      z.object({
        policyId: z.string(),
        input: z.record(z.any()),
        confidence: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await QumusCompleteEngine.makeDecision({
        policyId: input.policyId,
        userId: ctx.user.id,
        input: input.input,
        confidence: input.confidence,
      });
      return result;
    }),

  /**
   * Get pending human reviews (admin only)
   */
  getPendingReviews: adminProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      })
    )
    .query(async ({ input }) => {
      const reviews = await QumusCompleteEngine.getPendingReviews(input.limit);
      if (input.priority) {
        return reviews.filter((r) => r.priority === input.priority);
      }
      return reviews;
    }),

  /**
   * Review escalated decision (admin only)
   */
  reviewDecision: adminProcedure
    .input(
      z.object({
        decisionId: z.string(),
        decision: z.enum(['approved', 'rejected', 'modified']),
        reviewNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await QumusCompleteEngine.reviewDecision(
        input.decisionId,
        input.decision,
        input.reviewNotes || ''
      );
      return {
        success: true,
        message: `Decision ${input.decision} by ${ctx.user.name}`,
      };
    }),

  /**
   * Get policy performance metrics
   */
  getPolicyMetrics: publicProcedure
    .input(z.object({ policyId: z.string() }))
    .query(async ({ input }) => {
      return await QumusCompleteEngine.getPolicyMetrics(input.policyId);
    }),

  /**
   * Get all policy metrics
   */
  getAllMetrics: publicProcedure.query(async () => {
    return await QumusCompleteEngine.getAllMetrics();
  }),

  /**
   * Get system health and autonomy statistics
   */
  getSystemHealth: publicProcedure.query(async () => {
    return await QumusCompleteEngine.getSystemHealth();
  }),

  /**
   * Get audit trail for compliance (admin only)
   */
  getAuditTrail: adminProcedure
    .input(
      z.object({
        policyId: z.string().optional(),
        limit: z.number().default(100),
      })
    )
    .query(async ({ input }) => {
      return await QumusCompleteEngine.getAuditTrail(input.policyId, input.limit);
    }),

  /**
   * Get policy optimization recommendations
   */
  getPolicyRecommendations: adminProcedure.query(async () => {
    return await QumusCompleteEngine.getPolicyRecommendations();
  }),

  /**
   * Get decision history for user
   */
  getDecisionHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        policyId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // In production, query from database filtered by userId
      return {
        userId: ctx.user.id,
        decisions: [],
        total: 0,
      };
    }),

  /**
   * Get autonomy trend over time
   */
  getAutonomyTrend: publicProcedure
    .input(
      z.object({
        period: z.enum(['hourly', 'daily', 'weekly', 'monthly']).default('daily'),
        days: z.number().default(30),
      })
    )
    .query(async ({ input }) => {
      // In production, aggregate metrics from database
      return {
        period: input.period,
        data: [],
      };
    }),

  /**
   * Get decision distribution by policy
   */
  getDecisionDistribution: publicProcedure.query(async () => {
    const metrics = await QumusCompleteEngine.getAllMetrics();
    return metrics.map((m) => ({
      policyName: m.name,
      policyType: m.policyType,
      totalDecisions: m.totalDecisions,
      autonomousPercentage: m.autonomyPercentage,
    }));
  }),

  /**
   * Get escalation reasons breakdown
   */
  getEscalationReasons: publicProcedure.query(async () => {
    // In production, query from database
    return {
      low_confidence: 0,
      policy_threshold: 0,
      anomaly: 0,
      sensitive_data: 0,
      high_risk: 0,
    };
  }),

  /**
   * Get policy performance comparison
   */
  getPolicyComparison: publicProcedure.query(async () => {
    const metrics = await QumusCompleteEngine.getAllMetrics();
    return metrics.map((m) => ({
      policyName: m.name,
      autonomyLevel: m.autonomyLevel,
      successRate: m.successRate,
      avgExecutionTime: m.avgExecutionTime,
      escalationRate: m.escalationRate,
    }));
  }),

  /**
   * Get human review statistics
   */
  getReviewStatistics: adminProcedure.query(async () => {
    // In production, query from database
    return {
      pendingReviews: 0,
      approvedCount: 0,
      rejectedCount: 0,
      modifiedCount: 0,
      avgReviewTime: 0,
      approvalRate: 0,
    };
  }),

  /**
   * Get system performance summary
   */
  getPerformanceSummary: publicProcedure.query(async () => {
    const health = await QumusCompleteEngine.getSystemHealth();
    const metrics = await QumusCompleteEngine.getAllMetrics();

    const totalSuccessful = metrics.reduce((sum, m) => sum + m.approvedCount, 0);
    const totalFailed = metrics.reduce((sum, m) => sum + m.rejectedCount, 0);
    const avgConfidence = metrics.length > 0
      ? metrics.reduce((sum, m) => sum + m.averageConfidence, 0) / metrics.length
      : 0;

    return {
      status: health.status,
      totalDecisions: health.totalDecisions,
      autonomyPercentage: health.autonomyPercentage,
      successfulDecisions: totalSuccessful,
      failedDecisions: totalFailed,
      averageConfidence: Math.round(avgConfidence * 100) / 100,
      policyCount: health.policyCount,
      timestamp: health.timestamp,
    };
  }),

  /**
   * Get real-time dashboard data
   */
  getDashboardData: publicProcedure.query(async () => {
    const health = await QumusCompleteEngine.getSystemHealth();
    const metrics = await QumusCompleteEngine.getAllMetrics();
    const recommendations = await QumusCompleteEngine.getPolicyRecommendations();

    return {
      systemHealth: health,
      policyMetrics: metrics,
      recommendations,
      timestamp: new Date(),
    };
  }),
});

export default qumusCompleteRouter;
