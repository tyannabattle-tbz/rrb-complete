import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { invokeLLM } from "../_core/llm";
import { predictiveAlerts, sessionMetrics, agentSessions } from "../../drizzle/schema";
import { eq, desc, gte } from "drizzle-orm";

export const predictiveAlertsRouter = router({
  // Generate predictive alerts based on historical trends
  generatePredictiveAlerts: protectedProcedure
    .input(z.object({ metricType: z.string(), lookbackDays: z.number().default(30) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const lookbackDate = new Date(Date.now() - input.lookbackDays * 24 * 60 * 60 * 1000);
      const historicalData = await db
        .select()
        .from(sessionMetrics)
        .where(gte(sessionMetrics.createdAt, lookbackDate));

      if (historicalData.length < 5) return { success: false, alerts: [], message: "Insufficient historical data" };

      // Simple time series forecasting
      let values: number[] = [];
      if (input.metricType === "duration") {
        values = historicalData.map((m: any) => m.duration || 0);
      } else if (input.metricType === "cost") {
        values = historicalData.map((m: any) => parseFloat(m.costEstimate?.toString() || "0"));
      } else if (input.metricType === "tokens") {
        values = historicalData.map((m: any) => m.totalTokensUsed || 0);
      }

      // Calculate trend and forecast
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const trend = (values[values.length - 1] - values[0]) / values.length;
      const volatility = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length);

      // Generate forecast for next 7 days
      const alerts = [];
      for (let day = 1; day <= 7; day++) {
        const forecastedValue = mean + trend * day + volatility * (Math.random() - 0.5);
        const confidence = Math.max(50, 100 - volatility * 10);

        if (Math.abs(forecastedValue - mean) > 2 * volatility) {
          const llmResponse = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are an AI forecasting expert. Provide brief proactive recommendations.",
              },
              {
                role: "user",
                content: `Metric ${input.metricType} is forecasted to be ${forecastedValue.toFixed(2)} (baseline: ${mean.toFixed(2)}). Confidence: ${confidence.toFixed(0)}%. What proactive actions should be taken?`,
              },
            ] as any,
          });

          const proactiveActions = [
            "Monitor closely over next 24 hours",
            "Review recent configuration changes",
            "Check resource availability",
          ];

          await db.insert(predictiveAlerts).values({
            userId: ctx.user.id,
            metricType: input.metricType,
            predictedValue: forecastedValue.toString() as any,
            confidenceScore: confidence.toString() as any,
            predictedAt: new Date(),
            expectedOccurrenceTime: new Date(Date.now() + day * 24 * 60 * 60 * 1000),
            severity: confidence > 80 ? "high" : "medium",
            proactiveActions: proactiveActions as any,
          } as any);

          alerts.push({
            metricType: input.metricType,
            predictedValue: forecastedValue,
            confidence,
            day,
            severity: confidence > 80 ? "high" : "medium",
          });
        }
      }

      return { success: true, alerts, forecast: { mean, trend, volatility } };
    }),

  // Get active predictive alerts
  getActiveAlerts: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const alerts = await db
      .select()
      .from(predictiveAlerts)
      .where(eq(predictiveAlerts.userId, ctx.user.id))
      .orderBy(desc(predictiveAlerts.createdAt))
      .limit(50);

    return alerts;
  }),

  // Mark alert as triggered
  triggerAlert: protectedProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db
        .update(predictiveAlerts)
        .set({ triggered: true, triggeredAt: new Date() })
        .where(eq(predictiveAlerts.id, input.alertId));

      return { success: true };
    }),

  // Get alert statistics
  getAlertStatistics: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const allAlerts = await db.select().from(predictiveAlerts).where(eq(predictiveAlerts.userId, ctx.user.id));

    const triggered = allAlerts.filter((a: any) => a.triggered);
    const highConfidence = allAlerts.filter((a: any) => parseFloat(a.confidenceScore?.toString() || "0") > 80);
    const critical = allAlerts.filter((a: any) => a.severity === "critical");

    return {
      totalAlerts: allAlerts.length,
      triggeredCount: triggered.length,
      highConfidenceCount: highConfidence.length,
      criticalCount: critical.length,
      accuracyRate: triggered.length > 0 ? (triggered.length / allAlerts.length) * 100 : 0,
    };
  }),
});
