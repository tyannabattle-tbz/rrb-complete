import { getDb } from '../db';

export interface StreamHealthAlert {
  id: string;
  channelId: number;
  channelName: string;
  alertType: 'low_listeners' | 'technical_issue' | 'offline' | 'quality_degradation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold?: number;
  currentValue?: number;
  createdAt: Date;
  resolvedAt?: Date;
  autoRecoveryAttempted?: boolean;
  recoverySuccess?: boolean;
}

export interface ChannelHealthMetrics {
  channelId: number;
  channelName: string;
  status: 'online' | 'offline' | 'degraded';
  listenerCount: number;
  averageListenerCount: number;
  uptime: number; // percentage
  bitrate: number;
  latency: number; // ms
  errorRate: number; // percentage
  lastHealthCheck: Date;
  alerts: StreamHealthAlert[];
}

export class StreamHealthAlertsService {
  private db = getDb();
  private alertThresholds = {
    lowListeners: 10,
    highErrorRate: 5, // percentage
    highLatency: 2000, // ms
    lowBitrate: 64, // kbps
  };

  async checkChannelHealth(channelId: number): Promise<ChannelHealthMetrics> {
    // Fetch channel data
    const channel = await this.db.query.radioChannels.findFirst({
      where: (channels, { eq }) => eq(channels.id, channelId),
    });

    if (!channel) {
      throw new Error(`Channel ${channelId} not found`);
    }

    // Simulate health metrics (in production, fetch from actual stream)
    const metrics: ChannelHealthMetrics = {
      channelId,
      channelName: channel.name,
      status: 'online',
      listenerCount: Math.floor(Math.random() * 1000),
      averageListenerCount: 500,
      uptime: 99.5,
      bitrate: 192,
      latency: 500,
      errorRate: 0.5,
      lastHealthCheck: new Date(),
      alerts: [],
    };

    // Check for alerts
    const alerts = await this.generateAlerts(metrics);
    metrics.alerts = alerts;

    // Attempt auto-recovery if needed
    if (alerts.some((a) => a.severity === 'critical')) {
      await this.attemptAutoRecovery(channelId, alerts);
    }

    return metrics;
  }

  private async generateAlerts(metrics: ChannelHealthMetrics): Promise<StreamHealthAlert[]> {
    const alerts: StreamHealthAlert[] = [];

    // Check for low listeners
    if (metrics.listenerCount < this.alertThresholds.lowListeners) {
      alerts.push({
        id: `alert-${Date.now()}-listeners`,
        channelId: metrics.channelId,
        channelName: metrics.channelName,
        alertType: 'low_listeners',
        severity: metrics.listenerCount === 0 ? 'critical' : 'medium',
        message: `Low listener count: ${metrics.listenerCount} (threshold: ${this.alertThresholds.lowListeners})`,
        threshold: this.alertThresholds.lowListeners,
        currentValue: metrics.listenerCount,
        createdAt: new Date(),
      });
    }

    // Check for high error rate
    if (metrics.errorRate > this.alertThresholds.highErrorRate) {
      alerts.push({
        id: `alert-${Date.now()}-error`,
        channelId: metrics.channelId,
        channelName: metrics.channelName,
        alertType: 'quality_degradation',
        severity: metrics.errorRate > 10 ? 'critical' : 'high',
        message: `High error rate: ${metrics.errorRate}% (threshold: ${this.alertThresholds.highErrorRate}%)`,
        threshold: this.alertThresholds.highErrorRate,
        currentValue: metrics.errorRate,
        createdAt: new Date(),
      });
    }

    // Check for high latency
    if (metrics.latency > this.alertThresholds.highLatency) {
      alerts.push({
        id: `alert-${Date.now()}-latency`,
        channelId: metrics.channelId,
        channelName: metrics.channelName,
        alertType: 'technical_issue',
        severity: 'high',
        message: `High latency: ${metrics.latency}ms (threshold: ${this.alertThresholds.highLatency}ms)`,
        threshold: this.alertThresholds.highLatency,
        currentValue: metrics.latency,
        createdAt: new Date(),
      });
    }

    // Check for low bitrate
    if (metrics.bitrate < this.alertThresholds.lowBitrate) {
      alerts.push({
        id: `alert-${Date.now()}-bitrate`,
        channelId: metrics.channelId,
        channelName: metrics.channelName,
        alertType: 'quality_degradation',
        severity: 'medium',
        message: `Low bitrate: ${metrics.bitrate}kbps (threshold: ${this.alertThresholds.lowBitrate}kbps)`,
        threshold: this.alertThresholds.lowBitrate,
        currentValue: metrics.bitrate,
        createdAt: new Date(),
      });
    }

    // Check for offline status
    if (metrics.status === 'offline') {
      alerts.push({
        id: `alert-${Date.now()}-offline`,
        channelId: metrics.channelId,
        channelName: metrics.channelName,
        alertType: 'offline',
        severity: 'critical',
        message: `Channel is offline`,
        createdAt: new Date(),
      });
    }

    return alerts;
  }

  private async attemptAutoRecovery(
    channelId: number,
    alerts: StreamHealthAlert[]
  ): Promise<boolean> {
    console.log(`[StreamHealth] Attempting auto-recovery for channel ${channelId}`);

    try {
      // Simulate recovery procedures
      const recoveryProcedures = [
        this.restartStream(channelId),
        this.adjustBitrate(channelId),
        this.switchBackupStream(channelId),
      ];

      const results = await Promise.allSettled(recoveryProcedures);
      const success = results.some((r) => r.status === 'fulfilled' && r.value);

      if (success) {
        console.log(`[StreamHealth] Auto-recovery successful for channel ${channelId}`);
      }

      return success;
    } catch (error) {
      console.error(`[StreamHealth] Auto-recovery failed for channel ${channelId}:`, error);
      return false;
    }
  }

  private async restartStream(channelId: number): Promise<boolean> {
    console.log(`[StreamHealth] Restarting stream for channel ${channelId}`);
    // Simulate restart
    return Math.random() > 0.3; // 70% success rate
  }

  private async adjustBitrate(channelId: number): Promise<boolean> {
    console.log(`[StreamHealth] Adjusting bitrate for channel ${channelId}`);
    // Simulate bitrate adjustment
    return Math.random() > 0.2; // 80% success rate
  }

  private async switchBackupStream(channelId: number): Promise<boolean> {
    console.log(`[StreamHealth] Switching to backup stream for channel ${channelId}`);
    // Simulate backup stream switch
    return Math.random() > 0.1; // 90% success rate
  }

  async getAllChannelsHealth(): Promise<ChannelHealthMetrics[]> {
    const channels = await this.db.query.radioChannels.findMany();
    const healthMetrics = await Promise.all(
      channels.map((ch) => this.checkChannelHealth(ch.id))
    );
    return healthMetrics;
  }

  async getChannelHealthHistory(
    channelId: number,
    days: number = 7
  ): Promise<StreamHealthAlert[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // In production, fetch from database
    // For now, return empty array
    return [];
  }

  async sendAlert(alert: StreamHealthAlert, recipients: string[]): Promise<boolean> {
    console.log(`[StreamHealth] Sending alert to ${recipients.join(', ')}:`, alert.message);
    // In production, send email/SMS notifications
    return true;
  }

  async resolveAlert(alertId: string): Promise<void> {
    console.log(`[StreamHealth] Resolving alert ${alertId}`);
    // In production, update database
  }
}

export const streamHealthAlertsService = new StreamHealthAlertsService();
