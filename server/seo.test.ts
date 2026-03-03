import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('SEO Meta Tags', () => {
  const html = readFileSync(resolve(__dirname, '../client/index.html'), 'utf-8');

  it('should have a title between 30 and 65 characters', () => {
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    expect(titleMatch).not.toBeNull();
    const title = titleMatch![1];
    expect(title.length).toBeGreaterThanOrEqual(30);
    expect(title.length).toBeLessThanOrEqual(65);
    expect(title).toContain('QUMUS');
  });

  it('should have a meta description under 160 characters', () => {
    const descMatch = html.match(/name="description"\s+content="([^"]*)"/);
    expect(descMatch).not.toBeNull();
    const desc = descMatch![1];
    expect(desc.length).toBeLessThanOrEqual(160);
    expect(desc).toContain('QUMUS');
  });

  it('should have keywords meta tag', () => {
    const keywordsMatch = html.match(/name="keywords"\s+content="([^"]*)"/);
    expect(keywordsMatch).not.toBeNull();
    expect(keywordsMatch![1]).toContain('QUMUS');
  });

  it('should have QUMUS blue theme-color', () => {
    expect(html).toContain('#3B82F6');
  });

  it('should have QUMUS icons not RRB logos', () => {
    expect(html).toContain('qumus-icon');
    expect(html).not.toContain('rrb-logo-192');
    expect(html).not.toContain('rrb-logo-512');
  });
});

describe('Open Graph Meta Tags', () => {
  const html = readFileSync(resolve(__dirname, '../client/index.html'), 'utf-8');

  it('should have og:type website', () => {
    expect(html).toContain('property="og:type"');
  });

  it('should have og:title with QUMUS', () => {
    const match = html.match(/property="og:title"\s+content="([^"]*)"/);
    expect(match).not.toBeNull();
    expect(match![1]).toContain('QUMUS');
  });

  it('should have og:description', () => {
    expect(html).toContain('property="og:description"');
  });

  it('should have og:image', () => {
    expect(html).toContain('property="og:image"');
  });

  it('should have og:url for qumus.manus.space', () => {
    const match = html.match(/property="og:url"\s+content="([^"]*)"/);
    expect(match).not.toBeNull();
    expect(match![1]).toContain('qumus.manus.space');
  });
});

describe('Twitter Card Meta Tags', () => {
  const html = readFileSync(resolve(__dirname, '../client/index.html'), 'utf-8');

  it('should have twitter:card', () => {
    expect(html).toContain('name="twitter:card"');
  });

  it('should have twitter:title with QUMUS', () => {
    const match = html.match(/name="twitter:title"\s+content="([^"]*)"/);
    expect(match).not.toBeNull();
    expect(match![1]).toContain('QUMUS');
  });

  it('should have twitter:image', () => {
    expect(html).toContain('name="twitter:image"');
  });
});

describe('QUMUS Branding Verification', () => {
  it('manifest.json should use QUMUS branding', () => {
    const manifest = JSON.parse(readFileSync(resolve(__dirname, '../client/public/manifest.json'), 'utf-8'));
    expect(manifest.name).toContain('QUMUS');
    expect(manifest.short_name).toBe('QUMUS');
    expect(manifest.theme_color).toBe('#3B82F6');
    expect(manifest.name).not.toContain('Rockin');
  });

  it('manifest icons should reference QUMUS not RRB', () => {
    const manifest = JSON.parse(readFileSync(resolve(__dirname, '../client/public/manifest.json'), 'utf-8'));
    for (const icon of manifest.icons) {
      expect(icon.src).toContain('qumus-icon');
    }
  });

  it('translator should use QUMUS as app title', () => {
    const translator = readFileSync(resolve(__dirname, '../client/src/lib/translator.ts'), 'utf-8');
    const titleMatches = translator.match(/'app\.title': '([^']*)'/g);
    expect(titleMatches).not.toBeNull();
    for (const match of titleMatches!) {
      expect(match).toContain('QUMUS');
    }
  });

  it('service worker should use qumus cache names', () => {
    const sw = readFileSync(resolve(__dirname, '../client/public/sw.js'), 'utf-8');
    expect(sw).toContain('qumus-${CACHE_VERSION}');
  });

  it('Home.tsx should show QUMUS Ecosystem', () => {
    const home = readFileSync(resolve(__dirname, '../client/src/pages/Home.tsx'), 'utf-8');
    expect(home).toContain('QUMUS Ecosystem');
  });
});
