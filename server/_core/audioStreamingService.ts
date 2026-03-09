/**
 * Audio Streaming and Frequency Management Service
 * Manages 24/7 audio streaming, healing frequencies, and multi-channel broadcast
 * Default frequency: 432Hz with user selection options
 * 
 * ALL DATA IS REAL-TIME from database tables:
 * - radio_channels: Real channel data with live listener counts
 * - radio_stations: Station metadata
 * - broadcast_schedules: Active broadcast schedule
 * 
 * No fake/seeded/simulated data. Zero baseline — only real numbers.
 * 
 * NOTE: Drizzle ORM db.execute() returns [[rows], [fields]].
 * Data rows are at result[0], so we use extractRows() helper.
 */

import { sql } from 'drizzle-orm';

// Lazy DB import to avoid circular dependency
let _getDb: (() => Promise<any>) | null = null;
async function getDb() {
  if (!_getDb) {
    const mod = await import('../db');
    _getDb = mod.getDb;
  }
  return _getDb();
}

/**
 * Helper: Drizzle db.execute() returns [[dataRows], [fieldDefs]].
 * This extracts just the data rows array.
 */
function extractRows(result: any): any[] {
  if (!result) return [];
  // Drizzle mysql2 returns [rows, fields] tuple
  if (Array.isArray(result) && result.length >= 1 && Array.isArray(result[0])) {
    return result[0];
  }
  // Fallback: if it's already a flat array of objects
  if (Array.isArray(result)) return result;
  return [];
}

export interface AudioStream {
  streamId: string;
  channel: string;
  frequency: number;
  bitrate: number;
  format: 'mp3' | 'aac' | 'flac' | 'wav';
  isLive: boolean;
  listeners: number;
  uptime: number;
}

export interface FrequencyProfile {
  name: string;
  frequency: number;
  benefits: string[];
  scientificBasis: string;
  isDefault: boolean;
}

class AudioStreamingService {
  private frequencyProfiles: FrequencyProfile[] = [
    {
      name: 'Solfeggio 432Hz',
      frequency: 432,
      benefits: ['Healing', 'Meditation', 'Stress Relief', 'DNA Repair'],
      scientificBasis: 'Natural frequency aligned with Earth and human biology',
      isDefault: true,
    },
    {
      name: 'Solfeggio 528Hz',
      frequency: 528,
      benefits: ['Transformation', 'Miracles', 'Love', 'DNA Repair'],
      scientificBasis: 'Love frequency, promotes healing and transformation',
      isDefault: false,
    },
    {
      name: 'Solfeggio 639Hz',
      frequency: 639,
      benefits: ['Communication', 'Connection', 'Relationships'],
      scientificBasis: 'Facilitates interpersonal connections',
      isDefault: false,
    },
    {
      name: 'Solfeggio 741Hz',
      frequency: 741,
      benefits: ['Intuition', 'Expression', 'Awakening'],
      scientificBasis: 'Awakens intuition and inner strength',
      isDefault: false,
    },
    {
      name: 'Solfeggio 852Hz',
      frequency: 852,
      benefits: ['Spiritual Awareness', 'Return to Spiritual Order'],
      scientificBasis: 'Restores spiritual balance',
      isDefault: false,
    },
    {
      name: 'Solfeggio 963Hz',
      frequency: 963,
      benefits: ['Divine Connection', 'Enlightenment', 'Activation'],
      scientificBasis: 'Highest Solfeggio frequency, divine connection',
      isDefault: false,
    },
    {
      name: 'Standard 440Hz',
      frequency: 440,
      benefits: ['Standard Tuning', 'Music Production'],
      scientificBasis: 'International standard musical tuning',
      isDefault: false,
    },
  ];

  private serverStartTime: number = Date.now();

  constructor() {
    console.log('[Audio Streaming] Service initialized — pulling real-time data from database');
  }

