/**
 * Automated Posting Schedule Service
 * Manages scheduled posts across multiple social media platforms
 */

import { getDb } from '../db';
import { notificationService } from './notificationService';
import { socialMediaConnectors } from './socialMediaBotService';
import { socialMediaCredentialsService } from './socialMediaCredentialsService';

export interface PostSchedule {
  id: string;
  bot_id: string;
  content: string;
  platforms: ('twitter' | 'facebook' | 'instagram' | 'tiktok')[];
  scheduled_at: number;
  status: 'scheduled' | 'posted' | 'failed' | 'cancelled';
  media_url?: string;
  created_at: number;
  posted_at?: number;
  error_message?: string;
}

export interface RecurringSchedule {
  id: string;
  bot_id: string;
  content_template: string;
  platforms: ('twitter' | 'facebook' | 'instagram' | 'tiktok')[];
  frequency: 'daily' | 'weekly' | 'monthly';
  time_of_day: string; // HH:MM format
  days_of_week?: number[]; // 0-6, 0=Sunday
  is_active: boolean;
  created_at: number;
}

export class AutomatedPostingScheduleService {
  /**
   * Create a scheduled post
   */
  async createScheduledPost(
    botId: string,
    content: string,
    platforms: ('twitter' | 'facebook' | 'instagram' | 'tiktok')[],
    scheduledAt: number,
    mediaUrl?: string
  ): Promise<PostSchedule> {
    try {
      const db = await getDb();
      const schedule: PostSchedule = {
        id: `schedule-${Date.now()}`,
        bot_id: botId,
        content,
        platforms,
        scheduled_at: scheduledAt,
        status: 'scheduled',
        media_url: mediaUrl,
        created_at: Date.now(),
      };

      await db.run(
        `INSERT INTO post_schedules (id, bot_id, content, platforms, scheduled_at, status, media_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          schedule.id,
          schedule.bot_id,
          schedule.content,
          JSON.stringify(schedule.platforms),
          schedule.scheduled_at,
          schedule.status,
          schedule.media_url,
          schedule.created_at,
        ]
      );

      const scheduledDate = new Date(scheduledAt).toLocaleString();
      console.log(`[Schedule] Created scheduled post: ${schedule.id} for ${scheduledDate}`);

      return schedule;
    } catch (error) {
      console.error('[Schedule] Failed to create scheduled post:', error);
      throw error;
    }
  }

  /**
   * Create a recurring schedule
   */
  async createRecurringSchedule(
    botId: string,
    contentTemplate: string,
    platforms: ('twitter' | 'facebook' | 'instagram' | 'tiktok')[],
    frequency: 'daily' | 'weekly' | 'monthly',
    timeOfDay: string,
    daysOfWeek?: number[]
  ): Promise<RecurringSchedule> {
    try {
      const db = await getDb();
      const schedule: RecurringSchedule = {
        id: `recurring-${Date.now()}`,
        bot_id: botId,
        content_template: contentTemplate,
        platforms,
        frequency,
        time_of_day: timeOfDay,
        days_of_week: daysOfWeek,
        is_active: true,
        created_at: Date.now(),
      };

      await db.run(
        `INSERT INTO recurring_schedules (id, bot_id, content_template, platforms, frequency, time_of_day, days_of_week, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          schedule.id,
          schedule.bot_id,
          schedule.content_template,
          JSON.stringify(schedule.platforms),
          schedule.frequency,
          schedule.time_of_day,
          daysOfWeek ? JSON.stringify(daysOfWeek) : null,
          schedule.is_active ? 1 : 0,
          schedule.created_at,
        ]
      );

      console.log(`[Schedule] Created recurring schedule: ${schedule.id} (${frequency} at ${timeOfDay})`);

      return schedule;
    } catch (error) {
      console.error('[Schedule] Failed to create recurring schedule:', error);
      throw error;
    }
  }

