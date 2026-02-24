/**
 * Stream Router Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { streamRouter } from './streamRouter';
import * as streamProxyService from '../services/streamProxyService';
import * as streamFallbackService from '../services/streamFallbackService';

// Mock the services
vi.mock('../services/streamProxyService');
vi.mock('../services/streamFallbackService');

describe('streamRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkHealth procedure', () => {
    it('should check stream health', async () => {
      vi.mocked(streamProxyService.StreamProxyService.checkStreamHealth).mockResolvedValue(true);

      const caller = streamRouter.createCaller({} as any);
      const result = await caller.checkHealth({ url: 'https://example.com/stream' });

      expect(result.healthy).toBe(true);
      expect(result.url).toBe('https://example.com/stream');
    });

    it('should handle unhealthy streams', async () => {
      vi.mocked(streamProxyService.StreamProxyService.checkStreamHealth).mockResolvedValue(false);

      const caller = streamRouter.createCaller({} as any);
      const result = await caller.checkHealth({ url: 'https://example.com/stream' });

      expect(result.healthy).toBe(false);
    });
  });

  describe('getMetadata procedure', () => {
    it('should get stream metadata', async () => {
      const mockMetadata = {
        contentType: 'audio/mpeg',
        bitrate: '128',
        genre: 'Rock',
        name: 'Test Stream',
        description: 'Test Description',
        url: 'https://example.com',
      };
      vi.mocked(streamProxyService.StreamProxyService.getStreamMetadata).mockResolvedValue(mockMetadata);

      const caller = streamRouter.createCaller({} as any);
      const result = await caller.getMetadata({ url: 'https://example.com/stream' });

      expect(result).toEqual(mockMetadata);
    });

    it('should handle metadata fetch errors', async () => {
      vi.mocked(streamProxyService.StreamProxyService.getStreamMetadata).mockResolvedValue(null);

      const caller = streamRouter.createCaller({} as any);
      const result = await caller.getMetadata({ url: 'https://example.com/stream' });

      expect(result).toEqual({ error: 'Could not fetch metadata' });
    });
  });

  describe('verify procedure', () => {
    it('should verify accessible streams', async () => {
      vi.mocked(streamProxyService.StreamProxyService.checkStreamHealth).mockResolvedValue(true);
      vi.mocked(streamProxyService.StreamProxyService.getStreamMetadata).mockResolvedValue({
        contentType: 'audio/mpeg',
        bitrate: '128',
        genre: 'Rock',
        name: 'Test Stream',
        description: 'Test',
        url: 'https://example.com',
      });

      const caller = streamRouter.createCaller({} as any);
      const result = await caller.verify({ url: 'https://example.com/stream' });

      expect(result.accessible).toBe(true);
      expect(result.metadata).toBeDefined();
      expect(result.url).toBe('https://example.com/stream');
    });

    it('should verify inaccessible streams', async () => {
      vi.mocked(streamProxyService.StreamProxyService.checkStreamHealth).mockResolvedValue(false);

      const caller = streamRouter.createCaller({} as any);
      const result = await caller.verify({ url: 'https://example.com/stream' });

      expect(result.accessible).toBe(false);
    });
  });

  describe('getBestStream procedure', () => {
    it('should get best available stream', async () => {
      const mockResult = {
        url: 'https://example.com/stream',
        format: 'mp3',
        isHealthy: true,
        isFallback: false,
      };
      vi.mocked(streamFallbackService.StreamFallbackService.getBestStream).mockResolvedValue(mockResult);

      const caller = streamRouter.createCaller({} as any);
      const result = await caller.getBestStream({ channelId: 'test-channel' });

      expect(result).toEqual(mockResult);
    });

    it('should handle fallback streams', async () => {
      const mockResult = {
        url: 'https://example.com/fallback',
        format: 'aac',
        isHealthy: true,
        isFallback: true,
        fallbackIndex: 0,
      };
      vi.mocked(streamFallbackService.StreamFallbackService.getBestStream).mockResolvedValue(mockResult);

      const caller = streamRouter.createCaller({} as any);
      const result = await caller.getBestStream({ channelId: 'test-channel' });

      expect(result.isFallback).toBe(true);
      expect(result.fallbackIndex).toBe(0);
    });
  });

  describe('getChannels procedure', () => {
    it('should return all channels', async () => {
      const mockChannels = ['rockin-rockin-boogie', 'blues-hour', 'jazz-essentials'];
      vi.mocked(streamFallbackService.StreamFallbackService.getChannels).mockReturnValue(mockChannels);

      const caller = streamRouter.createCaller({} as any);
      const result = await caller.getChannels();

      expect(result).toEqual(mockChannels);
      expect(result.length).toBe(3);
    });
  });

  describe('getChannelConfig procedure', () => {
    it('should return channel configuration', async () => {
      const mockConfig = {
        primary: {
          url: 'https://example.com/primary',
          format: 'mp3',
          bitrate: 128,
        },
        fallbacks: [
          {
            url: 'https://example.com/fallback',
            format: 'aac',
            bitrate: 128,
          },
        ],
      };
      vi.mocked(streamFallbackService.StreamFallbackService.getChannelConfig).mockReturnValue(mockConfig);

      const caller = streamRouter.createCaller({} as any);
      const result = await caller.getChannelConfig({ channelId: 'test-channel' });

      expect(result).toEqual(mockConfig);
    });

    it('should return null for unknown channels', async () => {
      vi.mocked(streamFallbackService.StreamFallbackService.getChannelConfig).mockReturnValue(null);

      const caller = streamRouter.createCaller({} as any);
      const result = await caller.getChannelConfig({ channelId: 'unknown' });

      expect(result).toBeNull();
    });
  });

  describe('getCacheStats procedure', () => {
    it('should return cache statistics', async () => {
      const mockStats = {
        size: 5,
        entries: [
          {
            url: 'https://example.com/stream1',
            healthy: true,
            age: 1000,
          },
          {
            url: 'https://example.com/stream2',
            healthy: false,
            age: 2000,
          },
        ],
      };
      vi.mocked(streamFallbackService.StreamFallbackService.getCacheStats).mockReturnValue(mockStats);

      const caller = streamRouter.createCaller({} as any);
      const result = await caller.getCacheStats();

      expect(result.size).toBe(5);
      expect(result.entries.length).toBe(2);
    });
  });

  describe('clearCache mutation', () => {
    it('should clear specific URL from cache', async () => {
      vi.mocked(streamFallbackService.StreamFallbackService.clearCache).mockImplementation(() => {});

      const caller = streamRouter.createCaller({} as any);
      const result = await caller.clearCache({ url: 'https://example.com/stream' });

      expect(result.success).toBe(true);
      expect(vi.mocked(streamFallbackService.StreamFallbackService.clearCache)).toHaveBeenCalledWith('https://example.com/stream');
    });

    it('should clear all cache when no URL specified', async () => {
      vi.mocked(streamFallbackService.StreamFallbackService.clearCache).mockImplementation(() => {});

      const caller = streamRouter.createCaller({} as any);
      const result = await caller.clearCache({});

      expect(result.success).toBe(true);
      expect(vi.mocked(streamFallbackService.StreamFallbackService.clearCache)).toHaveBeenCalledWith(undefined);
    });
  });
});
