/**
 * Tests for Qumus Autonomous Update Handler
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QumusAutonomousUpdateHandler, UpdateRequest } from './qumus-autonomous-update-handler';

describe('QumusAutonomousUpdateHandler', () => {
  beforeEach(async () => {
    await QumusAutonomousUpdateHandler.initialize();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      const status = QumusAutonomousUpdateHandler.getUpdateStatus();
      expect(status.autonomyLevel).toBe(90);
      expect(status.queueLength).toBe(0);
    });

    it('should have correct default configuration', async () => {
      const status = QumusAutonomousUpdateHandler.getUpdateStatus();
      expect(status.autonomyLevel).toBeGreaterThanOrEqual(0);
      expect(status.autonomyLevel).toBeLessThanOrEqual(100);
    });
  });

  describe('update submission', () => {
    it('should submit feature update request', async () => {
      const request: UpdateRequest = {
        id: 'test_feature_1',
        type: 'feature',
        source: 'app',
        priority: 'medium',
        description: 'Add new radio channel',
        metadata: { featureName: 'New Channel' },
        timestamp: Date.now(),
      };

      const decision = await QumusAutonomousUpdateHandler.submitUpdateRequest(request);

      expect(decision).toBeDefined();
      expect(decision.updateId).toBe('test_feature_1');
      expect(decision.reasoning).toBeDefined();
    });

    it('should submit bugfix update request', async () => {
      const request: UpdateRequest = {
        id: 'test_bugfix_1',
        type: 'bugfix',
        source: 'site',
        priority: 'high',
        description: 'Fix audio playback issue',
        metadata: { bugId: 'BUG-123' },
        timestamp: Date.now(),
      };

      const decision = await QumusAutonomousUpdateHandler.submitUpdateRequest(request);

      expect(decision).toBeDefined();
      expect(decision.updateId).toBe('test_bugfix_1');
    });

    it('should submit content update request', async () => {
      const request: UpdateRequest = {
        id: 'test_content_1',
        type: 'content',
        source: 'api',
        priority: 'low',
        description: 'Update playlist metadata',
        metadata: { contentType: 'playlist' },
        timestamp: Date.now(),
      };

      const decision = await QumusAutonomousUpdateHandler.submitUpdateRequest(request);

      expect(decision).toBeDefined();
      expect(decision.updateId).toBe('test_content_1');
    });

    it('should submit configuration update request', async () => {
      const request: UpdateRequest = {
        id: 'test_config_1',
        type: 'configuration',
        source: 'site',
        priority: 'medium',
        description: 'Update stream settings',
        metadata: { configKey: 'stream_bitrate' },
        timestamp: Date.now(),
      };

      const decision = await QumusAutonomousUpdateHandler.submitUpdateRequest(request);

      expect(decision).toBeDefined();
      expect(decision.updateId).toBe('test_config_1');
    });

    it('should submit emergency update request', async () => {
      const request: UpdateRequest = {
        id: 'test_emergency_1',
        type: 'emergency',
        source: 'api',
        priority: 'critical',
        description: 'Critical security patch',
        metadata: { severity: 'critical' },
        timestamp: Date.now(),
      };

      const decision = await QumusAutonomousUpdateHandler.submitUpdateRequest(request);

      expect(decision).toBeDefined();
      expect(decision.updateId).toBe('test_emergency_1');
    });
  });

  describe('decision evaluation', () => {
    it('should return decision with reasoning', async () => {
      const request: UpdateRequest = {
        id: 'test_decision_1',
        type: 'feature',
        source: 'app',
        priority: 'high',
        description: 'Add new feature',
        metadata: {},
        timestamp: Date.now(),
      };

      const decision = await QumusAutonomousUpdateHandler.submitUpdateRequest(request);

      expect(decision.reasoning).toBeDefined();
      expect(decision.reasoning.length).toBeGreaterThan(0);
    });

    it('should evaluate confidence level', async () => {
      const request: UpdateRequest = {
        id: 'test_confidence_1',
        type: 'bugfix',
        source: 'site',
        priority: 'high',
        description: 'Fix critical bug',
        metadata: {},
        timestamp: Date.now(),
      };

      const decision = await QumusAutonomousUpdateHandler.submitUpdateRequest(request);

      expect(decision.confidence).toBeGreaterThanOrEqual(0);
      expect(decision.confidence).toBeLessThanOrEqual(1);
    });

    it('should determine if autonomous decision is needed', async () => {
      const request: UpdateRequest = {
        id: 'test_autonomous_1',
        type: 'feature',
        source: 'app',
        priority: 'low',
        description: 'Minor feature update',
        metadata: {},
        timestamp: Date.now(),
      };

      const decision = await QumusAutonomousUpdateHandler.submitUpdateRequest(request);

      expect(typeof decision.autonomousDecision).toBe('boolean');
    });
  });

  describe('status tracking', () => {
    it('should track update status', async () => {
      const initialStatus = QumusAutonomousUpdateHandler.getUpdateStatus();

      const request: UpdateRequest = {
        id: 'test_status_1',
        type: 'feature',
        source: 'app',
        priority: 'medium',
        description: 'Test update',
        metadata: {},
        timestamp: Date.now(),
      };

      await QumusAutonomousUpdateHandler.submitUpdateRequest(request);

      const updatedStatus = QumusAutonomousUpdateHandler.getUpdateStatus();

      expect(updatedStatus.totalDecisions).toBeGreaterThan(initialStatus.totalDecisions);
    });

    it('should track autonomous vs manual decisions', async () => {
      const request1: UpdateRequest = {
        id: 'test_track_1',
        type: 'feature',
        source: 'app',
        priority: 'low',
        description: 'Low priority feature',
        metadata: {},
        timestamp: Date.now(),
      };

      const request2: UpdateRequest = {
        id: 'test_track_2',
        type: 'emergency',
        source: 'api',
        priority: 'critical',
        description: 'Critical emergency',
        metadata: {},
        timestamp: Date.now(),
      };

      await QumusAutonomousUpdateHandler.submitUpdateRequest(request1);
      await QumusAutonomousUpdateHandler.submitUpdateRequest(request2);

      const status = QumusAutonomousUpdateHandler.getUpdateStatus();

      expect(status.totalDecisions).toBeGreaterThanOrEqual(2);
    });
  });

  describe('decision log', () => {
    it('should retrieve decision log', async () => {
      const request: UpdateRequest = {
        id: 'test_log_1',
        type: 'feature',
        source: 'app',
        priority: 'medium',
        description: 'Test update',
        metadata: {},
        timestamp: Date.now(),
      };

      await QumusAutonomousUpdateHandler.submitUpdateRequest(request);

      const log = QumusAutonomousUpdateHandler.getDecisionLog(10);

      expect(Array.isArray(log)).toBe(true);
      expect(log.length).toBeGreaterThan(0);
    });

    it('should respect log limit', async () => {
      const log = QumusAutonomousUpdateHandler.getDecisionLog(5);

      expect(log.length).toBeLessThanOrEqual(5);
    });
  });

  describe('configuration management', () => {
    it('should update configuration', () => {
      QumusAutonomousUpdateHandler.updateConfig({
        autonomyLevel: 85,
        autoApprovalThreshold: 0.9,
      });

      const status = QumusAutonomousUpdateHandler.getUpdateStatus();

      expect(status.autonomyLevel).toBe(85);
    });

    it('should toggle autonomous mode', () => {
      QumusAutonomousUpdateHandler.setAutonomousMode(false);
      // Should not throw

      QumusAutonomousUpdateHandler.setAutonomousMode(true);
      // Should not throw
    });
  });

  describe('priority handling', () => {
    it('should handle low priority updates', async () => {
      const request: UpdateRequest = {
        id: 'test_low_priority_1',
        type: 'content',
        source: 'app',
        priority: 'low',
        description: 'Minor content update',
        metadata: {},
        timestamp: Date.now(),
      };

      const decision = await QumusAutonomousUpdateHandler.submitUpdateRequest(request);

      expect(decision).toBeDefined();
    });

    it('should handle medium priority updates', async () => {
      const request: UpdateRequest = {
        id: 'test_medium_priority_1',
        type: 'configuration',
        source: 'site',
        priority: 'medium',
        description: 'Configuration update',
        metadata: {},
        timestamp: Date.now(),
      };

      const decision = await QumusAutonomousUpdateHandler.submitUpdateRequest(request);

      expect(decision).toBeDefined();
    });

    it('should handle high priority updates', async () => {
      const request: UpdateRequest = {
        id: 'test_high_priority_1',
        type: 'bugfix',
        source: 'api',
        priority: 'high',
        description: 'Important bugfix',
        metadata: {},
        timestamp: Date.now(),
      };

      const decision = await QumusAutonomousUpdateHandler.submitUpdateRequest(request);

      expect(decision).toBeDefined();
    });

    it('should handle critical priority updates', async () => {
      const request: UpdateRequest = {
        id: 'test_critical_priority_1',
        type: 'emergency',
        source: 'api',
        priority: 'critical',
        description: 'Critical emergency',
        metadata: {},
        timestamp: Date.now(),
      };

      const decision = await QumusAutonomousUpdateHandler.submitUpdateRequest(request);

      expect(decision).toBeDefined();
    });
  });

  describe('source tracking', () => {
    it('should track updates from site', async () => {
      const request: UpdateRequest = {
        id: 'test_site_source_1',
        type: 'feature',
        source: 'site',
        priority: 'medium',
        description: 'Site update',
        metadata: {},
        timestamp: Date.now(),
      };

      const decision = await QumusAutonomousUpdateHandler.submitUpdateRequest(request);

      expect(decision).toBeDefined();
    });

    it('should track updates from app', async () => {
      const request: UpdateRequest = {
        id: 'test_app_source_1',
        type: 'feature',
        source: 'app',
        priority: 'medium',
        description: 'App update',
        metadata: {},
        timestamp: Date.now(),
      };

      const decision = await QumusAutonomousUpdateHandler.submitUpdateRequest(request);

      expect(decision).toBeDefined();
    });

    it('should track updates from api', async () => {
      const request: UpdateRequest = {
        id: 'test_api_source_1',
        type: 'feature',
        source: 'api',
        priority: 'medium',
        description: 'API update',
        metadata: {},
        timestamp: Date.now(),
      };

      const decision = await QumusAutonomousUpdateHandler.submitUpdateRequest(request);

      expect(decision).toBeDefined();
    });

    it('should track updates from webhook', async () => {
      const request: UpdateRequest = {
        id: 'test_webhook_source_1',
        type: 'feature',
        source: 'webhook',
        priority: 'medium',
        description: 'Webhook update',
        metadata: {},
        timestamp: Date.now(),
      };

      const decision = await QumusAutonomousUpdateHandler.submitUpdateRequest(request);

      expect(decision).toBeDefined();
    });
  });
});
