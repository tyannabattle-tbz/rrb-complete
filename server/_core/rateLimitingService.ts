import { db } from "../db";
import { rateLimitLogs, apiUsage } from "../../drizzle/schema";
import { eq, and, gte } from "drizzle-orm";

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

  static async checkRateLimit(
    userId: string,
    config: RateLimitConfig = this.DEFAULT_CONFIG
  ): Promise<{ allowed: boolean; metrics: QuotaMetrics }> {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    const oneHourAgo = new Date(now.getTime() - 3600000);
    const oneDayAgo = new Date(now.getTime() - 86400000);

    // Count requests in different time windows
    const minuteUsage = await this.countRequests(userId, oneMinuteAgo);
    const hourUsage = await this.countRequests(userId, oneHourAgo);
    const dayUsage = await this.countRequests(userId, oneDayAgo);

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

  private static async countRequests(userId: string, since: Date): Promise<number> {
    try {
      const result = await db
        .select()
        .from(rateLimitLogs)
        .where(
          and(
            eq(rateLimitLogs.userId, userId),
            gte(rateLimitLogs.timestamp, since)
          )
        );
      return result.length;
    } catch {
      return 0;
    }
  }

  static async logRequest(userId: string, endpoint: string, statusCode: number): Promise<void> {
    try {
      await db.insert(rateLimitLogs).values({
        userId,
        endpoint,
        statusCode,
        timestamp: new Date(),
      });
    } catch {
      // Silently fail to avoid blocking requests
    }
  }

  static async getUsageMetrics(userId: string, days: number = 30): Promise<any> {
    try {
      const since = new Date(Date.now() - days * 86400000);
      const usage = await db
        .select()
        .from(apiUsage)
        .where(
          and(
            eq(apiUsage.userId, userId),
            gte(apiUsage.date, since)
          )
        );

      return {
        totalRequests: usage.reduce((sum, u) => sum + (u.requestCount || 0), 0),
        totalErrors: usage.reduce((sum, u) => sum + (u.errorCount || 0), 0),
        averageResponseTime: usage.reduce((sum, u) => sum + (u.avgResponseTime || 0), 0) / usage.length || 0,
        peakUsageHour: this.findPeakHour(usage),
        dailyBreakdown: usage,
      };
    } catch {
      return null;
    }
  }

  private static findPeakHour(usage: any[]): number {
    let maxHour = 0;
    let maxRequests = 0;
    usage.forEach((u) => {
      if ((u.requestCount || 0) > maxRequests) {
        maxRequests = u.requestCount || 0;
        maxHour = u.hour || 0;
      }
    });
    return maxHour;
  }
}
