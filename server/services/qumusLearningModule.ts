import { tyOSStatusFeed } from './tyOSStatusFeed';

/**
 * QUMUS Learning Module
 * Learns from past decisions and optimizes policy execution
 * Analyzes patterns and improves ecosystem performance
 */

export interface DecisionRecord {
  policyId: string;
  timestamp: number;
  input: any;
  decision: any;
  outcome: 'success' | 'failure' | 'partial' | 'unknown';
  impact: number; // -100 to 100
  subsystem: string;
}

export interface PolicyPattern {
  policyId: string;
  successRate: number; // 0-100
  averageImpact: number;
  totalDecisions: number;
  lastUpdated: number;
  recommendations: string[];
}

export interface LearningInsight {
  id: string;
  type: 'pattern' | 'optimization' | 'risk' | 'opportunity';
  description: string;
  affectedPolicies: string[];
  confidence: number; // 0-100
  actionable: boolean;
  suggestedAction?: string;
  timestamp: number;
}

export class QUMUSLearningModule {
  private decisionHistory: DecisionRecord[] = [];
  private policyPatterns: Map<string, PolicyPattern> = new Map();
  private insights: LearningInsight[] = [];
  private learningInterval: NodeJS.Timeout | null = null;
  private maxHistorySize = 10000;
  private analysisThreshold = 50; // Analyze after 50 decisions

  constructor() {
    this.initializeLearning();
  }

  private initializeLearning() {
    console.log('[QUMUS Learning Module] Initialized - Ready to learn from decisions');

    // Initialize with 20 core policies
    const corePolicies = [
      'health_monitoring',
      'auto_sync',
      'load_balancing',
      'predictive_maintenance',
      'self_upgrade',
      'error_recovery',
      'performance_optimization',
      'security_monitoring',
      'resource_allocation',
      'content_distribution',
      'user_engagement',
      'system_resilience',
      'data_integrity',
      'network_optimization',
      'cache_management',
      'backup_strategy',
      'anomaly_detection',
      'cost_optimization',
      'quality_assurance',
      'innovation_tracking',
    ];

    corePolicies.forEach((policyId) => {
      this.policyPatterns.set(policyId, {
        policyId,
        successRate: 85,
        averageImpact: 0,
        totalDecisions: 0,
        lastUpdated: Date.now(),
        recommendations: [],
      });
    });

    // Start learning loop
    this.startLearningLoop();
  }

  /**
   * Start learning loop
   */
  private startLearningLoop() {
    this.learningInterval = setInterval(() => {
      this.analyzePatterns();
      this.generateInsights();
    }, 300000); // Analyze every 5 minutes
  }

  /**
   * Record a decision
   */
  recordDecision(record: Omit<DecisionRecord, 'timestamp'>): void {
    const fullRecord: DecisionRecord = {
      ...record,
      timestamp: Date.now(),
    };

    this.decisionHistory.push(fullRecord);

    // Maintain max history size
    if (this.decisionHistory.length > this.maxHistorySize) {
      this.decisionHistory.shift();
    }

    // Update policy pattern
    const pattern = this.policyPatterns.get(record.policyId);
    if (pattern) {
      pattern.totalDecisions++;
      pattern.lastUpdated = Date.now();

      // Update success rate
      if (record.outcome === 'success') {
        pattern.successRate = Math.min(100, pattern.successRate + 0.5);
      } else if (record.outcome === 'failure') {
        pattern.successRate = Math.max(0, pattern.successRate - 2);
      }

      // Update average impact
      pattern.averageImpact = (pattern.averageImpact * (pattern.totalDecisions - 1) + record.impact) / pattern.totalDecisions;
    }

    // Trigger analysis if threshold reached
    if (this.decisionHistory.length % this.analysisThreshold === 0) {
      this.analyzePatterns();
    }
  }

  /**
   * Analyze patterns in decision history
   */
  private analyzePatterns(): void {
    console.log('[QUMUS Learning] Analyzing patterns from', this.decisionHistory.length, 'decisions');

    for (const [policyId, pattern] of this.policyPatterns) {
      const policyDecisions = this.decisionHistory.filter((d) => d.policyId === policyId);

      if (policyDecisions.length === 0) continue;

      // Calculate success rate
      const successes = policyDecisions.filter((d) => d.outcome === 'success').length;
      pattern.successRate = (successes / policyDecisions.length) * 100;

      // Calculate average impact
      const totalImpact = policyDecisions.reduce((sum, d) => sum + d.impact, 0);
      pattern.averageImpact = totalImpact / policyDecisions.length;

      // Generate recommendations
      pattern.recommendations = this.generateRecommendations(policyId, policyDecisions, pattern);
    }
  }

