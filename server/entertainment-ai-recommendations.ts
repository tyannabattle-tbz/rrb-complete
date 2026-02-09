/**
 * Entertainment Platform - AI Recommendation Engine
 * Personalized content suggestions based on user behavior and preferences
 */

import { getDb } from './db';
import {
  aiRecommendations,
  audioPlaybackHistory,
  audioContent,
  entertainmentUserPreferences,
} from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { invokeLLM } from './server/_core/llm';

interface RecommendationInput {
  userId: number;
  contentType?: string;
  limit?: number;
}

/**
 * Generate personalized recommendations for user
 */
export async function generatePersonalizedRecommendations(input: RecommendationInput) {
  try {
    const db = await getDb();
    const { userId, contentType, limit = 10 } = input;

    // Get user's playback history
    const history = await db
      .select()
      .from(audioPlaybackHistory)
      .where(eq(audioPlaybackHistory.userId, userId));

    // Get user preferences
    const preferences = await db
      .select()
      .from(entertainmentUserPreferences)
      .where(eq(entertainmentUserPreferences.userId, userId));

    // Get all available content
    let availableContent = await db.select().from(audioContent);

    // Filter by content type if specified
    if (contentType) {
      availableContent = availableContent.filter((c) => c.contentType === contentType);
    }

    // Get user's favorite genres/categories
    const userGenres = preferences[0]?.preferredGenres || [];
    const userContentTypes = preferences[0]?.preferredContentTypes || [];

    // Score each content based on relevance
    const scoredContent = availableContent.map((content) => {
      let score = 0;

      // Check if already played
      const alreadyPlayed = history.some((h) => h.contentId === content.contentId);
      if (alreadyPlayed) score -= 50;

      // Genre/category match
      if (userGenres.includes(content.category)) score += 30;
      if (userContentTypes.includes(content.contentType)) score += 25;

      // Popularity
      score += (content.plays || 0) * 0.1;

      // Rating
      score += (content.rating || 0) * 10;

      // Recency bonus
      const daysSinceCreated = (Date.now() - new Date(content.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated < 7) score += 20;
      if (daysSinceCreated < 30) score += 10;

      return { content, score };
    });

    // Sort by score and get top recommendations
    const topRecommendations = scoredContent
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.content);

    // Save recommendations to database
    const savedRecommendations = [];
    for (const content of topRecommendations) {
      const recommendationId = `rec_${userId}_${content.contentId}_${Date.now()}`;
      const relevanceScore = Math.min(100, Math.max(0, 50 + (content.rating || 0) * 10));
      const confidenceScore = Math.min(100, 60 + (content.plays || 0) * 0.5);

      await db.insert(aiRecommendations).values({
        recommendationId,
        userId,
        contentId: content.contentId,
        contentType: content.contentType,
        recommendationType: 'personalized',
        relevanceScore,
        confidenceScore,
        reason: `Based on your interest in ${content.contentType} content and similar listening patterns`,
      });

      savedRecommendations.push({
        contentId: content.contentId,
        title: content.title,
        contentType: content.contentType,
        relevanceScore,
        confidenceScore,
      });
    }

    return {
      userId,
      recommendations: savedRecommendations,
      count: savedRecommendations.length,
      message: 'Personalized recommendations generated',
    };
  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    throw error;
  }
}

/**
 * Generate trending recommendations
 */
