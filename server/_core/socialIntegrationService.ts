export interface SocialConfig {
  platform: string;
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  refreshToken?: string;
  webhookUrl?: string;
  enabled: boolean;
}

export interface SocialPost {
  postId: string;
  platform: string;
  content: string;
  mediaUrls?: string[];
  scheduledTime?: number;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagement: { likes: number; shares: number; comments: number };
}

export interface SocialCampaignConfig {
  campaignId: string;
  platforms: string[];
  content: string;
  hashtags: string[];
  schedule: { startTime: number; endTime: number; frequency: 'daily' | 'weekly' | 'hourly' };
  targetAudience: { interests: string[]; locations: string[]; demographics: string[] };
}

export class SocialIntegrationService {
  private static configs = new Map<string, SocialConfig>();
  private static posts: SocialPost[] = [];
  private static campaigns: SocialCampaignConfig[] = [];

  static configurePlatform(platform: string, config: Omit<SocialConfig, 'platform'>): SocialConfig {
    const fullConfig: SocialConfig = { platform, ...config };
    this.configs.set(platform, fullConfig);
    return fullConfig;
  }

  static getPlatformConfig(platform: string): SocialConfig | null {
    return this.configs.get(platform) || null;
  }

  static getAllConfigs(): SocialConfig[] {
    return Array.from(this.configs.values());
  }

  static createPost(platform: string, content: string, mediaUrls?: string[], scheduledTime?: number): SocialPost {
    const post: SocialPost = {
      postId: `post-${Date.now()}`,
      platform,
      content,
      mediaUrls,
      scheduledTime,
      status: scheduledTime ? 'scheduled' : 'draft',
      engagement: { likes: 0, shares: 0, comments: 0 },
    };
    this.posts.push(post);
    return post;
  }

  static publishPost(postId: string): SocialPost | null {
    const post = this.posts.find(p => p.postId === postId);
    if (post) {
      post.status = 'published';
      post.engagement = { likes: Math.floor(Math.random() * 1000), shares: Math.floor(Math.random() * 100), comments: Math.floor(Math.random() * 500) };
    }
    return post || null;
  }

  static createCampaign(campaignId: string, platforms: string[], content: string, hashtags: string[], schedule: SocialCampaignConfig['schedule'], targetAudience: SocialCampaignConfig['targetAudience']): SocialCampaignConfig {
    const campaign: SocialCampaignConfig = {
      campaignId,
      platforms,
      content,
      hashtags,
      schedule,
      targetAudience,
    };
    this.campaigns.push(campaign);
    return campaign;
  }

  static getPosts(platform?: string): SocialPost[] {
    return platform ? this.posts.filter(p => p.platform === platform) : this.posts;
  }

  static getCampaigns(): SocialCampaignConfig[] {
    return this.campaigns;
  }

  static getEngagementStats(platform?: string) {
    const posts = platform ? this.posts.filter(p => p.platform === platform) : this.posts;
    const totalLikes = posts.reduce((sum, p) => sum + p.engagement.likes, 0);
    const totalShares = posts.reduce((sum, p) => sum + p.engagement.shares, 0);
    const totalComments = posts.reduce((sum, p) => sum + p.engagement.comments, 0);
    const avgEngagement = posts.length > 0 ? (totalLikes + totalShares + totalComments) / posts.length : 0;

    return {
      totalPosts: posts.length,
      totalLikes,
      totalShares,
      totalComments,
      avgEngagement: avgEngagement.toFixed(2),
      platforms: platform ? [platform] : Array.from(this.configs.keys()),
    };
  }

  static getRecommendedHashtags(topic: string): string[] {
    const hashtagMap: Record<string, string[]> = {
      video: ['#VideoCreation', '#ContentCreator', '#VideoMarketing', '#CreatorEconomy', '#VideoProduction'],
      marketing: ['#DigitalMarketing', '#MarketingStrategy', '#SocialMediaMarketing', '#BrandBuilding', '#MarketingTips'],
      business: ['#Entrepreneurship', '#SmallBusiness', '#BusinessGrowth', '#WealthBuilding', '#BusinessTips'],
      ai: ['#AI', '#ArtificialIntelligence', '#MachineLearning', '#Tech', '#Innovation'],
    };
    return hashtagMap[topic.toLowerCase()] || ['#Content', '#Creator', '#Digital'];
  }

  static generateSocialContent(topic: string, platform: string): string {
    const templates: Record<string, string> = {
      twitter: `🚀 Check out our latest innovation in ${topic}! Powered by Canryn Production. #Innovation #${topic}`,
      instagram: `✨ Discover the future of ${topic} with us! 🎬 Follow for daily inspiration. #CreatorEconomy #${topic}`,
      tiktok: `🎥 Watch how we're revolutionizing ${topic}! #FYP #${topic} #CreatorLife`,
      linkedin: `We're excited to share our latest developments in ${topic}. Learn more about our vision for the future.`,
      youtube: `In this video, we explore the latest trends in ${topic} and how Canryn Production is leading the way.`,
      facebook: `Join our community and discover how ${topic} is changing the creator economy. Like and share!`,
    };
    return templates[platform] || `Discover ${topic} with Canryn Production!`;
  }
}
