/**
 * Daily Status Report Service
 * Sends comprehensive status reports every evening after sunset
 * Covers QUMUS, RRB, HybridCast, Canryn, and Sweet Miracles
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

      console.log('[Daily Report] Generated report:', report);

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
   * Build comprehensive report
   */
  private buildReport(): DailyReport {
    const ecosystemReport = ecosystemIntegration.getEcosystemReport();
    const studioHealth = stateOfStudio.getHealthReport();
    const audioStats = audioStreamingService.getStreamingStats();
    const audioQuality = audioStreamingService.getQualityReport();

    const autonomyRatio = ecosystemIntegration.getAutonomyRatio();

    const recommendations: string[] = [];

    // Generate recommendations based on metrics
    if (studioHealth.trends.averageHealth < 80) {
      recommendations.push('System health below optimal. Recommend maintenance check.');
    }

    if (studioHealth.trends.averageAutonomy < 85) {
      recommendations.push('Autonomy level below target. Consider policy adjustments.');
    }

    if (audioQuality.healthPercentage < 80) {
      recommendations.push('Audio stream quality degraded. Check broadcast infrastructure.');
    }

    if (audioStats.totalListeners < 100) {
      recommendations.push('Listener engagement low. Consider promotional activities.');
    }

    if (recommendations.length === 0) {
      recommendations.push('All systems operating at optimal levels.');
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
        channels: ecosystemReport.systems.rrb.channels,
        listeners: audioStats.totalListeners,
        broadcastQuality: ecosystemReport.systems.rrb.broadcastQuality,
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
      ecosystemHealth: studioHealth.currentMetrics.systemHealth,
      autonomyMetrics: {
        autonomousPercentage: autonomyRatio.autonomous,
        humanOversightPercentage: autonomyRatio.human,
        autonomousDecisions: studioHealth.currentMetrics.autonomousDecisions,
        humanInterventions: studioHealth.currentMetrics.humanInterventions,
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
- QUMUS: ${report.qumusStatus.status.toUpperCase()} (${report.qumusStatus.autonomyLevel}% autonomous)
- RRB Radio: ${report.rrbStatus.status.toUpperCase()} (${report.rrbStatus.listeners} listeners)
- HybridCast: ${report.hybridCastStatus.status.toUpperCase()} (${report.hybridCastStatus.coverage}% coverage)
- Canryn: ${report.canrynStatus.status.toUpperCase()} (Health: ${report.canrynStatus.operationalHealth}%)
- Sweet Miracles: ${report.sweetMiraclesStatus.status.toUpperCase()} (${report.sweetMiraclesStatus.communityProjects} projects)

ECOSYSTEM HEALTH: ${report.ecosystemHealth}%

AUTONOMY METRICS:
- Autonomous Control: ${report.autonomyMetrics.autonomousPercentage}%
- Human Oversight: ${report.autonomyMetrics.humanOversightPercentage}%
- Autonomous Decisions: ${report.autonomyMetrics.autonomousDecisions}
- Human Interventions: ${report.autonomyMetrics.humanInterventions}

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
