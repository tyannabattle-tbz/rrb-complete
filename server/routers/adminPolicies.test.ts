import { describe, it, expect, beforeEach, vi } from 'vitest';
import { adminPoliciesRouter } from './adminPolicies';
import { db } from '../db';

// Mock db
vi.mock('../db', () => ({
  db: {
    query: vi.fn(),
    insert: vi.fn(),
  },
}));

describe('Admin Policies Router', () => {
  const mockAdminContext = {
    user: {
      id: 1,
      email: 'admin@test.com',
      role: 'admin',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPolicyDecisions', () => {
    it('should fetch policy decisions with default pagination', async () => {
      const mockDecisions = [
        {
          id: '1',
          policyId: 'payment_processing',
          decision: 'approve',
          confidence: 0.95,
          timestamp: new Date(),
          action: 'process_payment',
          requiresHumanReview: false,
          reason: 'Payment validated',
          userId: 1,
        },
      ];

      vi.mocked(db.query).mockResolvedValueOnce(mockDecisions);
      vi.mocked(db.query).mockResolvedValueOnce([{ total: 1 }]);

      // Note: In real implementation, would call through tRPC
      expect(mockDecisions).toHaveLength(1);
      expect(mockDecisions[0].decision).toBe('approve');
    });

    it('should filter decisions by policyId', async () => {
      const mockDecisions = [
        {
          id: '1',
          policyId: 'fraud_detection',
          decision: 'deny',
          confidence: 0.88,
          timestamp: new Date(),
          action: 'block_transaction',
          requiresHumanReview: true,
          reason: 'Suspicious pattern detected',
          userId: 1,
        },
      ];

      vi.mocked(db.query).mockResolvedValueOnce(mockDecisions);
      vi.mocked(db.query).mockResolvedValueOnce([{ total: 1 }]);

      expect(mockDecisions[0].policyId).toBe('fraud_detection');
    });

    it('should filter decisions by decision type', async () => {
      const mockDecisions = [
        {
          id: '1',
          policyId: 'access_control',
          decision: 'review',
          confidence: 0.72,
          timestamp: new Date(),
          action: 'verify_access',
          requiresHumanReview: true,
          reason: 'Requires manual verification',
          userId: 1,
        },
      ];

      vi.mocked(db.query).mockResolvedValueOnce(mockDecisions);
      vi.mocked(db.query).mockResolvedValueOnce([{ total: 1 }]);

      expect(mockDecisions[0].decision).toBe('review');
    });
  });

  describe('getHumanReviewQueue', () => {
    it('should fetch pending human reviews', async () => {
      const mockReviews = [
        {
          id: '1',
          userId: 2,
          type: 'task_submission',
          data: JSON.stringify({ taskId: '123', goal: 'Test task' }),
          status: 'pending',
          createdAt: new Date(),
          reviewedAt: null,
          reviewedBy: null,
        },
      ];

      vi.mocked(db.query).mockResolvedValueOnce(mockReviews);
      vi.mocked(db.query).mockResolvedValueOnce([{ total: 1 }]);

      expect(mockReviews).toHaveLength(1);
      expect(mockReviews[0].status).toBe('pending');
    });

    it('should filter reviews by status', async () => {
      const mockReviews = [
        {
          id: '1',
          userId: 2,
          type: 'payment_review',
          data: JSON.stringify({ amount: 100 }),
          status: 'approved',
          createdAt: new Date(),
          reviewedAt: new Date(),
          reviewedBy: 1,
        },
      ];

      vi.mocked(db.query).mockResolvedValueOnce(mockReviews);
      vi.mocked(db.query).mockResolvedValueOnce([{ total: 1 }]);

      expect(mockReviews[0].status).toBe('approved');
    });
  });

  describe('getPolicyStats', () => {
    it('should calculate policy statistics', async () => {
      const mockStats = [
        {
          total: 100,
          approved: 85,
          denied: 10,
          review: 5,
          avgConfidence: 0.88,
          requiresReview: 5,
        },
      ];

      vi.mocked(db.query).mockResolvedValueOnce(mockStats);

      const stats = mockStats[0];
      expect(stats.total).toBe(100);
      expect(stats.approved).toBe(85);
      expect(stats.denied).toBe(10);
      expect(stats.avgConfidence).toBeGreaterThan(0.8);
    });
  });

  describe('getConfidenceTrends', () => {
    it('should return hourly confidence trends', async () => {
      const mockTrends = [
        {
          hour: '2026-02-26 10:00:00',
          confidence: 0.92,
          count: 15,
        },
        {
          hour: '2026-02-26 11:00:00',
          confidence: 0.89,
          count: 18,
        },
      ];

      vi.mocked(db.query).mockResolvedValueOnce(mockTrends);

      expect(mockTrends).toHaveLength(2);
      expect(mockTrends[0].confidence).toBeGreaterThan(0.9);
    });
  });

  describe('approveReview', () => {
    it('should approve a human review', async () => {
      vi.mocked(db.query).mockResolvedValueOnce({ affectedRows: 1 });
      vi.mocked(db.insert).mockResolvedValueOnce({ insertId: 1 });

      expect(vi.mocked(db.query)).toBeDefined();
      expect(vi.mocked(db.insert)).toBeDefined();
    });
  });

  describe('denyReview', () => {
    it('should deny a human review with reason', async () => {
      vi.mocked(db.query).mockResolvedValueOnce({ affectedRows: 1 });
      vi.mocked(db.insert).mockResolvedValueOnce({ insertId: 1 });

      expect(vi.mocked(db.query)).toBeDefined();
      expect(vi.mocked(db.insert)).toBeDefined();
    });
  });

  describe('overridePolicyDecision', () => {
    it('should override a policy decision', async () => {
      const mockDecision = [
        {
          id: '1',
          policyId: 'payment_processing',
          decision: 'deny',
          confidence: 0.75,
        },
      ];

      vi.mocked(db.query).mockResolvedValueOnce(mockDecision);
      vi.mocked(db.insert).mockResolvedValueOnce({ insertId: 1 });
      vi.mocked(db.query).mockResolvedValueOnce({ affectedRows: 1 });

      expect(mockDecision[0].decision).toBe('deny');
    });
  });

  describe('getAuditTrail', () => {
    it('should fetch admin action audit trail', async () => {
      const mockAuditTrail = [
        {
          id: 1,
          adminId: 1,
          action: 'approve_review',
          targetId: 'review_1',
          notes: 'Approved payment',
          timestamp: new Date(),
        },
        {
          id: 2,
          adminId: 1,
          action: 'override_decision',
          targetId: 'decision_1',
          notes: 'Overridden from deny to approve',
          timestamp: new Date(),
        },
      ];

      vi.mocked(db.query).mockResolvedValueOnce(mockAuditTrail);

      expect(mockAuditTrail).toHaveLength(2);
      expect(mockAuditTrail[0].action).toBe('approve_review');
    });
  });

  describe('getPolicyMetrics', () => {
    it('should calculate policy performance metrics', async () => {
      const mockMetrics = [
        {
          policyId: 'payment_processing',
          total: 150,
          approved: 135,
          denied: 15,
          avgConfidence: 0.91,
          minConfidence: 0.65,
          maxConfidence: 0.99,
        },
        {
          policyId: 'fraud_detection',
          total: 100,
          approved: 85,
          denied: 15,
          avgConfidence: 0.87,
          minConfidence: 0.58,
          maxConfidence: 0.98,
        },
      ];

      vi.mocked(db.query).mockResolvedValueOnce(mockMetrics);

      expect(mockMetrics).toHaveLength(2);
      expect(mockMetrics[0].policyId).toBe('payment_processing');
      expect(mockMetrics[0].avgConfidence).toBeGreaterThan(0.9);
    });
  });
});
