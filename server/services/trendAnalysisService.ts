import { invokeLLM } from "../_core/llm";

export interface MetricDataPoint {
  timestamp: Date;
  value: number;
  testId: string;
}

export interface TrendAnalysis {
  metric: string;
  direction: "up" | "down" | "stable";
  changePercentage: number;
  startValue: number;
  endValue: number;
  averageValue: number;
  minValue: number;
  maxValue: number;
  standardDeviation: number;
  trend: "improving" | "degrading" | "stable";
  anomalies: MetricDataPoint[];
}

export interface SeasonalPattern {
  timeOfDay: string;
  averageValue: number;
  variance: number;
  frequency: number;
}

// Simulated historical data
const historicalMetrics: Map<string, MetricDataPoint[]> = new Map();

export function recordMetricDataPoint(testId: string, value: number): void {
  const key = testId;
  if (!historicalMetrics.has(key)) {
    historicalMetrics.set(key, []);
  }

  historicalMetrics.get(key)!.push({
    timestamp: new Date(),
    value,
    testId,
  });

  // Keep only last 1000 data points per test
  const data = historicalMetrics.get(key)!;
  if (data.length > 1000) {
    data.shift();
  }
}

export function analyzeTrend(testId: string, timeRangeHours: number = 24): TrendAnalysis {
  const data = historicalMetrics.get(testId) || [];
  const cutoffTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);
  const relevantData = data.filter((d) => d.timestamp >= cutoffTime);

  if (relevantData.length === 0) {
    return {
      metric: testId,
      direction: "stable",
      changePercentage: 0,
      startValue: 0,
      endValue: 0,
      averageValue: 0,
      minValue: 0,
      maxValue: 0,
      standardDeviation: 0,
      trend: "stable",
      anomalies: [],
    };
  }

  const values = relevantData.map((d) => d.value);
  const startValue = values[0];
  const endValue = values[values.length - 1];
  const averageValue = values.reduce((a, b) => a + b, 0) / values.length;
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // Calculate standard deviation
  const squaredDiffs = values.map((v) => Math.pow(v - averageValue, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  const standardDeviation = Math.sqrt(variance);

  // Detect anomalies (values > 2 standard deviations from mean)
  const anomalies = relevantData.filter((d) => Math.abs(d.value - averageValue) > 2 * standardDeviation);

  // Determine trend direction
  const changePercentage = ((endValue - startValue) / startValue) * 100;
  const direction = changePercentage > 5 ? "up" : changePercentage < -5 ? "down" : "stable";
  const trend = direction === "down" ? "improving" : direction === "up" ? "degrading" : "stable";

  return {
    metric: testId,
    direction,
    changePercentage,
    startValue,
    endValue,
    averageValue,
    minValue,
    maxValue,
    standardDeviation,
    trend,
    anomalies,
  };
}

export function detectSeasonalPatterns(testId: string): SeasonalPattern[] {
  const data = historicalMetrics.get(testId) || [];
  const patterns: Map<string, MetricDataPoint[]> = new Map();

  // Group by hour of day
  for (const point of data) {
    const hour = point.timestamp.getHours();
    const key = `hour-${hour}`;
    if (!patterns.has(key)) {
      patterns.set(key, []);
    }
    patterns.get(key)!.push(point);
  }

  const seasonalPatterns: SeasonalPattern[] = [];

  patterns.forEach((points, timeOfDay) => {
    const values = points.map((p: MetricDataPoint) => p.value);
    const averageValue = values.reduce((a: number, b: number) => a + b, 0) / values.length;
    const variance = values.reduce((sum: number, v: number) => sum + Math.pow(v - averageValue, 2), 0) / values.length;

    seasonalPatterns.push({
      timeOfDay,
      averageValue,
      variance,
      frequency: points.length,
    });
  });

  return seasonalPatterns.sort((a, b) => b.frequency - a.frequency);
}

export function predictFutureMetrics(testId: string, hoursAhead: number = 24): number[] {
  const data = historicalMetrics.get(testId) || [];
  if (data.length < 10) {
    return [];
  }

  const values = data.slice(-100).map((d) => d.value);
  const predictions: number[] = [];

  // Simple linear regression for prediction
  const n = values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((a: number, b: number) => a + b, 0);
  const sumXY = values.reduce((sum: number, v: number, i: number) => sum + i * v, 0);
  const sumX2 = values.reduce((sum: number, _: number, i: number) => sum + i * i, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Generate predictions for next N hours
  for (let i = 0; i < hoursAhead; i++) {
    const predictedValue = intercept + slope * (n + i);
    predictions.push(Math.max(0, predictedValue)); // Ensure non-negative
  }

  return predictions;
}

export async function generateTrendInsights(testId: string): Promise<string> {
  const trend = analyzeTrend(testId);
  const seasonalPatterns = detectSeasonalPatterns(testId);
  const predictions = predictFutureMetrics(testId, 24);

  const insights = {
    currentTrend: trend.trend,
    changePercentage: trend.changePercentage.toFixed(2),
    anomalyCount: trend.anomalies.length,
    topSeasonalPattern: seasonalPatterns[0],
    predictedAverage: predictions.length > 0 ? (predictions.reduce((a, b) => a + b, 0) / predictions.length).toFixed(2) : "N/A",
  };

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a performance analyst. Provide insights on metric trends and predictions.",
      },
      {
        role: "user",
        content: `Analyze these trend metrics and provide actionable insights:\n\n${JSON.stringify(insights, null, 2)}\n\nProvide 2-3 specific recommendations in 1-2 sentences each.`,
      },
    ],
  });

  const content = response.choices[0]?.message.content;
  return typeof content === "string" ? content : "Unable to generate insights";
}

export function compareMetricsTrends(
  testId1: string,
  testId2: string
): {
  test1Trend: TrendAnalysis;
  test2Trend: TrendAnalysis;
  comparison: string;
} {
  const trend1 = analyzeTrend(testId1);
  const trend2 = analyzeTrend(testId2);

  let comparison = "";
  if (trend1.averageValue > trend2.averageValue) {
    comparison = `${testId1} has ${((trend1.averageValue / trend2.averageValue - 1) * 100).toFixed(1)}% higher average value`;
  } else {
    comparison = `${testId2} has ${((trend2.averageValue / trend1.averageValue - 1) * 100).toFixed(1)}% higher average value`;
  }

  return {
    test1Trend: trend1,
    test2Trend: trend2,
    comparison,
  };
}

export function getMetricHistory(testId: string, limit: number = 100): MetricDataPoint[] {
  const data = historicalMetrics.get(testId) || [];
  return data.slice(-limit);
}

export function exportTrendData(testId: string, format: "json" | "csv" = "json"): string {
  const data = historicalMetrics.get(testId) || [];

  if (format === "json") {
    return JSON.stringify(data, null, 2);
  } else {
    // CSV format
    const headers = ["timestamp", "value", "testId"];
    const rows = data.map((d) => [d.timestamp.toISOString(), d.value, d.testId]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    return csv;
  }
}
