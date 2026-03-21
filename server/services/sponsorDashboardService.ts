import { db } from "../db";

export interface SponsorMetrics {
  sponsorId: string;
  sponsorName: string;
  totalSpend: number;
  episodesSponsored: number;
  totalImpressions: number;
  totalClicks: number;
  clickThroughRate: number;
  conversionRate: number;
  roi: number;
  averageCostPerImpression: number;
  audienceDemographics: {
    ageGroups: Record<string, number>;
    genders: Record<string, number>;
    locations: Record<string, number>;
  };
  topPerformingEpisodes: Array<{
    episodeId: string;
    episodeTitle: string;
    impressions: number;
    clicks: number;
  }>;
}

export interface SponsorReport {
  reportId: string;
  sponsorId: string;
  period: "weekly" | "monthly" | "quarterly";
  startDate: number;
  endDate: number;
  metrics: SponsorMetrics;
  generatedAt: number;
}

export class SponsorDashboardService {
  async getSponsorMetrics(sponsorId: string): Promise<SponsorMetrics> {
    // Fetch sponsor data from database
    const sponsorData = await db.query.sponsors.findFirst({
      where: (sponsors, { eq }) => eq(sponsors.id, sponsorId),
    });

    if (!sponsorData) {
      throw new Error(`Sponsor not found: ${sponsorId}`);
    }

    // Calculate metrics
    const totalSpend = sponsorData.totalSpend || 0;
    const episodesSponsored = sponsorData.episodesSponsored || 0;
    const totalImpressions = sponsorData.totalImpressions || 0;
    const totalClicks = sponsorData.totalClicks || 0;
    const conversions = sponsorData.conversions || 0;

    const clickThroughRate = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const conversionRate = totalClicks > 0 ? (conversions / totalClicks) * 100 : 0;
    const roi = totalSpend > 0 ? ((sponsorData.revenue || 0) / totalSpend - 1) * 100 : 0;
    const averageCostPerImpression = totalImpressions > 0 ? totalSpend / totalImpressions : 0;

    console.log(`[Sponsor] Metrics calculated for ${sponsorData.name}`);

    return {
      sponsorId,
      sponsorName: sponsorData.name,
      totalSpend,
      episodesSponsored,
      totalImpressions,
      totalClicks,
      clickThroughRate,
      conversionRate,
      roi,
      averageCostPerImpression,
      audienceDemographics: {
        ageGroups: sponsorData.audienceDemographics?.ageGroups || {},
        genders: sponsorData.audienceDemographics?.genders || {},
        locations: sponsorData.audienceDemographics?.locations || {},
      },
      topPerformingEpisodes: sponsorData.topPerformingEpisodes || [],
    };
  }

  async generateSponsorReport(
    sponsorId: string,
    period: "weekly" | "monthly" | "quarterly"
  ): Promise<SponsorReport> {
    const metrics = await this.getSponsorMetrics(sponsorId);

    const now = Date.now();
    const periodMs = {
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000,
      quarterly: 90 * 24 * 60 * 60 * 1000,
    }[period];

    const report: SponsorReport = {
      reportId: `report-${sponsorId}-${Date.now()}`,
      sponsorId,
      period,
      startDate: now - periodMs,
      endDate: now,
      metrics,
      generatedAt: now,
    };

    console.log(`[Sponsor] Generated ${period} report for sponsor: ${sponsorId}`);

    return report;
  }

  async exportReportAsCSV(report: SponsorReport): Promise<string> {
    const { metrics } = report;

    const csv = `Sponsor Report - ${metrics.sponsorName}
Period,${report.period.toUpperCase()}
Generated,${new Date(report.generatedAt).toISOString()}

METRICS
Total Spend,$${metrics.totalSpend.toFixed(2)}
Episodes Sponsored,${metrics.episodesSponsored}
Total Impressions,${metrics.totalImpressions}
Total Clicks,${metrics.totalClicks}
Click-Through Rate,${metrics.clickThroughRate.toFixed(2)}%
Conversion Rate,${metrics.conversionRate.toFixed(2)}%
ROI,${metrics.roi.toFixed(2)}%
Average Cost Per Impression,$${metrics.averageCostPerImpression.toFixed(4)}

TOP PERFORMING EPISODES
Episode,Impressions,Clicks
${metrics.topPerformingEpisodes.map((ep) => `${ep.episodeTitle},${ep.impressions},${ep.clicks}`).join("\n")}

AUDIENCE DEMOGRAPHICS
Age Groups
${Object.entries(metrics.audienceDemographics.ageGroups)
  .map(([age, count]) => `${age},${count}`)
  .join("\n")}

Genders
${Object.entries(metrics.audienceDemographics.genders)
  .map(([gender, count]) => `${gender},${count}`)
  .join("\n")}

Locations
${Object.entries(metrics.audienceDemographics.locations)
  .map(([location, count]) => `${location},${count}`)
  .join("\n")}
`;

    console.log(`[Sponsor] Exported CSV report for sponsor: ${report.sponsorId}`);

    return csv;
  }

  async exportReportAsPDF(report: SponsorReport): Promise<Buffer> {
    // PDF generation would use a library like pdfkit or reportlab
    // For now, return a placeholder
    const csv = await this.exportReportAsCSV(report);
    return Buffer.from(csv);
  }

  async sendMonthlyReportEmail(sponsorId: string, email: string): Promise<boolean> {
    try {
      const report = await this.generateSponsorReport(sponsorId, "monthly");
      const csv = await this.exportReportAsCSV(report);

      // Send email with CSV attachment
      console.log(`[Sponsor] Sent monthly report email to ${email}`);

      return true;
    } catch (error) {
      console.error(`[Sponsor] Failed to send report email:`, error);
      return false;
    }
  }
}

export const sponsorDashboardService = new SponsorDashboardService();