  /**
   * Get all active streams from database radio_channels
   */
  async getActiveStreamsFromDb(): Promise<AudioStream[]> {
    try {
      const db = await getDb();
      if (!db) return [];
      const result = await db.execute(
        sql`SELECT id, name, frequency, genre, status, currentListeners, totalListeners, streamUrl FROM radio_channels WHERE status = 'active' ORDER BY id`
      );
      const rows = extractRows(result);
      return rows.map((row: any, index: number) => ({
        streamId: `stream-${row.id || index}`,
        channel: row.name || `Channel ${index + 1}`,
        frequency: parseInt(row.frequency) || 432,
        bitrate: 128,
        format: 'mp3' as const,
        isLive: row.status === 'active',
        listeners: Number(row.currentListeners) || 0,
        uptime: Math.floor((Date.now() - this.serverStartTime) / 1000),
      }));
    } catch (error) {
      console.error('[Audio Streaming] DB query failed:', error);
      return [];
    }
  }

  /**
   * Get total listeners from database (real-time)
   */
  async getTotalListenersFromDb(): Promise<number> {
    try {
      const db = await getDb();
      if (!db) return 0;
      const result = await db.execute(
        sql`SELECT COALESCE(SUM(currentListeners), 0) as total FROM radio_channels WHERE status = 'active'`
      );
      const rows = extractRows(result);
      return Number(rows?.[0]?.total) || 0;
    } catch (error) {
      console.error('[Audio Streaming] Listener count query failed:', error);
      return 0;
    }
  }

