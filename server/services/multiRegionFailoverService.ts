import { invokeLLM } from "../_core/llm";

export interface Region {
  id: string;
  name: string;
  location: string;
  isPrimary: boolean;
  isActive: boolean;
  healthStatus: "healthy" | "degraded" | "unhealthy";
  lastHealthCheck: Date;
  trafficPercentage: number;
  latency: number; // in milliseconds
  errorRate: number; // percentage
  capacity: number; // percentage used
}

export interface FailoverEvent {
  id: string;
  timestamp: Date;
  fromRegion: string;
  toRegion: string;
  reason: string;
  duration: number; // in seconds
  dataLoss: number; // in seconds
  status: "success" | "partial" | "failed";
  affectedSessions: number;
}

export interface RegionMetrics {
  regionId: string;
  timestamp: Date;
  latency: number;
  errorRate: number;
  throughput: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}

export interface FailoverPolicy {
  id: string;
  name: string;
  enabled: boolean;
  triggerCondition: "latency" | "error_rate" | "health_check" | "manual";
  threshold: number;
  cooldownPeriod: number; // in seconds
  maxFailoversPerHour: number;
  dataConsistencyLevel: "strong" | "eventual";
}

// In-memory storage
const regions: Map<string, Region> = new Map();
const failoverEvents: Map<string, FailoverEvent> = new Map();
const regionMetrics: Map<string, RegionMetrics[]> = new Map();
const failoverPolicies: Map<string, FailoverPolicy> = new Map();
let regionIdCounter = 1;
let failoverIdCounter = 1;
let policyIdCounter = 1;

// Pre-populate with default regions
function initializeDefaultRegions() {
  createRegion("us-east-1", "US East (N. Virginia)", "Primary", true, true);
  createRegion("us-west-2", "US West (Oregon)", "Secondary", false, true);
  createRegion("eu-west-1", "EU (Ireland)", "Tertiary", false, true);
  createRegion("ap-southeast-1", "Asia Pacific (Singapore)", "Tertiary", false, false);

  createFailoverPolicy("latency-based", "Latency-Based Failover", true, "latency", 500, 300, 4, "eventual");
  createFailoverPolicy("error-rate-based", "Error Rate Failover", true, "error_rate", 5, 600, 3, "eventual");
  createFailoverPolicy("health-check-based", "Health Check Failover", true, "health_check", 0, 120, 10, "strong");
}

export function createRegion(id: string, name: string, location: string, isPrimary: boolean, isActive: boolean): Region {
  const region: Region = {
    id,
    name,
    location,
    isPrimary,
    isActive,
    healthStatus: "healthy",
    lastHealthCheck: new Date(),
    trafficPercentage: isPrimary ? 100 : 0,
    latency: Math.random() * 50 + 10,
    errorRate: Math.random() * 0.5,
    capacity: Math.random() * 60 + 20,
  };
  regions.set(id, region);
  return region;
}

export function getRegion(regionId: string): Region | null {
  return regions.get(regionId) || null;
}

export function getAllRegions(): Region[] {
  return Array.from(regions.values());
}

export function getPrimaryRegion(): Region | null {
  const regionArray = Array.from(regions.values());
  return regionArray.find((r) => r.isPrimary) || null;
}

export function getActiveRegions(): Region[] {
  return Array.from(regions.values()).filter((r) => r.isActive);
}

export function updateRegionHealth(regionId: string, healthStatus: "healthy" | "degraded" | "unhealthy"): Region | null {
  const region = regions.get(regionId);
  if (!region) return null;

  region.healthStatus = healthStatus;
  region.lastHealthCheck = new Date();

  // Trigger failover if necessary
  if (healthStatus === "unhealthy" && region.isPrimary) {
    triggerFailover(regionId, "health_check", `Primary region ${regionId} is unhealthy`);
  }

  return region;
}

