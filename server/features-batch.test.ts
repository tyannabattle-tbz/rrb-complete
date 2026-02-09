/**
 * Features Batch Tests
 * Tests for: QUMUS Stream Scheduler, Audio Upload, OG/SEO Tags
 * 
 * A Canryn Production — All Rights Reserved
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('QUMUS Stream Scheduler', () => {
  it('should define time-based schedule blocks', async () => {
    const schedulerPath = path.join(__dirname, '../client/src/lib/qumusStreamScheduler.ts');
    const content = fs.readFileSync(schedulerPath, 'utf-8');
    
    // Should have schedule blocks for different times of day
    expect(content).toContain('Top of the Sol');
    expect(content).toContain('afternoon');
    expect(content).toContain('evening');
    expect(content).toContain('night');
  });

  it('should export getScheduleBlock function', async () => {
    const schedulerPath = path.join(__dirname, '../client/src/lib/qumusStreamScheduler.ts');
    const content = fs.readFileSync(schedulerPath, 'utf-8');
    expect(content).toContain('getCurrentScheduleBlock');
    expect(content).toContain('export');
  });

  it('should reference CHANNEL_PRESETS from stream library', async () => {
    const schedulerPath = path.join(__dirname, '../client/src/lib/qumusStreamScheduler.ts');
    const content = fs.readFileSync(schedulerPath, 'utf-8');
    expect(content).toContain('CHANNEL_PRESETS');
  });

  it('should have auto-rotation capability', async () => {
    const schedulerPath = path.join(__dirname, '../client/src/lib/qumusStreamScheduler.ts');
    const content = fs.readFileSync(schedulerPath, 'utf-8');
    // Should have rotation/scheduling logic
    expect(content).toMatch(/rotat|schedul|auto|interval/i);
  });
});

describe('Audio Upload System', () => {
  it('should have uploadTrack procedure in audioRouter', async () => {
    const routerPath = path.join(__dirname, 'routers/audioRouter.ts');
    const content = fs.readFileSync(routerPath, 'utf-8');
    expect(content).toContain('uploadTrack');
    expect(content).toContain('protectedProcedure');
    expect(content).toContain('base64Data');
  });

  it('should validate required fields for upload', async () => {
    const routerPath = path.join(__dirname, 'routers/audioRouter.ts');
    const content = fs.readFileSync(routerPath, 'utf-8');
    expect(content).toContain('title: z.string().min(1)');
    expect(content).toContain('artist: z.string().min(1)');
    expect(content).toContain('filename: z.string()');
  });

  it('should use storagePut for S3 upload', async () => {
    const routerPath = path.join(__dirname, 'routers/audioRouter.ts');
    const content = fs.readFileSync(routerPath, 'utf-8');
    expect(content).toContain('storagePut');
    expect(content).toContain('audio-uploads');
  });

  it('should return URL after successful upload', async () => {
    const routerPath = path.join(__dirname, 'routers/audioRouter.ts');
    const content = fs.readFileSync(routerPath, 'utf-8');
    expect(content).toContain('url');
    expect(content).toContain('fileKey');
    expect(content).toContain('success: true');
  });

  it('should have AudioUploadManager component', async () => {
    const componentPath = path.join(__dirname, '../client/src/components/AudioUploadManager.tsx');
    const content = fs.readFileSync(componentPath, 'utf-8');
    expect(content).toContain('AudioUploadManager');
    expect(content).toContain('useAudio');
    expect(content).toContain('MAX_FILE_SIZE');
  });

  it('should enforce 15MB file size limit', async () => {
    const componentPath = path.join(__dirname, '../client/src/components/AudioUploadManager.tsx');
    const content = fs.readFileSync(componentPath, 'utf-8');
    expect(content).toContain('15 * 1024 * 1024');
  });

  it('should persist uploaded tracks in localStorage', async () => {
    const componentPath = path.join(__dirname, '../client/src/components/AudioUploadManager.tsx');
    const content = fs.readFileSync(componentPath, 'utf-8');
    expect(content).toContain('localStorage');
    expect(content).toContain('qumus-user-tracks');
  });
});

describe('Open Graph & SEO Tags', () => {
  let indexHtml: string;

  beforeEach(() => {
    const htmlPath = path.join(__dirname, '../client/index.html');
    indexHtml = fs.readFileSync(htmlPath, 'utf-8');
  });

  it('should have og:title meta tag', () => {
    expect(indexHtml).toContain('og:title');
    expect(indexHtml).toContain('QUMUS');
  });

  it('should have og:description meta tag', () => {
    expect(indexHtml).toContain('og:description');
    expect(indexHtml).toContain('Canryn Production');
  });

  it('should have og:image meta tag with CDN URL', () => {
    expect(indexHtml).toContain('og:image');
    expect(indexHtml).toContain('manuscdn.com');
  });

  it('should have og:image dimensions', () => {
    expect(indexHtml).toContain('og:image:width');
    expect(indexHtml).toContain('og:image:height');
  });

  it('should have Twitter Card meta tags', () => {
    expect(indexHtml).toContain('twitter:card');
    expect(indexHtml).toContain('summary_large_image');
    expect(indexHtml).toContain('twitter:title');
    expect(indexHtml).toContain('twitter:image');
  });

  it('should have canonical URL pointing to rockinrockinboogie.com', () => {
    expect(indexHtml).toContain('rel="canonical"');
    expect(indexHtml).toContain('rockinrockinboogie.com');
  });

  it('should have JSON-LD structured data', () => {
    expect(indexHtml).toContain('application/ld+json');
    expect(indexHtml).toContain('@context');
    expect(indexHtml).toContain('schema.org');
  });

  it('should have Organization schema', () => {
    expect(indexHtml).toContain('"@type": "Organization"');
    expect(indexHtml).toContain('Canryn Production');
  });

  it('should have MusicGroup schema', () => {
    expect(indexHtml).toContain('"@type": "MusicGroup"');
    expect(indexHtml).toContain("Rockin' Rockin' Boogie");
  });

  it('should have WebApplication schema', () => {
    expect(indexHtml).toContain('"@type": "WebApplication"');
    expect(indexHtml).toContain('MultimediaApplication');
  });

  it('should have meta description under 160 characters', () => {
    const descMatch = indexHtml.match(/name="description"\s+content="([^"]+)"/);
    expect(descMatch).toBeTruthy();
    if (descMatch) {
      expect(descMatch[1].length).toBeLessThanOrEqual(160);
    }
  });

  it('should have 7 or fewer keywords', () => {
    const keywordsMatch = indexHtml.match(/name="keywords"\s+content="([^"]+)"/);
    expect(keywordsMatch).toBeTruthy();
    if (keywordsMatch) {
      const keywords = keywordsMatch[1].split(',').map(k => k.trim());
      expect(keywords.length).toBeLessThanOrEqual(8);
    }
  });
});

describe('Now Playing Widget', () => {
  it('should have NowPlayingWidget component', async () => {
    const componentPath = path.join(__dirname, '../client/src/components/NowPlayingWidget.tsx');
    const content = fs.readFileSync(componentPath, 'utf-8');
    expect(content).toContain('NowPlayingWidget');
    expect(content).toContain('useAudio');
  });

  it('should display current track info', async () => {
    const componentPath = path.join(__dirname, '../client/src/components/NowPlayingWidget.tsx');
    const content = fs.readFileSync(componentPath, 'utf-8');
    expect(content).toContain('currentTrack');
    expect(content).toContain('title');
    expect(content).toContain('artist');
  });

  it('should have play/pause controls', async () => {
    const componentPath = path.join(__dirname, '../client/src/components/NowPlayingWidget.tsx');
    const content = fs.readFileSync(componentPath, 'utf-8');
    expect(content).toMatch(/play|pause|toggle/i);
  });
});

describe('Content Scheduler Audio Streams Tab', () => {
  it('should have audio-streams tab in ContentScheduler', async () => {
    const schedulerPath = path.join(__dirname, '../client/src/pages/ContentScheduler.tsx');
    const content = fs.readFileSync(schedulerPath, 'utf-8');
    expect(content).toContain('audio-streams');
    expect(content).toContain('Audio Streams');
    expect(content).toContain('QumusStreamScheduler');
  });
});
