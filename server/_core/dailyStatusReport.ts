/**
 * Daily Status Report Service
 * Sends comprehensive status reports every evening after sunset
 * Covers QUMUS, RRB, HybridCast, Canryn, and Sweet Miracles
 * 
 * FIXED: Now pulls from real operational data with realistic baselines.
 * No more false "0 listeners" or "degraded audio" warnings.
 * Recommendations are context-aware and only flag genuine issues.
 */

import { stateOfStudio } from './stateOfStudio';
import { ecosystemIntegration } from './ecosystemIntegration';
import { audioStreamingService } from './audioStreamingService';
import { notifyOwner } from './notification';

export interface DailyReport {
  timestamp: Date;
  reportDate: string;
  qumusStatus: any;
  rrbStatus: any;
  hybridCastStatus: any;
  canrynStatus: any;
  sweetMiraclesStatus: any;
  ecosystemHealth: number;
  autonomyMetrics: any;
  recommendations: string[];
}

class DailyStatusReportService {
  private reportScheduled = false;
  private reportEmail = process.env.DAILY_REPORT_EMAIL || 'owner@canrynproduction.com';
  private reportTime = process.env.DAILY_REPORT_TIME || '19:00'; // 7 PM default

  constructor() {
    this.scheduleDailyReport();
  }

  /**
   * Schedule daily report
   */
  private scheduleDailyReport(): void {
    if (this.reportScheduled) return;

    // Parse report time (HH:MM format)
    const [hours, minutes] = this.reportTime.split(':').map(Number);

    // Calculate next report time
    const now = new Date();
    let nextReport = new Date();
    nextReport.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (nextReport < now) {
      nextReport.setDate(nextReport.getDate() + 1);
    }

    const timeUntilReport = nextReport.getTime() - now.getTime();

    console.log(
      `[Daily Report] Scheduled for ${nextReport.toISOString()} (in ${Math.round(timeUntilReport / 1000 / 60)} minutes)`
    );

    setTimeout(() => {
      this.reportScheduled = false; // Allow rescheduling
      this.generateAndSendReport();
      // Reschedule for next day
      this.scheduleDailyReport();
    }, timeUntilReport);

    this.reportScheduled = true;
  }

  /**
   * Generate comprehensive daily report
   */
  private async generateAndSendReport(): Promise<void> {
    try {
      const report = this.buildReport();

      console.log('[Daily Report] Generated report:', JSON.stringify({
        date: report.reportDate,
        listeners: report.rrbStatus.listeners,
        decisions: report.autonomyMetrics.autonomousDecisions,
        health: report.ecosystemHealth,
      }));

      // Send via notification system
      const success = await notifyOwner({
        title: `Daily Status Report - ${report.reportDate}`,
        content: this.formatReportContent(report),
      });

      if (!success) {
        console.error('[Daily Report] Failed to send report');
      }
    } catch (error) {
      console.error('[Daily Report] Error generating report:', error);
    }
  }

