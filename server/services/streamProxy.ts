/**
 * Stream Proxy Service
 * Bypasses CORS restrictions by proxying external streams through our server
 * Uses Node.js built-in fetch (Node 18+)
 */

// Use built-in Node.js fetch (available in Node 18+)

interface StreamProxyOptions {
  url: string;
  headers?: Record<string, string>;
}

export class StreamProxyService {
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static readonly cache = new Map<string, { data: Buffer; timestamp: number }>();

  /**
   * Proxy a stream URL and return the audio data
   */
  static async proxyStream(options: StreamProxyOptions) {
    const { url, headers = {} } = options;

    // Check cache
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ...headers,
        },
      });

      if (!response.ok) {
        throw new Error(`Stream request failed: ${response.statusText}`);
      }

      const buffer = await response.buffer();

      // Cache the stream data
      this.cache.set(url, { data: buffer, timestamp: Date.now() });

      return buffer;
    } catch (error) {
      console.error('Stream proxy error:', error);
      throw error;
    }
  }

  /**
   * Get a proxy URL for a stream
   */
  static getProxyUrl(streamId: string): string {
    return `/api/stream/proxy/${streamId}`;
  }

  /**
   * Clear cache
   */
  static clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  static getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}
