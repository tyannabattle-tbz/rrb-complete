import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  deployToGreenEnvironment,
  runHealthChecks,
  switchTraffic,
  rollbackDeployment,
  getDeploymentStatus,
  generateDeploymentRecommendations,
  monitorDeploymentHealth,
} from "../services/blueGreenDeploymentService";
import {
  recordMetricDataPoint,
  analyzeTrend,
  detectSeasonalPatterns,
  predictFutureMetrics,
  generateTrendInsights,
  compareMetricsTrends,
  getMetricHistory,
  exportTrendData,
} from "../services/trendAnalysisService";
import {
  createAlertRule,
  updateAlertRule,
  deleteAlertRule,
  getAlertRule,
  getAllAlertRules,
  evaluateAlertRule,
  getAlertEvents,
  acknowledgeAlert,
  resolveAlert,
  getAlertStatistics,
  suggestAlertRules,
  exportAlertRules,
  importAlertRules,
} from "../services/customAlertRulesEngine";

export const productionInfrastructureRouter = router({
  // Blue-Green Deployment
  deployToGreen: protectedProcedure
    .input(z.object({ version: z.string() }))
    .mutation(async ({ input }) => {
      return await deployToGreenEnvironment(input.version);
    }),

  runHealthChecks: protectedProcedure
    .input(z.object({ environment: z.enum(["blue", "green"]) }))
    .query(async ({ input }) => {
      return await runHealthChecks(input.environment);
    }),

  switchTraffic: protectedProcedure
    .input(z.object({ fromEnv: z.enum(["blue", "green"]), toEnv: z.enum(["blue", "green"]) }))
    .mutation(async ({ input }) => {
      return await switchTraffic(input.fromEnv, input.toEnv);
    }),

  rollback: protectedProcedure
    .input(z.object({ reason: z.string() }))
    .mutation(async ({ input }) => {
      return await rollbackDeployment(input.reason);
    }),

  getDeploymentStatus: protectedProcedure.query(async () => {
    return await getDeploymentStatus();
  }),

  getDeploymentRecommendations: protectedProcedure.query(async () => {
    const status = await getDeploymentStatus();
    return await generateDeploymentRecommendations(status.activeEnvironment, status.inactiveEnvironment);
  }),

  // Trend Analysis
  recordMetric: protectedProcedure
    .input(z.object({ testId: z.string(), value: z.number() }))
    .mutation(async ({ input }) => {
      recordMetricDataPoint(input.testId, input.value);
      return { success: true };
    }),

  analyzeTrend: protectedProcedure
    .input(z.object({ testId: z.string(), timeRangeHours: z.number().default(24) }))
    .query(async ({ input }) => {
      return analyzeTrend(input.testId, input.timeRangeHours);
    }),

  detectSeasonalPatterns: protectedProcedure
    .input(z.object({ testId: z.string() }))
    .query(async ({ input }) => {
      return detectSeasonalPatterns(input.testId);
    }),

  predictFutureMetrics: protectedProcedure
    .input(z.object({ testId: z.string(), hoursAhead: z.number().default(24) }))
    .query(async ({ input }) => {
      return predictFutureMetrics(input.testId, input.hoursAhead);
    }),

  generateTrendInsights: protectedProcedure
    .input(z.object({ testId: z.string() }))
    .query(async ({ input }) => {
      return await generateTrendInsights(input.testId);
    }),

  compareMetricsTrends: protectedProcedure
    .input(z.object({ testId1: z.string(), testId2: z.string() }))
    .query(async ({ input }) => {
      return compareMetricsTrends(input.testId1, input.testId2);
    }),

  getMetricHistory: protectedProcedure
    .input(z.object({ testId: z.string(), limit: z.number().default(100) }))
    .query(async ({ input }) => {
      return getMetricHistory(input.testId, input.limit);
    }),

  exportTrendData: protectedProcedure
    .input(z.object({ testId: z.string(), format: z.enum(["json", "csv"]).default("json") }))
    .query(async ({ input }) => {
      return exportTrendData(input.testId, input.format);
    }),

  // Custom Alert Rules
  createAlertRule: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        condition: z.object({
          metric: z.string(),
          operator: z.enum(["greater_than", "less_than", "equals", "not_equals", "between"]),
          threshold: z.number(),
          secondThreshold: z.number().optional(),
          duration: z.number(),
          aggregation: z.enum(["average", "max", "min", "sum"]),
        }),
        actions: z.array(
          z.object({
            type: z.enum(["slack", "email", "webhook", "ticket", "notification"]),
            target: z.string(),
            template: z.string().optional(),
            escalation: z.boolean().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      return createAlertRule(input.name, input.description, input.condition, input.actions);
    }),

  updateAlertRule: protectedProcedure
    .input(
      z.object({
        ruleId: z.string(),
        updates: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          enabled: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return updateAlertRule(input.ruleId, input.updates);
    }),

  deleteAlertRule: protectedProcedure
    .input(z.object({ ruleId: z.string() }))
    .mutation(async ({ input }) => {
      return deleteAlertRule(input.ruleId);
    }),

  getAlertRule: protectedProcedure
    .input(z.object({ ruleId: z.string() }))
    .query(async ({ input }) => {
      return getAlertRule(input.ruleId);
    }),

  getAllAlertRules: protectedProcedure.query(async () => {
    return getAllAlertRules();
  }),

  evaluateAlertRule: protectedProcedure
    .input(z.object({ ruleId: z.string(), metricValue: z.number() }))
    .mutation(async ({ input }) => {
      const rule = getAlertRule(input.ruleId);
      if (!rule) return null;
      return evaluateAlertRule(rule, input.metricValue);
    }),

  getAlertEvents: protectedProcedure
    .input(
      z.object({
        ruleId: z.string().optional(),
        status: z.enum(["triggered", "resolved", "acknowledged"]).optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      return getAlertEvents(input.ruleId, input.status, input.limit);
    }),

  acknowledgeAlert: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ input }) => {
      return acknowledgeAlert(input.eventId);
    }),

  resolveAlert: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ input }) => {
      return resolveAlert(input.eventId);
    }),

  getAlertStatistics: protectedProcedure.query(async () => {
    return getAlertStatistics();
  }),

  suggestAlertRules: protectedProcedure
    .input(z.object({ metrics: z.array(z.string()) }))
    .query(async ({ input }) => {
      return await suggestAlertRules(input.metrics);
    }),

  exportAlertRules: protectedProcedure
    .input(z.object({ format: z.enum(["json", "yaml"]).default("json") }))
    .query(async ({ input }) => {
      return exportAlertRules(input.format);
    }),

  importAlertRules: protectedProcedure
    .input(z.object({ data: z.string(), format: z.enum(["json", "yaml"]).default("json") }))
    .mutation(async ({ input }) => {
      return importAlertRules(input.data, input.format);
    }),
});
