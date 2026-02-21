/**
 * Failover and Backup System Service
 * Handles automatic failover to secondary RTMP endpoints and multi-format recording
 */

interface StreamEndpoint {
  id: string;
  url: string;
  platform: 'primary' | 'secondary' | 'tertiary';
  status: 'active' | 'inactive' | 'failed';
  lastHeartbeat: number;
  failureCount: number;
}

interface RecordingJob {
  id: string;
  sessionId: string;
  status: 'recording' | 'processing' | 'completed' | 'failed';
  formats: ('mp4' | 'hls' | 'webm' | 'mkv')[];
  startTime: number;
  endTime?: number;
  fileSize?: number;
  duration?: number;
}

interface FailoverConfig {
  primaryEndpoint: string;
  secondaryEndpoint: string;
  tertiaryEndpoint: string;
  healthCheckInterval: number;
  failureThreshold: number;
  recordingPath: string;
}

export class FailoverService {
  private endpoints: Map<string, StreamEndpoint> = new Map();
  private recordings: Map<string, RecordingJob> = new Map();
  private config: FailoverConfig;
  private healthCheckIntervals: NodeJS.Timeout[] = [];
  private currentActiveEndpoint: string | null = null;

  constructor(config: FailoverConfig) {
    this.config = config;
    this.initializeEndpoints();
  }

  private initializeEndpoints(): void {
    const endpoints: StreamEndpoint[] = [
      {
        id: 'primary',
        url: this.config.primaryEndpoint,
        platform: 'primary',
        status: 'active',
        lastHeartbeat: Date.now(),
        failureCount: 0,
      },
      {
        id: 'secondary',
        url: this.config.secondaryEndpoint,
        platform: 'secondary',
        status: 'inactive',
        lastHeartbeat: 0,
        failureCount: 0,
      },
      {
        id: 'tertiary',
        url: this.config.tertiaryEndpoint,
        platform: 'tertiary',
        status: 'inactive',
        lastHeartbeat: 0,
        failureCount: 0,
      },
    ];

    endpoints.forEach(ep => this.endpoints.set(ep.id, ep));
    this.currentActiveEndpoint = 'primary';
  }

  /**
   * Start health monitoring for all endpoints
   */
  startHealthMonitoring(): void {
    const interval = setInterval(() => {
      this.checkEndpointHealth();
    }, this.config.healthCheckInterval);

    this.healthCheckIntervals.push(interval);
    console.log('[Failover] Health monitoring started');
  }

  /**
   * Check health of all endpoints
   */
  private async checkEndpointHealth(): Promise<void> {
    for (const [id, endpoint] of this.endpoints) {
      try {
        const response = await this.pingEndpoint(endpoint.url);

        if (response.ok) {
          endpoint.status = 'active';
          endpoint.lastHeartbeat = Date.now();
          endpoint.failureCount = 0;

          // If this was the current active endpoint, keep it
          if (id === this.currentActiveEndpoint) {
            console.log(`[Failover] Primary endpoint healthy: ${id}`);
          }
        } else {
          endpoint.failureCount++;
          if (endpoint.failureCount >= this.config.failureThreshold) {
            endpoint.status = 'failed';
            console.warn(`[Failover] Endpoint marked as failed: ${id}`);

            // Trigger failover if this was the active endpoint
            if (id === this.currentActiveEndpoint) {
              await this.failoverToNextEndpoint();
            }
          }
        }
      } catch (error) {
        endpoint.failureCount++;
        if (endpoint.failureCount >= this.config.failureThreshold) {
          endpoint.status = 'failed';
          console.error(`[Failover] Endpoint health check failed: ${id}`, error);

          if (id === this.currentActiveEndpoint) {
            await this.failoverToNextEndpoint();
          }
        }
      }
    }
  }