  /**
   * Get pending scheduled posts
   */
  async getPendingPosts(): Promise<PostSchedule[]> {
    try {
      const db = await getDb();
      const now = Date.now();

      const posts = await db.all(
        `SELECT * FROM post_schedules 
         WHERE status = 'scheduled' AND scheduled_at <= ?
         ORDER BY scheduled_at ASC`,
        [now]
      );

      return posts.map(post => ({
        ...post,
        platforms: JSON.parse(post.platforms),
      }));
    } catch (error) {
      console.error('[Schedule] Failed to get pending posts:', error);
      return [];
    }
  }

  /**
   * Execute scheduled post
   */
  async executeScheduledPost(scheduleId: string, userId: string): Promise<boolean> {
    try {
      const db = await getDb();

      // Get the schedule
      const schedule = await db.get(
        'SELECT * FROM post_schedules WHERE id = ?',
        [scheduleId]
      );

      if (!schedule) {
        console.warn(`[Schedule] Schedule not found: ${scheduleId}`);
        return false;
      }

      const platforms = JSON.parse(schedule.platforms);

      // Post to all platforms
      const results = await socialMediaConnectors.postToMultiplePlatforms(
        schedule.content,
        platforms,
        userId,
        schedule.media_url
      );

      // Check if all posts succeeded
      const allSucceeded = results.every(r => r.success);

      // Update schedule status
      const status = allSucceeded ? 'posted' : 'failed';
      const errorMessage = results
        .filter(r => !r.success)
        .map(r => `${r.platform}: ${r.error}`)
        .join('; ');

      await db.run(
        `UPDATE post_schedules SET status = ?, posted_at = ?, error_message = ? WHERE id = ?`,
        [status, Date.now(), errorMessage || null, scheduleId]
      );

      // Send notification
      if (allSucceeded) {
        await notificationService.sendNotification(userId, {
          type: 'system_alert',
          title: '✅ Post Published',
          message: `Your scheduled post was published to ${platforms.length} platforms`,
          severity: 'success',
          data: { schedule_id: scheduleId, platforms },
        });
      } else {
        await notificationService.sendNotification(userId, {
          type: 'system_alert',
          title: '⚠️ Post Partially Failed',
          message: `Some platforms failed: ${errorMessage}`,
          severity: 'warning',
          data: { schedule_id: scheduleId, error: errorMessage },
        });
      }

      console.log(`[Schedule] ✓ Executed scheduled post: ${scheduleId} (${status})`);
      return allSucceeded;
    } catch (error) {
      console.error('[Schedule] Failed to execute scheduled post:', error);

      // Mark as failed
      const db = await getDb();
      await db.run(
        `UPDATE post_schedules SET status = ?, error_message = ? WHERE id = ?`,
        ['failed', String(error), scheduleId]
      );

      return false;
    }
  }

