import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { suppressionRules, detectedAnomalies } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const suppressionRulesRouter = router({
  // Create suppression rule
  createRule: protectedProcedure
    .input(
      z.object({
        ruleName: z.string(),
        ruleDescription: z.string().optional(),
        anomalyType: z.string(),
        condition: z.string(),
        suppressionDuration: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(suppressionRules).values({
        userId: ctx.user.id,
        ruleName: input.ruleName,
        ruleDescription: input.ruleDescription,
        anomalyType: input.anomalyType,
        condition: input.condition,
        suppressionDuration: input.suppressionDuration,
        isActive: true,
      } as any);

      return { success: true };
    }),

  // Get all suppression rules
  getRules: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const rules = await db
      .select()
      .from(suppressionRules)
      .where(eq(suppressionRules.userId, ctx.user.id))
      .orderBy(desc(suppressionRules.createdAt));

    return rules;
  }),

  // Evaluate if anomaly should be suppressed
  shouldSuppress: protectedProcedure
    .input(z.object({ anomalyType: z.string(), metricName: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const activeRules = await db
        .select()
        .from(suppressionRules)
        .where(
          and(eq(suppressionRules.userId, ctx.user.id), eq(suppressionRules.isActive, true), eq(suppressionRules.anomalyType, input.anomalyType))
        );

      for (const rule of activeRules) {
        // Check if rule is within time window
        if (rule.startTime && rule.endTime) {
          const now = new Date();
          if (now < rule.startTime || now > rule.endTime) continue;
        }

        // Simple condition matching
        if (rule.condition.includes(input.metricName)) {
          return { suppressed: true, ruleId: rule.id, ruleName: rule.ruleName };
        }
      }

      return { suppressed: false };
    }),

  // Update suppression rule
  updateRule: protectedProcedure
    .input(
      z.object({
        ruleId: z.number(),
        isActive: z.boolean().optional(),
        suppressionDuration: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const updates: any = {};
      if (input.isActive !== undefined) updates.isActive = input.isActive;
      if (input.suppressionDuration !== undefined) updates.suppressionDuration = input.suppressionDuration;

      await db.update(suppressionRules).set(updates).where(eq(suppressionRules.id, input.ruleId));

      return { success: true };
    }),

  // Delete suppression rule
  deleteRule: protectedProcedure
    .input(z.object({ ruleId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Note: In production, use soft delete
      await db.delete(suppressionRules).where(eq(suppressionRules.id, input.ruleId));

      return { success: true };
    }),

  // Get suppression statistics
  getStatistics: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const rules = await db.select().from(suppressionRules).where(eq(suppressionRules.userId, ctx.user.id));

    const activeRules = rules.filter((r: any) => r.isActive);
    const totalSuppressions = rules.reduce((sum: number, r: any) => sum + (r.suppressionCount || 0), 0);

    return {
      totalRules: rules.length,
      activeRules: activeRules.length,
      totalSuppressions,
      averageSuppressionPerRule: rules.length > 0 ? totalSuppressions / rules.length : 0,
    };
  }),
});
