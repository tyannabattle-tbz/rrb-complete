/**
 * Streaming Infrastructure Service
 * 
 * Manages real-time audio streaming for RRB Radio:
 * - 7 independent audio streams (one per channel)
 * - HLS (HTTP Live Streaming) for adaptive bitrate
 * - WebSocket connections for real-time listeners
 * - Stream health monitoring and failover
 * - Listener analytics and engagement tracking
 */

export type ChannelId = 'legacy_restored' | 'healing_frequencies' | 'proof_vault' | 'qmunity' | 'sweet_miracles' | 'music_radio' | 'studio_sessions';

export interface StreamConfig {
  channelId: ChannelId;
  name: string;
  description: string;
  bitrates: number[];        // Available bitrates in kbps (e.g., [128, 192, 256])
  defaultBitrate: number;    // Default bitrate in kbps
  codec: 'mp3' | 'aac' | 'opus';
  frequency?: number;        // Default frequency in Hz (e.g., 432)
  isLive: boolean;
  autoplay: boolean;
}

export interface StreamHealth {
  channelId: ChannelId;
  isHealthy: boolean;
  uptime: number;            // Seconds
  activeListeners: number;
  bitrate: number;
  latency: number;           // Milliseconds
  errorCount: number;
  lastError?: string;
  lastErrorTime?: number;
}

export interface ListenerConnection {
  id: string;
  channelId: ChannelId;
  userId?: string;
  ip: string;
  userAgent: string;
  bitrate: number;
  connectedAt: number;
  lastHeartbeat: number;
  bytesReceived: number;
}

export interface StreamSegment {
  id: string;
  channelId: ChannelId;
  contentId: string;         // Commercial, episode, song, etc.
  contentType: string;
  startTime: number;
  endTime: number;
  duration: number;
  audioUrl: string;          // S3 URL to the audio file
  bitrates: Record<number, string>; // Bitrate -> HLS URL mapping
  status: 'queued' | 'streaming' | 'completed' | 'failed';
}

export interface StreamMetrics {
  channelId: ChannelId;
  totalListeners: number;
  peakListeners: number;
  averageBitrate: number;
  totalBytesStreamed: number;
  uptime: number;
  errorRate: number;
  averageLatency: number;
}

/**
 * Streaming Infrastructure Manager
 */
export class StreamingInfrastructure {
  private channels: Map<ChannelId, StreamConfig> = new Map();
  private health: Map<ChannelId, StreamHealth> = new Map();
  private listeners: Map<string, ListenerConnection> = new Map();
  private segments: Map<ChannelId, StreamSegment[]> = new Map();
  private metrics: Map<ChannelId, StreamMetrics> = new Map();

  constructor() {
    this.initializeChannels();
    this.startHealthMonitoring();
  }

