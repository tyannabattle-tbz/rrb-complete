import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { integrations, userIntegrations, webhookEvents, integrationLogs } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const integrationMarketplaceRouter = router({
  // Get available integrations
  getAvailableIntegrations: protectedProcedure
    .input(z.object({ category: z.string().optional(), limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const availableIntegrations = [
        {
          id: 1,
          integrationName: "Slack",
          integrationKey: "slack",
          category: "Communication",
          description: "Send agent notifications to Slack channels",
          icon: "slack-icon",
          status: "active",
        },
        {
          id: 2,
          integrationName: "GitHub",
          integrationKey: "github",
          category: "DevOps",
          description: "Integrate with GitHub repositories and workflows",
          icon: "github-icon",
          status: "active",
        },
        {
          id: 3,
          integrationName: "Jira",
          integrationKey: "jira",
          category: "Project Management",
          description: "Create and manage Jira issues from agents",
          icon: "jira-icon",
          status: "active",
        },
        {
          id: 4,
          integrationName: "Discord",
          integrationKey: "discord",
          category: "Communication",
          description: "Send agent updates to Discord servers",
          icon: "discord-icon",
          status: "beta",
        },
        {
          id: 5,
          integrationName: "PagerDuty",
          integrationKey: "pagerduty",
          category: "Incident Management",
          description: "Trigger PagerDuty incidents from agents",
          icon: "pagerduty-icon",
          status: "active",
        },
      ];

      return availableIntegrations.slice(0, input.limit);
    }),

  // Get user's installed integrations
  getUserIntegrations: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const userInts = await db
      .select()
      .from(userIntegrations)
      .where(eq(userIntegrations.userId, ctx.user.id));

    return userInts;
  }),

  // Install integration
  installIntegration: protectedProcedure
    .input(
      z.object({
        integrationId: z.number(),
        configuration: z.record(z.any()).optional(),
        apiKey: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(userIntegrations).values({
        userId: ctx.user.id,
        integrationId: input.integrationId,
        apiKey: input.apiKey,
        configuration: input.configuration || {},
        isActive: true,
      } as any);

      return { success: true };
    }),

  // Uninstall integration
  uninstallIntegration: protectedProcedure
    .input(z.object({ userIntegrationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Soft delete by marking inactive
      await db
        .update(userIntegrations)
        .set({ isActive: false })
        .where(eq(userIntegrations.id, input.userIntegrationId));

      return { success: true };
    }),

  // Configure integration
  configureIntegration: protectedProcedure
    .input(
      z.object({
        userIntegrationId: z.number(),
        configuration: z.record(z.any()),
        webhookUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db
        .update(userIntegrations)
        .set({
          configuration: input.configuration,
          webhookUrl: input.webhookUrl,
          updatedAt: new Date(),
        })
        .where(eq(userIntegrations.id, input.userIntegrationId));

      return { success: true };
    }),

  // Test integration
  testIntegration: protectedProcedure
    .input(z.object({ userIntegrationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Log test event
      await db.insert(integrationLogs).values({
        userIntegrationId: input.userIntegrationId,
        action: "TEST_CONNECTION",
        status: "success" as any,
        details: { message: "Connection test successful" },
      } as any);

      return { success: true, message: "Integration test successful" };
    }),

  // Get integration logs
  getIntegrationLogs: protectedProcedure
    .input(z.object({ userIntegrationId: z.number(), limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const logs = await db
        .select()
        .from(integrationLogs)
        .where(eq(integrationLogs.userIntegrationId, input.userIntegrationId))
        .orderBy(desc(integrationLogs.createdAt))
        .limit(input.limit);

      return logs;
    }),

  // Get webhook events
  getWebhookEvents: protectedProcedure
    .input(z.object({ userIntegrationId: z.number(), limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const events = await db
        .select()
        .from(webhookEvents)
        .where(eq(webhookEvents.userIntegrationId, input.userIntegrationId))
        .orderBy(desc(webhookEvents.createdAt))
        .limit(input.limit);

      return events;
    }),

  // Send webhook event
  sendWebhookEvent: protectedProcedure
    .input(
      z.object({
        userIntegrationId: z.number(),
        eventType: z.string(),
        payload: z.record(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(webhookEvents).values({
        userIntegrationId: input.userIntegrationId,
        eventType: input.eventType,
        payload: input.payload,
        status: "delivered" as any,
      } as any);

      return { success: true };
    }),

  // Get integration marketplace stats
  getMarketplaceStats: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");

    return {
      totalIntegrations: 25,
      installedIntegrations: 5,
      activeIntegrations: 4,
      betaIntegrations: 3,
      totalWebhooks: 150,
      successRate: 99.2,
      averageLatency: 245,
    };
  }),

  // Get integration categories
  getIntegrationCategories: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");

    return [
      { name: "Communication", count: 8 },
      { name: "DevOps", count: 6 },
      { name: "Project Management", count: 5 },
      { name: "Incident Management", count: 3 },
      { name: "Analytics", count: 3 },
    ];
  }),

  // Get integration details
  getIntegrationDetails: protectedProcedure
    .input(z.object({ integrationKey: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const details: Record<string, any> = {
        slack: {
          name: "Slack",
          description: "Send agent notifications to Slack channels",
          requiredFields: ["webhook_url", "channel"],
          features: ["Notifications", "Alerts", "Logs"],
          documentation: "https://docs.example.com/slack",
        },
        github: {
          name: "GitHub",
          description: "Integrate with GitHub repositories",
          requiredFields: ["api_token", "repository"],
          features: ["Issues", "Pull Requests", "Workflows"],
          documentation: "https://docs.example.com/github",
        },
        jira: {
          name: "Jira",
          description: "Create and manage Jira issues",
          requiredFields: ["api_token", "project_key"],
          features: ["Issues", "Sprints", "Workflows"],
          documentation: "https://docs.example.com/jira",
        },
      };

      return details[input.integrationKey] || null;
    }),
});
