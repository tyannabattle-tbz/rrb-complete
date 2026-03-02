import { invokeLLM } from './server/_core/llm';

/**
 * Stream Configuration Service
 * Manages real broadcast stream URLs and infrastructure configuration
 */

export interface StreamConfig {
  id: string;
  name: string;
  type: 'radio' | 'podcast' | 'video' | 'commercial';
  streamUrl: string;
  backupUrl?: string;
  protocol: 'hls' | 'dash' | 'rtmp' | 'http' | 'websocket';
  bitrate: number;
  format: 'mp3' | 'aac' | 'opus' | 'h264' | 'h265';
  sampleRate: number;
  channels: number;
  isActive: boolean;
  healthCheckInterval: number;
  lastHealthCheck?: number;
  healthStatus: 'healthy' | 'degraded' | 'offline';
  metadata?: Record<string, any>;
}

export interface BroadcastInfrastructure {
  primaryServer: string;
  backupServer: string;
  cdn: string;
  transcoding: boolean;
  adaptiveBitrate: boolean;
  geoRestriction?: string[];
  encryption: 'none' | 'ssl' | 'tls';
  maxConcurrentStreams: number;
  bandwidth: string;
}

export class StreamConfigurationService {
  private static configs: Map<string, StreamConfig> = new Map();
  private static infrastructure: BroadcastInfrastructure = {
    primaryServer: process.env.RRB_PRIMARY_SERVER || 'stream.rockinrockinboogie.com',
    backupServer: process.env.RRB_BACKUP_SERVER || 'backup.rockinrockinboogie.com',
    cdn: process.env.RRB_CDN || 'cdn.rockinrockinboogie.com',
    transcoding: true,
    adaptiveBitrate: true,
    encryption: 'tls',
    maxConcurrentStreams: 10000,
    bandwidth: 'unlimited',
  };
  private static healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Initialize stream configuration
   */
  static async initialize() {
    console.log('[StreamConfigurationService] Initializing stream configuration...');

    // Load default streams
    await this.loadDefaultStreams();

    // Start health checks
    this.startHealthChecks();

    console.log('[StreamConfigurationService] Stream configuration initialized');
  }

  /**
   * Load default streams
   */
  private static async loadDefaultStreams() {
    const defaultStreams: StreamConfig[] = [
      {
        id: 'rrb-main-radio',
        name: 'RRB Main Radio Stream',
        type: 'radio',
        streamUrl: process.env.RRB_MAIN_STREAM || 'https://stream.rockinrockinboogie.com/live/main',
        backupUrl: process.env.RRB_MAIN_BACKUP || 'https://backup.rockinrockinboogie.com/live/main',
        protocol: 'hls',
        bitrate: 128,
        format: 'aac',
        sampleRate: 44100,
        channels: 2,
        isActive: true,
        healthCheckInterval: 30000,
        healthStatus: 'healthy',
      },
      {
        id: 'rrb-video-stream',
        name: 'RRB Video Stream',
        type: 'video',
        streamUrl: process.env.RRB_VIDEO_STREAM || 'https://stream.rockinrockinboogie.com/live/video',
        protocol: 'dash',
        bitrate: 2500,
        format: 'h264',
        sampleRate: 48000,
        channels: 2,
        isActive: true,
        healthCheckInterval: 30000,
        healthStatus: 'healthy',
      },
      {
        id: 'rrb-podcast-feed',
        name: 'RRB Podcast Feed',
        type: 'podcast',
        streamUrl: process.env.RRB_PODCAST_FEED || 'https://podcasts.rockinrockinboogie.com/feed',
        protocol: 'http',
        bitrate: 64,
        format: 'mp3',
        sampleRate: 44100,
        channels: 2,
        isActive: true,
        healthCheckInterval: 60000,
        healthStatus: 'healthy',
      },
      {
        id: 'rrb-commercials',
        name: 'RRB Commercial Rotation',
        type: 'commercial',
        streamUrl: process.env.RRB_COMMERCIAL_FEED || 'https://ads.rockinrockinboogie.com/rotation',
        protocol: 'http',
        bitrate: 128,
        format: 'aac',
        sampleRate: 44100,
        channels: 2,
        isActive: true,
        healthCheckInterval: 60000,
        healthStatus: 'healthy',
      },
    ];

    for (const stream of defaultStreams) {
      this.configs.set(stream.id, stream);
      console.log(`[StreamConfigurationService] Loaded stream: ${stream.name}`);
    }
  }

  /**
   * Add stream configuration
   */
  static addStream(config: StreamConfig): void {
    this.configs.set(config.id, config);
    console.log(`[StreamConfigurationService] Added stream: ${config.name}`);

    // Start health check for this stream
    this.startHealthCheckForStream(config.id);
  }

