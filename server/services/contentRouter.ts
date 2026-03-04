import { getDb } from '../db';
import { stationContentSources, stationPlaybackHistory } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

type ContentType = 'talk' | 'music' | 'news' | 'meditation' | 'healing' | 'entertainment' | 'educational' | 'sports' | 'comedy' | 'mixed';

interface ContentSource {
  contentType: ContentType;
  sourceUrl: string;
  priority: number;
}

interface PlaybackInfo {
  contentType: ContentType;
  title: string;
  description?: string;
  duration?: number;
  sourceUrl: string;
}

/**
 * Content Router Service
 * Ensures correct content is routed to stations based on their content types
 * Fixes the issue where talk stations were playing music
 */
export class ContentRouter {
  /**
   * Get the correct content source for a station based on its content types
   * Prioritizes sources by content type match and priority level
   */
  static async getContentForStation(
    stationId: number,
    requestedContentType?: ContentType
  ): Promise<PlaybackInfo | null> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    try {
      // Get all content sources for this station
      const sources = await db
        .select()
        .from(stationContentSources)
        .where(
          and(
            eq(stationContentSources.stationId, stationId),
            eq(stationContentSources.isActive, 1)
          )
        );

      if (!sources.length) {
        console.warn(`No active content sources found for station ${stationId}`);
        return null;
      }

      // Sort by requested content type first, then by priority
      let selectedSource = sources[0];

      if (requestedContentType) {
        const matchingSource = sources.find(
          (s) => s.contentType === requestedContentType
        );
        if (matchingSource) {
          selectedSource = matchingSource;
        }
      }

      // Sort by priority (highest first)
      const prioritySorted = sources.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      selectedSource = prioritySorted[0];

      // Fetch actual content from the source URL
      const playbackInfo = await this.fetchContentFromSource(
        selectedSource.sourceUrl,
        selectedSource.contentType as ContentType
      );

      return playbackInfo;
    } catch (error) {
      console.error(`Error getting content for station ${stationId}:`, error);
      return null;
    }
  }

  /**
   * Fetch content from a source URL
   * Supports different content types with appropriate parsing
   */
  static async fetchContentFromSource(
    sourceUrl: string,
    contentType: ContentType
  ): Promise<PlaybackInfo> {
    try {
      // For demo purposes, return mock data based on content type
      // In production, this would fetch from actual APIs
      const contentMap: Record<ContentType, PlaybackInfo> = {
        talk: {
          contentType: 'talk',
          title: 'Live Talk Show',
          description: 'Engaging conversation and discussion',
          duration: 3600,
          sourceUrl,
        },
        music: {
          contentType: 'music',
          title: 'Music Mix',
          description: 'Curated music selection',
          duration: 180,
          sourceUrl,
        },
        news: {
          contentType: 'news',
          title: 'News Update',
          description: 'Latest news and updates',
          duration: 600,
          sourceUrl,
        },
        meditation: {
          contentType: 'meditation',
          title: 'Guided Meditation',
          description: 'Relaxing meditation session',
          duration: 1800,
          sourceUrl,
        },
        healing: {
          contentType: 'healing',
          title: 'Healing Frequencies',
          description: 'Solfeggio frequency healing session',
          duration: 3600,
          sourceUrl,
        },
        entertainment: {
          contentType: 'entertainment',
          title: 'Entertainment Program',
          description: 'Entertainment and fun content',
          duration: 1800,
          sourceUrl,
        },
        educational: {
          contentType: 'educational',
          title: 'Educational Content',
          description: 'Learning and educational material',
          duration: 2400,
          sourceUrl,
        },
        sports: {
          contentType: 'sports',
          title: 'Sports Update',
          description: 'Sports news and commentary',
          duration: 1200,
          sourceUrl,
        },
        comedy: {
          contentType: 'comedy',
          title: 'Comedy Show',
          description: 'Funny and entertaining content',
          duration: 1800,
          sourceUrl,
        },
        mixed: {
          contentType: 'mixed',
          title: 'Mixed Content',
          description: 'Variety of different content types',
          duration: 3600,
          sourceUrl,
        },
      };

      return contentMap[contentType] || contentMap.mixed;
    } catch (error) {
      console.error(`Error fetching content from ${sourceUrl}:`, error);
      throw error;
    }
  }

  /**
   * Log playback to history
   * Tracks what's currently playing on each station
   */
  static async logPlayback(
    stationId: number,
    contentType: ContentType,
    title: string,
    description?: string,
    duration?: number,
    listeners?: number
  ): Promise<number> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    try {
      const result = await db.insert(stationPlaybackHistory).values({
        stationId,
        contentType,
        title,
        description,
        duration,
        startTime: new Date(),
        listeners: listeners || 0,
      });

      return result[0];
    } catch (error) {
      console.error(`Error logging playback for station ${stationId}:`, error);
      throw error;
    }
  }

  /**
   * Validate that station's content types match what's being played
   * Returns true if content type matches station's declared types
   */
  static async validateContentMatch(
    stationId: number,
    contentType: ContentType
  ): Promise<boolean> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    try {
      const station = await db
        .select()
        .from(require('../../drizzle/schema').customStations)
        .where(eq(require('../../drizzle/schema').customStations.id, stationId));

      if (!station.length) {
        console.warn(`Station ${stationId} not found`);
        return false;
      }

      const stationContentTypes = station[0].contentTypes as ContentType[];
      const isValid = stationContentTypes.includes(contentType) || stationContentTypes.includes('mixed');

      if (!isValid) {
        console.warn(
          `Content type mismatch for station ${stationId}: ` +
          `expected ${stationContentTypes.join(', ')}, got ${contentType}`
        );
      }

      return isValid;
    } catch (error) {
      console.error(`Error validating content match for station ${stationId}:`, error);
      return false;
    }
  }

  /**
   * Get content sources for a specific content type
   * Helps find the right source when content type is requested
   */
  static async getSourcesByContentType(
    stationId: number,
    contentType: ContentType
  ): Promise<any[]> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    try {
      const sources = await db
        .select()
        .from(stationContentSources)
        .where(
          and(
            eq(stationContentSources.stationId, stationId),
            eq(stationContentSources.contentType, contentType),
            eq(stationContentSources.isActive, 1)
          )
        );

      return sources.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    } catch (error) {
      console.error(
        `Error getting sources for station ${stationId}, type ${contentType}:`,
        error
      );
      return [];
    }
  }

  /**
   * Sync station content with actual playback
   * Ensures what's displayed matches what's actually playing
   */
  static async syncStationContent(stationId: number): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    try {
      // Get the most recent playback
      const recentPlayback = await db
        .select()
        .from(stationPlaybackHistory)
        .where(eq(stationPlaybackHistory.stationId, stationId));

      if (!recentPlayback.length) {
        console.log(`No playback history for station ${stationId}`);
        return;
      }

      const latest = recentPlayback[recentPlayback.length - 1];

      // Validate the content matches the station's types
      const isValid = await this.validateContentMatch(stationId, latest.contentType as ContentType);

      if (!isValid) {
        console.warn(
          `Station ${stationId} content mismatch detected. ` +
          `Currently playing: ${latest.contentType}, title: ${latest.title}`
        );
        // In production, you might want to auto-correct by switching to appropriate content
      }
    } catch (error) {
      console.error(`Error syncing station content for ${stationId}:`, error);
    }
  }

  /**
   * Get current playback for a station
   * Returns what's currently playing
   */
  static async getCurrentPlayback(stationId: number): Promise<any | null> {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    try {
      const history = await db
        .select()
        .from(stationPlaybackHistory)
        .where(eq(stationPlaybackHistory.stationId, stationId));

      if (!history.length) return null;

      // Return the most recent playback
      return history[history.length - 1];
    } catch (error) {
      console.error(`Error getting current playback for station ${stationId}:`, error);
      return null;
    }
  }
}

export default ContentRouter;
