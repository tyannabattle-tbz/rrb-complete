import { describe, it, expect, beforeEach } from 'vitest';
import {
  submitRating,
  getRatings,
  getUserRating,
  updateRating,
  deleteRating,
  getAggregateRating,
  getRatingStats,
  getTopRated,
  getLowestRated,
  getMostVoted,
  getUserRatings,
  getRatingDistribution,
  clearAllRatings,
  exportRatingsAsJSON,
  exportRatingsAsCSV,
  loadRatingsFromStorage
} from './listenerRatingService';

describe('Listener Rating Service', () => {
  beforeEach(() => {
    clearAllRatings();
    localStorage.clear();
  });

  describe('submitRating', () => {
    it('should submit a valid rating', () => {
      const rating = submitRating('user1', 'stream1', 'stream', 5, 'thumbs_up', 'Great stream!');

      expect(rating).toBeDefined();
      expect(rating.userId).toBe('user1');
      expect(rating.targetId).toBe('stream1');
      expect(rating.rating).toBe(5);
      expect(rating.vote).toBe('thumbs_up');
      expect(rating.comment).toBe('Great stream!');
    });

    it('should reject invalid ratings', () => {
      expect(() => submitRating('user1', 'stream1', 'stream', 0, 'thumbs_up')).toThrow();
      expect(() => submitRating('user1', 'stream1', 'stream', 6, 'thumbs_up')).toThrow();
    });

    it('should save rating to localStorage', () => {
      submitRating('user1', 'stream1', 'stream', 4, 'thumbs_up');

      const stored = localStorage.getItem(/rating_/);
      expect(stored).toBeDefined();
    });
  });

  describe('getRatings', () => {
    it('should retrieve all ratings for a target', () => {
      submitRating('user1', 'stream1', 'stream', 5, 'thumbs_up');
      submitRating('user2', 'stream1', 'stream', 4, 'thumbs_up');

      const ratings = getRatings('stream1', 'stream');
      expect(ratings.length).toBe(2);
    });

    it('should return empty array for unrated target', () => {
      const ratings = getRatings('nonexistent', 'stream');
      expect(ratings).toEqual([]);
    });
  });

  describe('getUserRating', () => {
    it('should retrieve user rating for a target', () => {
      submitRating('user1', 'stream1', 'stream', 5, 'thumbs_up');

      const rating = getUserRating('user1', 'stream1', 'stream');
      expect(rating).toBeDefined();
      expect(rating?.rating).toBe(5);
    });

    it('should return null if user has not rated', () => {
      const rating = getUserRating('user1', 'stream1', 'stream');
      expect(rating).toBeNull();
    });
  });

  describe('updateRating', () => {
    it('should update an existing rating', () => {
      const original = submitRating('user1', 'stream1', 'stream', 3, 'neutral');
      const updated = updateRating(original.id, 5, 'thumbs_up', 'Updated comment');

      expect(updated).toBeDefined();
      expect(updated?.rating).toBe(5);
      expect(updated?.vote).toBe('thumbs_up');
      expect(updated?.comment).toBe('Updated comment');
    });

    it('should return null for non-existent rating', () => {
      const updated = updateRating('nonexistent-id', 5);
      expect(updated).toBeNull();
    });
  });

  describe('deleteRating', () => {
    it('should delete a rating', () => {
      const rating = submitRating('user1', 'stream1', 'stream', 5, 'thumbs_up');
      const deleted = deleteRating(rating.id);

      expect(deleted).toBe(true);
      expect(getRatings('stream1', 'stream')).toHaveLength(0);
    });

    it('should return false for non-existent rating', () => {
      const deleted = deleteRating('nonexistent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('getAggregateRating', () => {
    it('should calculate aggregate rating', () => {
      submitRating('user1', 'stream1', 'stream', 5, 'thumbs_up');
      submitRating('user2', 'stream1', 'stream', 3, 'neutral');
      submitRating('user3', 'stream1', 'stream', 4, 'thumbs_up');

      const aggregate = getAggregateRating('stream1', 'stream');

      expect(aggregate.totalRatings).toBe(3);
      expect(aggregate.averageRating).toBe(4);
      expect(aggregate.thumbsUp).toBe(2);
      expect(aggregate.neutral).toBe(1);
    });

    it('should return zero values for unrated target', () => {
      const aggregate = getAggregateRating('nonexistent', 'stream');

      expect(aggregate.totalRatings).toBe(0);
      expect(aggregate.averageRating).toBe(0);
      expect(aggregate.thumbsUp).toBe(0);
    });

    it('should track rating distribution', () => {
      submitRating('user1', 'stream1', 'stream', 1, 'thumbs_down');
      submitRating('user2', 'stream1', 'stream', 5, 'thumbs_up');

      const aggregate = getAggregateRating('stream1', 'stream');

      expect(aggregate.distribution[1]).toBe(1);
      expect(aggregate.distribution[5]).toBe(1);
    });
  });

  describe('getRatingStats', () => {
    it('should calculate rating statistics', () => {
      submitRating('user1', 'stream1', 'stream', 5, 'thumbs_up');
      submitRating('user2', 'stream1', 'stream', 4, 'thumbs_up');

      const stats = getRatingStats('stream1', 'stream');

      expect(stats.rating).toBeGreaterThan(0);
      expect(stats.votes).toBe(2);
      expect(stats.sentiment).toBe('positive');
    });

    it('should detect negative sentiment', () => {
      submitRating('user1', 'stream1', 'stream', 1, 'thumbs_down');
      submitRating('user2', 'stream1', 'stream', 2, 'thumbs_down');

      const stats = getRatingStats('stream1', 'stream');
      expect(stats.sentiment).toBe('negative');
    });
  });

  describe('getTopRated', () => {
    it('should return top-rated items', () => {
      submitRating('user1', 'stream1', 'stream', 5, 'thumbs_up');
      submitRating('user2', 'stream1', 'stream', 5, 'thumbs_up');
      submitRating('user3', 'stream2', 'stream', 3, 'neutral');

      const topRated = getTopRated('stream', 10, 1);

      expect(topRated.length).toBeGreaterThan(0);
      expect(topRated[0].rating).toBeGreaterThanOrEqual(topRated[topRated.length - 1].rating);
    });

    it('should respect minimum ratings threshold', () => {
      submitRating('user1', 'stream1', 'stream', 5, 'thumbs_up');

      const topRated = getTopRated('stream', 10, 5);
      expect(topRated.length).toBe(0);
    });
  });

  describe('getLowestRated', () => {
    it('should return lowest-rated items', () => {
      submitRating('user1', 'stream1', 'stream', 5, 'thumbs_up');
      submitRating('user2', 'stream2', 'stream', 1, 'thumbs_down');
      submitRating('user3', 'stream2', 'stream', 2, 'thumbs_down');

      const lowestRated = getLowestRated('stream', 10, 1);

      expect(lowestRated.length).toBeGreaterThan(0);
      expect(lowestRated[0].rating).toBeLessThanOrEqual(lowestRated[lowestRated.length - 1].rating);
    });
  });

  describe('getMostVoted', () => {
    it('should return most voted items', () => {
      submitRating('user1', 'stream1', 'stream', 5, 'thumbs_up');
      submitRating('user2', 'stream1', 'stream', 4, 'thumbs_up');
      submitRating('user3', 'stream1', 'stream', 5, 'thumbs_up');
      submitRating('user4', 'stream2', 'stream', 3, 'neutral');

      const mostVoted = getMostVoted('stream', 10);

      expect(mostVoted.length).toBeGreaterThan(0);
      expect(mostVoted[0].votes).toBeGreaterThanOrEqual(mostVoted[mostVoted.length - 1].votes);
    });
  });

  describe('getUserRatings', () => {
    it('should retrieve all ratings by a user', () => {
      submitRating('user1', 'stream1', 'stream', 5, 'thumbs_up');
      submitRating('user1', 'stream2', 'stream', 4, 'thumbs_up');
      submitRating('user2', 'stream3', 'stream', 3, 'neutral');

      const userRatings = getUserRatings('user1');

      expect(userRatings.length).toBe(2);
      expect(userRatings.every(r => r.userId === 'user1')).toBe(true);
    });

    it('should return empty array for user with no ratings', () => {
      const userRatings = getUserRatings('user-no-ratings');
      expect(userRatings).toEqual([]);
    });
  });

  describe('getRatingDistribution', () => {
    it('should calculate rating distribution', () => {
      submitRating('user1', 'stream1', 'stream', 1, 'thumbs_down');
      submitRating('user2', 'stream1', 'stream', 3, 'neutral');
      submitRating('user3', 'stream1', 'stream', 5, 'thumbs_up');

      const distribution = getRatingDistribution('stream1', 'stream');

      expect(distribution.labels.length).toBe(5);
      expect(distribution.data.length).toBe(5);
      expect(distribution.total).toBe(3);
    });
  });

  describe('clearAllRatings', () => {
    it('should clear all ratings', () => {
      submitRating('user1', 'stream1', 'stream', 5, 'thumbs_up');
      submitRating('user2', 'stream2', 'stream', 4, 'thumbs_up');

      clearAllRatings();

      expect(getRatings('stream1', 'stream')).toEqual([]);
      expect(getRatings('stream2', 'stream')).toEqual([]);
    });
  });

  describe('exportRatingsAsJSON', () => {
    it('should export ratings as JSON', () => {
      submitRating('user1', 'stream1', 'stream', 5, 'thumbs_up');

      const json = exportRatingsAsJSON();
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThan(0);
    });
  });

  describe('exportRatingsAsCSV', () => {
    it('should export ratings as CSV', () => {
      submitRating('user1', 'stream1', 'stream', 5, 'thumbs_up', 'Great!');

      const csv = exportRatingsAsCSV();

      expect(csv).toContain('User ID');
      expect(csv).toContain('Target ID');
      expect(csv).toContain('user1');
      expect(csv).toContain('stream1');
    });
  });
});
