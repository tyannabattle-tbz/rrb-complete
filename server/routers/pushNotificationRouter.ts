/**
 * Push Notification Router
 * Emergency broadcast push notification system
 */
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";

interface PushSubscription {
  userId: number;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  createdAt: number;
}

interface NotificationLog {
  id: string;
  title: string;
  body: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  sentAt: number;
  recipientCount: number;
}

// In-memory store (production would use database)
const subscriptions: Map<string, PushSubscription> = new Map();
const notificationHistory: NotificationLog[] = [];

export const pushNotificationRouter = router({
  // Register push subscription
  subscribe: protectedProcedure
    .input(z.object({
      endpoint: z.string(),
      keys: z.object({
        p256dh: z.string(),
        auth: z.string(),
      }),
    }))
    .mutation(({ ctx, input }) => {
      const sub: PushSubscription = {
        userId: ctx.user!.id,
        endpoint: input.endpoint,
        keys: input.keys,
        createdAt: Date.now(),
      };
      subscriptions.set(input.endpoint, sub);
      return { success: true, subscriptionCount: subscriptions.size };
    }),

  // Unsubscribe from push notifications
  unsubscribe: protectedProcedure
    .input(z.object({ endpoint: z.string() }))
    .mutation(({ input }) => {
      subscriptions.delete(input.endpoint);
      return { success: true };
    }),

  // Send emergency broadcast notification
  sendEmergencyBroadcast: protectedProcedure
    .input(z.object({
      title: z.string(),
      body: z.string(),
      level: z.enum(['low', 'medium', 'high', 'critical']),
    }))
    .mutation(({ input }) => {
      const log: NotificationLog = {
        id: `notif-${Date.now()}`,
        title: input.title,
        body: input.body,
        level: input.level,
        sentAt: Date.now(),
        recipientCount: subscriptions.size,
      };
      notificationHistory.unshift(log);
      if (notificationHistory.length > 100) {
        notificationHistory.splice(100);
      }
      return {
        success: true,
        notificationId: log.id,
        recipientCount: log.recipientCount,
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
});
