/**
 * DJ Show Notifications Service
 * Manages push notifications for DJ shows
 */

export interface DJShowNotification {
  id: string;
  djName: string;
  channelName: string;
  channelId: string;
  showTitle: string;
  startTime: number;
  notificationSent: boolean;
  reminderMinutes: number; // How many minutes before show to notify
}

class DJNotificationService {
  private notifications: Map<string, DJShowNotification> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;
  private notificationPermission: NotificationPermission = 'default';

  constructor() {
    this.requestNotificationPermission();
  }

  /**
   * Request permission for push notifications
   */
  private async requestNotificationPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      this.notificationPermission = 'granted';
    } else if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        this.notificationPermission = permission;
      } catch (error) {
        console.error('Failed to request notification permission:', error);
      }
    }
  }

  /**
   * Register a DJ show for notifications
   */
  registerShow(show: DJShowNotification) {
    this.notifications.set(show.id, {
      ...show,
      notificationSent: false,
    });

    // Start checking if not already started
    if (!this.checkInterval) {
      this.startNotificationChecks();
    }
  }

  /**
   * Unregister a DJ show
   */
  unregisterShow(showId: string) {
    this.notifications.delete(showId);

    // Stop checking if no more shows
    if (this.notifications.size === 0 && this.checkInterval) {
      this.stopNotificationChecks();
    }
  }

  /**
   * Start checking for upcoming shows
   */
  private startNotificationChecks() {
    this.checkInterval = setInterval(() => {
      this.checkUpcomingShows();
    }, 60000); // Check every minute
  }

  /**
   * Stop checking for upcoming shows
   */
  private stopNotificationChecks() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check for upcoming shows and send notifications
   */
  private checkUpcomingShows() {
    const now = Date.now();

    this.notifications.forEach((show, showId) => {
      if (show.notificationSent) return; // Already sent

      const timeUntilShow = show.startTime - now;
      const minutesUntilShow = timeUntilShow / (1000 * 60);

      // Send notification if within reminder window
      if (minutesUntilShow <= show.reminderMinutes && minutesUntilShow > 0) {
        this.sendNotification(show);
        show.notificationSent = true;
      }

      // Remove if show has started
      if (minutesUntilShow <= 0) {
        this.unregisterShow(showId);
      }
    });
  }

  /**
   * Send push notification
   */
  private sendNotification(show: DJShowNotification) {
    if (this.notificationPermission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    const title = `🎙️ ${show.djName} is going live!`;
    const options: NotificationOptions = {
      body: `${show.showTitle} on ${show.channelName} starting soon`,
      icon: '🎙️',
      badge: '🎙️',
      tag: `dj-show-${show.id}`,
      requireInteraction: false,
      actions: [
        {
          action: 'listen',
          title: 'Listen Now',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
    };

    try {
      const notification = new Notification(title, options);

      // Handle notification click
      notification.addEventListener('click', () => {
        // Navigate to channel
        if (typeof window !== 'undefined') {
          window.location.href = `/rrb/radio-station?channel=${show.channelId}`;
        }
        notification.close();
      });

      // Handle action clicks
      notification.addEventListener('action', (event) => {
        if (event.action === 'listen') {
          if (typeof window !== 'undefined') {
            window.location.href = `/rrb/radio-station?channel=${show.channelId}`;
          }
        }
        notification.close();
      });

      console.log(`Notification sent for ${show.djName}'s show`);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  /**
   * Get all registered shows
   */
  getRegisteredShows(): DJShowNotification[] {
    return Array.from(this.notifications.values());
  }

  /**
   * Get upcoming shows (next 24 hours)
   */
  getUpcomingShows(): DJShowNotification[] {
    const now = Date.now();
    const tomorrow = now + 24 * 60 * 60 * 1000;

    return Array.from(this.notifications.values())
      .filter(show => show.startTime >= now && show.startTime <= tomorrow)
      .sort((a, b) => a.startTime - b.startTime);
  }

  /**
   * Get shows for a specific DJ
   */
  getDJShows(djName: string): DJShowNotification[] {
    return Array.from(this.notifications.values())
      .filter(show => show.djName === djName);
  }

  /**
   * Get shows for a specific channel
   */
  getChannelShows(channelId: string): DJShowNotification[] {
    return Array.from(this.notifications.values())
      .filter(show => show.channelId === channelId);
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.notifications.clear();
    this.stopNotificationChecks();
  }
}

// Export singleton instance
export const djNotificationService = new DJNotificationService();
