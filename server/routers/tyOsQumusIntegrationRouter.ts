/**
 * Ty OS ↔ QUMUS Bidirectional Control Router
 * Manages real-time communication and decision flow between systems
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import {
  executeQumusDecision,
  processTyOSAction,
  getBidirectionalFlowHistory,
  getBidirectionalControlStatus,
  type QumusDecision,
  type TyOSAction,
} from '../services/tyOsQumusIntegrationService';

export const tyOsQumusIntegrationRouter = router({
  /**
   * Execute QUMUS policy decision
   */
  executeQumusDecision: protectedProcedure
    .input(
      z.object({
        policyId: z.number(),
        decision: z.enum(['approve', 'reject', 'review']),
        reason: z.string(),
        autonomyScore: z.number().min(0).max(1),
        requiresHumanReview: z.boolean().optional(),
        affectedEntities: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized: Admin access required');
        }

        const decision: QumusDecision = {
          id: `dec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          policyId: input.policyId,
          decision: input.decision,
          reason: input.reason,
          autonomyScore: input.autonomyScore,
          requiresHumanReview: input.requiresHumanReview ?? input.autonomyScore < 0.9,
          affectedEntities: input.affectedEntities,
          timestamp: new Date(),
        };

        const flow = await executeQumusDecision(decision);
        return flow;
      } catch (error) {
        console.error('Error executing QUMUS decision:', error);
        throw error;
      }
    }),

  /**
   * Process Ty OS user action
   */
  processTyOSAction: protectedProcedure
    .input(
      z.object({
        action: z.string(),
        targetEntity: z.string(),
        parameters: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const tyOSAction: TyOSAction = {
          id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: ctx.user!.id,
          action: input.action,
          targetEntity: input.targetEntity,
          parameters: input.parameters || {},
          timestamp: new Date(),
        };

        const flow = await processTyOSAction(tyOSAction);
        return flow;
      } catch (error) {
        console.error('Error processing Ty OS action:', error);
        throw error;
      }
    }),

  /**
   * Get bidirectional flow history
   */
  getFlowHistory: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).default(100),
      })
    )
    .query(async ({ input }) => {
      try {
        return await getBidirectionalFlowHistory(input.limit);
      } catch (error) {
        console.error('Error getting flow history:', error);
        throw error;
      }
    }),

  /**
   * Get bidirectional control status
   */
  getControlStatus: publicProcedure.query(async () => {
    try {
      return await getBidirectionalControlStatus();
    } catch (error) {
      console.error('Error getting control status:', error);
      throw error;
    }
  }),

  /**
   * Get recent decisions (last 24 hours)
   */
  getRecentDecisions: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      try {
        const history = await getBidirectionalFlowHistory(input.limit);
        return history.filter(
          flow =>
            flow.qumusDecision.timestamp.getTime() > Date.now() - 24 * 60 * 60 * 1000
        );
      } catch (error) {
        console.error('Error getting recent decisions:', error);
        throw error;
      }
    }),

  /**
   * Get pending human reviews
   */
  getPendingReviews: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      const history = await getBidirectionalFlowHistory(1000);
      return history.filter(flow => flow.qumusDecision.requiresHumanReview);
    } catch (error) {
      console.error('Error getting pending reviews:', error);
      throw error;
    }
  }),

  /**
   * Approve pending decision (human override)
   */
  approvePendingDecision: protectedProcedure
    .input(
      z.object({
        decisionId: z.string(),
        approvedBy: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized: Admin access required');
        }

        // TODO: Implement decision approval logic
        return {
          success: true,
          decisionId: input.decisionId,
          approvedAt: new Date(),
          approvedBy: input.approvedBy || ctx.user.name,
        };
      } catch (error) {
        console.error('Error approving decision:', error);
        throw error;
      }
    }),

  /**
   * Reject pending decision (human override)
   */
  rejectPendingDecision: protectedProcedure
    .input(
      z.object({
        decisionId: z.string(),
        reason: z.string(),
        rejectedBy: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized: Admin access required');
        }

        // TODO: Implement decision rejection logic
        return {
          success: true,
          decisionId: input.decisionId,
          rejectedAt: new Date(),
          rejectedBy: input.rejectedBy || ctx.user.name,
          reason: input.reason,
        };
      } catch (error) {
        console.error('Error rejecting decision:', error);
        throw error;
      }
    }),

  /**
   * Get autonomy metrics
   */
  getAutonomyMetrics: publicProcedure.query(async () => {
    try {
      const status = await getBidirectionalControlStatus();
      return {
        averageAutonomy: status.averageAutonomy,
        humanOverrideRate: status.pendingReview / Math.max(status.totalDecisions, 1),
        autonomyLevel: status.averageAutonomy,
        humanOversightPercentage: (1 - status.averageAutonomy) * 100,
        timestamp: status.timestamp,
      };
    } catch (error) {
      console.error('Error getting autonomy metrics:', error);
      throw error;
    }
  }),

  /**
   * Get blockchain verification status
   */
  getBlockchainStatus: publicProcedure.query(async () => {
    try {
      const status = await getBidirectionalControlStatus();
      return {
        totalVerified: status.blockchainVerified,
        verificationRate: status.blockchainVerified / Math.max(status.totalDecisions, 1),
        allDecisionsVerified: status.blockchainVerified === status.totalDecisions,
        timestamp: status.timestamp,
      };
    } catch (error) {
      console.error('Error getting blockchain status:', error);
      throw error;
    }
  }),
});
