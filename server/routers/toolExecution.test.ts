import { describe, it, expect, beforeEach, vi } from 'vitest';
import { toolExecutionRouter } from './toolExecution';

describe('toolExecution Router - QUMUS Integration', () => {
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
    it('should execute executeTool with decision tracking', async () => {
      const executeToolProcedure = toolExecutionRouter.createCaller({ ctx: mockCtx }).executeTool;
      const result = await executeToolProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });

  it('should execute cancelExecution with decision tracking', async () => {
      const cancelExecutionProcedure = toolExecutionRouter.createCaller({ ctx: mockCtx }).cancelExecution;
      const result = await cancelExecutionProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });

  it('should execute retryTool with decision tracking', async () => {
      const retryToolProcedure = toolExecutionRouter.createCaller({ ctx: mockCtx }).retryTool;
      const result = await retryToolProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });

  it('should execute viewLogs with decision tracking', async () => {
      const viewLogsProcedure = toolExecutionRouter.createCaller({ ctx: mockCtx }).viewLogs;
      const result = await viewLogsProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });

  it('should execute downloadResults with decision tracking', async () => {
      const downloadResultsProcedure = toolExecutionRouter.createCaller({ ctx: mockCtx }).downloadResults;
      const result = await downloadResultsProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });
  });

  describe('QUMUS Decision Tracking', () => {
    it('should generate unique decision IDs', async () => {
      const executeToolProcedure = toolExecutionRouter.createCaller({ ctx: mockCtx }).executeTool;
      const result1 = await executeToolProcedure({ reason: 'test-1' });
      const result2 = await executeToolProcedure({ reason: 'test-2' });

      expect(result1.decisionId).not.toBe(result2.decisionId);
    });
  });

  describe('State Persistence', () => {
    it('should maintain state across calls', async () => {
      const getStateProcedure = toolExecutionRouter.createCaller({ ctx: mockCtx }).getState;
      const state = await getStateProcedure();

      expect(state.userId).toBe(mockCtx.user.id);
    });
  });
});
