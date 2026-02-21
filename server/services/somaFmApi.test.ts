import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  fetchSomaFMChannels,
  getChannelListeners,
  getAllChannelListeners,
  clearCache,
} from './somaFmApi';

// Mock fetch
global.fetch = vi.fn();

describe('SomaFM API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCache();
  });

  describe('fetchSomaFMChannels', () => {
    it('should fetch channels from SomaFM API', async () => {
      const mockChannels = {
        channels: [
          {
            id: 'metal',
            title: 'Metal',
            dj: 'DJ Metal',
            description: 'Heavy metal music',
            genre: 'Metal',
            listeners: 1500,
            updated: Date.now(),
          },
          {
            id: 'jazz',
            title: 'Jazz',
            dj: 'DJ Jazz',
            description: 'Jazz music',
            genre: 'Jazz',
            listeners: 800,
            updated: Date.now(),
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockChannels,
      });

      const channels = await fetchSomaFMChannels();

      expect(channels).toHaveLength(2);
      expect(channels[0].id).toBe('metal');
      expect(channels[0].listeners).toBe(1500);
      expect(channels[1].id).toBe('jazz');
      expect(channels[1].listeners).toBe(800);
    });

    it('should return empty array on API error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const channels = await fetchSomaFMChannels();

      expect(channels).toEqual([]);
    });

    it('should return empty array on network error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const channels = await fetchSomaFMChannels();

      expect(channels).toEqual([]);
    });
  });

  describe('getChannelListeners', () => {
    it('should fetch listener count for a specific channel', async () => {
      const mockChannels = {
        channels: [
          {
            id: 'metal',
            title: 'Metal',
            dj: 'DJ Metal',
            description: 'Heavy metal music',
            genre: 'Metal',
            listeners: 2000,
            updated: Date.now(),
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockChannels,
      });

      const listeners = await getChannelListeners('metal');

      expect(listeners).toBe(2000);
    });

    it('should return 0 for non-existent channel', async () => {
      const mockChannels = {
        channels: [
          {
            id: 'metal',
            title: 'Metal',
            dj: 'DJ Metal',
            description: 'Heavy metal music',
            genre: 'Metal',
            listeners: 2000,
            updated: Date.now(),
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockChannels,
      });

      const listeners = await getChannelListeners('nonexistent');

      expect(listeners).toBe(0);
    });
  });

  describe('getAllChannelListeners', () => {
    it('should return all channels with listener counts', async () => {
      const mockChannels = {
        channels: [
          {
            id: 'metal',
            title: 'Metal',
            dj: 'DJ Metal',
            description: 'Heavy metal music',
            genre: 'Metal',
            listeners: 1500,
            updated: Date.now(),
          },
          {
            id: 'jazz',
            title: 'Jazz',
            dj: 'DJ Jazz',
            description: 'Jazz music',
            genre: 'Jazz',
            listeners: 800,
            updated: Date.now(),
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockChannels,
      });

      const listeners = await getAllChannelListeners();

      expect(listeners).toEqual({
        metal: 1500,
        jazz: 800,
      });
    });

    it('should return empty object on error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const listeners = await getAllChannelListeners();

      expect(listeners).toEqual({});
    });
  });
});
