/**
 * Daily Status Report Service — Real-Time Data Only
 * 
 * ALL DATA from database tables. No fake/seeded/simulated numbers.
 * Pulls from: radio_channels, qumus_autonomous_actions, qumus_core_policies,
 * ecosystem_commands, policy_decisions, broadcast_schedules
 */

import { stateOfStudio } from './stateOfStudio';
import { audioStreamingService } from './audioStreamingService';
import { notifyOwner } from './notification';
import { getMonitorStatus, getLatestReport, getOutageHistory } from '../services/streamHealthMonitor';

class DailyStatusReportService {
  private reportScheduled = false;
  private reportTime = process.env.DAILY_REPORT_TIME || '19:00';

  constructor() {
    this.scheduleDailyReport();
  }

  private scheduleDailyReport(): void {
    if (this.reportScheduled) return;
    const [hours, minutes] = this.reportTime.split(':').map(Number);
    const now = new Date();
    let nextReport = new Date();
    nextReport.setHours(hours, minutes, 0, 0);
    if (nextReport < now) {
      nextReport.setDate(nextReport.getDate() + 1);
    }
    const timeUntilReport = nextReport.getTime() - now.getTime();
    console.log(`[Daily Report] Scheduled for ${nextReport.toISOString()} (in ${Math.round(timeUntilReport / 1000 / 60)} minutes)`);
    setTimeout(() => {
      this.reportScheduled = false;
      this.generateAndSendReport();
      this.scheduleDailyReport();
    }, timeUntilReport);
    this.reportScheduled = true;
  }

  /**
   * Generate and send report with ALL real data from database
   */
  async generateAndSendReport(): Promise<boolean> {
    try {
      const report = await this.buildReportContent();
      const now = new Date();
      const dateStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;

      const success = await notifyOwner({
        title: `Daily Status Report - ${dateStr}`,
        content: report,
      });

      if (success) {
        console.log('[Daily Report] Report sent successfully');
      } else {
        console.warn('[Daily Report] Failed to send report via notification');
      }
      return success;
    } catch (error) {
      console.error('[Daily Report] Error generating/sending report:', error);
      return false;
    }
  }

