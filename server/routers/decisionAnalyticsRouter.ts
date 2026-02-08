/**
 * Decision Quality Analytics Router
 * Provides comprehensive analytics on autonomous decision quality and performance
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';

// In-memory analytics storage (will be replaced with database)
const decisionMetricsStore: any[] = [];
const policyPerformanceStore: any[] = [];
const autonomyMetricsStore: any[] = [];

export const decisionAnalyticsRouter = router({
  /**
   * Record decision quality metrics
   */
  recordMetrics: protectedProcedure
    .input(
      z.object({
        decisionId: z.string(),
        policyId: z.string(),
        subsystem: z.string(),
        confidenceScore: z.number().min(0).max(100),
        accuracyScore: z.number().min(0).max(100).optional(),
        executionTime: z.number().optional(),
        resourcesUsed: z.record(z.any()).optional(),
        humanApprovalRequired: z.boolean().optional(),
        humanApprovalGiven: z.boolean().optional(),
        approvalTime: z.number().optional(),
        outcomeStatus: z.enum(['successful', 'failed', 'partial', 'unknown']).optional(),
        outcomeNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const metric = {
        id: `metric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        decisionId: input.decisionId,
        policyId: input.policyId,
        subsystem: input.subsystem,
        confidenceScore: input.confidenceScore,
        accuracyScore: input.accuracyScore,
        executionTime: input.executionTime,
        resourcesUsed: input.resourcesUsed,
        humanApprovalRequired: input.humanApprovalRequired ? 1 : 0,
        humanApprovalGiven: input.humanApprovalGiven ? 1 : 0,
        approvalTime: input.approvalTime,
        outcomeStatus: input.outcomeStatus || 'unknown',
        outcomeNotes: input.outcomeNotes,
        timestamp: new Date(),
      };

      decisionMetricsStore.push(metric);

      // Update policy performance
      updatePolicyPerformance(input.policyId, input.subsystem, metric);

      return {
        success: true,
        metric,
      };
    }),

  /**
   * Get decision quality metrics
   */
  getDecisionMetrics: publicProcedure
    .input(
      z.object({
        decisionId: z.string().optional(),
        policyId: z.string().optional(),
        subsystem: z.string().optional(),
        limit: z.number().default(100).optional(),
      })
    )
    .query(({ input }) => {
      let filtered = [...decisionMetricsStore];

      if (input.decisionId) {
        filtered = filtered.filter((m) => m.decisionId === input.decisionId);
      }

      if (input.policyId) {
        filtered = filtered.filter((m) => m.policyId === input.policyId);
      }

      if (input.subsystem) {
        filtered = filtered.filter((m) => m.subsystem === input.subsystem);
      }

      const sorted = filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const paginated = sorted.slice(0, input.limit || 100);

      return {
        metrics: paginated,
        total: sorted.length,
        limit: input.limit || 100,
      };
    }),

  /**
   * Get policy performance metrics
   */
  getPolicyPerformance: publicProcedure
    .input(
      z.object({
        policyId: z.string().optional(),
        subsystem: z.string().optional(),
      })
    )
    .query(({ input }) => {
      let filtered = [...policyPerformanceStore];

      if (input.policyId) {
        filtered = filtered.filter((p) => p.policyId === input.policyId);
      }

      if (input.subsystem) {
        filtered = filtered.filter((p) => p.subsystem === input.subsystem);
      }

      return {
        policies: filtered,
        total: filtered.length,
      };
    }),

  /**
   * Get autonomy metrics over time
   */
  getAutonomyMetrics: publicProcedure
    .input(
      z.object({
        subsystem: z.string().optional(),
        limit: z.number().default(100).optional(),
      })
    )
    .query(({ input }) => {
      let filtered = [...autonomyMetricsStore];

      if (input.subsystem) {
        filtered = filtered.filter((m) => m.subsystem === input.subsystem);
      }

      const sorted = filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const paginated = sorted.slice(0, input.limit || 100);

      return {
        metrics: paginated,
        total: sorted.length,
        limit: input.limit || 100,
      };
    }),

  /**
   * Get decision accuracy trends
   */
  getAccuracyTrends: publicProcedure
    .input(
      z.object({
        subsystem: z.string().optional(),
        timeWindow: z.enum(['1h', '24h', '7d', '30d']).default('24h').optional(),
      })
    )
    .query(({ input }) => {
      let filtered = [...decisionMetricsStore];

      if (input.subsystem) {
        filtered = filtered.filter((m) => m.subsystem === input.subsystem);
      }

      // Filter by time window
      const now = new Date();
      const timeMs =
        input.timeWindow === '1h'
          ? 60 * 60 * 1000
          : input.timeWindow === '24h'
            ? 24 * 60 * 60 * 1000
            : input.timeWindow === '7d'
              ? 7 * 24 * 60 * 60 * 1000
              : 30 * 24 * 60 * 60 * 1000;

      filtered = filtered.filter((m) => new Date(m.timestamp).getTime() > now.getTime() - timeMs);

      const avgAccuracy = filtered.length > 0 ? filtered.reduce((sum, m) => sum + (m.accuracyScore || 0), 0) / filtered.length : 0;
      const avgConfidence = filtered.length > 0 ? filtered.reduce((sum, m) => sum + m.confidenceScore, 0) / filtered.length : 0;

      return {
        timeWindow: input.timeWindow,
        totalDecisions: filtered.length,
        averageAccuracy: Math.round(avgAccuracy * 100) / 100,
        averageConfidence: Math.round(avgConfidence * 100) / 100,
        successfulDecisions: filtered.filter((m) => m.outcomeStatus === 'successful').length,
        failedDecisions: filtered.filter((m) => m.outcomeStatus === 'failed').length,
        partialDecisions: filtered.filter((m) => m.outcomeStatus === 'partial').length,
      };
    }),

  /**
   * Get confidence distribution
   */
  getConfidenceDistribution: publicProcedure
    .input(z.object({ subsystem: z.string().optional() }))
    .query(({ input }) => {
      let filtered = [...decisionMetricsStore];

      if (input.subsystem) {
        filtered = filtered.filter((m) => m.subsystem === input.subsystem);
      }

      const distribution = {
        veryLow: filtered.filter((m) => m.confidenceScore < 20).length,
        low: filtered.filter((m) => m.confidenceScore >= 20 && m.confidenceScore < 40).length,
        medium: filtered.filter((m) => m.confidenceScore >= 40 && m.confidenceScore < 60).length,
        high: filtered.filter((m) => m.confidenceScore >= 60 && m.confidenceScore < 80).length,
        veryHigh: filtered.filter((m) => m.confidenceScore >= 80).length,
      };

      return {
        distribution,
        total: filtered.length,
      };
    }),

  /**
   * Get human approval rate
   */
  getHumanApprovalRate: publicProcedure
    .input(
      z.object({
        policyId: z.string().optional(),
        subsystem: z.string().optional(),
      })
    )
    .query(({ input }) => {
      let filtered = [...decisionMetricsStore];

      if (input.policyId) {
        filtered = filtered.filter((m) => m.policyId === input.policyId);
      }

      if (input.subsystem) {
        filtered = filtered.filter((m) => m.subsystem === input.subsystem);
      }

      const requiresApproval = filtered.filter((m) => m.humanApprovalRequired === 1).length;
      const approved = filtered.filter((m) => m.humanApprovalGiven === 1).length;
      const approvalRate = requiresApproval > 0 ? (approved / requiresApproval) * 100 : 0;

      return {
        totalDecisions: filtered.length,
        requiresApproval,
        approved,
        approvalRate: Math.round(approvalRate * 100) / 100,
        averageApprovalTime: filtered.length > 0 ? filtered.reduce((sum, m) => sum + (m.approvalTime || 0), 0) / filtered.length : 0,
      };
    }),

  /**
   * Get execution time statistics
   */
  getExecutionTimeStats: publicProcedure
    .input(z.object({ subsystem: z.string().optional() }))
    .query(({ input }) => {
      let filtered = decisionMetricsStore.filter((m) => m.executionTime !== undefined && m.executionTime !== null);

      if (input.subsystem) {
        filtered = filtered.filter((m) => m.subsystem === input.subsystem);
      }

      if (filtered.length === 0) {
        return {
          totalDecisions: 0,
          averageTime: 0,
          minTime: 0,
          maxTime: 0,
          medianTime: 0,
        };
      }

      const times = filtered.map((m) => m.executionTime).sort((a, b) => a - b);
      const avg = times.reduce((sum, t) => sum + t, 0) / times.length;
      const median = times[Math.floor(times.length / 2)];

      return {
        totalDecisions: filtered.length,
        averageTime: Math.round(avg * 100) / 100,
        minTime: Math.min(...times),
        maxTime: Math.max(...times),
        medianTime: median,
      };
    }),

  /**
   * Get decision outcome summary
   */
  getOutcomeSummary: publicProcedure
    .input(z.object({ subsystem: z.string().optional() }))
    .query(({ input }) => {
      let filtered = [...decisionMetricsStore];

      if (input.subsystem) {
        filtered = filtered.filter((m) => m.subsystem === input.subsystem);
      }

      const outcomes = {
        successful: filtered.filter((m) => m.outcomeStatus === 'successful').length,
        failed: filtered.filter((m) => m.outcomeStatus === 'failed').length,
        partial: filtered.filter((m) => m.outcomeStatus === 'partial').length,
        unknown: filtered.filter((m) => m.outcomeStatus === 'unknown').length,
      };

      const successRate = filtered.length > 0 ? (outcomes.successful / filtered.length) * 100 : 0;

      return {
        totalDecisions: filtered.length,
        outcomes,
        successRate: Math.round(successRate * 100) / 100,
      };
    }),

  /**
   * Get comprehensive analytics dashboard
   */
  getDashboard: publicProcedure
    .input(z.object({ subsystem: z.string().optional() }))
    .query(({ input }) => {
      let filtered = [...decisionMetricsStore];

      if (input.subsystem) {
        filtered = filtered.filter((m) => m.subsystem === input.subsystem);
      }

      const avgConfidence = filtered.length > 0 ? filtered.reduce((sum, m) => sum + m.confidenceScore, 0) / filtered.length : 0;
      const avgAccuracy = filtered.length > 0 ? filtered.reduce((sum, m) => sum + (m.accuracyScore || 0), 0) / filtered.length : 0;
      const successRate = filtered.length > 0 ? (filtered.filter((m) => m.outcomeStatus === 'successful').length / filtered.length) * 100 : 0;
      const approvalRate = filtered.length > 0 ? (filtered.filter((m) => m.humanApprovalRequired === 1).length / filtered.length) * 100 : 0;

      return {
        totalDecisions: filtered.length,
        averageConfidence: Math.round(avgConfidence * 100) / 100,
        averageAccuracy: Math.round(avgAccuracy * 100) / 100,
        successRate: Math.round(successRate * 100) / 100,
        humanApprovalRate: Math.round(approvalRate * 100) / 100,
        autonomyLevel: Math.round((100 - approvalRate) * 100) / 100,
        successfulDecisions: filtered.filter((m) => m.outcomeStatus === 'successful').length,
        failedDecisions: filtered.filter((m) => m.outcomeStatus === 'failed').length,
      };
    }),
});

// Helper function to update policy performance
function updatePolicyPerformance(policyId: string, subsystem: string, metric: any) {
  let policy = policyPerformanceStore.find((p) => p.policyId === policyId);

  if (!policy) {
    policy = {
      id: `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      policyId,
      subsystem,
      totalDecisions: 0,
      successfulDecisions: 0,
      failedDecisions: 0,
      averageConfidence: 0,
      averageAccuracy: 0,
      humanApprovalRate: 0,
      averageExecutionTime: 0,
      lastUpdated: new Date(),
      createdAt: new Date(),
    };
    policyPerformanceStore.push(policy);
  }

  policy.totalDecisions += 1;

  if (metric.outcomeStatus === 'successful') {
    policy.successfulDecisions += 1;
  } else if (metric.outcomeStatus === 'failed') {
    policy.failedDecisions += 1;
  }

  policy.averageConfidence = (policy.averageConfidence * (policy.totalDecisions - 1) + metric.confidenceScore) / policy.totalDecisions;
  policy.averageAccuracy = (policy.averageAccuracy * (policy.totalDecisions - 1) + (metric.accuracyScore || 0)) / policy.totalDecisions;
  policy.humanApprovalRate = (policy.successfulDecisions / policy.totalDecisions) * 100;
  policy.lastUpdated = new Date();
}
