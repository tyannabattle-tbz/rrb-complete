/**
 * Entertainment Platform - Audio Streaming Service
 * Meditation, podcasts, radio, and music streaming with playback controls
 */

import { getDb } from './db';
import {
  audioContent,
  audioPlaybackHistory,
  entertainmentPlaylists,
  entertainmentPlaylistItems,
} from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';

interface CreateAudioContentInput {
  title: string;
  description?: string;
  contentType: 'meditation' | 'podcast' | 'radio' | 'music' | 'audiobook' | 'other';
  category?: string;
  duration: number;
  audioUrl: string;
  coverArtUrl?: string;
  artist?: string;
  album?: string;
}

interface PlaybackInput {
  userId: number;
  contentId: string;
  playDuration?: number; // in seconds
}

/**
 * Create new audio content
 */
export async function createAudioContent(input: CreateAudioContentInput) {
  try {
    const db = await getDb();
    const contentId = `audio_${Date.now()}`;

    await db.insert(audioContent).values({
      contentId,
      title: input.title,
      description: input.description,
      contentType: input.contentType,
      category: input.category,
      duration: input.duration,
      audioUrl: input.audioUrl,
      coverArtUrl: input.coverArtUrl,
      artist: input.artist,
      album: input.album,
      plays: 0,
      favorites: 0,
      rating: 0,
      isPublished: true,
    });

    return {
      contentId,
      title: input.title,
      contentType: input.contentType,
      duration: input.duration,
      message: 'Audio content created successfully',
    };
  } catch (error) {
    console.error('Error creating audio content:', error);
    throw error;
  }
}

/**
 * Get audio content by ID
 */
export async function getAudioContent(contentId: string) {
  try {
    const db = await getDb();
    const content = await db.select().from(audioContent).where(eq(audioContent.contentId, contentId));
    return content[0] || null;
  } catch (error) {
    console.error('Error fetching audio content:', error);
    throw error;
  }
}

/**
 * Get audio content by type
 */
export async function getAudioByType(contentType: string, limit: number = 50) {
  try {
    const db = await getDb();
    const contents = await db
      .select()
      .from(audioContent)
      .where(and(eq(audioContent.contentType, contentType as any), eq(audioContent.isPublished, true)))
      .limit(limit);
    return contents;
  } catch (error) {
    console.error('Error fetching audio by type:', error);
    throw error;
  }
}

/**
 * Get audio content by category
 */
export async function getAudioByCategory(category: string, limit: number = 50) {
  try {
    const db = await getDb();
    const contents = await db
      .select()
      .from(audioContent)
      .where(and(eq(audioContent.category, category), eq(audioContent.isPublished, true)))
      .limit(limit);
    return contents;
  } catch (error) {
    console.error('Error fetching audio by category:', error);
    throw error;
  }
}

/**
 * Record playback and update history
 */
export async function recordPlayback(input: PlaybackInput) {
  try {
    const db = await getDb();
    const content = await getAudioContent(input.contentId);

    if (!content) throw new Error('Audio content not found');

    const historyId = `history_${input.userId}_${input.contentId}_${Date.now()}`;

    // Check if user has existing history for this content
    const existingHistory = await db
      .select()
      .from(audioPlaybackHistory)
      .where(and(eq(audioPlaybackHistory.userId, input.userId), eq(audioPlaybackHistory.contentId, input.contentId)));

    if (existingHistory.length > 0) {
      // Update existing history
      await db
        .update(audioPlaybackHistory)
        .set({
          playCount: (existingHistory[0].playCount || 0) + 1,
          totalListeningTime: (existingHistory[0].totalListeningTime || 0) + (input.playDuration || 0),
          lastPlayedAt: new Date(),
        })
        .where(eq(audioPlaybackHistory.historyId, existingHistory[0].historyId));
    } else {
      // Create new history
      await db.insert(audioPlaybackHistory).values({
        historyId,
        userId: input.userId,
        contentId: input.contentId,
        playCount: 1,
        totalListeningTime: input.playDuration || 0,
        lastPlayedAt: new Date(),
      });
    }

    // Increment play count on content
    await db
      .update(audioContent)
      .set({ plays: (content.plays || 0) + 1 })
      .where(eq(audioContent.contentId, input.contentId));

    return {
      contentId: input.contentId,
      message: 'Playback recorded successfully',
    };
  } catch (error) {
    console.error('Error recording playback:', error);
    throw error;
  }
}

/**
 * Get user's playback history
 */
export async function getUserPlaybackHistory(userId: number, limit: number = 50) {
  try {
    const db = await getDb();
    const history = await db
      .select()
      .from(audioPlaybackHistory)
      .where(eq(audioPlaybackHistory.userId, userId))
      .limit(limit);
    return history;
  } catch (error) {
    console.error('Error fetching user playback history:', error);
    throw error;
  }
}

/**
 * Add to favorites
 */
