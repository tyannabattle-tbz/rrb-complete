/**
 * Preset Recommendation Engine
 * AI-powered recommendations based on user behavior and preferences
 */

export interface UserPreferences {
  userId: string;
  favoriteCategories: string[];
  favoriteAuthors: string[];
  preferredAnimationEffects: string[];
  preferredTransitions: string[];
  usageHistory: Array<{
    presetId: string;
    timestamp: Date;
    duration: number;
    rating?: number;
  }>;
  ratings: Map<string, number>;
}

export interface PresetScore {
  presetId: string;
  score: number;
  reason: string;
  confidence: number;
}

export interface RecommendationResult {
  recommendations: PresetScore[];
  trending: PresetScore[];
  personalized: PresetScore[];
  similar: PresetScore[];
}

export class RecommendationEngine {
  private userPreferences: Map<string, UserPreferences> = new Map();
  private presetPopularity: Map<string, number> = new Map();
  private presetRatings: Map<string, { sum: number; count: number }> = new Map();
  private userSimilarity: Map<string, Map<string, number>> = new Map();

  /**
   * Track user interaction with preset
   */
  trackInteraction(
    userId: string,
    presetId: string,
    duration: number,
    rating?: number
  ): void {
    if (!this.userPreferences.has(userId)) {
      this.userPreferences.set(userId, {
        userId,
        favoriteCategories: [],
        favoriteAuthors: [],
        preferredAnimationEffects: [],
        preferredTransitions: [],
        usageHistory: [],
        ratings: new Map(),
      });
    }

    const prefs = this.userPreferences.get(userId)!;
    prefs.usageHistory.push({
      presetId,
      timestamp: new Date(),
      duration,
      rating,
    });

    if (rating) {
      prefs.ratings.set(presetId, rating);
    }

    // Update popularity
    this.presetPopularity.set(presetId, (this.presetPopularity.get(presetId) || 0) + 1);
  }

  /**
   * Update preset rating
   */
  updatePresetRating(presetId: string, rating: number): void {
    if (!this.presetRatings.has(presetId)) {
      this.presetRatings.set(presetId, { sum: 0, count: 0 });
    }

    const stats = this.presetRatings.get(presetId)!;
    stats.sum += rating;
    stats.count++;
  }

