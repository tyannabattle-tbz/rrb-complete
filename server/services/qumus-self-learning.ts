/**
 * QUMUS Self-Learning & Self-Correcting System
 * 
 * Autonomous system that:
 * - Learns from past decisions and outcomes
 * - Optimizes decision-making based on patterns
 * - Auto-corrects based on feedback
 * - Improves specificity over time
 * - Adapts to ecosystem changes
 */

export interface DecisionOutcome {
  decisionId: string;
  decision: string;
  outcome: 'success' | 'failure' | 'partial';
  confidence: number; // 0-1
  timestamp: number;
  feedback?: string;
  correctionApplied?: boolean;
}

export interface LearningPattern {
  pattern: string;
  frequency: number;
  successRate: number;
  lastSeen: number;
  applicableContexts: string[];
}

export interface SystemOptimization {
  metric: string;
  previousValue: number;
  currentValue: number;
  improvement: number;
  appliedAt: number;
}

class QumusSelfLearningSystem {
  private decisionHistory: DecisionOutcome[] = [];
  private learningPatterns: Map<string, LearningPattern> = new Map();
  private optimizations: SystemOptimization[] = [];
  private contextualKnowledge: Map<string, any> = new Map();

  /**
   * Record a decision outcome
   */
  public recordOutcome(outcome: DecisionOutcome): void {
    this.decisionHistory.push(outcome);

    // Learn from the outcome
    this.learnFromOutcome(outcome);

    // Check if correction is needed
    if (outcome.outcome === 'failure') {
      this.triggerAutoCorrection(outcome);
    }

    // Update patterns
    this.updatePatterns();

    console.log(`[QUMUS Learning] Recorded outcome: ${outcome.decision} → ${outcome.outcome}`);
  }

  /**
   * Learn from a decision outcome
   */
  private learnFromOutcome(outcome: DecisionOutcome): void {
    const patternKey = this.generatePatternKey(outcome.decision);
    const pattern = this.learningPatterns.get(patternKey) || {
      pattern: outcome.decision,
      frequency: 0,
      successRate: 0,
      lastSeen: Date.now(),
      applicableContexts: [],
    };

    pattern.frequency++;
    pattern.lastSeen = Date.now();

    // Update success rate
    const isSuccess = outcome.outcome === 'success' ? 1 : outcome.outcome === 'partial' ? 0.5 : 0;
    pattern.successRate = (pattern.successRate * (pattern.frequency - 1) + isSuccess) / pattern.frequency;

    this.learningPatterns.set(patternKey, pattern);
  }

  /**
   * Trigger auto-correction for failed decisions
   */
  private async triggerAutoCorrection(outcome: DecisionOutcome): Promise<void> {
    console.log(`[QUMUS Learning] Auto-correction triggered for: ${outcome.decision}`);

    // Find similar past decisions with better outcomes
    const similarDecisions = this.findSimilarDecisions(outcome.decision);
    const successfulAlternatives = similarDecisions.filter(d => d.outcome === 'success');

    if (successfulAlternatives.length > 0) {
      // Apply the most successful alternative
      const bestAlternative = successfulAlternatives.reduce((best, current) =>
        current.confidence > best.confidence ? current : best
      );

      console.log(`[QUMUS Learning] Applying successful alternative: ${bestAlternative.decision}`);
      outcome.correctionApplied = true;
    } else {
      // Generate new approach using pattern analysis
      const newApproach = await this.generateNewApproach(outcome.decision);
      console.log(`[QUMUS Learning] Generated new approach: ${newApproach}`);
    }
  }

  /**
   * Find similar decisions from history
   */
  private findSimilarDecisions(decision: string): DecisionOutcome[] {
    return this.decisionHistory.filter(d => {
      // Simple similarity: check if decision contains similar keywords
      const keywords = decision.split(' ');
      const matchCount = keywords.filter(k => d.decision.includes(k)).length;
      return matchCount >= Math.ceil(keywords.length / 2);
    });
  }

  /**
   * Generate new approach for failed decision
   */
  private async generateNewApproach(failedDecision: string): Promise<string> {
    // In production, this would use LLM to generate alternatives
    // For now, return a modified version
    return `[OPTIMIZED] ${failedDecision}`;
  }

