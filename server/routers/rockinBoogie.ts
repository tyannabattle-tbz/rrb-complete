import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as contentDb from "../db/content";
import { TRPCError } from "@trpc/server";

export const rockinBoogieRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await contentDb.listContent(ctx.user.id);
  }),

  get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
    const content = await contentDb.getContent(input.id, ctx.user.id);
    if (!content) {
      throw new Error("Content not found");
    }
    return content;
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        type: z.enum(["radio", "podcast", "audiobook"]),
        description: z.string().optional(),
        status: z.enum(["active", "scheduled", "archived"]).optional(),
        listeners: z.number().optional(),
        duration: z.string().optional(),
        schedule: z.string().optional(),
        rating: z.number().optional(),
        contentUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input: data }) => {
      return await contentDb.createContent(ctx.user.id, data);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["active", "scheduled", "archived"]).optional(),
        listeners: z.number().optional(),
        duration: z.string().optional(),
        schedule: z.string().optional(),
        rating: z.number().optional(),
        contentUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input: inputData }) => {
      const { id, ...data } = inputData;
      return await contentDb.updateContent(id, ctx.user.id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await contentDb.deleteContent(input.id, ctx.user.id);
    }),

  getMetrics: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return await contentDb.getContentMetrics(input.id, ctx.user.id);
    }),

  recordListenerUpdate: protectedProcedure
    .input(
      z.object({
        contentId: z.number(),
        listenerCount: z.number(),
        engagementScore: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await contentDb.recordListenerUpdate(
        input.contentId,
        input.listenerCount,
        input.engagementScore
      );
    }),

  getActive: protectedProcedure.query(async ({ ctx }) => {
    return await contentDb.getActiveContent(ctx.user.id);
  }),

  getTotalListeners: protectedProcedure.query(async ({ ctx }) => {
    return await contentDb.getTotalListeners(ctx.user.id);
  }),
});
