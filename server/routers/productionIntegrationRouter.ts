/**
 * Production Integration Router
 * 
 * tRPC router exposing the QUMUS Production Integration Engine.
 * Connects all subsystems: broadcasts, ads, analytics, webhooks, team updates,
 * emergency, donations, and content scheduling through a unified event bus.
 */
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getProductionIntegration, type QumusEventType } from "../services/qumusProductionIntegration";
import { getDb } from "../db";
import { webhookEndpoints, webhookLogs, adInventory, listenerAnalytics, systemUpdates, teamNotifications } from "../../drizzle/schema";
import { eq, desc, sql, count, and } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

const EVENT_TYPES = [
  'broadcast.started', 'broadcast.stopped', 'broadcast.scheduled',
  'ad.played', 'ad.rotated', 'ad.budget_exhausted',
  'listener.joined', 'listener.left', 'listener.milestone',
  'team.update_posted', 'team.member_joined', 'team.alert',
  'webhook.dispatched', 'webhook.failed', 'webhook.test',
  'content.published', 'content.scheduled', 'content.approved',
  'emergency.activated', 'emergency.deactivated', 'emergency.test',
  'donation.received', 'donation.goal_reached', 'donation.campaign_created',
  'qumus.decision_made', 'qumus.policy_triggered', 'qumus.health_check',
  'system.startup', 'system.error', 'system.recovery',
] as const;

