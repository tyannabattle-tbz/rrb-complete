/**
 * Listener Rating & Voting System
 * Collects listener feedback for streams and channels
 */

export type RatingType = 'stream' | 'channel' | 'track';
export type VoteType = 'thumbs_up' | 'thumbs_down' | 'neutral';

export interface ListenerRating {
  id: string;
  userId: string;
  targetId: string; // stream, channel, or track ID
  targetType: RatingType;
  rating: number; // 1-5 stars
  vote: VoteType;
  comment?: string;
  timestamp: number;
}

export interface RatingAggregate {
  targetId: string;
  targetType: RatingType;
  totalRatings: number;
  averageRating: number;
  thumbsUp: number;
  thumbsDown: number;
  neutral: number;
  distribution: Record<number, number>; // 1-5 star distribution
  lastUpdated: number;
}

export interface RatingStats {
  targetId: string;
  rating: number;
  votes: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  trend: 'improving' | 'stable' | 'declining';
}

const ratingsStore = new Map<string, ListenerRating[]>();
const aggregatesCache = new Map<string, RatingAggregate>();

/**
 * Submit a rating for a stream/channel/track
 */
export function submitRating(
  userId: string,
  targetId: string,
  targetType: RatingType,
  rating: number,
  vote: VoteType,
  comment?: string
): ListenerRating {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  const ratingId = `${userId}-${targetId}-${Date.now()}`;
  const newRating: ListenerRating = {
    id: ratingId,
    userId,
    targetId,
    targetType,
    rating,
    vote,
    comment,
    timestamp: Date.now()
  };

  // Store rating
  const key = `${targetType}-${targetId}`;
  const existing = ratingsStore.get(key) || [];
  ratingsStore.set(key, [...existing, newRating]);

  // Invalidate cache
  aggregatesCache.delete(key);

  // Save to localStorage
  saveRatingToStorage(newRating);

  return newRating;
}

/**
 * Get all ratings for a target
 */
export function getRatings(targetId: string, targetType: RatingType): ListenerRating[] {
  const key = `${targetType}-${targetId}`;
  return ratingsStore.get(key) || [];
}

/**
 * Get user's rating for a target
 */
export function getUserRating(
  userId: string,
  targetId: string,
  targetType: RatingType
): ListenerRating | null {
  const ratings = getRatings(targetId, targetType);
  return ratings.find(r => r.userId === userId) || null;
}

/**
 * Update a rating
 */
export function updateRating(
  ratingId: string,
  rating?: number,
  vote?: VoteType,
  comment?: string
): ListenerRating | null {
  for (const ratings of ratingsStore.values()) {
    const index = ratings.findIndex(r => r.id === ratingId);
    if (index !== -1) {
      const updated = {
        ...ratings[index],
        rating: rating !== undefined ? rating : ratings[index].rating,
        vote: vote !== undefined ? vote : ratings[index].vote,
        comment: comment !== undefined ? comment : ratings[index].comment,
        timestamp: Date.now()
      };

      ratings[index] = updated;

      // Invalidate cache
      const key = `${updated.targetType}-${updated.targetId}`;
      aggregatesCache.delete(key);

      // Update storage
      saveRatingToStorage(updated);

      return updated;
    }
  }

  return null;
}

/**
 * Delete a rating
 */
export function deleteRating(ratingId: string): boolean {
  for (const [key, ratings] of ratingsStore.entries()) {
    const index = ratings.findIndex(r => r.id === ratingId);
    if (index !== -1) {
      ratings.splice(index, 1);
      aggregatesCache.delete(key);
      removeRatingFromStorage(ratingId);
      return true;
    }
  }

  return false;
}

/**
 * Get aggregated ratings for a target
 */
export function getAggregateRating(targetId: string, targetType: RatingType): RatingAggregate {
  const key = `${targetType}-${targetId}`;

  // Check cache
  if (aggregatesCache.has(key)) {
    return aggregatesCache.get(key)!;
  }

  const ratings = getRatings(targetId, targetType);

  if (ratings.length === 0) {
    return {
      targetId,
      targetType,
      totalRatings: 0,
      averageRating: 0,
      thumbsUp: 0,
      thumbsDown: 0,
      neutral: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      lastUpdated: Date.now()
    };
  }

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRating = 0;
  let thumbsUp = 0;
  let thumbsDown = 0;
  let neutral = 0;

  ratings.forEach(rating => {
    distribution[rating.rating]++;
    totalRating += rating.rating;

    if (rating.vote === 'thumbs_up') thumbsUp++;
    else if (rating.vote === 'thumbs_down') thumbsDown++;
    else neutral++;
  });

  const aggregate: RatingAggregate = {
    targetId,
    targetType,
    totalRatings: ratings.length,
    averageRating: Math.round((totalRating / ratings.length) * 10) / 10,
    thumbsUp,
    thumbsDown,
    neutral,
    distribution,
    lastUpdated: Date.now()
  };

  aggregatesCache.set(key, aggregate);
  return aggregate;
}

