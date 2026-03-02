import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { WebhookService } from "../services/webhookService";
import { TRPCError } from "@trpc/server";

export const webhooksRouter = router({
  /**
   * Create a new webhook endpoint
   */
  create: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
        events: z.array(z.string()).min(1),
        retryCount: z.number().int().min(0).max(10).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const { id, secret } = await WebhookService.createWebhook(
        ctx.user.id,
        input.url,
        input.events,
        input.retryCount
      );

      return { id, secret, success: true };
    }),

  /**
   * Get all webhooks for the user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    return db.getActiveWebhooks(ctx.user.id);
  }),

  /**
   * Update a webhook
   */
  update: protectedProcedure
    .input(
      z.object({
        webhookId: z.number(),
        url: z.string().url().optional(),
        events: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
        retryCount: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      await WebhookService.updateWebhook(input.webhookId, {
        url: input.url,
        events: input.events,
        isActive: input.isActive,
        retryCount: input.retryCount,
      });

      return { success: true };
    }),

  /**
   * Delete a webhook
   */
  delete: protectedProcedure
    .input(z.object({ webhookId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      await WebhookService.deleteWebhook(input.webhookId);

      return { success: true };
    }),

  /**
   * Get webhook logs for debugging
   */
  getLogs: protectedProcedure
    .input(z.object({ webhookId: z.number(), limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      return WebhookService.getWebhookLogs(input.webhookId, input.limit);
    }),

  /**
   * Test a webhook by sending a test event
   */
  test: protectedProcedure
    .input(z.object({ webhookId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const webhooks = await db.getActiveWebhooks(ctx.user.id);
      const webhook = webhooks.find((w) => w.id === input.webhookId);

      if (!webhook) throw new TRPCError({ code: "NOT_FOUND" });

      // Send test event
      await WebhookService.triggerEvent(ctx.user.id, {
        type: "session.created",
        sessionId: 0,
        data: {
          test: true,
          timestamp: new Date().toISOString(),
        },
      });

      return { success: true, message: "Test event sent" };
    }),
});
