/**
 * Monitoring Alerts Service
 * Sends alerts for webhooks, credentials, and cron jobs
 */

import { getDb } from '../db';
import { notificationService } from './notificationService';
import nodemailer from 'nodemailer';

export interface AlertConfig {
  webhook_failures: boolean;
  credential_expiration: boolean;
  cron_job_failures: boolean;
  system_health: boolean;
  email_alerts: boolean;
  sms_alerts: boolean;
}

export class MonitoringAlertsService {
  private emailTransporter?: nodemailer.Transporter;

  constructor() {
    this.initializeEmailTransporter();
  }

  /**
   * Initialize email transporter
   */
  private initializeEmailTransporter(): void {
    try {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      console.log('[Alerts] Email transporter initialized');
    } catch (error) {
      console.error('[Alerts] Failed to initialize email transporter:', error);
    }
  }

  /**
   * Alert on webhook failure
   */
  async alertWebhookFailure(
    webhookId: string,
    eventType: string,
    error: string,
    userId: string
  ): Promise<void> {
    try {
      // Send in-app notification
      await notificationService.sendNotification(userId, {
        type: 'system_alert',
        title: '❌ Webhook Processing Failed',
        message: `Failed to process ${eventType} webhook: ${error}`,
        severity: 'error',
        data: { webhook_id: webhookId, event_type: eventType },
      });

      // Send email if enabled
      await this.sendEmailAlert(
        userId,
        'Webhook Processing Failed',
        `Webhook ${webhookId} (${eventType}) failed: ${error}`
      );

      // Log alert
      await this.logAlert(userId, 'webhook_failure', {
        webhook_id: webhookId,
        event_type: eventType,
        error,
      });
    } catch (error) {
      console.error('[Alerts] Failed to send webhook failure alert:', error);
    }
  }

  /**
   * Alert on credential expiration
   */
  async alertCredentialExpiration(
    credentialId: string,
    platform: string,
    expiresAt: number,
    userId: string
  ): Promise<void> {
    try {
      const daysUntilExpiration = Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000));

      // Send in-app notification
      await notificationService.sendNotification(userId, {
        type: 'system_alert',
        title: `⚠️ ${platform} Credentials Expiring`,
        message: `Your ${platform} credentials will expire in ${daysUntilExpiration} days. Please refresh them.`,
        severity: 'warning',
        data: { credential_id: credentialId, platform, days_remaining: daysUntilExpiration },
      });

      // Send email if enabled
      await this.sendEmailAlert(
        userId,
        `${platform} Credentials Expiring Soon`,
        `Your ${platform} credentials will expire in ${daysUntilExpiration} days. Please refresh them at your earliest convenience.`
      );

