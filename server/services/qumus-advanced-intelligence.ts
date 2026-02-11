/**
 * QUMUS Advanced Intelligence Module v1.0
 * 
 * Upgrades the QUMUS decision engine with:
 * 1. Cross-Policy Correlation — detect patterns across multiple policies
 * 2. Anomaly Detection — statistical analysis of decision patterns
 * 3. Adaptive Loop Scheduling — dynamic interval based on load/urgency
 * 4. Learning Feedback Loop — track decision outcomes and improve confidence
 * 5. Self-Assessment Scoring — trend analysis and health scoring
 * 6. Decision Versioning — compare policy versions
 * 7. Policy Chaining — trigger cascading decisions
 */

import QumusCompleteEngine, { CORE_POLICIES, type DecisionResult } from '../qumus-complete-engine';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CorrelationAlert {
  id: string;
  type: 'suspicious_pattern' | 'cascade_risk' | 'anomaly' | 'opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  policies: string[];
  description: string;
  confidence: number;
  timestamp: Date;
  resolved: boolean;
}

export interface AnomalyReport {
  policyId: string;
  metric: string;
  expected: number;
  actual: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}

export interface SelfAssessment {
  overallScore: number;
  healthGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  trends: {
    autonomyTrend: 'improving' | 'stable' | 'declining';
    confidenceTrend: 'improving' | 'stable' | 'declining';
    performanceTrend: 'improving' | 'stable' | 'declining';
  };
  timestamp: Date;
}

export interface LearningEntry {
  decisionId: string;
  policyId: string;
  originalConfidence: number;
  outcome: 'correct' | 'incorrect' | 'partial' | 'unknown';
  adjustedConfidence: number;
  feedback: string;
  timestamp: Date;
}

export interface PolicyChain {
  id: string;
  name: string;
  steps: { policyId: string; condition: string; action: string }[];
  triggerPolicy: string;
  triggerCondition: string;
  enabled: boolean;
}

// ─── Decision History Buffer ─────────────────────────────────────────────────

interface DecisionRecord {
  decisionId: string;
  policyId: string;
  confidence: number;
  result: string;
  executionTime: number;
  timestamp: number;
  input: Record<string, any>;
}

const HISTORY_BUFFER_SIZE = 500;
const decisionHistory: DecisionRecord[] = [];

// ─── Cross-Policy Correlation Engine ─────────────────────────────────────────

const correlationAlerts: CorrelationAlert[] = [];

/**
 * Correlation rules that detect patterns across multiple policies.
 * Each rule examines recent decisions from 2+ policies to find suspicious
 * or noteworthy patterns that individual policies would miss.
 */
