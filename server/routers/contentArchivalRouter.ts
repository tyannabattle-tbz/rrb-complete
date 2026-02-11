/**
 * Content Archival Router — tRPC procedures for QUMUS 11th policy
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import {
  runArchivalScan,
  addLink,
  removeLink,
  getLinks,
  getLinkById,
  getArchivalAlerts,
  acknowledgeArchivalAlert,
  resolveArchivalAlert,
  archiveLink,
  checkAllWayback,
  getScanHistory,
  getArchivalSummary,
  startArchivalScheduler,
  stopArchivalScheduler,
  getSchedulerStatus,
  updateSchedulerInterval,
  processArchivalEvent,
} from '../services/content-archival-policy';

export const contentArchivalRouter = router({
  // Run a full archival scan
  scan: protectedProcedure.mutation(async () => {
    return await runArchivalScan();
  }),

  // Get scan history
  getScanHistory: protectedProcedure.query(() => {
    return getScanHistory();
  }),

  // Get archival summary
  getSummary: protectedProcedure.query(() => {
    return getArchivalSummary();
  }),

  // Get monitored links with optional filters
  getLinks: protectedProcedure
    .input(z.object({
      category: z.enum(['evidence', 'legal', 'music_database', 'streaming', 'news', 'reference', 'social', 'government']).optional(),
      status: z.enum(['alive', 'degraded', 'dead', 'unknown', 'archived']).optional(),
      priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
    }).optional())
    .query(({ input }) => {
      return getLinks(input || undefined);
    }),

  // Get a single link by ID
  getLink: protectedProcedure
    .input(z.object({ linkId: z.string() }))
    .query(({ input }) => {
      return getLinkById(input.linkId);
    }),

  // Add a new monitored link
  addLink: protectedProcedure
    .input(z.object({
      url: z.string().url(),
      title: z.string().min(1),
      category: z.enum(['evidence', 'legal', 'music_database', 'streaming', 'news', 'reference', 'social', 'government']),
      priority: z.enum(['critical', 'high', 'medium', 'low']),
      notes: z.string().optional(),
    }))
    .mutation(({ input }) => {
      return addLink(input);
    }),

  // Remove a monitored link
  removeLink: protectedProcedure
    .input(z.object({ linkId: z.string() }))
    .mutation(({ input }) => {
      removeLink(input.linkId);
      return { success: true };
    }),

  // Get alerts with optional filters
  getAlerts: protectedProcedure
    .input(z.object({
      type: z.string().optional(),
      severity: z.string().optional(),
      acknowledged: z.boolean().optional(),
    }).optional())
    .query(({ input }) => {
      return getArchivalAlerts(input || undefined);
    }),

  // Acknowledge an alert
  acknowledgeAlert: protectedProcedure
    .input(z.object({ alertId: z.string() }))
    .mutation(({ input }) => {
      return acknowledgeArchivalAlert(input.alertId);
    }),

  // Resolve an alert
  resolveAlert: protectedProcedure
    .input(z.object({ alertId: z.string() }))
    .mutation(({ input }) => {
      return resolveArchivalAlert(input.alertId);
    }),

  // Archive a specific link to Wayback Machine
  archiveToWayback: protectedProcedure
    .input(z.object({ linkId: z.string() }))
    .mutation(async ({ input }) => {
      return await archiveLink(input.linkId);
    }),

  // Check all links against Wayback Machine
  checkAllWayback: protectedProcedure.mutation(async () => {
    return await checkAllWayback();
  }),

  // Scheduler control
  getSchedulerStatus: protectedProcedure.query(() => {
    return getSchedulerStatus();
  }),

  startScheduler: protectedProcedure
    .input(z.object({ intervalMs: z.number().min(300000).optional() }).optional())
    .mutation(({ input }) => {
      return startArchivalScheduler(input?.intervalMs);
    }),

  stopScheduler: protectedProcedure.mutation(() => {
    stopArchivalScheduler();
    return getSchedulerStatus();
  }),

  updateInterval: protectedProcedure
    .input(z.object({ intervalMs: z.number().min(300000) }))
    .mutation(({ input }) => {
      return updateSchedulerInterval(input.intervalMs);
    }),

  // Process an archival event through QUMUS
  processEvent: protectedProcedure
    .input(z.object({
      type: z.enum(['link_down', 'link_recovered', 'archive_success', 'archive_failed', 'critical_evidence_at_risk']),
      url: z.string().optional(),
      title: z.string().optional(),
      details: z.string().optional(),
      confidence: z.number().min(0).max(1),
    }))
    .mutation(async ({ input }) => {
      const { type, confidence, ...data } = input;
      return await processArchivalEvent(type, { ...data, confidence });
    }),
});
