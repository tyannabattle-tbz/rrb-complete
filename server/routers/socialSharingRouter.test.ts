import { describe, it, expect, beforeEach } from 'vitest';
import { socialSharingRouter } from './socialSharingRouter';
import { SocialSharingService } from '../services/socialSharingService';

describe('Social Sharing Router', () => {
  const testContent = {
    title: 'Amazing Podcast Episode',
    description: 'Listen to this incredible episode about technology and innovation',
    url: 'https://rockinrockinboogie.com/podcast/episode-123',
    hashtags: ['podcast', 'tech', 'innovation'],
  };

  describe('generateShareUrls', () => {
    it('should generate all share URLs', () => {
      const urls = SocialSharingService.generateAllShareUrls(testContent);
      
      expect(urls).toHaveProperty('twitter');
      expect(urls).toHaveProperty('facebook');
      expect(urls).toHaveProperty('linkedin');
      expect(urls).toHaveProperty('whatsapp');
      expect(urls).toHaveProperty('telegram');
      expect(urls).toHaveProperty('email');
      
      // Verify URLs are valid
      for (const [platform, url] of Object.entries(urls)) {
        expect(typeof url).toBe('string');
        expect(url.length).toBeGreaterThan(0);
      }
    });

    it('should include content in Twitter URL', () => {
      const url = SocialSharingService.generateTwitterShareUrl(testContent);
      expect(url).toContain('Amazing');
      expect(url).toContain('Podcast');
    });

    it('should include content in Facebook URL', () => {
      const url = SocialSharingService.generateFacebookShareUrl(testContent);
      expect(url).toContain('Amazing');
    });

    it('should include content in LinkedIn URL', () => {
      const url = SocialSharingService.generateLinkedInShareUrl(testContent);
      expect(url).toContain('Amazing');
    });

    it('should include content in WhatsApp URL', () => {
      const url = SocialSharingService.generateWhatsAppShareUrl(testContent);
      expect(url).toContain('Amazing');
    });

    it('should include content in Telegram URL', () => {
      const url = SocialSharingService.generateTelegramShareUrl(testContent);
      expect(url).toContain('Amazing');
    });

    it('should include content in email URL', () => {
      const url = SocialSharingService.generateEmailShareUrl(testContent);
      expect(url).toContain('Amazing');
    });
  });

  describe('QR Code Generation', () => {
    it('should generate valid QR code URL', () => {
      const qrUrl = SocialSharingService.generateQRCodeUrl(testContent.url);
      expect(qrUrl).toContain('qrserver');
      expect(qrUrl).toContain(encodeURIComponent(testContent.url));
    });

    it('should handle special characters in URL', () => {
      const specialUrl = 'https://example.com/podcast?id=123&name=test episode';
      const qrUrl = SocialSharingService.generateQRCodeUrl(specialUrl);
      expect(qrUrl).toContain('qrserver');
    });
  });

  describe('Native Share Data', () => {
    it('should generate native share data', () => {
      const data = SocialSharingService.generateNativeShareData(testContent);
      
      expect(data).toHaveProperty('title');
      expect(data).toHaveProperty('text');
      expect(data).toHaveProperty('url');
      expect(data.title).toBe(testContent.title);
      expect(data.text).toBe(testContent.description);
      expect(data.url).toBe(testContent.url);
    });
  });

  describe('Clipboard Operations', () => {
    it('should handle clipboard copy', async () => {
      // Mock navigator.clipboard
      const originalClipboard = navigator.clipboard;
      let copiedText = '';
      
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: async (text: string) => {
            copiedText = text;
            return Promise.resolve();
          },
        },
        writable: true,
      });

      const url = 'https://example.com/share';
      const result = await SocialSharingService.copyToClipboard(url);
      
      expect(result).toBe(true);
      expect(copiedText).toBe(url);

      // Restore
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
      });
    });
  });

  describe('Share Content Validation', () => {
    it('should validate valid content', () => {
      const isValid = !!testContent.title && !!testContent.description && !!testContent.url;
      expect(isValid).toBe(true);
    });

    it('should handle missing optional fields', () => {
      const minimalContent = {
        title: 'Podcast',
        description: 'Great episode',
        url: 'https://example.com/podcast',
      };
      
      const urls = SocialSharingService.generateAllShareUrls(minimalContent);
      expect(Object.keys(urls).length).toBe(6);
    });

    it('should handle hashtags', () => {
      const contentWithHashtags = {
        ...testContent,
        hashtags: ['music', 'entertainment', 'streaming'],
      };
      
      const url = SocialSharingService.generateTwitterShareUrl(contentWithHashtags);
      expect(url).toContain('music');
      expect(url).toContain('entertainment');
    });
  });

  describe('URL Encoding', () => {
    it('should properly encode special characters', () => {
      const specialContent = {
        title: 'Episode: "The Future" & Beyond',
        description: 'Check this out! #podcast #tech',
        url: 'https://example.com/podcast?id=123&name=special',
      };
      
      const url = SocialSharingService.generateTwitterShareUrl(specialContent);
      expect(url).toBeTruthy();
      expect(url.length).toBeGreaterThan(0);
    });

    it('should handle URLs with query parameters', () => {
      const contentWithParams = {
        ...testContent,
        url: 'https://example.com/podcast?id=123&utm_source=share&utm_medium=social',
      };
      
      const urls = SocialSharingService.generateAllShareUrls(contentWithParams);
      for (const url of Object.values(urls)) {
        expect(url).toBeTruthy();
      }
    });
  });

  describe('Platform-specific Behavior', () => {
    it('Twitter URL should use intent/tweet endpoint', () => {
      const url = SocialSharingService.generateTwitterShareUrl(testContent);
      expect(url).toContain('twitter.com/intent/tweet');
    });

    it('Facebook URL should use sharer endpoint', () => {
      const url = SocialSharingService.generateFacebookShareUrl(testContent);
      expect(url).toContain('facebook.com/sharer');
    });

    it('LinkedIn URL should use sharing endpoint', () => {
      const url = SocialSharingService.generateLinkedInShareUrl(testContent);
      expect(url).toContain('linkedin.com/sharing');
    });

    it('WhatsApp URL should use wa.me', () => {
      const url = SocialSharingService.generateWhatsAppShareUrl(testContent);
      expect(url).toContain('wa.me');
    });

    it('Telegram URL should use t.me', () => {
      const url = SocialSharingService.generateTelegramShareUrl(testContent);
      expect(url).toContain('t.me');
    });

    it('Email URL should use mailto', () => {
      const url = SocialSharingService.generateEmailShareUrl(testContent);
      expect(url).toContain('mailto:');
    });
  });
});
