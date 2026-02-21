import { getDb } from '../db';
import { channelSchedules, scheduledShows } from '../../drizzle/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export interface ScheduleShow {
  id: string;
  channelId: string;
  title: string;
  artist: string;
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
  description: string;
  isRecurring: boolean;
  recurringDays?: number[]; // 0-6 (Sunday-Saturday)
  duration: number; // in seconds
}

export interface ChannelSchedule {
  id: string;
  channelId: string;
  channelName: string;
  shows: ScheduleShow[];
  autoRotate: boolean;
  currentShow?: ScheduleShow;
  nextShow?: ScheduleShow;
}

/**
 * Get current show for a channel
 */
export async function getCurrentShow(channelId: string): Promise<ScheduleShow | null> {
  const db = getDb();
  const now = Date.now();

  const result = await db
    .select()
    .from(scheduledShows)
    .where(
      and(
        eq(scheduledShows.channelId, channelId),
        lte(scheduledShows.startTime, now),
        gte(scheduledShows.endTime, now)
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Get next show for a channel
 */
export async function getNextShow(channelId: string): Promise<ScheduleShow | null> {
  const db = getDb();
  const now = Date.now();

  const result = await db
    .select()
    .from(scheduledShows)
    .where(
      and(
        eq(scheduledShows.channelId, channelId),
        gte(scheduledShows.startTime, now)
      )
    )
    .orderBy(scheduledShows.startTime)
    .limit(1);

  return result[0] || null;
}

/**
 * Get channel schedule for a specific date range
 */
export async function getChannelSchedule(
  channelId: string,
  startTime: number,
  endTime: number
): Promise<ScheduleShow[]> {
  const db = getDb();

  return await db
    .select()
    .from(scheduledShows)
    .where(
      and(
        eq(scheduledShows.channelId, channelId),
        lte(scheduledShows.startTime, endTime),
        gte(scheduledShows.endTime, startTime)
      )
    )
    .orderBy(scheduledShows.startTime);
}

/**
 * Create a scheduled show
 */
export async function createScheduledShow(show: ScheduleShow): Promise<ScheduleShow> {
  const db = getDb();

  const result = await db
    .insert(scheduledShows)
    .values({
      id: show.id,
      channelId: show.channelId,
      title: show.title,
      artist: show.artist,
      startTime: show.startTime,
      endTime: show.endTime,
      description: show.description,
      isRecurring: show.isRecurring,
      recurringDays: show.recurringDays ? JSON.stringify(show.recurringDays) : null,
      duration: show.duration,
    })
    .returning();

  return result[0];
}

/**
 * Update a scheduled show
 */
export async function updateScheduledShow(
  showId: string,
  updates: Partial<ScheduleShow>
): Promise<ScheduleShow | null> {
  const db = getDb();

  const result = await db
    .update(scheduledShows)
    .set({
      ...(updates.title && { title: updates.title }),
      ...(updates.artist && { artist: updates.artist }),
      ...(updates.startTime && { startTime: updates.startTime }),
      ...(updates.endTime && { endTime: updates.endTime }),
      ...(updates.description && { description: updates.description }),
      ...(updates.isRecurring !== undefined && { isRecurring: updates.isRecurring }),
      ...(updates.recurringDays && { recurringDays: JSON.stringify(updates.recurringDays) }),
      ...(updates.duration && { duration: updates.duration }),
    })
    .where(eq(scheduledShows.id, showId))
    .returning();

  return result[0] || null;
}

/**
 * Delete a scheduled show
 */
export async function deleteScheduledShow(showId: string): Promise<boolean> {
  const db = getDb();

  const result = await db
    .delete(scheduledShows)
    .where(eq(scheduledShows.id, showId));

  return result.rowsAffected > 0;
}

/**
 * Get all shows for a channel
 */
export async function getChannelShows(channelId: string): Promise<ScheduleShow[]> {
  const db = getDb();

  return await db
    .select()
    .from(scheduledShows)
    .where(eq(scheduledShows.channelId, channelId))
    .orderBy(scheduledShows.startTime);
}

/**
 * Get channel schedule with current and next shows
 */
export async function getFullChannelSchedule(channelId: string): Promise<ChannelSchedule | null> {
  const db = getDb();

  const schedule = await db
    .select()
    .from(channelSchedules)
    .where(eq(channelSchedules.channelId, channelId))
    .limit(1);

  if (!schedule[0]) return null;

  const currentShow = await getCurrentShow(channelId);
  const nextShow = await getNextShow(channelId);
  const shows = await getChannelShows(channelId);

  return {
    id: schedule[0].id,
    channelId: schedule[0].channelId,
    channelName: schedule[0].channelName,
    shows,
    autoRotate: schedule[0].autoRotate,
    currentShow: currentShow || undefined,
    nextShow: nextShow || undefined,
  };
}

/**
 * Create a channel schedule
 */
export async function createChannelSchedule(
  channelId: string,
  channelName: string,
  autoRotate: boolean = true
): Promise<ChannelSchedule> {
  const db = getDb();

  const result = await db
    .insert(channelSchedules)
    .values({
      channelId,
      channelName,
      autoRotate,
    })
    .returning();

  return {
    id: result[0].id,
    channelId: result[0].channelId,
    channelName: result[0].channelName,
    shows: [],
    autoRotate: result[0].autoRotate,
  };
}

/**
 * Update channel schedule settings
 */
export async function updateChannelSchedule(
  channelId: string,
  updates: { autoRotate?: boolean }
): Promise<ChannelSchedule | null> {
  const db = getDb();

  const result = await db
    .update(channelSchedules)
    .set({
      ...(updates.autoRotate !== undefined && { autoRotate: updates.autoRotate }),
    })
    .where(eq(channelSchedules.channelId, channelId))
    .returning();

  if (!result[0]) return null;

  return getFullChannelSchedule(channelId);
}

/**
 * Get all channel schedules
 */
export async function getAllChannelSchedules(): Promise<ChannelSchedule[]> {
  const db = getDb();

  const schedules = await db.select().from(channelSchedules);

  return Promise.all(
    schedules.map(async (schedule) => {
      const fullSchedule = await getFullChannelSchedule(schedule.channelId);
      return fullSchedule || {
        id: schedule.id,
        channelId: schedule.channelId,
        channelName: schedule.channelName,
        shows: [],
        autoRotate: schedule.autoRotate,
      };
    })
  );
}

/**
 * Get upcoming shows across all channels
 */
export async function getUpcomingShows(limit: number = 20): Promise<ScheduleShow[]> {
  const db = getDb();
  const now = Date.now();

  return await db
    .select()
    .from(scheduledShows)
    .where(gte(scheduledShows.startTime, now))
    .orderBy(scheduledShows.startTime)
    .limit(limit);
}

/**
 * Get trending shows (most listeners)
 */
export async function getTrendingShows(limit: number = 10): Promise<ScheduleShow[]> {
  const db = getDb();
  const now = Date.now();

  return await db
    .select()
    .from(scheduledShows)
    .where(
      and(
        lte(scheduledShows.startTime, now),
        gte(scheduledShows.endTime, now)
      )
    )
    .orderBy(scheduledShows.duration)
    .limit(limit);
}