  /**
   * Generate recommendations for a policy
   */
  private generateRecommendations(policyId: string, decisions: DecisionRecord[], pattern: PolicyPattern): string[] {
    const recommendations: string[] = [];

    // Low success rate
    if (pattern.successRate < 70) {
      recommendations.push(`${policyId}: Success rate is ${pattern.successRate.toFixed(1)}% - review policy logic`);
    }

    // High negative impact
    if (pattern.averageImpact < -20) {
      recommendations.push(`${policyId}: Average impact is negative (${pattern.averageImpact.toFixed(1)}) - consider adjusting parameters`);
    }

    // Increasing failures
    const recentDecisions = decisions.slice(-10);
    const recentFailures = recentDecisions.filter((d) => d.outcome === 'failure').length;
    if (recentFailures > 5) {
      recommendations.push(`${policyId}: Recent failure rate increasing (${recentFailures}/10) - investigate root cause`);
    }

    // Positive trend
    if (pattern.successRate > 95 && pattern.averageImpact > 50) {
      recommendations.push(`${policyId}: Excellent performance - consider expanding scope`);
    }

    return recommendations;
  }

  /**
   * Generate insights from patterns
   */
  private generateInsights(): void {
    const newInsights: LearningInsight[] = [];

    // Analyze all policies
    for (const [policyId, pattern] of this.policyPatterns) {
      // Pattern-based insights
      if (pattern.totalDecisions > 100) {
        const insight: LearningInsight = {
          id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'pattern',
          description: `${policyId} shows consistent ${pattern.successRate.toFixed(1)}% success rate`,
          affectedPolicies: [policyId],
          confidence: Math.min(100, 50 + pattern.totalDecisions / 10),
          actionable: pattern.recommendations.length > 0,
          suggestedAction: pattern.recommendations[0],
          timestamp: Date.now(),
        };
        newInsights.push(insight);
      }

      // Optimization opportunities
      if (pattern.averageImpact > 30 && pattern.successRate > 80) {
        const insight: LearningInsight = {
          id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'opportunity',
          description: `${policyId} is high-performing - opportunity to increase priority`,
          affectedPolicies: [policyId],
          confidence: 75,
          actionable: true,
          suggestedAction: `Increase execution frequency for ${policyId}`,
          timestamp: Date.now(),
        };
        newInsights.push(insight);
      }

      // Risk detection
      if (pattern.successRate < 60) {
        const insight: LearningInsight = {
          id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'risk',
          description: `${policyId} has low success rate (${pattern.successRate.toFixed(1)}%)`,
          affectedPolicies: [policyId],
          confidence: 90,
          actionable: true,
          suggestedAction: `Review and update ${policyId} logic`,
          timestamp: Date.now(),
        };
        newInsights.push(insight);
      }
    }

    // Add new insights
    this.insights.push(...newInsights);

    // Keep only recent insights
    if (this.insights.length > 100) {
      this.insights = this.insights.slice(-100);
    }

    if (newInsights.length > 0) {
      console.log(`[QUMUS Learning] Generated ${newInsights.length} new insights`);
    }
  }

  /**
   * Get policy performance
   */
  getPolicyPerformance(policyId: string): PolicyPattern | undefined {
    return this.policyPatterns.get(policyId);
  }

  /**
   * Get all policy patterns
   */
  getAllPolicyPatterns(): Map<string, PolicyPattern> {
    return new Map(this.policyPatterns);
  }

  /**
   * Get recent insights
   */
  getRecentInsights(limit: number = 20): LearningInsight[] {
    return this.insights.slice(-limit);
  }

  /**
   * Get actionable insights
   */
  getActionableInsights(): LearningInsight[] {
    return this.insights.filter((i) => i.actionable && i.confidence > 70);
  }

  /**
   * Get risk insights
   */
  getRiskInsights(): LearningInsight[] {
    return this.insights.filter((i) => i.type === 'risk');
  }

  /**
   * Get opportunity insights
   */
  getOpportunityInsights(): LearningInsight[] {
    return this.insights.filter((i) => i.type === 'opportunity');
  }

  /**
   * Get learning statistics
   */
  getLearningStats() {
    const totalDecisions = this.decisionHistory.length;
    const successCount = this.decisionHistory.filter((d) => d.status === 'success').length;
    const failureCount = this.decisionHistory.filter((d) => d.outcome === 'failure').length;
    const averageImpact =
      this.decisionHistory.length > 0
        ? this.decisionHistory.reduce((sum, d) => sum + d.impact, 0) / this.decisionHistory.length
        : 0;

    return {
      totalDecisions,
      successCount,
      failureCount,
      successRate: totalDecisions > 0 ? (successCount / totalDecisions) * 100 : 0,
      averageImpact,
      totalInsights: this.insights.length,
      actionableInsights: this.getActionableInsights().length,
      riskInsights: this.getRiskInsights().length,
      opportunityInsights: this.getOpportunityInsights().length,
    };
  }

  /**
   * Export learning data
   */
  exportLearningData() {
    return {
      timestamp: Date.now(),
      decisionHistory: this.decisionHistory.slice(-1000), // Last 1000 decisions
      policyPatterns: Array.from(this.policyPatterns.entries()),
      insights: this.insights.slice(-100),
      statistics: this.getLearningStats(),
    };
  }

  /**
   * Stop learning
   */
  stop(): void {
    if (this.learningInterval) {
      clearInterval(this.learningInterval);
    }
    console.log('[QUMUS Learning Module] Stopped');
  }
}

// Singleton instance
export const qumusLearningModule = new QUMUSLearningModule();
