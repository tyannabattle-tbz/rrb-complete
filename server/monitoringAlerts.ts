/**
 * Monitoring Alerts and Threshold Configuration Service
 * 
 * Manages alert thresholds and notifications for system health
 */

export interface AlertThreshold {
  id: string;
  name: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  value: number;
  enabled: boolean;
  severity: 'critical' | 'warning' | 'info';
  notificationChannels: string[];
}

export interface Alert {
  id: string;
  thresholdId: string;
  metric: string;
  currentValue: number;
  threshold: number;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

class MonitoringAlertsService {
  private thresholds: Map<string, AlertThreshold> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private alertHistory: Alert[] = [];

  constructor() {
    this.initializeDefaultThresholds();
  }

  /**
   * Initialize default alert thresholds
   */
  private initializeDefaultThresholds() {
    const defaultThresholds: AlertThreshold[] = [
      {
        id: 'threshold-broadcast-viewers',
        name: 'Broadcast Viewer Count Critical',
        metric: 'broadcast:viewers',
        condition: 'less_than',
        value: 10,
        enabled: true,
        severity: 'warning',
        notificationChannels: ['email', 'webhook'],
      },
      {
        id: 'threshold-drone-health',
        name: 'Drone Fleet Health Critical',
        metric: 'drone:health',
        condition: 'less_than',
        value: 50,
        enabled: true,
        severity: 'critical',
        notificationChannels: ['email', 'webhook', 'sms'],
      },
      {
        id: 'threshold-data-source-disconnect',
        name: 'Data Source Disconnected',
        metric: 'data_source:connected',
        condition: 'equals',
        value: 0,
        enabled: true,
        severity: 'critical',
        notificationChannels: ['email', 'webhook'],
      },
      {
        id: 'threshold-webhook-failure-rate',
        name: 'Webhook Delivery Failure Rate High',
        metric: 'webhook:failure_rate',
        condition: 'greater_than',
        value: 10,
        enabled: true,
        severity: 'warning',
        notificationChannels: ['email', 'webhook'],
      },
      {
        id: 'threshold-qumus-error-rate',
        name: 'Qumus Decision Error Rate High',
        metric: 'qumus:error_rate',
        condition: 'greater_than',
        value: 5,
        enabled: true,
        severity: 'warning',
        notificationChannels: ['email', 'webhook'],
      },
      {
        id: 'threshold-fundraising-donations',
        name: 'Low Donation Activity',
        metric: 'fundraising:donations_per_hour',
        condition: 'less_than',
        value: 1,
        enabled: true,
        severity: 'info',
        notificationChannels: ['email'],
      },
    ];

    for (const threshold of defaultThresholds) {
      this.thresholds.set(threshold.id, threshold);
    }
  }

  /**
   * Register a new alert threshold
   */
  public registerThreshold(threshold: Omit<AlertThreshold, 'id'>): AlertThreshold {
    const id = `threshold-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newThreshold: AlertThreshold = { ...threshold, id };
    this.thresholds.set(id, newThreshold);
    return newThreshold;
  }

  /**
   * Update alert threshold
   */
  public updateThreshold(thresholdId: string, updates: Partial<AlertThreshold>): AlertThreshold | undefined {
    const threshold = this.thresholds.get(thresholdId);
    if (!threshold) return undefined;

    const updated = { ...threshold, ...updates, id: threshold.id };
    this.thresholds.set(thresholdId, updated);
    return updated;
  }

  /**
   * Get all thresholds
   */
  public getThresholds(): AlertThreshold[] {
    return Array.from(this.thresholds.values());
  }

  /**
   * Evaluate metric against thresholds
   */
  public evaluateMetric(metric: string, value: number): Alert[] {
    const triggeredAlerts: Alert[] = [];

    for (const [, threshold] of this.thresholds) {
      if (!threshold.enabled || threshold.metric !== metric) continue;

      let conditionMet = false;

      switch (threshold.condition) {
        case 'greater_than':
          conditionMet = value > threshold.value;
          break;
        case 'less_than':
          conditionMet = value < threshold.value;
          break;
        case 'equals':
          conditionMet = value === threshold.value;
          break;
        case 'not_equals':
          conditionMet = value !== threshold.value;
          break;
      }

      if (conditionMet) {
        const alert: Alert = {
          id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          thresholdId: threshold.id,
          metric,
          currentValue: value,
          threshold: threshold.value,
          severity: threshold.severity,
          message: `${threshold.name}: ${metric} = ${value} (threshold: ${threshold.value})`,
          timestamp: new Date(),
          acknowledged: false,
        };

        this.alerts.set(alert.id, alert);
        this.alertHistory.push(alert);
        triggeredAlerts.push(alert);

        // Trigger notifications
        this.notifyAlert(alert, threshold);
      }
    }

    return triggeredAlerts;
  }

  /**
   * Notify about alert
   */
  private async notifyAlert(alert: Alert, threshold: AlertThreshold) {
    for (const channel of threshold.notificationChannels) {
      try {
        switch (channel) {
          case 'email':
            await this.sendEmailNotification(alert);
            break;
          case 'webhook':
            await this.sendWebhookNotification(alert);
            break;
          case 'sms':
            await this.sendSmsNotification(alert);
            break;
        }
      } catch (error) {
        console.error(`[Alerts] Failed to send ${channel} notification:`, error);
      }
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(alert: Alert) {
    // Implementation would send email via configured service
    console.log(`[Alerts] Email notification: ${alert.message}`);
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(alert: Alert) {
    const webhookUrl = process.env.ALERT_WEBHOOK_URL;
    if (!webhookUrl) return;

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
        timeout: 5000,
      });
    } catch (error) {
      console.error('[Alerts] Webhook notification failed:', error);
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSmsNotification(alert: Alert) {
    // Implementation would send SMS via configured service
    console.log(`[Alerts] SMS notification: ${alert.message}`);
  }

  /**
   * Acknowledge alert
   */
  public acknowledgeAlert(alertId: string, acknowledgedBy: string): Alert | undefined {
    const alert = this.alerts.get(alertId);
    if (!alert) return undefined;

    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date();

    this.alerts.set(alertId, alert);
    return alert;
  }

  /**
   * Get active alerts
   */
  public getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter((a) => !a.acknowledged);
  }

  /**
   * Get alert history
   */
  public getAlertHistory(limit: number = 100): Alert[] {
    return this.alertHistory.slice(-limit).reverse();
  }

  /**
   * Get alert statistics
   */
  public getAlertStats() {
    const allAlerts = this.alertHistory;
    const critical = allAlerts.filter((a) => a.severity === 'critical').length;
    const warning = allAlerts.filter((a) => a.severity === 'warning').length;
    const info = allAlerts.filter((a) => a.severity === 'info').length;
    const acknowledged = allAlerts.filter((a) => a.acknowledged).length;

    return {
      totalAlerts: allAlerts.length,
      criticalCount: critical,
      warningCount: warning,
      infoCount: info,
      acknowledgedCount: acknowledged,
      activeCount: this.getActiveAlerts().length,
      acknowledgmentRate: allAlerts.length > 0 ? (acknowledged / allAlerts.length) * 100 : 0,
    };
  }
}

// Global instance
let alertsService: MonitoringAlertsService | null = null;

export function initializeMonitoringAlerts(): MonitoringAlertsService {
  if (!alertsService) {
    alertsService = new MonitoringAlertsService();
  }
  return alertsService;
}

export function getMonitoringAlerts(): MonitoringAlertsService | null {
  return alertsService;
}
