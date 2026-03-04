import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import AdvancedSchedulingService from '../services/advancedScheduling';

export const advancedSchedulingRouter = router({
  // Create a post template
  createTemplate: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        contentType: z.string(),
        contentBody: z.string(),
        mediaUrls: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const template = await AdvancedSchedulingService.createTemplate({
        userId: ctx.user!.id,
        ...input,
        isActive: true,
      });

      return template;
    }),

  // Get user templates
  getUserTemplates: protectedProcedure.query(async ({ ctx }) => {
    const templates = await AdvancedSchedulingService.getUserTemplates(ctx.user!.id);
    return templates;
  }),

  // Get optimal posting times
  getOptimalPostingTimes: protectedProcedure
    .input(
      z.object({
        stationId: z.number(),
        contentType: z.string(),
        historicalDays: z.number().optional().default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const times = await AdvancedSchedulingService.getOptimalPostingTimes(
        ctx.user!.id,
        input.stationId,
        input.contentType,
        input.historicalDays
      );

      return times;
    }),

  // Create A/B test
  createABTest: protectedProcedure
    .input(
      z.object({
        stationId: z.number(),
        testName: z.string(),
        controlVersion: z.string(),
        testVersion: z.string(),
        endDate: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const test = await AdvancedSchedulingService.createABTest({
        userId: ctx.user!.id,
        ...input,
        startDate: new Date(),
        status: 'active',
      });

      return test;
    }),

  // Get active A/B tests
  getActiveABTests: protectedProcedure.query(async ({ ctx }) => {
    const tests = await AdvancedSchedulingService.getActiveABTests(ctx.user!.id);
    return tests;
  }),

  // Get A/B test results
  getABTestResults: protectedProcedure
    .input(z.object({ testId: z.number() }))
    .query(async ({ input }) => {
      const results = await AdvancedSchedulingService.getABTestResults(input.testId);
      return results;
    }),

  // Schedule a post
  schedulePost: protectedProcedure
    .input(
      z.object({
        stationId: z.number(),
        content: z.string(),
        platforms: z.array(z.string()),
        useOptimalTiming: z.boolean().optional().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const post = await AdvancedSchedulingService.schedulePost(
        ctx.user!.id,
        input.stationId,
        input.content,
        input.platforms,
        input.useOptimalTiming
      );

      return post;
    }),

  // Get scheduled posts
  getScheduledPosts: protectedProcedure
    .input(
      z.object({
        stationId: z.number(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const posts = await AdvancedSchedulingService.getScheduledPosts(
        input.stationId,
        input.startDate,
        input.endDate
      );

      return posts;
    }),

  // Get scheduling analytics
  getSchedulingAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const analytics = await AdvancedSchedulingService.getSchedulingAnalytics(ctx.user!.id);
    return analytics;
  }),

  // Get content recommendations
  getContentRecommendations: protectedProcedure
    .input(z.object({ stationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const recommendations = await AdvancedSchedulingService.getContentRecommendations(
        ctx.user!.id,
        input.stationId
      );

      return recommendations;
    }),
});

export default advancedSchedulingRouter;
