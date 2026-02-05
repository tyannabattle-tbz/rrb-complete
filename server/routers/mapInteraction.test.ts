import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mapInteractionRouter } from './mapInteraction';

describe('mapInteraction Router - QUMUS Integration', () => {
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
    it('should execute setCenter with decision tracking', async () => {
      const setCenterProcedure = mapInteractionRouter.createCaller({ ctx: mockCtx }).setCenter;
      const result = await setCenterProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });

  it('should execute setZoom with decision tracking', async () => {
      const setZoomProcedure = mapInteractionRouter.createCaller({ ctx: mockCtx }).setZoom;
      const result = await setZoomProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });

  it('should execute addMarker with decision tracking', async () => {
      const addMarkerProcedure = mapInteractionRouter.createCaller({ ctx: mockCtx }).addMarker;
      const result = await addMarkerProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });

  it('should execute removeMarker with decision tracking', async () => {
      const removeMarkerProcedure = mapInteractionRouter.createCaller({ ctx: mockCtx }).removeMarker;
      const result = await removeMarkerProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });

  it('should execute drawRoute with decision tracking', async () => {
      const drawRouteProcedure = mapInteractionRouter.createCaller({ ctx: mockCtx }).drawRoute;
      const result = await drawRouteProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });

  it('should execute clearMap with decision tracking', async () => {
      const clearMapProcedure = mapInteractionRouter.createCaller({ ctx: mockCtx }).clearMap;
      const result = await clearMapProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });
  });

  describe('QUMUS Decision Tracking', () => {
    it('should generate unique decision IDs', async () => {
      const setCenterProcedure = mapInteractionRouter.createCaller({ ctx: mockCtx }).setCenter;
      const result1 = await setCenterProcedure({ reason: 'test-1' });
      const result2 = await setCenterProcedure({ reason: 'test-2' });

      expect(result1.decisionId).not.toBe(result2.decisionId);
    });
  });

  describe('State Persistence', () => {
    it('should maintain state across calls', async () => {
      const getStateProcedure = mapInteractionRouter.createCaller({ ctx: mockCtx }).getState;
      const state = await getStateProcedure();

      expect(state.userId).toBe(mockCtx.user.id);
    });
  });
});
