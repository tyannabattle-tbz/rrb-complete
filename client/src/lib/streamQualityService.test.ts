import { describe, it, expect, beforeEach } from 'vitest';
import {
  QUALITY_OPTIONS,
  getQualityOption,
  getAllQualityOptions,
  getStreamUrlWithQuality,
  calculateDataUsage,
  formatDataUsage,
  getQualityRecommendation,
  isQualityAvailable,
  getBestQualityForBandwidth,
  saveQualityPreference,
  loadQualityPreference,
  clearQualityPreference,
  getQualityComparison,
  estimateStreamingTime
} from './streamQualityService';

describe('Stream Quality Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('QUALITY_OPTIONS', () => {
    it('should have all quality levels defined', () => {
      expect(QUALITY_OPTIONS.low).toBeDefined();
      expect(QUALITY_OPTIONS.medium).toBeDefined();
      expect(QUALITY_OPTIONS.high).toBeDefined();
      expect(QUALITY_OPTIONS.lossless).toBeDefined();
    });

    it('should have increasing bitrates', () => {
      expect(QUALITY_OPTIONS.low.bitrate).toBeLessThan(QUALITY_OPTIONS.medium.bitrate);
      expect(QUALITY_OPTIONS.medium.bitrate).toBeLessThan(QUALITY_OPTIONS.high.bitrate);
      expect(QUALITY_OPTIONS.high.bitrate).toBeLessThan(QUALITY_OPTIONS.lossless.bitrate);
    });

    it('should have valid codec information', () => {
      Object.values(QUALITY_OPTIONS).forEach(option => {
        expect(option.codec).toBeDefined();
        expect(option.codec.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getQualityOption', () => {
    it('should return low quality option', () => {
      const option = getQualityOption('low');
      expect(option.bitrate).toBe(64);
      expect(option.sampleRate).toBe(22050);
    });

    it('should return medium quality option', () => {
      const option = getQualityOption('medium');
      expect(option.bitrate).toBe(128);
      expect(option.sampleRate).toBe(44100);
    });

    it('should return high quality option', () => {
      const option = getQualityOption('high');
      expect(option.bitrate).toBe(192);
      expect(option.sampleRate).toBe(48000);
    });

    it('should return lossless quality option', () => {
      const option = getQualityOption('lossless');
      expect(option.bitrate).toBe(320);
      expect(option.sampleRate).toBe(44100);
    });
  });

  describe('getAllQualityOptions', () => {
    it('should return all quality options', () => {
      const options = getAllQualityOptions();
      expect(options.length).toBe(4);
    });

    it('should return options in order', () => {
      const options = getAllQualityOptions();
      expect(options[0].bitrate).toBeLessThan(options[options.length - 1].bitrate);
    });
  });

  describe('getStreamUrlWithQuality', () => {
    it('should add bitrate parameter to URL without query string', () => {
      const url = 'https://example.com/stream.mp3';
      const result = getStreamUrlWithQuality(url, 'high');
      expect(result).toContain('bitrate=192');
    });

    it('should add bitrate parameter to URL with existing query string', () => {
      const url = 'https://example.com/stream.mp3?format=mp3';
      const result = getStreamUrlWithQuality(url, 'medium');
      expect(result).toContain('bitrate=128');
      expect(result).toContain('format=mp3');
    });

    it('should use correct bitrate for each quality', () => {
      const url = 'https://example.com/stream';
      expect(getStreamUrlWithQuality(url, 'low')).toContain('bitrate=64');
      expect(getStreamUrlWithQuality(url, 'medium')).toContain('bitrate=128');
      expect(getStreamUrlWithQuality(url, 'high')).toContain('bitrate=192');
      expect(getStreamUrlWithQuality(url, 'lossless')).toContain('bitrate=320');
    });
  });

  describe('calculateDataUsage', () => {
    it('should calculate data usage for 1 hour', () => {
      const usage = calculateDataUsage('medium', 60);
      expect(usage.mb).toBeGreaterThan(0);
      expect(usage.mb).toBeLessThan(1);
    });

    it('should calculate data usage for 8 hours', () => {
      const usage = calculateDataUsage('medium', 480);
      expect(usage.mb).toBeGreaterThan(50);
      expect(usage.mb).toBeLessThan(100);
    });

    it('should increase with higher quality', () => {
      const lowUsage = calculateDataUsage('low', 60);
      const highUsage = calculateDataUsage('high', 60);
      expect(highUsage.bytes).toBeGreaterThan(lowUsage.bytes);
    });

    it('should increase with longer duration', () => {
      const oneHour = calculateDataUsage('medium', 60);
      const twoHours = calculateDataUsage('medium', 120);
      expect(twoHours.bytes).toBeGreaterThan(oneHour.bytes);
    });
  });

  describe('formatDataUsage', () => {
    it('should format bytes', () => {
      const usage = { bytes: 500, mb: 0.0005, gb: 0.0000005 };
      expect(formatDataUsage(usage)).toContain('KB');
    });

    it('should format megabytes', () => {
      const usage = { bytes: 5242880, mb: 5, gb: 0.005 };
      expect(formatDataUsage(usage)).toContain('MB');
    });

    it('should format gigabytes', () => {
      const usage = { bytes: 1073741824, mb: 1024, gb: 1 };
      expect(formatDataUsage(usage)).toContain('GB');
    });
  });

  describe('getQualityRecommendation', () => {
    it('should recommend medium for mobile', () => {
      expect(getQualityRecommendation('mobile')).toBe('medium');
    });

    it('should recommend high for tablet', () => {
      expect(getQualityRecommendation('tablet')).toBe('high');
    });

    it('should recommend high for desktop', () => {
      expect(getQualityRecommendation('desktop')).toBe('high');
    });
  });

  describe('isQualityAvailable', () => {
    it('should return true for sufficient bandwidth', () => {
      expect(isQualityAvailable('low', 100)).toBe(true);
      expect(isQualityAvailable('medium', 200)).toBe(true);
    });

    it('should return false for insufficient bandwidth', () => {
      expect(isQualityAvailable('high', 50)).toBe(false);
      expect(isQualityAvailable('lossless', 100)).toBe(false);
    });
  });

  describe('getBestQualityForBandwidth', () => {
    it('should return lossless for high bandwidth', () => {
      expect(getBestQualityForBandwidth(1000)).toBe('lossless');
    });

    it('should return high for medium bandwidth', () => {
      expect(getBestQualityForBandwidth(300)).toBe('high');
    });

    it('should return medium for low bandwidth', () => {
      expect(getBestQualityForBandwidth(150)).toBe('medium');
    });

    it('should return low for very low bandwidth', () => {
      expect(getBestQualityForBandwidth(50)).toBe('low');
    });
  });

  describe('Quality preferences', () => {
    it('should save and load quality preference', () => {
      const preference = {
        userId: 'user123',
        preferredQuality: 'high' as const,
        autoQuality: false,
        maxBandwidth: 500,
        lastUpdated: Date.now()
      };

      saveQualityPreference(preference);
      const loaded = loadQualityPreference('user123');

      expect(loaded).toBeDefined();
      expect(loaded?.preferredQuality).toBe('high');
      expect(loaded?.autoQuality).toBe(false);
    });

    it('should return null for non-existent preference', () => {
      const loaded = loadQualityPreference('nonexistent');
      expect(loaded).toBeNull();
    });

    it('should clear quality preference', () => {
      const preference = {
        userId: 'user123',
        preferredQuality: 'high' as const,
        autoQuality: false,
        maxBandwidth: 500,
        lastUpdated: Date.now()
      };

      saveQualityPreference(preference);
      clearQualityPreference('user123');
      const loaded = loadQualityPreference('user123');

      expect(loaded).toBeNull();
    });
  });

  describe('getQualityComparison', () => {
    it('should return comparison data', () => {
      const comparison = getQualityComparison();
      expect(comparison.length).toBe(4);
    });

    it('should include data usage estimates', () => {
      const comparison = getQualityComparison();
      comparison.forEach(item => {
        expect(item.oneHourUsage).toBeDefined();
        expect(item.eightHourUsage).toBeDefined();
      });
    });
  });

  describe('estimateStreamingTime', () => {
    it('should estimate streaming time with available data', () => {
      const estimate = estimateStreamingTime('medium', 100);
      expect(estimate.hours).toBeGreaterThan(0);
    });

    it('should return more hours for lower quality', () => {
      const lowQuality = estimateStreamingTime('low', 100);
      const highQuality = estimateStreamingTime('high', 100);
      expect(lowQuality.hours).toBeGreaterThan(highQuality.hours);
    });
  });
});