  /**
   * Get trending presets
   */
  getTrendingPresets(limit: number = 10): PresetScore[] {
    const trending: PresetScore[] = [];

    const sortedByPopularity = Array.from(this.presetPopularity.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    sortedByPopularity.forEach(([presetId, popularity]) => {
      const rating = this.presetRatings.get(presetId);
      const avgRating = rating ? rating.sum / rating.count : 0;
      const score = popularity * 0.6 + avgRating * 0.4;

      trending.push({
        presetId,
        score,
        reason: `Trending: ${popularity} uses, ${avgRating.toFixed(1)} rating`,
        confidence: Math.min(popularity / 100, 1),
      });
    });

    return trending;
  }

  /**
   * Get personalized recommendations
   */
  getPersonalizedRecommendations(userId: string, limit: number = 10): PresetScore[] {
    const prefs = this.userPreferences.get(userId);
    if (!prefs || prefs.usageHistory.length === 0) {
      return [];
    }

    const recommendations: PresetScore[] = [];
    const usedPresets = new Set(prefs.usageHistory.map((h) => h.presetId));

    // Score presets based on user preferences
    const allPresets = Array.from(this.presetPopularity.keys());

    allPresets.forEach((presetId) => {
      if (usedPresets.has(presetId)) return;

      let score = 0;
      let reasons: string[] = [];

      // Base score from popularity
      score += (this.presetPopularity.get(presetId) || 0) * 0.2;

      // Rating score
      const rating = this.presetRatings.get(presetId);
      if (rating) {
        const avgRating = rating.sum / rating.count;
        score += avgRating * 0.3;
        if (avgRating >= 4) reasons.push('Highly rated');
      }

      // Similarity to user's history
      const avgUserRating =
        Array.from(prefs.ratings.values()).reduce((a, b) => a + b, 0) /
        prefs.ratings.size;
      score += Math.random() * 0.5; // Exploration factor

      if (score > 0) {
        recommendations.push({
          presetId,
          score,
          reason: reasons.length > 0 ? reasons.join(', ') : 'Recommended for you',
          confidence: Math.min(score / 5, 1),
        });
      }
    });

    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Get similar presets
   */
  getSimilarPresets(presetId: string, limit: number = 5): PresetScore[] {
    // Mock similar preset recommendation
    const similar: PresetScore[] = [];

    // In production, this would use content-based or collaborative filtering
    const allPresets = Array.from(this.presetPopularity.keys()).filter((p) => p !== presetId);

    allPresets.slice(0, limit).forEach((similarPresetId) => {
      similar.push({
        presetId: similarPresetId,
        score: Math.random() * 0.8 + 0.2,
        reason: 'Similar to your selection',
        confidence: 0.7,
      });
    });

    return similar;
  }

  /**
   * Get recommendations for user
   */
  getRecommendations(userId: string): RecommendationResult {
    return {
      recommendations: this.getPersonalizedRecommendations(userId, 5),
      trending: this.getTrendingPresets(5),
      personalized: this.getPersonalizedRecommendations(userId, 3),
      similar: this.getSimilarPresets('', 3),
    };
  }

  /**
   * Calculate user similarity
   */
  private calculateUserSimilarity(userId1: string, userId2: string): number {
    const prefs1 = this.userPreferences.get(userId1);
    const prefs2 = this.userPreferences.get(userId2);

    if (!prefs1 || !prefs2) return 0;

    // Calculate Jaccard similarity on used presets
    const presets1Array = prefs1.usageHistory.map((h) => h.presetId);
    const presets2Array = prefs2.usageHistory.map((h) => h.presetId);

    const presets1Set = new Set(presets1Array);
    const presets2Set = new Set(presets2Array);

    const intersectionArray: string[] = [];
    presets1Array.forEach((p) => {
      if (presets2Set.has(p)) {
        intersectionArray.push(p);
      }
    });

    const unionArray = Array.from(new Set([...presets1Array, ...presets2Array]));

    return unionArray.length > 0 ? intersectionArray.length / unionArray.length : 0;
  }

  /**
   * Get user preferences
   */
  getUserPreferences(userId: string): UserPreferences | undefined {
    return this.userPreferences.get(userId);
  }

  /**
   * Update user preferences
   */
  updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): void {
    if (!this.userPreferences.has(userId)) {
      this.userPreferences.set(userId, {
        userId,
        favoriteCategories: [],
        favoriteAuthors: [],
        preferredAnimationEffects: [],
        preferredTransitions: [],
        usageHistory: [],
        ratings: new Map(),
      });
    }

    const prefs = this.userPreferences.get(userId)!;

    if (preferences.favoriteCategories) {
      prefs.favoriteCategories = preferences.favoriteCategories;
    }
    if (preferences.favoriteAuthors) {
      prefs.favoriteAuthors = preferences.favoriteAuthors;
    }
    if (preferences.preferredAnimationEffects) {
      prefs.preferredAnimationEffects = preferences.preferredAnimationEffects;
    }
    if (preferences.preferredTransitions) {
      prefs.preferredTransitions = preferences.preferredTransitions;
    }
  }

  /**
   * Get recommendation statistics
   */
  getStats(): {
    totalUsers: number;
    totalPresets: number;
    avgPopularity: number;
    avgRating: number;
  } {
    const avgPopularity =
      Array.from(this.presetPopularity.values()).reduce((a, b) => a + b, 0) /
      this.presetPopularity.size;

    let totalRating = 0;
    let totalRatingCount = 0;
    this.presetRatings.forEach((stats) => {
      totalRating += stats.sum;
      totalRatingCount += stats.count;
    });

    return {
      totalUsers: this.userPreferences.size,
      totalPresets: this.presetPopularity.size,
      avgPopularity: avgPopularity || 0,
      avgRating: totalRatingCount > 0 ? totalRating / totalRatingCount : 0,
    };
  }
}

export function createRecommendationEngine(): RecommendationEngine {
  return new RecommendationEngine();
}
