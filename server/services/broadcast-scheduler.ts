/**
 * Broadcast Scheduler — 24/7 Content & Commercial Rotation
 * 
 * Manages the complete broadcast schedule for RRB Radio:
 * - 7 channels, 24/7 streaming
 * - Commercial rotation with frequency and priority
 * - Content scheduling (episodes, songs, podcasts)
 * - QUMUS autonomous decision-making
 * - Real-time schedule updates
 */

export type ChannelId = 'legacy_restored' | 'healing_frequencies' | 'proof_vault' | 'qmunity' | 'sweet_miracles' | 'music_radio' | 'studio_sessions';

export type ContentType = 'commercial' | 'episode' | 'song' | 'podcast' | 'live_call' | 'station_id' | 'jingle';

export interface ScheduleEntry {
  id: string;
  channelId: ChannelId;
  contentType: ContentType;
  contentId: string;           // ID of the commercial, episode, song, etc.
  title: string;
  startTime: number;           // Unix timestamp
  endTime: number;             // Unix timestamp
  duration: number;            // Seconds
  priority: number;            // 1-10, higher = more important
  isLive: boolean;             // Is this live content?
  status: 'scheduled' | 'playing' | 'completed' | 'skipped' | 'error';
  createdAt: number;
  updatedAt: number;
}

export interface BroadcastWindow {
  channelId: ChannelId;
  startTime: number;
  endTime: number;
  entries: ScheduleEntry[];
  totalDuration: number;
}

export interface CommercialRotationRule {
  id: string;
  commercialId: string;
  channels: ChannelId[];       // Which channels to play on
  frequency: number;           // Times per hour
  priority: number;            // 1-10
  dayOfWeek?: number[];        // 0=Sun, 1=Mon, etc. (undefined = all days)
  hourStart?: number;          // 0-23 (undefined = all hours)
  hourEnd?: number;            // 0-23
  maxPlaysPerDay?: number;
  minGapBetweenPlays?: number; // Minimum seconds between plays
  isActive: boolean;
}

export interface BroadcastStats {
  channelId: ChannelId;
  totalEntriesScheduled: number;
  totalDuration: number;
  commercialCount: number;
  contentCount: number;
  averageEntryDuration: number;
  nextUpcoming: ScheduleEntry | null;
  lastPlayed: ScheduleEntry | null;
}

/**
 * Broadcast Scheduler — manages all content and commercial scheduling
 */
export class BroadcastScheduler {
  private schedule: ScheduleEntry[] = [];
  private commercialRules: CommercialRotationRule[] = [];
  private channels: ChannelId[] = [
    'legacy_restored',
    'healing_frequencies',
    'proof_vault',
    'qmunity',
    'sweet_miracles',
    'music_radio',
    'studio_sessions',
  ];

  constructor() {
    this.initializeDefaultSchedule();
  }

  /**
   * Initialize default 24-hour schedule for all 7 channels
   */
  private initializeDefaultSchedule() {
    const now = Date.now();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);

    // Create a 24-hour rotating schedule for each channel
    for (const channelId of this.channels) {
      this.createChannelDaySchedule(channelId, dayStart.getTime());
    }

