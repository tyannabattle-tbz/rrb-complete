import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import {
  UserPreferenceSyncService,
  UserPreferenceSchema,
  PlaybackPositionSchema,
  UserFavoriteSchema,
} from '../services/userPreferenceSyncService';

export const userPreferenceSyncRouter = router({
  /**
   * Sync preferences across devices
   */
  syncPreferences: protectedProcedure
    .input(z.object({
      deviceId: z.string(),
      preferences: z.array(UserPreferenceSchema),
      lastSyncTime: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Validate all preferences
      const validPrefs = input.preferences.filter(p => 
        UserPreferenceSyncService.validatePreference(p)
      );

      // In production, this would sync with database
      return {
        success: true,
        synced: validPrefs.length,
        timestamp: Date.now(),
        deviceId: input.deviceId,
      };
    }),

  /**
   * Get preferences for device
   */
  getPreferences: protectedProcedure
    .input(z.object({
      deviceId: z.string(),
      keys: z.array(z.string()).optional(),
    }))
    .query(async ({ input, ctx }) => {
      // In production, fetch from database
      return {
        deviceId: input.deviceId,
        preferences: [],
        timestamp: Date.now(),
      };
    }),

  /**
   * Update preference
   */
  updatePreference: protectedProcedure
    .input(z.object({
      deviceId: z.string(),
      key: z.string(),
      value: z.any(),
    }))
    .mutation(async ({ input, ctx }) => {
      const preference = {
        userId: ctx.user.id,
        key: input.key,
        value: input.value,
        deviceId: input.deviceId,
        timestamp: Date.now(),
      };

      if (!UserPreferenceSyncService.validatePreference(preference)) {
        throw new Error('Invalid preference');
      }

      // Save to database
      return {
        success: true,
        preference,
      };
    }),

  /**
   * Track playback position
   */
  trackPlaybackPosition: protectedProcedure
    .input(z.object({
      contentId: z.string(),
      position: z.number(),
      duration: z.number(),
      deviceId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const position = UserPreferenceSyncService.trackPlaybackPosition(
        input.contentId,
        input.position,
        input.duration,
        input.deviceId
      );

      // Save to database
      return {
        success: true,
        position,
      };
    }),

  /**
   * Get playback positions for content
   */
  getPlaybackPositions: protectedProcedure
    .input(z.object({
      contentId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      // In production, fetch from database
      return {
        contentId: input.contentId,
        positions: [],
        optimalPosition: null,
      };
    }),

  /**
   * Get optimal resume position
   */
  getOptimalResumePosition: protectedProcedure
    .input(z.object({
      contentId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      // In production, fetch from database and calculate
      return {
        contentId: input.contentId,
        position: null,
        duration: 0,
        deviceId: null,
      };
    }),

  /**
   * Add favorite
   */
  addFavorite: protectedProcedure
    .input(z.object({
      contentId: z.string(),
      contentType: z.enum(['podcast', 'song', 'station', 'playlist']),
      deviceId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const favorite = {
        contentId: input.contentId,
        contentType: input.contentType,
        deviceId: input.deviceId,
        timestamp: Date.now(),
      };

      // Save to database
      return {
        success: true,
        favorite,
      };
    }),

  /**
   * Remove favorite
   */
  removeFavorite: protectedProcedure
    .input(z.object({
      contentId: z.string(),
      contentType: z.enum(['podcast', 'song', 'station', 'playlist']),
    }))
    .mutation(async ({ input, ctx }) => {
      // Remove from database
      return {
        success: true,
        removed: true,
      };
    }),

  /**
   * Get all favorites
   */
  getFavorites: protectedProcedure
    .input(z.object({
      contentType: z.enum(['podcast', 'song', 'station', 'playlist']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      // In production, fetch from database
      return {
        favorites: [],
        total: 0,
      };
    }),

  /**
   * Sync favorites across devices
   */
  syncFavorites: protectedProcedure
    .input(z.object({
      deviceId: z.string(),
      favorites: z.array(UserFavoriteSchema),
    }))
    .mutation(async ({ input, ctx }) => {
      // Merge and sync favorites
      const synced = UserPreferenceSyncService.syncFavorites(input.favorites, []);

      return {
        success: true,
        synced: synced.length,
        timestamp: Date.now(),
      };
    }),

  /**
   * Get sync status
   */
  getSyncStatus: protectedProcedure
    .input(z.object({
      deviceId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      // In production, fetch from database
      return {
        deviceId: input.deviceId,
        lastSyncTime: null,
        pendingChanges: 0,
        status: 'synced',
      };
    }),

  /**
   * Get storage usage
   */
  getStorageUsage: protectedProcedure
    .query(async ({ ctx }) => {
      // In production, calculate from database
      return {
        usage: 0,
        quota: 0,
        percentage: 0,
      };
    }),

  /**
   * Merge preferences from multiple sources
   */
  mergePreferences: protectedProcedure
    .input(z.object({
      preferences: z.array(UserPreferenceSchema),
      strategy: z.enum(['lastWriteWins', 'playbackPosition', 'mergeFavorites']).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const merged = UserPreferenceSyncService.mergePreferences(
        input.preferences,
        input.strategy as any
      );

      return {
        success: true,
        merged: Array.from(merged.values()),
        count: merged.size,
      };
    }),

  /**
   * Detect conflicts
   */
  detectConflicts: protectedProcedure
    .input(z.object({
      localPreferences: z.array(UserPreferenceSchema),
      remotePreferences: z.array(UserPreferenceSchema),
    }))
    .query(async ({ input, ctx }) => {
      const localMap = new Map(input.localPreferences.map(p => [p.key, p]));
      const remoteMap = new Map(input.remotePreferences.map(p => [p.key, p]));

      const conflicts = UserPreferenceSyncService.detectConflicts(localMap, remoteMap);

      return {
        conflicts,
        count: conflicts.length,
      };
    }),

  /**
   * Resolve conflicts
   */
  resolveConflicts: protectedProcedure
    .input(z.object({
      conflicts: z.array(z.object({
        key: z.string(),
        localValue: z.any(),
        remoteValue: z.any(),
        localTimestamp: z.number(),
        remoteTimestamp: z.number(),
        resolution: z.enum(['local', 'remote', 'merge']),
      })),
      strategy: z.enum(['lastWriteWins', 'playbackPosition', 'mergeFavorites']).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const resolved = UserPreferenceSyncService.resolveConflicts(
        input.conflicts as any,
        input.strategy as any
      );

      return {
        success: true,
        resolved: Object.fromEntries(resolved),
        count: resolved.size,
      };
    }),
});