  /**
   * Ping endpoint to check if it's alive
   */
  private async pingEndpoint(url: string): Promise<Response> {
    const timeout = 5000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${url}/health`, {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Failover to next available endpoint
   */
  private async failoverToNextEndpoint(): Promise<void> {
    const endpoints = Array.from(this.endpoints.values());
    const availableEndpoints = endpoints.filter(
      ep => ep.status === 'active' && ep.id !== this.currentActiveEndpoint
    );

    if (availableEndpoints.length === 0) {
      console.error('[Failover] No available endpoints for failover');
      return;
    }

    const nextEndpoint = availableEndpoints[0];
    const previousEndpoint = this.currentActiveEndpoint;

    this.currentActiveEndpoint = nextEndpoint.id;
    console.warn(
      `[Failover] Failover triggered: ${previousEndpoint} → ${nextEndpoint.id}`
    );

    // Notify about failover
    this.notifyFailover(previousEndpoint || 'unknown', nextEndpoint.id);
  }

  /**
   * Get current active endpoint
   */
  getActiveEndpoint(): StreamEndpoint | null {
    if (!this.currentActiveEndpoint) return null;
    return this.endpoints.get(this.currentActiveEndpoint) || null;
  }

  /**
   * Get all endpoints status
   */
  getAllEndpointsStatus(): StreamEndpoint[] {
    return Array.from(this.endpoints.values());
  }

  /**
   * Start recording session
   */
  startRecording(sessionId: string, formats: ('mp4' | 'hls' | 'webm' | 'mkv')[] = ['mp4', 'hls']): RecordingJob {
    const recordingId = `rec-${sessionId}-${Date.now()}`;
    const job: RecordingJob = {
      id: recordingId,
      sessionId,
      status: 'recording',
      formats,
      startTime: Date.now(),
    };

    this.recordings.set(recordingId, job);
    console.log(`[Recording] Started: ${recordingId} with formats: ${formats.join(', ')}`);

    return job;
  }

  /**
   * Stop recording and start processing
   */
  stopRecording(recordingId: string): RecordingJob | null {
    const recording = this.recordings.get(recordingId);
    if (!recording) return null;

    recording.endTime = Date.now();
    recording.duration = (recording.endTime - recording.startTime) / 1000; // in seconds
    recording.status = 'processing';

    console.log(
      `[Recording] Stopped: ${recordingId} (Duration: ${recording.duration}s)`
    );

    // Simulate processing
    this.processRecording(recordingId);

    return recording;
  }

  /**
   * Process recording into multiple formats
   */
  private async processRecording(recordingId: string): Promise<void> {
    const recording = this.recordings.get(recordingId);
    if (!recording) return;

    try {
      console.log(`[Recording] Processing: ${recordingId}`);

      // Simulate format conversion
      for (const format of recording.formats) {
        console.log(`[Recording] Converting to ${format.toUpperCase()}: ${recordingId}`);
        await this.convertFormat(recordingId, format);
      }

      recording.status = 'completed';
      recording.fileSize = Math.floor(Math.random() * 5000) + 500; // MB
      console.log(
        `[Recording] Completed: ${recordingId} (${recording.fileSize}MB)`
      );
    } catch (error) {
      recording.status = 'failed';
      console.error(`[Recording] Failed: ${recordingId}`, error);
    }
  }

  /**
   * Convert recording to specific format
   */
  private async convertFormat(recordingId: string, format: string): Promise<void> {
    return new Promise(resolve => {
      // Simulate conversion time based on format
      const conversionTime = format === 'hls' ? 2000 : 3000;
      setTimeout(() => {
        console.log(`[Recording] Converted to ${format}: ${recordingId}`);
        resolve();
      }, conversionTime);
    });
  }

  /**
   * Get recording status
   */
  getRecordingStatus(recordingId: string): RecordingJob | null {
    return this.recordings.get(recordingId) || null;
  }

  /**
   * Get all recordings
   */
  getAllRecordings(): RecordingJob[] {
    return Array.from(this.recordings.values());
  }

  /**
   * Get recordings by session
   */
  getRecordingsBySession(sessionId: string): RecordingJob[] {
    return Array.from(this.recordings.values()).filter(r => r.sessionId === sessionId);
  }

  /**
   * Delete recording
   */
  deleteRecording(recordingId: string): boolean {
    return this.recordings.delete(recordingId);
  }

  /**
   * Notify about failover event
   */
  private notifyFailover(from: string, to: string): void {
    // This would integrate with the notification system
    console.log(`[Failover] Notification: Stream failover from ${from} to ${to}`);
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring(): void {
    this.healthCheckIntervals.forEach(interval => clearInterval(interval));
    this.healthCheckIntervals = [];
    console.log('[Failover] Health monitoring stopped');
  }

  /**
   * Get failover statistics
   */
  getFailoverStats(): {
    activeEndpoint: string | null;
    totalEndpoints: number;
    healthyEndpoints: number;
    failedEndpoints: number;
    totalRecordings: number;
    completedRecordings: number;
    failedRecordings: number;
  } {
    const endpoints = Array.from(this.endpoints.values());
    const recordings = Array.from(this.recordings.values());

    return {
      activeEndpoint: this.currentActiveEndpoint,
      totalEndpoints: endpoints.length,
      healthyEndpoints: endpoints.filter(e => e.status === 'active').length,
      failedEndpoints: endpoints.filter(e => e.status === 'failed').length,
      totalRecordings: recordings.length,
      completedRecordings: recordings.filter(r => r.status === 'completed').length,
      failedRecordings: recordings.filter(r => r.status === 'failed').length,
    };
  }
}

// Export singleton instance
export const failoverService = new FailoverService({
  primaryEndpoint: process.env.PRIMARY_RTMP_URL || 'rtmp://primary.example.com/live',
  secondaryEndpoint: process.env.SECONDARY_RTMP_URL || 'rtmp://secondary.example.com/live',
  tertiaryEndpoint: process.env.TERTIARY_RTMP_URL || 'rtmp://tertiary.example.com/live',
  healthCheckInterval: 10000, // 10 seconds
  failureThreshold: 3, // 3 consecutive failures
  recordingPath: process.env.RECORDING_PATH || '/tmp/recordings',
});