export function updateRegionMetrics(regionId: string, latency: number, errorRate: number, throughput: number, cpuUsage: number, memoryUsage: number, diskUsage: number): RegionMetrics {
  const metrics: RegionMetrics = {
    regionId,
    timestamp: new Date(),
    latency,
    errorRate,
    throughput,
    cpuUsage,
    memoryUsage,
    diskUsage,
  };

  if (!regionMetrics.has(regionId)) {
    regionMetrics.set(regionId, []);
  }
  regionMetrics.get(regionId)!.push(metrics);

  // Keep only last 1000 metrics per region
  const metricsList = regionMetrics.get(regionId)!;
  if (metricsList.length > 1000) {
    metricsList.shift();
  }

  // Update region with latest metrics
  const region = regions.get(regionId);
  if (region) {
    region.latency = latency;
    region.errorRate = errorRate;
    region.capacity = cpuUsage; // Use CPU as capacity indicator
  }

  // Check failover conditions
  checkFailoverConditions(regionId, latency, errorRate);

  return metrics;
}

function checkFailoverConditions(regionId: string, latency: number, errorRate: number) {
  const region = regions.get(regionId);
  if (!region || !region.isPrimary) return;

  const latencyPolicy = Array.from(failoverPolicies.values()).find((p) => p.triggerCondition === "latency" && p.enabled);
  if (latencyPolicy && latency > latencyPolicy.threshold) {
    triggerFailover(regionId, "latency", `Latency ${latency}ms exceeds threshold ${latencyPolicy.threshold}ms`);
  }

  const errorPolicy = Array.from(failoverPolicies.values()).find((p) => p.triggerCondition === "error_rate" && p.enabled);
  if (errorPolicy && errorRate > errorPolicy.threshold) {
    triggerFailover(regionId, "error_rate", `Error rate ${errorRate}% exceeds threshold ${errorPolicy.threshold}%`);
  }
}

export function triggerFailover(fromRegionId: string, reason: string, description: string): FailoverEvent | null {
  const fromRegion = regions.get(fromRegionId);
  if (!fromRegion) return null;

  // Find best secondary region
  const secondaryRegions = Array.from(regions.values()).filter((r) => !r.isPrimary && r.isActive && r.healthStatus === "healthy");
  if (secondaryRegions.length === 0) return null;

  const toRegion = secondaryRegions.reduce((best, current) => (current.latency < best.latency ? current : best));

  // Create failover event
  const failoverId = `failover-${failoverIdCounter++}`;
  const failoverEvent: FailoverEvent = {
    id: failoverId,
    timestamp: new Date(),
    fromRegion: fromRegionId,
    toRegion: toRegion.id,
    reason: description,
    duration: 0,
    dataLoss: 0,
    status: "success",
    affectedSessions: Math.floor(Math.random() * 1000) + 100,
  };

  failoverEvents.set(failoverId, failoverEvent);

  // Update regions
  fromRegion.isPrimary = false;
  fromRegion.trafficPercentage = 0;
  toRegion.isPrimary = true;
  toRegion.trafficPercentage = 100;

  console.log(`[Failover] Triggered: ${fromRegionId} -> ${toRegion.id} (${description})`);

  return failoverEvent;
}

export function getFailoverEvent(failoverId: string): FailoverEvent | null {
  return failoverEvents.get(failoverId) || null;
}

