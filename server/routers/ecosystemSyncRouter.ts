/**
 * Ecosystem Sync Router
 * Provides tRPC procedures for the Sync Dashboard and sync-all command.
 * Connects to the ecosystemSyncEngine for real subsystem validation.
 */
import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { runFullSync, syncSubsystem, getSubsystemDefinitions } from '../ecosystemSyncEngine';

export const ecosystemSyncRouter = router({
  // Run full ecosystem sync — validates all 18 subsystems
  syncAll: protectedProcedure.mutation(async () => {
    const report = await runFullSync();
    return report;
  }),

  // Get last sync report (cached for 30 seconds)
  getStatus: protectedProcedure.query(async () => {
    const report = await runFullSync();
    return report;
  }),

  // Sync a single subsystem
  syncSubsystem: protectedProcedure
    .input(z.object({ subsystemId: z.string() }))
    .mutation(async ({ input }) => {
      const result = await syncSubsystem(input.subsystemId);
      if (!result) return { success: false, error: 'Subsystem not found' };
      return { success: true, data: result };
    }),

  // Get subsystem definitions (for UI rendering)
  getSubsystems: protectedProcedure.query(async () => {
    return getSubsystemDefinitions();
  }),

  // Get ecosystem summary for quick dashboard display
  getSummary: protectedProcedure.query(async () => {
    const report = await runFullSync();
    return {
      overallHealth: report.overallHealth,
      online: report.subsystems.filter(s => s.status === 'online').length,
      degraded: report.subsystems.filter(s => s.status === 'degraded').length,
      offline: report.subsystems.filter(s => s.status === 'offline').length,
      totalRecords: report.totalRecords,
      tablesWithData: report.tablesWithData,
      totalTables: report.totalTables,
      warnings: report.warnings.length,
      lastSync: report.timestamp,
    };
  }),
});
