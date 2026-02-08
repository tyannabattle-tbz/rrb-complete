import { EventEmitter } from 'events';

export interface WebhookEvent {
  id: string;
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
  source: string;
  retries: number;
  maxRetries: number;
}

export interface WebhookHandler {
  (event: WebhookEvent): Promise<void>;
}

export interface WebhookListener {
  eventType: string;
  handler: WebhookHandler;
  subsystem: string;
}

export class WebhookEventSystem extends EventEmitter {
  private listeners: Map<string, WebhookListener[]> = new Map();
  private eventQueue: WebhookEvent[] = [];
  private processing = false;
  private retryDelay = 1000; // Start with 1 second

  /**
   * Register a webhook listener for an event type
   */
  registerListener(eventType: string, handler: WebhookHandler, subsystem: string): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    this.listeners.get(eventType)!.push({
      eventType,
      handler,
      subsystem,
    });

    console.log(`[Webhook] Registered listener for ${eventType} on ${subsystem}`);
  }

  /**
   * Emit a webhook event
   */
  async emitEvent(eventType: string, data: Record<string, unknown>, source: string): Promise<void> {
    const event: WebhookEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      timestamp: Date.now(),
      data,
      source,
      retries: 0,
      maxRetries: 3,
    };

    console.log(`[Webhook] Event emitted: ${eventType} from ${source}`);
    this.eventQueue.push(event);
    await this.processQueue();
  }

  /**
   * Process the event queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.eventQueue.length === 0) {
      return;
    }

    this.processing = true;

    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift()!;
        await this.processEvent(event);
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Process a single event
   */
  private async processEvent(event: WebhookEvent): Promise<void> {
    const listeners = this.listeners.get(event.type) || [];

    if (listeners.length === 0) {
      console.warn(`[Webhook] No listeners for event type: ${event.type}`);
      return;
    }

    for (const listener of listeners) {
      try {
        await listener.handler(event);
        console.log(`[Webhook] Event ${event.id} processed by ${listener.subsystem}`);
        this.emit('event-processed', { event, subsystem: listener.subsystem });
      } catch (error) {
        console.error(`[Webhook] Error processing event ${event.id} in ${listener.subsystem}:`, error);

        if (event.retries < event.maxRetries) {
          event.retries++;
          const delay = this.retryDelay * Math.pow(2, event.retries - 1); // Exponential backoff
          console.log(`[Webhook] Retrying event ${event.id} in ${delay}ms (attempt ${event.retries}/${event.maxRetries})`);

          setTimeout(() => {
            this.eventQueue.push(event);
            this.processQueue();
          }, delay);
        } else {
          console.error(`[Webhook] Event ${event.id} failed after ${event.maxRetries} retries`);
          this.emit('event-failed', { event, subsystem: listener.subsystem, error });
        }
      }
    }
  }

  /**
   * Get all registered listeners
   */
  getListeners(): Map<string, WebhookListener[]> {
    return this.listeners;
  }

  /**
   * Get event queue status
   */
  getQueueStatus(): {
    queueLength: number;
    processing: boolean;
    totalListeners: number;
  } {
    return {
      queueLength: this.eventQueue.length,
      processing: this.processing,
      totalListeners: Array.from(this.listeners.values()).reduce((sum, arr) => sum + arr.length, 0),
    };
  }

  /**
   * Clear all listeners
   */
  clearListeners(): void {
    this.listeners.clear();
    console.log('[Webhook] All listeners cleared');
  }

  /**
   * Clear event queue
   */
  clearQueue(): void {
    this.eventQueue = [];
    console.log('[Webhook] Event queue cleared');
  }
}

// Singleton instance
let webhookSystem: WebhookEventSystem | null = null;

/**
 * Get or create webhook event system
 */
export function getWebhookSystem(): WebhookEventSystem {
  if (!webhookSystem) {
    webhookSystem = new WebhookEventSystem();
  }
  return webhookSystem;
}

/**
 * Initialize webhook event system with default listeners
 */
export async function initializeWebhookSystem(): Promise<void> {
  const system = getWebhookSystem();

  // Broadcast completion event listener
  system.registerListener(
    'broadcast.completed',
    async (event) => {
      console.log('[Webhook] Broadcast completed:', event.data.broadcastId);
      // Trigger next broadcast scheduling
      system.emitEvent('rockin-boogie.schedule-next', {
        previousBroadcastId: event.data.broadcastId,
        timestamp: Date.now(),
      }, 'webhook-system');
    },
    'RRB'
  );

  // Viewer analytics update listener
  system.registerListener(
    'hybridcast.viewers-updated',
    async (event) => {
      console.log('[Webhook] Viewer metrics updated:', event.data.viewerCount);
      // Update analytics and trigger decisions if needed
      system.emitEvent('analytics.update', {
        viewerCount: event.data.viewerCount,
        platform: event.data.platform,
        timestamp: Date.now(),
      }, 'webhook-system');
    },
    'HybridCast'
  );

  // Content generation trigger listener
  system.registerListener(
    'rockin-boogie.schedule-next',
    async (event) => {
      console.log('[Webhook] Scheduling next broadcast');
      // Auto-generate content for next broadcast
      system.emitEvent('content.generate', {
        contentType: event.data.contentType || 'mixed',
        timestamp: Date.now(),
      }, 'webhook-system');
    },
    'RRB'
  );

  // Content generation completion listener
  system.registerListener(
    'content.generated',
    async (event) => {
      console.log('[Webhook] Content generated, updating RRB');
      // Update RRB with new content
      system.emitEvent('rockin-boogie.content-ready', {
        contentId: event.data.contentId,
        contentType: event.data.contentType,
        timestamp: Date.now(),
      }, 'webhook-system');
    },
    'RRB'
  );

  console.log('[Webhook] System initialized with default listeners');
}
