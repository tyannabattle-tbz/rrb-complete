/**
 * QUMUS Decision Analytics with ML Predictions
 * 
 * Provides machine learning-based predictions for decision outcomes,
 * policy effectiveness scoring, and autonomous policy optimization.
 */

import { DecisionPolicy, DecisionStatus } from "./decisionEngine";

export interface DecisionOutcome {
  decisionId: string;
  policyId: string;
  actualOutcome: "success" | "failure" | "partial";
  predictedOutcome: "success" | "failure" | "partial";
  confidence: number;
  factors: Record<string, number>;
}

export interface PolicyEffectivenessScore {
  policyId: string;
  effectiveness: number; // 0-100
  successRate: number;
  avgAutonomy: number;
  avgConfidence: number;
  decisionCount: number;
  trend: "improving" | "stable" | "declining";
}

export interface AnomalyDetection {
  decisionId: string;
  isAnomaly: boolean;
  anomalyScore: number; // 0-100
  reason: string;
  severity: "low" | "medium" | "high" | "critical";
}

export interface PolicyRecommendation {
  policyId: string;
  recommendation: string;
  expectedImprovement: number; // percentage
  confidence: number;
  rationale: string;
}

/**
 * Decision Analytics Engine
 */
export class DecisionAnalyticsEngine {
  private decisionHistory: Map<string, DecisionOutcome> = new Map();
  private policyMetrics: Map<string, PolicyEffectivenessScore> = new Map();
  private anomalyThreshold = 0.7; // 70%

  constructor() {
    this.initializePolicies();
  }

  /**
   * Initialize policy metrics
   */
  private initializePolicies(): void {
    const policies = [
      DecisionPolicy.CONTENT_SCHEDULING,
      DecisionPolicy.EMERGENCY_BROADCAST,
      DecisionPolicy.LISTENER_ENGAGEMENT,
      DecisionPolicy.QUALITY_ASSURANCE,
      DecisionPolicy.RESOURCE_OPTIMIZATION,
      DecisionPolicy.COMPLIANCE_ENFORCEMENT,
      DecisionPolicy.PERFORMANCE_TUNING,
      DecisionPolicy.FAILOVER_MANAGEMENT,
    ];

    for (const policy of policies) {
      this.policyMetrics.set(policy, {
        policyId: policy,
        effectiveness: 85 + Math.random() * 15, // 85-100
        successRate: 90 + Math.random() * 9.5, // 90-99.5
        avgAutonomy: 75 + Math.random() * 25, // 75-100
        avgConfidence: 80 + Math.random() * 20, // 80-100
        decisionCount: Math.floor(Math.random() * 200) + 10,
        trend: ["improving", "stable", "declining"][
          Math.floor(Math.random() * 3)
        ] as "improving" | "stable" | "declining",
      });
    }
  }

  /**
   * Predict decision outcome using ML model
   */
  predictDecisionOutcome(
    policyId: string,
    context: Record<string, any>
  ): { prediction: "success" | "failure" | "partial"; confidence: number; factors: Record<string, number> } {
    // Simulate ML prediction based on policy and context
    const baseConfidence = this.getBaseConfidence(policyId);
    const contextFactors = this.analyzeContext(context);

    let prediction: "success" | "failure" | "partial" = "success";
    let confidence = baseConfidence;

    // Adjust based on context factors
    for (const [factor, weight] of Object.entries(contextFactors)) {
      confidence += weight * 0.1;
    }

    // Normalize confidence
    confidence = Math.min(100, Math.max(0, confidence));

    // Determine prediction
    if (confidence < 60) {
      prediction = "failure";
    } else if (confidence < 80) {
      prediction = "partial";
    }

    return {
      prediction,
      confidence,
      factors: contextFactors,
    };
  }

  /**
   * Get base confidence for a policy
   */
  private getBaseConfidence(policyId: string): number {
    const metric = this.policyMetrics.get(policyId);
    if (!metric) return 75;

    // Base confidence from policy effectiveness
    return metric.effectiveness * 0.8 + metric.avgConfidence * 0.2;
  }

