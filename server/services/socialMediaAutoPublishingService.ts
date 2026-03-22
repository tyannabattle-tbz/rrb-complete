/**
 * Social Media Auto-Publishing Service
 * Auto-posts episode updates to Twitter, Instagram, TikTok with AI-generated clips
 */

export interface SocialMediaPost {
  postId: string;
  episodeId: string;
  platform: 'twitter' | 'instagram' | 'tiktok' | 'facebook' | 'linkedin';
  content: string;
  mediaUrl?: string;
  caption?: string;
  hashtags: string[];
  scheduledTime?: Date;
  publishedTime?: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  platformPostId?: string;
}

export interface AIGeneratedClip {
  clipId: string;
  episodeId: string;
  duration: number;
  format: 'short' | 'medium' | 'long';
  platforms: ('twitter' | 'instagram' | 'tiktok')[];
  videoUrl?: string;
  thumbnailUrl?: string;
  caption: string;
  hashtags: string[];
  status: 'generating' | 'ready' | 'published';
}

export interface SocialMediaSchedule {
  scheduleId: string;
  episodeId: string;
  platforms: ('twitter' | 'instagram' | 'tiktok' | 'facebook' | 'linkedin')[];
  postTime: Date;
  autoGenerateClips: boolean;
  includeAIInsights: boolean;
  status: 'active' | 'paused' | 'completed';
}

class SocialMediaAutoPublishingService {
  private posts: Map<string, SocialMediaPost> = new Map();
  private clips: Map<string, AIGeneratedClip> = new Map();
  private schedules: Map<string, SocialMediaSchedule> = new Map();

  /**
   * Create social media post
   */
  createPost(
    episodeId: string,
    platform: 'twitter' | 'instagram' | 'tiktok' | 'facebook' | 'linkedin',
    content: string,
    hashtags: string[],
    mediaUrl?: string,
    caption?: string
  ): SocialMediaPost {
    const postId = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const post: SocialMediaPost = {
      postId,
      episodeId,
      platform,
      content,
      mediaUrl,
      caption,
      hashtags,
      status: 'draft',
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0
      }
    };

