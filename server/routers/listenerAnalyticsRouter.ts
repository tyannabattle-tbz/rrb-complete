import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { listenerAnalytics, adInventory, contentSchedule } from "../../drizzle/schema";
import { eq, desc, sql, count, and } from "drizzle-orm";

/**
 * Listener Analytics Router
 * 
 * Tracks real-time listener events across all 50 RRB channels:
 * - Tune-in/tune-out events
 * - Channel switches
 * - Session duration
 * - Geographic distribution (via IP)
 * - Device/platform breakdown
 * - AI DJ interactions
 */

export const listenerAnalyticsRouter = router({
  // ─── Record a listener event ──────────────────────────────
  recordEvent: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      channelId: z.number(),
      eventType: z.enum(['tune_in', 'tune_out', 'channel_switch', 'ad_impression', 'ai_interaction', 'song_request']),
      durationSeconds: z.number().optional(),
      metadata: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const now = Date.now();
      
      const [result] = await db.insert(listenerAnalytics).values({
        sessionId: input.sessionId,
        channelId: input.channelId,
        eventType: input.eventType,
        durationSeconds: input.durationSeconds || null,
        metadata: input.metadata || null,
        region: null,
        device: null,
        createdAt: now,
      });
      
      return { id: result.insertId, recorded: true };
    }),

  // ─── Get real-time stats ──────────────────────────────────
  getRealtimeStats: publicProcedure.query(async () => {
    const db = await getDb();
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const oneDayAgo = now - 86400000;
    
    // Total events in last hour
    const [hourlyEvents] = await db.select({ count: count() })
      .from(listenerAnalytics)
      .where(sql`${listenerAnalytics.createdAt} >= ${oneHourAgo}`);
    
    // Total events today
    const [dailyEvents] = await db.select({ count: count() })
      .from(listenerAnalytics)
      .where(sql`${listenerAnalytics.createdAt} >= ${oneDayAgo}`);
    
    // Unique sessions today
    const [uniqueSessions] = await db.select({
      count: sql<number>`COUNT(DISTINCT ${listenerAnalytics.sessionId})`,
    })
      .from(listenerAnalytics)
      .where(sql`${listenerAnalytics.createdAt} >= ${oneDayAgo}`);
    
    // Top channels by events
    const topChannels = await db.select({
      channelId: listenerAnalytics.channelId,
      eventCount: count(),
    })
      .from(listenerAnalytics)
      .where(sql`${listenerAnalytics.createdAt} >= ${oneDayAgo}`)
      .groupBy(listenerAnalytics.channelId)
      .orderBy(desc(count()))
      .limit(10);
    
    // Event type breakdown
    const eventBreakdown = await db.select({
      eventType: listenerAnalytics.eventType,
      count: count(),
    })
      .from(listenerAnalytics)
      .where(sql`${listenerAnalytics.createdAt} >= ${oneDayAgo}`)
      .groupBy(listenerAnalytics.eventType);
    
    // Average session duration
    const [avgDuration] = await db.select({
      avg: sql<number>`COALESCE(AVG(${listenerAnalytics.durationSeconds}), 0)`,
    })
      .from(listenerAnalytics)
      .where(and(
        sql`${listenerAnalytics.createdAt} >= ${oneDayAgo}`,
        sql`${listenerAnalytics.durationSeconds} IS NOT NULL`,
      ));
    
    return {
      hourlyEvents: hourlyEvents?.count || 0,
      dailyEvents: dailyEvents?.count || 0,
      uniqueSessions: uniqueSessions?.count || 0,
      avgSessionDurationSeconds: Math.round(avgDuration?.avg || 0),
      topChannels,
      eventBreakdown,
    };
  }),

  // ─── Get recent events ────────────────────────────────────
  getRecentEvents: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      channelId: z.number().optional(),
      eventType: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      const opts = input || { limit: 50 };
      
      let query = db.select().from(listenerAnalytics).orderBy(desc(listenerAnalytics.createdAt));
      
      if (opts.channelId) {
        query = query.where(eq(listenerAnalytics.channelId, opts.channelId)) as typeof query;
      }
      
      return await query.limit(opts.limit);
    }),

  // ─── Get hourly listener trends (last 24h) ──────────────────
  getHourlyTrends: publicProcedure.query(async () => {
    const db = await getDb();
    const now = Date.now();
    const oneDayAgo = now - 86400000;
    
    const hourlyData = await db.select({
      hour: sql<string>`HOUR(FROM_UNIXTIME(${listenerAnalytics.createdAt} / 1000))`,
      eventCount: count(),
      uniqueSessions: sql<number>`COUNT(DISTINCT ${listenerAnalytics.sessionId})`,
    })
      .from(listenerAnalytics)
      .where(sql`${listenerAnalytics.createdAt} >= ${oneDayAgo}`)
      .groupBy(sql`HOUR(FROM_UNIXTIME(${listenerAnalytics.createdAt} / 1000))`)
      .orderBy(sql`HOUR(FROM_UNIXTIME(${listenerAnalytics.createdAt} / 1000))`);
    
    return hourlyData;
  }),

  // ─── Get channel engagement heatmap ──────────────────────────
  getChannelHeatmap: publicProcedure.query(async () => {
    const db = await getDb();
    const now = Date.now();
    const oneWeekAgo = now - 604800000;
    
    const heatmap = await db.select({
      channelId: listenerAnalytics.channelId,
      eventType: listenerAnalytics.eventType,
      count: count(),
      avgDuration: sql<number>`COALESCE(AVG(${listenerAnalytics.durationSeconds}), 0)`,
    })
      .from(listenerAnalytics)
      .where(sql`${listenerAnalytics.createdAt} >= ${oneWeekAgo}`)
      .groupBy(listenerAnalytics.channelId, listenerAnalytics.eventType)
      .orderBy(desc(count()));
    
    return heatmap;
  }),

  // ─── Get engagement score per channel ────────────────────────
  getEngagementScores: publicProcedure.query(async () => {
    const db = await getDb();
    const now = Date.now();
    const oneDayAgo = now - 86400000;
    
    const scores = await db.select({
      channelId: listenerAnalytics.channelId,
      totalEvents: count(),
      uniqueListeners: sql<number>`COUNT(DISTINCT ${listenerAnalytics.sessionId})`,
      avgDuration: sql<number>`COALESCE(AVG(${listenerAnalytics.durationSeconds}), 0)`,
      tuneIns: sql<number>`SUM(CASE WHEN ${listenerAnalytics.eventType} = 'tune_in' THEN 1 ELSE 0 END)`,
      tuneOuts: sql<number>`SUM(CASE WHEN ${listenerAnalytics.eventType} = 'tune_out' THEN 1 ELSE 0 END)`,
      adImpressions: sql<number>`SUM(CASE WHEN ${listenerAnalytics.eventType} = 'ad_impression' THEN 1 ELSE 0 END)`,
      aiInteractions: sql<number>`SUM(CASE WHEN ${listenerAnalytics.eventType} = 'ai_interaction' THEN 1 ELSE 0 END)`,
    })
      .from(listenerAnalytics)
      .where(sql`${listenerAnalytics.createdAt} >= ${oneDayAgo}`)
      .groupBy(listenerAnalytics.channelId)
      .orderBy(desc(count()));
    
    // Calculate engagement score (0-100)
    return scores.map(ch => {
      const retentionRate = ch.tuneIns > 0 ? Math.max(0, 1 - (ch.tuneOuts / ch.tuneIns)) : 0;
      const durationScore = Math.min(ch.avgDuration / 300, 1); // 5 min = max
      const interactionScore = Math.min((ch.aiInteractions + ch.adImpressions) / Math.max(ch.uniqueListeners, 1), 1);
      const engagementScore = Math.round((retentionRate * 40 + durationScore * 35 + interactionScore * 25) * 100) / 100;
      
      return {
        channelId: ch.channelId,
        uniqueListeners: ch.uniqueListeners,
        totalEvents: ch.totalEvents,
        avgDurationSeconds: Math.round(ch.avgDuration),
        retentionRate: Math.round(retentionRate * 100),
        engagementScore: Math.min(engagementScore, 100),
        adImpressions: ch.adImpressions,
        aiInteractions: ch.aiInteractions,
      };
    });
  }),

  // ─── Get ad performance metrics ──────────────────────────────
  getAdPerformance: publicProcedure.query(async () => {
    const db = await getDb();
    const now = Date.now();
    const oneDayAgo = now - 86400000;
    
    // Get ad impression events
    const [adImpressions] = await db.select({ count: count() })
      .from(listenerAnalytics)
      .where(and(
        eq(listenerAnalytics.eventType, 'ad_impression'),
        sql`${listenerAnalytics.createdAt} >= ${oneDayAgo}`,
      ));
    
    // Get total listener count for impression rate
    const [totalListeners] = await db.select({
      count: sql<number>`COUNT(DISTINCT ${listenerAnalytics.sessionId})`,
    })
      .from(listenerAnalytics)
      .where(sql`${listenerAnalytics.createdAt} >= ${oneDayAgo}`);
    
    // Get active ad stats
    const [adStats] = await db.select({
      totalAds: count(),
      totalPlays: sql<number>`COALESCE(SUM(${adInventory.totalPlays}), 0)`,
      totalRevenue: sql<number>`COALESCE(SUM(${adInventory.totalPlays} * ${adInventory.costPerPlayCents}), 0)`,
    }).from(adInventory).where(eq(adInventory.active, true));
    
    return {
      dailyImpressions: adImpressions?.count ?? 0,
      uniqueListenersReached: totalListeners?.count ?? 0,
      impressionRate: totalListeners?.count ? Math.round((adImpressions?.count ?? 0) / totalListeners.count * 100) : 0,
      activeAds: adStats?.totalAds ?? 0,
      totalPlaysAllTime: adStats?.totalPlays ?? 0,
      estimatedRevenueCents: adStats?.totalRevenue ?? 0,
    };
  }),
});
