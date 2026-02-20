import { describe, it, expect } from 'vitest';
import { sitemapRouter } from './sitemapRouter';

describe('Sitemap Router', () => {
  describe('mainSitemap', () => {
    it('should return valid XML sitemap index', async () => {
      const caller = sitemapRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
        db: {} as any,
      });

      const result = await caller.mainSitemap();

      expect(result.xml).toContain('<?xml version="1.0"');
      expect(result.xml).toContain('<sitemapindex');
      expect(result.xml).toContain('sitemap-pages.xml');
      expect(result.xml).toContain('sitemap-broadcasts.xml');
      expect(result.xml).toContain('sitemap-channels.xml');
      expect(result.xml).toContain('sitemap-archives.xml');
      expect(result.contentType).toBe('application/xml');
    });

    it('should include all required sitemap references', async () => {
      const caller = sitemapRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
        db: {} as any,
      });

      const result = await caller.mainSitemap();

      expect(result.xml).toContain('<sitemap>');
      expect(result.xml).toContain('</sitemap>');
      expect(result.xml).toContain('<lastmod>');
    });
  });

  describe('pagesSitemap', () => {
    it('should return valid XML sitemap for pages', async () => {
      const caller = sitemapRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
        db: {} as any,
      });

      const result = await caller.pagesSitemap();

      expect(result.xml).toContain('<?xml version="1.0"');
      expect(result.xml).toContain('<urlset');
      expect(result.xml).toContain('rockinrockinboogie.com');
      expect(result.contentType).toBe('application/xml');
    });

    it('should include all main pages', async () => {
      const caller = sitemapRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
        db: {} as any,
      });

      const result = await caller.pagesSitemap();

      expect(result.xml).toContain('/rrb/radio-station');
      expect(result.xml).toContain('/rrb/poetry-station');
      expect(result.xml).toContain('/rrb/healing-frequencies');
      expect(result.xml).toContain('/rrb/archive');
      expect(result.xml).toContain('/rrb/proof-vault');
    });

    it('should include priority and changefreq for each URL', async () => {
      const caller = sitemapRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
        db: {} as any,
      });

      const result = await caller.pagesSitemap();

      expect(result.xml).toContain('<priority>');
      expect(result.xml).toContain('<changefreq>');
      expect(result.xml).toContain('hourly');
      expect(result.xml).toContain('daily');
      expect(result.xml).toContain('weekly');
      expect(result.xml).toContain('monthly');
    });
  });

  describe('broadcastsSitemap', () => {
    it('should return valid XML sitemap for broadcasts', async () => {
      const caller = sitemapRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
        db: {
          query: {
            broadcasts: {
              findMany: async () => [],
            },
          },
        } as any,
      });

      const result = await caller.broadcastsSitemap();

      expect(result.xml).toContain('<?xml version="1.0"');
      expect(result.xml).toContain('<urlset');
      expect(result.contentType).toBe('application/xml');
    });

    it('should handle empty broadcasts gracefully', async () => {
      const caller = sitemapRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
        db: {
          query: {
            broadcasts: {
              findMany: async () => [],
            },
          },
        } as any,
      });

      const result = await caller.broadcastsSitemap();

      expect(result.xml).toContain('</urlset>');
      expect(result.xml).not.toContain('/broadcast/');
    });
  });

  describe('channelsSitemap', () => {
    it('should return valid XML sitemap for channels', async () => {
      const caller = sitemapRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
        db: {
          query: {
            streamingChannels: {
              findMany: async () => [],
            },
          },
        } as any,
      });

      const result = await caller.channelsSitemap();

      expect(result.xml).toContain('<?xml version="1.0"');
      expect(result.xml).toContain('<urlset');
      expect(result.contentType).toBe('application/xml');
    });
  });

  describe('archivesSitemap', () => {
    it('should return valid XML sitemap for archives', async () => {
      const caller = sitemapRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
        db: {
          query: {
            broadcastArchives: {
              findMany: async () => [],
            },
          },
        } as any,
      });

      const result = await caller.archivesSitemap();

      expect(result.xml).toContain('<?xml version="1.0"');
      expect(result.xml).toContain('<urlset');
      expect(result.contentType).toBe('application/xml');
    });
  });
});
