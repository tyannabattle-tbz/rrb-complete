/**
 * Video Quality Analytics Service
 * Tracks video quality preferences, processing times, and costs
 */

export interface QualityMetrics {
  resolution: string;
  codec: string;
  bitrate: number;
  frameRate: number;
  usageCount: number;
  averageProcessingTime: number;
  averageCost: number;
  userPreference: number; // 0-100 preference score
  lastUsed: Date;
}

export interface QualityAnalytics {
  totalVideos: number;
  totalProcessingTime: number;
  totalCost: number;
  qualityBreakdown: Record<string, QualityMetrics>;
  mostUsedQuality: string;
  averageQualityScore: number;
  costPerQuality: Record<string, number>;
  processingTimePerQuality: Record<string, number>;
}

export class VideoQualityAnalyticsService {
  private metrics: Map<string, QualityMetrics> = new Map();
  private videoHistory: Array<{ resolution: string; processingTime: number; cost: number; timestamp: Date }> = [];

  /**
   * Record video generation
   */
  recordVideoGeneration(
    resolution: string,
    codec: string,
    bitrate: number,
    frameRate: number,
    processingTime: number,
    cost: number
  ): void {
    const key = `${resolution}-${codec}`;

    let metrics = this.metrics.get(key);
    if (!metrics) {
      metrics = {
        resolution,
        codec,
        bitrate,
        frameRate,
        usageCount: 0,
        averageProcessingTime: 0,
        averageCost: 0,
        userPreference: 50,
        lastUsed: new Date(),
      };
    }

    // Update averages
    const totalProcessingTime = metrics.averageProcessingTime * metrics.usageCount + processingTime;
    const totalCost = metrics.averageCost * metrics.usageCount + cost;
    metrics.usageCount++;
    metrics.averageProcessingTime = totalProcessingTime / metrics.usageCount;
    metrics.averageCost = totalCost / metrics.usageCount;
    metrics.lastUsed = new Date();

    this.metrics.set(key, metrics);
    this.videoHistory.push({ resolution, processingTime, cost, timestamp: new Date() });

    // Keep history size manageable
    if (this.videoHistory.length > 10000) {
      this.videoHistory = this.videoHistory.slice(-5000);
    }
  }

  /**
   * Get quality metrics
   */
  getMetrics(resolution?: string): QualityMetrics | Map<string, QualityMetrics> {
    if (resolution) {
      const key = Array.from(this.metrics.keys()).find((k) => k.startsWith(resolution));
      return key ? this.metrics.get(key)! : {};
    }
    return this.metrics;
  }

  /**
   * Get analytics summary
   */
  getAnalytics(): QualityAnalytics {
    const qualityBreakdown: Record<string, QualityMetrics> = {};
    let totalVideos = 0;
    let totalProcessingTime = 0;
    let totalCost = 0;
    let totalPreference = 0;

    this.metrics.forEach((metrics, key) => {
      qualityBreakdown[key] = metrics;
      totalVideos += metrics.usageCount;
      totalProcessingTime += metrics.averageProcessingTime * metrics.usageCount;
      totalCost += metrics.averageCost * metrics.usageCount;
      totalPreference += metrics.userPreference;
    });

    const costPerQuality: Record<string, number> = {};
    const processingTimePerQuality: Record<string, number> = {};

    this.metrics.forEach((metrics, key) => {
      costPerQuality[key] = metrics.averageCost;
      processingTimePerQuality[key] = metrics.averageProcessingTime;
    });

    const mostUsedQuality = Array.from(this.metrics.values()).sort((a, b) => b.usageCount - a.usageCount)[0]?.resolution || 'unknown';

    return {
      totalVideos,
      totalProcessingTime,
      totalCost,
      qualityBreakdown,
      mostUsedQuality,
      averageQualityScore: this.metrics.size > 0 ? totalPreference / this.metrics.size : 0,
      costPerQuality,
      processingTimePerQuality,
    };
  }

  /**
   * Get recommended quality based on usage patterns
   */
  getRecommendedQuality(): string {
    const metrics = Array.from(this.metrics.values());
    if (metrics.length === 0) return '1080p';

    // Recommend based on preference and usage
    return metrics.reduce((best, current) => {
      const currentScore = current.userPreference + current.usageCount * 0.1;
      const bestScore = best.userPreference + best.usageCount * 0.1;
      return currentScore > bestScore ? current : best;
    }).resolution;
  }

  /**
   * Update user preference for quality
   */
  updateUserPreference(resolution: string, preference: number): void {
    const key = Array.from(this.metrics.keys()).find((k) => k.startsWith(resolution));
    if (key) {
      const metrics = this.metrics.get(key)!;
      metrics.userPreference = Math.max(0, Math.min(100, preference));
      this.metrics.set(key, metrics);
    }
  }

  /**
   * Get cost optimization suggestions
   */
  getCostOptimizations(): Array<{ quality: string; currentCost: number; optimizedCost: number; savings: number }> {
    const metrics = Array.from(this.metrics.values());
    const averageCost = metrics.reduce((sum, m) => sum + m.averageCost, 0) / Math.max(metrics.length, 1);

    return metrics
      .map((m) => ({
        quality: `${m.resolution}-${m.codec}`,
        currentCost: m.averageCost,
        optimizedCost: averageCost * 0.8, // 20% reduction suggestion
        savings: m.averageCost - averageCost * 0.8,
      }))
      .filter((opt) => opt.savings > 0)
      .sort((a, b) => b.savings - a.savings);
  }

  /**
   * Get processing time trends
   */
  getProcessingTimeTrends(hours: number = 24): Array<{ timestamp: Date; avgTime: number; count: number }> {
    const now = new Date();
    const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);

    const buckets: Map<number, { times: number[]; count: number }> = new Map();

    this.videoHistory
      .filter((v) => v.timestamp > cutoff)
      .forEach((v) => {
        const hour = Math.floor(v.timestamp.getTime() / (60 * 60 * 1000));
        const bucket = buckets.get(hour) || { times: [], count: 0 };
        bucket.times.push(v.processingTime);
        bucket.count++;
        buckets.set(hour, bucket);
      });

    return Array.from(buckets.entries())
      .map(([hour, bucket]) => ({
        timestamp: new Date(hour * 60 * 60 * 1000),
        avgTime: bucket.times.reduce((a, b) => a + b, 0) / bucket.times.length,
        count: bucket.count,
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Clear analytics
   */
  clearAnalytics(): void {
    this.metrics.clear();
    this.videoHistory = [];
  }
}

export const videoQualityAnalyticsService = new VideoQualityAnalyticsService();