    this.posts.set(postId, post);
    console.log(`[Social Media] Post created for ${platform}: ${content.substring(0, 50)}...`);
    return post;
  }

  /**
   * Schedule post for publishing
   */
  schedulePost(postId: string, scheduledTime: Date): SocialMediaPost | null {
    const post = this.posts.get(postId);
    if (post) {
      post.scheduledTime = scheduledTime;
      post.status = 'scheduled';
      console.log(`[Social Media] Post scheduled for ${scheduledTime.toISOString()}`);
      return post;
    }
    return null;
  }

  /**
   * Publish post immediately
   */
  publishPost(postId: string): SocialMediaPost | null {
    const post = this.posts.get(postId);
    if (post) {
      post.publishedTime = new Date();
      post.status = 'published';
      post.platformPostId = `${post.platform}_${Date.now()}`;
      console.log(`[Social Media] Post published to ${post.platform}: ${post.platformPostId}`);
      return post;
    }
    return null;
  }

  /**
   * Generate AI clip for episode
   */
  generateAIClip(
    episodeId: string,
    duration: number,
    format: 'short' | 'medium' | 'long',
    platforms: ('twitter' | 'instagram' | 'tiktok')[],
    caption: string,
    hashtags: string[]
  ): AIGeneratedClip {
    const clipId = `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const clip: AIGeneratedClip = {
      clipId,
      episodeId,
      duration,
      format,
      platforms,
      caption,
      hashtags,
      status: 'generating',
      videoUrl: `https://clips.example.com/${clipId}.mp4`,
      thumbnailUrl: `https://clips.example.com/${clipId}-thumb.jpg`
    };

    this.clips.set(clipId, clip);
    console.log(`[Social Media] AI clip generation started: ${clipId} (${duration}s ${format})`);

    // Simulate clip generation completion
    setTimeout(() => {
      clip.status = 'ready';
      console.log(`[Social Media] AI clip ready: ${clipId}`);
    }, 5000);

    return clip;
  }

  /**
   * Auto-publish episode to all platforms
   */
  autoPublishEpisode(
    episodeId: string,
    title: string,
    description: string,
    platforms: ('twitter' | 'instagram' | 'tiktok' | 'facebook' | 'linkedin')[],
    autoGenerateClips: boolean = true
  ): {
    posts: SocialMediaPost[];
    clips: AIGeneratedClip[];
  } {
    const posts: SocialMediaPost[] = [];
    const clips: AIGeneratedClip[] = [];

    // Create platform-specific posts
    platforms.forEach((platform) => {
      const content = this.generatePlatformContent(platform, title, description);
      const hashtags = this.generateHashtags(title);

      const post = this.createPost(episodeId, platform, content, hashtags);
      this.publishPost(post.postId);
      posts.push(post);
    });

    // Generate AI clips for video platforms
    if (autoGenerateClips) {
      const videoPlatforms = platforms.filter((p) => ['tiktok', 'instagram'].includes(p));
      if (videoPlatforms.length > 0) {
        const clip = this.generateAIClip(
          episodeId,
          60,
          'short',
          videoPlatforms as ('twitter' | 'instagram' | 'tiktok')[],
          description,
          this.generateHashtags(title)
        );
        clips.push(clip);
      }
    }

    console.log(
      `[Social Media] Episode auto-published to ${platforms.length} platforms with ${clips.length} clips`
    );

    return { posts, clips };
  }

  /**
   * Generate platform-specific content
   */
  private generatePlatformContent(
    platform: string,
    title: string,
    description: string
  ): string {
    switch (platform) {
      case 'twitter':
        return `🎙️ New Episode: ${title}\n\n${description.substring(0, 100)}...\n\nListen now!`;
      case 'instagram':
        return `✨ New Episode Alert! ✨\n\n${title}\n\n${description.substring(0, 150)}...`;
      case 'tiktok':
        return `🎵 Check out our latest episode!\n\n${title}\n\n${description.substring(0, 100)}...`;
      case 'facebook':
        return `📻 New Episode: ${title}\n\n${description}`;
      case 'linkedin':
        return `🎙️ Industry Insights: ${title}\n\n${description.substring(0, 200)}...`;
      default:
        return `New Episode: ${title}\n\n${description}`;
    }
  }

  /**
   * Generate hashtags
   */
  private generateHashtags(title: string): string[] {
    const baseHashtags = ['#podcast', '#newepisode', '#rockinrockinboogie', '#qumus'];
    const titleHashtags = title
      .split(' ')
      .slice(0, 3)
      .map((word) => `#${word.toLowerCase().replace(/[^a-z0-9]/g, '')}`);

    return [...baseHashtags, ...titleHashtags];
  }

  /**
   * Get post analytics
   */
  getPostAnalytics(postId: string): SocialMediaPost | undefined {
    return this.posts.get(postId);
  }

  /**
   * Update engagement metrics
   */
  updateEngagementMetrics(
    postId: string,
    likes: number,
    comments: number,
    shares: number,
    views: number
  ): void {
    const post = this.posts.get(postId);
    if (post) {
      post.engagement = { likes, comments, shares, views };
    }
  }

  /**
   * Get all posts for episode
   */
  getEpisodePosts(episodeId: string): SocialMediaPost[] {
    return Array.from(this.posts.values()).filter((p) => p.episodeId === episodeId);
  }

  /**
   * Get all clips for episode
   */
  getEpisodeClips(episodeId: string): AIGeneratedClip[] {
    return Array.from(this.clips.values()).filter((c) => c.episodeId === episodeId);
  }

  /**
   * Create publishing schedule
   */
  createSchedule(
    episodeId: string,
    platforms: ('twitter' | 'instagram' | 'tiktok' | 'facebook' | 'linkedin')[],
    postTime: Date,
    autoGenerateClips: boolean = true,
    includeAIInsights: boolean = true
  ): SocialMediaSchedule {
    const scheduleId = `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const schedule: SocialMediaSchedule = {
      scheduleId,
      episodeId,
      platforms,
      postTime,
      autoGenerateClips,
      includeAIInsights,
      status: 'active'
    };

    this.schedules.set(scheduleId, schedule);
    console.log(`[Social Media] Publishing schedule created: ${scheduleId}`);
    return schedule;
  }

  /**
   * Get all schedules
   */
  getAllSchedules(): SocialMediaSchedule[] {
    return Array.from(this.schedules.values());
  }

  /**
   * Get social media dashboard
   */
  getSocialMediaDashboard(): {
    totalPosts: number;
    totalClips: number;
    activeSchedules: number;
    topPosts: SocialMediaPost[];
    totalEngagement: number;
  } {
    const allPosts = Array.from(this.posts.values());
    const totalEngagement = allPosts.reduce(
      (sum, p) => sum + p.engagement.likes + p.engagement.comments + p.engagement.shares,
      0
    );

    const topPosts = allPosts
      .sort(
        (a, b) =>
          b.engagement.likes +
          b.engagement.comments +
          b.engagement.shares -
          (a.engagement.likes + a.engagement.comments + a.engagement.shares)
      )
      .slice(0, 5);

    const activeSchedules = Array.from(this.schedules.values()).filter(
      (s) => s.status === 'active'
    ).length;

    return {
      totalPosts: allPosts.length,
      totalClips: this.clips.size,
      activeSchedules,
      topPosts,
      totalEngagement
    };
  }
}

export const socialMediaAutoPublishingService = new SocialMediaAutoPublishingService();
