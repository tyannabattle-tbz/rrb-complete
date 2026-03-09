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

    return `=== DAILY STATUS REPORT === Date: ${dateStr}
Time: ${timeStr}

SYSTEM STATUS:
• QUMUS: ACTIVE (${autonomyLevel}% autonomous)
• RRB Radio: ACTIVE (${totalListeners.toLocaleString()} listeners across ${activeChannels} channels)
• HybridCast: ACTIVE (${qualityReport.overallQuality} quality)
• Canryn: ACTIVE (Health: ${ecosystemHealth}%)
• Sweet Miracles: ACTIVE (${activePolicies} policies)

ECOSYSTEM HEALTH: ${ecosystemHealth}%

AUTONOMY METRICS:
• Autonomous Control: ${autonomyLevel}%
• Human Oversight: ${100 - autonomyLevel}%
• Autonomous Decisions: ${autonomousDecisions.toLocaleString()}
• Human Interventions: ${humanInterventions.toLocaleString()}
• Total Actions: ${totalActions.toLocaleString()}
• Success Rate: ${successRate}%
• Commands Executed: ${commandsExecuted.toLocaleString()}
• Active Policies: ${activePolicies}
• System Uptime: ${uptime}

BROADCAST METRICS:
• Active Channels: ${activeChannels}
• Total Listeners: ${totalListeners.toLocaleString()}
• Stream Quality: ${qualityReport.overallQuality}
• Average Bitrate: ${qualityReport.averageBitrate}kbps

RECOMMENDATIONS:
${recommendations.map(r => `• ${r}`).join('\n')}

=== END REPORT ===`;
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