export async function generateTrendingRecommendations(input: RecommendationInput) {
  try {
    const db = await getDb();
    const { userId, contentType, limit = 10 } = input;

    let trendingContent = await db.select().from(audioContent);

    // Filter by content type if specified
    if (contentType) {
      trendingContent = trendingContent.filter((c) => c.contentType === contentType);
    }

    // Sort by plays (trending)
    const topTrending = trendingContent.sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, limit);

    // Save recommendations
    const savedRecommendations = [];
    for (const content of topTrending) {
      const recommendationId = `rec_${userId}_${content.contentId}_${Date.now()}`;

      await db.insert(aiRecommendations).values({
        recommendationId,
        userId,
        contentId: content.contentId,
        contentType: content.contentType,
        recommendationType: 'trending',
        relevanceScore: Math.min(100, (content.plays || 0) * 0.5),
        confidenceScore: 85,
        reason: `Trending now with ${content.plays || 0} plays`,
      });

      savedRecommendations.push({
        contentId: content.contentId,
        title: content.title,
        contentType: content.contentType,
        plays: content.plays,
      });
    }

    return {
      userId,
      recommendations: savedRecommendations,
      count: savedRecommendations.length,
      message: 'Trending recommendations generated',
    };
  } catch (error) {
    console.error('Error generating trending recommendations:', error);
    throw error;
  }
}

/**
 * Generate similar content recommendations
 */
export async function generateSimilarRecommendations(contentId: string, userId: number, limit: number = 10) {
  try {
    const db = await getDb();

    // Get the reference content
    const refContent = await db.select().from(audioContent).where(eq(audioContent.contentId, contentId));
    if (!refContent.length) throw new Error('Content not found');

    const reference = refContent[0];

    // Find similar content
    let similarContent = await db.select().from(audioContent);

    // Filter by same type and category
    similarContent = similarContent.filter(
      (c) => c.contentType === reference.contentType && c.category === reference.category && c.contentId !== contentId
    );

    // Sort by rating and plays
    const topSimilar = similarContent
      .sort((a, b) => {
        const scoreA = (a.rating || 0) * 10 + (a.plays || 0) * 0.1;
        const scoreB = (b.rating || 0) * 10 + (b.plays || 0) * 0.1;
        return scoreB - scoreA;
      })
      .slice(0, limit);

    // Save recommendations
    const savedRecommendations = [];
    for (const content of topSimilar) {
      const recommendationId = `rec_${userId}_${content.contentId}_${Date.now()}`;

      await db.insert(aiRecommendations).values({
        recommendationId,
        userId,
        contentId: content.contentId,
        contentType: content.contentType,
        recommendationType: 'similar',
        relevanceScore: Math.min(100, (content.rating || 0) * 20),
        confidenceScore: 80,
        reason: `Similar to "${reference.title}" - same ${reference.contentType} category`,
      });

      savedRecommendations.push({
        contentId: content.contentId,
        title: content.title,
        contentType: content.contentType,
        rating: content.rating,
      });
    }

    return {
      userId,
      baseContent: reference.title,
      recommendations: savedRecommendations,
      count: savedRecommendations.length,
      message: 'Similar content recommendations generated',
    };
  } catch (error) {
    console.error('Error generating similar recommendations:', error);
    throw error;
  }
}

/**
 * Generate new release recommendations
 */
export async function generateNewReleaseRecommendations(input: RecommendationInput) {
  try {
    const db = await getDb();
    const { userId, contentType, limit = 10 } = input;

    // Get content from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    let newContent = await db.select().from(audioContent);

    newContent = newContent.filter((c) => new Date(c.createdAt) > thirtyDaysAgo);

    // Filter by content type if specified
    if (contentType) {
      newContent = newContent.filter((c) => c.contentType === contentType);
    }

    // Sort by creation date
    const topNew = newContent.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);

    // Save recommendations
    const savedRecommendations = [];
    for (const content of topNew) {
      const recommendationId = `rec_${userId}_${content.contentId}_${Date.now()}`;

      await db.insert(aiRecommendations).values({
        recommendationId,
        userId,
        contentId: content.contentId,
        contentType: content.contentType,
        recommendationType: 'new_release',
        relevanceScore: 90,
        confidenceScore: 75,
        reason: `New release - just added to the platform`,
      });

      savedRecommendations.push({
        contentId: content.contentId,
        title: content.title,
        contentType: content.contentType,
        createdAt: content.createdAt,
      });
    }

    return {
      userId,
      recommendations: savedRecommendations,
      count: savedRecommendations.length,
      message: 'New release recommendations generated',
    };
  } catch (error) {
    console.error('Error generating new release recommendations:', error);
    throw error;
  }
}

