import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { db } from '../db';
import { emergencyAlerts, alertResponders } from '../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * Emergency Alert Router
 * Handles SOS and I'm OK alerts with persistence
 */

export const emergencyRouter = router({
  /**
   * Send SOS alert
   */
  sendSOS: protectedProcedure
    .input(
      z.object({
        message: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const alertId = `sos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const alert = await db
        .insert(emergencyAlerts)
        .values({
          id: alertId,
          userId: ctx.user.id,
          userName: ctx.user.name || 'Unknown',
          type: 'sos',
          status: 'sent',
          message: input.message,
          latitude: input.latitude,
          longitude: input.longitude,
          address: input.address,
          createdAt: new Date(),
        })
        .returning();

      // Notify responders via webhook
      await notifyResponders(alert[0]);

      return alert[0];
    }),

  /**
   * Send I'm OK wellness check
   */
  sendImOkay: protectedProcedure.mutation(async ({ ctx }) => {
    const alertId = `imok-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const alert = await db
      .insert(emergencyAlerts)
      .values({
        id: alertId,
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unknown',
        type: 'im_okay',
        status: 'sent',
        createdAt: new Date(),
      })
      .returning();

    // Auto-resolve after 5 minutes
    setTimeout(async () => {
      await db
        .update(emergencyAlerts)
        .set({ status: 'resolved', resolvedAt: new Date() })
        .where(eq(emergencyAlerts.id, alertId));
    }, 5 * 60 * 1000);

    return alert[0];
  }),

  /**
   * Acknowledge alert as responder
   */
  acknowledgeAlert: protectedProcedure
    .input(z.object({ alertId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Only admins/moderators can acknowledge
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'moderator') {
        throw new Error('Unauthorized');
      }

      await db
        .insert(alertResponders)
        .values({
          id: `resp-${Date.now()}`,
          alertId: input.alertId,
          responderId: ctx.user.id,
          responderName: ctx.user.name || 'Unknown',
          role: ctx.user.role,
          status: 'acknowledged',
          respondedAt: new Date(),
        })
        .returning();

      await db
        .update(emergencyAlerts)
        .set({ status: 'acknowledged' })
        .where(eq(emergencyAlerts.id, input.alertId));

      return { success: true };
    }),

  /**
   * Resolve alert
   */
  resolveAlert: protectedProcedure
    .input(
      z.object({
        alertId: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'moderator') {
        throw new Error('Unauthorized');
      }

      await db
        .update(emergencyAlerts)
        .set({
          status: 'resolved',
          resolvedAt: new Date(),
          resolvedBy: ctx.user.id,
        })
        .where(eq(emergencyAlerts.id, input.alertId));

      return { success: true };
    }),

  /**
   * Get active alerts
   */
  getActiveAlerts: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin' && ctx.user.role !== 'moderator') {
      throw new Error('Unauthorized');
    }

    const alerts = await db
      .select()
      .from(emergencyAlerts)
      .where(eq(emergencyAlerts.status, 'sent'))
      .orderBy(desc(emergencyAlerts.createdAt));

    return alerts;
  }),

  /**
   * Get alert history
   */
  getAlertHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'moderator') {
        throw new Error('Unauthorized');
      }

      const alerts = await db
        .select()
        .from(emergencyAlerts)
        .orderBy(desc(emergencyAlerts.createdAt))
        .limit(input.limit);

      return alerts;
    }),

  /**
   * Get SOS alerts only
   */
  getSOSAlerts: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin' && ctx.user.role !== 'moderator') {
      throw new Error('Unauthorized');
    }

    const alerts = await db
      .select()
      .from(emergencyAlerts)
      .where(eq(emergencyAlerts.type, 'sos'))
      .orderBy(desc(emergencyAlerts.createdAt));

    return alerts;
  }),
});

/**
 * Notify responders via webhook
 */
async function notifyResponders(alert: any) {
  try {
    const webhookUrl = process.env.EMERGENCY_WEBHOOK_URL;
    if (!webhookUrl) return;

    const message = `${alert.type === 'sos' ? 'SOS ALERT' : 'I\'m OK Check-In'} from ${alert.userName}`;

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: alert.type,
        userId: alert.userId,
        userName: alert.userName,
        message,
        timestamp: new Date(),
      }),
    });
  } catch (err) {
    console.error('Failed to notify responders:', err);
  }
}
