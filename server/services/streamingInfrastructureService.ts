import { z } from 'zod';

interface StreamingCredentials {
  rtmpUrl: string;
  streamKey: string;
  backupRtmpUrl?: string;
  backupStreamKey?: string;
  hls?: {
    playlistUrl: string;
    segmentDuration: number;
  };
  webrtc?: {
    iceServers: string[];
    signalingServer: string;
  };
}

interface StreamingEndpoint {
  platform: 'squadd' | 'solbones' | 'rrb';
  rtmpServer: string;
  hlsServer: string;
  recordingStorage: string;
  maxBitrate: number;
  maxResolution: string;
}

const STREAMING_ENDPOINTS: Record<string, StreamingEndpoint> = {
  squadd: {
    platform: 'squadd',
    rtmpServer: 'rtmp://stream.squadd.manus.space/live',
    hlsServer: 'https://stream.squadd.manus.space/hls',
    recordingStorage: 's3://manus-broadcasts/squadd',
    maxBitrate: 8000,
    maxResolution: '1080p',
  },
  solbones: {
    platform: 'solbones',
    rtmpServer: 'rtmp://stream.solbones.manus.space/live',
    hlsServer: 'https://stream.solbones.manus.space/hls',
    recordingStorage: 's3://manus-broadcasts/solbones',
    maxBitrate: 6000,
    maxResolution: '720p',
  },
  rrb: {
    platform: 'rrb',
    rtmpServer: 'rtmp://stream.rockinrockinboogie.manus.space/live',
    hlsServer: 'https://stream.rockinrockinboogie.manus.space/hls',
    recordingStorage: 's3://manus-broadcasts/rrb',
    maxBitrate: 10000,
    maxResolution: '4K',
  },
};

export class StreamingInfrastructureService {
  /**
   * Generate unique streaming credentials for a broadcaster
   */
  static generateStreamingCredentials(
    userId: string,
    platform: 'squadd' | 'solbones' | 'rrb'
  ): StreamingCredentials {
    const endpoint = STREAMING_ENDPOINTS[platform];
    if (!endpoint) {
      throw new Error(`Unknown platform: ${platform}`);
    }

    // Generate unique stream key
    const streamKey = this.generateStreamKey(userId, platform);

    return {
      rtmpUrl: endpoint.rtmpServer,
      streamKey,
      backupRtmpUrl: endpoint.rtmpServer.replace('stream.', 'backup-stream.'),
      backupStreamKey: this.generateStreamKey(userId, platform, true),
      hls: {
        playlistUrl: `${endpoint.hlsServer}/${streamKey}/playlist.m3u8`,
        segmentDuration: 10,
      },
      webrtc: {
        iceServers: [
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
        signalingServer: `wss://signal.${platform}.manus.space`,
      },
    };
  }

  /**
   * Generate a unique stream key
   */
  private static generateStreamKey(
    userId: string,
    platform: string,
    isBackup: boolean = false
  ): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const prefix = isBackup ? 'backup' : 'live';
    return `${prefix}-${platform}-${userId}-${timestamp}-${random}`;
  }

  /**
   * Get streaming endpoint configuration
   */
  static getEndpoint(platform: 'squadd' | 'solbones' | 'rrb'): StreamingEndpoint {
    const endpoint = STREAMING_ENDPOINTS[platform];
    if (!endpoint) {
      throw new Error(`Unknown platform: ${platform}`);
    }
    return endpoint;
  }

  /**
   * Validate streaming credentials format
   */
  static validateCredentials(credentials: Partial<StreamingCredentials>): boolean {
    if (!credentials.rtmpUrl || !credentials.streamKey) {
      return false;
    }

    // Validate RTMP URL format
    const rtmpRegex = /^rtmp:\/\/.+\/live$/;
    if (!rtmpRegex.test(credentials.rtmpUrl)) {
      return false;
    }

    // Validate stream key format (should be non-empty string)
    if (typeof credentials.streamKey !== 'string' || credentials.streamKey.length < 10) {
      return false;
    }

    return true;
  }

  /**
   * Create recording configuration
   */
  static createRecordingConfig(
    userId: string,
    platform: 'squadd' | 'solbones' | 'rrb',
    broadcastTitle: string
  ) {
    const endpoint = STREAMING_ENDPOINTS[platform];
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const recordingKey = `${platform}/${userId}/${timestamp}-${broadcastTitle.replace(/\s+/g, '-')}`;

    return {
      s3Bucket: endpoint.recordingStorage,
      recordingKey,
      recordingUrl: `${endpoint.recordingStorage}/${recordingKey}/recording.mp4`,
      thumbnailUrl: `${endpoint.recordingStorage}/${recordingKey}/thumbnail.jpg`,
      hlsArchiveUrl: `${endpoint.recordingStorage}/${recordingKey}/archive.m3u8`,
      format: 'mp4',
      codec: 'h264',
      bitrate: endpoint.maxBitrate,
      resolution: endpoint.maxResolution,
    };
  }

  /**
   * Get streaming recommendations based on platform
   */
  static getStreamingRecommendations(platform: 'squadd' | 'solbones' | 'rrb') {
    const endpoint = STREAMING_ENDPOINTS[platform];

    return {
      recommendedBitrate: Math.floor(endpoint.maxBitrate * 0.8),
      recommendedResolution: endpoint.maxResolution,
      recommendedFps: 60,
      recommendedAudioBitrate: 128,
      recommendedAudioSampleRate: 48000,
      keyframeInterval: 2, // seconds
      bufferSize: 5000, // kbps
      platform,
    };
  }

  /**
   * Verify streaming health
   */
  static async verifyStreamingHealth(
    rtmpUrl: string,
    streamKey: string
  ): Promise<{ healthy: boolean; latency: number; error?: string }> {
    try {
      // In production, this would check actual RTMP server connectivity
      // For now, we'll simulate a health check
      const startTime = Date.now();

      // Simulate network latency check
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));

      const latency = Date.now() - startTime;

      return {
        healthy: latency < 500,
        latency,
      };
    } catch (error) {
      return {
        healthy: false,
        latency: -1,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate OBS/Streamlabs configuration
   */
  static generateOBSConfig(credentials: StreamingCredentials) {
    return {
      service: 'Custom',
      server: credentials.rtmpUrl,
      key: credentials.streamKey,
      backup_server: credentials.backupRtmpUrl,
      backup_key: credentials.backupStreamKey,
      use_auth: false,
      bitrate: 5000,
      fps: 60,
      resolution: '1920x1080',
    };
  }

  /**
   * Generate FFmpeg streaming command
   */
  static generateFFmpegCommand(
    inputFile: string,
    credentials: StreamingCredentials,
    options?: { bitrate?: number; fps?: number; resolution?: string }
  ): string {
    const bitrate = options?.bitrate || 5000;
    const fps = options?.fps || 60;
    const resolution = options?.resolution || '1920x1080';

    return `ffmpeg -i ${inputFile} -c:v libx264 -preset veryfast -b:v ${bitrate}k -maxrate ${bitrate}k -bufsize ${bitrate * 2}k -c:a aac -b:a 128k -ar 44100 -g ${fps * 2} -f flv "${credentials.rtmpUrl}/${credentials.streamKey}"`;
  }
}
