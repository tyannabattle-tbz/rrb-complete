import Redis from 'ioredis';

let redisClient: Redis | null = null;

/**
 * Get or create Redis connection
 */
export function getRedis(): Redis {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      enableOfflineQueue: true,
    });

    redisClient.on('error', (err) => {
      console.error('[Redis] Connection error:', err);
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Connected successfully');
    });

    redisClient.on('disconnect', () => {
      console.log('[Redis] Disconnected');
    });
  }

  return redisClient;
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

/**
 * Store state in Redis with TTL
 * @param key - Redis key (e.g., "state:user:123")
 * @param state - State object to store
 * @param ttlSeconds - Time to live in seconds (default: 24 hours)
 */
export async function setState(
  key: string,
  state: any,
  ttlSeconds: number = 86400
): Promise<void> {
  const redis = getRedis();
  const serialized = JSON.stringify(state);
  
  await redis.setex(key, ttlSeconds, serialized);
  console.log(`[Redis] Stored state at ${key} with TTL ${ttlSeconds}s`);
}

/**
 * Retrieve state from Redis
 * @param key - Redis key
 * @returns State object or null if not found
 */
export async function getState(key: string): Promise<any | null> {
  const redis = getRedis();
  const serialized = await redis.get(key);
  
  if (!serialized) {
    return null;
  }

  try {
    return JSON.parse(serialized);
  } catch (error) {
    console.error(`[Redis] Failed to parse state at ${key}:`, error);
    return null;
  }
}

/**
 * Delete state from Redis
 * @param key - Redis key
 */
export async function deleteState(key: string): Promise<void> {
  const redis = getRedis();
  await redis.del(key);
  console.log(`[Redis] Deleted state at ${key}`);
}

/**
 * Check if key exists in Redis
 * @param key - Redis key
 */
export async function hasState(key: string): Promise<boolean> {
  const redis = getRedis();
  const exists = await redis.exists(key);
  return exists === 1;
}

/**
 * Store decision in Redis for audit trail
 * @param decision - Decision object with decisionId, userId, policy, timestamp, etc.
 * @param ttlSeconds - Time to live in seconds (default: 30 days)
 */
export async function storeDecision(
  decision: any,
  ttlSeconds: number = 2592000
): Promise<void> {
  const redis = getRedis();
  const key = `decision:${decision.decisionId}`;
  const serialized = JSON.stringify({
    ...decision,
    storedAt: new Date().toISOString(),
  });

  await redis.setex(key, ttlSeconds, serialized);
  
  // Also add to user's decision list
  const userDecisionsKey = `decisions:user:${decision.userId}`;
  await redis.lpush(userDecisionsKey, decision.decisionId);
  await redis.expire(userDecisionsKey, ttlSeconds);

  console.log(`[Redis] Stored decision ${decision.decisionId}`);
}

/**
 * Retrieve decision from Redis
 * @param decisionId - Decision ID
 */
export async function getDecision(decisionId: string): Promise<any | null> {
  const redis = getRedis();
  const key = `decision:${decisionId}`;
  const serialized = await redis.get(key);

  if (!serialized) {
    return null;
  }

  try {
    return JSON.parse(serialized);
  } catch (error) {
    console.error(`[Redis] Failed to parse decision ${decisionId}:`, error);
    return null;
  }
}

/**
 * Get user's decision history
 * @param userId - User ID
 * @param limit - Number of decisions to retrieve (default: 100)
 */
export async function getUserDecisions(
  userId: number,
  limit: number = 100
): Promise<string[]> {
  const redis = getRedis();
  const key = `decisions:user:${userId}`;
  const decisionIds = await redis.lrange(key, 0, limit - 1);
  return decisionIds;
}

/**
 * Store audit log entry
 * @param entry - Audit log entry
 * @param ttlSeconds - Time to live in seconds (default: 90 days)
 */
export async function storeAuditLog(
  entry: any,
  ttlSeconds: number = 7776000
): Promise<void> {
  const redis = getRedis();
  const timestamp = new Date().toISOString();
  const key = `audit:${timestamp}:${Math.random()}`;
  const serialized = JSON.stringify({
    ...entry,
    timestamp,
  });

  await redis.setex(key, ttlSeconds, serialized);
  
  // Add to global audit log list
  await redis.lpush('audit:log', key);
  await redis.expire('audit:log', ttlSeconds);

  console.log(`[Redis] Stored audit log entry`);
}

/**
 * Get recent audit logs
 * @param limit - Number of logs to retrieve (default: 1000)
 */
export async function getAuditLogs(limit: number = 1000): Promise<any[]> {
  const redis = getRedis();
  const keys = await redis.lrange('audit:log', 0, limit - 1);
  
  const logs: any[] = [];
  for (const key of keys) {
    const serialized = await redis.get(key);
    if (serialized) {
      try {
        logs.push(JSON.parse(serialized));
      } catch (error) {
        console.error(`[Redis] Failed to parse audit log:`, error);
      }
    }
  }

  return logs;
}

/**
 * Clean up expired states for inactive users
 * @param pattern - Redis key pattern (default: "state:user:*")
 */
export async function cleanupExpiredStates(pattern: string = 'state:user:*'): Promise<number> {
  const redis = getRedis();
  
  // Redis will automatically clean up expired keys, but we can manually trigger cleanup
  const keys = await redis.keys(pattern);
  let cleaned = 0;

  for (const key of keys) {
    const ttl = await redis.ttl(key);
    if (ttl === -1) {
      // Key has no expiration, set one
      await redis.expire(key, 86400); // 24 hours
      cleaned++;
    }
  }

  console.log(`[Redis] Cleaned up ${cleaned} expired states`);
  return cleaned;
}

/**
 * Get Redis connection stats
 */
export async function getRedisStats(): Promise<any> {
  const redis = getRedis();
  const info = await redis.info('stats');
  const keys = await redis.dbsize();

  return {
    connected: redis.status === 'ready',
    status: redis.status,
    totalKeys: keys,
    info,
  };
}
