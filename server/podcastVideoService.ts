import { db } from './db';
import { podcastVideos } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';

export interface PodcastVideo {
  id: string;
  podcastId: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  publishedAt: Date;
  views: number;
  likes: number;
  hasGameOverlay: boolean;
  gameOverlayConfig?: {
    gameType: 'trivia' | 'memory' | 'reaction' | 'rhythm';
    difficulty: 'easy' | 'medium' | 'hard';
    duration: number;
  };
}

/**
 * Add a video to a podcast
 */
export async function addPodcastVideo(
  podcastId: string,
  title: string,
  description: string,
  videoUrl: string,
  thumbnailUrl: string,
  duration: number,
  hasGameOverlay: boolean = false,
  gameOverlayConfig?: PodcastVideo['gameOverlayConfig']
): Promise<PodcastVideo> {
  try {
    const result = await db
      .insert(podcastVideos)
      .values({
        podcastId,
        title,
        description,
        videoUrl,
        thumbnailUrl,
        duration,
        publishedAt: new Date(),
        views: 0,
        likes: 0,
        hasGameOverlay,
        gameOverlayConfig: gameOverlayConfig ? JSON.stringify(gameOverlayConfig) : null,
      })
      .returning();

    const video = result[0];
    return {
      ...video,
      gameOverlayConfig: video.gameOverlayConfig ? JSON.parse(video.gameOverlayConfig) : undefined,
    } as PodcastVideo;
  } catch (error) {
    console.error('[Podcast Video] Error adding video:', error);
    throw new Error('Failed to add podcast video');
  }
}

/**
 * Get all videos for a podcast
 */
export async function getPodcastVideos(podcastId: string): Promise<PodcastVideo[]> {
  try {
    const videos = await db
      .select()
      .from(podcastVideos)
      .where(eq(podcastVideos.podcastId, podcastId))
      .orderBy(desc(podcastVideos.publishedAt));

    return videos.map(v => ({
      ...v,
      gameOverlayConfig: v.gameOverlayConfig ? JSON.parse(v.gameOverlayConfig) : undefined,
    })) as PodcastVideo[];
  } catch (error) {
    console.error('[Podcast Video] Error fetching videos:', error);
    return [];
  }
}

/**
 * Get a specific video
 */
export async function getPodcastVideo(videoId: string): Promise<PodcastVideo | null> {
  try {
    const result = await db
      .select()
      .from(podcastVideos)
      .where(eq(podcastVideos.id, videoId))
      .limit(1);

    if (result.length === 0) return null;

    const video = result[0];
    return {
      ...video,
      gameOverlayConfig: video.gameOverlayConfig ? JSON.parse(video.gameOverlayConfig) : undefined,
    } as PodcastVideo;
  } catch (error) {
    console.error('[Podcast Video] Error fetching video:', error);
    return null;
  }
}

/**
 * Increment view count
 */
export async function incrementVideoViews(videoId: string): Promise<number> {
  try {
    const video = await getPodcastVideo(videoId);
    if (!video) throw new Error('Video not found');

    const newViews = (video.views || 0) + 1;

    await db
      .update(podcastVideos)
      .set({ views: newViews })
      .where(eq(podcastVideos.id, videoId));

    return newViews;
  } catch (error) {
    console.error('[Podcast Video] Error incrementing views:', error);
    throw new Error('Failed to increment views');
  }
}

/**
 * Like a video
 */
export async function likePodcastVideo(videoId: string): Promise<number> {
  try {
    const video = await getPodcastVideo(videoId);
    if (!video) throw new Error('Video not found');

    const newLikes = (video.likes || 0) + 1;

    await db
      .update(podcastVideos)
      .set({ likes: newLikes })
      .where(eq(podcastVideos.id, videoId));

    return newLikes;
  } catch (error) {
    console.error('[Podcast Video] Error liking video:', error);
    throw new Error('Failed to like video');
  }
}

/**
 * Update game overlay configuration
 */
export async function updateGameOverlay(
  videoId: string,
  hasGameOverlay: boolean,
  gameOverlayConfig?: PodcastVideo['gameOverlayConfig']
): Promise<PodcastVideo | null> {
  try {
    await db
      .update(podcastVideos)
      .set({
        hasGameOverlay,
        gameOverlayConfig: gameOverlayConfig ? JSON.stringify(gameOverlayConfig) : null,
      })
      .where(eq(podcastVideos.id, videoId));

    return getPodcastVideo(videoId);
  } catch (error) {
    console.error('[Podcast Video] Error updating overlay:', error);
    throw new Error('Failed to update game overlay');
  }
}

/**
 * Get trending videos (most viewed in last 7 days)
 */
export async function getTrendingPodcastVideos(limit: number = 10): Promise<PodcastVideo[]> {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const videos = await db
      .select()
      .from(podcastVideos)
      .orderBy(desc(podcastVideos.views));

    return videos
      .filter(v => new Date(v.publishedAt) > sevenDaysAgo)
      .slice(0, limit)
      .map(v => ({
        ...v,
        gameOverlayConfig: v.gameOverlayConfig ? JSON.parse(v.gameOverlayConfig) : undefined,
      })) as PodcastVideo[];
  } catch (error) {
    console.error('[Podcast Video] Error fetching trending videos:', error);
    return [];
  }
}

/**
 * Delete a video
 */
export async function deletePodcastVideo(videoId: string): Promise<boolean> {
  try {
    const result = await db
      .delete(podcastVideos)
      .where(eq(podcastVideos.id, videoId));

    return result.rowsAffected > 0;
  } catch (error) {
    console.error('[Podcast Video] Error deleting video:', error);
    throw new Error('Failed to delete video');
  }
}

/**
 * Get video statistics
 */
export async function getVideoStatistics(videoId: string): Promise<{
  views: number;
  likes: number;
  engagementRate: number;
  hasGameOverlay: boolean;
} | null> {
  try {
    const video = await getPodcastVideo(videoId);
    if (!video) return null;

    const engagementRate = video.views > 0 ? (video.likes / video.views) * 100 : 0;

    return {
      views: video.views,
      likes: video.likes,
      engagementRate: Math.round(engagementRate * 100) / 100,
      hasGameOverlay: video.hasGameOverlay,
    };
  } catch (error) {
    console.error('[Podcast Video] Error getting statistics:', error);
    return null;
  }
}
