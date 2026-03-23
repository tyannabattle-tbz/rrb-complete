import { tyOSStatusFeed } from './tyOSStatusFeed';

/**
 * QUMUS Content Scheduler
 * Manages 24/7 airwave population across all 54 RRB Radio channels
 * Schedules podcasts, music, commercials, and content automatically
 */

export interface ScheduledContent {
  id: string;
  title: string;
  type: 'podcast' | 'music' | 'commercial' | 'news' | 'talk' | 'educational';
  duration: number; // in minutes
  channels: number[]; // which channels to broadcast on
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
  frequency: string; // 'once' | 'daily' | 'weekly' | 'monthly'
  priority: 'low' | 'normal' | 'high' | 'critical';
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  metadata?: any;
}

export interface BroadcastSlot {
  channelId: number;
  startTime: number;
  endTime: number;
  content: ScheduledContent;
}

export class QUMUSContentScheduler {
  private scheduledContent: Map<string, ScheduledContent> = new Map();
  private broadcastSchedule: Map<number, BroadcastSlot[]> = new Map(); // channel -> slots
  private contentLibrary: Map<string, any> = new Map();
  private schedulerInterval: NodeJS.Timeout | null = null;
  private totalChannels = 54;
  private hoursPerDay = 24;
  private minutesPerHour = 60;

  constructor() {
    this.initializeScheduler();
  }

  private initializeScheduler() {
    console.log('[QUMUS Content Scheduler] Initialized - 54 channels ready for 24/7 scheduling');

    // Initialize broadcast schedule for all channels
    for (let i = 1; i <= this.totalChannels; i++) {
      this.broadcastSchedule.set(i, []);
    }

    // Initialize content library with default content types
    this.initializeContentLibrary();

    // Start scheduler loop
    this.startSchedulerLoop();
  }

  /**
   * Initialize content library with default content
   */
  private initializeContentLibrary() {
    // Add default content types
    const defaultContent = [
      { id: 'pod_morning', title: 'Morning Drive', type: 'podcast', duration: 120 },
      { id: 'pod_midday', title: 'Midday Mix', type: 'podcast', duration: 90 },
      { id: 'pod_evening', title: 'Evening Edition', type: 'podcast', duration: 120 },
      { id: 'pod_night', title: 'Night Owl', type: 'podcast', duration: 180 },
      { id: 'music_432hz', title: '432 Hz Healing', type: 'music', duration: 60 },
      { id: 'music_solfeggio', title: 'Solfeggio Frequencies', type: 'music', duration: 60 },
      { id: 'news_hourly', title: 'Hourly News', type: 'news', duration: 15 },
      { id: 'talk_roundtable', title: 'Roundtable Discussion', type: 'talk', duration: 90 },
      { id: 'edu_wellness', title: 'Wellness Education', type: 'educational', duration: 45 },
      { id: 'commercial_canryn', title: 'Canryn Productions', type: 'commercial', duration: 30 },
    ];

    defaultContent.forEach((content) => {
      this.contentLibrary.set(content.id, content);
    });

    console.log(`[QUMUS Content Scheduler] Loaded ${defaultContent.length} default content items`);
  }

  /**
   * Start scheduler loop
   */
  private startSchedulerLoop() {
    this.schedulerInterval = setInterval(() => {
      this.updateSchedule();
    }, 60000); // Update every minute
  }

  /**
   * Update schedule and check for content to broadcast
   */
  private async updateSchedule() {
    const now = Date.now();

    // Check all scheduled content
    for (const [contentId, content] of this.scheduledContent) {
      if (content.status === 'scheduled' && now >= content.startTime) {
        content.status = 'active';
        await this.broadcastContent(content);
      }

      if (content.status === 'active' && now >= content.endTime) {
        content.status = 'completed';
        await this.endBroadcast(content);
      }
    }
  }

  /**
   * Schedule content for broadcast
   */
  async scheduleContent(content: Omit<ScheduledContent, 'id' | 'status'>): Promise<ScheduledContent> {
    const scheduledItem: ScheduledContent = {
      ...content,
      id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'scheduled',
    };

    this.scheduledContent.set(scheduledItem.id, scheduledItem);

    console.log(`[QUMUS Content Scheduler] Content scheduled: ${content.title}`, {
      channels: content.channels.length,
      duration: content.duration,
      startTime: new Date(content.startTime).toLocaleString(),
    });

    // Add to broadcast schedule
    for (const channelId of content.channels) {
      const slots = this.broadcastSchedule.get(channelId) || [];
      slots.push({
        channelId,
        startTime: content.startTime,
        endTime: content.endTime,
        content: scheduledItem,
      });
      this.broadcastSchedule.set(channelId, slots);
    }

    // Log to status feed
    await tyOSStatusFeed.logDecision(
      'content_scheduler',
      `Scheduled ${content.title}`,
      `Broadcasting on ${content.channels.length} channels for ${content.duration} minutes`,
      { contentId: scheduledItem.id, channels: content.channels.length }
    );

    return scheduledItem;
  }

