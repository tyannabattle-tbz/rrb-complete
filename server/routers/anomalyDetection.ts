import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { invokeLLM } from "../_core/llm";
import {
  anomalyBaselines,
  detectedAnomalies,
  anomalyPatterns,
  anomalyInsights,
  anomalyHistory,
  anomalyRules,
  sessionMetrics,
} from "../../drizzle/schema";
import { eq, and, gte, desc } from "drizzle-orm";

export const anomalyDetectionRouter = router({
  // Calculate baseline for a metric
  calculateBaseline: protectedProcedure
    .input(z.object({
      metricType: z.enum(["session_duration", "tool_executions", "success_rate", "token_usage", "cost", "error_rate"]),
      days: z.number().default(30),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const thirtyDaysAgo = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      const metrics = await db.select().from(sessionMetrics).where(gte(sessionMetrics.createdAt, thirtyDaysAgo));

      if (metrics.length === 0) {
        return { success: false, message: "No metrics found" };
      }

      let values: number[] = [];
      if (input.metricType === "session_duration") {
        values = metrics.map((m: any) => m.duration || 0);
      } else if (input.metricType === "tool_executions") {
        values = metrics.map((m: any) => m.toolExecutionCount || 0);
      } else if (input.metricType === "success_rate") {
        values = metrics.map((m: any) => parseFloat(m.successRate?.toString() || "0"));
      } else if (input.metricType === "token_usage") {
        values = metrics.map((m: any) => m.totalTokensUsed || 0);
      } else if (input.metricType === "cost") {
        values = metrics.map((m: any) => parseFloat(m.costEstimate?.toString() || "0"));
      }

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      await db.insert(anomalyBaselines).values({
        userId: ctx.user.id,
        metricType: input.metricType as any,
        baselineValue: mean.toString() as any,
        standardDeviation: stdDev.toString() as any,
        minValue: Math.min(...values).toString() as any,
        maxValue: Math.max(...values).toString() as any,
        sampleSize: values.length,
      } as any);

      return { success: true, baseline: mean, stdDev };
    }),

  // Detect anomalies for a session
  detectAnomalies: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const metrics = await db.select().from(sessionMetrics).where(eq(sessionMetrics.sessionId, input.sessionId)).limit(1);
      if (!metrics[0]) return { success: false, anomalies: [] };

      const metric = metrics[0];
      const anomalies: any[] = [];

      const baselines = await db.select().from(anomalyBaselines).where(eq(anomalyBaselines.userId, ctx.user.id));

      for (const baseline of baselines) {
        let actualValue = 0;
        let metricName = "";

        if (baseline.metricType === "session_duration") {
          actualValue = metric.duration || 0;
          metricName = "Session Duration";
        } else if (baseline.metricType === "tool_executions") {
          actualValue = metric.toolExecutionCount || 0;
          metricName = "Tool Executions";
        } else if (baseline.metricType === "success_rate") {
          actualValue = parseFloat(metric.successRate?.toString() || "0");
          metricName = "Success Rate";
        }

        const baselineVal = parseFloat(baseline.baselineValue?.toString() || "0");
        const stdDev = parseFloat(baseline.standardDeviation?.toString() || "0");
        const deviation = Math.abs(actualValue - baselineVal);
        const deviationPercentage = (deviation / baselineVal) * 100;

        if (deviation > 2 * stdDev && deviationPercentage > 20) {
          const severity = deviationPercentage > 50 ? "high" : "medium";

          const llmResponse = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are an expert in analyzing anomalies in AI agent performance metrics. Provide a brief analysis of the anomaly and recommend actions.",
              },
              {
                role: "user",
                content: `Analyze this anomaly: ${metricName} is ${deviationPercentage.toFixed(1)}% higher than baseline (${baselineVal.toFixed(2)} vs ${actualValue.toFixed(2)}). What could be the cause and what should be done?`,
              },
            ] as any,
          });

          const aiInsight = (llmResponse.choices?.[0]?.message?.content as string) || "Unable to generate insight";

          await db.insert(detectedAnomalies).values({
            userId: ctx.user.id,
            sessionId: input.sessionId,
            anomalyType: (deviationPercentage > 50 ? "performance_degradation" : "unusual_tool_usage") as any,
            severity: (severity as any),
            metricName,
            expectedValue: baselineVal.toString() as any,
            actualValue: actualValue.toString() as any,
            deviationPercentage: deviationPercentage.toString() as any,
            description: `${metricName} deviated ${deviationPercentage.toFixed(1)}% from baseline`,
            aiInsight,
          } as any);

          anomalies.push({
            metricName,
            severity,
            deviationPercentage,
            aiInsight,
          });
        }
      }

      return { success: true, anomalies };
    }),

  // Get detected anomalies
  getAnomalies: protectedProcedure
    .input(z.object({ limit: z.number().default(50), resolved: z.boolean().optional() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const anomalies = await db
        .select()
        .from(detectedAnomalies)
        .where(
          input.resolved !== undefined
            ? and(eq(detectedAnomalies.userId, ctx.user.id), eq(detectedAnomalies.isResolved, input.resolved))
            : eq(detectedAnomalies.userId, ctx.user.id)
        )
        .orderBy(desc(detectedAnomalies.createdAt))
        .limit(input.limit);

      return anomalies;
    }),

  // Get anomaly insights
  getAnomalyInsights: protectedProcedure
    .input(z.object({ anomalyId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const insights = await db.select().from(anomalyInsights).where(eq(anomalyInsights.anomalyId, input.anomalyId));
      return insights;
    }),

  // Resolve anomaly
  resolveAnomaly: protectedProcedure
    .input(z.object({ anomalyId: z.number(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db
        .update(detectedAnomalies)
        .set({ isResolved: true, resolvedAt: new Date() })
        .where(eq(detectedAnomalies.id, input.anomalyId));

      await db.insert(anomalyHistory).values({
        userId: ctx.user.id,
        anomalyId: input.anomalyId,
        action: "resolved",
        notes: input.notes,
        performedBy: ctx.user.id,
      } as any);

      return { success: true };
    }),

  // Get anomaly patterns
  getPatterns: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const patterns = await db.select().from(anomalyPatterns).where(eq(anomalyPatterns.userId, ctx.user.id));
    return patterns;
  }),

  // Create custom anomaly rule
  createRule: protectedProcedure
    .input(z.object({
      ruleName: z.string(),
      ruleDescription: z.string().optional(),
      condition: z.string(),
      threshold: z.number(),
      severity: z.enum(["low", "medium", "high", "critical"]),
      notifyOnTrigger: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(anomalyRules).values({
        userId: ctx.user.id,
        ruleName: input.ruleName,
        ruleDescription: input.ruleDescription,
        condition: input.condition,
        threshold: input.threshold.toString() as any,
        severity: input.severity as any,
        notifyOnTrigger: input.notifyOnTrigger,
      } as any);

      return { success: true };
    }),

  // Get anomaly summary
  getAnomalySummary: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const allAnomalies = await db.select().from(detectedAnomalies).where(eq(detectedAnomalies.userId, ctx.user.id));

    const unresolved = allAnomalies.filter((a: any) => !a.isResolved);
    const critical = allAnomalies.filter((a: any) => a.severity === "critical");
    const high = allAnomalies.filter((a: any) => a.severity === "high");

    const typeCount: Record<string, number> = {};
    allAnomalies.forEach((a: any) => {
      typeCount[a.anomalyType] = (typeCount[a.anomalyType] || 0) + 1;
    });

    return {
      totalAnomalies: allAnomalies.length,
      unresolvedCount: unresolved.length,
      criticalCount: critical.length,
      highCount: high.length,
      anomalyTypes: typeCount,
    };
  }),
});