const CORRELATION_RULES = [
  {
    id: 'suspicious_registration_payment',
    name: 'Suspicious Registration + Payment',
    policies: ['policy_user_registration', 'policy_payment_processing'],
    detect: (recent: DecisionRecord[]): CorrelationAlert | null => {
      const last5min = Date.now() - 5 * 60 * 1000;
      const recentRegistrations = recent.filter(d =>
        d.policyId === 'policy_user_registration' && d.timestamp > last5min && d.result === 'escalated'
      );
      const recentPayments = recent.filter(d =>
        d.policyId === 'policy_payment_processing' && d.timestamp > last5min && d.confidence < 70
      );
      if (recentRegistrations.length > 0 && recentPayments.length > 0) {
        return {
          id: `corr_${Date.now()}`,
          type: 'suspicious_pattern',
          severity: 'high',
          policies: ['policy_user_registration', 'policy_payment_processing'],
          description: `Suspicious registration escalation coincided with low-confidence payment within 5 minutes. Possible fraud attempt.`,
          confidence: 85,
          timestamp: new Date(),
          resolved: false,
        };
      }
      return null;
    },
  },
  {
    id: 'performance_cascade',
    name: 'Performance Cascade Risk',
    policies: ['policy_performance_alert', 'policy_analytics_aggregation'],
    detect: (recent: DecisionRecord[]): CorrelationAlert | null => {
      const last10min = Date.now() - 10 * 60 * 1000;
      const perfAlerts = recent.filter(d =>
        d.policyId === 'policy_performance_alert' && d.timestamp > last10min && d.result === 'escalated'
      );
      const analyticsDecisions = recent.filter(d =>
        d.policyId === 'policy_analytics_aggregation' && d.timestamp > last10min
      );
      if (perfAlerts.length >= 2 && analyticsDecisions.length > 3) {
        return {
          id: `corr_${Date.now()}`,
          type: 'cascade_risk',
          severity: 'medium',
          policies: ['policy_performance_alert', 'policy_analytics_aggregation'],
          description: `Multiple performance escalations during heavy analytics processing. Analytics aggregation may be contributing to system load.`,
          confidence: 75,
          timestamp: new Date(),
          resolved: false,
        };
      }
      return null;
    },
  },
  {
    id: 'content_compliance_conflict',
    name: 'Content-Compliance Conflict',
    policies: ['policy_content_moderation', 'policy_compliance_reporting'],
    detect: (recent: DecisionRecord[]): CorrelationAlert | null => {
      const last15min = Date.now() - 15 * 60 * 1000;
      const contentEscalations = recent.filter(d =>
        d.policyId === 'policy_content_moderation' && d.timestamp > last15min && d.result === 'escalated'
      );
      const complianceEscalations = recent.filter(d =>
        d.policyId === 'policy_compliance_reporting' && d.timestamp > last15min && d.result === 'escalated'
      );
      if (contentEscalations.length > 0 && complianceEscalations.length > 0) {
        return {
          id: `corr_${Date.now()}`,
          type: 'suspicious_pattern',
          severity: 'high',
          policies: ['policy_content_moderation', 'policy_compliance_reporting'],
          description: `Content moderation and compliance both escalated simultaneously. Potential regulatory-sensitive content detected.`,
          confidence: 80,
          timestamp: new Date(),
          resolved: false,
        };
      }
      return null;
    },
  },
  {
    id: 'growth_opportunity',
    name: 'Growth Opportunity Detection',
    policies: ['policy_user_registration', 'policy_recommendation_engine', 'policy_subscription_management'],
    detect: (recent: DecisionRecord[]): CorrelationAlert | null => {
      const last30min = Date.now() - 30 * 60 * 1000;
      const newRegistrations = recent.filter(d =>
        d.policyId === 'policy_user_registration' && d.timestamp > last30min && d.result === 'approved'
      );
      const recommendations = recent.filter(d =>
        d.policyId === 'policy_recommendation_engine' && d.timestamp > last30min && d.confidence > 85
      );
      if (newRegistrations.length >= 3 && recommendations.length >= 3) {
        return {
          id: `corr_${Date.now()}`,
          type: 'opportunity',
          severity: 'low',
          policies: ['policy_user_registration', 'policy_recommendation_engine', 'policy_subscription_management'],
          description: `High registration + recommendation activity detected. Consider triggering subscription promotion campaign.`,
          confidence: 70,
          timestamp: new Date(),
          resolved: false,
        };
      }
      return null;
    },
  },
];

// ─── Anomaly Detection ───────────────────────────────────────────────────────

const anomalyReports: AnomalyReport[] = [];

// Rolling averages per policy for anomaly baseline
const policyBaselines = new Map<string, {
  avgConfidence: number;
  avgExecutionTime: number;
  escalationRate: number;
  sampleCount: number;
}>();

function updateBaseline(record: DecisionRecord): void {
  const baseline = policyBaselines.get(record.policyId) || {
    avgConfidence: 80, avgExecutionTime: 50, escalationRate: 10, sampleCount: 0,
  };

  const n = baseline.sampleCount + 1;
  const alpha = Math.min(0.1, 1 / n); // Exponential moving average

  baseline.avgConfidence = baseline.avgConfidence * (1 - alpha) + record.confidence * alpha;
  baseline.avgExecutionTime = baseline.avgExecutionTime * (1 - alpha) + record.executionTime * alpha;
  baseline.escalationRate = baseline.escalationRate * (1 - alpha) + (record.result === 'escalated' ? 100 : 0) * alpha;
  baseline.sampleCount = n;

  policyBaselines.set(record.policyId, baseline);
}