  /**
   * Initialize all 7 RRB Radio channels
   */
  private initializeChannels() {
    const channelConfigs: Record<ChannelId, StreamConfig> = {
      'legacy_restored': {
        channelId: 'legacy_restored',
        name: 'Legacy Restored',
        description: 'Classic funk, soul, R&B, and the legacy of Seabrun Candy Hunter',
        bitrates: [128, 192, 256],
        defaultBitrate: 192,
        codec: 'mp3',
        frequency: 432,
        isLive: true,
        autoplay: true,
      },
      'healing_frequencies': {
        channelId: 'healing_frequencies',
        name: 'Healing Frequencies',
        description: 'Solfeggio sound therapy and meditation frequencies',
        bitrates: [128, 192],
        defaultBitrate: 128,
        codec: 'aac',
        frequency: 528,
        isLive: true,
        autoplay: false,
      },
      'proof_vault': {
        channelId: 'proof_vault',
        name: 'Proof Vault',
        description: 'Documentary, archival content, and historical narratives',
        bitrates: [128, 192, 256],
        defaultBitrate: 192,
        codec: 'mp3',
        isLive: false,
        autoplay: false,
      },
      'qmunity': {
        channelId: 'qmunity',
        name: 'QMunity',
        description: 'Community discussions, call-ins, and listener engagement',
        bitrates: [128, 192, 256],
        defaultBitrate: 192,
        codec: 'mp3',
        isLive: true,
        autoplay: false,
      },
      'sweet_miracles': {
        channelId: 'sweet_miracles',
        name: 'Sweet Miracles',
        description: 'Inspirational content, fundraising, and community support',
        bitrates: [128, 192],
        defaultBitrate: 128,
        codec: 'aac',
        isLive: true,
        autoplay: false,
      },
      'music_radio': {
        channelId: 'music_radio',
        name: 'Music & Radio',
        description: 'Curated music, live performances, and radio broadcasts',
        bitrates: [192, 256, 320],
        defaultBitrate: 256,
        codec: 'mp3',
        frequency: 432,
        isLive: true,
        autoplay: true,
      },
      'studio_sessions': {
        channelId: 'studio_sessions',
        name: 'Studio Sessions',
        description: 'Live studio recordings, artist interviews, and production sessions',
        bitrates: [192, 256, 320],
        defaultBitrate: 256,
        codec: 'mp3',
        isLive: true,
        autoplay: false,
      },
    };

    for (const [channelId, config] of Object.entries(channelConfigs)) {
      this.channels.set(channelId as ChannelId, config);
      this.health.set(channelId as ChannelId, {
        channelId: channelId as ChannelId,
        isHealthy: true,
        uptime: 0,
        activeListeners: 0,
        bitrate: config.defaultBitrate,
        latency: 0,
        errorCount: 0,
      });
      this.segments.set(channelId as ChannelId, []);
      this.metrics.set(channelId as ChannelId, {
        channelId: channelId as ChannelId,
        totalListeners: 0,
        peakListeners: 0,
        averageBitrate: config.defaultBitrate,
        totalBytesStreamed: 0,
        uptime: 0,
        errorRate: 0,
        averageLatency: 0,
      });
    }

    console.log(`[StreamingInfrastructure] Initialized ${this.channels.size} channels`);
  }

  /**
   * Start health monitoring for all channels
   */
  private startHealthMonitoring() {
    // Monitor every 30 seconds
    setInterval(() => {
      for (const [channelId, health] of this.health.entries()) {
        health.uptime += 30;
        health.activeListeners = Array.from(this.listeners.values()).filter(
          l => l.channelId === channelId
        ).length;

        // Update metrics
        const metrics = this.metrics.get(channelId);
        if (metrics) {
          metrics.uptime = health.uptime;
          metrics.totalListeners += health.activeListeners;
          if (health.activeListeners > metrics.peakListeners) {
            metrics.peakListeners = health.activeListeners;
          }
        }
      }
    }, 30000);
  }

  /**
   * Get channel configuration
   */
  getChannelConfig(channelId: ChannelId): StreamConfig | undefined {
    return this.channels.get(channelId);
  }

  /**
   * Get all channel configurations
   */
  getAllChannels(): StreamConfig[] {
    return Array.from(this.channels.values());
  }

  /**
   * Get channel health status
   */
  getChannelHealth(channelId: ChannelId): StreamHealth | undefined {
    return this.health.get(channelId);
  }

  /**
   * Get all channel health statuses
   */
  getAllChannelHealth(): StreamHealth[] {
    return Array.from(this.health.values());
  }

