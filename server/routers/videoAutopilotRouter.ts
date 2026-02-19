/**
 * Video Autopilot Router
 * Autonomous video scheduling with YouTube, spoke feeds, and open source channels
 * Integrated with QUMUS orchestration engine
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import * as youtubeService from '../services/youtubeService';
import * as spokeFeedService from '../services/spokeFeedService';
import { qumusEngine, DecisionPolicy } from '../qumus/decisionEngine';

interface AutopilotQueue {
  userId?: number;
  currentIndex: number;
  items: any[];
  isPlaying: boolean;
  lastUpdated: Date;
}

// In-memory autopilot queues per user
const autopilotQueues = new Map<string, AutopilotQueue>();

export const videoAutopilotRouter = router({
  /**
   * Get YouTube channel videos
   */
  getYouTubeChannelVideos: publicProcedure
    .input(
      z.object({
        channelId: z.string(),
        maxResults: z.number().int().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      try {
        const videos = await youtubeService.getChannelVideos(
          input.channelId,
          input.maxResults
        );
        return {
          success: true,
          data: videos,
          count: videos.length,
        };
      } catch (error) {
        console.error('[VideoAutopilot] YouTube channel error:', error);
        return {
          success: false,
          data: [],
          count: 0,
          error: 'Failed to fetch YouTube videos',
        };
      }
    }),

  /**
   * Get YouTube playlist videos
   */
  getYouTubePlaylistVideos: publicProcedure
    .input(
      z.object({
        playlistId: z.string(),
        maxResults: z.number().int().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      try {
        const videos = await youtubeService.getPlaylistVideos(
          input.playlistId,
          input.maxResults
        );
        return {
          success: true,
          data: videos,
          count: videos.length,
        };
      } catch (error) {
        console.error('[VideoAutopilot] YouTube playlist error:', error);
        return {
          success: false,
          data: [],
          count: 0,
          error: 'Failed to fetch playlist videos',
        };
      }
    }),

  /**
   * Search YouTube videos
   */
  searchYouTube: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(200),
        maxResults: z.number().int().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      try {
        const videos = await youtubeService.searchVideos(
          input.query,
          input.maxResults
        );
        return {
          success: true,
          data: videos,
          count: videos.length,
        };
      } catch (error) {
        console.error('[VideoAutopilot] YouTube search error:', error);
        return {
          success: false,
          data: [],
          count: 0,
          error: 'Failed to search YouTube',
        };
      }
    }),

  /**
   * Get RRB official channel videos
   */
  getRRBVideos: publicProcedure
    .input(
      z.object({
        maxResults: z.number().int().min(1).max(50).default(30),
      })
    )
    .query(async ({ input }) => {
      try {
        const videos = await youtubeService.getRRBChannelVideos(input.maxResults);
        return {
          success: true,
          data: videos,
          count: videos.length,
        };
      } catch (error) {
        console.error('[VideoAutopilot] RRB videos error:', error);
        return {
          success: false,
          data: [],
          count: 0,
          error: 'Failed to fetch RRB videos',
        };
      }
    }),

  /**
   * Get spoke feeds (RSS aggregation)
   */
  getSpokeFeedsAggregated: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(200).default(100),
      })
    )
    .query(async ({ input }) => {
      try {
        const items = await spokeFeedService.getAggregatedFeedItems(input.limit);
        return {
          success: true,
          data: items,
          count: items.length,
        };
      } catch (error) {
        console.error('[VideoAutopilot] Spoke feeds error:', error);
        return {
          success: false,
          data: [],
          count: 0,
          error: 'Failed to fetch spoke feeds',
        };
      }
    }),

  /**
   * Get spoke feeds by category
   */
  getSpokeByCategory: publicProcedure
    .input(
      z.object({
        category: z.string(),
        limit: z.number().int().min(1).max(200).default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        const items = await spokeFeedService.getItemsByCategory(
          input.category,
          input.limit
        );
        return {
          success: true,
          data: items,
          count: items.length,
        };
      } catch (error) {
        console.error('[VideoAutopilot] Category feeds error:', error);
        return {
          success: false,
          data: [],
          count: 0,
          error: 'Failed to fetch category feeds',
        };
      }
    }),

  /**
   * Search across all spoke feeds
   */
  searchSpokeFeeds: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(200),
        limit: z.number().int().min(1).max(200).default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        const items = await spokeFeedService.searchFeeds(input.query, input.limit);
        return {
          success: true,
          data: items,
          count: items.length,
        };
      } catch (error) {
        console.error('[VideoAutopilot] Spoke search error:', error);
        return {
          success: false,
          data: [],
          count: 0,
          error: 'Failed to search spoke feeds',
        };
      }
    }),

  /**
   * Get trending items
   */
  getTrendingContent: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      try {
        const items = await spokeFeedService.getTrendingItems(input.limit);
        return {
          success: true,
          data: items,
          count: items.length,
        };
      } catch (error) {
        console.error('[VideoAutopilot] Trending error:', error);
        return {
          success: false,
          data: [],
          count: 0,
          error: 'Failed to fetch trending content',
        };
      }
    }),

  /**
   * Initialize autopilot queue for user
   */
  initializeAutopilot: protectedProcedure
    .input(
      z.object({
        source: z.enum(['youtube', 'spoke', 'trending', 'rrb']),
        sourceId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const queueKey = `${ctx.user.id}-${input.source}`;
        let items: any[] = [];

        // Fetch items based on source
        switch (input.source) {
          case 'youtube':
            if (input.sourceId) {
              items = await youtubeService.getChannelVideos(input.sourceId, 50);
            }
            break;
          case 'rrb':
            items = await youtubeService.getRRBChannelVideos(50);
            break;
          case 'spoke':
            items = await spokeFeedService.getAggregatedFeedItems(50);
            break;
          case 'trending':
            items = await spokeFeedService.getTrendingItems(50);
            break;
        }

        const queue: AutopilotQueue = {
          userId: ctx.user.id,
          currentIndex: 0,
          items,
          isPlaying: false,
          lastUpdated: new Date(),
        };

        autopilotQueues.set(queueKey, queue);

        // Log to QUMUS
        await qumusEngine.recordDecision(
          'autopilot_init',
          {
            userId: ctx.user.id,
            source: input.source,
            itemCount: items.length,
          },
          'autonomous'
        );

        return {
          success: true,
          queue,
        };
      } catch (error) {
        console.error('[VideoAutopilot] Init error:', error);
        return {
          success: false,
          error: 'Failed to initialize autopilot',
        };
      }
    }),

  /**
   * Get next items in autopilot queue
   */
  getNextInQueue: protectedProcedure
    .input(
      z.object({
        source: z.enum(['youtube', 'spoke', 'trending', 'rrb']),
        count: z.number().int().min(1).max(20).default(5),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const queueKey = `${ctx.user.id}-${input.source}`;
        let queue = autopilotQueues.get(queueKey);

        if (!queue) {
          // Auto-initialize if not exists
          const items =
            input.source === 'youtube'
              ? []
              : input.source === 'rrb'
              ? await youtubeService.getRRBChannelVideos(50)
              : input.source === 'spoke'
              ? await spokeFeedService.getAggregatedFeedItems(50)
              : await spokeFeedService.getTrendingItems(50);

          queue = {
            userId: ctx.user.id,
            currentIndex: 0,
            items,
            isPlaying: true,
            lastUpdated: new Date(),
          };
          autopilotQueues.set(queueKey, queue);
        }

        const nextItems = queue.items.slice(
          queue.currentIndex,
          queue.currentIndex + input.count
        );

        return {
          success: true,
          items: nextItems,
          currentIndex: queue.currentIndex,
          totalItems: queue.items.length,
        };
      } catch (error) {
        console.error('[VideoAutopilot] Queue error:', error);
        return {
          success: false,
          items: [],
          error: 'Failed to get queue items',
        };
      }
    }),

  /**
   * Advance autopilot queue
   */
  advanceQueue: protectedProcedure
    .input(
      z.object({
        source: z.enum(['youtube', 'spoke', 'trending', 'rrb']),
        steps: z.number().int().min(1).max(100).default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const queueKey = `${ctx.user.id}-${input.source}`;
        let queue = autopilotQueues.get(queueKey);

        if (!queue) {
          return {
            success: false,
            error: 'Queue not initialized',
          };
        }

        queue.currentIndex = Math.min(
          queue.currentIndex + input.steps,
          queue.items.length - 1
        );
        queue.lastUpdated = new Date();

        // Log to QUMUS
        await qumusEngine.recordDecision(
          'autopilot_advance',
          {
            userId: ctx.user.id,
            source: input.source,
            newIndex: queue.currentIndex,
            steps: input.steps,
          },
          'autonomous'
        );

        return {
          success: true,
          currentIndex: queue.currentIndex,
          totalItems: queue.items.length,
        };
      } catch (error) {
        console.error('[VideoAutopilot] Advance error:', error);
        return {
          success: false,
          error: 'Failed to advance queue',
        };
      }
    }),

  /**
   * Add custom spoke feed
   */
  addCustomSpokeFeed: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        url: z.string().url(),
        category: z.string().min(1).max(50),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const feed = await spokeFeedService.addSpokeFeed(
          input.name,
          input.url,
          input.category
        );

        // Log to QUMUS
        await qumusEngine.recordDecision(
          'add_spoke_feed',
          {
            userId: ctx.user.id,
            feedName: input.name,
            feedUrl: input.url,
            category: input.category,
          },
          'user'
        );

        return {
          success: true,
          feed,
        };
      } catch (error) {
        console.error('[VideoAutopilot] Add feed error:', error);
        return {
          success: false,
          error: 'Failed to add spoke feed',
        };
      }
    }),
});
