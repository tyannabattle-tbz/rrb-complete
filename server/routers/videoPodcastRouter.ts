/**
 * Video Podcast Router
 * 
 * tRPC procedures for managing video podcast content.
 * Handles video uploads, playback, recommendations, and engagement.
 * 
 * A Canryn Production
 */
import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import {
  createVideoPodcast,
  getVideoPodcast,
  getChannelVideoPodcasts,
  updateVideoPodcast,
  incrementViewCount,
  addLike,
  addComment,
  deleteVideoPodcast,
  searchVideoPodcasts,
  getTrendingVideos,
  recommendVideos,
  getVideoStats,
} from '../services/video-podcast-service';

export const videoPodcastRouter = router({
  createVideo: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().max(5000),
        channelId: z.string(),
        thumbnailUrl: z.string().url(),
        videoUrl: z.string().url(),
        duration: z.number().min(1),
        tags: z.array(z.string()).max(10),
        category: z.string(),
        resolution: z.enum(['720p', '1080p', '4K']),
        format: z.enum(['MP4', 'WebM', 'HLS']),
      })
    )
    .mutation(({ input }) => {
      const video = createVideoPodcast({
        ...input,
        publishedAt: new Date(),
      });

      return { success: true, video };
    }),

  getVideo: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return getVideoPodcast(input.id);
    }),

  getChannelVideos: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .query(({ input }) => {
      return getChannelVideoPodcasts(input.channelId);
    }),

  updateVideo: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
        transcript: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...updates } = input;
      const video = updateVideoPodcast(id, updates);

      if (!video) {
        throw new Error('Video not found');
      }

      return { success: true, video };
    }),

  deleteVideo: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const success = deleteVideoPodcast(input.id);

      if (!success) {
        throw new Error('Video not found');
      }

      return { success: true };
    }),

  recordView: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const video = incrementViewCount(input.id);

      if (!video) {
        throw new Error('Video not found');
      }

      return { success: true, views: video.views };
    }),

  addLike: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const video = addLike(input.id);

      if (!video) {
        throw new Error('Video not found');
      }

      return { success: true, likes: video.likes };
    }),

  addCommentCount: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const video = addComment(input.id);

      if (!video) {
        throw new Error('Video not found');
      }

      return { success: true, comments: video.comments };
    }),

  getVideoStats: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return getVideoStats(input.id);
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
        channelId: z.string().optional(),
      })
    )
    .query(({ input }) => {
      return searchVideoPodcasts(input.query, input.channelId);
    }),

  getTrending: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).optional(),
        channelId: z.string().optional(),
      })
    )
    .query(({ input }) => {
      return getTrendingVideos(input.limit || 10, input.channelId);
    }),

  getRecommendations: publicProcedure
    .input(
      z.object({
        watchedVideoIds: z.array(z.string()),
        limit: z.number().min(1).max(50).optional(),
      })
    )
    .query(({ input }) => {
      return recommendVideos(input.watchedVideoIds, input.limit || 5);
    }),
});
