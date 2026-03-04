/**
 * Social Media API Integration Module
 * Handles actual API connections to Twitter, Facebook, Instagram, TikTok
 */

import axios, { AxiosInstance } from 'axios';
import { getDb } from '../db';

export interface APICredentials {
  platform: 'twitter' | 'facebook' | 'instagram' | 'tiktok';
  access_token: string;
  refresh_token?: string;
  app_id?: string;
  app_secret?: string;
}

export interface PostResult {
  platform: string;
  post_id: string;
  url: string;
  created_at: number;
}

export class SocialMediaAPIIntegration {
  private twitterClient?: AxiosInstance;
  private facebookClient?: AxiosInstance;
  private instagramClient?: AxiosInstance;
  private tiktokClient?: AxiosInstance;

  /**
   * Initialize Twitter API client
   */
  async initializeTwitter(accessToken: string): Promise<void> {
    try {
      this.twitterClient = axios.create({
        baseURL: 'https://api.twitter.com/2',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      // Verify connection
      await this.twitterClient.get('/users/me');
      console.log('[Twitter] ✓ API client initialized');
    } catch (error) {
      console.error('[Twitter] Failed to initialize API client:', error);
      throw error;
    }
  }

  /**
   * Initialize Facebook API client
   */
  async initializeFacebook(accessToken: string): Promise<void> {
    try {
      this.facebookClient = axios.create({
        baseURL: 'https://graph.facebook.com/v18.0',
        params: {
          access_token: accessToken,
        },
      });

      // Verify connection
      await this.facebookClient.get('/me');
      console.log('[Facebook] ✓ API client initialized');
    } catch (error) {
      console.error('[Facebook] Failed to initialize API client:', error);
      throw error;
    }
  }

  /**
   * Initialize Instagram API client
   */
  async initializeInstagram(accessToken: string): Promise<void> {
    try {
      this.instagramClient = axios.create({
        baseURL: 'https://graph.instagram.com/v18.0',
        params: {
          access_token: accessToken,
        },
      });

      // Verify connection
      await this.instagramClient.get('/me');
      console.log('[Instagram] ✓ API client initialized');
    } catch (error) {
      console.error('[Instagram] Failed to initialize API client:', error);
      throw error;
    }
  }

  /**
   * Initialize TikTok API client
   */
  async initializeTikTok(accessToken: string): Promise<void> {
    try {
      this.tiktokClient = axios.create({
        baseURL: 'https://open.tiktokapis.com/v1',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      // Verify connection
      await this.tiktokClient.get('/user/info/');
      console.log('[TikTok] ✓ API client initialized');
    } catch (error) {
      console.error('[TikTok] Failed to initialize API client:', error);
      throw error;
    }
  }

  /**
   * Post to Twitter
   */
  async postToTwitter(content: string, mediaUrls?: string[]): Promise<PostResult> {
    try {
      if (!this.twitterClient) {
        throw new Error('Twitter client not initialized');
      }

      const payload: any = {
        text: content,
      };

      // Add media if provided
      if (mediaUrls && mediaUrls.length > 0) {
        const mediaIds = await Promise.all(
          mediaUrls.map(url => this.uploadTwitterMedia(url))
        );
        payload.media = { media_ids: mediaIds };
      }

      const response = await this.twitterClient.post('/tweets', payload);

      return {
        platform: 'twitter',
        post_id: response.data.data.id,
        url: `https://twitter.com/i/web/status/${response.data.data.id}`,
        created_at: Date.now(),
      };
    } catch (error) {
      console.error('[Twitter] Failed to post:', error);
      throw error;
    }
  }

  /**
   * Upload media to Twitter
   */
  private async uploadTwitterMedia(mediaUrl: string): Promise<string> {
    try {
      if (!this.twitterClient) {
        throw new Error('Twitter client not initialized');
      }

      // Download media from URL
      const mediaResponse = await axios.get(mediaUrl, {
        responseType: 'arraybuffer',
      });

      const mediaData = Buffer.from(mediaResponse.data).toString('base64');

      // Upload to Twitter
      const uploadResponse = await this.twitterClient.post('/tweets/search/stream', {
        media_data: mediaData,
      });

      return uploadResponse.data.media.media_id_string;
    } catch (error) {
      console.error('[Twitter] Failed to upload media:', error);
      throw error;
    }
  }

  /**
   * Post to Facebook
   */
  async postToFacebook(pageId: string, content: string, mediaUrl?: string): Promise<PostResult> {
    try {
      if (!this.facebookClient) {
        throw new Error('Facebook client not initialized');
      }

      const payload: any = {
        message: content,
      };

      if (mediaUrl) {
        payload.picture = mediaUrl;
      }

      const response = await this.facebookClient.post(`/${pageId}/feed`, payload);

      return {
        platform: 'facebook',
        post_id: response.data.id,
        url: `https://facebook.com/${response.data.id}`,
        created_at: Date.now(),
      };
    } catch (error) {
      console.error('[Facebook] Failed to post:', error);
      throw error;
    }
  }

  /**
   * Post to Instagram
   */
  async postToInstagram(businessAccountId: string, content: string, mediaUrl: string): Promise<PostResult> {
    try {
      if (!this.instagramClient) {
        throw new Error('Instagram client not initialized');
      }

      // Create media container
      const containerResponse = await this.instagramClient.post(
        `/${businessAccountId}/media`,
        {
          image_url: mediaUrl,
          caption: content,
        }
      );

      const containerId = containerResponse.data.id;

      // Publish media
      const publishResponse = await this.instagramClient.post(
        `/${businessAccountId}/media_publish`,
        {
          creation_id: containerId,
        }
      );

      return {
        platform: 'instagram',
        post_id: publishResponse.data.id,
        url: `https://instagram.com/p/${publishResponse.data.id}`,
        created_at: Date.now(),
      };
    } catch (error) {
      console.error('[Instagram] Failed to post:', error);
      throw error;
    }
  }

  /**
   * Post to TikTok
   */
  async postToTikTok(videoUrl: string, caption: string): Promise<PostResult> {
    try {
      if (!this.tiktokClient) {
        throw new Error('TikTok client not initialized');
      }

      // Create video post
      const response = await this.tiktokClient.post('/video/publish/', {
        video_url: videoUrl,
        caption: caption,
        privacy_level: 'PUBLIC',
      });

      return {
        platform: 'tiktok',
        post_id: response.data.data.video_id,
        url: `https://tiktok.com/@rockinrockinboogie/video/${response.data.data.video_id}`,
        created_at: Date.now(),
      };
    } catch (error) {
      console.error('[TikTok] Failed to post:', error);
      throw error;
    }
  }

  /**
   * Get engagement metrics
   */
  async getEngagementMetrics(platform: string, postId: string): Promise<any> {
    try {
      switch (platform) {
        case 'twitter':
          if (!this.twitterClient) throw new Error('Twitter client not initialized');
          const tweetResponse = await this.twitterClient.get(`/tweets/${postId}`, {
            params: {
              'tweet.fields': 'public_metrics',
            },
          });
          return {
            likes: tweetResponse.data.data.public_metrics.like_count,
            retweets: tweetResponse.data.data.public_metrics.retweet_count,
            replies: tweetResponse.data.data.public_metrics.reply_count,
          };

        case 'facebook':
          if (!this.facebookClient) throw new Error('Facebook client not initialized');
          const fbResponse = await this.facebookClient.get(`/${postId}/insights`, {
            params: {
              metric: 'engagement,impressions,reach',
            },
          });
          return fbResponse.data.data;

        case 'instagram':
          if (!this.instagramClient) throw new Error('Instagram client not initialized');
          const igResponse = await this.instagramClient.get(`/${postId}/insights`, {
            params: {
              metric: 'engagement,impressions,reach',
            },
          });
          return igResponse.data.data;

        case 'tiktok':
          if (!this.tiktokClient) throw new Error('TikTok client not initialized');
          const ttResponse = await this.tiktokClient.get(`/video/${postId}/analytics/`);
          return {
            views: ttResponse.data.data.video_views,
            likes: ttResponse.data.data.video_likes,
            shares: ttResponse.data.data.video_shares,
            comments: ttResponse.data.data.video_comments,
          };

        default:
          throw new Error(`Unknown platform: ${platform}`);
      }
    } catch (error) {
      console.error(`[${platform}] Failed to get metrics:`, error);
      throw error;
    }
  }

  /**
   * Initialize all API clients from database credentials
   */
  async initializeAllClients(): Promise<{ initialized: number; failed: number }> {
    try {
      const db = await getDb();
      const credentials = await db.all(
        'SELECT * FROM social_media_credentials WHERE is_active = 1'
      );

      let initialized = 0;
      let failed = 0;

      for (const cred of credentials) {
        try {
          switch (cred.platform) {
            case 'twitter':
              await this.initializeTwitter(cred.access_token);
              initialized++;
              break;
            case 'facebook':
              await this.initializeFacebook(cred.access_token);
              initialized++;
              break;
            case 'instagram':
              await this.initializeInstagram(cred.access_token);
              initialized++;
              break;
            case 'tiktok':
              await this.initializeTikTok(cred.access_token);
              initialized++;
              break;
          }
        } catch (error) {
          console.error(`[Init] Failed to initialize ${cred.platform}:`, error);
          failed++;
        }
      }

      console.log(`[Init] API clients initialized: ${initialized} success, ${failed} failed`);
      return { initialized, failed };
    } catch (error) {
      console.error('[Init] Failed to initialize API clients:', error);
      return { initialized: 0, failed: 0 };
    }
  }
}

export const socialMediaAPIIntegration = new SocialMediaAPIIntegration();
