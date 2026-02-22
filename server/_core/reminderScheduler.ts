/**
 * Automated Reminder Scheduling Service
 * Cron-based reminder delivery for panelists
 */

import { CronJob } from 'cron';
import { sendPanelistInvite } from './emailService';
import { generateReminderEmail } from './emailTemplates';

export interface ReminderSchedule {
  eventId: string;
  eventName: string;
  eventDate: Date;
  panelistId: string;
  panelistEmail: string;
  panelistName: string;
  zoomLink: string;
  meetingId: string;
  passcode: string;
  reminderType: '24h' | '1h';
  scheduled: boolean;
  sentAt?: Date;
  deliveryStatus: 'pending' | 'sent' | 'failed';
  retryCount: number;
  maxRetries: number;
}

/**
 * Reminder scheduler manager
 */
export class ReminderScheduler {
  private jobs = new Map<string, CronJob>();
  private schedules = new Map<string, ReminderSchedule>();
  private readonly maxRetries = 3;

  /**
   * Schedule a reminder for a panelist
   */
  scheduleReminder(schedule: ReminderSchedule): void {
    const scheduleId = `${schedule.eventId}-${schedule.panelistId}-${schedule.reminderType}`;

    // Calculate when to send reminder
    const eventTime = new Date(schedule.eventDate).getTime();
    const reminderTime = schedule.reminderType === '24h' 
      ? eventTime - 24 * 60 * 60 * 1000 
      : eventTime - 60 * 60 * 1000;

    const cronExpression = this.generateCronExpression(new Date(reminderTime));

    // Create cron job
    const job = new CronJob(
      cronExpression,
      () => this.sendReminder(schedule),
      null,
      true,
      'UTC'
    );

    this.jobs.set(scheduleId, job);
    this.schedules.set(scheduleId, { ...schedule, scheduled: true });

    console.log(`[Reminder Scheduler] Scheduled ${schedule.reminderType} reminder for ${schedule.panelistName}`);
  }

  /**
   * Send reminder email
   */
  private async sendReminder(schedule: ReminderSchedule): Promise<void> {
    try {
      const hoursUntilEvent = schedule.reminderType === '24h' ? 24 : 1;
      
      const emailTemplate = generateReminderEmail({
        panelistName: schedule.panelistName,
        eventName: schedule.eventName,
        eventDate: schedule.eventDate.toLocaleDateString(),
        eventTime: schedule.eventDate.toLocaleTimeString(),
        hoursUntilEvent,
        zoomLink: schedule.zoomLink,
        meetingId: schedule.meetingId,
        passcode: schedule.passcode,
      });

      await sendPanelistInvite(
        schedule.panelistEmail,
        emailTemplate.subject,
        emailTemplate.html,
        emailTemplate.text
      );

      // Update schedule
      const scheduleId = `${schedule.eventId}-${schedule.panelistId}-${schedule.reminderType}`;
      const updated = this.schedules.get(scheduleId);
      if (updated) {
        updated.deliveryStatus = 'sent';
        updated.sentAt = new Date();
        this.schedules.set(scheduleId, updated);
      }

      console.log(`[Reminder Scheduler] Sent ${schedule.reminderType} reminder to ${schedule.panelistEmail}`);
    } catch (error) {
      console.error(`[Reminder Scheduler] Failed to send reminder:`, error);
      
      // Retry logic
      const scheduleId = `${schedule.eventId}-${schedule.panelistId}-${schedule.reminderType}`;
      const updated = this.schedules.get(scheduleId);
      if (updated && updated.retryCount < updated.maxRetries) {
        updated.retryCount++;
        this.schedules.set(scheduleId, updated);
        console.log(`[Reminder Scheduler] Retrying... (${updated.retryCount}/${updated.maxRetries})`);
      } else {
        if (updated) {
          updated.deliveryStatus = 'failed';
          this.schedules.set(scheduleId, updated);
        }
      }
    }
  }

  /**
   * Generate cron expression from date
   */
  private generateCronExpression(date: Date): string {
    const seconds = date.getUTCSeconds();
    const minutes = date.getUTCMinutes();
    const hours = date.getUTCHours();
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;

    return `${seconds} ${minutes} ${hours} ${day} ${month} *`;
  }

  /**
   * Cancel a scheduled reminder
   */
  cancelReminder(eventId: string, panelistId: string, reminderType: '24h' | '1h'): void {
    const scheduleId = `${eventId}-${panelistId}-${reminderType}`;
    const job = this.jobs.get(scheduleId);
    
    if (job) {
      job.stop();
      this.jobs.delete(scheduleId);
      this.schedules.delete(scheduleId);
      console.log(`[Reminder Scheduler] Cancelled reminder ${scheduleId}`);
    }
  }

  /**
   * Cancel all reminders for an event
   */
  cancelEventReminders(eventId: string): void {
    const toDelete: string[] = [];
    
    this.jobs.forEach((job, scheduleId) => {
      if (scheduleId.startsWith(eventId)) {
        job.stop();
        toDelete.push(scheduleId);
      }
    });

    toDelete.forEach((scheduleId) => {
      this.jobs.delete(scheduleId);
      this.schedules.delete(scheduleId);
    });

    console.log(`[Reminder Scheduler] Cancelled ${toDelete.length} reminders for event ${eventId}`);
  }

