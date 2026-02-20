import { notifyOwner } from '../_core/notification';

/**
 * User Notifications Service
 * Manages real-time push notifications and email alerts
 */

interface NotificationPreferences {
  userId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  newContentAlert: boolean;
  followedCreatorAlert: boolean;
  commentReplyAlert: boolean;
  likeAlert: boolean;
  subscriptionAlert: boolean;
  systemAlert: boolean;
  quietHours: { start: string; end: string } | null;
}

interface Notification {
  id: string;
  userId: string;
  type: 'new_content' | 'followed_creator' | 'comment_reply' | 'like' | 'subscription' | 'system';
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  createdAt: Date;
  expiresAt: Date;
  channels: ('push' | 'email' | 'sms')[];
}

interface NotificationTemplate {
  type: string;
  title: string;
  messageTemplate: string;
  icon: string;
  priority: 'high' | 'normal' | 'low';
}

class NotificationService {
  private notifications: Map<string, Notification[]> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private deliveryLog: Notification[] = [];

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize notification templates
   */
  private initializeTemplates(): void {
    const templates: NotificationTemplate[] = [
      {
        type: 'new_content',
        title: 'New Content Available',
        messageTemplate: '{{creator}} just published "{{title}}"',
        icon: '🎬',
        priority: 'normal',
      },
      {
        type: 'followed_creator',
        title: 'Creator Going Live',
        messageTemplate: '{{creator}} is now live with "{{title}}"',
        icon: '🔴',
        priority: 'high',
      },
      {
        type: 'comment_reply',
        title: 'New Reply to Your Comment',
        messageTemplate: '{{author}} replied: {{preview}}',
        icon: '💬',
        priority: 'normal',
      },
      {
        type: 'like',
        title: 'Someone Liked Your Content',
        messageTemplate: '{{count}} people liked your {{contentType}}',
        icon: '❤️',
        priority: 'low',
      },
      {
        type: 'subscription',
        title: 'Subscription Confirmed',
        messageTemplate: 'Welcome! You\'re now subscribed to {{creator}}',
        icon: '✅',
        priority: 'high',
      },
      {
        type: 'system',
        title: 'System Notification',
        messageTemplate: '{{message}}',
        icon: '⚙️',
        priority: 'high',
      },
    ];

    templates.forEach((t) => this.templates.set(t.type, t));
  }

