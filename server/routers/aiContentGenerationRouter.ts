/**
 * AI Content Generation Router — 14th QUMUS Policy
 * Queries use publicProcedure; mutations use protectedProcedure.
 */
import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import * as aiContent from '../services/ai-content-generation-policy';

export const aiContentGenerationRouter = router({
  // QUERIES → publicProcedure (prevents login loops)
  getTemplates: publicProcedure
    .input(z.object({ type: z.string().optional(), channel: z.string().optional(), status: z.string().optional() }).optional())
    .query(({ input }) => aiContent.getTemplates(input ?? undefined)),

  getGeneratedContent: publicProcedure
    .input(z.object({ status: z.string().optional(), type: z.string().optional() }).optional())
    .query(({ input }) => aiContent.getGeneratedContent(input ?? undefined)),

  getSummary: publicProcedure
    .query(() => aiContent.getSummary()),

  getReports: publicProcedure
    .query(() => aiContent.getReports()),

  getSchedulerStatus: publicProcedure
    .query(() => aiContent.getSchedulerStatus()),

  // MUTATIONS → protectedProcedure (requires login)
  addTemplate: protectedProcedure
    .input(z.object({
      name: z.string(),
      type: z.enum(['show_description', 'social_post', 'broadcast_schedule', 'promo', 'newsletter', 'episode_summary']),
      channel: z.string(),
      prompt: z.string(),
      tone: z.enum(['professional', 'casual', 'inspirational', 'urgent', 'community']),
      maxLength: z.number().min(50).max(2000),
      status: z.enum(['active', 'paused', 'draft']).default('active'),
    }))
    .mutation(({ input }) => aiContent.addTemplate(input)),

  updateTemplate: protectedProcedure
    .input(z.object({
      id: z.string(),
      updates: z.object({
        name: z.string().optional(),
        prompt: z.string().optional(),
        tone: z.enum(['professional', 'casual', 'inspirational', 'urgent', 'community']).optional(),
        maxLength: z.number().optional(),
        status: z.enum(['active', 'paused', 'draft']).optional(),
      }),
    }))
    .mutation(({ input }) => aiContent.updateTemplate(input.id, input.updates)),

  runGeneration: protectedProcedure
    .mutation(() => aiContent.runGeneration()),

  approveContent: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => ({ success: aiContent.approveContent(input.id) })),

  rejectContent: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => ({ success: aiContent.rejectContent(input.id) })),

  publishContent: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => ({ success: aiContent.publishContent(input.id) })),

  startScheduler: protectedProcedure
    .input(z.object({ intervalMs: z.number().optional() }).optional())
    .mutation(({ input }) => { aiContent.startScheduler(input?.intervalMs); return { success: true }; }),

  stopScheduler: protectedProcedure
    .mutation(() => { aiContent.stopScheduler(); return { success: true }; }),
});
