import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { db } from './db';
import { contentCalendarPosts, platformEngagementMetrics, analyticsSummary } from '../drizzle/contentCalendarSchema';
import { AnalyticsTrackingService } from './services/analyticsTrackingService';
import { eq } from 'drizzle-orm';

describe('Content Calendar & Analytics Features', () => {
  const testUserId = 'test-user-123';
  const testDate = new Date('2026-03-04');

  beforeEach(async () => {
    // Clean up test data before each test
    await db.delete(contentCalendarPosts).where(eq(contentCalendarPosts.userId, testUserId));
    await db.delete(analyticsSummary).where(eq(analyticsSummary.userId, testUserId));
  });

  afterEach(async () => {
    // Clean up test data after each test
    await db.delete(contentCalendarPosts).where(eq(contentCalendarPosts.userId, testUserId));
    await db.delete(analyticsSummary).where(eq(analyticsSummary.userId, testUserId));
  });

  describe('Content Calendar Posts', () => {
    it('should create a new post with multiple platforms', async () => {
      const scheduledTime = new Date('2026-03-10T12:00:00');
      
      const result = await db.insert(contentCalendarPosts).values({
        userId: testUserId,
        title: 'Test Post',
        content: 'This is a test post for QUMUS ecosystem',
        scheduledTime,
        platforms: ['twitter', 'youtube'],
        hashtags: ['qumus', 'rockinrockinboogie'],
        status: 'scheduled',
      });

      expect(result[0]).toBeGreaterThan(0);

      const posts = await db
        .select()
        .from(contentCalendarPosts)
        .where(eq(contentCalendarPosts.userId, testUserId));

      expect(posts).toHaveLength(1);
      expect(posts[0].title).toBe('Test Post');
      expect(posts[0].platforms).toContain('twitter');
      expect(posts[0].platforms).toContain('youtube');
    });

    it('should update post schedule (drag-and-drop)', async () => {
      const originalTime = new Date('2026-03-10T12:00:00');
      const newTime = new Date('2026-03-15T14:30:00');

      const result = await db.insert(contentCalendarPosts).values({
        userId: testUserId,
        title: 'Draggable Post',
        content: 'Test drag and drop',
        scheduledTime: originalTime,
        platforms: ['twitter'],
        status: 'scheduled',
      });

      const postId = result[0];

      await db
        .update(contentCalendarPosts)
        .set({ scheduledTime: newTime })
        .where(eq(contentCalendarPosts.id, postId));

      const updated = await db
        .select()
        .from(contentCalendarPosts)
        .where(eq(contentCalendarPosts.id, postId));

      expect(updated[0].scheduledTime).toEqual(newTime);
    });

    it('should retrieve posts by date range', async () => {
      const startDate = new Date('2026-03-01');
      const endDate = new Date('2026-03-31');

      // Create posts within range
      await db.insert(contentCalendarPosts).values({
        userId: testUserId,
        title: 'Post 1',
        content: 'In range',
        scheduledTime: new Date('2026-03-10'),
        platforms: ['twitter'],
        status: 'scheduled',
      });

      await db.insert(contentCalendarPosts).values({
        userId: testUserId,
        title: 'Post 2',
        content: 'In range',
        scheduledTime: new Date('2026-03-20'),
        platforms: ['youtube'],
        status: 'scheduled',
      });

      // Create post outside range
      await db.insert(contentCalendarPosts).values({
        userId: testUserId,
        title: 'Post 3',
        content: 'Out of range',
        scheduledTime: new Date('2026-04-05'),
        platforms: ['facebook'],
        status: 'scheduled',
      });

      const posts = await db
        .select()
        .from(contentCalendarPosts)
        .where(
          (posts) => {
            const { and, gte, lte, eq } = require('drizzle-orm');
            return and(
              eq(posts.userId, testUserId),
              gte(posts.scheduledTime, startDate),
              lte(posts.scheduledTime, endDate)
            );
          }
        );

      expect(posts).toHaveLength(2);
      expect(posts.every((p) => p.userId === testUserId)).toBe(true);
    });

    it('should support bulk scheduling with intervals', async () => {
      const posts = [
        { title: 'Daily Post 1', content: 'Content 1', platforms: ['twitter'] },
        { title: 'Daily Post 2', content: 'Content 2', platforms: ['youtube'] },
        { title: 'Daily Post 3', content: 'Content 3', platforms: ['facebook'] },
      ];

      const startDate = new Date('2026-03-10');
      let currentDate = new Date(startDate);

      for (const post of posts) {
        await db.insert(contentCalendarPosts).values({
          userId: testUserId,
          title: post.title,
          content: post.content,
          scheduledTime: new Date(currentDate),
          platforms: post.platforms as any,
          status: 'scheduled',
        });

        // Increment by 1 day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const allPosts = await db
        .select()
        .from(contentCalendarPosts)
        .where(eq(contentCalendarPosts.userId, testUserId));

      expect(allPosts).toHaveLength(3);
      expect(allPosts[0].scheduledTime.getDate()).toBe(10);
      expect(allPosts[1].scheduledTime.getDate()).toBe(11);
      expect(allPosts[2].scheduledTime.getDate()).toBe(12);
    });
  });

  describe('Platform Engagement Metrics', () => {
    it('should track engagement metrics for a post', async () => {
      const postResult = await db.insert(contentCalendarPosts).values({
        userId: testUserId,
        title: 'Engagement Test',
        content: 'Test engagement tracking',
        scheduledTime: new Date('2026-03-10'),
        platforms: ['twitter'],
        status: 'published',
      });

      const postId = postResult[0];

      await AnalyticsTrackingService.trackEngagement({
        postId,
        platform: 'twitter',
        externalPostId: 'tweet-123',
        likes: 150,
        shares: 45,
        comments: 32,
        views: 2500,
        impressions: 5000,
      });

      const metrics = await db
        .select()
        .from(platformEngagementMetrics)
        .where(eq(platformEngagementMetrics.postId, postId));

      expect(metrics).toHaveLength(1);
      expect(metrics[0].likes).toBe(150);
      expect(metrics[0].shares).toBe(45);
      expect(metrics[0].comments).toBe(32);
      expect(metrics[0].engagementRate).toBe('5.40%');
    });

    it('should update existing engagement metrics', async () => {
      const postResult = await db.insert(contentCalendarPosts).values({
        userId: testUserId,
        title: 'Update Test',
        content: 'Test metric updates',
        scheduledTime: new Date('2026-03-10'),
        platforms: ['youtube'],
        status: 'published',
      });

      const postId = postResult[0];

      // Initial metrics
      await AnalyticsTrackingService.trackEngagement({
        postId,
        platform: 'youtube',
        externalPostId: 'video-123',
        likes: 100,
        views: 1000,
        impressions: 2000,
      });

      // Update metrics
      await AnalyticsTrackingService.trackEngagement({
        postId,
        platform: 'youtube',
        externalPostId: 'video-123',
        likes: 250,
        views: 2500,
        impressions: 5000,
      });

      const metrics = await db
        .select()
        .from(platformEngagementMetrics)
        .where(eq(platformEngagementMetrics.postId, postId));

      expect(metrics).toHaveLength(1);
      expect(metrics[0].likes).toBe(250);
      expect(metrics[0].views).toBe(2500);
    });

    it('should calculate correct engagement rates', async () => {
      const testCases = [
        { likes: 100, shares: 50, comments: 25, impressions: 5000, expected: '3.50%' },
        { likes: 0, shares: 0, comments: 0, impressions: 1000, expected: '0.00%' },
        { likes: 500, shares: 200, comments: 100, impressions: 2000, expected: '40.00%' },
      ];

      for (const testCase of testCases) {
        const rate = AnalyticsTrackingService.calculateEngagementRate(
          testCase.likes,
          testCase.shares,
          testCase.comments,
          testCase.impressions
        );
        expect(rate).toBe(testCase.expected);
      }
    });
  });

  describe('Analytics Summary', () => {
    it('should generate daily analytics summary', async () => {
      const summaryDate = new Date('2026-03-10');
      summaryDate.setHours(0, 0, 0, 0);

      // Create posts for the day
      const post1 = await db.insert(contentCalendarPosts).values({
        userId: testUserId,
        title: 'Post 1',
        content: 'Content 1',
        scheduledTime: new Date('2026-03-10T10:00:00'),
        platforms: ['twitter'],
        status: 'published',
      });

      const post2 = await db.insert(contentCalendarPosts).values({
        userId: testUserId,
        title: 'Post 2',
        content: 'Content 2',
        scheduledTime: new Date('2026-03-10T14:00:00'),
        platforms: ['youtube'],
        status: 'published',
      });

      // Add metrics
      await AnalyticsTrackingService.trackEngagement({
        postId: post1[0],
        platform: 'twitter',
        externalPostId: 'tweet-1',
        likes: 100,
        shares: 30,
        comments: 20,
        impressions: 2000,
      });

      await AnalyticsTrackingService.trackEngagement({
        postId: post2[0],
        platform: 'youtube',
        externalPostId: 'video-1',
        likes: 200,
        views: 5000,
        impressions: 10000,
      });

      // Generate summary
      await AnalyticsTrackingService.generateDailySummary(testUserId, summaryDate);

      const summaries = await db
        .select()
        .from(analyticsSummary)
        .where(eq(analyticsSummary.userId, testUserId));

      expect(summaries.length).toBeGreaterThan(0);
      
      const twitterSummary = summaries.find((s) => s.platform === 'twitter');
      expect(twitterSummary).toBeDefined();
      if (twitterSummary) {
        expect(twitterSummary.totalPosts).toBe(1);
        expect(twitterSummary.totalLikes).toBe(100);
      }
    });

    it('should compare platform performance', async () => {
      const startDate = new Date('2026-03-01');
      const endDate = new Date('2026-03-31');

      // Create posts on different platforms
      const twitterPost = await db.insert(contentCalendarPosts).values({
        userId: testUserId,
        title: 'Twitter Post',
        content: 'Tweet content',
        scheduledTime: new Date('2026-03-10'),
        platforms: ['twitter'],
        status: 'published',
      });

      const youtubePost = await db.insert(contentCalendarPosts).values({
        userId: testUserId,
        title: 'YouTube Post',
        content: 'Video content',
        scheduledTime: new Date('2026-03-15'),
        platforms: ['youtube'],
        status: 'published',
      });

      // Add metrics
      await AnalyticsTrackingService.trackEngagement({
        postId: twitterPost[0],
        platform: 'twitter',
        externalPostId: 'tweet-1',
        likes: 150,
        shares: 40,
        comments: 30,
        impressions: 3000,
      });

      await AnalyticsTrackingService.trackEngagement({
        postId: youtubePost[0],
        platform: 'youtube',
        externalPostId: 'video-1',
        likes: 500,
        views: 10000,
        impressions: 15000,
      });

      const comparison = await AnalyticsTrackingService.comparePlatformPerformance(
        testUserId,
        startDate,
        endDate
      );

      expect(comparison).toBeDefined();
      expect(Object.keys(comparison).length).toBeGreaterThan(0);
    });
  });

  describe('Bulk Schedule Templates', () => {
    it('should create and retrieve bulk schedule templates', async () => {
      const { bulkScheduleTemplates } = await import('../drizzle/contentCalendarSchema');

      const template = await db.insert(bulkScheduleTemplates).values({
        userId: testUserId,
        name: 'Weekly Promotion',
        description: 'Weekly promotional posts',
        posts: [
          {
            title: 'Monday Post',
            content: 'Start your week right',
            platforms: ['twitter', 'facebook'],
          },
          {
            title: 'Wednesday Post',
            content: 'Mid-week update',
            platforms: ['youtube'],
          },
        ],
        schedulePattern: 'weekly',
        startDate: new Date('2026-03-10'),
        isActive: true,
      });

      expect(template[0]).toBeGreaterThan(0);

      const templates = await db
        .select()
        .from(bulkScheduleTemplates)
        .where(eq(bulkScheduleTemplates.userId, testUserId));

      expect(templates).toHaveLength(1);
      expect(templates[0].name).toBe('Weekly Promotion');
      expect(templates[0].posts).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing engagement data gracefully', async () => {
      const postResult = await db.insert(contentCalendarPosts).values({
        userId: testUserId,
        title: 'No Engagement Post',
        content: 'Post with no engagement',
        scheduledTime: new Date('2026-03-10'),
        platforms: ['twitter'],
        status: 'published',
      });

      // Track with minimal data
      await AnalyticsTrackingService.trackEngagement({
        postId: postResult[0],
        platform: 'twitter',
        externalPostId: 'tweet-1',
      });

      const metrics = await db
        .select()
        .from(platformEngagementMetrics)
        .where(eq(platformEngagementMetrics.postId, postResult[0]));

      expect(metrics[0].likes).toBe(0);
      expect(metrics[0].engagementRate).toBe('0%');
    });

    it('should handle zero impressions gracefully', async () => {
      const rate = AnalyticsTrackingService.calculateEngagementRate(100, 50, 25, 0);
      expect(rate).toBe('0%');
    });
  });
});
