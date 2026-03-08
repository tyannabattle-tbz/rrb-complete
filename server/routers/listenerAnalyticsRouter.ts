import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { listenerAnalytics } from "../../drizzle/schema";
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
});
