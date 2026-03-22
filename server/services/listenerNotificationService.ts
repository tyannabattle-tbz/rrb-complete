/**
 * Listener Notification Service
 * Manages email/SMS alerts for favorite channels, new episodes, and sponsorships
 */

export interface NotificationPreference {
  listenerId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  favoriteChannelAlerts: boolean;
  newEpisodeAlerts: boolean;
  sponsorshipAlerts: boolean;
  dailyDigest: boolean;
  notificationFrequency: 'immediate' | 'daily' | 'weekly' | 'never';
}

export interface Notification {
  id: string;
  listenerId: string;
  type: 'favorite_channel' | 'new_episode' | 'sponsorship' | 'event' | 'system';
  title: string;
  message: string;
  channel?: string;
  episode?: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  sentAt?: Date;
}

class ListenerNotificationService {
  private preferences: Map<string, NotificationPreference> = new Map();
  private notifications: Map<string, Notification[]> = new Map();
  private notificationQueue: Notification[] = [];

  /**
   * Create or update notification preferences
   */
  setNotificationPreferences(listenerId: string, prefs: Partial<NotificationPreference>): NotificationPreference {
    const existing = this.preferences.get(listenerId) || {
      listenerId,
      emailNotifications: true,
      smsNotifications: false,
      favoriteChannelAlerts: true,
      newEpisodeAlerts: true,
      sponsorshipAlerts: true,
      dailyDigest: false,
      notificationFrequency: 'immediate',
    };

    const updated = { ...existing, ...prefs };
    this.preferences.set(listenerId, updated);
    return updated;
  }

  /**
   * Get notification preferences
   */
  getNotificationPreferences(listenerId: string): NotificationPreference {
    return (
      this.preferences.get(listenerId) || {
        listenerId,
        emailNotifications: true,
        smsNotifications: false,
        favoriteChannelAlerts: true,
        newEpisodeAlerts: true,
        sponsorshipAlerts: true,
        dailyDigest: false,
        notificationFrequency: 'immediate',
      }
    );
  }

  /**
   * Send favorite channel alert
   */
  sendFavoriteChannelAlert(listenerId: string, channelName: string, status: 'live' | 'offline'): Notification | null {
    const prefs = this.getNotificationPreferences(listenerId);
    if (!prefs.favoriteChannelAlerts) return null;

    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      listenerId,
      type: 'favorite_channel',
      title: `${channelName} is now ${status}`,
      message: `Your favorite channel ${channelName} is now ${status}. ${status === 'live' ? 'Tune in now!' : ''}`,
      channel: channelName,
      read: false,
      createdAt: new Date(),
    };

    this.addNotification(listenerId, notification);
    if (prefs.notificationFrequency === 'immediate') {
      this.queueNotification(notification);
    }

