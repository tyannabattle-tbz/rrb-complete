/**
 * Stream Fallback Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StreamFallbackService, STREAM_FALLBACK_CONFIG } from './streamFallbackService';
import * as streamProxyService from './streamProxyService';

// Mock the StreamProxyService
vi.mock('./streamProxyService', () => ({
  StreamProxyService: {
    checkStreamHealth: vi.fn(),
    getStreamMetadata: vi.fn(),
  },
}));

describe('StreamFallbackService', () => {
  beforeEach(() => {
    // Clear cache before each test
    StreamFallbackService.clearCache();
    vi.clearAllMocks();
  });

  describe('getBestStream', () => {
    it('should return primary stream when healthy', async () => {
      const mockCheckHealth = vi.spyOn(streamProxyService.StreamProxyService, 'checkStreamHealth');
      mockCheckHealth.mockResolvedValueOnce(true);

      const result = await StreamFallbackService.getBestStream('rockin-rockin-boogie');

      expect(result.url).toBe('https://stream.radioparadise.com/aac-128');
      expect(result.isFallback).toBe(false);
      expect(result.isHealthy).toBe(true);
    });

    it('should return fallback stream when primary fails', async () => {
      const mockCheckHealth = vi.spyOn(streamProxyService.StreamProxyService, 'checkStreamHealth');
      // Primary fails, first fallback succeeds
      mockCheckHealth
        .mockResolvedValueOnce(false) // primary
        .mockResolvedValueOnce(true); // first fallback

      const result = await StreamFallbackService.getBestStream('rockin-rockin-boogie');

      expect(result.url).toBe('https://stream.radioparadise.com/mp3-128');
      expect(result.isFallback).toBe(true);
      expect(result.fallbackIndex).toBe(0);
      expect(result.isHealthy).toBe(true);
    });

    it('should try all fallbacks before returning unhealthy primary', async () => {
      const mockCheckHealth = vi.spyOn(streamProxyService.StreamProxyService, 'checkStreamHealth');
      // All streams fail
      mockCheckHealth.mockResolvedValue(false);

      const result = await StreamFallbackService.getBestStream('rockin-rockin-boogie');

      expect(result.url).toBe('https://stream.radioparadise.com/aac-128');
      expect(result.isFallback).toBe(false);
      expect(result.isHealthy).toBe(false);
    });

    it('should return empty result for unknown channel', async () => {
      const result = await StreamFallbackService.getBestStream('unknown-channel');

      expect(result.url).toBe('');
      expect(result.isHealthy).toBe(false);
    });

    it('should cache health check results', async () => {
      const mockCheckHealth = vi.spyOn(streamProxyService.StreamProxyService, 'checkStreamHealth');
      mockCheckHealth.mockResolvedValue(true);

      // First call
      await StreamFallbackService.getBestStream('rockin-rockin-boogie');
      expect(mockCheckHealth).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await StreamFallbackService.getBestStream('rockin-rockin-boogie');
      expect(mockCheckHealth).toHaveBeenCalledTimes(1); // Still 1, not 2
    });
  });

  describe('checkStreamHealth', () => {
    it('should check stream health', async () => {
      const mockCheckHealth = vi.spyOn(streamProxyService.StreamProxyService, 'checkStreamHealth');
      mockCheckHealth.mockResolvedValue(true);

      const result = await StreamFallbackService.checkStreamHealth('https://example.com/stream');

      expect(result).toBe(true);
      expect(mockCheckHealth).toHaveBeenCalledWith('https://example.com/stream');
    });

    it('should cache health check results', async () => {
      const mockCheckHealth = vi.spyOn(streamProxyService.StreamProxyService, 'checkStreamHealth');
      mockCheckHealth.mockResolvedValue(true);

      // First call
      await StreamFallbackService.checkStreamHealth('https://example.com/stream');
      expect(mockCheckHealth).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await StreamFallbackService.checkStreamHealth('https://example.com/stream');
      expect(mockCheckHealth).toHaveBeenCalledTimes(1); // Still 1
    });
  });

  describe('clearCache', () => {
    it('should clear specific URL from cache', async () => {
      const mockCheckHealth = vi.spyOn(streamProxyService.StreamProxyService, 'checkStreamHealth');
      mockCheckHealth.mockResolvedValue(true);

      const url = 'https://example.com/stream';

      // Populate cache
      await StreamFallbackService.checkStreamHealth(url);
      expect(mockCheckHealth).toHaveBeenCalledTimes(1);

      // Clear cache
      StreamFallbackService.clearCache(url);

      // Next call should hit the service again
      await StreamFallbackService.checkStreamHealth(url);
      expect(mockCheckHealth).toHaveBeenCalledTimes(2);
    });

    it('should clear all cache when no URL specified', async () => {
      const mockCheckHealth = vi.spyOn(streamProxyService.StreamProxyService, 'checkStreamHealth');
      mockCheckHealth.mockResolvedValue(true);

      // Populate cache with multiple URLs
      await StreamFallbackService.checkStreamHealth('https://example.com/stream1');
      await StreamFallbackService.checkStreamHealth('https://example.com/stream2');
      expect(mockCheckHealth).toHaveBeenCalledTimes(2);

      // Clear all cache
      StreamFallbackService.clearCache();

      // Next calls should hit the service again
      await StreamFallbackService.checkStreamHealth('https://example.com/stream1');
      await StreamFallbackService.checkStreamHealth('https://example.com/stream2');
      expect(mockCheckHealth).toHaveBeenCalledTimes(4);
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      const mockCheckHealth = vi.spyOn(streamProxyService.StreamProxyService, 'checkStreamHealth');
      mockCheckHealth.mockResolvedValue(true);

      // Populate cache
      await StreamFallbackService.checkStreamHealth('https://example.com/stream1');
      await StreamFallbackService.checkStreamHealth('https://example.com/stream2');

      const stats = StreamFallbackService.getCacheStats();

      expect(stats.size).toBe(2);
      expect(stats.entries).toHaveLength(2);
      expect(stats.entries[0]).toHaveProperty('url');
      expect(stats.entries[0]).toHaveProperty('healthy');
      expect(stats.entries[0]).toHaveProperty('age');
    });
  });

  describe('registerChannel', () => {
    it('should register a new channel', () => {
      const newChannel = {
        primary: {
          url: 'https://example.com/primary',
          format: 'mp3',
          bitrate: 128,
        },
        fallbacks: [
          {
            url: 'https://example.com/fallback1',
            format: 'aac',
            bitrate: 128,
          },
        ],
      };

      StreamFallbackService.registerChannel('test-channel', newChannel);

      const config = StreamFallbackService.getChannelConfig('test-channel');
      expect(config).toEqual(newChannel);
    });
  });

  describe('getChannels', () => {
    it('should return all registered channels', () => {
      const channels = StreamFallbackService.getChannels();

      expect(channels).toContain('rockin-rockin-boogie');
      expect(channels).toContain('blues-hour');
      expect(channels).toContain('jazz-essentials');
      expect(channels.length).toBeGreaterThan(0);
    });
  });

  describe('getChannelConfig', () => {
    it('should return channel configuration', () => {
      const config = StreamFallbackService.getChannelConfig('rockin-rockin-boogie');

      expect(config).toBeDefined();
      expect(config?.primary).toBeDefined();
      expect(config?.fallbacks).toBeDefined();
      expect(config?.fallbacks.length).toBeGreaterThan(0);
    });

    it('should return null for unknown channel', () => {
      const config = StreamFallbackService.getChannelConfig('unknown-channel');

      expect(config).toBeNull();
    });
  });
});