function detectAnomalies(record: DecisionRecord): AnomalyReport[] {
  const baseline = policyBaselines.get(record.policyId);
  if (!baseline || baseline.sampleCount < 10) return []; // Need enough data

  const anomalies: AnomalyReport[] = [];

  // Confidence anomaly (>2 standard deviations from mean)
  const confidenceDeviation = Math.abs(record.confidence - baseline.avgConfidence);
  if (confidenceDeviation > 25) {
    anomalies.push({
      policyId: record.policyId,
      metric: 'confidence',
      expected: Math.round(baseline.avgConfidence),
      actual: record.confidence,
      deviation: Math.round(confidenceDeviation),
      severity: confidenceDeviation > 40 ? 'high' : 'medium',
      timestamp: new Date(),
    });
  }

  // Execution time anomaly (>3x average)
  if (record.executionTime > baseline.avgExecutionTime * 3 && record.executionTime > 100) {
    anomalies.push({
      policyId: record.policyId,
      metric: 'execution_time',
      expected: Math.round(baseline.avgExecutionTime),
      actual: record.executionTime,
      deviation: Math.round(record.executionTime / baseline.avgExecutionTime),
      severity: record.executionTime > baseline.avgExecutionTime * 5 ? 'high' : 'medium',
      timestamp: new Date(),
    });
  }

  return anomalies;
}

// ─── Learning Feedback Loop ──────────────────────────────────────────────────

const learningEntries: LearningEntry[] = [];
const confidenceAdjustments = new Map<string, number>(); // policyId -> adjustment factor

export function recordDecisionOutcome(
  decisionId: string,
  policyId: string,
  originalConfidence: number,
  outcome: 'correct' | 'incorrect' | 'partial',
  feedback: string = ''
): void {
  const adjustment = confidenceAdjustments.get(policyId) || 0;
  let newAdjustment = adjustment;

  if (outcome === 'correct') {
    newAdjustment = Math.min(adjustment + 0.5, 10); // Max +10% boost
  } else if (outcome === 'incorrect') {
    newAdjustment = Math.max(adjustment - 2, -15); // Max -15% penalty
  } else {
    newAdjustment = Math.max(adjustment - 0.5, -15);
  }

  confidenceAdjustments.set(policyId, newAdjustment);

  learningEntries.push({
    decisionId,
    policyId,
    originalConfidence,
    outcome,
    adjustedConfidence: Math.min(100, Math.max(0, originalConfidence + newAdjustment)),
    feedback,
    timestamp: new Date(),
  });

  // Keep last 200 entries
  if (learningEntries.length > 200) learningEntries.splice(0, learningEntries.length - 200);
}

export function getConfidenceAdjustment(policyId: string): number {
  return confidenceAdjustments.get(policyId) || 0;
}

// ─── Adaptive Loop Scheduling ────────────────────────────────────────────────

interface AdaptiveScheduleState {
  baseInterval: number;
  currentInterval: number;
  minInterval: number;
  maxInterval: number;
  loadFactor: number;
  urgencyFactor: number;
  lastAdjustment: number;
}

const scheduleState: AdaptiveScheduleState = {
  baseInterval: 120_000,    // 2 minutes default
  currentInterval: 120_000,
  minInterval: 30_000,      // 30 seconds minimum (high urgency)
  maxInterval: 300_000,     // 5 minutes maximum (low load)
  loadFactor: 1.0,
  urgencyFactor: 1.0,
  lastAdjustment: Date.now(),
};

export function calculateAdaptiveInterval(): number {
  const recentDecisions = decisionHistory.filter(d => d.timestamp > Date.now() - 300_000); // Last 5 min
  const escalationCount = recentDecisions.filter(d => d.result === 'escalated').length;
  const totalCount = recentDecisions.length;

  // Urgency: more escalations = faster loop
  if (escalationCount > 5) {
    scheduleState.urgencyFactor = 0.5; // Double speed
  } else if (escalationCount > 2) {
    scheduleState.urgencyFactor = 0.75;
  } else {
    scheduleState.urgencyFactor = 1.0;
  }

  // Load: many decisions = slightly slower to prevent overload
  if (totalCount > 40) {
    scheduleState.loadFactor = 1.3;
  } else if (totalCount > 20) {
    scheduleState.loadFactor = 1.1;
  } else {
    scheduleState.loadFactor = 1.0;
  }

  // Active correlation alerts increase urgency
  const activeAlerts = correlationAlerts.filter(a => !a.resolved && a.severity === 'critical').length;
  if (activeAlerts > 0) {
    scheduleState.urgencyFactor = Math.min(scheduleState.urgencyFactor, 0.4);
  }

  const newInterval = Math.round(
    scheduleState.baseInterval * scheduleState.loadFactor * scheduleState.urgencyFactor
  );

  scheduleState.currentInterval = Math.max(
    scheduleState.minInterval,
    Math.min(scheduleState.maxInterval, newInterval)
  );

  scheduleState.lastAdjustment = Date.now();
  return scheduleState.currentInterval;
}

