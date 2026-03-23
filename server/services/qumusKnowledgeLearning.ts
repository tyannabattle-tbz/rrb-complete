/**
 * QUMUS Knowledge Base & Learning System
 * Stores ecosystem knowledge, learns from decisions, and improves over time
 */

export interface KnowledgeEntry {
  id: string;
  category: string;
  topic: string;
  content: string;
  source: string;
  confidence: number; // 0-100
  lastUpdated: number;
  usageCount: number;
  effectiveness: number; // 0-100
}

export interface LearningRecord {
  id: string;
  decisionId: string;
  policyId: string;
  action: string;
  outcome: 'success' | 'partial' | 'failure';
  impact: number; // -100 to 100
  timestamp: number;
  feedback?: string;
}

export interface InsightPattern {
  id: string;
  pattern: string;
  frequency: number;
  successRate: number;
  recommendation: string;
  confidence: number;
}

class QUMUSKnowledgeLearning {
  private knowledgeBase: Map<string, KnowledgeEntry> = new Map();
  private learningRecords: LearningRecord[] = [];
  private patterns: Map<string, InsightPattern> = new Map();
  private policyEffectiveness: Map<string, number> = new Map();
  private learningStats = {
    totalLearnings: 0,
    successfulLearnings: 0,
    failedLearnings: 0,
    patternsIdentified: 0,
    improvementRate: 0,
  };

  constructor() {
    this.initializeKnowledgeBase();
    this.startLearningLoop();
  }

  private initializeKnowledgeBase() {
    const initialKnowledge: KnowledgeEntry[] = [
      {
        id: 'kb-001',
        category: 'optimization',
        topic: 'cache-strategies',
        content: 'LRU cache is effective for most workloads. Consider LFU for specific patterns.',
        source: 'system-experience',
        confidence: 85,
        lastUpdated: Date.now(),
        usageCount: 0,
        effectiveness: 85,
      },
      {
        id: 'kb-002',
        category: 'maintenance',
        topic: 'database-optimization',
        content: 'Regular index analysis and query optimization reduces response time by 30-50%.',
        source: 'system-experience',
        confidence: 90,
        lastUpdated: Date.now(),
        usageCount: 0,
        effectiveness: 90,
      },
      {
        id: 'kb-003',
        category: 'security',
        topic: 'vulnerability-patching',
        content: 'Critical vulnerabilities should be patched within 24 hours. Test in staging first.',
        source: 'system-policy',
        confidence: 95,
        lastUpdated: Date.now(),
        usageCount: 0,
        effectiveness: 95,
      },
      {
        id: 'kb-004',
        category: 'performance',
        topic: 'scaling-strategy',
        content: 'Horizontal scaling is preferred for stateless services. Vertical scaling for databases.',
        source: 'system-experience',
        confidence: 80,
        lastUpdated: Date.now(),
        usageCount: 0,
        effectiveness: 80,
      },
      {
        id: 'kb-005',
        category: 'content',
        topic: 'scheduling-optimization',
        content: 'Peak engagement occurs 7-9 PM and 12-1 PM. Schedule important content accordingly.',
        source: 'analytics',
        confidence: 75,
        lastUpdated: Date.now(),
        usageCount: 0,
        effectiveness: 75,
      },
      {
        id: 'kb-006',
        category: 'user-experience',
        topic: 'personalization',
        content: 'Personalization increases engagement by 40-60%. Focus on content recommendations.',
        source: 'analytics',
        confidence: 85,
        lastUpdated: Date.now(),
        usageCount: 0,
        effectiveness: 85,
      },
    ];

    initialKnowledge.forEach((entry) => {
      this.knowledgeBase.set(entry.id, entry);
    });

    console.log(`[Learning] Knowledge base initialized with ${initialKnowledge.length} entries`);
  }

  recordLearning(
    decisionId: string,
    policyId: string,
    action: string,
    outcome: 'success' | 'partial' | 'failure',
    impact: number,
    feedback?: string
  ): LearningRecord {
    const record: LearningRecord = {
      id: `learn-${Date.now()}-${Math.random()}`,
      decisionId,
      policyId,
      action,
      outcome,
      impact,
      timestamp: Date.now(),
      feedback,
    };

    this.learningRecords.push(record);
    this.learningStats.totalLearnings++;

    if (outcome === 'success') {
      this.learningStats.successfulLearnings++;
    } else if (outcome === 'failure') {
      this.learningStats.failedLearnings++;
    }

    // Update policy effectiveness
    const currentEffectiveness = this.policyEffectiveness.get(policyId) || 50;
    const newEffectiveness = currentEffectiveness + impact / 10;
    this.policyEffectiveness.set(policyId, Math.max(0, Math.min(100, newEffectiveness)));

    console.log(`[Learning] Learning recorded: ${action} - ${outcome} (impact: ${impact})`);
    return record;
  }

  private startLearningLoop() {
    setInterval(async () => {
      await this.analyzePatterns();
      await this.updateEffectiveness();
      await this.generateInsights();
    }, 60000); // Every minute
  }

  private async analyzePatterns() {
    if (this.learningRecords.length < 10) return;

    const recentRecords = this.learningRecords.slice(-100);
    const actionCounts: Record<string, number> = {};
    const actionSuccesses: Record<string, number> = {};

    for (const record of recentRecords) {
      actionCounts[record.action] = (actionCounts[record.action] || 0) + 1;
      if (record.outcome === 'success') {
        actionSuccesses[record.action] = (actionSuccesses[record.action] || 0) + 1;
      }
    }

    for (const [action, count] of Object.entries(actionCounts)) {
      const successCount = actionSuccesses[action] || 0;
      const successRate = (successCount / count) * 100;

      if (successRate > 70) {
        const pattern: InsightPattern = {
          id: `pattern-${Date.now()}-${Math.random()}`,
          pattern: action,
          frequency: count,
          successRate,
          recommendation: `${action} is effective. Consider using more frequently.`,
          confidence: Math.min(100, 50 + successRate / 2),
        };

        this.patterns.set(action, pattern);
      }
    }

    console.log(`[Learning] Patterns analyzed. Found ${this.patterns.size} patterns`);
  }

