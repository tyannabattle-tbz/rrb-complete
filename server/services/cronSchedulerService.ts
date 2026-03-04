/**
 * Cron Scheduler Service
 * Manages scheduled task execution for automated posting and system operations
 */

import cron from 'node-cron';
import { getDb } from '../db';
import { automatedPostingScheduleService } from './automatedPostingScheduleService';
import { notificationService } from './notificationService';
import { socialMediaCredentialsService } from './socialMediaCredentialsService';

export interface CronJob {
  id: string;
  name: string;
  schedule: string; // Cron expression
  task: string; // Task type: 'post', 'refresh_credentials', 'cleanup', etc.
  is_active: boolean;
  last_run?: number;
  next_run?: number;
  error_count: number;
  created_at: number;
}

export class CronSchedulerService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  /**
   * Initialize all scheduled tasks
   */
  async initializeSchedules(): Promise<void> {
    try {
      console.log('[Cron] Initializing scheduled tasks...');

      // Schedule 1: Execute pending posts every minute
      this.registerJob('execute-pending-posts', '* * * * *', async () => {
        await this.executePendingPosts();
      });

      // Schedule 2: Execute recurring posts daily at specified times
      this.registerJob('execute-recurring-posts', '0 * * * *', async () => {
        await this.executeRecurringPosts();
      });

      // Schedule 3: Refresh expiring credentials every 6 hours
      this.registerJob('refresh-credentials', '0 */6 * * *', async () => {
        await this.refreshExpiringCredentials();
      });

      // Schedule 4: Cleanup old webhook events daily at 2 AM
      this.registerJob('cleanup-webhooks', '0 2 * * *', async () => {
        await this.cleanupOldWebhookEvents();
      });

      // Schedule 5: Generate daily status report at 8 PM
      this.registerJob('daily-status-report', '0 20 * * *', async () => {
        await this.generateDailyStatusReport();
      });

      // Schedule 6: Health check every 5 minutes
      this.registerJob('health-check', '*/5 * * * *', async () => {
        await this.performHealthCheck();
      });

      console.log('[Cron] ✓ All scheduled tasks initialized');
    } catch (error) {
      console.error('[Cron] Failed to initialize schedules:', error);
      throw error;
    }
  }

  /**
   * Register a cron job
   */
  private registerJob(
    jobId: string,
    cronExpression: string,
    task: () => Promise<void>
  ): void {
    try {
      const scheduledTask = cron.schedule(cronExpression, async () => {
        try {
          console.log(`[Cron] Executing job: ${jobId}`);
          const startTime = Date.now();

          await task();

          const duration = Date.now() - startTime;
          console.log(`[Cron] ✓ Job completed: ${jobId} (${duration}ms)`);

          // Log successful execution
          await this.logJobExecution(jobId, 'success', null, duration);
        } catch (error) {
          console.error(`[Cron] Job failed: ${jobId}`, error);
          await this.logJobExecution(jobId, 'failed', String(error));
        }
      });

      this.jobs.set(jobId, scheduledTask);
      console.log(`[Cron] Registered job: ${jobId} (${cronExpression})`);
    } catch (error) {
      console.error(`[Cron] Failed to register job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Execute pending scheduled posts
   */
  private async executePendingPosts(): Promise<void> {
    try {
      const pendingPosts = await automatedPostingScheduleService.getPendingPosts();

      if (pendingPosts.length === 0) {
        return;
      }

      console.log(`[Cron] Found ${pendingPosts.length} pending posts to execute`);

      for (const post of pendingPosts) {
        try {
          // Get the bot's user ID (assuming bot has associated user)
          const db = await getDb();
          const bot = await db.get('SELECT user_id FROM bots WHERE id = ?', [post.bot_id]);

          if (bot) {
            await automatedPostingScheduleService.executeScheduledPost(post.id, bot.user_id);
          }
        } catch (error) {
          console.error(`[Cron] Failed to execute post ${post.id}:`, error);
        }
      }
    } catch (error) {
      console.error('[Cron] Error executing pending posts:', error);
    }
  }

  /**
   * Execute recurring posts
   */
  private async executeRecurringPosts(): Promise<void> {
    try {
      const db = await getDb();
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentDay = now.getDay();

      // Get all active recurring schedules
      const schedules = await db.all(
        'SELECT * FROM recurring_schedules WHERE is_active = 1'
      );

      for (const schedule of schedules) {
        try {
          const [scheduleHour, scheduleMinute] = schedule.time_of_day.split(':').map(Number);

          // Check if it's time to execute
          if (currentHour === scheduleHour && currentMinute === scheduleMinute) {
            // Check day of week if applicable
            if (schedule.days_of_week) {
              const daysOfWeek = JSON.parse(schedule.days_of_week);
              if (!daysOfWeek.includes(currentDay)) {
                continue;
              }
            }

            const bot = await db.get('SELECT user_id FROM bots WHERE id = ?', [schedule.bot_id]);
            if (bot) {
              await automatedPostingScheduleService.executeRecurringSchedule(schedule.id, bot.user_id);
            }
          }
        } catch (error) {
          console.error(`[Cron] Failed to execute recurring schedule ${schedule.id}:`, error);
        }
      }
    } catch (error) {
      console.error('[Cron] Error executing recurring posts:', error);
    }
  }

  /**
   * Refresh expiring credentials
   */
  private async refreshExpiringCredentials(): Promise<void> {
    try {
      const db = await getDb();
      const now = Date.now();
      const oneWeekFromNow = now + 7 * 24 * 60 * 60 * 1000;

      // Get credentials expiring within 7 days
      const expiringCredentials = await db.all(
        `SELECT * FROM social_media_credentials 
         WHERE expires_at BETWEEN ? AND ? AND is_active = 1`,
        [now, oneWeekFromNow]
      );

      console.log(`[Cron] Found ${expiringCredentials.length} credentials expiring soon`);

      for (const credential of expiringCredentials) {
        try {
          // Send notification to user
          await notificationService.sendNotification(credential.user_id, {
            type: 'system_alert',
            title: `⚠️ ${credential.platform} Credentials Expiring`,
            message: `Your ${credential.platform} credentials will expire in 7 days. Please refresh them.`,
            severity: 'warning',
            data: { credential_id: credential.id, platform: credential.platform },
          });

          console.log(`[Cron] Sent expiration notice for credential: ${credential.id}`);
        } catch (error) {
          console.error(`[Cron] Failed to notify about credential ${credential.id}:`, error);
        }
      }
    } catch (error) {
      console.error('[Cron] Error refreshing credentials:', error);
    }
  }

  /**
   * Cleanup old webhook events
   */
  private async cleanupOldWebhookEvents(): Promise<void> {
    try {
      const db = await getDb();
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

      const result = await db.run(
        'DELETE FROM webhook_events WHERE created_at < ?',
        [thirtyDaysAgo]
      );

      console.log(`[Cron] Cleaned up old webhook events (30+ days old)`);
    } catch (error) {
      console.error('[Cron] Error cleaning up webhook events:', error);
    }
  }

  /**
   * Generate daily status report
   */
  private async generateDailyStatusReport(): Promise<void> {
    try {
      const db = await getDb();

      // Get statistics
      const postStats = await automatedPostingScheduleService.getScheduleStats();
      const credentialStats = await db.get(
        `SELECT COUNT(*) as total, COUNT(CASE WHEN is_active = 1 THEN 1 END) as active 
         FROM social_media_credentials`
      );

      const webhookStats = await db.get(
        `SELECT COUNT(*) as total, COUNT(CASE WHEN type LIKE 'invoice%' THEN 1 END) as invoices 
         FROM webhook_events WHERE created_at > ?`,
        [Date.now() - 24 * 60 * 60 * 1000]
      );

      const report = {
        timestamp: new Date().toISOString(),
        posts: postStats,
        credentials: credentialStats,
        webhooks: webhookStats,
        system_health: 'operational',
      };

      // Log report
      console.log('[Cron] Daily Status Report:', JSON.stringify(report, null, 2));

      // Send to owner
      const owner = await db.get('SELECT email FROM users WHERE role = ? LIMIT 1', ['admin']);
      if (owner) {
        await notificationService.sendNotification(owner.id, {
          type: 'system_alert',
          title: '📊 Daily Status Report',
          message: `Posts: ${postStats.posted_posts} posted, ${postStats.pending_posts} pending. Credentials: ${credentialStats.active}/${credentialStats.total} active.`,
          severity: 'info',
          data: report,
        });
      }
    } catch (error) {
      console.error('[Cron] Error generating status report:', error);
    }
  }

  /**
   * Perform health check
   */
  private async performHealthCheck(): Promise<void> {
    try {
      const db = await getDb();

      // Check database connectivity
      const dbHealth = await db.get('SELECT 1');
      if (!dbHealth) {
        throw new Error('Database health check failed');
      }

      // Check pending posts
      const pendingPosts = await db.get(
        'SELECT COUNT(*) as count FROM post_schedules WHERE status = ?',
        ['scheduled']
      );

      // Check active bots
      const activeBots = await db.get(
        'SELECT COUNT(*) as count FROM bots WHERE is_active = 1'
      );

      const health = {
        timestamp: Date.now(),
        database: 'healthy',
        pending_posts: pendingPosts?.count || 0,
        active_bots: activeBots?.count || 0,
        status: 'operational',
      };

      console.log('[Cron] Health check passed:', health);
    } catch (error) {
      console.error('[Cron] Health check failed:', error);
    }
  }

  /**
   * Log job execution
   */
  private async logJobExecution(
    jobId: string,
    status: 'success' | 'failed',
    error?: string | null,
    duration?: number
  ): Promise<void> {
    try {
      const db = await getDb();
      await db.run(
        `INSERT INTO cron_job_logs (job_id, status, error, duration, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [jobId, status, error, duration || 0, Date.now()]
      );
    } catch (error) {
      console.error('[Cron] Failed to log job execution:', error);
    }
  }

  /**
   * Stop all scheduled jobs
   */
  stopAll(): void {
    for (const [jobId, task] of this.jobs) {
      task.stop();
      console.log(`[Cron] Stopped job: ${jobId}`);
    }
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): boolean {
    const task = this.jobs.get(jobId);
    return task ? !task.stopped : false;
  }

  /**
   * Get all job statuses
   */
  getAllJobStatuses(): Record<string, boolean> {
    const statuses: Record<string, boolean> = {};
    for (const [jobId, task] of this.jobs) {
      statuses[jobId] = !task.stopped;
    }
    return statuses;
  }
}

export const cronSchedulerService = new CronSchedulerService();
