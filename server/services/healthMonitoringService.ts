/**
 * Health Monitoring Service
 * Real-time monitoring of broadcast system health with alerts and failover triggers
 */

interface HealthMetric {
  timestamp: number;
  cpu: number; // percentage
  memory: number; // percentage
  disk: number; // percentage free
  bitrate: number; // kbps
  fps: number;
  latency: number; // ms
  packetLoss: number; // percentage
  viewers: number;
  chatActivity: number; // messages per minute
  recordingStatus: 'recording' | 'paused' | 'stopped';
}

interface HealthAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: number;
  resolved: boolean;
}

interface HealthThresholds {
  cpu: { warning: number; critical: number };
  memory: { warning: number; critical: number };
  disk: { warning: number; critical: number };
  bitrate: { warning: number; critical: number };
  fps: { warning: number; critical: number };
  latency: { warning: number; critical: number };
  packetLoss: { warning: number; critical: number };
}

export class HealthMonitoringService {
  private metrics: HealthMetric[] = [];
  private alerts: HealthAlert[] = [];
  private thresholds: HealthThresholds;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alertCallbacks: Array<(alert: HealthAlert) => void> = [];

  constructor() {
    this.thresholds = {
      cpu: { warning: 75, critical: 90 },
      memory: { warning: 75, critical: 90 },
      disk: { warning: 20, critical: 10 }, // percentage free
      bitrate: { warning: 3000, critical: 2000 }, // kbps
      fps: { warning: 25, critical: 20 },
      latency: { warning: 100, critical: 200 }, // ms
      packetLoss: { warning: 2, critical: 5 }, // percentage
    };

    console.log('[Health Monitor] Service initialized');
  }

  /**
   * Record a health metric
   */
  recordMetric(metric: HealthMetric): void {
    this.metrics.push(metric);

    // Keep only last 1000 metrics (about 16 minutes at 1 per second)
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }

    // Check thresholds and generate alerts
    this.checkThresholds(metric);

