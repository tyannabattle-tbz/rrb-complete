import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dashboardStateRouter } from './dashboardState';

describe('dashboardState Router - QUMUS Integration', () => {
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
    it('should execute toggleSidebar with decision tracking', async () => {
      const toggleSidebarProcedure = dashboardStateRouter.createCaller({ ctx: mockCtx }).toggleSidebar;
      const result = await toggleSidebarProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });

  it('should execute selectMenuItem with decision tracking', async () => {
      const selectMenuItemProcedure = dashboardStateRouter.createCaller({ ctx: mockCtx }).selectMenuItem;
      const result = await selectMenuItemProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });

  it('should execute updateLayout with decision tracking', async () => {
      const updateLayoutProcedure = dashboardStateRouter.createCaller({ ctx: mockCtx }).updateLayout;
      const result = await updateLayoutProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });

  it('should execute applyTheme with decision tracking', async () => {
      const applyThemeProcedure = dashboardStateRouter.createCaller({ ctx: mockCtx }).applyTheme;
      const result = await applyThemeProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });

  it('should execute exportDashboard with decision tracking', async () => {
      const exportDashboardProcedure = dashboardStateRouter.createCaller({ ctx: mockCtx }).exportDashboard;
      const result = await exportDashboardProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });
  });

  describe('QUMUS Decision Tracking', () => {
    it('should generate unique decision IDs', async () => {
      const toggleSidebarProcedure = dashboardStateRouter.createCaller({ ctx: mockCtx }).toggleSidebar;
      const result1 = await toggleSidebarProcedure({ reason: 'test-1' });
      const result2 = await toggleSidebarProcedure({ reason: 'test-2' });

      expect(result1.decisionId).not.toBe(result2.decisionId);
    });
  });

  describe('State Persistence', () => {
    it('should maintain state across calls', async () => {
      const getStateProcedure = dashboardStateRouter.createCaller({ ctx: mockCtx }).getState;
      const state = await getStateProcedure();

      expect(state.userId).toBe(mockCtx.user.id);
    });
  });
});
