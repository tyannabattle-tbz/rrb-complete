import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { agentProfiles, performanceBenchmarks } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const agentProfilingRouter = router({
  // Record execution profile
  recordProfile: protectedProcedure
    .input(
      z.object({
        agentId: z.number(),
        executionTime: z.number(),
        memoryUsage: z.number(),
        cpuUsage: z.number(),
        tokensUsed: z.number().optional(),
        cost: z.number().optional(),
        success: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Get or create profile
      const existing = await db.select().from(agentProfiles).where(eq(agentProfiles.agentId, input.agentId)).limit(1);

      if (existing[0]) {
        const profile = existing[0];
        const newTotalExecutions = (profile.totalExecutions || 1) + 1;
        const newSuccessRate = input.success ? ((profile.totalExecutions || 0) + 1) / newTotalExecutions : (profile.totalExecutions || 0) / newTotalExecutions;

        await db
          .update(agentProfiles)
          .set({
            executionTime: input.executionTime,
            memoryUsage: input.memoryUsage,
            cpuUsage: input.cpuUsage.toString() as any,
            tokensUsed: (profile.tokensUsed || 0) + (input.tokensUsed || 0),
            cost: ((parseFloat(profile.cost?.toString() || "0") || 0) + (input.cost || 0)).toString() as any,
            successRate: (newSuccessRate * 100).toString() as any,
            errorCount: !input.success ? (profile.errorCount || 0) + 1 : profile.errorCount,
            totalExecutions: newTotalExecutions,
            updatedAt: new Date(),
          })
          .where(eq(agentProfiles.agentId, input.agentId));
      } else {
        await db.insert(agentProfiles).values({
          agentId: input.agentId,
          executionTime: input.executionTime,
          memoryUsage: input.memoryUsage,
          cpuUsage: input.cpuUsage.toString() as any,
          tokensUsed: input.tokensUsed || 0,
          cost: (input.cost || 0).toString() as any,
          successRate: (input.success ? 100 : 0).toString() as any,
          errorCount: input.success ? 0 : 1,
          totalExecutions: 1,
        } as any);
      }

      return { success: true };
    }),

  // Get agent profile
  getProfile: protectedProcedure
    .input(z.object({ agentId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const profile = await db.select().from(agentProfiles).where(eq(agentProfiles.agentId, input.agentId)).limit(1);

      return profile[0] || null;
    }),

  // Detect bottlenecks
  detectBottlenecks: protectedProcedure
    .input(z.object({ agentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const profile = await db.select().from(agentProfiles).where(eq(agentProfiles.agentId, input.agentId)).limit(1);

      if (!profile[0]) return { bottlenecks: [] };

      const bottlenecks: string[] = [];

      if ((profile[0].executionTime || 0) > 5000) {
        bottlenecks.push("High execution time detected (>5s)");
      }

      if ((profile[0].memoryUsage || 0) > 500) {
        bottlenecks.push("High memory usage detected (>500MB)");
      }

      if ((parseFloat(profile[0].cpuUsage?.toString() || "0") || 0) > 80) {
        bottlenecks.push("High CPU usage detected (>80%)");
      }

      if ((parseFloat(profile[0].successRate?.toString() || "100") || 100) < 90) {
        bottlenecks.push("Low success rate detected (<90%)");
      }

      // Update profile with bottlenecks
      await db
        .update(agentProfiles)
        .set({ bottlenecks })
        .where(eq(agentProfiles.agentId, input.agentId));

      return { bottlenecks };
    }),

  // Generate optimization recommendations
  getRecommendations: protectedProcedure
    .input(z.object({ agentId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const profile = await db.select().from(agentProfiles).where(eq(agentProfiles.agentId, input.agentId)).limit(1);

      if (!profile[0]) return { recommendations: [] };

      const recommendations: string[] = [];

      if ((profile[0].executionTime || 0) > 5000) {
        recommendations.push("Consider caching frequently accessed data");
        recommendations.push("Optimize database queries");
      }

      if ((profile[0].memoryUsage || 0) > 500) {
        recommendations.push("Implement memory pooling");
        recommendations.push("Reduce batch sizes");
      }

      if ((parseFloat(profile[0].successRate?.toString() || "100") || 100) < 90) {
        recommendations.push("Review error handling logic");
        recommendations.push("Add retry mechanisms");
      }

      if ((profile[0].tokensUsed || 0) > 10000) {
        recommendations.push("Optimize prompt engineering");
        recommendations.push("Use token-efficient models");
      }

      // Update profile with recommendations
      await db
        .update(agentProfiles)
        .set({ recommendations })
        .where(eq(agentProfiles.agentId, input.agentId));

      return { recommendations };
    }),

  // Record benchmark results
  recordBenchmark: protectedProcedure
    .input(
      z.object({
        agentId: z.number(),
        benchmarkName: z.string(),
        testCases: z.number(),
        passedTests: z.number(),
        failedTests: z.number(),
        averageResponseTime: z.number(),
        p95ResponseTime: z.number(),
        p99ResponseTime: z.number(),
        throughput: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(performanceBenchmarks).values({
        agentId: input.agentId,
        benchmarkName: input.benchmarkName,
        testCases: input.testCases as any,
        passedTests: input.passedTests as any,
        failedTests: input.failedTests as any,
        averageResponseTime: input.averageResponseTime,
        p95ResponseTime: input.p95ResponseTime,
        p99ResponseTime: input.p99ResponseTime,
        throughput: input.throughput.toString() as any,
      } as any);

      return { success: true };
    }),

  // Get benchmark history
  getBenchmarkHistory: protectedProcedure
    .input(z.object({ agentId: z.number(), limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const benchmarks = await db
        .select()
        .from(performanceBenchmarks)
        .where(eq(performanceBenchmarks.agentId, input.agentId))
        .orderBy(desc(performanceBenchmarks.benchmarkDate))
        .limit(input.limit);

      return benchmarks;
    }),

  // Compare performance across versions
  comparePerformance: protectedProcedure
    .input(z.object({ agentId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const benchmarks = await db
        .select()
        .from(performanceBenchmarks)
        .where(eq(performanceBenchmarks.agentId, input.agentId))
        .orderBy(desc(performanceBenchmarks.benchmarkDate))
        .limit(2);

      if (benchmarks.length < 2) {
        return { comparison: null, improvement: null };
      }

      const current = benchmarks[0];
      const previous = benchmarks[1];

      const improvement = {
        responseTimeImprovement: ((parseFloat(previous.averageResponseTime?.toString() || "0") || 0) - (parseFloat(current.averageResponseTime?.toString() || "0") || 0)) / (parseFloat(previous.averageResponseTime?.toString() || "1") || 1),
        throughputImprovement: ((parseFloat(current.throughput?.toString() || "0") || 0) - (parseFloat(previous.throughput?.toString() || "0") || 0)) / (parseFloat(previous.throughput?.toString() || "1") || 1),
      };

      return { current, previous, improvement };
    }),
});
