import { describe, it, expect, beforeEach, vi } from 'vitest';
import { aiChatRouter } from './aiChat';

describe('aiChat Router - QUMUS Integration', () => {
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
    it('should execute sendMessage with decision tracking', async () => {
      const sendMessageProcedure = aiChatRouter.createCaller({ ctx: mockCtx }).sendMessage;
      const result = await sendMessageProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });

  it('should execute clearHistory with decision tracking', async () => {
      const clearHistoryProcedure = aiChatRouter.createCaller({ ctx: mockCtx }).clearHistory;
      const result = await clearHistoryProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });

  it('should execute deleteMessage with decision tracking', async () => {
      const deleteMessageProcedure = aiChatRouter.createCaller({ ctx: mockCtx }).deleteMessage;
      const result = await deleteMessageProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });

  it('should execute regenerateResponse with decision tracking', async () => {
      const regenerateResponseProcedure = aiChatRouter.createCaller({ ctx: mockCtx }).regenerateResponse;
      const result = await regenerateResponseProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });
  });

  describe('QUMUS Decision Tracking', () => {
    it('should generate unique decision IDs', async () => {
      const sendMessageProcedure = aiChatRouter.createCaller({ ctx: mockCtx }).sendMessage;
      const result1 = await sendMessageProcedure({ reason: 'test-1' });
      const result2 = await sendMessageProcedure({ reason: 'test-2' });

      expect(result1.decisionId).not.toBe(result2.decisionId);
    });
  });

  describe('State Persistence', () => {
    it('should maintain state across calls', async () => {
      const getStateProcedure = aiChatRouter.createCaller({ ctx: mockCtx }).getState;
      const state = await getStateProcedure();

      expect(state.userId).toBe(mockCtx.user.id);
    });
  });
});
