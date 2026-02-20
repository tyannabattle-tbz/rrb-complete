import { db } from '../db';
import { invokeLLM } from '../_core/llm';

/**
 * AI-Powered Content Recommendation Engine
 * Analyzes viewer behavior, watch history, and engagement patterns
 * Provides personalized broadcast and content recommendations
 */

interface ViewerProfile {
  userId: string;
  watchHistory: string[];
  preferences: {
    categories: string[];
    frequencies: string[];
    broadcastTypes: string[];
  };
  engagementScore: number;
  totalWatchTime: number;
  lastActive: Date;
}

interface ContentRecommendation {
  broadcastId: string;
  title: string;
  channel: string;
  category: string;
  relevanceScore: number;
  reason: string;
  thumbnail?: string;
  duration: number;
  frequency?: string;
}

interface BehaviorAnalysis {
  userId: string;
  watchPattern: 'morning' | 'afternoon' | 'evening' | 'night' | 'mixed';
  preferredCategories: string[];
  engagementLevel: 'high' | 'medium' | 'low';
  churnRisk: 'low' | 'medium' | 'high';
  recommendedActions: string[];
}

class RecommendationEngine {
  private viewerProfiles: Map<string, ViewerProfile> = new Map();
  private recommendations: Map<string, ContentRecommendation[]> = new Map();

  /**
   * Build viewer profile from watch history
   */
  async buildViewerProfile(userId: string, watchHistory: any[]): Promise<ViewerProfile> {
    const categories = new Set<string>();
    const frequencies = new Set<string>();
    const broadcastTypes = new Set<string>();
    let totalWatchTime = 0;

    // Analyze watch history
    watchHistory.forEach((item) => {
      if (item.category) categories.add(item.category);
      if (item.frequency) frequencies.add(item.frequency);
      if (item.type) broadcastTypes.add(item.type);
      totalWatchTime += item.duration || 0;
    });

    const profile: ViewerProfile = {
      userId,
      watchHistory: watchHistory.map((h) => h.id),
      preferences: {
        categories: Array.from(categories),
        frequencies: Array.from(frequencies),
        broadcastTypes: Array.from(broadcastTypes),
      },
      engagementScore: Math.min(100, (totalWatchTime / 3600) * 10), // Score based on hours watched
      totalWatchTime,
      lastActive: new Date(),
    };

    this.viewerProfiles.set(userId, profile);
    return profile;
  }

  /**
   * Analyze viewer behavior patterns
   */
  async analyzeViewerBehavior(userId: string): Promise<BehaviorAnalysis> {
    const profile = this.viewerProfiles.get(userId);
    if (!profile) {
      throw new Error(`No profile found for user ${userId}`);
    }

    // Determine watch pattern
    const watchPattern = this.determineWatchPattern(profile);

    // Identify churn risk
    const churnRisk = this.assessChurnRisk(profile);

    // Generate recommendations
    const recommendedActions = this.generateRecommendedActions(profile, churnRisk);

    return {
      userId,
      watchPattern,
      preferredCategories: profile.preferences.categories,
      engagementLevel:
        profile.engagementScore > 70 ? 'high' : profile.engagementScore > 40 ? 'medium' : 'low',
      churnRisk,
      recommendedActions,
    };
  }

  /**
   * Generate personalized content recommendations
   */
  async generateRecommendations(userId: string, allBroadcasts: any[]): Promise<ContentRecommendation[]> {
    const profile = this.viewerProfiles.get(userId);
    if (!profile) {
      throw new Error(`No profile found for user ${userId}`);
    }

    const recommendations: ContentRecommendation[] = [];

    // Score each broadcast
    for (const broadcast of allBroadcasts) {
      if (profile.watchHistory.includes(broadcast.id)) {
        continue; // Skip already watched
      }

      const relevanceScore = this.calculateRelevanceScore(broadcast, profile);

      if (relevanceScore > 0.3) {
        // Only include if relevance > 30%
        const reason = this.generateRecommendationReason(broadcast, profile);

        recommendations.push({
          broadcastId: broadcast.id,
          title: broadcast.title,
          channel: broadcast.channel,
          category: broadcast.category,
          relevanceScore,
          reason,
          thumbnail: broadcast.thumbnail,
          duration: broadcast.duration,
          frequency: broadcast.frequency,
        });
      }
    }

    // Sort by relevance score
    recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Store recommendations
    this.recommendations.set(userId, recommendations.slice(0, 10)); // Top 10

    return recommendations.slice(0, 10);
  }

