/**
 * Ecosystem Integration Router
 * Provides tRPC endpoints for full QUMUS ecosystem integration
 * Manages QUMUS, RRB, HybridCast, Canryn, and Sweet Miracles
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { ecosystemIntegration } from '../_core/ecosystemIntegration';
import { stateOfStudio } from '../_core/stateOfStudio';
import { audioStreamingService } from '../_core/audioStreamingService';
import { dailyStatusReportService } from '../_core/dailyStatusReport';
import { z } from 'zod';

export const ecosystemIntegrationRouter = router({
  /**
   * Get current ecosystem integration status
   */
  getIntegrationStatus: publicProcedure.query(async () => {
    return ecosystemIntegration.getIntegrationStatus();
  }),

  /**
   * Get comprehensive ecosystem report
   */
  getEcosystemReport: publicProcedure.query(async () => {
    return ecosystemIntegration.getEcosystemReport();
  }),

  /**
   * Get state of studio metrics
   */
  getStateOfStudio: publicProcedure.query(async () => {
    return stateOfStudio.getHealthReport();
  }),

  /**
   * Get audio streaming statistics
   */
  getAudioStreamingStats: publicProcedure.query(async () => {
    return audioStreamingService.getStreamingStats();
  }),

  /**
   * Get all channels
   */
  getAllChannels: publicProcedure.query(async () => {
    return audioStreamingService.getAllChannels();
  }),

  /**
   * Get frequency profiles
   */
  getFrequencyProfiles: publicProcedure.query(async () => {
    return audioStreamingService.getFrequencyProfiles();
  }),

  /**
   * Update stream frequency (protected)
   */
  updateStreamFrequency: protectedProcedure
    .input(
      z.object({
        streamId: z.string(),
        frequency: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const success = audioStreamingService.updateStreamFrequency(
        input.streamId,
        input.frequency
      );
      return { success };
    }),

  /**
   * Trigger emergency broadcast (protected)
   */
  triggerEmergencyBroadcast: protectedProcedure
    .input(
      z.object({
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await ecosystemIntegration.triggerEmergencyBroadcast(
        input.message
      );
      return { success };
    }),

  /**
   * Enable full autonomous mode (protected)
   */
  enableFullAutonomousMode: protectedProcedure.mutation(async () => {
    ecosystemIntegration.enableFullAutonomousMode();
    return { success: true };
  }),

  /**
   * Enable human oversight mode (protected)
   */
  enableHumanOversightMode: protectedProcedure.mutation(async () => {
    ecosystemIntegration.enableHumanOversightMode();
    return { success: true };
  }),

  /**
   * Get autonomy ratio
   */
  getAutonomyRatio: publicProcedure.query(async () => {
    return ecosystemIntegration.getAutonomyRatio();
  }),

  /**
   * Update system status (protected)
   */
  updateSystemStatus: protectedProcedure
    .input(
      z.object({
        system: z.enum(['qumus', 'rrb', 'hybridCast', 'canryn', 'sweetMiracles']),
        updates: z.record(z.any()),
      })
    )
    .mutation(async ({ input }) => {
      ecosystemIntegration.updateSystemStatus(input.system, input.updates);
      return { success: true };
    }),

  /**
   * Get latest daily status report (protected)
   */
  getLatestDailyReport: protectedProcedure.query(async () => {
    return dailyStatusReportService.getLatestReport();
  }),

  /**
   * Trigger manual daily report (protected)
   */
  triggerManualReport: protectedProcedure.mutation(async () => {
    await dailyStatusReportService.triggerManualReport();
    return { success: true };
  }),

  /**
   * Get ecosystem health score
   */
  getEcosystemHealthScore: publicProcedure.query(async () => {
    const health = stateOfStudio.calculateEcosystemHealth();
    return { healthScore: health, status: health >= 80 ? 'HEALTHY' : 'DEGRADED' };
  }),

  /**
   * Get metrics history (protected)
   */
  getMetricsHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return stateOfStudio.getMetricsHistory(input.limit);
    }),

  /**
   * Record autonomous decision (protected)
   */
  recordAutonomousDecision: protectedProcedure.mutation(async () => {
    stateOfStudio.recordAutonomousDecision();
    return { success: true };
  }),

  /**
   * Record human intervention (protected)
   */
  recordHumanIntervention: protectedProcedure.mutation(async () => {
    stateOfStudio.recordHumanIntervention();
    return { success: true };
  }),

  /**
   * Get audio quality report
   */
  getAudioQualityReport: publicProcedure.query(async () => {
    return audioStreamingService.getQualityReport();
  }),

  /**
   * Check system health
   */
  checkSystemHealth: publicProcedure
    .input(
      z.object({
        system: z.enum(['qumus', 'rrb', 'hybridCast', 'canryn', 'sweetMiracles']),
      })
    )
    .query(async ({ input }) => {
      const isHealthy = ecosystemIntegration.checkSystemHealth(input.system);
      return { system: input.system, isHealthy };
    }),

  /**
   * Get legacy status
   */
  getLegacyStatus: publicProcedure.query(async () => {
    return stateOfStudio.getLegacyStatus();
  }),

  /**
   * Update legacy status (protected)
   */
  updateLegacyStatus: protectedProcedure
    .input(z.record(z.any()))
    .mutation(async ({ input }) => {
      stateOfStudio.updateLegacyStatus(input);
      return { success: true };
    }),
});
