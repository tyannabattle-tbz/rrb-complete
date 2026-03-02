import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  createRunbook,
  getRunbook,
  getAllRunbooks,
  updateRunbook,
  deleteRunbook,
  executeRunbook,
  getExecution,
  getExecutionHistory,
  getAllExecutions,
  createSchedule,
  getSchedule,
  getAllSchedules,
  updateSchedule,
  deleteSchedule,
  getExecutionStatistics,
  generateRunbookSuggestions,
  exportRunbooks,
} from "../services/runbookService";
import {
  createSLO,
  getSLO,
  getAllSLOs,
  updateSLO,
  deleteSLO,
  recordMetric,
  getMetrics,
  getMetricStatistics,
  getViolation,
  getAllViolations,
  getActiveViolations,
  resolveViolation,
  generateSLAReport,
  getSLACompliancePercentage,
  generateSLARecommendations,
} from "../services/slaMonitoringService";
import {
  createRegion,
  getRegion,
  getAllRegions,
  getPrimaryRegion,
  getActiveRegions,
  updateRegionHealth,
  updateRegionMetrics,
  triggerFailover,
  getFailoverEvent,
  getAllFailoverEvents,
  getRegionMetrics,
  getRegionMetricsStatistics,
  createFailoverPolicy,
  getFailoverPolicy,
  getAllFailoverPolicies,
  updateFailoverPolicy,
  getFailoverStatistics,
  generateFailoverRecommendations,
} from "../services/multiRegionFailoverService";

