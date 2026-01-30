import { invokeLLM } from "../_core/llm";

export interface SLO {
  id: string;
  name: string;
  description: string;
  metric: string;
  target: number; // percentage
  window: number; // in days
  alertThreshold: number; // percentage below target
  enabled: boolean;
}

export interface SLAMetric {
  timestamp: Date;
  metric: string;
  value: number;
  status: "healthy" | "warning" | "critical";
}

export interface SLAViolation {
  id: string;
  sloId: string;
  sloName: string;
  timestamp: Date;
  duration: number; // in seconds
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  resolved: boolean;
  resolutionTime?: number; // in seconds
}

export interface SLAReport {
  period: string;
  startDate: Date;
  endDate: Date;
  slos: Array<{
    name: string;
    target: number;
    actual: number;
    status: "met" | "at_risk" | "violated";
    violations: number;
  }>;
  overallCompliance: number;
  mttr: number; // mean time to recovery in minutes
  mttd: number; // mean time to detection in minutes
}

// In-memory storage
const slos: Map<string, SLO> = new Map();
const metrics: Map<string, SLAMetric[]> = new Map();
const violations: Map<string, SLAViolation> = new Map();
let sloIdCounter = 1;
let violationIdCounter = 1;

// Pre-populate with common SLOs
function initializeDefaultSLOs() {
  createSLO("api-availability", "API Server Availability", "Percentage of time API is available", "availability", 99.9, 30, 99.5, true);
  createSLO("response-time", "API Response Time", "95th percentile response time < 200ms", "response_time", 95, 30, 90, true);
  createSLO("error-rate", "Error Rate", "Error rate < 0.1%", "error_rate", 99.9, 30, 99.5, true);
  createSLO("database-uptime", "Database Uptime", "Database availability", "db_uptime", 99.95, 30, 99.9, true);
}

export function createSLO(name: string, displayName: string, description: string, metric: string, target: number, window: number, alertThreshold: number, enabled: boolean): SLO {
  const id = `slo-${sloIdCounter++}`;
  const slo: SLO = {
    id,
    name,
    description,
    metric,
    target,
    window,
    alertThreshold,
    enabled,
  };
  slos.set(id, slo);
  return slo;
}

export function getSLO(sloId: string): SLO | null {
  return slos.get(sloId) || null;
}

export function getAllSLOs(): SLO[] {
  return Array.from(slos.values());
}

export function updateSLO(sloId: string, updates: Partial<SLO>): SLO | null {
  const slo = slos.get(sloId);
  if (!slo) return null;

  const updated = { ...slo, ...updates, id: slo.id };
  slos.set(sloId, updated);
  return updated;
}

export function deleteSLO(sloId: string): boolean {
  return slos.delete(sloId);
}

export function recordMetric(metric: string, value: number): SLAMetric {
  const status = determineMetricStatus(metric, value);
  const slaMetric: SLAMetric = {
    timestamp: new Date(),
    metric,
    value,
    status,
  };

  if (!metrics.has(metric)) {
    metrics.set(metric, []);
  }
  metrics.get(metric)!.push(slaMetric);

  // Keep only last 1000 metrics per metric type
  const metricList = metrics.get(metric)!;
  if (metricList.length > 1000) {
    metricList.shift();
  }

  // Check for SLO violations
  checkForViolations(metric, value);

  return slaMetric;
}

function determineMetricStatus(metric: string, value: number): "healthy" | "warning" | "critical" {
  if (metric.includes("availability") || metric.includes("uptime")) {
    if (value >= 99.5) return "healthy";
    if (value >= 99.0) return "warning";
    return "critical";
  }
  if (metric.includes("response_time")) {
    if (value <= 200) return "healthy";
    if (value <= 500) return "warning";
    return "critical";
  }
  if (metric.includes("error_rate")) {
    if (value <= 0.1) return "healthy";
    if (value <= 0.5) return "warning";
    return "critical";
  }
  return "healthy";
}

function checkForViolations(metric: string, value: number) {
  const sloArray = Array.from(slos.values());
  for (const slo of sloArray) {
    if (slo.metric === metric && slo.enabled) {
      const isViolation = metric.includes("error_rate") ? value > slo.alertThreshold / 100 : value < slo.alertThreshold;

      if (isViolation) {
        const violationId = `violation-${violationIdCounter++}`;
        const violation: SLAViolation = {
          id: violationId,
          sloId: slo.id,
          sloName: slo.name,
          timestamp: new Date(),
          duration: 0,
          severity: determineSeverity(value, slo.target),
          description: `${slo.name} violated: ${value.toFixed(2)} vs target ${slo.target}`,
          resolved: false,
        };
        violations.set(violationId, violation);
      }
    }
  }
}