/**
 * Get user's recommendations
 */
export async function getUserRecommendations(userId: number, limit: number = 50) {
  try {
    const db = await getDb();
    const recommendations = await db
      .select()
      .from(aiRecommendations)
      .where(eq(aiRecommendations.userId, userId))
      .limit(limit);
    return recommendations;
  } catch (error) {
    console.error('Error fetching user recommendations:', error);
    throw error;
  }
}

/**
 * Track recommendation click
 */
export async function trackRecommendationClick(recommendationId: string) {
  try {
    const db = await getDb();
    await db
      .update(aiRecommendations)
      .set({ clicked: true })
      .where(eq(aiRecommendations.recommendationId, recommendationId));

    return {
      recommendationId,
      clicked: true,
      message: 'Recommendation click tracked',
    };
  } catch (error) {
    console.error('Error tracking recommendation click:', error);
    throw error;
  }
}

/**
 * Track recommendation engagement
 */
export async function trackRecommendationEngagement(recommendationId: string) {
  try {
    const db = await getDb();
    await db
      .update(aiRecommendations)
      .set({ engaged: true })
      .where(eq(aiRecommendations.recommendationId, recommendationId));

    return {
      recommendationId,
      engaged: true,
      message: 'Recommendation engagement tracked',
    };
  } catch (error) {
    console.error('Error tracking recommendation engagement:', error);
    throw error;
  }
}

/**
 * Get recommendation effectiveness metrics
 */
export async function getRecommendationMetrics(userId: number) {
  try {
    const db = await getDb();
    const recommendations = await db
      .select()
      .from(aiRecommendations)
      .where(eq(aiRecommendations.userId, userId));

    const totalRecommendations = recommendations.length;
    const clicked = recommendations.filter((r) => r.clicked).length;
    const engaged = recommendations.filter((r) => r.engaged).length;
    const clickRate = totalRecommendations > 0 ? (clicked / totalRecommendations) * 100 : 0;
    const engagementRate = totalRecommendations > 0 ? (engaged / totalRecommendations) * 100 : 0;

    // Group by type
    const byType = {
      personalized: recommendations.filter((r) => r.recommendationType === 'personalized').length,
      trending: recommendations.filter((r) => r.recommendationType === 'trending').length,
      similar: recommendations.filter((r) => r.recommendationType === 'similar').length,
      new_release: recommendations.filter((r) => r.recommendationType === 'new_release').length,
      based_on_history: recommendations.filter((r) => r.recommendationType === 'based_on_history').length,
    };

    return {
      userId,
      totalRecommendations,
      clicked,
      engaged,
      clickRate: Math.round(clickRate * 100) / 100,
      engagementRate: Math.round(engagementRate * 100) / 100,
      byType,
    };
  } catch (error) {
    console.error('Error fetching recommendation metrics:', error);
    throw error;
  }
}

/**
 * Generate all recommendations for user
 */
export async function generateAllRecommendations(userId: number) {
  try {
    // Generate all types of recommendations
    const personalized = await generatePersonalizedRecommendations({ userId, limit: 5 });
    const trending = await generateTrendingRecommendations({ userId, limit: 5 });
    const newReleases = await generateNewReleaseRecommendations({ userId, limit: 5 });

    return {
      userId,
      personalized: personalized.recommendations,
      trending: trending.recommendations,
      newReleases: newReleases.recommendations,
      totalGenerated: personalized.count + trending.count + newReleases.count,
      message: 'All recommendation types generated',
    };
  } catch (error) {
    console.error('Error generating all recommendations:', error);
    throw error;
  }
}