export const infrastructurePlatformRouter = router({
  // Runbook Automation
  createRunbook: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        script: z.string(),
        language: z.enum(["bash", "python", "node"]),
        timeout: z.number(),
        retryCount: z.number(),
        requiredParams: z.array(z.string()),
        tags: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      return createRunbook(input.name, input.description, input.script, input.language, input.timeout, input.retryCount, input.requiredParams, input.tags);
    }),

  getRunbook: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ input }) => {
      return getRunbook(input.taskId);
    }),

  getAllRunbooks: protectedProcedure.query(async () => {
    return getAllRunbooks();
  }),

  updateRunbook: protectedProcedure
    .input(z.object({ taskId: z.string(), updates: z.record(z.string(), z.unknown()) }))
    .mutation(async ({ input }) => {
      return updateRunbook(input.taskId, input.updates as Partial<any>);
    }),

  deleteRunbook: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ input }) => {
      return deleteRunbook(input.taskId);
    }),

  executeRunbook: protectedProcedure
    .input(z.object({ taskId: z.string(), params: z.record(z.string(), z.unknown()).optional() }))
    .mutation(async ({ input }) => {
      return await executeRunbook(input.taskId, input.params || {});
    }),

  getExecution: protectedProcedure
    .input(z.object({ executionId: z.string() }))
    .query(async ({ input }) => {
      return getExecution(input.executionId);
    }),

  getExecutionHistory: protectedProcedure
    .input(z.object({ taskId: z.string(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return getExecutionHistory(input.taskId, input.limit);
    }),

  getAllExecutions: protectedProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ input }) => {
      return getAllExecutions(input.limit);
    }),

  getExecutionStatistics: protectedProcedure.query(async () => {
    return getExecutionStatistics();
  }),

  generateRunbookSuggestions: protectedProcedure
    .input(z.object({ scenario: z.string() }))
    .query(async ({ input }) => {
      return await generateRunbookSuggestions(input.scenario);
    }),

  exportRunbooks: protectedProcedure
    .input(z.object({ format: z.enum(["json", "yaml"]).default("json") }))
    .query(async ({ input }) => {
      return exportRunbooks(input.format);
    }),

  // SLA Monitoring
  createSLO: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        displayName: z.string(),
        description: z.string(),
        metric: z.string(),
        target: z.number(),
        window: z.number(),
        alertThreshold: z.number(),
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      return createSLO(input.name, input.displayName, input.description, input.metric, input.target, input.window, input.alertThreshold, input.enabled);
    }),

  getSLO: protectedProcedure
    .input(z.object({ sloId: z.string() }))
    .query(async ({ input }) => {
      return getSLO(input.sloId);
    }),

  getAllSLOs: protectedProcedure.query(async () => {
    return getAllSLOs();
  }),

  recordMetric: protectedProcedure
    .input(z.object({ metric: z.string(), value: z.number() }))
    .mutation(async ({ input }) => {
      return recordMetric(input.metric, input.value);
    }),

  getMetrics: protectedProcedure
    .input(z.object({ metric: z.string(), limit: z.number().default(100) }))
    .query(async ({ input }) => {
      return getMetrics(input.metric, input.limit);
    }),

  getMetricStatistics: protectedProcedure
    .input(z.object({ metric: z.string() }))
    .query(async ({ input }) => {
      return getMetricStatistics(input.metric);
    }),

  getAllViolations: protectedProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ input }) => {
      return getAllViolations(input.limit);
    }),

  getActiveViolations: protectedProcedure.query(async () => {
    return getActiveViolations();
  }),

  resolveViolation: protectedProcedure
    .input(z.object({ violationId: z.string() }))
    .mutation(async ({ input }) => {
      return resolveViolation(input.violationId);
    }),

  generateSLAReport: protectedProcedure
    .input(z.object({ startDate: z.coerce.date(), endDate: z.coerce.date() }))
    .query(async ({ input }) => {
      return generateSLAReport(input.startDate, input.endDate);
    }),

  getSLACompliancePercentage: protectedProcedure.query(async () => {
    return getSLACompliancePercentage();
  }),

  generateSLARecommendations: protectedProcedure.query(async () => {
    return await generateSLARecommendations();
  }),

  // Multi-Region Failover
  createRegion: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        location: z.string(),
        isPrimary: z.boolean(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      return createRegion(input.id, input.name, input.location, input.isPrimary, input.isActive);
    }),

  getRegion: protectedProcedure
    .input(z.object({ regionId: z.string() }))
    .query(async ({ input }) => {
      return getRegion(input.regionId);
    }),

  getAllRegions: protectedProcedure.query(async () => {
    return getAllRegions();
  }),

  getPrimaryRegion: protectedProcedure.query(async () => {
    return getPrimaryRegion();
  }),

  getActiveRegions: protectedProcedure.query(async () => {
    return getActiveRegions();
  }),

  updateRegionHealth: protectedProcedure
    .input(z.object({ regionId: z.string(), healthStatus: z.enum(["healthy", "degraded", "unhealthy"]) }))
    .mutation(async ({ input }) => {
      return updateRegionHealth(input.regionId, input.healthStatus);
    }),

  updateRegionMetrics: protectedProcedure
    .input(
      z.object({
        regionId: z.string(),
        latency: z.number(),
        errorRate: z.number(),
        throughput: z.number(),
        cpuUsage: z.number(),
        memoryUsage: z.number(),
        diskUsage: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return updateRegionMetrics(input.regionId, input.latency, input.errorRate, input.throughput, input.cpuUsage, input.memoryUsage, input.diskUsage);
    }),

  triggerFailover: protectedProcedure
    .input(z.object({ fromRegionId: z.string(), reason: z.string(), description: z.string() }))
    .mutation(async ({ input }) => {
      return triggerFailover(input.fromRegionId, input.reason, input.description);
    }),

  getFailoverEvent: protectedProcedure
    .input(z.object({ failoverId: z.string() }))
    .query(async ({ input }) => {
      return getFailoverEvent(input.failoverId);
    }),

  getAllFailoverEvents: protectedProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ input }) => {
      return getAllFailoverEvents(input.limit);
    }),

  getRegionMetrics: protectedProcedure
    .input(z.object({ regionId: z.string(), limit: z.number().default(100) }))
    .query(async ({ input }) => {
      return getRegionMetrics(input.regionId, input.limit);
    }),

  getRegionMetricsStatistics: protectedProcedure
    .input(z.object({ regionId: z.string() }))
    .query(async ({ input }) => {
      return getRegionMetricsStatistics(input.regionId);
    }),

  getFailoverStatistics: protectedProcedure.query(async () => {
    return getFailoverStatistics();
  }),

  generateFailoverRecommendations: protectedProcedure.query(async () => {
    return await generateFailoverRecommendations();
  }),
});
