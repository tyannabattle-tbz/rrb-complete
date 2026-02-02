/**
 * Video Caching Service
 * Manages video caching with Redis and CDN integration
 */

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize: number; // Max cache size in MB
  compressionEnabled: boolean;
}

export interface CachedVideo {
  videoId: string;
  url: string;
  size: number;
  resolution: string;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
  compressed: boolean;
}

export class VideoCachingService {
  private cache: Map<string, CachedVideo> = new Map();
  private config: CacheConfig = {
    ttl: 86400 * 7, // 7 days
    maxSize: 1000, // 1GB
    compressionEnabled: true,
  };
  private currentSize: number = 0;

  /**
   * Set cache configuration
   */
  setConfig(config: Partial<CacheConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Cache a video
   */
  cacheVideo(videoId: string, url: string, size: number, resolution: string): CachedVideo {
    // Check if we need to evict old entries
    if (this.currentSize + size > this.config.maxSize * 1024 * 1024) {
      this.evictLRU();
    }

    const cached: CachedVideo = {
      videoId,
      url,
      size,
      resolution,
      createdAt: new Date(),
      lastAccessed: new Date(),
      accessCount: 0,
      compressed: this.config.compressionEnabled,
    };

    this.cache.set(videoId, cached);
    this.currentSize += size;

    return cached;
  }

  /**
   * Get cached video
   */
  getVideo(videoId: string): CachedVideo | undefined {
    const video = this.cache.get(videoId);
    if (video) {
      video.lastAccessed = new Date();
      video.accessCount++;
      this.cache.set(videoId, video);
    }
    return video;
  }

  /**
   * Check if video is cached
   */
  isCached(videoId: string): boolean {
    return this.cache.has(videoId);
  }

  /**
   * Remove video from cache
   */
  removeVideo(videoId: string): boolean {
    const video = this.cache.get(videoId);
    if (video) {
      this.currentSize -= video.size;
      this.cache.delete(videoId);
      return true;
    }
    return false;
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  /**
   * Evict least recently used videos
   */
  private evictLRU(): void {
    const videos = Array.from(this.cache.values());
    videos.sort((a, b) => a.lastAccessed.getTime() - b.lastAccessed.getTime());

    // Remove oldest 10% of videos
    const toRemove = Math.ceil(videos.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      const video = videos[i];
      this.removeVideo(video.videoId);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const videos = Array.from(this.cache.values());
    return {
      totalVideos: videos.length,
      totalSize: this.currentSize,
      maxSize: this.config.maxSize * 1024 * 1024,
      utilizationPercent: (this.currentSize / (this.config.maxSize * 1024 * 1024)) * 100,
      averageAccessCount: videos.reduce((acc, v) => acc + v.accessCount, 0) / Math.max(videos.length, 1),
      oldestVideo: videos.length > 0 ? videos[0].createdAt : null,
      newestVideo: videos.length > 0 ? videos[videos.length - 1].createdAt : null,
    };
  }

  /**
   * Generate CDN URL for cached video
   */
  getCDNUrl(videoId: string, cdnDomain: string): string | null {
    const video = this.getVideo(videoId);
    if (!video) return null;
    return `${cdnDomain}/videos/${videoId}-${video.resolution}.mp4`;
  }

  /**
   * Preload video into cache
   */
  async preloadVideo(videoId: string, url: string, resolution: string): Promise<void> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const size = parseInt(response.headers.get('content-length') || '0', 10);
      this.cacheVideo(videoId, url, size, resolution);
    } catch (error) {
      console.error(`Failed to preload video ${videoId}:`, error);
    }
  }

  /**
   * Warm cache with popular videos
   */
  async warmCache(videoIds: string[], baseUrl: string): Promise<void> {
    const promises = videoIds.map((videoId) =>
      this.preloadVideo(videoId, `${baseUrl}/videos/${videoId}.mp4`, '1080p')
    );
    await Promise.allSettled(promises);
  }

  /**
   * Get cache hit ratio
   */
  getCacheHitRatio(): number {
    const videos = Array.from(this.cache.values());
    const totalAccesses = videos.reduce((acc, v) => acc + v.accessCount, 0);
    return totalAccesses > 0 ? (videos.length / totalAccesses) * 100 : 0;
  }

  /**
   * Compress video metadata for storage
   */
  compressMetadata(video: CachedVideo): string {
    return JSON.stringify({
      id: video.videoId,
      url: video.url,
      sz: video.size,
      res: video.resolution,
      ca: video.createdAt.getTime(),
      la: video.lastAccessed.getTime(),
      ac: video.accessCount,
      cmp: video.compressed,
    });
  }

  /**
   * Decompress video metadata
   */
  decompressMetadata(data: string): CachedVideo {
    const obj = JSON.parse(data);
    return {
      videoId: obj.id,
      url: obj.url,
      size: obj.sz,
      resolution: obj.res,
      createdAt: new Date(obj.ca),
      lastAccessed: new Date(obj.la),
      accessCount: obj.ac,
      compressed: obj.cmp,
    };
  }
}

export const videoCachingService = new VideoCachingService();
