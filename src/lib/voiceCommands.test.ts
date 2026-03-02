import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  parseVoiceCommand,
  VoiceCommandManager,
  VoiceCommand,
} from './voiceCommands';

describe('Voice Commands', () => {
  describe('parseVoiceCommand', () => {
    it('should recognize generate_video intent', () => {
      const command = parseVoiceCommand('Generate a video');
      expect(command.intent).toBe('generate_video');
      expect(command.confidence).toBeGreaterThan(0.9);
    });

    it('should recognize start_collaboration intent', () => {
      const command = parseVoiceCommand('Start collaboration');
      expect(command.intent).toBe('start_collaboration');
    });

    it('should recognize show_analytics intent', () => {
      const command = parseVoiceCommand('Show analytics');
      expect(command.intent).toBe('show_analytics');
    });

    it('should recognize batch_process intent', () => {
      const command = parseVoiceCommand('Batch process 50 videos');
      expect(command.intent).toBe('batch_process');
      expect(command.parameters.videoCount).toBe(50);
    });

    it('should extract parameters from transcript', () => {
      const command = parseVoiceCommand('Generate video with cinematic effect');
      expect(command.intent).toBe('generate_video');
      expect(command.parameters.effect).toBe('cinematic');
    });

    it('should handle unknown intents', () => {
      const command = parseVoiceCommand('Random text that does not match');
      expect(command.intent).toBe('unknown');
    });

    it('should extract duration parameter', () => {
      const command = parseVoiceCommand('Generate video for 30 seconds');
      expect(command.parameters.duration).toBe(30);
    });
  });

  describe('VoiceCommandManager', () => {
    let manager: VoiceCommandManager;

    beforeEach(() => {
      manager = new VoiceCommandManager();
    });

    it('should initialize with correct state', () => {
      const state = manager.getState();
      expect(state.isListening).toBe(false);
      expect(state.isProcessing).toBe(false);
      expect(state.commandHistory).toEqual([]);
    });

    it('should register command handlers', async () => {
      const handler = vi.fn(async () => ({
        success: true,
        message: 'Command executed',
      }));

      manager.registerHandler('generate_video', handler);

      const command: VoiceCommand = {
        intent: 'generate_video',
        text: 'Generate video',
        confidence: 0.95,
        parameters: {},
        timestamp: new Date(),
      };

      const result = await manager.executeCommand(command);
      expect(result.success).toBe(true);
    });

    it('should handle command execution errors', async () => {
      const handler = vi.fn(async () => {
        throw new Error('Processing failed');
      });

      manager.registerHandler('generate_video', handler);

      const command: VoiceCommand = {
        intent: 'generate_video',
        text: 'Generate video',
        confidence: 0.95,
        parameters: {},
        timestamp: new Date(),
      };

      const result = await manager.executeCommand(command);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should maintain command history', async () => {
      const handler = vi.fn(async () => ({
        success: true,
        message: 'Done',
      }));

      manager.registerHandler('generate_video', handler);

      const command: VoiceCommand = {
        intent: 'generate_video',
        text: 'Generate video',
        confidence: 0.95,
        parameters: {},
        timestamp: new Date(),
      };

      await manager.executeCommand(command);
      const history = manager.getCommandHistory();

      expect(history).toHaveLength(1);
      expect(history[0].text).toBe('Generate video');
    });

    it('should clear command history', async () => {
      const handler = vi.fn(async () => ({
        success: true,
        message: 'Done',
      }));

      manager.registerHandler('generate_video', handler);

      const command: VoiceCommand = {
        intent: 'generate_video',
        text: 'Generate video',
        confidence: 0.95,
        parameters: {},
        timestamp: new Date(),
      };

      await manager.executeCommand(command);
      manager.clearHistory();

      const history = manager.getCommandHistory();
      expect(history).toHaveLength(0);
    });

    it('should process transcript and execute command', async () => {
      const handler = vi.fn(async () => ({
        success: true,
        message: 'Video generated',
      }));

      manager.registerHandler('generate_video', handler);

      const result = await manager.processTranscript('Generate a video');
      expect(result.success).toBe(true);
    });
  });
});
