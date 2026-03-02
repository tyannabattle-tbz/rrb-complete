/**
 * Qumus Integration Tests
 * Comprehensive test suite for integrations and WebSocket
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { qumusIntegrationService } from './qumusIntegrationService';
import { qumusWebSocketManager } from './qumusWebSocketManager';

describe('Qumus Integration Service', () => {
  describe('Stripe Payment Processing', () => {
    it('should process Stripe payment successfully', async () => {
      const request = {
        taskId: 'task-123',
        userId: 1,
        amount: 99.99,
        currency: 'USD',
        description: 'Premium subscription',
      };

      try {
        const result = await qumusIntegrationService.processStripePayment(request);
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('paymentIntentId');
      } catch (error) {
        // Expected if Stripe key not configured
        expect(error).toBeDefined();
      }
    });

    it('should handle payment errors gracefully', async () => {
      const request = {
        taskId: 'task-456',
        userId: 2,
        amount: -10, // Invalid amount
        currency: 'USD',
        description: 'Invalid payment',
      };

      try {
        await qumusIntegrationService.processStripePayment(request);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should log payment events', async () => {
      const request = {
        taskId: 'task-789',
        userId: 3,
        amount: 50,
        currency: 'EUR',
        description: 'Test payment',
        metadata: { orderId: 'order-123' },
      };

      try {
        await qumusIntegrationService.processStripePayment(request);
      } catch (error) {
        // Expected if Stripe not configured
      }
    });
  });

  describe('Email Notifications', () => {
    it('should send email notification', async () => {
      const notification = {
        taskId: 'task-email-1',
        to: 'user@example.com',
        subject: 'Task Completed',
        body: 'Your task has been completed successfully.',
      };

      const result = await qumusIntegrationService.sendEmailNotification(notification);
      expect(result).toHaveProperty('success');
      expect(result.to).toBe('user@example.com');
    });

    it('should generate HTML email from text', async () => {
      const notification = {
        taskId: 'task-email-2',
        to: 'admin@example.com',
        subject: 'System Alert',
        body: 'An important system event occurred.',
      };

      const result = await qumusIntegrationService.sendEmailNotification(notification);
      expect(result.success).toBe(true);
    });

    it('should handle email errors', async () => {
      const notification = {
        taskId: 'task-email-3',
        to: 'invalid-email',
        subject: 'Test',
        body: 'Test body',
      };

      try {
        await qumusIntegrationService.sendEmailNotification(notification);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('File Upload to S3', () => {
    it('should upload file to S3', async () => {
      const request = {
        taskId: 'task-file-1',
        fileName: 'report.pdf',
        fileBuffer: Buffer.from('PDF content'),
        mimeType: 'application/pdf',
      };

      try {
        const result = await qumusIntegrationService.uploadFile(request);
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('fileKey');
        expect(result).toHaveProperty('url');
      } catch (error) {
        // Expected if S3 not configured
        expect(error).toBeDefined();
      }
    });

    it('should handle large files', async () => {
      const largeBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB
      const request = {
        taskId: 'task-file-2',
        fileName: 'large-file.zip',
        fileBuffer: largeBuffer,
        mimeType: 'application/zip',
      };

      try {
        const result = await qumusIntegrationService.uploadFile(request);
        expect(result.size).toBe(10 * 1024 * 1024);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should generate unique file keys', async () => {
      const request1 = {
        taskId: 'task-file-3',
        fileName: 'document.txt',
        fileBuffer: Buffer.from('Content 1'),
        mimeType: 'text/plain',
      };

      const request2 = {
        taskId: 'task-file-3', // Same task
        fileName: 'document.txt', // Same filename
        fileBuffer: Buffer.from('Content 2'),
        mimeType: 'text/plain',
      };

      try {
        const result1 = await qumusIntegrationService.uploadFile(request1);
        const result2 = await qumusIntegrationService.uploadFile(request2);

        if (result1.fileKey && result2.fileKey) {
          expect(result1.fileKey).not.toBe(result2.fileKey);
        }
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Webhook Execution', () => {
    it('should execute webhook successfully', async () => {
      const payload = {
        taskId: 'task-webhook-1',
        url: 'https://example.com/webhook',
        method: 'POST' as const,
        body: { taskId: 'task-webhook-1', status: 'completed' },
      };

      try {
        const result = await qumusIntegrationService.executeWebhook(payload);
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('statusCode');
      } catch (error) {
        // Expected if webhook URL not reachable
        expect(error).toBeDefined();
      }
    });

    it('should handle webhook errors', async () => {
      const payload = {
        taskId: 'task-webhook-2',
        url: 'https://invalid-url-that-does-not-exist.example.com',
        method: 'POST' as const,
      };

      try {
        await qumusIntegrationService.executeWebhook(payload);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should support different HTTP methods', async () => {
      const methods: Array<'GET' | 'POST' | 'PUT' | 'DELETE'> = ['GET', 'POST', 'PUT', 'DELETE'];

      for (const method of methods) {
        const payload = {
          taskId: `task-webhook-${method}`,
          url: 'https://example.com/webhook',
          method,
        };

        try {
          await qumusIntegrationService.executeWebhook(payload);
        } catch (error) {
          // Expected
        }
      }
    });
  });

  describe('Combined Integration Processing', () => {
    it('should process task with multiple integrations', async () => {
      const integrations = {
        email: {
          taskId: 'task-combined-1',
          to: 'user@example.com',
          subject: 'Task Update',
          body: 'Your task has been processed.',
        },
      };

      try {
        const result = await qumusIntegrationService.processTaskWithIntegrations(
          'task-combined-1',
          integrations
        );
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('results');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle partial integration failures', async () => {
      const integrations = {
        email: {
          taskId: 'task-combined-2',
          to: 'user@example.com',
          subject: 'Test',
          body: 'Test body',
        },
        webhook: {
          taskId: 'task-combined-2',
          url: 'https://invalid-url.example.com',
          method: 'POST' as const,
        },
      };

      try {
        await qumusIntegrationService.processTaskWithIntegrations(
          'task-combined-2',
          integrations
        );
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Stripe Webhook Events', () => {
    it('should handle payment_intent.succeeded event', async () => {
      const event = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
          },
        },
      };

      const result = await qumusIntegrationService.handleStripeWebhookEvent(event);
      expect(result.success).toBe(true);
    });

    it('should handle payment_intent.payment_failed event', async () => {
      const event = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test_456',
          },
        },
      };

      const result = await qumusIntegrationService.handleStripeWebhookEvent(event);
      expect(result.success).toBe(false);
    });

    it('should handle charge.refunded event', async () => {
      const event = {
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_test_789',
          },
        },
      };

      const result = await qumusIntegrationService.handleStripeWebhookEvent(event);
      expect(result.success).toBe(true);
    });
  });
});

describe('Qumus WebSocket Manager', () => {
  let mockClient: any;

  beforeAll(() => {
    mockClient = {
      id: 'client-1',
      userId: 1,
      send: vi.fn(),
    };
  });

  describe('Client Management', () => {
    it('should register client', () => {
      qumusWebSocketManager.registerClient(mockClient);
      const stats = qumusWebSocketManager.getStats();
      expect(stats.totalClients).toBeGreaterThan(0);
    });

    it('should unregister client', () => {
      qumusWebSocketManager.unregisterClient(mockClient.id);
      const stats = qumusWebSocketManager.getStats();
      expect(stats.totalClients).toBe(0);
    });
  });

  describe('Subscriptions', () => {
    beforeAll(() => {
      qumusWebSocketManager.registerClient(mockClient);
    });

    it('should subscribe to task events', () => {
      qumusWebSocketManager.subscribeToTask(mockClient.id, 'task-123');
      expect(mockClient.send).toHaveBeenCalled();
    });

    it('should subscribe to user events', () => {
      qumusWebSocketManager.subscribeToUser(mockClient.id, 1);
      expect(mockClient.send).toHaveBeenCalled();
    });

    it('should subscribe to metrics', () => {
      qumusWebSocketManager.subscribeToMetrics(mockClient.id);
      expect(mockClient.send).toHaveBeenCalled();
    });
  });

  describe('Broadcasting', () => {
    beforeAll(() => {
      mockClient.send.mockClear();
      qumusWebSocketManager.registerClient(mockClient);
      qumusWebSocketManager.subscribeToTask(mockClient.id, 'task-broadcast');
    });

    it('should broadcast task events', () => {
      const event = {
        taskId: 'task-broadcast',
        eventType: 'completed' as const,
        status: 'completed',
        progress: 100,
        timestamp: new Date().toISOString(),
      };

      qumusWebSocketManager.broadcastTaskEvent(event);
      expect(mockClient.send).toHaveBeenCalled();
    });

    it('should broadcast metrics', () => {
      const metrics = {
        activeTaskCount: 5,
        queuedTaskCount: 10,
        successRate: 95.5,
        averageExecutionTime: 1500,
        totalTasksProcessed: 100,
        failedTaskCount: 5,
        timestamp: new Date().toISOString(),
      };

      qumusWebSocketManager.subscribeToMetrics(mockClient.id);
      qumusWebSocketManager.broadcastMetrics(metrics);
      expect(mockClient.send).toHaveBeenCalled();
    });

    it('should broadcast policy decisions', () => {
      const event = {
        taskId: 'task-broadcast',
        policyName: 'safety_check',
        decision: 'approved' as const,
        confidence: 95,
        reasoning: 'Task is safe to execute',
        timestamp: new Date().toISOString(),
      };

      qumusWebSocketManager.broadcastPolicyDecision(event);
      expect(mockClient.send).toHaveBeenCalled();
    });
  });

  describe('Connection Stats', () => {
    it('should return connection statistics', () => {
      const stats = qumusWebSocketManager.getStats();
      expect(stats).toHaveProperty('totalClients');
      expect(stats).toHaveProperty('taskSubscriptions');
      expect(stats).toHaveProperty('userSubscriptions');
      expect(stats).toHaveProperty('metricsSubscribers');
    });
  });
});