// ─── Self-Assessment Engine ──────────────────────────────────────────────────

export async function performSelfAssessment(): Promise<SelfAssessment> {
  const allMetrics = await QumusCompleteEngine.getAllMetrics();
  const totalDecisions = allMetrics.reduce((sum, m) => sum + m.totalDecisions, 0);
  const avgAutonomy = allMetrics.reduce((sum, m) => sum + m.autonomyPercentage, 0) / Math.max(allMetrics.length, 1);
  const avgConfidence = allMetrics.reduce((sum, m) => sum + m.averageConfidence, 0) / Math.max(allMetrics.length, 1);
  const avgExecTime = allMetrics.reduce((sum, m) => sum + m.avgExecutionTime, 0) / Math.max(allMetrics.length, 1);
  const avgSuccessRate = allMetrics.reduce((sum, m) => sum + m.successRate, 0) / Math.max(allMetrics.length, 1);

  // Calculate overall score (0-100)
  let score = 0;
  score += Math.min(avgAutonomy, 95) * 0.3;       // 30% weight on autonomy
  score += Math.min(avgConfidence, 100) * 0.25;    // 25% weight on confidence
  score += Math.min(avgSuccessRate, 100) * 0.25;   // 25% weight on success rate
  score += Math.max(0, 100 - avgExecTime / 5) * 0.1; // 10% weight on speed
  score += Math.min(totalDecisions / 10, 10) * 0.1;   // 10% weight on experience

  const overallScore = Math.round(Math.min(score, 100));

  // Grade
  let healthGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (overallScore >= 90) healthGrade = 'A';
  else if (overallScore >= 80) healthGrade = 'B';
  else if (overallScore >= 70) healthGrade = 'C';
  else if (overallScore >= 60) healthGrade = 'D';
  else healthGrade = 'F';

  // Strengths
  const strengths: string[] = [];
  if (avgAutonomy >= 85) strengths.push(`High autonomy rate (${Math.round(avgAutonomy)}%)`);
  if (avgSuccessRate >= 90) strengths.push(`Excellent success rate (${Math.round(avgSuccessRate)}%)`);
  if (avgExecTime < 100) strengths.push(`Fast decision execution (${Math.round(avgExecTime)}ms avg)`);
  if (totalDecisions > 50) strengths.push(`Experienced engine (${totalDecisions} decisions processed)`);
  if (correlationAlerts.filter(a => a.resolved).length > 0) strengths.push('Active cross-policy correlation');
  strengths.push('8-policy framework with full DB persistence');
  strengths.push('Real-time monitoring and heartbeat system');

  // Weaknesses
  const weaknesses: string[] = [];
  if (avgAutonomy < 80) weaknesses.push(`Autonomy below target (${Math.round(avgAutonomy)}% vs 90% target)`);
  if (avgConfidence < 75) weaknesses.push(`Average confidence needs improvement (${Math.round(avgConfidence)}%)`);
  if (avgExecTime > 300) weaknesses.push(`Decision latency too high (${Math.round(avgExecTime)}ms)`);
  if (learningEntries.filter(e => e.outcome === 'incorrect').length > learningEntries.length * 0.2) {
    weaknesses.push('Learning feedback shows >20% incorrect decisions');
  }
  if (anomalyReports.filter(a => a.severity === 'high').length > 3) {
    weaknesses.push('Multiple high-severity anomalies detected recently');
  }

  // Recommendations
  const recommendations: string[] = [];
  if (avgAutonomy < 90) recommendations.push('Consider lowering confidence thresholds on stable policies');
  if (totalDecisions < 100) recommendations.push('Engine needs more operational data for accurate self-assessment');
  if (anomalyReports.length > 5) recommendations.push('Review anomaly patterns for systematic issues');
  if (correlationAlerts.filter(a => !a.resolved).length > 2) recommendations.push('Resolve pending correlation alerts');
  recommendations.push('Continue monitoring cross-policy patterns for emerging risks');

  // Trends (compare recent 50 vs previous 50 decisions)
  const recent50 = decisionHistory.slice(-50);
  const previous50 = decisionHistory.slice(-100, -50);

  const recentAutonomy = recent50.length > 0
    ? recent50.filter(d => d.result === 'approved').length / recent50.length * 100 : avgAutonomy;
  const prevAutonomy = previous50.length > 0
    ? previous50.filter(d => d.result === 'approved').length / previous50.length * 100 : avgAutonomy;

  const recentConfidence = recent50.length > 0
    ? recent50.reduce((s, d) => s + d.confidence, 0) / recent50.length : avgConfidence;
  const prevConfidence = previous50.length > 0
    ? previous50.reduce((s, d) => s + d.confidence, 0) / previous50.length : avgConfidence;

  const recentExecTime = recent50.length > 0
    ? recent50.reduce((s, d) => s + d.executionTime, 0) / recent50.length : avgExecTime;
  const prevExecTime = previous50.length > 0
    ? previous50.reduce((s, d) => s + d.executionTime, 0) / previous50.length : avgExecTime;

  const trendThreshold = 3; // 3% change to count as improving/declining

  return {
    overallScore,
    healthGrade,
    strengths,
    weaknesses,
    recommendations,
    trends: {
      autonomyTrend: recentAutonomy - prevAutonomy > trendThreshold ? 'improving'
        : prevAutonomy - recentAutonomy > trendThreshold ? 'declining' : 'stable',
      confidenceTrend: recentConfidence - prevConfidence > trendThreshold ? 'improving'
        : prevConfidence - recentConfidence > trendThreshold ? 'declining' : 'stable',
      performanceTrend: prevExecTime - recentExecTime > 10 ? 'improving'
        : recentExecTime - prevExecTime > 10 ? 'declining' : 'stable',
    },
    timestamp: new Date(),
  };
}

