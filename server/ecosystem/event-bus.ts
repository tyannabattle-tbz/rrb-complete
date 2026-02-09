/**
 * Central Event Bus - Routes events between all ecosystem services
 * Provides unified event handling, deduplication, and replay capability
 */

import { EventEmitter } from "events";

export type EventType =
  // System events
  | "system.startup"
  | "system.shutdown"
  | "system.health_check"
  | "system.error"
  // User events
  | "user.login"
  | "user.logout"
  | "user.profile_updated"
  | "user.role_changed"
  // Content events
  | "content.created"
  | "content.updated"
  | "content.deleted"
  | "content.published"
  // Broadcast events
  | "broadcast.started"
  | "broadcast.ended"
  | "broadcast.alert"
  | "broadcast.scheduled"
  // Analytics events
  | "analytics.user_action"
  | "analytics.stream_started"
  | "analytics.stream_ended"
  | "analytics.metric_recorded"
  // QUMUS events
  | "qumus.decision_made"
  | "qumus.policy_executed"
  | "qumus.human_review_needed"
  | "qumus.anomaly_detected"
  // Donation events
  | "donation.received"
  | "donation.processed"
  | "donation.failed"
  // Integration events
  | "integration.webhook_received"
  | "integration.sync_started"
  | "integration.sync_completed"
  | "integration.sync_failed";

export interface EcosystemEvent {
  id: string;
  type: EventType;
  timestamp: number;
  source: string;
  priority: "low" | "normal" | "high" | "critical";
  data: Record<string, any>;
  metadata?: {
    userId?: string;
    correlationId?: string;
    traceId?: string;
  };
}

export interface EventHandler {
  (event: EcosystemEvent): Promise<void> | void;
}

export interface EventBusConfig {
  redisUrl?: string;
  enablePersistence?: boolean;
  maxRetries?: number;
  retryDelayMs?: number;
}

/**
 * Central Event Bus implementation
 * Handles event routing, deduplication, and persistence
 */
export class EcosystemEventBus {
  private emitter: EventEmitter;
  private handlers: Map<EventType, Set<EventHandler>> = new Map();
  private processedEvents: Set<string> = new Set();
  private deadLetterQueue: EcosystemEvent[] = [];
  private eventHistory: Map<string, EcosystemEvent[]> = new Map();
  private config: Required<EventBusConfig>;

  constructor(config: EventBusConfig = {}) {
    this.emitter = new EventEmitter();
    this.config = {
      redisUrl: config.redisUrl || process.env.REDIS_URL || "redis://localhost:6379",
      enablePersistence: config.enablePersistence ?? true,
      maxRetries: config.maxRetries ?? 3,
      retryDelayMs: config.retryDelayMs ?? 1000,
    };
  }

  /**
   * Subscribe to events of a specific type
   */
  public subscribe(eventType: EventType, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  /**
   * Subscribe to all events
   */
  public subscribeAll(handler: EventHandler): () => void {
    this.emitter.on("*", handler);
    return () => {
      this.emitter.off("*", handler);
    };
  }

  /**
   * Publish an event to the bus
   */
  public async publish(event: Omit<EcosystemEvent, "id" | "timestamp">): Promise<void> {
    const fullEvent: EcosystemEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: Date.now(),
    };

    // Check for duplicates
    if (this.processedEvents.has(fullEvent.id)) {
      console.warn(`Duplicate event detected: ${fullEvent.id}`);
      return;
    }

    // Mark as processed
    this.processedEvents.add(fullEvent.id);

    // Persist to Redis if enabled
    if (this.config.enablePersistence && this.redis) {
      await this.persistEvent(fullEvent);
    }

    // Route to handlers
    await this.routeEvent(fullEvent);
  }

  /**
   * Route event to appropriate handlers with retry logic
   */
  private async routeEvent(event: EcosystemEvent): Promise<void> {
    const handlers = this.handlers.get(event.type);
    if (!handlers || handlers.size === 0) {
      console.debug(`No handlers registered for event type: ${event.type}`);
      return;
    }

    const promises = Array.from(handlers).map((handler) =>
      this.executeHandler(handler, event)
    );

    await Promise.allSettled(promises);
  }