  /**
   * Calculate relevance score for a broadcast
   */
  private calculateRelevanceScore(broadcast: any, profile: ViewerProfile): number {
    let score = 0;

    // Category match (40% weight)
    if (profile.preferences.categories.includes(broadcast.category)) {
      score += 0.4;
    }

    // Frequency match (30% weight)
    if (broadcast.frequency && profile.preferences.frequencies.includes(broadcast.frequency)) {
      score += 0.3;
    }

    // Type match (20% weight)
    if (profile.preferences.broadcastTypes.includes(broadcast.type)) {
      score += 0.2;
    }

    // Popularity boost (10% weight)
    if (broadcast.views > 10000) {
      score += 0.1;
    }

    return Math.min(1, score);
  }

  /**
   * Generate human-readable recommendation reason
   */
  private generateRecommendationReason(broadcast: any, profile: ViewerProfile): string {
    const reasons: string[] = [];

    if (profile.preferences.categories.includes(broadcast.category)) {
      reasons.push(`matches your interest in ${broadcast.category}`);
    }

    if (broadcast.frequency && profile.preferences.frequencies.includes(broadcast.frequency)) {
      reasons.push(`features ${broadcast.frequency} frequency`);
    }

    if (broadcast.views > 50000) {
      reasons.push('trending with high engagement');
    }

    if (broadcast.rating > 4.5) {
      reasons.push('highly rated by viewers');
    }

    return reasons.length > 0 ? reasons.join(' and ') : 'recommended for you';
  }

  /**
   * Determine watch pattern
   */
  private determineWatchPattern(profile: ViewerProfile): 'morning' | 'afternoon' | 'evening' | 'night' | 'mixed' {
    // Simulate pattern detection
    const rand = Math.random();
    if (rand < 0.2) return 'morning';
    if (rand < 0.4) return 'afternoon';
    if (rand < 0.6) return 'evening';
    if (rand < 0.8) return 'night';
    return 'mixed';
  }

  /**
   * Assess churn risk
   */
  private assessChurnRisk(profile: ViewerProfile): 'low' | 'medium' | 'high' {
    const daysSinceActive = Math.floor(
      (Date.now() - profile.lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceActive > 30) return 'high';
    if (daysSinceActive > 14) return 'medium';
    return 'low';
  }

  /**
   * Generate recommended actions to reduce churn
   */
  private generateRecommendedActions(
    profile: ViewerProfile,
    churnRisk: 'low' | 'medium' | 'high'
  ): string[] {
    const actions: string[] = [];

    if (churnRisk === 'high') {
      actions.push('Send personalized re-engagement email');
      actions.push('Offer exclusive content or discount');
      actions.push('Notify about new content in preferred categories');
    } else if (churnRisk === 'medium') {
      actions.push('Send weekly digest of recommended content');
      actions.push('Notify about trending broadcasts');
    }

    if (profile.engagementScore > 70) {
      actions.push('Consider for VIP program');
      actions.push('Invite to exclusive events');
    }

    return actions;
  }

  /**
   * Get recommendations for user
   */
  getRecommendations(userId: string): ContentRecommendation[] | undefined {
    return this.recommendations.get(userId);
  }

  /**
   * Get viewer profile
   */
  getViewerProfile(userId: string): ViewerProfile | undefined {
    return this.viewerProfiles.get(userId);
  }

  /**
   * Update viewer profile with new watch
   */
  updateViewerProfile(userId: string, broadcastId: string): void {
    const profile = this.viewerProfiles.get(userId);
    if (profile) {
      if (!profile.watchHistory.includes(broadcastId)) {
        profile.watchHistory.push(broadcastId);
      }
      profile.lastActive = new Date();
    }
  }

  /**
   * Get trending content
   */
  getTrendingContent(broadcasts: any[], limit: number = 10): any[] {
    return broadcasts
      .sort((a, b) => {
        // Sort by views, then rating
        if (b.views !== a.views) return b.views - a.views;
        return b.rating - a.rating;
      })
      .slice(0, limit);
  }

  /**
   * Get content by category
   */
  getContentByCategory(broadcasts: any[], category: string, limit: number = 10): any[] {
    return broadcasts.filter((b) => b.category === category).slice(0, limit);
  }

  /**
   * Get similar content
   */
  getSimilarContent(broadcast: any, broadcasts: any[], limit: number = 5): any[] {
    return broadcasts
      .filter((b) => b.id !== broadcast.id && b.category === broadcast.category)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }
}

export const recommendationEngine = new RecommendationEngine();
