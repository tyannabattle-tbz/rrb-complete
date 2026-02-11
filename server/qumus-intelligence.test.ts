import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the db module before importing
vi.mock('./db', () => ({
  getDb: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  })),
}));

// Mock drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  desc: vi.fn(),
  and: vi.fn(),
  sql: vi.fn(),
  gte: vi.fn(),
}));

// Mock schema
vi.mock('../drizzle/schema', () => ({
  qumusCorePolicies: {},
  qumusAutonomousActions: {},
  qumusHumanReview: {},
  qumusDecisionLogs: {},
  qumusMetrics: {},
  qumusPolicyRecommendations: {},
}));

describe('QUMUS Advanced Intelligence Module', () => {
  describe('processDecisionIntelligence', () => {
    it('should record decisions to history and return intelligence data', async () => {
      const { processDecisionIntelligence } = await import('./services/qumus-advanced-intelligence');

      const result = processDecisionIntelligence(
        'test_decision_1',
        'policy_recommendation_engine',
        85,
        'approved',
        45,
        { userId: 1001, contentType: 'music' }
      );

      expect(result).toHaveProperty('anomalies');
      expect(result).toHaveProperty('correlations');
      expect(result).toHaveProperty('chainTriggered');
      expect(result).toHaveProperty('adaptiveInterval');
      expect(Array.isArray(result.anomalies)).toBe(true);
      expect(Array.isArray(result.correlations)).toBe(true);
      expect(typeof result.chainTriggered).toBe('boolean');
      expect(typeof result.adaptiveInterval).toBe('number');
    });

    it('should track decision history stats', async () => {
      const { processDecisionIntelligence, getDecisionHistoryStats } = await import('./services/qumus-advanced-intelligence');

      // Process several decisions
      for (let i = 0; i < 5; i++) {
        processDecisionIntelligence(
          `test_decision_stats_${i}`,
          'policy_payment_processing',
          80 + i,
          i % 3 === 0 ? 'escalated' : 'approved',
          30 + i * 10,
          { transactionId: `txn_${i}` }
        );
      }

      const stats = getDecisionHistoryStats();
      expect(stats.totalRecorded).toBeGreaterThanOrEqual(5);
      expect(stats.avgConfidence).toBeGreaterThan(0);
      expect(stats.avgExecutionTime).toBeGreaterThan(0);
      expect(typeof stats.escalationRate).toBe('number');
    });
  });

  describe('Learning Feedback Loop', () => {
    it('should record decision outcomes and adjust confidence', async () => {
      const { recordDecisionOutcome, getConfidenceAdjustment, getLearningEntries } = await import('./services/qumus-advanced-intelligence');

      // Record a correct outcome
      recordDecisionOutcome('dec_1', 'policy_recommendation_engine', 85, 'correct', 'Good recommendation');

      const adjustment = getConfidenceAdjustment('policy_recommendation_engine');
      expect(adjustment).toBeGreaterThanOrEqual(0); // Correct outcomes boost confidence

      // Record an incorrect outcome
      recordDecisionOutcome('dec_2', 'policy_recommendation_engine', 85, 'incorrect', 'Bad recommendation');

      const newAdjustment = getConfidenceAdjustment('policy_recommendation_engine');
      expect(newAdjustment).toBeLessThan(adjustment); // Incorrect outcomes reduce confidence

      const entries = getLearningEntries(10);
      expect(entries.length).toBeGreaterThanOrEqual(2);
      expect(entries[0]).toHaveProperty('decisionId');
      expect(entries[0]).toHaveProperty('outcome');
      expect(entries[0]).toHaveProperty('adjustedConfidence');
    });
  });

  describe('Correlation Alerts', () => {
    it('should return correlation alerts array', async () => {
      const { getCorrelationAlerts } = await import('./services/qumus-advanced-intelligence');

      const alerts = getCorrelationAlerts(true);
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('should resolve correlation alerts', async () => {
      const { resolveCorrelationAlert } = await import('./services/qumus-advanced-intelligence');

      // Resolving a non-existent alert should return false
      const result = resolveCorrelationAlert('non_existent_alert');
      expect(result).toBe(false);
    });
  });

  describe('Anomaly Detection', () => {
    it('should return anomaly reports array', async () => {
      const { getAnomalyReports } = await import('./services/qumus-advanced-intelligence');

      const anomalies = getAnomalyReports(10);
      expect(Array.isArray(anomalies)).toBe(true);
    });
  });

  describe('Adaptive Scheduling', () => {
    it('should return valid schedule state', async () => {
      const { getAdaptiveScheduleState, calculateAdaptiveInterval } = await import('./services/qumus-advanced-intelligence');

      const state = getAdaptiveScheduleState();
      expect(state).toHaveProperty('baseInterval');
      expect(state).toHaveProperty('currentInterval');
      expect(state).toHaveProperty('minInterval');
      expect(state).toHaveProperty('maxInterval');
      expect(state).toHaveProperty('loadFactor');
      expect(state).toHaveProperty('urgencyFactor');
      expect(state.baseInterval).toBe(120_000);
      expect(state.minInterval).toBe(30_000);
      expect(state.maxInterval).toBe(300_000);

      const interval = calculateAdaptiveInterval();
      expect(interval).toBeGreaterThanOrEqual(state.minInterval);
      expect(interval).toBeLessThanOrEqual(state.maxInterval);
    });
  });

  describe('Policy Chains', () => {
    it('should return configured policy chains', async () => {
      const { getPolicyChains } = await import('./services/qumus-advanced-intelligence');

      const chains = getPolicyChains();
      expect(Array.isArray(chains)).toBe(true);
      expect(chains.length).toBeGreaterThanOrEqual(3);

      // Verify fraud detection chain exists
      const fraudChain = chains.find(c => c.id === 'chain_fraud_detection');
      expect(fraudChain).toBeDefined();
      expect(fraudChain!.triggerPolicy).toBe('policy_payment_processing');
      expect(fraudChain!.enabled).toBe(true);
      expect(fraudChain!.steps.length).toBeGreaterThanOrEqual(2);

      // Verify content compliance chain
      const contentChain = chains.find(c => c.id === 'chain_content_compliance');
      expect(contentChain).toBeDefined();
      expect(contentChain!.triggerPolicy).toBe('policy_content_moderation');

      // Verify growth activation chain
      const growthChain = chains.find(c => c.id === 'chain_growth_activation');
      expect(growthChain).toBeDefined();
      expect(growthChain!.triggerPolicy).toBe('policy_user_registration');
    });
  });

  describe('Self-Assessment', () => {
    it('should perform self-assessment and return valid structure', async () => {
      const { performSelfAssessment } = await import('./services/qumus-advanced-intelligence');

      const assessment = await performSelfAssessment();
      expect(assessment).toHaveProperty('overallScore');
      expect(assessment).toHaveProperty('healthGrade');
      expect(assessment).toHaveProperty('strengths');
      expect(assessment).toHaveProperty('weaknesses');
      expect(assessment).toHaveProperty('recommendations');
      expect(assessment).toHaveProperty('trends');
      expect(assessment).toHaveProperty('timestamp');

      expect(typeof assessment.overallScore).toBe('number');
      expect(assessment.overallScore).toBeGreaterThanOrEqual(0);
      expect(assessment.overallScore).toBeLessThanOrEqual(100);
      expect(['A', 'B', 'C', 'D', 'F']).toContain(assessment.healthGrade);
      expect(Array.isArray(assessment.strengths)).toBe(true);
      expect(Array.isArray(assessment.weaknesses)).toBe(true);
      expect(Array.isArray(assessment.recommendations)).toBe(true);

      expect(assessment.trends).toHaveProperty('autonomyTrend');
      expect(assessment.trends).toHaveProperty('confidenceTrend');
      expect(assessment.trends).toHaveProperty('performanceTrend');
      expect(['improving', 'stable', 'declining']).toContain(assessment.trends.autonomyTrend);
    });
  });
});
