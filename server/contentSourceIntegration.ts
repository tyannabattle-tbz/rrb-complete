import { db } from './db';
import { contentLibrary } from '@/drizzle/schedule.schema';
import { eq } from 'drizzle-orm';

/**
 * Content Source Integration
 * Connects to real content sources (RRB Radio, video library, podcasts)
 */

interface ContentSource {
  id: string;
  name: string;
  type: 'radio' | 'video' | 'podcast' | 'commercial';
  url: string;
  metadata?: Record<string, any>;
}

interface ContentItem {
  id: string;
  title: string;
  duration: number;
  fileUrl: string;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
}

export class ContentSourceIntegration {
  private static sources: Map<string, ContentSource> = new Map();

  /**
   * Register content source
   */
  static registerSource(source: ContentSource) {
    this.sources.set(source.id, source);
    console.log(`[ContentSourceIntegration] Registered source: ${source.name}`);
  }

  /**
   * Fetch content from RRB Radio
   */
  static async fetchRRBRadioContent(): Promise<ContentItem[]> {
    try {
      const rrbSource = this.sources.get('rrb-radio');
      if (!rrbSource) {
        console.warn('[ContentSourceIntegration] RRB Radio source not registered');
        return [];
      }

      // Fetch from RRB Radio API
      const response = await fetch(`${rrbSource.url}/api/content/list`, {
        headers: {
          'Authorization': `Bearer ${process.env.RRB_RADIO_API_KEY || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`RRB Radio API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.mapContentItems(data, 'radio');
    } catch (error) {
      console.error('[ContentSourceIntegration] Error fetching RRB Radio content:', error);
      return [];
    }
  }

  /**
   * Fetch content from video library
   */
  static async fetchVideoLibraryContent(): Promise<ContentItem[]> {
    try {
      const videoSource = this.sources.get('video-library');
      if (!videoSource) {
        console.warn('[ContentSourceIntegration] Video library source not registered');
        return [];
      }

      // Fetch from video library API
      const response = await fetch(`${videoSource.url}/api/videos/list`, {
        headers: {
          'Authorization': `Bearer ${process.env.VIDEO_LIBRARY_API_KEY || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Video library API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.mapContentItems(data, 'video');
    } catch (error) {
      console.error('[ContentSourceIntegration] Error fetching video library content:', error);
      return [];
    }
  }

  /**
   * Fetch content from podcast service
   */
  static async fetchPodcastContent(): Promise<ContentItem[]> {
    try {
      const podcastSource = this.sources.get('podcast-service');
      if (!podcastSource) {
        console.warn('[ContentSourceIntegration] Podcast service source not registered');
        return [];
      }

      // Fetch from podcast service API
      const response = await fetch(`${podcastSource.url}/api/episodes/list`, {
        headers: {
          'Authorization': `Bearer ${process.env.PODCAST_API_KEY || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Podcast service API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.mapContentItems(data, 'podcast');
    } catch (error) {
      console.error('[ContentSourceIntegration] Error fetching podcast content:', error);
      return [];
    }
  }

  /**
   * Fetch commercial content
   */
  static async fetchCommercialContent(): Promise<ContentItem[]> {
    try {
      const commercialSource = this.sources.get('commercial-service');
      if (!commercialSource) {
        console.warn('[ContentSourceIntegration] Commercial service source not registered');
        return [];
      }

      // Fetch from commercial service API
      const response = await fetch(`${commercialSource.url}/api/commercials/list`, {
        headers: {
          'Authorization': `Bearer ${process.env.COMMERCIAL_API_KEY || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Commercial service API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.mapContentItems(data, 'commercial');
    } catch (error) {
      console.error('[ContentSourceIntegration] Error fetching commercial content:', error);
      return [];
    }
  }

  /**
   * Sync all content sources to database
   */
  static async syncAllSources() {
    console.log('[ContentSourceIntegration] Starting content sync...');

    try {
      const allContent: ContentItem[] = [];

      // Fetch from all sources
      allContent.push(...await this.fetchRRBRadioContent());
      allContent.push(...await this.fetchVideoLibraryContent());
      allContent.push(...await this.fetchPodcastContent());
      allContent.push(...await this.fetchCommercialContent());

      // Insert into database
      for (const item of allContent) {
        const existing = await db
          .select()
          .from(contentLibrary)
          .where(eq(contentLibrary.id, item.id))
          .limit(1);

        if (!existing.length) {
          await db.insert(contentLibrary).values({
            id: item.id,
            title: item.title,
            contentTypeId: item.metadata?.contentType || 'radio',
            duration: item.duration,
            fileUrl: item.fileUrl,
            thumbnailUrl: item.thumbnailUrl,
            metadata: JSON.stringify(item.metadata || {}),
            isActive: 1,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      }

      console.log(`[ContentSourceIntegration] Synced ${allContent.length} content items`);
      return allContent;
    } catch (error) {
      console.error('[ContentSourceIntegration] Error during content sync:', error);
      return [];
    }
  }

  /**
   * Map API response to ContentItem format
   */
  private static mapContentItems(data: any[], contentType: string): ContentItem[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map(item => ({
      id: item.id || `${contentType}_${Date.now()}_${Math.random()}`,
      title: item.title || item.name || 'Untitled',
      duration: item.duration || item.length || 0,
      fileUrl: item.url || item.fileUrl || '',
      thumbnailUrl: item.thumbnail || item.thumbnailUrl,
      metadata: {
        contentType,
        ...item.metadata,
      },
    }));
  }

  /**
   * Get content by type
   */
  static async getContentByType(contentType: string): Promise<ContentItem[]> {
    try {
      const content = await db
        .select()
        .from(contentLibrary)
        .where(eq(contentLibrary.contentTypeId, contentType));

      return content.map(c => ({
        id: c.id,
        title: c.title,
        duration: c.duration,
        fileUrl: c.fileUrl,
        thumbnailUrl: c.thumbnailUrl || undefined,
        metadata: c.metadata ? JSON.parse(c.metadata) : undefined,
      }));
    } catch (error) {
      console.error(`[ContentSourceIntegration] Error fetching ${contentType} content:`, error);
      return [];
    }
  }

  /**
   * Initialize default sources
   */
  static initializeDefaultSources() {
    this.registerSource({
      id: 'rrb-radio',
      name: 'RRB Radio',
      type: 'radio',
      url: process.env.RRB_RADIO_API_URL || 'https://api.rrb-radio.local',
    });

    this.registerSource({
      id: 'video-library',
      name: 'Video Library',
      type: 'video',
      url: process.env.VIDEO_LIBRARY_API_URL || 'https://api.video-library.local',
    });

    this.registerSource({
      id: 'podcast-service',
      name: 'Podcast Service',
      type: 'podcast',
      url: process.env.PODCAST_API_URL || 'https://api.podcast-service.local',
    });

    this.registerSource({
      id: 'commercial-service',
      name: 'Commercial Service',
      type: 'commercial',
      url: process.env.COMMERCIAL_API_URL || 'https://api.commercial-service.local',
    });

    console.log('[ContentSourceIntegration] Default sources initialized');
  }
}
