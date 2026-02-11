/**
 * Royalty Audit Router — QUMUS 12th Policy
 * tRPC procedures for royalty source management, discrepancy tracking,
 * audit execution, and scheduler control.
 */

import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import {
  getSources,
  getSourceById,
  addSource,
  removeSource,
  updateSource,
  getDiscrepancies,
  acknowledgeDiscrepancy,
  disputeDiscrepancy,
  escalateDiscrepancy,
  resolveDiscrepancy,
  runAudit,
  getAuditReports,
  getAuditSummary,
  startAuditScheduler,
  stopAuditScheduler,
  updateAuditSchedulerInterval,
  getAuditSchedulerStatus,
} from '../services/royalty-audit-policy';

export const royaltyAuditRouter = router({
  // ─── Sources ─────────────────────────────────────────────────────────────

  getSources: protectedProcedure
    .input(z.object({
      platform: z.string().optional(),
      type: z.string().optional(),
      status: z.string().optional(),
    }).optional())
    .query(({ input }) => getSources(input)),

  getSourceById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => getSourceById(input.id)),

  addSource: protectedProcedure
    .input(z.object({
      platform: z.string(),
      type: z.enum(['pro', 'streaming', 'mechanical', 'sync', 'performance']),
      songTitle: z.string(),
      artist: z.string(),
      ipi: z.string().optional(),
      isrc: z.string().optional(),
      iswc: z.string().optional(),
      expectedRate: z.number(),
      period: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(({ input }) => addSource(input)),

  removeSource: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      removeSource(input.id);
      return { success: true };
    }),

  updateSource: protectedProcedure
    .input(z.object({
      id: z.string(),
      actualRate: z.number().optional(),
      totalPlays: z.number().optional(),
      totalEarned: z.number().optional(),
      status: z.enum(['verified', 'discrepancy', 'missing', 'pending', 'disputed']).optional(),
      notes: z.string().optional(),
    }))
    .mutation(({ input }) => {
      const { id, ...updates } = input;
      return updateSource(id, updates);
    }),

  // ─── Discrepancies ───────────────────────────────────────────────────────

  getDiscrepancies: protectedProcedure
    .input(z.object({
      severity: z.string().optional(),
      status: z.string().optional(),
      platform: z.string().optional(),
    }).optional())
    .query(({ input }) => getDiscrepancies(input)),

  acknowledgeDiscrepancy: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => acknowledgeDiscrepancy(input.id)),

  disputeDiscrepancy: protectedProcedure
    .input(z.object({ id: z.string(), notes: z.string().optional() }))
    .mutation(({ input }) => disputeDiscrepancy(input.id, input.notes)),

  escalateDiscrepancy: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => escalateDiscrepancy(input.id)),

  resolveDiscrepancy: protectedProcedure
    .input(z.object({ id: z.string(), resolution: z.string() }))
    .mutation(({ input }) => resolveDiscrepancy(input.id, input.resolution)),

  // ─── Audit Execution ─────────────────────────────────────────────────────

  runAudit: protectedProcedure
    .mutation(() => runAudit()),

  getAuditReports: protectedProcedure
    .query(() => getAuditReports()),

  getAuditSummary: protectedProcedure
    .query(() => getAuditSummary()),

  // ─── Scheduler ────────────────────────────────────────────────────────────

  getSchedulerStatus: protectedProcedure
    .query(() => getAuditSchedulerStatus()),

  startScheduler: protectedProcedure
    .input(z.object({ intervalMs: z.number().optional() }).optional())
    .mutation(({ input }) => {
      startAuditScheduler(input?.intervalMs);
      return getAuditSchedulerStatus();
    }),

  stopScheduler: protectedProcedure
    .mutation(() => {
      stopAuditScheduler();
      return getAuditSchedulerStatus();
    }),

  updateSchedulerInterval: protectedProcedure
    .input(z.object({ intervalMs: z.number() }))
    .mutation(({ input }) => {
      updateAuditSchedulerInterval(input.intervalMs);
      return getAuditSchedulerStatus();
    }),
});
