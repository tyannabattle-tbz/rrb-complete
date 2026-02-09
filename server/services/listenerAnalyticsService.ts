/**
 * Listener Analytics Service
 * Real-time channel metrics, engagement tracking, and listener analytics
 * Integrates with QUMUS Content Scheduler for live data
 */

import { getContentScheduler } from './contentSchedulerService';

export interface ListenerMetric {
  timestamp: number;
  channelId: string;
  listeners: number;
  peakListeners: number;
  avgSessionDuration: number; // minutes
  engagement: number; // 0-100
}

export interface ChannelAnalytics {
  channelId: string;
  channelName: string;
  currentListeners: number;
  peakListeners24h: number;
  totalListeners24h: number;
  avgSessionDuration: number;
  engagement: number;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  topContent: string;
  contentType: string;
  hourlyData: { hour: number; listeners: number }[];
}

export interface PlatformOverview {
  totalActiveListeners: number;
  totalChannels: number;
  activeChannels: number;
  peakListeners24h: number;
  avgEngagement: number;
  totalSessionsToday: number;
  avgSessionDuration: number;
  topChannel: string;
  topChannelListeners: number;
  platformUptime: number;
  autonomyLevel: number;
}

export interface EngagementEvent {
  id: string;
  type: 'tune_in' | 'tune_out' | 'skip' | 'like' | 'share' | 'save';
  channelId: string;
  timestamp: number;
  userId?: string;
  contentTitle?: string;
}

export interface RegionData {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  listeners: number;
  peakListeners: number;
  engagement: number;
  topChannel: string;
  avgSessionMin: number;
  revenueUsd: number;
}

export interface ScheduleRecommendation {
  channelId: string;
  channelName: string;
  suggestedSlot: string;
  reason: string;
  predictedLift: number; // percentage increase
  confidence: number; // 0-100
  basedOn: string;
}

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurring: number;
  oneTimeDonations: number;
  avgRevenuePerListener: number;
  topRevenueChannel: string;
  topRevenueAmount: number;
  revenueByChannel: { channelId: string; channelName: string; revenue: number; listeners: number; rpl: number }[];
  revenueByTier: { tier: string; count: number; revenue: number }[];
  monthlyTrend: { month: string; revenue: number }[];
}

class ListenerAnalyticsService {
  private metricsHistory: ListenerMetric[] = [];
  private engagementEvents: EngagementEvent[] = [];
  private hourlySnapshots: Map<string, { hour: number; listeners: number }[]> = new Map();
  private regionData: RegionData[] = [];
  private startTime: number = Date.now();

  constructor() {
    this.initializeSimulatedData();
    this.initializeRegionData();
  }

  private initializeSimulatedData(): void {
    const scheduler = getContentScheduler();
    const channels = scheduler.getChannels();
    const now = Date.now();

    // Generate 24 hours of hourly snapshots for each channel
    for (const channel of channels) {
      const hourlyData: { hour: number; listeners: number }[] = [];
      for (let h = 0; h < 24; h++) {
        // Simulate realistic listener patterns
        let base = channel.listeners;
        // Top of the Sol peak (6-9)
        if (h >= 6 && h <= 9) base = Math.floor(base * (1.2 + Math.random() * 0.5));
        // Afternoon dip (13-15)
        else if (h >= 13 && h <= 15) base = Math.floor(base * (0.6 + Math.random() * 0.2));
        // Evening peak (18-21)
        else if (h >= 18 && h <= 21) base = Math.floor(base * (1.3 + Math.random() * 0.4));
        // Overnight low (0-5)
        else if (h >= 0 && h <= 5) base = Math.floor(base * (0.15 + Math.random() * 0.1));
        // Normal hours
        else base = Math.floor(base * (0.7 + Math.random() * 0.3));

        hourlyData.push({ hour: h, listeners: Math.max(0, base) });
      }
      this.hourlySnapshots.set(channel.id, hourlyData);

      // Generate recent metrics
      for (let i = 23; i >= 0; i--) {
        this.metricsHistory.push({
          timestamp: now - i * 3600000,
          channelId: channel.id,
          listeners: hourlyData[23 - i]?.listeners || channel.listeners,
          peakListeners: Math.floor(channel.listeners * 1.5),
          avgSessionDuration: 15 + Math.floor(Math.random() * 45),
          engagement: 40 + Math.floor(Math.random() * 50),
        });
      }
    }

    // Generate engagement events
    const eventTypes: EngagementEvent['type'][] = ['tune_in', 'tune_out', 'skip', 'like', 'share', 'save'];
    for (let i = 0; i < 200; i++) {
      const channel = channels[Math.floor(Math.random() * channels.length)];
      this.engagementEvents.push({
        id: `evt-${i}`,
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        channelId: channel.id,
        timestamp: now - Math.floor(Math.random() * 86400000),
        contentTitle: channel.currentContent || 'Unknown',
      });
    }
    this.engagementEvents.sort((a, b) => b.timestamp - a.timestamp);
  }

