import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { subscriptionTiers, userSubscriptions, usageQuotas, rateLimitEvents, quotaAlerts } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const billingRouter = router({
  // Get subscription tiers
  getSubscriptionTiers: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const tiers = await db
        .select()
        .from(subscriptionTiers)
        .where(eq(subscriptionTiers.isActive, true));
      
      return tiers;
    }),

  // Get user subscription
  getUserSubscription: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, ctx.user.id))
        .limit(1);
      
      return subscription[0] || null;
    }),

  // Get usage quota
  getUsageQuota: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const quota = await db
        .select()
        .from(usageQuotas)
        .where(eq(usageQuotas.userId, ctx.user.id))
        .limit(1);
      
      return quota[0] || null;
    }),

  // Get usage statistics
  getUsageStats: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const quota = await db
        .select()
        .from(usageQuotas)
        .where(eq(usageQuotas.userId, ctx.user.id))
        .limit(1);
      
      if (!quota[0]) {
        return {
          requestsUsed: 0,
          requestsLimit: 1000,
          tokensUsed: 0,
          tokensLimit: 100000,
          sessionsCreated: 0,
          sessionsLimit: 50,
          costAccrued: 0,
          costLimit: 100,
          requestsPercentage: 0,
          tokensPercentage: 0,
          sessionsPercentage: 0,
          costPercentage: 0,
        };
      }
      
      const q = quota[0];
      return {
        requestsUsed: q.requestsUsed || 0,
        requestsLimit: q.requestsLimit || 1000,
        tokensUsed: q.tokensUsed || 0,
        tokensLimit: q.tokensLimit || 100000,
        sessionsCreated: q.sessionsCreated || 0,
        sessionsLimit: q.sessionsLimit || 50,
        costAccrued: parseFloat(q.costAccrued?.toString() || "0"),
        costLimit: q.costLimit ? parseFloat(q.costLimit.toString()) : 100,
        requestsPercentage: Math.round(((q.requestsUsed || 0) / (q.requestsLimit || 1)) * 100),
        tokensPercentage: Math.round(((q.tokensUsed || 0) / (q.tokensLimit || 1)) * 100),
        sessionsPercentage: Math.round(((q.sessionsCreated || 0) / (q.sessionsLimit || 1)) * 100),
        costPercentage: q.costLimit ? Math.round(((parseFloat(q.costAccrued?.toString() || "0")) / parseFloat(q.costLimit.toString())) * 100) : 0,
      };
    }),

  // Get rate limit events
  getRateLimitEvents: protectedProcedure
    .input(z.object({
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const events = await db
        .select()
        .from(rateLimitEvents)
        .where(eq(rateLimitEvents.userId, ctx.user.id))
        .limit(input.limit);
      
      return events;
    }),

  // Get quota alerts
  getQuotaAlerts: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const alerts = await db
        .select()
        .from(quotaAlerts)
        .where(eq(quotaAlerts.userId, ctx.user.id));
      
      return alerts;
    }),

  // Create quota alert
  createQuotaAlert: protectedProcedure
    .input(z.object({
      quotaType: z.enum(["requests", "tokens", "cost", "sessions"]),
      threshold: z.number().min(0).max(100),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      await db.insert(quotaAlerts).values({
        userId: ctx.user.id,
        quotaType: input.quotaType,
        threshold: input.threshold,
      });
      
      return { success: true };
    }),

  // Upgrade subscription
  upgradeSubscription: protectedProcedure
    .input(z.object({
      tierId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      // Get the tier to verify it exists
      const tier = await db
        .select()
        .from(subscriptionTiers)
        .where(eq(subscriptionTiers.id, input.tierId))
        .limit(1);
      
      if (!tier[0]) throw new Error("Subscription tier not found");
      
      // Update or create subscription
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
      
      await db.insert(userSubscriptions).values({
        userId: ctx.user.id,
        tierId: input.tierId,
        status: "active",
        billingCycleStart: today,
        billingCycleEnd: nextMonth,
        autoRenew: true,
      });
      
      return { success: true };
    }),

  // Get billing history
  getBillingHistory: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      // Mock billing history
      return {
        invoices: [
          {
            id: 1,
            date: new Date(),
            amount: 29.99,
            status: "paid",
            tier: "Professional",
          },
        ],
      };
    }),
});
