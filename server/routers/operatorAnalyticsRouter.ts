import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import { TRPCError } from "@trpc/server";
import { sql } from "drizzle-orm";

/**
 * Operator Analytics & Revenue Router
 * Tracks metrics, engagement, and revenue per operator and broadcast
 */

export const operatorAnalyticsRouter = router({
  // Get operator dashboard metrics
  getDashboardMetrics: protectedProcedure
    .input(z.object({ operatorId: z.number() }))
    .query(async ({ ctx, input }) => {
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view metrics",
        });
      }

      // Get broadcasts for this operator
      const broadcasts = await db.query.operatorBroadcasts.findMany({
        where: (operatorBroadcasts, { eq }) =>
          eq(operatorBroadcasts.operatorId, input.operatorId),
      });

      // Calculate total metrics
      const totalViewers = broadcasts.reduce((sum, b) => sum + (b.totalViews || 0), 0);
      const totalBroadcasts = broadcasts.length;
      const liveBroadcasts = broadcasts.filter((b) => b.status === "live").length;

      // Get analytics
      const analytics = await db.query.operatorAnalytics.findMany({
        where: (operatorAnalytics, { eq }) =>
          eq(operatorAnalytics.operatorId, input.operatorId),
      });

      const totalEngagement = analytics.reduce(
        (sum, a) => sum + (a.chatMessages || 0) + (a.likes || 0) + (a.shares || 0),
        0
      );

      // Get revenue
      const revenue = await db.query.operatorRevenue.findMany({
        where: (operatorRevenue, { and, eq }) =>
          and(
            eq(operatorRevenue.operatorId, input.operatorId),
            eq(operatorRevenue.status, "completed")
          ),
      });

      const totalRevenue = revenue.reduce((sum, r) => sum + parseFloat(r.amount.toString()), 0);

      return {
        totalViewers,
        totalBroadcasts,
        liveBroadcasts,
        totalEngagement,
        totalRevenue,
        avgViewersPerBroadcast: totalBroadcasts > 0 ? Math.round(totalViewers / totalBroadcasts) : 0,
      };
    }),

  // Get broadcast analytics
  getBroadcastAnalytics: protectedProcedure
    .input(z.object({ broadcastId: z.number() }))
    .query(async ({ ctx, input }) => {
      const broadcast = await db.query.operatorBroadcasts.findFirst({
        where: (operatorBroadcasts, { eq }) =>
          eq(operatorBroadcasts.id, input.broadcastId),
      });

      if (!broadcast) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Broadcast not found",
        });
      }

      // Verify operator ownership
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, broadcast.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view analytics",
        });
      }

      const analytics = await db.query.operatorAnalytics.findMany({
        where: (operatorAnalytics, { eq }) =>
          eq(operatorAnalytics.broadcastId, input.broadcastId),
      });

      return {
        broadcastId: input.broadcastId,
        title: broadcast.title,
        analytics: analytics[0] || {
          totalViewers: broadcast.viewers || 0,
          uniqueViewers: 0,
          peakConcurrentViewers: broadcast.peakViewers || 0,
          averageWatchTime: 0,
          engagementRate: 0,
          chatMessages: 0,
          likes: 0,
          shares: 0,
        },
      };
    }),

  // Track broadcast metrics (called during/after broadcast)
  recordBroadcastMetrics: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        broadcastId: z.number(),
        viewers: z.number(),
        peakViewers: z.number(),
        engagementRate: z.number(),
        chatMessages: z.number(),
        likes: z.number(),
        shares: z.number(),
        averageWatchTime: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to record metrics",
        });
      }

      // Update broadcast
      await db
        .update(operatorBroadcasts)
        .set({
          viewers: input.viewers,
          peakViewers: input.peakViewers,
          totalViews: input.viewers,
        })
        .where(eq(operatorBroadcasts.id, input.broadcastId));

      // Record analytics
      await db.insert(operatorAnalytics).values({
        operatorId: input.operatorId,
        broadcastId: input.broadcastId,
        date: new Date().toISOString(),
        totalViewers: input.viewers,
        peakConcurrentViewers: input.peakViewers,
        engagementRate: input.engagementRate,
        chatMessages: input.chatMessages,
        likes: input.likes,
        shares: input.shares,
        averageWatchTime: input.averageWatchTime,
      });

      return { success: true };
    }),

  // Get revenue summary
  getRevenueSummary: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view revenue",
        });
      }

      let query = db.query.operatorRevenue.findMany({
        where: (operatorRevenue, { eq }) =>
          eq(operatorRevenue.operatorId, input.operatorId),
      });

      const revenue = await query;

      // Group by revenue type
      const byType = revenue.reduce(
        (acc, r) => {
          if (!acc[r.revenueType]) {
            acc[r.revenueType] = 0;
          }
          acc[r.revenueType] += parseFloat(r.amount.toString());
          return acc;
        },
        {} as Record<string, number>
      );

      const total = Object.values(byType).reduce((sum, v) => sum + v, 0);

      return {
        total,
        byType,
        count: revenue.length,
      };
    }),

  // Record revenue transaction
  recordRevenue: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        revenueType: z.enum(["subscriptions", "donations", "sponsorships", "ads", "merchandise"]),
        amount: z.number(),
        broadcastId: z.number().optional(),
        transactionId: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to record revenue",
        });
      }

      const result = await db.insert(operatorRevenue).values({
        operatorId: input.operatorId,
        revenueType: input.revenueType,
        amount: input.amount.toString(),
        broadcastId: input.broadcastId,
        transactionId: input.transactionId,
        status: "completed",
        metadata: input.metadata,
      });

      return result;
    }),

  // Get payout history
  getPayoutHistory: protectedProcedure
    .input(z.object({ operatorId: z.number() }))
    .query(async ({ ctx, input }) => {
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view payouts",
        });
      }

      const payouts = await db.query.operatorPayouts.findMany({
        where: (operatorPayouts, { eq }) =>
          eq(operatorPayouts.operatorId, input.operatorId),
      });

      return payouts;
    }),

  // Create payout
  createPayout: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        amount: z.number(),
        periodStart: z.string(),
        periodEnd: z.string(),
        paymentMethod: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to create payouts",
        });
      }

      const result = await db.insert(operatorPayouts).values({
        operatorId: input.operatorId,
        amount: input.amount.toString(),
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        paymentMethod: input.paymentMethod,
        status: "pending",
      });

      return result;
    }),

  // Get engagement trends
  getEngagementTrends: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        days: z.number().default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view trends",
        });
      }

      const analytics = await db.query.operatorAnalytics.findMany({
        where: (operatorAnalytics, { eq }) =>
          eq(operatorAnalytics.operatorId, input.operatorId),
      });

      // Group by date and calculate trends
      const byDate = analytics.reduce(
        (acc, a) => {
          const date = a.date?.split("T")[0] || "unknown";
          if (!acc[date]) {
            acc[date] = {
              viewers: 0,
              engagement: 0,
              messages: 0,
            };
          }
          acc[date].viewers += a.totalViewers || 0;
          acc[date].engagement += a.engagementRate || 0;
          acc[date].messages += a.chatMessages || 0;
          return acc;
        },
        {} as Record<string, any>
      );

      return Object.entries(byDate)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .slice(-input.days)
        .map(([date, data]) => ({
          date,
          ...data,
        }));
    }),

  // Get top performing broadcasts
  getTopBroadcasts: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view broadcasts",
        });
      }

      const broadcasts = await db.query.operatorBroadcasts.findMany({
        where: (operatorBroadcasts, { eq }) =>
          eq(operatorBroadcasts.operatorId, input.operatorId),
      });

      return broadcasts
        .sort((a, b) => (b.totalViews || 0) - (a.totalViews || 0))
        .slice(0, input.limit);
    }),

  // Get revenue per broadcast
  getRevenuePerBroadcast: protectedProcedure
    .input(z.object({ broadcastId: z.number() }))
    .query(async ({ ctx, input }) => {
      const broadcast = await db.query.operatorBroadcasts.findFirst({
        where: (operatorBroadcasts, { eq }) =>
          eq(operatorBroadcasts.id, input.broadcastId),
      });

      if (!broadcast) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Broadcast not found",
        });
      }

      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, broadcast.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view revenue",
        });
      }

      const revenue = await db.query.operatorRevenue.findMany({
        where: (operatorRevenue, { eq }) =>
          eq(operatorRevenue.broadcastId, input.broadcastId),
      });

      const total = revenue.reduce((sum, r) => sum + parseFloat(r.amount.toString()), 0);
      const byType = revenue.reduce(
        (acc, r) => {
          if (!acc[r.revenueType]) {
            acc[r.revenueType] = 0;
          }
          acc[r.revenueType] += parseFloat(r.amount.toString());
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        broadcastId: input.broadcastId,
        title: broadcast.title,
        total,
        byType,
        transactionCount: revenue.length,
      };
    }),

  // Get operator growth metrics
  getGrowthMetrics: protectedProcedure
    .input(z.object({ operatorId: z.number() }))
    .query(async ({ ctx, input }) => {
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view metrics",
        });
      }

      const broadcasts = await db.query.operatorBroadcasts.findMany({
        where: (operatorBroadcasts, { eq }) =>
          eq(operatorBroadcasts.operatorId, input.operatorId),
      });

      const channels = await db.query.operatorChannels.findMany({
        where: (operatorChannels, { eq }) =>
          eq(operatorChannels.operatorId, input.operatorId),
      });

      const totalSubscribers = channels.reduce((sum, c) => sum + (c.subscribers || 0), 0);
      const totalViews = broadcasts.reduce((sum, b) => sum + (b.totalViews || 0), 0);

      return {
        totalChannels: channels.length,
        totalSubscribers,
        totalBroadcasts: broadcasts.length,
        totalViews,
        avgViewsPerBroadcast: broadcasts.length > 0 ? Math.round(totalViews / broadcasts.length) : 0,
        avgSubscribersPerChannel: channels.length > 0 ? Math.round(totalSubscribers / channels.length) : 0,
      };
    }),
});