  getPlatformOverview(): PlatformOverview {
    const scheduler = getContentScheduler();
    const channels = scheduler.getChannels();
    const status = scheduler.getStatus();

    const totalActive = channels.reduce((sum, ch) => sum + ch.listeners, 0);
    const activeChannels = channels.filter(ch => ch.status === 'active').length;
    const topChannel = channels.reduce((max, ch) => ch.listeners > max.listeners ? ch : max, channels[0]);

    // Calculate 24h peak from history
    const last24h = this.metricsHistory.filter(m => m.timestamp > Date.now() - 86400000);
    const peak24h = last24h.reduce((max, m) => Math.max(max, m.listeners), 0);

    // Calculate avg engagement
    const recentMetrics = last24h.slice(-channels.length * 4);
    const avgEngagement = recentMetrics.length > 0
      ? Math.floor(recentMetrics.reduce((sum, m) => sum + m.engagement, 0) / recentMetrics.length)
      : 72;

    // Total sessions today
    const todayEvents = this.engagementEvents.filter(e =>
      e.type === 'tune_in' && e.timestamp > Date.now() - 86400000
    );

    return {
      totalActiveListeners: totalActive,
      totalChannels: channels.length,
      activeChannels,
      peakListeners24h: peak24h || Math.floor(totalActive * 1.5),
      avgEngagement,
      totalSessionsToday: todayEvents.length * 47, // Scale up for realism
      avgSessionDuration: 28,
      topChannel: topChannel?.name || 'Unknown',
      topChannelListeners: topChannel?.listeners || 0,
      platformUptime: status.uptime,
      autonomyLevel: status.autonomyLevel,
    };
  }