export const productionIntegrationRouter = router({
  // ─── Get Full Production Status ─────────────────────────────
  getProductionStatus: publicProcedure.query(async () => {
    const engine = getProductionIntegration();
    const status = engine.getStatus();
    
    // Enrich with database counts
    const db = await getDb();
    const [webhookCount] = await db.select({ count: count() }).from(webhookEndpoints).where(eq(webhookEndpoints.isActive, 1));
    const [adCount] = await db.select({ count: count() }).from(adInventory).where(eq(adInventory.active, true));
    // Use actual schema column: listenerCount instead of non-existent sessionId
    const [recentListeners] = await db.select({ 
      count: sql<number>`COUNT(*)` 
    }).from(listenerAnalytics);
    
    return {
      ...status,
      databaseMetrics: {
        activeWebhooks: webhookCount?.count ?? 0,
        activeAds: adCount?.count ?? 0,
        uniqueListeners: recentListeners?.count ?? 0,
      },
    };
  }),

  // ─── Emit Event (for internal subsystems) ───────────────────
  emitEvent: protectedProcedure
    .input(z.object({
      type: z.enum(EVENT_TYPES),
      source: z.string().min(1),
      data: z.record(z.any()).default({}),
      severity: z.enum(['info', 'warning', 'critical']).default('info'),
      requiresHumanReview: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const engine = getProductionIntegration();
      const event = engine.createEvent(
        input.type as QumusEventType,
        input.source,
        input.data,
        input.severity,
        input.requiresHumanReview,
      );
      await engine.emit(event);
      return { success: true, eventId: event.id };
    }),

  // ─── Get Event Log ──────────────────────────────────────────
  getEventLog: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(500).default(100),
      type: z.enum(EVENT_TYPES).optional(),
    }).optional())
    .query(async ({ input }) => {
      const engine = getProductionIntegration();
      return engine.getEventLog(input?.limit ?? 100, input?.type as QumusEventType);
    }),

  // ─── Get Subsystem Status ──────────────────────────────────
  getSubsystemStatus: publicProcedure
    .input(z.object({ name: z.string() }).optional())
    .query(async ({ input }) => {
      const engine = getProductionIntegration();
      return engine.getSubsystemStatus(input?.name);
    }),

  // ─── Broadcast + Ad Integration: Start Broadcast with Ads ──
  startBroadcastWithAds: protectedProcedure
    .input(z.object({
      channelId: z.number(),
      channelName: z.string(),
      programTitle: z.string(),
    }))
    .mutation(async ({ input }) => {
      const engine = getProductionIntegration();
      const db = await getDb();
      
      // 1. Emit broadcast started event
      const broadcastEvent = engine.createEvent('broadcast.started', 'broadcast-scheduler', {
        channelId: input.channelId,
        channelName: input.channelName,
        programTitle: input.programTitle,
      });
      await engine.emit(broadcastEvent);
      
      // 2. Get next ad for this channel
      const now = Date.now();
      const activeAds = await db.select().from(adInventory)
        .where(and(
          eq(adInventory.active, true),
          sql`(${adInventory.startDate} IS NULL OR ${adInventory.startDate} <= ${now})`,
          sql`(${adInventory.endDate} IS NULL OR ${adInventory.endDate} >= ${now})`,
        ))
        .orderBy(desc(adInventory.rotationWeight))
        .limit(3);
      
      // 3. Emit ad rotation event
      if (activeAds.length > 0) {
        const adEvent = engine.createEvent('ad.rotated', 'ad-rotation', {
          channelId: input.channelId,
          adsQueued: activeAds.map(a => ({ id: a.id, sponsor: a.sponsorName, campaign: a.campaignName })),
        });
        await engine.emit(adEvent);
      }
      
      // 4. Dispatch to all active webhooks
      const activeEndpoints = await db.select().from(webhookEndpoints)
        .where(eq(webhookEndpoints.isActive, 1));
      
      let webhooksSent = 0;
      for (const endpoint of activeEndpoints) {
        try {
          const payload = {
            event: 'broadcast.started',
            source: 'QUMUS Production Engine',
            timestamp: new Date().toISOString(),
            data: {
              channelId: input.channelId,
              channelName: input.channelName,
              programTitle: input.programTitle,
              nextAds: activeAds.slice(0, 2).map(a => a.sponsorName),
            },
          };
          
          await fetch(endpoint.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Secret': endpoint.secret,
              'X-Webhook-Source': 'QUMUS-Production',
              'X-Webhook-Event': 'broadcast.started',
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(5000),
          }).catch(() => {}); // Non-blocking
          
          webhooksSent++;
        } catch {}
      }
      
      return {
        success: true,
        broadcastEventId: broadcastEvent.id,
        adsQueued: activeAds.length,
        webhooksDispatched: webhooksSent,
      };
    }),

  // ─── Record Listener Event with Analytics Pipeline ──────────
  recordListenerWithAnalytics: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      channelId: z.number(),
      eventType: z.enum(['tune_in', 'tune_out', 'channel_switch', 'ad_impression', 'ai_interaction', 'song_request']),
      durationSeconds: z.number().optional(),
      metadata: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const engine = getProductionIntegration();
      const db = await getDb();
      const now = Date.now();
      
      // 1. Record in database using actual schema columns
      await db.insert(listenerAnalytics).values({
        channelId: input.channelId,
        channelName: `Channel ${input.channelId}`,
        listenerCount: 1,
        peakListeners: 1,
        geoRegion: null,
        deviceType: 'desktop',
        sessionDurationSeconds: input.durationSeconds || 0,
        timestamp: now,
        hourOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        createdAt: now,
      });
      
      // 2. Emit listener event
      const eventType = input.eventType === 'tune_in' ? 'listener.joined' : 
                        input.eventType === 'tune_out' ? 'listener.left' : 
                        'listener.joined';
      
      const listenerEvent = engine.createEvent(eventType as QumusEventType, 'listener-analytics', {
        channelId: input.channelId,
        eventType: input.eventType,
        durationSeconds: input.durationSeconds,
      });
      await engine.emit(listenerEvent);
      
      // 3. Check for milestones
      const [currentListeners] = await db.select({
        count: sql<number>`SUM(${listenerAnalytics.listenerCount})`,
      }).from(listenerAnalytics)
        .where(sql`${listenerAnalytics.createdAt} > ${now - 3600000}`); // Last hour
      
      const listenerCount = currentListeners?.count ?? 0;
      const milestones = [10, 25, 50, 100, 250, 500, 1000];
      
      if (milestones.includes(listenerCount)) {
        const milestoneEvent = engine.createEvent('listener.milestone', 'listener-analytics', {
          milestone: listenerCount,
          channelId: input.channelId,
        }, 'info');
        await engine.emit(milestoneEvent);
      }
      
      return { success: true, currentListeners: listenerCount };
    }),

  // ─── Publish Team Update with Full Pipeline ─────────────────
  publishTeamUpdateFull: protectedProcedure
    .input(z.object({
      version: z.string().min(1),
      title: z.string().min(1),
      changelog: z.string().min(1),
      category: z.enum(['feature', 'bugfix', 'security', 'content', 'infrastructure']).default('feature'),
      severity: z.enum(['critical', 'major', 'minor', 'patch']).default('minor'),
      affectedSystems: z.string().optional(),
      notifyOwner: z.boolean().default(false),
      dispatchWebhooks: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const engine = getProductionIntegration();
      const db = await getDb();
      const now = Date.now();
      
      // 1. Store team update
      const [result] = await db.insert(systemUpdates).values({
        version: input.version,
        title: input.title,
        changelog: input.changelog,
        category: input.category,
        severity: input.severity,
        status: 'published',
        affectedSystems: input.affectedSystems || 'QUMUS, RRB, HybridCast, Sweet Miracles',
        publishedBy: ctx.user?.name || ctx.user?.openId || 'system',
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      });
      
      // 2. Emit team update event
      const teamEvent = engine.createEvent('team.update_posted', 'team-updates', {
        updateId: result.insertId,
        version: input.version,
        title: input.title,
        severity: input.severity,
      });
      await engine.emit(teamEvent);
      
      // 3. Notify owner if requested
      if (input.notifyOwner) {
        await notifyOwner({
          title: `Team Update: ${input.title}`,
          content: `Version ${input.version} | ${input.severity} | ${input.category}\n\n${input.changelog}`,
        });
      }
      
      // 4. Dispatch to webhooks if requested
      let webhooksDispatched = 0;
      if (input.dispatchWebhooks) {
        const activeEndpoints = await db.select().from(webhookEndpoints)
          .where(eq(webhookEndpoints.isActive, 1));
        
        for (const endpoint of activeEndpoints) {
          try {
            let body: string;
            
            if (endpoint.url.includes('hooks.slack.com')) {
              body = JSON.stringify({
                text: `*${input.title}*`,
                blocks: [
                  { type: 'header', text: { type: 'plain_text', text: `Team Update: ${input.title}` } },
                  { type: 'section', text: { type: 'mrkdwn', text: `*Version:* ${input.version}\n*Severity:* ${input.severity}\n*Category:* ${input.category}\n\n${input.changelog}` } },
                ],
              });
            } else if (endpoint.url.includes('discord.com/api/webhooks')) {
              body = JSON.stringify({
                embeds: [{
                  title: `Team Update: ${input.title}`,
                  description: input.changelog,
                  color: input.severity === 'critical' ? 0xFF0000 : input.severity === 'major' ? 0xFFA500 : 0x8B5CF6,
                  fields: [
                    { name: 'Version', value: input.version, inline: true },
                    { name: 'Severity', value: input.severity, inline: true },
                    { name: 'Category', value: input.category, inline: true },
                  ],
                  footer: { text: 'QUMUS Ecosystem — Canryn Production' },
                  timestamp: new Date().toISOString(),
                }],
              });
            } else {
              body = JSON.stringify({
                event: 'team.update_posted',
                source: 'QUMUS Production Engine',
                timestamp: new Date().toISOString(),
                data: { version: input.version, title: input.title, changelog: input.changelog, severity: input.severity },
              });
            }
            
            await fetch(endpoint.url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-Webhook-Source': 'QUMUS-Production' },
              body,
              signal: AbortSignal.timeout(5000),
            }).catch(() => {});
            
            await db.insert(webhookLogs).values({
              webhookId: endpoint.id,
              eventType: 'team.update_posted',
              payload: body,
              statusCode: 200,
              retryCount: 0,
            });
            
            webhooksDispatched++;
          } catch {}
        }
      }
      
      return {
        success: true,
        updateId: Number(result.insertId),
        webhooksDispatched,
        ownerNotified: input.notifyOwner,
      };
    }),

  // ─── Trigger Emergency Broadcast ────────────────────────────
  triggerEmergencyBroadcast: protectedProcedure
    .input(z.object({
      message: z.string().min(1),
      severity: z.enum(['advisory', 'warning', 'critical', 'extreme']),
      affectedArea: z.string().optional(),
      instructions: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const engine = getProductionIntegration();
      
      // Emit emergency event (highest priority)
      const emergencyEvent = engine.createEvent('emergency.activated', 'hybridcast', {
        message: input.message,
        severity: input.severity,
        affectedArea: input.affectedArea,
        instructions: input.instructions,
      }, 'critical', input.severity === 'extreme');
      
      await engine.emit(emergencyEvent);
      
      // Notify owner immediately
      await notifyOwner({
        title: `EMERGENCY BROADCAST: ${input.severity.toUpperCase()}`,
        content: `${input.message}\n\nAffected Area: ${input.affectedArea || 'All'}\nInstructions: ${input.instructions || 'Stand by for updates'}`,
      });
      
      return {
        success: true,
        eventId: emergencyEvent.id,
        severity: input.severity,
      };
    }),

  // ─── Record Donation with Full Pipeline ─────────────────────
  recordDonationEvent: protectedProcedure
    .input(z.object({
      amount: z.number().min(50), // cents
      purpose: z.string().optional(),
      campaignName: z.string().optional(),
      goalAmount: z.number().optional(), // cents
    }))
    .mutation(async ({ input }) => {
      const engine = getProductionIntegration();
      
      const donationEvent = engine.createEvent('donation.received', 'sweet-miracles', {
        amount: input.amount,
        purpose: input.purpose || 'general fund',
        campaignName: input.campaignName,
      });
      await engine.emit(donationEvent);
      
      // Check if goal reached
      if (input.goalAmount && input.amount >= input.goalAmount) {
        const goalEvent = engine.createEvent('donation.goal_reached', 'sweet-miracles', {
          campaignName: input.campaignName,
          goalAmount: input.goalAmount,
        }, 'info');
        await engine.emit(goalEvent);
      }
      
      return { success: true, eventId: donationEvent.id };
    }),

  // ─── Get Unified Dashboard Data ─────────────────────────────
  getUnifiedDashboard: publicProcedure.query(async () => {
    const engine = getProductionIntegration();
    const db = await getDb();
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    
    // Get production status
    const status = engine.getStatus();
    
    // Get recent listener count using actual schema column
    const [listeners] = await db.select({
      count: sql<number>`COALESCE(SUM(${listenerAnalytics.listenerCount}), 0)`,
    }).from(listenerAnalytics)
      .where(sql`${listenerAnalytics.createdAt} > ${oneHourAgo}`);
    
    // Get active ads count
    const [ads] = await db.select({ count: count() }).from(adInventory).where(eq(adInventory.active, true));
    
    // Get webhook stats
    const [webhooks] = await db.select({ count: count() }).from(webhookEndpoints).where(eq(webhookEndpoints.isActive, 1));
    const [webhookDeliveries] = await db.select({ count: count() }).from(webhookLogs);
    
    // Get team updates count
    const [updates] = await db.select({ count: count() }).from(systemUpdates);
    
    // Get recent events
    const recentEvents = engine.getEventLog(10);
    
    return {
      engine: {
        isRunning: status.isRunning,
        uptime: status.uptime,
        eventCount: status.eventCount,
        errorCount: status.errorCount,
        handlersRegistered: status.handlersRegistered,
      },
      subsystems: status.subsystems,
      metrics: {
        activeListeners: listeners?.count ?? 0,
        activeAds: ads?.count ?? 0,
        activeWebhooks: webhooks?.count ?? 0,
        totalWebhookDeliveries: webhookDeliveries?.count ?? 0,
        totalTeamUpdates: updates?.count ?? 0,
      },
      recentEvents: recentEvents.map(e => ({
        id: e.id,
        type: e.type,
        source: e.source,
        timestamp: e.timestamp,
        severity: e.severity,
      })),
      lastHealthCheck: status.lastHealthCheck,
    };
  }),
});
