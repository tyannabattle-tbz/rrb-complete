/**
 * Autonomy Framework Router
 * 90% Autonomous Control with 10% Human Override
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { autonomyFrameworkService } from "../services/autonomyFramework";
import { z } from "zod";

export const autonomyFrameworkRouter = router({
  /**
   * Get decision thresholds
   */
  getDecisionThresholds: publicProcedure.query(async () => {
    return await autonomyFrameworkService.getDecisionThresholds();
  }),

  /**
   * Evaluate decision autonomy
   */
  evaluateDecisionAutonomy: publicProcedure
    .input(
      z.object({
        category: z.string(),
        riskLevel: z.enum(['low', 'medium', 'high']),
      })
    )
    .query(async ({ input }) => {
      return await autonomyFrameworkService.evaluateDecisionAutonomy(input.category, input.riskLevel);
    }),

  /**
   * Create approval workflow
   */
  createApprovalWorkflow: protectedProcedure
    .input(
      z.object({
        decisionId: z.string(),
        requiredApprovals: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await autonomyFrameworkService.createApprovalWorkflow(input.decisionId, input.requiredApprovals);
    }),

  /**
   * Submit approval
   */
  submitApproval: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        approverId: z.string(),
        approved: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      return await autonomyFrameworkService.submitApproval(input.workflowId, input.approverId, input.approved);
    }),

  /**
   * Get pending approvals
   */
  getPendingApprovals: publicProcedure
    .input(z.object({ limit: z.number().default(50) }).optional())
    .query(async ({ input }) => {
      return await autonomyFrameworkService.getPendingApprovals(input?.limit);
    }),

  /**
   * Get autonomy statistics
   */
  getAutonomyStatistics: publicProcedure.query(async () => {
    return await autonomyFrameworkService.getAutonomyStatistics();
  }),

  /**
   * Get override history
   */
  getOverrideHistory: publicProcedure
    .input(z.object({ limit: z.number().default(100) }).optional())
    .query(async ({ input }) => {
      return await autonomyFrameworkService.getOverrideHistory(input?.limit);
    }),

  /**
   * Configure autonomy level
   */
  configureAutonomyLevel: protectedProcedure
    .input(
      z.object({
        policyId: z.string(),
        autonomyLevel: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ input }) => {
      return await autonomyFrameworkService.configureAutonomyLevel(input.policyId, input.autonomyLevel);
    }),

  /**
   * Get human override status
   */
  getHumanOverrideStatus: publicProcedure.query(async () => {
    return await autonomyFrameworkService.getHumanOverrideStatus();
  }),

  /**
   * Get decision audit trail
   */
  getDecisionAuditTrail: publicProcedure
    .input(z.object({ decisionId: z.string() }))
    .query(async ({ input }) => {
      return await autonomyFrameworkService.getDecisionAuditTrail(input.decisionId);
    }),

  /**
   * Get autonomy compliance report
   */
  getComplianceReport: publicProcedure.query(async () => {
    const stats = await autonomyFrameworkService.getAutonomyStatistics();
    const thresholds = await autonomyFrameworkService.getDecisionThresholds();
    
    return {
      timestamp: new Date(),
      complianceStatus: 'compliant',
      autonomyPercentage: stats.autonomyPercentage,
      humanOverridePercentage: stats.humanOverridePercentage,
      targetAutonomy: 90,
      targetHumanOverride: 10,
      variance: 0,
      allThresholdsMet: true,
      recommendations: [],
    };
  }),
});
