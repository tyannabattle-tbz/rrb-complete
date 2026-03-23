/**
 * Cross-System Bridge Security Middleware
 * Secures all communication between RRB, Ty OS, and QUMUS systems
 * Implements authentication, request signing, rate limiting, and audit trails
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { sql } from 'drizzle-orm';

export interface CrossSystemRequest {
  sourceSystem: 'rrb' | 'tyos' | 'qumus';
  targetSystem: 'rrb' | 'tyos' | 'qumus';
  action: string;
  payload: Record<string, any>;
  signature: string;
  timestamp: number;
}

const SYSTEM_SECRETS: Record<string, string> = {
  rrb: process.env.RRB_SYSTEM_SECRET || 'rrb-secret-key-change-in-production',
  tyos: process.env.TYOS_SYSTEM_SECRET || 'tyos-secret-key-change-in-production',
  qumus: process.env.QUMUS_SYSTEM_SECRET || 'qumus-secret-key-change-in-production',
};

const RATE_LIMITS: Record<string, { requests: number; windowMs: number }> = {
  rrb_to_tyos: { requests: 1000, windowMs: 60000 }, // 1000 req/min
  tyos_to_qumus: { requests: 5000, windowMs: 60000 }, // 5000 req/min
  qumus_to_rrb: { requests: 10000, windowMs: 60000 }, // 10000 req/min
};

const requestCounts: Record<string, Array<{ timestamp: number }>> = {};

/**
 * Verify request signature
 */
export function verifyRequestSignature(
  sourceSystem: string,
  payload: Record<string, any>,
  signature: string,
  timestamp: number
): boolean {
  try {
    // Check timestamp is recent (within 5 minutes)
    const now = Date.now();
    if (Math.abs(now - timestamp) > 5 * 60 * 1000) {
      console.error('[CrossSystemBridge] Request timestamp too old:', { timestamp, now });
      return false;
    }

    // Verify signature
    const secret = SYSTEM_SECRETS[sourceSystem];
    if (!secret) {
      console.error('[CrossSystemBridge] Unknown source system:', sourceSystem);
      return false;
    }

    const data = JSON.stringify({ payload, timestamp });
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    return isValid;
  } catch (error) {
    console.error('[CrossSystemBridge] Signature verification error:', error);
    return false;
  }
}

/**
 * Create request signature
 */
export function createRequestSignature(
  sourceSystem: string,
  payload: Record<string, any>,
  timestamp: number
): string {
  const secret = SYSTEM_SECRETS[sourceSystem];
  if (!secret) {
    throw new Error(`Unknown source system: ${sourceSystem}`);
  }

  const data = JSON.stringify({ payload, timestamp });
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
}

/**
 * Check rate limit for cross-system bridge
 */
export function checkRateLimit(sourceSystem: string, targetSystem: string): boolean {
  const key = `${sourceSystem}_to_${targetSystem}`;
  const limit = RATE_LIMITS[key];

  if (!limit) {
    console.warn('[CrossSystemBridge] No rate limit configured for:', key);
    return true; // Allow if no limit configured
  }

  const now = Date.now();
  if (!requestCounts[key]) {
    requestCounts[key] = [];
  }

  // Remove old requests outside the window
  requestCounts[key] = requestCounts[key].filter(
    req => now - req.timestamp < limit.windowMs
  );

  // Check if under limit
  if (requestCounts[key].length >= limit.requests) {
    console.warn('[CrossSystemBridge] Rate limit exceeded:', { key, limit });
    return false;
  }

  // Record this request
  requestCounts[key].push({ timestamp: now });
  return true;
}

/**
 * Log cross-system bridge communication
 */
export async function logCrosSystemCommunication(
  sourceSystem: string,
  targetSystem: string,
  action: string,
  payload: Record<string, any>,
  success: boolean,
  error?: string
): Promise<void> {
  try {
    const db = await import('../db').then(m => m.getDb());
    await db.execute(
      sql`
        INSERT INTO cross_system_bridge_logs (
          source_system, target_system, action, payload, success, error, created_at
        ) VALUES (
          ${sourceSystem}, ${targetSystem}, ${action},
          ${JSON.stringify(payload)}, ${success}, ${error || null}, ${new Date()}
        )
      `
    );
  } catch (error) {
    console.error('[CrossSystemBridge] Failed to log communication:', error);
  }
}

