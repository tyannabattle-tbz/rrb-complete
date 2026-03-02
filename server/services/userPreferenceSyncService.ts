import { z } from 'zod';

export interface UserPreference {
  userId: string;
  key: string;
  value: any;
  deviceId: string;
  timestamp: number;
  syncedAt?: number;
}

export interface PlaybackPosition {
  contentId: string;
  position: number;
  duration: number;
  deviceId: string;
  timestamp: number;
}

export interface UserFavorite {
  contentId: string;
  contentType: 'podcast' | 'song' | 'station' | 'playlist';
  deviceId: string;
  timestamp: number;
}

export interface SyncConflict {
  key: string;
  localValue: any;
  remoteValue: any;
  localTimestamp: number;
  remoteTimestamp: number;
  resolution: 'local' | 'remote' | 'merge';
}

export class UserPreferenceSyncService {
  private static conflictResolutionStrategies = {
    // Latest write wins
    lastWriteWins: (conflict: SyncConflict) => {
      return conflict.localTimestamp > conflict.remoteTimestamp
        ? conflict.localValue
        : conflict.remoteValue;
    },

    // For playback positions, use the furthest progress
    playbackPosition: (conflict: SyncConflict) => {
      if (typeof conflict.localValue === 'number' && typeof conflict.remoteValue === 'number') {
        return Math.max(conflict.localValue, conflict.remoteValue);
      }
      return conflict.localValue;
    },

    // For favorites, merge arrays
    mergeFavorites: (conflict: SyncConflict) => {
      if (Array.isArray(conflict.localValue) && Array.isArray(conflict.remoteValue)) {
        return [...new Set([...conflict.localValue, ...conflict.remoteValue])];
      }
      return conflict.localValue;
    },

    // For settings, prefer local
    preferLocal: (conflict: SyncConflict) => {
      return conflict.localValue;
    },

    // For settings, prefer remote
    preferRemote: (conflict: SyncConflict) => {
      return conflict.remoteValue;
    },
  };

  /**
   * Detect conflicts between local and remote preferences
   */
  static detectConflicts(
    localPrefs: Map<string, UserPreference>,
    remotePrefs: Map<string, UserPreference>
  ): SyncConflict[] {
    const conflicts: SyncConflict[] = [];

    for (const [key, localPref] of localPrefs.entries()) {
      const remotePref = remotePrefs.get(key);
      if (remotePref && localPref.value !== remotePref.value) {
        conflicts.push({
          key,
          localValue: localPref.value,
          remoteValue: remotePref.value,
          localTimestamp: localPref.timestamp,
          remoteTimestamp: remotePref.timestamp,
          resolution: 'local',
        });
      }
    }

    return conflicts;
  }

  /**
   * Resolve conflicts using specified strategy
   */
  static resolveConflicts(
    conflicts: SyncConflict[],
    strategy: 'lastWriteWins' | 'playbackPosition' | 'mergeFavorites' | 'preferLocal' | 'preferRemote' = 'lastWriteWins'
  ): Map<string, any> {
    const resolved = new Map<string, any>();

    for (const conflict of conflicts) {
      const resolver = this.conflictResolutionStrategies[strategy];
      if (resolver) {
        resolved.set(conflict.key, resolver(conflict));
      }
    }

    return resolved;
  }

  /**
   * Merge preferences from multiple devices
   */
  static mergePreferences(
    preferences: UserPreference[],
    strategy: 'lastWriteWins' | 'playbackPosition' | 'mergeFavorites' = 'lastWriteWins'
  ): Map<string, UserPreference> {
    const merged = new Map<string, UserPreference>();

    // Group by key
    const grouped = new Map<string, UserPreference[]>();
    for (const pref of preferences) {
      if (!grouped.has(pref.key)) {
        grouped.set(pref.key, []);
      }
      grouped.get(pref.key)!.push(pref);
    }

    // Merge each group
    for (const [key, prefs] of grouped.entries()) {
      if (prefs.length === 1) {
        merged.set(key, prefs[0]);
      } else {
        // Sort by timestamp
        prefs.sort((a, b) => b.timestamp - a.timestamp);

        if (strategy === 'lastWriteWins') {
          merged.set(key, prefs[0]);
        } else if (strategy === 'playbackPosition') {
          // Use the maximum position
          const maxPref = prefs.reduce((max, pref) => {
            if (typeof pref.value === 'number' && typeof max.value === 'number') {
              return pref.value > max.value ? pref : max;
            }
            return max;
          });
          merged.set(key, maxPref);
        } else if (strategy === 'mergeFavorites') {
          // Merge arrays
          const mergedValue = prefs.reduce((acc, pref) => {
            if (Array.isArray(pref.value)) {
              return [...new Set([...acc, ...pref.value])];
            }
            return acc;
          }, [] as any[]);
          merged.set(key, {
            ...prefs[0],
            value: mergedValue,
            timestamp: Math.max(...prefs.map(p => p.timestamp)),
          });
        }
      }
    }

    return merged;
  }

