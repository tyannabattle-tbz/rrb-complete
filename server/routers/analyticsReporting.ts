import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as analyticsDb from "../db/analytics";
import { TRPCError } from "@trpc/server";

export const analyticsReportingRouter = router({
  listMetrics: protectedProcedure.query(async ({ ctx }) => {
    return await analyticsDb.listMetrics(ctx.user.id);
  }),

  getMetrics: protectedProcedure
    .input(z.object({ period: z.string() }))
    .query(async ({ ctx, input }) => {
      const metrics = await analyticsDb.getMetrics(input.period, ctx.user.id);
      if (!metrics) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return metrics;
    }),

  createMetrics: protectedProcedure
    .input(
      z.object({
        period: z.string(),
        qumusDecisions: z.number().optional(),
        hybridCastBroadcasts: z.number().optional(),
        rockinBoogieListeners: z.number().optional(),
        avgEngagement: z.number().optional(),
        systemUptime: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input: data }) => {
      return await analyticsDb.createMetrics(ctx.user.id, data);
    }),

  updateMetrics: protectedProcedure
    .input(
      z.object({
        period: z.string(),
        qumusDecisions: z.number().optional(),
        hybridCastBroadcasts: z.number().optional(),
        rockinBoogieListeners: z.number().optional(),
        avgEngagement: z.number().optional(),
        systemUptime: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input: inputData }) => {
      const { period, ...data } = inputData;
      return await analyticsDb.updateMetrics(period, ctx.user.id, data);
    }),

  listPolicyDecisions: protectedProcedure.query(async ({ ctx }) => {
    return await analyticsDb.listPolicyDecisions(ctx.user.id);
  }),

  getPolicyDecision: protectedProcedure
    .input(z.object({ policy: z.string() }))
    .query(async ({ ctx, input }) => {
      const decision = await analyticsDb.getPolicyDecision(
        input.policy,
        ctx.user.id
      );
      if (!decision) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return decision;
    }),

  createPolicyDecision: protectedProcedure
    .input(
      z.object({
        policy: z.string(),
        count: z.number().optional(),
        avgTime: z.number().optional(),
        successRate: z.number().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input: data }) => {
      return await analyticsDb.createPolicyDecision(ctx.user.id, data);
    }),

  updatePolicyDecision: protectedProcedure
    .input(
      z.object({
        policy: z.string(),
        count: z.number().optional(),
        avgTime: z.number().optional(),
        successRate: z.number().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input: inputData }) => {
      const { policy, ...data } = inputData;
      return await analyticsDb.updatePolicyDecision(policy, ctx.user.id, data);
    }),

  getAggregateMetrics: protectedProcedure.query(async ({ ctx }) => {
    return await analyticsDb.getAggregateMetrics(ctx.user.id);
  }),

  exportReport: protectedProcedure
    .input(
      z.object({
        format: z.enum(["json", "csv"]),
        period: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const metrics = await analyticsDb.listMetrics(ctx.user.id);
      const policies = await analyticsDb.listPolicyDecisions(ctx.user.id);

      if (input.format === "json") {
        return {
          format: "json",
          data: {
            metrics,
            policies,
            timestamp: new Date(),
          },
        };
      } else {
        // CSV format
        const csvMetrics = metrics
          .map(
            (m: any) =>
              `${m.period},${m.qumusDecisions},${m.hybridCastBroadcasts},${m.rockinBoogieListeners},${m.avgEngagement},${m.systemUptime}`
          )
          .join("\n");

        const csvPolicies = policies
          .map(
            (p: any) =>
              `${p.policy},${p.count},${p.avgTime},${p.successRate}`
          )
          .join("\n");

        return {
          format: "csv",
          data: {
            metrics: `period,qumusDecisions,hybridCastBroadcasts,rockinBoogieListeners,avgEngagement,systemUptime\n${csvMetrics}`,
            policies: `policy,count,avgTime,successRate\n${csvPolicies}`,
            timestamp: new Date(),
          },
        };
      }
    }),
});
