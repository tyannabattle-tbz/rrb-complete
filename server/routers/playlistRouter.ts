/**
 * Playlist tRPC Router
 * Playlist management procedures
 * A Canryn Production
 */
import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { playlistService } from '../services/playlist-service';

export const playlistRouter = router({
  createPlaylist: publicProcedure
    .input(z.object({
      userId: z.string(),
      name: z.string().min(1).max(100),
      description: z.string().max(500).optional(),
    }))
    .mutation(({ input }) => {
      return playlistService.createPlaylist(input.userId, input.name, input.description);
    }),

  getPlaylist: publicProcedure
    .input(z.object({ playlistId: z.string() }))
    .query(({ input }) => {
      return playlistService.getPlaylist(input.playlistId);
    }),

  getUserPlaylists: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      return playlistService.getUserPlaylists(input.userId);
    }),

  addVideoToPlaylist: publicProcedure
    .input(z.object({
      playlistId: z.string(),
      videoId: z.string(),
      title: z.string(),
      duration: z.number(),
    }))
    .mutation(({ input }) => {
      return playlistService.addVideoToPlaylist(
        input.playlistId,
        input.videoId,
        input.title,
        input.duration
      );
    }),

  removeVideoFromPlaylist: publicProcedure
    .input(z.object({ playlistId: z.string(), videoId: z.string() }))
    .mutation(({ input }) => {
      return playlistService.removeVideoFromPlaylist(input.playlistId, input.videoId);
    }),

  reorderPlaylistVideos: publicProcedure
    .input(z.object({ playlistId: z.string(), videoOrder: z.array(z.string()) }))
    .mutation(({ input }) => {
      return playlistService.reorderPlaylistVideos(input.playlistId, input.videoOrder);
    }),

  updatePlaylist: publicProcedure
    .input(z.object({
      playlistId: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      isPublic: z.boolean().optional(),
      thumbnail: z.string().optional(),
    }))
    .mutation(({ input }) => {
      const { playlistId, ...updates } = input;
      return playlistService.updatePlaylist(playlistId, updates);
    }),

  deletePlaylist: publicProcedure
    .input(z.object({ playlistId: z.string() }))
    .mutation(({ input }) => {
      const success = playlistService.deletePlaylist(input.playlistId);
      return { success };
    }),

  getPublicPlaylists: publicProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(({ input }) => {
      return playlistService.getPublicPlaylists(input.limit);
    }),

  searchPlaylists: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input }) => {
      return playlistService.searchPlaylists(input.query);
    }),

  getPlaylistStats: publicProcedure
    .input(z.object({ playlistId: z.string() }))
    .query(({ input }) => {
      return playlistService.getPlaylistStats(input.playlistId);
    }),
});
