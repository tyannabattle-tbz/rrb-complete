export interface PerformanceMetric {
  metricType: "query" | "api" | "memory" | "cpu";
  resourceName: string;
  duration: number;
  memoryUsed?: number;
  cpuUsed?: number;
  status: "success" | "error" | "timeout";
  timestamp: Date;
}

export interface PerformanceBottleneck {
  id: number;
  bottleneckType: "slow_query" | "high_memory" | "high_cpu";
  resourceName: string;
  severity: "low" | "medium" | "high" | "critical";
  averageDuration?: number;
  occurrenceCount: number;
  recommendation: string;
  detectedAt: Date;
  resolvedAt?: Date;
}

export interface PerformanceOptimization {
  id: number;
  bottleneckId: number;
  optimizationType: string;
  description: string;
  estimatedImprovement: number;
  applied: boolean;
  appliedAt?: Date;
  actualImprovement?: number;
  createdAt: Date;
}

export interface PerformanceReport {
  totalMetrics: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  bottlenecks: PerformanceBottleneck[];
  recommendations: string[];
  optimizations: PerformanceOptimization[];
}

export function analyzeMetrics(metrics: PerformanceMetric[]): PerformanceReport {
  if (metrics.length === 0) {
    return {
      totalMetrics: 0,
      averageResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      errorRate: 0,
      bottlenecks: [],
      recommendations: [],
      optimizations: [],
    };
  }

  const durations = metrics
    .filter((m) => m.status === "success")
    .map((m) => m.duration)
    .sort((a, b) => a - b);

  const errorCount = metrics.filter((m) => m.status === "error").length;
  const errorRate = (errorCount / metrics.length) * 100;

  const getPercentile = (arr: number[], percentile: number): number => {
    if (arr.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * arr.length) - 1;
    return arr[Math.max(0, index)];
  };

  const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

  return {
    totalMetrics: metrics.length,
    averageResponseTime: avgDuration,
    p95ResponseTime: getPercentile(durations, 95),
    p99ResponseTime: getPercentile(durations, 99),
    errorRate,
    bottlenecks: [],
    recommendations: generateRecommendations(avgDuration, errorRate),
    optimizations: [],
  };
}

function generateRecommendations(avgDuration: number, errorRate: number): string[] {
  const recommendations: string[] = [];

  if (avgDuration > 1000) {
    recommendations.push("Consider adding database indexes for slow queries");
    recommendations.push("Implement caching for frequently accessed data");
  }

  if (avgDuration > 500) {
    recommendations.push("Optimize API response payloads");
    recommendations.push("Consider pagination for large result sets");
  }

  if (errorRate > 5) {
    recommendations.push("Investigate error patterns and implement retry logic");
    recommendations.push("Add better error handling and logging");
  }

  if (errorRate > 10) {
    recommendations.push("Critical: High error rate detected - immediate investigation required");
  }

  if (recommendations.length === 0) {
    recommendations.push("Performance is within acceptable ranges");
  }

  return recommendations;
}

export function identifyBottlenecks(metrics: PerformanceMetric[]): PerformanceBottleneck[] {
  const bottlenecks: Map<string, PerformanceBottleneck> = new Map();

  const slowQueries = metrics
    .filter((m) => m.metricType === "query" && m.duration > 1000)
    .reduce((acc, m) => {
      acc[m.resourceName] = (acc[m.resourceName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  Object.entries(slowQueries).forEach(([resourceName, count]) => {
    if (count >= 3) {
      bottlenecks.set(resourceName, {
        id: Math.random(),
        bottleneckType: "slow_query",
        resourceName,
        severity: count >= 10 ? "critical" : "high",
        occurrenceCount: count,
        recommendation: `Optimize query for ${resourceName} - consider adding indexes or refactoring`,
        detectedAt: new Date(),
      });
    }
  });

  return Array.from(bottlenecks.values());
}

export function calculateImprovement(
  beforeMetrics: PerformanceMetric[],
  afterMetrics: PerformanceMetric[]
): number {
  if (beforeMetrics.length === 0 || afterMetrics.length === 0) return 0;

  const beforeAvg = beforeMetrics.reduce((sum, m) => sum + m.duration, 0) / beforeMetrics.length;
  const afterAvg = afterMetrics.reduce((sum, m) => sum + m.duration, 0) / afterMetrics.length;

  if (beforeAvg === 0) return 0;

  return ((beforeAvg - afterAvg) / beforeAvg) * 100;
}
