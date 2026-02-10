/**
 * Push Notification Router
 * Emergency broadcast push notification system with real VAPID web-push
 */
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import webpush from "web-push";

// Configure web-push with VAPID keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = 'mailto:admin@canrynproduction.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    console.log('[PushNotifications] VAPID keys configured successfully');
  } catch (err) {
    console.error('[PushNotifications] Failed to set VAPID details:', err);
  }
} else {
  console.warn('[PushNotifications] VAPID keys not configured - push notifications disabled');
}

interface PushSubscriptionRecord {
  userId: number;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  createdAt: number;
  userAgent?: string;
}

interface NotificationLog {
  id: string;
  title: string;
  body: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  sentAt: number;
  recipientCount: number;
  successCount: number;
  failureCount: number;
}

// In-memory store (production would use database)
const subscriptions: Map<string, PushSubscriptionRecord> = new Map();
export const notificationHistory: NotificationLog[] = [];

export async function sendPushToAll(payload: { title: string; body: string; level: string; url?: string }): Promise<{ success: number; failed: number; removed: number }> {
  let success = 0;
  let failed = 0;
  let removed = 0;

  const payloadStr = JSON.stringify(payload);
  const endpoints = Array.from(subscriptions.entries());

  for (const [endpoint, sub] of endpoints) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys,
        },
        payloadStr,
        { TTL: 86400 } // 24 hours
      );
      success++;
    } catch (err: any) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        // Subscription expired or unsubscribed
        subscriptions.delete(endpoint);
        removed++;
      } else {
        failed++;
        console.error(`[PushNotifications] Failed to send to ${endpoint.substring(0, 50)}...`, err.statusCode || err.message);
      }
    }
  }

  return { success, failed, removed };
}

export const pushNotificationRouter = router({
  // Get VAPID public key for frontend subscription
  getVapidPublicKey: publicProcedure.query(() => {
    return { publicKey: VAPID_PUBLIC_KEY };
  }),

  // Register push subscription
  subscribe: protectedProcedure
    .input(z.object({
      endpoint: z.string(),
      keys: z.object({
        p256dh: z.string(),
        auth: z.string(),
      }),
      userAgent: z.string().optional(),
    }))
    .mutation(({ ctx, input }) => {
      const sub: PushSubscriptionRecord = {
        userId: ctx.user!.id,
        endpoint: input.endpoint,
        keys: input.keys,
        createdAt: Date.now(),
        userAgent: input.userAgent,
      };
      subscriptions.set(input.endpoint, sub);
      console.log(`[PushNotifications] New subscription from user ${ctx.user!.id}. Total: ${subscriptions.size}`);
      return { success: true, subscriptionCount: subscriptions.size };
    }),

  // Unsubscribe from push notifications
  unsubscribe: protectedProcedure
    .input(z.object({ endpoint: z.string() }))
    .mutation(({ input }) => {
      subscriptions.delete(input.endpoint);
      return { success: true };
    }),

  // Send emergency broadcast notification (with real push delivery)
  sendEmergencyBroadcast: protectedProcedure
    .input(z.object({
      title: z.string(),
      body: z.string(),
      level: z.enum(['low', 'medium', 'high', 'critical']),
      url: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await sendPushToAll({
        title: input.title,
        body: input.body,
        level: input.level,
        url: input.url || '/emergency-alerts',
      });

      const log: NotificationLog = {
        id: `notif-${Date.now()}`,
        title: input.title,
        body: input.body,
        level: input.level,
        sentAt: Date.now(),
        recipientCount: subscriptions.size,
        successCount: result.success,
        failureCount: result.failed,
      };
      notificationHistory.unshift(log);
      if (notificationHistory.length > 100) {
        notificationHistory.splice(100);
      }

      console.log(`[PushNotifications] Emergency broadcast sent: ${result.success} delivered, ${result.failed} failed, ${result.removed} expired`);

      return {
        success: true,
        notificationId: log.id,
        recipientCount: log.recipientCount,
        delivered: result.success,
        failed: result.failed,
        expiredRemoved: result.removed,
        level: input.level,
      };
    }),

  // Get notification history
  getHistory: publicProcedure.query(() => {
    return notificationHistory.slice(0, 50);
  }),

  // Get subscription count
  getSubscriptionCount: publicProcedure.query(() => {
    return { count: subscriptions.size };
  }),

  // Check if VAPID is configured
  isConfigured: publicProcedure.query(() => {
    return {
      configured: !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY),
      hasPublicKey: !!VAPID_PUBLIC_KEY,
    };
  }),
});
