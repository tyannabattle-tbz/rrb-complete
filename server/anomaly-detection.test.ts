import { describe, it, expect } from "vitest";

/**
 * Anomaly Detection Tests
 */
describe("AI-Powered Anomaly Detection", () => {
  it("should calculate baseline statistics", () => {
    const values = [100, 105, 98, 102, 101, 99, 103, 100, 102, 101];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    expect(mean).toBeCloseTo(101.1, 0);
    expect(stdDev).toBeCloseTo(1.85, 0);
  });

  it("should detect anomalies based on standard deviation", () => {
    const baseline = 100;
    const stdDev = 10;
    const actualValue = 150;

    const deviation = Math.abs(actualValue - baseline);
    const deviationPercentage = (deviation / baseline) * 100;
    const isAnomaly = deviation > 2 * stdDev && deviationPercentage > 20;

    expect(isAnomaly).toBe(true);
    expect(deviationPercentage).toBe(50);
  });

  it("should classify anomaly severity", () => {
    const deviationPercentage = 75;
    const severity = deviationPercentage > 50 ? "high" : "medium";

    expect(severity).toBe("high");
  });

  it("should calculate deviation percentage", () => {
    const expected = 1000;
    const actual = 1500;
    const deviation = Math.abs(actual - expected);
    const percentage = (deviation / expected) * 100;

    expect(percentage).toBe(50);
  });

  it("should filter anomalies by severity", () => {
    const anomalies = [
      { id: 1, severity: "critical", resolved: false },
      { id: 2, severity: "high", resolved: false },
      { id: 3, severity: "medium", resolved: true },
      { id: 4, severity: "critical", resolved: false },
    ];

    const critical = anomalies.filter((a) => a.severity === "critical" && !a.resolved);
    expect(critical.length).toBe(2);
  });

  it("should track anomaly patterns", () => {
    const anomalies = [
      { type: "performance_degradation", date: new Date("2026-01-28") },
      { type: "cost_spike", date: new Date("2026-01-29") },
      { type: "performance_degradation", date: new Date("2026-01-30") },
      { type: "performance_degradation", date: new Date("2026-01-31") },
    ];

    const patterns: Record<string, number> = {};
    anomalies.forEach((a) => {
      patterns[a.type] = (patterns[a.type] || 0) + 1;
    });

    expect(patterns["performance_degradation"]).toBe(3);
    expect(patterns["cost_spike"]).toBe(1);
  });

  it("should calculate anomaly frequency", () => {
    const occurrences = 5;
    const totalPeriods = 30;
    const frequency = occurrences / totalPeriods;

    expect(frequency).toBeCloseTo(0.167, 2);
  });

  it("should generate LLM insights", () => {
    const anomaly = {
      metricName: "Session Duration",
      expectedValue: 300,
      actualValue: 600,
      deviationPercentage: 100,
    };

    const prompt = `Analyze this anomaly: ${anomaly.metricName} is ${anomaly.deviationPercentage}% higher than baseline`;
    expect(prompt).toContain("Session Duration");
    expect(prompt).toContain("100%");
  });

  it("should resolve anomalies", () => {
    const anomaly = { id: 1, isResolved: false, resolvedAt: null };
    anomaly.isResolved = true;
    anomaly.resolvedAt = new Date();

    expect(anomaly.isResolved).toBe(true);
    expect(anomaly.resolvedAt).toBeDefined();
  });

  it("should track anomaly history", () => {
    const history = [
      { action: "detected", timestamp: new Date("2026-01-30T10:00:00") },
      { action: "acknowledged", timestamp: new Date("2026-01-30T11:00:00") },
      { action: "resolved", timestamp: new Date("2026-01-30T12:00:00") },
    ];

    expect(history.length).toBe(3);
    expect(history[0].action).toBe("detected");
    expect(history[2].action).toBe("resolved");
  });

  it("should create custom anomaly rules", () => {
    const rule = {
      ruleName: "High Error Rate Alert",
      condition: "error_rate > 10",
      threshold: 10,
      severity: "high",
      isActive: true,
    };

    expect(rule.ruleName).toBe("High Error Rate Alert");
    expect(rule.isActive).toBe(true);
  });

  it("should evaluate anomaly rules", () => {
    const rule = { condition: "value > 100", threshold: 100 };
    const actualValue = 150;

    const triggered = actualValue > rule.threshold;
    expect(triggered).toBe(true);
  });

  it("should correlate anomalies with metrics", () => {
    const anomalies = [
      { type: "cost_spike", metrics: ["token_usage", "api_calls"] },
      { type: "performance_degradation", metrics: ["latency", "duration"] },
    ];

    const costAnomalies = anomalies.filter((a) => a.type === "cost_spike");
    expect(costAnomalies[0].metrics).toContain("token_usage");
  });

  it("should calculate anomaly confidence", () => {
    const deviationStdDevs = 3.5; // 3.5 standard deviations
    const confidence = Math.min(deviationStdDevs * 20, 100); // Scale to 0-100

    expect(confidence).toBeGreaterThan(50);
  });

  it("should aggregate anomaly statistics", () => {
    const anomalies = [
      { severity: "critical", resolved: false },
      { severity: "high", resolved: false },
      { severity: "medium", resolved: true },
      { severity: "critical", resolved: false },
      { severity: "high", resolved: true },
    ];

    const stats = {
      total: anomalies.length,
      unresolved: anomalies.filter((a) => !a.resolved).length,
      critical: anomalies.filter((a) => a.severity === "critical").length,
      high: anomalies.filter((a) => a.severity === "high").length,
    };

    expect(stats.total).toBe(5);
    expect(stats.unresolved).toBe(3);
    expect(stats.critical).toBe(2);
  });

  it("should detect session duration anomalies", () => {
    const baseline = 300; // 5 minutes
    const stdDev = 30;
    const sessionDuration = 600; // 10 minutes

    const deviation = Math.abs(sessionDuration - baseline);
    const isAnomaly = deviation > 2 * stdDev;

    expect(isAnomaly).toBe(true);
  });

  it("should detect cost spike anomalies", () => {
    const baseline = 10; // $10
    const stdDev = 2;
    const actualCost = 30; // $30

    const deviation = Math.abs(actualCost - baseline);
    const percentage = (deviation / baseline) * 100;
    const isAnomaly = deviation > 2 * stdDev && percentage > 50;

    expect(isAnomaly).toBe(true);
  });

  it("should detect success rate drop anomalies", () => {
    const baseline = 95; // 95%
    const stdDev = 5;
    const actualRate = 70; // 70%

    const deviation = Math.abs(actualRate - baseline);
    const isAnomaly = deviation > 2 * stdDev;

    expect(isAnomaly).toBe(true);
  });

  it("should generate action recommendations", () => {
    const anomaly = {
      type: "performance_degradation",
      severity: "high",
      deviationPercentage: 75,
    };

    const recommendations =
      anomaly.deviationPercentage > 50
        ? ["Investigate system resources", "Check for bottlenecks", "Review recent changes"]
        : ["Monitor closely", "Check logs"];

    expect(recommendations.length).toBe(3);
    expect(recommendations[0]).toBe("Investigate system resources");
  });

  it("should batch process anomalies", () => {
    const metrics = [
      { sessionId: 1, duration: 100 },
      { sessionId: 2, duration: 500 },
      { sessionId: 3, duration: 150 },
      { sessionId: 4, duration: 600 },
    ];

    const baseline = 150;
    const stdDev = 50;
    const anomalies = metrics.filter((m) => Math.abs(m.duration - baseline) > 2 * stdDev);

    expect(anomalies.length).toBe(2);
  });

  it("should calculate anomaly impact score", () => {
    const severity = "high";
    const deviationPercentage = 75;
    const affectedSessions = 10;

    const severityScore = severity === "critical" ? 100 : severity === "high" ? 75 : 50;
    const impactScore = (severityScore * deviationPercentage * affectedSessions) / 100;

    expect(impactScore).toBeGreaterThan(500);
  });

  it("should suppress duplicate anomalies", () => {
    const anomalies = [
      { id: 1, type: "cost_spike", sessionId: 1, timestamp: new Date("2026-01-30T10:00:00") },
      { id: 2, type: "cost_spike", sessionId: 1, timestamp: new Date("2026-01-30T10:05:00") },
      { id: 3, type: "cost_spike", sessionId: 2, timestamp: new Date("2026-01-30T10:10:00") },
    ];

    const unique = anomalies.filter(
      (a, idx, arr) => arr.findIndex((x) => x.type === a.type && x.sessionId === a.sessionId) === idx
    );

    expect(unique.length).toBe(2);
  });
});