export function getAllFailoverEvents(limit: number = 100): FailoverEvent[] {
  return Array.from(failoverEvents.values())
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

export function getRegionMetrics(regionId: string, limit: number = 100): RegionMetrics[] {
  const metricsList = regionMetrics.get(regionId) || [];
  return metricsList.slice(-limit);
}

export function getRegionMetricsStatistics(regionId: string): {
  averageLatency: number;
  averageErrorRate: number;
  averageCpuUsage: number;
  averageMemoryUsage: number;
  peakLatency: number;
  peakErrorRate: number;
} {
  const metricsList = regionMetrics.get(regionId) || [];
  if (metricsList.length === 0) {
    return { averageLatency: 0, averageErrorRate: 0, averageCpuUsage: 0, averageMemoryUsage: 0, peakLatency: 0, peakErrorRate: 0 };
  }

  const avgLatency = metricsList.reduce((sum, m) => sum + m.latency, 0) / metricsList.length;
  const avgErrorRate = metricsList.reduce((sum, m) => sum + m.errorRate, 0) / metricsList.length;
  const avgCpuUsage = metricsList.reduce((sum, m) => sum + m.cpuUsage, 0) / metricsList.length;
  const avgMemoryUsage = metricsList.reduce((sum, m) => sum + m.memoryUsage, 0) / metricsList.length;
  const peakLatency = Math.max(...metricsList.map((m) => m.latency));
  const peakErrorRate = Math.max(...metricsList.map((m) => m.errorRate));

  return {
    averageLatency: avgLatency,
    averageErrorRate: avgErrorRate,
    averageCpuUsage: avgCpuUsage,
    averageMemoryUsage: avgMemoryUsage,
    peakLatency,
    peakErrorRate,
  };
}

export function createFailoverPolicy(name: string, displayName: string, enabled: boolean, triggerCondition: "latency" | "error_rate" | "health_check" | "manual", threshold: number, cooldownPeriod: number, maxFailoversPerHour: number, dataConsistencyLevel: "strong" | "eventual"): FailoverPolicy {
  const id = `policy-${policyIdCounter++}`;
  const policy: FailoverPolicy = {
    id,
    name,
    enabled,
    triggerCondition,
    threshold,
    cooldownPeriod,
    maxFailoversPerHour,
    dataConsistencyLevel,
  };
  failoverPolicies.set(id, policy);
  return policy;
}

export function getFailoverPolicy(policyId: string): FailoverPolicy | null {
  return failoverPolicies.get(policyId) || null;
}

export function getAllFailoverPolicies(): FailoverPolicy[] {
  return Array.from(failoverPolicies.values());
}

export function updateFailoverPolicy(policyId: string, updates: Partial<FailoverPolicy>): FailoverPolicy | null {
  const policy = failoverPolicies.get(policyId);
  if (!policy) return null;

  const updated = { ...policy, ...updates, id: policy.id };
  failoverPolicies.set(policyId, updated);
  return updated;
}

export function getFailoverStatistics(): {
  totalFailovers: number;
  successfulFailovers: number;
  failedFailovers: number;
  averageFailoverTime: number;
  averageDataLoss: number;
  totalAffectedSessions: number;
} {
  const allFailovers = Array.from(failoverEvents.values());
  const totalFailovers = allFailovers.length;
  const successfulFailovers = allFailovers.filter((f) => f.status === "success").length;
  const failedFailovers = allFailovers.filter((f) => f.status === "failed").length;

  const avgFailoverTime = totalFailovers > 0 ? allFailovers.reduce((sum, f) => sum + f.duration, 0) / totalFailovers : 0;
  const avgDataLoss = totalFailovers > 0 ? allFailovers.reduce((sum, f) => sum + f.dataLoss, 0) / totalFailovers : 0;
  const totalAffectedSessions = allFailovers.reduce((sum, f) => sum + f.affectedSessions, 0);

  return {
    totalFailovers,
    successfulFailovers,
    failedFailovers,
    averageFailoverTime: avgFailoverTime,
    averageDataLoss: avgDataLoss,
    totalAffectedSessions,
  };
}

export async function generateFailoverRecommendations(): Promise<string> {
  const stats = getFailoverStatistics();
  const regions = getAllRegions();

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an expert in multi-region deployment and disaster recovery. Provide recommendations for improving failover resilience.",
      },
      {
        role: "user",
        content: `Failover statistics: ${stats.totalFailovers} total failovers, ${stats.successfulFailovers} successful, average failover time ${stats.averageFailoverTime}s. Regions: ${regions.length}. Provide 3-4 recommendations to improve failover reliability.`,
      },
    ],
  });

  const content = response.choices[0]?.message.content;
  return typeof content === "string" ? content : "Unable to generate recommendations";
}

// Initialize default regions and policies on module load
initializeDefaultRegions();
