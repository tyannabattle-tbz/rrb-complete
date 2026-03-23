import { notifyOwner } from '../_core/notification';

export interface AlertConfig {
  enabled: boolean;
  emailAddress?: string;
  criticalOnly: boolean;
  batchAlerts: boolean;
  batchIntervalMinutes: number;
}

export interface AlertEvent {
  type: 'error' | 'health_warning' | 'health_critical' | 'system_down';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  details?: Record<string, any>;
}

export class EmailAlertService {
  private static alertQueue: AlertEvent[] = [];
  private static lastAlertTime: Record<string, number> = {};
  private static alertDebounceMs = 300000; // 5 minutes

  /**
   * Send immediate alert for critical issues
   */
  static async sendCriticalAlert(event: AlertEvent): Promise<boolean> {
    try {
      const debounceKey = `${event.type}-${event.title}`;
      const now = Date.now();
      const lastTime = this.lastAlertTime[debounceKey] || 0;

      // Debounce: don't send same alert more than once per 5 minutes
      if (now - lastTime < this.alertDebounceMs) {
        console.log(`[EmailAlert] Debounced alert: ${debounceKey}`);
        return false;
      }

      this.lastAlertTime[debounceKey] = now;

      const alertContent = `
**${event.title}** (${event.severity.toUpperCase()})

Type: ${event.type}
Time: ${event.timestamp}
Message: ${event.message}

${event.details ? `Details:\n${JSON.stringify(event.details, null, 2)}` : ''}
      `.trim();

      // Send notification to owner
      const result = await notifyOwner({
        title: `🚨 ALERT: ${event.title}`,
        content: alertContent,
      });

      console.log(`[EmailAlert] Alert sent: ${event.title} (${result ? 'success' : 'failed'})`);
      return result;
    } catch (error) {
      console.error('[EmailAlert] Failed to send alert:', error);
      return false;
    }
  }

  /**
   * Queue alert for batch processing
   */
  static queueAlert(event: AlertEvent): void {
    this.alertQueue.push(event);
    console.log(`[EmailAlert] Alert queued: ${event.title} (total: ${this.alertQueue.length})`);
  }

  /**
   * Process batched alerts
   */
  static async processBatchAlerts(): Promise<boolean> {
    if (this.alertQueue.length === 0) {
      return true;
    }

    try {
      const criticalAlerts = this.alertQueue.filter(a => a.severity === 'critical');
      const highAlerts = this.alertQueue.filter(a => a.severity === 'high');
      const mediumAlerts = this.alertQueue.filter(a => a.severity === 'medium');

      const summary = `
**Alert Summary** (${new Date().toLocaleString()})

Critical Alerts: ${criticalAlerts.length}
${criticalAlerts.map(a => `  - ${a.title}`).join('\n')}

High Priority Alerts: ${highAlerts.length}
${highAlerts.map(a => `  - ${a.title}`).join('\n')}

Medium Priority Alerts: ${mediumAlerts.length}
${mediumAlerts.slice(0, 5).map(a => `  - ${a.title}`).join('\n')}
${mediumAlerts.length > 5 ? `  ... and ${mediumAlerts.length - 5} more` : ''}

Total Alerts: ${this.alertQueue.length}
      `.trim();

      const result = await notifyOwner({
        title: `📊 Batch Alert Report - ${this.alertQueue.length} alerts`,
        content: summary,
      });

      if (result) {
        this.alertQueue = [];
        console.log('[EmailAlert] Batch alerts processed and cleared');
      }

      return result;
    } catch (error) {
      console.error('[EmailAlert] Failed to process batch alerts:', error);
      return false;
    }
  }

  /**
   * Monitor for critical health issues
   */
  static async checkHealthStatus(healthStatus: any): Promise<void> {
    const criticalSystems = healthStatus.filter((s: any) => s.status === 'critical');
    const warningSystems = healthStatus.filter((s: any) => s.status === 'warning');

    if (criticalSystems.length > 0) {
      const event: AlertEvent = {
        type: 'health_critical',
        severity: 'critical',
        title: `${criticalSystems.length} Critical System(s) Down`,
        message: criticalSystems.map((s: any) => s.name).join(', '),
        timestamp: new Date().toISOString(),
        details: { systems: criticalSystems },
      };

      await this.sendCriticalAlert(event);
    } else if (warningSystems.length > 0) {
      const event: AlertEvent = {
        type: 'health_warning',
        severity: 'high',
        title: `${warningSystems.length} System Warning(s)`,
        message: warningSystems.map((s: any) => s.name).join(', '),
        timestamp: new Date().toISOString(),
        details: { systems: warningSystems },
      };

      this.queueAlert(event);
    }
  }

  /**
   * Monitor for error spikes
   */
  static async checkErrorSpike(errorCount: number, threshold: number = 10): Promise<void> {
    if (errorCount > threshold) {
      const event: AlertEvent = {
        type: 'error',
        severity: 'high',
        title: `Error Spike Detected: ${errorCount} errors`,
        message: `Error count exceeded threshold of ${threshold}`,
        timestamp: new Date().toISOString(),
        details: { errorCount, threshold },
      };

      await this.sendCriticalAlert(event);
    }
  }

  /**
   * Get alert statistics
   */
  static getAlertStats() {
    return {
      queuedAlerts: this.alertQueue.length,
      criticalAlerts: this.alertQueue.filter(a => a.severity === 'critical').length,
      highAlerts: this.alertQueue.filter(a => a.severity === 'high').length,
      lastAlerts: this.alertQueue.slice(-5),
    };
  }

  /**
   * Clear alert queue
   */
  static clearQueue(): void {
    const count = this.alertQueue.length;
    this.alertQueue = [];
    console.log(`[EmailAlert] Cleared ${count} alerts from queue`);
  }
}
