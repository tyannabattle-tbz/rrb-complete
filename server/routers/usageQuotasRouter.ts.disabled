import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { usageQuotas } from "../../drizzle/schema";
import { EmailNotificationService } from "../services/emailNotifications";

export const usageQuotasRouter = router({
  // Get usage quota for user
  getQuota: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    try {
      const database = await getDb();
      if (!database) throw new Error("Database connection failed");

      let quota = await (database as any).query.usageQuotas.findFirst({
        where: eq(usageQuotas.userId, ctx.user.id),
      }) as any;

      // Create default quota if not exists
      if (!quota) {
        const now = new Date();
        await database.insert(usageQuotas).values({
          userId: ctx.user.id,
          tokensLimit: 1000000,
          tokensUsed: 0,
          requestsLimit: 10000,
          requestsUsed: 0,
          sessionsLimit: 100,
          sessionsCreated: 0,
          billingCycleStart: now,
          billingCycleEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        });

        quota = await (database as any).query.usageQuotas.findFirst({
          where: eq(usageQuotas.userId, ctx.user.id),
        }) as any;
      }

      // Check if reset needed (monthly)
      const now = new Date();
      const billingEnd = new Date(quota.billingCycleEnd);
      if (now > billingEnd) {
        await database.update(usageQuotas)
          .set({
            tokensUsed: 0,
            requestsUsed: 0,
            sessionsCreated: 0,
            costAccrued: "0",
            billingCycleStart: now,
            billingCycleEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          })
          .where(eq(usageQuotas.userId, ctx.user.id));

        quota.tokensUsed = 0;
        quota.requestsUsed = 0;
        quota.sessionsCreated = 0;
      }

      const percentageUsed = Math.round((quota.tokensUsed / quota.tokensLimit) * 100);

      return {
        ...quota,
        percentageUsed,
        tokensRemaining: quota.tokensLimit - quota.tokensUsed,
      };
    } catch (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
    }
  }),

  // Update token usage
  updateTokenUsage: protectedProcedure
    .input(z.object({
      tokensUsed: z.number().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");

        const quota = await (database as any).query.usageQuotas.findFirst({
          where: eq(usageQuotas.userId, ctx.user.id),
        }) as any;

        if (!quota) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Quota not found" });
        }

        const newUsage = quota.tokensUsed + input.tokensUsed;
        const percentageUsed = Math.round((newUsage / quota.tokensLimit) * 100);

        // Update usage
        await database.update(usageQuotas)
          .set({ tokensUsed: newUsage })
          .where(eq(usageQuotas.userId, ctx.user.id));

        // Send alerts at 50%, 75%, 90%
        if (percentageUsed >= 50 && percentageUsed < 75) {
          await EmailNotificationService.sendUsageAlertNotification(
            ctx.user.email || "",
            newUsage,
            quota.tokensLimit,
            50
          );
        }

        if (percentageUsed >= 75 && percentageUsed < 90) {
          await EmailNotificationService.sendUsageAlertNotification(
            ctx.user.email || "",
            newUsage,
            quota.tokensLimit,
            75
          );
        }

        if (percentageUsed >= 90) {
          await EmailNotificationService.sendUsageAlertNotification(
            ctx.user.email || "",
            newUsage,
            quota.tokensLimit,
            90
          );
        }

        return {
          success: true,
          newUsage,
          percentageUsed,
          tokensRemaining: quota.tokensLimit - newUsage,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),

  // Set custom quota limit
  setQuotaLimit: protectedProcedure
    .input(z.object({
      tokensLimit: z.number().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");

        await database.update(usageQuotas)
          .set({ tokensLimit: input.tokensLimit })
          .where(eq(usageQuotas.userId, ctx.user.id));

        return { success: true, newLimit: input.tokensLimit };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),

  // Reset quota for current month
  resetQuota: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    try {
      const database = await getDb();
      if (!database) throw new Error("Database connection failed");

      const now = new Date();
      await database.update(usageQuotas)
        .set({
          tokensUsed: 0,
          requestsUsed: 0,
          sessionsCreated: 0,
          costAccrued: "0",
          billingCycleStart: now,
          billingCycleEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        })
        .where(eq(usageQuotas.userId, ctx.user.id));

      return { success: true };
    } catch (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
    }
  }),

  // Get usage history
  getUsageHistory: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    try {
      const database = await getDb();
      if (!database) throw new Error("Database connection failed");

      const quota = await (database as any).query.usageQuotas.findFirst({
        where: eq(usageQuotas.userId, ctx.user.id),
      }) as any;

      if (!quota) {
        return { tokensUsed: 0, tokensLimit: 1000000, percentageUsed: 0 };
      }

      return {
        tokensUsed: quota.tokensUsed,
        tokensLimit: quota.tokensLimit,
        percentageUsed: Math.round((quota.tokensUsed / quota.tokensLimit) * 100),
        billingCycleStart: quota.billingCycleStart,
        billingCycleEnd: quota.billingCycleEnd,
      };
    } catch (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
    }
  }),
});
