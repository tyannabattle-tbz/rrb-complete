/**
 * API Rate Limiter with Quota Management
 * Implements token bucket algorithm for fair resource allocation
 */

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstSize: number;
}

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

export interface QuotaUsage {
  userId: string;
  requestsUsedToday: number;
  requestsLimitToday: number;
  requestsUsedThisMonth: number;
  requestsLimitThisMonth: number;
  resetTime: Date;
}

export class RateLimiter {
  private config: RateLimitConfig;
  private buckets: Map<string, { tokens: number; lastRefill: number }> = new Map();
  private quotas: Map<string, QuotaUsage> = new Map();
  private readonly MINUTE = 60 * 1000;
  private readonly HOUR = 60 * this.MINUTE;
  private readonly DAY = 24 * this.HOUR;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if request is allowed
   */
  checkLimit(userId: string): RateLimitStatus {
    const now = Date.now();
    let bucket = this.buckets.get(userId);

    if (!bucket) {
      bucket = {
        tokens: this.config.burstSize,
        lastRefill: now,
      };
      this.buckets.set(userId, bucket);
    }

    // Refill tokens based on elapsed time
    const elapsed = now - bucket.lastRefill;
    const tokensToAdd =
      (elapsed / this.MINUTE) * (this.config.requestsPerMinute / 60);
    bucket.tokens = Math.min(
      this.config.burstSize,
      bucket.tokens + tokensToAdd
    );
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        resetTime: new Date(now + this.MINUTE),
      };
    }

    const retryAfter = Math.ceil((1 - bucket.tokens) / (this.config.requestsPerMinute / 60));
    return {
      allowed: false,
      remaining: 0,
      resetTime: new Date(now + retryAfter * 1000),
      retryAfter,
    };
  }

  /**
   * Track quota usage
   */
  trackUsage(userId: string): QuotaUsage {
    let quota = this.quotas.get(userId);
    const now = new Date();

    if (!quota) {
      quota = {
        userId,
        requestsUsedToday: 0,
        requestsLimitToday: this.config.requestsPerDay,
        requestsUsedThisMonth: 0,
        requestsLimitThisMonth: this.config.requestsPerDay * 30,
        resetTime: new Date(now.getTime() + this.DAY),
      };
    }

    // Check if day has passed
    if (now > quota.resetTime) {
      quota.requestsUsedToday = 0;
      quota.resetTime = new Date(now.getTime() + this.DAY);
    }

    quota.requestsUsedToday += 1;
    quota.requestsUsedThisMonth += 1;

    this.quotas.set(userId, quota);
    return quota;
  }

  /**
   * Get quota usage for user
   */
  getQuotaUsage(userId: string): QuotaUsage | null {
    return this.quotas.get(userId) || null;
  }

  /**
   * Reset quota for user (admin only)
   */
  resetQuota(userId: string): void {
    this.quotas.delete(userId);
    this.buckets.delete(userId);
  }

  /**
   * Get all active quotas
   */
  getAllQuotas(): QuotaUsage[] {
    return Array.from(this.quotas.values());
  }

  /**
   * Update rate limit config
   */
  updateConfig(config: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Clean up expired buckets (call periodically)
   */
  cleanup(): void {
    const now = Date.now();
    const expiredUsers: string[] = [];

    const bucketsArray = Array.from(this.buckets.entries());
    for (const [userId, bucket] of bucketsArray) {
      if (now - bucket.lastRefill > this.DAY) {
        expiredUsers.push(userId);
      }
    }

    for (const userId of expiredUsers) {
      this.buckets.delete(userId);
    }
  }
}

// Export singleton instance
export let rateLimiter: RateLimiter | null = null;

const HOUR_MS = 60 * 60 * 1000;

export function initializeRateLimiter(config: RateLimitConfig): RateLimiter {
  rateLimiter = new RateLimiter(config);

  setInterval(() => {
    rateLimiter?.cleanup();
  }, HOUR_MS);

  return rateLimiter;
}

// Default configuration
export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  requestsPerMinute: 60,
  requestsPerHour: 1000,
  requestsPerDay: 10000,
  burstSize: 100,
};
