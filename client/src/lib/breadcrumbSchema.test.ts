/**
 * Tests for breadcrumb schema utility
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateBreadcrumbSchema, breadcrumbPaths, BreadcrumbItem } from './breadcrumbSchema';

describe('Breadcrumb Schema Generator', () => {
  describe('generateBreadcrumbSchema', () => {
    it('should generate valid schema.org BreadcrumbList JSON', () => {
      const items: BreadcrumbItem[] = [
        { name: 'Home', url: '/' },
        { name: 'Music', url: '/music' }
      ];

      const schema = generateBreadcrumbSchema(items);
      const parsed = JSON.parse(schema);

      expect(parsed['@context']).toBe('https://schema.org');
      expect(parsed['@type']).toBe('BreadcrumbList');
      expect(Array.isArray(parsed.itemListElement)).toBe(true);
    });

    it('should assign correct positions to breadcrumb items', () => {
      const items: BreadcrumbItem[] = [
        { name: 'Home', url: '/' },
        { name: 'Music', url: '/music' },
        { name: 'Rock', url: '/music/rock' }
      ];

      const schema = generateBreadcrumbSchema(items);
      const parsed = JSON.parse(schema);

      expect(parsed.itemListElement[0].position).toBe(1);
      expect(parsed.itemListElement[1].position).toBe(2);
      expect(parsed.itemListElement[2].position).toBe(3);
    });

    it('should include correct names and URLs', () => {
      const items: BreadcrumbItem[] = [
        { name: 'Home', url: '/' },
        { name: 'Little Richard', url: '/little-richard' }
      ];

      const schema = generateBreadcrumbSchema(items);
      const parsed = JSON.parse(schema);

      expect(parsed.itemListElement[0].name).toBe('Home');
      expect(parsed.itemListElement[0].item).toContain('/');
      expect(parsed.itemListElement[1].name).toBe('Little Richard');
      expect(parsed.itemListElement[1].item).toContain('/little-richard');
    });

    it('should prepend domain to URLs', () => {
      const items: BreadcrumbItem[] = [
        { name: 'Home', url: '/' }
      ];

      const schema = generateBreadcrumbSchema(items);
      const parsed = JSON.parse(schema);

      expect(parsed.itemListElement[0].item).toContain('rockinrockinboogie.com');
    });

    it('should handle empty breadcrumb list', () => {
      const items: BreadcrumbItem[] = [];
      const schema = generateBreadcrumbSchema(items);
      const parsed = JSON.parse(schema);

      expect(parsed.itemListElement).toEqual([]);
    });

    it('should handle single breadcrumb item', () => {
      const items: BreadcrumbItem[] = [
        { name: 'Home', url: '/' }
      ];

      const schema = generateBreadcrumbSchema(items);
      const parsed = JSON.parse(schema);

      expect(parsed.itemListElement.length).toBe(1);
      expect(parsed.itemListElement[0].position).toBe(1);
    });
  });

  describe('breadcrumbPaths', () => {
    it('should have littleRichardBiography path', () => {
      expect(breadcrumbPaths.littleRichardBiography).toBeDefined();
      expect(Array.isArray(breadcrumbPaths.littleRichardBiography)).toBe(true);
      expect(breadcrumbPaths.littleRichardBiography.length).toBeGreaterThan(0);
    });

    it('should have littleRichardFAQ path', () => {
      expect(breadcrumbPaths.littleRichardFAQ).toBeDefined();
      expect(Array.isArray(breadcrumbPaths.littleRichardFAQ)).toBe(true);
    });

    it('should have littleRichardConnection path', () => {
      expect(breadcrumbPaths.littleRichardConnection).toBeDefined();
      expect(Array.isArray(breadcrumbPaths.littleRichardConnection)).toBe(true);
    });

    it('should have candyThroughTheYears path', () => {
      expect(breadcrumbPaths.candyThroughTheYears).toBeDefined();
      expect(Array.isArray(breadcrumbPaths.candyThroughTheYears)).toBe(true);
    });

    it('should have radioStation path', () => {
      expect(breadcrumbPaths.radioStation).toBeDefined();
      expect(Array.isArray(breadcrumbPaths.radioStation)).toBe(true);
    });

    it('should have theMusic path', () => {
      expect(breadcrumbPaths.theMusic).toBeDefined();
      expect(Array.isArray(breadcrumbPaths.theMusic)).toBe(true);
    });

    it('should have theMusic71to80 path', () => {
      expect(breadcrumbPaths.theMusic71to80).toBeDefined();
      expect(Array.isArray(breadcrumbPaths.theMusic71to80)).toBe(true);
    });

    it('littleRichardBiography should end with biography URL', () => {
      const path = breadcrumbPaths.littleRichardBiography;
      const lastItem = path[path.length - 1];
      expect(lastItem.url).toContain('biography');
    });

    it('littleRichardFAQ should end with FAQ URL', () => {
      const path = breadcrumbPaths.littleRichardFAQ;
      const lastItem = path[path.length - 1];
      expect(lastItem.url).toContain('faq');
    });

    it('all paths should start with Home', () => {
      Object.values(breadcrumbPaths).forEach(path => {
        expect(path[0].name).toBe('Home');
        expect(path[0].url).toBe('/');
      });
    });

    it('littleRichardBiography should include The Legacy', () => {
      const path = breadcrumbPaths.littleRichardBiography;
      const hasLegacy = path.some(item => item.url.includes('the-legacy'));
      expect(hasLegacy).toBe(true);
    });

    it('radioStation should include Music & Radio', () => {
      const path = breadcrumbPaths.radioStation;
      const hasMusic = path.some(item => item.name.includes('Music'));
      expect(hasMusic).toBe(true);
    });
  });
});