  /**
   * Update stream configuration
   */
  static updateStream(id: string, updates: Partial<StreamConfig>): void {
    const existing = this.configs.get(id);
    if (!existing) {
      throw new Error(`Stream ${id} not found`);
    }

    const updated = { ...existing, ...updates };
    this.configs.set(id, updated);
    console.log(`[StreamConfigurationService] Updated stream: ${updated.name}`);
  }

  /**
   * Get stream configuration
   */
  static getStream(id: string): StreamConfig | undefined {
    return this.configs.get(id);
  }

  /**
   * Get all streams
   */
  static getAllStreams(): StreamConfig[] {
    return Array.from(this.configs.values());
  }

  /**
   * Get active streams
   */
  static getActiveStreams(): StreamConfig[] {
    return Array.from(this.configs.values()).filter(s => s.isActive);
  }

  /**
   * Start health checks
   */
  private static startHealthChecks() {
    for (const [id] of this.configs) {
      this.startHealthCheckForStream(id);
    }
    console.log('[StreamConfigurationService] Health checks started');
  }

  /**
   * Start health check for specific stream
   */
  private static startHealthCheckForStream(id: string) {
    const config = this.configs.get(id);
    if (!config) return;

    // Clear existing interval if any
    const existingInterval = this.healthCheckIntervals.get(id);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Start new health check interval
    const interval = setInterval(() => {
      this.performHealthCheck(id);
    }, config.healthCheckInterval);

    this.healthCheckIntervals.set(id, interval);
  }

  /**
   * Perform health check
   */
  private static async performHealthCheck(id: string) {
    const config = this.configs.get(id);
    if (!config) return;

    try {
      const response = await fetch(config.streamUrl, { method: 'HEAD', timeout: 5000 });

      if (response.ok) {
        config.healthStatus = 'healthy';
      } else if (response.status >= 500) {
        config.healthStatus = 'degraded';
      } else {
        config.healthStatus = 'offline';
      }

      config.lastHealthCheck = Date.now();
      console.log(`[StreamConfigurationService] Health check ${id}: ${config.healthStatus}`);
    } catch (error) {
      config.healthStatus = 'offline';
      config.lastHealthCheck = Date.now();
      console.error(`[StreamConfigurationService] Health check failed for ${id}:`, error);

      // Try backup URL if available
      if (config.backupUrl) {
        try {
          const backupResponse = await fetch(config.backupUrl, { method: 'HEAD', timeout: 5000 });
          if (backupResponse.ok) {
            console.log(`[StreamConfigurationService] Backup stream available for ${id}`);
          }
        } catch (backupError) {
          console.error(`[StreamConfigurationService] Backup stream also failed for ${id}`);
        }
      }
    }
  }

  /**
   * Get infrastructure configuration
   */
  static getInfrastructure(): BroadcastInfrastructure {
    return { ...this.infrastructure };
  }

  /**
   * Update infrastructure configuration
   */
  static updateInfrastructure(updates: Partial<BroadcastInfrastructure>): void {
    this.infrastructure = { ...this.infrastructure, ...updates };
    console.log('[StreamConfigurationService] Infrastructure configuration updated');
  }

  /**
   * Get stream health status
   */
  static getHealthStatus(): Record<string, { status: string; lastCheck: number | undefined }> {
    const status: Record<string, { status: string; lastCheck: number | undefined }> = {};

    for (const [id, config] of this.configs) {
      status[id] = {
        status: config.healthStatus,
        lastCheck: config.lastHealthCheck,
      };
    }

    return status;
  }

  /**
   * Validate stream configuration
   */
  static validateStream(config: StreamConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.id) errors.push('Stream ID is required');
    if (!config.name) errors.push('Stream name is required');
    if (!config.streamUrl) errors.push('Stream URL is required');
    if (!config.protocol) errors.push('Protocol is required');
    if (config.bitrate <= 0) errors.push('Bitrate must be greater than 0');
    if (config.sampleRate <= 0) errors.push('Sample rate must be greater than 0');
    if (config.channels <= 0) errors.push('Channels must be greater than 0');

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Shutdown service
   */
  static shutdown() {
    for (const interval of this.healthCheckIntervals.values()) {
      clearInterval(interval);
    }
    this.healthCheckIntervals.clear();
    console.log('[StreamConfigurationService] Stream configuration service shutdown');
  }
}

/**
 * Initialize stream configuration service
 */
export async function initializeStreamConfiguration() {
  await StreamConfigurationService.initialize();
  return StreamConfigurationService;
}
