import { db } from './db';
import { scheduleSlots, scheduleContent, contentLibrary, broadcastLog, commercialRotation } from '@/drizzle/schedule.schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

/**
 * Content Scheduler Service
 * Manages 24/7 content scheduling and automation
 */

interface ScheduledContent {
  id: string;
  title: string;
  contentTypeId: string;
  duration: number;
  fileUrl: string;
  metadata?: any;
}

interface ScheduleSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  contentTypeId: string;
  priority: number;
}

export class ContentScheduler {
  /**
   * Get current schedule for the day
   */
  static async getTodaySchedule() {
    const today = new Date().getDay();
    
    const slots = await db
      .select()
      .from(scheduleSlots)
      .where(
        and(
          eq(scheduleSlots.dayOfWeek, today),
          eq(scheduleSlots.isActive, 1)
        )
      )
      .orderBy(scheduleSlots.startTime);

    return slots;
  }

  /**
   * Get next content to play
   */
  static async getNextContent(): Promise<ScheduledContent | null> {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dayOfWeek = now.getDay();

    // Find current or next slot
    const slot = await db
      .select()
      .from(scheduleSlots)
      .where(
        and(
          eq(scheduleSlots.dayOfWeek, dayOfWeek),
          eq(scheduleSlots.isActive, 1),
          gte(scheduleSlots.startTime, currentTime)
        )
      )
      .orderBy(scheduleSlots.startTime)
      .limit(1);

    if (!slot.length) return null;

    // Get content for this slot
    const slotContent = await db
      .select()
      .from(scheduleContent)
      .where(
        and(
          eq(scheduleContent.scheduleSlotId, slot[0].id),
          eq(scheduleContent.isActive, 1)
        )
      )
      .orderBy(scheduleContent.sequenceOrder);

    if (!slotContent.length) return null;

    // Select content based on weight
    const selectedContent = this.selectWeightedContent(slotContent);
    
    const content = await db
      .select()
      .from(contentLibrary)
      .where(eq(contentLibrary.id, selectedContent.contentId))
      .limit(1);

    return content[0] || null;
  }

  /**
   * Get commercial to insert
   */
  static async getNextCommercial(): Promise<ScheduledContent | null> {
    const commercials = await db
      .select()
      .from(commercialRotation)
      .where(
        and(
          eq(commercialRotation.isActive, 1),
          lte(commercialRotation.currentPlaysToday, commercialRotation.maxPlaysPerDay)
        )
      );

    if (!commercials.length) return null;

    // Select commercial based on frequency and plays
    const selected = commercials.reduce((best, current) => {
      const currentScore = this.calculateCommercialScore(current);
      const bestScore = this.calculateCommercialScore(best);
      return currentScore > bestScore ? current : best;
    });

    const content = await db
      .select()
      .from(contentLibrary)
      .where(eq(contentLibrary.id, selected.contentId))
      .limit(1);

    return content[0] || null;
  }

  /**
   * Log broadcast event
   */
  static async logBroadcast(
    contentId: string,
    startTime: number,
    endTime: number,
    listeners: number = 0,
    status: 'scheduled' | 'playing' | 'completed' | 'failed' = 'completed',
    errorMessage?: string
  ) {
    const duration = endTime - startTime;
    
    return await db.insert(broadcastLog).values({
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contentId,
      startTime,
      endTime,
      duration,
      listeners,
      status,
      errorMessage,
      createdAt: Date.now(),
    });
  }

  /**
   * Update commercial play count
   */
  static async updateCommercialPlayCount(commercialId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    const commercial = await db
      .select()
      .from(commercialRotation)
      .where(eq(commercialRotation.id, commercialId))
      .limit(1);

    if (!commercial.length) return;

    const lastPlayed = commercial[0].lastPlayedAt || 0;
    const isToday = lastPlayed >= todayStart;

    const newPlayCount = isToday ? (commercial[0].currentPlaysToday || 0) + 1 : 1;

    return await db
      .update(commercialRotation)
      .set({
        currentPlaysToday: newPlayCount,
        lastPlayedAt: Date.now(),
        updatedAt: Date.now(),
      })
      .where(eq(commercialRotation.id, commercialId));
  }

  /**
   * Get broadcast statistics
   */
  static async getBroadcastStats(hours: number = 24) {
    const startTime = Date.now() - hours * 60 * 60 * 1000;

    const stats = await db
      .select()
      .from(broadcastLog)
      .where(
        and(
          gte(broadcastLog.startTime, startTime),
          eq(broadcastLog.status, 'completed')
        )
      );

    return {
      totalBroadcasts: stats.length,
      totalDuration: stats.reduce((sum, s) => sum + s.duration, 0),
      totalListeners: stats.reduce((sum, s) => sum + (s.listeners || 0), 0),
      averageListeners: stats.length > 0 
        ? Math.round(stats.reduce((sum, s) => sum + (s.listeners || 0), 0) / stats.length)
        : 0,
      failedBroadcasts: stats.filter(s => s.status === 'failed').length,
    };
  }

  /**
   * Create or update schedule slot
   */
  static async upsertScheduleSlot(
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    contentTypeId: string,
    priority: number = 0
  ) {
    const existing = await db
      .select()
      .from(scheduleSlots)
      .where(
        and(
          eq(scheduleSlots.dayOfWeek, dayOfWeek),
          eq(scheduleSlots.startTime, startTime),
          eq(scheduleSlots.endTime, endTime)
        )
      )
      .limit(1);

    if (existing.length) {
      return await db
        .update(scheduleSlots)
        .set({
          contentTypeId,
          priority,
          updatedAt: Date.now(),
        })
        .where(eq(scheduleSlots.id, existing[0].id));
    }

    return await db.insert(scheduleSlots).values({
      id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dayOfWeek,
      startTime,
      endTime,
      contentTypeId,
      priority,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  /**
   * Add content to schedule slot
   */
  static async addContentToSlot(
    scheduleSlotId: string,
    contentId: string,
    sequenceOrder: number,
    weight: number = 1.0
  ) {
    return await db.insert(scheduleContent).values({
      id: `sc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      scheduleSlotId,
      contentId,
      sequenceOrder,
      weight,
      createdAt: Date.now(),
    });
  }

  /**
   * Private: Select weighted content
   */
  private static selectWeightedContent(contents: any[]) {
    const totalWeight = contents.reduce((sum, c) => sum + (c.weight || 1), 0);
    let random = Math.random() * totalWeight;

    for (const content of contents) {
      random -= (content.weight || 1);
      if (random <= 0) return content;
    }

    return contents[0];
  }

  /**
   * Private: Calculate commercial priority score
   */
  private static calculateCommercialScore(commercial: any): number {
    const timeSincePlay = commercial.lastPlayedAt 
      ? Date.now() - commercial.lastPlayedAt 
      : Infinity;
    
    const frequencyScore = timeSincePlay / (commercial.rotationFrequency * 60 * 1000);
    const playCountScore = 1 - (commercial.currentPlaysToday / commercial.maxPlaysPerDay);
    
    return frequencyScore * 0.6 + playCountScore * 0.4;
  }
}

/**
 * Initialize default content types
 */
export async function initializeContentTypes() {
  const types = ['radio', 'video', 'podcast', 'commercial'];
  
  for (const type of types) {
    const existing = await db
      .select()
      .from(contentLibrary)
      .where(eq(contentLibrary.contentTypeId, type))
      .limit(1);

    if (!existing.length) {
      // Content type will be created when first content is added
    }
  }
}
