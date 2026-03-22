/**
 * Real-Time Listener Analytics Service
 * Tracks listener engagement, metrics, and analytics across all channels
 */

export interface ListenerSession {
  sessionId: string;
  listenerId: string;
  channelId: string;
  channelName: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  deviceType: 'web' | 'mobile' | 'app' | 'smart-speaker';
  location?: string;
  engagement: 'low' | 'medium' | 'high';
}

export interface ChannelMetrics {
  channelId: string;
  channelName: string;
  currentListeners: number;
  peakListeners: number;
  averageSessionDuration: number;
  totalSessions: number;
  engagementRate: number;
  growthRate: number;
  topHours: { hour: number; listeners: number }[];
}

export interface PodcastMetrics {
  episodeId: string;
  title: string;
  totalPlays: number;
  averagePlayDuration: number;
  completionRate: number;
  engagementScore: number;
  shares: number;
  comments: number;
  likes: number;
}

export interface DemographicData {
  ageGroups: Record<string, number>;
  genders: Record<string, number>;
  locations: Record<string, number>;
  deviceTypes: Record<string, number>;
  peakListeningTimes: { day: string; hour: number; listeners: number }[];
}

class ListenerAnalyticsService {
  private activeSessions: Map<string, ListenerSession> = new Map();
  private channelMetrics: Map<string, ChannelMetrics> = new Map();
  private podcastMetrics: Map<string, PodcastMetrics> = new Map();
  private demographicData: DemographicData = {
    ageGroups: {},
    genders: {},
    locations: {},
    deviceTypes: {},
    peakListeningTimes: []
  };
  private sessionHistory: ListenerSession[] = [];

  constructor() {
    this.initializeMetrics();
  }

  /**
   * Initialize metrics for all channels
   */
  private initializeMetrics(): void {
    const channels = [
      { id: 'ch-001', name: 'RRB Main Radio' },
      { id: 'ch-039', name: 'Seraph AI Radio' },
      { id: 'ch-040', name: 'Candy AI Radio' },
      { id: 'ch-041', name: 'QUMUS Selections' }
    ];

    channels.forEach((ch) => {
      this.channelMetrics.set(ch.id, {
        channelId: ch.id,
        channelName: ch.name,
        currentListeners: 0,
        peakListeners: 0,
        averageSessionDuration: 0,
        totalSessions: 0,
        engagementRate: 0,
        growthRate: 0,
        topHours: []
      });
    });
  }

  /**
   * Start a listener session
   */
  startSession(
    listenerId: string,
    channelId: string,
    channelName: string,
    deviceType: 'web' | 'mobile' | 'app' | 'smart-speaker',
    location?: string
  ): ListenerSession {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const session: ListenerSession = {
      sessionId,
      listenerId,
      channelId,
      channelName,
      startTime: new Date(),
      duration: 0,
      deviceType,
      location,
      engagement: 'medium'
    };

    this.activeSessions.set(sessionId, session);

    // Update channel metrics
    const metrics = this.channelMetrics.get(channelId);
    if (metrics) {
      metrics.currentListeners++;
      metrics.peakListeners = Math.max(metrics.peakListeners, metrics.currentListeners);
      metrics.totalSessions++;
    }

    // Update demographics
    this.updateDemographics(deviceType);

    console.log(`[Analytics] Session started: ${sessionId} on ${channelName}`);
    return session;
  }

  /**
   * End a listener session
   */
  endSession(sessionId: string): ListenerSession | null {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;

    session.endTime = new Date();
    session.duration = Math.floor(
      (session.endTime.getTime() - session.startTime.getTime()) / 1000
    );

    this.sessionHistory.push(session);
    this.activeSessions.delete(sessionId);

    // Update channel metrics
    const metrics = this.channelMetrics.get(session.channelId);
    if (metrics) {
      metrics.currentListeners--;
      metrics.averageSessionDuration =
        (metrics.averageSessionDuration * (metrics.totalSessions - 1) + session.duration) /
        metrics.totalSessions;
    }

    console.log(`[Analytics] Session ended: ${sessionId} (${session.duration}s)`);
    return session;
  }