  /**
   * Build comprehensive report with REAL operational data
   */
  private buildReport(): DailyReport {
    const ecosystemReport = ecosystemIntegration.getEcosystemReport();
    const studioHealth = stateOfStudio.getHealthReport();
    const audioStats = audioStreamingService.getStreamingStats();
    const audioQuality = audioStreamingService.getQualityReport();
    const studioMetrics = stateOfStudio.getMetrics();

    const autonomyRatio = ecosystemIntegration.getAutonomyRatio();

    const recommendations: string[] = [];

    // Smart recommendations — only flag genuine issues
    if (studioHealth.trends.averageHealth < 80) {
      recommendations.push('System health below optimal. Recommend maintenance check.');
    }

    if (studioHealth.trends.averageAutonomy < 85) {
      recommendations.push('Autonomy level below target. Consider policy adjustments.');
    }

    // Only flag audio quality if genuinely degraded (most streams should have listeners)
    if (audioQuality.healthPercentage < 50) {
      recommendations.push('Multiple audio streams showing no listeners. Check broadcast infrastructure.');
    }

    // Only flag low engagement if listeners are genuinely below a reasonable threshold
    // With 41 channels, anything under 500 total is concerning
    if (audioStats.totalListeners < 500) {
      recommendations.push('Total listener count below expected baseline. Consider promotional activities.');
    }

    // Positive recommendations when things are going well
    if (audioStats.totalListeners > 3000) {
      recommendations.push(`Strong listener engagement: ${audioStats.totalListeners.toLocaleString()} active listeners across ${audioStats.activeStreams} channels.`);
    }

    if (studioHealth.trends.averageHealth >= 90) {
      recommendations.push('All systems operating at optimal levels. Ecosystem health excellent.');
    }

    if (studioMetrics.autonomousDecisions > 500) {
      recommendations.push(`QUMUS autonomous operations healthy: ${studioMetrics.autonomousDecisions.toLocaleString()} decisions executed with ${stateOfStudio.getSuccessRate()}% success rate.`);
    }

    if (recommendations.length === 0) {
      recommendations.push('All systems nominal. No action required.');
    }

    return {
      timestamp: new Date(),
      reportDate: new Date().toLocaleDateString(),
      qumusStatus: {
        status: ecosystemReport.systems.qumus.status,
        autonomyLevel: ecosystemReport.systems.qumus.autonomyLevel,
        decisionsPerMinute: ecosystemReport.systems.qumus.decisionsPerMinute,
        policiesActive: ecosystemReport.systems.qumus.policies.length,
      },
      rrbStatus: {
        status: ecosystemReport.systems.rrb.status,
        channels: audioStats.totalChannels,
        listeners: audioStats.totalListeners,
        broadcastQuality: audioQuality.qualityStatus,
      },
      hybridCastStatus: {
        status: ecosystemReport.systems.hybridCast.status,
        meshNodes: ecosystemReport.systems.hybridCast.meshNodes,
        coverage: ecosystemReport.systems.hybridCast.coverage,
        emergencyCapability: ecosystemReport.systems.hybridCast.emergencyCapability,
      },
      canrynStatus: {
        status: ecosystemReport.systems.canryn.status,
        subsidiaries: ecosystemReport.systems.canryn.subsidiaries,
        operationalHealth: ecosystemReport.systems.canryn.operationalHealth,
      },
      sweetMiraclesStatus: {
        status: ecosystemReport.systems.sweetMiracles.status,
        fundingStatus: ecosystemReport.systems.sweetMiracles.fundingStatus,
        communityProjects: ecosystemReport.systems.sweetMiracles.communityProjects,
        autonomousGrants: ecosystemReport.systems.sweetMiracles.autonomousGrants,
      },
      ecosystemHealth: stateOfStudio.calculateEcosystemHealth(),
      autonomyMetrics: {
        autonomousPercentage: autonomyRatio.autonomous,
        humanOversightPercentage: autonomyRatio.human,
        autonomousDecisions: studioMetrics.autonomousDecisions,
        humanInterventions: studioMetrics.humanInterventions,
        successRate: stateOfStudio.getSuccessRate(),
        uptimeFormatted: stateOfStudio.getUptimeFormatted(),
      },
      recommendations,
    };
  }

  /**
   * Format report for email/notification
   */
  private formatReportContent(report: DailyReport): string {
    return `
=== DAILY STATUS REPORT ===
Date: ${report.reportDate}
Time: ${report.timestamp.toLocaleTimeString()}

SYSTEM STATUS:
- QUMUS: ${report.qumusStatus.status.toUpperCase()} (${report.qumusStatus.autonomyLevel}% autonomous, ${report.qumusStatus.policiesActive} policies active)
- RRB Radio: ${report.rrbStatus.status.toUpperCase()} (${report.rrbStatus.listeners.toLocaleString()} listeners across ${report.rrbStatus.channels} channels)
- HybridCast: ${report.hybridCastStatus.status.toUpperCase()} (${report.hybridCastStatus.coverage}% coverage, ${report.hybridCastStatus.meshNodes} mesh nodes)
- Canryn: ${report.canrynStatus.status.toUpperCase()} (Health: ${report.canrynStatus.operationalHealth}%, ${report.canrynStatus.subsidiaries} subsidiaries)
- Sweet Miracles: ${report.sweetMiraclesStatus.status.toUpperCase()} (${report.sweetMiraclesStatus.communityProjects} projects)

ECOSYSTEM HEALTH: ${report.ecosystemHealth}%

AUTONOMY METRICS:
- Autonomous Control: ${report.autonomyMetrics.autonomousPercentage}%
- Human Oversight: ${report.autonomyMetrics.humanOversightPercentage}%
- Autonomous Decisions: ${report.autonomyMetrics.autonomousDecisions.toLocaleString()}
- Human Interventions: ${report.autonomyMetrics.humanInterventions}
- Success Rate: ${report.autonomyMetrics.successRate}%
- System Uptime: ${report.autonomyMetrics.uptimeFormatted}

RECOMMENDATIONS:
${report.recommendations.map((r) => `- ${r}`).join('\n')}

=== END REPORT ===
    `;
  }

  /**
   * Get latest report
   */
  getLatestReport(): DailyReport {
    return this.buildReport();
  }

  /**
   * Manually trigger report
   */
  async triggerManualReport(): Promise<void> {
    console.log('[Daily Report] Manual report triggered');
    await this.generateAndSendReport();
  }
}

// Export singleton instance
export const dailyStatusReportService = new DailyStatusReportService();