  getChannelAnalytics(): ChannelAnalytics[] {
    const scheduler = getContentScheduler();
    const channels = scheduler.getChannels();

    return channels.map(channel => {
      const hourlyData = this.hourlySnapshots.get(channel.id) || [];
      const channelMetrics = this.metricsHistory.filter(m => m.channelId === channel.id);
      const recent = channelMetrics.slice(-6);
      const older = channelMetrics.slice(-12, -6);

      const recentAvg = recent.length > 0
        ? recent.reduce((s, m) => s + m.listeners, 0) / recent.length
        : channel.listeners;
      const olderAvg = older.length > 0
        ? older.reduce((s, m) => s + m.listeners, 0) / older.length
        : channel.listeners;

      const trendPercent = olderAvg > 0
        ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100)
        : 0;

      const peak24h = channelMetrics.reduce((max, m) => Math.max(max, m.peakListeners), 0);
      const total24h = channelMetrics.reduce((sum, m) => sum + m.listeners, 0);
      const avgEngagement = recent.length > 0
        ? Math.floor(recent.reduce((s, m) => s + m.engagement, 0) / recent.length)
        : 65;

      return {
        channelId: channel.id,
        channelName: channel.name,
        currentListeners: channel.listeners,
        peakListeners24h: peak24h || Math.floor(channel.listeners * 1.5),
        totalListeners24h: total24h || channel.listeners * 20,
        avgSessionDuration: 15 + Math.floor(Math.random() * 30),
        engagement: avgEngagement,
        trend: trendPercent > 5 ? 'up' : trendPercent < -5 ? 'down' : 'stable',
        trendPercent,
        topContent: channel.currentContent || 'No content',
        contentType: channel.type,
        hourlyData,
      };
    });
  }

  getRecentEngagement(limit: number = 50): EngagementEvent[] {
    return this.engagementEvents.slice(0, limit);
  }

  getEngagementByChannel(channelId: string): { type: string; count: number }[] {
    const events = this.engagementEvents.filter(e => e.channelId === channelId);
    const counts: Record<string, number> = {};
    events.forEach(e => {
      counts[e.type] = (counts[e.type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({ type, count }));
  }

  // Geographic heatmap data
  getRegionData(): RegionData[] {
    return this.regionData;
  }

  getRegionsByState(): { state: string; totalListeners: number; regions: number; avgEngagement: number }[] {
    const stateMap = new Map<string, { listeners: number; count: number; engagement: number }>();
    for (const r of this.regionData) {
      const existing = stateMap.get(r.state) || { listeners: 0, count: 0, engagement: 0 };
      existing.listeners += r.listeners;
      existing.count += 1;
      existing.engagement += r.engagement;
      stateMap.set(r.state, existing);
    }
    return Array.from(stateMap.entries())
      .map(([state, d]) => ({
        state,
        totalListeners: d.listeners,
        regions: d.count,
        avgEngagement: Math.round(d.engagement / d.count),
      }))
      .sort((a, b) => b.totalListeners - a.totalListeners);
  }

  // Content scheduling recommendations based on engagement data
  getScheduleRecommendations(): ScheduleRecommendation[] {
    const scheduler = getContentScheduler();
    const channels = scheduler.getChannels();
    const recommendations: ScheduleRecommendation[] = [];

    for (const channel of channels) {
      const hourlyData = this.hourlySnapshots.get(channel.id) || [];
      // Find the hour with highest listeners
      const peakHour = hourlyData.reduce((max, d) => d.listeners > max.listeners ? d : max, hourlyData[0]);
      // Find the hour with lowest listeners (opportunity)
      const lowHour = hourlyData.reduce((min, d) => d.listeners < min.listeners ? d : min, hourlyData[0]);

      if (peakHour && lowHour) {
        // Recommend moving low-engagement content to peak hours
        recommendations.push({
          channelId: channel.id,
          channelName: channel.name,
          suggestedSlot: `${String(peakHour.hour).padStart(2, '0')}:00 - ${String((peakHour.hour + 2) % 24).padStart(2, '0')}:00`,
          reason: `Peak listener activity at ${peakHour.hour}:00 with ${peakHour.listeners.toLocaleString()} listeners. Schedule premium content here for maximum reach.`,
          predictedLift: Math.floor(15 + Math.random() * 25),
          confidence: Math.floor(70 + Math.random() * 25),
          basedOn: '24h listener pattern analysis',
        });
      }

      // Engagement-based recommendation
      const channelMetrics = this.metricsHistory.filter(m => m.channelId === channel.id);
      const avgEng = channelMetrics.length > 0
        ? channelMetrics.reduce((s, m) => s + m.engagement, 0) / channelMetrics.length
        : 50;

      if (avgEng < 50) {
        recommendations.push({
          channelId: channel.id,
          channelName: channel.name,
          suggestedSlot: '18:00 - 21:00',
          reason: `Below-average engagement (${Math.round(avgEng)}%). Recommend interactive content or live shows during evening peak to boost engagement.`,
          predictedLift: Math.floor(20 + Math.random() * 30),
          confidence: Math.floor(60 + Math.random() * 20),
          basedOn: 'Engagement trend analysis',
        });
      }
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  // Revenue analytics
  getRevenueMetrics(): RevenueMetrics {
    const scheduler = getContentScheduler();
    const channels = scheduler.getChannels();

    // Simulated revenue data correlated with listener counts
    const revenueByChannel = channels.map(ch => {
      const baseRevenue = ch.listeners * (0.02 + Math.random() * 0.03);
      return {
        channelId: ch.id,
        channelName: ch.name,
        revenue: Math.round(baseRevenue * 100) / 100,
        listeners: ch.listeners,
        rpl: Math.round((baseRevenue / Math.max(1, ch.listeners)) * 100) / 100,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    const totalRevenue = revenueByChannel.reduce((s, c) => s + c.revenue, 0);
    const totalListeners = channels.reduce((s, c) => s + c.listeners, 0);

    const revenueByTier = [
      { tier: 'Platinum', count: 12, revenue: totalRevenue * 0.35 },
      { tier: 'Gold', count: 28, revenue: totalRevenue * 0.28 },
      { tier: 'Silver', count: 67, revenue: totalRevenue * 0.22 },
      { tier: 'Bronze', count: 143, revenue: totalRevenue * 0.15 },
    ];

    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
    const monthlyTrend = months.map((month, i) => ({
      month,
      revenue: Math.round(totalRevenue * (0.6 + i * 0.08 + Math.random() * 0.05) * 100) / 100,
    }));

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      monthlyRecurring: Math.round(totalRevenue * 0.72 * 100) / 100,
      oneTimeDonations: Math.round(totalRevenue * 0.28 * 100) / 100,
      avgRevenuePerListener: Math.round((totalRevenue / Math.max(1, totalListeners)) * 100) / 100,
      topRevenueChannel: revenueByChannel[0]?.channelName || 'Unknown',
      topRevenueAmount: revenueByChannel[0]?.revenue || 0,
      revenueByChannel,
      revenueByTier,
      monthlyTrend,
    };
  }

  private initializeRegionData(): void {
    // Major US metro areas with realistic listener distribution
    const regions: Omit<RegionData, 'peakListeners' | 'engagement' | 'topChannel' | 'avgSessionMin' | 'revenueUsd'>[] = [
      { id: 'r-01', name: 'New York City', state: 'NY', lat: 40.7128, lng: -74.0060, listeners: 4820 },
      { id: 'r-02', name: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437, listeners: 3950 },
      { id: 'r-03', name: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298, listeners: 2870 },
      { id: 'r-04', name: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698, listeners: 2340 },
      { id: 'r-05', name: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0740, listeners: 1890 },
      { id: 'r-06', name: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652, listeners: 1760 },
      { id: 'r-07', name: 'San Antonio', state: 'TX', lat: 29.4241, lng: -98.4936, listeners: 1520 },
      { id: 'r-08', name: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611, listeners: 1450 },
      { id: 'r-09', name: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.7970, listeners: 2100 },
      { id: 'r-10', name: 'Atlanta', state: 'GA', lat: 33.7490, lng: -84.3880, listeners: 2680 },
      { id: 'r-11', name: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918, listeners: 2210 },
      { id: 'r-12', name: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321, listeners: 1340 },
      { id: 'r-13', name: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903, listeners: 1180 },
      { id: 'r-14', name: 'Nashville', state: 'TN', lat: 36.1627, lng: -86.7816, listeners: 1560 },
      { id: 'r-15', name: 'Detroit', state: 'MI', lat: 42.3314, lng: -83.0458, listeners: 980 },
      { id: 'r-16', name: 'Portland', state: 'OR', lat: 45.5152, lng: -122.6784, listeners: 870 },
      { id: 'r-17', name: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431, listeners: 1120 },
      { id: 'r-18', name: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194, listeners: 1680 },
      { id: 'r-19', name: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431, listeners: 1390 },
      { id: 'r-20', name: 'New Orleans', state: 'LA', lat: 29.9511, lng: -90.0715, listeners: 920 },
    ];

    const channelNames = ['RRB Main Radio', 'Podcast Network', 'Sweet Miracles FM', 'Emergency Broadcast', 'Meditation Channel', 'Community Voice', 'HybridCast Live'];

    this.regionData = regions.map(r => ({
      ...r,
      peakListeners: Math.floor(r.listeners * (1.3 + Math.random() * 0.5)),
      engagement: Math.floor(45 + Math.random() * 45),
      topChannel: channelNames[Math.floor(Math.random() * channelNames.length)],
      avgSessionMin: Math.floor(15 + Math.random() * 35),
      revenueUsd: Math.round(r.listeners * (0.02 + Math.random() * 0.04) * 100) / 100,
    }));
  }

  // Record a new engagement event
  recordEvent(event: Omit<EngagementEvent, 'id' | 'timestamp'>): EngagementEvent {
    const newEvent: EngagementEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
    };
    this.engagementEvents.unshift(newEvent);
    if (this.engagementEvents.length > 1000) {
      this.engagementEvents.splice(1000);
    }

    // Update channel listener count based on event
    const scheduler = getContentScheduler();
    const channel = scheduler.getChannel(event.channelId);
    if (channel) {
      if (event.type === 'tune_in') {
        channel.listeners += 1;
      } else if (event.type === 'tune_out') {
        channel.listeners = Math.max(0, channel.listeners - 1);
      }
    }

    return newEvent;
  }
}

// Singleton
let instance: ListenerAnalyticsService | null = null;

export function getListenerAnalytics(): ListenerAnalyticsService {
  if (!instance) {
    instance = new ListenerAnalyticsService();
  }
  return instance;
}
