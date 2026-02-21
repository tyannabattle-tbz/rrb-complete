import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StreamProxyService } from './streamProxy';

describe('StreamProxyService', () => {
  describe('validateStream', () => {
    it('should return true for valid stream URLs', async () => {
      // Mock fetch for valid stream
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
      });

      const result = await StreamProxyService.validateStream('https://ice1.somafm.com/metal-128-mp3');
      expect(result).toBe(true);
    });

    it('should return false for invalid stream URLs', async () => {
      // Mock fetch for invalid stream
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await StreamProxyService.validateStream('https://invalid.example.com/stream');
      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      // Mock fetch error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await StreamProxyService.validateStream('https://example.com/stream');
      expect(result).toBe(false);
    });

    it('should use correct headers for validation', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true });

      await StreamProxyService.validateStream('https://ice1.somafm.com/metal-128-mp3');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://ice1.somafm.com/metal-128-mp3',
        expect.objectContaining({
          method: 'HEAD',
          headers: expect.objectContaining({
            'User-Agent': expect.any(String),
          }),
        })
      );
    });
  });

  describe('proxyStreamToResponse', () => {
    let mockResponse: any;
    let mockStreamResponse: any;

    beforeEach(() => {
      mockResponse = {
        setHeader: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
        headersSent: false,
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      mockStreamResponse = {
        ok: true,
        statusText: 'OK',
        headers: new Map([
          ['content-type', 'audio/mpeg'],
          ['icy-metaint', '16000'],
        ]),
        body: {
          getReader: vi.fn().mockReturnValue({
            read: vi.fn().mockResolvedValue({ done: true }),
            releaseLock: vi.fn(),
          }),
        },
      };

      global.fetch = vi.fn().mockResolvedValue(mockStreamResponse);
    });

    it('should set correct response headers for audio streaming', async () => {
      await StreamProxyService.proxyStreamToResponse('https://ice1.somafm.com/metal-128-mp3', mockResponse);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'audio/mpeg');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Accept-Ranges', 'bytes');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    });

    it('should forward Icecast metadata headers', async () => {
      await StreamProxyService.proxyStreamToResponse('https://ice1.somafm.com/metal-128-mp3', mockResponse);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('icy-metaint', '16000');
    });

    it('should end response after streaming completes', async () => {
      await StreamProxyService.proxyStreamToResponse('https://ice1.somafm.com/metal-128-mp3', mockResponse);

      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should handle stream errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Stream error'));

      await StreamProxyService.proxyStreamToResponse('https://invalid.example.com/stream', mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
        })
      );
    });

    it('should handle failed stream requests', async () => {
      mockStreamResponse.ok = false;
      mockStreamResponse.statusText = 'Not Found';

      await StreamProxyService.proxyStreamToResponse('https://invalid.example.com/stream', mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it('should use correct User-Agent header', async () => {
      await StreamProxyService.proxyStreamToResponse('https://ice1.somafm.com/metal-128-mp3', mockResponse);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://ice1.somafm.com/metal-128-mp3',
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': expect.stringContaining('Mozilla'),
          }),
        })
      );
    });
  });
});
