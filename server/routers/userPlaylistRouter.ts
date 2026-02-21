import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { UserPlaylistService } from '../services/userPlaylistService';
import { TRPCError } from '@trpc/server';

export const userPlaylistRouter = router({
  /**
   * Create a new playlist
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const playlist = await UserPlaylistService.createPlaylist({
          userId: ctx.user.id,
          ...input,
        });
        return playlist;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create playlist',
        });
      }
    }),

  /**
   * Get all playlists for current user
   */
  getMyPlaylists: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await UserPlaylistService.getUserPlaylists(ctx.user.id);
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch playlists',
      });
    }
  }),

  /**
   * Get a specific playlist with all tracks
   */
  getPlaylist: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const playlist = await UserPlaylistService.getPlaylistWithTracks(
          input.id,
          ctx.user.id
        );

        if (!playlist) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Playlist not found',
          });
        }

        return playlist;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch playlist',
        });
      }
    }),

  /**
   * Update playlist metadata
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const playlist = await UserPlaylistService.updatePlaylist(input, ctx.user.id);
        if (!playlist) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Playlist not found',
          });
        }
        return playlist;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update playlist',
        });
      }
    }),

  /**
   * Delete a playlist
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const playlist = await UserPlaylistService.deletePlaylist(
          input.id,
          ctx.user.id
        );
        if (!playlist) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Playlist not found',
          });
        }
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete playlist',
        });
      }
    }),

  /**
   * Add a track to a playlist
   */
  addTrack: protectedProcedure
    .input(
      z.object({
        playlistId: z.number(),
        trackId: z.string(),
        position: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Verify ownership
        const playlist = await UserPlaylistService.getPlaylistWithTracks(
          input.playlistId,
          ctx.user.id
        );

        if (!playlist) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Playlist not found',
          });
        }

        const position = input.position ?? playlist.tracks.length;

        const track = await UserPlaylistService.addTrackToPlaylist({
          playlistId: input.playlistId,
          trackId: input.trackId,
          position,
        });

        return track;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add track',
        });
      }
    }),

  /**
   * Remove a track from a playlist
   */
  removeTrack: protectedProcedure
    .input(
      z.object({
        playlistId: z.number(),
        trackId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Verify ownership
        const playlist = await UserPlaylistService.getPlaylistWithTracks(
          input.playlistId,
          ctx.user.id
        );

        if (!playlist) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Playlist not found',
          });
        }

        await UserPlaylistService.removeTrackFromPlaylist(
          input.playlistId,
          input.trackId
        );

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove track',
        });
      }
    }),

  /**
   * Reorder tracks in a playlist
   */
  reorderTracks: protectedProcedure
    .input(
      z.object({
        playlistId: z.number(),
        trackIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Verify ownership
        const playlist = await UserPlaylistService.getPlaylistWithTracks(
          input.playlistId,
          ctx.user.id
        );

        if (!playlist) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Playlist not found',
          });
        }

        const result = await UserPlaylistService.reorderTracks(
          input.playlistId,
          input.trackIds
        );

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reorder tracks',
        });
      }
    }),

  /**
   * Clear all tracks from a playlist
   */
  clearPlaylist: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await UserPlaylistService.clearPlaylist(
          input.id,
          ctx.user.id
        );
        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to clear playlist',
        });
      }
    }),

  /**
   * Get public playlists for discovery
   */
  getPublicPlaylists: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        return await UserPlaylistService.getPublicPlaylists(
          input.limit,
          input.offset
        );
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch public playlists',
        });
      }
    }),

  /**
   * Duplicate a playlist
   */
  duplicate: protectedProcedure
    .input(
      z.object({
        sourcePlaylistId: z.number(),
        newName: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const newPlaylist = await UserPlaylistService.duplicatePlaylist(
          input.sourcePlaylistId,
          ctx.user.id,
          input.newName
        );
        return newPlaylist;
      } catch (error) {
        if (error instanceof Error && error.message === 'Source playlist not found') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Source playlist not found',
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to duplicate playlist',
        });
      }
    }),
});
