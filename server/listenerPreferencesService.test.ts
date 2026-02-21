import { describe, it, expect, beforeEach } from 'vitest';
import { listenerPreferencesService, type ListenerPreferences } from './listenerPreferencesService';

describe('ListenerPreferencesService', () => {
  const testUserId = 'test-user-123';

  beforeEach(async () => {
    // Clean up test data if needed
  });

  describe('Default Preferences', () => {
    it('should create default preferences for new user', async () => {
      const prefs = await listenerPreferencesService.createDefaultPreferences(testUserId);

      expect(prefs).toBeDefined();
      expect(prefs.userId).toBe(testUserId);
      expect(prefs.preferredQuality).toBe('medium');
      expect(prefs.autoAdjustQuality).toBe(true);
      expect(prefs.notificationFrequency).toBe('daily');
      expect(prefs.volume).toBe(70);
      expect(prefs.darkMode).toBe(true);
      expect(prefs.autoPlay).toBe(false);
      expect(prefs.rememberLastStream).toBe(true);
      expect(Array.isArray(prefs.favoriteChannels)).toBe(true);
      expect(Array.isArray(prefs.blockedChannels)).toBe(true);
    });

    it('should have correct default values', async () => {
      const prefs = await listenerPreferencesService.createDefaultPreferences(testUserId);

      expect(prefs.language).toBe('en');
      expect(prefs.timezone).toBeDefined();
      expect(prefs.createdAt).toBeInstanceOf(Date);
      expect(prefs.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Quality Preferences', () => {
    it('should update quality preference', async () => {
      await listenerPreferencesService.createDefaultPreferences(testUserId);
      const result = await listenerPreferencesService.updateQualityPreference(testUserId, 'high');

      expect(result).toBe(true);
    });

    it('should support all quality levels', async () => {
      await listenerPreferencesService.createDefaultPreferences(testUserId);

      const qualities = ['low', 'medium', 'high', 'lossless'] as const;
      for (const quality of qualities) {
        const result = await listenerPreferencesService.updateQualityPreference(testUserId, quality);
        expect(result).toBe(true);
      }
    });
  });

  describe('Notification Settings', () => {
    it('should update notification settings', async () => {
      await listenerPreferencesService.createDefaultPreferences(testUserId);

      const result = await listenerPreferencesService.updateNotificationSettings(testUserId, {
        frequency: 'weekly',
        email: false,
        browser: true,
      });

      expect(result).toBe(true);
    });

    it('should support all notification frequencies', async () => {
      await listenerPreferencesService.createDefaultPreferences(testUserId);

      const frequencies = ['instant', 'daily', 'weekly', 'never'] as const;
      for (const freq of frequencies) {
        const result = await listenerPreferencesService.updateNotificationSettings(testUserId, {
          frequency: freq,
        });
        expect(result).toBe(true);
      }
    });
  });

  describe('Favorite Channels', () => {
    it('should add channel to favorites', async () => {
      await listenerPreferencesService.createDefaultPreferences(testUserId);

      const result = await listenerPreferencesService.addFavoriteChannel(
        testUserId,
        'https://example.com/channel1'
      );

      expect(result).toBe(true);
    });

    it('should not add duplicate favorite channels', async () => {
      await listenerPreferencesService.createDefaultPreferences(testUserId);
      const channelUrl = 'https://example.com/channel1';

      await listenerPreferencesService.addFavoriteChannel(testUserId, channelUrl);
      await listenerPreferencesService.addFavoriteChannel(testUserId, channelUrl);

      const prefs = await listenerPreferencesService.getPreferences(testUserId);
      const count = prefs?.favoriteChannels.filter(url => url === channelUrl).length;
      expect(count).toBe(1);
    });

    it('should remove channel from favorites', async () => {
      await listenerPreferencesService.createDefaultPreferences(testUserId);
      const channelUrl = 'https://example.com/channel1';

      await listenerPreferencesService.addFavoriteChannel(testUserId, channelUrl);
      const result = await listenerPreferencesService.removeFavoriteChannel(testUserId, channelUrl);

      expect(result).toBe(true);

      const prefs = await listenerPreferencesService.getPreferences(testUserId);
      expect(prefs?.favoriteChannels).not.toContain(channelUrl);
    });
  });

  describe('Blocked Channels', () => {
    it('should block channel', async () => {
      await listenerPreferencesService.createDefaultPreferences(testUserId);

      const result = await listenerPreferencesService.blockChannel(
        testUserId,
        'https://example.com/blocked'
      );

      expect(result).toBe(true);
    });

    it('should remove from favorites when blocking', async () => {
      await listenerPreferencesService.createDefaultPreferences(testUserId);
      const channelUrl = 'https://example.com/channel1';

      await listenerPreferencesService.addFavoriteChannel(testUserId, channelUrl);
      await listenerPreferencesService.blockChannel(testUserId, channelUrl);

      const prefs = await listenerPreferencesService.getPreferences(testUserId);
      expect(prefs?.favoriteChannels).not.toContain(channelUrl);
      expect(prefs?.blockedChannels).toContain(channelUrl);
    });

    it('should unblock channel', async () => {
      await listenerPreferencesService.createDefaultPreferences(testUserId);
      const channelUrl = 'https://example.com/blocked';

      await listenerPreferencesService.blockChannel(testUserId, channelUrl);
      const result = await listenerPreferencesService.unblockChannel(testUserId, channelUrl);

      expect(result).toBe(true);

      const prefs = await listenerPreferencesService.getPreferences(testUserId);
      expect(prefs?.blockedChannels).not.toContain(channelUrl);
    });
  });

  describe('Last Stream Tracking', () => {
    it('should update last played stream', async () => {
      await listenerPreferencesService.createDefaultPreferences(testUserId);

      const result = await listenerPreferencesService.updateLastStream(
        testUserId,
        'https://example.com/stream',
        'My Favorite Stream'
      );

      expect(result).toBe(true);
    });

    it('should remember last stream when enabled', async () => {
      await listenerPreferencesService.createDefaultPreferences(testUserId);
      const streamUrl = 'https://example.com/stream';
      const streamName = 'My Favorite Stream';

      await listenerPreferencesService.updateLastStream(testUserId, streamUrl, streamName);

      const prefs = await listenerPreferencesService.getPreferences(testUserId);
      expect(prefs?.lastStreamUrl).toBe(streamUrl);
      expect(prefs?.lastStreamName).toBe(streamName);
    });
  });

  describe('Export/Import', () => {
    it('should export preferences as JSON', async () => {
      await listenerPreferencesService.createDefaultPreferences(testUserId);

      const json = await listenerPreferencesService.exportPreferences(testUserId);

      expect(json).toBeDefined();
      expect(typeof json).toBe('string');

      const parsed = JSON.parse(json!);
      expect(parsed.userId).toBe(testUserId);
      expect(parsed.preferredQuality).toBe('medium');
    });

    it('should import preferences from JSON', async () => {
      await listenerPreferencesService.createDefaultPreferences(testUserId);

      const prefsToImport: Partial<ListenerPreferences> = {
        preferredQuality: 'high',
        volume: 85,
        darkMode: false,
      };

      const json = JSON.stringify(prefsToImport);
      const result = await listenerPreferencesService.importPreferences(testUserId, json);

      expect(result).toBe(true);
    });

    it('should handle invalid JSON import gracefully', async () => {
      await listenerPreferencesService.createDefaultPreferences(testUserId);

      const result = await listenerPreferencesService.importPreferences(testUserId, 'invalid json');

      expect(result).toBe(false);
    });
  });

  describe('Preferences Retrieval', () => {
    it('should return null for non-existent user', async () => {
      const prefs = await listenerPreferencesService.getPreferences('non-existent-user');

      expect(prefs).toBeNull();
    });

    it('should retrieve existing preferences', async () => {
      await listenerPreferencesService.createDefaultPreferences(testUserId);

      const prefs = await listenerPreferencesService.getPreferences(testUserId);

      expect(prefs).toBeDefined();
      expect(prefs?.userId).toBe(testUserId);
    });
  });

  describe('Preferences Update', () => {
    it('should update multiple preference fields', async () => {
      await listenerPreferencesService.createDefaultPreferences(testUserId);

      const updates = {
        preferredQuality: 'high' as const,
        volume: 90,
        darkMode: false,
        language: 'es',
      };

      const result = await listenerPreferencesService.updatePreferences(testUserId, updates);

      expect(result).toBeDefined();
      expect(result?.preferredQuality).toBe('high');
      expect(result?.volume).toBe(90);
      expect(result?.darkMode).toBe(false);
      expect(result?.language).toBe('es');
    });

    it('should preserve other fields when updating', async () => {
      await listenerPreferencesService.createDefaultPreferences(testUserId);

      await listenerPreferencesService.updatePreferences(testUserId, {
        preferredQuality: 'high',
      });

      const prefs = await listenerPreferencesService.getPreferences(testUserId);

      expect(prefs?.volume).toBe(70); // Should remain default
      expect(prefs?.autoPlay).toBe(false); // Should remain default
    });
  });
});
