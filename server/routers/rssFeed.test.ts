import { describe, it, expect } from 'vitest';
import { rssFeedRouter } from './rssFeedRouter';

describe('RSS Feed Router', () => {
  describe('generateMainFeed', () => {
    it('should generate valid RSS feed with required elements', async () => {
      const caller = rssFeedRouter.createCaller({} as any);
      const result = await caller.generateMainFeed();

      expect(result.success).toBe(true);
      expect(result.contentType).toBe('application/rss+xml');
      expect(result.content).toContain('<?xml version="1.0"');
      expect(result.content).toContain('<rss version="2.0"');
      expect(result.content).toContain('<channel>');
      expect(result.content).toContain('<title>Rockin Rockin Boogie');
      expect(result.content).toContain('<description>');
      expect(result.content).toContain('<link>');
      expect(result.content).toContain('<language>en-us</language>');
      expect(result.content).toContain('<copyright>');
      expect(result.content).toContain('<lastBuildDate>');
      expect(result.content).toContain('<ttl>60</ttl>');
    });

    it('should include iTunes podcast tags', async () => {
      const caller = rssFeedRouter.createCaller({} as any);
      const result = await caller.generateMainFeed();

      expect(result.content).toContain('xmlns:itunes=');
      expect(result.content).toContain('<itunes:author>');
      expect(result.content).toContain('<itunes:owner>');
      expect(result.content).toContain('<itunes:explicit>');
      expect(result.content).toContain('<itunes:category');
      expect(result.content).toContain('<itunes:image');
    });

    it('should include Google Play Podcasts tags', async () => {
      const caller = rssFeedRouter.createCaller({} as any);
      const result = await caller.generateMainFeed();

      expect(result.content).toContain('xmlns:googleplay=');
      expect(result.content).toContain('<googleplay:author>');
      expect(result.content).toContain('<googleplay:category');
      expect(result.content).toContain('<googleplay:explicit>');
      expect(result.content).toContain('<googleplay:image');
    });

    it('should include sample episodes with proper structure', async () => {
      const caller = rssFeedRouter.createCaller({} as any);
      const result = await caller.generateMainFeed();

      expect(result.content).toContain('<item>');
      expect(result.content).toContain('<title>Morning Glory Gospel');
      expect(result.content).toContain('<guid isPermaLink="false">');
      expect(result.content).toContain('<pubDate>');
      expect(result.content).toContain('<itunes:duration>');
      expect(result.content).toContain('<enclosure');
      expect(result.content).toContain('type="audio/mpeg"');
    });

    it('should return correct URL structure', async () => {
      const caller = rssFeedRouter.createCaller({} as any);
      const result = await caller.generateMainFeed();

      expect(result.url).toContain('/api/rss/broadcasts');
    });
  });

  describe('generateSpotifyFeed', () => {
    it('should generate Spotify-compatible RSS feed', async () => {
      const caller = rssFeedRouter.createCaller({} as any);
      const result = await caller.generateSpotifyFeed();

      expect(result.success).toBe(true);
      expect(result.platform).toBe('Spotify');
      expect(result.content).toContain('xmlns:spotify=');
      expect(result.content).toContain('<spotify:countryOfOrigin>US</spotify:countryOfOrigin>');
      expect(result.url).toContain('/api/rss/spotify');
    });
  });

  describe('generateGoogleFeed', () => {
    it('should generate Google Podcasts-compatible RSS feed', async () => {
      const caller = rssFeedRouter.createCaller({} as any);
      const result = await caller.generateGoogleFeed();

      expect(result.success).toBe(true);
      expect(result.platform).toBe('Google Podcasts');
      expect(result.content).toContain('xmlns:googleplay=');
      expect(result.url).toContain('/api/rss/google');
    });
  });

  describe('generateAmazonFeed', () => {
    it('should generate Amazon Music-compatible RSS feed', async () => {
      const caller = rssFeedRouter.createCaller({} as any);
      const result = await caller.generateAmazonFeed();

      expect(result.success).toBe(true);
      expect(result.platform).toBe('Amazon Music');
      expect(result.url).toContain('/api/rss/amazon');
    });
  });

  describe('getSubmissionUrls', () => {
    it('should return submission URLs for all platforms', async () => {
      const caller = rssFeedRouter.createCaller({} as any);
      const result = await caller.getSubmissionUrls();

      expect(result.success).toBe(true);
      expect(result.feeds).toHaveProperty('main');
      expect(result.feeds).toHaveProperty('spotify');
      expect(result.feeds).toHaveProperty('googlePodcasts');
      expect(result.feeds).toHaveProperty('applePodcasts');
      expect(result.feeds).toHaveProperty('amazonMusic');
      expect(result.feeds).toHaveProperty('tuneIn');
    });

    it('should include submission guide for all platforms', async () => {
      const caller = rssFeedRouter.createCaller({} as any);
      const result = await caller.getSubmissionUrls();

      expect(result.submissionGuide).toHaveProperty('applePodcasts');
      expect(result.submissionGuide).toHaveProperty('spotify');
      expect(result.submissionGuide).toHaveProperty('googlePodcasts');
      expect(result.submissionGuide).toHaveProperty('amazonMusic');
      expect(result.submissionGuide).toHaveProperty('tuneIn');
    });

    it('should include step-by-step submission instructions', async () => {
      const caller = rssFeedRouter.createCaller({} as any);
      const result = await caller.getSubmissionUrls();

      expect(result.submissionGuide.applePodcasts.steps).toBeInstanceOf(Array);
      expect(result.submissionGuide.applePodcasts.steps.length).toBeGreaterThan(0);
      expect(result.submissionGuide.spotify.url).toBe('https://podcasters.spotify.com');
    });
  });
});
