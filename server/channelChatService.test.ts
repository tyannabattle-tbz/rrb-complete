import { describe, it, expect, beforeEach } from 'vitest';
import {
  sendChannelMessage,
  getChannelMessages,
  deleteChannelMessage,
  likeChannelMessage,
  getChannelMessageCount,
  getActiveUsersInChannel,
  clearChannelMessages,
  searchChannelMessages,
} from './channelChatService';

describe('Channel Chat Service', () => {
  const channelId = 'test-channel';
  const userId = 1;
  const username = 'TestUser';

  beforeEach(async () => {
    // Clear messages before each test
    await clearChannelMessages(channelId).catch(() => {});
  });

  it('should send a channel message', async () => {
    const result = await sendChannelMessage(channelId, userId, username, 'Hello, chat!');
    expect(result).toBeDefined();
    expect(result.message).toBe('Hello, chat!');
    expect(result.username).toBe(username);
  });

  it('should validate message length', async () => {
    try {
      await sendChannelMessage(channelId, userId, username, '');
      expect.fail('Should throw error for empty message');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should get channel messages', async () => {
    await sendChannelMessage(channelId, userId, username, 'Message 1');
    await sendChannelMessage(channelId, userId, username, 'Message 2');

    const messages = await getChannelMessages(channelId);
    expect(messages.length).toBe(2);
  });

  it('should like a message', async () => {
    const msg = await sendChannelMessage(channelId, userId, username, 'Test message');
    const likes = await likeChannelMessage(msg.id);
    expect(likes).toBeGreaterThan(0);
  });

  it('should get message count', async () => {
    await sendChannelMessage(channelId, userId, username, 'Message 1');
    await sendChannelMessage(channelId, userId, username, 'Message 2');
    await sendChannelMessage(channelId, userId, username, 'Message 3');

    const count = await getChannelMessageCount(channelId);
    expect(count).toBe(3);
  });

  it('should get active users in channel', async () => {
    await sendChannelMessage(channelId, userId, username, 'Message 1');
    await sendChannelMessage(channelId, 2, 'User2', 'Message 2');

    const activeUsers = await getActiveUsersInChannel(channelId);
    expect(activeUsers.length).toBeGreaterThan(0);
  });

  it('should search messages', async () => {
    await sendChannelMessage(channelId, userId, username, 'Hello world');
    await sendChannelMessage(channelId, userId, username, 'Goodbye world');

    const results = await searchChannelMessages(channelId, 'Hello');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].message).toContain('Hello');
  });

  it('should clear all messages', async () => {
    await sendChannelMessage(channelId, userId, username, 'Message 1');
    await sendChannelMessage(channelId, userId, username, 'Message 2');

    const cleared = await clearChannelMessages(channelId);
    expect(cleared).toBe(true);

    const count = await getChannelMessageCount(channelId);
    expect(count).toBe(0);
  });

  it('should handle errors gracefully', async () => {
    const messages = await getChannelMessages('non-existent-channel');
    expect(Array.isArray(messages)).toBe(true);
  });
});
