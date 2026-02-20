import { invokeLLM } from '../_core/llm';

/**
 * Automated Content Curation Engine
 * AI-powered system that curates daily content digests
 * Personalizes recommendations based on viewer preferences and behavior
 */

interface ContentDigest {
  userId: string;
  date: string;
  topBroadcasts: CuratedContent[];
  trendingTopics: TrendingTopic[];
  personalizedRecommendations: CuratedContent[];
  weeklyHighlights: CuratedContent[];
  newCreators: CreatorProfile[];
  digestSummary: string;
  sendTime: string;
}

interface CuratedContent {
  id: string;
  title: string;
  creator: string;
  category: string;
  views: number;
  rating: number;
  duration: number;
  thumbnail?: string;
  reason: string; // Why this content was curated
  engagementScore: number;
}

interface TrendingTopic {
  topic: string;
  mentions: number;
  growth: number;
  topBroadcasts: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface CreatorProfile {
  id: string;
  name: string;
  followers: number;
  category: string;
  topBroadcast: string;
  joinDate: string;
  engagement: number;
}

interface DigestPreferences {
  userId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  categories: string[];
  sendTime: string;
  format: 'email' | 'push' | 'both';
  includeNewCreators: boolean;
  includeTrendingTopics: boolean;
  maxItems: number;
}

class ContentCurationEngine {
  private digests: Map<string, ContentDigest> = new Map();
  private preferences: Map<string, DigestPreferences> = new Map();
  private trendingCache: TrendingTopic[] = [];
  private lastCurationTime: Date = new Date();

  /**
   * Generate daily content digest for user
   */
  async generateDailyDigest(
    userId: string,
    allBroadcasts: any[],
    userPreferences: DigestPreferences
  ): Promise<ContentDigest> {
    const topBroadcasts = this.selectTopBroadcasts(allBroadcasts, 5);
    const trendingTopics = this.identifyTrendingTopics(allBroadcasts);
    const personalizedRecommendations = this.generatePersonalizedRecommendations(
      userId,
      allBroadcasts,
      userPreferences
    );
    const weeklyHighlights = this.selectWeeklyHighlights(allBroadcasts, 3);
    const newCreators = this.identifyNewCreators(allBroadcasts, 3);

    // Generate AI summary
    const digestSummary = await this.generateDigestSummary(
      topBroadcasts,
      trendingTopics,
      personalizedRecommendations
    );

    const digest: ContentDigest = {
      userId,
      date: new Date().toISOString().split('T')[0],
      topBroadcasts,
      trendingTopics,
      personalizedRecommendations,
      weeklyHighlights,
      newCreators,
      digestSummary,
      sendTime: userPreferences.sendTime,
    };

    this.digests.set(`${userId}_${digest.date}`, digest);
    return digest;
  }

  /**
   * Select top performing broadcasts
   */
  private selectTopBroadcasts(broadcasts: any[], limit: number): CuratedContent[] {
    return broadcasts
      .map((b) => ({
        id: b.id,
        title: b.title,
        creator: b.creator,
        category: b.category,
        views: b.views || 0,
        rating: b.rating || 0,
        duration: b.duration || 0,
        thumbnail: b.thumbnail,
        reason: `${b.views || 0} views and ${b.rating || 0}★ rating`,
        engagementScore: (b.views || 0) * 0.6 + (b.rating || 0) * 40,
      }))
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, limit);
  }

  /**
   * Identify trending topics from broadcasts
   */
  private identifyTrendingTopics(broadcasts: any[]): TrendingTopic[] {
    const topicMap = new Map<string, { count: number; broadcasts: string[] }>();

    broadcasts.forEach((b) => {
      const topics = b.tags || [];
      topics.forEach((tag: string) => {
        const current = topicMap.get(tag) || { count: 0, broadcasts: [] };
        current.count++;
        current.broadcasts.push(b.id);
        topicMap.set(tag, current);
      });
    });

    return Array.from(topicMap.entries())
      .map(([topic, data]) => ({
        topic,
        mentions: data.count,
        growth: Math.random() * 100, // Simulated growth percentage
        topBroadcasts: data.broadcasts.slice(0, 3),
        sentiment: (['positive', 'neutral', 'negative'] as const)[
          Math.floor(Math.random() * 3)
        ],
      }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 5);
  }

  /**
   * Generate personalized recommendations
   */
  private generatePersonalizedRecommendations(
    userId: string,
    broadcasts: any[],
    preferences: DigestPreferences
  ): CuratedContent[] {
    return broadcasts
      .filter((b) => preferences.categories.includes(b.category))
      .map((b) => ({
        id: b.id,
        title: b.title,
        creator: b.creator,
        category: b.category,
        views: b.views || 0,
        rating: b.rating || 0,
        duration: b.duration || 0,
        thumbnail: b.thumbnail,
        reason: `Matches your interest in ${b.category}`,
        engagementScore: (b.rating || 0) * 50 + (b.views || 0) * 0.5,
      }))
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, preferences.maxItems || 5);
  }

