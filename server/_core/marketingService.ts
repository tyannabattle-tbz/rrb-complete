export interface MarketingCampaign {
  campaignId: string;
  name: string;
  channel: 'social' | 'email' | 'organic' | 'paid' | 'partnership';
  status: 'draft' | 'active' | 'paused' | 'completed';
  budget: number;
  reach: number;
  conversions: number;
  roi: number;
  createdAt: number;
}

export interface SocialAccount {
  accountId: string;
  platform: 'twitter' | 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'facebook';
  handle: string;
  followers: number;
  verified: boolean;
  connected: boolean;
  lastPost: number;
}

export interface WealthBuildingStrategy {
  strategyId: string;
  name: string;
  type: 'revenue_stream' | 'asset_building' | 'partnership' | 'licensing' | 'premium_tier';
  description: string;
  projectedRevenue: number;
  timeline: string;
  status: 'planning' | 'implementation' | 'active' | 'scaling';
}

export class MarketingService {
  private static campaigns: MarketingCampaign[] = [];
  private static socialAccounts: SocialAccount[] = [];
  private static strategies: WealthBuildingStrategy[] = [];

  static createCampaign(name: string, channel: MarketingCampaign['channel'], budget: number): MarketingCampaign {
    const campaign: MarketingCampaign = {
      campaignId: `camp-${Date.now()}`,
      name,
      channel,
      status: 'draft',
      budget,
      reach: 0,
      conversions: 0,
      roi: 0,
      createdAt: Date.now(),
    };
    this.campaigns.push(campaign);
    return campaign;
  }

  static connectSocialAccount(platform: SocialAccount['platform'], handle: string): SocialAccount {
    const account: SocialAccount = {
      accountId: `social-${Date.now()}`,
      platform,
      handle,
      followers: 0,
      verified: false,
      connected: true,
      lastPost: Date.now(),
    };
    this.socialAccounts.push(account);
    return account;
  }

  static createWealthStrategy(name: string, type: WealthBuildingStrategy['type'], description: string, projectedRevenue: number): WealthBuildingStrategy {
    const strategy: WealthBuildingStrategy = {
      strategyId: `wealth-${Date.now()}`,
      name,
      type,
      description,
      projectedRevenue,
      timeline: '6-12 months',
      status: 'planning',
    };
    this.strategies.push(strategy);
    return strategy;
  }

  static getCampaigns(): MarketingCampaign[] {
    return this.campaigns;
  }

  static getSocialAccounts(): SocialAccount[] {
    return this.socialAccounts;
  }

  static getStrategies(): WealthBuildingStrategy[] {
    return this.strategies;
  }

  static updateCampaignMetrics(campaignId: string, reach: number, conversions: number): MarketingCampaign | null {
    const campaign = this.campaigns.find(c => c.campaignId === campaignId);
    if (!campaign) return null;
    campaign.reach = reach;
    campaign.conversions = conversions;
    campaign.roi = campaign.budget > 0 ? ((conversions * 50 - campaign.budget) / campaign.budget) * 100 : 0;
    return campaign;
  }

  static launchCampaign(campaignId: string): MarketingCampaign | null {
    const campaign = this.campaigns.find(c => c.campaignId === campaignId) || null;
    if (campaign) campaign.status = 'active';
    return campaign;
  }

  static getMarketingDashboard() {
    const totalBudget = this.campaigns.reduce((sum, c) => sum + c.budget, 0);
    const totalReach = this.campaigns.reduce((sum, c) => sum + c.reach, 0);
    const avgROI = this.campaigns.length > 0 ? this.campaigns.reduce((sum, c) => sum + c.roi, 0) / this.campaigns.length : 0;
    const totalRevenue = this.strategies.reduce((sum, s) => sum + s.projectedRevenue, 0);

    return {
      campaigns: this.campaigns.length,
      activeCampaigns: this.campaigns.filter(c => c.status === 'active').length,
      totalBudget,
      totalReach,
      avgROI: avgROI.toFixed(2),
      socialAccounts: this.socialAccounts.length,
      connectedAccounts: this.socialAccounts.filter(a => a.connected).length,
      wealthStrategies: this.strategies.length,
      projectedAnnualRevenue: totalRevenue,
    };
  }
}
