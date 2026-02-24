/**
 * Tests for SEO Sitemap Generator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import SitemapGenerator, { SitemapEntry } from './sitemapGenerator';

describe('SitemapGenerator', () => {
  let generator: SitemapGenerator;

  beforeEach(() => {
    generator = new SitemapGenerator('https://www.rockinrockinboogie.com');
  });

  describe('initialization', () => {
    it('should initialize with default entries', () => {
      expect(generator.getEntryCount()).toBeGreaterThan(0);
    });

    it('should have home page in entries', () => {
      const entries = generator.getEntries();
      const homeEntry = entries.find(e => e.url === '/');
      expect(homeEntry).toBeDefined();
      expect(homeEntry?.priority).toBe(1.0);
    });

    it('should have Little Richard pages in entries', () => {
      const entries = generator.getEntries();
      const littleRichardPages = entries.filter(e => 
        e.url.includes('little-richard')
      );
      expect(littleRichardPages.length).toBeGreaterThan(0);
    });

    it('should have radio station page in entries', () => {
      const entries = generator.getEntries();
      const radioEntry = entries.find(e => e.url === '/rrb/radio-station');
      expect(radioEntry).toBeDefined();
      expect(radioEntry?.changefreq).toBe('daily');
    });
  });

  describe('addEntry', () => {
    it('should add a single entry', () => {
      const initialCount = generator.getEntryCount();
      generator.addEntry({
        url: '/test-page',
        priority: 0.7,
        changefreq: 'weekly'
      });
      expect(generator.getEntryCount()).toBe(initialCount + 1);
    });

    it('should add entry with breadcrumbs', () => {
      generator.addEntry({
        url: '/test-page',
        priority: 0.7,
        breadcrumbs: [
          { name: 'Home', url: '/' },
          { name: 'Test', url: '/test-page' }
        ]
      });
      const entries = generator.getEntries();
      const testEntry = entries.find(e => e.url === '/test-page');
      expect(testEntry?.breadcrumbs).toBeDefined();
      expect(testEntry?.breadcrumbs?.length).toBe(2);
    });
  });

  describe('addEntries', () => {
    it('should add multiple entries', () => {
      const initialCount = generator.getEntryCount();
      const newEntries: SitemapEntry[] = [
        { url: '/page1', priority: 0.5 },
        { url: '/page2', priority: 0.6 },
        { url: '/page3', priority: 0.7 }
      ];
      generator.addEntries(newEntries);
      expect(generator.getEntryCount()).toBe(initialCount + 3);
    });
  });

  describe('generateXML', () => {
    it('should generate valid XML', () => {
      const xml = generator.generateXML();
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<urlset');
      expect(xml).toContain('</urlset>');
    });

    it('should include all entries in XML', () => {
      const xml = generator.generateXML();
      const entries = generator.getEntries();
      entries.forEach(entry => {
        expect(xml).toContain(`<loc>https://www.rockinrockinboogie.com${entry.url}</loc>`);
      });
    });

    it('should include proper XML namespaces', () => {
      const xml = generator.generateXML();
      expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
      expect(xml).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
    });

    it('should escape special XML characters', () => {
      generator.addEntry({
        url: '/test&page',
        priority: 0.5
      });
      const xml = generator.generateXML();
      expect(xml).toContain('&amp;');
    });

    it('should include changefreq and priority', () => {
      const xml = generator.generateXML();
      expect(xml).toContain('<changefreq>');
      expect(xml).toContain('<priority>');
    });

    it('should include lastmod dates', () => {
      const xml = generator.generateXML();
      expect(xml).toContain('<lastmod>');
    });
  });

  describe('generateJSON', () => {
    it('should generate valid JSON structure', () => {
      const json = generator.generateJSON();
      expect(json['@context']).toBe('https://schema.org');
      expect(json['@type']).toBe('WebSite');
      expect(json.name).toBe('Rockin\' Rockin\' Boogie');
    });

    it('should include sitemap URL', () => {
      const json = generator.generateJSON();
      expect(json.siteMap).toBeDefined();
      expect(json.siteMap.url).toContain('sitemap.xml');
    });

    it('should include all entries', () => {
      const json = generator.generateJSON();
      const entries = generator.getEntries();
      expect(json.siteMap.entries.length).toBe(entries.length);
    });

    it('should include breadcrumbs in JSON', () => {
      generator.addEntry({
        url: '/test-page',
        breadcrumbs: [
          { name: 'Home', url: '/' },
          { name: 'Test', url: '/test-page' }
        ]
      });
      const json = generator.generateJSON();
      const testEntry = json.siteMap.entries.find((e: any) => e.url.includes('test-page'));
      expect(testEntry.breadcrumbs).toBeDefined();
    });
  });

  describe('Little Richard pages', () => {
    it('should have biography page with breadcrumbs', () => {
      const entries = generator.getEntries();
      const bioEntry = entries.find(e => e.url === '/rrb/little-richard-biography');
      expect(bioEntry).toBeDefined();
      expect(bioEntry?.breadcrumbs).toBeDefined();
      expect(bioEntry?.breadcrumbs?.length).toBeGreaterThan(0);
    });

    it('should have discography page with breadcrumbs', () => {
      const entries = generator.getEntries();
      const discoEntry = entries.find(e => e.url === '/rrb/little-richard-discography');
      expect(discoEntry).toBeDefined();
      expect(discoEntry?.breadcrumbs).toBeDefined();
    });

    it('should have FAQ page with breadcrumbs', () => {
      const entries = generator.getEntries();
      const faqEntry = entries.find(e => e.url === '/rrb/little-richard-faq');
      expect(faqEntry).toBeDefined();
      expect(faqEntry?.breadcrumbs).toBeDefined();
    });

    it('should have connection page with breadcrumbs', () => {
      const entries = generator.getEntries();
      const connEntry = entries.find(e => e.url === '/rrb/little-richard-connection');
      expect(connEntry).toBeDefined();
      expect(connEntry?.breadcrumbs).toBeDefined();
    });

    it('Little Richard pages should have high priority', () => {
      const entries = generator.getEntries();
      const littleRichardPages = entries.filter(e => 
        e.url.includes('little-richard')
      );
      littleRichardPages.forEach(page => {
        expect(page.priority).toBeGreaterThanOrEqual(0.85);
      });
    });
  });

  describe('priority levels', () => {
    it('home page should have highest priority', () => {
      const entries = generator.getEntries();
      const homeEntry = entries.find(e => e.url === '/');
      expect(homeEntry?.priority).toBe(1.0);
    });

    it('daily updated pages should have high priority', () => {
      const entries = generator.getEntries();
      const dailyPages = entries.filter(e => e.changefreq === 'daily');
      dailyPages.forEach(page => {
        expect(page.priority).toBeGreaterThanOrEqual(0.8);
      });
    });

    it('monthly updated pages should have moderate priority', () => {
      const entries = generator.getEntries();
      const monthlyPages = entries.filter(e => e.changefreq === 'monthly');
      monthlyPages.forEach(page => {
        expect(page.priority).toBeLessThanOrEqual(0.95);
      });
    });
  });

  describe('breadcrumb structure', () => {
    it('all breadcrumbs should start with Home', () => {
      const entries = generator.getEntries();
      const entriesWithBreadcrumbs = entries.filter(e => e.breadcrumbs);
      entriesWithBreadcrumbs.forEach(entry => {
        expect(entry.breadcrumbs?.[0].name).toBe('Home');
        expect(entry.breadcrumbs?.[0].url).toBe('/');
      });
    });

    it('breadcrumbs should be in correct order', () => {
      const entries = generator.getEntries();
      const bioEntry = entries.find(e => e.url === '/rrb/little-richard-biography');
      expect(bioEntry?.breadcrumbs?.[0].url).toBe('/');
      expect(bioEntry?.breadcrumbs?.[1].url).toContain('the-legacy');
      expect(bioEntry?.breadcrumbs?.[2].url).toContain('biography');
    });
  });

  describe('getEntryCount', () => {
    it('should return correct count', () => {
      const count = generator.getEntryCount();
      const entries = generator.getEntries();
      expect(count).toBe(entries.length);
    });
  });

  describe('getEntries', () => {
    it('should return array of entries', () => {
      const entries = generator.getEntries();
      expect(Array.isArray(entries)).toBe(true);
      expect(entries.length).toBeGreaterThan(0);
    });

    it('should return copy of entries', () => {
      const entries1 = generator.getEntries();
      const entries2 = generator.getEntries();
      expect(entries1).not.toBe(entries2);
      expect(entries1).toEqual(entries2);
    });
  });
});
