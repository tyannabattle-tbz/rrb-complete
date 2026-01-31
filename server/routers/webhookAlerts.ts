import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const webhookAlertsRouter = router({
  // Create webhook endpoint
  createWebhook: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
        events: z.array(
          z.enum([
            "token_threshold_50",
            "token_threshold_75",
            "token_threshold_90",
            "budget_exceeded",
            "session_completed",
          ])
        ),
        platform: z.enum(["slack", "discord", "custom"]),
        active: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const webhookId = Math.random().toString(36).substr(2, 9);
      return {
        success: true,
        webhookId,
        message: "Webhook created successfully",
        testUrl: input.url,
      };
    }),

  // Get webhooks
  getWebhooks: protectedProcedure.query(async ({ ctx }) => {
    return {
      webhooks: [
        {
          id: "webhook1",
          url: "https://hooks.slack.com/services/...",
          platform: "slack",
          events: ["token_threshold_75", "budget_exceeded"],
          active: true,
          createdAt: new Date(),
          lastTriggered: new Date(),
        },
      ],
    };
  }),

  // Test webhook
  testWebhook: protectedProcedure
    .input(z.object({ webhookId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Test webhook sent successfully",
        webhookId: input.webhookId,
      };
    }),

  // Update webhook
  updateWebhook: protectedProcedure
    .input(
      z.object({
        webhookId: z.string(),
        url: z.string().url().optional(),
        events: z.array(z.string()).optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Webhook updated",
        webhookId: input.webhookId,
      };
    }),

  // Delete webhook
  deleteWebhook: protectedProcedure
    .input(z.object({ webhookId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Webhook deleted",
        webhookId: input.webhookId,
      };
    }),

  // Get webhook logs
  getWebhookLogs: protectedProcedure
    .input(
      z.object({
        webhookId: z.string(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      return {
        logs: [
          {
            id: "log1",
            webhookId: input.webhookId,
            event: "token_threshold_75",
            status: "success",
            statusCode: 200,
            timestamp: new Date(),
            responseTime: 245,
          },
        ],
      };
    }),

  // Retry failed webhook
  retryWebhook: protectedProcedure
    .input(z.object({ logId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Webhook retry initiated",
        logId: input.logId,
      };
    }),
});