  /**
   * Register a listener connection
   */
  registerListener(
    channelId: ChannelId,
    ip: string,
    userAgent: string,
    bitrate: number,
    userId?: string
  ): string {
    const connectionId = `listener_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    const connection: ListenerConnection = {
      id: connectionId,
      channelId,
      userId,
      ip,
      userAgent,
      bitrate,
      connectedAt: Date.now(),
      lastHeartbeat: Date.now(),
      bytesReceived: 0,
    };

    this.listeners.set(connectionId, connection);
    console.log(`[StreamingInfrastructure] Listener connected: ${connectionId} on ${channelId}`);
    return connectionId;
  }

  /**
   * Unregister a listener connection
   */
  unregisterListener(connectionId: string) {
    this.listeners.delete(connectionId);
    console.log(`[StreamingInfrastructure] Listener disconnected: ${connectionId}`);
  }

  /**
   * Update listener heartbeat
   */
  updateListenerHeartbeat(connectionId: string, bytesReceived: number) {
    const listener = this.listeners.get(connectionId);
    if (listener) {
      listener.lastHeartbeat = Date.now();
      listener.bytesReceived += bytesReceived;
    }
  }

  /**
   * Get active listeners for a channel
   */
  getChannelListeners(channelId: ChannelId): ListenerConnection[] {
    return Array.from(this.listeners.values()).filter(l => l.channelId === channelId);
  }

  /**
   * Add a stream segment to the queue
   */
  addSegment(segment: StreamSegment) {
    const segments = this.segments.get(segment.channelId);
    if (segments) {
      segments.push(segment);
      segments.sort((a, b) => a.startTime - b.startTime);
    }
  }

  /**
   * Get current segment for a channel
   */
  getCurrentSegment(channelId: ChannelId): StreamSegment | undefined {
    const segments = this.segments.get(channelId);
    if (!segments) return undefined;

    const now = Date.now();
    return segments.find(s => s.startTime <= now && s.endTime > now);
  }

  /**
   * Get next segment for a channel
   */
  getNextSegment(channelId: ChannelId): StreamSegment | undefined {
    const segments = this.segments.get(channelId);
    if (!segments) return undefined;

    const now = Date.now();
    return segments.find(s => s.startTime > now);
  }

  /**
   * Get upcoming segments for a channel
   */
  getUpcomingSegments(channelId: ChannelId, count: number = 5): StreamSegment[] {
    const segments = this.segments.get(channelId);
    if (!segments) return [];

    const now = Date.now();
    return segments.filter(s => s.startTime > now).slice(0, count);
  }

  /**
   * Get channel metrics
   */
  getChannelMetrics(channelId: ChannelId): StreamMetrics | undefined {
    return this.metrics.get(channelId);
  }

  /**
   * Get all channel metrics
   */
  getAllMetrics(): StreamMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Report a stream error
   */
  reportError(channelId: ChannelId, error: string) {
    const health = this.health.get(channelId);
    if (health) {
      health.errorCount++;
      health.lastError = error;
      health.lastErrorTime = Date.now();
      health.isHealthy = health.errorCount < 5; // Mark unhealthy after 5 errors
    }
  }

  /**
   * Reset channel health
   */
  resetChannelHealth(channelId: ChannelId) {
    const health = this.health.get(channelId);
    if (health) {
      health.errorCount = 0;
      health.isHealthy = true;
      health.lastError = undefined;
      health.lastErrorTime = undefined;
    }
  }

  /**
   * Get HLS manifest URL for a channel at a specific bitrate
   */
  getHLSManifestUrl(channelId: ChannelId, bitrate: number): string {
    const config = this.channels.get(channelId);
    if (!config) throw new Error(`Channel not found: ${channelId}`);

    if (!config.bitrates.includes(bitrate)) {
      throw new Error(`Bitrate ${bitrate} not available for channel ${channelId}`);
    }

    return `/api/stream/hls/${channelId}/${bitrate}/manifest.m3u8`;
  }

  /**
   * Get WebSocket URL for a channel
   */
  getWebSocketUrl(channelId: ChannelId): string {
    return `wss://${process.env.VITE_APP_DOMAIN || 'localhost:3000'}/api/stream/ws/${channelId}`;
  }

  /**
   * Export streaming infrastructure state
   */
  exportState() {
    return {
      channels: Array.from(this.channels.values()),
      health: Array.from(this.health.values()),
      activeListeners: this.listeners.size,
      metrics: Array.from(this.metrics.values()),
      exportedAt: Date.now(),
    };
  }
}

// Singleton instance
let infrastructureInstance: StreamingInfrastructure | null = null;

export function getStreamingInfrastructure(): StreamingInfrastructure {
  if (!infrastructureInstance) {
    infrastructureInstance = new StreamingInfrastructure();
  }
  return infrastructureInstance;
}
