import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ARMetrics, WebSocketMessage } from './websocketService';

describe('WebSocket Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ARMetrics', () => {
    it('should create valid AR metrics', () => {
      const metrics: ARMetrics = {
        taskId: 'task-123',
        successRate: 0.95,
        executionTime: 2.5,
        resourceUsage: {
          cpu: 45.2,
          memory: 62.1,
          storage: 28.3,
        },
        timestamp: Date.now(),
      };

      expect(metrics.taskId).toBe('task-123');
      expect(metrics.successRate).toBe(0.95);
      expect(metrics.executionTime).toBe(2.5);
      expect(metrics.resourceUsage.cpu).toBe(45.2);
    });
  });

  describe('WebSocketMessage', () => {
    it('should create valid WebSocket message', () => {
      const message: WebSocketMessage = {
        type: 'metrics',
        data: {
          taskId: 'task-123',
          successRate: 0.95,
        },
        timestamp: Date.now(),
      };

      expect(message.type).toBe('metrics');
      expect(message.data.taskId).toBe('task-123');
      expect(message.timestamp).toBeGreaterThan(0);
    });
  });

  describe('Message Types', () => {
    it('should support metrics message type', () => {
      const message: WebSocketMessage = {
        type: 'metrics',
        data: {},
        timestamp: Date.now(),
      };
      expect(message.type).toBe('metrics');
    });

    it('should support command message type', () => {
      const message: WebSocketMessage = {
        type: 'command',
        data: { action: 'start_broadcast' },
        timestamp: Date.now(),
      };
      expect(message.type).toBe('command');
    });

    it('should support status message type', () => {
      const message: WebSocketMessage = {
        type: 'status',
        data: { connectedClients: 5 },
        timestamp: Date.now(),
      };
      expect(message.type).toBe('status');
    });

    it('should support error message type', () => {
      const message: WebSocketMessage = {
        type: 'error',
        data: { error: 'Connection failed' },
        timestamp: Date.now(),
      };
      expect(message.type).toBe('error');
    });
  });

  describe('Resource Usage', () => {
    it('should validate resource usage percentages', () => {
      const metrics: ARMetrics = {
        taskId: 'task-123',
        successRate: 0.85,
        executionTime: 1.5,
        resourceUsage: {
          cpu: 75,
          memory: 80,
          storage: 50,
        },
        timestamp: Date.now(),
      };

      expect(metrics.resourceUsage.cpu).toBeLessThanOrEqual(100);
      expect(metrics.resourceUsage.memory).toBeLessThanOrEqual(100);
      expect(metrics.resourceUsage.storage).toBeLessThanOrEqual(100);
    });
  });
});
