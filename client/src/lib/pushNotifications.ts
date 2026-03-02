/**
 * Push Notifications Service
 * Handles browser push notifications for critical alerts and broadcasts
 */

export interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
  }>;
  data?: Record<string, any>;
}

class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported = false;

  constructor() {
    this.isSupported =
      'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  /**
   * Initialize push notifications
   */
  async init(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications not supported in this browser');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
      console.log('[Push Notifications] Service Worker ready');
      return true;
    } catch (error) {
      console.error('[Push Notifications] Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return 'denied';
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    return this.isSupported && Notification.permission === 'granted';
  }

  /**
   * Send a local notification (immediate)
   */
  async sendNotification(options: PushNotificationOptions): Promise<void> {
    if (!this.isEnabled()) {
      console.warn('[Push Notifications] Notifications not enabled');
      return;
    }

    try {
      if (this.registration) {
        await this.registration.showNotification(options.title, {
          body: options.body,
          icon: options.icon || '/icon-192x192.png',
          badge: options.badge || '/badge-72x72.png',
          tag: options.tag || 'default',
          requireInteraction: options.requireInteraction ?? false,
          actions: options.actions,
          data: options.data,
        });
      }
    } catch (error) {
      console.error('[Push Notifications] Failed to send notification:', error);
    }
  }

  /**
   * Send critical alert notification
   */
  async sendCriticalAlert(title: string, message: string): Promise<void> {
    await this.sendNotification({
      title,
      body: message,
      tag: 'critical-alert',
      requireInteraction: true,
      icon: '/icon-alert.png',
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    });
  }

  /**
   * Send broadcast notification
   */
  async sendBroadcastNotification(
    broadcastTitle: string,
    broadcastContent: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<void> {
    const severityIcons = {
      low: '/icon-info.png',
      medium: '/icon-warning.png',
      high: '/icon-alert.png',
      critical: '/icon-critical.png',
    };

    await this.sendNotification({
      title: `[${severity.toUpperCase()}] ${broadcastTitle}`,
      body: broadcastContent.substring(0, 100),
      icon: severityIcons[severity],
      tag: `broadcast-${Date.now()}`,
      requireInteraction: severity === 'critical',
      data: { type: 'broadcast', severity },
    });
  }

  /**
   * Send network status notification
   */
  async sendNetworkNotification(status: 'online' | 'offline', message: string): Promise<void> {
    const icon = status === 'online' ? '/icon-online.png' : '/icon-offline.png';
    const title = status === 'online' ? 'Network Connected' : 'Network Disconnected';

    await this.sendNotification({
      title,
      body: message,
      icon,
      tag: 'network-status',
    });
  }

  /**
   * Send sync notification
   */
  async sendSyncNotification(itemCount: number, status: 'success' | 'error'): Promise<void> {
    const title = status === 'success' ? 'Sync Complete' : 'Sync Failed';
    const body =
      status === 'success'
        ? `${itemCount} items synced successfully`
        : `Failed to sync ${itemCount} items`;

    await this.sendNotification({
      title,
      body,
      icon: status === 'success' ? '/icon-success.png' : '/icon-error.png',
      tag: 'sync-status',
    });
  }

  /**
   * Clear all notifications
   */
  async clearAll(): Promise<void> {
    if (this.registration) {
      const notifications = await this.registration.getNotifications();
      notifications.forEach((notification) => notification.close());
    }
  }

  /**
   * Get all active notifications
   */
  async getActive(): Promise<Notification[]> {
    if (!this.registration) return [];
    return await this.registration.getNotifications();
  }

  /**
   * Handle notification click
   */
  onNotificationClick(callback: (notification: Notification) => void): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'NOTIFICATION_CLICK') {
          callback(event.data.notification);
        }
      });
    }
  }
}

export const pushNotifications = new PushNotificationService();
