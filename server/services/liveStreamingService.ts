/**
 * Live Streaming Integration Service
 * Handles OBS, Streamlabs, and adaptive bitrate encoding
 */

interface StreamConfig {
  id: string;
  platform: 'obs' | 'streamlabs' | 'rtmp' | 'hls';
  rtmpUrl: string;
  streamKey: string;
  enabled: boolean;
  bitrate: number; // kbps
  resolution: '480p' | '720p' | '1080p' | '4K';
  fps: number;
  encoder: 'h264' | 'h265' | 'vp9';
}

interface StreamMetrics {
  streamId: string;
  isLive: boolean;
  viewers: number;
  bitrate: number;
  fps: number;
  resolution: string;
  uptime: number; // seconds
  bandwidth: number; // Mbps
  droppedFrames: number;
  audioCodec: string;
  videoCodec: string;
}

interface AdaptiveBitrateProfile {
  name: string;
  bitrate: number;
  resolution: string;
  fps: number;
  minBandwidth: number;
  maxBandwidth: number;
}

interface StreamHealth {
  status: 'healthy' | 'degraded' | 'critical';
  issues: string[];
  recommendations: string[];
  score: number; // 0-100
}

class LiveStreamingService {
  private streamConfigs: Map<string, StreamConfig> = new Map();
  private activeStreams: Map<string, StreamMetrics> = new Map();
  private bitrateProfiles: AdaptiveBitrateProfile[] = [];

  constructor() {
    this.initializeBitrateProfiles();
  }

  /**
   * Initialize adaptive bitrate profiles
   */
  private initializeBitrateProfiles(): void {
    this.bitrateProfiles = [
      {
        name: 'Mobile Low',
        bitrate: 500,
        resolution: '360p',
        fps: 24,
        minBandwidth: 0.5,
        maxBandwidth: 1,
      },
      {
        name: 'Mobile',
        bitrate: 1000,
        resolution: '480p',
        fps: 30,
        minBandwidth: 1,
        maxBandwidth: 2,
      },
      {
        name: 'Standard',
        bitrate: 2500,
        resolution: '720p',
        fps: 30,
        minBandwidth: 2,
        maxBandwidth: 4,
      },
      {
        name: 'High',
        bitrate: 5000,
        resolution: '1080p',
        fps: 60,
        minBandwidth: 4,
        maxBandwidth: 8,
      },
      {
        name: '4K',
        bitrate: 15000,
        resolution: '4K',
        fps: 60,
        minBandwidth: 8,
        maxBandwidth: 25,
      },
    ];
  }

  /**
   * Create stream configuration
   */
  createStreamConfig(
    platform: StreamConfig['platform'],
    rtmpUrl: string,
    streamKey: string,
    resolution: StreamConfig['resolution'] = '1080p'
  ): StreamConfig {
    const config: StreamConfig = {
      id: `stream_${Date.now()}_${Math.random()}`,
      platform,
      rtmpUrl,
      streamKey,
      enabled: true,
      bitrate: this.getBitrateForResolution(resolution),
      resolution,
      fps: 60,
      encoder: 'h264',
    };

    this.streamConfigs.set(config.id, config);
    return config;
  }

  /**
   * Get bitrate for resolution
   */
  private getBitrateForResolution(resolution: string): number {
    const profile = this.bitrateProfiles.find((p) => p.resolution === resolution);
    return profile ? profile.bitrate : 2500;
  }

  /**
   * Start stream
   */
  startStream(streamId: string): StreamMetrics {
    const config = this.streamConfigs.get(streamId);
    if (!config) {
      throw new Error(`Stream config not found: ${streamId}`);
    }

    const metrics: StreamMetrics = {
      streamId,
      isLive: true,
      viewers: 0,
      bitrate: config.bitrate,
      fps: config.fps,
      resolution: config.resolution,
      uptime: 0,
      bandwidth: this.calculateBandwidth(config.bitrate),
      droppedFrames: 0,
      audioCodec: 'aac',
      videoCodec: config.encoder,
    };

    this.activeStreams.set(streamId, metrics);

    // Simulate uptime tracking
    this.startUptimeTracking(streamId);

    return metrics;
  }

  /**
   * Stop stream
   */
  stopStream(streamId: string): void {
    this.activeStreams.delete(streamId);
  }

  /**
   * Update stream metrics
   */
  updateStreamMetrics(
    streamId: string,
    updates: Partial<StreamMetrics>
  ): StreamMetrics | null {
    const metrics = this.activeStreams.get(streamId);
    if (!metrics) return null;

    const updated = { ...metrics, ...updates };
    this.activeStreams.set(streamId, updated);
    return updated;
  }

  /**
   * Get stream metrics
   */
  getStreamMetrics(streamId: string): StreamMetrics | null {
    return this.activeStreams.get(streamId) || null;
  }

