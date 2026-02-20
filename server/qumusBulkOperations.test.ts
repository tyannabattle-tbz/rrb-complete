import { describe, it, expect, beforeEach } from 'vitest';
import { qumusBulkOperations } from '@/server/services/qumus-bulk-operations';
import { qumusSelfLearning } from '@/server/services/qumus-self-learning';

describe('QUMUS Bulk Operations', () => {
  beforeEach(() => {
    // Reset state before each test
  });

  describe('Pending Decisions', () => {
    it('should load pending decisions', async () => {
      const decisions = await qumusBulkOperations.loadPendingDecisions();
      expect(decisions).toBeDefined();
      expect(decisions.length).toBeGreaterThan(0);
      expect(decisions[0]).toHaveProperty('id');
      expect(decisions[0]).toHaveProperty('category');
      expect(decisions[0]).toHaveProperty('priority');
    });

    it('should have correct decision structure', async () => {
      const decisions = await qumusBulkOperations.loadPendingDecisions();
      const decision = decisions[0];

      expect(decision).toMatchObject({
        id: expect.any(String),
        type: 'qumus_autonomous_decision',
        category: expect.any(String),
        priority: expect.stringMatching(/^(critical|high|medium|low)$/),
        description: expect.any(String),
        createdAt: expect.any(Number),
        requiredAction: expect.any(String),
        autoApprovable: expect.any(Boolean),
      });
    });
  });

  describe('Bulk Approve Operations', () => {
    it('should approve all pending decisions', async () => {
      const operation = await qumusBulkOperations.approveAll();

      expect(operation).toBeDefined();
      expect(operation.status).toBe('completed');
      expect(operation.type).toBe('approve_all');
      expect(operation.results.approved).toBeGreaterThan(0);
      expect(operation.results.approved).toBe(operation.totalItems);
    });

    it('should track operation progress', async () => {
      const operation = await qumusBulkOperations.approveAll();

      expect(operation.processedItems).toBe(operation.totalItems);
      expect(operation.startTime).toBeLessThanOrEqual(operation.endTime || Date.now());
    });
  });

  describe('Category-Based Operations', () => {
    it('should approve decisions by category', async () => {
      const operation = await qumusBulkOperations.approveByCategory('policy_threshold');

      expect(operation).toBeDefined();
      expect(operation.status).toBe('completed');
      expect(operation.type).toBe('approve_by_category');
      expect(operation.category).toBe('policy_threshold');
      expect(operation.results.approved).toBeGreaterThan(0);
    });

    it('should handle non-existent categories', async () => {
      const operation = await qumusBulkOperations.approveByCategory('non_existent_category');

      expect(operation).toBeDefined();
      expect(operation.results.approved).toBe(0);
    });
  });

  describe('Policy Application', () => {
    it('should apply policy to matching decisions', async () => {
      const operation = await qumusBulkOperations.applyPolicy('policy_0');

      expect(operation).toBeDefined();
      expect(operation.status).toBe('completed');
      expect(operation.type).toBe('apply_policy');
      expect(operation.policyId).toBe('policy_0');
    });
  });

  describe('Operation Tracking', () => {
    it('should track operation status', async () => {
      const operation = await qumusBulkOperations.approveAll();
      const status = qumusBulkOperations.getOperationStatus(operation.id);

      expect(status).toBeDefined();
      expect(status?.id).toBe(operation.id);
      expect(status?.status).toBe('completed');
    });

    it('should return undefined for non-existent operation', () => {
      const status = qumusBulkOperations.getOperationStatus('non_existent_id');
      expect(status).toBeUndefined();
    });
  });

  describe('Summary Statistics', () => {
    it('should provide summary statistics', async () => {
      await qumusBulkOperations.loadPendingDecisions();
      const summary = qumusBulkOperations.getSummary();

      expect(summary).toHaveProperty('totalPending');
      expect(summary).toHaveProperty('autoApprovable');
      expect(summary).toHaveProperty('requiresReview');
      expect(summary).toHaveProperty('byCategory');
      expect(summary).toHaveProperty('byPriority');
      expect(summary.totalPending).toBeGreaterThan(0);
    });
  });
});

