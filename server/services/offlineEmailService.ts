/**
 * Offline Email Service
 * Handles email with SMTP, offline queue, and cloud fallback
 * Emails are queued locally and can be sent when connection is available
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import nodemailer from 'nodemailer';
import { offlineConfig } from '../config/offlineConfig';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);

export interface EmailMessage {
  id: string;
  to: string;
  subject: string;
  body: string;
  htmlBody?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
  createdAt: string;
  sentAt?: string;
  status: 'pending' | 'sent' | 'failed';
  retryCount: number;
}

class OfflineEmailService {
  private queuePath: string;
  private logPath: string;
  private smtpTransporter?: nodemailer.Transporter;
  private emailType: 'smtp' | 'sendgrid' | 'mailgun' | 'offline';

  constructor() {
    const config = offlineConfig;

    if (config.email.offline) {
      this.queuePath = config.email.offline.queuePath;
      this.logPath = config.email.offline.logPath;
    } else {
      const homeDir = process.env.HOME || '/tmp';
      this.queuePath = path.join(homeDir, '.qumus', 'email-queue');
      this.logPath = path.join(homeDir, '.qumus', 'emails');
    }

    this.emailType = config.email.type;

    // Initialize SMTP if configured
    if (config.email.type === 'smtp' && config.email.smtp) {
      this.smtpTransporter = nodemailer.createTransport({
        host: config.email.smtp.host,
        port: config.email.smtp.port,
        secure: config.email.smtp.secure,
        auth: config.email.smtp.auth,
      });
    }

    // Ensure directories exist
    this.ensureDirectories();
  }

  /**
   * Ensure queue and log directories exist
   */
  private async ensureDirectories(): Promise<void> {
    try {
      await mkdir(this.queuePath, { recursive: true });
      await mkdir(this.logPath, { recursive: true });
    } catch (error) {
      console.error('[OfflineEmail] Error creating directories:', error);
    }
  }

  /**
   * Send email or queue it if offline
   */
  async sendEmail(message: Omit<EmailMessage, 'id' | 'createdAt' | 'sentAt' | 'status' | 'retryCount'>): Promise<EmailMessage> {
    const email: EmailMessage = {
      ...message,
      id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
    };

    try {
      // Try to send immediately if SMTP is available
      if (this.smtpTransporter) {
        try {
          await this.smtpTransporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@qumus.local',
            to: email.to,
            subject: email.subject,
            text: email.body,
            html: email.htmlBody || email.body,
            attachments: email.attachments,
          });

          email.status = 'sent';
          email.sentAt = new Date().toISOString();

          // Log sent email
          await this.logEmail(email);

          return email;
        } catch (error) {
          console.warn('[OfflineEmail] SMTP send failed, queuing:', error);
        }
      }

      // Queue email for later sending
      await this.queueEmail(email);

      return email;
    } catch (error) {
      console.error('[OfflineEmail] Error sending email:', error);
      email.status = 'failed';
      await this.logEmail(email);
      throw error;
    }
  }

  /**
   * Queue email for later sending
   */
  private async queueEmail(email: EmailMessage): Promise<void> {
    try {
      const queueFile = path.join(this.queuePath, `${email.id}.json`);
      await writeFile(queueFile, JSON.stringify(email, null, 2));
      console.log(`[OfflineEmail] Email queued: ${email.id}`);
    } catch (error) {
      console.error('[OfflineEmail] Error queuing email:', error);
      throw error;
    }
  }

  /**
   * Log sent email
   */
  private async logEmail(email: EmailMessage): Promise<void> {
    try {
      const logFile = path.join(this.logPath, `${email.id}.json`);
      await writeFile(logFile, JSON.stringify(email, null, 2));
    } catch (error) {
      console.error('[OfflineEmail] Error logging email:', error);
    }
  }

  /**
   * Get queued emails
   */
  async getQueuedEmails(): Promise<EmailMessage[]> {
    try {
      const files = await readdir(this.queuePath);
      const emails: EmailMessage[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await readFile(path.join(this.queuePath, file), 'utf-8');
          emails.push(JSON.parse(content));
        }
      }

      return emails;
    } catch (error) {
      console.error('[OfflineEmail] Error getting queued emails:', error);
      return [];
    }
  }

  /**
   * Process queued emails (retry sending)
   */
  async processQueue(): Promise<{ sent: number; failed: number }> {
    const queuedEmails = await this.getQueuedEmails();
    let sent = 0;
    let failed = 0;

    for (const email of queuedEmails) {
      try {
        if (!this.smtpTransporter) {
          console.warn('[OfflineEmail] SMTP not configured, skipping queue processing');
          break;
        }

        // Skip if too many retries
        if (email.retryCount > 5) {
          console.warn(`[OfflineEmail] Email ${email.id} exceeded max retries`);
          failed++;
          continue;
        }

        // Try to send
        await this.smtpTransporter.sendMail({
          from: process.env.SMTP_FROM || 'noreply@qumus.local',
          to: email.to,
          subject: email.subject,
          text: email.body,
          html: email.htmlBody || email.body,
          attachments: email.attachments,
        });

        // Mark as sent
        email.status = 'sent';
        email.sentAt = new Date().toISOString();
        await this.logEmail(email);

        // Remove from queue
        await unlink(path.join(this.queuePath, `${email.id}.json`));

        sent++;
      } catch (error) {
        console.error(`[OfflineEmail] Error sending queued email ${email.id}:`, error);
        email.retryCount++;
        await this.queueEmail(email);
        failed++;
      }
    }

    return { sent, failed };
  }

  /**
   * Get email statistics
   */
  async getStats(): Promise<{
    queued: number;
    sent: number;
    failed: number;
    totalSize: number;
  }> {
    try {
      const queuedEmails = await this.getQueuedEmails();
      const logFiles = await readdir(this.logPath);

      let totalSize = 0;
      for (const file of logFiles) {
        const filePath = path.join(this.logPath, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      }

      return {
        queued: queuedEmails.length,
        sent: logFiles.length,
        failed: queuedEmails.filter((e) => e.status === 'failed').length,
        totalSize,
      };
    } catch (error) {
      console.error('[OfflineEmail] Error getting stats:', error);
      return { queued: 0, sent: 0, failed: 0, totalSize: 0 };
    }
  }

  /**
   * Clear old emails
   */
  async clearOldEmails(ageInDays: number): Promise<number> {
    try {
      const logFiles = await readdir(this.logPath);
      const cutoffTime = Date.now() - ageInDays * 24 * 60 * 60 * 1000;
      let deletedCount = 0;

      for (const file of logFiles) {
        const filePath = path.join(this.logPath, file);
        const stats = fs.statSync(filePath);

        if (stats.birthtime.getTime() < cutoffTime) {
          await unlink(filePath);
          deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      console.error('[OfflineEmail] Error clearing old emails:', error);
      return 0;
    }
  }
}

export const offlineEmailService = new OfflineEmailService();
