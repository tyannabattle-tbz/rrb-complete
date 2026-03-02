import { invokeLLM } from './llm';

export interface StreamingSession {
  sessionId: string;
  videoUrl: string;
  status: 'buffering' | 'playing' | 'paused' | 'completed';
  progress: number;
  duration: number;
  bitrate: number;
  quality: '360p' | '720p' | '1080p' | '4k';
  startTime: number;
  endTime?: number;
}

export interface StreamMetrics {
  avgBitrate: number;
  bufferingEvents: number;
  totalBufferTime: number;
  avgLatency: number;
  droppedFrames: number;
  qualitySwitches: number;
}

export class VideoStreamingService {
  private static sessions = new Map<string, StreamingSession>();
  private static metrics = new Map<string, StreamMetrics>();

  static createSession(videoUrl: string, quality: '360p' | '720p' | '1080p' | '4k' = '720p'): StreamingSession {
    const sessionId = `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const session: StreamingSession = {
      sessionId,
      videoUrl,
      status: 'buffering',
      progress: 0,
      duration: 0,
      bitrate: this.getBitrateForQuality(quality),
      quality,
      startTime: Date.now(),
    };
    this.sessions.set(sessionId, session);
    this.metrics.set(sessionId, {
      avgBitrate: session.bitrate,
      bufferingEvents: 0,
      totalBufferTime: 0,
      avgLatency: 0,
      droppedFrames: 0,
      qualitySwitches: 0,
    });
    return session;
  }

  static getSession(sessionId: string): StreamingSession | null {
    return this.sessions.get(sessionId) || null;
  }

  static updateProgress(sessionId: string, progress: number, duration: number): StreamingSession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    session.progress = Math.min(100, Math.max(0, progress));
    session.duration = duration;
    if (session.progress >= 100) session.status = 'completed';
    return session;
  }

  static setStatus(sessionId: string, status: StreamingSession['status']): StreamingSession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    session.status = status;
    return session;
  }

  static switchQuality(sessionId: string, quality: '360p' | '720p' | '1080p' | '4k'): StreamingSession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    const oldQuality = session.quality;
    session.quality = quality;
    session.bitrate = this.getBitrateForQuality(quality);
    const metrics = this.metrics.get(sessionId);
    if (metrics) metrics.qualitySwitches++;
    return session;
  }

  static recordBuffering(sessionId: string, duration: number): void {
    const metrics = this.metrics.get(sessionId);
    if (metrics) {
      metrics.bufferingEvents++;
      metrics.totalBufferTime += duration;
    }
  }

  static recordDroppedFrames(sessionId: string, count: number): void {
    const metrics = this.metrics.get(sessionId);
    if (metrics) metrics.droppedFrames += count;
  }

  static getMetrics(sessionId: string): StreamMetrics | null {
    return this.metrics.get(sessionId) || null;
  }

  static generateStreamUrl(videoUrl: string, quality: '360p' | '720p' | '1080p' | '4k'): string {
    const params = new URLSearchParams({
      url: videoUrl,
      quality,
      token: `token-${Date.now()}`,
    });
    return `/api/stream?${params.toString()}`;
  }

  static getAdaptiveBitrate(networkSpeed: number): '360p' | '720p' | '1080p' | '4k' {
    if (networkSpeed < 2.5) return '360p';
    if (networkSpeed < 5) return '720p';
    if (networkSpeed < 10) return '1080p';
    return '4k';
  }

  private static getBitrateForQuality(quality: string): number {
    const bitrates: Record<string, number> = {
      '360p': 500,
      '720p': 2500,
      '1080p': 5000,
      '4k': 15000,
    };
    return bitrates[quality] || 2500;
  }

  static closeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) session.endTime = Date.now();
    this.sessions.delete(sessionId);
  }
}
