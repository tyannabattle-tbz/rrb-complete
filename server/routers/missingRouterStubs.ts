/**
 * Stub routers for frontend components that reference procedures
 * not yet wired into the main router.
 */
import { router, protectedProcedure } from '../_core/trpc';
import { contentRecommendationService } from '../services/contentRecommendationService';
import { rrbRadioService } from '../_core/rrbRadioService';

export const contentRecommendationRouter = router({
  getPersonalizedRecommendations: protectedProcedure.query(async ({ ctx }) => {
    return contentRecommendationService.getRecommendations(ctx.user.id.toString(), 10);
  }),
  getPlaylistRecommendations: protectedProcedure.query(async ({ ctx }) => {
    const recs = await contentRecommendationService.getRecommendations(ctx.user.id.toString(), 20);
    const genres = [...new Set(recs.map(r => r.content.genre))];
    return genres.map(genre => ({
      id: `playlist-${genre}`,
      name: `${genre} Mix`,
      description: `Curated ${genre} selections based on your listening`,
      tracks: recs.filter(r => r.content.genre === genre).map(r => r.content),
      trackCount: recs.filter(r => r.content.genre === genre).length,
    }));
  }),
  getTrendingContent: protectedProcedure.query(async () => {
    return contentRecommendationService.getTrendingContent(10);
  }),
  getRecommendationMetrics: protectedProcedure.query(async ({ ctx }) => {
    return contentRecommendationService.getRecommendationStats(ctx.user.id.toString());
  }),
});

export const rrbRadioRouter = router({
  getBroadcastMetrics: protectedProcedure.query(async () => {
    const stats = await rrbRadioService.getBroadcastStats();
    return {
      totalBroadcasts: stats.totalBroadcasts,
      liveBroadcasts: stats.liveBroadcasts,
      scheduledBroadcasts: stats.scheduledBroadcasts,
      completedBroadcasts: stats.completedBroadcasts,
      totalListeners: Math.floor(Math.random() * 500) + 100,
      peakListeners: Math.floor(Math.random() * 1000) + 200,
      averageListenDuration: '24:35',
      uptime: '99.7%',
    };
  }),
  getEngagementMetrics: protectedProcedure.query(async () => {
    return {
      likes: Math.floor(Math.random() * 2000) + 500,
      shares: Math.floor(Math.random() * 500) + 100,
      comments: Math.floor(Math.random() * 300) + 50,
      chatMessages: Math.floor(Math.random() * 1000) + 200,
      newFollowers: Math.floor(Math.random() * 100) + 20,
      engagementRate: (Math.random() * 5 + 3).toFixed(1) + '%',
    };
  }),
  getViewerTimeline: protectedProcedure.query(async () => {
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${i.toString().padStart(2, '0')}:00`,
      listeners: Math.floor(Math.random() * 300) + (i >= 6 && i <= 22 ? 100 : 20),
      chatActivity: Math.floor(Math.random() * 50) + (i >= 8 && i <= 20 ? 20 : 5),
    }));
  }),
  getGeographicDistribution: protectedProcedure.query(async () => {
    return [
      { region: 'North America', listeners: 450, percentage: 45 },
      { region: 'Europe', listeners: 200, percentage: 20 },
      { region: 'Africa', listeners: 150, percentage: 15 },
      { region: 'Asia', listeners: 100, percentage: 10 },
      { region: 'South America', listeners: 60, percentage: 6 },
      { region: 'Oceania', listeners: 40, percentage: 4 },
    ];
  }),
});
