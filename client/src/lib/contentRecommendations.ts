/**
 * AI-Powered Content Recommendation Engine
 * Suggests presets, templates, and workflows based on user behavior
 */

export interface UserBehavior {
  userId: string;
  actions: UserAction[];
  preferences: UserPreferences;
  history: ContentHistory[];
}

export interface UserAction {
  id: string;
  type: ActionType;
  targetId: string;
  targetType: string;
  timestamp: Date;
  duration: number;
}

export type ActionType =
  | 'view'
  | 'use'
  | 'create'
  | 'share'
  | 'like'
  | 'bookmark'
  | 'download'
  | 'rate'
  | 'search'
  | 'filter';

export interface UserPreferences {
  favoritePresets: string[];
  favoriteTemplates: string[];
  favoriteWorkflows: string[];
  preferredStyles: string[];
  preferredGenres: string[];
  avgSessionDuration: number;
  activeHours: number[];
}

export interface ContentHistory {
  id: string;
  contentId: string;
  contentType: string;
  title: string;
  usedAt: Date;
  duration: number;
  rating?: number;
}

export interface Recommendation {
  id: string;
  type: RecommendationType;
  contentId: string;
  title: string;
  description: string;
  confidence: number;
  reason: string;
  category: string;
}

export type RecommendationType = 'preset' | 'template' | 'workflow' | 'content' | 'collaboration';

export interface RecommendationContext {
  currentProject?: string;
  recentActions?: UserAction[];
  timeOfDay?: number;
  dayOfWeek?: number;
  seasonality?: string;
}

export class ContentRecommendationEngine {
  private userBehaviors: Map<string, UserBehavior> = new Map();
  private recommendations: Map<string, Recommendation[]> = new Map();
  private contentLibrary: Map<string, ContentItem> = new Map();
  private collaborativeFiltering: Map<string, Set<string>> = new Map();

  constructor() {
    this.initializeContentLibrary();
  }

  /**
   * Initialize content library
   */
  private initializeContentLibrary(): void {
    const contents: ContentItem[] = [
      {
        id: 'preset-1',
        type: 'preset',
        title: 'Cinematic Dragon',
        description: 'Dramatic dragon animation with Ken Burns effect',
        category: 'fantasy',
        tags: ['dragon', 'cinematic', 'fantasy', 'epic'],
        rating: 4.8,
        usageCount: 245,
      },
      {
        id: 'preset-2',
        type: 'preset',
        title: 'Urban Vibes',
        description: 'Modern city animation with dynamic transitions',
        category: 'urban',
        tags: ['city', 'modern', 'urban', 'dynamic'],
        rating: 4.5,
        usageCount: 189,
      },
      {
        id: 'template-1',
        type: 'template',
        title: 'Hero Video',
        description: 'Full-screen hero video template for landing pages',
        category: 'marketing',
        tags: ['hero', 'marketing', 'landing', 'promotional'],
        rating: 4.7,
        usageCount: 312,
      },
      {
        id: 'workflow-1',
        type: 'workflow',
        title: 'Social Media Pipeline',
        description: 'Automated workflow for generating social media videos',
        category: 'automation',
        tags: ['social', 'automation', 'marketing', 'workflow'],
        rating: 4.6,
        usageCount: 156,
      },
    ];

    contents.forEach((c) => this.contentLibrary.set(c.id, c));
  }

  /**
   * Track user action
   */
  trackAction(userId: string, action: UserAction): void {
    let behavior = this.userBehaviors.get(userId);

    if (!behavior) {
      behavior = {
        userId,
        actions: [],
        preferences: {
          favoritePresets: [],
          favoriteTemplates: [],
          favoriteWorkflows: [],
          preferredStyles: [],
          preferredGenres: [],
          avgSessionDuration: 0,
          activeHours: [],
        },
        history: [],
      };
      this.userBehaviors.set(userId, behavior);
    }

    behavior.actions.push(action);

    // Update preferences based on action
    this.updatePreferences(userId, action);

    // Generate recommendations when enough data
    if (behavior.actions.length % 10 === 0) {
      this.generateRecommendations(userId);
    }
  }

