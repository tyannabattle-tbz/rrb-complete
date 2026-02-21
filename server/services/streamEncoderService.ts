import { randomUUID } from 'crypto';

export interface VideoStream {
  id: string;
  panelistId: string;
  resolution: string;
  bitrate: number;
  frameRate: number;
  codec: string;
}

export interface EncodedStream {
  id: string;
  sessionId: string;
  videoStreams: VideoStream[];
  outputResolution: string;
  outputBitrate: number;
  outputFrameRate: number;
  status: 'idle' | 'encoding' | 'streaming' | 'paused' | 'error';
  rtmpUrl?: string;
  hls?: { url: string; segmentDuration: number };
}

/**
 * Stream Encoder Service
 * Encodes and combines multiple video feeds into single broadcast stream
 */
export class StreamEncoderService {
  private encoders: Map<string, EncodedStream> = new Map();
  private rtmpConnections: Map<string, any> = new Map();

  /**
   * Create a new encoder for session
   */
  async createEncoder(sessionId: string): Promise<EncodedStream> {
    const encoderId = randomUUID();

    const encoder: EncodedStream = {
      id: encoderId,
      sessionId,
      videoStreams: [],
      outputResolution: '1920x1080',
      outputBitrate: 5000,
      outputFrameRate: 30,
      status: 'idle',
    };

    this.encoders.set(encoderId, encoder);
    console.log(`[StreamEncoder] Encoder created: ${encoderId}`);

    return encoder;
  }

  /**
   * Add video stream to encoder
   */
  async addVideoStream(
    encoderId: string,
    panelistId: string,
    resolution: string = '1280x720',
    bitrate: number = 2500
  ): Promise<VideoStream> {
    const encoder = this.encoders.get(encoderId);
    if (!encoder) {
      throw new Error('Encoder not found');
    }

    const stream: VideoStream = {
      id: randomUUID(),
      panelistId,
      resolution,
      bitrate,
      frameRate: 30,
      codec: 'h264',
    };

    encoder.videoStreams.push(stream);
    console.log(`[StreamEncoder] Video stream added for panelist ${panelistId}`);

    return stream;
  }

  /**
   * Remove video stream from encoder
   */
  async removeVideoStream(encoderId: string, streamId: string): Promise<void> {
    const encoder = this.encoders.get(encoderId);
    if (!encoder) {
      throw new Error('Encoder not found');
    }

    const index = encoder.videoStreams.findIndex(s => s.id === streamId);
    if (index === -1) {
      throw new Error('Stream not found');
    }

    encoder.videoStreams.splice(index, 1);
    console.log(`[StreamEncoder] Video stream removed: ${streamId}`);
  }

  /**
   * Configure output settings
   */
  async configureOutput(
    encoderId: string,
    config: {
      resolution?: string;
      bitrate?: number;
      frameRate?: number;
    }
  ): Promise<void> {
    const encoder = this.encoders.get(encoderId);
    if (!encoder) {
      throw new Error('Encoder not found');
    }

    if (config.resolution) encoder.outputResolution = config.resolution;
    if (config.bitrate) encoder.outputBitrate = config.bitrate;
    if (config.frameRate) encoder.outputFrameRate = config.frameRate;

    console.log(`[StreamEncoder] Output configured: ${config.resolution || encoder.outputResolution} @ ${config.bitrate || encoder.outputBitrate}kbps`);
  }

  /**
   * Start encoding
   */
  async startEncoding(encoderId: string): Promise<void> {
    const encoder = this.encoders.get(encoderId);
    if (!encoder) {
      throw new Error('Encoder not found');
    }

    if (encoder.videoStreams.length === 0) {
      throw new Error('No video streams added');
    }

    encoder.status = 'encoding';
    console.log(`[StreamEncoder] Encoding started: ${encoderId}`);
  }

  /**
   * Start streaming to RTMP
   */
  async startRTMPStream(
    encoderId: string,
    rtmpUrl: string
  ): Promise<{ streamKey: string }> {
    const encoder = this.encoders.get(encoderId);
    if (!encoder) {
      throw new Error('Encoder not found');
    }

    if (encoder.status !== 'encoding') {
      throw new Error('Encoder must be encoding first');
    }

    const streamKey = randomUUID();
    encoder.rtmpUrl = `${rtmpUrl}/${streamKey}`;
    encoder.status = 'streaming';

    this.rtmpConnections.set(encoderId, {
      url: encoder.rtmpUrl,
      connected: true,
      bitrate: encoder.outputBitrate,
      latency: 0,
    });

    console.log(`[StreamEncoder] RTMP stream started: ${encoder.rtmpUrl}`);

    return { streamKey };
  }

