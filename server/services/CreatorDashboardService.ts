import { db } from '../db';
import { analytics } from '../../drizzle/schema';
import { eq, gte } from 'drizzle-orm';

export interface CreatorStats {
  totalPlays: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  totalDownloads: number;
  totalSkips: number;
  uniqueListeners: number;
  avgEngagementRate: number;
  topContent: Array<{ contentId: string; plays: number }>;
  revenueEstimate: number;
}

export interface AudienceDemographics {
  topCountries: Array<{ country: string; listeners: number }>;
  topDevices: Array<{ device: string; plays: number }>;
  ageDistribution: Record<string, number>;
  genderDistribution: Record<string, number>;
  listeningTimes: Record<string, number>;
}

export class CreatorDashboardService {
  /**
   * Get creator stats for a user's content
   */
  async getCreatorStats(userId: string, days = 30): Promise<CreatorStats> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all events for content created by this user
    const allEvents = await db.query.analytics.findMany({
      where: gte(analytics.timestamp, startDate),
    });

    // Filter for this user's content (would need contentOwnerId in analytics)
    const userEvents = allEvents.filter((e) => {
      // This would need proper implementation based on your schema
      return true; // Placeholder
    });

    // Calculate stats
    const stats = {
      totalPlays: userEvents.filter((e) => e.eventType === 'play').length,
      totalLikes: userEvents.filter((e) => e.eventType === 'like').length,
      totalShares: userEvents.filter((e) => e.eventType === 'share').length,
      totalComments: userEvents.filter((e) => e.eventType === 'comment').length,
      totalDownloads: userEvents.filter((e) => e.eventType === 'download').length,
      totalSkips: userEvents.filter((e) => e.eventType === 'skip').length,
      uniqueListeners: new Set(
        userEvents.filter((e) => e.userId).map((e) => e.userId)
      ).size,
      avgEngagementRate: 0,
      topContent: this.getTopContent(userEvents),
      revenueEstimate: this.calculateRevenue(userEvents),
    };

    // Calculate engagement rate
    if (stats.totalPlays > 0) {
      const totalEngagements =
        stats.totalLikes +
        stats.totalShares +
        stats.totalComments +
        stats.totalDownloads;
      stats.avgEngagementRate = (totalEngagements / stats.totalPlays) * 100;
    }

