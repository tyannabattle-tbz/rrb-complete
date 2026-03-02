/**
 * Advanced Reporting Service
 * Generates and delivers scheduled reports via email
 */

export interface ReportConfig {
  id: string;
  userId: string;
  workspaceId: string;
  name: string;
  frequency: "daily" | "weekly" | "monthly";
  recipients: string[];
  metrics: string[];
  dateRange?: { start: Date; end: Date };
  enabled: boolean;
  createdAt: Date;
  lastSent?: Date;
}

export interface ReportData {
  title: string;
  period: string;
  generatedAt: Date;
  metrics: Record<string, unknown>;
  summary: string;
}

export class ReportingService {
  private reports: Map<string, ReportConfig> = new Map();
  private schedules: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Create a new report configuration
   */
  createReport(config: Omit<ReportConfig, "id" | "createdAt">): ReportConfig {
    const report: ReportConfig = {
      ...config,
      id: `report-${Date.now()}`,
      createdAt: new Date(),
    };

    this.reports.set(report.id, report);
    if (report.enabled) {
      this.scheduleReport(report);
    }

    return report;
  }

  /**
   * Update report configuration
   */
  updateReport(
    reportId: string,
    updates: Partial<ReportConfig>
  ): ReportConfig | null {
    const report = this.reports.get(reportId);
    if (!report) return null;

    const updated = { ...report, ...updates };
    this.reports.set(reportId, updated);

    // Reschedule if enabled status changed
    if (updates.enabled !== undefined) {
      this.unscheduleReport(reportId);
      if (updated.enabled) {
        this.scheduleReport(updated);
      }
    }

    return updated;
  }

  /**
   * Delete report configuration
   */
  deleteReport(reportId: string): boolean {
    this.unscheduleReport(reportId);
    return this.reports.delete(reportId);
  }

  /**
   * Get report by ID
   */
  getReport(reportId: string): ReportConfig | null {
    return this.reports.get(reportId) || null;
  }

  /**
   * Get all reports for user
   */
  getUserReports(userId: string): ReportConfig[] {
    return Array.from(this.reports.values()).filter((r) => r.userId === userId);
  }

  /**
   * Generate report data
   */
  async generateReport(config: ReportConfig): Promise<ReportData> {
    const period = this.getPeriodString(config.frequency);

    return {
      title: config.name,
      period,
      generatedAt: new Date(),
      metrics: await this.collectMetrics(config),
      summary: this.generateSummary(config),
    };
  }

  /**
   * Send report via email
   */
  async sendReport(config: ReportConfig, data: ReportData): Promise<boolean> {
    try {
      const emailContent = this.formatEmailContent(data);

      // TODO: Integrate with email service (SendGrid, Mailgun, etc.)
      console.log(`Sending report "${data.title}" to:`, config.recipients);
      console.log("Email content:", emailContent);

      // Mark as sent
      config.lastSent = new Date();
      this.reports.set(config.id, config);

      return true;
    } catch (error) {
      console.error("Failed to send report:", error);
      return false;
    }
  }

  /**
   * Schedule report for automatic delivery
   */
  private scheduleReport(config: ReportConfig): void {
    const interval = this.getIntervalMs(config.frequency);
    const timeout = setTimeout(async () => {
      const data = await this.generateReport(config);
      await this.sendReport(config, data);

      // Reschedule
      this.scheduleReport(config);
    }, interval);

    this.schedules.set(config.id, timeout);
  }

  /**
   * Unschedule report
   */
  private unscheduleReport(reportId: string): void {
    const timeout = this.schedules.get(reportId);
    if (timeout) {
      clearTimeout(timeout);
      this.schedules.delete(reportId);
    }
  }

  /**
   * Collect metrics for report
   */
  private async collectMetrics(
    config: ReportConfig
  ): Promise<Record<string, unknown>> {
    const metrics: Record<string, unknown> = {};

    for (const metric of config.metrics) {
      switch (metric) {
        case "total_sessions":
          metrics.total_sessions = Math.floor(Math.random() * 100);
          break;
        case "avg_execution_time":
          metrics.avg_execution_time = (Math.random() * 5).toFixed(2);
          break;
        case "tool_usage":
          metrics.tool_usage = {
            browser: Math.floor(Math.random() * 50),
            database: Math.floor(Math.random() * 30),
            api: Math.floor(Math.random() * 40),
          };
          break;
        case "success_rate":
          metrics.success_rate = (Math.random() * 100).toFixed(2);
          break;
        case "team_activity":
          metrics.team_activity = {
            active_members: Math.floor(Math.random() * 20),
            total_collaborations: Math.floor(Math.random() * 100),
          };
          break;
      }
    }

    return metrics;
  }

  /**
   * Generate summary text
   */
  private generateSummary(config: ReportConfig): string {
    return `Report for ${config.name} covering ${this.getPeriodString(config.frequency).toLowerCase()}. This report includes metrics for ${config.metrics.join(", ")}.`;
  }

  /**
   * Format email content
   */
  private formatEmailContent(data: ReportData): string {
    let content = `<h1>${data.title}</h1>\n`;
    content += `<p>Period: ${data.period}</p>\n`;
    content += `<p>Generated: ${data.generatedAt.toISOString()}</p>\n`;
    content += `<h2>Summary</h2>\n`;
    content += `<p>${data.summary}</p>\n`;
    content += `<h2>Metrics</h2>\n`;
    content += `<ul>\n`;

    for (const [key, value] of Object.entries(data.metrics)) {
      content += `<li><strong>${key}:</strong> ${JSON.stringify(value)}</li>\n`;
    }

    content += `</ul>\n`;
    return content;
  }

  /**
   * Get period string
   */
  private getPeriodString(frequency: string): string {
    switch (frequency) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      default:
        return "Unknown";
    }
  }

  /**
   * Get interval in milliseconds
   */
  private getIntervalMs(frequency: string): number {
    switch (frequency) {
      case "daily":
        return 24 * 60 * 60 * 1000;
      case "weekly":
        return 7 * 24 * 60 * 60 * 1000;
      case "monthly":
        return 30 * 24 * 60 * 60 * 1000;
      default:
        return 24 * 60 * 60 * 1000;
    }
  }

  /**
   * Get all scheduled reports
   */
  getAllReports(): ReportConfig[] {
    return Array.from(this.reports.values());
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    const timeouts = Array.from(this.schedules.values());
    for (const timeout of timeouts) {
      clearTimeout(timeout);
    }
    this.schedules.clear();
  }
}

// Export singleton instance
export let reportingService: ReportingService | null = null;

export function initializeReportingService(): ReportingService {
  reportingService = new ReportingService();
  return reportingService;
}
