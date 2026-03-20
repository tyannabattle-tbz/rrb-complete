/**
 * Unified Feed Email Alerts Service
 * Sends email notifications when feed health degrades or critical errors occur
 */

import { notifyOwner } from '../_core/notification';

interface HealthAlert {
  timestamp: number;
  severity: 'warning' | 'critical';
  system: 'tyOS' | 'qumus' | 'rrb' | 'all';
  message: string;
  details: Record<string, unknown>;
}

class UnifiedFeedEmailAlerts {
  private lastAlertTime: Record<string, number> = {};
  private alertCooldown = 5 * 60 * 1000; // 5 minutes between similar alerts
  private criticalAlertCooldown = 1 * 60 * 1000; // 1 minute for critical alerts

  /**
   * Send health failure alert
   */
  async sendHealthFailureAlert(alert: HealthAlert) {
    try {
      const alertKey = `${alert.system}-${alert.severity}`;
      const lastAlert = this.lastAlertTime[alertKey] || 0;
      const cooldown = alert.severity === 'critical' ? this.criticalAlertCooldown : this.alertCooldown;

      // Skip if within cooldown period
      if (Date.now() - lastAlert < cooldown) {
        console.log(`[Email Alerts] Alert skipped (cooldown): ${alertKey}`);
        return;
      }

      this.lastAlertTime[alertKey] = Date.now();

      const title = this.getAlertTitle(alert);
      const content = this.formatAlertContent(alert);

      console.log(`[Email Alerts] Sending ${alert.severity} alert for ${alert.system}`);
      
      const success = await notifyOwner({ title, content });
      
      if (!success) {
        console.warn('[Email Alerts] Failed to send notification');
      }
    } catch (error) {
      console.error('[Email Alerts] Error sending alert:', error);
    }
  }

  /**
   * Send daily status report
   */
  async sendDailyStatusReport(status: {
    tyOS: Record<string, unknown>;
    qumus: Record<string, unknown>;
    rrb: Record<string, unknown>;
  }) {
    try {
      const title = '🎙️ Unified Feed Daily Status Report';
      const content = this.formatStatusReport(status);

      console.log('[Email Alerts] Sending daily status report');
      
      const success = await notifyOwner({ title, content });
      
      if (!success) {
        console.warn('[Email Alerts] Failed to send daily report');
      }
    } catch (error) {
      console.error('[Email Alerts] Error sending daily report:', error);
    }
  }

  /**
   * Send recovery notification
   */
  async sendRecoveryNotification(system: string, recoveryTime: number) {
    try {
      const title = `✅ ${system} Feed Recovered`;
      const content = `The ${system} unified feed has recovered after ${Math.round(recoveryTime / 1000)} seconds of downtime.`;

      console.log(`[Email Alerts] Sending recovery notification for ${system}`);
      
      const success = await notifyOwner({ title, content });
      
      if (!success) {
        console.warn('[Email Alerts] Failed to send recovery notification');
      }
    } catch (error) {
      console.error('[Email Alerts] Error sending recovery notification:', error);
    }
  }

  private getAlertTitle(alert: HealthAlert): string {
    const severityIcon = alert.severity === 'critical' ? '🚨' : '⚠️';
    const systemName = this.getSystemName(alert.system);
    return `${severityIcon} ${systemName} Feed ${alert.severity === 'critical' ? 'Critical' : 'Warning'} Alert`;
  }

  private getSystemName(system: string): string {
    const names: Record<string, string> = {
      tyOS: 'Ty OS',
      qumus: 'QUMUS',
      rrb: 'RRB',
      all: 'Unified Feed',
    };
    return names[system] || system;
  }

  private formatAlertContent(alert: HealthAlert): string {
    const lines = [
      `**System:** ${this.getSystemName(alert.system)}`,
      `**Severity:** ${alert.severity.toUpperCase()}`,
      `**Time:** ${new Date(alert.timestamp).toLocaleString()}`,
      `**Message:** ${alert.message}`,
      '',
      '**Details:**',
    ];

    // Add details
    Object.entries(alert.details).forEach(([key, value]) => {
      lines.push(`- ${key}: ${JSON.stringify(value)}`);
    });

    lines.push('');
    lines.push('**Action Required:**');
    lines.push('1. Check the Unified Feed Health Dashboard: /unified-feed-health');
    lines.push('2. Review system logs for detailed diagnostics');
    lines.push('3. Manual recovery may be required if auto-recovery fails');

    return lines.join('\n');
  }

  private formatStatusReport(status: Record<string, unknown>): string {
    const lines = [
      '## Unified Feed Status Report',
      '',
      '### Ty OS Registry',
      this.formatSystemStatus(status.tyOS),
      '',
      '### QUMUS Feed',
      this.formatSystemStatus(status.qumus),
      '',
      '### RRB Stream',
      this.formatSystemStatus(status.rrb),
      '',
      '### Recommendations',
      '- Monitor reconnect attempts',
      '- Check channel availability',
      '- Review sync intervals',
      '- Verify fallback streams are operational',
    ];

    return lines.join('\n');
  }

  private formatSystemStatus(systemStatus: unknown): string {
    if (typeof systemStatus === 'object' && systemStatus !== null) {
      return Object.entries(systemStatus)
        .map(([key, value]) => `- **${key}:** ${JSON.stringify(value)}`)
        .join('\n');
    }
    return `- Status: ${JSON.stringify(systemStatus)}`;
  }
}

// Export singleton instance
export const unifiedFeedEmailAlerts = new UnifiedFeedEmailAlerts();
