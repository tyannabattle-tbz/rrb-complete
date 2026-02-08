/**
 * HybridCast Integration Service
 * Manages broadcast distribution, viewer analytics, and streaming control
 */

export interface StreamingSession {
  id: string;
  broadcastId: string;
  status: 'active' | 'paused' | 'ended';
  startTime: number;
  endTime?: number;
  viewers: number;
  peakViewers: number;
  totalViewers: number;
  bitrate: number;
  resolution: string;
  platform: string;
}

export interface ViewerAnalytics {
  sessionId: string;
  totalViewers: number;
  activeViewers: number;
  averageWatchTime: number;
  engagementRate: number;
  geolocation: Record<string, number>;
  devices: Record<string, number>;
  timestamps: number[];
}

export interface BroadcastDistribution {
  id: string;
  broadcastId: string;
  platforms: string[];
  status: 'pending' | 'distributing' | 'live' | 'completed';
  startTime: number;
  endTime?: number;
  viewers: Record<string, number>;
  createdAt: number;
}

export class HybridCastIntegrationService {
  private sessions: Map<string, StreamingSession> = new Map();
  private analytics: Map<string, ViewerAnalytics> = new Map();
  private distributions: Map<string, BroadcastDistribution> = new Map();
  private totalSessions: number = 0;

  constructor() {
    this.initializeDefaultSessions();
  }

  /**
   * Initialize default streaming sessions
   */
  private initializeDefaultSessions(): void {
    // Add sample active session
    const sampleSession: StreamingSession = {
      id: 'session-1',
      broadcastId: 'broadcast-1',
      status: 'active',
      startTime: Date.now() - 3600000,
      viewers: 2450,
      peakViewers: 5200,
      totalViewers: 8750,
      bitrate: 5000,
      resolution: '1080p60',
      platform: 'HybridCast',
    };

    this.sessions.set(sampleSession.id, sampleSession);
    this.totalSessions++;

    // Add sample analytics
    const sampleAnalytics: ViewerAnalytics = {
      sessionId: 'session-1',
      totalViewers: 8750,
      activeViewers: 2450,
      averageWatchTime: 2400,
      engagementRate: 0.78,
      geolocation: {
        'United States': 4200,
        'Canada': 1800,
        'United Kingdom': 1500,
        'Other': 1250,
      },
      devices: {
        'Desktop': 3500,
        'Mobile': 3200,
        'Tablet': 1500,
        'Smart TV': 550,
      },
      timestamps: [Date.now() - 3600000, Date.now() - 1800000, Date.now()],
    };

    this.analytics.set(sampleAnalytics.sessionId, sampleAnalytics);
  }

  /**
   * Create streaming session
   */
  createSession(broadcastId: string, platform: string = 'HybridCast'): StreamingSession {
    const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const session: StreamingSession = {
      id,
      broadcastId,
      status: 'active',
      startTime: Date.now(),
      viewers: 0,
      peakViewers: 0,
      totalViewers: 0,
      bitrate: 5000,
      resolution: '1080p60',
      platform,
    };

    this.sessions.set(id, session);
    this.totalSessions++;

    console.log(`[HybridCast] Created streaming session: ${id} for broadcast ${broadcastId}`);
    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): StreamingSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all sessions
   */
  getAllSessions(): StreamingSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get active sessions
   */
  getActiveSessions(): StreamingSession[] {
    return Array.from(this.sessions.values()).filter((s) => s.status === 'active');
  }

  /**
   * Update viewer count
   */
  updateViewerCount(sessionId: string, count: number): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.viewers = count;
    if (count > session.peakViewers) {
      session.peakViewers = count;
    }
    session.totalViewers += count;

