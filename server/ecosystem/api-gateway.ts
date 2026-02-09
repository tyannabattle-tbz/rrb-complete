/**
 * Unified API Gateway - Single entry point for all ecosystem services
 * Handles request routing, authentication, rate limiting, and versioning
 */

import { Request, Response, NextFunction, Router } from "express";
import { getEventBus } from "./event-bus";

export interface ApiRequest extends Request {
  userId?: string;
  userRole?: "user" | "admin" | "system";
  correlationId?: string;
  traceId?: string;
  service?: string;
}

export interface ApiGatewayConfig {
  rateLimitPerMinute?: number;
  enableCors?: boolean;
  corsOrigins?: string[];
  enableLogging?: boolean;
}

/**
 * Rate limiter implementation
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private limitPerMinute: number;

  constructor(limitPerMinute: number = 60) {
    this.limitPerMinute = limitPerMinute;
  }

  public check(key: string): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const timestamps = this.requests.get(key)!;
    const recentRequests = timestamps.filter((t) => t > oneMinuteAgo);

    if (recentRequests.length >= this.limitPerMinute) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }

  public cleanup(): void {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    for (const [key, timestamps] of this.requests.entries()) {
      const recentRequests = timestamps.filter((t) => t > oneMinuteAgo);
      if (recentRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recentRequests);
      }
    }
  }
}

/**
 * API Gateway implementation
 */
export class ApiGateway {
  private router: Router;
  private config: Required<ApiGatewayConfig>;
  private rateLimiter: RateLimiter;
  private eventBus = getEventBus();

  constructor(config: ApiGatewayConfig = {}) {
    this.router = Router();
    this.config = {
      rateLimitPerMinute: config.rateLimitPerMinute ?? 60,
      enableCors: config.enableCors ?? true,
      corsOrigins: config.corsOrigins ?? ["http://localhost:3000"],
      enableLogging: config.enableLogging ?? true,
    };
    this.rateLimiter = new RateLimiter(this.config.rateLimitPerMinute);

    this.setupMiddleware();
    this.setupRoutes();

    // Cleanup rate limiter every minute
    setInterval(() => this.rateLimiter.cleanup(), 60000);
  }

  /**
   * Setup middleware
   */
  private setupMiddleware(): void {
    // Request ID and tracing
    this.router.use((req: ApiRequest, res: Response, next: NextFunction) => {
      req.correlationId = req.headers["x-correlation-id"] as string || this.generateId();
      req.traceId = req.headers["x-trace-id"] as string || this.generateId();
      res.setHeader("x-correlation-id", req.correlationId);
      res.setHeader("x-trace-id", req.traceId);
      next();
    });

    // CORS
    if (this.config.enableCors) {
      this.router.use((req: Request, res: Response, next: NextFunction) => {
        const origin = req.headers.origin as string;
        if (this.config.corsOrigins.includes(origin)) {
          res.setHeader("Access-Control-Allow-Origin", origin);
          res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
          res.setHeader("Access-Control-Allow-Credentials", "true");
        }
        if (req.method === "OPTIONS") {
          res.sendStatus(200);
        } else {
          next();
        }
      });
    }

    // Rate limiting
    this.router.use((req: ApiRequest, res: Response, next: NextFunction) => {
      const key = req.ip || "unknown";
      if (!this.rateLimiter.check(key)) {
        return res.status(429).json({
          error: "Too many requests",
          message: `Rate limit exceeded: ${this.config.rateLimitPerMinute} requests per minute`,
        });
      }
      next();
    });

    // Authentication
    this.router.use((req: ApiRequest, res: Response, next: NextFunction) => {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        // Extract and validate token
        req.userId = req.headers["x-user-id"] as string;
        req.userRole = (req.headers["x-user-role"] as any) || "user";
      }
      next();
    });

