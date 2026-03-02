export interface RevenueStream {
  streamId: string;
  name: string;
  type: 'subscription' | 'licensing' | 'partnership' | 'marketplace' | 'premium_features' | 'api_access' | 'consulting';
  monthlyRevenue: number;
  growthRate: number;
  status: 'active' | 'planning' | 'scaling';
}

export interface AssetPortfolio {
  portfolioId: string;
  name: string;
  assets: { type: string; value: number; growth: number }[];
  totalValue: number;
  lastUpdated: number;
}

export interface WealthMetric {
  metricId: string;
  name: string;
  value: number;
  target: number;
  timeline: string;
  progress: number;
}

export class WealthBuildingService {
  private static revenueStreams: RevenueStream[] = [];
  private static portfolios: AssetPortfolio[] = [];
  private static metrics: WealthMetric[] = [];

  static initializeDefaultStreams(): void {
    this.createRevenueStream('Premium Subscriptions', 'subscription', 50000, 0.15);
    this.createRevenueStream('Template Marketplace', 'marketplace', 25000, 0.25);
    this.createRevenueStream('API Licensing', 'api_access', 30000, 0.20);
    this.createRevenueStream('Enterprise Partnerships', 'partnership', 40000, 0.30);
    this.createRevenueStream('Creator Revenue Share', 'licensing', 35000, 0.18);
  }

  static createRevenueStream(name: string, type: RevenueStream['type'], monthlyRevenue: number, growthRate: number): RevenueStream {
    const stream: RevenueStream = {
      streamId: `stream-${Date.now()}`,
      name,
      type,
      monthlyRevenue,
      growthRate,
      status: 'active',
    };
    this.revenueStreams.push(stream);
    return stream;
  }

  static createAssetPortfolio(name: string, assets: { type: string; value: number; growth: number }[]): AssetPortfolio {
    const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
    const portfolio: AssetPortfolio = {
      portfolioId: `portfolio-${Date.now()}`,
      name,
      assets,
      totalValue,
      lastUpdated: Date.now(),
    };
    this.portfolios.push(portfolio);
    return portfolio;
  }

  static createWealthMetric(name: string, target: number, timeline: string): WealthMetric {
    const metric: WealthMetric = {
      metricId: `metric-${Date.now()}`,
      name,
      value: 0,
      target,
      timeline,
      progress: 0,
    };
    this.metrics.push(metric);
    return metric;
  }

  static getRevenueStreams(): RevenueStream[] {
    return this.revenueStreams;
  }

  static getPortfolios(): AssetPortfolio[] {
    return this.portfolios;
  }

  static getWealthMetrics(): WealthMetric[] {
    return this.metrics;
  }

  static calculateTotalMonthlyRevenue(): number {
    return this.revenueStreams.reduce((sum, s) => sum + s.monthlyRevenue, 0);
  }

  static calculateProjectedAnnualRevenue(): number {
    return this.revenueStreams.reduce((sum, s) => {
      const monthlyWithGrowth = s.monthlyRevenue * (1 + s.growthRate);
      return sum + (monthlyWithGrowth * 12);
    }, 0);
  }

  static calculateTotalAssetValue(): number {
    return this.portfolios.reduce((sum, p) => sum + p.totalValue, 0);
  }

  static getWealthDashboard() {
    const monthlyRevenue = this.calculateTotalMonthlyRevenue();
    const annualRevenue = this.calculateProjectedAnnualRevenue();
    const totalAssets = this.calculateTotalAssetValue();
    const netWorth = monthlyRevenue * 12 + totalAssets;

    return {
      monthlyRevenue: monthlyRevenue.toFixed(2),
      projectedAnnualRevenue: annualRevenue.toFixed(2),
      totalAssets: totalAssets.toFixed(2),
      projectedNetWorth: netWorth.toFixed(2),
      revenueStreams: this.revenueStreams.length,
      activeStreams: this.revenueStreams.filter(s => s.status === 'active').length,
      portfolios: this.portfolios.length,
      wealthMetrics: this.metrics.length,
      avgGrowthRate: (this.revenueStreams.reduce((sum, s) => sum + s.growthRate, 0) / Math.max(this.revenueStreams.length, 1) * 100).toFixed(2),
    };
  }

  static getRevenueProjection(months: number = 12): Array<{ month: number; revenue: number }> {
    const projection = [];
    let currentRevenue = this.calculateTotalMonthlyRevenue();

    for (let i = 0; i < months; i++) {
      projection.push({ month: i + 1, revenue: Math.round(currentRevenue) });
      currentRevenue *= 1.08; // 8% average monthly growth
    }

    return projection;
  }

  static updateMetricProgress(metricId: string, value: number): WealthMetric | null {
    const metric = this.metrics.find(m => m.metricId === metricId);
    if (metric) {
      metric.value = value;
      metric.progress = (value / metric.target) * 100;
    }
    return metric || null;
  }

  static getWealthBuildingRecommendations(): string[] {
    return [
      'Expand premium subscription tier with exclusive features',
      'Launch creator revenue share program to increase engagement',
      'Develop API licensing partnerships with major platforms',
      'Build white-label solutions for enterprise clients',
      'Create affiliate program for template creators',
      'Establish strategic partnerships with media companies',
      'Develop mobile app to reach new user segments',
      'Launch certification program for professional users',
    ];
  }
}

WealthBuildingService.initializeDefaultStreams();
