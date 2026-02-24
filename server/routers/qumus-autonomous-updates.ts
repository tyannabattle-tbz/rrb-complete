/**
 * Qumus Autonomous Updates Router
 * Handles all update requests from site and app with autonomous decision-making
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { QumusAutonomousUpdateHandler, UpdateRequest } from '../services/qumus-autonomous-update-handler';

export const qumusAutonomousUpdatesRouter = router({
  /**
   * Submit update request for autonomous processing
   */
  submitUpdate: protectedProcedure
    .input(
      z.object({
        type: z.enum(['feature', 'bugfix', 'content', 'configuration', 'emergency']),
        source: z.enum(['site', 'app', 'api', 'webhook']),
        priority: z.enum(['low', 'medium', 'high', 'critical']),
        description: z.string(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const request: UpdateRequest = {
        id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: input.type,
        source: input.source,
        priority: input.priority,
        description: input.description,
        requestedBy: ctx.user?.email,
        metadata: input.metadata || {},
        timestamp: Date.now(),
      };

      const decision = await QumusAutonomousUpdateHandler.submitUpdateRequest(request);

      return {
        success: true,
        updateId: request.id,
        decision: {
          approved: decision.approved,
          autonomousDecision: decision.autonomousDecision,
          confidence: decision.confidence,
          reasoning: decision.reasoning,
          requiresHumanReview: decision.requiresHumanReview,
        },
      };
    }),

  /**
   * Get update status
   */
  getStatus: publicProcedure.query(async () => {
    const status = QumusAutonomousUpdateHandler.getUpdateStatus();

    return {
      queueLength: status.queueLength,
      activeUpdates: status.activeUpdates,
      totalDecisions: status.totalDecisions,
      autonomousDecisions: status.autonomousDecisions,
      autonomyLevel: status.autonomyLevel,
      autonomyPercentage: `${status.autonomousDecisions}/${status.totalDecisions}`,
    };
  }),

  /**
   * Get decision log
   */
  getDecisionLog: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(50),
      })
    )
    .query(async ({ input }) => {
      const log = QumusAutonomousUpdateHandler.getDecisionLog(input.limit);

      return {
        decisions: log.map(d => ({
          updateId: d.updateId,
          approved: d.approved,
          autonomousDecision: d.autonomousDecision,
          confidence: (d.confidence * 100).toFixed(1) + '%',
          reasoning: d.reasoning,
          requiresHumanReview: d.requiresHumanReview,
        })),
        total: log.length,
      };
    }),

  /**
   * Update Qumus configuration
   */
  updateConfig: protectedProcedure
    .input(
      z.object({
        autonomyLevel: z.number().min(0).max(100).optional(),
        autoApprovalThreshold: z.number().min(0).max(1).optional(),
        maxConcurrentUpdates: z.number().min(1).optional(),
        rollbackOnFailure: z.boolean().optional(),
        notifyOnUpdate: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only admins can update config
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      QumusAutonomousUpdateHandler.updateConfig({
        autonomyLevel: input.autonomyLevel,
        autoApprovalThreshold: input.autoApprovalThreshold,
        maxConcurrentUpdates: input.maxConcurrentUpdates,
        rollbackOnFailure: input.rollbackOnFailure,
        notifyOnUpdate: input.notifyOnUpdate,
      });

      return {
        success: true,
        message: 'Qumus configuration updated',
      };
    }),

  /**
   * Enable/disable autonomous mode
   */
  setAutonomousMode: protectedProcedure
    .input(
      z.object({
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only admins can toggle autonomous mode
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      QumusAutonomousUpdateHandler.setAutonomousMode(input.enabled);

      return {
        success: true,
        message: `Autonomous updates ${input.enabled ? 'enabled' : 'disabled'}`,
        autonomousMode: input.enabled,
      };
    }),

  /**
   * Submit emergency update
   */
  submitEmergencyUpdate: protectedProcedure
    .input(
      z.object({
        description: z.string(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const request: UpdateRequest = {
        id: `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'emergency',
        source: 'api',
        priority: 'critical',
        description: input.description,
        requestedBy: ctx.user?.email,
        metadata: input.metadata || {},
        timestamp: Date.now(),
      };

      const decision = await QumusAutonomousUpdateHandler.submitUpdateRequest(request);

      return {
        success: true,
        updateId: request.id,
        decision: {
          approved: decision.approved,
          autonomousDecision: decision.autonomousDecision,
          confidence: decision.confidence,
          reasoning: decision.reasoning,
        },
      };
    }),
});
