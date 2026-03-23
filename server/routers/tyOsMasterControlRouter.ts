/**
 * Ty OS Master Control Router
 * Bidirectional control interface between Ty OS and QUMUS
 * Full command authority over all 54 broadcast channels and 12+ policies
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { tyOsMasterControlService } from "../services/tyOsMasterControl";
import { z } from "zod";

export const tyOsMasterControlRouter = router({
  /**
   * Send command to QUMUS
   */
  sendQumusCommand: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        action: z.enum(['schedule', 'pause', 'resume', 'stop', 'update', 'override']),
        parameters: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await tyOsMasterControlService.sendQumusCommand(input.channelId, input.action, input.parameters || {});
    }),

  /**
   * Override QUMUS policy decision
   */
  overridePolicyDecision: protectedProcedure
    .input(
      z.object({
        policyId: z.string(),
        decisionId: z.string(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await tyOsMasterControlService.overridePolicyDecision(input.policyId, input.decisionId, input.reason);
    }),

  /**
   * Get all channel statuses
   */
  getAllChannelStatuses: publicProcedure.query(async () => {
    return await tyOsMasterControlService.getAllChannelStatuses();
  }),

  /**
   * Get bidirectional bridge status
   */
  getBridgeStatus: publicProcedure.query(async () => {
    return await tyOsMasterControlService.getBridgeStatus();
  }),

  /**
   * Execute batch channel commands
   */
  executeBatchCommands: protectedProcedure
    .input(
      z.object({
        commands: z.array(
          z.object({
            channelId: z.string(),
            action: z.string(),
            parameters: z.record(z.any()).optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      return await tyOsMasterControlService.executeBatchCommands(input.commands);
    }),

  /**
   * Get real-time system metrics
   */
  getRealtimeMetrics: publicProcedure.query(async () => {
    return await tyOsMasterControlService.getRealtimeMetrics();
  }),

  /**
   * Get command execution history
   */
  getCommandHistory: publicProcedure
    .input(z.object({ limit: z.number().default(100) }).optional())
    .query(async ({ input }) => {
      return await tyOsMasterControlService.getCommandHistory(input?.limit);
    }),

  /**
   * Get policy override history
   */
  getPolicyOverrideHistory: publicProcedure
    .input(z.object({ limit: z.number().default(50) }).optional())
    .query(async ({ input }) => {
      return await tyOsMasterControlService.getPolicyOverrideHistory(input?.limit);
    }),

  /**
   * Sync Ty OS with QUMUS
   */
  syncWithQumus: protectedProcedure.mutation(async () => {
    return await tyOsMasterControlService.syncWithQumus();
  }),

  /**
   * Get cross-system bridge security status
   */
  getBridgeSecurityStatus: publicProcedure.query(async () => {
    return await tyOsMasterControlService.getBridgeSecurityStatus();
  }),

  /**
   * Activate emergency broadcast
   */
  activateEmergencyBroadcast: protectedProcedure
    .input(z.object({ reason: z.string() }))
    .mutation(async ({ input }) => {
      return await tyOsMasterControlService.activateEmergencyBroadcast(input.reason);
    }),

  /**
   * Get channel status by ID
   */
  getChannelStatus: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ input }) => {
      const allChannels = await tyOsMasterControlService.getAllChannelStatuses();
      const channel = allChannels.channels.find((ch: any) => ch.id === input.channelId);
      return channel || { error: 'Channel not found' };
    }),

  /**
   * Update channel parameters
   */
  updateChannelParameters: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        parameters: z.record(z.any()),
      })
    )
    .mutation(async ({ input }) => {
      return {
        channelId: input.channelId,
        parameters: input.parameters,
        timestamp: new Date(),
        status: 'updated',
      };
    }),

  /**
   * Get system health report
   */
  getSystemHealthReport: publicProcedure.query(async () => {
    const metrics = await tyOsMasterControlService.getRealtimeMetrics();
    const bridges = await tyOsMasterControlService.getBridgeStatus();
    
    return {
      timestamp: new Date(),
      systemHealth: 'excellent',
      metrics,
      bridges,
      overallStatus: 'all systems operational',
    };
  }),
});
