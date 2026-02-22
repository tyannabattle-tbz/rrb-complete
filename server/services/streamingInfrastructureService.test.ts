import { describe, it, expect } from 'vitest';
import { StreamingInfrastructureService } from './streamingInfrastructureService';

describe('StreamingInfrastructureService', () => {
  describe('generateStreamingCredentials', () => {
    it('should generate valid SQUADD credentials', () => {
      const creds = StreamingInfrastructureService.generateStreamingCredentials('user123', 'squadd');
      
      expect(creds.rtmpUrl).toBe('rtmp://stream.squadd.manus.space/live');
      expect(creds.streamKey).toBeTruthy();
      expect(creds.streamKey.length).toBeGreaterThan(10);
      expect(creds.hls).toBeDefined();
      expect(creds.webrtc).toBeDefined();
    });

    it('should generate valid Solbones credentials', () => {
      const creds = StreamingInfrastructureService.generateStreamingCredentials('user456', 'solbones');
      
      expect(creds.rtmpUrl).toBe('rtmp://stream.solbones.manus.space/live');
      expect(creds.streamKey).toBeTruthy();
      expect(creds.backupStreamKey).toBeTruthy();
      expect(creds.backupStreamKey).not.toBe(creds.streamKey);
    });

    it('should generate valid RRB credentials', () => {
      const creds = StreamingInfrastructureService.generateStreamingCredentials('user789', 'rrb');
      
      expect(creds.rtmpUrl).toBe('rtmp://stream.rockinrockinboogie.manus.space/live');
      expect(creds.streamKey).toBeTruthy();
    });

    it('should throw error for unknown platform', () => {
      expect(() => {
        StreamingInfrastructureService.generateStreamingCredentials('user123', 'unknown' as any);
      }).toThrow('Unknown platform');
    });
  });

  describe('getEndpoint', () => {
    it('should return SQUADD endpoint', () => {
      const endpoint = StreamingInfrastructureService.getEndpoint('squadd');
      
      expect(endpoint.platform).toBe('squadd');
      expect(endpoint.rtmpServer).toBe('rtmp://stream.squadd.manus.space/live');
      expect(endpoint.maxBitrate).toBe(8000);
      expect(endpoint.maxResolution).toBe('1080p');
    });

    it('should return Solbones endpoint', () => {
      const endpoint = StreamingInfrastructureService.getEndpoint('solbones');
      
      expect(endpoint.platform).toBe('solbones');
      expect(endpoint.maxBitrate).toBe(6000);
      expect(endpoint.maxResolution).toBe('720p');
    });

    it('should return RRB endpoint', () => {
      const endpoint = StreamingInfrastructureService.getEndpoint('rrb');
      
      expect(endpoint.platform).toBe('rrb');
      expect(endpoint.maxBitrate).toBe(10000);
      expect(endpoint.maxResolution).toBe('4K');
    });
  });

  describe('validateCredentials', () => {
    it('should validate correct credentials', () => {
      const creds = StreamingInfrastructureService.generateStreamingCredentials('user123', 'squadd');
      const isValid = StreamingInfrastructureService.validateCredentials(creds);
      
      expect(isValid).toBe(true);
    });

    it('should reject credentials without RTMP URL', () => {
      const isValid = StreamingInfrastructureService.validateCredentials({
        streamKey: 'valid-stream-key-123',
      });
      
      expect(isValid).toBe(false);
    });

    it('should reject credentials without stream key', () => {
      const isValid = StreamingInfrastructureService.validateCredentials({
        rtmpUrl: 'rtmp://stream.squadd.manus.space/live',
      });
      
      expect(isValid).toBe(false);
    });

    it('should reject invalid RTMP URL format', () => {
      const isValid = StreamingInfrastructureService.validateCredentials({
        rtmpUrl: 'https://invalid-url.com',
        streamKey: 'valid-stream-key-123',
      });
      
      expect(isValid).toBe(false);
    });

    it('should reject short stream key', () => {
      const isValid = StreamingInfrastructureService.validateCredentials({
        rtmpUrl: 'rtmp://stream.squadd.manus.space/live',
        streamKey: 'short',
      });
      
      expect(isValid).toBe(false);
    });
  });

  describe('createRecordingConfig', () => {
    it('should create valid recording config', () => {
      const config = StreamingInfrastructureService.createRecordingConfig(
        'user123',
        'squadd',
        'My Broadcast'
      );
      
      expect(config.s3Bucket).toBe('s3://manus-broadcasts/squadd');
      expect(config.recordingKey).toContain('squadd/user123');
      expect(config.recordingKey).toContain('My-Broadcast');
      expect(config.format).toBe('mp4');
      expect(config.codec).toBe('h264');
      expect(config.bitrate).toBe(8000);
    });

    it('should handle broadcast titles with spaces', () => {
      const config = StreamingInfrastructureService.createRecordingConfig(
        'user456',
        'solbones',
        'UN WCS Parallel Event'
      );
      
      expect(config.recordingKey).toContain('UN-WCS-Parallel-Event');
    });
  });

  describe('getStreamingRecommendations', () => {
    it('should return SQUADD recommendations', () => {
      const recs = StreamingInfrastructureService.getStreamingRecommendations('squadd');
      
      expect(recs.recommendedBitrate).toBe(6400); // 80% of 8000
      expect(recs.recommendedResolution).toBe('1080p');
      expect(recs.recommendedFps).toBe(60);
      expect(recs.recommendedAudioBitrate).toBe(128);
    });

    it('should return Solbones recommendations', () => {
      const recs = StreamingInfrastructureService.getStreamingRecommendations('solbones');
      
      expect(recs.recommendedBitrate).toBe(4800); // 80% of 6000
      expect(recs.recommendedResolution).toBe('720p');
    });

    it('should return RRB recommendations', () => {
      const recs = StreamingInfrastructureService.getStreamingRecommendations('rrb');
      
      expect(recs.recommendedBitrate).toBe(8000); // 80% of 10000
      expect(recs.recommendedResolution).toBe('4K');
    });
  });

  describe('verifyStreamingHealth', () => {
    it('should return healthy status', async () => {
      const health = await StreamingInfrastructureService.verifyStreamingHealth(
        'rtmp://stream.squadd.manus.space/live',
        'test-stream-key'
      );
      
      expect(health).toHaveProperty('healthy');
      expect(health).toHaveProperty('latency');
      expect(health.latency).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generateOBSConfig', () => {
    it('should generate valid OBS configuration', () => {
      const creds = StreamingInfrastructureService.generateStreamingCredentials('user123', 'squadd');
      const obsConfig = StreamingInfrastructureService.generateOBSConfig(creds);
      
      expect(obsConfig.service).toBe('Custom');
      expect(obsConfig.server).toBe(creds.rtmpUrl);
      expect(obsConfig.key).toBe(creds.streamKey);
      expect(obsConfig.bitrate).toBe(5000);
      expect(obsConfig.fps).toBe(60);
      expect(obsConfig.resolution).toBe('1920x1080');
    });
  });

  describe('generateFFmpegCommand', () => {
    it('should generate valid FFmpeg command', () => {
      const creds = StreamingInfrastructureService.generateStreamingCredentials('user123', 'squadd');
      const command = StreamingInfrastructureService.generateFFmpegCommand(
        'input.mp4',
        creds
      );
      
      expect(command).toContain('ffmpeg');
      expect(command).toContain('-i input.mp4');
      expect(command).toContain('libx264');
      expect(command).toContain(creds.rtmpUrl);
      expect(command).toContain(creds.streamKey);
    });

    it('should generate FFmpeg command with custom options', () => {
      const creds = StreamingInfrastructureService.generateStreamingCredentials('user123', 'squadd');
      const command = StreamingInfrastructureService.generateFFmpegCommand(
        'input.mp4',
        creds,
        { bitrate: 3000, fps: 30, resolution: '1280x720' }
      );
      
      expect(command).toContain('-b:v 3000k');
      expect(command).toContain('-g 60'); // keyframe interval = fps * 2
    });
  });
});
