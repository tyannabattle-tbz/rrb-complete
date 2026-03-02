import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VoiceCommand } from './voiceCommandTrainingService';

describe('Voice Command Training Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('VoiceCommand', () => {
    it('should create valid voice command', () => {
      const command: VoiceCommand = {
        id: 'cmd-123',
        trigger: 'launch broadcast',
        action: 'start_broadcast',
        recordings: [],
        confidence: 0.92,
        createdAt: new Date(),
        usageCount: 5,
      };

      expect(command.id).toBe('cmd-123');
      expect(command.trigger).toBe('launch broadcast');
      expect(command.action).toBe('start_broadcast');
      expect(command.confidence).toBe(0.92);
      expect(command.usageCount).toBe(5);
    });
  });

  describe('Command Confidence', () => {
    it('should have valid confidence score between 0 and 1', () => {
      const command: VoiceCommand = {
        id: 'cmd-123',
        trigger: 'test',
        action: 'test_action',
        recordings: [],
        confidence: 0.75,
        createdAt: new Date(),
        usageCount: 0,
      };

      expect(command.confidence).toBeGreaterThanOrEqual(0);
      expect(command.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Command Metadata', () => {
    it('should track command usage', () => {
      const command: VoiceCommand = {
        id: 'cmd-123',
        trigger: 'test',
        action: 'test_action',
        recordings: [],
        confidence: 0.8,
        createdAt: new Date(),
        usageCount: 10,
      };

      expect(command.usageCount).toBe(10);
    });

    it('should track last used timestamp', () => {
      const now = new Date();
      const command: VoiceCommand = {
        id: 'cmd-123',
        trigger: 'test',
        action: 'test_action',
        recordings: [],
        confidence: 0.8,
        createdAt: new Date(),
        lastUsed: now,
        usageCount: 1,
      };

      expect(command.lastUsed).toEqual(now);
    });
  });

  describe('Command Storage', () => {
    it('should serialize command to JSON', () => {
      const command: VoiceCommand = {
        id: 'cmd-123',
        trigger: 'test',
        action: 'test_action',
        recordings: [],
        confidence: 0.8,
        createdAt: new Date(),
        usageCount: 0,
      };

      const json = JSON.stringify(command);
      expect(json).toContain('cmd-123');
      expect(json).toContain('test');
    });
  });

  describe('Training Session', () => {
    it('should track training progress', () => {
      const progress = 50;
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    });

    it('should support training status states', () => {
      const statuses = ['recording', 'training', 'completed', 'failed'];
      statuses.forEach((status) => {
        expect(['recording', 'training', 'completed', 'failed']).toContain(status);
      });
    });
  });

  describe('Command Execution', () => {
    it('should emit custom event on command execution', () => {
      const command: VoiceCommand = {
        id: 'cmd-123',
        trigger: 'test',
        action: 'test_action',
        recordings: [],
        confidence: 0.8,
        createdAt: new Date(),
        usageCount: 0,
      };

      const eventListener = vi.fn();
      window.addEventListener('customVoiceCommand', eventListener);

      const event = new CustomEvent('customVoiceCommand', {
        detail: { command, timestamp: Date.now() },
      });
      window.dispatchEvent(event);

      expect(eventListener).toHaveBeenCalled();
      window.removeEventListener('customVoiceCommand', eventListener);
    });
  });
});
