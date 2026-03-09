/**
 * Ecosystem Integration Router
 * ALL data from real database tables — no fake/seeded numbers
 * 
 * Data sources:
 * - stateOfStudio: queries qumus_autonomous_actions, qumus_core_policies, ecosystem_commands, policy_decisions
 * - audioStreamingService: queries radio_channels for real listener counts
 * - ecosystemIntegration: in-memory system status (non-metric data)
 * - dailyStatusReportService: generates reports from real DB data
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { ecosystemIntegration } from '../_core/ecosystemIntegration';
import { stateOfStudio } from '../_core/stateOfStudio';
import { audioStreamingService } from '../_core/audioStreamingService';
import { dailyStatusReportService } from '../_core/dailyStatusReport';
import { getPlatformStats } from '../_core/realtimeStats';
import { z } from 'zod';
import { generateChannelIntro, generateShowTransition, getCurrentDjInfo, getDailySchedule } from '../_core/aiDjService';
import { getDb } from '../db';
import { sql } from 'drizzle-orm';

export const ecosystemIntegrationRouter = router({
  /**
   * Get centralized platform stats — single source of truth for all listener/channel metrics
   */
  getPlatformStats: publicProcedure.query(async () => {
    return getPlatformStats();
  }),

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
   * Get state of studio metrics — ALL from database
   */
  getStateOfStudio: publicProcedure.query(async () => {
    return stateOfStudio.getHealthReport();
  }),

  /**
   * Get audio streaming statistics — from radio_channels table
   */
  getAudioStreamingStats: publicProcedure.query(async () => {
    return audioStreamingService.getStreamingStats();
  }),

  /**
   * Get all channels — from radio_channels table
   */
  getAllChannels: publicProcedure.query(async () => {
    return audioStreamingService.getAllChannelsFromDb();
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
    .input(z.object({ streamId: z.string(), frequency: z.number() }))
    .mutation(async ({ input }) => {
      const success = audioStreamingService.updateStreamFrequency(input.streamId, input.frequency);
      return { success };
    }),

  /**
   * Trigger emergency broadcast (protected)
   */
  triggerEmergencyBroadcast: protectedProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ input }) => {
      const success = await ecosystemIntegration.triggerEmergencyBroadcast(input.message);
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
   * Get autonomy ratio — from qumus_autonomous_actions table
   */
  getAutonomyRatio: publicProcedure.query(async () => {
    return stateOfStudio.getAutonomyRatio();
  }),

  /**
   * Update system status (protected)
   */
  updateSystemStatus: protectedProcedure
    .input(z.object({
      system: z.enum(['qumus', 'rrb', 'hybridCast', 'canryn', 'sweetMiracles']),
      updates: z.record(z.any()),
    }))
    .mutation(async ({ input }) => {
      // ecosystemIntegration no longer stores mutable state — all data is from DB
      return { success: true };
    }),

  /**
   * Get latest daily status report (protected) — ALL from database
   */
  getLatestDailyReport: protectedProcedure.query(async () => {
    return dailyStatusReportService.getLatestReport();
  }),

  /**
   * Trigger manual daily report (protected)
   */
  triggerManualReport: protectedProcedure.mutation(async () => {
    const success = await dailyStatusReportService.triggerManualReport();
    return { success };
  }),

  /**
   * Get ecosystem health score — from database
   */
  getEcosystemHealthScore: publicProcedure.query(async () => {
    const health = await stateOfStudio.calculateEcosystemHealth();
    return { healthScore: health, status: health >= 80 ? 'HEALTHY' : 'DEGRADED' };
  }),

  /**
   * Get metrics history — deprecated (all data is real-time from DB now)
   */
  getMetricsHistory: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async () => {
      // Real-time data from DB — no in-memory history needed
      const report = await stateOfStudio.getHealthReport();
      return [report];
    }),

  /**
   * Record autonomous decision — writes to qumus_autonomous_actions table
   */
  recordAutonomousDecision: protectedProcedure.mutation(async () => {
    await stateOfStudio.recordAutonomousDecision();
    return { success: true };
  }),

  /**
   * Record human intervention — writes to qumus_autonomous_actions table
   */
  recordHumanIntervention: protectedProcedure.mutation(async () => {
    await stateOfStudio.recordHumanIntervention();
    return { success: true };
  }),

  /**
   * Get audio quality report — from radio_channels table
   */
  getAudioQualityReport: publicProcedure.query(async () => {
    return audioStreamingService.getQualityReport();
  }),

  /**
   * Check system health
   */
  checkSystemHealth: publicProcedure
    .input(z.object({ system: z.enum(['qumus', 'rrb', 'hybridCast', 'canryn', 'sweetMiracles']) }))
    .query(async ({ input }) => {
      const isHealthy = await ecosystemIntegration.checkSystemHealth(input.system);
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

  /**
   * Get real-time QUMUS stats summary — ALL from database
   */
  getQumusStats: publicProcedure.query(async () => {
    const [
      autonomousDecisions,
      humanInterventions,
      successRate,
      activePolicies,
      commandCount,
      activeTasks,
      policyStats,
    ] = await Promise.all([
      stateOfStudio.getAutonomousDecisionCount(),
      stateOfStudio.getHumanInterventionCount(),
      stateOfStudio.getSuccessRate(),
      stateOfStudio.getActivePolicyCount(),
      stateOfStudio.getCommandCount(),
      stateOfStudio.getActiveTaskCount(),
      stateOfStudio.getPolicyDecisionStats(),
    ]);

    return {
      autonomousDecisions,
      humanInterventions,
      successRate,
      activePolicies,
      commandsExecuted: commandCount,
      activeTasks,
      policyDecisions: policyStats,
      uptime: stateOfStudio.getUptimeFormatted(),
      uptimeHours: stateOfStudio.getUptimeHours(),
    };
  }),

  /**
   * Get AI DJ channel intro — generates a live intro using Seraph/Candy/Valanna
   */
  getDjIntro: publicProcedure
    .input(z.object({
      channelName: z.string(),
      genre: z.string(),
      listenerCount: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      return generateChannelIntro(input.channelName, input.genre, input.listenerCount);
    }),

  /**
   * Get show transition — generates a transition between programs
   */
  getShowTransition: publicProcedure
    .input(z.object({
      fromShow: z.string(),
      toShow: z.string(),
    }))
    .mutation(async ({ input }) => {
      return generateShowTransition(input.fromShow, input.toShow);
    }),

  /**
   * Get current active DJ info
   */
  getCurrentDj: publicProcedure.query(() => {
    return getCurrentDjInfo();
  }),

  /**
   * Get the full daily DJ schedule
   */
  getDailySchedule: publicProcedure.query(() => {
    return getDailySchedule();
  }),

  /**
   * Get broadcast schedule from database
   */
  getBroadcastSchedule: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      const result = await db.execute(
        sql`SELECT id, title, description, start_time, end_time, status, type, autonomous_scheduling
            FROM broadcast_schedules ORDER BY start_time`
      );
      const rows = Array.isArray(result[0]) ? result[0] : result;
      return (rows as any[]).map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        startTime: r.start_time,
        endTime: r.end_time,
        status: r.status,
        type: r.type,
        autonomousScheduling: r.autonomous_scheduling,
      }));
    } catch {
      return [];
    }
  }),
});
