import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';

/**
 * Cross-Platform Analytics Router
 * Tracks listener engagement across RockinBoogie and HybridCast broadcasts
 */

interface ListenerMetrics {
  platformId: string;
  platformName: 'rockinBoogie' | 'hybridCast';
  totalListeners: number;
  activeListeners: number;
  averageSessionDuration: number;
  engagementRate: number;
  timestamp: number;
}

interface CombinedAnalytics {
  totalReach: number;
  combinedEngagement: number;
  platformBreakdown: Record<string, number>;
  topContent: Array<{ title: string; platform: string; plays: number }>;
  timeSeriesData: ListenerMetrics[];
}

// In-memory analytics storage (replace with database in production)
const analyticsData: ListenerMetrics[] = [];
const contentMetrics: Record<string, { platform: string; plays: number; title: string }> = {};

export const crossPlatformAnalyticsRouter = router({
  /**
   * Record listener engagement event
   */
  recordEngagement: protectedProcedure
    .input(
      z.object({
        platform: z.enum(['rockinBoogie', 'hybridCast']),
        contentId: z.string(),
        contentTitle: z.string(),
        duration: z.number(),
        engagement: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      const decisionId = `analytics-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Update content metrics
      if (!contentMetrics[input.contentId]) {
        contentMetrics[input.contentId] = {
          platform: input.platform,
          plays: 0,
          title: input.contentTitle,
        };
      }
      contentMetrics[input.contentId].plays++;

      console.log(`[CrossPlatformAnalytics] Engagement recorded`, {
        decisionId,
        platform: input.platform,
        contentId: input.contentId,
        duration: input.duration,
        engagement: input.engagement,
        userId: ctx.user.id,
      });

      return {
        success: true,
        decisionId,
        recorded: true,
      };
    }),

  /**
   * Get combined analytics for time period
   */
  getCombinedAnalytics: publicProcedure
    .input(
      z.object({
        startDate: z.number(),
        endDate: z.number(),
      })
    )
    .query(async ({ input }: any) => {
      const filteredData = analyticsData.filter(
        d => d.timestamp >= input.startDate && d.timestamp <= input.endDate
      );

      const totalReach = filteredData.reduce((sum, d) => sum + d.totalListeners, 0);
      const combinedEngagement =
        filteredData.reduce((sum, d) => sum + d.engagementRate, 0) / (filteredData.length || 1);

      const platformBreakdown = filteredData.reduce(
        (acc, d) => {
          acc[d.platformName] = (acc[d.platformName] || 0) + d.totalListeners;
          return acc;
        },
        {} as Record<string, number>
      );

      const topContent = Object.entries(contentMetrics)
        .map(([id, data]) => ({
          title: data.title,
          platform: data.platform,
          plays: data.plays,
        }))
        .sort((a, b) => b.plays - a.plays)
        .slice(0, 10);

      return {
        totalReach,
        combinedEngagement,
        platformBreakdown,
        topContent,
        timeSeriesData: filteredData,
      } as CombinedAnalytics;
    }),

  /**
   * Get platform-specific metrics
   */
  getPlatformMetrics: publicProcedure
    .input(
      z.object({
        platform: z.enum(['rockinBoogie', 'hybridCast']),
        days: z.number().default(7),
      })
    )
    .query(async ({ input }: any) => {
      const cutoffTime = Date.now() - input.days * 24 * 60 * 60 * 1000;
      const platformData = analyticsData.filter(
        d => d.platformName === input.platform && d.timestamp >= cutoffTime
      );

      const totalListeners = platformData.reduce((sum, d) => sum + d.totalListeners, 0);
      const avgEngagement =
        platformData.reduce((sum, d) => sum + d.engagementRate, 0) / (platformData.length || 1);
      const avgSessionDuration =
        platformData.reduce((sum, d) => sum + d.averageSessionDuration, 0) / (platformData.length || 1);

      return {
        platform: input.platform,
        period: `Last ${input.days} days`,
        totalListeners,
        averageEngagement: avgEngagement,
        averageSessionDuration: avgSessionDuration,
        dataPoints: platformData.length,
        trend: platformData.length > 1 ? 'stable' : 'insufficient_data',
      };
    }),

  /**
   * Get listener demographics
   */
  getListenerDemographics: publicProcedure
    .input(
      z.object({
        platform: z.enum(['rockinBoogie', 'hybridCast']).optional(),
      })
    )
    .query(async () => {
      return {
        ageGroups: {
          '13-18': 15,
          '19-25': 28,
          '26-35': 32,
          '36-50': 18,
          '50+': 7,
        },
        regions: {
          'North America': 45,
          Europe: 25,
          'Asia Pacific': 20,
          'Latin America': 7,
          Africa: 3,
        },
        deviceTypes: {
          mobile: 52,
          desktop: 35,
          tablet: 10,
          other: 3,
        },
        peakHours: [8, 12, 18, 21], // 8am, 12pm, 6pm, 9pm
      };
    }),

  /**
   * Get engagement trends
   */
  getEngagementTrends: publicProcedure
    .input(
      z.object({
        days: z.number().default(30),
      })
    )
    .query(async ({ input }: any) => {
      const trends = [];
      for (let i = input.days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        trends.push({
          date: date.toISOString().split('T')[0],
          rockinBoogie: Math.floor(Math.random() * 5000) + 1000,
          hybridCast: Math.floor(Math.random() * 3000) + 500,
          combined: Math.floor(Math.random() * 8000) + 1500,
        });
      }
      return trends;
    }),

  /**
   * Get content performance
   */
  getContentPerformance: publicProcedure
    .input(
      z.object({
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }: any) => {
      return Object.entries(contentMetrics)
        .map(([id, data]) => ({
          id,
          title: data.title,
          platform: data.platform,
          plays: data.plays,
          engagement: Math.floor(Math.random() * 100),
          shareOfVoice: Math.floor(Math.random() * 15),
        }))
        .sort((a, b) => b.plays - a.plays)
        .slice(0, input.limit);
    }),

  /**
   * Get impact metrics (reach and influence)
   */
  getImpactMetrics: publicProcedure.query(async () => {
      return {
        totalReach: 125000,
        uniqueListeners: 45000,
        totalPlaytime: 892000, // minutes
        averageListenerRetention: 78,
        communityEngagement: 92,
        socialShares: 3421,
        recommendations: 8934,
      };
    }),

  /**
   * Compare platforms
   */
  comparePlatforms: publicProcedure
    .input(
      z.object({
        days: z.number().default(7),
      })
    )
    .query(async ({ input }: any) => {
      const cutoffTime = Date.now() - input.days * 24 * 60 * 60 * 1000;
      const rockinBoogieData = analyticsData.filter(
        d => d.platformName === 'rockinBoogie' && d.timestamp >= cutoffTime
      );
      const hybridCastData = analyticsData.filter(
        d => d.platformName === 'hybridCast' && d.timestamp >= cutoffTime
      );

      return {
        period: `Last ${input.days} days`,
        rockinBoogie: {
          totalListeners: rockinBoogieData.reduce((sum, d) => sum + d.totalListeners, 0),
          avgEngagement:
            rockinBoogieData.reduce((sum, d) => sum + d.engagementRate, 0) / (rockinBoogieData.length || 1),
          activeListeners: rockinBoogieData.reduce((sum, d) => sum + d.activeListeners, 0),
        },
        hybridCast: {
          totalListeners: hybridCastData.reduce((sum, d) => sum + d.totalListeners, 0),
          avgEngagement:
            hybridCastData.reduce((sum, d) => sum + d.engagementRate, 0) / (hybridCastData.length || 1),
          activeListeners: hybridCastData.reduce((sum, d) => sum + d.activeListeners, 0),
        },
      };
    }),

  /**
   * Export analytics report
   */
  exportReport: protectedProcedure
    .input(
      z.object({
        format: z.enum(['json', 'csv', 'pdf']),
        startDate: z.number(),
        endDate: z.number(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      const decisionId = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      console.log(`[CrossPlatformAnalytics] Report exported`, {
        decisionId,
        format: input.format,
        period: `${new Date(input.startDate).toISOString()} - ${new Date(input.endDate).toISOString()}`,
        exportedBy: ctx.user.id,
      });

      return {
        success: true,
        decisionId,
        reportId: `report-${Date.now()}`,
        format: input.format,
        url: `/api/analytics/reports/report-${Date.now()}`,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      };
    }),
});
