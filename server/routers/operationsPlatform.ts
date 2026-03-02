import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  createPlaybook,
  getPlaybook,
  getAllPlaybooks,
  updatePlaybook,
  deletePlaybook,
  executePlaybook,
  getIncidentResponses,
  getIncidentResponse,
  getIncidentStatistics,
  suggestPlaybooks,
  exportPlaybooks,
  importPlaybooks,
} from "../services/incidentResponseService";
import {
  recordResourceUsage,
  getResourceUsages,
  analyzeCosts,
  getRecommendation,
  getAllRecommendations,
  implementRecommendation,
  getCostTrends,
  predictFutureCosts,
  getCostStatistics,
  generateCostOptimizationPlan,
  exportCostAnalysis,
} from "../services/costOptimizationService";

export const operationsPlatformRouter = router({
  // Incident Response Automation
  createPlaybook: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        triggers: z.array(
          z.object({
            type: z.enum(["metric_threshold", "error_rate", "latency", "resource_usage", "deployment_failure"]),
            metric: z.string(),
            operator: z.enum(["greater_than", "less_than"]),
            threshold: z.number(),
            duration: z.number(),
          })
        ),
        actions: z.array(
          z.object({
            type: z.enum(["scale_resources", "restart_service", "trigger_alert", "rollback_deployment", "notify_team", "create_ticket"]),
            target: z.string(),
            parameters: z.record(z.string(), z.unknown()).optional(),
            delay: z.number().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      return createPlaybook(input.name, input.description, input.triggers, input.actions);
    }),

  getPlaybook: protectedProcedure
    .input(z.object({ playbookId: z.string() }))
    .query(async ({ input }) => {
      return getPlaybook(input.playbookId);
    }),

  getAllPlaybooks: protectedProcedure.query(async () => {
    return getAllPlaybooks();
  }),

  updatePlaybook: protectedProcedure
    .input(
      z.object({
        playbookId: z.string(),
        updates: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          enabled: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return updatePlaybook(input.playbookId, input.updates);
    }),

  deletePlaybook: protectedProcedure
    .input(z.object({ playbookId: z.string() }))
    .mutation(async ({ input }) => {
      return deletePlaybook(input.playbookId);
    }),

  executePlaybook: protectedProcedure
    .input(z.object({ playbookId: z.string(), triggerData: z.record(z.string(), z.unknown()).optional() }))
    .mutation(async ({ input }) => {
      return await executePlaybook(input.playbookId, input.triggerData || {});
    }),

  getIncidentResponses: protectedProcedure
    .input(z.object({ playbookId: z.string().optional(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return getIncidentResponses(input.playbookId, input.limit);
    }),

  getIncidentResponse: protectedProcedure
    .input(z.object({ incidentId: z.string() }))
    .query(async ({ input }) => {
      return getIncidentResponse(input.incidentId);
    }),

  getIncidentStatistics: protectedProcedure.query(async () => {
    return getIncidentStatistics();
  }),

  suggestPlaybooks: protectedProcedure
    .input(z.object({ metrics: z.array(z.string()) }))
    .query(async ({ input }) => {
      return await suggestPlaybooks(input.metrics);
    }),

  exportPlaybooks: protectedProcedure
    .input(z.object({ format: z.enum(["json", "yaml"]).default("json") }))
    .query(async ({ input }) => {
      return exportPlaybooks(input.format);
    }),

  importPlaybooks: protectedProcedure
    .input(z.object({ data: z.string(), format: z.enum(["json", "yaml"]).default("json") }))
    .mutation(async ({ input }) => {
      return importPlaybooks(input.data, (input.format as "json" | "yaml") || "json");
    }),

  // Cost Optimization
  recordResourceUsage: protectedProcedure
    .input(
      z.object({
        resourceId: z.string(),
        type: z.enum(["compute", "storage", "network", "database"]),
        name: z.string(),
        currentUsage: z.number(),
        maxCapacity: z.number(),
        costPerHour: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return recordResourceUsage(input.resourceId, input.type, input.name, input.currentUsage, input.maxCapacity, input.costPerHour);
    }),

  getResourceUsages: protectedProcedure.query(async () => {
    return getResourceUsages();
  }),

  analyzeCosts: protectedProcedure.query(async () => {
    return analyzeCosts();
  }),

  getRecommendation: protectedProcedure
    .input(z.object({ recommendationId: z.string() }))
    .query(async ({ input }) => {
      return getRecommendation(input.recommendationId);
    }),

  getAllRecommendations: protectedProcedure.query(async () => {
    return getAllRecommendations();
  }),

  implementRecommendation: protectedProcedure
    .input(z.object({ recommendationId: z.string() }))
    .mutation(async ({ input }) => {
      return implementRecommendation(input.recommendationId);
    }),

  getCostTrends: protectedProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ input }) => {
      return getCostTrends(input.days);
    }),

  predictFutureCosts: protectedProcedure
    .input(z.object({ months: z.number().default(12) }))
    .query(async ({ input }) => {
      return predictFutureCosts(input.months);
    }),

  getCostStatistics: protectedProcedure.query(async () => {
    return getCostStatistics();
  }),

  generateCostOptimizationPlan: protectedProcedure.query(async () => {
    return await generateCostOptimizationPlan();
  }),

  exportCostAnalysis: protectedProcedure
    .input(z.object({ format: z.enum(["json", "csv"]).default("json") }))
    .query(async ({ input }) => {
      return exportCostAnalysis(input.format);
    }),
});