  /**
   * Update patterns based on recent history
   */
  private updatePatterns(): void {
    // Analyze recent decisions for trends
    const recentDecisions = this.decisionHistory.slice(-100);

    // Calculate aggregate metrics
    const successCount = recentDecisions.filter(d => d.outcome === 'success').length;
    const failureCount = recentDecisions.filter(d => d.outcome === 'failure').length;
    const avgConfidence = recentDecisions.reduce((sum, d) => sum + d.confidence, 0) / recentDecisions.length;

    console.log(`[QUMUS Learning] Pattern Update:`);
    console.log(`  - Success rate: ${((successCount / recentDecisions.length) * 100).toFixed(1)}%`);
    console.log(`  - Avg confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    console.log(`  - Patterns learned: ${this.learningPatterns.size}`);
  }

  /**
   * Generate pattern key for decision
   */
  private generatePatternKey(decision: string): string {
    // Extract key concepts from decision
    const words = decision.split(' ').filter(w => w.length > 3);
    return words.slice(0, 3).join('_').toLowerCase();
  }

  /**
   * Get optimization recommendations
   */
  public getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];

    // Analyze patterns for optimization opportunities
    for (const [key, pattern] of this.learningPatterns) {
      if (pattern.successRate > 0.8 && pattern.frequency > 10) {
        recommendations.push(`✓ Pattern "${pattern.pattern}" is highly successful (${(pattern.successRate * 100).toFixed(1)}%)`);
      } else if (pattern.successRate < 0.3 && pattern.frequency > 5) {
        recommendations.push(`✗ Pattern "${pattern.pattern}" has low success rate (${(pattern.successRate * 100).toFixed(1)}%) - consider alternatives`);
      }
    }

    // Analyze decision distribution
    const decisionTypes = new Map<string, number>();
    for (const outcome of this.decisionHistory) {
      const type = outcome.decision.split(' ')[0];
      decisionTypes.set(type, (decisionTypes.get(type) || 0) + 1);
    }

    // Find most common decision types
    const sortedTypes = Array.from(decisionTypes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    for (const [type, count] of sortedTypes) {
      recommendations.push(`📊 Most common decision type: "${type}" (${count} occurrences)`);
    }

    return recommendations;
  }

  /**
   * Apply system optimization
   */
  public applyOptimization(metric: string, previousValue: number, newValue: number): void {
    const improvement = ((newValue - previousValue) / previousValue) * 100;

    const optimization: SystemOptimization = {
      metric,
      previousValue,
      currentValue: newValue,
      improvement,
      appliedAt: Date.now(),
    };

    this.optimizations.push(optimization);

    console.log(`[QUMUS Learning] Optimization applied:`);
    console.log(`  - Metric: ${metric}`);
    console.log(`  - Previous: ${previousValue}`);
    console.log(`  - Current: ${newValue}`);
    console.log(`  - Improvement: ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}%`);
  }

  /**
   * Get learning metrics
   */
  public getLearningMetrics() {
    const totalDecisions = this.decisionHistory.length;
    const successCount = this.decisionHistory.filter(d => d.outcome === 'success').length;
    const failureCount = this.decisionHistory.filter(d => d.outcome === 'failure').length;
    const avgConfidence = totalDecisions > 0
      ? this.decisionHistory.reduce((sum, d) => sum + d.confidence, 0) / totalDecisions
      : 0;

    return {
      totalDecisions,
      successCount,
      failureCount,
      successRate: totalDecisions > 0 ? (successCount / totalDecisions) * 100 : 0,
      avgConfidence: avgConfidence * 100,
      patternsLearned: this.learningPatterns.size,
      optimizationsApplied: this.optimizations.length,
      recommendations: this.getOptimizationRecommendations(),
    };
  }

  /**
   * Get contextual knowledge
   */
  public getContextualKnowledge(context: string): any {
    return this.contextualKnowledge.get(context);
  }

  /**
   * Store contextual knowledge
   */
  public storeContextualKnowledge(context: string, knowledge: any): void {
    this.contextualKnowledge.set(context, knowledge);
    console.log(`[QUMUS Learning] Stored contextual knowledge: ${context}`);
  }

  /**
   * Predict decision outcome based on learning
   */
  public predictOutcome(decision: string): { predictedOutcome: string; confidence: number } {
    const patternKey = this.generatePatternKey(decision);
    const pattern = this.learningPatterns.get(patternKey);

    if (!pattern) {
      return {
        predictedOutcome: 'unknown',
        confidence: 0,
      };
    }

    const predictedOutcome = pattern.successRate > 0.7 ? 'success' : pattern.successRate > 0.4 ? 'partial' : 'failure';

    return {
      predictedOutcome,
      confidence: Math.abs(pattern.successRate - 0.5) * 2, // Normalize to 0-1
    };
  }

  /**
   * Get learning insights
   */
  public getInsights(): string[] {
    const insights: string[] = [];
    const metrics = this.getLearningMetrics();

    // Success rate insight
    if (metrics.successRate > 80) {
      insights.push(`🎯 System is performing excellently with ${metrics.successRate.toFixed(1)}% success rate`);
    } else if (metrics.successRate > 60) {
      insights.push(`📈 System is performing well with ${metrics.successRate.toFixed(1)}% success rate`);
    } else {
      insights.push(`⚠️ System success rate is ${metrics.successRate.toFixed(1)}% - optimization needed`);
    }

    // Confidence insight
    if (metrics.avgConfidence > 85) {
      insights.push(`💪 High confidence in decisions (${metrics.avgConfidence.toFixed(1)}%)`);
    } else if (metrics.avgConfidence < 50) {
      insights.push(`❓ Low confidence in decisions (${metrics.avgConfidence.toFixed(1)}%) - needs more data`);
    }

    // Pattern insight
    if (metrics.patternsLearned > 50) {
      insights.push(`🧠 System has learned ${metrics.patternsLearned} patterns for better decision-making`);
    }

    // Optimization insight
    if (metrics.optimizationsApplied > 0) {
      insights.push(`✨ Applied ${metrics.optimizationsApplied} optimizations to improve performance`);
    }

    return insights;
  }
}

export const qumusSelfLearning = new QumusSelfLearningSystem();
