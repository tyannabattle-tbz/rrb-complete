import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { db } from '../db';
import { callRecords, emergencyAlerts } from '../../drizzle/schema';
import { desc, gte } from 'drizzle-orm';

/**
 * Analytics Router
 * Provides real-time metrics and insights
 */

export const analyticsRouter = router({
  /**
   * Get current call metrics
   */
  getCurrentMetrics: protectedProcedure.query(async () => {
    // Get recent calls (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentCalls = await db
      .select()
      .from(callRecords)
      .where(gte(callRecords.createdAt, oneDayAgo));

    // Calculate metrics
    const totalCalls = recentCalls.length;
    const completedCalls = recentCalls.filter(c => c.sentiment).length;
    const completionRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;

    const totalDuration = recentCalls.reduce((sum, c) => sum + (c.duration || 0), 0);
    const averageCallDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls / 60) : 0;

    // Sentiment analysis
    const sentiment = {
      positive: recentCalls.filter(c => c.sentiment === 'positive').length,
      neutral: recentCalls.filter(c => c.sentiment === 'neutral').length,
      negative: recentCalls.filter(c => c.sentiment === 'negative').length,
    };

    return {
      totalListeners: 2847, // Placeholder - would come from WebSocket connections
      activeCalls: 3, // Placeholder - would come from active call tracking
      callsWaiting: 5, // Placeholder - would come from queue system
      averageCallDuration,
      callCompletionRate: completionRate,
      callSentiment: sentiment,
      totalCallsToday: totalCalls,
    };
  }),

  /**
   * Get frequency analytics
   */
  getFrequencyAnalytics: protectedProcedure.query(async () => {
    // Placeholder - would track frequency selections
    return [
      { frequency: 432, count: 1245 },
      { frequency: 528, count: 987 },
      { frequency: 639, count: 654 },
      { frequency: 741, count: 432 },
      { frequency: 852, count: 321 },
    ];
  }),

  /**
   * Get listener growth over time
   */
  getListenerGrowth: protectedProcedure.query(async () => {
    // Placeholder - would come from listener tracking
    return [
      { time: '12:00 AM', count: 450 },
      { time: '3:00 AM', count: 380 },
      { time: '6:00 AM', count: 620 },
      { time: '9:00 AM', count: 1200 },
      { time: '12:00 PM', count: 2100 },
      { time: '3:00 PM', count: 2847 },
    ];
  }),

  /**
   * Get peak hours
   */
  getPeakHours: protectedProcedure.query(async () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const calls = await db
      .select()
      .from(callRecords)
      .where(gte(callRecords.createdAt, oneDayAgo));

    // Group by hour
    const hourCounts = new Map<number, number>();
    for (let i = 0; i < 24; i++) {
      hourCounts.set(i, 0);
    }

    calls.forEach(call => {
      const hour = new Date(call.createdAt).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    return Array.from(hourCounts.entries()).map(([hour, count]) => ({
      hour,
      calls: count,
    }));
  }),

  /**
   * Get SOS statistics
   */
  getSOSStatistics: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin' && ctx.user.role !== 'moderator') {
      throw new Error('Unauthorized');
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const sosAlerts = await db
      .select()
      .from(emergencyAlerts)
      .where(gte(emergencyAlerts.createdAt, oneDayAgo));

    const sosCount = sosAlerts.filter(a => a.type === 'sos').length;
    const imOkayCount = sosAlerts.filter(a => a.type === 'im_okay').length;
    const resolvedCount = sosAlerts.filter(a => a.status === 'resolved').length;

    return {
      totalAlerts: sosAlerts.length,
      sosAlerts: sosCount,
      imOkayAlerts: imOkayCount,
      resolvedAlerts: resolvedCount,
      pendingAlerts: sosAlerts.length - resolvedCount,
    };
  }),

  /**
   * Get call quality metrics
   */
  getCallQualityMetrics: protectedProcedure.query(async () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const calls = await db
      .select()
      .from(callRecords)
      .where(gte(callRecords.createdAt, oneDayAgo));

    const positiveCount = calls.filter(c => c.sentiment === 'positive').length;
    const totalCount = calls.length;
    const qualityScore = totalCount > 0 ? Math.round((positiveCount / totalCount) * 100) : 0;

    return {
      qualityScore,
      totalCalls: totalCount,
      positiveCallsCount: positiveCount,
      averageRating: (qualityScore / 100) * 5, // Convert to 5-star rating
    };
  }),

  /**
   * Get trending topics
   */
  getTrendingTopics: protectedProcedure.query(async () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const calls = await db
      .select()
      .from(callRecords)
      .where(gte(callRecords.createdAt, oneDayAgo));

    // Count topics
    const topicCounts = new Map<string, number>();
    calls.forEach(call => {
      if (call.topic) {
        topicCounts.set(call.topic, (topicCounts.get(call.topic) || 0) + 1);
      }
    });

    // Sort by count and return top 5
    return Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({
        topic,
        count,
      }));
  }),

  /**
   * Get detailed call history
   */
  getCallHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const calls = await db
        .select()
        .from(callRecords)
        .orderBy(desc(callRecords.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return calls;
    }),
});
