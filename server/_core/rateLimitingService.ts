export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
}

export interface QuotaMetrics {
  minuteUsage: number;
  hourUsage: number;
  dayUsage: number;
  percentageUsed: number;
  resetTime: Date;
  throttled: boolean;
}

export class RateLimitingService {
  private static readonly DEFAULT_CONFIG: RateLimitConfig = {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
    burstLimit: 100,
  };

  private static requestCounts = new Map<string, number[]>();

  static async checkRateLimit(
    userId: string,
    config: RateLimitConfig = this.DEFAULT_CONFIG
  ): Promise<{ allowed: boolean; metrics: QuotaMetrics }> {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    const oneHourAgo = new Date(now.getTime() - 3600000);
    const oneDayAgo = new Date(now.getTime() - 86400000);

    // Count requests in different time windows
    const minuteUsage = this.countRequests(userId, oneMinuteAgo);
    const hourUsage = this.countRequests(userId, oneHourAgo);
    const dayUsage = this.countRequests(userId, oneDayAgo);

    const throttled =
      minuteUsage >= config.requestsPerMinute ||
      hourUsage >= config.requestsPerHour ||
      dayUsage >= config.requestsPerDay;

    const percentageUsed = Math.max(
      (minuteUsage / config.requestsPerMinute) * 100,
      (hourUsage / config.requestsPerHour) * 100,
      (dayUsage / config.requestsPerDay) * 100
    );

    const resetTime = new Date(now.getTime() + 60000);

    return {
      allowed: !throttled,
      metrics: {
        minuteUsage,
        hourUsage,
        dayUsage,
        percentageUsed,
        resetTime,
        throttled,
      },
    };
  }

  private static countRequests(userId: string, since: Date): number {
    const key = `requests_${userId}`;
    const timestamps = this.requestCounts.get(key) || [];
    const now = Date.now();
    const sinceTime = since.getTime();

    // Filter out old timestamps
    const recentTimestamps = timestamps.filter((ts) => ts > sinceTime);
    this.requestCounts.set(key, recentTimestamps);

    return recentTimestamps.length;
  }

  static async logRequest(userId: string, endpoint: string, statusCode: number): Promise<void> {
    const key = `requests_${userId}`;
    const timestamps = this.requestCounts.get(key) || [];
    timestamps.push(Date.now());
    this.requestCounts.set(key, timestamps);
  }

  static async getUsageMetrics(userId: string, days: number = 30): Promise<{
    totalRequests: number;
    totalErrors: number;
    averageResponseTime: number;
    peakUsageHour: number;
    dailyBreakdown: any[];
  }> {
    // Return mock metrics
    return {
      totalRequests: Math.floor(Math.random() * 50000),
      totalErrors: Math.floor(Math.random() * 100),
      averageResponseTime: Math.random() * 1000,
      peakUsageHour: Math.floor(Math.random() * 24),
      dailyBreakdown: [],
    };
  }

  private static findPeakHour(usage: any[]): number {
    let maxHour = 0;
    let maxRequests = 0;
    usage.forEach((u: any) => {
      if ((u.requestCount || 0) > maxRequests) {
        maxRequests = u.requestCount || 0;
        maxHour = u.hour || 0;
      }
    });
    return maxHour;
  }
}
