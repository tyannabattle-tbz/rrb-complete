import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { streamManager } from '../services/streamManager';

export const streamsRouter = router({
  // Get all channels
  getAllChannels: publicProcedure.query(() => {
    return streamManager.getChannels();
  }),

  // Get channel by ID
  getChannel: publicProcedure.input(z.object({ channelId: z.string() })).query(({ input }) => {
    return streamManager.getChannel(input.channelId);
  }),

  // Get channels by category
  getChannelsByCategory: publicProcedure.input(z.object({ category: z.string() })).query(({ input }) => {
    return streamManager.getChannelsByCategory(input.category);
  }),

  // Get playlist for channel
  getPlaylist: publicProcedure.input(z.object({ channelId: z.string() })).query(({ input }) => {
    return streamManager.getPlaylist(input.channelId);
  }),

  // Get DJ shows for channel
  getDJShows: publicProcedure.input(z.object({ channelId: z.string() })).query(({ input }) => {
    return streamManager.getDJShows(input.channelId);
  }),

  // Get current DJ show
  getCurrentDJShow: publicProcedure.input(z.object({ channelId: z.string() })).query(({ input }) => {
    return streamManager.getCurrentDJShow(input.channelId);
  }),

  // Admin: Update listener count
  updateListenerCount: protectedProcedure
    .input(z.object({ channelId: z.string(), count: z.number() }))
    .mutation(({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }
      streamManager.updateListenerCount(input.channelId, input.count);
      return { success: true };
    }),

  // Admin: Add track to playlist
  addTrackToPlaylist: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        track: z.object({
          id: z.string(),
          title: z.string(),
          artist: z.string(),
          url: z.string(),
          duration: z.number(),
        }),
      })
    )
    .mutation(({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }
      streamManager.addTrackToPlaylist(input.channelId, {
        ...input.track,
        channelId: input.channelId,
      });
      return { success: true };
    }),

  // Admin: Remove track from playlist
  removeTrackFromPlaylist: protectedProcedure
    .input(z.object({ channelId: z.string(), trackId: z.string() }))
    .mutation(({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }
      streamManager.removeTrackFromPlaylist(input.channelId, input.trackId);
      return { success: true };
    }),

  // Admin: Start DJ show
  startDJShow: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        djName: z.string(),
        title: z.string(),
        description: z.string(),
        durationMinutes: z.number(),
      })
    )
    .mutation(({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }
      const now = Date.now();
      streamManager.startDJShow({
        id: `show-${Date.now()}`,
        channelId: input.channelId,
        djName: input.djName,
        startTime: now,
        endTime: now + input.durationMinutes * 60 * 1000,
        title: input.title,
        description: input.description,
        isLive: true,
      });
      return { success: true };
    }),

  // Admin: End DJ show
  endDJShow: protectedProcedure
    .input(z.object({ channelId: z.string(), showId: z.string() }))
    .mutation(({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }
      streamManager.endDJShow(input.channelId, input.showId);
      return { success: true };
    }),

  // Simulate listener activity (for demo)
  simulateListenerActivity: publicProcedure.mutation(() => {
    streamManager.simulateListenerActivity();
    return { success: true };
  }),
});
