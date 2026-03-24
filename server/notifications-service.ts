import { db } from './db';
import { invokeLLM } from './server/_core/llm';
import { notifyOwner } from './server/_core/notification';

export interface NotificationEvent {
  type: 'performance_live' | 'recording_available' | 'milestone' | 'collaboration_invite' | 'engagement_reward';
  userId?: string;
  title: string;
  message: string;
  data: Record<string, any>;
  timestamp: number;
}

export interface ListenerNotification {
  id: string;
  userId: string;
  type: NotificationEvent['type'];
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  createdAt: number;
}

class NotificationsService {
  private notifications: Map<string, ListenerNotification[]> = new Map();
  private listeners: Map<string, Set<(notification: ListenerNotification) => void>> = new Map();

  /**
   * Subscribe to notifications for a user
   */
  subscribe(userId: string, callback: (notification: ListenerNotification) => void): () => void {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, new Set());
    }
    this.listeners.get(userId)!.add(callback);

    return () => {
      this.listeners.get(userId)?.delete(callback);
    };
  }

  /**
   * Send notification to user
   */
  async sendNotification(event: NotificationEvent): Promise<ListenerNotification> {
    const notification: ListenerNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: event.userId || '',
      type: event.type,
      title: event.title,
      message: event.message,
      data: event.data,
      read: false,
      createdAt: event.timestamp,
    };

    // Store notification
    if (!this.notifications.has(notification.userId)) {
      this.notifications.set(notification.userId, []);
    }
    this.notifications.get(notification.userId)!.push(notification);

    // Emit to subscribers
    const callbacks = this.listeners.get(notification.userId);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(notification);
        } catch (err) {
          console.error('[Notifications] Callback error:', err);
        }
      });
    }

    // Persist to database if needed
    try {
      await this.persistNotification(notification);
    } catch (err) {
      console.error('[Notifications] Failed to persist:', err);
    }

    return notification;
  }

  /**
   * Broadcast performance live notification
   */
  async notifyPerformanceLive(performanceId: string, performanceName: string, bandMembers: string[]): Promise<void> {
    const message = `🎵 ${performanceName} is now LIVE! Join the stream now.`;
    
    // Notify all listeners (in production, query actual subscribers)
    for (const memberId of bandMembers) {
      await this.sendNotification({
        type: 'performance_live',
        userId: memberId,
        title: '🎵 Performance Live!',
        message,
        data: { performanceId, performanceName },
        timestamp: Date.now(),
      });
    }

    // Notify owner
    await notifyOwner({
      title: '🎵 Performance Live',
      content: `${performanceName} is now streaming to listeners`,
    });
  }

  /**
   * Notify recording available
   */
  async notifyRecordingAvailable(recordingId: string, recordingName: string, listeners: string[]): Promise<void> {
    const message = `📦 New recording available: ${recordingName}`;

    for (const listenerId of listeners) {
      await this.sendNotification({
        type: 'recording_available',
        userId: listenerId,
        title: '📦 New Recording',
        message,
        data: { recordingId, recordingName },
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Notify listener milestone
   */
  async notifyMilestone(userId: string, milestone: number, performanceName: string): Promise<void> {
    const message = `🎉 You've reached ${milestone} listeners on ${performanceName}!`;

    await this.sendNotification({
      type: 'milestone',
      userId,
      title: '🎉 Milestone Reached!',
      message,
      data: { milestone, performanceName },
      timestamp: Date.now(),
    });
  }

  /**
   * Notify collaboration invitation
   */
  async notifyCollaborationInvite(invitedUserId: string, inviterName: string, performanceName: string, role: string): Promise<void> {
    const message = `${inviterName} invited you to collaborate as ${role} on ${performanceName}`;

    await this.sendNotification({
      type: 'collaboration_invite',
      userId: invitedUserId,
      title: '🤝 Collaboration Invite',
      message,
      data: { inviterName, performanceName, role },
      timestamp: Date.now(),
    });
  }

  /**
   * Notify engagement reward
   */
  async notifyEngagementReward(userId: string, rewardType: string, rewardAmount: number): Promise<void> {
    const message = `🏆 You earned ${rewardAmount} ${rewardType} for your engagement!`;

    await this.sendNotification({
      type: 'engagement_reward',
      userId,
      title: '🏆 Reward Earned',
      message,
      data: { rewardType, rewardAmount },
      timestamp: Date.now(),
    });
  }

  /**
   * Get user notifications
   */
  getNotifications(userId: string, limit: number = 50): ListenerNotification[] {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.slice(-limit);
  }

  /**
   * Mark notification as read
   */
  markAsRead(userId: string, notificationId: string): void {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      const notification = userNotifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    }
  }

  /**
   * Clear old notifications (older than 30 days)
   */
  clearOldNotifications(): void {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    
    for (const [userId, notifications] of this.notifications.entries()) {
      const filtered = notifications.filter(n => n.createdAt > thirtyDaysAgo);
      this.notifications.set(userId, filtered);
    }
  }

  /**
   * Persist notification to database
   */
  private async persistNotification(notification: ListenerNotification): Promise<void> {
    // In production, save to database
    // await db.insert(db.notifications).values({...});
  }
}

export const notificationsService = new NotificationsService();

// Auto-cleanup old notifications every hour
setInterval(() => {
  notificationsService.clearOldNotifications();
}, 60 * 60 * 1000);
