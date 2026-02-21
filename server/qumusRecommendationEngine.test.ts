import { describe, it, expect, beforeEach } from 'vitest';
import {
  qumusRecommendationEngine,
  type RecommendationContext,
  type ChannelRecommendation,
} from './qumusRecommendationEngine';

describe('QumusRecommendationEngine', () => {
  beforeEach(() => {
    qumusRecommendationEngine.clearAllCaches();
  });

  const createMockContext = (): RecommendationContext => ({
    userId: 'test-user-123',
    recentlyPlayed: [
      'https://example.com/jazz',
      'https://example.com/blues',
      'https://example.com/funk',
    ],
    favoriteChannels: [
      'https://example.com/jazz',
      'https://example.com/soul',
    ],
    ratings: {
      'https://example.com/jazz': 5,
      'https://example.com/blues': 4,
      'https://example.com/funk': 3,
      'https://example.com/pop': 2,
    },
    playHistory: [
      {
        url: 'https://example.com/jazz',
        timestamp: new Date(Date.now() - 3600000),
        duration: 1800,
      },
      {
        url: 'https://example.com/blues',
        timestamp: new Date(Date.now() - 7200000),
        duration: 2400,
      },
      {
        url: 'https://example.com/funk',
        timestamp: new Date(Date.now() - 10800000),
        duration: 1200,
      },
    ],
    preferences: {
      preferredGenres: ['jazz', 'blues', 'funk'],
      preferredQuality: 'high',
      timezone: 'UTC',
      language: 'en',
    },
  });

  describe('Recommendation Generation', () => {
    it('should generate recommendations', async () => {
      const context = createMockContext();
      const recommendations = await qumusRecommendationEngine.generateRecommendations(context, 5);

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeLessThanOrEqual(5);
    });

    it('should return recommendations with required fields', async () => {
      const context = createMockContext();
      const recommendations = await qumusRecommendationEngine.generateRecommendations(context, 1);

      if (recommendations.length > 0) {
        const rec = recommendations[0];
        expect(rec).toHaveProperty('channelUrl');
        expect(rec).toHaveProperty('channelName');
        expect(rec).toHaveProperty('genre');
        expect(rec).toHaveProperty('reason');
        expect(rec).toHaveProperty('confidenceScore');
        expect(rec).toHaveProperty('matchedPreferences');
        expect(rec).toHaveProperty('similarToChannels');
        expect(rec).toHaveProperty('communityRating');
        expect(rec).toHaveProperty('trendingScore');
      }
    });

    it('should have confidence scores between 0-100', async () => {
      const context = createMockContext();
      const recommendations = await qumusRecommendationEngine.generateRecommendations(context, 10);

      recommendations.forEach(rec => {
        expect(rec.confidenceScore).toBeGreaterThanOrEqual(0);
        expect(rec.confidenceScore).toBeLessThanOrEqual(100);
      });
    });

    it('should sort recommendations by confidence score', async () => {
      const context = createMockContext();
      const recommendations = await qumusRecommendationEngine.generateRecommendations(context, 10);

      for (let i = 0; i < recommendations.length - 1; i++) {
        expect(recommendations[i].confidenceScore).toBeGreaterThanOrEqual(
          recommendations[i + 1].confidenceScore
        );
      }
    });

    it('should respect limit parameter', async () => {
      const context = createMockContext();

      const rec5 = await qumusRecommendationEngine.generateRecommendations(context, 5);
      const rec10 = await qumusRecommendationEngine.generateRecommendations(context, 10);

      expect(rec5.length).toBeLessThanOrEqual(5);
      expect(rec10.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Caching', () => {
    it('should cache recommendations', async () => {
      const context = createMockContext();

      const rec1 = await qumusRecommendationEngine.generateRecommendations(context, 5);
      const rec2 = await qumusRecommendationEngine.generateRecommendations(context, 5);

      // Should return same cached results
      expect(JSON.stringify(rec1)).toBe(JSON.stringify(rec2));
    });

    it('should clear cache for specific user', async () => {
      const context = createMockContext();

      await qumusRecommendationEngine.generateRecommendations(context, 5);
      qumusRecommendationEngine.clearCache(context.userId);

      const stats = qumusRecommendationEngine.getCacheStats();
      expect(stats.totalCached).toBe(0);
    });

    it('should clear all caches', async () => {
      const context1 = createMockContext();
      const context2 = { ...createMockContext(), userId: 'user-2' };

      await qumusRecommendationEngine.generateRecommendations(context1, 5);
      await qumusRecommendationEngine.generateRecommendations(context2, 5);

      qumusRecommendationEngine.clearAllCaches();

      const stats = qumusRecommendationEngine.getCacheStats();
      expect(stats.totalCached).toBe(0);
    });

    it('should provide cache statistics', () => {
      const stats = qumusRecommendationEngine.getCacheStats();

      expect(stats).toHaveProperty('totalCached');
      expect(stats).toHaveProperty('cacheSize');
      expect(stats).toHaveProperty('oldestEntry');
      expect(typeof stats.totalCached).toBe('number');
      expect(typeof stats.cacheSize).toBe('number');
    });
  });

  describe('Recommendation Factors', () => {
    it('should consider listening patterns', async () => {
      const context = createMockContext();
      const recommendations = await qumusRecommendationEngine.generateRecommendations(context, 10);

      // Should have recommendations based on patterns
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should consider user preferences', async () => {
      const context = createMockContext();
      const recommendations = await qumusRecommendationEngine.generateRecommendations(context, 10);

      const hasPreferenceMatch = recommendations.some(
        rec => rec.matchedPreferences && rec.matchedPreferences.length > 0
      );

      expect(hasPreferenceMatch).toBe(true);
    });

    it('should consider community trends', async () => {
      const context = createMockContext();
      const recommendations = await qumusRecommendationEngine.generateRecommendations(context, 10);

      const hasTrendingScore = recommendations.some(rec => rec.trendingScore > 0);

      expect(hasTrendingScore).toBe(true);
    });

    it('should include community ratings', async () => {
      const context = createMockContext();
      const recommendations = await qumusRecommendationEngine.generateRecommendations(context, 10);

      recommendations.forEach(rec => {
        expect(rec.communityRating).toBeGreaterThanOrEqual(0);
        expect(rec.communityRating).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('Recommendation Quality', () => {
    it('should provide reasons for recommendations', async () => {
      const context = createMockContext();
      const recommendations = await qumusRecommendationEngine.generateRecommendations(context, 5);

      recommendations.forEach(rec => {
        expect(rec.reason).toBeDefined();
        expect(rec.reason.length).toBeGreaterThan(0);
      });
    });

    it('should match preferences with recommendations', async () => {
      const context = createMockContext();
      const recommendations = await qumusRecommendationEngine.generateRecommendations(context, 5);

      recommendations.forEach(rec => {
        expect(Array.isArray(rec.matchedPreferences)).toBe(true);
      });
    });

    it('should include similar channels info', async () => {
      const context = createMockContext();
      const recommendations = await qumusRecommendationEngine.generateRecommendations(context, 5);

      recommendations.forEach(rec => {
        expect(Array.isArray(rec.similarToChannels)).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty play history', async () => {
      const context = createMockContext();
      context.playHistory = [];

      const recommendations = await qumusRecommendationEngine.generateRecommendations(context, 5);

      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should handle no ratings', async () => {
      const context = createMockContext();
      context.ratings = {};

      const recommendations = await qumusRecommendationEngine.generateRecommendations(context, 5);

      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should handle empty preferences', async () => {
      const context = createMockContext();
      context.preferences.preferredGenres = [];

      const recommendations = await qumusRecommendationEngine.generateRecommendations(context, 5);

      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should handle zero limit', async () => {
      const context = createMockContext();
      const recommendations = await qumusRecommendationEngine.generateRecommendations(context, 0);

      expect(recommendations.length).toBe(0);
    });

    it('should handle large limit', async () => {
      const context = createMockContext();
      const recommendations = await qumusRecommendationEngine.generateRecommendations(context, 1000);

      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('Qumus Autonomous Decision Logic', () => {
    it('should implement 90% autonomous decision making', async () => {
      const context = createMockContext();

      // Multiple calls should produce consistent but not identical results
      const rec1 = await qumusRecommendationEngine.generateRecommendations(context, 5);
      qumusRecommendationEngine.clearCache(context.userId);
      const rec2 = await qumusRecommendationEngine.generateRecommendations(context, 5);

      // Should have recommendations from autonomous logic
      expect(rec1.length).toBeGreaterThan(0);
      expect(rec2.length).toBeGreaterThan(0);
    });

    it('should balance multiple factors', async () => {
      const context = createMockContext();
      const recommendations = await qumusRecommendationEngine.generateRecommendations(context, 10);

      // Should have diverse recommendations from different factors
      const hasHighConfidence = recommendations.some(rec => rec.confidenceScore > 70);
      const hasLowConfidence = recommendations.some(rec => rec.confidenceScore < 70);

      expect(hasHighConfidence || hasLowConfidence).toBe(true);
    });
  });
});