  /**
   * Execute a handler with retry logic
   */
  private async executeHandler(
    handler: EventHandler,
    event: EcosystemEvent,
    attempt: number = 0
  ): Promise<void> {
    try {
      await handler(event);
    } catch (error) {
      if (attempt < this.config.maxRetries) {
        const delay = this.config.retryDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        await this.executeHandler(handler, event, attempt + 1);
      } else {
        console.error(`Handler failed after ${this.config.maxRetries} retries:`, error);
        this.deadLetterQueue.push(event);
        await this.persistDeadLetterEvent(event, error);
      }
    }
  }

  /**
   * Persist event to in-memory storage for replay capability
   */
  private async persistEvent(event: EcosystemEvent): Promise<void> {
    try {
      const key = `events:${event.type}`;
      if (!this.eventHistory.has(key)) {
        this.eventHistory.set(key, []);
      }
      this.eventHistory.get(key)!.push(event);

      // Keep only last 1000 events per type to manage memory
      const history = this.eventHistory.get(key)!;
      if (history.length > 1000) {
        history.shift();
      }
    } catch (error) {
      console.error("Failed to persist event:", error);
    }
  }

  /**
   * Persist failed event to dead letter queue
   */
  private async persistDeadLetterEvent(
    event: EcosystemEvent,
    error: any
  ): Promise<void> {
    try {
      const dlqEvent = {
        ...event,
        error: error.message,
        failedAt: new Date().toISOString(),
      };
      // Keep last 100 failed events
      if (this.deadLetterQueue.length >= 100) {
        this.deadLetterQueue.shift();
      }
      this.deadLetterQueue.push(dlqEvent);
    } catch (error) {
      console.error("Failed to persist dead letter event:", error);
    }
  }

  /**
   * Replay events from a specific time range
   */
  public async replayEvents(
    eventType: EventType,
    fromTimestamp: number,
    toTimestamp: number
  ): Promise<void> {
    try {
      const key = `events:${eventType}`;
      const events = this.eventHistory.get(key) || [];
      const filtered = events.filter(
        (e) => e.timestamp >= fromTimestamp && e.timestamp <= toTimestamp
      );

      for (const event of filtered) {
        await this.routeEvent(event);
      }
    } catch (error) {
      console.error("Failed to replay events:", error);
    }
  }

  /**
   * Get dead letter queue events
   */
  public async getDeadLetterQueue(): Promise<EcosystemEvent[]> {
    return this.deadLetterQueue;
  }

  /**
   * Retry failed events from dead letter queue
   */
  public async retryDeadLetterEvents(): Promise<number> {
    const dlqEvents = await this.getDeadLetterQueue();
    let retried = 0;

    for (const event of dlqEvents) {
      try {
        await this.routeEvent(event);
        retried++;
      } catch (error) {
        console.error(`Failed to retry event ${event.id}:`, error);
      }
    }

    return retried;
  }

  /**
   * Get event statistics
   */
  public async getStats(): Promise<{
    processedEvents: number;
    deadLetterQueueSize: number;
    handlerCount: number;
    eventTypeCount: number;
  }> {
    const dlqEvents = await this.getDeadLetterQueue();
    return {
      processedEvents: this.processedEvents.size,
      deadLetterQueueSize: dlqEvents.length,
      handlerCount: Array.from(this.handlers.values()).reduce(
        (sum, set) => sum + set.size,
        0
      ),
      eventTypeCount: this.handlers.size,
    };
  }

  /**
   * Clear processed events cache (for memory management)
   */
  public clearProcessedEvents(): void {
    this.processedEvents.clear();
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Shutdown event bus
   */
  public async shutdown(): Promise<void> {
    this.emitter.removeAllListeners();
    this.handlers.clear();
    this.eventHistory.clear();
    this.deadLetterQueue = [];
  }
}

// Singleton instance
let eventBusInstance: EcosystemEventBus | null = null;

/**
 * Get or create event bus instance
 */
export function getEventBus(config?: EventBusConfig): EcosystemEventBus {
  if (!eventBusInstance) {
    eventBusInstance = new EcosystemEventBus(config);
  }
  return eventBusInstance;
}

/**
 * Reset event bus (for testing)
 */
export function resetEventBus(): void {
  if (eventBusInstance) {
    eventBusInstance.shutdown();
    eventBusInstance = null;
  }
}