  /**
   * Update user preferences
   */
  private updatePreferences(userId: string, action: UserAction): void {
    const behavior = this.userBehaviors.get(userId);
    if (!behavior) return;

    const content = this.contentLibrary.get(action.targetId);
    if (!content) return;

    // Update based on action type
    switch (action.type) {
      case 'use':
      case 'like':
      case 'bookmark':
        if (content.type === 'preset') {
          behavior.preferences.favoritePresets.push(action.targetId);
        } else if (content.type === 'template') {
          behavior.preferences.favoriteTemplates.push(action.targetId);
        } else if (content.type === 'workflow') {
          behavior.preferences.favoriteWorkflows.push(action.targetId);
        }

        // Add to collaborative filtering
        if (!this.collaborativeFiltering.has(userId)) {
          this.collaborativeFiltering.set(userId, new Set());
        }
        this.collaborativeFiltering.get(userId)!.add(action.targetId);
        break;

      case 'view':
        // Track viewed content
        behavior.preferences.preferredGenres.push(content.category);
        break;
    }

    // Remove duplicates
    behavior.preferences.favoritePresets = Array.from(new Set(behavior.preferences.favoritePresets));
    behavior.preferences.favoriteTemplates = Array.from(new Set(behavior.preferences.favoriteTemplates));
    behavior.preferences.favoriteWorkflows = Array.from(new Set(behavior.preferences.favoriteWorkflows));
    behavior.preferences.preferredGenres = Array.from(new Set(behavior.preferences.preferredGenres));
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(userId: string, context?: RecommendationContext): Recommendation[] {
    const behavior = this.userBehaviors.get(userId);
    if (!behavior) return [];

    const recommendations: Recommendation[] = [];

    // 1. Content-based recommendations
    const contentBased = this.getContentBasedRecommendations(behavior);
    recommendations.push(...contentBased);

    // 2. Collaborative filtering recommendations
    const collaborative = this.getCollaborativeRecommendations(userId);
    recommendations.push(...collaborative);

    // 3. Trending recommendations
    const trending = this.getTrendingRecommendations();
    recommendations.push(...trending);

    // 4. Context-aware recommendations
    if (context) {
      const contextAware = this.getContextAwareRecommendations(behavior, context);
      recommendations.push(...contextAware);
    }

    // Sort by confidence
    recommendations.sort((a, b) => b.confidence - a.confidence);

    // Store recommendations
    this.recommendations.set(userId, recommendations.slice(0, 10));

    return recommendations.slice(0, 10);
  }

  /**
   * Get content-based recommendations
   */
  private getContentBasedRecommendations(behavior: UserBehavior): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const usedIds = new Set([
      ...behavior.preferences.favoritePresets,
      ...behavior.preferences.favoriteTemplates,
      ...behavior.preferences.favoriteWorkflows,
    ]);

    // Find similar content
    this.contentLibrary.forEach((content, contentId) => {
      if (usedIds.has(contentId)) return;

      // Calculate similarity
      let similarity = 0;

      // Check category match
      if (behavior.preferences.preferredGenres.includes(content.category)) {
        similarity += 0.4;
      }

      // Check tag overlap
      const userTags = behavior.preferences.preferredStyles;
      const contentTags = content.tags;
      const overlap = userTags.filter((t) => contentTags.includes(t)).length;
      similarity += (overlap / Math.max(userTags.length, 1)) * 0.3;

      // Check rating
      similarity += (content.rating / 5) * 0.2;

      // Check popularity
      similarity += Math.min(content.usageCount / 500, 1) * 0.1;

      if (similarity > 0.3) {
        recommendations.push({
          id: `rec-${contentId}-${Date.now()}`,
          type: (content.type as RecommendationType) || 'preset',
          contentId,
          title: content.title,
          description: content.description,
          confidence: similarity,
                reason: `Similar to your favorite ${content.type}s`,
        category: content.category,
      });
      }
    });

    return recommendations;
  }

  /**
   * Get collaborative filtering recommendations
   */
  private getCollaborativeRecommendations(userId: string): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const userPreferences = this.collaborativeFiltering.get(userId);
    if (!userPreferences) return [];

    // Find similar users
    const similarUsers: Array<{ userId: string; similarity: number }> = [];

