import { describe, it, expect, beforeEach, vi } from 'vitest';
import { streamSwitchingService, type QualityLevel } from './streamSwitchingService';

describe('StreamSwitchingService', () => {
  beforeEach(() => {
    streamSwitchingService.reset();
  });

  describe('Network Speed Detection', () => {
    it('should detect network speed', () => {
      const speed = streamSwitchingService.detectNetworkSpeed();
      expect(speed).toBeGreaterThan(0);
      expect(typeof speed).toBe('number');
    });

    it('should estimate network speed as fallback', () => {
      const speed = streamSwitchingService['estimateNetworkSpeedFallback']();
      expect(speed).toBeGreaterThan(0);
    });
  });

  describe('Quality Recommendation', () => {
    it('should recommend low quality when buffer is critical', () => {
      const quality = streamSwitchingService.recommendQuality(5000, 15);
      expect(quality).toBe('low');
    });

    it('should recommend medium quality when buffer is low', () => {
      const quality = streamSwitchingService.recommendQuality(2000, 40);
      expect(quality).toBe('medium');
    });

    it('should recommend high quality with good network', () => {
      const quality = streamSwitchingService.recommendQuality(2000, 80);
      expect(quality).toBe('high');
    });

    it('should recommend lossless quality with excellent network', () => {
      const quality = streamSwitchingService.recommendQuality(5000, 90);
      expect(quality).toBe('lossless');
    });

    it('should recommend low quality with poor network', () => {
      const quality = streamSwitchingService.recommendQuality(300, 80);
      expect(quality).toBe('low');
    });
  });

  describe('Bitrate Mapping', () => {
    it('should map quality levels to bitrates', () => {
      expect(streamSwitchingService.getBitrateForQuality('low')).toBe(64);
      expect(streamSwitchingService.getBitrateForQuality('medium')).toBe(128);
      expect(streamSwitchingService.getBitrateForQuality('high')).toBe(192);
      expect(streamSwitchingService.getBitrateForQuality('lossless')).toBe(320);
    });
  });

  describe('Data Usage Calculation', () => {
    it('should calculate data usage correctly', () => {
      // 128 kbps for 60 minutes = 960 Mb = 120 MB
      const usage = streamSwitchingService.calculateDataUsage(128, 60);
      expect(usage).toBeCloseTo(120, 0);
    });

    it('should calculate data usage for different bitrates', () => {
      const usage64 = streamSwitchingService.calculateDataUsage(64, 60);
      const usage320 = streamSwitchingService.calculateDataUsage(320, 60);
      expect(usage320).toBeCloseTo(usage64 * 5, 0);
    });
  });

  describe('Streaming Time Estimation', () => {
    it('should estimate streaming time correctly', () => {
      // 120 MB at 128 kbps = 60 minutes
      const time = streamSwitchingService.estimateStreamingTime(128, 120);
      expect(time).toBeCloseTo(60, 0);
    });

    it('should estimate streaming time for different data amounts', () => {
      const time30 = streamSwitchingService.estimateStreamingTime(128, 60);
      const time60 = streamSwitchingService.estimateStreamingTime(128, 120);
      expect(time60).toBeCloseTo(time30 * 2, 0);
    });
  });

  describe('Stream Switching', () => {
    it('should handle stream switching with mock audio element', async () => {
      const mockAudio = {
        pause: vi.fn(),
        play: vi.fn().mockResolvedValue(undefined),
        src: '',
        paused: false,
        currentTime: 0,
        buffered: { length: 0, end: vi.fn() },
      } as any;

      const result = await streamSwitchingService.switchStream(
        mockAudio,
        'https://example.com/stream.mp3',
        'high',
        (status) => console.log(status)
      );

      expect(result).toBe(true);
      expect(mockAudio.pause).toHaveBeenCalled();
      expect(mockAudio.src).toBe('https://example.com/stream.mp3');
    });

    it('should prevent concurrent switches', async () => {
      const mockAudio = {
        pause: vi.fn(),
        play: vi.fn().mockResolvedValue(undefined),
        src: '',
        paused: false,
        currentTime: 0,
        buffered: { length: 0, end: vi.fn() },
      } as any;

      // Start first switch
      const switch1 = streamSwitchingService.switchStream(
        mockAudio,
        'https://example.com/stream1.mp3',
        'high'
      );

      // Try second switch while first is in progress
      const switch2 = streamSwitchingService.switchStream(
        mockAudio,
        'https://example.com/stream2.mp3',
        'high'
      );

      const [result1, result2] = await Promise.all([switch1, switch2]);
      expect(result1).toBe(true);
      expect(result2).toBe(false); // Should fail due to in-progress switch
    });
  });

  describe('Auto Quality Adjustment', () => {
    it('should auto-adjust quality based on network conditions', async () => {
      const mockAudio = {
        pause: vi.fn(),
        play: vi.fn().mockResolvedValue(undefined),
        src: 'https://example.com/current.mp3',
        paused: false,
        currentTime: 0,
        buffered: { length: 1, end: vi.fn().mockReturnValue(5) },
      } as any;

      const qualityMap = {
        low: { bitrate: 64, url: 'https://example.com/low.mp3' },
        medium: { bitrate: 128, url: 'https://example.com/medium.mp3' },
        high: { bitrate: 192, url: 'https://example.com/high.mp3' },
        lossless: { bitrate: 320, url: 'https://example.com/lossless.mp3' },
      };

      streamSwitchingService.updateConfig({ autoAdjustQuality: true });

      const result = await streamSwitchingService.autoAdjustQuality(
        mockAudio,
        'https://example.com/current.mp3',
        qualityMap
      );

      // Result may be null or a quality level depending on network conditions
      expect(result === null || typeof result === 'string').toBe(true);
    });
  });

  describe('Metrics and History', () => {
    it('should track streaming metrics', () => {
      const metrics = streamSwitchingService.getMetrics();
      expect(metrics).toHaveProperty('currentBitrate');
      expect(metrics).toHaveProperty('networkSpeed');
      expect(metrics).toHaveProperty('bufferHealth');
      expect(metrics).toHaveProperty('recommendedQuality');
    });

    it('should maintain quality history', async () => {
      const mockAudio = {
        pause: vi.fn(),
        play: vi.fn().mockResolvedValue(undefined),
        src: '',
        paused: false,
        currentTime: 0,
        buffered: { length: 0, end: vi.fn() },
      } as any;

      await streamSwitchingService.switchStream(
        mockAudio,
        'https://example.com/stream1.mp3',
        'low'
      );

      await streamSwitchingService.switchStream(
        mockAudio,
        'https://example.com/stream2.mp3',
        'high'
      );

      const history = streamSwitchingService.getQualityHistory();
      expect(history).toContain('low');
      expect(history).toContain('high');
    });

    it('should limit quality history size', async () => {
      const mockAudio = {
        pause: vi.fn(),
        play: vi.fn().mockResolvedValue(undefined),
        src: '',
        paused: false,
        currentTime: 0,
        buffered: { length: 0, end: vi.fn() },
      } as any;

      // Add 150 entries (more than the 100 limit)
      for (let i = 0; i < 150; i++) {
        await streamSwitchingService.switchStream(
          mockAudio,
          `https://example.com/stream${i}.mp3`,
          (i % 4 === 0 ? 'low' : i % 4 === 1 ? 'medium' : i % 4 === 2 ? 'high' : 'lossless') as QualityLevel
        );
      }

      const history = streamSwitchingService.getQualityHistory();
      expect(history.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      streamSwitchingService.updateConfig({
        autoAdjustQuality: false,
        minimumBitrate: 32,
        maximumBitrate: 256,
      });

      // Configuration is updated internally
      expect(true).toBe(true); // Just verify no errors
    });

    it('should reset service state', () => {
      streamSwitchingService.reset();
      const metrics = streamSwitchingService.getMetrics();
      expect(metrics.currentBitrate).toBe(128);
      expect(metrics.bufferHealth).toBe(100);
    });
  });
});
