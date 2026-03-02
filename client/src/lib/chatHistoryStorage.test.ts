import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  saveChatHistory,
  loadChatHistory,
  clearChatHistory,
  getChatHistoryStats,
  exportChatHistory,
  importChatHistory,
  ChatMessage,
} from './chatHistoryStorage';

describe('Chat History Storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('saveChatHistory', () => {
    it('should save messages to localStorage', () => {
      const messages: ChatMessage[] = [
        {
          role: 'user',
          content: 'Hello',
          timestamp: Date.now(),
        },
        {
          role: 'assistant',
          content: 'Hi there!',
          timestamp: Date.now(),
        },
      ];

      const result = saveChatHistory(messages);
      expect(result).toBe(true);

      const stored = localStorage.getItem('qumus_chat_history');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.messages).toHaveLength(2);
      expect(parsed.version).toBe(1);
    });

    it('should handle empty messages array', () => {
      const result = saveChatHistory([]);
      expect(result).toBe(true);

      const stored = localStorage.getItem('qumus_chat_history');
      const parsed = JSON.parse(stored!);
      expect(parsed.messages).toHaveLength(0);
    });

    it('should truncate messages to MAX_MESSAGES (100)', () => {
      const messages: ChatMessage[] = Array.from({ length: 150 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
        timestamp: Date.now() + i,
      }));

      saveChatHistory(messages);
      const loaded = loadChatHistory();
      expect(loaded).toHaveLength(100);
      // Should keep the last 100 messages
      expect(loaded[0].content).toBe('Message 50');
    });
  });

  describe('loadChatHistory', () => {
    it('should load messages from localStorage', () => {
      const messages: ChatMessage[] = [
        {
          role: 'user',
          content: 'Test message',
          timestamp: Date.now(),
        },
      ];

      saveChatHistory(messages);
      const loaded = loadChatHistory();

      expect(loaded).toHaveLength(1);
      expect(loaded[0].content).toBe('Test message');
      expect(loaded[0].role).toBe('user');
    });

    it('should return empty array if no history exists', () => {
      const loaded = loadChatHistory();
      expect(loaded).toEqual([]);
    });

    it('should handle corrupted data gracefully', () => {
      localStorage.setItem('qumus_chat_history', 'invalid json');
      const loaded = loadChatHistory();
      expect(loaded).toEqual([]);
    });

    it('should handle version mismatch', () => {
      const invalidData = {
        version: 999,
        messages: [],
        lastUpdated: Date.now(),
      };
      localStorage.setItem('qumus_chat_history', JSON.stringify(invalidData));

      const loaded = loadChatHistory();
      expect(loaded).toEqual([]);
      // Should clear the invalid data
      expect(localStorage.getItem('qumus_chat_history')).toBeNull();
    });
  });

  describe('clearChatHistory', () => {
    it('should clear chat history from localStorage', () => {
      const messages: ChatMessage[] = [
        {
          role: 'user',
          content: 'Test',
          timestamp: Date.now(),
        },
      ];

      saveChatHistory(messages);
      expect(localStorage.getItem('qumus_chat_history')).toBeTruthy();

      const result = clearChatHistory();
      expect(result).toBe(true);
      expect(localStorage.getItem('qumus_chat_history')).toBeNull();
    });
  });

  describe('getChatHistoryStats', () => {
    it('should return stats for existing history', () => {
      const messages: ChatMessage[] = [
        {
          role: 'user',
          content: 'Test 1',
          timestamp: Date.now(),
        },
        {
          role: 'assistant',
          content: 'Response 1',
          timestamp: Date.now(),
        },
      ];

      saveChatHistory(messages);
      const stats = getChatHistoryStats();

      expect(stats.messageCount).toBe(2);
      expect(stats.storageSize).toBeGreaterThan(0);
      expect(stats.lastUpdated).toBeTruthy();
    });

    it('should return zero stats when no history exists', () => {
      const stats = getChatHistoryStats();

      expect(stats.messageCount).toBe(0);
      expect(stats.storageSize).toBe(0);
      expect(stats.lastUpdated).toBeNull();
    });
  });

  describe('exportChatHistory', () => {
    it('should export messages as JSON string', () => {
      const messages: ChatMessage[] = [
        {
          role: 'user',
          content: 'Export test',
          timestamp: 1234567890,
        },
      ];

      saveChatHistory(messages);
      const exported = exportChatHistory();

      expect(typeof exported).toBe('string');
      const parsed = JSON.parse(exported);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].content).toBe('Export test');
    });

    it('should return empty array JSON when no history exists', () => {
      const exported = exportChatHistory();
      const parsed = JSON.parse(exported);
      expect(parsed).toEqual([]);
    });
  });

  describe('importChatHistory', () => {
    it('should import valid JSON messages', () => {
      const messages: ChatMessage[] = [
        {
          role: 'user',
          content: 'Imported message',
          timestamp: 1234567890,
        },
      ];

      const json = JSON.stringify(messages);
      const result = importChatHistory(json);

      expect(result).toBe(true);
      const loaded = loadChatHistory();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].content).toBe('Imported message');
    });

    it('should reject invalid JSON', () => {
      const result = importChatHistory('invalid json');
      expect(result).toBe(false);
    });

    it('should reject non-array JSON', () => {
      const result = importChatHistory(JSON.stringify({ invalid: 'format' }));
      expect(result).toBe(false);
    });

    it('should reject messages with missing fields', () => {
      const invalidMessages = [
        {
          role: 'user',
          // missing content and timestamp
        },
      ];

      const result = importChatHistory(JSON.stringify(invalidMessages));
      expect(result).toBe(false);
    });
  });
});
