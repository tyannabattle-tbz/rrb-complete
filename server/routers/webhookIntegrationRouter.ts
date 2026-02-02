import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// In-memory webhook store
const webhooks: Array<{
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdBy: number;
  createdAt: Date;
  lastTriggered?: Date;
  failureCount: number;
}> = [];

// In-memory webhook logs
const webhookLogs: Array<{
  id: string;
  webhookId: string;
  event: string;
  payload: Record<string, any>;
  status: "success" | "failed";
  statusCode?: number;
  errorMessage?: string;
  timestamp: Date;
}> = [];

export const webhookIntegrationRouter = router({
  // Create webhook
  createWebhook: adminProcedure
    .input(
      z.object({
        name: z.string(),
        url: z.string().url(),
        events: z.array(z.string()),
      })
    )
    .mutation(({ input, ctx }) => {
      const webhook = {
        id: `webhook-${Date.now()}`,
        ...input,
        isActive: true,
        createdBy: ctx.user.id as any,
        createdAt: new Date(),
        failureCount: 0,
      };

      webhooks.push(webhook);
      return webhook;
    }),

  // List webhooks
  listWebhooks: protectedProcedure.query(() => {
    return webhooks;
  }),

  // Get webhook details
  getWebhook: protectedProcedure
    .input(z.object({ webhookId: z.string() }))
    .query(({ input }) => {
      const webhook = webhooks.find((w) => w.id === input.webhookId);
      if (!webhook) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return webhook;
    }),

  // Update webhook
  updateWebhook: adminProcedure
    .input(
      z.object({
        webhookId: z.string(),
        name: z.string().optional(),
        url: z.string().url().optional(),
        events: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(({ input }) => {
      const webhook = webhooks.find((w) => w.id === input.webhookId);
      if (!webhook) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (input.name) webhook.name = input.name;
      if (input.url) webhook.url = input.url;
      if (input.events) webhook.events = input.events;
      if (input.isActive !== undefined) webhook.isActive = input.isActive;

      return webhook;
    }),

  // Delete webhook
  deleteWebhook: adminProcedure
    .input(z.object({ webhookId: z.string() }))
    .mutation(({ input }) => {
      const index = webhooks.findIndex((w) => w.id === input.webhookId);
      if (index === -1) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      webhooks.splice(index, 1);
      return { success: true };
    }),

  // Trigger webhook event
  triggerWebhookEvent: adminProcedure
    .input(
      z.object({
        event: z.string(),
        payload: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input }) => {
      const triggeredWebhooks = webhooks.filter(
        (w) => w.isActive && w.events.includes(input.event)
      );

      const results = [];

      for (const webhook of triggeredWebhooks) {
        try {
          // Simulate webhook call
          const response = await fetch(webhook.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Webhook-Event": input.event,
              "X-Webhook-ID": webhook.id,
            },
            body: JSON.stringify({
              event: input.event,
              timestamp: new Date().toISOString(),
              data: input.payload,
            }),
          }).catch(() => ({
            ok: false,
            status: 0,
            statusText: "Network error",
          }));

          const logEntry = {
            id: `log-${Date.now()}-${Math.random()}`,
            webhookId: webhook.id,
            event: input.event,
            payload: input.payload,
            status: response.ok ? ("success" as const) : ("failed" as const),
            statusCode: response.status,
            timestamp: new Date(),
          };

          webhookLogs.push(logEntry);

          if (response.ok) {
            webhook.failureCount = 0;
            webhook.lastTriggered = new Date();
          } else {
            webhook.failureCount++;
          }

          results.push({
            webhookId: webhook.id,
            success: response.ok,
            statusCode: response.status,
          });
        } catch (error) {
          webhook.failureCount++;

          const logEntry = {
            id: `log-${Date.now()}-${Math.random()}`,
            webhookId: webhook.id,
            event: input.event,
            payload: input.payload,
            status: "failed" as const,
            errorMessage: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date(),
          };

          webhookLogs.push(logEntry);

          results.push({
            webhookId: webhook.id,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return {
        triggeredCount: triggeredWebhooks.length,
        results,
      };
    }),

  // Get webhook logs
  getWebhookLogs: protectedProcedure
    .input(
      z.object({
        webhookId: z.string().optional(),
        event: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .query(({ input }) => {
      let filtered = webhookLogs;

      if (input.webhookId) {
        filtered = filtered.filter((l) => l.webhookId === input.webhookId);
      }

      if (input.event) {
        filtered = filtered.filter((l) => l.event === input.event);
      }

      return filtered.slice(0, input.limit).reverse();
    }),

  // Get webhook statistics
  getWebhookStats: protectedProcedure.query(() => {
    const totalWebhooks = webhooks.length;
    const activeWebhooks = webhooks.filter((w) => w.isActive).length;
    const totalEvents = webhookLogs.length;
    const successfulEvents = webhookLogs.filter((l) => l.status === "success").length;
    const failedEvents = webhookLogs.filter((l) => l.status === "failed").length;

    const eventBreakdown: Record<string, number> = {};
    webhookLogs.forEach((log) => {
      eventBreakdown[log.event] = (eventBreakdown[log.event] || 0) + 1;
    });

    return {
      totalWebhooks,
      activeWebhooks,
      inactiveWebhooks: totalWebhooks - activeWebhooks,
      totalEvents,
      successfulEvents,
      failedEvents,
      successRate: totalEvents > 0 ? (successfulEvents / totalEvents) * 100 : 0,
      eventBreakdown,
    };
  }),

  // Test webhook
  testWebhook: adminProcedure
    .input(z.object({ webhookId: z.string() }))
    .mutation(async ({ input }) => {
      const webhook = webhooks.find((w) => w.id === input.webhookId);
      if (!webhook) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      try {
        const response = await fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Event": "test",
            "X-Webhook-ID": webhook.id,
          },
          body: JSON.stringify({
            event: "test",
            timestamp: new Date().toISOString(),
            data: { message: "This is a test webhook" },
          }),
        }).catch(() => ({
          ok: false,
          status: 0,
          statusText: "Network error",
        }));

        return {
          success: response.ok,
          statusCode: response.status,
          statusText: response.statusText,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Webhook test failed",
        });
      }
    }),

  // Clear webhook logs
  clearWebhookLogs: adminProcedure
    .input(z.object({ webhookId: z.string().optional() }))
    .mutation(({ input }) => {
      if (input.webhookId) {
        const index = webhookLogs.findIndex((l) => l.webhookId === input.webhookId);
        if (index > -1) {
          webhookLogs.splice(index, 1);
        }
      } else {
        webhookLogs.length = 0;
      }

      return { success: true };
    }),

  // Get available events
  getAvailableEvents: protectedProcedure.query(({ ctx }) => {
    return [
      "job.created",
      "job.started",
      "job.completed",
      "job.failed",
      "job.cancelled",
      "storyboard.created",
      "storyboard.completed",
      "storyboard.failed",
      "voice.command.executed",
      "voice.command.failed",
      "system.alert",
      "system.error",
      "notification.sent",
    ];
  }),
});