  /**
   * Get schedule status
   */
  getScheduleStatus(eventId: string, panelistId: string, reminderType: '24h' | '1h'): ReminderSchedule | null {
    const scheduleId = `${eventId}-${panelistId}-${reminderType}`;
    return this.schedules.get(scheduleId) || null;
  }

  /**
   * Get all schedules for an event
   */
  getEventSchedules(eventId: string): ReminderSchedule[] {
    const schedules: ReminderSchedule[] = [];
    
    this.schedules.forEach((schedule, scheduleId) => {
      if (scheduleId.startsWith(eventId)) {
        schedules.push(schedule);
      }
    });

    return schedules;
  }

  /**
   * Get delivery statistics
   */
  getDeliveryStats(eventId: string): {
    total: number;
    sent: number;
    failed: number;
    pending: number;
    successRate: number;
  } {
    const schedules = this.getEventSchedules(eventId);
    const sent = schedules.filter((s) => s.deliveryStatus === 'sent').length;
    const failed = schedules.filter((s) => s.deliveryStatus === 'failed').length;
    const pending = schedules.filter((s) => s.deliveryStatus === 'pending').length;
    const total = schedules.length;

    return {
      total,
      sent,
      failed,
      pending,
      successRate: total > 0 ? (sent / total) * 100 : 0,
    };
  }

  /**
   * Cleanup completed jobs
   */
  cleanup(): void {
    this.jobs.forEach((job) => {
      job.stop();
    });
    this.jobs.clear();
    this.schedules.clear();
    console.log('[Reminder Scheduler] Cleanup completed');
  }

  /**
   * Get active jobs count
   */
  getActiveJobsCount(): number {
    return this.jobs.size;
  }

  /**
   * Export schedules for backup
   */
  exportSchedules(): ReminderSchedule[] {
    return Array.from(this.schedules.values());
  }

  /**
   * Import schedules from backup
   */
  importSchedules(schedules: ReminderSchedule[]): void {
    schedules.forEach((schedule) => {
      this.scheduleReminder(schedule);
    });
  }
}

/**
 * Global reminder scheduler instance
 */
export const globalReminderScheduler = new ReminderScheduler();

/**
 * Schedule reminders for all panelists of an event
 */
export async function scheduleEventReminders(
  eventId: string,
  eventName: string,
  eventDate: Date,
  panelists: Array<{
    id: string;
    email: string;
    name: string;
  }>,
  zoomDetails: {
    link: string;
    meetingId: string;
    passcode: string;
  }
): Promise<void> {
  console.log(`[Reminder Scheduler] Scheduling reminders for event: ${eventName}`);

  panelists.forEach((panelist) => {
    // Schedule 24-hour reminder
    globalReminderScheduler.scheduleReminder({
      eventId,
      eventName,
      eventDate,
      panelistId: panelist.id,
      panelistEmail: panelist.email,
      panelistName: panelist.name,
      zoomLink: zoomDetails.link,
      meetingId: zoomDetails.meetingId,
      passcode: zoomDetails.passcode,
      reminderType: '24h',
      scheduled: false,
      deliveryStatus: 'pending',
      retryCount: 0,
      maxRetries: 3,
    });

    // Schedule 1-hour reminder
    globalReminderScheduler.scheduleReminder({
      eventId,
      eventName,
      eventDate,
      panelistId: panelist.id,
      panelistEmail: panelist.email,
      panelistName: panelist.name,
      zoomLink: zoomDetails.link,
      meetingId: zoomDetails.meetingId,
      passcode: zoomDetails.passcode,
      reminderType: '1h',
      scheduled: false,
      deliveryStatus: 'pending',
      retryCount: 0,
      maxRetries: 3,
    });
  });

  console.log(`[Reminder Scheduler] Scheduled ${panelists.length * 2} reminders`);
}

/**
 * Get reminder scheduler health status
 */
export function getReminderSchedulerHealth(): {
  status: 'healthy' | 'degraded' | 'failed';
  activeJobs: number;
  failedDeliveries: number;
  message: string;
} {
  const activeJobs = globalReminderScheduler.getActiveJobsCount();
  const allSchedules = globalReminderScheduler.exportSchedules();
  const failedDeliveries = allSchedules.filter((s) => s.deliveryStatus === 'failed').length;

  let status: 'healthy' | 'degraded' | 'failed' = 'healthy';
  let message = 'Reminder scheduler operating normally';

  if (failedDeliveries > 0) {
    status = 'degraded';
    message = `${failedDeliveries} delivery failures detected`;
  }

  if (activeJobs === 0 && allSchedules.length > 0) {
    status = 'failed';
    message = 'No active jobs but schedules exist';
  }

  return {
    status,
    activeJobs,
    failedDeliveries,
    message,
  };
}
