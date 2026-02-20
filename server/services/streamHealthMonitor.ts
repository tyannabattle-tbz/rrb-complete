import { db } from '../db';
import { notifyOwner } from '../_core/notification';

/**
 * Stream Health Monitoring Service
 * Continuously monitors all active streams for health and performance
 * Implements automated failover and alerting
 */

interface StreamHealthMetrics {
  streamId: string;
  operatorId: number;
  status: 'healthy' | 'degraded' | 'offline';
  uptime: number;
  bitrate: number;
  fps: number;
  resolution: string;
  latency: number;
  lastCheck: Date;
  failoverAttempts: number;
  backupStreamUrl?: string;
}

interface HealthAlert {
  id: string;
  streamId: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

class StreamHealthMonitor {
  private activeStreams: Map<string, StreamHealthMetrics> = new Map();
  private alerts: Map<string, HealthAlert> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 30000; // 30 seconds

  /**
   * Start monitoring all streams
   */
  startMonitoring(): void {
    if (this.monitoringInterval) {
      console.log('[StreamHealth] Monitoring already active');
      return;
    }

    console.log('[StreamHealth] Starting continuous monitoring');

    this.monitoringInterval = setInterval(() => {
      this.checkAllStreams();
    }, this.CHECK_INTERVAL);

    // Initial check
    this.checkAllStreams();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('[StreamHealth] Monitoring stopped');
    }
  }

  /**
   * Register a stream for monitoring
   */
  registerStream(
    streamId: string,
    operatorId: number,
    streamUrl: string,
    backupUrl?: string
  ): void {
    const metrics: StreamHealthMetrics = {
      streamId,
      operatorId,
      status: 'healthy',
      uptime: 100,
      bitrate: 2500,
      fps: 30,
      resolution: '1080p',
      latency: 2,
      lastCheck: new Date(),
      failoverAttempts: 0,
      backupStreamUrl: backupUrl,
    };

    this.activeStreams.set(streamId, metrics);
    console.log(`[StreamHealth] Registered stream: ${streamId}`);
  }

  /**
   * Unregister a stream
   */
  unregisterStream(streamId: string): void {
    this.activeStreams.delete(streamId);
    console.log(`[StreamHealth] Unregistered stream: ${streamId}`);
  }

  /**
   * Check all active streams
   */
  private async checkAllStreams(): Promise<void> {
    for (const [streamId, metrics] of this.activeStreams) {
      await this.checkStreamHealth(streamId, metrics);
    }
  }

  /**
   * Check individual stream health
   */
  private async checkStreamHealth(streamId: string, metrics: StreamHealthMetrics): Promise<void> {
    try {
      // Simulate stream health check
      const healthStatus = this.simulateHealthCheck();

      metrics.lastCheck = new Date();
      metrics.bitrate = healthStatus.bitrate;
      metrics.fps = healthStatus.fps;
      metrics.latency = healthStatus.latency;

      // Determine stream status
      if (healthStatus.bitrate < 1000 || healthStatus.fps < 24) {
        metrics.status = 'degraded';
        await this.handleDegradedStream(streamId, metrics);
      } else if (healthStatus.bitrate === 0) {
        metrics.status = 'offline';
        await this.handleOfflineStream(streamId, metrics);
      } else {
        metrics.status = 'healthy';
        metrics.uptime = 100;
        this.clearAlerts(streamId);
      }

      this.activeStreams.set(streamId, metrics);
    } catch (error) {
      console.error(`[StreamHealth] Check failed for ${streamId}:`, error);
      metrics.status = 'offline';
      await this.handleOfflineStream(streamId, metrics);
    }
  }

  /**
   * Simulate stream health check (in production, would make real API calls)
   */
  private simulateHealthCheck(): {
    bitrate: number;
    fps: number;
    latency: number;
  } {
    // Randomly simulate various stream conditions
    const rand = Math.random();

    if (rand < 0.85) {
      // 85% healthy
      return {
        bitrate: 2400 + Math.random() * 600,
        fps: 29 + Math.random() * 2,
        latency: 1 + Math.random() * 3,
      };
    } else if (rand < 0.95) {
      // 10% degraded
      return {
        bitrate: 800 + Math.random() * 400,
        fps: 15 + Math.random() * 10,
        latency: 5 + Math.random() * 10,
      };
    } else {
      // 5% offline
      return {
        bitrate: 0,
        fps: 0,
        latency: 0,
      };
    }
  }