    console.log(`[BroadcastScheduler] Initialized 24-hour schedule for ${this.channels.length} channels`);
  }

  /**
   * Create a full day's schedule for a single channel
   * Includes content blocks and commercial breaks
   */
  private createChannelDaySchedule(channelId: ChannelId, dayStartTime: number) {
    const HOUR_MS = 3600000;
    const BLOCK_DURATION = 30 * 60 * 1000; // 30-minute content blocks
    const COMMERCIAL_BREAK_DURATION = 2 * 60 * 1000; // 2-minute commercial breaks

    let currentTime = dayStartTime;
    const dayEndTime = dayStartTime + 24 * HOUR_MS;

    let blockCount = 0;
    while (currentTime < dayEndTime) {
      // Content block (30 minutes)
      const blockEndTime = currentTime + BLOCK_DURATION;
      this.schedule.push({
        id: `entry_${channelId}_${blockCount}_content`,
        channelId,
        contentType: 'episode',
        contentId: `content_${channelId}_${blockCount}`,
        title: `${channelId} — Content Block ${blockCount + 1}`,
        startTime: currentTime,
        endTime: blockEndTime,
        duration: BLOCK_DURATION / 1000,
        priority: 8,
        isLive: false,
        status: 'scheduled',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      currentTime = blockEndTime;

      // Commercial break (2 minutes)
      const breakEndTime = currentTime + COMMERCIAL_BREAK_DURATION;
      this.schedule.push({
        id: `entry_${channelId}_${blockCount}_commercial`,
        channelId,
        contentType: 'commercial',
        contentId: `commercial_rotation_${blockCount}`,
        title: `Commercial Break — ${channelId}`,
        startTime: currentTime,
        endTime: breakEndTime,
        duration: COMMERCIAL_BREAK_DURATION / 1000,
        priority: 7,
        isLive: false,
        status: 'scheduled',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      currentTime = breakEndTime;
      blockCount++;
    }
  }

  /**
   * Add a commercial rotation rule
   */
  addCommercialRule(rule: CommercialRotationRule) {
    this.commercialRules.push(rule);
    console.log(`[BroadcastScheduler] Added commercial rule: ${rule.commercialId}`);
  }

  /**
   * Get the next scheduled entry for a channel
   */
  getNextEntry(channelId: ChannelId): ScheduleEntry | null {
    const now = Date.now();
    const upcoming = this.schedule
      .filter(entry => entry.channelId === channelId && entry.startTime > now)
      .sort((a, b) => a.startTime - b.startTime);

    return upcoming[0] || null;
  }

  /**
   * Get currently playing entry for a channel
   */
  getCurrentEntry(channelId: ChannelId): ScheduleEntry | null {
    const now = Date.now();
    const current = this.schedule.find(
      entry =>
        entry.channelId === channelId &&
        entry.startTime <= now &&
        entry.endTime > now &&
        entry.status === 'playing'
    );

    return current || null;
  }

  /**
   * Get schedule for a time window
   */
  getScheduleWindow(channelId: ChannelId, startTime: number, endTime: number): BroadcastWindow {
    const entries = this.schedule.filter(
      entry =>
        entry.channelId === channelId &&
        entry.startTime >= startTime &&
        entry.startTime < endTime
    );

    const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0);

    return {
      channelId,
      startTime,
      endTime,
      entries: entries.sort((a, b) => a.startTime - b.startTime),
      totalDuration,
    };
  }

  /**
   * Get statistics for a channel
   */
  getChannelStats(channelId: ChannelId): BroadcastStats {
    const entries = this.schedule.filter(entry => entry.channelId === channelId);
    const commercials = entries.filter(entry => entry.contentType === 'commercial');
    const content = entries.filter(entry => entry.contentType !== 'commercial');
    const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0);

    const now = Date.now();
    const nextUpcoming = entries.find(entry => entry.startTime > now) || null;
    const lastPlayed = [...entries].reverse().find(entry => entry.endTime <= now) || null;

    return {
      channelId,
      totalEntriesScheduled: entries.length,
      totalDuration,
      commercialCount: commercials.length,
      contentCount: content.length,
      averageEntryDuration: entries.length > 0 ? totalDuration / entries.length : 0,
      nextUpcoming,
      lastPlayed,
    };
  }

  /**
   * Get all channel statistics
   */
  getAllChannelStats(): BroadcastStats[] {
    return this.channels.map(channelId => this.getChannelStats(channelId));
  }

  /**
   * Mark an entry as played
   */
  markAsPlayed(entryId: string) {
    const entry = this.schedule.find(e => e.id === entryId);
    if (entry) {
      entry.status = 'completed';
      entry.updatedAt = Date.now();
    }
  }

  /**
   * Update entry status
   */
  updateEntryStatus(entryId: string, status: ScheduleEntry['status']) {
    const entry = this.schedule.find(e => e.id === entryId);
    if (entry) {
      entry.status = status;
      entry.updatedAt = Date.now();
    }
  }

  /**
   * Get all commercial rules
   */
  getCommercialRules(): CommercialRotationRule[] {
    return this.commercialRules;
  }

  /**
   * Get active commercial rules for a channel
   */
  getActiveRulesForChannel(channelId: ChannelId): CommercialRotationRule[] {
    return this.commercialRules.filter(
      rule => rule.isActive && rule.channels.includes(channelId)
    );
  }

  /**
   * Calculate next commercial break time for a channel
   */
  getNextCommercialBreak(channelId: ChannelId): ScheduleEntry | null {
    const now = Date.now();
    const commercialBreaks = this.schedule
      .filter(
        entry =>
          entry.channelId === channelId &&
          entry.contentType === 'commercial' &&
          entry.startTime > now
      )
      .sort((a, b) => a.startTime - b.startTime);

    return commercialBreaks[0] || null;
  }

  /**
   * Get all entries for a channel in the next 24 hours
   */
  getNext24Hours(channelId: ChannelId): ScheduleEntry[] {
    const now = Date.now();
    const tomorrow = now + 24 * 60 * 60 * 1000;

    return this.schedule
      .filter(
        entry =>
          entry.channelId === channelId &&
          entry.startTime >= now &&
          entry.startTime < tomorrow
      )
      .sort((a, b) => a.startTime - b.startTime);
  }

  /**
   * Export schedule as JSON for persistence
   */
  exportSchedule() {
    return {
      schedule: this.schedule,
      commercialRules: this.commercialRules,
      exportedAt: Date.now(),
    };
  }

  /**
   * Import schedule from JSON
   */
  importSchedule(data: { schedule: ScheduleEntry[]; commercialRules: CommercialRotationRule[] }) {
    this.schedule = data.schedule;
    this.commercialRules = data.commercialRules;
    console.log(`[BroadcastScheduler] Imported schedule with ${this.schedule.length} entries`);
  }
}

// Singleton instance
let schedulerInstance: BroadcastScheduler | null = null;

export function getBroadcastScheduler(): BroadcastScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new BroadcastScheduler();
  }
  return schedulerInstance;
}
