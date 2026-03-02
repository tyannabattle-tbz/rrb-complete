import { describe, it, expect } from 'vitest';
import { qumusAutonomousEntityRouter } from './qumusAutonomousEntityRouter';

describe('QUMUS Autonomous Entity Router', () => {
  describe('Entity Initialization', () => {
    it('should initialize an autonomous entity', async () => {
      const caller = qumusAutonomousEntityRouter.createCaller({
        user: { id: '1', role: 'admin', email: 'admin@test.com' },
      } as any);

      const result = await caller.initializeEntity({
        name: 'QUMUS-Core',
        operationalDomains: ['content', 'streaming', 'monetization'],
        decisionAuthority: ['policy_execution', 'resource_allocation'],
      });

      expect(result.success).toBe(true);
      expect(result.entity.name).toBe('QUMUS-Core');
      expect(result.entity.autonomyLevel).toBe(0);
      expect(result.entity.status).toBe('initializing');
    });

    it('should reject non-admin users', async () => {
      const caller = qumusAutonomousEntityRouter.createCaller({
        user: { id: '2', role: 'user', email: 'user@test.com' },
      } as any);

      try {
        await caller.initializeEntity({
          name: 'QUMUS-Core',
          operationalDomains: ['content'],
          decisionAuthority: ['policy_execution'],
        });
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.code).toBe('FORBIDDEN');
      }
    });
  });

  describe('Entity Status', () => {
    it('should get entity status', async () => {
      const adminCaller = qumusAutonomousEntityRouter.createCaller({
        user: { id: '1', role: 'admin', email: 'admin@test.com' },
      } as any);

      const initResult = await adminCaller.initializeEntity({
        name: 'QUMUS-Test',
        operationalDomains: ['content'],
        decisionAuthority: ['policy_execution'],
      });

      const publicCaller = qumusAutonomousEntityRouter.createCaller({} as any);
      const statusResult = await publicCaller.getEntityStatus({
        entityId: initResult.entity.id,
      });

      expect(statusResult.entity.name).toBe('QUMUS-Test');
      expect(statusResult.decisionCount).toBe(0);
      expect(statusResult.policyCount).toBe(0);
    });

    it('should return error for non-existent entity', async () => {
      const caller = qumusAutonomousEntityRouter.createCaller({} as any);

      try {
        await caller.getEntityStatus({ entityId: 'non_existent' });
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.code).toBe('NOT_FOUND');
      }
    });
  });

  describe('Autonomy Activation', () => {
    it('should activate autonomous mode', async () => {
      const adminCaller = qumusAutonomousEntityRouter.createCaller({
        user: { id: '1', role: 'admin', email: 'admin@test.com' },
      } as any);

      const initResult = await adminCaller.initializeEntity({
        name: 'QUMUS-Autonomous',
        operationalDomains: ['content', 'streaming'],
        decisionAuthority: ['policy_execution'],
      });

      const activateResult = await adminCaller.activateAutonomousMode({
        entityId: initResult.entity.id,
        targetAutonomyLevel: 50,
      });

      expect(activateResult.entity.autonomyLevel).toBe(50);
      expect(activateResult.entity.status).toBe('active');
    });

    it('should cap autonomy level at 100', async () => {
      const adminCaller = qumusAutonomousEntityRouter.createCaller({
        user: { id: '1', role: 'admin', email: 'admin@test.com' },
      } as any);

      const initResult = await adminCaller.initializeEntity({
        name: 'QUMUS-Max',
        operationalDomains: ['content'],
        decisionAuthority: ['policy_execution'],
      });

      const activateResult = await adminCaller.activateAutonomousMode({
        entityId: initResult.entity.id,
        targetAutonomyLevel: 150,
      });

      expect(activateResult.entity.autonomyLevel).toBe(100);
      expect(activateResult.entity.status).toBe('autonomous');
    });
  });

  describe('Autonomous Decisions', () => {
    it('should execute autonomous decision', async () => {
      const adminCaller = qumusAutonomousEntityRouter.createCaller({
        user: { id: '1', role: 'admin', email: 'admin@test.com' },
      } as any);

      const initResult = await adminCaller.initializeEntity({
        name: 'QUMUS-Decisions',
        operationalDomains: ['content', 'streaming'],
        decisionAuthority: ['policy_execution'],
      });

      // Activate autonomy first
      await adminCaller.activateAutonomousMode({
        entityId: initResult.entity.id,
        targetAutonomyLevel: 50,
      });

      const decisionResult = await adminCaller.executeAutonomousDecision({
        entityId: initResult.entity.id,
        domain: 'content',
        decision: 'Approve new content',
        reasoning: 'Meets all criteria',
        confidence: 0.95,
        impact: 'medium',
      });

      expect(decisionResult.decision.domain).toBe('content');
      expect(decisionResult.decision.confidence).toBe(0.95);
      expect(decisionResult.decision.status).toBe('pending');
    });

    it('should reject decision without sufficient autonomy', async () => {
      const adminCaller = qumusAutonomousEntityRouter.createCaller({
        user: { id: '1', role: 'admin', email: 'admin@test.com' },
      } as any);

      const initResult = await adminCaller.initializeEntity({
        name: 'QUMUS-NoAutonomy',
        operationalDomains: ['content'],
        decisionAuthority: ['policy_execution'],
      });

      // Don't activate autonomy, try critical decision
      try {
        await adminCaller.executeAutonomousDecision({
          entityId: initResult.entity.id,
          domain: 'content',
          decision: 'Critical decision',
          reasoning: 'Test',
          confidence: 0.9,
          impact: 'critical',
        });
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.code).toBe('FORBIDDEN');
      }
    });

    it('should get autonomous decisions', async () => {
      const adminCaller = qumusAutonomousEntityRouter.createCaller({
        user: { id: '1', role: 'admin', email: 'admin@test.com' },
      } as any);

      const initResult = await adminCaller.initializeEntity({
        name: 'QUMUS-GetDecisions',
        operationalDomains: ['content', 'streaming'],
        decisionAuthority: ['policy_execution'],
      });

      await adminCaller.activateAutonomousMode({
        entityId: initResult.entity.id,
        targetAutonomyLevel: 50,
      });

      await adminCaller.executeAutonomousDecision({
        entityId: initResult.entity.id,
        domain: 'content',
        decision: 'Decision 1',
        reasoning: 'Test',
        confidence: 0.8,
        impact: 'low',
      });

      const publicCaller = qumusAutonomousEntityRouter.createCaller({} as any);
      const decisionsResult = await publicCaller.getAutonomousDecisions({
        entityId: initResult.entity.id,
      });

      expect(decisionsResult.total).toBe(1);
      expect(decisionsResult.averageConfidence).toBe(0.8);
    });
  });

  describe('Analytics', () => {
    it('should get entity analytics', async () => {
      const adminCaller = qumusAutonomousEntityRouter.createCaller({
        user: { id: '1', role: 'admin', email: 'admin@test.com' },
      } as any);

      const initResult = await adminCaller.initializeEntity({
        name: 'QUMUS-Analytics',
        operationalDomains: ['content'],
        decisionAuthority: ['policy_execution'],
      });

      const publicCaller = qumusAutonomousEntityRouter.createCaller({} as any);
      const analyticsResult = await publicCaller.getEntityAnalytics({
        entityId: initResult.entity.id,
      });

      expect(analyticsResult.entity.name).toBe('QUMUS-Analytics');
      expect(analyticsResult.decisionCount).toBe(0);
      expect(analyticsResult.policyCount).toBe(0);
      expect(analyticsResult.uptime).toBeGreaterThan(0);
    });
  });
});
