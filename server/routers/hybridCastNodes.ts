import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as nodesDb from "../db/nodes";
import { TRPCError } from "@trpc/server";

export const hybridCastNodesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await nodesDb.listNodes(ctx.user.id);
  }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const node = await nodesDb.getNode(input.id, ctx.user.id);
      if (!node) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return node;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        region: z.string().min(1),
        status: z.enum(["ready", "broadcasting", "offline"]).optional(),
        coverage: z.number().optional(),
        endpoint: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input: data }) => {
      return await nodesDb.createNode(ctx.user.id, data);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        region: z.string().optional(),
        status: z.enum(["ready", "broadcasting", "offline"]).optional(),
        coverage: z.number().optional(),
        endpoint: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input: inputData }) => {
      const { id, ...data } = inputData;
      return await nodesDb.updateNode(id, ctx.user.id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await nodesDb.deleteNode(input.id, ctx.user.id);
    }),

  getReady: protectedProcedure.query(async ({ ctx }) => {
    return await nodesDb.getReadyNodes(ctx.user.id);
  }),

  getBroadcasting: protectedProcedure.query(async ({ ctx }) => {
    return await nodesDb.getBroadcastingNodes(ctx.user.id);
  }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["ready", "broadcasting", "offline"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await nodesDb.updateNodeStatus(input.id, ctx.user.id, input.status);
    }),

  getTotalCoverage: protectedProcedure.query(async ({ ctx }) => {
    return await nodesDb.getTotalCoverage(ctx.user.id);
  }),

  healthCheck: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const node = await nodesDb.getNode(input.id, ctx.user.id);
      if (!node) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Simulate health check - in production, would call actual endpoint
      const isHealthy = Math.random() > 0.05; // 95% success rate
      const status = isHealthy ? "ready" : "offline";

      await nodesDb.updateNodeStatus(input.id, ctx.user.id, status);

      return {
        id: input.id,
        healthy: isHealthy,
        status,
        timestamp: new Date(),
      };
    }),
});
