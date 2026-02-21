import { describe, it, expect } from 'vitest';
import { HLSStreamConverter } from './hlsStreamConverter';

describe('HLSStreamConverter', () => {
  describe('generateHLSPlaylist', () => {
    it('should generate valid HLS playlist', () => {
      const streamUrl = 'https://ice1.somafm.com/metal-128-mp3';
      const playlist = HLSStreamConverter.generateHLSPlaylist(streamUrl);

      expect(playlist).toContain('#EXTM3U');
      expect(playlist).toContain('#EXT-X-VERSION:3');
      expect(playlist).toContain('#EXT-X-TARGETDURATION:10');
      expect(playlist).toContain(streamUrl);
      expect(playlist).toContain('#EXT-X-ENDLIST');
    });

    it('should encode special characters in stream URL', () => {
      const streamUrl = 'https://example.com/stream?param=value&other=123';
      const playlist = HLSStreamConverter.generateHLSPlaylist(streamUrl);

      expect(playlist).toContain('stream%3F');
    });
  });

  describe('isIOSClient', () => {
    it('should detect iPhone user agent', () => {
      const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)';
      expect(HLSStreamConverter.isIOSClient(userAgent)).toBe(true);
    });

    it('should detect iPad user agent', () => {
      const userAgent = 'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X)';
      expect(HLSStreamConverter.isIOSClient(userAgent)).toBe(true);
    });

    it('should detect iPod user agent', () => {
      const userAgent = 'Mozilla/5.0 (iPod touch; CPU iPhone OS 14_6 like Mac OS X)';
      expect(HLSStreamConverter.isIOSClient(userAgent)).toBe(true);
    });

    it('should not detect non-iOS user agents', () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
      expect(HLSStreamConverter.isIOSClient(userAgent)).toBe(false);
    });
  });

  describe('isAndroidClient', () => {
    it('should detect Android user agent', () => {
      const userAgent = 'Mozilla/5.0 (Linux; Android 11; SM-G991B)';
      expect(HLSStreamConverter.isAndroidClient(userAgent)).toBe(true);
    });

    it('should not detect non-Android user agents', () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
      expect(HLSStreamConverter.isAndroidClient(userAgent)).toBe(false);
    });
  });

  describe('getOptimalStreamUrl', () => {
    it('should return HLS URL for iOS clients', () => {
      const streamUrl = 'https://ice1.somafm.com/metal-128-mp3';
      const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)';
      
      const result = HLSStreamConverter.getOptimalStreamUrl(streamUrl, userAgent, true);
      
      expect(result).toContain('/api/stream/hls?url=');
      expect(result).toContain(encodeURIComponent(streamUrl));
    });

    it('should return direct URL for non-iOS clients', () => {
      const streamUrl = 'https://ice1.somafm.com/metal-128-mp3';
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
      
      const result = HLSStreamConverter.getOptimalStreamUrl(streamUrl, userAgent, true);
      
      expect(result).toBe(streamUrl);
    });

    it('should return direct URL for iOS without HLS flag', () => {
      const streamUrl = 'https://ice1.somafm.com/metal-128-mp3';
      const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)';
      
      const result = HLSStreamConverter.getOptimalStreamUrl(streamUrl, userAgent, false);
      
      expect(result).toBe(streamUrl);
    });
  });
});
