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
   * Retry a single failed post — uses the QUMUS publisher with retry logic
   */
  retryPost: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const posts = await rawQuery('SELECT * FROM social_media_posts WHERE id = ?', [input.id]);
      if (!posts || (posts as any[]).length === 0) {
        throw new Error('Post not found');
      }
      const post = (posts as any[])[0];

      if (post.status !== 'failed') {
        throw new Error('Only failed posts can be retried');
      }

      // Re-schedule for immediate publishing via QUMUS publisher
      await rawQuery(
        'UPDATE social_media_posts SET status = ?, scheduled_at = ?, updated_at = ? WHERE id = ?',
        ['scheduled', Date.now(), Date.now(), input.id]
      );

      // Trigger the publisher immediately
      try {
        const { checkAndPublishScheduledPosts } = await import('../socialMediaPublisher');
        const results = await checkAndPublishScheduledPosts();
        const thisResult = results.find(r => r.postId === input.id);
        
        if (thisResult?.success) {
          return { success: true, message: `${post.platform} post published successfully`, externalId: thisResult.externalId };
        } else if (thisResult) {
          return { success: false, message: `Retry failed: ${thisResult.error}` };
        } else {
          return { success: true, message: 'Post re-scheduled for next publish cycle' };
        }
      } catch (error: any) {
        return { success: false, message: `Retry error: ${error.message}` };
      }
    }),

  /**
   * Retry all failed posts — re-schedules and triggers publisher
   */
  retryAllFailed: protectedProcedure
    .mutation(async () => {
      const failed = await rawQuery(
        'SELECT id, platform FROM social_media_posts WHERE status = ?',
        ['failed']
      ) as any[];

      if (failed.length === 0) {
        return { retried: 0, errors: 0, total: 0, message: 'No failed posts to retry' };
      }

      // Re-schedule all failed posts for immediate publishing
      let rescheduled = 0;
      for (const post of failed) {
        try {
          await rawQuery(
            'UPDATE social_media_posts SET status = ?, scheduled_at = ?, updated_at = ? WHERE id = ?',
            ['scheduled', Date.now(), Date.now(), post.id]
          );
          rescheduled++;
        } catch {
          // Skip individual failures
        }
      }

      // Trigger the publisher
      try {
        const { checkAndPublishScheduledPosts } = await import('../socialMediaPublisher');
        const results = await checkAndPublishScheduledPosts();
        const succeeded = results.filter(r => r.success).length;
        const errors = results.filter(r => !r.success).length;
        
        return {
          retried: succeeded,
          errors,
          total: failed.length,
          message: `${succeeded}/${failed.length} posts published. ${errors > 0 ? `${errors} still failing — check credential status.` : 'All succeeded!'}`,
          details: results.filter(r => !r.success).map(r => ({ platform: r.platform, error: r.error })),
        };
      } catch (error: any) {
        return {
          retried: 0,
          errors: rescheduled,
          total: failed.length,
          message: `Re-scheduled ${rescheduled} posts but publisher error: ${error.message}`,
        };
      }
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
   * Validate social media API credentials — checks all platforms
   */
  validateCredentials: protectedProcedure
    .query(async () => {
      const results: Record<string, { valid: boolean; configured: boolean; error?: string }> = {};

      // Twitter/X — check all 4 OAuth 1.0a keys
      const twitterKey = process.env.TWITTER_API_KEY;
      const twitterSecret = process.env.TWITTER_API_SECRET;
      const twitterAccessToken = process.env.TWITTER_ACCESS_TOKEN;
      const twitterAccessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;
      const twitterBearer = process.env.TWITTER_BEARER_TOKEN;

      const twitterConfigured = !!(twitterKey && twitterSecret && twitterAccessToken && twitterAccessSecret);
      
      if (twitterConfigured || twitterBearer) {
        try {
          // Use OAuth 1.0a to verify (same method as the publisher)
          const crypto = await import('crypto');
          const https = await import('https');
          
          const verifyResult = await new Promise<{ valid: boolean; error?: string }>((resolve) => {
            const url = 'https://api.twitter.com/2/users/me';
            
            // Build OAuth header
            const oauthParams: Record<string, string> = {
              oauth_consumer_key: twitterKey || '',
              oauth_nonce: crypto.randomBytes(16).toString('hex'),
              oauth_signature_method: 'HMAC-SHA1',
              oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
              oauth_token: twitterAccessToken || '',
              oauth_version: '1.0',
            };
            const sortedParams = Object.keys(oauthParams).sort()
              .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(oauthParams[k])}`)
              .join('&');
            const signatureBase = `GET&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
            const signingKey = `${encodeURIComponent(twitterSecret || '')}&${encodeURIComponent(twitterAccessSecret || '')}`;
            const signature = crypto.createHmac('sha1', signingKey).update(signatureBase).digest('base64');
            oauthParams['oauth_signature'] = signature;
            const authHeader = 'OAuth ' + Object.keys(oauthParams).sort()
              .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
              .join(', ');

            const req = https.request(url, {
              method: 'GET',
              headers: { 'Authorization': authHeader },
              timeout: 8000,
            }, (res) => {
              let data = '';
              res.on('data', (chunk: any) => data += chunk);
              res.on('end', () => {
                if (res.statusCode === 200) {
                  resolve({ valid: true });
                } else if (res.statusCode === 401) {
                  resolve({ valid: false, error: 'OAuth tokens expired or invalid (401). Regenerate at developer.twitter.com → Keys & Tokens.' });
                } else if (res.statusCode === 403) {
                  resolve({ valid: false, error: 'App permissions insufficient (403). Enable Read and Write at developer.twitter.com → App Settings.' });
                } else {
                  resolve({ valid: false, error: `Twitter API returned ${res.statusCode}` });
                }
              });
            });
            req.on('timeout', () => { req.destroy(); resolve({ valid: false, error: 'Connection timeout' }); });
            req.on('error', (err: any) => resolve({ valid: false, error: `Network error: ${err.message}` }));
            req.end();
          });

          results.twitter = { configured: true, ...verifyResult };
        } catch (err: any) {
          results.twitter = { configured: true, valid: false, error: err.message };
        }
      } else {
        const missing = [];
        if (!twitterKey) missing.push('TWITTER_API_KEY');
        if (!twitterSecret) missing.push('TWITTER_API_SECRET');
        if (!twitterAccessToken) missing.push('TWITTER_ACCESS_TOKEN');
        if (!twitterAccessSecret) missing.push('TWITTER_ACCESS_TOKEN_SECRET');
        results.twitter = { configured: false, valid: false, error: `Missing: ${missing.join(', ')}` };
      }

      // Discord
      const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
      results.discord = discordWebhook && discordWebhook.includes('discord.com/api/webhooks')
        ? { configured: true, valid: true }
        : { configured: false, valid: false, error: 'No webhook URL configured' };

      // Facebook
      const fbToken = process.env.FACEBOOK_ACCESS_TOKEN;
      results.facebook = fbToken
        ? { configured: true, valid: true }
        : { configured: false, valid: false, error: 'Not configured — requires Meta Business API' };

      // Instagram
      const igToken = process.env.INSTAGRAM_ACCESS_TOKEN;
      results.instagram = igToken
        ? { configured: true, valid: true }
        : { configured: false, valid: false, error: 'Not configured — requires Meta Business API' };

      // YouTube
      const ytKey = process.env.YOUTUBE_API_KEY;
      results.youtube = ytKey
        ? { configured: true, valid: true }
        : { configured: false, valid: false, error: 'Not configured' };

      // TikTok
      results.tiktok = { configured: false, valid: false, error: 'Not configured — requires TikTok Developer API' };

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
        scheduled: stats.filter(r => r.status === 'scheduled').reduce((sum, r) => sum + r.count, 0),
      };
    }),

  /**
   * Get credential status from the publisher cache
   */
  getCredentialStatus: protectedProcedure
    .query(async () => {
      try {
        const { getCredentialStatuses } = await import('../socialMediaPublisher');
        return getCredentialStatuses();
      } catch {
        return {};
      }
    }),
});