  /**
   * Auto-populate 24-hour schedule for a channel
   */
  async autoPopulateChannel(channelId: number, frequency: string = 'daily'): Promise<ScheduledContent[]> {
    const scheduledItems: ScheduledContent[] = [];
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Define 24-hour schedule template
    const scheduleTemplate = [
      { time: 6, content: 'pod_morning', duration: 120 }, // 6 AM
      { time: 9, content: 'music_432hz', duration: 60 }, // 9 AM
      { time: 10, content: 'pod_midday', duration: 90 }, // 10 AM
      { time: 12, content: 'news_hourly', duration: 15 }, // 12 PM
      { time: 13, content: 'talk_roundtable', duration: 90 }, // 1 PM
      { time: 15, content: 'music_solfeggio', duration: 60 }, // 3 PM
      { time: 16, content: 'edu_wellness', duration: 45 }, // 4 PM
      { time: 17, content: 'pod_evening', duration: 120 }, // 5 PM
      { time: 19, content: 'commercial_canryn', duration: 30 }, // 7 PM
      { time: 20, content: 'talk_roundtable', duration: 90 }, // 8 PM
      { time: 22, content: 'music_432hz', duration: 60 }, // 10 PM
      { time: 23, content: 'pod_night', duration: 180 }, // 11 PM
    ];

    // Create schedule for today and next 7 days
    for (let day = 0; day < 7; day++) {
      const dayStart = now + day * oneDay;

      for (const slot of scheduleTemplate) {
        const contentRef = this.contentLibrary.get(slot.content);
        if (!contentRef) continue;

        const startTime = dayStart + slot.time * 60 * 60 * 1000;
        const endTime = startTime + slot.duration * 60 * 1000;

        const scheduled = await this.scheduleContent({
          title: contentRef.title,
          type: contentRef.type,
          duration: slot.duration,
          channels: [channelId],
          startTime,
          endTime,
          frequency,
          priority: 'normal',
        });

        scheduledItems.push(scheduled);
      }
    }

    console.log(
      `[QUMUS Content Scheduler] Auto-populated channel ${channelId} with ${scheduledItems.length} content items`
    );

    return scheduledItems;
  }

  /**
   * Auto-populate all 54 channels with 24/7 content
   */
  async autoPopulateAllChannels(): Promise<number> {
    console.log('[QUMUS Content Scheduler] Starting auto-population of all 54 channels...');

    let totalScheduled = 0;

    for (let channelId = 1; channelId <= this.totalChannels; channelId++) {
      const items = await this.autoPopulateChannel(channelId, 'daily');
      totalScheduled += items.length;
    }

    console.log(`[QUMUS Content Scheduler] All channels populated: ${totalScheduled} total content items scheduled`);

    await tyOSStatusFeed.logDecision(
      'content_scheduler_auto',
      'Auto-populated all 54 channels',
      `${totalScheduled} content items scheduled for 24/7 broadcast`,
      { totalChannels: this.totalChannels, totalItems: totalScheduled }
    );

    return totalScheduled;
  }

  /**
   * Broadcast content to channels
   */
  private async broadcastContent(content: ScheduledContent): Promise<void> {
    console.log(`[QUMUS Content Scheduler] Broadcasting: ${content.title}`, {
      channels: content.channels.length,
      type: content.type,
    });

    await tyOSStatusFeed.logDecision(
      'content_broadcast',
      `Broadcasting ${content.title}`,
      `Live on ${content.channels.length} channels`,
      { contentId: content.id, type: content.type }
    );
  }

  /**
   * End broadcast
   */
  private async endBroadcast(content: ScheduledContent): Promise<void> {
    console.log(`[QUMUS Content Scheduler] Broadcast ended: ${content.title}`);

    await tyOSStatusFeed.logDecision(
      'content_broadcast_end',
      `Broadcast ended: ${content.title}`,
      `Completed on ${content.channels.length} channels`,
      { contentId: content.id }
    );
  }

  /**
   * Get schedule for a channel
   */
  getChannelSchedule(channelId: number): BroadcastSlot[] {
    return this.broadcastSchedule.get(channelId) || [];
  }

  /**
   * Get all scheduled content
   */
  getAllScheduledContent(): ScheduledContent[] {
    return Array.from(this.scheduledContent.values());
  }

  /**
   * Get active broadcasts
   */
  getActiveBroadcasts(): ScheduledContent[] {
    return Array.from(this.scheduledContent.values()).filter((c) => c.status === 'active');
  }

  /**
   * Get upcoming broadcasts
   */
  getUpcomingBroadcasts(limit: number = 10): ScheduledContent[] {
    const now = Date.now();
    return Array.from(this.scheduledContent.values())
      .filter((c) => c.status === 'scheduled' && c.startTime > now)
      .sort((a, b) => a.startTime - b.startTime)
      .slice(0, limit);
  }

  /**
   * Add content to library
   */
  addToLibrary(contentId: string, content: any): void {
    this.contentLibrary.set(contentId, content);
    console.log(`[QUMUS Content Scheduler] Added to library: ${contentId}`);
  }

  /**
   * Get scheduler status
   */
  getSchedulerStatus() {
    return {
      totalChannels: this.totalChannels,
      totalScheduledItems: this.scheduledContent.size,
      activeBroadcasts: this.getActiveBroadcasts().length,
      upcomingBroadcasts: this.getUpcomingBroadcasts().length,
      librarySize: this.contentLibrary.size,
    };
  }

  /**
   * Stop scheduler
   */
  stop(): void {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
    }
    console.log('[QUMUS Content Scheduler] Stopped');
  }
}

// Singleton instance
export const qumusContentScheduler = new QUMUSContentScheduler();
