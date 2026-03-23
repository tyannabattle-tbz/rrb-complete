/**
 * Push Notification Service
 * Handles Web Push API integration for real-time alerts to users
 * Manages subscriptions, notification delivery, and preferences
 */

import webpush from 'web-push';
import * as db from '../db';
import { sql } from 'drizzle-orm';

// Initialize web push with VAPID keys from environment
const vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:' + (process.env.QUMUS_OWNER_EMAIL || 'support@qumus.space'),
    vapidPublicKey,
    vapidPrivateKey
  );
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Subscribe user to push notifications
 */
export async function subscribeToPushNotifications(
  userId: number,
  subscription: PushSubscriptionData,
  userAgent?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Store subscription in database
    await db.query(sql`
      INSERT INTO push_subscriptions (userId, endpoint, p256dh, auth, userAgent, isActive)
      VALUES (${userId}, ${subscription.endpoint}, ${subscription.keys.p256dh}, ${subscription.keys.auth}, ${userAgent}, 1)
      ON DUPLICATE KEY UPDATE
      p256dh = ${subscription.keys.p256dh},
      auth = ${subscription.keys.auth},
      isActive = 1,
      updatedAt = NOW()
    `);

    return { success: true };
  } catch (error) {
    console.error('[PushNotifications] Subscription error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Subscription failed' 
    };
  }
}

/**
 * Unsubscribe user from push notifications
 */
export async function unsubscribeFromPushNotifications(
  userId: number,
  endpoint: string
): Promise<{ success: boolean }> {
  try {
    await db.query(sql`
      UPDATE push_subscriptions 
      SET isActive = 0 
      WHERE userId = ${userId} AND endpoint = ${endpoint}
    `);
    return { success: true };
  } catch (error) {
    console.error('[PushNotifications] Unsubscription error:', error);
    return { success: false };
  }
}

/**
 * Send push notification to user
 */