  /**
   * Get stream health
   */
  getStreamHealth(streamId: string): StreamHealth {
    const metrics = this.activeStreams.get(streamId);
    if (!metrics) {
      return {
        status: 'critical',
        issues: ['Stream not active'],
        recommendations: ['Start the stream'],
        score: 0,
      };
    }

    const issues: string[] = [];
    let score = 100;

    // Check bitrate stability
    if (metrics.bitrate < 1000) {
      issues.push('Low bitrate detected');
      score -= 20;
    }

    // Check frame drops
    if (metrics.droppedFrames > 10) {
      issues.push('High frame drop rate');
      score -= 15;
    }

    // Check FPS
    if (metrics.fps < 24) {
      issues.push('Low frame rate');
      score -= 10;
    }

    // Check viewers
    if (metrics.viewers === 0) {
      issues.push('No active viewers');
      score -= 5;
    }

    const status: StreamHealth['status'] =
      score >= 80 ? 'healthy' : score >= 50 ? 'degraded' : 'critical';

    const recommendations: string[] = [];
    if (metrics.bitrate < 1000) {
      recommendations.push('Increase bitrate for better quality');
    }
    if (metrics.droppedFrames > 10) {
      recommendations.push('Check network connection or reduce encoding quality');
    }
    if (metrics.fps < 30) {
      recommendations.push('Increase frame rate for smoother playback');
    }

    return {
      status,
      issues,
      recommendations,
      score: Math.max(0, score),
    };
  }

  /**
   * Adaptive bitrate adjustment
   */
  adjustAdaptiveBitrate(streamId: string, availableBandwidth: number): StreamConfig | null {
    const config = this.streamConfigs.get(streamId);
    if (!config) return null;

    // Find best profile for available bandwidth
    const bestProfile = this.bitrateProfiles
      .filter((p) => p.maxBandwidth <= availableBandwidth)
      .sort((a, b) => b.bitrate - a.bitrate)[0];

    if (bestProfile) {
      config.bitrate = bestProfile.bitrate;
      config.resolution = bestProfile.resolution as any;
      config.fps = bestProfile.fps;

      // Update active stream metrics
      const metrics = this.activeStreams.get(streamId);
      if (metrics) {
        metrics.bitrate = bestProfile.bitrate;
        metrics.resolution = bestProfile.resolution;
        metrics.fps = bestProfile.fps;
      }
    }

    return config;
  }

  /**
   * Get recommended profile for bandwidth
   */
  getRecommendedProfile(bandwidth: number): AdaptiveBitrateProfile {
    return (
      this.bitrateProfiles.find((p) => p.maxBandwidth >= bandwidth) ||
      this.bitrateProfiles[0]
    );
  }

  /**
   * Calculate bandwidth in Mbps
   */
  private calculateBandwidth(bitrate: number): number {
    return bitrate / 1000;
  }

  /**
   * Start uptime tracking
   */
  private startUptimeTracking(streamId: string): void {
    const interval = setInterval(() => {
      const metrics = this.activeStreams.get(streamId);
      if (metrics) {
        metrics.uptime += 1;
      } else {
        clearInterval(interval);
      }
    }, 1000);
  }

  /**
   * Get all active streams
   */
  getActiveStreams(): StreamMetrics[] {
    return Array.from(this.activeStreams.values());
  }

  /**
   * Get stream configuration
   */
  getStreamConfig(streamId: string): StreamConfig | null {
    return this.streamConfigs.get(streamId) || null;
  }

  /**
   * Update stream configuration
   */
  updateStreamConfig(
    streamId: string,
    updates: Partial<StreamConfig>
  ): StreamConfig | null {
    const config = this.streamConfigs.get(streamId);
    if (!config) return null;

    const updated = { ...config, ...updates };
    this.streamConfigs.set(streamId, updated);
    return updated;
  }

  /**
   * Get bitrate profiles
   */
  getBitrateProfiles(): AdaptiveBitrateProfile[] {
    return this.bitrateProfiles;
  }

  /**
   * Validate RTMP URL
   */
  validateRtmpUrl(url: string): boolean {
    const rtmpRegex = /^rtmps?:\/\/.+$/i;
    return rtmpRegex.test(url);
  }

  /**
   * Generate stream key
   */
  generateStreamKey(): string {
    return `${Math.random().toString(36).substring(2, 15)}${Math.random()
      .toString(36)
      .substring(2, 15)}`;
  }

  /**
   * Get streaming statistics
   */
  getStreamingStatistics(): {
    totalStreams: number;
    activeStreams: number;
    totalViewers: number;
    avgBitrate: number;
    avgUptime: number;
  } {
    const allStreams = Array.from(this.activeStreams.values());
    const totalViewers = allStreams.reduce((sum, s) => sum + s.viewers, 0);
    const avgBitrate =
      allStreams.length > 0
        ? allStreams.reduce((sum, s) => sum + s.bitrate, 0) / allStreams.length
        : 0;
    const avgUptime =
      allStreams.length > 0
        ? allStreams.reduce((sum, s) => sum + s.uptime, 0) / allStreams.length
        : 0;

    return {
      totalStreams: this.streamConfigs.size,
      activeStreams: this.activeStreams.size,
      totalViewers,
      avgBitrate,
      avgUptime,
    };
  }
}

export const liveStreamingService = new LiveStreamingService();