  private async updateEffectiveness() {
    for (const [policyId, effectiveness] of this.policyEffectiveness) {
      // Gradually converge to actual effectiveness based on recent results
      const recentRecords = this.learningRecords
        .filter((r) => r.policyId === policyId)
        .slice(-20);

      if (recentRecords.length > 0) {
        const avgImpact = recentRecords.reduce((sum, r) => sum + r.impact, 0) / recentRecords.length;
        const newEffectiveness = effectiveness + avgImpact / 20;
        this.policyEffectiveness.set(policyId, Math.max(0, Math.min(100, newEffectiveness)));
      }
    }
  }

  private async generateInsights() {
    const insights = [];

    // Analyze success rate
    const successRate = this.learningStats.successfulLearnings / this.learningStats.totalLearnings;
    if (successRate > 0.8) {
      insights.push('System is operating at high effectiveness. Continue current strategy.');
    } else if (successRate < 0.5) {
      insights.push('Success rate is low. Consider reviewing policies and decision logic.');
    }

    // Analyze most effective policies
    const topPolicies = Array.from(this.policyEffectiveness.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (topPolicies.length > 0) {
      insights.push(`Top performing policies: ${topPolicies.map((p) => p[0]).join(', ')}`);
    }

    // Calculate improvement rate
    if (this.learningRecords.length > 20) {
      const oldRecords = this.learningRecords.slice(0, 10);
      const newRecords = this.learningRecords.slice(-10);

      const oldSuccessRate = oldRecords.filter((r) => r.outcome === 'success').length / oldRecords.length;
      const newSuccessRate = newRecords.filter((r) => r.outcome === 'success').length / newRecords.length;

      this.learningStats.improvementRate = ((newSuccessRate - oldSuccessRate) / oldSuccessRate) * 100;
    }

    console.log('[Learning] Insights generated:', insights);
  }

  addKnowledge(category: string, topic: string, content: string, source: string, confidence: number = 75): KnowledgeEntry {
    const entry: KnowledgeEntry = {
      id: `kb-${Date.now()}-${Math.random()}`,
      category,
      topic,
      content,
      source,
      confidence,
      lastUpdated: Date.now(),
      usageCount: 0,
      effectiveness: confidence,
    };

    this.knowledgeBase.set(entry.id, entry);
    console.log(`[Learning] Knowledge added: ${topic}`);
    return entry;
  }

  getKnowledge(category?: string, topic?: string): KnowledgeEntry[] {
    let results = Array.from(this.knowledgeBase.values());

    if (category) {
      results = results.filter((k) => k.category === category);
    }

    if (topic) {
      results = results.filter((k) => k.topic === topic);
    }

    // Sort by effectiveness and confidence
    results.sort((a, b) => {
      const scoreA = a.effectiveness * (a.confidence / 100);
      const scoreB = b.effectiveness * (b.confidence / 100);
      return scoreB - scoreA;
    });

    // Update usage count
    results.forEach((k) => k.usageCount++);

    return results;
  }

  getPatterns(): InsightPattern[] {
    return Array.from(this.patterns.values()).sort((a, b) => b.successRate - a.successRate);
  }

  getPolicyEffectiveness(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [policy, effectiveness] of this.policyEffectiveness) {
      result[policy] = parseFloat(effectiveness.toFixed(2));
    }
    return result;
  }

  getLearningStats() {
    return {
      totalLearnings: this.learningStats.totalLearnings,
      successfulLearnings: this.learningStats.successfulLearnings,
      failedLearnings: this.learningStats.failedLearnings,
      successRate: this.learningStats.totalLearnings > 0
        ? ((this.learningStats.successfulLearnings / this.learningStats.totalLearnings) * 100).toFixed(2) + '%'
        : 'N/A',
      improvementRate: this.learningStats.improvementRate.toFixed(2) + '%',
      patternsIdentified: this.patterns.size,
      knowledgeEntries: this.knowledgeBase.size,
    };
  }

  getLearningHistory(limit: number = 50): LearningRecord[] {
    return this.learningRecords.slice(-limit).reverse();
  }

  getRecommendations(): string[] {
    const recommendations: string[] = [];

    // Based on patterns
    for (const pattern of this.getPatterns()) {
      if (pattern.successRate > 80) {
        recommendations.push(pattern.recommendation);
      }
    }

    // Based on policy effectiveness
    const leastEffective = Array.from(this.policyEffectiveness.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3);

    leastEffective.forEach(([policy, effectiveness]) => {
      if (effectiveness < 50) {
        recommendations.push(`Consider reviewing or disabling policy: ${policy} (effectiveness: ${effectiveness.toFixed(2)}%)`);
      }
    });

    return recommendations;
  }

  getComprehensiveReport() {
    return {
      stats: this.getLearningStats(),
      topPatterns: this.getPatterns().slice(0, 5),
      policyEffectiveness: this.getPolicyEffectiveness(),
      recommendations: this.getRecommendations(),
      recentLearnings: this.getLearningHistory(10),
      knowledgeBase: Array.from(this.knowledgeBase.values()).slice(0, 10),
      timestamp: Date.now(),
    };
  }
}

export const qumusKnowledgeLearning = new QUMUSKnowledgeLearning();
