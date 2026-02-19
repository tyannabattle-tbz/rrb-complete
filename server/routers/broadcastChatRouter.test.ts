import { describe, it, expect, beforeEach, vi } from 'vitest';
import { broadcastChatRouter } from './broadcastChatRouter';

describe('BroadcastChatRouter', () => {
  describe('getMessages', () => {
    it('should return messages for a broadcast', async () => {
      const caller = broadcastChatRouter.createCaller({} as any);
      const result = await caller.getMessages({ broadcastId: 'live-1' });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-existent broadcast', async () => {
      const caller = broadcastChatRouter.createCaller({} as any);
      const result = await caller.getMessages({ broadcastId: 'non-existent' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const caller = broadcastChatRouter.createCaller({ user: { id: 'user-1' } } as any);
      const result = await caller.sendMessage({
        broadcastId: 'live-1',
        user: 'TestUser',
        message: 'Hello, world!',
        avatar: '👤',
      });

      expect(result.success).toBe(true);
      expect(result.data.message).toBe('Hello, world!');
      expect(result.data.user).toBe('TestUser');
      expect(result.data.broadcastId).toBe('live-1');
    });

    it('should reject empty messages', async () => {
      const caller = broadcastChatRouter.createCaller({ user: { id: 'user-1' } } as any);

      try {
        await caller.sendMessage({
          broadcastId: 'live-1',
          user: 'TestUser',
          message: '',
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.code).toBe('BAD_REQUEST');
      }
    });

    it('should reject messages longer than 500 characters', async () => {
      const caller = broadcastChatRouter.createCaller({ user: { id: 'user-1' } } as any);
      const longMessage = 'a'.repeat(501);

      try {
        await caller.sendMessage({
          broadcastId: 'live-1',
          user: 'TestUser',
          message: longMessage,
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.code).toBe('BAD_REQUEST');
      }
    });
  });

  describe('getViewerCount', () => {
    it('should return viewer count for a broadcast', async () => {
      const caller = broadcastChatRouter.createCaller({} as any);
      const result = await caller.getViewerCount({ broadcastId: 'live-1' });

      expect(result.success).toBe(true);
      expect(result.data.broadcastId).toBe('live-1');
      expect(typeof result.data.viewers).toBe('number');
      expect(result.data.viewers).toBeGreaterThanOrEqual(0);
    });
  });

  describe('updateViewerCount', () => {
    it('should increment viewer count', async () => {
      const caller = broadcastChatRouter.createCaller({} as any);

      // Get initial count
      const initial = await caller.getViewerCount({ broadcastId: 'test-broadcast' });
      const initialCount = initial.data.viewers;

      // Update count
      const result = await caller.updateViewerCount({
        broadcastId: 'test-broadcast',
        delta: 5,
      });

      expect(result.success).toBe(true);
      expect(result.data.viewers).toBe(initialCount + 5);
    });

    it('should not allow negative viewer counts', async () => {
      const caller = broadcastChatRouter.createCaller({} as any);

      // Set to 0 first
      await caller.updateViewerCount({ broadcastId: 'test-broadcast-2', delta: 0 });

      // Try to go negative
      const result = await caller.updateViewerCount({
        broadcastId: 'test-broadcast-2',
        delta: -10,
      });

      expect(result.data.viewers).toBe(0);
    });
  });

  describe('getChatStats', () => {
    it('should return chat statistics', async () => {
      const caller = broadcastChatRouter.createCaller({} as any);
      const result = await caller.getChatStats({ broadcastId: 'live-1' });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('totalMessages');
      expect(result.data).toHaveProperty('uniqueUsers');
      expect(result.data).toHaveProperty('viewers');
      expect(result.data).toHaveProperty('messageRate');
    });
  });

  describe('searchMessages', () => {
    it('should search messages by content', async () => {
      const caller = broadcastChatRouter.createCaller({} as any);

      // Send a test message
      await caller.sendMessage({
        broadcastId: 'search-test',
        user: 'SearchUser',
        message: 'This is a searchable message',
      });

      // Search for it
      const result = await caller.searchMessages({
        broadcastId: 'search-test',
        query: 'searchable',
      });

      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].message).toContain('searchable');
    });

    it('should search messages by username', async () => {
      const caller = broadcastChatRouter.createCaller({} as any);

      // Send a test message
      await caller.sendMessage({
        broadcastId: 'search-test-2',
        user: 'UniqueUsername123',
        message: 'Test message',
      });

      // Search for username
      const result = await caller.searchMessages({
        broadcastId: 'search-test-2',
        query: 'UniqueUsername123',
      });

      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].user).toBe('UniqueUsername123');
    });
  });

  describe('getRecentMessages', () => {
    it('should return recent messages with default limit', async () => {
      const caller = broadcastChatRouter.createCaller({} as any);

      // Send multiple messages
      for (let i = 0; i < 5; i++) {
        await caller.sendMessage({
          broadcastId: 'recent-test',
          user: `User${i}`,
          message: `Message ${i}`,
        });
      }

      const result = await caller.getRecentMessages({ broadcastId: 'recent-test' });

      expect(result.success).toBe(true);
      expect(result.data.length).toBeLessThanOrEqual(20);
    });

    it('should respect custom limit', async () => {
      const caller = broadcastChatRouter.createCaller({} as any);

      const result = await caller.getRecentMessages({
        broadcastId: 'recent-test',
        limit: 5,
      });

      expect(result.success).toBe(true);
      expect(result.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getActiveBroadcasts', () => {
    it('should return list of active broadcasts', async () => {
      const caller = broadcastChatRouter.createCaller({} as any);
      const result = await caller.getActiveBroadcasts();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message', async () => {
      const caller = broadcastChatRouter.createCaller({ user: { id: 'user-1' } } as any);

      // Send a message
      const sendResult = await caller.sendMessage({
        broadcastId: 'delete-test',
        user: 'TestUser',
        message: 'Message to delete',
      });

      const messageId = sendResult.data.id;

      // Delete it
      const deleteResult = await caller.deleteMessage({ messageId });

      expect(deleteResult.success).toBe(true);
    });

    it('should fail to delete non-existent message', async () => {
      const caller = broadcastChatRouter.createCaller({ user: { id: 'user-1' } } as any);

      const result = await caller.deleteMessage({ messageId: 'non-existent' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Message not found');
    });
  });
});
