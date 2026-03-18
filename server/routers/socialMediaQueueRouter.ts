import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import mysql from 'mysql2/promise';

async function rawQuery(sql: string, params: any[] = []) {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  try {
    const [rows] = await connection.execute(sql, params);
    return rows;
  } finally {
    await connection.end();
  }
}

export const socialMediaQueueRouter = router({
  /**
   * List all social media posts with optional filtering
   */
  listPosts: protectedProcedure
    .input(z.object({
      status: z.enum(['draft', 'scheduled', 'published', 'failed', 'cancelled']).optional(),
      platform: z.enum(['twitter', 'instagram', 'discord', 'facebook', 'tiktok', 'youtube']).optional(),
    }).optional())
    .query(async ({ input }) => {
      let query = 'SELECT * FROM social_media_posts';
      const conditions: string[] = [];
      const params: any[] = [];

      if (input?.status) {
        conditions.push('status = ?');
        params.push(input.status);
      }
      if (input?.platform) {
        conditions.push('platform = ?');
        params.push(input.platform);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ' ORDER BY created_at DESC';

      return await rawQuery(query, params);
    }),

  /**
   * Retry a single failed post
   */
  retryPost: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      // Get the post
      const posts = await rawQuery('SELECT * FROM social_media_posts WHERE id = ?', [input.id]);
      if (!posts || (posts as any[]).length === 0) {
        throw new Error('Post not found');
      }
      const post = (posts as any[])[0];

      if (post.status !== 'failed') {
        throw new Error('Only failed posts can be retried');
      }

      // Try to post using the social media API integration
      try {
        const { SocialMediaAPIIntegration } = await import('../services/socialMediaAPIIntegration');
        const api = new SocialMediaAPIIntegration();

        if (post.platform === 'twitter') {
          const accessToken = process.env.TWITTER_BEARER_TOKEN || process.env.TWITTER_ACCESS_TOKEN;
          if (!accessToken) {
            throw new Error('Twitter credentials not configured. Update in Settings → Secrets.');
          }
          await api.initializeTwitter(accessToken);
          const result = await api.postToTwitter(post.content);

          // Update status to published
          await rawQuery(
            'UPDATE social_media_posts SET status = ?, published_at = ?, updated_at = ? WHERE id = ?',
            ['published', Date.now(), Date.now(), input.id]
          );

          return { success: true, postId: result.post_id, url: result.url };
        } else {
          // For other platforms, just mark as scheduled for retry
          await rawQuery(
            'UPDATE social_media_posts SET status = ?, updated_at = ? WHERE id = ?',
            ['scheduled', Date.now(), input.id]
          );
          return { success: true, message: `Post re-scheduled for ${post.platform}` };
        }
      } catch (error: any) {
        // Update with latest error
        await rawQuery(
          'UPDATE social_media_posts SET updated_at = ? WHERE id = ?',
          [Date.now(), input.id]
        );
        throw new Error(`Retry failed: ${error.message}`);
      }
    }),

  /**
   * Retry all failed posts
   */
  retryAllFailed: protectedProcedure
    .mutation(async () => {
      const failed = await rawQuery(
        'SELECT id, platform FROM social_media_posts WHERE status = ?',
        ['failed']
      ) as any[];

      let retried = 0;
      let errors = 0;

      for (const post of failed) {
        try {
          // Re-schedule failed posts
          await rawQuery(
            'UPDATE social_media_posts SET status = ?, updated_at = ? WHERE id = ?',
            ['scheduled', Date.now(), post.id]
          );
          retried++;
        } catch {
          errors++;
        }
      }

      return { retried, errors, total: failed.length };
    }),

  /**
   * Delete a post
   */
  deletePost: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await rawQuery('DELETE FROM social_media_posts WHERE id = ?', [input.id]);
      return { success: true };
    }),

  /**
   * Validate social media API credentials
   */
  validateCredentials: protectedProcedure
    .query(async () => {
      const results: Record<string, { valid: boolean; error?: string }> = {};

      // Twitter/X
      const twitterKey = process.env.TWITTER_API_KEY;
      const twitterSecret = process.env.TWITTER_API_SECRET;
      const twitterAccessToken = process.env.TWITTER_ACCESS_TOKEN;
      const twitterAccessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;
      const twitterBearer = process.env.TWITTER_BEARER_TOKEN;

      if (twitterBearer || (twitterKey && twitterSecret && twitterAccessToken && twitterAccessSecret)) {
        try {
          const axios = (await import('axios')).default;
          const token = twitterBearer || twitterAccessToken;
          const res = await axios.get('https://api.twitter.com/2/users/me', {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
          });
          results.twitter = { valid: true };
        } catch (err: any) {
          results.twitter = { valid: false, error: err.response?.status === 401 ? 'Invalid credentials (401)' : err.message };
        }
      } else {
        results.twitter = { valid: false, error: 'No credentials configured' };
      }

      // Facebook
      const fbToken = process.env.FACEBOOK_ACCESS_TOKEN;
      results.facebook = fbToken ? { valid: true } : { valid: false, error: 'Not configured' };

      // Instagram
      const igToken = process.env.INSTAGRAM_ACCESS_TOKEN;
      results.instagram = igToken ? { valid: true } : { valid: false, error: 'Not configured' };

      // YouTube
      const ytKey = process.env.YOUTUBE_API_KEY;
      results.youtube = ytKey ? { valid: true } : { valid: false, error: 'Not configured' };

      return results;
    }),

  /**
   * Get post statistics
   */
  getStats: protectedProcedure
    .query(async () => {
      const stats = await rawQuery(
        `SELECT 
          platform,
          status,
          COUNT(*) as count
        FROM social_media_posts 
        GROUP BY platform, status
        ORDER BY platform, status`
      ) as any[];

      const byPlatform: Record<string, Record<string, number>> = {};
      for (const row of stats) {
        if (!byPlatform[row.platform]) byPlatform[row.platform] = {};
        byPlatform[row.platform][row.status] = row.count;
      }

      return {
        byPlatform,
        total: stats.reduce((sum, r) => sum + r.count, 0),
        failed: stats.filter(r => r.status === 'failed').reduce((sum, r) => sum + r.count, 0),
        published: stats.filter(r => r.status === 'published').reduce((sum, r) => sum + r.count, 0),
      };
    }),
});
