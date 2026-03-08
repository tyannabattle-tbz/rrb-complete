import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createCallerFactory } from '@trpc/server';
import { appRouter } from '../routers';
import { createContext } from '../_core/context';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

describe('Motion Generation Router', () => {
  let caller: ReturnType<ReturnType<typeof createCallerFactory>>;
  const mockUserId = 1;
  const mockUser = {
    id: mockUserId,
    email: 'test@example.com',
    name: 'Test User',
    role: 'user' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    const factory = createCallerFactory(appRouter);
    caller = factory({
      user: mockUser,
      req: {} as any,
      res: {} as any,
    } as any);
  });

  it('should generate a video clip with valid input', async () => {
    const result = await caller.motionGeneration.generateVideoClip({
      description: 'A beautiful sunset over mountains',
      duration: 10,
      style: 'cinematic',
      resolution: '1080p',
      fps: 30,
      aspectRatio: '16:9',
    });

    expect(result.success).toBe(true);
    expect(result.videoId).toBeDefined();
    expect(result.clipId).toBeDefined();
    expect(result.status).toBe('completed');
    expect(result.videoUrl).toBeDefined();
    expect(result.videoUrl).toMatch(/^\/videos\/video-/);
    expect(result.progress).toBe(100);
    expect(result.userId).toBe(mockUserId);

    // Verify the video file exists
    const videoPath = join(process.cwd(), 'public', result.videoUrl.replace(/^\//, ''));
    expect(existsSync(videoPath)).toBe(true);

    // Clean up
    if (existsSync(videoPath)) {
      unlinkSync(videoPath);
    }
  });

  it('should generate video with different styles', async () => {
    const styles = ['cinematic', 'animated', 'motion-graphics', 'documentary'] as const;

    for (const style of styles) {
      const result = await caller.motionGeneration.generateVideoClip({
        description: `A ${style} video test`,
        duration: 5,
        style,
        resolution: '720p',
        fps: 24,
        aspectRatio: '16:9',
      });

      expect(result.success).toBe(true);
      expect(result.settings.style).toBe(style);

      // Clean up
      const videoPath = join(process.cwd(), 'public', result.videoUrl.replace(/^\//, ''));
      if (existsSync(videoPath)) {
        unlinkSync(videoPath);
      }
    }
  });

  it('should generate video with different resolutions', async () => {
    const resolutions = ['720p', '1080p', '4k'] as const;

    for (const resolution of resolutions) {
      const result = await caller.motionGeneration.generateVideoClip({
        description: `A ${resolution} video test`,
        duration: 5,
        style: 'cinematic',
        resolution,
        fps: 30,
        aspectRatio: '16:9',
      });

      expect(result.success).toBe(true);
      expect(result.settings.resolution).toBe(resolution);

      // Clean up
      const videoPath = join(process.cwd(), 'public', result.videoUrl.replace(/^\//, ''));
      if (existsSync(videoPath)) {
        unlinkSync(videoPath);
      }
    }
  });

  it('should include video settings in response', async () => {
    const result = await caller.motionGeneration.generateVideoClip({
      description: 'Settings test video',
      duration: 15,
      style: 'animated',
      resolution: '1080p',
      fps: 60,
      aspectRatio: '9:16',
    });

    expect(result.settings).toEqual({
      duration: 15,
      style: 'animated',
      resolution: '1080p',
      fps: 60,
      aspectRatio: '9:16',
    });

    // Clean up
    const videoPath = join(process.cwd(), 'public', result.videoUrl.replace(/^\//, ''));
    if (existsSync(videoPath)) {
      unlinkSync(videoPath);
    }
  });

  it('should handle minimum duration', async () => {
    const result = await caller.motionGeneration.generateVideoClip({
      description: 'Minimum duration video',
      duration: 1,
      style: 'cinematic',
      resolution: '720p',
      fps: 24,
      aspectRatio: '16:9',
    });

    expect(result.success).toBe(true);
    expect(result.settings.duration).toBe(1);

    // Clean up
    const videoPath = join(process.cwd(), 'public', result.videoUrl.replace(/^\//, ''));
    if (existsSync(videoPath)) {
      unlinkSync(videoPath);
    }
  });

  it('should handle maximum duration', async () => {
    const result = await caller.motionGeneration.generateVideoClip({
      description: 'Maximum duration video',
      duration: 300,
      style: 'cinematic',
      resolution: '720p',
      fps: 24,
      aspectRatio: '16:9',
    });

    expect(result.success).toBe(true);
    expect(result.settings.duration).toBe(300);

    // Clean up
    const videoPath = join(process.cwd(), 'public', result.videoUrl.replace(/^\//, ''));
    if (existsSync(videoPath)) {
      unlinkSync(videoPath);
    }
  });

  it('should generate animation from description', async () => {
    const result = await caller.motionGeneration.generateAnimation({
      description: 'A spinning cube animation',
      duration: 5,
      style: 'animated',
      fps: 30,
    });

    expect(result.success).toBe(true);
    expect(result.animationId).toBeDefined();
    expect(result.status).toBe('completed');

    // Clean up
    const videoPath = join(process.cwd(), 'public', result.videoUrl.replace(/^\//, ''));
    if (existsSync(videoPath)) {
      unlinkSync(videoPath);
    }
  });

  it('should generate motion graphics', async () => {
    const result = await caller.motionGeneration.generateMotionGraphics({
      description: 'Title animation with text effects',
      duration: 3,
      textContent: 'Welcome to Qumus',
      backgroundColor: '#000000',
      accentColor: '#FF0000',
    });

    expect(result.success).toBe(true);
    expect(result.graphicsId).toBeDefined();
    expect(result.status).toBe('completed');

    // Clean up
    const videoPath = join(process.cwd(), 'public', result.videoUrl.replace(/^\//, ''));
    if (existsSync(videoPath)) {
      unlinkSync(videoPath);
    }
  });
});
