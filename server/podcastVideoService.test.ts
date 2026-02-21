import { describe, it, expect, beforeEach } from 'vitest';
import {
  addPodcastVideo,
  getPodcastVideos,
  getPodcastVideo,
  incrementVideoViews,
  likePodcastVideo,
  updateGameOverlay,
  getTrendingPodcastVideos,
  deletePodcastVideo,
  getVideoStatistics,
} from './podcastVideoService';

describe('Podcast Video Service', () => {
  const podcastId = 'test-podcast';
  const videoData = {
    title: 'Test Episode',
    description: 'A test podcast episode',
    videoUrl: 'https://example.com/video.mp4',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    duration: 3600,
  };

  beforeEach(async () => {
    // Clear videos before each test
    const videos = await getPodcastVideos(podcastId);
    for (const video of videos) {
      await deletePodcastVideo(video.id).catch(() => {});
    }
  });

  it('should add a podcast video', async () => {
    const result = await addPodcastVideo(
      podcastId,
      videoData.title,
      videoData.description,
      videoData.videoUrl,
      videoData.thumbnailUrl,
      videoData.duration
    );
    expect(result).toBeDefined();
    expect(result.title).toBe(videoData.title);
  });

  it('should add video with game overlay', async () => {
    const gameConfig = {
      gameType: 'trivia' as const,
      difficulty: 'medium' as const,
      duration: 300,
    };

    const result = await addPodcastVideo(
      podcastId,
      videoData.title,
      videoData.description,
      videoData.videoUrl,
      videoData.thumbnailUrl,
      videoData.duration,
      true,
      gameConfig
    );

    expect(result.hasGameOverlay).toBe(true);
    expect(result.gameOverlayConfig?.gameType).toBe('trivia');
  });

  it('should get podcast videos', async () => {
    await addPodcastVideo(
      podcastId,
      'Video 1',
      'Description 1',
      'https://example.com/1.mp4',
      'https://example.com/1.jpg',
      1800
    );
    await addPodcastVideo(
      podcastId,
      'Video 2',
      'Description 2',
      'https://example.com/2.mp4',
      'https://example.com/2.jpg',
      1800
    );

    const videos = await getPodcastVideos(podcastId);
    expect(videos.length).toBe(2);
  });

  it('should increment video views', async () => {
    const video = await addPodcastVideo(
      podcastId,
      videoData.title,
      videoData.description,
      videoData.videoUrl,
      videoData.thumbnailUrl,
      videoData.duration
    );

    const views = await incrementVideoViews(video.id);
    expect(views).toBeGreaterThan(0);
  });

  it('should like a video', async () => {
    const video = await addPodcastVideo(
      podcastId,
      videoData.title,
      videoData.description,
      videoData.videoUrl,
      videoData.thumbnailUrl,
      videoData.duration
    );

    const likes = await likePodcastVideo(video.id);
    expect(likes).toBeGreaterThan(0);
  });

  it('should update game overlay', async () => {
    const video = await addPodcastVideo(
      podcastId,
      videoData.title,
      videoData.description,
      videoData.videoUrl,
      videoData.thumbnailUrl,
      videoData.duration
    );

    const gameConfig = {
      gameType: 'memory' as const,
      difficulty: 'hard' as const,
      duration: 600,
    };

    const updated = await updateGameOverlay(video.id, true, gameConfig);
    expect(updated?.hasGameOverlay).toBe(true);
    expect(updated?.gameOverlayConfig?.gameType).toBe('memory');
  });

  it('should get trending videos', async () => {
    await addPodcastVideo(
      podcastId,
      'Trending Video',
      'Description',
      'https://example.com/trending.mp4',
      'https://example.com/trending.jpg',
      1800
    );

    const trending = await getTrendingPodcastVideos(10);
    expect(Array.isArray(trending)).toBe(true);
  });

  it('should get video statistics', async () => {
    const video = await addPodcastVideo(
      podcastId,
      videoData.title,
      videoData.description,
      videoData.videoUrl,
      videoData.thumbnailUrl,
      videoData.duration
    );

    await incrementVideoViews(video.id);
    await likePodcastVideo(video.id);

    const stats = await getVideoStatistics(video.id);
    expect(stats).toBeDefined();
    expect(stats?.views).toBeGreaterThan(0);
    expect(stats?.likes).toBeGreaterThan(0);
  });

  it('should delete a video', async () => {
    const video = await addPodcastVideo(
      podcastId,
      videoData.title,
      videoData.description,
      videoData.videoUrl,
      videoData.thumbnailUrl,
      videoData.duration
    );

    const deleted = await deletePodcastVideo(video.id);
    expect(deleted).toBe(true);

    const retrieved = await getPodcastVideo(video.id);
    expect(retrieved).toBeNull();
  });

  it('should handle errors gracefully', async () => {
    const video = await getPodcastVideo('non-existent-id');
    expect(video).toBeNull();

    const stats = await getVideoStatistics('non-existent-id');
    expect(stats).toBeNull();
  });
});