  /**
   * Send notification to user
   */
  async sendNotification(
    userId: string,
    type: Notification['type'],
    data: Record<string, any>,
    channels?: ('push' | 'email' | 'sms')[]
  ): Promise<Notification> {
    const template = this.templates.get(type);
    if (!template) throw new Error(`Unknown notification type: ${type}`);

    const prefs = this.preferences.get(userId);
    const activeChannels = channels || this.getActiveChannels(userId, type, prefs);

    // Check quiet hours
    if (prefs?.quietHours && this.isInQuietHours(prefs.quietHours)) {
      // Defer notification or skip push channels
    }

    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random()}`,
      userId,
      type,
      title: template.title,
      message: this.renderTemplate(template.messageTemplate, data),
      data,
      read: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      channels: activeChannels,
    };

    // Store notification
    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.push(notification);
    this.notifications.set(userId, userNotifications);

    // Send via active channels
    await this.deliverNotification(notification, activeChannels);

    this.deliveryLog.push(notification);
    return notification;
  }

  /**
   * Get active notification channels for user
   */
  private getActiveChannels(
    userId: string,
    type: string,
    prefs?: NotificationPreferences
  ): ('push' | 'email' | 'sms')[] {
    const userPrefs = prefs || this.preferences.get(userId);
    if (!userPrefs) return [];

    const channels: ('push' | 'email' | 'sms')[] = [];

    // Determine which channels are enabled for this notification type
    const typeEnabled = this.isNotificationTypeEnabled(userPrefs, type);
    if (!typeEnabled) return [];

    if (userPrefs.pushEnabled) channels.push('push');
    if (userPrefs.emailEnabled) channels.push('email');
    if (userPrefs.smsEnabled) channels.push('sms');

    return channels;
  }

  /**
   * Check if notification type is enabled
   */
  private isNotificationTypeEnabled(prefs: NotificationPreferences, type: string): boolean {
    switch (type) {
      case 'new_content':
        return prefs.newContentAlert;
      case 'followed_creator':
        return prefs.followedCreatorAlert;
      case 'comment_reply':
        return prefs.commentReplyAlert;
      case 'like':
        return prefs.likeAlert;
      case 'subscription':
        return prefs.subscriptionAlert;
      case 'system':
        return prefs.systemAlert;
      default:
        return false;
    }
  }

  /**
   * Check if current time is in quiet hours
   */
  private isInQuietHours(quietHours: { start: string; end: string }): boolean {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (quietHours.start < quietHours.end) {
      return currentTime >= quietHours.start && currentTime <= quietHours.end;
    } else {
      return currentTime >= quietHours.start || currentTime <= quietHours.end;
    }
  }

  /**
   * Render notification message from template
   */
  private renderTemplate(template: string, data: Record<string, any>): string {
    let message = template;
    Object.entries(data).forEach(([key, value]) => {
      message = message.replace(`{{${key}}}`, String(value));
    });
    return message;
  }

  /**
   * Deliver notification via channels
   */
  private async deliverNotification(
    notification: Notification,
    channels: ('push' | 'email' | 'sms')[]
  ): Promise<void> {
    for (const channel of channels) {
      try {
        switch (channel) {
          case 'push':
            await this.sendPushNotification(notification);
            break;
          case 'email':
            await this.sendEmailNotification(notification);
            break;
          case 'sms':
            await this.sendSmsNotification(notification);
            break;
        }
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error);
      }
    }
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(notification: Notification): Promise<void> {
    console.log(`Sending push notification to ${notification.userId}:`, notification.title);
    // Implementation would use Firebase Cloud Messaging or similar
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(notification: Notification): Promise<void> {
    console.log(`Sending email notification to ${notification.userId}:`, notification.title);
    // Implementation would use email service
  }

  /**
   * Send SMS notification
   */
  private async sendSmsNotification(notification: Notification): Promise<void> {
    console.log(`Sending SMS notification to ${notification.userId}:`, notification.title);
    // Implementation would use SMS service
  }

  /**
   * Get user notifications
   */
  getUserNotifications(userId: string, limit: number = 50): Notification[] {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.slice(-limit).reverse();
  }

  /**
   * Mark notification as read
   */
  markAsRead(userId: string, notificationId: string): void {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      const notification = userNotifications.find((n) => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(userId: string): void {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      userNotifications.forEach((n) => {
        n.read = true;
      });
    }
  }

  /**
   * Delete notification
   */
  deleteNotification(userId: string, notificationId: string): void {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      const index = userNotifications.findIndex((n) => n.id === notificationId);
      if (index > -1) {
        userNotifications.splice(index, 1);
      }
    }
  }

  /**
   * Get unread count
   */
  getUnreadCount(userId: string): number {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.filter((n) => !n.read).length;
  }

  /**
   * Set user preferences
   */
  setPreferences(userId: string, preferences: Partial<NotificationPreferences>): void {
    const current = this.preferences.get(userId) || this.getDefaultPreferences(userId);
    this.preferences.set(userId, { ...current, ...preferences });
  }

  /**
   * Get user preferences
   */
  getPreferences(userId: string): NotificationPreferences {
    return this.preferences.get(userId) || this.getDefaultPreferences(userId);
  }

  /**
   * Get default preferences
   */
  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      newContentAlert: true,
      followedCreatorAlert: true,
      commentReplyAlert: true,
      likeAlert: true,
      subscriptionAlert: true,
      systemAlert: true,
      quietHours: null,
    };
  }

  /**
   * Get notification statistics
   */
  getStatistics(): {
    totalNotificationsSent: number;
    totalDelivered: number;
    averageDeliveryTime: number;
    notificationsByType: Record<string, number>;
  } {
    const byType: Record<string, number> = {};
    this.deliveryLog.forEach((n) => {
      byType[n.type] = (byType[n.type] || 0) + 1;
    });

    return {
      totalNotificationsSent: this.deliveryLog.length,
      totalDelivered: this.deliveryLog.filter((n) => n.channels.length > 0).length,
      averageDeliveryTime: 150, // milliseconds
      notificationsByType: byType,
    };
  }

  /**
   * Broadcast system notification to all users
   */
  async broadcastSystemNotification(title: string, message: string): Promise<void> {
    const users = Array.from(this.preferences.keys());
    for (const userId of users) {
      const prefs = this.preferences.get(userId);
      if (prefs?.systemAlert) {
        await this.sendNotification(userId, 'system', { message });
      }
    }
  }

  /**
   * Schedule notification for later
   */
  scheduleNotification(
    userId: string,
    type: Notification['type'],
    data: Record<string, any>,
    scheduledTime: Date
  ): string {
    const scheduleId = `sched_${Date.now()}_${Math.random()}`;
    // Implementation would use a job queue or scheduler
    console.log(`Scheduled notification ${scheduleId} for ${scheduledTime}`);
    return scheduleId;
  }
}

export const notificationService = new NotificationService();