    this.collaborativeFiltering.forEach((otherPreferences, otherUserId) => {
      if (otherUserId === userId) return;

      // Calculate Jaccard similarity
      const intersection = new Set(Array.from(userPreferences).filter((x) => otherPreferences.has(x)));
      const union = new Set([...Array.from(userPreferences), ...Array.from(otherPreferences)]);
      const similarity = intersection.size / union.size;

      if (similarity > 0.3) {
        similarUsers.push({ userId: otherUserId, similarity });
      }
    });

    // Get recommendations from similar users
    similarUsers.forEach(({ userId: similarUserId, similarity }) => {
      const similarUserPrefs = this.collaborativeFiltering.get(similarUserId);
      if (!similarUserPrefs) return;

      similarUserPrefs.forEach((contentId) => {
        if (userPreferences.has(contentId)) return;

        const content = this.contentLibrary.get(contentId);
        if (!content) return;

        recommendations.push({
          id: `rec-${contentId}-${Date.now()}`,
          type: (content.type as RecommendationType) || 'preset',
          contentId,
          title: content.title,
          description: content.description,
          confidence: similarity * 0.8,
          reason: `Users like you also enjoyed this`,
          category: content.category,
        });
      });
    });

    return recommendations;
  }

  /**
   * Get trending recommendations
   */
  private getTrendingRecommendations(): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Sort by usage count
    const sorted = Array.from(this.contentLibrary.values()).sort(
      (a, b) => b.usageCount - a.usageCount
    );

    sorted.slice(0, 5).forEach((content) => {
      recommendations.push({
        id: `rec-${content.id}-trending`,
        type: (content.type as RecommendationType) || 'preset',
        contentId: content.id,
        title: content.title,
        description: content.description,
        confidence: Math.min(content.usageCount / 500, 1),
        reason: 'Trending now',
        category: content.category,
      });
    });

    return recommendations;
  }

  /**
   * Get context-aware recommendations
   */
  private getContextAwareRecommendations(
    behavior: UserBehavior,
    context: RecommendationContext
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Time-based recommendations
    if (context.timeOfDay !== undefined) {
      // Top of the Sol: productivity templates
      if (context.timeOfDay < 12) {
        const productivity = Array.from(this.contentLibrary.values()).filter((c) =>
          c.tags.includes('workflow')
        );
        productivity.forEach((c) => {
          recommendations.push({
            id: `rec-${c.id}-top-of-the-sol`,
            type: (c.type as RecommendationType) || 'preset',
            contentId: c.id,
            title: c.title,
            description: c.description,
            confidence: 0.7,
            reason: 'Good for Top of the Sol workflow',
            category: c.category,
          });
        });
      }
    }

    return recommendations;
  }

  /**
   * Get recommendations for user
   */
  getRecommendationsForUser(userId: string): Recommendation[] {
    return this.recommendations.get(userId) || [];
  }

  /**
   * Get user behavior
   */
  getUserBehavior(userId: string): UserBehavior | undefined {
    return this.userBehaviors.get(userId);
  }

  /**
   * Get similar users
   */
  getSimilarUsers(userId: string, limit: number = 5): string[] {
    const userPreferences = this.collaborativeFiltering.get(userId);
    if (!userPreferences) return [];

    const similarities: Array<{ userId: string; similarity: number }> = [];

    this.collaborativeFiltering.forEach((otherPreferences, otherUserId) => {
      if (otherUserId === userId) return;

      const intersection = new Set(Array.from(userPreferences).filter((x) => otherPreferences.has(x)));
      const union = new Set([...Array.from(userPreferences), ...Array.from(otherPreferences)]);
      const similarity = intersection.size / union.size;

      if (similarity > 0) {
        similarities.push({ userId: otherUserId, similarity });
      }
    });

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map((s) => s.userId);
  }

  /**
   * Get trending content
   */
  getTrendingContent(limit: number = 10): ContentItem[] {
    return Array.from(this.contentLibrary.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  /**
   * Rate recommendation
   */
  rateRecommendation(recommendationId: string, rating: number): void {
    // Store rating for future model improvement
    console.log(`Recommendation ${recommendationId} rated: ${rating}`);
  }
}

export interface ContentItem {
  id: string;
  type: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  rating: number;
  usageCount: number;
}

export const contentRecommendations = new ContentRecommendationEngine();
