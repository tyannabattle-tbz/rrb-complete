import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { listenerAnalytics, adInventory, contentSchedule } from "../../drizzle/schema";
import { eq, desc, sql, count, and } from "drizzle-orm";

/**
 * Listener Analytics Router
 * 
 * Tracks real-time listener events across all RRB channels.
 * Uses the actual listener_analytics schema:
 *   id, channel_id, channel_name, listener_count, peak_listeners,
 *   geo_region, device_type, session_duration_seconds, timestamp,
 *   hour_of_day, day_of_week, created_at
 */

export const listenerAnalyticsRouter = router({
  // ─── Record a listener event ──────────────────────────────
  recordEvent: publicProcedure
    .input(z.object({
      channelId: z.number(),
      channelName: z.string().optional(),
      listenerCount: z.number().default(1),
      peakListeners: z.number().optional(),
      geoRegion: z.string().optional(),
      deviceType: z.enum(['desktop', 'mobile', 'tablet', 'smart_speaker', 'other']).default('desktop'),
      sessionDurationSeconds: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const now = Date.now();
      
      const [result] = await db.insert(listenerAnalytics).values({
        channelId: input.channelId,
        channelName: input.channelName || `Channel ${input.channelId}`,
        listenerCount: input.listenerCount,
        peakListeners: input.peakListeners || input.listenerCount,
        geoRegion: input.geoRegion || null,
        deviceType: input.deviceType,
        sessionDurationSeconds: input.sessionDurationSeconds || 0,
        timestamp: now,
        hourOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
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
    
    // Total listeners today (sum of listener_count)
    const [totalListeners] = await db.select({
      count: sql<number>`COALESCE(SUM(${listenerAnalytics.listenerCount}), 0)`,
    })
      .from(listenerAnalytics)
      .where(sql`${listenerAnalytics.createdAt} >= ${oneDayAgo}`);
    
    // Top channels by listener count
    const topChannels = await db.select({
      channelId: listenerAnalytics.channelId,
      eventCount: count(),
    })
      .from(listenerAnalytics)
      .where(sql`${listenerAnalytics.createdAt} >= ${oneDayAgo}`)
      .groupBy(listenerAnalytics.channelId)
      .orderBy(desc(count()))
      .limit(10);
    
    // Device type breakdown
    const eventBreakdown = await db.select({
      eventType: listenerAnalytics.deviceType,
      count: count(),
    })
      .from(listenerAnalytics)
      .where(sql`${listenerAnalytics.createdAt} >= ${oneDayAgo}`)
      .groupBy(listenerAnalytics.deviceType);
    
    // Average session duration
    const [avgDuration] = await db.select({
      avg: sql<number>`COALESCE(AVG(${listenerAnalytics.sessionDurationSeconds}), 0)`,
    })
      .from(listenerAnalytics)
      .where(and(
        sql`${listenerAnalytics.createdAt} >= ${oneDayAgo}`,
        sql`${listenerAnalytics.sessionDurationSeconds} > 0`,
      ));
    
    return {
      hourlyEvents: hourlyEvents?.count || 0,
      dailyEvents: dailyEvents?.count || 0,
      uniqueSessions: totalListeners?.count || 0,
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
      totalListeners: sql<number>`COALESCE(SUM(${listenerAnalytics.listenerCount}), 0)`,
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
      deviceType: listenerAnalytics.deviceType,
      count: count(),
      avgDuration: sql<number>`COALESCE(AVG(${listenerAnalytics.sessionDurationSeconds}), 0)`,
    })
      .from(listenerAnalytics)
      .where(sql`${listenerAnalytics.createdAt} >= ${oneWeekAgo}`)
      .groupBy(listenerAnalytics.channelId, listenerAnalytics.deviceType)
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
      totalListeners: sql<number>`COALESCE(SUM(${listenerAnalytics.listenerCount}), 0)`,
      avgDuration: sql<number>`COALESCE(AVG(${listenerAnalytics.sessionDurationSeconds}), 0)`,
      peakListeners: sql<number>`COALESCE(MAX(${listenerAnalytics.peakListeners}), 0)`,
    })
      .from(listenerAnalytics)
      .where(sql`${listenerAnalytics.createdAt} >= ${oneDayAgo}`)
      .groupBy(listenerAnalytics.channelId)
      .orderBy(desc(count()));
    
    // Calculate engagement score (0-100)
    return scores.map(ch => {
      const durationScore = Math.min(ch.avgDuration / 300, 1); // 5 min = max
      const listenerScore = Math.min(ch.totalListeners / 100, 1); // 100 listeners = max
      const engagementScore = Math.round((durationScore * 50 + listenerScore * 50) * 100) / 100;
      
      return {
        channelId: ch.channelId,
        uniqueListeners: ch.totalListeners,
        totalEvents: ch.totalEvents,
        avgDurationSeconds: Math.round(ch.avgDuration),
        peakListeners: ch.peakListeners,
        engagementScore: Math.min(engagementScore, 100),
        retentionRate: 0,
        adImpressions: 0,
        aiInteractions: 0,
      };
    });
  }),

  // ─── Get ad performance metrics ──────────────────────────────
  getAdPerformance: publicProcedure.query(async () => {
    const db = await getDb();
    const now = Date.now();
    const oneDayAgo = now - 86400000;
    
    // Get total listener events today
    const [dailyListeners] = await db.select({ count: count() })
      .from(listenerAnalytics)
      .where(sql`${listenerAnalytics.createdAt} >= ${oneDayAgo}`);
    
    // Get total listeners today
    const [totalListeners] = await db.select({
      count: sql<number>`COALESCE(SUM(${listenerAnalytics.listenerCount}), 0)`,
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
      dailyImpressions: dailyListeners?.count ?? 0,
      uniqueListenersReached: totalListeners?.count ?? 0,
      impressionRate: totalListeners?.count ? Math.round((dailyListeners?.count ?? 0) / Math.max(totalListeners.count, 1) * 100) : 0,
      activeAds: adStats?.totalAds ?? 0,
      totalPlaysAllTime: adStats?.totalPlays ?? 0,
      estimatedRevenueCents: adStats?.totalRevenue ?? 0,
    };
  }),
});
