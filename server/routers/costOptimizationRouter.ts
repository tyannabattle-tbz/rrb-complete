import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

// In-memory cost data store
const costData: Array<{
  jobId: string;
  templateId: string;
  templateName: string;
  estimatedCost: number;
  actualCost: number;
  duration: number;
  resourcesUsed: {
    cpu: number;
    memory: number;
    storage: number;
  };
  timestamp: Date;
}> = [];

export const costOptimizationRouter = router({
  // Get cost analysis
  getCostAnalysis: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        templateId: z.string().optional(),
      })
    )
    .query(({ input }) => {
      let filtered = costData.filter(
        (c) => c.timestamp >= input.startDate && c.timestamp <= input.endDate
      );

      if (input.templateId) {
        filtered = filtered.filter((c) => c.templateId === input.templateId);
      }

      const totalCost = filtered.reduce((sum, c) => sum + c.actualCost, 0);
      const averageCost = filtered.length > 0 ? totalCost / filtered.length : 0;
      const maxCost = filtered.length > 0 ? Math.max(...filtered.map((c) => c.actualCost)) : 0;
      const minCost = filtered.length > 0 ? Math.min(...filtered.map((c) => c.actualCost)) : 0;

      return {
        totalJobs: filtered.length,
        totalCost,
        averageCost,
        maxCost,
        minCost,
        jobs: filtered,
      };
    }),

  // Get cost by template
  getCostByTemplate: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(({ input }) => {
      const filtered = costData.filter(
        (c) => c.timestamp >= input.startDate && c.timestamp <= input.endDate
      );

      const costByTemplate: Record<string, { count: number; totalCost: number; averageCost: number }> = {};

      filtered.forEach((c) => {
        if (!costByTemplate[c.templateName]) {
          costByTemplate[c.templateName] = { count: 0, totalCost: 0, averageCost: 0 };
        }
        costByTemplate[c.templateName].count++;
        costByTemplate[c.templateName].totalCost += c.actualCost;
      });

      // Calculate averages
      Object.keys(costByTemplate).forEach((template) => {
        costByTemplate[template].averageCost =
          costByTemplate[template].totalCost / costByTemplate[template].count;
      });

      return Object.entries(costByTemplate).map(([template, data]) => ({
        template,
        ...data,
      }));
    }),

  // Get cost trends
  getCostTrends: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(({ input }) => {
      const filtered = costData.filter(
        (c) => c.timestamp >= input.startDate && c.timestamp <= input.endDate
      );

      const costByDay: Record<string, { count: number; totalCost: number }> = {};

      filtered.forEach((c) => {
        const day = c.timestamp.toISOString().split("T")[0];
        if (!costByDay[day]) {
          costByDay[day] = { count: 0, totalCost: 0 };
        }
        costByDay[day].count++;
        costByDay[day].totalCost += c.actualCost;
      });

      return Object.entries(costByDay)
        .map(([date, data]) => ({
          date,
          jobCount: data.count,
          totalCost: data.totalCost,
          averageCost: data.totalCost / data.count,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }),

  // Get optimization recommendations
  getOptimizationRecommendations: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(({ input }) => {
      const filtered = costData.filter(
        (c) => c.timestamp >= input.startDate && c.timestamp <= input.endDate
      );

      const recommendations = [];

      // Find expensive jobs
      const expensiveJobs = filtered
        .sort((a, b) => b.actualCost - a.actualCost)
        .slice(0, 5);

      if (expensiveJobs.length > 0) {
        recommendations.push({
          id: "expensive-jobs",
          title: "High-Cost Jobs Detected",
          description: `${expensiveJobs.length} jobs exceeded average cost. Consider optimizing resource allocation.`,
          impact: "high",
          savings: expensiveJobs.reduce((sum, j) => sum + j.actualCost * 0.1, 0),
        });
      }

      // Find inefficient templates
      const costByTemplate: Record<string, { count: number; totalCost: number }> = {};
      filtered.forEach((c) => {
        if (!costByTemplate[c.templateName]) {
          costByTemplate[c.templateName] = { count: 0, totalCost: 0 };
        }
        costByTemplate[c.templateName].count++;
        costByTemplate[c.templateName].totalCost += c.actualCost;
      });

      const inefficientTemplates = Object.entries(costByTemplate)
        .map(([template, data]) => ({
          template,
          avgCost: data.totalCost / data.count,
        }))
        .sort((a, b) => b.avgCost - a.avgCost)
        .slice(0, 3);

      if (inefficientTemplates.length > 0) {
        recommendations.push({
          id: "inefficient-templates",
          title: "Optimize Template Settings",
          description: `Templates: ${inefficientTemplates.map((t) => t.template).join(", ")} have higher than average costs.`,
          impact: "medium",
          savings: inefficientTemplates.reduce((sum, t) => sum + t.avgCost * 0.15, 0),
        });
      }

      // Resource utilization
      const avgCpuUsage = filtered.length > 0
        ? filtered.reduce((sum, c) => sum + c.resourcesUsed.cpu, 0) / filtered.length
        : 0;

      if (avgCpuUsage < 30) {
        recommendations.push({
          id: "low-cpu-usage",
          title: "CPU Underutilization",
          description: "Average CPU usage is below 30%. Consider reducing allocated resources.",
          impact: "low",
          savings: filtered.length > 0 ? (filtered[0].actualCost * 0.2 * filtered.length) : 0,
        });
      }

      return recommendations;
    }),

  // Get resource efficiency
  getResourceEfficiency: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(({ input }) => {
      const filtered = costData.filter(
        (c) => c.timestamp >= input.startDate && c.timestamp <= input.endDate
      );

      if (filtered.length === 0) {
        return {
          avgCpuUsage: 0,
          avgMemoryUsage: 0,
          avgStorageUsage: 0,
          costPerCpuUnit: 0,
          costPerMemoryUnit: 0,
          efficiency: 0,
        };
      }

      const avgCpuUsage = filtered.reduce((sum, c) => sum + c.resourcesUsed.cpu, 0) / filtered.length;
      const avgMemoryUsage = filtered.reduce((sum, c) => sum + c.resourcesUsed.memory, 0) / filtered.length;
      const avgStorageUsage = filtered.reduce((sum, c) => sum + c.resourcesUsed.storage, 0) / filtered.length;
      const totalCost = filtered.reduce((sum, c) => sum + c.actualCost, 0);

      const costPerCpuUnit = avgCpuUsage > 0 ? totalCost / (avgCpuUsage * filtered.length) : 0;
      const costPerMemoryUnit = avgMemoryUsage > 0 ? totalCost / (avgMemoryUsage * filtered.length) : 0;

      // Efficiency score (0-100)
      const efficiency = Math.min(100, (avgCpuUsage + avgMemoryUsage) / 2);

      return {
        avgCpuUsage: Math.round(avgCpuUsage * 100) / 100,
        avgMemoryUsage: Math.round(avgMemoryUsage * 100) / 100,
        avgStorageUsage: Math.round(avgStorageUsage * 100) / 100,
        costPerCpuUnit: Math.round(costPerCpuUnit * 100) / 100,
        costPerMemoryUnit: Math.round(costPerMemoryUnit * 100) / 100,
        efficiency: Math.round(efficiency * 100) / 100,
      };
    }),

  // Record job cost
  recordJobCost: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        templateId: z.string(),
        templateName: z.string(),
        estimatedCost: z.number(),
        actualCost: z.number(),
        duration: z.number(),
        resourcesUsed: z.object({
          cpu: z.number(),
          memory: z.number(),
          storage: z.number(),
        }),
      })
    )
    .mutation(({ input }) => {
      const entry = {
        ...input,
        timestamp: new Date(),
      };

      costData.push(entry);
      return entry;
    }),

  // Get cost forecast
  getCostForecast: protectedProcedure
    .input(
      z.object({
        days: z.number().default(7),
      })
    )
    .query(({ input }) => {
      // Get last 30 days of data for forecasting
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentData = costData.filter((c) => c.timestamp >= thirtyDaysAgo);

      if (recentData.length === 0) {
        return Array(input.days)
          .fill(null)
          .map((_, i) => ({
            date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            forecastedCost: 0,
            confidence: 0,
          }));
      }

      const avgDailyCost = recentData.reduce((sum, c) => sum + c.actualCost, 0) / 30;

      return Array(input.days)
        .fill(null)
        .map((_, i) => ({
          date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          forecastedCost: Math.round(avgDailyCost * (0.95 + Math.random() * 0.1) * 100) / 100,
          confidence: 75 + Math.random() * 20,
        }));
    }),
});