  /**
   * Start HLS stream
   */
  async startHLSStream(encoderId: string): Promise<{ playlistUrl: string }> {
    const encoder = this.encoders.get(encoderId);
    if (!encoder) {
      throw new Error('Encoder not found');
    }

    const playlistId = randomUUID();
    const playlistUrl = `https://stream.example.com/hls/${playlistId}/playlist.m3u8`;

    encoder.hls = {
      url: playlistUrl,
      segmentDuration: 10,
    };

    console.log(`[StreamEncoder] HLS stream started: ${playlistUrl}`);

    return { playlistUrl };
  }

  /**
   * Pause encoding
   */
  async pauseEncoding(encoderId: string): Promise<void> {
    const encoder = this.encoders.get(encoderId);
    if (!encoder) {
      throw new Error('Encoder not found');
    }

    encoder.status = 'paused';
    console.log(`[StreamEncoder] Encoding paused: ${encoderId}`);
  }

  /**
   * Resume encoding
   */
  async resumeEncoding(encoderId: string): Promise<void> {
    const encoder = this.encoders.get(encoderId);
    if (!encoder) {
      throw new Error('Encoder not found');
    }

    encoder.status = 'encoding';
    console.log(`[StreamEncoder] Encoding resumed: ${encoderId}`);
  }

  /**
   * Stop encoding
   */
  async stopEncoding(encoderId: string): Promise<void> {
    const encoder = this.encoders.get(encoderId);
    if (!encoder) {
      throw new Error('Encoder not found');
    }

    encoder.status = 'idle';

    // Close RTMP connection
    if (this.rtmpConnections.has(encoderId)) {
      this.rtmpConnections.delete(encoderId);
    }

    console.log(`[StreamEncoder] Encoding stopped: ${encoderId}`);
  }

  /**
   * Get encoder status
   */
  async getStatus(encoderId: string): Promise<{
    status: string;
    videoStreams: number;
    outputResolution: string;
    outputBitrate: number;
    rtmpUrl?: string;
    hlsUrl?: string;
  }> {
    const encoder = this.encoders.get(encoderId);
    if (!encoder) {
      throw new Error('Encoder not found');
    }

    return {
      status: encoder.status,
      videoStreams: encoder.videoStreams.length,
      outputResolution: encoder.outputResolution,
      outputBitrate: encoder.outputBitrate,
      rtmpUrl: encoder.rtmpUrl,
      hlsUrl: encoder.hls?.url,
    };
  }

  /**
   * Get encoder metrics
   */
  async getMetrics(encoderId: string): Promise<{
    cpu: number;
    memory: number;
    inputBitrate: number;
    outputBitrate: number;
    frameDrops: number;
    latency: number;
  }> {
    const encoder = this.encoders.get(encoderId);
    if (!encoder) {
      throw new Error('Encoder not found');
    }

    // Simulate metrics
    const inputBitrate = encoder.videoStreams.reduce((sum, s) => sum + s.bitrate, 0);

    return {
      cpu: Math.random() * 80,
      memory: Math.random() * 60,
      inputBitrate,
      outputBitrate: encoder.outputBitrate,
      frameDrops: Math.floor(Math.random() * 5),
      latency: Math.floor(Math.random() * 100) + 20,
    };
  }

  /**
   * Update adaptive bitrate
   */
  async updateAdaptiveBitrate(
    encoderId: string,
    networkCondition: 'excellent' | 'good' | 'fair' | 'poor'
  ): Promise<number> {
    const encoder = this.encoders.get(encoderId);
    if (!encoder) {
      throw new Error('Encoder not found');
    }

    const bitrateMap = {
      excellent: 5000,
      good: 3500,
      fair: 2500,
      poor: 1500,
    };

    encoder.outputBitrate = bitrateMap[networkCondition];
    console.log(`[StreamEncoder] Bitrate adjusted to ${encoder.outputBitrate}kbps (${networkCondition})`);

    return encoder.outputBitrate;
  }

  /**
   * Get all encoders
   */
  async listEncoders(): Promise<EncodedStream[]> {
    return Array.from(this.encoders.values());
  }

  /**
   * Close encoder
   */
  async closeEncoder(encoderId: string): Promise<void> {
    const encoder = this.encoders.get(encoderId);
    if (!encoder) {
      throw new Error('Encoder not found');
    }

    if (encoder.status === 'streaming') {
      await this.stopEncoding(encoderId);
    }

    this.encoders.delete(encoderId);
    console.log(`[StreamEncoder] Encoder closed: ${encoderId}`);
  }
}

export const streamEncoderService = new StreamEncoderService();