    console.log(`[Health Monitor] Metric recorded: CPU ${metric.cpu}%, Memory ${metric.memory}%`);
  }

  /**
   * Check metric thresholds and generate alerts
   */
  private checkThresholds(metric: HealthMetric): void {
    const checks = [
      { key: 'cpu', value: metric.cpu, inverse: false },
      { key: 'memory', value: metric.memory, inverse: false },
      { key: 'disk', value: metric.disk, inverse: true }, // lower is worse
      { key: 'bitrate', value: metric.bitrate, inverse: false },
      { key: 'fps', value: metric.fps, inverse: false },
      { key: 'latency', value: metric.latency, inverse: false },
      { key: 'packetLoss', value: metric.packetLoss, inverse: false },
    ];

    checks.forEach(check => {
      const threshold = this.thresholds[check.key as keyof HealthThresholds];
      let severity: 'warning' | 'critical' | null = null;
      let message = '';

      if (check.inverse) {
        // For disk and similar metrics where lower is worse
        if (check.value <= threshold.critical) {
          severity = 'critical';
          message = `${check.key} critically low: ${check.value}%`;
        } else if (check.value <= threshold.warning) {
          severity = 'warning';
          message = `${check.key} warning: ${check.value}%`;
        }
      } else {
        // For CPU, memory, etc. where higher is worse
        if (check.value >= threshold.critical) {
          severity = 'critical';
          message = `${check.key} critical: ${check.value}%`;
        } else if (check.value >= threshold.warning) {
          severity = 'warning';
          message = `${check.key} warning: ${check.value}%`;
        }
      }

      if (severity) {
        this.createAlert(severity, check.key, check.value, threshold.critical, message);
      }
    });
  }

  /**
   * Create an alert
   */
  private createAlert(
    severity: 'critical' | 'warning' | 'info',
    metric: string,
    value: number,
    threshold: number,
    message: string
  ): void {
    // Check if similar alert already exists
    const existingAlert = this.alerts.find(
      a => a.metric === metric && !a.resolved && a.severity === severity
    );

    if (existingAlert) {
      return; // Don't create duplicate alerts
    }

    const alert: HealthAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      severity,
      metric,
      value,
      threshold,
      message,
      timestamp: Date.now(),
      resolved: false,
    };

    this.alerts.push(alert);
    console.log(`[Health Monitor] Alert created: ${severity.toUpperCase()} - ${message}`);

    // Trigger callbacks
    this.alertCallbacks.forEach(callback => callback(alert));
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): HealthMetric | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  /**
   * Get metrics for time range
   */
  getMetricsForTimeRange(startTime: number, endTime: number): HealthMetric[] {
    return this.metrics.filter(m => m.timestamp >= startTime && m.timestamp <= endTime);
  }

  /**
   * Get average metrics for time range
   */
  getAverageMetrics(timeWindowSeconds: number = 300): HealthMetric | null {
    const now = Date.now();
    const startTime = now - timeWindowSeconds * 1000;
    const relevantMetrics = this.getMetricsForTimeRange(startTime, now);

    if (relevantMetrics.length === 0) return null;

    const avg = {
      timestamp: now,
      cpu: relevantMetrics.reduce((sum, m) => sum + m.cpu, 0) / relevantMetrics.length,
      memory: relevantMetrics.reduce((sum, m) => sum + m.memory, 0) / relevantMetrics.length,
      disk: relevantMetrics.reduce((sum, m) => sum + m.disk, 0) / relevantMetrics.length,
      bitrate: relevantMetrics.reduce((sum, m) => sum + m.bitrate, 0) / relevantMetrics.length,
      fps: relevantMetrics.reduce((sum, m) => sum + m.fps, 0) / relevantMetrics.length,
      latency: relevantMetrics.reduce((sum, m) => sum + m.latency, 0) / relevantMetrics.length,
      packetLoss: relevantMetrics.reduce((sum, m) => sum + m.packetLoss, 0) / relevantMetrics.length,
      viewers: relevantMetrics[relevantMetrics.length - 1].viewers,
      chatActivity: relevantMetrics.reduce((sum, m) => sum + m.chatActivity, 0) / relevantMetrics.length,
      recordingStatus: relevantMetrics[relevantMetrics.length - 1].recordingStatus,
    };

    return avg;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): HealthAlert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  /**
   * Get critical alerts
   */
  getCriticalAlerts(): HealthAlert[] {
    return this.getActiveAlerts().filter(a => a.severity === 'critical');
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.resolved = true;
    console.log(`[Health Monitor] Alert resolved: ${alertId}`);
    return true;
  }

  /**
   * Subscribe to alerts
   */
  onAlert(callback: (alert: HealthAlert) => void): () => void {
    this.alertCallbacks.push(callback);
    return () => {
      this.alertCallbacks = this.alertCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Get health status summary
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    metrics: HealthMetric | null;
    activeAlerts: HealthAlert[];
    criticalAlerts: HealthAlert[];
    uptime: number;
  } {
    const activeAlerts = this.getActiveAlerts();
    const criticalAlerts = this.getCriticalAlerts();
    const currentMetrics = this.getCurrentMetrics();

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalAlerts.length > 0) {
      status = 'critical';
    } else if (activeAlerts.length > 0) {
      status = 'warning';
    }

    return {
      status,
      metrics: currentMetrics,
      activeAlerts,
      criticalAlerts,
      uptime: this.metrics.length > 0 ? Date.now() - this.metrics[0].timestamp : 0,
    };
  }

  /**
   * Should failover be triggered?
   */
  shouldTriggerFailover(): boolean {
    const criticalAlerts = this.getCriticalAlerts();

    // Trigger failover if:
    // - RTMP connection lost (bitrate critical)
    // - Multiple critical alerts
    // - Recording failed
    const hasCriticalBitrate = criticalAlerts.some(a => a.metric === 'bitrate');
    const hasMultipleCritical = criticalAlerts.length >= 2;

    return hasCriticalBitrate || hasMultipleCritical;
  }

  /**
   * Get failover recommendation
   */
  getFailoverRecommendation(): {
    shouldFailover: boolean;
    reason: string;
    severity: 'critical' | 'warning';
  } {
    const criticalAlerts = this.getCriticalAlerts();

    if (criticalAlerts.length === 0) {
      return {
        shouldFailover: false,
        reason: 'System healthy',
        severity: 'warning',
      };
    }

    const reasons = criticalAlerts.map(a => a.message).join(', ');

    return {
      shouldFailover: true,
      reason: `Critical issues detected: ${reasons}`,
      severity: 'critical',
    };
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends(timeWindowSeconds: number = 600): {
    cpuTrend: 'up' | 'down' | 'stable';
    memoryTrend: 'up' | 'down' | 'stable';
    bitrateTrend: 'up' | 'down' | 'stable';
    viewerTrend: 'up' | 'down' | 'stable';
  } {
    const halfWindow = timeWindowSeconds / 2;
    const now = Date.now();

    const firstHalf = this.getMetricsForTimeRange(now - timeWindowSeconds * 1000, now - halfWindow * 1000);
    const secondHalf = this.getMetricsForTimeRange(now - halfWindow * 1000, now);

    const getTrend = (
      firstValues: number[],
      secondValues: number[]
    ): 'up' | 'down' | 'stable' => {
      if (firstValues.length === 0 || secondValues.length === 0) return 'stable';

      const firstAvg = firstValues.reduce((a, b) => a + b, 0) / firstValues.length;
      const secondAvg = secondValues.reduce((a, b) => a + b, 0) / secondValues.length;

      const change = ((secondAvg - firstAvg) / firstAvg) * 100;

      if (change > 5) return 'up';
      if (change < -5) return 'down';
      return 'stable';
    };

    return {
      cpuTrend: getTrend(
        firstHalf.map(m => m.cpu),
        secondHalf.map(m => m.cpu)
      ),
      memoryTrend: getTrend(
        firstHalf.map(m => m.memory),
        secondHalf.map(m => m.memory)
      ),
      bitrateTrend: getTrend(
        firstHalf.map(m => m.bitrate),
        secondHalf.map(m => m.bitrate)
      ),
      viewerTrend: getTrend(
        firstHalf.map(m => m.viewers),
        secondHalf.map(m => m.viewers)
      ),
    };
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.metrics, null, 2);
    }

    // CSV format
    const headers = [
      'timestamp',
      'cpu',
      'memory',
      'disk',
      'bitrate',
      'fps',
      'latency',
      'packetLoss',
      'viewers',
      'chatActivity',
      'recordingStatus',
    ];

    const rows = this.metrics.map(m => [
      new Date(m.timestamp).toISOString(),
      m.cpu.toFixed(2),
      m.memory.toFixed(2),
      m.disk.toFixed(2),
      m.bitrate,
      m.fps,
      m.latency,
      m.packetLoss.toFixed(2),
      m.viewers,
      m.chatActivity.toFixed(2),
      m.recordingStatus,
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Clear old metrics
   */
  clearOldMetrics(ageSeconds: number = 3600): number {
    const cutoffTime = Date.now() - ageSeconds * 1000;
    const initialLength = this.metrics.length;

    this.metrics = this.metrics.filter(m => m.timestamp > cutoffTime);

    const removed = initialLength - this.metrics.length;
    console.log(`[Health Monitor] Cleared ${removed} old metrics`);

    return removed;
  }

  /**
   * Start continuous monitoring (simulated)
   */
  startMonitoring(intervalSeconds: number = 5): void {
    if (this.monitoringInterval) {
      console.warn('[Health Monitor] Monitoring already started');
      return;
    }

    this.monitoringInterval = setInterval(() => {
      // In production, collect real system metrics
      const metric: HealthMetric = {
        timestamp: Date.now(),
        cpu: Math.random() * 60 + 20, // 20-80%
        memory: Math.random() * 50 + 30, // 30-80%
        disk: Math.random() * 40 + 50, // 50-90% free
        bitrate: Math.random() * 2000 + 4500, // 4500-6500 kbps
        fps: 30,
        latency: Math.random() * 30 + 20, // 20-50ms
        packetLoss: Math.random() * 1, // 0-1%
        viewers: Math.floor(Math.random() * 5000 + 1000), // 1000-6000
        chatActivity: Math.random() * 50, // 0-50 messages/min
        recordingStatus: 'recording',
      };

      this.recordMetric(metric);
    }, intervalSeconds * 1000);

    console.log(`[Health Monitor] Monitoring started (${intervalSeconds}s interval)`);
  }

  /**
   * Stop continuous monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('[Health Monitor] Monitoring stopped');
    }
  }
}

// Export singleton instance
export const healthMonitoringService = new HealthMonitoringService();
