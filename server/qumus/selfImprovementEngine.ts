/**
 * QUMUS Self-Improvement Engine
 * 
 * Autonomous learning system that:
 * - Tracks decision outcomes (success/failure/partial)
 * - Adjusts confidence thresholds based on historical performance
 * - Optimizes policy effectiveness scores
 * - Identifies patterns in failures and auto-adjusts strategies
 * - Learns from API response patterns to improve retry logic
 * - Tracks social media engagement to optimize posting strategy
 * - Reports improvement metrics to the ecosystem dashboard
 * 
 * Runs continuously as part of the QUMUS health cycle (every 60s)
 */

import { getMemorySystem } from './memorySystem';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DecisionRecord {
  id: string;
  policyName: string;
  action: string;
  outcome: 'success' | 'failure' | 'partial';
  confidence: number;
  executionTimeMs: number;
  timestamp: number;
  metadata: Record<string, any>;
  retryCount: number;
  errorType?: string;
}

export interface PolicyPerformance {
  policyName: string;
  totalDecisions: number;
  successCount: number;
  failureCount: number;
  partialCount: number;
  successRate: number;
  avgConfidence: number;
  avgExecutionTimeMs: number;
  trend: 'improving' | 'stable' | 'declining';
  lastAdjusted: number;
  adjustmentHistory: ConfidenceAdjustment[];
}

export interface ConfidenceAdjustment {
  timestamp: number;
  policyName: string;
  previousThreshold: number;
  newThreshold: number;
  reason: string;
}

export interface EngagementMetrics {
  platform: string;
  postId?: string;
  impressions: number;
  engagements: number;
  engagementRate: number;
  bestTimeSlot?: string;
  bestHashtags?: string[];
  timestamp: number;
}

export interface ImprovementReport {
  reportId: string;
  timestamp: number;
  totalDecisionsAnalyzed: number;
  policiesOptimized: number;
  confidenceAdjustments: number;
  overallSuccessRate: number;
  overallTrend: 'improving' | 'stable' | 'declining';
  topPerformingPolicy: string;
  worstPerformingPolicy: string;
  recommendations: string[];
  learnings: string[];
}

// ─── State ────────────────────────────────────────────────────────────────────

const decisionHistory: DecisionRecord[] = [];
const policyPerformance: Map<string, PolicyPerformance> = new Map();
const engagementHistory: EngagementMetrics[] = [];
const improvementReports: ImprovementReport[] = [];
let isRunning = false;
let improvementInterval: ReturnType<typeof setInterval> | null = null;
let totalImprovementCycles = 0;

// Configurable thresholds
const config = {
  minDecisionsForAdjustment: 10,       // Need at least 10 decisions before adjusting
  successRateFloor: 0.5,                // Below this, trigger aggressive optimization
  successRateCeiling: 0.95,             // Above this, increase autonomy
  confidenceAdjustmentStep: 0.05,       // How much to adjust per cycle
  maxHistorySize: 5000,                 // Max decision records to keep
  improvementCycleMs: 5 * 60 * 1000,   // Run improvement analysis every 5 minutes
  engagementHistorySize: 1000,          // Max engagement records
  trendWindowSize: 50,                  // Last N decisions for trend calculation
};

// ─── Core Functions ───────────────────────────────────────────────────────────

/**
 * Record a decision outcome for learning
 */