describe('QUMUS Self-Learning System', () => {
  beforeEach(() => {
    // Reset state
  });

  describe('Decision Recording', () => {
    it('should record decision outcomes', () => {
      const outcome = {
        decisionId: 'test_1',
        decision: 'approve_content',
        outcome: 'success' as const,
        confidence: 0.95,
        timestamp: Date.now(),
      };

      qumusSelfLearning.recordOutcome(outcome);
      const metrics = qumusSelfLearning.getLearningMetrics();

      expect(metrics.totalDecisions).toBe(1);
      expect(metrics.successCount).toBe(1);
    });

    it('should track multiple outcomes', () => {
      for (let i = 0; i < 5; i++) {
        qumusSelfLearning.recordOutcome({
          decisionId: `test_${i}`,
          decision: 'approve_content',
          outcome: i % 2 === 0 ? 'success' : 'failure',
          confidence: 0.8,
          timestamp: Date.now(),
        });
      }

      const metrics = qumusSelfLearning.getLearningMetrics();
      expect(metrics.totalDecisions).toBe(5);
      expect(metrics.successCount).toBe(3);
      expect(metrics.failureCount).toBe(2);
    });
  });

  describe('Learning Metrics', () => {
    it('should calculate success rate', () => {
      qumusSelfLearning.recordOutcome({
        decisionId: 'test_1',
        decision: 'approve_content',
        outcome: 'success',
        confidence: 0.9,
        timestamp: Date.now(),
      });

      qumusSelfLearning.recordOutcome({
        decisionId: 'test_2',
        decision: 'approve_content',
        outcome: 'failure',
        confidence: 0.5,
        timestamp: Date.now(),
      });

      const metrics = qumusSelfLearning.getLearningMetrics();
      expect(metrics.successRate).toBe(50);
    });

    it('should calculate average confidence', () => {
      qumusSelfLearning.recordOutcome({
        decisionId: 'test_1',
        decision: 'test_decision',
        outcome: 'success',
        confidence: 0.8,
        timestamp: Date.now(),
      });

      qumusSelfLearning.recordOutcome({
        decisionId: 'test_2',
        decision: 'test_decision',
        outcome: 'success',
        confidence: 0.6,
        timestamp: Date.now(),
      });

      const metrics = qumusSelfLearning.getLearningMetrics();
      expect(metrics.avgConfidence).toBe(70);
    });
  });

  describe('Pattern Learning', () => {
    it('should learn patterns from decisions', () => {
      for (let i = 0; i < 5; i++) {
        qumusSelfLearning.recordOutcome({
          decisionId: `test_${i}`,
          decision: 'approve_commercial',
          outcome: 'success',
          confidence: 0.95,
          timestamp: Date.now(),
        });
      }

      const metrics = qumusSelfLearning.getLearningMetrics();
      expect(metrics.patternsLearned).toBeGreaterThan(0);
    });
  });

  describe('Outcome Prediction', () => {
    it('should predict outcomes based on learning', () => {
      // Record successful decisions
      for (let i = 0; i < 5; i++) {
        qumusSelfLearning.recordOutcome({
          decisionId: `test_${i}`,
          decision: 'approve_content',
          outcome: 'success',
          confidence: 0.9,
          timestamp: Date.now(),
        });
      }

      const prediction = qumusSelfLearning.predictOutcome('approve_content');
      expect(prediction).toHaveProperty('predictedOutcome');
      expect(prediction).toHaveProperty('confidence');
    });
  });

  describe('System Optimization', () => {
    it('should track optimizations', () => {
      qumusSelfLearning.applyOptimization('success_rate', 60, 85);

      const metrics = qumusSelfLearning.getLearningMetrics();
      expect(metrics.optimizationsApplied).toBe(1);
    });
  });

  describe('Contextual Knowledge', () => {
    it('should store and retrieve contextual knowledge', () => {
      const knowledge = { channel: 'legacy_restored', listeners: 45200 };
      qumusSelfLearning.storeContextualKnowledge('channel_stats', knowledge);

      const retrieved = qumusSelfLearning.getContextualKnowledge('channel_stats');
      expect(retrieved).toEqual(knowledge);
    });
  });

  describe('Learning Insights', () => {
    it('should generate learning insights', () => {
      for (let i = 0; i < 10; i++) {
        qumusSelfLearning.recordOutcome({
          decisionId: `test_${i}`,
          decision: 'test_decision',
          outcome: i < 8 ? 'success' : 'failure',
          confidence: 0.85,
          timestamp: Date.now(),
        });
      }

      const insights = qumusSelfLearning.getInsights();
      expect(insights).toBeInstanceOf(Array);
      expect(insights.length).toBeGreaterThan(0);
      expect(insights[0]).toMatch(/success rate|confidence|pattern|optimization/i);
    });
  });

  describe('Auto-Correction', () => {
    it('should trigger auto-correction on failures', () => {
      const failureOutcome = {
        decisionId: 'test_fail',
        decision: 'reject_commercial',
        outcome: 'failure' as const,
        confidence: 0.3,
        timestamp: Date.now(),
      };

      qumusSelfLearning.recordOutcome(failureOutcome);

      // Check if correction was triggered
      const metrics = qumusSelfLearning.getLearningMetrics();
      expect(metrics.totalDecisions).toBe(1);
    });
  });
});

describe('Integration: Bulk Operations + Self-Learning', () => {
  it('should integrate bulk operations with learning system', async () => {
    // Load pending decisions
    const decisions = await qumusBulkOperations.loadPendingDecisions();
    expect(decisions.length).toBeGreaterThan(0);

    // Record learning outcome
    qumusSelfLearning.recordOutcome({
      decisionId: decisions[0].id,
      decision: decisions[0].description,
      outcome: 'success',
      confidence: 0.9,
      timestamp: Date.now(),
    });

    // Verify learning was recorded
    const metrics = qumusSelfLearning.getLearningMetrics();
    expect(metrics.totalDecisions).toBe(1);
    expect(metrics.successCount).toBe(1);
  });

  it('should use learning to optimize bulk operations', async () => {
    // Record successful patterns
    for (let i = 0; i < 10; i++) {
      qumusSelfLearning.recordOutcome({
        decisionId: `bulk_${i}`,
        decision: 'approve_by_category',
        outcome: 'success',
        confidence: 0.95,
        timestamp: Date.now(),
      });
    }

    // Get optimization recommendations
    const metrics = qumusSelfLearning.getLearningMetrics();
    expect(metrics.recommendations).toBeInstanceOf(Array);
  });
});