      // Log alert
      await this.logAlert(userId, 'credential_expiration', {
        credential_id: credentialId,
        platform,
        days_remaining: daysUntilExpiration,
      });
    } catch (error) {
      console.error('[Alerts] Failed to send credential expiration alert:', error);
    }
  }

  /**
   * Alert on cron job failure
   */
  async alertCronJobFailure(
    jobId: string,
    jobName: string,
    error: string,
    userId: string
  ): Promise<void> {
    try {
      // Send in-app notification
      await notificationService.sendNotification(userId, {
        type: 'system_alert',
        title: '❌ Cron Job Failed',
        message: `Scheduled job "${jobName}" failed: ${error}`,
        severity: 'error',
        data: { job_id: jobId, job_name: jobName },
      });

      // Send email if enabled
      await this.sendEmailAlert(
        userId,
        'Cron Job Failed',
        `Scheduled job "${jobName}" (${jobId}) failed with error: ${error}`
      );

      // Log alert
      await this.logAlert(userId, 'cron_job_failure', {
        job_id: jobId,
        job_name: jobName,
        error,
      });
    } catch (error) {
      console.error('[Alerts] Failed to send cron job failure alert:', error);
    }
  }

  /**
   * Alert on system health issue
   */
  async alertSystemHealthIssue(
    component: string,
    status: string,
    message: string,
    userId: string
  ): Promise<void> {
    try {
      // Send in-app notification
      await notificationService.sendNotification(userId, {
        type: 'system_alert',
        title: `⚠️ System Health Issue: ${component}`,
        message: message,
        severity: 'warning',
        data: { component, status },
      });

      // Send email if enabled
      await this.sendEmailAlert(
        userId,
        `System Health Alert: ${component}`,
        `${component} status: ${status}\n\nDetails: ${message}`
      );

      // Log alert
      await this.logAlert(userId, 'system_health', {
        component,
        status,
        message,
      });
    } catch (error) {
      console.error('[Alerts] Failed to send system health alert:', error);
    }
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(
    userId: string,
    subject: string,
    body: string
  ): Promise<void> {
    try {
      if (!this.emailTransporter) {
        console.warn('[Alerts] Email transporter not available');
        return;
      }

      const db = await getDb();
      const user = await db.get('SELECT email FROM users WHERE id = ?', [userId]);

      if (!user || !user.email) {
        console.warn('[Alerts] User email not found');
        return;
      }

      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@qumus.manus.space',
        to: user.email,
        subject: `[QUMUS Alert] ${subject}`,
        html: `
          <h2>${subject}</h2>
          <p>${body.replace(/\n/g, '<br>')}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated alert from QUMUS Ecosystem.
            <br>
            <a href="https://qumus.manus.space/settings/alerts">Manage Alert Settings</a>
          </p>
        `,
      });

      console.log(`[Alerts] Email sent to ${user.email}`);
    } catch (error) {
      console.error('[Alerts] Failed to send email:', error);
    }
  }

  /**
   * Log alert for audit trail
   */
  private async logAlert(
    userId: string,
    alertType: string,
    data: any
  ): Promise<void> {
    try {
      const db = await getDb();
      await db.run(
        `INSERT INTO alert_logs (user_id, alert_type, data, created_at)
         VALUES (?, ?, ?, ?)`,
        [userId, alertType, JSON.stringify(data), Date.now()]
      );
    } catch (error) {
      console.error('[Alerts] Failed to log alert:', error);
    }
  }

  /**
   * Get alert statistics
   */
  async getAlertStats(userId: string, days: number = 7) {
    try {
      const db = await getDb();
      const startTime = Date.now() - days * 24 * 60 * 60 * 1000;

      const stats = await db.get(
        `SELECT 
          COUNT(*) as total_alerts,
          COUNT(CASE WHEN alert_type = 'webhook_failure' THEN 1 END) as webhook_failures,
          COUNT(CASE WHEN alert_type = 'credential_expiration' THEN 1 END) as credential_expirations,
          COUNT(CASE WHEN alert_type = 'cron_job_failure' THEN 1 END) as cron_failures,
          COUNT(CASE WHEN alert_type = 'system_health' THEN 1 END) as system_health_issues
         FROM alert_logs WHERE user_id = ? AND created_at > ?`,
        [userId, startTime]
      );

      return stats || {
        total_alerts: 0,
        webhook_failures: 0,
        credential_expirations: 0,
        cron_failures: 0,
        system_health_issues: 0,
      };
    } catch (error) {
      console.error('[Alerts] Failed to get alert stats:', error);
      return {
        total_alerts: 0,
        webhook_failures: 0,
        credential_expirations: 0,
        cron_failures: 0,
        system_health_issues: 0,
      };
    }
  }

  /**
   * Get alert history
   */
  async getAlertHistory(userId: string, limit: number = 50) {
    try {
      const db = await getDb();
      return await db.all(
        `SELECT * FROM alert_logs 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [userId, limit]
      );
    } catch (error) {
      console.error('[Alerts] Failed to get alert history:', error);
      return [];
    }
  }

  /**
   * Update alert configuration
   */
  async updateAlertConfig(userId: string, config: Partial<AlertConfig>): Promise<void> {
    try {
      const db = await getDb();
      await db.run(
        `INSERT OR REPLACE INTO alert_config (user_id, config, updated_at)
         VALUES (?, ?, ?)`,
        [userId, JSON.stringify(config), Date.now()]
      );

      console.log(`[Alerts] Updated alert config for user ${userId}`);
    } catch (error) {
      console.error('[Alerts] Failed to update alert config:', error);
    }
  }

  /**
   * Get alert configuration
   */
  async getAlertConfig(userId: string): Promise<AlertConfig> {
    try {
      const db = await getDb();
      const config = await db.get(
        'SELECT config FROM alert_config WHERE user_id = ?',
        [userId]
      );

      if (config) {
        return JSON.parse(config.config);
      }

      // Return default config
      return {
        webhook_failures: true,
        credential_expiration: true,
        cron_job_failures: true,
        system_health: true,
        email_alerts: true,
        sms_alerts: false,
      };
    } catch (error) {
      console.error('[Alerts] Failed to get alert config:', error);
      return {
        webhook_failures: true,
        credential_expiration: true,
        cron_job_failures: true,
        system_health: true,
        email_alerts: true,
        sms_alerts: false,
      };
    }
  }
}

export const monitoringAlertsService = new MonitoringAlertsService();
