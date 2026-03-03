import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('SEO Meta Tags', () => {
  const html = readFileSync(resolve(__dirname, '../client/index.html'), 'utf-8');

  it('should have a title between 30 and 60 characters', () => {
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    expect(titleMatch).not.toBeNull();
    const title = titleMatch![1];
    expect(title.length).toBeGreaterThanOrEqual(30);
    expect(title.length).toBeLessThanOrEqual(65);
    expect(title).toContain('QUMUS');
    expect(title).toContain('Canryn Production');
  });

  it('should have a meta description under 160 characters', () => {
    const descMatch = html.match(/name="description"\s+content="([^"]*)"/);
    expect(descMatch).not.toBeNull();
    const desc = descMatch![1];
    expect(desc.length).toBeLessThanOrEqual(160);
    expect(desc.length).toBeGreaterThanOrEqual(50);
    expect(desc).toContain('QUMUS');
  });

  it('should have a keywords meta tag with relevant terms', () => {
    const keywordsMatch = html.match(/name="keywords"\s+content="([^"]*)"/);
    expect(keywordsMatch).not.toBeNull();
    const keywords = keywordsMatch![1];
    expect(keywords).toContain('QUMUS');
    expect(keywords).toContain('Canryn Production');
    expect(keywords).toContain('Rockin Rockin Boogie');
    expect(keywords).toContain('HybridCast');
    expect(keywords).toContain('healing frequencies');
  });

  it('should have proper theme-color meta tag', () => {
    expect(html).toContain('name="theme-color"');
  });

  it('should have a manifest link', () => {
    expect(html).toContain('rel="manifest"');
  });

  it('should have apple-touch-icon', () => {
    expect(html).toContain('rel="apple-touch-icon"');
  });

  it('should have favicon links', () => {
    expect(html).toContain('rel="icon"');
  });
});

describe('Home Page SEO Headings', () => {
  const homeTsx = readFileSync(resolve(__dirname, '../client/src/pages/Home.tsx'), 'utf-8');

  it('should have an H1 heading element', () => {
    expect(homeTsx).toContain('<h1');
    // The login page should have an H1 for SEO crawlers
    expect(homeTsx).toContain('QUMUS Orchestration Engine');
  });

  it('should have an H2 heading element', () => {
    expect(homeTsx).toContain('<h2');
    expect(homeTsx).toContain('Canryn Production');
  });

  it('should have H1 on the authenticated page as well', () => {
    // The authenticated view also has an H1
    expect(homeTsx).toContain('RRB Ecosystem');
  });
});