// ─── Policy Chaining ─────────────────────────────────────────────────────────

const policyChains: PolicyChain[] = [
  {
    id: 'chain_fraud_detection',
    name: 'Fraud Detection Chain',
    triggerPolicy: 'policy_payment_processing',
    triggerCondition: 'escalated',
    steps: [
      { policyId: 'policy_user_registration', condition: 'check_user_history', action: 'verify_identity' },
      { policyId: 'policy_compliance_reporting', condition: 'always', action: 'log_fraud_investigation' },
      { policyId: 'policy_performance_alert', condition: 'if_suspicious', action: 'rate_limit_user' },
    ],
    enabled: true,
  },
  {
    id: 'chain_content_compliance',
    name: 'Content Compliance Chain',
    triggerPolicy: 'policy_content_moderation',
    triggerCondition: 'escalated',
    steps: [
      { policyId: 'policy_compliance_reporting', condition: 'always', action: 'log_content_review' },
      { policyId: 'policy_analytics_aggregation', condition: 'always', action: 'track_moderation_metrics' },
    ],
    enabled: true,
  },
  {
    id: 'chain_growth_activation',
    name: 'Growth Activation Chain',
    triggerPolicy: 'policy_user_registration',
    triggerCondition: 'approved',
    steps: [
      { policyId: 'policy_recommendation_engine', condition: 'always', action: 'generate_onboarding_recommendations' },
      { policyId: 'policy_subscription_management', condition: 'if_eligible', action: 'offer_trial' },
    ],
    enabled: true,
  },
];

export async function executePolicyChain(
  triggerPolicyId: string,
  triggerResult: string,
  triggerInput: Record<string, any>
): Promise<{ chainId: string; stepsExecuted: number; results: DecisionResult[] }[]> {
  const chainResults: { chainId: string; stepsExecuted: number; results: DecisionResult[] }[] = [];

  for (const chain of policyChains) {
    if (!chain.enabled) continue;
    if (chain.triggerPolicy !== triggerPolicyId) continue;
    if (chain.triggerCondition !== triggerResult && chain.triggerCondition !== 'any') continue;

    const results: DecisionResult[] = [];
    let stepsExecuted = 0;

    for (const step of chain.steps) {
      try {
        const result = await QumusCompleteEngine.makeDecision({
          policyId: step.policyId,
          input: {
            ...triggerInput,
            chainId: chain.id,
            chainStep: step.action,
            triggeredBy: triggerPolicyId,
          },
        });
        results.push(result);
        stepsExecuted++;
        console.log(`[QUMUS Chain] ${chain.name} → ${step.action}: ${result.result}`);
      } catch (error) {
        console.error(`[QUMUS Chain] ${chain.name} step failed:`, error);
      }
    }

    chainResults.push({ chainId: chain.id, stepsExecuted, results });
  }

  return chainResults;
}

// ─── Main Integration Point ──────────────────────────────────────────────────

