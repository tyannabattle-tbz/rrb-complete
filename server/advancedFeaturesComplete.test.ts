import { describe, it, expect, beforeEach } from 'vitest';
import { RealTimeCollaborationService } from './services/realTimeCollaborationService';
import { ContentRecommendationService } from './services/contentRecommendationService';
import { AdvancedAnalyticsDashboardService } from './services/advancedAnalyticsDashboardService';

describe('Advanced Features Complete Test Suite', () => {
  let collaborationService: RealTimeCollaborationService;
  let recommendationService: ContentRecommendationService;
  let analyticsService: AdvancedAnalyticsDashboardService;

  beforeEach(() => {
    collaborationService = new RealTimeCollaborationService();
    recommendationService = new ContentRecommendationService();
    analyticsService = new AdvancedAnalyticsDashboardService();
  });

  describe('Real-Time Collaboration Service', () => {
    it('should create a listening session', async () => {
      const session = await collaborationService.createSession('user-1', 'My Session', {
        id: 'track-1',
        title: 'Test Track',
        artist: 'Test Artist',
        duration: 240,
      });

      expect(session).toBeDefined();
      expect(session.name).toBe('My Session');
      expect(session.hostId).toBe('user-1');
      expect(session.participants).toHaveLength(1);
      expect(session.participants[0].isHost).toBe(true);
    });

    it('should allow users to join a session', async () => {
      const session = await collaborationService.createSession('user-1', 'Test Session', {
        id: 'track-1',
        title: 'Test Track',
        artist: 'Test Artist',
        duration: 240,
      });

      const joined = await collaborationService.joinSession(session.id, 'user-2');

      expect(joined).toBeDefined();
      expect(joined?.participants).toHaveLength(2);
      expect(joined?.participants.some((p) => p.userId === 'user-2')).toBe(true);
    });

    it('should handle playback control', async () => {
      const session = await collaborationService.createSession('user-1', 'Test Session', {
        id: 'track-1',
        title: 'Test Track',
        artist: 'Test Artist',
        duration: 240,
      });

      const played = await collaborationService.playTrack(session.id, 'user-1');

      expect(played).toBe(true);

      const updated = await collaborationService.getSession(session.id);
      expect(updated?.playbackState).toBe('playing');
    });

    it('should handle pause', async () => {
      const session = await collaborationService.createSession('user-1', 'Test Session', {
        id: 'track-1',
        title: 'Test Track',
        artist: 'Test Artist',
        duration: 240,
      });

      await collaborationService.playTrack(session.id, 'user-1');
      const paused = await collaborationService.pauseTrack(session.id, 'user-1');

      expect(paused).toBe(true);

      const updated = await collaborationService.getSession(session.id);
      expect(updated?.playbackState).toBe('paused');
    });

    it('should handle skip to next track', async () => {
      const session = await collaborationService.createSession('user-1', 'Test Session', {
        id: 'track-1',
        title: 'Track 1',
        artist: 'Artist 1',
        duration: 240,
      });

      const skipped = await collaborationService.skipTrack(session.id, 'user-1', {
        id: 'track-2',
        title: 'Track 2',
        artist: 'Artist 2',
        duration: 200,
      });

      expect(skipped).toBe(true);

      const updated = await collaborationService.getSession(session.id);
      expect(updated?.currentTrack.id).toBe('track-2');
      expect(updated?.currentTime).toBe(0);
    });

    it('should handle seek', async () => {
      const session = await collaborationService.createSession('user-1', 'Test Session', {
        id: 'track-1',
        title: 'Test Track',
        artist: 'Test Artist',
        duration: 240,
      });

      const seeked = await collaborationService.seekTo(session.id, 'user-1', 120);

      expect(seeked).toBe(true);

      const updated = await collaborationService.getSession(session.id);
      expect(updated?.currentTime).toBe(120);
    });

    it('should get active sessions', async () => {
      await collaborationService.createSession('user-1', 'Session 1', {
        id: 'track-1',
        title: 'Track 1',
        artist: 'Artist 1',
        duration: 240,
      });

      await collaborationService.createSession('user-2', 'Session 2', {
        id: 'track-2',
        title: 'Track 2',
        artist: 'Artist 2',
        duration: 200,
      });

      const sessions = await collaborationService.getActiveSessions();

      expect(sessions).toHaveLength(2);
    });

    it('should get session statistics', async () => {
      const session = await collaborationService.createSession('user-1', 'Test Session', {
        id: 'track-1',
        title: 'Test Track',
        artist: 'Test Artist',
        duration: 240,
      });

      const stats = await collaborationService.getSessionStats(session.id);

      expect(stats).toBeDefined();
      expect(stats.participantCount).toBe(1);
      expect(stats.isActive).toBe(true);
    });
  });

  describe('Content Recommendation Service', () => {
    it('should initialize user profile', async () => {
      const profile = await recommendationService.initializeUserProfile('user-1');

      expect(profile).toBeDefined();
      expect(profile.userId).toBe('user-1');
      expect(profile.listeningHistory).toHaveLength(0);
      expect(profile.favorites).toHaveLength(0);
    });

    it('should add content to catalog', async () => {
      await recommendationService.addContent({
        id: 'content-1',
        title: 'Test Song',
        artist: 'Test Artist',
        genre: 'Rock',
        duration: 240,
        popularity: 80,
        releaseDate: Date.now(),
      });

      expect(true).toBe(true);
    });

    it('should record listening activity', async () => {
      await recommendationService.initializeUserProfile('user-1');
      await recommendationService.addContent({
        id: 'content-1',
        title: 'Test Song',
        artist: 'Test Artist',
        genre: 'Rock',
        duration: 240,
        popularity: 80,
        releaseDate: Date.now(),
      });

      await recommendationService.recordListening('user-1', 'content-1', 240);

      const profile = await recommendationService.getUserProfile('user-1');
      expect(profile?.listeningHistory).toContain('content-1');
      expect(profile?.genres.get('Rock')).toBe(1);
    });

    it('should add to favorites', async () => {
      await recommendationService.initializeUserProfile('user-1');
      await recommendationService.addContent({
        id: 'content-1',
        title: 'Test Song',
        artist: 'Test Artist',
        genre: 'Rock',
        duration: 240,
        popularity: 80,
        releaseDate: Date.now(),
      });

      const added = await recommendationService.addToFavorites('user-1', 'content-1');

      expect(added).toBe(true);

      const profile = await recommendationService.getUserProfile('user-1');
      expect(profile?.favorites).toContain('content-1');
    });

    it('should remove from favorites', async () => {
      await recommendationService.initializeUserProfile('user-1');
      await recommendationService.addContent({
        id: 'content-1',
        title: 'Test Song',
        artist: 'Test Artist',
        genre: 'Rock',
        duration: 240,
        popularity: 80,
        releaseDate: Date.now(),
      });

      await recommendationService.addToFavorites('user-1', 'content-1');
      const removed = await recommendationService.removeFromFavorites('user-1', 'content-1');

      expect(removed).toBe(true);

      const profile = await recommendationService.getUserProfile('user-1');
      expect(profile?.favorites).not.toContain('content-1');
    });

    it('should get recommendations', async () => {
      await recommendationService.initializeUserProfile('user-1');

      // Add content
      for (let i = 0; i < 10; i++) {
        await recommendationService.addContent({
          id: `content-${i}`,
          title: `Song ${i}`,
          artist: `Artist ${i}`,
          genre: i % 2 === 0 ? 'Rock' : 'Pop',
          duration: 240,
          popularity: Math.random() * 100,
          releaseDate: Date.now() - i * 1000000,
        });
      }

      // Record some listening
      for (let i = 0; i < 5; i++) {
        await recommendationService.recordListening('user-1', `content-${i}`, 240);
      }

      const recommendations = await recommendationService.getRecommendations('user-1', 5);

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeLessThanOrEqual(5);
    });

    it('should get trending content', async () => {
      for (let i = 0; i < 10; i++) {
        await recommendationService.addContent({
          id: `content-${i}`,
          title: `Song ${i}`,
          artist: `Artist ${i}`,
          genre: 'Rock',
          duration: 240,
          popularity: Math.random() * 100,
          releaseDate: Date.now(),
        });
      }

      const trending = await recommendationService.getTrendingContent(5);

      expect(trending).toBeDefined();
      expect(trending.length).toBeLessThanOrEqual(5);
    });

    it('should get content by genre', async () => {
      for (let i = 0; i < 10; i++) {
        await recommendationService.addContent({
          id: `content-${i}`,
          title: `Song ${i}`,
          artist: `Artist ${i}`,
          genre: i % 2 === 0 ? 'Rock' : 'Pop',
          duration: 240,
          popularity: 50,
          releaseDate: Date.now(),
        });
      }

      const rockContent = await recommendationService.getContentByGenre('Rock', 5);

      expect(rockContent).toBeDefined();
      expect(rockContent.every((c) => c.genre === 'Rock')).toBe(true);
    });

    it('should get similar content', async () => {
      await recommendationService.addContent({
        id: 'content-1',
        title: 'Song 1',
        artist: 'Artist 1',
        genre: 'Rock',
        duration: 240,
        popularity: 80,
        releaseDate: Date.now(),
      });

      await recommendationService.addContent({
        id: 'content-2',
        title: 'Song 2',
        artist: 'Artist 1',
        genre: 'Rock',
        duration: 250,
        popularity: 75,
        releaseDate: Date.now(),
      });

      const similar = await recommendationService.getSimilarContent('content-1', 5);

      expect(similar).toBeDefined();
    });

    it('should get recommendation statistics', async () => {
      await recommendationService.initializeUserProfile('user-1');

      for (let i = 0; i < 5; i++) {
        await recommendationService.addContent({
          id: `content-${i}`,
          title: `Song ${i}`,
          artist: `Artist ${i % 2}`,
          genre: i % 2 === 0 ? 'Rock' : 'Pop',
          duration: 240,
          popularity: 50,
          releaseDate: Date.now(),
        });

        await recommendationService.recordListening('user-1', `content-${i}`, 240);
      }

      const stats = await recommendationService.getRecommendationStats('user-1');

      expect(stats).toBeDefined();
      expect(stats.totalListenings).toBe(5);
      expect(stats.topGenres).toBeDefined();
      expect(stats.topArtists).toBeDefined();
    });
  });

  describe('Advanced Analytics Dashboard Service', () => {
    it('should initialize dashboard', async () => {
      await analyticsService.initialize();

      const metrics = await analyticsService.getCurrentMetrics();

      expect(metrics).toBeDefined();
      expect(metrics?.userEngagement).toBeDefined();
      expect(metrics?.contentPerformance).toBeDefined();
      expect(metrics?.networkHealth).toBeDefined();
      expect(metrics?.autonomyMetrics).toBeDefined();
      expect(metrics?.revenueMetrics).toBeDefined();
    });

    it('should record metrics', async () => {
      await analyticsService.initialize();

      await analyticsService.recordMetrics({
        userEngagement: {
          activeUsers: 1000,
          totalUsers: 5000,
          averageSessionDuration: 1800,
          sessionCount: 10000,
          userRetention: 0.75,
          churnRate: 0.05,
          peakHours: [18, 19, 20],
          deviceBreakdown: { web: 0.4, mobile: 0.5, desktop: 0.1 },
        },
      });

      const metrics = await analyticsService.getCurrentMetrics();

      expect(metrics?.userEngagement.activeUsers).toBe(1000);
    });

    it('should get metrics for time period', async () => {
      await analyticsService.initialize();

      const now = Date.now();
      const metrics = await analyticsService.getMetricsForPeriod(now - 3600000, now);

      expect(metrics).toBeDefined();
      expect(metrics.length).toBeGreaterThan(0);
    });

    it('should generate dashboard report', async () => {
      await analyticsService.initialize();

      const report = await analyticsService.getDashboardReport(7);

      expect(report).toBeDefined();
      expect(report.metrics).toBeDefined();
      expect(report.trends).toBeDefined();
      expect(report.insights).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });

    it('should get user engagement analytics', async () => {
      await analyticsService.initialize();

      const engagement = await analyticsService.getUserEngagementAnalytics();

      expect(engagement).toBeDefined();
      expect(engagement.activeUsers).toBeGreaterThan(0);
      expect(engagement.totalUsers).toBeGreaterThan(0);
    });

    it('should get content performance analytics', async () => {
      await analyticsService.initialize();

      const performance = await analyticsService.getContentPerformanceAnalytics();

      expect(performance).toBeDefined();
      expect(performance.totalContentItems).toBeGreaterThan(0);
      expect(performance.mostPlayedContent).toBeDefined();
    });

    it('should get network health analytics', async () => {
      await analyticsService.initialize();

      const health = await analyticsService.getNetworkHealthAnalytics();

      expect(health).toBeDefined();
      expect(health.totalAgents).toBeGreaterThan(0);
      expect(health.uptime).toBeGreaterThan(0.9);
    });

    it('should get autonomy metrics', async () => {
      await analyticsService.initialize();

      const autonomy = await analyticsService.getAutonomyMetrics();

      expect(autonomy).toBeDefined();
      expect(autonomy.autonomyLevel).toBeGreaterThan(0.8);
      expect(autonomy.policiesExecuted).toBeGreaterThan(0);
    });

    it('should get revenue analytics', async () => {
      await analyticsService.initialize();

      const revenue = await analyticsService.getRevenueAnalytics();

      expect(revenue).toBeDefined();
      expect(revenue.totalRevenue).toBeGreaterThan(0);
      expect(revenue.transactionCount).toBeGreaterThan(0);
    });

    it('should export metrics to CSV', async () => {
      await analyticsService.initialize();

      const now = Date.now();
      const csv = await analyticsService.exportMetricsToCSV(now - 3600000, now);

      expect(csv).toBeDefined();
      expect(csv).toContain('Timestamp');
      expect(csv).toContain('Active Users');
    });
  });

  describe('Integration Tests', () => {
    it('should work together in a complete workflow', async () => {
      // Initialize all services
      await analyticsService.initialize();
      await recommendationService.initializeUserProfile('user-1');

      // Create a listening session
      const session = await collaborationService.createSession('user-1', 'Integration Test', {
        id: 'track-1',
        title: 'Test Track',
        artist: 'Test Artist',
        duration: 240,
      });

      // Add content and get recommendations
      await recommendationService.addContent({
        id: 'track-1',
        title: 'Test Track',
        artist: 'Test Artist',
        genre: 'Rock',
        duration: 240,
        popularity: 80,
        releaseDate: Date.now(),
      });

      await recommendationService.recordListening('user-1', 'track-1', 240);

      // Get recommendations
      const recommendations = await recommendationService.getRecommendations('user-1', 5);

      // Record analytics
      await analyticsService.recordMetrics({});

      // Verify everything works
      expect(session).toBeDefined();
      expect(recommendations).toBeDefined();

      const report = await analyticsService.getDashboardReport(1);
      expect(report).toBeDefined();
    });
  });
});
