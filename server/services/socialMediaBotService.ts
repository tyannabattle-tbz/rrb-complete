/**
 * Social Media Bot Service
 * Handles AI bot automation for social media posting across multiple platforms
 */

import { getDb } from '../db';
import { notificationService } from './notificationService';
import { invokeLLM } from '../_core/llm';

export interface SocialMediaPost {
  id: string;
  bot_id: string;
  platform: 'twitter' | 'facebook' | 'instagram' | 'tiktok';
  content: string;
  scheduled_at?: number;
  posted_at?: number;
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
  engagement_count: number;
  campaign_id?: string;
  created_at: number;
}

export interface SocialMediaBot {
  id: string;
  name: string;
  type: 'engagement' | 'support' | 'promotion' | 'moderation';
  platforms: ('twitter' | 'facebook' | 'instagram' | 'tiktok')[];
  status: 'active' | 'inactive';
  enabled: boolean;
  posting_frequency: 'hourly' | 'daily' | 'weekly';
  description: string;
  created_at: number;
}

export class SocialMediaBotService {
  /**
   * Create a new social media bot
   */
  async createBot(
    name: string,
    type: 'engagement' | 'support' | 'promotion' | 'moderation',
    platforms: ('twitter' | 'facebook' | 'instagram' | 'tiktok')[],
    postingFrequency: 'hourly' | 'daily' | 'weekly' = 'daily'
  ): Promise<SocialMediaBot> {
    try {
      const db = await getDb();
      const bot: SocialMediaBot = {
        id: `bot-${type}-${Date.now()}`,
        name,
        type,
        platforms,
        status: 'active',
        enabled: true,
        posting_frequency: postingFrequency,
        description: `${type} bot for ${platforms.join(', ')}`,
        created_at: Date.now(),
      };

      await db.run(
        `INSERT INTO social_media_bots (id, name, type, platforms, status, enabled, posting_frequency, description, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bot.id,
          bot.name,
          bot.type,
          JSON.stringify(bot.platforms),
          bot.status,
          bot.enabled ? 1 : 0,
          bot.posting_frequency,
          bot.description,
          bot.created_at,
        ]
      );

      return bot;
    } catch (error) {
      console.error('Failed to create bot:', error);
      throw error;
    }
  }

  /**
   * Generate AI-powered social media content
   */
  async generateContent(
    botType: string,
    topic: string,
    platform: string,
    tone: string = 'engaging'
  ): Promise<string> {
    try {
      const prompt = `Generate a ${tone} ${platform} post for a ${botType} bot about: ${topic}. Keep it under 280 characters for Twitter, 150 for Instagram. Include relevant emojis.`;

      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `You are a ${botType} bot that creates engaging social media content. Generate authentic, helpful, and engaging posts.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.choices[0]?.message?.content || '';
      return content.trim();
    } catch (error) {
      console.error('Failed to generate content:', error);
      throw error;
    }
  }

  /**
   * Schedule a social media post
   */
  async schedulePost(
    botId: string,
    platform: 'twitter' | 'facebook' | 'instagram' | 'tiktok',
    content: string,
    scheduledAt: number,
    campaignId?: string
  ): Promise<SocialMediaPost> {
    try {
      const db = await getDb();
      const post: SocialMediaPost = {
        id: `post-${Date.now()}`,
        bot_id: botId,
        platform,
        content,
        scheduled_at: scheduledAt,
        status: 'scheduled',
        engagement_count: 0,
        campaign_id: campaignId,
        created_at: Date.now(),
      };

      await db.run(
        `INSERT INTO social_media_posts (id, bot_id, platform, content, scheduled_at, status, engagement_count, campaign_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          post.id,
          post.bot_id,
          post.platform,
          post.content,
          post.scheduled_at,
          post.status,
          post.engagement_count,
          post.campaign_id,
          post.created_at,
        ]
      );

      return post;
    } catch (error) {
      console.error('Failed to schedule post:', error);
      throw error;
    }
  }

  /**
   * Post content to social media
   */
  async postToSocialMedia(
    postId: string,
    botId: string,
    userId: string
  ): Promise<SocialMediaPost> {
    try {
      const db = await getDb();
      const post = await db.get(
        'SELECT * FROM social_media_posts WHERE id = ?',
        [postId]
      );

      if (!post) {
        throw new Error('Post not found');
      }

      const postedPost: SocialMediaPost = {
        id: post.id,
        bot_id: post.bot_id,
        platform: post.platform,
        content: post.content,
        posted_at: Date.now(),
        status: 'posted',
        engagement_count: 0,
        campaign_id: post.campaign_id,
        created_at: post.created_at,
      };

      await db.run(
        'UPDATE social_media_posts SET status = ?, posted_at = ? WHERE id = ?',
        ['posted', Date.now(), postId]
      );

      await notificationService.notifySocialPost(userId, post.platform, 0);

      return postedPost;
    } catch (error) {
      console.error('Failed to post to social media:', error);
      throw error;
    }
  }

  /**
   * Update post engagement metrics
   */
  async updateEngagement(postId: string, engagementCount: number): Promise<void> {
    try {
      const db = await getDb();
      await db.run(
        'UPDATE social_media_posts SET engagement_count = ? WHERE id = ?',
        [engagementCount, postId]
      );
    } catch (error) {
      console.error('Failed to update engagement:', error);
    }
  }

  /**
   * Get bot posting history
   */
  async getBotPostHistory(botId: string, limit: number = 50): Promise<SocialMediaPost[]> {
    try {
      const db = await getDb();
      const posts = await db.all(
        'SELECT * FROM social_media_posts WHERE bot_id = ? ORDER BY created_at DESC LIMIT ?',
        [botId, limit]
      );

      return posts.map(p => ({
        id: p.id,
        bot_id: p.bot_id,
        platform: p.platform,
        content: p.content,
        scheduled_at: p.scheduled_at,
        posted_at: p.posted_at,
        status: p.status,
        engagement_count: p.engagement_count,
        campaign_id: p.campaign_id,
        created_at: p.created_at,
      }));
    } catch (error) {
      console.error('Failed to get post history:', error);
      return [];
    }
  }

  /**
   * Get platform-specific stats
   */
  async getPlatformStats(platform: string) {
    try {
      const db = await getDb();
      const stats = await db.get(
        `SELECT 
          COUNT(*) as total_posts,
          SUM(engagement_count) as total_engagement,
          AVG(engagement_count) as avg_engagement,
          COUNT(CASE WHEN status = 'posted' THEN 1 END) as posted_count
         FROM social_media_posts 
         WHERE platform = ?`,
        [platform]
      );

      return {
        platform,
        total_posts: stats.total_posts || 0,
        total_engagement: stats.total_engagement || 0,
        avg_engagement: stats.avg_engagement || 0,
        posted_count: stats.posted_count || 0,
      };
    } catch (error) {
      console.error('Failed to get platform stats:', error);
      return {
        platform,
        total_posts: 0,
        total_engagement: 0,
        avg_engagement: 0,
        posted_count: 0,
      };
    }
  }

  /**
   * Enable/disable bot
   */
  async toggleBot(botId: string, enabled: boolean): Promise<void> {
    try {
      const db = await getDb();
      await db.run(
        'UPDATE social_media_bots SET enabled = ? WHERE id = ?',
        [enabled ? 1 : 0, botId]
      );
    } catch (error) {
      console.error('Failed to toggle bot:', error);
    }
  }

  /**
   * Get all active bots
   */
  async getActiveBots(): Promise<SocialMediaBot[]> {
    try {
      const db = await getDb();
      const bots = await db.all(
        'SELECT * FROM social_media_bots WHERE enabled = 1 AND status = ? ORDER BY created_at DESC',
        ['active']
      );

      return bots.map(b => ({
        id: b.id,
        name: b.name,
        type: b.type,
        platforms: JSON.parse(b.platforms),
        status: b.status,
        enabled: b.enabled === 1,
        posting_frequency: b.posting_frequency,
        description: b.description,
        created_at: b.created_at,
      }));
    } catch (error) {
      console.error('Failed to get active bots:', error);
      return [];
    }
  }
}

export const socialMediaBotService = new SocialMediaBotService();
