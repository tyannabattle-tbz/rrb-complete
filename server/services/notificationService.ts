import { getDb } from '../db';
import { v4 as uuid } from 'uuid';

export interface Notification {
  id: string;
  userId: string;
  type: 'task_completed' | 'task_failed' | 'command_executed' | 'system_alert' | 'ecosystem_status';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  data?: Record<string, any>;
  createdAt: number;
  expiresAt?: number;
}

class NotificationService {
  private notifications: Map<string, Notification[]> = new Map();
  private subscribers: Map<string, Set<(notification: Notification) => void>> = new Map();

  /**
   * Send notification to user
   */
  async sendNotification(
    userId: string,
    notification: Omit<Notification, 'id' | 'createdAt' | 'read'>
  ): Promise<Notification> {
    const fullNotification: Notification = {
      ...notification,
      id: uuid(),
      read: false,
      createdAt: Date.now(),
    };

    // Store in memory
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }
    this.notifications.get(userId)!.push(fullNotification);

    // Persist to database
    try {
      const db = await getDb();
      await db.run(
        `INSERT INTO notifications (id, user_id, type, title, message, severity, data, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fullNotification.id,
          userId,
          fullNotification.type,
          fullNotification.title,
          fullNotification.message,
          fullNotification.severity,
          JSON.stringify(fullNotification.data || {}),
          fullNotification.createdAt,
          fullNotification.expiresAt,
        ]
      );
    } catch (error) {
      console.error('Failed to persist notification:', error);
    }

    // Notify subscribers
    this.notifySubscribers(userId, fullNotification);

    return fullNotification;
  }

  /**
   * Get notifications for user
   */
  async getNotifications(userId: string, limit = 50): Promise<Notification[]> {
    try {
      const db = await getDb();
      const rows = await db.all(
        `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
        [userId, limit]
      );

      return rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        type: row.type,
        title: row.title,
        message: row.message,
        severity: row.severity,
        read: row.read === 1,
        data: row.data ? JSON.parse(row.data) : undefined,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
      }));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const db = await getDb();
      await db.run(
        `UPDATE notifications SET read = 1 WHERE id = ?`,
        [notificationId]
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const db = await getDb();
      await db.run(
        `UPDATE notifications SET read = 1 WHERE user_id = ?`,
        [userId]
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const db = await getDb();
      await db.run(
        `DELETE FROM notifications WHERE id = ?`,
        [notificationId]
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }

  /**
   * Subscribe to real-time notifications
   */
  subscribe(userId: string, callback: (notification: Notification) => void): () => void {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, new Set());
    }
    this.subscribers.get(userId)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(userId)?.delete(callback);
    };
  }

  /**
   * Notify all subscribers
   */
  private notifySubscribers(userId: string, notification: Notification): void {
    const callbacks = this.subscribers.get(userId);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(notification);
        } catch (error) {
          console.error('Error in notification callback:', error);
        }
      });
    }
  }

  /**
   * Send task completion notification
   */
  async notifyTaskCompleted(userId: string, taskId: string, taskGoal: string, executionTime: number): Promise<void> {
    await this.sendNotification(userId, {
      type: 'task_completed',
      title: 'Task Completed',
      message: `Autonomous task completed in ${(executionTime / 1000).toFixed(2)}s`,
      severity: 'success',
      data: { taskId, taskGoal, executionTime },
    });
  }

  /**
   * Send task failure notification
   */
  async notifyTaskFailed(userId: string, taskId: string, taskGoal: string, error: string): Promise<void> {
    await this.sendNotification(userId, {
      type: 'task_failed',
      title: 'Task Failed',
      message: `Task failed: ${error}`,
      severity: 'error',
      data: { taskId, taskGoal, error },
    });
  }

  /**
   * Send command execution notification
   */
  async notifyCommandExecuted(userId: string, ecosystem: string, command: string, success: boolean): Promise<void> {
    await this.sendNotification(userId, {
      type: 'command_executed',
      title: `${ecosystem} Command ${success ? 'Executed' : 'Failed'}`,
      message: `Command "${command}" on ${ecosystem}`,
      severity: success ? 'success' : 'error',
      data: { ecosystem, command, success },
    });
  }

  /**
   * Send system alert
   */
  async notifySystemAlert(userId: string, title: string, message: string, severity: 'warning' | 'error' = 'warning'): Promise<void> {
    await this.sendNotification(userId, {
      type: 'system_alert',
      title,
      message,
      severity,
    });
  }

  /**
   * Send ecosystem status notification
   */
  async notifyEcosystemStatus(userId: string, ecosystem: string, status: 'online' | 'offline' | 'degraded'): Promise<void> {
    const severityMap = {
      online: 'success' as const,
      offline: 'error' as const,
      degraded: 'warning' as const,
    };

    await this.sendNotification(userId, {
      type: 'ecosystem_status',
      title: `${ecosystem} Status Changed`,
      message: `${ecosystem} is now ${status}`,
      severity: severityMap[status],
      data: { ecosystem, status },
    });
  }
}

export const notificationService = new NotificationService();
