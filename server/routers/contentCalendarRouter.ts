import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { contentCalendarPosts, platformEngagementMetrics, analyticsSummary, bulkScheduleTemplates } from '../../drizzle/schema';
import { getDb } from '../db';
import { eq, and, gte, lte } from 'drizzle-orm';

export const contentCalendarRouter = router({
  // Create a new post
  createPost: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      content: z.string().min(1),
      scheduledTime: z.date(),
      platforms: z.array(z.enum(['twitter', 'youtube', 'facebook', 'instagram'])),
      mediaUrls: z.array(z.string()).optional(),
      hashtags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      const post = await db.insert(contentCalendarPosts).values({
        userId: ctx.user.id.toString(),
        title: input.title,
        content: input.content,
        scheduledTime: input.scheduledTime,
        platforms: input.platforms,
        mediaUrls: input.mediaUrls || [],
        hashtags: input.hashtags || [],
        status: 'scheduled',
      });
      return { success: true, postId: post[0] };
    }),

  // Get calendar posts for a date range
  getPostsByDateRange: protectedProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      const posts = await db
        .select()
        .from(contentCalendarPosts)
        .where(
          and(
            eq(contentCalendarPosts.userId, ctx.user.id.toString()),
            gte(contentCalendarPosts.scheduledTime, input.startDate),
            lte(contentCalendarPosts.scheduledTime, input.endDate)
          )
        );
      return posts;
    }),

  // Update post (drag-and-drop reschedule)
  updatePostSchedule: protectedProcedure
    .input(z.object({
      postId: z.number(),
      newScheduledTime: z.date(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      await db
        .update(contentCalendarPosts)
        .set({ scheduledTime: input.newScheduledTime, updatedAt: new Date() })
        .where(
          and(
            eq(contentCalendarPosts.id, input.postId),
            eq(contentCalendarPosts.userId, ctx.user.id.toString())
          )
        );
      return { success: true };
    }),

  // Bulk schedule posts
  bulkSchedulePosts: protectedProcedure
    .input(z.object({
      posts: z.array(z.object({
        title: z.string(),
        content: z.string(),
        platforms: z.array(z.enum(['twitter', 'youtube', 'facebook', 'instagram'])),
        mediaUrls: z.array(z.string()).optional(),
        hashtags: z.array(z.string()).optional(),
      })),
      startDate: z.date(),
      interval: z.enum(['hourly', 'daily', 'weekly']),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      const createdPosts = [];
      let currentDate = new Date(input.startDate);

      for (const post of input.posts) {
        const result = await db.insert(contentCalendarPosts).values({
          userId: ctx.user.id.toString(),
          title: post.title,
          content: post.content,
          scheduledTime: new Date(currentDate),
          platforms: post.platforms,
          mediaUrls: post.mediaUrls || [],
          hashtags: post.hashtags || [],
          status: 'scheduled',
        });
        createdPosts.push(result[0]);

        // Increment date based on interval
        if (input.interval === 'hourly') {
          currentDate.setHours(currentDate.getHours() + 1);
        } else if (input.interval === 'daily') {
          currentDate.setDate(currentDate.getDate() + 1);
        } else if (input.interval === 'weekly') {
          currentDate.setDate(currentDate.getDate() + 7);
        }
      }

      return { success: true, count: createdPosts.length };
    }),

  // Get engagement metrics for a post
  getPostMetrics: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      const metrics = await db
        .select()
        .from(platformEngagementMetrics)
        .where(eq(platformEngagementMetrics.postId, input.postId));
      return metrics;
    }),

  // Update engagement metrics (called by webhook/scheduler)
  updateEngagementMetrics: publicProcedure
    .input(z.object({
      postId: z.number(),
      platform: z.enum(['twitter', 'youtube', 'facebook', 'instagram']),
      externalPostId: z.string(),
      likes: z.number().optional(),
      shares: z.number().optional(),
      comments: z.number().optional(),
      views: z.number().optional(),
      clicks: z.number().optional(),
      impressions: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      const existing = await db
        .select()
        .from(platformEngagementMetrics)
        .where(
          and(
            eq(platformEngagementMetrics.postId, input.postId),
            eq(platformEngagementMetrics.platform, input.platform)
          )
        );

      if (existing.length > 0) {
        // Update existing metrics
        const totalEngagement = (input.likes || 0) + (input.shares || 0) + (input.comments || 0);
        const engagementRate = input.impressions ? ((totalEngagement / input.impressions) * 100).toFixed(2) + '%' : '0%';

        await db
          .update(platformEngagementMetrics)
          .set({
            likes: input.likes || 0,
            shares: input.shares || 0,
            comments: input.comments || 0,
            views: input.views || 0,
            clicks: input.clicks || 0,
            impressions: input.impressions || 0,
            engagementRate,
            lastUpdated: new Date(),
          })
          .where(eq(platformEngagementMetrics.id, existing[0].id));
      } else {
        // Create new metrics
        const totalEngagement = (input.likes || 0) + (input.shares || 0) + (input.comments || 0);
        const engagementRate = input.impressions ? ((totalEngagement / input.impressions) * 100).toFixed(2) + '%' : '0%';

        await db.insert(platformEngagementMetrics).values({
          postId: input.postId,
          platform: input.platform,
          externalPostId: input.externalPostId,
          likes: input.likes || 0,
          shares: input.shares || 0,
          comments: input.comments || 0,
          views: input.views || 0,
          clicks: input.clicks || 0,
          impressions: input.impressions || 0,
          engagementRate,
        });
      }

      return { success: true };
    }),

  // Get analytics summary for user
  getAnalyticsSummary: protectedProcedure
    .input(z.object({
      platform: z.enum(['twitter', 'youtube', 'facebook', 'instagram', 'all']).optional(),
      period: z.enum(['daily', 'weekly', 'monthly']).optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      let query = db.select().from(analyticsSummary).where(eq(analyticsSummary.userId, ctx.user.id.toString()));

      if (input.platform && input.platform !== 'all') {
        query = query.where(eq(analyticsSummary.platform, input.platform));
      }

      if (input.period) {
        query = query.where(eq(analyticsSummary.period, input.period));
      }

      const results = await query;
      return results;
    }),

  // Create bulk schedule template
  createBulkTemplate: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      posts: z.array(z.object({
        title: z.string(),
        content: z.string(),
        platforms: z.array(z.enum(['twitter', 'youtube', 'facebook', 'instagram'])),
        mediaUrls: z.array(z.string()).optional(),
        hashtags: z.array(z.string()).optional(),
      })),
      schedulePattern: z.enum(['daily', 'weekly', 'biweekly', 'monthly']),
      startDate: z.date(),
      endDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      const template = await db.insert(bulkScheduleTemplates).values({
        userId: ctx.user.id.toString(),
        name: input.name,
        description: input.description,
        posts: input.posts,
        schedulePattern: input.schedulePattern,
        startDate: input.startDate,
        endDate: input.endDate,
        isActive: true,
      });
      return { success: true, templateId: template[0] };
    }),

  // Get bulk templates
  getBulkTemplates: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    const templates = await db
      .select()
      .from(bulkScheduleTemplates)
      .where(eq(bulkScheduleTemplates.userId, ctx.user.id.toString()));
    return templates;
  }),
});