    return stats;
  }

  /**
   * Get audience demographics
   */
  async getAudienceDemographics(userId: string): Promise<AudienceDemographics> {
    // This would require additional data collection
    // For now, return placeholder structure
    return {
      topCountries: [
        { country: 'United States', listeners: 1250 },
        { country: 'United Kingdom', listeners: 890 },
        { country: 'Canada', listeners: 650 },
        { country: 'Australia', listeners: 520 },
        { country: 'Germany', listeners: 480 },
      ],
      topDevices: [
        { device: 'Mobile', plays: 4500 },
        { device: 'Desktop', plays: 3200 },
        { device: 'Tablet', plays: 1800 },
        { device: 'Smart Speaker', plays: 950 },
      ],
      ageDistribution: {
        '13-17': 15,
        '18-24': 35,
        '25-34': 30,
        '35-44': 15,
        '45-54': 4,
        '55+': 1,
      },
      genderDistribution: {
        'Male': 58,
        'Female': 40,
        'Other': 2,
      },
      listeningTimes: {
        'Morning (6am-12pm)': 20,
        'Afternoon (12pm-6pm)': 35,
        'Evening (6pm-12am)': 40,
        'Night (12am-6am)': 5,
      },
    };
  }

  /**
   * Get content performance metrics
   */
  async getContentPerformance(userId: string) {
    const allEvents = await db.query.analytics.findMany({});

    // Group by content and calculate metrics
    const contentMetrics = new Map<string, any>();

    for (const event of allEvents) {
      if (!contentMetrics.has(event.contentId)) {
        contentMetrics.set(event.contentId, {
          contentId: event.contentId,
          plays: 0,
          likes: 0,
          shares: 0,
          comments: 0,
          downloads: 0,
          skips: 0,
          skipRate: 0,
          engagementRate: 0,
        });
      }

      const metrics = contentMetrics.get(event.contentId);
      switch (event.eventType) {
        case 'play':
          metrics.plays++;
          break;
        case 'like':
          metrics.likes++;
          break;
        case 'share':
          metrics.shares++;
          break;
        case 'comment':
          metrics.comments++;
          break;
        case 'download':
          metrics.downloads++;
          break;
        case 'skip':
          metrics.skips++;
          break;
      }

      // Calculate rates
      if (metrics.plays > 0) {
        metrics.skipRate = (metrics.skips / metrics.plays) * 100;
        const totalEngagements =
          metrics.likes +
          metrics.shares +
          metrics.comments +
          metrics.downloads;
        metrics.engagementRate = (totalEngagements / metrics.plays) * 100;
      }
    }

    return Array.from(contentMetrics.values())
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 20);
  }

  /**
   * Get revenue tracking
   */
  async getRevenueTracking(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const events = await db.query.analytics.findMany({
      where: gte(analytics.timestamp, startDate),
    });

    // Calculate revenue based on plays and engagement
    const totalPlays = events.filter((e) => e.eventType === 'play').length;
    const totalDownloads = events.filter((e) => e.eventType === 'download').length;

    // Revenue model: $0.003 per play, $0.10 per download
    const revenueFromPlays = totalPlays * 0.003;
    const revenueFromDownloads = totalDownloads * 0.1;
    const totalRevenue = revenueFromPlays + revenueFromDownloads;

    // Group by day
    const dailyRevenue = new Map<string, number>();
    for (const event of events) {
      const day = event.timestamp.toISOString().split('T')[0];
      let dayRevenue = dailyRevenue.get(day) || 0;

      if (event.eventType === 'play') {
        dayRevenue += 0.003;
      } else if (event.eventType === 'download') {
        dayRevenue += 0.1;
      }

      dailyRevenue.set(day, dayRevenue);
    }

    return {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      revenueFromPlays: parseFloat(revenueFromPlays.toFixed(2)),
      revenueFromDownloads: parseFloat(revenueFromDownloads.toFixed(2)),
      dailyRevenue: Array.from(dailyRevenue.entries())
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      estimatedMonthlyRevenue: parseFloat(
        (totalRevenue * (30 / days)).toFixed(2)
      ),
    };
  }

  /**
   * Get growth metrics
   */
  async getGrowthMetrics(userId: string) {
    // Compare current period with previous period
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const currentPeriod = await db.query.analytics.findMany({
      where: gte(analytics.timestamp, thirtyDaysAgo),
    });

    const previousPeriod = await db.query.analytics.findMany({
      where: gte(analytics.timestamp, sixtyDaysAgo),
    }).then((events) =>
      events.filter((e) => e.timestamp < thirtyDaysAgo)
    );

    const currentPlays = currentPeriod.filter((e) => e.eventType === 'play').length;
    const previousPlays = previousPeriod.filter((e) => e.eventType === 'play').length;

    const currentListeners = new Set(
      currentPeriod.filter((e) => e.userId).map((e) => e.userId)
    ).size;
    const previousListeners = new Set(
      previousPeriod.filter((e) => e.userId).map((e) => e.userId)
    ).size;

    return {
      playsGrowth: previousPlays > 0 
        ? (((currentPlays - previousPlays) / previousPlays) * 100).toFixed(1)
        : '0',
      listenersGrowth: previousListeners > 0
        ? (((currentListeners - previousListeners) / previousListeners) * 100).toFixed(1)
        : '0',
      currentPlays,
      previousPlays,
      currentListeners,
      previousListeners,
    };
  }

  /**
   * Helper: Get top content
   */
  private getTopContent(events: any[]): Array<{ contentId: string; plays: number }> {
    const contentPlays = new Map<string, number>();

    for (const event of events) {
      if (event.eventType === 'play') {
        contentPlays.set(
          event.contentId,
          (contentPlays.get(event.contentId) || 0) + 1
        );
      }
    }

    return Array.from(contentPlays.entries())
      .map(([contentId, plays]) => ({ contentId, plays }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 10);
  }

  /**
   * Helper: Calculate revenue
   */
  private calculateRevenue(events: any[]): number {
    const plays = events.filter((e) => e.eventType === 'play').length;
    const downloads = events.filter((e) => e.eventType === 'download').length;

    return plays * 0.003 + downloads * 0.1;
  }
}

export const creatorDashboardService = new CreatorDashboardService();