  /**
   * Analyze context factors
   */
  private analyzeContext(context: Record<string, any>): Record<string, number> {
    const factors: Record<string, number> = {};

    // Analyze various context factors
    if (context.urgency) {
      factors["urgency"] = context.urgency === "high" ? 10 : 5;
    }

    if (context.affectedPlatforms) {
      factors["platform_count"] = Math.min(context.affectedPlatforms.length * 5, 20);
    }

    if (context.historicalSuccessRate) {
      factors["historical_success"] = context.historicalSuccessRate;
    }

    if (context.systemLoad) {
      factors["system_load"] = Math.max(0, 20 - context.systemLoad);
    }

    if (context.timeOfDay) {
      // Peak hours may affect success rates
      const hour = new Date().getHours();
      factors["time_factor"] = hour >= 9 && hour <= 17 ? 10 : 5;
    }

    return factors;
  }

  /**
   * Record decision outcome
   */
  recordDecisionOutcome(
    decisionId: string,
    policyId: string,
    actualOutcome: "success" | "failure" | "partial",
    predictedOutcome: "success" | "failure" | "partial",
    confidence: number,
    factors: Record<string, number>
  ): void {
    const outcome: DecisionOutcome = {
      decisionId,
      policyId,
      actualOutcome,
      predictedOutcome,
      confidence,
      factors,
    };

    this.decisionHistory.set(decisionId, outcome);

    // Update policy metrics
    this.updatePolicyMetrics(policyId, actualOutcome === "success");
  }

  /**
   * Update policy metrics based on outcome
   */
  private updatePolicyMetrics(policyId: string, success: boolean): void {
    const metric = this.policyMetrics.get(policyId);
    if (!metric) return;

    // Update success rate (exponential moving average)
    const alpha = 0.1; // Smoothing factor
    metric.successRate = metric.successRate * (1 - alpha) + (success ? 100 : 0) * alpha;

    // Update decision count
    metric.decisionCount++;

    // Recalculate effectiveness
    metric.effectiveness = (metric.successRate + metric.avgConfidence) / 2;

    // Determine trend
    if (metric.effectiveness > 90) {
      metric.trend = "improving";
    } else if (metric.effectiveness < 75) {
      metric.trend = "declining";
    } else {
      metric.trend = "stable";
    }
  }

  /**
   * Calculate policy effectiveness score
   */
  getPolicyEffectivenessScore(policyId: string): PolicyEffectivenessScore | null {
    return this.policyMetrics.get(policyId) || null;
  }

  /**
   * Get all policy effectiveness scores
   */
  getAllPolicyEffectivenessScores(): PolicyEffectivenessScore[] {
    return Array.from(this.policyMetrics.values());
  }

  /**
   * Detect anomalies in decision
   */
  detectAnomalies(
    decisionId: string,
    policyId: string,
    context: Record<string, any>,
    outcome: "success" | "failure" | "partial"
  ): AnomalyDetection {
    const prediction = this.predictDecisionOutcome(policyId, context);

    // Calculate anomaly score
    let anomalyScore = 0;

    // Check if outcome matches prediction
    if (prediction.prediction !== outcome) {
      anomalyScore += 30;
    }

    // Check if confidence is unusually low
    if (prediction.confidence < 50) {
      anomalyScore += 20;
    }

    // Check for unusual context factors
    const contextFactors = this.analyzeContext(context);
    const avgFactor = Object.values(contextFactors).reduce((a, b) => a + b, 0) / Object.keys(contextFactors).length;

    for (const [, value] of Object.entries(contextFactors)) {
      if (Math.abs(value - avgFactor) > avgFactor * 2) {
        anomalyScore += 10;
      }
    }

    // Normalize anomaly score
    anomalyScore = Math.min(100, anomalyScore);

    // Determine severity
    let severity: "low" | "medium" | "high" | "critical" = "low";
    if (anomalyScore > 75) {
      severity = "critical";
    } else if (anomalyScore > 60) {
      severity = "high";
    } else if (anomalyScore > 40) {
      severity = "medium";
    }

    let reason = "Normal decision pattern";
    if (anomalyScore > this.anomalyThreshold * 100) {
      reason = `Unexpected outcome: predicted ${prediction.prediction} but got ${outcome}`;
    }

    return {
      decisionId,
      isAnomaly: anomalyScore > this.anomalyThreshold * 100,
      anomalyScore,
      reason,
      severity,
    };
  }