    return notification;
  }

  /**
   * Send new episode alert
   */
  sendNewEpisodeAlert(
    listenerId: string,
    podcastTitle: string,
    episodeTitle: string,
    episodeLink?: string
  ): Notification | null {
    const prefs = this.getNotificationPreferences(listenerId);
    if (!prefs.newEpisodeAlerts) return null;

    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      listenerId,
      type: 'new_episode',
      title: `New episode: ${episodeTitle}`,
      message: `A new episode of ${podcastTitle} is available: "${episodeTitle}"`,
      episode: episodeTitle,
      link: episodeLink,
      read: false,
      createdAt: new Date(),
    };

    this.addNotification(listenerId, notification);
    if (prefs.notificationFrequency === 'immediate') {
      this.queueNotification(notification);
    }

    return notification;
  }

  /**
   * Send sponsorship alert
   */
  sendSponsorshipAlert(
    listenerId: string,
    sponsorName: string,
    offer: string,
    link?: string
  ): Notification | null {
    const prefs = this.getNotificationPreferences(listenerId);
    if (!prefs.sponsorshipAlerts) return null;

    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      listenerId,
      type: 'sponsorship',
      title: `Special offer from ${sponsorName}`,
      message: `${sponsorName} has a special offer for our listeners: ${offer}`,
      link,
      read: false,
      createdAt: new Date(),
    };

    this.addNotification(listenerId, notification);
    if (prefs.notificationFrequency === 'immediate') {
      this.queueNotification(notification);
    }

    return notification;
  }

  /**
   * Send event alert
   */
  sendEventAlert(listenerId: string, eventTitle: string, eventDetails: string, link?: string): Notification | null {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      listenerId,
      type: 'event',
      title: eventTitle,
      message: eventDetails,
      link,
      read: false,
      createdAt: new Date(),
    };

    this.addNotification(listenerId, notification);
    this.queueNotification(notification);

    return notification;
  }

  /**
   * Add notification to listener's list
   */
  private addNotification(listenerId: string, notification: Notification): void {
    const userNotifications = this.notifications.get(listenerId) || [];
    userNotifications.push(notification);
    this.notifications.set(listenerId, userNotifications);
  }

  /**
   * Queue notification for sending
   */
  private queueNotification(notification: Notification): void {
    this.notificationQueue.push(notification);
  }

  /**
   * Get all notifications for a listener
   */
  getNotifications(listenerId: string, limit: number = 50): Notification[] {
    const userNotifications = this.notifications.get(listenerId) || [];
    return userNotifications.slice(-limit).reverse();
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(listenerId: string): Notification[] {
    const userNotifications = this.notifications.get(listenerId) || [];
    return userNotifications.filter((n) => !n.read);
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): boolean {
    for (const notifications of this.notifications.values()) {
      const notif = notifications.find((n) => n.id === notificationId);
      if (notif) {
        notif.read = true;
        return true;
      }
    }
    return false;
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(listenerId: string): number {
    const userNotifications = this.notifications.get(listenerId) || [];
    let count = 0;
    userNotifications.forEach((n) => {
      if (!n.read) {
        n.read = true;
        count++;
      }
    });
    return count;
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId: string): boolean {
    for (const [listenerId, notifications] of this.notifications.entries()) {
      const index = notifications.findIndex((n) => n.id === notificationId);
      if (index > -1) {
        notifications.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Get notification statistics
   */
  getStatistics(listenerId: string): {
    totalNotifications: number;
    unreadCount: number;
    byType: Record<string, number>;
  } {
    const userNotifications = this.notifications.get(listenerId) || [];
    const unreadCount = userNotifications.filter((n) => !n.read).length;

    const byType: Record<string, number> = {
      favorite_channel: 0,
      new_episode: 0,
      sponsorship: 0,
      event: 0,
      system: 0,
    };

    userNotifications.forEach((n) => {
      byType[n.type]++;
    });

    return {
      totalNotifications: userNotifications.length,
      unreadCount,
      byType,
    };
  }

  /**
   * Get queued notifications (for batch sending)
   */
  getQueuedNotifications(limit: number = 100): Notification[] {
    return this.notificationQueue.splice(0, limit);
  }

  /**
   * Get notification queue size
   */
  getQueueSize(): number {
    return this.notificationQueue.length;
  }

  /**
   * Create daily digest
   */
  createDailyDigest(listenerId: string): {
    title: string;
    notifications: Notification[];
    summary: string;
  } {
    const userNotifications = this.notifications.get(listenerId) || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayNotifications = userNotifications.filter((n) => {
      const notifDate = new Date(n.createdAt);
      notifDate.setHours(0, 0, 0, 0);
      return notifDate.getTime() === today.getTime();
    });

    const summary = `You have ${todayNotifications.length} notifications today`;

    return {
      title: `Daily Digest - ${today.toLocaleDateString()}`,
      notifications: todayNotifications,
      summary,
    };
  }
}

export const listenerNotificationService = new ListenerNotificationService();