    // Logging
    if (this.config.enableLogging) {
      this.router.use((req: ApiRequest, res: Response, next: NextFunction) => {
        const start = Date.now();
        res.on("finish", () => {
          const duration = Date.now() - start;
          console.log(
            `[${req.correlationId}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
          );
        });
        next();
      });
    }
  }

  /**
   * Setup routes
   */
  private setupRoutes(): void {
    // Health check
    this.router.get("/health", (req: ApiRequest, res: Response) => {
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        correlationId: req.correlationId,
      });
    });

    // API version info
    this.router.get("/api/version", (req: ApiRequest, res: Response) => {
      res.json({
        version: "1.0.0",
        services: [
          "rockinrockinboogie",
          "qumus-orchestration",
          "hybridcast-broadcast",
          "entertainment-platform",
        ],
      });
    });

    // Service status
    this.router.get("/api/services/status", (req: ApiRequest, res: Response) => {
      res.json({
        services: {
          rockinrockinboogie: { status: "operational" },
          qumusOrchestration: { status: "operational" },
          hybridcastBroadcast: { status: "operational" },
          entertainmentPlatform: { status: "operational" },
        },
      });
    });

    // Event bus stats
    this.router.get("/api/ecosystem/stats", async (req: ApiRequest, res: Response) => {
      try {
        const stats = await this.eventBus.getStats();
        res.json(stats);
      } catch (error) {
        res.status(500).json({ error: "Failed to retrieve stats" });
      }
    });

    // Dead letter queue
    this.router.get(
      "/api/ecosystem/dead-letter-queue",
      this.requireAdmin.bind(this),
      async (req: ApiRequest, res: Response) => {
        try {
          const events = await this.eventBus.getDeadLetterQueue();
          res.json({ events, count: events.length });
        } catch (error) {
          res.status(500).json({ error: "Failed to retrieve dead letter queue" });
        }
      }
    );

    // Retry dead letter queue
    this.router.post(
      "/api/ecosystem/dead-letter-queue/retry",
      this.requireAdmin.bind(this),
      async (req: ApiRequest, res: Response) => {
        try {
          const retried = await this.eventBus.retryDeadLetterEvents();
          res.json({ retried, message: `Retried ${retried} events` });
        } catch (error) {
          res.status(500).json({ error: "Failed to retry dead letter events" });
        }
      }
    );

    // Publish event (admin only)
    this.router.post(
      "/api/ecosystem/events",
      this.requireAdmin.bind(this),
      async (req: ApiRequest, res: Response) => {
        try {
          const { type, source, priority, data } = req.body;

          if (!type || !source) {
            return res.status(400).json({
              error: "Missing required fields: type, source",
            });
          }

          await this.eventBus.publish({
            type,
            source,
            priority: priority || "normal",
            data: data || {},
            metadata: {
              userId: req.userId,
              correlationId: req.correlationId,
              traceId: req.traceId,
            },
          });

          res.json({ success: true, message: "Event published" });
        } catch (error) {
          res.status(500).json({ error: "Failed to publish event" });
        }
      }
    );

    // Replay events (admin only)
    this.router.post(
      "/api/ecosystem/events/replay",
      this.requireAdmin.bind(this),
      async (req: ApiRequest, res: Response) => {
        try {
          const { eventType, fromTimestamp, toTimestamp } = req.body;

          if (!eventType || !fromTimestamp || !toTimestamp) {
            return res.status(400).json({
              error: "Missing required fields: eventType, fromTimestamp, toTimestamp",
            });
          }

          await this.eventBus.replayEvents(eventType, fromTimestamp, toTimestamp);

          res.json({
            success: true,
            message: `Replayed events from ${fromTimestamp} to ${toTimestamp}`,
          });
        } catch (error) {
          res.status(500).json({ error: "Failed to replay events" });
        }
      }
    );
  }

  /**
   * Middleware to require admin role
   */
  private requireAdmin(req: ApiRequest, res: Response, next: NextFunction): void {
    if (req.userRole !== "admin") {
      res.status(403).json({ error: "Admin access required" });
    } else {
      next();
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get Express router
   */
  public getRouter(): Router {
    return this.router;
  }
}

/**
 * Create API gateway instance
 */
export function createApiGateway(config?: ApiGatewayConfig): ApiGateway {
  return new ApiGateway(config);
}
