/**
 * Social Media API Connectors
 * Handles posting to Twitter, Facebook, Instagram, and TikTok
 */

import axios from 'axios';
import { getDb } from '../db';
import { notificationService } from './notificationService';

export interface SocialMediaCredentials {
  platform: 'twitter' | 'facebook' | 'instagram' | 'tiktok';
  accessToken: string;
  accessTokenSecret?: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface PostResult {
  platform: string;
  postId: string;
  url: string;
  success: boolean;
  error?: string;
}

export class SocialMediaConnectors {
  /**
   * Post to Twitter
   */
  async postToTwitter(content: string, credentials: SocialMediaCredentials): Promise<PostResult> {
    try {
      const response = await axios.post(
        'https://api.twitter.com/2/tweets',
        { text: content },
        {
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const postId = response.data.data.id;
      return {
        platform: 'twitter',
        postId,
        url: `https://twitter.com/i/web/status/${postId}`,
        success: true,
      };
    } catch (error: any) {
      console.error('[Twitter] Post failed:', error.message);
      return {
        platform: 'twitter',
        postId: '',
        url: '',
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Post to Facebook
   */
  async postToFacebook(content: string, credentials: SocialMediaCredentials): Promise<PostResult> {
    try {
      const pageId = process.env.FACEBOOK_PAGE_ID || '';
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${pageId}/feed`,
        {
          message: content,
          access_token: credentials.accessToken,
        }
      );

      const postId = response.data.id;
      return {
        platform: 'facebook',
        postId,
        url: `https://facebook.com/${pageId}/posts/${postId}`,
        success: true,
      };
    } catch (error: any) {
      console.error('[Facebook] Post failed:', error.message);
      return {
        platform: 'facebook',
        postId: '',
        url: '',
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Post to Instagram
   */
  async postToInstagram(
    content: string,
    imageUrl?: string,
    credentials?: SocialMediaCredentials
  ): Promise<PostResult> {
    try {
      const igUserId = process.env.INSTAGRAM_USER_ID || '';
      const accessToken = credentials?.accessToken || process.env.INSTAGRAM_ACCESS_TOKEN || '';

      const payload: any = {
        caption: content,
        access_token: accessToken,
      };

      if (imageUrl) {
        payload.image_url = imageUrl;
      }

      const response = await axios.post(
        `https://graph.instagram.com/v18.0/${igUserId}/media`,
        payload
      );

      const mediaId = response.data.id;

      // Publish the media
      const publishResponse = await axios.post(
        `https://graph.instagram.com/v18.0/${igUserId}/media_publish`,
        {
          creation_id: mediaId,
          access_token: accessToken,
        }
      );

      const postId = publishResponse.data.id;
      return {
        platform: 'instagram',
        postId,
        url: `https://instagram.com/p/${postId}`,
        success: true,
      };
    } catch (error: any) {
      console.error('[Instagram] Post failed:', error.message);
      return {
        platform: 'instagram',
        postId: '',
        url: '',
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Post to TikTok
   */
  async postToTikTok(
    content: string,
    videoUrl?: string,
    credentials?: SocialMediaCredentials
  ): Promise<PostResult> {
    try {
      const accessToken = credentials?.accessToken || process.env.TIKTOK_ACCESS_TOKEN || '';

      // TikTok requires video content
      if (!videoUrl) {
        return {
          platform: 'tiktok',
          postId: '',
          url: '',
          success: false,
          error: 'TikTok posts require video content',
        };
      }

      const response = await axios.post(
        'https://open.tiktokapis.com/v1/post/publish/action/upload/',
        {
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: 0, // Will be calculated by TikTok
          },
          post_info: {
            title: content,
            privacy_level: 'PUBLIC_TO_EVERYONE',
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const postId = response.data.data.publish_id;
      return {
        platform: 'tiktok',
        postId,
        url: `https://tiktok.com/@rockinrockinboogie/video/${postId}`,
        success: true,
      };
    } catch (error: any) {
      console.error('[TikTok] Post failed:', error.message);
      return {
        platform: 'tiktok',
        postId: '',
        url: '',
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Post to multiple platforms simultaneously
   */
  async postToMultiplePlatforms(
    content: string,
    platforms: ('twitter' | 'facebook' | 'instagram' | 'tiktok')[],
    userId: string,
    mediaUrl?: string
  ): Promise<PostResult[]> {
    try {
      const db = await getDb();
      const results: PostResult[] = [];

      for (const platform of platforms) {
        let result: PostResult;

        // Get platform credentials from database
        const credentials = await db.get(
          'SELECT * FROM social_media_credentials WHERE platform = ? AND user_id = ?',
          [platform, userId]
        );

        if (!credentials) {
          result = {
            platform,
            postId: '',
            url: '',
            success: false,
            error: 'No credentials configured for this platform',
          };
        } else {
          switch (platform) {
            case 'twitter':
              result = await this.postToTwitter(content, credentials);
              break;
            case 'facebook':
              result = await this.postToFacebook(content, credentials);
              break;
            case 'instagram':
              result = await this.postToInstagram(content, mediaUrl, credentials);
              break;
            case 'tiktok':
              result = await this.postToTikTok(content, mediaUrl, credentials);
              break;
            default:
              result = {
                platform,
                postId: '',
                url: '',
                success: false,
                error: 'Unknown platform',
              };
          }
        }

        results.push(result);

        // Log the post
        await db.run(
          `INSERT INTO social_media_posts (id, bot_id, platform, content, status, engagement_count, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            `post-${Date.now()}-${platform}`,
            'bot-auto',
            platform,
            content,
            result.success ? 'posted' : 'failed',
            0,
            Date.now(),
          ]
        );

        // Send notification
        if (result.success) {
          await notificationService.notifySocialPost(userId, platform, 0);
        } else {
          await notificationService.sendNotification(userId, {
            type: 'system_alert',
            title: `❌ ${platform} Post Failed`,
            message: result.error || 'Failed to post to ' + platform,
            severity: 'warning',
            data: { platform, error: result.error },
          });
        }
      }

      return results;
    } catch (error) {
      console.error('[SocialMediaConnectors] Error posting to multiple platforms:', error);
      throw error;
    }
  }

  /**
   * Get platform engagement metrics
   */
  async getPlatformMetrics(
    platform: string,
    postId: string,
    credentials: SocialMediaCredentials
  ): Promise<any> {
    try {
      switch (platform) {
        case 'twitter':
          return await this.getTwitterMetrics(postId, credentials);
        case 'facebook':
          return await this.getFacebookMetrics(postId, credentials);
        case 'instagram':
          return await this.getInstagramMetrics(postId, credentials);
        case 'tiktok':
          return await this.getTikTokMetrics(postId, credentials);
        default:
          return null;
      }
    } catch (error) {
      console.error(`[SocialMediaConnectors] Error getting ${platform} metrics:`, error);
      return null;
    }
  }

  /**
   * Get Twitter metrics
   */
  private async getTwitterMetrics(postId: string, credentials: SocialMediaCredentials): Promise<any> {
    try {
      const response = await axios.get(
        `https://api.twitter.com/2/tweets/${postId}?tweet.fields=public_metrics`,
        {
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
          },
        }
      );

      return response.data.data.public_metrics;
    } catch (error) {
      console.error('[Twitter] Metrics fetch failed:', error);
      return null;
    }
  }

  /**
   * Get Facebook metrics
   */
  private async getFacebookMetrics(postId: string, credentials: SocialMediaCredentials): Promise<any> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${postId}?fields=likes.summary(true).limit(0),comments.summary(true).limit(0),shares&access_token=${credentials.accessToken}`
      );

      return {
        likes: response.data.likes?.summary?.total_count || 0,
        comments: response.data.comments?.summary?.total_count || 0,
        shares: response.data.shares?.data?.length || 0,
      };
    } catch (error) {
      console.error('[Facebook] Metrics fetch failed:', error);
      return null;
    }
  }

  /**
   * Get Instagram metrics
   */
  private async getInstagramMetrics(postId: string, credentials: SocialMediaCredentials): Promise<any> {
    try {
      const response = await axios.get(
        `https://graph.instagram.com/v18.0/${postId}?fields=like_count,comments_count,caption&access_token=${credentials.accessToken}`
      );

      return {
        likes: response.data.like_count || 0,
        comments: response.data.comments_count || 0,
      };
    } catch (error) {
      console.error('[Instagram] Metrics fetch failed:', error);
      return null;
    }
  }

  /**
   * Get TikTok metrics
   */
  private async getTikTokMetrics(postId: string, credentials: SocialMediaCredentials): Promise<any> {
    try {
      const response = await axios.get(
        `https://open.tiktokapis.com/v1/video/query/?filters={"video_ids":["${postId}"]}`,
        {
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
          },
        }
      );

      const video = response.data.data.videos[0];
      return {
        likes: video.like_count || 0,
        comments: video.comment_count || 0,
        shares: video.share_count || 0,
        views: video.view_count || 0,
      };
    } catch (error) {
      console.error('[TikTok] Metrics fetch failed:', error);
      return null;
    }
  }

  /**
   * Store platform credentials
   */
  async storeCredentials(
    userId: string,
    platform: string,
    credentials: SocialMediaCredentials
  ): Promise<void> {
    try {
      const db = await getDb();
      await db.run(
        `INSERT OR REPLACE INTO social_media_credentials 
         (user_id, platform, access_token, access_token_secret, refresh_token, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          platform,
          credentials.accessToken,
          credentials.accessTokenSecret || null,
          credentials.refreshToken || null,
          credentials.expiresAt || null,
        ]
      );

      console.log(`[SocialMediaConnectors] Stored credentials for ${platform}`);
    } catch (error) {
      console.error('[SocialMediaConnectors] Error storing credentials:', error);
      throw error;
    }
  }
}

export const socialMediaConnectors = new SocialMediaConnectors();
