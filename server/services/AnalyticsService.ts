import { db } from '../db';
import { analytics } from '../../drizzle/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';

export interface AnalyticsEvent {
  contentId: string;
  contentType: 'song' | 'podcast' | 'video' | 'article';
  eventType: 'play' | 'like' | 'share' | 'comment' | 'download' | 'skip';
  userId?: string;
  duration?: number; // in seconds
  timestamp?: Date;
}

export class AnalyticsService {
  async trackEvent(event: AnalyticsEvent) {
    return await db.insert(analytics).values({
      id: `ana_${Date.now()}`,
      contentId: event.contentId,
      contentType: event.contentType,
      eventType: event.eventType,
      userId: event.userId,
      duration: event.duration,
      timestamp: event.timestamp || new Date(),
    }).returning();
  }

  async getContentStats(contentId: string) {
    const events = await db.query.analytics.findMany({
      where: eq(analytics.contentId, contentId),
    });

    const stats = {
      plays: events.filter((e) => e.eventType === 'play').length,
      likes: events.filter((e) => e.eventType === 'like').length,
      shares: events.filter((e) => e.eventType === 'share').length,
      comments: events.filter((e) => e.eventType === 'comment').length,
      downloads: events.filter((e) => e.eventType === 'download').length,
      skips: events.filter((e) => e.eventType === 'skip').length,
      avgDuration:
        events
          .filter((e) => e.duration)
          .reduce((sum, e) => sum + (e.duration || 0), 0) /
        events.filter((e) => e.duration).length || 0,
      uniqueListeners: new Set(
        events.filter((e) => e.userId).map((e) => e.userId)
      ).size,
    };

    return stats;
  }

  async getTrendingContent(
    contentType: string,
    days = 7,
    limit = 10
  ) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const events = await db.query.analytics.findMany({
      where: and(
        eq(analytics.contentType, contentType as any),
        gte(analytics.timestamp, startDate)
      ),
    });

    // Group by content and count plays
    const contentScores = new Map<string, number>();
    for (const event of events) {
      if (event.eventType === 'play') {
        contentScores.set(
          event.contentId,
          (contentScores.get(event.contentId) || 0) + 1
        );
      }
    }

    // Sort and return top N
    return Array.from(contentScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([contentId, score]) => ({ contentId, score }));
  }

  async getUserStats(userId: string) {
    const events = await db.query.analytics.findMany({
      where: eq(analytics.userId, userId),
    });

    return {
      totalPlays: events.filter((e) => e.eventType === 'play').length,
      totalLikes: events.filter((e) => e.eventType === 'like').length,
      totalShares: events.filter((e) => e.eventType === 'share').length,
      totalDownloads: events.filter((e) => e.eventType === 'download').length,
      contentTypes: Array.from(
        new Set(events.map((e) => e.contentType))
      ),
      lastActive: events.length > 0 ? events[0].timestamp : null,
    };
  }

  async getEngagementMetrics(contentId: string, startDate?: Date, endDate?: Date) {
    let query = db.query.analytics.findMany({
      where: eq(analytics.contentId, contentId),
    });

    const events = await query;

    const filtered = events.filter((e) => {
      if (startDate && e.timestamp < startDate) return false;
      if (endDate && e.timestamp > endDate) return false;
      return true;
    });

    const engagementRate = {
      plays: filtered.filter((e) => e.eventType === 'play').length,
      likes: filtered.filter((e) => e.eventType === 'like').length,
      comments: filtered.filter((e) => e.eventType === 'comment').length,
      shares: filtered.filter((e) => e.eventType === 'share').length,
      downloads: filtered.filter((e) => e.eventType === 'download').length,
      skips: filtered.filter((e) => e.eventType === 'skip').length,
    };

    const totalEngagements =
      engagementRate.likes +
      engagementRate.comments +
      engagementRate.shares +
      engagementRate.downloads;
    const engagementPercentage =
      engagementRate.plays > 0
        ? ((totalEngagements / engagementRate.plays) * 100).toFixed(2)
        : '0';

    return {
      ...engagementRate,
      engagementPercentage: parseFloat(engagementPercentage),
    };
  }

  async getDailyStats(contentId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const events = await db.query.analytics.findMany({
      where: and(
        eq(analytics.contentId, contentId),
        gte(analytics.timestamp, startDate)
      ),
    });

    // Group by day
    const dailyStats = new Map<string, number>();
    for (const event of events) {
      if (event.eventType === 'play') {
        const day = event.timestamp.toISOString().split('T')[0];
        dailyStats.set(day, (dailyStats.get(day) || 0) + 1);
      }
    }

    return Array.from(dailyStats.entries())
      .map(([date, plays]) => ({ date, plays }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getTopListeners(contentId: string, limit = 10) {
    const events = await db.query.analytics.findMany({
      where: and(
        eq(analytics.contentId, contentId),
        eq(analytics.eventType, 'play')
      ),
    });

    const listenerCounts = new Map<string, number>();
    for (const event of events) {
      if (event.userId) {
        listenerCounts.set(
          event.userId,
          (listenerCounts.get(event.userId) || 0) + 1
        );
      }
    }

    return Array.from(listenerCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([userId, plays]) => ({ userId, plays }));
  }
}

export const analyticsService = new AnalyticsService();
