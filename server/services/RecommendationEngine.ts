import { db } from '../db';
import { analytics } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export interface ContentItem {
  id: string;
  title: string;
  artist?: string;
  genre?: string;
  tags?: string[];
  releaseYear?: number;
}

export class RecommendationEngine {
  /**
   * Get user's listening history
   */
  async getUserListeningHistory(userId: string, limit = 100) {
    const events = await db.query.analytics.findMany({
      where: eq(analytics.userId, userId),
      limit,
    });

    return events
      .filter((e) => e.eventType === 'play')
      .map((e) => e.contentId);
  }

  /**
   * Get user's favorite content (liked items)
   */
  async getUserFavorites(userId: string) {
    const events = await db.query.analytics.findMany({
      where: eq(analytics.userId, userId),
    });

    return events
      .filter((e) => e.eventType === 'like')
      .map((e) => e.contentId);
  }

  /**
   * Calculate similarity between two content items
   */
  private calculateSimilarity(
    item1: ContentItem,
    item2: ContentItem
  ): number {
    let similarity = 0;

    // Genre match (40% weight)
    if (item1.genre && item2.genre && item1.genre === item2.genre) {
      similarity += 0.4;
    }

    // Artist match (30% weight)
    if (item1.artist && item2.artist && item1.artist === item2.artist) {
      similarity += 0.3;
    }

    // Tag overlap (20% weight)
    if (item1.tags && item2.tags) {
      const commonTags = item1.tags.filter((tag) =>
        item2.tags?.includes(tag)
      );
      const tagSimilarity =
        commonTags.length / Math.max(item1.tags.length, item2.tags.length);
      similarity += tagSimilarity * 0.2;
    }

    // Release year proximity (10% weight)
    if (item1.releaseYear && item2.releaseYear) {
      const yearDiff = Math.abs(item1.releaseYear - item2.releaseYear);
      const yearSimilarity = Math.max(0, 1 - yearDiff / 20);
      similarity += yearSimilarity * 0.1;
    }

    return Math.min(1, similarity);
  }

  /**
   * Get content-based recommendations
   */
  async getContentBasedRecommendations(
    userId: string,
    allContent: ContentItem[],
    limit = 10
  ): Promise<Array<{ contentId: string; score: number; reason: string }>> {
    const history = await this.getUserListeningHistory(userId);
    const favorites = await this.getUserFavorites(userId);

    if (history.length === 0) {
      // Return popular content if no history
      return allContent
        .slice(0, limit)
        .map((item) => ({
          contentId: item.id,
          score: 0.5,
          reason: 'Popular content',
        }));
    }

    // Get content items from history
    const historyItems = allContent.filter((item) =>
      history.includes(item.id)
    );

    // Calculate recommendations
    const recommendations = new Map<string, { score: number; reasons: Set<string> }>();

    for (const historyItem of historyItems) {
      const weight = favorites.includes(historyItem.id) ? 1.5 : 1.0;

      for (const candidate of allContent) {
        if (history.includes(candidate.id)) continue; // Skip already played

        const similarity = this.calculateSimilarity(historyItem, candidate);
        if (similarity === 0) continue;

        const current = recommendations.get(candidate.id) || {
          score: 0,
          reasons: new Set<string>(),
        };

        current.score += similarity * weight;

        // Add reason
        if (historyItem.genre === candidate.genre) {
          current.reasons.add(`Similar genre: ${candidate.genre}`);
        }
        if (historyItem.artist === candidate.artist) {
          current.reasons.add(`Same artist: ${candidate.artist}`);
        }
        if (historyItem.tags?.some((tag) => candidate.tags?.includes(tag))) {
          current.reasons.add('Similar tags');
        }

        recommendations.set(candidate.id, current);
      }
    }

    // Sort by score and return top N
    return Array.from(recommendations.entries())
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, limit)
      .map(([contentId, data]) => ({
        contentId,
        score: Math.min(1, data.score),
        reason: Array.from(data.reasons)[0] || 'Recommended for you',
      }));
  }

  /**
   * Get collaborative filtering recommendations (users who liked similar content)
   */
  async getCollaborativeRecommendations(
    userId: string,
    allContent: ContentItem[],
    limit = 10
  ): Promise<Array<{ contentId: string; score: number; reason: string }>> {
    const userFavorites = await this.getUserFavorites(userId);

    if (userFavorites.length === 0) {
      return [];
    }

    // In a real implementation, this would query similar users
    // For now, return empty as it requires user similarity calculations
    return [];
  }

  /**
   * Get trending recommendations based on current trends
   */
  async getTrendingRecommendations(
    userId: string,
    allContent: ContentItem[],
    trendingContentIds: string[],
    limit = 5
  ): Promise<Array<{ contentId: string; score: number; reason: string }>> {
    const history = await this.getUserListeningHistory(userId);

    return trendingContentIds
      .filter((id) => !history.includes(id))
      .slice(0, limit)
      .map((contentId, index) => ({
        contentId,
        score: 1 - index * 0.1,
        reason: 'Trending now',
      }));
  }

  /**
   * Get personalized recommendations combining multiple strategies
   */
  async getPersonalizedRecommendations(
    userId: string,
    allContent: ContentItem[],
    trendingContentIds: string[] = [],
    limit = 10
  ): Promise<Array<{ contentId: string; score: number; reason: string }>> {
    // Get recommendations from different strategies
    const contentBased = await this.getContentBasedRecommendations(
      userId,
      allContent,
      limit * 2
    );
    const trending = await this.getTrendingRecommendations(
      userId,
      allContent,
      trendingContentIds,
      Math.ceil(limit * 0.3)
    );

    // Merge and deduplicate
    const merged = new Map<string, { score: number; reason: string }>();

    // Add content-based (70% weight)
    for (const rec of contentBased) {
      merged.set(rec.contentId, {
        score: rec.score * 0.7,
        reason: rec.reason,
      });
    }

    // Add trending (30% weight)
    for (const rec of trending) {
      const existing = merged.get(rec.contentId);
      if (existing) {
        existing.score += rec.score * 0.3;
        existing.reason = `${existing.reason} & Trending`;
      } else {
        merged.set(rec.contentId, {
          score: rec.score * 0.3,
          reason: rec.reason,
        });
      }
    }

    // Sort by score and return
    return Array.from(merged.entries())
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, limit)
      .map(([contentId, data]) => ({
        contentId,
        score: data.score,
        reason: data.reason,
      }));
  }

  /**
   * Get recommendations for a specific content item (users who liked this also liked...)
   */
  async getSimilarContent(
    contentId: string,
    allContent: ContentItem[],
    limit = 10
  ): Promise<Array<{ contentId: string; score: number }>> {
    const content = allContent.find((c) => c.id === contentId);
    if (!content) return [];

    const similar = allContent
      .filter((c) => c.id !== contentId)
      .map((candidate) => ({
        contentId: candidate.id,
        score: this.calculateSimilarity(content, candidate),
      }))
      .filter((rec) => rec.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return similar;
  }
}

export const recommendationEngine = new RecommendationEngine();
