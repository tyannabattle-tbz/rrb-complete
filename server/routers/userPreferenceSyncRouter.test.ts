import { describe, it, expect } from 'vitest';
import { UserPreferenceSyncService } from '../services/userPreferenceSyncService';

describe('User Preference Sync Service', () => {
  const mockPreferences = [
    {
      userId: 'user123',
      key: 'theme',
      value: 'dark',
      deviceId: 'device1',
      timestamp: 1000,
    },
    {
      userId: 'user123',
      key: 'volume',
      value: 75,
      deviceId: 'device1',
      timestamp: 1100,
    },
  ];

  describe('Preference Merging', () => {
    it('should merge preferences from multiple devices', () => {
      const preferences = [
        ...mockPreferences,
        {
          userId: 'user123',
          key: 'theme',
          value: 'light',
          deviceId: 'device2',
          timestamp: 1050,
        },
      ];

      const merged = UserPreferenceSyncService.mergePreferences(preferences, 'lastWriteWins');
      expect(merged.size).toBeGreaterThan(0);
      expect(merged.has('theme')).toBe(true);
    });

    it('should use latest write wins strategy', () => {
      const preferences = [
        {
          userId: 'user123',
          key: 'setting',
          value: 'old',
          deviceId: 'device1',
          timestamp: 1000,
        },
        {
          userId: 'user123',
          key: 'setting',
          value: 'new',
          deviceId: 'device2',
          timestamp: 2000,
        },
      ];

      const merged = UserPreferenceSyncService.mergePreferences(preferences, 'lastWriteWins');
      const setting = merged.get('setting');
      expect(setting?.value).toBe('new');
    });

    it('should handle playback position merging', () => {
      const preferences = [
        {
          userId: 'user123',
          key: 'podcast_position',
          value: 1000,
          deviceId: 'device1',
          timestamp: 1000,
        },
        {
          userId: 'user123',
          key: 'podcast_position',
          value: 2000,
          deviceId: 'device2',
          timestamp: 1100,
        },
      ];

      const merged = UserPreferenceSyncService.mergePreferences(preferences, 'playbackPosition');
      const position = merged.get('podcast_position');
      expect(position?.value).toBe(2000); // Max position
    });
  });

  describe('Conflict Detection', () => {
    it('should detect conflicts between local and remote', () => {
      const localMap = new Map([
        ['theme', { ...mockPreferences[0], value: 'dark' }],
      ]);
      const remoteMap = new Map([
        ['theme', { ...mockPreferences[0], value: 'light' }],
      ]);

      const conflicts = UserPreferenceSyncService.detectConflicts(localMap, remoteMap);
      expect(conflicts.length).toBe(1);
      expect(conflicts[0].key).toBe('theme');
    });

    it('should not detect conflicts for identical values', () => {
      const localMap = new Map([
        ['theme', { ...mockPreferences[0], value: 'dark' }],
      ]);
      const remoteMap = new Map([
        ['theme', { ...mockPreferences[0], value: 'dark' }],
      ]);

      const conflicts = UserPreferenceSyncService.detectConflicts(localMap, remoteMap);
      expect(conflicts.length).toBe(0);
    });
  });

  describe('Conflict Resolution', () => {
    it('should resolve conflicts with lastWriteWins', () => {
      const conflicts = [
        {
          key: 'theme',
          localValue: 'dark',
          remoteValue: 'light',
          localTimestamp: 2000,
          remoteTimestamp: 1000,
          resolution: 'local' as const,
        },
      ];

      const resolved = UserPreferenceSyncService.resolveConflicts(conflicts, 'lastWriteWins');
      expect(resolved.get('theme')).toBe('dark');
    });

    it('should resolve conflicts with preferLocal', () => {
      const conflicts = [
        {
          key: 'setting',
          localValue: 'local_value',
          remoteValue: 'remote_value',
          localTimestamp: 1000,
          remoteTimestamp: 2000,
          resolution: 'local' as const,
        },
      ];

      const resolved = UserPreferenceSyncService.resolveConflicts(conflicts, 'preferLocal');
      expect(resolved.get('setting')).toBe('local_value');
    });

    it('should resolve conflicts with preferRemote', () => {
      const conflicts = [
        {
          key: 'setting',
          localValue: 'local_value',
          remoteValue: 'remote_value',
          localTimestamp: 1000,
          remoteTimestamp: 2000,
          resolution: 'remote' as const,
        },
      ];

      const resolved = UserPreferenceSyncService.resolveConflicts(conflicts, 'preferRemote');
      expect(resolved.get('setting')).toBe('remote_value');
    });
  });

  describe('Sync Delta Calculation', () => {
    it('should calculate sync delta correctly', () => {
      const lastSyncTime = 1000;
      const localPrefs = new Map([
        ['setting1', { ...mockPreferences[0], timestamp: 1500 }],
        ['setting2', { ...mockPreferences[0], timestamp: 500 }],
      ]);
      const remotePrefs = new Map([
        ['setting1', { ...mockPreferences[0], timestamp: 1200 }],
        ['setting3', { ...mockPreferences[0], timestamp: 1600 }],
      ]);

      const delta = UserPreferenceSyncService.calculateSyncDelta(
        localPrefs,
        remotePrefs,
        lastSyncTime
      );

      expect(delta.toUpload.length).toBeGreaterThan(0);
      expect(delta.toDownload.length).toBeGreaterThan(0);
    });
  });

  describe('Playback Position Tracking', () => {
    it('should track playback position', () => {
      const position = UserPreferenceSyncService.trackPlaybackPosition(
        'podcast123',
        1500,
        3600,
        'device1'
      );

      expect(position.contentId).toBe('podcast123');
      expect(position.position).toBe(1500);
      expect(position.duration).toBe(3600);
      expect(position.deviceId).toBe('device1');
      expect(position.timestamp).toBeGreaterThan(0);
    });

    it('should get optimal resume position', () => {
      const positions = [
        {
          contentId: 'podcast123',
          position: 100,
          duration: 3600,
          deviceId: 'device1',
          timestamp: 1000,
        },
        {
          contentId: 'podcast123',
          position: 2000,
          duration: 3600,
          deviceId: 'device2',
          timestamp: 2000,
        },
        {
          contentId: 'podcast123',
          position: 3500,
          duration: 3600,
          deviceId: 'device3',
          timestamp: 3000,
        },
      ];

      const optimal = UserPreferenceSyncService.getOptimalResumePosition(positions);
      expect(optimal).toBeTruthy();
      expect(optimal?.position).toBe(2000); // Not at end, most recent
    });

    it('should return most recent if all at end', () => {
      const positions = [
        {
          contentId: 'podcast123',
          position: 3500,
          duration: 3600,
          deviceId: 'device1',
          timestamp: 1000,
        },
        {
          contentId: 'podcast123',
          position: 3550,
          duration: 3600,
          deviceId: 'device2',
          timestamp: 2000,
        },
      ];

      const optimal = UserPreferenceSyncService.getOptimalResumePosition(positions);
      expect(optimal?.deviceId).toBe('device2'); // Most recent
    });
  });

  describe('Favorites Sync', () => {
    it('should sync favorites from multiple devices', () => {
      const localFavorites = [
        {
          contentId: 'podcast1',
          contentType: 'podcast' as const,
          deviceId: 'device1',
          timestamp: 1000,
        },
      ];

      const remoteFavorites = [
        {
          contentId: 'podcast2',
          contentType: 'podcast' as const,
          deviceId: 'device2',
          timestamp: 2000,
        },
      ];

      const synced = UserPreferenceSyncService.syncFavorites(localFavorites, remoteFavorites);
      expect(synced.length).toBe(2);
    });

    it('should keep most recent favorite', () => {
      const localFavorites = [
        {
          contentId: 'podcast1',
          contentType: 'podcast' as const,
          deviceId: 'device1',
          timestamp: 1000,
        },
      ];

      const remoteFavorites = [
        {
          contentId: 'podcast1',
          contentType: 'podcast' as const,
          deviceId: 'device2',
          timestamp: 2000,
        },
      ];

      const synced = UserPreferenceSyncService.syncFavorites(localFavorites, remoteFavorites);
      expect(synced.length).toBe(1);
      expect(synced[0].timestamp).toBe(2000);
    });
  });

  describe('Preference Validation', () => {
    it('should validate correct preference', () => {
      const valid = UserPreferenceSyncService.validatePreference(mockPreferences[0]);
      expect(valid).toBe(true);
    });

    it('should reject preference with missing userId', () => {
      const invalid = {
        ...mockPreferences[0],
        userId: '',
      };
      const valid = UserPreferenceSyncService.validatePreference(invalid);
      expect(valid).toBe(false);
    });

    it('should reject preference with invalid timestamp', () => {
      const invalid = {
        ...mockPreferences[0],
        timestamp: -1,
      };
      const valid = UserPreferenceSyncService.validatePreference(invalid);
      expect(valid).toBe(false);
    });
  });

  describe('Batch Sync', () => {
    it('should batch preferences correctly', () => {
      const preferences = Array.from({ length: 150 }, (_, i) => ({
        ...mockPreferences[0],
        key: `pref_${i}`,
      }));

      const batches = UserPreferenceSyncService.batchSync(preferences, 50);
      expect(batches.length).toBe(3);
      expect(batches[0].length).toBe(50);
      expect(batches[1].length).toBe(50);
      expect(batches[2].length).toBe(50);
    });
  });

  describe('Sync Metadata', () => {
    it('should generate sync metadata', () => {
      const metadata = UserPreferenceSyncService.generateSyncMetadata('device1');
      
      expect(metadata.deviceId).toBe('device1');
      expect(metadata.timestamp).toBeGreaterThan(0);
      expect(metadata.version).toBe('1.0');
      expect(metadata.platform).toBeTruthy();
    });
  });
});
