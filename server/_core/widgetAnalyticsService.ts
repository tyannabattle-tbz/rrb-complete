export interface WidgetEvent {
  eventId: string;
  widgetId: string;
  eventType: 'view' | 'play' | 'pause' | 'complete' | 'share' | 'download' | 'interaction';
  timestamp: number;
  duration?: number;
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  device?: 'mobile' | 'tablet' | 'desktop';
  metadata?: Record<string, any>;
}

export interface WidgetAnalytics {
  widgetId: string;
  totalViews: number;
  totalPlays: number;
  avgWatchTime: number;
  completionRate: number;
  shareCount: number;
  downloadCount: number;
  engagementScore: number;
  topCountries: Array<{ country: string; views: number }>;
  deviceBreakdown: Record<string, number>;
  hourlyTrends: Array<{ hour: number; views: number }>;
  lastUpdated: number;
}

export class WidgetAnalyticsService {
  private static events: WidgetEvent[] = [];
  private static analytics = new Map<string, WidgetAnalytics>();

  static recordEvent(widgetId: string, eventType: WidgetEvent['eventType'], metadata?: Record<string, any>): WidgetEvent {
    const event: WidgetEvent = {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      widgetId,
      eventType,
      timestamp: Date.now(),
      metadata,
    };
    this.events.push(event);
    this.updateAnalytics(widgetId);
    return event;
  }

  static getAnalytics(widgetId: string): WidgetAnalytics {
    if (!this.analytics.has(widgetId)) {
      this.analytics.set(widgetId, {
        widgetId,
        totalViews: 0,
        totalPlays: 0,
        avgWatchTime: 0,
        completionRate: 0,
        shareCount: 0,
        downloadCount: 0,
        engagementScore: 0,
        topCountries: [],
        deviceBreakdown: {},
        hourlyTrends: [],
        lastUpdated: Date.now(),
      });
    }
    return this.analytics.get(widgetId)!;
  }

  private static updateAnalytics(widgetId: string): void {
    const widgetEvents = this.events.filter(e => e.widgetId === widgetId);
    const analytics = this.getAnalytics(widgetId);

    analytics.totalViews = widgetEvents.filter(e => e.eventType === 'view').length;
    analytics.totalPlays = widgetEvents.filter(e => e.eventType === 'play').length;
    analytics.shareCount = widgetEvents.filter(e => e.eventType === 'share').length;
    analytics.downloadCount = widgetEvents.filter(e => e.eventType === 'download').length;

    const completions = widgetEvents.filter(e => e.eventType === 'complete').length;
    analytics.completionRate = analytics.totalPlays > 0 ? (completions / analytics.totalPlays) * 100 : 0;

    const watchTimes = widgetEvents.filter(e => e.duration).map(e => e.duration || 0);
    analytics.avgWatchTime = watchTimes.length > 0 ? watchTimes.reduce((a, b) => a + b, 0) / watchTimes.length : 0;

    analytics.engagementScore = (analytics.completionRate * 0.4 + (analytics.shareCount + analytics.downloadCount) * 0.6);

    const countries = new Map<string, number>();
    widgetEvents.forEach(e => {
      if (e.country) countries.set(e.country, (countries.get(e.country) || 0) + 1);
    });
    analytics.topCountries = Array.from(countries.entries())
      .map(([country, views]) => ({ country, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const devices: Record<string, number> = {};
    widgetEvents.forEach(e => {
      if (e.device) devices[e.device] = (devices[e.device] || 0) + 1;
    });
    analytics.deviceBreakdown = devices;

    analytics.lastUpdated = Date.now();
  }

  static getTopWidgets(limit: number = 10): Array<WidgetAnalytics & { rank: number }> {
    return Array.from(this.analytics.values())
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, limit)
      .map((a, i) => ({ ...a, rank: i + 1 }));
  }

  static exportAnalytics(widgetId: string, format: 'json' | 'csv' = 'json'): string {
    const analytics = this.getAnalytics(widgetId);
    if (format === 'json') return JSON.stringify(analytics, null, 2);

    const csv = [
      'Metric,Value',
      `Total Views,${analytics.totalViews}`,
      `Total Plays,${analytics.totalPlays}`,
      `Avg Watch Time,${analytics.avgWatchTime.toFixed(2)}s`,
      `Completion Rate,${analytics.completionRate.toFixed(2)}%`,
      `Share Count,${analytics.shareCount}`,
      `Download Count,${analytics.downloadCount}`,
      `Engagement Score,${analytics.engagementScore.toFixed(2)}`,
    ].join('\n');
    return csv;
  }

  static getEventsByDateRange(widgetId: string, startDate: number, endDate: number): WidgetEvent[] {
    return this.events.filter(e => e.widgetId === widgetId && e.timestamp >= startDate && e.timestamp <= endDate);
  }

  static clearOldEvents(daysOld: number = 30): void {
    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    this.events = this.events.filter(e => e.timestamp >= cutoff);
  }
}
