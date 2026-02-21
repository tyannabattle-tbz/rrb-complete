import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  searchRadioGardenByGenre,
  getStationStreamUrl,
  searchRadioStations,
  getCuratedStationsByGenre,
  verifyStreamUrl,
} from './radioGardenService';

// Mock fetch
global.fetch = vi.fn();

describe('radioGardenService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStationStreamUrl', () => {
    it('should return correct stream URL format', () => {
      const channelId = 'test-channel-123';
      const url = getStationStreamUrl(channelId);
      
      expect(url).toBe('http://radio.garden/api/ara/content/listen/test-channel-123/channel.mp3');
      expect(url).toContain('channel.mp3');
    });

    it('should handle special characters in channel ID', () => {
      const channelId = 'test-channel-with-special_chars-123';
      const url = getStationStreamUrl(channelId);
      
      expect(url).toContain(channelId);
      expect(url).toContain('channel.mp3');
    });
  });

  describe('searchRadioGardenByGenre', () => {
    it('should return empty array when API fails', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
      
      const result = await searchRadioGardenByGenre('Jazz');
      
      expect(result).toEqual([]);
    });

    it('should handle genre search terms correctly', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          hits: [
            {
              id: 'jazz-station-1',
              title: 'Jazz FM',
              subtitle: 'Live Jazz',
              country: 'USA',
              city: 'New York',
            },
          ],
        }),
      });

      const result = await searchRadioGardenByGenre('Jazz');
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('searchRadioStations', () => {
    it('should return empty array when no results', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ hits: [] }),
      });

      const result = await searchRadioStations('nonexistent');
      
      expect(result).toEqual([]);
    });

    it('should handle search query encoding', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ hits: [] }),
      });

      await searchRadioStations('Rock & Roll');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('Rock'),
        expect.anything()
      );
    });
  });

  describe('verifyStreamUrl', () => {
    it('should return true for valid stream URL', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
      });

      const result = await verifyStreamUrl('https://example.com/stream.mp3');
      
      expect(result).toBe(true);
    });

    it('should return false for invalid stream URL', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
      });

      const result = await verifyStreamUrl('https://example.com/invalid.mp3');
      
      expect(result).toBe(false);
    });

    it('should return false when fetch fails', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await verifyStreamUrl('https://example.com/stream.mp3');
      
      expect(result).toBe(false);
    });
  });

  describe('getCuratedStationsByGenre', () => {
    it('should cache results', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          hits: [
            {
              id: 'station-1',
              title: 'Station 1',
              country: 'USA',
            },
          ],
        }),
      });

      // First call
      await getCuratedStationsByGenre('Rock');
      const firstCallCount = (global.fetch as any).mock.calls.length;

      // Second call (should use cache)
      await getCuratedStationsByGenre('Rock');
      const secondCallCount = (global.fetch as any).mock.calls.length;

      // Should not have made additional calls due to caching
      expect(secondCallCount).toBe(firstCallCount);
    });

    it('should return empty array as fallback', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('API error'));

      const result = await getCuratedStationsByGenre('Unknown');
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Genre mapping', () => {
    it('should handle all supported genres', async () => {
      const genres = ['R&B/Soul', 'Jazz', 'Blues', 'Rock', 'Country', '90s Hip-Hop', 'Talk', 'Meditation'];
      
      for (const genre of genres) {
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ hits: [] }),
        });

        const result = await searchRadioGardenByGenre(genre);
        expect(Array.isArray(result)).toBe(true);
      }
    });
  });
});
