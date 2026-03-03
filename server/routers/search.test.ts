import { describe, it, expect } from 'vitest';
import { searchRouter } from './search';

describe('Search Router', () => {
  describe('search procedure', () => {
    it('should return search results for valid query', async () => {
      const result = await searchRouter.createCaller({}).search({
        query: 'radio',
        category: 'all',
        limit: 10,
      });

      expect(result).toBeDefined();
      expect(result.query).toBe('radio');
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.totalResults).toBeGreaterThan(0);
    });

    it('should filter results by category', async () => {
      const rrbResults = await searchRouter.createCaller({}).search({
        query: 'music',
        category: 'rrb',
        limit: 10,
      });

      expect(rrbResults.results.every((r) => r.category === 'rrb')).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const result = await searchRouter.createCaller({}).search({
        query: 'broadcast',
        category: 'all',
        limit: 3,
      });

      expect(result.results.length).toBeLessThanOrEqual(3);
    });

    it('should be case-insensitive', async () => {
      const upperResult = await searchRouter.createCaller({}).search({
        query: 'RADIO',
        category: 'all',
        limit: 10,
      });

      const lowerResult = await searchRouter.createCaller({}).search({
        query: 'radio',
        category: 'all',
        limit: 10,
      });

      expect(upperResult.results.length).toBe(lowerResult.results.length);
    });

    it('should return empty results for non-matching query', async () => {
      const result = await searchRouter.createCaller({}).search({
        query: 'xyznonexistent',
        category: 'all',
        limit: 10,
      });

      expect(result.results.length).toBe(0);
    });
  });

  describe('getPopularSearches procedure', () => {
    it('should return popular search terms', async () => {
      const result = await searchRouter.createCaller({}).getPopularSearches();

      expect(result).toBeDefined();
      expect(Array.isArray(result.popular)).toBe(true);
      expect(result.popular.length).toBeGreaterThan(0);
    });
  });

  describe('getSuggestions procedure', () => {
    it('should return suggestions for partial query', async () => {
      const result = await searchRouter.createCaller({}).getSuggestions({
        query: 'rad',
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should limit suggestions to 5 results', async () => {
      const result = await searchRouter.createCaller({}).getSuggestions({
        query: 'a',
      });

      expect(result.suggestions.length).toBeLessThanOrEqual(5);
    });

    it('should include title, category, and url in suggestions', async () => {
      const result = await searchRouter.createCaller({}).getSuggestions({
        query: 'radio',
      });

      if (result.suggestions.length > 0) {
        const suggestion = result.suggestions[0];
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('category');
        expect(suggestion).toHaveProperty('url');
      }
    });
  });
});
