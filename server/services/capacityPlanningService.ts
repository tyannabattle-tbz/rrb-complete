export interface CapacityMetric {
  timestamp: Date;
  cpu: number;
  memory: number;
  storage: number;
  bandwidth: number;
  activeConnections: number;
}

export interface CapacityForecast {
  metric: string;
  current: number;
  forecast7days: number;
  forecast30days: number;
  forecast90days: number;
  trend: "increasing" | "decreasing" | "stable";
  daysUntilCapacity: number;
  recommendation: string;
}

export interface ScalingAction {
  id: string;
  type: "scale_up" | "scale_down" | "optimize";
  resource: string;
  currentCapacity: number;
  recommendedCapacity: number;
  estimatedCost: number;
  estimatedSavings: number;
  priority: "critical" | "high" | "medium" | "low";
  reason: string;
}

export class CapacityPlanningService {
  private metrics: CapacityMetric[] = [];
  private scalingActions: ScalingAction[] = [];

  recordMetric(metric: CapacityMetric): void {
    this.metrics.push(metric);
    // Keep only last 90 days of metrics
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    this.metrics = this.metrics.filter((m) => m.timestamp > ninetyDaysAgo);
  }

  forecastCapacity(metric: keyof Omit<CapacityMetric, "timestamp">): CapacityForecast {
    if (this.metrics.length === 0) {
      return {
        metric,
        current: 0,
        forecast7days: 0,
        forecast30days: 0,
        forecast90days: 0,
        trend: "stable",
        daysUntilCapacity: 999,
        recommendation: "No data available",
      };
    }

    const recentMetrics = this.metrics.slice(-30); // Last 30 days
    const values = recentMetrics.map((m) => m[metric] as number);
    const current = values[values.length - 1] || 0;

    // Simple linear regression
    const n = values.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, i) => sum + (i + 1) * y, 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Forecast for 7, 30, 90 days
    const forecast7 = intercept + slope * (n + 7);
    const forecast30 = intercept + slope * (n + 30);
    const forecast90 = intercept + slope * (n + 90);

    // Determine trend
    const trend: "increasing" | "decreasing" | "stable" = Math.abs(slope) < 0.1 ? "stable" : slope > 0 ? "increasing" : "decreasing";

    // Days until 80% capacity
    const capacityThreshold = 80;
    let daysUntilCapacity = 999;
    if (slope > 0) {
      daysUntilCapacity = Math.ceil((capacityThreshold - current) / slope);
    }

    const recommendation =
      trend === "increasing" && daysUntilCapacity < 30
        ? `Scale up ${metric} within ${daysUntilCapacity} days`
        : trend === "decreasing"
          ? `Consider scaling down ${metric} to reduce costs`
          : `${metric} usage is stable`;

    return {
      metric,
      current,
      forecast7days: Math.max(0, forecast7),
      forecast30days: Math.max(0, forecast30),
      forecast90days: Math.max(0, forecast90),
      trend,
      daysUntilCapacity: Math.max(0, daysUntilCapacity),
      recommendation,
    };
  }

  generateScalingRecommendations(): ScalingAction[] {
    const actions: ScalingAction[] = [];

    const cpuForecast = this.forecastCapacity("cpu");
    const memoryForecast = this.forecastCapacity("memory");
    const storageForecast = this.forecastCapacity("storage");

    if (cpuForecast.trend === "increasing" && cpuForecast.daysUntilCapacity < 30) {
      actions.push({
        id: `action-${Date.now()}-cpu`,
        type: "scale_up",
        resource: "cpu",
        currentCapacity: cpuForecast.current,
        recommendedCapacity: cpuForecast.forecast30days * 1.2,
        estimatedCost: 500,
        estimatedSavings: 0,
        priority: cpuForecast.daysUntilCapacity < 7 ? "critical" : "high",
        reason: `CPU usage trending up, will reach capacity in ${cpuForecast.daysUntilCapacity} days`,
      });
    }

    if (memoryForecast.trend === "increasing" && memoryForecast.daysUntilCapacity < 30) {
      actions.push({
        id: `action-${Date.now()}-memory`,
        type: "scale_up",
        resource: "memory",
        currentCapacity: memoryForecast.current,
        recommendedCapacity: memoryForecast.forecast30days * 1.2,
        estimatedCost: 300,
        estimatedSavings: 0,
        priority: memoryForecast.daysUntilCapacity < 7 ? "critical" : "high",
        reason: `Memory usage trending up, will reach capacity in ${memoryForecast.daysUntilCapacity} days`,
      });
    }

    if (storageForecast.trend === "decreasing" && storageForecast.current < 40) {
      actions.push({
        id: `action-${Date.now()}-storage`,
        type: "scale_down",
        resource: "storage",
        currentCapacity: storageForecast.current,
        recommendedCapacity: storageForecast.forecast30days * 0.8,
        estimatedCost: 0,
        estimatedSavings: 200,
        priority: "low",
        reason: "Storage usage is decreasing, can optimize costs",
      });
    }

    this.scalingActions = actions;
    return actions;
  }

  getCapacityTrends(): Record<string, CapacityForecast> {
    return {
      cpu: this.forecastCapacity("cpu"),
      memory: this.forecastCapacity("memory"),
      storage: this.forecastCapacity("storage"),
      bandwidth: this.forecastCapacity("bandwidth"),
      activeConnections: this.forecastCapacity("activeConnections"),
    };
  }

  getScalingActions(): ScalingAction[] {
    return this.scalingActions;
  }

  getCapacityStats(): {
    totalMetrics: number;
    averageCpu: number;
    averageMemory: number;
    peakCpu: number;
    peakMemory: number;
  } {
    if (this.metrics.length === 0) {
      return {
        totalMetrics: 0,
        averageCpu: 0,
        averageMemory: 0,
        peakCpu: 0,
        peakMemory: 0,
      };
    }

    const cpuValues = this.metrics.map((m) => m.cpu);
    const memoryValues = this.metrics.map((m) => m.memory);

    return {
      totalMetrics: this.metrics.length,
      averageCpu: cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length,
      averageMemory: memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length,
      peakCpu: Math.max(...cpuValues),
      peakMemory: Math.max(...memoryValues),
    };
  }
}