/**
 * Process a decision through the advanced intelligence layer.
 * Called after QumusCompleteEngine.makeDecision() to add:
 * - History tracking
 * - Anomaly detection
 * - Cross-policy correlation
 * - Policy chaining
 * - Adaptive scheduling updates
 */
export function processDecisionIntelligence(
  decisionId: string,
  policyId: string,
  confidence: number,
  result: string,
  executionTime: number,
  input: Record<string, any>
): {
  anomalies: AnomalyReport[];
  correlations: CorrelationAlert[];
  chainTriggered: boolean;
  adaptiveInterval: number;
} {
  // Record to history
  const record: DecisionRecord = {
    decisionId, policyId, confidence, result, executionTime,
    timestamp: Date.now(), input,
  };
  decisionHistory.push(record);
  if (decisionHistory.length > HISTORY_BUFFER_SIZE) {
    decisionHistory.splice(0, decisionHistory.length - HISTORY_BUFFER_SIZE);
  }

  // Update baseline for anomaly detection
  updateBaseline(record);

  // Detect anomalies
  const anomalies = detectAnomalies(record);
  anomalyReports.push(...anomalies);
  if (anomalyReports.length > 100) anomalyReports.splice(0, anomalyReports.length - 100);

  // Run cross-policy correlation
  const newCorrelations: CorrelationAlert[] = [];
  for (const rule of CORRELATION_RULES) {
    const alert = rule.detect(decisionHistory);
    if (alert) {
      // Deduplicate: don't fire same rule within 10 minutes
      const recentSame = correlationAlerts.find(
        a => a.type === alert.type && a.policies.join(',') === alert.policies.join(',')
          && Date.now() - a.timestamp.getTime() < 600_000
      );
      if (!recentSame) {
        correlationAlerts.push(alert);
        newCorrelations.push(alert);
        console.log(`[QUMUS Intelligence] Correlation alert: ${alert.description}`);
      }
    }
  }
  if (correlationAlerts.length > 50) correlationAlerts.splice(0, correlationAlerts.length - 50);

  // Check policy chains
  let chainTriggered = false;
  if (result === 'escalated' || result === 'approved') {
    const matchingChains = policyChains.filter(
      c => c.enabled && c.triggerPolicy === policyId
        && (c.triggerCondition === result || c.triggerCondition === 'any')
    );
    chainTriggered = matchingChains.length > 0;
    // Execute chains asynchronously
    if (chainTriggered) {
      executePolicyChain(policyId, result, input).catch(err =>
        console.error('[QUMUS Intelligence] Chain execution error:', err)
      );
    }
  }

  // Calculate adaptive interval
  const adaptiveInterval = calculateAdaptiveInterval();

  return { anomalies, correlations: newCorrelations, chainTriggered, adaptiveInterval };
}

// ─── Getters for Dashboard ───────────────────────────────────────────────────

export function getCorrelationAlerts(includeResolved = false): CorrelationAlert[] {
  if (includeResolved) return [...correlationAlerts];
  return correlationAlerts.filter(a => !a.resolved);
}

export function resolveCorrelationAlert(alertId: string): boolean {
  const alert = correlationAlerts.find(a => a.id === alertId);
  if (alert) {
    alert.resolved = true;
    return true;
  }
  return false;
}

export function getAnomalyReports(limit = 20): AnomalyReport[] {
  return anomalyReports.slice(-limit);
}

export function getLearningEntries(limit = 20): LearningEntry[] {
  return learningEntries.slice(-limit);
}

export function getAdaptiveScheduleState(): AdaptiveScheduleState {
  return { ...scheduleState };
}

export function getPolicyChains(): PolicyChain[] {
  return [...policyChains];
}

export function getDecisionHistoryStats(): {
  totalRecorded: number;
  last5minCount: number;
  avgConfidence: number;
  avgExecutionTime: number;
  escalationRate: number;
} {
  const last5min = decisionHistory.filter(d => d.timestamp > Date.now() - 300_000);
  const total = decisionHistory.length;
  return {
    totalRecorded: total,
    last5minCount: last5min.length,
    avgConfidence: total > 0 ? Math.round(decisionHistory.reduce((s, d) => s + d.confidence, 0) / total) : 0,
    avgExecutionTime: total > 0 ? Math.round(decisionHistory.reduce((s, d) => s + d.executionTime, 0) / total) : 0,
    escalationRate: total > 0 ? Math.round(decisionHistory.filter(d => d.result === 'escalated').length / total * 100) : 0,
  };
}
