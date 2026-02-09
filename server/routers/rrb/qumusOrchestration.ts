/**
 * QUMUS Orchestration Router
 * tRPC procedures for autonomous decision-making and policy management
 */

import { router, protectedProcedure, publicProcedure, adminProcedure } from '../../_core/trpc';
import { z } from 'zod';
import {
  QumusOrchestrationService,
  DEFAULT_POLICIES,
  type DecisionLog,
  type OrchestrationPolicy,
} from '../../services/qumusOrchestrationService';

// In-memory storage (replace with database in production)
let policies: OrchestrationPolicy[] = DEFAULT_POLICIES;
let decisionLogs: DecisionLog[] = [];

export const qumusOrchestrationRouter = router({
  /**
   * Get all active policies
   */
  getPolicies: publicProcedure.query(async () => {
    return policies.filter((p) => p.enabled);
  }),

  /**
   * Get policy by ID
   */
  getPolicy: publicProcedure
    .input(z.object({ policyId: z.string() }))
    .query(async ({ input }) => {
      return policies.find((p) => p.id === input.policyId);
    }),

  /**
   * Create a new policy (admin only)
   */
  createPolicy: adminProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        conditions: z.array(z.object({ type: z.string(), operator: z.string(), value: z.any() })),
        actions: z.array(
          z.object({ type: z.string(), parameters: z.record(z.any()), priority: z.string() })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const newPolicy: OrchestrationPolicy = {
        id: `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: input.name,
        description: input.description,
        enabled: true,
        priority: policies.length + 1,
        conditions: input.conditions as any,
        actions: input.actions as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      policies.push(newPolicy);
      return newPolicy;
    }),

  /**
   * Update a policy (admin only)
   */
  updatePolicy: adminProcedure
    .input(
      z.object({
        policyId: z.string(),
        enabled: z.boolean().optional(),
        priority: z.number().optional(),
        conditions: z.array(z.object({ type: z.string(), operator: z.string(), value: z.any() })).optional(),
        actions: z
          .array(z.object({ type: z.string(), parameters: z.record(z.any()), priority: z.string() }))
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const policyIndex = policies.findIndex((p) => p.id === input.policyId);
      if (policyIndex === -1) {
        throw new Error('Policy not found');
      }

      const updated = {
        ...policies[policyIndex],
        ...(input.enabled !== undefined && { enabled: input.enabled }),
        ...(input.priority !== undefined && { priority: input.priority }),
        ...(input.conditions && { conditions: input.conditions as any }),
        ...(input.actions && { actions: input.actions as any }),
        updatedAt: new Date(),
      };

      policies[policyIndex] = updated;
      return updated;
    }),

  /**
   * Delete a policy (admin only)
   */
  deletePolicy: adminProcedure
    .input(z.object({ policyId: z.string() }))
    .mutation(async ({ input }) => {
      policies = policies.filter((p) => p.id !== input.policyId);
      return { success: true };
    }),

  /**
   * Make an autonomous decision
   */
  makeDecision: protectedProcedure
    .input(
      z.object({
        policyId: z.string(),
        input: z.record(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const decision = await QumusOrchestrationService.makeDecision(input.policyId, input.input, policies);

      // Log the decision
      decisionLogs.push({
        ...decision,
        userId: ctx.user.id,
      });

      // Keep only last 1000 decisions
      if (decisionLogs.length > 1000) {
        decisionLogs = decisionLogs.slice(-1000);
      }

      return decision;
    }),

  /**
   * Get decision logs
   */
  getDecisionLogs: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const logs = decisionLogs.slice(input.offset, input.offset + input.limit);
      return {
        logs,
        total: decisionLogs.length,
        hasMore: input.offset + input.limit < decisionLogs.length,
      };
    }),

  /**
   * Get automation metrics
   */
  getMetrics: protectedProcedure.query(async () => {
    return QumusOrchestrationService.getMetrics(decisionLogs);
  }),

  /**
   * Recommend donation tier for user
   */
  recommendDonationTier: protectedProcedure
    .input(
      z.object({
        previousDonations: z.number(),
        engagementScore: z.number(),
        memberSince: z.date(),
      })
    )
    .query(async ({ input }) => {
      const recommendedTier = QumusOrchestrationService.recommendDonationTier(input);
      return { recommendedTier };
    }),

  /**
   * Prioritize alerts
   */
  prioritizeAlerts: protectedProcedure
    .input(
      z.object({
        alerts: z.array(
          z.object({
            severity: z.enum(['low', 'medium', 'high', 'critical']),
            affectedPopulation: z.number().optional(),
            type: z.string(),
          })
        ),
      })
    )
    .query(async ({ input }) => {
      return QumusOrchestrationService.prioritizeAlerts(input.alerts);
    }),

  /**
   * Get policy recommendations for a user
   */
  getPolicyRecommendations: protectedProcedure
    .input(
      z.object({
        userSegment: z.string(),
        donationAmount: z.number().optional(),
        alertSeverity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      })
    )
    .query(async ({ input }) => {
      const applicablePolicies = policies.filter((policy) => {
        return QumusOrchestrationService.evaluateConditions(policy.conditions, input);
      });

      return applicablePolicies.map((p) => ({
        policyId: p.id,
        name: p.name,
        description: p.description,
        recommendedActions: p.actions.map((a) => a.type),
      }));
    }),

  /**
   * Get autonomy statistics
   */
  getAutonomyStats: protectedProcedure.query(async () => {
    const metrics = QumusOrchestrationService.getMetrics(decisionLogs);
    const recentDecisions = decisionLogs.slice(-100);

    return {
      metrics,
      recentDecisions: recentDecisions.map((d) => ({
        id: d.id,
        policyId: d.policyId,
        decisionType: d.decisionType,
        approved: d.output.approved,
        confidence: d.confidence,
        timestamp: d.timestamp,
      })),
      policyStats: policies.map((p) => ({
        policyId: p.id,
        name: p.name,
        enabled: p.enabled,
        executionCount: decisionLogs.filter((d) => d.policyId === p.id).length,
        successRate: Math.round(
          (decisionLogs.filter((d) => d.policyId === p.id && d.output.approved).length /
            Math.max(decisionLogs.filter((d) => d.policyId === p.id).length, 1)) *
            100
        ),
      })),
    };
  }),
});
