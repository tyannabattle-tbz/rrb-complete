import { describe, it, expect, vi } from 'vitest';
import { mockVideoService } from '../_core/mockVideoService';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

describe('Motion Generation - MockVideoService Unit Tests', () => {
  it('should generate a valid MP4 video file', async () => {
    const result = await mockVideoService.generateVideo({
      prompt: 'A beautiful sunset over mountains',
      duration: 10,
      style: 'cinematic',
      resolution: '1080p',
    });

    expect(result.status).toBe('completed');
    expect(result.videoId).toBeDefined();
    expect(result.videoId).toMatch(/^video-\d+-[a-z0-9]+$/);
    expect(result.url).toMatch(/^\/videos\/video-/);
    expect(result.url).toMatch(/\.mp4$/);
    expect(result.duration).toBe(10);
    expect(result.resolution).toBe('1080p');
    expect(result.createdAt).toBeInstanceOf(Date);

    // Verify the video file exists
    const videoPath = join(process.cwd(), 'public', result.url.replace(/^\//, ''));
    expect(existsSync(videoPath)).toBe(true);

    // Verify file has content (MP4 header)
    const fs = await import('fs');
    const buffer = fs.readFileSync(videoPath);
    expect(buffer.length).toBeGreaterThan(0);

    // Clean up
    if (existsSync(videoPath)) {
      unlinkSync(videoPath);
    }
  });

  it('should generate videos with different resolutions', async () => {
    const resolutions = ['720p', '1080p', '4k'] as const;

    for (const resolution of resolutions) {
      const result = await mockVideoService.generateVideo({
        prompt: `Test video at ${resolution}`,
        duration: 5,
        style: 'cinematic',
        resolution,
      });

      expect(result.status).toBe('completed');
      expect(result.resolution).toBe(resolution);

      // Clean up
      const videoPath = join(process.cwd(), 'public', result.url.replace(/^\//, ''));
      if (existsSync(videoPath)) {
        unlinkSync(videoPath);
      }
    }
  });

  it('should generate videos with different styles', async () => {
    const styles = ['cinematic', 'animated', 'motion-graphics', 'documentary'];

    for (const style of styles) {
      const result = await mockVideoService.generateVideo({
        prompt: `Test ${style} video`,
        duration: 5,
        style,
        resolution: '1080p',
      });

      expect(result.status).toBe('completed');

      // Clean up
      const videoPath = join(process.cwd(), 'public', result.url.replace(/^\//, ''));
      if (existsSync(videoPath)) {
        unlinkSync(videoPath);
      }
    }
  });

  it('should handle various durations', async () => {
    const durations = [1, 5, 10, 30, 60, 300];

    for (const duration of durations) {
      const result = await mockVideoService.generateVideo({
        prompt: `${duration} second video`,
        duration,
        style: 'cinematic',
        resolution: '720p',
      });

      expect(result.status).toBe('completed');
      expect(result.duration).toBe(duration);

      // Clean up
      const videoPath = join(process.cwd(), 'public', result.url.replace(/^\//, ''));
      if (existsSync(videoPath)) {
        unlinkSync(videoPath);
      }
    }
  });

  it('should generate unique video IDs', async () => {
    const result1 = await mockVideoService.generateVideo({
      prompt: 'First video',
      duration: 5,
      style: 'cinematic',
      resolution: '1080p',
    });

    const result2 = await mockVideoService.generateVideo({
      prompt: 'Second video',
      duration: 5,
      style: 'cinematic',
      resolution: '1080p',
    });

    expect(result1.status).toBe('completed');
    expect(result2.status).toBe('completed');
    expect(result1.videoId).not.toBe(result2.videoId);
    expect(result1.url).not.toBe(result2.url);

    // Clean up
    const videoPath1 = join(process.cwd(), 'public', result1.url.replace(/^\//, ''));
    const videoPath2 = join(process.cwd(), 'public', result2.url.replace(/^\//, ''));
    if (existsSync(videoPath1)) unlinkSync(videoPath1);
    if (existsSync(videoPath2)) unlinkSync(videoPath2);
  });

  it('should create valid MP4 file structure', async () => {
    const result = await mockVideoService.generateVideo({
      prompt: 'MP4 structure test',
      duration: 5,
      style: 'cinematic',
      resolution: '720p',
    });

    expect(result.status).toBe('completed');
    const videoPath = join(process.cwd(), 'public', result.url.replace(/^\//, ''));
    const fs = await import('fs');
    const buffer = fs.readFileSync(videoPath);

    // Check for MP4 file signature (ftyp box)
    const fileTypeBox = buffer.toString('ascii', 4, 8);
    expect(fileTypeBox).toBe('ftyp');

    // Clean up
    if (existsSync(videoPath)) {
      unlinkSync(videoPath);
    }
  });

  it('should handle concurrent video generation', async () => {
    const promises = Array.from({ length: 5 }, (_, i) =>
      mockVideoService.generateVideo({
        prompt: `Concurrent video ${i}`,
        duration: 3,
        style: 'cinematic',
        resolution: '720p',
      })
    );

    const results = await Promise.all(promises);

    expect(results).toHaveLength(5);
    results.forEach((result) => {
      expect(result.status).toBe('completed');
      expect(result.videoId).toBeDefined();
    });

    // Verify all files exist
    results.forEach((result) => {
      const videoPath = join(process.cwd(), 'public', result.url.replace(/^\//, ''));
      expect(existsSync(videoPath)).toBe(true);
    });

    // Clean up
    results.forEach((result) => {
      const videoPath = join(process.cwd(), 'public', result.url.replace(/^\//, ''));
      if (existsSync(videoPath)) {
        unlinkSync(videoPath);
      }
    });
  });

  it('should return proper timestamp in createdAt', async () => {
    const beforeTime = new Date();
    const result = await mockVideoService.generateVideo({
      prompt: 'Timestamp test',
      duration: 5,
      style: 'cinematic',
      resolution: '1080p',
    });
    const afterTime = new Date();

    expect(result.status).toBe('completed');
    expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    expect(result.createdAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());

    // Clean up
    const videoPath = join(process.cwd(), 'public', result.url.replace(/^\//, ''));
    if (existsSync(videoPath)) {
      unlinkSync(videoPath);
    }
  });
});