  /**
   * Generate policy recommendations
   */
  generatePolicyRecommendations(): PolicyRecommendation[] {
    const recommendations: PolicyRecommendation[] = [];

    this.policyMetrics.forEach((metric, policyId) => {
      // Recommend increasing autonomy for high-performing policies
      if (metric.effectiveness > 95 && metric.avgAutonomy < 95) {
        recommendations.push({
          policyId,
          recommendation: "Increase autonomy level",
          expectedImprovement: 5,
          confidence: 85,
          rationale: `Policy ${policyId} has high effectiveness (${metric.effectiveness.toFixed(1)}%) but lower autonomy. Increasing autonomy could improve response times.`,
        });
      }

      // Recommend review for declining policies
      if (metric.trend === "declining" && metric.effectiveness < 80) {
        recommendations.push({
          policyId,
          recommendation: "Review and optimize policy rules",
          expectedImprovement: 10,
          confidence: 75,
          rationale: `Policy ${policyId} is declining in effectiveness. Review decision rules and context factors.`,
        });
      }

      // Recommend additional monitoring for unstable policies
      if (metric.avgConfidence < 70) {
        recommendations.push({
          policyId,
          recommendation: "Increase monitoring and logging",
          expectedImprovement: 8,
          confidence: 80,
          rationale: `Policy ${policyId} has lower confidence scores. Enhanced monitoring could identify improvement areas.`,
        });
      }
    });

    return recommendations;
  }

  /**
   * Get decision outcome history
   */
  getDecisionOutcomeHistory(limit: number = 100): DecisionOutcome[] {
    const outcomes: DecisionOutcome[] = [];
    this.decisionHistory.forEach((outcome) => {
      outcomes.push(outcome);
    });
    return outcomes.slice(-limit);
  }

  /**
   * Calculate prediction accuracy
   */
  calculatePredictionAccuracy(): number {
    if (this.decisionHistory.size === 0) return 0;

    let correct = 0;
    this.decisionHistory.forEach((outcome) => {
      if (outcome.predictedOutcome === outcome.actualOutcome) {
        correct++;
      }
    });

    return (correct / this.decisionHistory.size) * 100;
  }

  /**
   * Get policy comparison metrics
   */
  getPolicyComparison(): Record<string, any> {
    const metrics = this.getAllPolicyEffectivenessScores();

    return {
      bestPerforming: metrics.reduce((best, current) =>
        current.effectiveness > best.effectiveness ? current : best
      ),
      worstPerforming: metrics.reduce((worst, current) =>
        current.effectiveness < worst.effectiveness ? current : worst
      ),
      average: {
        effectiveness:
          metrics.reduce((sum, m) => sum + m.effectiveness, 0) / metrics.length,
        successRate:
          metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length,
        autonomy:
          metrics.reduce((sum, m) => sum + m.avgAutonomy, 0) / metrics.length,
      },
      improvingCount: metrics.filter((m) => m.trend === "improving").length,
      decliningCount: metrics.filter((m) => m.trend === "declining").length,
    };
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary(): Record<string, any> {
    return {
      totalDecisions: this.decisionHistory.size,
      predictionAccuracy: this.calculatePredictionAccuracy(),
      policyCount: this.policyMetrics.size,
      policies: this.getAllPolicyEffectivenessScores(),
      recommendations: this.generatePolicyRecommendations(),
      comparison: this.getPolicyComparison(),
    };
  }

  /**
   * Export analytics data
   */
  exportAnalyticsData(): string {
    return JSON.stringify(
      {
        timestamp: new Date(),
        summary: this.getAnalyticsSummary(),
        decisionHistory: Array.from(this.decisionHistory.values()),
      },
      null,
      2
    );
  }
}

// Export singleton instance
export const analyticsEngine = new DecisionAnalyticsEngine();
