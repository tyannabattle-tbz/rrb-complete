/**
 * Content Generation tRPC Router
 * 
 * Exposes QUMUS content generation engine to frontend
 */

import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { contentGenerator, ContentGenerationRequest, ContentStatus } from "../qumus/contentGenerator";

export const contentGenerationRouter = router({
  /**
   * Generate podcast episode
   */
  generatePodcast: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        topic: z.string().optional(),
        theme: z.string().optional(),
        targetAudience: z.string().optional(),
        duration: z.number().optional(),
        style: z.string().optional(),
        tone: z.string().optional(),
        customPrompt: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const request: ContentGenerationRequest = {
        type: "podcast",
        ...input,
      };

      const content = await contentGenerator.generatePodcastEpisode(request);
      return content;
    }),

  /**
   * Generate audiobook chapter
   */
  generateAudiobook: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        topic: z.string().optional(),
        theme: z.string().optional(),
        targetAudience: z.string().optional(),
        duration: z.number().optional(),
        style: z.string().optional(),
        tone: z.string().optional(),
        customPrompt: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const request: ContentGenerationRequest = {
        type: "audiobook",
        ...input,
      };

      const content = await contentGenerator.generateAudiobookChapter(request);
      return content;
    }),

  /**
   * Generate radio show script
   */
  generateRadio: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        topic: z.string().optional(),
        theme: z.string().optional(),
        targetAudience: z.string().optional(),
        duration: z.number().optional(),
        style: z.string().optional(),
        tone: z.string().optional(),
        customPrompt: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const request: ContentGenerationRequest = {
        type: "radio",
        ...input,
      };

      const content = await contentGenerator.generateRadioShowScript(request);
      return content;
    }),

  /**
   * Get all generated content
   */
  listAll: publicProcedure.query(() => {
    return contentGenerator.getAllContent();
  }),

  /**
   * Get content by ID
   */
  get: publicProcedure
    .input(z.object({ contentId: z.string() }))
    .query(({ input }) => {
      return contentGenerator.getContent(input.contentId);
    }),

  /**
   * Get content by type
   */
  getByType: publicProcedure
    .input(z.object({ type: z.enum(["podcast", "audiobook", "radio"]) }))
    .query(({ input }) => {
      return contentGenerator.getContentByType(input.type);
    }),

  /**
   * Approve content
   */
  approve: protectedProcedure
    .input(z.object({ contentId: z.string() }))
    .mutation(({ input }) => {
      const success = contentGenerator.approveContent(input.contentId);
      return { success, contentId: input.contentId };
    }),

  /**
   * Publish content
   */
  publish: protectedProcedure
    .input(z.object({ contentId: z.string() }))
    .mutation(({ input }) => {
      const success = contentGenerator.publishContent(input.contentId);
      return { success, contentId: input.contentId };
    }),

  /**
   * Archive content
   */
  archive: protectedProcedure
    .input(z.object({ contentId: z.string() }))
    .mutation(({ input }) => {
      const success = contentGenerator.archiveContent(input.contentId);
      return { success, contentId: input.contentId };
    }),

  /**
   * Delete content
   */
  delete: protectedProcedure
    .input(z.object({ contentId: z.string() }))
    .mutation(({ input }) => {
      const success = contentGenerator.deleteContent(input.contentId);
      return { success, contentId: input.contentId };
    }),

  /**
   * Get content statistics
   */
  getStatistics: publicProcedure.query(() => {
    return contentGenerator.getStatistics();
  }),

  /**
   * Export content
   */
  export: protectedProcedure
    .input(z.object({ contentId: z.string().optional() }))
    .query(({ input }) => {
      return contentGenerator.exportContent(input.contentId);
    }),

  /**
   * Clear expired cache
   */
  clearCache: protectedProcedure.mutation(() => {
    contentGenerator.clearExpiredCache();
    return { success: true };
  }),
});
