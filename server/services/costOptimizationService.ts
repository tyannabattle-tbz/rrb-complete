import { invokeLLM } from "../_core/llm";

export interface ResourceUsage {
  resourceId: string;
  type: "compute" | "storage" | "network" | "database";
  name: string;
  currentUsage: number;
  maxCapacity: number;
  utilizationPercentage: number;
  costPerHour: number;
  costPerMonth: number;
}

export interface CostOptimizationRecommendation {
  id: string;
  resourceId: string;
  resourceName: string;
  type: "downsize" | "schedule" | "consolidate" | "switch_tier" | "terminate";
  currentCost: number;
  estimatedSavings: number;
  savingsPercentage: number;
  description: string;
  implementation: string;
  priority: "low" | "medium" | "high" | "critical";
  estimatedImplementationTime: number; // in hours
  riskLevel: "low" | "medium" | "high";
}

export interface CostAnalysis {
  timestamp: Date;
  totalMonthlyCost: number;
  totalMonthlyUsage: number;
  resources: ResourceUsage[];
  recommendations: CostOptimizationRecommendation[];
  potentialMonthlySavings: number;
  savingsPercentage: number;
}

export interface CostTrend {
  date: Date;
  cost: number;
  usage: number;
  trend: "increasing" | "decreasing" | "stable";
}

// Simulated resource and cost data
const resourceUsages: Map<string, ResourceUsage> = new Map();
const costHistory: CostTrend[] = [];
const recommendations: Map<string, CostOptimizationRecommendation> = new Map();
let recommendationIdCounter = 1;

export function recordResourceUsage(
  resourceId: string,
  type: "compute" | "storage" | "network" | "database",
  name: string,
  currentUsage: number,
  maxCapacity: number,
  costPerHour: number
): ResourceUsage {
  const utilizationPercentage = (currentUsage / maxCapacity) * 100;
  const costPerMonth = costPerHour * 730; // 730 hours per month average

  const usage: ResourceUsage = {
    resourceId,
    type,
    name,
    currentUsage,
    maxCapacity,
    utilizationPercentage,
    costPerHour,
    costPerMonth,
  };

  resourceUsages.set(resourceId, usage);

  // Record cost trend
  const totalCost = Array.from(resourceUsages.values()).reduce((sum, r) => sum + r.costPerMonth, 0);
  costHistory.push({
    date: new Date(),
    cost: totalCost,
    usage: currentUsage,
    trend: costHistory.length > 0 && costHistory[costHistory.length - 1].cost < totalCost ? "increasing" : "decreasing",
  });

  return usage;
}

export function getResourceUsages(): ResourceUsage[] {
  return Array.from(resourceUsages.values());
}

export function analyzeCosts(): CostAnalysis {
  const resources = Array.from(resourceUsages.values());
  const totalMonthlyCost = resources.reduce((sum, r) => sum + r.costPerMonth, 0);
  const totalMonthlyUsage = resources.reduce((sum, r) => sum + r.currentUsage, 0);

  const costRecommendations = generateRecommendations(resources);
  const potentialMonthlySavings = costRecommendations.reduce((sum, r) => sum + r.estimatedSavings, 0);
  const savingsPercentage = totalMonthlyCost > 0 ? (potentialMonthlySavings / totalMonthlyCost) * 100 : 0;

  return {
    timestamp: new Date(),
    totalMonthlyCost,
    totalMonthlyUsage,
    resources,
    recommendations: costRecommendations,
    potentialMonthlySavings,
    savingsPercentage,
  };
}

function generateRecommendations(resources: ResourceUsage[]): CostOptimizationRecommendation[] {
  const recs: CostOptimizationRecommendation[] = [];

  for (const resource of resources) {
    // Downsize underutilized resources
    if (resource.utilizationPercentage < 20) {
      const downsizeFactor = 0.5;
      const newCost = resource.costPerMonth * downsizeFactor;
      const savings = resource.costPerMonth - newCost;

      const rec: CostOptimizationRecommendation = {
        id: `rec-${recommendationIdCounter++}`,
        resourceId: resource.resourceId,
        resourceName: resource.name,
        type: "downsize",
        currentCost: resource.costPerMonth,
        estimatedSavings: savings,
        savingsPercentage: (savings / resource.costPerMonth) * 100,
        description: `Downsize ${resource.name} - currently at ${resource.utilizationPercentage.toFixed(1)}% utilization`,
        implementation: `Reduce capacity from ${resource.maxCapacity} to ${resource.maxCapacity * downsizeFactor}`,
        priority: resource.utilizationPercentage < 10 ? "high" : "medium",
        estimatedImplementationTime: 1,
        riskLevel: "low",
      };

      recs.push(rec);
      recommendations.set(rec.id, rec);
    }

    // Schedule resources for off-peak hours
    if (resource.type === "compute" && resource.utilizationPercentage > 50 && resource.utilizationPercentage < 80) {
      const schedulingSavings = resource.costPerMonth * 0.3; // 30% savings from scheduling

      const rec: CostOptimizationRecommendation = {
        id: `rec-${recommendationIdCounter++}`,
        resourceId: resource.resourceId,
        resourceName: resource.name,
        type: "schedule",
        currentCost: resource.costPerMonth,
        estimatedSavings: schedulingSavings,
        savingsPercentage: (schedulingSavings / resource.costPerMonth) * 100,
        description: `Enable auto-scaling and scheduling for ${resource.name}`,
        implementation: `Configure time-based scaling policies for off-peak hours`,
        priority: "medium",
        estimatedImplementationTime: 2,
        riskLevel: "low",
      };

      recs.push(rec);
      recommendations.set(rec.id, rec);
    }

    // Switch to reserved instances
    if (resource.type === "compute" && resource.utilizationPercentage > 70) {
      const reservedSavings = resource.costPerMonth * 0.4; // 40% savings with reserved instances

      const rec: CostOptimizationRecommendation = {
        id: `rec-${recommendationIdCounter++}`,
        resourceId: resource.resourceId,
        resourceName: resource.name,
        type: "switch_tier",
        currentCost: resource.costPerMonth,
        estimatedSavings: reservedSavings,
        savingsPercentage: (reservedSavings / resource.costPerMonth) * 100,
        description: `Switch ${resource.name} to reserved instances`,
        implementation: `Purchase 1-year or 3-year reserved instances for predictable workloads`,
        priority: "high",
        estimatedImplementationTime: 4,
        riskLevel: "low",
      };

      recs.push(rec);
      recommendations.set(rec.id, rec);
    }
  }

  return recs;
}