  /**
   * Update listener engagement
   */
  updateEngagement(sessionId: string, engagement: 'low' | 'medium' | 'high'): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.engagement = engagement;
    }
  }

  /**
   * Get channel metrics
   */
  getChannelMetrics(channelId: string): ChannelMetrics | undefined {
    return this.channelMetrics.get(channelId);
  }

  /**
   * Get all channel metrics
   */
  getAllChannelMetrics(): ChannelMetrics[] {
    return Array.from(this.channelMetrics.values());
  }

  /**
   * Record podcast play
   */
  recordPodcastPlay(
    episodeId: string,
    title: string,
    duration: number,
    completed: boolean
  ): void {
    let metrics = this.podcastMetrics.get(episodeId);

    if (!metrics) {
      metrics = {
        episodeId,
        title,
        totalPlays: 0,
        averagePlayDuration: 0,
        completionRate: 0,
        engagementScore: 0,
        shares: 0,
        comments: 0,
        likes: 0
      };
      this.podcastMetrics.set(episodeId, metrics);
    }

    metrics.totalPlays++;
    metrics.averagePlayDuration =
      (metrics.averagePlayDuration * (metrics.totalPlays - 1) + duration) / metrics.totalPlays;

    if (completed) {
      metrics.completionRate = (metrics.completionRate * (metrics.totalPlays - 1) + 1) / metrics.totalPlays;
    }

    metrics.engagementScore = this.calculateEngagementScore(metrics);
  }

  /**
   * Get podcast metrics
   */
  getPodcastMetrics(episodeId: string): PodcastMetrics | undefined {
    return this.podcastMetrics.get(episodeId);
  }

  /**
   * Get all podcast metrics
   */
  getAllPodcastMetrics(): PodcastMetrics[] {
    return Array.from(this.podcastMetrics.values()).sort(
      (a, b) => b.engagementScore - a.engagementScore
    );
  }

  /**
   * Record podcast interaction
   */
  recordPodcastInteraction(
    episodeId: string,
    type: 'share' | 'comment' | 'like'
  ): void {
    const metrics = this.podcastMetrics.get(episodeId);
    if (metrics) {
      switch (type) {
        case 'share':
          metrics.shares++;
          break;
        case 'comment':
          metrics.comments++;
          break;
        case 'like':
          metrics.likes++;
          break;
      }
      metrics.engagementScore = this.calculateEngagementScore(metrics);
    }
  }

  /**
   * Calculate engagement score
   */
  private calculateEngagementScore(metrics: PodcastMetrics): number {
    return (
      metrics.totalPlays * 0.3 +
      metrics.completionRate * 100 * 0.2 +
      metrics.shares * 5 +
      metrics.comments * 3 +
      metrics.likes * 1
    );
  }

  /**
   * Update demographics
   */
  private updateDemographics(deviceType: string): void {
    this.demographicData.deviceTypes[deviceType] =
      (this.demographicData.deviceTypes[deviceType] || 0) + 1;
  }

  /**
   * Get demographic data
   */
  getDemographicData(): DemographicData {
    return this.demographicData;
  }

  /**
   * Get peak listening hours
   */
  getPeakListeningHours(): { hour: number; listeners: number }[] {
    const hourMap: Record<number, number> = {};

    this.sessionHistory.forEach((session) => {
      const hour = session.startTime.getHours();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });

    return Object.entries(hourMap)
      .map(([hour, listeners]) => ({
        hour: parseInt(hour),
        listeners
      }))
      .sort((a, b) => b.listeners - a.listeners);
  }

  /**
   * Get listener growth metrics
   */
  getGrowthMetrics(): {
    totalSessions: number;
    uniqueListeners: number;
    averageSessionDuration: number;
    totalListeningHours: number;
  } {
    const uniqueListeners = new Set(this.sessionHistory.map((s) => s.listenerId)).size;
    const totalListeningHours = this.sessionHistory.reduce((sum, s) => sum + s.duration, 0) / 3600;

    return {
      totalSessions: this.sessionHistory.length,
      uniqueListeners,
      averageSessionDuration:
        this.sessionHistory.reduce((sum, s) => sum + s.duration, 0) / this.sessionHistory.length || 0,
      totalListeningHours
    };
  }

  /**
   * Get real-time dashboard data
   */
  getRealTimeDashboard(): {
    activeListeners: number;
    topChannels: ChannelMetrics[];
    topPodcasts: PodcastMetrics[];
    peakHours: { hour: number; listeners: number }[];
    growthMetrics: ReturnType<typeof this.getGrowthMetrics>;
  } {
    return {
      activeListeners: Array.from(this.activeSessions.values()).length,
      topChannels: this.getAllChannelMetrics()
        .sort((a, b) => b.currentListeners - a.currentListeners)
        .slice(0, 5),
      topPodcasts: this.getAllPodcastMetrics().slice(0, 5),
      peakHours: this.getPeakListeningHours().slice(0, 10),
      growthMetrics: this.getGrowthMetrics()
    };
  }
}

export const listenerAnalyticsService = new ListenerAnalyticsService();