/**
 * Get rating statistics
 */
export function getRatingStats(targetId: string, targetType: RatingType): RatingStats {
  const aggregate = getAggregateRating(targetId, targetType);

  // Determine sentiment
  const sentiment =
    aggregate.thumbsUp > aggregate.thumbsDown
      ? 'positive'
      : aggregate.thumbsDown > aggregate.thumbsUp
        ? 'negative'
        : 'neutral';

  // Determine trend (simplified)
  const trend = 'stable' as const; // Would need historical data for real trend

  return {
    targetId,
    rating: aggregate.averageRating,
    votes: aggregate.totalRatings,
    sentiment,
    trend
  };
}

/**
 * Get top-rated items
 */
export function getTopRated(
  targetType: RatingType,
  limit: number = 10,
  minRatings: number = 5
): RatingStats[] {
  const aggregates = Array.from(aggregatesCache.values())
    .filter(a => a.targetType === targetType && a.totalRatings >= minRatings)
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, limit);

  return aggregates.map(a => getRatingStats(a.targetId, targetType));
}

/**
 * Get lowest-rated items
 */
export function getLowestRated(
  targetType: RatingType,
  limit: number = 10,
  minRatings: number = 5
): RatingStats[] {
  const aggregates = Array.from(aggregatesCache.values())
    .filter(a => a.targetType === targetType && a.totalRatings >= minRatings)
    .sort((a, b) => a.averageRating - b.averageRating)
    .slice(0, limit);

  return aggregates.map(a => getRatingStats(a.targetId, targetType));
}

/**
 * Get most voted items
 */
export function getMostVoted(targetType: RatingType, limit: number = 10): RatingStats[] {
  const aggregates = Array.from(aggregatesCache.values())
    .filter(a => a.targetType === targetType)
    .sort((a, b) => b.totalRatings - a.totalRatings)
    .slice(0, limit);

  return aggregates.map(a => getRatingStats(a.targetId, targetType));
}

/**
 * Get user's ratings
 */
export function getUserRatings(userId: string): ListenerRating[] {
  const allRatings: ListenerRating[] = [];

  for (const ratings of ratingsStore.values()) {
    allRatings.push(...ratings.filter(r => r.userId === userId));
  }

  return allRatings.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Get rating distribution for visualization
 */
export function getRatingDistribution(targetId: string, targetType: RatingType) {
  const aggregate = getAggregateRating(targetId, targetType);

  return {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    data: [
      aggregate.distribution[1],
      aggregate.distribution[2],
      aggregate.distribution[3],
      aggregate.distribution[4],
      aggregate.distribution[5]
    ],
    total: aggregate.totalRatings
  };
}

/**
 * Save rating to localStorage
 */
function saveRatingToStorage(rating: ListenerRating): void {
  try {
    const key = `rating_${rating.id}`;
    localStorage.setItem(key, JSON.stringify(rating));
  } catch (error) {
    console.error('Error saving rating to storage:', error);
  }
}

/**
 * Remove rating from localStorage
 */
function removeRatingFromStorage(ratingId: string): void {
  try {
    const key = `rating_${ratingId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing rating from storage:', error);
  }
}

/**
 * Load ratings from localStorage
 */
export function loadRatingsFromStorage(): void {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('rating_')) {
        const ratingJson = localStorage.getItem(key);
        if (ratingJson) {
          const rating = JSON.parse(ratingJson) as ListenerRating;
          const storeKey = `${rating.targetType}-${rating.targetId}`;
          const existing = ratingsStore.get(storeKey) || [];
          ratingsStore.set(storeKey, [...existing, rating]);
        }
      }
    }
  } catch (error) {
    console.error('Error loading ratings from storage:', error);
  }
}

/**
 * Clear all ratings
 */
export function clearAllRatings(): void {
  ratingsStore.clear();
  aggregatesCache.clear();

  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith('rating_')) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error('Error clearing ratings:', error);
  }
}

/**
 * Export ratings as JSON
 */
export function exportRatingsAsJSON(): string {
  const allRatings: ListenerRating[] = [];

  for (const ratings of ratingsStore.values()) {
    allRatings.push(...ratings);
  }

  return JSON.stringify(allRatings, null, 2);
}

/**
 * Export ratings as CSV
 */
export function exportRatingsAsCSV(): string {
  const allRatings: ListenerRating[] = [];

  for (const ratings of ratingsStore.values()) {
    allRatings.push(...ratings);
  }

  const headers = ['User ID', 'Target ID', 'Type', 'Rating', 'Vote', 'Comment', 'Timestamp'];
  const rows = allRatings.map(r => [
    r.userId,
    r.targetId,
    r.targetType,
    r.rating,
    r.vote,
    r.comment || '',
    new Date(r.timestamp).toISOString()
  ]);

  const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');

  return csv;
}
