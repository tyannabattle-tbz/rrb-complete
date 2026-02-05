import { describe, it, expect, beforeEach, vi } from 'vitest';
import { chatFlowRouter } from './chatFlow';

describe('chatFlow Router - QUMUS Integration', () => {
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
      const sendMessageProcedure = chatFlowRouter.createCaller({ ctx: mockCtx }).sendMessage;
      const result = await sendMessageProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });

  it('should execute editMessage with decision tracking', async () => {
      const editMessageProcedure = chatFlowRouter.createCaller({ ctx: mockCtx }).editMessage;
      const result = await editMessageProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });

  it('should execute deleteMessage with decision tracking', async () => {
      const deleteMessageProcedure = chatFlowRouter.createCaller({ ctx: mockCtx }).deleteMessage;
      const result = await deleteMessageProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });

  it('should execute pinMessage with decision tracking', async () => {
      const pinMessageProcedure = chatFlowRouter.createCaller({ ctx: mockCtx }).pinMessage;
      const result = await pinMessageProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });

  it('should execute muteNotifications with decision tracking', async () => {
      const muteNotificationsProcedure = chatFlowRouter.createCaller({ ctx: mockCtx }).muteNotifications;
      const result = await muteNotificationsProcedure({ reason: 'test' });

      expect(result.success).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(result.state.userId).toBe(mockCtx.user.id);
    });
  });

  describe('QUMUS Decision Tracking', () => {
    it('should generate unique decision IDs', async () => {
      const sendMessageProcedure = chatFlowRouter.createCaller({ ctx: mockCtx }).sendMessage;
      const result1 = await sendMessageProcedure({ reason: 'test-1' });
      const result2 = await sendMessageProcedure({ reason: 'test-2' });

      expect(result1.decisionId).not.toBe(result2.decisionId);
    });
  });

  describe('State Persistence', () => {
    it('should maintain state across calls', async () => {
      const getStateProcedure = chatFlowRouter.createCaller({ ctx: mockCtx }).getState;
      const state = await getStateProcedure();

      expect(state.userId).toBe(mockCtx.user.id);
    });
  });
});
