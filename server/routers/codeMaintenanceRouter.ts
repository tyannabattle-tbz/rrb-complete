/**
 * QUMUS Code Maintenance Router
 * tRPC procedures for the 9th autonomous decision policy
 * 
 * Provides: full scan, category scan, issue management, scan history, summary
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import {
  runFullScan,
  runCategoryScan,
  getIssues,
  resolveIssue,
  ignoreIssue,
  getScanHistory,
  getLastScanTime,
  getMaintenanceSummary,
  startScheduledScans,
  stopScheduledScans,
  getSchedulerStatus,
  updateSchedulerInterval,
  type ScanCategory,
} from '../services/code-maintenance-policy';

export const codeMaintenanceRouter = router({
  /**
   * Run a full scan across all categories
   */
  runFullScan: protectedProcedure
    .mutation(async () => {
      const report = await runFullScan();
      return report;
    }),

  /**
   * Run a scan for a specific category
   */
  runCategoryScan: protectedProcedure
    .input(z.object({
      category: z.enum(['cdn_assets', 'route_health', 'audio_streams', 'dead_links', 'code_quality', 'dependency_health']),
    }))
    .mutation(async ({ input }) => {
      const result = await runCategoryScan(input.category as ScanCategory);
      return result;
    }),

  /**
   * Get current issues with optional filters
   */
  getIssues: publicProcedure
    .input(z.object({
      category: z.enum(['cdn_assets', 'route_health', 'audio_streams', 'dead_links', 'code_quality', 'dependency_health']).optional(),
      severity: z.enum(['critical', 'high', 'medium', 'low', 'info']).optional(),
      status: z.enum(['open', 'auto_fixed', 'escalated', 'resolved', 'ignored']).optional(),
    }).optional())
    .query(({ input }) => {
      return getIssues(input ? {
        category: input.category as ScanCategory | undefined,
        severity: input.severity as any,
        status: input.status as any,
      } : undefined);
    }),

  /**
   * Resolve an issue (mark as fixed by human)
   */
  resolveIssue: protectedProcedure
    .input(z.object({ issueId: z.string() }))
    .mutation(({ input }) => {
      const issue = resolveIssue(input.issueId);
      if (!issue) throw new Error('Issue not found');
      return issue;
    }),

  /**
   * Ignore an issue (won't be flagged again)
   */
  ignoreIssue: protectedProcedure
    .input(z.object({ issueId: z.string() }))
    .mutation(({ input }) => {
      const issue = ignoreIssue(input.issueId);
      if (!issue) throw new Error('Issue not found');
      return issue;
    }),

  /**
   * Get scan history
   */
  getScanHistory: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(20) }).optional())
    .query(({ input }) => {
      return getScanHistory(input?.limit || 20);
    }),

  /**
   * Get maintenance summary statistics
   */
  getSummary: publicProcedure
    .query(() => {
      return getMaintenanceSummary();
    }),

  /**
   * Get last scan timestamp
   */
  getLastScanTime: publicProcedure
    .query(() => {
      return { lastScanAt: getLastScanTime() };
    }),

  // ─── Scheduler Control ──────────────────────────────────────────────────

  /**
   * Get scheduler status
   */
  getSchedulerStatus: publicProcedure
    .query(() => {
      return getSchedulerStatus();
    }),

  /**
   * Start the automated scan scheduler
   */
  startScheduler: protectedProcedure
    .input(z.object({
      intervalMs: z.number().min(300000).optional(), // min 5 minutes
    }).optional())
    .mutation(({ input }) => {
      return startScheduledScans(input?.intervalMs);
    }),

  /**
   * Stop the automated scan scheduler
   */
  stopScheduler: protectedProcedure
    .mutation(() => {
      stopScheduledScans();
      return { stopped: true };
    }),

  /**
   * Update scheduler interval
   */
  updateSchedulerInterval: protectedProcedure
    .input(z.object({
      intervalMs: z.number().min(300000), // min 5 minutes
    }))
    .mutation(({ input }) => {
      return updateSchedulerInterval(input.intervalMs);
    }),
});