export async function sendPushNotification(
  userId: number,
  notification: PushNotificationPayload,
  notificationType: string
): Promise<{ success: boolean; sent: number; failed: number }> {
  try {
    // Get user's push subscriptions
    const subscriptions = await db.query(sql`
      SELECT endpoint, p256dh, auth FROM push_subscriptions 
      WHERE userId = ${userId} AND isActive = 1
    `);

    if (!subscriptions || subscriptions.length === 0) {
      return { success: true, sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    // Send to all active subscriptions
    for (const sub of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        await webpush.sendNotification(pushSubscription, JSON.stringify({
          title: notification.title,
          body: notification.body,
          icon: notification.icon,
          badge: notification.badge,
          tag: notification.tag,
          data: notification.data,
          actions: notification.actions,
        }));

        sent++;

        // Log successful delivery
        await db.query(sql`
          INSERT INTO push_notification_logs 
          (userId, notificationType, title, body, icon, badge, tag, data, status)
          VALUES (${userId}, ${notificationType}, ${notification.title}, ${notification.body}, 
                  ${notification.icon || null}, ${notification.badge || null}, ${notification.tag || null},
                  ${notification.data ? JSON.stringify(notification.data) : null}, 'delivered')
        `);
      } catch (error) {
        failed++;
        console.error('[PushNotifications] Send error:', error);

        // Log failed delivery
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        await db.query(sql`
          INSERT INTO push_notification_logs 
          (userId, notificationType, title, body, status, error)
          VALUES (${userId}, ${notificationType}, ${notification.title}, ${notification.body}, 'failed', ${errorMsg})
        `);

        // If subscription is invalid, mark as inactive
        if (error instanceof Error && error.message.includes('410')) {
          await db.query(sql`
            UPDATE push_subscriptions SET isActive = 0 WHERE endpoint = ${sub.endpoint}
          `);
        }
      }
    }

    return { success: true, sent, failed };
  } catch (error) {
    console.error('[PushNotifications] Batch send error:', error);
    return { success: false, sent: 0, failed: 1 };
  }
}

/**
 * Send QUMUS policy decision notification
 */
export async function notifyQumusPolicyDecision(
  userId: number,
  policyName: string,
  decision: string,
  impact: string
): Promise<void> {
  await sendPushNotification(userId, {
    title: '🤖 QUMUS Policy Decision',
    body: `${policyName}: ${decision}`,
    icon: '/qumus-icon.png',
    badge: '/qumus-badge.png',
    tag: 'qumus-policy',
    data: {
      type: 'policy_decision',
      policyName,
      decision,
      impact,
      timestamp: new Date().toISOString(),
    },
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  }, 'qumus_policy_decision');
}

/**
 * Send content upload notification
 */
export async function notifyContentUpload(
  userId: number,
  creatorName: string,
  contentTitle: string,
  contentType: string
): Promise<void> {
  await sendPushNotification(userId, {
    title: '📤 New Content Upload',
    body: `${creatorName} uploaded: ${contentTitle}`,
    icon: '/content-icon.png',
    badge: '/content-badge.png',
    tag: 'content-upload',
    data: {
      type: 'content_upload',
      creatorName,
      contentTitle,
      contentType,
      timestamp: new Date().toISOString(),
    },
    actions: [
      { action: 'review', title: 'Review' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  }, 'content_upload');
}

/**
 * Send listener engagement notification
 */
export async function notifyListenerEngagement(
  userId: number,
  channelName: string,
  listenerCount: number,
  engagement: string
): Promise<void> {
  await sendPushNotification(userId, {
    title: '👥 Listener Engagement Update',
    body: `${channelName}: ${listenerCount} listeners - ${engagement}`,
    icon: '/listener-icon.png',
    badge: '/listener-badge.png',
    tag: 'listener-engagement',
    data: {
      type: 'listener_engagement',
      channelName,
      listenerCount,
      engagement,
      timestamp: new Date().toISOString(),
    },
    actions: [
      { action: 'view', title: 'View Analytics' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  }, 'listener_engagement');
}

/**
 * Send revenue alert notification
 */
export async function notifyRevenueAlert(
  userId: number,
  amount: number,
  source: string,
  period: string
): Promise<void> {
  await sendPushNotification(userId, {
    title: '💰 Revenue Alert',
    body: `${source}: $${amount.toFixed(2)} earned in ${period}`,
    icon: '/revenue-icon.png',
    badge: '/revenue-badge.png',
    tag: 'revenue-alert',
    data: {
      type: 'revenue_alert',
      amount,
      source,
      period,
      timestamp: new Date().toISOString(),
    },
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  }, 'revenue_alert');
}

/**
 * Send system alert notification
 */
export async function notifySystemAlert(
  userId: number,
  severity: 'low' | 'medium' | 'high' | 'critical',
  message: string,
  actionUrl?: string
): Promise<void> {
  const icons = {
    low: '📋',
    medium: '⚠️',
    high: '🔴',
    critical: '🚨',
  };

  await sendPushNotification(userId, {
    title: `${icons[severity]} System Alert`,
    body: message,
    icon: '/alert-icon.png',
    badge: '/alert-badge.png',
    tag: 'system-alert',
    data: {
      type: 'system_alert',
      severity,
      message,
      actionUrl,
      timestamp: new Date().toISOString(),
    },
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  }, 'system_alert');
}

/**
 * Get user's push notification preferences
 */
export async function getUserPushPreferences(userId: number) {
  try {
    const prefs = await db.query(sql`
      SELECT * FROM push_notification_preferences WHERE userId = ${userId}
    `);
    return prefs?.[0] || null;
  } catch (error) {
    console.error('[PushNotifications] Get preferences error:', error);
    return null;
  }
}

/**
 * Update user's push notification preferences
 */
export async function updateUserPushPreferences(
  userId: number,
  preferences: Record<string, any>
): Promise<{ success: boolean }> {
  try {
    const updates = Object.entries(preferences)
      .map(([key, value]) => `${key} = ${typeof value === 'string' ? `'${value}'` : value}`)
      .join(', ');

    await db.query(sql`
      UPDATE push_notification_preferences 
      SET ${sql.raw(updates)}
      WHERE userId = ${userId}
    `);

    return { success: true };
  } catch (error) {
    console.error('[PushNotifications] Update preferences error:', error);
    return { success: false };
  }
}

/**
 * Get notification history for user
 */
export async function getNotificationHistory(
  userId: number,
  limit: number = 50,
  offset: number = 0
) {
  try {
    const logs = await db.query(sql`
      SELECT * FROM push_notification_logs 
      WHERE userId = ${userId}
      ORDER BY createdAt DESC
      LIMIT ${limit} OFFSET ${offset}
    `);
    return logs || [];
  } catch (error) {
    console.error('[PushNotifications] Get history error:', error);
    return [];
  }
}

/**
 * Clean up expired subscriptions
 */
export async function cleanupExpiredSubscriptions(): Promise<number> {
  try {
    const result = await db.query(sql`
      DELETE FROM push_subscriptions 
      WHERE isActive = 0 AND updatedAt < DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    return result?.affectedRows || 0;
  } catch (error) {
    console.error('[PushNotifications] Cleanup error:', error);
    return 0;
  }
}
