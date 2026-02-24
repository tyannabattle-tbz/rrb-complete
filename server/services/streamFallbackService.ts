/**
 * Stream Fallback Service
 * Automatically switches to working streams when primary fails
 */

import { StreamProxyService } from './streamProxyService';

export interface StreamOption {
  url: string;
  format: string;
  bitrate?: number;
  label?: string;
}

export interface StreamWithFallbacks {
  primary: StreamOption;
  fallbacks: StreamOption[];
}

export interface FallbackResult {
  url: string;
  format: string;
  isHealthy: boolean;
  isFallback: boolean;
  fallbackIndex?: number;
}

/**
 * Stream fallback configuration for all channels
 * Each channel has primary + fallback streams
 */
export const STREAM_FALLBACK_CONFIG: Record<string, StreamWithFallbacks> = {
  // RRB Primary Streams
  'rockin-rockin-boogie': {
    primary: {
      url: 'https://stream.radioparadise.com/aac-128',
      format: 'aac',
      bitrate: 128,
      label: 'Radio Paradise AAC 128k',
    },
    fallbacks: [
      {
        url: 'https://stream.radioparadise.com/mp3-128',
        format: 'mp3',
        bitrate: 128,
        label: 'Radio Paradise MP3 128k',
      },
      {
        url: 'https://stream.radioparadise.com/aac-320',
        format: 'aac',
        bitrate: 320,
        label: 'Radio Paradise AAC 320k',
      },
      {
        url: 'https://bbcmedia.ic.llnwd.net/stream/bbcmedia_radio1_mux_p3_192k_aac',
        format: 'aac',
        bitrate: 192,
        label: 'BBC Radio 1',
      },
    ],
  },

  // Blues Hour
  'blues-hour': {
    primary: {
      url: 'https://stream.radioparadise.com/mp3-128',
      format: 'mp3',
      bitrate: 128,
      label: 'Radio Paradise MP3 128k',
    },
    fallbacks: [
      {
        url: 'https://stream.radioparadise.com/aac-128',
        format: 'aac',
        bitrate: 128,
        label: 'Radio Paradise AAC 128k',
      },
      {
        url: 'https://stream.radioparadise.com/mp3-320',
        format: 'mp3',
        bitrate: 320,
        label: 'Radio Paradise MP3 320k',
      },
    ],
  },

  // Jazz Essentials
  'jazz-essentials': {
    primary: {
      url: 'https://stream.radioparadise.com/aac-320',
      format: 'aac',
      bitrate: 320,
      label: 'Radio Paradise AAC 320k',
    },
    fallbacks: [
      {
        url: 'https://stream.radioparadise.com/mp3-320',
        format: 'mp3',
        bitrate: 320,
        label: 'Radio Paradise MP3 320k',
      },
      {
        url: 'https://stream.radioparadise.com/aac-128',
        format: 'aac',
        bitrate: 128,
        label: 'Radio Paradise AAC 128k',
      },
    ],
  },
};

export class StreamFallbackService {
  private static healthCache = new Map<string, { healthy: boolean; timestamp: number }>();
  private static readonly CACHE_TTL = 60000; // 1 minute

  /**
   * Get the best available stream for a channel
   * Tries primary first, then fallbacks in order
   */
  static async getBestStream(channelId: string): Promise<FallbackResult> {
    const config = STREAM_FALLBACK_CONFIG[channelId];

    if (!config) {
      return {
        url: '',
        format: 'unknown',
        isHealthy: false,
        isFallback: false,
      };
    }

    // Try primary stream
    const primaryHealthy = await this.checkStreamHealth(config.primary.url);
    if (primaryHealthy) {
      return {
        url: config.primary.url,
        format: config.primary.format,
        isHealthy: true,
        isFallback: false,
      };
    }

    // Try fallbacks in order
    for (let i = 0; i < config.fallbacks.length; i++) {
      const fallback = config.fallbacks[i];
      const fallbackHealthy = await this.checkStreamHealth(fallback.url);

      if (fallbackHealthy) {
        return {
          url: fallback.url,
          format: fallback.format,
          isHealthy: true,
          isFallback: true,
          fallbackIndex: i,
        };
      }
    }

    // All streams failed, return primary as last resort
    return {
      url: config.primary.url,
      format: config.primary.format,
      isHealthy: false,
      isFallback: false,
    };
  }

  /**
   * Check if a stream is healthy with caching
   */
  static async checkStreamHealth(url: string): Promise<boolean> {
    // Check cache first
    const cached = this.healthCache.get(url);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.healthy;
    }

    // Check actual health
    const healthy = await StreamProxyService.checkStreamHealth(url);

    // Update cache
    this.healthCache.set(url, { healthy, timestamp: Date.now() });

    return healthy;
  }

  /**
   * Clear health cache for a specific URL or all
   */
  static clearCache(url?: string): void {
    if (url) {
      this.healthCache.delete(url);
    } else {
      this.healthCache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return {
      size: this.healthCache.size,
      entries: Array.from(this.healthCache.entries()).map(([url, data]) => ({
        url,
        healthy: data.healthy,
        age: Date.now() - data.timestamp,
      })),
    };
  }

  /**
   * Register a new channel with fallback streams
   */
  static registerChannel(channelId: string, config: StreamWithFallbacks): void {
    STREAM_FALLBACK_CONFIG[channelId] = config;
  }

  /**
   * Get all registered channels
   */
  static getChannels(): string[] {
    return Object.keys(STREAM_FALLBACK_CONFIG);
  }

  /**
   * Get channel configuration
   */
  static getChannelConfig(channelId: string): StreamWithFallbacks | null {
    return STREAM_FALLBACK_CONFIG[channelId] || null;
  }
}
