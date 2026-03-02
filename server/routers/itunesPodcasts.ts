/**
 * iTunes Podcasts Router
 * tRPC procedures for podcast search and discovery using iTunes API
 */

import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import * as itunesService from '../services/itunesService';

export const itunesPodcastsRouter = router({
  /**
   * Search for podcasts by query
   */
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(200),
        limit: z.number().int().min(1).max(200).default(20),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const results = await itunesService.searchPodcasts(
          input.query,
          input.limit
        );
        return {
          success: true,
          data: results,
          count: results.length,
        };
      } catch (error) {
        console.error('Podcast search error:', error);
        return {
          success: false,
          data: [],
          count: 0,
          error: 'Failed to search podcasts',
        };
      }
    }),

  /**
   * Get top podcasts
   */
  getTop: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(200).default(20),
        genreId: z.number().int().default(26), // 26 = Podcasts
      })
    )
    .query(async ({ input }) => {
      try {
        const results = await itunesService.getTopPodcasts(
          input.genreId,
          input.limit
        );
        return {
          success: true,
          data: results,
          count: results.length,
        };
      } catch (error) {
        console.error('Get top podcasts error:', error);
        return {
          success: false,
          data: [],
          count: 0,
          error: 'Failed to fetch top podcasts',
        };
      }
    }),

  /**
   * Get podcast details by collection ID
   */
  getDetails: publicProcedure
    .input(
      z.object({
        collectionId: z.number().int().positive(),
      })
    )
    .query(async ({ input }) => {
      try {
        const podcast = await itunesService.getPodcastDetails(
          input.collectionId
        );
        if (!podcast) {
          return {
            success: false,
            data: null,
            error: 'Podcast not found',
          };
        }
        return {
          success: true,
          data: podcast,
        };
      } catch (error) {
        console.error('Get podcast details error:', error);
        return {
          success: false,
          data: null,
          error: 'Failed to fetch podcast details',
        };
      }
    }),

  /**
   * Search for podcasts by artist
   */
  searchByArtist: publicProcedure
    .input(
      z.object({
        artistName: z.string().min(1).max(200),
        limit: z.number().int().min(1).max(200).default(20),
      })
    )
    .query(async ({ input }) => {
      try {
        const results = await itunesService.searchPodcastsByArtist(
          input.artistName,
          input.limit
        );
        return {
          success: true,
          data: results,
          count: results.length,
        };
      } catch (error) {
        console.error('Search by artist error:', error);
        return {
          success: false,
          data: [],
          count: 0,
          error: 'Failed to search podcasts by artist',
        };
      }
    }),

  /**
   * Get cache statistics (admin only in production)
   */
  getCacheStats: publicProcedure.query(() => {
    const stats = itunesService.getCacheStats();
    return {
      cacheSize: stats.size,
      cachedQueries: stats.entries,
    };
  }),

  /**
   * Clear cache (admin only in production)
   */
  clearCache: publicProcedure.mutation(() => {
    itunesService.clearCache();
    return {
      success: true,
      message: 'Cache cleared',
    };
  }),

  /**
   * Popular podcasts (hardcoded list for quick access)
   */
  getPopular: publicProcedure.mutation(async () => {
    const popularQueries = [
      'Joe Rogan Experience',
      'Stuff You Should Know',
      'Serial',
      'NPR News Now',
      'Radiolab',
    ];

    try {
      const results = await Promise.all(
        popularQueries.map((query) =>
          itunesService.searchPodcasts(query, 1).catch((err) => {
            console.error(`Failed to search for ${query}:`, err);
            return [];
          })
        )
      );

      const flattened = results.flat();
      console.log(`getPopular returned ${flattened.length} podcasts`);
      return {
        success: true,
        data: flattened,
        count: flattened.length,
      };
      } catch (error) {
        console.error('Get popular podcasts error:', error);
        // Return some fallback popular podcasts
        return {
          success: false,
          data: [],
          count: 0,
          error: error instanceof Error ? error.message : 'Failed to fetch popular podcasts',
        };
      }
  }),
});
