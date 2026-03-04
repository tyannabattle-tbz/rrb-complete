import { db } from '../db';
import { platformEngagementMetrics, analyticsSummary } from '../../drizzle/contentCalendarSchema';
import { eq, and } from 'drizzle-orm';

export interface EngagementData {
  postId: number;
  platform: 'twitter' | 'youtube' | 'facebook' | 'instagram';
  externalPostId: string;
  likes?: number;
  shares?: number;
  comments?: number;
  views?: number;
  clicks?: number;
  impressions?: number;
}

export class AnalyticsTrackingService {
  /**
   * Track engagement metrics for a post across all platforms
   */
  static async trackEngagement(data: EngagementData): Promise<void> {
    const totalEngagement = (data.likes || 0) + (data.shares || 0) + (data.comments || 0);
    const engagementRate = data.impressions
      ? ((totalEngagement / data.impressions) * 100).toFixed(2) + '%'
      : '0%';

    const existing = await db
      .select()
      .from(platformEngagementMetrics)
      .where(
        and(
          eq(platformEngagementMetrics.postId, data.postId),
          eq(platformEngagementMetrics.platform, data.platform)
        )
      );

    if (existing.length > 0) {
      await db
        .update(platformEngagementMetrics)
        .set({
          likes: data.likes || 0,
          shares: data.shares || 0,
          comments: data.comments || 0,
          views: data.views || 0,
          clicks: data.clicks || 0,
          impressions: data.impressions || 0,
          engagementRate,
          lastUpdated: new Date(),
        })
        .where(eq(platformEngagementMetrics.id, existing[0].id));
    } else {
      await db.insert(platformEngagementMetrics).values({
        postId: data.postId,
        platform: data.platform,
        externalPostId: data.externalPostId,
        likes: data.likes || 0,
        shares: data.shares || 0,
        comments: data.comments || 0,
        views: data.views || 0,
        clicks: data.clicks || 0,
        impressions: data.impressions || 0,
        engagementRate,
      });
    }
  }

  /**
   * Generate daily analytics summary for a user
   */
  static async generateDailySummary(userId: string, date: Date): Promise<void> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Get all posts for the day
    const dayPosts = await db.query.contentCalendarPosts.findMany({
      where: (posts, { eq, and, gte, lte }) =>
        and(
          eq(posts.userId, userId),
          gte(posts.scheduledTime, startDate),
          lte(posts.scheduledTime, endDate)
        ),
    });

    // Get metrics for all posts
    const metrics = await db
      .select()
      .from(platformEngagementMetrics)
      .where((metrics) => {
        const postIds = dayPosts.map((p) => p.id);
        return postIds.includes(metrics.postId);
      });

    // Calculate summary for each platform
    const platforms = ['twitter', 'youtube', 'facebook', 'instagram'] as const;

    for (const platform of platforms) {
      const platformMetrics = metrics.filter((m) => m.platform === platform);

      const summary = {
        totalPosts: dayPosts.filter((p) => p.platforms.includes(platform)).length,
        totalLikes: platformMetrics.reduce((sum, m) => sum + (m.likes || 0), 0),
        totalShares: platformMetrics.reduce((sum, m) => sum + (m.shares || 0), 0),
        totalComments: platformMetrics.reduce((sum, m) => sum + (m.comments || 0), 0),
        totalViews: platformMetrics.reduce((sum, m) => sum + (m.views || 0), 0),
        totalImpressions: platformMetrics.reduce((sum, m) => sum + (m.impressions || 0), 0),
      };

      const totalEngagement =
        summary.totalLikes + summary.totalShares + summary.totalComments;
      const avgEngagementRate =
        summary.totalImpressions > 0
          ? ((totalEngagement / summary.totalImpressions) * 100).toFixed(2) + '%'
          : '0%';

      // Find top post
      const topPost = platformMetrics.reduce((top, current) => {
        const currentEngagement = (current.likes || 0) + (current.shares || 0) + (current.comments || 0);
        const topEngagement = (top.likes || 0) + (top.shares || 0) + (top.comments || 0);
        return currentEngagement > topEngagement ? current : top;
      });

      const existingSummary = await db
        .select()
        .from(analyticsSummary)
        .where(
          and(
            eq(analyticsSummary.userId, userId),
            eq(analyticsSummary.platform, platform),
            eq(analyticsSummary.period, 'daily'),
            eq(analyticsSummary.periodDate, startDate)
          )
        );

      if (existingSummary.length > 0) {
        await db
          .update(analyticsSummary)
          .set({
            ...summary,
            averageEngagementRate: avgEngagementRate,
            topPost: topPost ? { id: topPost.postId, title: '', engagement: (topPost.likes || 0) + (topPost.shares || 0) + (topPost.comments || 0) } : undefined,
          })
          .where(eq(analyticsSummary.id, existingSummary[0].id));
      } else {
        await db.insert(analyticsSummary).values({
          userId,
          platform,
          period: 'daily',
          periodDate: startDate,
          ...summary,
          averageEngagementRate: avgEngagementRate,
          topPost: topPost ? { id: topPost.postId, title: '', engagement: (topPost.likes || 0) + (topPost.shares || 0) + (topPost.comments || 0) } : undefined,
        });
      }
    }