export async function addToFavorites(userId: number, contentId: string) {
  try {
    const db = await getDb();
    const content = await getAudioContent(contentId);

    if (!content) throw new Error('Audio content not found');

    // Update or create history with favorite flag
    const existingHistory = await db
      .select()
      .from(audioPlaybackHistory)
      .where(and(eq(audioPlaybackHistory.userId, userId), eq(audioPlaybackHistory.contentId, contentId)));

    if (existingHistory.length > 0) {
      await db
        .update(audioPlaybackHistory)
        .set({ isFavorited: true })
        .where(eq(audioPlaybackHistory.historyId, existingHistory[0].historyId));
    } else {
      const historyId = `history_${userId}_${contentId}_${Date.now()}`;
      await db.insert(audioPlaybackHistory).values({
        historyId,
        userId,
        contentId,
        isFavorited: true,
      });
    }

    // Increment favorites on content
    await db
      .update(audioContent)
      .set({ favorites: (content.favorites || 0) + 1 })
      .where(eq(audioContent.contentId, contentId));

    return {
      contentId,
      isFavorited: true,
      message: 'Added to favorites',
    };
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
}

/**
 * Remove from favorites
 */
export async function removeFromFavorites(userId: number, contentId: string) {
  try {
    const db = await getDb();

    await db
      .update(audioPlaybackHistory)
      .set({ isFavorited: false })
      .where(and(eq(audioPlaybackHistory.userId, userId), eq(audioPlaybackHistory.contentId, contentId)));

    const content = await getAudioContent(contentId);
    if (content) {
      await db
        .update(audioContent)
        .set({ favorites: Math.max(0, (content.favorites || 0) - 1) })
        .where(eq(audioContent.contentId, contentId));
    }

    return {
      contentId,
      isFavorited: false,
      message: 'Removed from favorites',
    };
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
}

/**
 * Rate audio content
 */
export async function rateAudioContent(userId: number, contentId: string, rating: number) {
  try {
    const db = await getDb();

    if (rating < 0 || rating > 5) throw new Error('Rating must be between 0 and 5');

    const existingHistory = await db
      .select()
      .from(audioPlaybackHistory)
      .where(and(eq(audioPlaybackHistory.userId, userId), eq(audioPlaybackHistory.contentId, contentId)));

    if (existingHistory.length > 0) {
      await db
        .update(audioPlaybackHistory)
        .set({ rating })
        .where(eq(audioPlaybackHistory.historyId, existingHistory[0].historyId));
    } else {
      const historyId = `history_${userId}_${contentId}_${Date.now()}`;
      await db.insert(audioPlaybackHistory).values({
        historyId,
        userId,
        contentId,
        rating,
      });
    }

    // Calculate average rating
    const allRatings = await db
      .select()
      .from(audioPlaybackHistory)
      .where(and(eq(audioPlaybackHistory.contentId, contentId)));

    const validRatings = allRatings.filter((h) => h.rating !== null && h.rating !== undefined);
    const averageRating =
      validRatings.length > 0 ? validRatings.reduce((sum, h) => sum + (h.rating || 0), 0) / validRatings.length : 0;

    await db
      .update(audioContent)
      .set({ rating: averageRating })
      .where(eq(audioContent.contentId, contentId));

    return {
      contentId,
      rating,
      averageRating,
      message: 'Rating recorded successfully',
    };
  } catch (error) {
    console.error('Error rating audio content:', error);
    throw error;
  }
}

/**
 * Get user's favorite content
 */
export async function getUserFavorites(userId: number, limit: number = 50) {
  try {
    const db = await getDb();
    const favorites = await db
      .select()
      .from(audioPlaybackHistory)
      .where(and(eq(audioPlaybackHistory.userId, userId), eq(audioPlaybackHistory.isFavorited, true)))
      .limit(limit);
    return favorites;
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    throw error;
  }
}

/**
 * Get trending audio content
 */
export async function getTrendingAudio(limit: number = 10) {
  try {
    const db = await getDb();
    const trending = await db
      .select()
      .from(audioContent)
      .where(eq(audioContent.isPublished, true))
      .orderBy((t) => t.plays)
      .limit(limit);
    return trending;
  } catch (error) {
    console.error('Error fetching trending audio:', error);
    throw error;
  }
}

/**
 * Get top-rated audio content
 */
export async function getTopRatedAudio(limit: number = 10) {
  try {
    const db = await getDb();
    const topRated = await db
      .select()
      .from(audioContent)
      .where(eq(audioContent.isPublished, true))
      .orderBy((t) => t.rating)
      .limit(limit);
    return topRated;
  } catch (error) {
    console.error('Error fetching top-rated audio:', error);
    throw error;
  }
}

/**
 * Search audio content
 */
export async function searchAudio(query: string, limit: number = 50) {
  try {
    const db = await getDb();
    // Simple search - in production, use full-text search
    const results = await db
      .select()
      .from(audioContent)
      .where(eq(audioContent.isPublished, true))
      .limit(limit);

    return results.filter(
      (content) =>
        content.title.toLowerCase().includes(query.toLowerCase()) ||
        content.description?.toLowerCase().includes(query.toLowerCase()) ||
        content.artist?.toLowerCase().includes(query.toLowerCase()) ||
        content.album?.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching audio:', error);
    throw error;
  }
}

/**
 * Get audio statistics
 */
export async function getAudioStatistics(contentId: string) {
  try {
    const content = await getAudioContent(contentId);
    if (!content) throw new Error('Audio content not found');

    const db = await getDb();
    const playbackData = await db
      .select()
      .from(audioPlaybackHistory)
      .where(eq(audioPlaybackHistory.contentId, contentId));

    const totalPlays = playbackData.length;
    const totalListeningTime = playbackData.reduce((sum, p) => sum + (p.totalListeningTime || 0), 0);
    const favorites = playbackData.filter((p) => p.isFavorited).length;
    const averageRating =
      playbackData.length > 0
        ? playbackData.reduce((sum, p) => sum + (p.rating || 0), 0) / playbackData.length
        : 0;

    return {
      contentId,
      title: content.title,
      contentType: content.contentType,
      duration: content.duration,
      plays: content.plays,
      favorites: content.favorites,
      rating: content.rating,
      userPlays: totalPlays,
      totalListeningTime,
      userFavorites: favorites,
      averageUserRating: averageRating,
    };
  } catch (error) {
    console.error('Error fetching audio statistics:', error);
    throw error;
  }
}