  /**
   * Build report content — ALL data from database
   */
  async buildReportContent(): Promise<string> {
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
    const timeStr = now.toLocaleTimeString('en-US', { hour12: true });

    // Pull ALL data from database via real-time services
    const [healthReport, streamingStats, qualityReport] = await Promise.all([
      stateOfStudio.getHealthReport(),
      audioStreamingService.getStreamingStats(),
      audioStreamingService.getQualityReport(),
    ]);

    const totalListeners = streamingStats.totalListeners;
    const activeChannels = streamingStats.activeChannels;
    const autonomousDecisions = healthReport.autonomousDecisions;
    const humanInterventions = healthReport.humanInterventions;
    const totalActions = healthReport.totalActions;
    const successRate = healthReport.successRate;
    const activePolicies = healthReport.activePolicies;
    const commandsExecuted = healthReport.commandsExecuted;
    const ecosystemHealth = healthReport.systemHealth;
    const autonomyLevel = healthReport.autonomyLevel;
    const uptime = healthReport.uptime;

    // Smart recommendations based on REAL data only
    const recommendations: string[] = [];

    if (totalListeners < 100 && activeChannels > 0) {
      recommendations.push('Listener count below 100. Consider promotional activities.');
    }
    if (totalListeners >= 1000) {
      recommendations.push(`Strong listener engagement: ${totalListeners.toLocaleString()} active listeners.`);
    }
    if (totalListeners >= 5000) {
      recommendations.push('Exceptional reach — consider expanding channel lineup.');
    }

    if (qualityReport.overallQuality !== 'EXCELLENT' && qualityReport.overallQuality !== 'GOOD') {
      recommendations.push('Audio stream quality needs attention. Check broadcast infrastructure.');
    }

    if (successRate < 80 && totalActions > 0) {
      recommendations.push(`Success rate at ${successRate}%. Review failed actions for patterns.`);
    }
    if (successRate >= 95 && totalActions > 100) {
      recommendations.push(`Excellent success rate: ${successRate}% across ${totalActions.toLocaleString()} actions.`);
    }

    if (autonomyLevel < 80 && totalActions > 0) {
      recommendations.push(`Autonomy at ${autonomyLevel}%. Review escalation policies.`);
    }
    if (autonomyLevel >= 90) {
      recommendations.push(`QUMUS operating at ${autonomyLevel}% autonomy — optimal range.`);
    }

    if (ecosystemHealth < 80) {
      recommendations.push('Ecosystem health below 80%. Run system diagnostics.');
    }

    if (recommendations.length === 0) {
      recommendations.push('All systems operating within normal parameters.');
    }

    // Stream Health Data
    const streamStatus = getMonitorStatus();
    const latestHealth = getLatestReport();
    const outages = getOutageHistory();
    const todayOutages = outages.filter(o => o.timestamp > Date.now() - 24 * 60 * 60 * 1000);

    let streamHealthSection = `\nSTREAM HEALTH (Policy #19):\n`;
    streamHealthSection += `\u2022 Monitor: ${streamStatus.isRunning ? 'RUNNING' : 'STOPPED'}\n`;
    streamHealthSection += `\u2022 Channels: ${streamStatus.healthyChannels}/${streamStatus.totalChannels} healthy`;
    if (streamStatus.currentUptime) {
      streamHealthSection += ` (${streamStatus.currentUptime.toFixed(1)}% uptime)`;
    }
    streamHealthSection += `\n`;
    streamHealthSection += `\u2022 Circuit Breaker: ${streamStatus.circuitBreaker.tripped ? 'TRIPPED' : 'Normal'}\n`;
    streamHealthSection += `\u2022 Auto-Restoration: ${streamStatus.autoRestoration?.pendingRestorations || 0} pending, ${streamStatus.autoRestoration?.totalRestored || 0} restored\n`;
    streamHealthSection += `\u2022 Total Checks Today: ${streamStatus.totalChecks}\n`;
    if (todayOutages.length > 0) {
      streamHealthSection += `\u2022 Outages Today: ${todayOutages.length}\n`;
      todayOutages.slice(-3).forEach(o => {
        streamHealthSection += `  - ${new Date(o.timestamp).toLocaleTimeString()}: ${o.channelsAffected} channels (${o.rootCause}) ${o.resolved ? '[Resolved]' : '[Active]'}\n`;
      });
    } else {
      streamHealthSection += `\u2022 Outages Today: 0 (clean day!)\n`;
    }
    if (streamStatus.downChannels.length > 0) {
      streamHealthSection += `\u2022 Currently Down: ${streamStatus.downChannels.map(c => c.name).join(', ')}\n`;
    }

    return `=== DAILY SUNSET STATUS REPORT === Date: ${dateStr}
Time: ${timeStr}

SYSTEM STATUS:
\u2022 QUMUS: ACTIVE (${autonomyLevel}% autonomous)
\u2022 RRB Radio: ACTIVE (${totalListeners.toLocaleString()} listeners across ${activeChannels} channels)
\u2022 HybridCast: ACTIVE (${qualityReport.overallQuality} quality)
\u2022 Canryn: ACTIVE (Health: ${ecosystemHealth}%)
\u2022 Sweet Miracles: ACTIVE (${activePolicies} policies)

ECOSYSTEM HEALTH: ${ecosystemHealth}%

AUTONOMY METRICS:
\u2022 Autonomous Control: ${autonomyLevel}%
\u2022 Human Oversight: ${100 - autonomyLevel}%
\u2022 Autonomous Decisions: ${autonomousDecisions.toLocaleString()}
\u2022 Human Interventions: ${humanInterventions.toLocaleString()}
\u2022 Total Actions: ${totalActions.toLocaleString()}
\u2022 Success Rate: ${successRate}%
\u2022 Commands Executed: ${commandsExecuted.toLocaleString()}
\u2022 Active Policies: ${activePolicies}
\u2022 System Uptime: ${uptime}

BROADCAST METRICS:
\u2022 Active Channels: ${activeChannels}
\u2022 Total Listeners: ${totalListeners.toLocaleString()}
\u2022 Stream Quality: ${qualityReport.overallQuality}
\u2022 Average Bitrate: ${qualityReport.averageBitrate}kbps
${streamHealthSection}
RECOMMENDATIONS:
${recommendations.map(r => `\u2022 ${r}`).join('\n')}

=== END SUNSET REPORT ===`;
  }

  /**
   * Manually trigger report
   */
  async triggerManualReport(): Promise<boolean> {
    console.log('[Daily Report] Manual report triggered');
    return this.generateAndSendReport();
  }

  /**
   * Get latest report content (for display, not sending)
   */
  async getLatestReport(): Promise<string> {
    return this.buildReportContent();
  }
}

// Export singleton instance
export const dailyStatusReportService = new DailyStatusReportService();

// Export standalone functions for backward compatibility
export async function generateDailyStatusReport(): Promise<string> {
  return dailyStatusReportService.getLatestReport();
}

export async function sendDailyStatusReport(): Promise<boolean> {
  return dailyStatusReportService.triggerManualReport();
}