    console.log(`[HybridCast] Updated viewers for session ${sessionId}: ${count}`);
    return true;
  }

  /**
   * End streaming session
   */
  endSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.status = 'ended';
    session.endTime = Date.now();

    console.log(`[HybridCast] Ended streaming session: ${sessionId}`);
    return true;
  }

  /**
   * Create viewer analytics
   */
  createAnalytics(sessionId: string): ViewerAnalytics {
    const analytics: ViewerAnalytics = {
      sessionId,
      totalViewers: 0,
      activeViewers: 0,
      averageWatchTime: 0,
      engagementRate: 0,
      geolocation: {},
      devices: {},
      timestamps: [Date.now()],
    };

    this.analytics.set(sessionId, analytics);
    console.log(`[HybridCast] Created analytics for session: ${sessionId}`);
    return analytics;
  }

  /**
   * Get analytics by session ID
   */
  getAnalytics(sessionId: string): ViewerAnalytics | undefined {
    return this.analytics.get(sessionId);
  }

  /**
   * Update analytics
   */
  updateAnalytics(sessionId: string, updates: Partial<ViewerAnalytics>): boolean {
    const analytics = this.analytics.get(sessionId);
    if (!analytics) return false;

    Object.assign(analytics, updates);
    analytics.timestamps.push(Date.now());

    console.log(`[HybridCast] Updated analytics for session: ${sessionId}`);
    return true;
  }

  /**
   * Create broadcast distribution
   */
  createDistribution(broadcastId: string, platforms: string[]): BroadcastDistribution {
    const id = `dist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const distribution: BroadcastDistribution = {
      id,
      broadcastId,
      platforms,
      status: 'pending',
      startTime: Date.now(),
      viewers: {},
      createdAt: Date.now(),
    };

    // Initialize viewer counts for each platform
    platforms.forEach((platform) => {
      distribution.viewers[platform] = 0;
    });

    this.distributions.set(id, distribution);
    console.log(`[HybridCast] Created distribution for broadcast ${broadcastId} on platforms: ${platforms.join(', ')}`);
    return distribution;
  }

  /**
   * Get distribution by ID
   */
  getDistribution(distributionId: string): BroadcastDistribution | undefined {
    return this.distributions.get(distributionId);
  }

  /**
   * Get all distributions
   */
  getAllDistributions(): BroadcastDistribution[] {
    return Array.from(this.distributions.values());
  }

  /**
   * Update distribution status
   */
  updateDistributionStatus(distributionId: string, status: BroadcastDistribution['status']): boolean {
    const distribution = this.distributions.get(distributionId);
    if (!distribution) return false;

    distribution.status = status;
    if (status === 'completed') {
      distribution.endTime = Date.now();
    }

    console.log(`[HybridCast] Updated distribution ${distributionId} status to: ${status}`);
    return true;
  }

  /**
   * Update platform viewers
   */
  updatePlatformViewers(distributionId: string, platform: string, viewers: number): boolean {
    const distribution = this.distributions.get(distributionId);
    if (!distribution) return false;

    distribution.viewers[platform] = viewers;
    console.log(`[HybridCast] Updated ${platform} viewers for distribution ${distributionId}: ${viewers}`);
    return true;
  }

  /**
   * Get streaming statistics
   */
  getStatistics(): {
    totalSessions: number;
    activeSessions: number;
    totalViewers: number;
    averageViewers: number;
    peakViewers: number;
    totalDistributions: number;
    activeDistributions: number;
  } {
    const activeSessions = this.getActiveSessions();
    const allSessions = this.getAllSessions();

    const totalViewers = allSessions.reduce((sum, s) => sum + s.viewers, 0);
    const peakViewers = Math.max(...allSessions.map((s) => s.peakViewers), 0);
    const averageViewers = allSessions.length > 0 ? totalViewers / allSessions.length : 0;

    const activeDistributions = Array.from(this.distributions.values()).filter((d) => d.status === 'live').length;

    return {
      totalSessions: this.totalSessions,
      activeSessions: activeSessions.length,
      totalViewers,
      averageViewers: Math.floor(averageViewers),
      peakViewers,
      totalDistributions: this.distributions.size,
      activeDistributions,
    };
  }

  /**
   * Get geolocation distribution
   */
  getGeolocationDistribution(sessionId: string): Record<string, number> {
    const analytics = this.analytics.get(sessionId);
    return analytics?.geolocation || {};
  }

  /**
   * Get device distribution
   */
  getDeviceDistribution(sessionId: string): Record<string, number> {
    const analytics = this.analytics.get(sessionId);
    return analytics?.devices || {};
  }

  /**
   * Calculate engagement metrics
   */
  calculateEngagementMetrics(sessionId: string): {
    engagementRate: number;
    averageWatchTime: number;
    retentionRate: number;
  } {
    const analytics = this.analytics.get(sessionId);
    if (!analytics) {
      return {
        engagementRate: 0,
        averageWatchTime: 0,
        retentionRate: 0,
      };
    }

    return {
      engagementRate: analytics.engagementRate,
      averageWatchTime: analytics.averageWatchTime,
      retentionRate: analytics.engagementRate * 100,
    };
  }
}

// Export singleton instance
export const hybridcastService = new HybridCastIntegrationService();