function determineSeverity(value: number, target: number): "low" | "medium" | "high" | "critical" {
  const diff = Math.abs(value - target);
  if (diff < 1) return "low";
  if (diff < 5) return "medium";
  if (diff < 10) return "high";
  return "critical";
}

export function getMetrics(metric: string, limit: number = 100): SLAMetric[] {
  const metricList = metrics.get(metric) || [];
  return metricList.slice(-limit);
}

export function getMetricStatistics(metric: string): {
  count: number;
  average: number;
  min: number;
  max: number;
  latest: number;
} {
  const metricList = metrics.get(metric) || [];
  if (metricList.length === 0) {
    return { count: 0, average: 0, min: 0, max: 0, latest: 0 };
  }

  const values = metricList.map((m) => m.value);
  const sum = values.reduce((a, b) => a + b, 0);
  const average = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const latest = values[values.length - 1];

  return { count: values.length, average, min, max, latest };
}

export function getViolation(violationId: string): SLAViolation | null {
  return violations.get(violationId) || null;
}

export function getAllViolations(limit: number = 100): SLAViolation[] {
  return Array.from(violations.values())
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

export function getActiveViolations(): SLAViolation[] {
  return Array.from(violations.values()).filter((v) => !v.resolved);
}

export function resolveViolation(violationId: string): SLAViolation | null {
  const violation = violations.get(violationId);
  if (!violation) return null;

  violation.resolved = true;
  violation.resolutionTime = Math.floor((Date.now() - violation.timestamp.getTime()) / 1000);
  return violation;
}

export function generateSLAReport(startDate: Date, endDate: Date): SLAReport {
  const period = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  const sloReports = [];
  let totalCompliance = 0;

  const sloArray = Array.from(slos.values());
  for (const slo of sloArray) {
    if (!slo.enabled) continue;

    const metricList = (metrics.get(slo.metric) || []).filter((m) => m.timestamp >= startDate && m.timestamp <= endDate);

    if (metricList.length === 0) {
      sloReports.push({
        name: slo.name,
        target: slo.target,
        actual: 0,
        status: "violated" as const,
        violations: 0,
      });
      continue;
    }

    const average = metricList.reduce((sum, m) => sum + m.value, 0) / metricList.length;
    const sloViolations = Array.from(violations.values()).filter((v) => v.sloId === slo.id && v.timestamp >= startDate && v.timestamp <= endDate);

    let status: "met" | "at_risk" | "violated" = "met";
    if (average < slo.alertThreshold) {
      status = "at_risk";
    }
    if (average < slo.target - 5) {
      status = "violated";
    }

    sloReports.push({
      name: slo.name,
      target: slo.target,
      actual: average,
      status,
      violations: sloViolations.length,
    });

    totalCompliance += average;
  }

  const overallCompliance = sloReports.length > 0 ? totalCompliance / sloReports.length : 0;

  // Calculate MTTR and MTTD
  const resolvedViolations = Array.from(violations.values()).filter((v) => v.resolved && v.timestamp >= startDate && v.timestamp <= endDate);
  const mttr = resolvedViolations.length > 0 ? resolvedViolations.reduce((sum, v) => sum + (v.resolutionTime || 0), 0) / resolvedViolations.length / 60 : 0;
  const mttd = resolvedViolations.length > 0 ? resolvedViolations.reduce((sum, v) => sum + 5, 0) / resolvedViolations.length : 0; // Assume 5 min detection time

  return {
    period,
    startDate,
    endDate,
    slos: sloReports,
    overallCompliance,
    mttr,
    mttd,
  };
}

export function getSLACompliancePercentage(): number {
  const allSlos = Array.from(slos.values()).filter((s) => s.enabled);
  if (allSlos.length === 0) return 100;

  let totalCompliance = 0;
  for (const slo of allSlos) {
    const metricList = metrics.get(slo.metric) || [];
    if (metricList.length === 0) continue;

    const recentMetrics = metricList.slice(-100); // Last 100 metrics
    const average = recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length;
    totalCompliance += Math.min(average, slo.target);
  }

  return allSlos.length > 0 ? totalCompliance / allSlos.length : 0;
}

export async function generateSLARecommendations(): Promise<string> {
  const compliance = getSLACompliancePercentage();
  const activeViolations = getActiveViolations();

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an SLA expert. Provide recommendations to improve service level compliance.",
      },
      {
        role: "user",
        content: `Current SLA compliance: ${compliance.toFixed(2)}%. Active violations: ${activeViolations.length}. Provide 3-4 actionable recommendations to improve compliance.`,
      },
    ],
  });

  const content = response.choices[0]?.message.content;
  return typeof content === "string" ? content : "Unable to generate recommendations";
}

// Initialize default SLOs on module load
initializeDefaultSLOs();