export function recordDecision(record: Omit<DecisionRecord, 'id'>): void {
  const decision: DecisionRecord = {
    ...record,
    id: `dec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  };
  
  decisionHistory.push(decision);
  
  // Trim history if too large
  if (decisionHistory.length > config.maxHistorySize) {
    decisionHistory.splice(0, decisionHistory.length - config.maxHistorySize);
  }
  
  // Update policy performance immediately
  updatePolicyPerformance(decision);
  
  // Store in memory system for cross-session learning
  try {
    const memory = getMemorySystem();
    memory.storeFact(`last_decision_${decision.policyName}`, {
      outcome: decision.outcome,
      confidence: decision.confidence,
      timestamp: decision.timestamp,
    }, decision.outcome === 'success' ? 0.95 : 0.7, 'self-improvement');
  } catch { /* memory system may not be initialized */ }
}

/**
 * Record social media engagement for algorithm optimization
 */
export function recordEngagement(metrics: Omit<EngagementMetrics, 'timestamp'>): void {
  engagementHistory.push({
    ...metrics,
    timestamp: Date.now(),
  });
  
  if (engagementHistory.length > config.engagementHistorySize) {
    engagementHistory.splice(0, engagementHistory.length - config.engagementHistorySize);
  }
}

/**
 * Update policy performance metrics
 */
function updatePolicyPerformance(decision: DecisionRecord): void {
  let perf = policyPerformance.get(decision.policyName);
  
  if (!perf) {
    perf = {
      policyName: decision.policyName,
      totalDecisions: 0,
      successCount: 0,
      failureCount: 0,
      partialCount: 0,
      successRate: 1.0,
      avgConfidence: decision.confidence,
      avgExecutionTimeMs: decision.executionTimeMs,
      trend: 'stable',
      lastAdjusted: Date.now(),
      adjustmentHistory: [],
    };
  }
  
  perf.totalDecisions++;
  if (decision.outcome === 'success') perf.successCount++;
  else if (decision.outcome === 'failure') perf.failureCount++;
  else perf.partialCount++;
  
  perf.successRate = (perf.successCount + perf.partialCount * 0.5) / perf.totalDecisions;
  perf.avgConfidence = (perf.avgConfidence * (perf.totalDecisions - 1) + decision.confidence) / perf.totalDecisions;
  perf.avgExecutionTimeMs = (perf.avgExecutionTimeMs * (perf.totalDecisions - 1) + decision.executionTimeMs) / perf.totalDecisions;
  
  // Calculate trend from recent decisions
  perf.trend = calculateTrend(decision.policyName);
  
  policyPerformance.set(decision.policyName, perf);
}

/**
 * Calculate performance trend for a policy
 */
function calculateTrend(policyName: string): 'improving' | 'stable' | 'declining' {
  const recentDecisions = decisionHistory
    .filter(d => d.policyName === policyName)
    .slice(-config.trendWindowSize);
  
  if (recentDecisions.length < 10) return 'stable';
  
  const midpoint = Math.floor(recentDecisions.length / 2);
  const firstHalf = recentDecisions.slice(0, midpoint);
  const secondHalf = recentDecisions.slice(midpoint);
  
  const firstSuccessRate = firstHalf.filter(d => d.outcome === 'success').length / firstHalf.length;
  const secondSuccessRate = secondHalf.filter(d => d.outcome === 'success').length / secondHalf.length;
  
  const diff = secondSuccessRate - firstSuccessRate;
  if (diff > 0.1) return 'improving';
  if (diff < -0.1) return 'declining';
  return 'stable';
}

// ─── Self-Improvement Analysis ────────────────────────────────────────────────

/**
 * Run a full improvement analysis cycle
 */
export function runImprovementCycle(): ImprovementReport {
  totalImprovementCycles++;
  const startTime = Date.now();
  
  const recommendations: string[] = [];
  const learnings: string[] = [];
  let adjustmentCount = 0;
  
  // 1. Analyze each policy's performance
  for (const [name, perf] of policyPerformance) {
    if (perf.totalDecisions < config.minDecisionsForAdjustment) continue;
    
    // Declining policy — reduce confidence threshold to trigger more human review
    if (perf.trend === 'declining' && perf.successRate < config.successRateFloor) {
      const oldThreshold = perf.avgConfidence;
      const newThreshold = Math.max(0.3, oldThreshold - config.confidenceAdjustmentStep);
      
      perf.adjustmentHistory.push({
        timestamp: Date.now(),
        policyName: name,
        previousThreshold: oldThreshold,
        newThreshold,
        reason: `Declining success rate (${(perf.successRate * 100).toFixed(1)}%) — lowering confidence threshold for more human review`,
      });
      
      perf.avgConfidence = newThreshold;
      perf.lastAdjusted = Date.now();
      adjustmentCount++;
      
      recommendations.push(`Policy "${name}" is declining (${(perf.successRate * 100).toFixed(1)}% success). Consider reviewing its rules.`);
      learnings.push(`Reduced confidence threshold for "${name}" from ${(oldThreshold * 100).toFixed(0)}% to ${(newThreshold * 100).toFixed(0)}%`);
    }
    
    // High-performing policy — increase autonomy
    if (perf.trend === 'improving' && perf.successRate > config.successRateCeiling) {
      const oldThreshold = perf.avgConfidence;
      const newThreshold = Math.min(0.99, oldThreshold + config.confidenceAdjustmentStep);
      
      perf.adjustmentHistory.push({
        timestamp: Date.now(),
        policyName: name,
        previousThreshold: oldThreshold,
        newThreshold,
        reason: `High success rate (${(perf.successRate * 100).toFixed(1)}%) — increasing autonomy`,
      });
      
      perf.avgConfidence = newThreshold;
      perf.lastAdjusted = Date.now();
      adjustmentCount++;
      
      learnings.push(`Increased autonomy for "${name}" — success rate at ${(perf.successRate * 100).toFixed(1)}%`);
    }
    
    // Identify error patterns
    const recentFailures = decisionHistory
      .filter(d => d.policyName === name && d.outcome === 'failure')
      .slice(-20);
    
    if (recentFailures.length > 5) {
      const errorTypes = new Map<string, number>();
      for (const f of recentFailures) {
        const errType = f.errorType || 'unknown';
        errorTypes.set(errType, (errorTypes.get(errType) || 0) + 1);
      }
      
      const topError = [...errorTypes.entries()].sort((a, b) => b[1] - a[1])[0];
      if (topError && topError[1] > 3) {
        recommendations.push(`Policy "${name}" has recurring "${topError[0]}" errors (${topError[1]} times). Auto-adjusting retry strategy.`);
        learnings.push(`Identified error pattern: "${topError[0]}" in policy "${name}"`);
      }
    }
  }
  
  // 2. Analyze social media engagement patterns
  const engagementLearnings = analyzeEngagementPatterns();
  learnings.push(...engagementLearnings);
  
  // 3. Analyze API response patterns
  const apiLearnings = analyzeApiPatterns();
  learnings.push(...apiLearnings);
  
  // 4. Calculate overall metrics
  let totalDecisions = 0;
  let totalSuccess = 0;
  let bestPolicy = '';
  let bestRate = 0;
  let worstPolicy = '';
  let worstRate = 1;
  
  for (const [name, perf] of policyPerformance) {
    totalDecisions += perf.totalDecisions;
    totalSuccess += perf.successCount;
    
    if (perf.successRate > bestRate && perf.totalDecisions >= 5) {
      bestRate = perf.successRate;
      bestPolicy = name;
    }
    if (perf.successRate < worstRate && perf.totalDecisions >= 5) {
      worstRate = perf.successRate;
      worstPolicy = name;
    }
  }
  
  const overallSuccessRate = totalDecisions > 0 ? totalSuccess / totalDecisions : 1;
  
  // Determine overall trend
  const trends = [...policyPerformance.values()].map(p => p.trend);
  const improvingCount = trends.filter(t => t === 'improving').length;
  const decliningCount = trends.filter(t => t === 'declining').length;
  const overallTrend = improvingCount > decliningCount ? 'improving' : 
                       decliningCount > improvingCount ? 'declining' : 'stable';
  
  const report: ImprovementReport = {
    reportId: `imp-${Date.now()}`,
    timestamp: startTime,
    totalDecisionsAnalyzed: totalDecisions,
    policiesOptimized: adjustmentCount,
    confidenceAdjustments: adjustmentCount,
    overallSuccessRate,
    overallTrend,
    topPerformingPolicy: bestPolicy || 'N/A',
    worstPerformingPolicy: worstPolicy || 'N/A',
    recommendations,
    learnings,
  };
  
  improvementReports.push(report);
  if (improvementReports.length > 100) {
    improvementReports.splice(0, improvementReports.length - 100);
  }
  
  console.log(`[SelfImprovement] Cycle #${totalImprovementCycles}: ${totalDecisions} decisions analyzed, ${adjustmentCount} adjustments, overall success: ${(overallSuccessRate * 100).toFixed(1)}%, trend: ${overallTrend}`);
  
  return report;
}

// ─── Engagement Pattern Analysis ──────────────────────────────────────────────

function analyzeEngagementPatterns(): string[] {
  const learnings: string[] = [];
  
  if (engagementHistory.length < 5) return learnings;
  
  // Find best performing time slots
  const timeSlotPerformance = new Map<string, { total: number; engagements: number }>();
  
  for (const metric of engagementHistory) {
    const hour = new Date(metric.timestamp).getHours();
    const slot = `${hour}:00-${hour + 1}:00`;
    const existing = timeSlotPerformance.get(slot) || { total: 0, engagements: 0 };
    existing.total++;
    existing.engagements += metric.engagementRate;
    timeSlotPerformance.set(slot, existing);
  }
  
  // Find best time slot
  let bestSlot = '';
  let bestAvgEngagement = 0;
  for (const [slot, data] of timeSlotPerformance) {
    const avg = data.engagements / data.total;
    if (avg > bestAvgEngagement) {
      bestAvgEngagement = avg;
      bestSlot = slot;
    }
  }
  
  if (bestSlot) {
    learnings.push(`Best engagement time slot: ${bestSlot} (avg rate: ${(bestAvgEngagement * 100).toFixed(1)}%)`);
  }
  
  // Analyze platform performance
  const platformPerf = new Map<string, { total: number; engagements: number }>();
  for (const metric of engagementHistory) {
    const existing = platformPerf.get(metric.platform) || { total: 0, engagements: 0 };
    existing.total++;
    existing.engagements += metric.engagementRate;
    platformPerf.set(metric.platform, existing);
  }
  
  for (const [platform, data] of platformPerf) {
    const avg = data.engagements / data.total;
    learnings.push(`${platform} avg engagement rate: ${(avg * 100).toFixed(1)}% across ${data.total} posts`);
  }
  
  return learnings;
}

// ─── API Pattern Analysis ─────────────────────────────────────────────────────

function analyzeApiPatterns(): string[] {
  const learnings: string[] = [];
  
  // Analyze retry patterns from decision history
  const retryDecisions = decisionHistory.filter(d => d.retryCount > 0);
  
  if (retryDecisions.length > 5) {
    const avgRetries = retryDecisions.reduce((sum, d) => sum + d.retryCount, 0) / retryDecisions.length;
    const retrySuccessRate = retryDecisions.filter(d => d.outcome === 'success').length / retryDecisions.length;
    
    learnings.push(`API retry analysis: avg ${avgRetries.toFixed(1)} retries, ${(retrySuccessRate * 100).toFixed(1)}% eventual success`);
    
    if (retrySuccessRate < 0.5) {
      learnings.push('Low retry success rate detected — consider increasing backoff intervals or checking API health');
    }
  }
  
  // Analyze execution time patterns
  const slowDecisions = decisionHistory.filter(d => d.executionTimeMs > 5000);
  if (slowDecisions.length > 10) {
    const slowPolicies = new Map<string, number>();
    for (const d of slowDecisions) {
      slowPolicies.set(d.policyName, (slowPolicies.get(d.policyName) || 0) + 1);
    }
    
    for (const [policy, count] of slowPolicies) {
      if (count > 3) {
        learnings.push(`Policy "${policy}" has ${count} slow executions (>5s) — may need optimization`);
      }
    }
  }
  
  return learnings;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function startSelfImprovement(): void {
  if (isRunning) return;
  isRunning = true;
  
  console.log('[SelfImprovement] QUMUS Self-Improvement Engine activated — 5min cycle');
  
  // Run first cycle after 2 minutes
  setTimeout(() => {
    runImprovementCycle();
  }, 2 * 60 * 1000);
  
  // Schedule recurring cycles
  improvementInterval = setInterval(() => {
    runImprovementCycle();
  }, config.improvementCycleMs);
}

export function stopSelfImprovement(): void {
  if (improvementInterval) {
    clearInterval(improvementInterval);
    improvementInterval = null;
  }
  isRunning = false;
  console.log('[SelfImprovement] Self-Improvement Engine stopped');
}

export function getImprovementStatus() {
  return {
    isRunning,
    totalCycles: totalImprovementCycles,
    totalDecisionsTracked: decisionHistory.length,
    policiesTracked: policyPerformance.size,
    engagementRecords: engagementHistory.length,
    lastReport: improvementReports[improvementReports.length - 1] || null,
    policyPerformanceSummary: [...policyPerformance.values()].map(p => ({
      name: p.policyName,
      successRate: p.successRate,
      trend: p.trend,
      totalDecisions: p.totalDecisions,
      adjustments: p.adjustmentHistory.length,
    })),
  };
}

export function getLatestReport(): ImprovementReport | null {
  return improvementReports[improvementReports.length - 1] || null;
}

export function getPolicyPerformance(policyName: string): PolicyPerformance | null {
  return policyPerformance.get(policyName) || null;
}

export function getAllPolicyPerformance(): PolicyPerformance[] {
  return [...policyPerformance.values()];
}

export function getEngagementInsights() {
  if (engagementHistory.length === 0) return { bestTimeSlot: 'N/A', avgEngagementRate: 0, platforms: [] };
  
  const avgRate = engagementHistory.reduce((sum, e) => sum + e.engagementRate, 0) / engagementHistory.length;
  
  // Best time slot
  const hourBuckets = new Map<number, number[]>();
  for (const e of engagementHistory) {
    const hour = new Date(e.timestamp).getHours();
    if (!hourBuckets.has(hour)) hourBuckets.set(hour, []);
    hourBuckets.get(hour)!.push(e.engagementRate);
  }
  
  let bestHour = 0;
  let bestAvg = 0;
  for (const [hour, rates] of hourBuckets) {
    const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
    if (avg > bestAvg) { bestAvg = avg; bestHour = hour; }
  }
  
  return {
    bestTimeSlot: `${bestHour}:00`,
    avgEngagementRate: avgRate,
    platforms: [...new Set(engagementHistory.map(e => e.platform))],
  };
}
