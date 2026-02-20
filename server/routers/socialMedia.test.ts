import { describe, it, expect, beforeEach } from 'vitest';
import { socialMediaRouter } from './socialMediaRouter';

// Mock context
const mockAdminContext = {
  user: { id: 1, role: 'admin' },
} as any;

const mockUserContext = {
  user: { id: 2, role: 'user' },
} as any;

describe('Social Media Router', () => {
  describe('postToYouTube', () => {
    it('should prepare YouTube post with valid input', async () => {
      const caller = socialMediaRouter.createCaller(mockAdminContext);
      const result = await caller.postToYouTube({
        title: 'Test Broadcast',
        description: 'Test Description',
        videoUrl: 'https://example.com/video.mp4',
        tags: ['music', 'broadcast'],
        visibility: 'public',
      });

      expect(result.success).toBe(true);
      expect(result.platform).toBe('YouTube');
      expect(result.status).toBe('ready_for_submission');
      expect(result.postData.title).toBe('Test Broadcast');
      expect(result.setupInstructions).toBeDefined();
    });

    it('should include YouTube setup instructions', async () => {
      const caller = socialMediaRouter.createCaller(mockAdminContext);
      const result = await caller.postToYouTube({
        title: 'Test',
        description: 'Test',
        videoUrl: 'https://example.com/video.mp4',
      });

      expect(result.setupInstructions.step1).toContain('YouTube Data API');
      expect(result.setupInstructions.step2).toContain('OAuth');
    });
  });

  describe('postToInstagram', () => {
    it('should prepare Instagram post with valid input', async () => {
      const caller = socialMediaRouter.createCaller(mockAdminContext);
      const result = await caller.postToInstagram({
        caption: 'Check out our latest broadcast!',
        imageUrl: 'https://example.com/image.jpg',
        hashtags: ['music', 'broadcast'],
      });

      expect(result.success).toBe(true);
      expect(result.platform).toBe('Instagram');
      expect(result.postData.caption).toBe('Check out our latest broadcast!');
    });

    it('should require Meta Business Account', async () => {
      const caller = socialMediaRouter.createCaller(mockAdminContext);
      const result = await caller.postToInstagram({
        caption: 'Test',
        imageUrl: 'https://example.com/image.jpg',
      });

      expect(result.setupInstructions.step1).toContain('Meta Business Account');
    });
  });

  describe('postToTikTok', () => {
    it('should prepare TikTok post with valid input', async () => {
      const caller = socialMediaRouter.createCaller(mockAdminContext);
      const result = await caller.postToTikTok({
        caption: 'New broadcast coming soon!',
        videoUrl: 'https://example.com/tiktok.mp4',
        hashtags: ['music', 'live'],
      });

      expect(result.success).toBe(true);
      expect(result.platform).toBe('TikTok');
      expect(result.postData.caption).toBe('New broadcast coming soon!');
    });

    it('should require TikTok Creator Account', async () => {
      const caller = socialMediaRouter.createCaller(mockAdminContext);
      const result = await caller.postToTikTok({
        caption: 'Test',
        videoUrl: 'https://example.com/video.mp4',
      });

      expect(result.setupInstructions.step1).toContain('TikTok Creator Account');
    });
  });

  describe('postToTwitter', () => {
    it('should prepare Twitter post with valid input', async () => {
      const caller = socialMediaRouter.createCaller(mockAdminContext);
      const result = await caller.postToTwitter({
        text: 'Tune in now for live broadcast!',
        mediaUrl: 'https://example.com/image.jpg',
      });

      expect(result.success).toBe(true);
      expect(result.platform).toBe('Twitter/X');
      expect(result.postData.text).toBe('Tune in now for live broadcast!');
    });

    it('should enforce 280 character limit', async () => {
      const caller = socialMediaRouter.createCaller(mockAdminContext);
      const longText = 'a'.repeat(281);

      expect(async () => {
        await caller.postToTwitter({
          text: longText,
        });
      }).rejects.toThrow();
    });

    it('should require Twitter API v2 access', async () => {
      const caller = socialMediaRouter.createCaller(mockAdminContext);
      const result = await caller.postToTwitter({
        text: 'Test tweet',
      });

      expect(result.setupInstructions.step2).toContain('API v2');
    });
  });

  describe('postToLinkedIn', () => {
    it('should prepare LinkedIn post with valid input', async () => {
      const caller = socialMediaRouter.createCaller(mockAdminContext);
      const result = await caller.postToLinkedIn({
        content: 'Exciting news about our broadcast platform!',
        hashtags: ['broadcasting', 'music'],
      });

      expect(result.success).toBe(true);
      expect(result.platform).toBe('LinkedIn');
      expect(result.postData.content).toBe('Exciting news about our broadcast platform!');
    });

    it('should require LinkedIn Business Account', async () => {
      const caller = socialMediaRouter.createCaller(mockAdminContext);
      const result = await caller.postToLinkedIn({
        content: 'Test',
      });

      expect(result.setupInstructions.step1).toContain('LinkedIn Company Page');
    });
  });

  describe('getPlatformSetupGuide', () => {
    it('should return setup guide for all platforms', async () => {
      const caller = socialMediaRouter.createCaller({} as any);
      const result = await caller.getPlatformSetupGuide();

      expect(result.success).toBe(true);
      expect(result.platforms).toHaveProperty('youtube');
      expect(result.platforms).toHaveProperty('instagram');
      expect(result.platforms).toHaveProperty('tiktok');
      expect(result.platforms).toHaveProperty('twitter');
      expect(result.platforms).toHaveProperty('linkedin');
    });

    it('should include detailed setup information for each platform', async () => {
      const caller = socialMediaRouter.createCaller({} as any);
      const result = await caller.getPlatformSetupGuide();

      const youtube = result.platforms.youtube;
      expect(youtube.name).toBe('YouTube');
      expect(youtube.type).toBe('Video Streaming');
      expect(youtube.setupTime).toBeDefined();
      expect(youtube.requirements).toBeInstanceOf(Array);
      expect(youtube.credentials).toBeInstanceOf(Array);
      expect(youtube.automationSupport).toBe(true);
      expect(youtube.renewalFrequency).toBeDefined();
      expect(youtube.supportUrl).toBeDefined();
    });

    it('should include automation benefits', async () => {
      const caller = socialMediaRouter.createCaller({} as any);
      const result = await caller.getPlatformSetupGuide();

      expect(result.automationBenefits).toBeInstanceOf(Array);
      expect(result.automationBenefits.length).toBeGreaterThan(0);
      expect(result.automationBenefits[0]).toContain('posting');
    });
  });

  describe('getCredentialsStatus', () => {
    it('should return credentials status for admin users', async () => {
      const caller = socialMediaRouter.createCaller(mockAdminContext);
      const result = await caller.getCredentialsStatus();

      expect(result.success).toBe(true);
      expect(result.platforms).toHaveProperty('youtube');
      expect(result.platforms).toHaveProperty('instagram');
      expect(result.platforms.youtube.status).toBe('not_configured');
    });

    it('should deny access to non-admin users', async () => {
      const caller = socialMediaRouter.createCaller(mockUserContext);

      expect(async () => {
        await caller.getCredentialsStatus();
      }).rejects.toThrow('Only admins');
    });

    it('should provide next steps for configuration', async () => {
      const caller = socialMediaRouter.createCaller(mockAdminContext);
      const result = await caller.getCredentialsStatus();

      expect(result.nextSteps).toContain('Settings');
      expect(result.nextSteps).toContain('Social Media');
    });
  });
});
