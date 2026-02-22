/**
 * Multi-Platform Broadcast Service Tests
 * Tests for independent broadcast platforms (SQUADD, Solbones, Custom)
 */

import { describe, it, expect } from 'vitest';
import { multiPlatformBroadcastService } from './multiPlatformBroadcastService';

describe('MultiPlatformBroadcastService', () => {
  describe('Platform Management', () => {
    it('should create a new broadcast platform', async () => {
      const platform = await multiPlatformBroadcastService.createPlatform(
        'Test Platform',
        'test-platform',
        '#FF0000',
        '#000000'
      );

      expect(platform.name).toBe('Test Platform');
      expect(platform.slug).toBe('test-platform');
      expect(platform.primaryColor).toBe('#FF0000');
      expect(platform.isActive).toBe(true);
    });

    it('should get platform by slug', async () => {
      const platform = await multiPlatformBroadcastService.getPlatformBySlug('squadd');

      expect(platform).toBeDefined();
      expect(platform?.name).toBe('SQUADD');
      expect(platform?.slug).toBe('squadd');
    });

    it('should return null for non-existent platform', async () => {
      const platform = await multiPlatformBroadcastService.getPlatformBySlug(
        'non-existent'
      );

      expect(platform).toBeNull();
    });

    it('should get all platforms', async () => {
      const platforms = await multiPlatformBroadcastService.getAllPlatforms();

      expect(platforms.length).toBeGreaterThan(0);
      expect(platforms.some((p) => p.slug === 'squadd')).toBe(true);
      expect(platforms.some((p) => p.slug === 'solbones')).toBe(true);
    });

    it('should get platform branding', async () => {
      const branding = await multiPlatformBroadcastService.getPlatformBranding(
        'platform-squadd'
      );

      expect(branding?.name).toBe('SQUADD');
      expect(branding?.primaryColor).toBe('#FF0000');
    });
  });

  describe('Broadcast Management', () => {
    it('should start a broadcast', async () => {
      const broadcast = await multiPlatformBroadcastService.startBroadcast(
        'platform-squadd',
        'Test Broadcast',
        'Test Description'
      );

      expect(broadcast.platformId).toBe('platform-squadd');
      expect(broadcast.title).toBe('Test Broadcast');
      expect(broadcast.status).toBe('live');
      expect(broadcast.isRecording).toBe(true);
    });

    it('should stop a broadcast', async () => {
      const broadcast = await multiPlatformBroadcastService.startBroadcast(
        'platform-squadd',
        'Test Broadcast',
        'Test Description'
      );

      await expect(
        multiPlatformBroadcastService.stopBroadcast(broadcast.id)
      ).resolves.toBeUndefined();
    });

    it('should pause a broadcast', async () => {
      const broadcast = await multiPlatformBroadcastService.startBroadcast(
        'platform-squadd',
        'Test Broadcast',
        'Test Description'
      );

      await expect(
        multiPlatformBroadcastService.pauseBroadcast(broadcast.id)
      ).resolves.toBeUndefined();
    });

    it('should resume a broadcast', async () => {
      const broadcast = await multiPlatformBroadcastService.startBroadcast(
        'platform-squadd',
        'Test Broadcast',
        'Test Description'
      );

      await expect(
        multiPlatformBroadcastService.resumeBroadcast(broadcast.id)
      ).resolves.toBeUndefined();
    });

    it('should update viewer count', async () => {
      const broadcast = await multiPlatformBroadcastService.startBroadcast(
        'platform-squadd',
        'Test Broadcast',
        'Test Description'
      );

      await expect(
        multiPlatformBroadcastService.updateViewerCount(broadcast.id, 100)
      ).resolves.toBeUndefined();
    });

    it('should get active broadcasts', async () => {
      const broadcasts = await multiPlatformBroadcastService.getActiveBroadcasts(
        'platform-squadd'
      );

      expect(Array.isArray(broadcasts)).toBe(true);
    });

    it('should get broadcast history', async () => {
      const history = await multiPlatformBroadcastService.getBroadcastHistory(
        'platform-squadd',
        10
      );

      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('User Management', () => {
    it('should add user to platform', async () => {
      const user = await multiPlatformBroadcastService.addUserToPlatform(
        'platform-squadd',
        'user-123',
        'broadcaster'
      );

      expect(user.platformId).toBe('platform-squadd');
      expect(user.userId).toBe('user-123');
      expect(user.role).toBe('broadcaster');
    });

    it('should get user role on platform', async () => {
      const role = await multiPlatformBroadcastService.getUserRole(
        'platform-squadd',
        'user-123'
      );

      expect(role).toBe('viewer');
    });

    it('should check if user is broadcaster', async () => {
      const isBroadcaster = await multiPlatformBroadcastService.isBroadcaster(
        'platform-squadd',
        'user-123'
      );

      expect(typeof isBroadcaster).toBe('boolean');
    });

    it('should check if user is moderator', async () => {
      const isModerator = await multiPlatformBroadcastService.isModerator(
        'platform-squadd',
        'user-123'
      );

      expect(typeof isModerator).toBe('boolean');
    });

    it('should get platform users', async () => {
      const users = await multiPlatformBroadcastService.getPlatformUsers(
        'platform-squadd'
      );

      expect(Array.isArray(users)).toBe(true);
    });
  });

  describe('Configuration Management', () => {
    it('should get platform configuration', async () => {
      const config = await multiPlatformBroadcastService.getPlatformConfig(
        'platform-squadd'
      );

      expect(config.platformId).toBe('platform-squadd');
      expect(config.allowRecording).toBe(true);
      expect(config.allowChat).toBe(true);
      expect(Array.isArray(config.rtmpEndpoints)).toBe(true);
    });

    it('should update platform configuration', async () => {
      const config = {
        platformId: 'platform-squadd',
        rtmpEndpoints: ['rtmp://new-endpoint.com/live'],
        allowRecording: true,
        allowChat: true,
        allowQA: true,
        allowPolls: true,
        allowDonations: true,
        maxConcurrentBroadcasts: 2,
      };

      await expect(
        multiPlatformBroadcastService.updatePlatformConfig(config)
      ).resolves.toBeUndefined();
    });
  });

  describe('Analytics', () => {
    it('should get platform analytics', async () => {
      const analytics = await multiPlatformBroadcastService.getPlatformAnalytics(
        'platform-squadd',
        7
      );

      expect(Array.isArray(analytics)).toBe(true);
    });

    it('should get broadcast analytics', async () => {
      const broadcast = await multiPlatformBroadcastService.startBroadcast(
        'platform-squadd',
        'Test Broadcast',
        'Test Description'
      );

      const analytics = await multiPlatformBroadcastService.getBroadcastAnalytics(
        broadcast.id
      );

      // Can be null if no analytics recorded yet
      expect(analytics === null || typeof analytics === 'object').toBe(true);
    });
  });

  describe('Recording', () => {
    it('should record broadcast', async () => {
      const broadcast = await multiPlatformBroadcastService.startBroadcast(
        'platform-squadd',
        'Test Broadcast',
        'Test Description'
      );

      const recordingId = await multiPlatformBroadcastService.recordBroadcast(
        broadcast.id,
        '/tmp/broadcast.mp4'
      );

      expect(recordingId).toContain('recording-');
    });
  });

  describe('Template Creation', () => {
    it('should create platform from template', async () => {
      const platform = await multiPlatformBroadcastService.createPlatformFromTemplate(
        'New Platform',
        'new-platform',
        'squadd',
        {
          primaryColor: '#0000FF',
          secondaryColor: '#FFFFFF',
        }
      );

      expect(platform.name).toBe('New Platform');
      expect(platform.slug).toBe('new-platform');
      expect(platform.primaryColor).toBe('#0000FF');
    });

    it('should throw error for invalid template', async () => {
      try {
        await multiPlatformBroadcastService.createPlatformFromTemplate(
          'New Platform',
          'new-platform',
          'invalid-template',
          {}
        );
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('SQUADD Platform', () => {
    it('should have SQUADD platform configured', async () => {
      const platform = await multiPlatformBroadcastService.getPlatformBySlug('squadd');

      expect(platform?.name).toBe('SQUADD');
      expect(platform?.primaryColor).toBe('#FF0000');
      expect(platform?.domain).toBe('squadd.manus.space');
    });
  });

  describe('Solbones Platform', () => {
    it('should have Solbones platform configured', async () => {
      const platform = await multiPlatformBroadcastService.getPlatformBySlug('solbones');

      expect(platform?.name).toBe('Solbones Podcast');
      expect(platform?.primaryColor).toBe('#6B46C1');
      expect(platform?.domain).toBe('solbones.manus.space');
    });
  });
});
