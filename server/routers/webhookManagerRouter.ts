import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { webhookEndpoints, webhookLogs } from "../../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";

// ── Webhook Manager Router ──
// Manages webhook endpoints for team notifications (Slack, Discord, custom)
// Auto-dispatches update payloads to all active endpoints

export const webhookManagerRouter = router({
  // ── List all webhook endpoints ──
  list: protectedProcedure.query(async () => {
    const db = await getDb();
    const endpoints = await db.select().from(webhookEndpoints).orderBy(desc(webhookEndpoints.createdAt));
    return endpoints;
  }),

  // ── Add a new webhook endpoint ──
  add: protectedProcedure
    .input(z.object({
      url: z.string().url(),
      events: z.string().default("all"),
      secret: z.string().optional(),
      platform: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const secret = input.secret || `whsec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      
      await db.insert(webhookEndpoints).values({
        userId: 1, // System-level webhook
        url: input.url,
        events: input.events,
        secret: secret,
        isActive: 1,
        retryCount: 3,
      });

      return { success: true, message: `Webhook endpoint added: ${input.url}` };
    }),

  // ── Remove a webhook endpoint ──
  remove: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.delete(webhookEndpoints).where(eq(webhookEndpoints.id, input.id));
      return { success: true };
    }),

  // ── Toggle webhook active status ──
  toggle: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const [endpoint] = await db.select().from(webhookEndpoints).where(eq(webhookEndpoints.id, input.id));
      if (!endpoint) throw new Error("Webhook not found");
      
      await db.update(webhookEndpoints)
        .set({ isActive: endpoint.isActive ? 0 : 1 })
        .where(eq(webhookEndpoints.id, input.id));
      
      return { success: true, isActive: !endpoint.isActive };
    }),

  // ── Test a webhook endpoint ──
  test: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const [endpoint] = await db.select().from(webhookEndpoints).where(eq(webhookEndpoints.id, input.id));
      if (!endpoint) throw new Error("Webhook not found");

      const testPayload = {
        event: "test",
        source: "QUMUS Ecosystem",
        timestamp: new Date().toISOString(),
        data: {
          message: "This is a test webhook from the QUMUS Ecosystem — Canryn Production",
          version: "3.0.0",
          system: "RRB Team Update Delivery System",
        },
      };

      try {
        const response = await fetch(endpoint.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Secret": endpoint.secret,
            "X-Webhook-Source": "QUMUS-Ecosystem",
          },
          body: JSON.stringify(testPayload),
          signal: AbortSignal.timeout(10000),
        });

        await db.update(webhookEndpoints)
          .set({ lastTriggered: sql`NOW()` })
          .where(eq(webhookEndpoints.id, input.id));

        // Log the test
        await db.insert(webhookLogs).values({
          webhookId: endpoint.id,
          eventType: "test",
          payload: JSON.stringify(testPayload),
          statusCode: response.status,
          response: await response.text().catch(() => ""),
          retryCount: 0,
        });

        return { 
          success: response.ok, 
          statusCode: response.status,
          message: response.ok ? "Test webhook delivered successfully" : `Failed with status ${response.status}`,
        };
      } catch (error: any) {
        // Log the failure
        await db.insert(webhookLogs).values({
          webhookId: endpoint.id,
          eventType: "test",
          payload: JSON.stringify(testPayload),
          error: error.message,
          retryCount: 0,
        });

        await db.update(webhookEndpoints)
          .set({ failureCount: sql`failure_count + 1` })
          .where(eq(webhookEndpoints.id, input.id));

        return { success: false, message: `Webhook test failed: ${error.message}` };
      }
    }),

  // ── Dispatch update to all active webhooks ──
  dispatchUpdate: protectedProcedure
    .input(z.object({
      event: z.string(),
      title: z.string(),
      version: z.string().optional(),
      changelog: z.string().optional(),
      severity: z.string().optional(),
      affectedSystems: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const activeEndpoints = await db.select().from(webhookEndpoints)
        .where(eq(webhookEndpoints.isActive, 1));

      const payload = {
        event: input.event,
        source: "QUMUS Ecosystem — Canryn Production",
        timestamp: new Date().toISOString(),
        data: {
          title: input.title,
          version: input.version || "3.0.0",
          changelog: input.changelog || "",
          severity: input.severity || "info",
          affectedSystems: input.affectedSystems || "all",
          dashboardUrl: "/rrb-team-updates",
        },
      };

      // Format for different platforms
      const results: { endpoint: string; success: boolean; error?: string }[] = [];

      for (const endpoint of activeEndpoints) {
        try {
          let body: string;
          const events = endpoint.events;
          
          // Check if this endpoint subscribes to this event
          if (events !== "all" && !events.includes(input.event)) {
            continue;
          }

          // Format payload based on platform detection
          if (endpoint.url.includes("hooks.slack.com")) {
            // Slack format
            body = JSON.stringify({
              text: `*${input.title}*`,
              blocks: [
                {
                  type: "header",
                  text: { type: "plain_text", text: `🔔 ${input.title}` },
                },
                {
                  type: "section",
                  text: {
                    type: "mrkdwn",
                    text: `*Version:* ${input.version || "3.0.0"}\n*Severity:* ${input.severity || "info"}\n*Systems:* ${input.affectedSystems || "all"}\n\n${input.changelog || "No changelog provided."}`,
                  },
                },
                {
                  type: "actions",
                  elements: [
                    {
                      type: "button",
                      text: { type: "plain_text", text: "View Dashboard" },
                      url: "https://qumus.manus.space/rrb-team-updates",
                    },
                  ],
                },
              ],
            });
          } else if (endpoint.url.includes("discord.com/api/webhooks")) {
            // Discord format
            body = JSON.stringify({
              content: `**${input.title}**`,
              embeds: [{
                title: `🔔 ${input.title}`,
                description: input.changelog || "No changelog provided.",
                color: input.severity === "critical" ? 0xFF0000 : input.severity === "warning" ? 0xFFA500 : 0x8B5CF6,
                fields: [
                  { name: "Version", value: input.version || "3.0.0", inline: true },
                  { name: "Severity", value: input.severity || "info", inline: true },
                  { name: "Systems", value: input.affectedSystems || "all", inline: true },
                ],
                footer: { text: "QUMUS Ecosystem — Canryn Production" },
                timestamp: new Date().toISOString(),
              }],
            });
          } else {
            // Generic webhook format
            body = JSON.stringify(payload);
          }

          const response = await fetch(endpoint.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Webhook-Secret": endpoint.secret,
              "X-Webhook-Source": "QUMUS-Ecosystem",
              "X-Webhook-Event": input.event,
            },
            body,
            signal: AbortSignal.timeout(10000),
          });

          await db.update(webhookEndpoints)
            .set({ lastTriggered: sql`NOW()` })
            .where(eq(webhookEndpoints.id, endpoint.id));

          await db.insert(webhookLogs).values({
            webhookId: endpoint.id,
            eventType: input.event,
            payload: body,
            statusCode: response.status,
            response: await response.text().catch(() => ""),
            retryCount: 0,
          });

          results.push({ endpoint: endpoint.url, success: response.ok });
        } catch (error: any) {
          await db.update(webhookEndpoints)
            .set({ failureCount: sql`failure_count + 1` })
            .where(eq(webhookEndpoints.id, endpoint.id));

          await db.insert(webhookLogs).values({
            webhookId: endpoint.id,
            eventType: input.event,
            payload: JSON.stringify(payload),
            error: error.message,
            retryCount: 0,
          });

          results.push({ endpoint: endpoint.url, success: false, error: error.message });
        }
      }

      return {
        dispatched: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      };
    }),

  // ── Get recent webhook logs ──
  logs: protectedProcedure
    .input(z.object({ limit: z.number().optional().default(50) }))
    .query(async ({ input }) => {
      const db = await getDb();
      const logs = await db.select().from(webhookLogs)
        .orderBy(desc(webhookLogs.createdAt))
        .limit(input.limit);
      return logs;
    }),

  // ── Get webhook stats ──
  stats: publicProcedure.query(async () => {
    const db = await getDb();
    const [totalEndpoints] = await db.select({ count: sql<number>`count(*)` }).from(webhookEndpoints);
    const [activeEndpoints] = await db.select({ count: sql<number>`count(*)` }).from(webhookEndpoints).where(eq(webhookEndpoints.isActive, 1));
    const [totalLogs] = await db.select({ count: sql<number>`count(*)` }).from(webhookLogs);
    
    return {
      totalEndpoints: totalEndpoints?.count ?? 0,
      activeEndpoints: activeEndpoints?.count ?? 0,
      totalDeliveries: totalLogs?.count ?? 0,
    };
  }),
});
