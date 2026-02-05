import compression from "compression";
import { Request, Response, NextFunction } from "express";
import * as redis from "./redis";

// Type definitions for cache operations
interface CacheData {
  [key: string]: any;
}

/**
 * Response caching middleware with Redis
 */
export const createCacheMiddleware = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== "GET") {
      return next();
    }

    const cacheKey = `cache:${req.originalUrl}`;

    try {
      // Try to get from cache (implementation depends on redis module)
      // For now, skip cache retrieval
      // const cached = await redis.getCache(cacheKey);
      // if (cached) {
      //   res.set("X-Cache", "HIT");
      //   return res.json(cached);
      // }
    } catch (error) {
      console.error("[Cache] Error retrieving from cache:", error);
    }

    // Wrap res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = function (data: any) {
      // Cache the response (implementation depends on redis module)
      // For now, just set the cache header
      res.set("X-Cache", "MISS");
      return originalJson(data);
    };

    next();
  };
};

/**
 * Response compression middleware
 */
export const compressionMiddleware = compression({
  level: 6,
  threshold: 1024, // Only compress responses > 1KB
  filter: (req: Request, res: Response) => {
    if (req.headers["x-no-compression"]) {
      return false;
    }
    return compression.filter(req, res);
  },
});

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
}

/**
 * In-memory rate limiter (for single-server deployments)
 * For distributed deployments, use Redis-based rate limiter
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(config: RateLimitConfig) {
    this.windowMs = config.windowMs;
    this.maxRequests = config.maxRequests;

    // Cleanup old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let requests = this.requests.get(identifier) || [];

    // Filter out old requests outside the window
    requests = requests.filter((timestamp) => timestamp > windowStart);

    if (requests.length >= this.maxRequests) {
      return false;
    }

    requests.push(now);
    this.requests.set(identifier, requests);
    return true;
  }

  private cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const entries = Array.from(this.requests.entries());
    for (const [identifier, requests] of entries) {
      const filtered = requests.filter((timestamp: number) => timestamp > windowStart);
      if (filtered.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, filtered);
      }
    }
  }
}

/**
 * Create rate limiting middleware
 */
export const createRateLimitMiddleware = (config: RateLimitConfig) => {
  const limiter = new RateLimiter(config);

  return (req: any, res: any, next: NextFunction) => {
    const identifier = req.ip || req.socket.remoteAddress || "unknown";

    if (!limiter.isAllowed(identifier)) {
      res.status(429).json({
        error: "Too many requests",
        message: config.message || "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil(config.windowMs / 1000),
      });
      return;
    }

    next();
  };
};

/**
 * Query optimization helper
 */
export const optimizeQuery = (query: any) => {
  // Add indexes for commonly queried fields
  // This is a placeholder for actual query optimization logic
  return query;
};

/**
 * Database connection pooling configuration
 */
export const getPoolConfig = () => {
  return {
    max: 20, // Maximum number of connections
    min: 5, // Minimum number of connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
};

/**
 * Cache invalidation helper
 */
export const invalidateCache = async (pattern: string) => {
  try {
    // For now, just log the invalidation request
    // In production, implement Redis SCAN for pattern-based deletion
    console.log(`[Cache] Invalidation requested for pattern: ${pattern}`);
  } catch (error) {
    console.error("[Cache] Error invalidating cache:", error);
  }
};

/**
 * Performance monitoring helper
 */
export const measurePerformance = (operationName: string) => {
  const startTime = Date.now();

  return {
    end: () => {
      const duration = Date.now() - startTime;
      console.log(`[Performance] ${operationName} took ${duration}ms`);
      return duration;
    },
  };
};

/**
 * Batch operation helper for bulk inserts/updates
 */
export const batchOperation = async <T>(
  items: T[],
  operation: (batch: T[]) => Promise<void>,
  batchSize: number = 100
) => {
  const batches = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    await operation(batch);
  }
};
