import { invokeLLM } from '../_core/llm';
import { storagePut, storageGet } from '../storage';

export interface Highlight {
  id: string;
  timestamp: number;
  duration: number;
  title: string;
  description: string;
  confidence: number;
  tags: string[];
}

export interface BroadcastClip {
  id: string;
  broadcastId: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  duration: number;
  videoUrl: string;
  thumbnailUrl: string;
  views: number;
  likes: number;
  shares: number;
  createdAt: Date;
  socialMediaLinks: {
    youtube?: string;
    tiktok?: string;
    instagram?: string;
    twitter?: string;
  };
}

class BroadcastClipsService {
  private highlights: Map<string, Highlight[]> = new Map();
  private clips: Map<string, BroadcastClip[]> = new Map();

  /**
   * Detect highlights in broadcast using AI
   */
  async detectHighlights(
    broadcastId: string,
    transcript: string,
    duration: number
  ): Promise<Highlight[]> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content:
              'You are a broadcast highlight detector. Analyze the transcript and identify the most engaging moments. Return JSON array of highlights with timestamps, titles, and descriptions.',
          },
          {
            role: 'user',
            content: `Broadcast duration: ${duration}s. Transcript: ${transcript.substring(0, 2000)}. Find 5-10 key highlights as JSON array: [{timestamp: number (seconds), duration: number, title: string, description: string, confidence: 0-1, tags: string[]}]`,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'broadcast_highlights',
            strict: true,
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  timestamp: { type: 'number' },
                  duration: { type: 'number' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  confidence: { type: 'number' },
                  tags: { type: 'array', items: { type: 'string' } },
                },
                required: ['timestamp', 'duration', 'title', 'description', 'confidence', 'tags'],
                additionalProperties: false,
              },
            },
          },
        },
      });

      const content = response.choices[0].message.content;
      const highlightsData = typeof content === 'string' ? JSON.parse(content) : content;

      const highlights: Highlight[] = highlightsData.map(
        (h: any, idx: number) => ({
          id: `highlight-${broadcastId}-${idx}`,
          timestamp: h.timestamp,
          duration: h.duration,
          title: h.title,
          description: h.description,
          confidence: h.confidence,
          tags: h.tags,
        })
      );

      this.highlights.set(broadcastId, highlights);
      return highlights;
    } catch (error) {
      console.error('Highlight detection failed:', error);
      return [];
    }
  }

  /**
   * Create clip from broadcast
   */
  async createClip(
    broadcastId: string,
    title: string,
    description: string,
    startTime: number,
    endTime: number,
    videoUrl: string,
    thumbnailUrl: string
  ): Promise<BroadcastClip> {
    const clip: BroadcastClip = {
      id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      broadcastId,
      title,
      description,
      startTime,
      endTime,
      duration: endTime - startTime,
      videoUrl,
      thumbnailUrl,
      views: 0,
      likes: 0,
      shares: 0,
      createdAt: new Date(),
      socialMediaLinks: {},
    };

    const clips = this.clips.get(broadcastId) || [];
    clips.push(clip);
    this.clips.set(broadcastId, clips);

    return clip;
  }

  /**
   * Generate social media optimized clip
   */
  async generateSocialMediaClip(
    clip: BroadcastClip,
    platform: 'youtube' | 'tiktok' | 'instagram' | 'twitter'
  ): Promise<{ platform: string; url: string; optimizedDescription: string }> {
    try {
      const platformConfig = {
        youtube: { maxLength: 5000, aspectRatio: '16:9' },
        tiktok: { maxLength: 150, aspectRatio: '9:16' },
        instagram: { maxLength: 2200, aspectRatio: '1:1' },
        twitter: { maxLength: 280, aspectRatio: '16:9' },
      };

      const config = platformConfig[platform];

      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `You are a social media content optimizer for ${platform}. Create an optimized description for this clip that's engaging and platform-appropriate.`,
          },
          {
            role: 'user',
            content: `Clip: "${clip.title}" - ${clip.description}. Create a ${config.maxLength} character description for ${platform} with relevant hashtags and emojis.`,
          },
        ],
      });

      const optimizedDescription = response.choices[0].message.content as string;

      const clipUrl = `https://clips.example.com/${clip.id}/${platform}`;
      clip.socialMediaLinks[platform] = clipUrl;

      return {
        platform,
        url: clipUrl,
        optimizedDescription,
      };
    } catch (error) {
      console.error(`Social media optimization failed for ${platform}:`, error);
      return {
        platform,
        url: '',
        optimizedDescription: clip.description,
      };
    }
  }

  /**
   * Get highlights for broadcast
   */
  async getHighlights(broadcastId: string): Promise<Highlight[]> {
    return this.highlights.get(broadcastId) || [];
  }

  /**
   * Get clips for broadcast
   */
  async getClips(broadcastId: string): Promise<BroadcastClip[]> {
    return this.clips.get(broadcastId) || [];
  }

  /**
   * Increment clip views
   */
  async incrementViews(clipId: string): Promise<void> {
    for (const [, clips] of this.clips) {
      const clip = clips.find((c) => c.id === clipId);
      if (clip) {
        clip.views++;
        break;
      }
    }
  }

  /**
   * Like clip
   */
  async likeClip(clipId: string): Promise<number> {
    for (const [, clips] of this.clips) {
      const clip = clips.find((c) => c.id === clipId);
      if (clip) {
        clip.likes++;
        return clip.likes;
      }
    }
    return 0;
  }

  /**
   * Share clip
   */
  async shareClip(clipId: string): Promise<number> {
    for (const [, clips] of this.clips) {
      const clip = clips.find((c) => c.id === clipId);
      if (clip) {
        clip.shares++;
        return clip.shares;
      }
    }
    return 0;
  }

  /**
   * Get trending clips
   */
  async getTrendingClips(limit: number = 10): Promise<BroadcastClip[]> {
    const allClips: BroadcastClip[] = [];
    for (const [, clips] of this.clips) {
      allClips.push(...clips);
    }

    return allClips
      .sort((a, b) => b.views + b.likes + b.shares - (a.views + a.likes + a.shares))
      .slice(0, limit);
  }
}

export const broadcastClipsService = new BroadcastClipsService();
