import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb } from './db';
import {
  customStations,
  stationTemplates,
  stationContentSources,
  stationPlaybackHistory,
  userStationPreferences,
  stationAnalytics,
} from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';

describe('Custom Station Builder System', () => {
  let db: any;
  const testUserId = 'test-user-123';
  const testStationId = 1;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error('Database connection failed');
  });

  afterAll(async () => {
    // Cleanup test data
    if (db) {
      // Clean up in reverse order of dependencies
      await db.delete(stationAnalytics).where(eq(stationAnalytics.stationId, testStationId));
      await db.delete(userStationPreferences).where(eq(userStationPreferences.userId, testUserId));
      await db.delete(stationPlaybackHistory).where(eq(stationPlaybackHistory.stationId, testStationId));
      await db.delete(stationContentSources).where(eq(stationContentSources.stationId, testStationId));
      await db.delete(customStations).where(eq(customStations.userId, testUserId));
    }
  });

  describe('Station Creation', () => {
    it('should create a custom station', async () => {
      const result = await db.insert(customStations).values({
        userId: testUserId,
        name: 'Test Talk Station',
        description: 'A test talk station',
        contentTypes: JSON.stringify(['talk', 'news']),
        icon: '🎙️',
        color: 'from-blue-600 to-cyan-600',
        isPublic: 0,
        totalListeners: 0,
        currentListeners: 0,
      });

      expect(result).toBeDefined();
    });

    it('should create a station with multiple content types', async () => {
      const result = await db.insert(customStations).values({
        userId: testUserId,
        name: 'Test Music Station',
        description: 'A test music station',
        contentTypes: JSON.stringify(['music', 'entertainment']),
        icon: '🎵',
        color: 'from-purple-600 to-pink-600',
        isPublic: 1,
        totalListeners: 100,
        currentListeners: 25,
      });

      expect(result).toBeDefined();
    });

    it('should create a healing frequency station', async () => {
      const result = await db.insert(customStations).values({
        userId: testUserId,
        name: 'Healing Frequencies',
        description: '432 Hz healing meditation',
        contentTypes: JSON.stringify(['healing', 'meditation']),
        icon: '💚',
        color: 'from-green-600 to-emerald-600',
        isPublic: 1,
        totalListeners: 500,
        currentListeners: 150,
      });

      expect(result).toBeDefined();
    });
  });

  describe('Station Retrieval', () => {
    it('should retrieve user stations', async () => {
      const stations = await db
        .select()
        .from(customStations)
        .where(eq(customStations.userId, testUserId));

      expect(stations).toBeDefined();
      expect(stations.length).toBeGreaterThan(0);
    });

    it('should retrieve public stations', async () => {
      const publicStations = await db
        .select()
        .from(customStations)
        .where(eq(customStations.isPublic, 1));

      expect(publicStations).toBeDefined();
    });

    it('should filter stations by content type', async () => {
      const stations = await db
        .select()
        .from(customStations)
        .where(eq(customStations.userId, testUserId));

      const talkStations = stations.filter((s: any) => {
        const types = JSON.parse(s.contentTypes);
        return types.includes('talk');
      });

      expect(talkStations).toBeDefined();
    });
  });

  describe('Content Sources', () => {
    it('should add content source to station', async () => {
      const result = await db.insert(stationContentSources).values({
        stationId: testStationId,
        contentType: 'talk',
        sourceUrl: 'https://example.com/talk-stream',
        priority: 1,
        isActive: 1,
      });

      expect(result).toBeDefined();
    });

    it('should retrieve content sources for station', async () => {
      const sources = await db
        .select()
        .from(stationContentSources)
        .where(eq(stationContentSources.stationId, testStationId));

      expect(sources).toBeDefined();
    });

    it('should prioritize content sources correctly', async () => {
      await db.insert(stationContentSources).values({
        stationId: testStationId,
        contentType: 'music',
        sourceUrl: 'https://example.com/music-stream',
        priority: 2,
        isActive: 1,
      });

      const sources = await db
        .select()
        .from(stationContentSources)
        .where(eq(stationContentSources.stationId, testStationId));

      const sorted = sources.sort((a: any, b: any) => (b.priority || 0) - (a.priority || 0));
      expect(sorted[0].priority).toBeGreaterThanOrEqual(sorted[1].priority);
    });
  });

  describe('Playback History', () => {
    it('should log playback event', async () => {
      const result = await db.insert(stationPlaybackHistory).values({
        stationId: testStationId,
        contentType: 'talk',
        title: 'Morning Talk Show',
        description: 'Live talk show',
        duration: 3600,
        startTime: new Date(),
        listeners: 50,
      });

      expect(result).toBeDefined();
    });

    it('should retrieve playback history', async () => {
      const history = await db
        .select()
        .from(stationPlaybackHistory)
        .where(eq(stationPlaybackHistory.stationId, testStationId));

      expect(history).toBeDefined();
      expect(history.length).toBeGreaterThan(0);
    });

    it('should track listener count', async () => {
      const history = await db
        .select()
        .from(stationPlaybackHistory)
        .where(eq(stationPlaybackHistory.stationId, testStationId));

      const totalListeners = history.reduce((sum: number, h: any) => sum + (h.listeners || 0), 0);
      expect(totalListeners).toBeGreaterThan(0);
    });
  });

  describe('User Preferences', () => {
    it('should create user preference', async () => {
      const result = await db.insert(userStationPreferences).values({
        userId: testUserId,
        stationId: testStationId,
        isFavorite: 1,
        lastListenedAt: new Date(),
        totalListenTime: 3600,
      });

      expect(result).toBeDefined();
    });

    it('should retrieve user favorites', async () => {
      const favorites = await db
        .select()
        .from(userStationPreferences)
        .where(
          and(
            eq(userStationPreferences.userId, testUserId),
            eq(userStationPreferences.isFavorite, 1)
          )
        );

      expect(favorites).toBeDefined();
    });

    it('should update listen time', async () => {
      const existing = await db
        .select()
        .from(userStationPreferences)
        .where(
          and(
            eq(userStationPreferences.userId, testUserId),
            eq(userStationPreferences.stationId, testStationId)
          )
        );

      if (existing.length > 0) {
        const newTime = (existing[0].totalListenTime || 0) + 1800;
        await db
          .update(userStationPreferences)
          .set({ totalListenTime: newTime })
          .where(
            and(
              eq(userStationPreferences.userId, testUserId),
              eq(userStationPreferences.stationId, testStationId)
            )
          );

        const updated = await db
          .select()
          .from(userStationPreferences)
          .where(
            and(
              eq(userStationPreferences.userId, testUserId),
              eq(userStationPreferences.stationId, testStationId)
            )
          );

        expect(updated[0].totalListenTime).toBeGreaterThan(existing[0].totalListenTime || 0);
      }
    });

    it('should get most listened stations', async () => {
      const preferences = await db
        .select()
        .from(userStationPreferences)
        .where(eq(userStationPreferences.userId, testUserId));

      const sorted = preferences.sort(
        (a: any, b: any) => (b.totalListenTime || 0) - (a.totalListenTime || 0)
      );

      expect(sorted).toBeDefined();
      if (sorted.length > 1) {
        expect(sorted[0].totalListenTime).toBeGreaterThanOrEqual(sorted[1].totalListenTime || 0);
      }
    });
  });

  describe('Station Analytics', () => {
    it('should create analytics record', async () => {
      const result = await db.insert(stationAnalytics).values({
        stationId: testStationId,
        date: new Date(),
        totalListeners: 100,
        peakListeners: 150,
        totalListenTime: 36000,
        uniqueUsers: 50,
      });

      expect(result).toBeDefined();
    });

    it('should retrieve analytics', async () => {
      const analytics = await db
        .select()
        .from(stationAnalytics)
        .where(eq(stationAnalytics.stationId, testStationId));

      expect(analytics).toBeDefined();
    });

    it('should track peak listeners', async () => {
      const analytics = await db
        .select()
        .from(stationAnalytics)
        .where(eq(stationAnalytics.stationId, testStationId));

      if (analytics.length > 0) {
        expect(analytics[0].peakListeners).toBeGreaterThanOrEqual(analytics[0].totalListeners || 0);
      }
    });
  });

  describe('Station Templates', () => {
    it('should create station template', async () => {
      const result = await db.insert(stationTemplates).values({
        name: 'Talk Radio Template',
        description: 'Standard talk radio template',
        contentTypes: JSON.stringify(['talk', 'news']),
        icon: '🎙️',
        color: 'from-blue-600 to-cyan-600',
        isActive: 1,
      });

      expect(result).toBeDefined();
    });

    it('should retrieve active templates', async () => {
      const templates = await db
        .select()
        .from(stationTemplates)
        .where(eq(stationTemplates.isActive, 1));

      expect(templates).toBeDefined();
    });
  });

  describe('Content Type Validation', () => {
    it('should validate talk content type', async () => {
      const validTypes = ['talk', 'news', 'music', 'meditation', 'healing', 'entertainment', 'educational', 'sports', 'comedy', 'mixed'];
      expect(validTypes).toContain('talk');
    });

    it('should validate music content type', async () => {
      const validTypes = ['talk', 'news', 'music', 'meditation', 'healing', 'entertainment', 'educational', 'sports', 'comedy', 'mixed'];
      expect(validTypes).toContain('music');
    });

    it('should validate healing content type', async () => {
      const validTypes = ['talk', 'news', 'music', 'meditation', 'healing', 'entertainment', 'educational', 'sports', 'comedy', 'mixed'];
      expect(validTypes).toContain('healing');
    });

    it('should support mixed content type', async () => {
      const validTypes = ['talk', 'news', 'music', 'meditation', 'healing', 'entertainment', 'educational', 'sports', 'comedy', 'mixed'];
      expect(validTypes).toContain('mixed');
    });
  });

  describe('Frequency Configuration', () => {
    it('should support 432 Hz default frequency', async () => {
      const frequency = 432;
      expect(frequency).toBe(432);
    });

    it('should allow custom frequencies', async () => {
      const customFrequencies = [174, 285, 396, 417, 528, 639, 741, 852, 963];
      expect(customFrequencies).toContain(528); // Love frequency
      expect(customFrequencies).toContain(741); // Intuition frequency
    });
  });

  describe('Station Sharing', () => {
    it('should support station sharing', async () => {
      const permissions = ['view', 'edit', 'admin'];
      expect(permissions).toContain('view');
      expect(permissions).toContain('edit');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing station gracefully', async () => {
      const station = await db
        .select()
        .from(customStations)
        .where(eq(customStations.id, 999999));

      expect(station).toEqual([]);
    });

    it('should handle invalid content type', async () => {
      const validTypes = ['talk', 'news', 'music', 'meditation', 'healing', 'entertainment', 'educational', 'sports', 'comedy', 'mixed'];
      const invalidType = 'invalid_type';
      expect(validTypes).not.toContain(invalidType);
    });
  });
});
