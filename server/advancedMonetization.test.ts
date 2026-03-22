import { describe, it, expect, beforeEach, vi } from 'vitest';
import { listenerAnalyticsService } from './services/listenerAnalyticsService';
import { podcastMonetizationService } from './services/podcastMonetizationService';
import { socialMediaAutoPublishingService } from './services/socialMediaAutoPublishingService';

describe('Advanced Monetization Features', () => {
  describe('Listener Analytics Service', () => {
    it('should start a listener session', () => {
      const sessionId = listenerAnalyticsService.startSession(
        'listener-123',
        'channel-1',
        'RRB Main Radio',
        'web',
        'New York'
      );
      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
    });

    it('should end a listener session', () => {
      const sessionId = listenerAnalyticsService.startSession(
        'listener-123',
        'channel-1',
        'RRB Main Radio',
        'web'
      );
      const result = listenerAnalyticsService.endSession(sessionId);
      expect(result).toBe(true);
    });

    it('should update engagement level', () => {
      const sessionId = listenerAnalyticsService.startSession(
        'listener-123',
        'channel-1',
        'RRB Main Radio',
        'web'
      );
      listenerAnalyticsService.updateEngagement(sessionId, 'high');
      const metrics = listenerAnalyticsService.getChannelMetrics('channel-1');
      expect(metrics).toBeDefined();
    });

    it('should get channel metrics', () => {
      listenerAnalyticsService.startSession(
        'listener-123',
        'channel-1',
        'RRB Main Radio',
        'web'
      );
      const metrics = listenerAnalyticsService.getChannelMetrics('channel-1');
      expect(metrics.channelId).toBe('channel-1');
      expect(metrics.currentListeners).toBeGreaterThanOrEqual(0);
    });

    it('should get all channel metrics', () => {
      listenerAnalyticsService.startSession(
        'listener-123',
        'channel-1',
        'RRB Main Radio',
        'web'
      );
      listenerAnalyticsService.startSession(
        'listener-456',
        'channel-2',
        'Jazz Lounge',
        'mobile'
      );
      const allMetrics = listenerAnalyticsService.getAllChannelMetrics();
      expect(Array.isArray(allMetrics)).toBe(true);
      expect(allMetrics.length).toBeGreaterThan(0);
    });

    it('should record podcast play', () => {
      listenerAnalyticsService.recordPodcastPlay(
        'ep-001',
        'Rockin Rockin Boogie Episode 1',
        3600,
        true
      );
      const metrics = listenerAnalyticsService.getPodcastMetrics('ep-001');
      expect(metrics.episodeId).toBe('ep-001');
      expect(metrics.plays).toBeGreaterThan(0);
    });

    it('should get real-time dashboard data', () => {
      listenerAnalyticsService.startSession(
        'listener-123',
        'channel-1',
        'RRB Main Radio',
        'web'
      );
      const dashboard = listenerAnalyticsService.getRealTimeDashboard();
      expect(dashboard.activeListeners).toBeGreaterThanOrEqual(0);
      expect(dashboard.topChannels).toBeDefined();
      expect(dashboard.topPodcasts).toBeDefined();
    });
  });

  describe('Podcast Monetization Service', () => {
    it('should create a premium episode', async () => {
      const result = await podcastMonetizationService.createPremiumEpisode(
        'ep-001',
        'Premium Episode 1',
        9.99,
        'USD',
        'This is a premium episode',
        new Date(),
        'premium'
      );
      expect(result.episodeId).toBe('ep-001');
      expect(result.price).toBe(9.99);
    });

    it('should create a sponsorship', async () => {
      const result = await podcastMonetizationService.createSponsorship(
        'ep-001',
        'Sponsor Co',
        500,
        'USD',
        30,
        'Sponsorship for episode'
      );
      expect(result.sponsorName).toBe('Sponsor Co');
      expect(result.amount).toBe(500);
    });

    it('should record a donation', async () => {
      const result = await podcastMonetizationService.recordDonation(
        'listener-123',
        50,
        'USD',
        'Great content!'
      );
      expect(result.amount).toBe(50);
      expect(result.message).toBe('Great content!');
    });

    it('should get revenue report', async () => {
      await podcastMonetizationService.recordDonation(
        'listener-123',
        50,
        'USD'
      );
      const report = await podcastMonetizationService.getRevenueReport('monthly');
      expect(report.donationRevenue).toBeGreaterThanOrEqual(0);
      expect(report.totalRevenue).toBeGreaterThanOrEqual(0);
    });

    it('should get monetization dashboard', async () => {
      const dashboard = await podcastMonetizationService.getMonetizationDashboard();
      expect(dashboard.premiumEpisodes).toBeGreaterThanOrEqual(0);
      expect(dashboard.activeSponsors).toBeGreaterThanOrEqual(0);
      expect(dashboard.totalDonations).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Social Media Auto-Publishing Service', () => {
    it('should create a social media post', async () => {
      const result = await socialMediaAutoPublishingService.createPost(
        'ep-001',
        'twitter',
        'Check out our latest episode!',
        ['podcast', 'radio'],
        undefined,
        'New episode available'
      );
      expect(result.platform).toBe('twitter');
      expect(result.content).toBe('Check out our latest episode!');
    });

    it('should schedule a post', async () => {
      const post = await socialMediaAutoPublishingService.createPost(
        'ep-001',
        'twitter',
        'Check out our latest episode!',
        ['podcast']
      );
      const scheduledDate = new Date(Date.now() + 86400000); // Tomorrow
      const result = await socialMediaAutoPublishingService.schedulePost(
        post.postId,
        scheduledDate
      );
      expect(result.status).toBe('scheduled');
    });

    it('should publish a post', async () => {
      const post = await socialMediaAutoPublishingService.createPost(
        'ep-001',
        'twitter',
        'Check out our latest episode!',
        ['podcast']
      );
      const result = await socialMediaAutoPublishingService.publishPost(post.postId);
      expect(result.status).toBe('published');
    });

    it('should generate AI clip', async () => {
      const result = await socialMediaAutoPublishingService.generateAIClip(
        'ep-001',
        60,
        'short',
        ['tiktok', 'instagram'],
        'New episode highlights',
        ['podcast', 'radio']
      );
      expect(result.episodeId).toBe('ep-001');
      expect(result.duration).toBe(60);
      expect(result.format).toBe('short');
    });

    it('should auto-publish episode to all platforms', async () => {
      const result = await socialMediaAutoPublishingService.autoPublishEpisode(
        'ep-001',
        'Episode Title',
        'Episode description',
        ['twitter', 'instagram', 'tiktok'],
        true
      );
      expect(result.episodeId).toBe('ep-001');
      expect(result.platformsPublished).toContain('twitter');
      expect(result.platformsPublished).toContain('instagram');
    });

    it('should get episode posts', async () => {
      await socialMediaAutoPublishingService.createPost(
        'ep-001',
        'twitter',
        'Check out our latest episode!',
        ['podcast']
      );
      const posts = await socialMediaAutoPublishingService.getEpisodePosts('ep-001');
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBeGreaterThan(0);
    });

    it('should get social media dashboard', async () => {
      const dashboard = await socialMediaAutoPublishingService.getSocialMediaDashboard();
      expect(dashboard.totalPosts).toBeGreaterThanOrEqual(0);
      expect(dashboard.totalClips).toBeGreaterThanOrEqual(0);
      expect(dashboard.totalEngagement).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete monetization workflow', async () => {
      // 1. Start listener session
      const sessionId = listenerAnalyticsService.startSession(
        'listener-123',
        'channel-1',
        'RRB Main Radio',
        'web'
      );
      expect(sessionId).toBeDefined();

      // 2. Create premium episode
      const episode = await podcastMonetizationService.createPremiumEpisode(
        'ep-001',
        'Premium Episode',
        9.99,
        'USD',
        'Description',
        new Date(),
        'premium'
      );
      expect(episode.episodeId).toBe('ep-001');

      // 3. Auto-publish to social media
      const published = await socialMediaAutoPublishingService.autoPublishEpisode(
        'ep-001',
        'Premium Episode',
        'Description',
        ['twitter', 'instagram']
      );
      expect(published.platformsPublished.length).toBeGreaterThan(0);

      // 4. Record donation
      const donation = await podcastMonetizationService.recordDonation(
        'listener-123',
        50,
        'USD',
        'Love the content!'
      );
      expect(donation.amount).toBe(50);

      // 5. Get analytics
      const dashboard = listenerAnalyticsService.getRealTimeDashboard();
      expect(dashboard.activeListeners).toBeGreaterThanOrEqual(0);
    });

    it('should track listener engagement through monetization', async () => {
      // Start session
      const sessionId = listenerAnalyticsService.startSession(
        'listener-456',
        'channel-2',
        'Jazz Lounge',
        'mobile'
      );

      // Update engagement
      listenerAnalyticsService.updateEngagement(sessionId, 'high');

      // Record podcast play
      listenerAnalyticsService.recordPodcastPlay(
        'ep-002',
        'Jazz Episode',
        1800,
        true
      );

      // Get metrics
      const metrics = listenerAnalyticsService.getChannelMetrics('channel-2');
      expect(metrics.currentListeners).toBeGreaterThan(0);
      expect(metrics.engagementRate).toBeGreaterThan(0);
    });
  });
});
