/**
 * Stream Health Monitor Router — tRPC endpoints for QUMUS stream health monitoring
 */
import { z } from "zod";
import { publicProcedure, protectedProcedure } from "../_core/trpc";
import { router } from "../_core/trpc";
import {
  runHealthCheck,
  getLatestReport,
  getHealthHistory,
  getMonitorStatus,
  getOutageHistory,
  getChannelLeaderboard,
  getCriticalAlertStatus,
  startStreamHealthMonitor,
  stopStreamHealthMonitor,
} from "../services/streamHealthMonitor";

export const streamHealthRouter = router({
  // Get latest health report (public — dashboard can read)
  getLatest: publicProcedure.query(async () => {
    const report = getLatestReport();
    if (!report) return null;
    return {
      timestamp: report.timestamp,
      totalChannels: report.totalChannels,
      healthy: report.healthy,
      degraded: report.degraded,
      down: report.down,
      uptimePercent: report.uptimePercent,
      channels: report.results.map(r => ({
        name: r.channelName,
        status: r.status,
        responseTime: r.responseTimeMs,
        error: r.error,
      })),
    };
  }),

  // Get monitor status
  getStatus: publicProcedure.query(async () => {
    return getMonitorStatus();
  }),

  // Get health history (last 24 hours)
  getHistory: publicProcedure.query(async () => {
    const history = getHealthHistory();
    // Return summary only to keep payload small
    return history.map(h => ({
      timestamp: h.timestamp,
      totalChannels: h.totalChannels,
      healthy: h.healthy,
      degraded: h.degraded,
      down: h.down,
      uptimePercent: h.uptimePercent,
    }));
  }),

  // Trigger a manual health check (admin only)
  runCheck: protectedProcedure.mutation(async () => {
    const report = await runHealthCheck();
    return {
      success: true,
      totalChannels: report.totalChannels,
      healthy: report.healthy,
      degraded: report.degraded,
      down: report.down,
      uptimePercent: report.uptimePercent,
      downChannels: report.results
        .filter(r => r.status === 'down')
        .map(r => ({ id: r.channelId, name: r.channelName, error: r.error })),
    };
  }),

  // Get outage history for root cause analysis
  getOutages: publicProcedure.query(async () => {
    return getOutageHistory().map(o => ({
      timestamp: o.timestamp,
      channelsAffected: o.channelsAffected,
      totalChannels: o.totalChannels,
      rootCause: o.rootCause,
      details: o.details,
      resolved: o.resolved,
    }));
  }),

  // Start the automated monitor (admin only)
  startMonitor: protectedProcedure.mutation(async () => {
    startStreamHealthMonitor();
    return { success: true, message: 'Stream health monitor started (15-min intervals)' };
  }),

  // Stop the automated monitor (admin only)
  stopMonitor: protectedProcedure.mutation(async () => {
    stopStreamHealthMonitor();
    return { success: true, message: 'Stream health monitor stopped' };
  }),

  // Get channel performance leaderboard
  getLeaderboard: publicProcedure.query(async () => {
    return getChannelLeaderboard().map(ch => ({
      rank: ch.rank,
      channelId: ch.channelId,
      channelName: ch.channelName,
      genre: ch.genre,
      uptimePercent: ch.uptimePercent,
      totalChecks: ch.totalChecks,
      healthyChecks: ch.healthyChecks,
      degradedChecks: ch.degradedChecks,
      downChecks: ch.downChecks,
      avgResponseTimeMs: ch.avgResponseTimeMs,
      lastStatus: ch.lastStatus,
      healCount: ch.healCount,
    }));
  }),

  // Get critical alert status
  getCriticalAlertStatus: publicProcedure.query(async () => {
    return getCriticalAlertStatus();
  }),
});