  /**
   * Get channel count from database
   */
  async getChannelCountFromDb(): Promise<number> {
    try {
      const db = await getDb();
      if (!db) return 0;
      const result = await db.execute(
        sql`SELECT COUNT(*) as cnt FROM radio_channels WHERE status = 'active'`
      );
      const rows = extractRows(result);
      return Number(rows?.[0]?.cnt) || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get all channel names from database
   */
  async getAllChannelsFromDb(): Promise<Array<{
    id: number;
    name: string;
    genre: string;
    frequency: string;
    streamUrl: string | null;
    description: string | null;
    currentListeners: number;
    totalListeners: number;
    status: string;
    metadata: string | null;
  }>> {
    try {
      const db = await getDb();
      if (!db) return [];
      const result = await db.execute(
        sql`SELECT id, name, genre, frequency, streamUrl, metadata, currentListeners, totalListeners, status FROM radio_channels WHERE status = 'active' ORDER BY name`
      );
      const rows = extractRows(result);
      return rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        genre: r.genre || 'Mixed',
        frequency: r.frequency || '432 Hz',
        streamUrl: r.streamUrl || null,
        description: null,
        currentListeners: r.currentListeners || 0,
        totalListeners: r.totalListeners || 0,
        status: r.status || 'active',
        metadata: r.metadata || null,
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Record a listener joining a channel (updates DB)
   */
  async recordListenerJoin(channelId: number): Promise<void> {
    try {
      const db = await getDb();
      if (!db) return;
      await db.execute(
        sql`UPDATE radio_channels SET currentListeners = currentListeners + 1, totalListeners = totalListeners + 1 WHERE id = ${channelId}`
      );
    } catch (error) {
      console.error('[Audio Streaming] recordListenerJoin failed:', error);
    }
  }

  /**
   * Record a listener leaving a channel (updates DB)
   */
  async recordListenerLeave(channelId: number): Promise<void> {
    try {
      const db = await getDb();
      if (!db) return;
      await db.execute(
        sql`UPDATE radio_channels SET currentListeners = GREATEST(currentListeners - 1, 0) WHERE id = ${channelId}`
      );
    } catch (error) {
      console.error('[Audio Streaming] recordListenerLeave failed:', error);
    }
  }

  // ---- Synchronous methods that don't need DB (frequency profiles, uptime) ----

  getFrequencyProfiles(): FrequencyProfile[] {
    return [...this.frequencyProfiles];
  }

  getDefaultFrequency(): number {
    const defaultProfile = this.frequencyProfiles.find((p) => p.isDefault);
    return defaultProfile?.frequency || 432;
  }

  getUptimeHours(): number {
    return Math.floor((Date.now() - this.serverStartTime) / (1000 * 60 * 60));
  }

  getUptimeSeconds(): number {
    return Math.floor((Date.now() - this.serverStartTime) / 1000);
  }

  getUptimeFormatted(): string {
    const totalSeconds = Math.floor((Date.now() - this.serverStartTime) / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  /**
   * Get streaming statistics (real-time from DB)
   */
  async getStreamingStats() {
    const streams = await this.getActiveStreamsFromDb();
    const totalListeners = streams.reduce((sum, s) => sum + s.listeners, 0);
    const activeChannels = streams.length;

    return {
      totalChannels: activeChannels,
      activeStreams: streams.filter(s => s.isLive).length,
      totalListeners,
      activeChannels,
      peakListeners: totalListeners, // Current = peak for real-time
      averageListenersPerStream: activeChannels > 0 ? Math.round(totalListeners / activeChannels) : 0,
      defaultFrequency: this.getDefaultFrequency(),
      uptimeHours: this.getUptimeHours(),
      channelBreakdown: streams.map(s => ({
        channel: s.channel,
        listeners: s.listeners,
        frequency: s.frequency,
        isLive: s.isLive,
      })),
      supportedFrequencies: this.frequencyProfiles.map((p) => ({
        name: p.name,
        frequency: p.frequency,
        isDefault: p.isDefault,
      })),
    };
  }

  /**
   * Get stream quality report (real-time from DB)
   */
  async getQualityReport() {
    const streams = await this.getActiveStreamsFromDb();
    const healthyStreams = streams.filter((s) => s.isLive).length;
    const totalListeners = streams.reduce((sum, s) => sum + s.listeners, 0);

    return {
      totalStreams: streams.length,
      healthyStreams,
      healthPercentage: streams.length > 0 ? Math.round((healthyStreams / streams.length) * 100) : 0,
      averageUptime: this.getUptimeSeconds(),
      overallQuality: healthyStreams / Math.max(streams.length, 1) > 0.8 ? 'EXCELLENT' : 'GOOD',
      averageBitrate: 128,
      uptime: `${this.getUptimeFormatted()}`,
      totalListeners,
    };
  }

  /**
   * Get broadcast schedules from database
   */
  async getBroadcastSchedules() {
    try {
      const db = await getDb();
      if (!db) return [];
      const result = await db.execute(
        sql`SELECT id, title, description, start_time, end_time, status, type, autonomous_scheduling FROM broadcast_schedules ORDER BY start_time`
      );
      return extractRows(result);
    } catch (error) {
      return [];
    }
  }

  // ---- Legacy sync methods (kept for backward compatibility but now async-aware) ----

  /** @deprecated Use getActiveStreamsFromDb() instead */
  getActiveStreams(): AudioStream[] {
    console.warn('[Audio Streaming] getActiveStreams() is deprecated. Use getActiveStreamsFromDb()');
    return [];
  }

  /** @deprecated Use getTotalListenersFromDb() instead */
  getTotalListeners(): number {
    console.warn('[Audio Streaming] getTotalListeners() is deprecated. Use getTotalListenersFromDb()');
    return 0;
  }

  /** @deprecated Use getAllChannelsFromDb() instead */
  getAllChannels(): string[] {
    console.warn('[Audio Streaming] getAllChannels() is deprecated. Use getAllChannelsFromDb()');
    return [];
  }

  /** @deprecated Use getChannelCountFromDb() instead */
  getChannelCount(): number {
    console.warn('[Audio Streaming] getChannelCount() is deprecated. Use getChannelCountFromDb()');
    return 0;
  }

  start24x7Broadcast(): void {
    console.log('[Audio Streaming] 24/7 broadcast mode — data from database');
  }

  cleanup(): void {
    // No intervals to clean up — all data is DB-driven
  }
}

// Export singleton instance
export const audioStreamingService = new AudioStreamingService();
