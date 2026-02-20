/**
 * Push Notifications Service
 * Real-time alerts and engagement tracking
 */

interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  auth: string;
  p256dh: string;
  createdAt: Date;
  active: boolean;
}

interface Notification {
  id: string;
  userId: string;
  type: 'broadcast' | 'superchat' | 'qa_answer' | 'follower' | 'merchandise' | 'event' | 'system';
  title: string;
  message: string;
  data: Record<string, any>;
  sentAt: Date;
  read: boolean;
  actionUrl?: string;
}

interface NotificationPreference {
  userId: string;
  broadcastNotifications: boolean;
  superChatNotifications: boolean;
  qaAnswerNotifications: boolean;
  followerNotifications: boolean;
  merchandiseNotifications: boolean;
  eventNotifications: boolean;
  quietHours: { start: string; end: string } | null;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

interface NotificationCampaign {
  id: string;
  name: string;
  type: 'broadcast' | 'promotion' | 'announcement' | 'event';
  title: string;
  message: string;
  targetAudience: 'all' | 'subscribers' | 'followers' | 'custom';
  scheduledFor: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  sentCount: number;
  openRate: number;
  clickRate: number;
}

interface EngagementMetrics {
  userId: string;
  notificationsSent: number;
  notificationsRead: number;
  notificationsClicked: number;
  readRate: number;
  clickRate: number;
  lastEngagement: Date;
  preferredNotificationType: string;
}

class PushNotificationService {
  private subscriptions: Map<string, PushSubscription> = new Map();
  private notifications: Map<string, Notification[]> = new Map();
  private preferences: Map<string, NotificationPreference> = new Map();
  private campaigns: Map<string, NotificationCampaign> = new Map();
  private metrics: Map<string, EngagementMetrics> = new Map();

  /**
   * Subscribe user to push notifications
   */
  subscribe(
    userId: string,
    endpoint: string,
    auth: string,
    p256dh: string
  ): PushSubscription {
    const subscription: PushSubscription = {
      id: `sub_${Date.now()}_${Math.random()}`,
      userId,
      endpoint,
      auth,
      p256dh,
      createdAt: new Date(),
      active: true,
    };

    this.subscriptions.set(subscription.id, subscription);

    // Initialize preferences if not exists
    if (!this.preferences.has(userId)) {
      this.initializePreferences(userId);
    }

    return subscription;
  }

