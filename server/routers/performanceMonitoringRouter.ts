/**
 * Performance Monitoring Router — tRPC procedures for QUMUS 10th policy
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import {
  takeSnapshot,
  getSnapshots,
  getAlerts,
  acknowledgeAlert,
  resolveAlert,
  getPerformanceSummary,
  startMonitoring,
  stopMonitoring,
  getMonitoringStatus,
  updateMonitoringInterval,
  collectCategoryMetric,
  processPerformanceEvent,
} from '../services/performance-monitoring-policy';

export const performanceMonitoringRouter = router({
  // Take a new performance snapshot
  snapshot: protectedProcedure.mutation(async () => {
    return await takeSnapshot();
  }),

  // Get snapshot history
  getSnapshots: protectedProcedure.query(() => {
    return getSnapshots();
  }),

  // Get performance summary
  getSummary: protectedProcedure.query(() => {
    return getPerformanceSummary();
  }),

  // Get alerts with optional filters
  getAlerts: protectedProcedure
    .input(z.object({
      category: z.enum(['page_load', 'api_latency', 'memory_usage', 'stream_health', 'error_rate', 'uptime']).optional(),
      severity: z.enum(['normal', 'warning', 'critical', 'emergency']).optional(),
      acknowledged: z.boolean().optional(),
    }).optional())
    .query(({ input }) => {
      return getAlerts(input || undefined);
    }),

  // Acknowledge an alert
  acknowledgeAlert: protectedProcedure
    .input(z.object({ alertId: z.string() }))
    .mutation(({ input }) => {
      return acknowledgeAlert(input.alertId);
    }),

  // Resolve an alert
  resolveAlert: protectedProcedure
    .input(z.object({ alertId: z.string() }))
    .mutation(({ input }) => {
      return resolveAlert(input.alertId);
    }),

  // Collect a single category metric
  collectMetric: protectedProcedure
    .input(z.object({
      category: z.enum(['page_load', 'api_latency', 'memory_usage', 'stream_health', 'error_rate', 'uptime']),
    }))
    .mutation(async ({ input }) => {
      return await collectCategoryMetric(input.category);
    }),

  // Scheduler control
  getMonitoringStatus: protectedProcedure.query(() => {
    return getMonitoringStatus();
  }),

  startMonitoring: protectedProcedure
    .input(z.object({ intervalMs: z.number().min(60000).optional() }).optional())
    .mutation(({ input }) => {
      return startMonitoring(input?.intervalMs);
    }),

  stopMonitoring: protectedProcedure.mutation(() => {
    stopMonitoring();
    return getMonitoringStatus();
  }),

  updateInterval: protectedProcedure
    .input(z.object({ intervalMs: z.number().min(60000) }))
    .mutation(({ input }) => {
      return updateMonitoringInterval(input.intervalMs);
    }),

  // Process a performance event through QUMUS
  processEvent: protectedProcedure
    .input(z.object({
      type: z.enum(['slow_page', 'high_latency', 'memory_spike', 'stream_failure', 'error_spike', 'downtime']),
      url: z.string().optional(),
      endpoint: z.string().optional(),
      value: z.number().optional(),
      details: z.string().optional(),
      confidence: z.number().min(0).max(1),
    }))
    .mutation(async ({ input }) => {
      const { type, confidence, ...data } = input;
      return await processPerformanceEvent(type, { ...data, confidence });
    }),
});