    // Generate "all platforms" summary
    const allMetrics = metrics;
    const allSummary = {
      totalPosts: dayPosts.length,
      totalLikes: allMetrics.reduce((sum, m) => sum + (m.likes || 0), 0),
      totalShares: allMetrics.reduce((sum, m) => sum + (m.shares || 0), 0),
      totalComments: allMetrics.reduce((sum, m) => sum + (m.comments || 0), 0),
      totalViews: allMetrics.reduce((sum, m) => sum + (m.views || 0), 0),
      totalImpressions: allMetrics.reduce((sum, m) => sum + (m.impressions || 0), 0),
    };

    const totalEngagement = allSummary.totalLikes + allSummary.totalShares + allSummary.totalComments;
    const avgEngagementRate =
      allSummary.totalImpressions > 0
        ? ((totalEngagement / allSummary.totalImpressions) * 100).toFixed(2) + '%'
        : '0%';

    const existingAllSummary = await db
      .select()
      .from(analyticsSummary)
      .where(
        and(
          eq(analyticsSummary.userId, userId),
          eq(analyticsSummary.platform, 'all'),
          eq(analyticsSummary.period, 'daily'),
          eq(analyticsSummary.periodDate, startDate)
        )
      );

    if (existingAllSummary.length > 0) {
      await db
        .update(analyticsSummary)
        .set({
          ...allSummary,
          averageEngagementRate: avgEngagementRate,
        })
        .where(eq(analyticsSummary.id, existingAllSummary[0].id));
    } else {
      await db.insert(analyticsSummary).values({
        userId,
        platform: 'all',
        period: 'daily',
        periodDate: startDate,
        ...allSummary,
        averageEngagementRate: avgEngagementRate,
      });
    }
  }

  /**
   * Get engagement rate for a post
   */
  static calculateEngagementRate(
    likes: number,
    shares: number,
    comments: number,
    impressions: number
  ): string {
    if (impressions === 0) return '0%';
    const totalEngagement = likes + shares + comments;
    return ((totalEngagement / impressions) * 100).toFixed(2) + '%';
  }

  /**
   * Compare performance across platforms
   */
  static async comparePlatformPerformance(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, any>> {
    const summaries = await db
      .select()
      .from(analyticsSummary)
      .where(
        and(
          eq(analyticsSummary.userId, userId),
          // Add date range filtering
        )
      );

    const comparison: Record<string, any> = {};
    const platforms = ['twitter', 'youtube', 'facebook', 'instagram'];

    for (const platform of platforms) {
      const platformData = summaries.filter((s) => s.platform === platform);
      comparison[platform] = {
        totalPosts: platformData.reduce((sum, s) => sum + (s.totalPosts || 0), 0),
        totalLikes: platformData.reduce((sum, s) => sum + (s.totalLikes || 0), 0),
        totalShares: platformData.reduce((sum, s) => sum + (s.totalShares || 0), 0),
        totalComments: platformData.reduce((sum, s) => sum + (s.totalComments || 0), 0),
        totalViews: platformData.reduce((sum, s) => sum + (s.totalViews || 0), 0),
        avgEngagementRate:
          platformData.length > 0
            ? (
                platformData.reduce((sum, s) => {
                  const rate = parseFloat(s.averageEngagementRate || '0');
                  return sum + rate;
                }, 0) / platformData.length
              ).toFixed(2) + '%'
            : '0%',
      };
    }

    return comparison;
  }
}