  /**
   * Handle degraded stream
   */
  private async handleDegradedStream(streamId: string, metrics: StreamHealthMetrics): Promise<void> {
    const alertId = `alert_${streamId}_degraded_${Date.now()}`;

    const alert: HealthAlert = {
      id: alertId,
      streamId,
      severity: 'warning',
      message: `Stream ${streamId} is degraded. Bitrate: ${metrics.bitrate.toFixed(0)} kbps, FPS: ${metrics.fps.toFixed(0)}, Latency: ${metrics.latency.toFixed(0)}ms`,
      timestamp: new Date(),
      resolved: false,
    };

    this.alerts.set(alertId, alert);

    console.log(`[StreamHealth] ⚠️ Degraded: ${streamId}`);

    // Notify operator
    await notifyOwner({
      title: 'Stream Degraded',
      content: `Stream ${streamId} for operator ${metrics.operatorId} is experiencing degradation. Bitrate: ${metrics.bitrate.toFixed(0)} kbps`,
    });
  }

  /**
   * Handle offline stream
   */
  private async handleOfflineStream(streamId: string, metrics: StreamHealthMetrics): Promise<void> {
    const alertId = `alert_${streamId}_offline_${Date.now()}`;

    const alert: HealthAlert = {
      id: alertId,
      streamId,
      severity: 'critical',
      message: `Stream ${streamId} is offline`,
      timestamp: new Date(),
      resolved: false,
    };

    this.alerts.set(alertId, alert);

    console.log(`[StreamHealth] 🔴 Offline: ${streamId}`);

    // Attempt failover if backup available
    if (metrics.backupStreamUrl && metrics.failoverAttempts < 3) {
      await this.attemptFailover(streamId, metrics);
    }

    // Notify operator
    await notifyOwner({
      title: 'Stream Offline - Critical',
      content: `Stream ${streamId} for operator ${metrics.operatorId} is offline. Failover attempts: ${metrics.failoverAttempts}`,
    });
  }

  /**
   * Attempt automatic failover
   */
  private async attemptFailover(streamId: string, metrics: StreamHealthMetrics): Promise<void> {
    metrics.failoverAttempts++;

    console.log(
      `[StreamHealth] Attempting failover for ${streamId} (attempt ${metrics.failoverAttempts}/3)`
    );

    try {
      // Simulate failover
      const failoverSuccess = Math.random() > 0.3; // 70% success rate

      if (failoverSuccess) {
        metrics.status = 'healthy';
        metrics.failoverAttempts = 0;

        console.log(`[StreamHealth] ✅ Failover successful for ${streamId}`);

        await notifyOwner({
          title: 'Stream Restored',
          content: `Stream ${streamId} has been restored via failover to backup source`,
        });
      } else {
        console.log(`[StreamHealth] ❌ Failover failed for ${streamId}`);
      }
    } catch (error) {
      console.error(`[StreamHealth] Failover error for ${streamId}:`, error);
    }
  }

  /**
   * Clear alerts for a stream
   */
  private clearAlerts(streamId: string): void {
    for (const [alertId, alert] of this.alerts) {
      if (alert.streamId === streamId && !alert.resolved) {
        alert.resolved = true;
        console.log(`[StreamHealth] Alert resolved: ${alertId}`);
      }
    }
  }

  /**
   * Get stream metrics
   */
  getStreamMetrics(streamId: string): StreamHealthMetrics | undefined {
    return this.activeStreams.get(streamId);
  }

  /**
   * Get all stream metrics
   */
  getAllMetrics(): StreamHealthMetrics[] {
    return Array.from(this.activeStreams.values());
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): HealthAlert[] {
    return Array.from(this.alerts.values()).filter((a) => !a.resolved);
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalStreams: number;
    healthyStreams: number;
    degradedStreams: number;
    offlineStreams: number;
    averageUptime: number;
    activeAlerts: number;
  } {
    const metrics = Array.from(this.activeStreams.values());

    const healthyCount = metrics.filter((m) => m.status === 'healthy').length;
    const degradedCount = metrics.filter((m) => m.status === 'degraded').length;
    const offlineCount = metrics.filter((m) => m.status === 'offline').length;
    const avgUptime =
      metrics.length > 0
        ? metrics.reduce((sum, m) => sum + m.uptime, 0) / metrics.length
        : 0;

    return {
      totalStreams: metrics.length,
      healthyStreams: healthyCount,
      degradedStreams: degradedCount,
      offlineStreams: offlineCount,
      averageUptime: avgUptime,
      activeAlerts: this.getActiveAlerts().length,
    };
  }
}

export const streamHealthMonitor = new StreamHealthMonitor();
