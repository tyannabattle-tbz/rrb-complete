import { getDb } from '../db';

export interface ListenerChurnMetrics {
  listenerId: string;
  churnRisk: 'low' | 'medium' | 'high' | 'critical';
  lastListenDate: Date;
  daysSinceLastListen: number;
  averageListeningFrequency: number; // days between sessions
  favoriteChannels: number[];
  totalSessionsLast30Days: number;
  averageSessionDuration: number; // minutes
  engagementScore: number; // 0-100
  recommendedAction: string;
}

export interface ListenerRetentionCampaign {
  id: string;
  listenerId: string;
  campaignType: 'email' | 'sms' | 'in_app' | 'push';
  message: string;
  recommendedChannels: number[];
  sentAt: Date;
  openedAt?: Date;
  clickedAt?: Date;
  conversionAt?: Date;
}

export interface RetentionAnalytics {
  totalListeners: number;
  activeListeners: number; // listened in last 7 days
  atRiskListeners: number; // haven't listened in 14+ days
  churnedListeners: number; // haven't listened in 30+ days
  averageRetention: number; // percentage
  campaignEffectiveness: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  topRetentionChannels: Array<{
    channelId: number;
    channelName: string;
    retentionRate: number;
  }>;
}

export class ListenerRetentionService {
  private db = getDb();

  async analyzeListenerChurn(listenerId: string): Promise<ListenerChurnMetrics> {
    // Fetch listener data from database
    // For now, return mock data
    const mockData: ListenerChurnMetrics = {
      listenerId,
      churnRisk: 'low',
      lastListenDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      daysSinceLastListen: 2,
      averageListeningFrequency: 3, // every 3 days
      favoriteChannels: [1, 2, 3, 33, 34], // RRB Main, Soul & R&B, Jazz, 432Hz, 528Hz
      totalSessionsLast30Days: 10,
      averageSessionDuration: 45,
      engagementScore: 75,
      recommendedAction: 'Send personalized playlist recommendation',
    };

    // Calculate churn risk
    if (mockData.daysSinceLastListen > 30) {
      mockData.churnRisk = 'critical';
      mockData.recommendedAction = 'Send urgent re-engagement campaign';
    } else if (mockData.daysSinceLastListen > 14) {
      mockData.churnRisk = 'high';
      mockData.recommendedAction = 'Send win-back email with exclusive content';
    } else if (mockData.daysSinceLastListen > 7) {
      mockData.churnRisk = 'medium';
      mockData.recommendedAction = 'Send reminder about new episodes';
    }

    return mockData;
  }

  async getRetentionAnalytics(): Promise<RetentionAnalytics> {
    // Fetch analytics from database
    // For now, return mock data
    const analytics: RetentionAnalytics = {
      totalListeners: 5000,
      activeListeners: 3500, // 70%
      atRiskListeners: 1000, // 20%
      churnedListeners: 500, // 10%
      averageRetention: 75,
      campaignEffectiveness: {
        sent: 1000,
        opened: 650, // 65% open rate
        clicked: 325, // 50% click rate
        converted: 162, // 50% conversion rate
      },
      topRetentionChannels: [
        { channelId: 1, channelName: 'RRB Main Radio', retentionRate: 85 },
        { channelId: 33, channelName: '432Hz Healing', retentionRate: 80 },
        { channelId: 2, channelName: 'Soul & R&B Classics', retentionRate: 78 },
        { channelId: 3, channelName: 'Jazz Lounge', retentionRate: 75 },
        { channelId: 39, channelName: 'Seraph AI Radio', retentionRate: 72 },
      ],
    };

    return analytics;
  }

  async createRetentionCampaign(
    listenerId: string,
    campaignType: 'email' | 'sms' | 'in_app' | 'push'
  ): Promise<ListenerRetentionCampaign> {
    const churnMetrics = await this.analyzeListenerChurn(listenerId);

    // Generate personalized message based on churn risk
    let message = '';
    switch (churnMetrics.churnRisk) {
      case 'critical':
        message = `We miss you! Come back and enjoy exclusive content on your favorite channels: ${churnMetrics.favoriteChannels.join(', ')}`;
        break;
      case 'high':
        message = `New episodes are waiting for you! Check out fresh content on ${churnMetrics.favoriteChannels[0]}`;
        break;
      case 'medium':
        message = `Don't miss out! New shows are live on your favorite channels`;
        break;
      default:
        message = `Thanks for listening! Check out our latest episodes`;
    }

    const campaign: ListenerRetentionCampaign = {
      id: `campaign-${Date.now()}`,
      listenerId,
      campaignType,
      message,
      recommendedChannels: churnMetrics.favoriteChannels,
      sentAt: new Date(),
    };

    // In production, save to database and send campaign
    await this.sendCampaign(campaign);

    return campaign;
  }

  private async sendCampaign(campaign: ListenerRetentionCampaign): Promise<void> {
    console.log(`[ListenerRetention] Sending ${campaign.campaignType} campaign to ${campaign.listenerId}`);
    console.log(`Message: ${campaign.message}`);
    // In production, integrate with email/SMS/push providers
  }

  async generatePersonalizedPlaylist(
    listenerId: string,
    length: number = 10
  ): Promise<Array<{ channelId: number; channelName: string; reason: string }>> {
    const churnMetrics = await this.analyzeListenerChurn(listenerId);

    // Generate playlist based on favorite channels and engagement patterns
    const playlist = [
      {
        channelId: churnMetrics.favoriteChannels[0],
        channelName: 'Favorite Channel',
        reason: 'Your most listened channel',
      },
      {
        channelId: 33,
        channelName: '432Hz Healing',
        reason: 'Trending with similar listeners',
      },
      {
        channelId: 39,
        channelName: 'Seraph AI Radio',
        reason: 'Recommended by our AI',
      },
      {
        channelId: 1,
        channelName: 'RRB Main Radio',
        reason: 'Popular with your demographic',
      },
      {
        channelId: 40,
        channelName: 'Candy AI Radio',
        reason: 'Entertainment picks',
      },
    ];

    return playlist.slice(0, length);
  }

  async trackCampaignPerformance(
    campaignId: string,
    event: 'opened' | 'clicked' | 'converted'
  ): Promise<void> {
    console.log(`[ListenerRetention] Campaign ${campaignId} event: ${event}`);
    // In production, update campaign metrics in database
  }

  async identifyAtRiskListeners(): Promise<ListenerChurnMetrics[]> {
    // Fetch all listeners and analyze churn risk
    // For now, return empty array
    // In production, query database for listeners with daysSinceLastListen > 14
    return [];
  }

  async sendBulkRetentionCampaigns(): Promise<number> {
    const atRiskListeners = await this.identifyAtRiskListeners();
    let campaignsSent = 0;

    for (const listener of atRiskListeners) {
      try {
        await this.createRetentionCampaign(listener.listenerId, 'email');
        campaignsSent++;
      } catch (error) {
        console.error(`Failed to send campaign to listener ${listener.listenerId}:`, error);
      }
    }

    console.log(`[ListenerRetention] Sent ${campaignsSent} retention campaigns`);
    return campaignsSent;
  }
}

export const listenerRetentionService = new ListenerRetentionService();
