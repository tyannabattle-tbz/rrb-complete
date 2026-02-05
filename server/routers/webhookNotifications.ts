import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import { webhookSubscriptions, webhookLogs } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Webhook notification types
 */
export type WebhookEventType =
  | "compliance.violation"
  | "policy.modified"
  | "policy.deployed"
  | "decision.critical"
  | "audit.alert"
  | "system.error"
  | "user.action"
  | "performance.alert";

/**
 * Webhook event payload
 */
export interface WebhookEvent {
  eventId: string;
  eventType: WebhookEventType;
  timestamp: number;
  userId: number;
  data: Record<string, any>;
  severity: "info" | "warning" | "error" | "critical";
}

/**
 * Webhook subscription types
 */
export type WebhookProvider = "slack" | "discord" | "email" | "webhook" | "pagerduty";

/**
 * Webhook notifications router
 */
export const webhookNotificationsRouter = router({
  /**
   * Subscribe to webhook events
   */
  subscribe: protectedProcedure
    .input(
      z.object({
        provider: z.enum(["slack", "discord", "email", "webhook", "pagerduty"]),
        webhookUrl: z.string().url(),
        eventTypes: z.array(
          z.enum([
            "compliance.violation",
            "policy.modified",
            "policy.deployed",
            "decision.critical",
            "audit.alert",
            "system.error",
            "user.action",
            "performance.alert",
          ])
        ),
        enabled: z.boolean().default(true),
        retryPolicy: z
          .object({
            maxRetries: z.number().min(0).max(10).default(3),
            backoffMultiplier: z.number().min(1).max(10).default(2),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const decisionId = `decision-${Date.now()}-${Math.random()}`;

      try {
        const subscription = await db.insert(webhookSubscriptions).values({
          userId: ctx.user.id,
          provider: input.provider,
          webhookUrl: input.webhookUrl,
          eventTypes: JSON.stringify(input.eventTypes),
          enabled: input.enabled,
          retryPolicy: JSON.stringify(input.retryPolicy || {}),
          createdAt: new Date(),
        });

        console.log(`[Webhook] User ${ctx.user.id} subscribed to ${input.provider} notifications`);
        console.log(`[QUMUS] Decision ID: ${decisionId}, Policy: webhook-subscription, Action: subscribe`);

        return {
          success: true,
          subscriptionId: subscription[0],
          decisionId,
        };
      } catch (error) {
        console.error("[Webhook] Subscription error:", error);
        throw error;
      }
    }),

  /**
   * Get user's webhook subscriptions
   */
  getSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    try {
      const subscriptions = await db
        .select()
        .from(webhookSubscriptions)
        .where(eq(webhookSubscriptions.userId, ctx.user.id));

      return subscriptions.map((sub) => ({
        ...sub,
        eventTypes: JSON.parse(sub.eventTypes || "[]"),
        retryPolicy: JSON.parse(sub.retryPolicy || "{}"),
      }));
    } catch (error) {
      console.error("[Webhook] Error fetching subscriptions:", error);
      throw error;
    }
  }),

  /**
   * Update webhook subscription
   */
  updateSubscription: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.number(),
        enabled: z.boolean().optional(),
        eventTypes: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const decisionId = `decision-${Date.now()}-${Math.random()}`;

      try {
        await db
          .update(webhookSubscriptions)
          .set({
            enabled: input.enabled,
            eventTypes: input.eventTypes ? JSON.stringify(input.eventTypes) : undefined,
          })
          .where(
            and(
              eq(webhookSubscriptions.id, input.subscriptionId),
              eq(webhookSubscriptions.userId, ctx.user.id)
            )
          );

        console.log(`[Webhook] User ${ctx.user.id} updated subscription ${input.subscriptionId}`);
        console.log(`[QUMUS] Decision ID: ${decisionId}, Policy: webhook-subscription, Action: update`);

        return { success: true, decisionId };
      } catch (error) {
        console.error("[Webhook] Update error:", error);
        throw error;
      }
    }),

  /**
   * Delete webhook subscription
   */
  deleteSubscription: protectedProcedure
    .input(z.object({ subscriptionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const decisionId = `decision-${Date.now()}-${Math.random()}`;

      try {
        await db
          .delete(webhookSubscriptions)
          .where(
            and(
              eq(webhookSubscriptions.id, input.subscriptionId),
              eq(webhookSubscriptions.userId, ctx.user.id)
            )
          );

        console.log(`[Webhook] User ${ctx.user.id} deleted subscription ${input.subscriptionId}`);
        console.log(`[QUMUS] Decision ID: ${decisionId}, Policy: webhook-subscription, Action: delete`);

        return { success: true, decisionId };
      } catch (error) {
        console.error("[Webhook] Delete error:", error);
        throw error;
      }
    }),

  /**
   * Get webhook delivery logs
   */
  getDeliveryLogs: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.number(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const logs = await db
          .select()
          .from(webhookLogs)
          .where(eq(webhookLogs.subscriptionId, input.subscriptionId))
          .orderBy((table) => table.createdAt)
          .limit(input.limit)
          .offset(input.offset);

        return logs;
      } catch (error) {
        console.error("[Webhook] Error fetching logs:", error);
        throw error;
      }
    }),

  /**
   * Test webhook delivery
   */
  testWebhook: protectedProcedure
    .input(z.object({ subscriptionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const decisionId = `decision-${Date.now()}-${Math.random()}`;

      try {
        const subscription = await db
          .select()
          .from(webhookSubscriptions)
          .where(
            and(
              eq(webhookSubscriptions.id, input.subscriptionId),
              eq(webhookSubscriptions.userId, ctx.user.id)
            )
          );

        if (subscription.length === 0) {
          throw new Error("Subscription not found");
        }

        const testEvent: WebhookEvent = {
          eventId: `test-${Date.now()}`,
          eventType: "system.error",
          timestamp: Date.now(),
          userId: ctx.user.id,
          data: { message: "Test webhook delivery" },
          severity: "info",
        };

        // Send test webhook
        const response = await fetch(subscription[0].webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testEvent),
        });

        const success = response.ok;

        // Log delivery attempt
        await db.insert(webhookLogs).values({
          subscriptionId: input.subscriptionId,
          eventType: "system.error",
          statusCode: response.status,
          success,
          errorMessage: success ? null : `HTTP ${response.status}`,
          createdAt: new Date(),
        });

        console.log(`[Webhook] Test delivery to subscription ${input.subscriptionId}: ${success ? "SUCCESS" : "FAILED"}`);
        console.log(`[QUMUS] Decision ID: ${decisionId}, Policy: webhook-testing, Action: test`);

        return { success, statusCode: response.status, decisionId };
      } catch (error) {
        console.error("[Webhook] Test error:", error);
        throw error;
      }
    }),

  /**
   * Send webhook notification (internal use)
   */
  sendNotification: protectedProcedure
    .input(
      z.object({
        eventType: z.string(),
        severity: z.enum(["info", "warning", "error", "critical"]),
        data: z.record(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const decisionId = `decision-${Date.now()}-${Math.random()}`;

      try {
        const event: WebhookEvent = {
          eventId: `event-${Date.now()}-${Math.random()}`,
          eventType: input.eventType as WebhookEventType,
          timestamp: Date.now(),
          userId: ctx.user.id,
          data: input.data,
          severity: input.severity,
        };

        // Get all active subscriptions for this event type
        const subscriptions = await db
          .select()
          .from(webhookSubscriptions)
          .where(eq(webhookSubscriptions.enabled, true));

        let deliveredCount = 0;

        for (const subscription of subscriptions) {
          const eventTypes = JSON.parse(subscription.eventTypes || "[]");
          if (!eventTypes.includes(input.eventType)) continue;

          try {
            const response = await fetch(subscription.webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(event),
            });

            await db.insert(webhookLogs).values({
              subscriptionId: subscription.id,
              eventType: input.eventType,
              statusCode: response.status,
              success: response.ok,
              errorMessage: response.ok ? null : `HTTP ${response.status}`,
              createdAt: new Date(),
            });

            if (response.ok) {
              deliveredCount++;
            }
          } catch (error) {
            console.error(`[Webhook] Delivery failed for subscription ${subscription.id}:`, error);
          }
        }

        console.log(`[Webhook] Notification sent to ${deliveredCount} subscriptions`);
        console.log(`[QUMUS] Decision ID: ${decisionId}, Policy: webhook-notification, Action: send`);

        return { success: true, deliveredCount, decisionId };
      } catch (error) {
        console.error("[Webhook] Send notification error:", error);
        throw error;
      }
    }),
});
