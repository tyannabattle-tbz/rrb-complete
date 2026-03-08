import { mysqlTable, varchar, text, datetime, int, boolean, json } from 'drizzle-orm/mysql-core';
import { relations, sql } from 'drizzle-orm';

// Content Calendar Posts
export const contentCalendarPosts = mysqlTable('content_calendar_posts', {
  id: int('id').primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  scheduledTime: datetime('scheduled_time').notNull(),
  platforms: json('platforms').$type<string[]>().notNull(), // ['twitter', 'youtube', 'facebook', 'instagram']
  status: varchar('status', { length: 20 }).default('draft'),
  mediaUrls: json('media_urls').$type<string[]>(),
  hashtags: json('hashtags').$type<string[]>(),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP`),
  publishedAt: datetime('published_at'),
});

// Bulk Schedule Templates
export const bulkScheduleTemplates = mysqlTable('bulk_schedule_templates', {
  id: int('id').primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  posts: json('posts').$type<Array<{
    title: string;
    content: string;
    platforms: string[];
    mediaUrls?: string[];
    hashtags?: string[];
  }>>().notNull(),
  schedulePattern: varchar('schedule_pattern', { length: 20 }).notNull(),
  startDate: datetime('start_date').notNull(),
  endDate: datetime('end_date'),
  isActive: boolean('is_active').default(true),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Platform Engagement Metrics
export const platformEngagementMetrics = mysqlTable('platform_engagement_metrics', {
  id: int('id').primaryKey().autoincrement(),
  postId: int('post_id').notNull(),
  platform: varchar('platform', { length: 20 }).notNull(),
  externalPostId: varchar('external_post_id', { length: 255 }).notNull(),
  likes: int('likes').default(0),
  shares: int('shares').default(0),
  comments: int('comments').default(0),
  views: int('views').default(0),
  clicks: int('clicks').default(0),
  impressions: int('impressions').default(0),
  engagementRate: varchar('engagement_rate', { length: 50 }).default('0%'),
  lastUpdated: datetime('last_updated').default(sql`CURRENT_TIMESTAMP`),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Analytics Summary (daily/weekly/monthly)
export const analyticsSummary = mysqlTable('analytics_summary', {
  id: int('id').primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  platform: varchar('platform', { length: 20 }).notNull(),
  period: varchar('period', { length: 20 }).notNull(),
  periodDate: datetime('period_date').notNull(),
  totalPosts: int('total_posts').default(0),
  totalLikes: int('total_likes').default(0),
  totalShares: int('total_shares').default(0),
  totalComments: int('total_comments').default(0),
  totalViews: int('total_views').default(0),
  totalImpressions: int('total_impressions').default(0),
  averageEngagementRate: varchar('average_engagement_rate', { length: 50 }).default('0%'),
  topPost: json('top_post').$type<{
    id: number;
    title: string;
    engagement: number;
  }>(),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Relations
export const contentCalendarPostsRelations = relations(contentCalendarPosts, ({ many }) => ({
  metrics: many(platformEngagementMetrics),
}));

export const platformEngagementMetricsRelations = relations(platformEngagementMetrics, ({ one }) => ({
  post: one(contentCalendarPosts, {
    fields: [platformEngagementMetrics.postId],
    references: [contentCalendarPosts.id],
  }),
}));
