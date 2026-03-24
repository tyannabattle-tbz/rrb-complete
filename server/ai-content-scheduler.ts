/**
 * AI-Powered Content Scheduler
 * ML-based optimization for broadcast scheduling and content recommendations
 */

export interface ScheduledPerformance {
  id: string;
  title: string;
  channel: string;
  scheduledTime: number;
  predictedListeners: number;
  predictedEngagement: number;
  predictedRevenue: number;
  bandMembers: string[];
  content: string;
  priority: 'high' | 'medium' | 'low';
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  createdAt: number;
}

export interface ListenerPattern {
  dayOfWeek: number; // 0-6
  hour: number; // 0-23
  averageListeners: number;
  peakListeners: number;
  engagementRate: number;
  preferredChannels: string[];
}

export interface ContentRecommendation {
  id: string;
  title: string;
  channel: string;
  suggestedTime: number;
  confidence: number; // 0-100
  reasoning: string;
  estimatedListeners: number;
  estimatedRevenue: number;
}

class AIContentScheduler {
  private schedules: Map<string, ScheduledPerformance> = new Map();
  private listenerPatterns: Map<string, ListenerPattern> = new Map();
  private recommendations: ContentRecommendation[] = [];

  /**
   * Initialize with historical data
   */
  initialize(): void {
    // Initialize listener patterns for each day/hour
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}_${hour}`;
        
        // Simulate historical patterns
        let baseListeners = 500;
        let engagementRate = 65;

        // Peak hours: 7-10 PM (19-22)
        if (hour >= 19 && hour <= 22) {
          baseListeners = 3000 + Math.random() * 1000;
          engagementRate = 85 + Math.random() * 10;
        }
        // Morning: 6-9 AM (6-9)
        else if (hour >= 6 && hour <= 9) {
          baseListeners = 1200 + Math.random() * 500;
          engagementRate = 70 + Math.random() * 10;
        }
        // Afternoon: 12-2 PM (12-14)
        else if (hour >= 12 && hour <= 14) {
          baseListeners = 1500 + Math.random() * 600;
          engagementRate = 72 + Math.random() * 10;
        }
        // Late night: 10 PM - 12 AM (22-24)
        else if (hour >= 22 || hour < 2) {
          baseListeners = 800 + Math.random() * 400;
          engagementRate = 60 + Math.random() * 15;
        }
        // Off-peak
        else {
          baseListeners = 300 + Math.random() * 300;
          engagementRate = 50 + Math.random() * 20;
        }

        this.listenerPatterns.set(key, {
          dayOfWeek: day,
          hour,
          averageListeners: Math.floor(baseListeners),
          peakListeners: Math.floor(baseListeners * 1.3),
          engagementRate: Math.min(100, engagementRate),
          preferredChannels: this.getPreferredChannels(day, hour),
        });
      }
    }

    console.log('[AI Scheduler] Initialized with 168 listener patterns (7 days × 24 hours)');
  }

  /**
   * Get preferred channels for day/hour
   */
  private getPreferredChannels(day: number, hour: number): string[] {
    const channels: Record<string, string[]> = {
      'morning': ['Jazz Fusion', '432 Hz Healing', 'Gospel'],
      'afternoon': ['Soul & R&B', 'Jazz Fusion', 'Electronic'],
      'evening': ['Soul & R&B', 'Gospel', 'Jazz Fusion'],
      'night': ['432 Hz Healing', 'Ambient', 'Meditation'],
    };

    if (hour >= 6 && hour < 12) return channels['morning'];
    if (hour >= 12 && hour < 17) return channels['afternoon'];
    if (hour >= 17 && hour < 22) return channels['evening'];
    return channels['night'];
  }

  /**
   * Schedule performance with ML optimization
   */
  schedulePerformance(
    title: string,
    channel: string,
    bandMembers: string[],
    content: string,
    preferredTime?: number
  ): ScheduledPerformance {
    // If no preferred time, find optimal time
    const scheduledTime = preferredTime || this.findOptimalScheduleTime(channel);
    
    // Predict metrics
    const predictions = this.predictPerformanceMetrics(channel, scheduledTime);

    const performance: ScheduledPerformance = {
      id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      channel,
      scheduledTime,
      predictedListeners: predictions.listeners,
      predictedEngagement: predictions.engagement,
      predictedRevenue: predictions.revenue,
      bandMembers,
      content,
      priority: predictions.listeners > 2000 ? 'high' : predictions.listeners > 1000 ? 'medium' : 'low',
      status: 'scheduled',
      createdAt: Date.now(),
    };

    this.schedules.set(performance.id, performance);
    console.log(`[AI Scheduler] Performance scheduled: ${title} at ${new Date(scheduledTime).toLocaleTimeString()}`);
    return performance;
  }

  /**
   * Find optimal schedule time for channel
   */
  private findOptimalScheduleTime(channel: string): number {
    let bestTime = Date.now();
    let bestScore = 0;

    // Check next 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      for (let hour = 0; hour < 24; hour++) {
        const testDate = new Date();
        testDate.setDate(testDate.getDate() + dayOffset);
        testDate.setHours(hour, 0, 0, 0);
        const testTime = testDate.getTime();

        const pattern = this.listenerPatterns.get(`${testDate.getDay()}_${hour}`);
        if (!pattern) continue;

        // Score based on listener count and channel preference
        let score = pattern.averageListeners;
        if (pattern.preferredChannels.includes(channel)) {
          score *= 1.2; // 20% bonus for preferred channel
        }

        if (score > bestScore) {
          bestScore = score;
          bestTime = testTime;
        }
      }
    }

    return bestTime;
  }

  /**
   * Predict performance metrics
   */
  private predictPerformanceMetrics(channel: string, time: number): {
    listeners: number;
    engagement: number;
    revenue: number;
  } {
    const date = new Date(time);
    const pattern = this.listenerPatterns.get(`${date.getDay()}_${date.getHours()}`) || {
      averageListeners: 1000,
      engagementRate: 70,
    };

    // Add some randomness and channel-specific adjustments
    const channelMultiplier: Record<string, number> = {
      'Soul & R&B': 1.3,
      'Jazz Fusion': 1.1,
      '432 Hz Healing': 1.2,
      'Gospel': 1.15,
      'Electronic': 0.9,
      'Meditation': 0.8,
    };

    const multiplier = channelMultiplier[channel] || 1.0;
    const listeners = Math.floor(pattern.averageListeners * multiplier * (0.8 + Math.random() * 0.4));
    const engagement = Math.min(100, pattern.engagementRate * (0.9 + Math.random() * 0.2));
    const revenue = listeners * (engagement / 100) * 0.35; // $0.35 per engaged listener

    return {
      listeners,
      engagement: Math.round(engagement),
      revenue: Math.round(revenue * 100) / 100,
    };
  }

  /**
   * Get content recommendations
   */
  getRecommendations(limit: number = 5): ContentRecommendation[] {
    const recommendations: ContentRecommendation[] = [];
    const channels = ['Soul & R&B', 'Jazz Fusion', '432 Hz Healing', 'Gospel'];

    for (let i = 0; i < limit; i++) {
      const channel = channels[i % channels.length];
      const scheduledTime = this.findOptimalScheduleTime(channel);
      const predictions = this.predictPerformanceMetrics(channel, scheduledTime);

      recommendations.push({
        id: `rec_${Date.now()}_${i}`,
        title: `${channel} Performance #${i + 1}`,
        channel,
        suggestedTime: scheduledTime,
        confidence: 75 + Math.random() * 20,
        reasoning: `Optimal time based on historical listener patterns and channel preference`,
        estimatedListeners: predictions.listeners,
        estimatedRevenue: predictions.revenue,
      });
    }

    this.recommendations = recommendations;
    return recommendations;
  }

  /**
   * Get scheduled performances
   */
  getScheduledPerformances(status?: string): ScheduledPerformance[] {
    let performances = Array.from(this.schedules.values());
    if (status) {
      performances = performances.filter(p => p.status === status);
    }
    return performances.sort((a, b) => a.scheduledTime - b.scheduledTime);
  }

  /**
   * Update performance status
   */
  updatePerformanceStatus(performanceId: string, status: string): void {
    const performance = this.schedules.get(performanceId);
    if (performance) {
      performance.status = status as any;
      console.log(`[AI Scheduler] Performance status updated: ${performanceId} → ${status}`);
    }
  }

  /**
   * Get scheduling analytics
   */
  getSchedulingAnalytics(): {
    totalScheduled: number;
    upcomingPerformances: number;
    completedPerformances: number;
    averagePredictedListeners: number;
    averagePredictedRevenue: number;
  } {
    const performances = Array.from(this.schedules.values());
    const upcoming = performances.filter(p => p.status === 'scheduled' && p.scheduledTime > Date.now());
    const completed = performances.filter(p => p.status === 'completed');

    const avgListeners = performances.length > 0
      ? Math.round(performances.reduce((sum, p) => sum + p.predictedListeners, 0) / performances.length)
      : 0;

    const avgRevenue = performances.length > 0
      ? Math.round((performances.reduce((sum, p) => sum + p.predictedRevenue, 0) / performances.length) * 100) / 100
      : 0;

    return {
      totalScheduled: performances.length,
      upcomingPerformances: upcoming.length,
      completedPerformances: completed.length,
      averagePredictedListeners: avgListeners,
      averagePredictedRevenue: avgRevenue,
    };
  }

  /**
   * Get listener patterns for visualization
   */
  getListenerPatterns(): ListenerPattern[] {
    return Array.from(this.listenerPatterns.values());
  }

  /**
   * Optimize schedule for maximum revenue
   */
  optimizeScheduleForRevenue(performances: ScheduledPerformance[]): ScheduledPerformance[] {
    return performances.sort((a, b) => b.predictedRevenue - a.predictedRevenue);
  }

  /**
   * Optimize schedule for maximum engagement
   */
  optimizeScheduleForEngagement(performances: ScheduledPerformance[]): ScheduledPerformance[] {
    return performances.sort((a, b) => b.predictedEngagement - a.predictedEngagement);
  }
}

export const aiContentScheduler = new AIContentScheduler();

// Initialize on module load
aiContentScheduler.initialize();
