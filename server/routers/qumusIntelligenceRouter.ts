/**
 * QUMUS Advanced Intelligence Router
 * Exposes cross-policy correlation, anomaly detection, self-assessment,
 * learning feedback, adaptive scheduling, and policy chaining via tRPC
 */
import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import {
  getCorrelationAlerts,
  resolveCorrelationAlert,
  getAnomalyReports,
  getLearningEntries,
  getAdaptiveScheduleState,
  getPolicyChains,
  getDecisionHistoryStats,
  performSelfAssessment,
  recordDecisionOutcome,
} from '../services/qumus-advanced-intelligence';

export const qumusIntelligenceRouter = router({
  /**
   * Get cross-policy correlation alerts
   */
  getCorrelationAlerts: publicProcedure
    .input(z.object({
      includeResolved: z.boolean().optional().default(false),
    }).optional())
    .query(({ input }) => {
      return {
        alerts: getCorrelationAlerts(input?.includeResolved ?? false),
        timestamp: new Date(),
      };
    }),

  /**
   * Resolve a correlation alert
   */
  resolveAlert: protectedProcedure
    .input(z.object({ alertId: z.string() }))
    .mutation(({ input }) => {
      const resolved = resolveCorrelationAlert(input.alertId);
      return { success: resolved };
    }),

  /**
   * Get anomaly detection reports
   */
  getAnomalyReports: publicProcedure
    .input(z.object({ limit: z.number().optional().default(20) }).optional())
    .query(({ input }) => {
      return {
        anomalies: getAnomalyReports(input?.limit ?? 20),
        timestamp: new Date(),
      };
    }),

  /**
   * Get learning feedback entries
   */
  getLearningEntries: publicProcedure
    .input(z.object({ limit: z.number().optional().default(20) }).optional())
    .query(({ input }) => {
      return {
        entries: getLearningEntries(input?.limit ?? 20),
        timestamp: new Date(),
      };
    }),

  /**
   * Record a decision outcome for learning
   */
  recordOutcome: protectedProcedure
    .input(z.object({
      decisionId: z.string(),
      policyId: z.string(),
      originalConfidence: z.number(),
      outcome: z.enum(['correct', 'incorrect', 'partial']),
      feedback: z.string().optional().default(''),
    }))
    .mutation(({ input }) => {
      recordDecisionOutcome(
        input.decisionId,
        input.policyId,
        input.originalConfidence,
        input.outcome,
        input.feedback
      );
      return { success: true };
    }),

  /**
   * Get adaptive schedule state
   */
  getAdaptiveSchedule: publicProcedure.query(() => {
    return {
      schedule: getAdaptiveScheduleState(),
      timestamp: new Date(),
    };
  }),

  /**
   * Get policy chains configuration
   */
  getPolicyChains: publicProcedure.query(() => {
    return {
      chains: getPolicyChains(),
      timestamp: new Date(),
    };
  }),

  /**
   * Get decision history statistics
   */
  getDecisionStats: publicProcedure.query(() => {
    return {
      stats: getDecisionHistoryStats(),
      timestamp: new Date(),
    };
  }),

  /**
   * Perform full QUMUS self-assessment
   */
  selfAssessment: publicProcedure.query(async () => {
    const assessment = await performSelfAssessment();
    return {
      assessment,
      timestamp: new Date(),
    };
  }),

  /**
   * Get complete intelligence dashboard data in one call
   */
  getDashboard: publicProcedure.query(async () => {
    const [assessment, correlationAlerts, anomalies, learning, schedule, chains, stats] = await Promise.all([
      performSelfAssessment(),
      Promise.resolve(getCorrelationAlerts(false)),
      Promise.resolve(getAnomalyReports(10)),
      Promise.resolve(getLearningEntries(10)),
      Promise.resolve(getAdaptiveScheduleState()),
      Promise.resolve(getPolicyChains()),
      Promise.resolve(getDecisionHistoryStats()),
    ]);

    return {
      assessment,
      correlationAlerts,
      anomalies,
      learning,
      schedule,
      chains,
      stats,
      engineVersion: '11.0',
      timestamp: new Date(),
    };
  }),
});
