/**
 * Sound Effects Router
 * Handles sound effects library operations including search, categories, collections, and analytics
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { soundEffectsLibraryService } from "../services/soundEffectsLibraryService";
import { z } from "zod";

export const soundEffectsRouter = router({
  /**
   * Get all sound effect categories
   */
  getCategories: publicProcedure.query(async () => {
    return await soundEffectsLibraryService.getCategories();
  }),

  /**
   * Search sound effects
   */
  searchEffects: publicProcedure
    .input(z.object({ query: z.string(), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      return await soundEffectsLibraryService.searchSoundEffects(input.query, input.limit);
    }),

  /**
   * Get effects by category
   */
  getEffectsByCategory: publicProcedure
    .input(z.object({ category: z.string(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return await soundEffectsLibraryService.getSoundEffectsByCategory(input.category, undefined, input.limit);
    }),

  /**
   * Get trending effects
   */
  getTrendingEffects: publicProcedure
    .input(z.object({ limit: z.number().default(12) }))
    .query(async ({ input }) => {
      return await soundEffectsLibraryService.getTrendingSoundEffects(input.limit);
    }),

  /**
   * Get sound effect details
   */
  getEffectDetails: publicProcedure
    .input(z.object({ effectId: z.string() }))
    .query(async ({ input }) => {
      return await soundEffectsLibraryService.getSoundEffectDetails(input.effectId);
    }),

  /**
   * Get recommended effects for project
   */
  getRecommendedEffects: publicProcedure
    .input(z.object({ projectId: z.string(), limit: z.number().default(10) }))
    .query(async ({ input }) => {
      return await soundEffectsLibraryService.getRecommendedEffects(input.projectId, input.limit);
    }),

  /**
   * Add effect to project
   */
  addEffectToProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        effectId: z.string(),
        timestamp: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await soundEffectsLibraryService.addEffectToProject(input.projectId, input.effectId, input.timestamp);
    }),

  /**
   * Get user collections
   */
  getCollections: protectedProcedure.query(async ({ ctx }) => {
    return await soundEffectsLibraryService.getCollections(ctx.user?.id);
  }),

  /**
   * Create new collection
   */
  createCollection: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await soundEffectsLibraryService.createCollection(input.name, input.description || '');
    }),

  /**
   * Add effect to collection
   */
  addEffectToCollection: protectedProcedure
    .input(
      z.object({
        collectionId: z.string(),
        effectId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await soundEffectsLibraryService.addEffectToCollection(input.collectionId, input.effectId);
    }),

  /**
   * Get usage analytics
   */
  getUsageAnalytics: protectedProcedure.query(async ({ ctx }) => {
    return await soundEffectsLibraryService.getDetailedUsageAnalytics(ctx.user?.id);
  }),

  /**
   * Download sound effect
   */
  downloadEffect: protectedProcedure
    .input(
      z.object({
        effectId: z.string(),
        format: z.string().default('wav'),
      })
    )
    .mutation(async ({ input }) => {
      return await soundEffectsLibraryService.downloadSoundEffect(input.effectId, input.format);
    }),

  /**
   * Batch download effects
   */
  batchDownloadEffects: protectedProcedure
    .input(z.object({ effectIds: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      return await soundEffectsLibraryService.batchDownloadEffects(input.effectIds);
    }),

  /**
   * Rate sound effect
   */
  rateEffect: protectedProcedure
    .input(
      z.object({
        effectId: z.string(),
        rating: z.number().min(1).max(5),
        review: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await soundEffectsLibraryService.rateSoundEffect(input.effectId, input.rating, input.review);
    }),

  /**
   * Upload custom effect
   */
  uploadCustomEffect: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        category: z.string(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await soundEffectsLibraryService.uploadCustomEffect(input.name, input.category, Buffer.from(''), input.metadata || {});
    }),
});
