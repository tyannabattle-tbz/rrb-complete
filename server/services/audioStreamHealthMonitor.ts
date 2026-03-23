/**
 * Audio Stream Health Monitoring Service
 * Monitors stream health with automatic reconnection logic
 */

export interface StreamHealthStatus {
  isConnected: boolean;
  lastCheckTime: number;
  consecutiveFailures: number;
  reconnectAttempts: number;
  nextRetryTime: number;
  streamUrl: string;
  latency: number;
  errorMessage?: string;
  uptime: number;
  totalChecks: number;
  successRate: number;
}

export interface StreamMetrics {
  streamId: string;
  status: StreamHealthStatus;
  bandwidth: number;
  bufferHealth: number;
  packetLoss: number;
  jitter: number;
}

class AudioStreamHealthMonitor {
  private streams: Map<string, StreamHealthStatus> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL_MS = 30000; // 30 seconds
  private readonly MAX_RETRIES = 5;
  private readonly BACKOFF_MULTIPLIER = 2;
  private readonly INITIAL_BACKOFF_MS = 1000;
  private readonly MAX_BACKOFF_MS = 16000;
  private readonly TIMEOUT_MS = 30000;

  /**
   * Initialize stream health monitoring
   */
  startMonitoring(streamUrl: string, streamId: string): void {
    if (!this.streams.has(streamId)) {
      this.streams.set(streamId, {
        isConnected: false,
        lastCheckTime: Date.now(),
        consecutiveFailures: 0,
        reconnectAttempts: 0,
        nextRetryTime: Date.now(),
        streamUrl,
        latency: 0,
        uptime: 0,
        totalChecks: 0,
        successRate: 100,
      });
    }

    if (!this.checkInterval) {
      this.checkInterval = setInterval(() => this.performHealthChecks(), this.CHECK_INTERVAL_MS);
    }
  }

  /**
   * Stop monitoring a specific stream
   */
  stopMonitoring(streamId: string): void {
    this.streams.delete(streamId);
    if (this.streams.size === 0 && this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Perform health checks on all streams
   */
  private async performHealthChecks(): Promise<void> {
    for (const [streamId, status] of this.streams.entries()) {
      await this.checkStreamHealth(streamId, status);
    }
  }

  /**
   * Check individual stream health
   */
  private async checkStreamHealth(streamId: string, status: StreamHealthStatus): Promise<void> {
    const now = Date.now();

    // Skip if not yet time to retry
    if (now < status.nextRetryTime) {
      return;
    }

    try {
      const startTime = Date.now();
      
      // Simulate stream health check (in production, would ping actual stream endpoint)
      const isHealthy = await this.pingStream(status.streamUrl);
      
      const latency = Date.now() - startTime;

      if (isHealthy) {
        status.isConnected = true;
        status.consecutiveFailures = 0;
        status.reconnectAttempts = 0;
        status.latency = latency;
        status.uptime += this.CHECK_INTERVAL_MS;
      } else {
        throw new Error('Stream health check failed');
      }
    } catch (error) {
      status.consecutiveFailures++;
      status.reconnectAttempts++;
      status.isConnected = false;
      status.errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Calculate exponential backoff
      const backoffMs = Math.min(
        this.INITIAL_BACKOFF_MS * Math.pow(this.BACKOFF_MULTIPLIER, status.consecutiveFailures - 1),
        this.MAX_BACKOFF_MS
      );

      status.nextRetryTime = now + backoffMs;

      // Check if max retries exceeded
      if (status.consecutiveFailures >= this.MAX_RETRIES) {
        status.isConnected = false;
        console.error(`[AudioStreamHealth] Stream ${streamId} exceeded max retries`);
      }
    }

    // Update metrics
    status.lastCheckTime = now;
    status.totalChecks++;
    status.successRate = ((status.totalChecks - status.reconnectAttempts) / status.totalChecks) * 100;
  }

  /**
   * Ping stream endpoint to check health
   */
  private async pingStream(streamUrl: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

      const response = await fetch(streamUrl, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok || response.status === 206; // 206 is Partial Content for streams
    } catch (error) {
      return false;
    }
  }

  /**
   * Get stream health status
   */
  getStreamStatus(streamId: string): StreamHealthStatus | undefined {
    return this.streams.get(streamId);
  }

  /**
   * Get all stream statuses
   */
  getAllStreamStatuses(): Map<string, StreamHealthStatus> {
    return new Map(this.streams);
  }

  /**
   * Get stream metrics
   */
  getStreamMetrics(streamId: string): StreamMetrics | undefined {
    const status = this.streams.get(streamId);
    if (!status) return undefined;

    return {
      streamId,
      status,
      bandwidth: this.calculateBandwidth(status),
      bufferHealth: this.calculateBufferHealth(status),
      packetLoss: this.calculatePacketLoss(status),
      jitter: this.calculateJitter(status),
    };
  }

  /**
   * Calculate bandwidth estimate
   */
  private calculateBandwidth(status: StreamHealthStatus): number {
    // Estimate based on latency and success rate
    if (!status.isConnected) return 0;
    return Math.max(0, 100 - status.latency / 10) * (status.successRate / 100);
  }

  /**
   * Calculate buffer health
   */
  private calculateBufferHealth(status: StreamHealthStatus): number {
    // Based on consecutive failures and retry attempts
    const failureImpact = (status.consecutiveFailures / this.MAX_RETRIES) * 50;
    return Math.max(0, 100 - failureImpact);
  }

  /**
   * Calculate packet loss
   */
  private calculatePacketLoss(status: StreamHealthStatus): number {
    // Estimate based on retry attempts
    return (status.reconnectAttempts / Math.max(1, status.totalChecks)) * 100;
  }

  /**
   * Calculate jitter
   */
  private calculateJitter(status: StreamHealthStatus): number {
    // Estimate based on latency variance
    return status.latency * 0.1; // Simplified calculation
  }

  /**
   * Force reconnection attempt
   */
  async forceReconnect(streamId: string): Promise<boolean> {
    const status = this.streams.get(streamId);
    if (!status) return false;

    status.nextRetryTime = Date.now(); // Force immediate retry
    await this.checkStreamHealth(streamId, status);
    return status.isConnected;
  }

  /**
   * Reset stream health status
   */
  resetStream(streamId: string): void {
    const status = this.streams.get(streamId);
    if (status) {
      status.consecutiveFailures = 0;
      status.reconnectAttempts = 0;
      status.nextRetryTime = Date.now();
      status.isConnected = false;
    }
  }

  /**
   * Get health report
   */
  getHealthReport(): {
    totalStreams: number;
    healthyStreams: number;
    unhealthyStreams: number;
    averageSuccessRate: number;
    averageLatency: number;
  } {
    const statuses = Array.from(this.streams.values());
    const healthyCount = statuses.filter(s => s.isConnected).length;
    const avgSuccessRate = statuses.length > 0 
      ? statuses.reduce((sum, s) => sum + s.successRate, 0) / statuses.length 
      : 0;
    const avgLatency = statuses.length > 0 
      ? statuses.reduce((sum, s) => sum + s.latency, 0) / statuses.length 
      : 0;

    return {
      totalStreams: statuses.length,
      healthyStreams: healthyCount,
      unhealthyStreams: statuses.length - healthyCount,
      averageSuccessRate: avgSuccessRate,
      averageLatency: avgLatency,
    };
  }
}

export const audioStreamHealthMonitor = new AudioStreamHealthMonitor();