  /**
   * Calculate sync delta - what needs to be synced
   */
  static calculateSyncDelta(
    localPrefs: Map<string, UserPreference>,
    remotePrefs: Map<string, UserPreference>,
    lastSyncTime: number
  ): {
    toUpload: UserPreference[];
    toDownload: UserPreference[];
  } {
    const toUpload: UserPreference[] = [];
    const toDownload: UserPreference[] = [];

    // Check local preferences that need uploading
    for (const [key, localPref] of localPrefs.entries()) {
      if (localPref.timestamp > lastSyncTime) {
        const remotePref = remotePrefs.get(key);
        if (!remotePref || localPref.timestamp > remotePref.timestamp) {
          toUpload.push(localPref);
        }
      }
    }

    // Check remote preferences that need downloading
    for (const [key, remotePref] of remotePrefs.entries()) {
      if (remotePref.timestamp > lastSyncTime) {
        const localPref = localPrefs.get(key);
        if (!localPref || remotePref.timestamp > localPref.timestamp) {
          toDownload.push(remotePref);
        }
      }
    }

    return { toUpload, toDownload };
  }

  /**
   * Generate sync metadata
   */
  static generateSyncMetadata(deviceId: string) {
    return {
      deviceId,
      timestamp: Date.now(),
      version: '1.0',
      platform: typeof window !== 'undefined' ? 'web' : 'server',
    };
  }

  /**
   * Validate preference before sync
   */
  static validatePreference(pref: UserPreference): boolean {
    return (
      !!pref.userId &&
      !!pref.key &&
      pref.value !== undefined &&
      !!pref.deviceId &&
      pref.timestamp > 0
    );
  }

  /**
   * Batch sync preferences
   */
  static batchSync(
    preferences: UserPreference[],
    batchSize: number = 50
  ): UserPreference[][] {
    const batches: UserPreference[][] = [];
    for (let i = 0; i < preferences.length; i += batchSize) {
      batches.push(preferences.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Track playback position across devices
   */
  static trackPlaybackPosition(
    contentId: string,
    position: number,
    duration: number,
    deviceId: string
  ): PlaybackPosition {
    return {
      contentId,
      position,
      duration,
      deviceId,
      timestamp: Date.now(),
    };
  }

  /**
   * Get optimal resume position from multiple devices
   */
  static getOptimalResumePosition(positions: PlaybackPosition[]): PlaybackPosition | null {
    if (positions.length === 0) return null;

    // Sort by timestamp (most recent first)
    const sorted = [...positions].sort((a, b) => b.timestamp - a.timestamp);

    // Return the most recent position that's not at the end
    for (const pos of sorted) {
      if (pos.position < pos.duration * 0.95) {
        return pos;
      }
    }

    // If all are at the end, return the most recent
    return sorted[0];
  }

  /**
   * Sync favorites across devices
   */
  static syncFavorites(
    localFavorites: UserFavorite[],
    remoteFavorites: UserFavorite[]
  ): UserFavorite[] {
    const favoriteMap = new Map<string, UserFavorite>();

    // Add all favorites
    for (const fav of [...localFavorites, ...remoteFavorites]) {
      const key = `${fav.contentId}-${fav.contentType}`;
      const existing = favoriteMap.get(key);

      // Keep the most recent
      if (!existing || fav.timestamp > existing.timestamp) {
        favoriteMap.set(key, fav);
      }
    }

    return Array.from(favoriteMap.values());
  }
}

export const UserPreferenceSchema = z.object({
  userId: z.string(),
  key: z.string(),
  value: z.any(),
  deviceId: z.string(),
  timestamp: z.number(),
  syncedAt: z.number().optional(),
});

export const PlaybackPositionSchema = z.object({
  contentId: z.string(),
  position: z.number(),
  duration: z.number(),
  deviceId: z.string(),
  timestamp: z.number(),
});

export const UserFavoriteSchema = z.object({
  contentId: z.string(),
  contentType: z.enum(['podcast', 'song', 'station', 'playlist']),
  deviceId: z.string(),
  timestamp: z.number(),
});