/**
 * Cross-system bridge security middleware
 */
export function crossSystemBridgeSecurityMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Check if this is a cross-system request
    const sourceSystem = req.headers['x-source-system'] as string;
    const targetSystem = req.headers['x-target-system'] as string;
    const signature = req.headers['x-signature'] as string;
    const timestamp = parseInt(req.headers['x-timestamp'] as string, 10);

    // If no cross-system headers, pass through
    if (!sourceSystem || !targetSystem) {
      return next();
    }

    // Validate source and target systems
    const validSystems = ['rrb', 'tyos', 'qumus'];
    if (!validSystems.includes(sourceSystem) || !validSystems.includes(targetSystem)) {
      console.error('[CrossSystemBridge] Invalid system identifiers:', {
        sourceSystem,
        targetSystem,
      });
      res.status(400).json({ error: 'Invalid system identifiers' });
      return;
    }

    // Verify signature
    if (!verifyRequestSignature(sourceSystem, req.body, signature, timestamp)) {
      console.error('[CrossSystemBridge] Signature verification failed:', {
        sourceSystem,
        targetSystem,
      });
      res.status(401).json({ error: 'Signature verification failed' });
      return;
    }

    // Check rate limit
    if (!checkRateLimit(sourceSystem, targetSystem)) {
      console.error('[CrossSystemBridge] Rate limit exceeded:', {
        sourceSystem,
        targetSystem,
      });
      res.status(429).json({ error: 'Rate limit exceeded' });
      return;
    }

    // Log the communication
    logCrosSystemCommunication(
      sourceSystem,
      targetSystem,
      req.body.action || 'unknown',
      req.body.payload || {},
      true
    );

    // Add system context to request
    (req as any).crossSystemContext = {
      sourceSystem,
      targetSystem,
      timestamp,
    };

    next();
  } catch (error) {
    console.error('[CrossSystemBridge] Middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Create cross-system request
 */
export function createCrossSystemRequest(
  sourceSystem: string,
  targetSystem: string,
  action: string,
  payload: Record<string, any>
): CrossSystemRequest {
  const timestamp = Date.now();
  const signature = createRequestSignature(sourceSystem, payload, timestamp);

  return {
    sourceSystem: sourceSystem as 'rrb' | 'tyos' | 'qumus',
    targetSystem: targetSystem as 'rrb' | 'tyos' | 'qumus',
    action,
    payload,
    signature,
    timestamp,
  };
}

/**
 * Get cross-system bridge status
 */
export async function getCrosSystemBridgeStatus(): Promise<{
  status: 'operational' | 'degraded' | 'offline';
  bridges: Array<{
    source: string;
    target: string;
    status: 'operational' | 'degraded' | 'offline';
    latency: number;
    requestCount: number;
  }>;
  timestamp: Date;
}> {
  try {
    const bridges = [
      { source: 'rrb', target: 'tyos' },
      { source: 'tyos', target: 'qumus' },
      { source: 'qumus', target: 'rrb' },
      { source: 'rrb', target: 'qumus' },
      { source: 'tyos', target: 'rrb' },
      { source: 'qumus', target: 'tyos' },
    ];

    const bridgeStatus = bridges.map(bridge => {
      const key = `${bridge.source}_to_${bridge.target}`;
      const requests = requestCounts[key] || [];
      const recentRequests = requests.filter(
        r => Date.now() - r.timestamp < 60000
      ).length;

      return {
        source: bridge.source,
        target: bridge.target,
        status: recentRequests > 0 ? 'operational' : 'degraded',
        latency: Math.random() * 50 + 10, // Placeholder
        requestCount: recentRequests,
      };
    });

    const allOperational = bridgeStatus.every(b => b.status === 'operational');

    return {
      status: allOperational ? 'operational' : 'degraded',
      bridges: bridgeStatus,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('[CrossSystemBridge] Error getting bridge status:', error);
    return {
      status: 'offline',
      bridges: [],
      timestamp: new Date(),
    };
  }
}
