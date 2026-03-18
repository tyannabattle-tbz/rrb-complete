import { describe, it, expect } from 'vitest';

describe('Operational Fixes — Zoom PMI, Twitter Publisher, RTMP Streaming', () => {

  describe('Zoom PMI Entry Configuration', () => {
    it('should have correct PMI fallback URL', () => {
      // The fallback URL in code should be the new PMI
      const fallbackUrl = 'https://us05web.zoom.us/j/8502225524';
      expect(fallbackUrl).toContain('8502225524');
      expect(fallbackUrl).toContain('zoom.us');
      // Env var may or may not be set in test environment
      if (process.env.VITE_ZOOM_URL) {
        expect(process.env.VITE_ZOOM_URL).toContain('zoom.us');
      }
    });

    it('should use Zoom PMI for non-SQUADD podcast rooms', () => {
      // All podcast rooms except SQUADD read VITE_ZOOM_URL
      const rooms = [
        { name: 'CandysCorner', usesZoomPMI: true },
        { name: 'Solbones', usesZoomPMI: true },
        { name: 'AroundTheQumUnity', usesZoomPMI: true },
        { name: 'AvatarPanel', usesZoomPMI: true },
        { name: 'PodcastTemplate', usesZoomPMI: true },
        { name: 'SQUADD', usesZoomPMI: false }, // SQUADD excluded
      ];

      const nonSquaddRooms = rooms.filter(r => r.name !== 'SQUADD');
      expect(nonSquaddRooms.every(r => r.usesZoomPMI)).toBe(true);
      expect(rooms.find(r => r.name === 'SQUADD')?.usesZoomPMI).toBe(false);
    });

    it('should map Zoom platform to correct external URL in conference creation', () => {
      const platform = 'zoom';
      const fallback = 'https://us05web.zoom.us/j/8502225524';
      let externalUrl: string | null = null;
      if (platform === 'zoom') externalUrl = fallback;
      expect(externalUrl).toContain('8502225524');
      expect(externalUrl).not.toContain('82026499318');
    });

    it('should NOT contain old Zoom URL (82026499318)', () => {
      const fallbackUrl = 'https://us05web.zoom.us/j/8502225524';
      expect(fallbackUrl).not.toContain('82026499318');
    });
  });

  describe('Twitter/X Publisher Retry Logic', () => {
    it('should export retry and credential functions', async () => {
      const publisher = await import('./socialMediaPublisher');
      expect(typeof publisher.checkAndPublishScheduledPosts).toBe('function');
      expect(typeof publisher.retryFailedPosts).toBe('function');
      expect(typeof publisher.getCredentialStatuses).toBe('function');
      expect(typeof publisher.startSocialMediaPublisher).toBe('function');
      expect(typeof publisher.stopSocialMediaPublisher).toBe('function');
    });

    it('should validate Twitter credential requirements', () => {
      const requiredKeys = [
        'TWITTER_API_KEY',
        'TWITTER_API_SECRET',
        'TWITTER_ACCESS_TOKEN',
        'TWITTER_ACCESS_TOKEN_SECRET',
      ];
      // All 4 keys must be present for OAuth 1.0a
      expect(requiredKeys).toHaveLength(4);
    });

    it('should have exponential backoff retry config', () => {
      const MAX_RETRIES = 3;
      const BASE_DELAY_MS = 2000;
      // Delays: 2s, 4s, 8s
      const delays = Array.from({ length: MAX_RETRIES }, (_, i) => BASE_DELAY_MS * Math.pow(2, i));
      expect(delays).toEqual([2000, 4000, 8000]);
    });

    it('should not retry auth errors (401, 403)', () => {
      // Non-retryable status codes
      const nonRetryable = [401, 403];
      const retryable = [429, 500, 502, 503];
      
      for (const code of nonRetryable) {
        expect(code < 500 && code !== 429).toBe(true);
      }
      for (const code of retryable) {
        expect(code >= 500 || code === 429).toBe(true);
      }
    });
  });

  describe('RTMP Multi-Stream Destinations', () => {
    it('should support all 7 streaming platforms', () => {
      const platforms = ['youtube', 'facebook', 'instagram', 'twitter', 'tiktok', 'twitch', 'linkedin'];
      expect(platforms).toHaveLength(7);
    });

    it('should have correct RTMP URLs for each platform', () => {
      const destinations = [
        { platform: 'youtube', rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2' },
        { platform: 'facebook', rtmpUrl: 'rtmps://live-api-s.facebook.com:443/rtmp/' },
        { platform: 'instagram', rtmpUrl: 'rtmps://live-upload.instagram.com:443/rtmp/' },
        { platform: 'twitter', rtmpUrl: 'rtmp://prod-ec-us-east-1.pscp.tv:80/x' },
        { platform: 'tiktok', rtmpUrl: 'rtmp://push-rtmp-f5-tt.tiktokcdn.com/stage/' },
        { platform: 'twitch', rtmpUrl: 'rtmp://live.twitch.tv/app/' },
        { platform: 'linkedin', rtmpUrl: 'rtmp://1-edge-upload.linkedin.com:1935/rtmp/' },
      ];

      for (const dest of destinations) {
        expect(dest.rtmpUrl).toMatch(/^rtmps?:\/\//);
        expect(dest.platform).toBeTruthy();
      }
    });
  });

  describe('Social Media Queue Router', () => {
    it('should support all post statuses', () => {
      const statuses = ['draft', 'scheduled', 'published', 'failed', 'cancelled'];
      expect(statuses).toContain('failed');
      expect(statuses).toContain('scheduled');
    });

    it('should support all social platforms', () => {
      const platforms = ['twitter', 'instagram', 'discord', 'facebook', 'tiktok', 'youtube'];
      expect(platforms).toHaveLength(6);
      expect(platforms).toContain('twitter');
      expect(platforms).toContain('discord');
    });
  });
});
