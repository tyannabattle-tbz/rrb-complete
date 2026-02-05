import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyticsTrackingRouter } from './analyticsTracking';

describe('analyticsTracking Router - QUMUS Integration', () => {
  const mockCtx = {
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'user' as const,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Action Procedures', () => {
    it('should execute filterMetrics with decision tracking', async () => {
      const filterMetricsProcedure = analyticsTrackingRouter.createCaller({ ctx: mockCtx }).filterMetrics;
      const result = await filterMetricsProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });

  it('should execute exportReport with decision tracking', async () => {
      const exportReportProcedure = analyticsTrackingRouter.createCaller({ ctx: mockCtx }).exportReport;
      const result = await exportReportProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });

  it('should execute setDateRange with decision tracking', async () => {
      const setDateRangeProcedure = analyticsTrackingRouter.createCaller({ ctx: mockCtx }).setDateRange;
      const result = await setDateRangeProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });

  it('should execute updateVisualization with decision tracking', async () => {
      const updateVisualizationProcedure = analyticsTrackingRouter.createCaller({ ctx: mockCtx }).updateVisualization;
      const result = await updateVisualizationProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });

  it('should execute savePreset with decision tracking', async () => {
      const savePresetProcedure = analyticsTrackingRouter.createCaller({ ctx: mockCtx }).savePreset;
      const result = await savePresetProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });
  });

  describe('QUMUS Decision Tracking', () => {
    it('should generate unique decision IDs', async () => {
      const filterMetricsProcedure = analyticsTrackingRouter.createCaller({ ctx: mockCtx }).filterMetrics;
      const result1 = await filterMetricsProcedure({ reason: 'test-1' });
      const result2 = await filterMetricsProcedure({ reason: 'test-2' });

      expect(result1.decisionId).not.toBe(result2.decisionId);
    });
  });

  describe('State Persistence', () => {
    it('should maintain state across calls', async () => {
      const getStateProcedure = analyticsTrackingRouter.createCaller({ ctx: mockCtx }).getState;
      const state = await getStateProcedure();

      expect(state.userId).toBe(mockCtx.user.id);
    });
  });
});
