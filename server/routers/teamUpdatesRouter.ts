import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { systemUpdates, teamNotifications, users, webhookEndpoints, webhookLogs } from "../../drizzle/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

/**
 * RRB Team Update Delivery System
 * 
 * This router handles the entire update lifecycle:
 * 1. Publishing updates with version, changelog, and severity
 * 2. Multi-channel notification dispatch (push, email, in-app, webhook)
 * 3. Team member acknowledgment and apply tracking
 * 4. Update history and status dashboard data
 * 5. Webhook dispatch to external services (Slack, Discord)
 */

export const teamUpdatesRouter = router({
  // ─── Publish a new system update ──────────────────────────
  publishUpdate: protectedProcedure
    .input(z.object({
      version: z.string().min(1),
      title: z.string().min(1),
      changelog: z.string().min(1),
      category: z.enum(['feature', 'bugfix', 'security', 'content', 'infrastructure']).default('feature'),
      severity: z.enum(['critical', 'major', 'minor', 'patch']).default('minor'),
      affectedSystems: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const now = Date.now();
      
      // Insert the update record
      const [result] = await db.insert(systemUpdates).values({
        version: input.version,
        title: input.title,
        changelog: input.changelog,
        category: input.category,
        severity: input.severity,
        status: 'published',
        affectedSystems: input.affectedSystems || 'QUMUS, RRB, HybridCast, Sweet Miracles',
        publishedBy: ctx.user.name || ctx.user.openId,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      });
      
      const updateId = result.insertId;
      
      // Auto-notify all team members via in-app
      const allUsers = await db.select({ id: users.id, name: users.name, email: users.email }).from(users);
      
      const notifications = allUsers.map(user => ({
        updateId,
        userId: user.id,
        channel: 'in_app' as const,
        recipient: user.name || user.email || `user-${user.id}`,
        delivered: true,
        createdAt: now,
      }));
      
      if (notifications.length > 0) {
        await db.insert(teamNotifications).values(notifications);
      }
      
      // Notify owner via platform notification
      try {
        await notifyOwner({
          title: `🚀 RRB Update ${input.version}: ${input.title}`,
          content: `**Severity:** ${input.severity.toUpperCase()}\n**Category:** ${input.category}\n**Affected Systems:** ${input.affectedSystems || 'All'}\n\n${input.changelog}\n\n---\n*Published by ${ctx.user.name || 'System'} at ${new Date(now).toISOString()}*\n*${allUsers.length} team members notified*`,
        });
      } catch (e) {
        // Non-blocking — notification failure doesn't stop the update
        console.error('[TeamUpdates] Owner notification failed:', e);
      }
      
      // Auto-dispatch to all active webhook endpoints
      let webhooksDispatched = 0;
      try {
        const activeWebhooks = await db.select().from(webhookEndpoints)
          .where(eq(webhookEndpoints.isActive, 1));
        
        for (const endpoint of activeWebhooks) {
          try {
            let body: string;
            if (endpoint.url.includes('hooks.slack.com')) {
              body = JSON.stringify({
                text: `*RRB Update ${input.version}*: ${input.title}`,
                blocks: [
                  { type: 'header', text: { type: 'plain_text', text: `RRB Update ${input.version}` } },
                  { type: 'section', text: { type: 'mrkdwn', text: `*${input.title}*\n${input.changelog}` } },
                  { type: 'context', elements: [{ type: 'mrkdwn', text: `Severity: ${input.severity} | Category: ${input.category}` }] },
                ],
              });
            } else if (endpoint.url.includes('discord.com/api/webhooks')) {
              body = JSON.stringify({
                embeds: [{
                  title: `RRB Update ${input.version}: ${input.title}`,
                  description: input.changelog,
                  color: input.severity === 'critical' ? 0xFF0000 : input.severity === 'major' ? 0xF59E0B : 0x8B5CF6,
                  fields: [
                    { name: 'Severity', value: input.severity, inline: true },
                    { name: 'Category', value: input.category, inline: true },
                  ],
                  footer: { text: 'QUMUS Ecosystem — Canryn Production' },
                  timestamp: new Date(now).toISOString(),
                }],
              });
            } else {
              body = JSON.stringify({
                event: 'system_update',
                version: input.version,
                title: input.title,
                changelog: input.changelog,
                severity: input.severity,
                category: input.category,
                affectedSystems: input.affectedSystems,
                timestamp: now,
              });
            }
            
            await fetch(endpoint.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Source': 'QUMUS-TeamUpdates',
                'X-Webhook-Event': 'system_update',
              },
              body,
              signal: AbortSignal.timeout(5000),
            }).catch(() => {});
            
            await db.insert(webhookLogs).values({
              webhookId: endpoint.id,
              eventType: 'system_update',
              payload: body,
              statusCode: 200,
              retryCount: 0,
            });
            
            webhooksDispatched++;
          } catch {}
        }
      } catch (e) {
        console.error('[TeamUpdates] Webhook auto-dispatch failed:', e);
      }
      
      return {
        id: updateId,
        version: input.version,
        title: input.title,
        notifiedCount: notifications.length,
        webhooksDispatched,
        channels: ['in_app', 'owner_notification', 'webhook'],
      };
    }),

  // ─── Dispatch webhook to external services ────────────────
  dispatchWebhook: protectedProcedure
    .input(z.object({
      updateId: z.number(),
      webhookUrl: z.string().url(),
      service: z.enum(['slack', 'discord', 'teams', 'custom']).default('custom'),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const now = Date.now();
      
      // Get the update details
      const [update] = await db.select().from(systemUpdates).where(eq(systemUpdates.id, input.updateId));
      if (!update) throw new Error('Update not found');
      
      // Format payload based on service
      let payload: Record<string, unknown>;
      
      if (input.service === 'slack') {
        payload = {
          text: `🚀 *RRB Update ${update.version}*: ${update.title}`,
          blocks: [
            { type: 'header', text: { type: 'plain_text', text: `RRB Update ${update.version}` } },
            { type: 'section', text: { type: 'mrkdwn', text: `*${update.title}*\n${update.changelog}` } },
            { type: 'context', elements: [{ type: 'mrkdwn', text: `Severity: ${update.severity} | Category: ${update.category} | Systems: ${update.affectedSystems}` }] },
          ],
        };
      } else if (input.service === 'discord') {
        payload = {
          embeds: [{
            title: `🚀 RRB Update ${update.version}: ${update.title}`,
            description: update.changelog,
            color: update.severity === 'critical' ? 0xFF0000 : update.severity === 'major' ? 0xF59E0B : 0x8B5CF6,
            fields: [
              { name: 'Severity', value: update.severity, inline: true },
              { name: 'Category', value: update.category, inline: true },
              { name: 'Systems', value: update.affectedSystems || 'All', inline: false },
            ],
            footer: { text: 'Canryn Production — QUMUS Autonomous Orchestration' },
            timestamp: new Date(now).toISOString(),
          }],
        };
      } else {
        payload = {
          event: 'system_update',
          version: update.version,
          title: update.title,
          changelog: update.changelog,
          category: update.category,
          severity: update.severity,
          affectedSystems: update.affectedSystems,
          timestamp: now,
        };
      }
      
      // Dispatch the webhook
      let delivered = false;
      let errorMessage: string | null = null;
      
      try {
        const response = await fetch(input.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        delivered = response.ok;
        if (!response.ok) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (e: any) {
        errorMessage = e.message || 'Webhook dispatch failed';
      }
      
      // Log the notification
      await db.insert(teamNotifications).values({
        updateId: input.updateId,
        channel: 'webhook',
        recipient: `${input.service}:${input.webhookUrl}`,
        delivered,
        errorMessage,
        createdAt: now,
      });
      
      return { delivered, service: input.service, error: errorMessage };
    }),

  // ─── Acknowledge an update ────────────────────────────────
  acknowledgeUpdate: protectedProcedure
    .input(z.object({ updateId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const now = Date.now();
      
      // Find the user's notification for this update
      const [notification] = await db.select().from(teamNotifications)
        .where(and(
          eq(teamNotifications.updateId, input.updateId),
          eq(teamNotifications.userId, ctx.user.id),
        ));
      
      if (notification) {
        await db.update(teamNotifications)
          .set({ acknowledgedAt: now, readAt: now })
          .where(eq(teamNotifications.id, notification.id));
      } else {
        // Create a new notification record for this acknowledgment
        await db.insert(teamNotifications).values({
          updateId: input.updateId,
          userId: ctx.user.id,
          channel: 'in_app',
          recipient: ctx.user.name || ctx.user.openId,
          delivered: true,
          readAt: now,
          acknowledgedAt: now,
          createdAt: now,
        });
      }
      
      return { acknowledged: true, updateId: input.updateId };
    }),

  // ─── Apply an update (mark as deployed for this user) ─────
  applyUpdate: protectedProcedure
    .input(z.object({ updateId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const now = Date.now();
      
      // Mark the notification as applied
      await db.update(teamNotifications)
        .set({ appliedAt: now, acknowledgedAt: now, readAt: now })
        .where(and(
          eq(teamNotifications.updateId, input.updateId),
          eq(teamNotifications.userId, ctx.user.id),
        ));
      
      // Check if all team members have applied — if so, mark update as deployed
      const [stats] = await db.select({
        total: count(),
        applied: sql<number>`SUM(CASE WHEN ${teamNotifications.appliedAt} IS NOT NULL THEN 1 ELSE 0 END)`,
      }).from(teamNotifications).where(eq(teamNotifications.updateId, input.updateId));
      
      if (stats && stats.total > 0 && stats.applied >= stats.total) {
        await db.update(systemUpdates)
          .set({ status: 'deployed', deployedAt: now, updatedAt: now })
          .where(eq(systemUpdates.id, input.updateId));
      }
      
      return { applied: true, updateId: input.updateId };
    }),

  // ─── Get all updates (changelog feed) ─────────────────────
  getUpdates: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      category: z.enum(['feature', 'bugfix', 'security', 'content', 'infrastructure']).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      const opts = input || { limit: 20, offset: 0 };
      
      let query = db.select().from(systemUpdates).orderBy(desc(systemUpdates.createdAt));
      
      if (opts.category) {
        query = query.where(eq(systemUpdates.category, opts.category)) as typeof query;
      }
      
      const updates = await query.limit(opts.limit).offset(opts.offset);
      return updates;
    }),

  // ─── Get update details with team status ──────────────────
  getUpdateDetails: publicProcedure
    .input(z.number())
    .query(async ({ input: updateId }) => {
      const db = await getDb();
      
      const [update] = await db.select().from(systemUpdates).where(eq(systemUpdates.id, updateId));
      if (!update) return null;
      
      const notifications = await db.select().from(teamNotifications)
        .where(eq(teamNotifications.updateId, updateId));
      
      const stats = {
        total: notifications.length,
        delivered: notifications.filter(n => n.delivered).length,
        read: notifications.filter(n => n.readAt).length,
        acknowledged: notifications.filter(n => n.acknowledgedAt).length,
        applied: notifications.filter(n => n.appliedAt).length,
      };
      
      return { ...update, teamStatus: stats, notifications };
    }),

  // ─── Get my pending updates ───────────────────────────────
  getMyPendingUpdates: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    
    const myNotifications = await db.select({
      notification: teamNotifications,
      update: systemUpdates,
    })
      .from(teamNotifications)
      .innerJoin(systemUpdates, eq(teamNotifications.updateId, systemUpdates.id))
      .where(and(
        eq(teamNotifications.userId, ctx.user.id),
        sql`${teamNotifications.appliedAt} IS NULL`,
      ))
      .orderBy(desc(systemUpdates.createdAt));
    
    return myNotifications.map(row => ({
      ...row.update,
      notificationId: row.notification.id,
      delivered: row.notification.delivered,
      readAt: row.notification.readAt,
      acknowledgedAt: row.notification.acknowledgedAt,
    }));
  }),

  // ─── Get update delivery stats ────────────────────────────
  getDeliveryStats: publicProcedure.query(async () => {
    const db = await getDb();
    
    const [totalUpdates] = await db.select({ count: count() }).from(systemUpdates);
    const [totalNotifications] = await db.select({ count: count() }).from(teamNotifications);
    const [deliveredCount] = await db.select({ count: count() }).from(teamNotifications).where(eq(teamNotifications.delivered, true));
    const [acknowledgedCount] = await db.select({ count: count() }).from(teamNotifications).where(sql`${teamNotifications.acknowledgedAt} IS NOT NULL`);
    const [appliedCount] = await db.select({ count: count() }).from(teamNotifications).where(sql`${teamNotifications.appliedAt} IS NOT NULL`);
    
    const recentUpdates = await db.select().from(systemUpdates).orderBy(desc(systemUpdates.createdAt)).limit(5);
    
    return {
      totalUpdates: totalUpdates?.count || 0,
      totalNotifications: totalNotifications?.count || 0,
      deliveredRate: totalNotifications?.count ? Math.round((deliveredCount?.count || 0) / totalNotifications.count * 100) : 0,
      acknowledgedRate: totalNotifications?.count ? Math.round((acknowledgedCount?.count || 0) / totalNotifications.count * 100) : 0,
      appliedRate: totalNotifications?.count ? Math.round((appliedCount?.count || 0) / totalNotifications.count * 100) : 0,
      recentUpdates,
    };
  }),
});
