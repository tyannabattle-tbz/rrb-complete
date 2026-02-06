import { describe, it, expect, beforeEach } from 'vitest';
import { useAdvancedSearch, severityLevels, statusOptions, channelOptions, type SearchFilters } from './advancedSearch';

describe('Advanced Search', () => {
  beforeEach(() => {
    // Reset search state before each test
    useAdvancedSearch.setState({
      query: '',
      filters: {},
      results: [],
      isSearching: false,
    });
  });

  describe('Search Store', () => {
    it('should initialize with empty state', () => {
      const state = useAdvancedSearch.getState();
      expect(state.query).toBe('');
      expect(state.filters).toEqual({});
      expect(state.results).toEqual([]);
      expect(state.isSearching).toBe(false);
    });

    it('should set query', () => {
      useAdvancedSearch.getState().setQuery('emergency');
      expect(useAdvancedSearch.getState().query).toBe('emergency');
    });

    it('should set filters', () => {
      const filters: SearchFilters = {
        severity: 'critical',
        status: 'delivered',
      };
      useAdvancedSearch.getState().setFilters(filters);
      expect(useAdvancedSearch.getState().filters).toEqual(filters);
    });

    it('should clear search', () => {
      useAdvancedSearch.setState({
        query: 'test',
        results: [
          {
            id: '1',
            title: 'Test',
            content: 'Test content',
            severity: 'high',
            channels: ['SMS'],
            status: 'sent',
            createdAt: new Date(),
            relevance: 0.9,
          },
        ],
      });

      useAdvancedSearch.getState().clearSearch();
      const state = useAdvancedSearch.getState();
      expect(state.query).toBe('');
      expect(state.results).toEqual([]);
      expect(state.isSearching).toBe(false);
    });
  });

  describe('Search Function', () => {
    it('should search and return results', async () => {
      const results = await useAdvancedSearch.getState().search('emergency');
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return results with relevance scores', async () => {
      const results = await useAdvancedSearch.getState().search('emergency');
      results.forEach((result) => {
        expect(result.relevance).toBeGreaterThanOrEqual(0);
        expect(result.relevance).toBeLessThanOrEqual(1);
      });
    });

    it('should filter by severity', async () => {
      const filters: SearchFilters = {
        severity: 'critical',
      };
      const results = await useAdvancedSearch.getState().search('alert', filters);
      results.forEach((result) => {
        expect(result.severity).toBe('critical');
      });
    });

    it('should filter by status', async () => {
      const filters: SearchFilters = {
        status: 'delivered',
      };
      const results = await useAdvancedSearch.getState().search('', filters);
      results.forEach((result) => {
        expect(result.status).toBe('delivered');
      });
    });

    it('should filter by channels', async () => {
      const filters: SearchFilters = {
        channels: ['SMS', 'Email'],
      };
      const results = await useAdvancedSearch.getState().search('', filters);
      results.forEach((result) => {
        const hasChannel = result.channels.some((ch) => filters.channels?.includes(ch));
        expect(hasChannel).toBe(true);
      });
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2026-02-01');
      const endDate = new Date('2026-02-07');
      const filters: SearchFilters = {
        dateRange: {
          start: startDate,
          end: endDate,
        },
      };
      const results = await useAdvancedSearch.getState().search('', filters);
      results.forEach((result) => {
        expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(result.createdAt.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });

    it('should combine multiple filters', async () => {
      const filters: SearchFilters = {
        severity: 'critical',
        status: 'delivered',
        channels: ['SMS'],
      };
      const results = await useAdvancedSearch.getState().search('', filters);
      results.forEach((result) => {
        expect(result.severity).toBe('critical');
        expect(result.status).toBe('delivered');
        expect(result.channels.some((ch) => filters.channels?.includes(ch))).toBe(true);
      });
    });

    it('should sort results by relevance', async () => {
      const results = await useAdvancedSearch.getState().search('emergency');
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].relevance).toBeGreaterThanOrEqual(results[i].relevance);
      }
    });

    it('should return empty results for non-matching query', async () => {
      const results = await useAdvancedSearch.getState().search('xyznonexistent123');
      expect(results).toEqual([]);
    });
  });

  describe('Severity Levels', () => {
    it('should have 4 severity levels', () => {
      expect(severityLevels).toHaveLength(4);
    });

    it('should have required properties', () => {
      severityLevels.forEach((level) => {
        expect(level).toHaveProperty('value');
        expect(level).toHaveProperty('label');
        expect(level).toHaveProperty('color');
      });
    });

    it('should include critical severity', () => {
      const critical = severityLevels.find((l) => l.value === 'critical');
      expect(critical).toBeDefined();
      expect(critical?.label).toBe('Critical');
    });

    it('should have unique values', () => {
      const values = severityLevels.map((l) => l.value);
      const uniqueValues = new Set(values);
      expect(values).toHaveLength(uniqueValues.size);
    });
  });

  describe('Status Options', () => {
    it('should have 4 status options', () => {
      expect(statusOptions).toHaveLength(4);
    });

    it('should include pending, sent, delivered, and failed', () => {
      const values = statusOptions.map((s) => s.value);
      expect(values).toContain('pending');
      expect(values).toContain('sent');
      expect(values).toContain('delivered');
      expect(values).toContain('failed');
    });

    it('should have required properties', () => {
      statusOptions.forEach((option) => {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
      });
    });
  });

  describe('Channel Options', () => {
    it('should have 5 channel options', () => {
      expect(channelOptions).toHaveLength(5);
    });

    it('should include SMS, Email, Push, Voice, and Siren', () => {
      const values = channelOptions.map((c) => c.value);
      expect(values).toContain('SMS');
      expect(values).toContain('Email');
      expect(values).toContain('Push');
      expect(values).toContain('Voice');
      expect(values).toContain('Siren');
    });

    it('should have required properties', () => {
      channelOptions.forEach((option) => {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
      });
    });
  });

  describe('Search Results', () => {
    it('should have required properties', async () => {
      const results = await useAdvancedSearch.getState().search('emergency');
      results.forEach((result) => {
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('content');
        expect(result).toHaveProperty('severity');
        expect(result).toHaveProperty('channels');
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('createdAt');
        expect(result).toHaveProperty('relevance');
      });
    });

    it('should have valid data types', async () => {
      const results = await useAdvancedSearch.getState().search('emergency');
      results.forEach((result) => {
        expect(typeof result.id).toBe('string');
        expect(typeof result.title).toBe('string');
        expect(typeof result.content).toBe('string');
        expect(typeof result.severity).toBe('string');
        expect(Array.isArray(result.channels)).toBe(true);
        expect(typeof result.status).toBe('string');
        expect(result.createdAt instanceof Date).toBe(true);
        expect(typeof result.relevance).toBe('number');
      });
    });
  });
});