  /**
   * Unsubscribe user from push notifications
   */
  unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.active = false;
      return true;
    }
    return false;
  }

  /**
   * Initialize notification preferences
   */
  private initializePreferences(userId: string): void {
    const preferences: NotificationPreference = {
      userId,
      broadcastNotifications: true,
      superChatNotifications: true,
      qaAnswerNotifications: true,
      followerNotifications: true,
      merchandiseNotifications: true,
      eventNotifications: true,
      quietHours: null,
      emailNotifications: true,
      pushNotifications: true,
    };

    this.preferences.set(userId, preferences);
  }

  /**
   * Send notification to user
   */
  async sendNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    data: Record<string, any> = {},
    actionUrl?: string
  ): Promise<Notification | null> {
    const preferences = this.preferences.get(userId);
    if (!preferences) {
      this.initializePreferences(userId);
    }

    // Check if notification type is enabled
    if (!this.isNotificationTypeEnabled(userId, type)) {
      return null;
    }

    // Check quiet hours
    if (this.isInQuietHours(userId)) {
      return null;
    }

    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random()}`,
      userId,
      type,
      title,
      message,
      data,
      sentAt: new Date(),
      read: false,
      actionUrl,
    };

    // Store notification
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }
    this.notifications.get(userId)!.push(notification);

    // Update metrics
    this.updateMetrics(userId, 'sent');

    // Send push notification
    await this.sendPushNotification(userId, notification);

    return notification;
  }

  /**
   * Send broadcast notification
   */
  async sendBroadcastNotification(
    broadcastId: string,
    broadcastTitle: string,
    operatorName: string,
    targetUserIds: string[]
  ): Promise<number> {
    let sentCount = 0;

    for (const userId of targetUserIds) {
      const result = await this.sendNotification(
        userId,
        'broadcast',
        `${operatorName} is live!`,
        `Watch ${broadcastTitle} now`,
        { broadcastId, operatorName },
        `/broadcast/${broadcastId}`
      );

      if (result) sentCount++;
    }

    return sentCount;
  }

  /**
   * Send super chat notification
   */
  async sendSuperChatNotification(
    userId: string,
    senderName: string,
    amount: number,
    message: string
  ): Promise<Notification | null> {
    return this.sendNotification(
      userId,
      'superchat',
      `${senderName} sent a Super Chat!`,
      `${senderName} sent $${amount}: "${message}"`,
      { senderName, amount, message }
    );
  }

  /**
   * Send Q&A answer notification
   */
  async sendQAAnswerNotification(
    userId: string,
    question: string,
    answer: string
  ): Promise<Notification | null> {
    return this.sendNotification(
      userId,
      'qa_answer',
      'Your question was answered!',
      `Answer: ${answer.substring(0, 50)}...`,
      { question, answer }
    );
  }

  /**
   * Send event notification
   */
  async sendEventNotification(
    userId: string,
    eventName: string,
    eventTime: Date
  ): Promise<Notification | null> {
    return this.sendNotification(
      userId,
      'event',
      `Upcoming: ${eventName}`,
      `Don't miss ${eventName} at ${eventTime.toLocaleTimeString()}`,
      { eventName, eventTime }
    );
  }

  /**
   * Check if notification type is enabled
   */
  private isNotificationTypeEnabled(userId: string, type: string): boolean {
    const preferences = this.preferences.get(userId);
    if (!preferences) return true;

    switch (type) {
      case 'broadcast':
        return preferences.broadcastNotifications;
      case 'superchat':
        return preferences.superChatNotifications;
      case 'qa_answer':
        return preferences.qaAnswerNotifications;
      case 'follower':
        return preferences.followerNotifications;
      case 'merchandise':
        return preferences.merchandiseNotifications;
      case 'event':
        return preferences.eventNotifications;
      default:
        return true;
    }
  }

  /**
   * Check if in quiet hours
   */
  private isInQuietHours(userId: string): boolean {
    const preferences = this.preferences.get(userId);
    if (!preferences || !preferences.quietHours) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMin] = preferences.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = preferences.quietHours.end.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime < endTime;
    } else {
      return currentTime >= startTime || currentTime < endTime;
    }
  }

  /**
   * Send push notification via service worker
   */
  private async sendPushNotification(userId: string, notification: Notification): Promise<void> {
    const userSubscriptions = Array.from(this.subscriptions.values()).filter(
      (s) => s.userId === userId && s.active
    );

    for (const subscription of userSubscriptions) {
      try {
        // In production, this would use the Web Push API
        // For now, we simulate the send
        console.log(`[Push] Sending to ${subscription.endpoint}: ${notification.title}`);
      } catch (error) {
        console.error(`[Push] Failed to send notification: ${error}`);
      }
    }
  }

  /**
   * Mark notification as read
   */
  markAsRead(userId: string, notificationId: string): boolean {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) return false;

    const notification = userNotifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.updateMetrics(userId, 'read');
      return true;
    }

    return false;
  }

  /**
   * Get user notifications
   */
  getNotifications(userId: string, limit: number = 50): Notification[] {
    const notifications = this.notifications.get(userId) || [];
    return notifications.slice(-limit).reverse();
  }

  /**
   * Get unread notification count
   */
  getUnreadCount(userId: string): number {
    const notifications = this.notifications.get(userId) || [];
    return notifications.filter((n) => !n.read).length;
  }

  /**
   * Update notification preferences
   */
  updatePreferences(userId: string, updates: Partial<NotificationPreference>): NotificationPreference {
    let preferences = this.preferences.get(userId);
    if (!preferences) {
      this.initializePreferences(userId);
      preferences = this.preferences.get(userId)!;
    }

    const updated = { ...preferences, ...updates };
    this.preferences.set(userId, updated);
    return updated;
  }

  /**
   * Get notification preferences
   */
  getPreferences(userId: string): NotificationPreference {
    let preferences = this.preferences.get(userId);
    if (!preferences) {
      this.initializePreferences(userId);
      preferences = this.preferences.get(userId)!;
    }
    return preferences;
  }

  /**
   * Create notification campaign
   */
  createCampaign(
    name: string,
    type: NotificationCampaign['type'],
    title: string,
    message: string,
    targetAudience: NotificationCampaign['targetAudience'],
    scheduledFor: Date
  ): NotificationCampaign {
    const campaign: NotificationCampaign = {
      id: `campaign_${Date.now()}_${Math.random()}`,
      name,
      type,
      title,
      message,
      targetAudience,
      scheduledFor,
      status: 'draft',
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
    };

    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  /**
   * Get campaigns
   */
  getCampaigns(): NotificationCampaign[] {
    return Array.from(this.campaigns.values());
  }

  /**
   * Update metrics
   */
  private updateMetrics(userId: string, action: 'sent' | 'read' | 'clicked'): void {
    let metrics = this.metrics.get(userId);
    if (!metrics) {
      metrics = {
        userId,
        notificationsSent: 0,
        notificationsRead: 0,
        notificationsClicked: 0,
        readRate: 0,
        clickRate: 0,
        lastEngagement: new Date(),
        preferredNotificationType: 'broadcast',
      };
      this.metrics.set(userId, metrics);
    }

    switch (action) {
      case 'sent':
        metrics.notificationsSent++;
        break;
      case 'read':
        metrics.notificationsRead++;
        metrics.readRate = (metrics.notificationsRead / metrics.notificationsSent) * 100;
        metrics.lastEngagement = new Date();
        break;
      case 'clicked':
        metrics.notificationsClicked++;
        metrics.clickRate = (metrics.notificationsClicked / metrics.notificationsSent) * 100;
        metrics.lastEngagement = new Date();
        break;
    }
  }

  /**
   * Get engagement metrics
   */
  getMetrics(userId: string): EngagementMetrics | null {
    return this.metrics.get(userId) || null;
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): EngagementMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Clear old notifications
   */
  clearOldNotifications(daysOld: number = 30): number {
    let cleared = 0;
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    for (const [userId, notifications] of this.notifications.entries()) {
      const filtered = notifications.filter((n) => n.sentAt > cutoffDate);
      if (filtered.length < notifications.length) {
        cleared += notifications.length - filtered.length;
        this.notifications.set(userId, filtered);
      }
    }

    return cleared;
  }
}

export const pushNotificationService = new PushNotificationService();
