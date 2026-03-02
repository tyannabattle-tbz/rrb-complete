import { describe, it, expect } from 'vitest';
import { qumusAutonomousScalingRouter } from './qumusAutonomousScalingRouter';

describe('QUMUS Autonomous Scaling Router', () => {
  describe('Metrics Recording', () => {
    it('should record performance metrics', async () => {
      const caller = qumusAutonomousScalingRouter.createCaller({
        user: { id: '1', role: 'admin', email: 'admin@test.com' },
      } as any);

      const result = await caller.recordMetrics({
        entityId: 'entity_1',
        cpuUsage: 45,
        memoryUsage: 60,
        requestsPerSecond: 1000,
        averageResponseTime: 250,
        errorRate: 0.5,
      });

      expect(result.success).toBe(true);
      expect(result.metrics.cpuUsage).toBe(45);
      expect(result.metrics.memoryUsage).toBe(60);
    });

    it('should validate metric ranges', async () => {
      const caller = qumusAutonomousScalingRouter.createCaller({
        user: { id: '1', role: 'admin', email: 'admin@test.com' },
      } as any);

      try {
        await caller.recordMetrics({
          entityId: 'entity_1',
          cpuUsage: 150, // Invalid: > 100
          memoryUsage: 60,
          requestsPerSecond: 1000,
          averageResponseTime: 250,
          errorRate: 0.5,
        });
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.code).toBe('BAD_REQUEST');
      }
    });
  });

  describe('Current Metrics', () => {
    it('should get current metrics', async () => {
      const adminCaller = qumusAutonomousScalingRouter.createCaller({
        user: { id: '1', role: 'admin', email: 'admin@test.com' },
      } as any);

      // Record some metrics
      await adminCaller.recordMetrics({
        entityId: 'entity_1',
        cpuUsage: 45,
        memoryUsage: 60,
        requestsPerSecond: 1000,
        averageResponseTime: 250,
        errorRate: 0.5,
      });

      const publicCaller = qumusAutonomousScalingRouter.createCaller({} as any);
      const result = await publicCaller.getCurrentMetrics({ entityId: 'entity_1' });

      expect(result.current).toBeDefined();
      expect(result.current?.cpuUsage).toBe(45);
      expect(result.averages).toBeDefined();
    });

    it('should return no metrics message when empty', async () => {
      const caller = qumusAutonomousScalingRouter.createCaller({} as any);

      const result = await caller.getCurrentMetrics({ entityId: 'non_existent' });

      expect(result.metrics).toBeNull();
      expect(result.message).toBe('No metrics available');
    });
  });

  describe('Scaling Decisions', () => {
    it('should execute scaling decision', async () => {
      const caller = qumusAutonomousScalingRouter.createCaller({
        user: { id: '1', role: 'admin', email: 'admin@test.com' },
      } as any);

      const result = await caller.executeScalingDecision({
        entityId: 'entity_1',
        type: 'scale_up',
        reason: 'CPU usage exceeds 80%',
      });

      expect(result.success).toBe(true);
      expect(result.action.type).toBe('scale_up');
      expect(result.action.result).toBe('pending');
    });

    it('should reject non-admin scaling decisions', async () => {
      const caller = qumusAutonomousScalingRouter.createCaller({
        user: { id: '2', role: 'user', email: 'user@test.com' },
      } as any);

      try {
        await caller.executeScalingDecision({
          entityId: 'entity_1',
          type: 'scale_up',
          reason: 'Test',
        });
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.code).toBe('FORBIDDEN');
      }
    });
  });

  describe('Optimization History', () => {
    it('should get optimization history', async () => {
      const adminCaller = qumusAutonomousScalingRouter.createCaller({
        user: { id: '1', role: 'admin', email: 'admin@test.com' },
      } as any);

      await adminCaller.executeScalingDecision({
        entityId: 'entity_1',
        type: 'scale_up',
        reason: 'Test',
      });

      const publicCaller = qumusAutonomousScalingRouter.createCaller({} as any);
      const result = await publicCaller.getOptimizationHistory({
        entityId: 'entity_1',
      });

      expect(result.total).toBe(1);
      expect(result.actions[0].type).toBe('scale_up');
    });
  });

  describe('Learning Patterns', () => {
    it('should record learning pattern', async () => {
      const caller = qumusAutonomousScalingRouter.createCaller({
        user: { id: '1', role: 'admin', email: 'admin@test.com' },
      } as any);

      const result = await caller.recordLearningPattern({
        entityId: 'entity_1',
        pattern: 'High CPU during peak hours',
        confidence: 0.95,
      });

      expect(result.success).toBe(true);
      expect(result.record.pattern).toBe('High CPU during peak hours');
      expect(result.record.confidence).toBe(0.95);
    });

    it('should get learning records', async () => {
      const adminCaller = qumusAutonomousScalingRouter.createCaller({
        user: { id: '1', role: 'admin', email: 'admin@test.com' },
      } as any);

      await adminCaller.recordLearningPattern({
        entityId: 'entity_1',
        pattern: 'Pattern 1',
        confidence: 0.9,
      });

      await adminCaller.recordLearningPattern({
        entityId: 'entity_1',
        pattern: 'Pattern 2',
        confidence: 0.7,
      });

      const publicCaller = qumusAutonomousScalingRouter.createCaller({} as any);
      const result = await publicCaller.getLearningRecords({
        entityId: 'entity_1',
      });

      expect(result.total).toBe(2);
      expect(result.averageConfidence).toBeGreaterThan(0);
    });
  });

  describe('Scaling Recommendations', () => {
    it('should get scaling recommendations for high CPU', async () => {
      const adminCaller = qumusAutonomousScalingRouter.createCaller({
        user: { id: '1', role: 'admin', email: 'admin@test.com' },
      } as any);

      await adminCaller.recordMetrics({
        entityId: 'entity_1',
        cpuUsage: 85,
        memoryUsage: 60,
        requestsPerSecond: 1000,
        averageResponseTime: 250,
        errorRate: 0.5,
      });

      const publicCaller = qumusAutonomousScalingRouter.createCaller({} as any);
      const result = await publicCaller.getScalingRecommendations({
        entityId: 'entity_1',
      });

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations[0]).toContain('CPU');
      expect(result.priority).toBe('high');
    });

    it('should recommend scale down for low utilization', async () => {
      const adminCaller = qumusAutonomousScalingRouter.createCaller({
        user: { id: '1', role: 'admin', email: 'admin@test.com' },
      } as any);

      await adminCaller.recordMetrics({
        entityId: 'entity_3',
        cpuUsage: 10,
        memoryUsage: 15,
        requestsPerSecond: 10,
        averageResponseTime: 50,
        errorRate: 0,
      });

      const publicCaller = qumusAutonomousScalingRouter.createCaller({} as any);
      const result = await publicCaller.getScalingRecommendations({
        entityId: 'entity_3',
      });

      expect(result.recommendations.some(r => r.includes('scale down'))).toBe(true);
    });
  });
});