export function getRecommendation(recommendationId: string): CostOptimizationRecommendation | null {
  return recommendations.get(recommendationId) || null;
}

export function getAllRecommendations(): CostOptimizationRecommendation[] {
  return Array.from(recommendations.values());
}

export function implementRecommendation(recommendationId: string): {
  success: boolean;
  message: string;
  estimatedSavings: number;
} {
  const rec = recommendations.get(recommendationId);
  if (!rec) {
    return { success: false, message: "Recommendation not found", estimatedSavings: 0 };
  }

  console.log(`[Cost] Implementing recommendation ${rec.id}: ${rec.description}`);

  // Simulate implementation
  return {
    success: true,
    message: `Successfully implemented ${rec.type} for ${rec.resourceName}`,
    estimatedSavings: rec.estimatedSavings,
  };
}

export function getCostTrends(days: number = 30): CostTrend[] {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return costHistory.filter((t) => t.date >= cutoffDate);
}

export function predictFutureCosts(months: number = 12): Array<{ month: number; estimatedCost: number }> {
  const predictions: Array<{ month: number; estimatedCost: number }> = [];

  if (costHistory.length === 0) {
    return predictions;
  }

  // Simple linear regression for cost prediction
  const recentCosts = costHistory.slice(-30).map((t) => t.cost);
  const avgCost = recentCosts.reduce((a: number, b: number) => a + b, 0) / recentCosts.length;

  for (let i = 1; i <= months; i++) {
    // Assume 5% monthly growth
    const estimatedCost = avgCost * Math.pow(1.05, i);
    predictions.push({ month: i, estimatedCost });
  }

  return predictions;
}

export function getCostStatistics(): {
  totalMonthlyCost: number;
  averageDailyCost: number;
  highestCostDay: number;
  lowestCostDay: number;
  costTrend: "increasing" | "decreasing" | "stable";
  totalResources: number;
  averageUtilization: number;
} {
  const resources = Array.from(resourceUsages.values());
  const totalMonthlyCost = resources.reduce((sum, r) => sum + r.costPerMonth, 0);
  const averageDailyCost = totalMonthlyCost / 30;

  const costs = costHistory.map((t) => t.cost);
  const highestCostDay = costs.length > 0 ? Math.max(...costs) : 0;
  const lowestCostDay = costs.length > 0 ? Math.min(...costs) : 0;

  let costTrend: "increasing" | "decreasing" | "stable" = "stable";
  if (costs.length > 1) {
    const recentAvg = costs.slice(-7).reduce((a: number, b: number) => a + b, 0) / 7;
    const olderAvg = costs.slice(-14, -7).reduce((a: number, b: number) => a + b, 0) / 7;
    if (recentAvg > olderAvg * 1.05) {
      costTrend = "increasing";
    } else if (recentAvg < olderAvg * 0.95) {
      costTrend = "decreasing";
    }
  }

  const averageUtilization = resources.length > 0 ? resources.reduce((sum, r) => sum + r.utilizationPercentage, 0) / resources.length : 0;

  return {
    totalMonthlyCost,
    averageDailyCost,
    highestCostDay,
    lowestCostDay,
    costTrend,
    totalResources: resources.length,
    averageUtilization,
  };
}

export async function generateCostOptimizationPlan(): Promise<string> {
  const analysis = analyzeCosts();
  const stats = getCostStatistics();

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a cloud cost optimization expert. Provide strategic recommendations for reducing cloud spending.",
      },
      {
        role: "user",
        content: `Analyze this cost data and provide a comprehensive optimization plan:\n\nTotal Monthly Cost: $${analysis.totalMonthlyCost.toFixed(2)}\nPotential Savings: $${analysis.potentialMonthlySavings.toFixed(2)} (${analysis.savingsPercentage.toFixed(1)}%)\nAverage Utilization: ${stats.averageUtilization.toFixed(1)}%\nCost Trend: ${stats.costTrend}\n\nProvide 3-4 strategic recommendations with implementation priorities.`,
      },
    ],
  });

  const content = response.choices[0]?.message.content;
  return typeof content === "string" ? content : "Unable to generate optimization plan";
}

export function exportCostAnalysis(format: "json" | "csv" = "json"): string {
  const analysis = analyzeCosts();

  if (format === "json") {
    return JSON.stringify(analysis, null, 2);
  } else {
    // CSV format
    const headers = ["Resource Name", "Type", "Current Usage", "Max Capacity", "Utilization %", "Monthly Cost"];
    const rows = analysis.resources.map((r) => [r.name, r.type, r.currentUsage, r.maxCapacity, r.utilizationPercentage.toFixed(1), r.costPerMonth.toFixed(2)]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    return csv;
  }
}