  /**
   * Execute recurring schedule
   */
  async executeRecurringSchedule(recurringId: string, userId: string): Promise<boolean> {
    try {
      const db = await getDb();

      // Get the recurring schedule
      const schedule = await db.get(
        'SELECT * FROM recurring_schedules WHERE id = ?',
        [recurringId]
      );

      if (!schedule || !schedule.is_active) {
        console.warn(`[Schedule] Recurring schedule not found or inactive: ${recurringId}`);
        return false;
      }

      const platforms = JSON.parse(schedule.platforms);

      // Generate content from template (simple variable replacement)
      const content = schedule.content_template
        .replace('{{date}}', new Date().toLocaleDateString())
        .replace('{{time}}', new Date().toLocaleTimeString())
        .replace('{{day}}', new Date().toLocaleDateString('en-US', { weekday: 'long' }));

      // Post to all platforms
      const results = await socialMediaConnectors.postToMultiplePlatforms(
        content,
        platforms,
        userId
      );

      const allSucceeded = results.every(r => r.success);

      // Create a post record for audit
      await db.run(
        `INSERT INTO post_schedules (id, bot_id, content, platforms, scheduled_at, status, created_at, posted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `auto-${Date.now()}`,
          schedule.bot_id,
          content,
          JSON.stringify(platforms),
          Date.now(),
          allSucceeded ? 'posted' : 'failed',
          Date.now(),
          Date.now(),
        ]
      );

      console.log(`[Schedule] ✓ Executed recurring schedule: ${recurringId}`);
      return allSucceeded;
    } catch (error) {
      console.error('[Schedule] Failed to execute recurring schedule:', error);
      return false;
    }
  }

  /**
   * Get upcoming scheduled posts
   */
  async getUpcomingPosts(days: number = 7): Promise<PostSchedule[]> {
    try {
      const db = await getDb();
      const now = Date.now();
      const futureTime = now + days * 24 * 60 * 60 * 1000;

      const posts = await db.all(
        `SELECT * FROM post_schedules 
         WHERE status = 'scheduled' AND scheduled_at BETWEEN ? AND ?
         ORDER BY scheduled_at ASC`,
        [now, futureTime]
      );

      return posts.map(post => ({
        ...post,
        platforms: JSON.parse(post.platforms),
      }));
    } catch (error) {
      console.error('[Schedule] Failed to get upcoming posts:', error);
      return [];
    }
  }

  /**
   * Cancel scheduled post
   */
  async cancelScheduledPost(scheduleId: string): Promise<void> {
    try {
      const db = await getDb();
      await db.run(
        'UPDATE post_schedules SET status = ? WHERE id = ?',
        ['cancelled', scheduleId]
      );

      console.log(`[Schedule] Cancelled scheduled post: ${scheduleId}`);
    } catch (error) {
      console.error('[Schedule] Failed to cancel scheduled post:', error);
      throw error;
    }
  }

  /**
   * Pause recurring schedule
   */
  async pauseRecurringSchedule(recurringId: string): Promise<void> {
    try {
      const db = await getDb();
      await db.run(
        'UPDATE recurring_schedules SET is_active = 0 WHERE id = ?',
        [recurringId]
      );

      console.log(`[Schedule] Paused recurring schedule: ${recurringId}`);
    } catch (error) {
      console.error('[Schedule] Failed to pause recurring schedule:', error);
      throw error;
    }
  }

  /**
   * Resume recurring schedule
   */
  async resumeRecurringSchedule(recurringId: string): Promise<void> {
    try {
      const db = await getDb();
      await db.run(
        'UPDATE recurring_schedules SET is_active = 1 WHERE id = ?',
        [recurringId]
      );

      console.log(`[Schedule] Resumed recurring schedule: ${recurringId}`);
    } catch (error) {
      console.error('[Schedule] Failed to resume recurring schedule:', error);
      throw error;
    }
  }

  /**
   * Get schedule statistics
   */
  async getScheduleStats() {
    try {
      const db = await getDb();

      const stats = await db.get(
        `SELECT 
          COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as pending_posts,
          COUNT(CASE WHEN status = 'posted' THEN 1 END) as posted_posts,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_posts,
          COUNT(DISTINCT bot_id) as active_bots
         FROM post_schedules`
      );

      const recurringStats = await db.get(
        'SELECT COUNT(*) as total_recurring, COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_recurring FROM recurring_schedules'
      );

      return {
        pending_posts: stats?.pending_posts || 0,
        posted_posts: stats?.posted_posts || 0,
        failed_posts: stats?.failed_posts || 0,
        active_bots: stats?.active_bots || 0,
        total_recurring: recurringStats?.total_recurring || 0,
        active_recurring: recurringStats?.active_recurring || 0,
      };
    } catch (error) {
      console.error('[Schedule] Failed to get stats:', error);
      return {
        pending_posts: 0,
        posted_posts: 0,
        failed_posts: 0,
        active_bots: 0,
        total_recurring: 0,
        active_recurring: 0,
      };
    }
  }
}

export const automatedPostingScheduleService = new AutomatedPostingScheduleService();