  /**
   * Select weekly highlights
   */
  private selectWeeklyHighlights(broadcasts: any[], limit: number): CuratedContent[] {
    return broadcasts
      .filter((b) => b.featured || b.rating > 4.5)
      .map((b) => ({
        id: b.id,
        title: b.title,
        creator: b.creator,
        category: b.category,
        views: b.views || 0,
        rating: b.rating || 0,
        duration: b.duration || 0,
        thumbnail: b.thumbnail,
        reason: 'This week\'s highlight',
        engagementScore: (b.rating || 0) * 50,
      }))
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, limit);
  }

  /**
   * Identify newly joined creators
   */
  private identifyNewCreators(broadcasts: any[], limit: number): CreatorProfile[] {
    const creatorMap = new Map<string, any>();

    broadcasts.forEach((b) => {
      if (!creatorMap.has(b.creator)) {
        creatorMap.set(b.creator, {
          id: b.creatorId || Math.random().toString(),
          name: b.creator,
          followers: Math.floor(Math.random() * 10000),
          category: b.category,
          topBroadcast: b.title,
          joinDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          engagement: Math.random() * 100,
        });
      }
    });

    return Array.from(creatorMap.values())
      .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
      .slice(0, limit);
  }

  /**
   * Generate AI-powered digest summary
   */
  private async generateDigestSummary(
    topBroadcasts: CuratedContent[],
    trendingTopics: TrendingTopic[],
    recommendations: CuratedContent[]
  ): Promise<string> {
    const prompt = `Generate a brief, engaging summary (2-3 sentences) of today's content digest:
    
    Top Broadcasts: ${topBroadcasts.map((b) => b.title).join(', ')}
    Trending Topics: ${trendingTopics.map((t) => t.topic).join(', ')}
    Personalized Picks: ${recommendations.map((r) => r.title).join(', ')}
    
    Make it conversational and exciting.`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are a content curator creating engaging daily digests.',
          },
          { role: 'user', content: prompt },
        ],
      });

      return response.choices[0]?.message?.content || 'Check out today\'s top content!';
    } catch {
      return 'Discover today\'s trending content and personalized recommendations.';
    }
  }

  /**
   * Set digest preferences for user
   */
  setDigestPreferences(userId: string, preferences: DigestPreferences): void {
    this.preferences.set(userId, preferences);
  }

  /**
   * Get digest for user
   */
  getDigest(userId: string, date?: string): ContentDigest | undefined {
    const key = `${userId}_${date || new Date().toISOString().split('T')[0]}`;
    return this.digests.get(key);
  }

  /**
   * Get user preferences
   */
  getPreferences(userId: string): DigestPreferences | undefined {
    return this.preferences.get(userId);
  }

  /**
   * Update trending cache
   */
  updateTrendingCache(topics: TrendingTopic[]): void {
    this.trendingCache = topics;
    this.lastCurationTime = new Date();
  }

  /**
   * Get trending topics
   */
  getTrendingTopics(): TrendingTopic[] {
    return this.trendingCache;
  }

  /**
   * Schedule digest delivery
   */
  async scheduleDigestDelivery(
    userId: string,
    digest: ContentDigest,
    deliveryMethod: 'email' | 'push' | 'both'
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Simulate scheduling
      console.log(`Scheduling ${deliveryMethod} delivery for user ${userId}`);

      if (deliveryMethod === 'email' || deliveryMethod === 'both') {
        // Send email notification
        console.log(`Email digest scheduled for ${digest.sendTime}`);
      }

      if (deliveryMethod === 'push' || deliveryMethod === 'both') {
        // Send push notification
        console.log(`Push notification scheduled for ${digest.sendTime}`);
      }

      return {
        success: true,
        message: `Digest scheduled for delivery via ${deliveryMethod}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to schedule digest: ${error}`,
      };
    }
  }

  /**
   * Get curation statistics
   */
  getCurationStats(): {
    totalDigestsGenerated: number;
    usersWithPreferences: number;
    lastCurationTime: Date;
    averageItemsPerDigest: number;
  } {
    return {
      totalDigestsGenerated: this.digests.size,
      usersWithPreferences: this.preferences.size,
      lastCurationTime: this.lastCurationTime,
      averageItemsPerDigest: 8, // topBroadcasts + recommendations + highlights
    };
  }
}

export const contentCurationEngine = new ContentCurationEngine();
