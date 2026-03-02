/**
 * Webhook Subscriber Management Service
 * 
 * Manages external webhook subscriptions for autonomous decision events
 */

export interface WebhookSubscriber {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  secret: string;
  retryPolicy: {
    maxRetries: number;
    retryDelay: number;
  };
  createdAt: Date;
  lastDelivery?: Date;
}

export interface WebhookEvent {
  id: string;
  event: string;
  timestamp: Date;
  data: any;
  source: string;
}

export interface WebhookDelivery {
  id: string;
  subscriberId: string;
  eventId: string;
  status: 'pending' | 'delivered' | 'failed';
  attempts: number;
  lastError?: string;
  nextRetry?: Date;
}

class WebhookSubscriberService {
  private subscribers: Map<string, WebhookSubscriber> = new Map();
  private deliveries: Map<string, WebhookDelivery> = new Map();
  private eventQueue: WebhookEvent[] = [];

  constructor() {
    this.initializeDefaultSubscribers();
  }

  /**
   * Initialize default subscribers
   */
  private initializeDefaultSubscribers() {
    // Load from environment or database
    const defaultSubscribers: WebhookSubscriber[] = [
      {
        id: 'sub-broadcast-1',
        name: 'RRB Broadcast Webhook',
        url: process.env.RRB_WEBHOOK_URL || 'http://localhost:3001/webhooks/qumus-decisions',
        events: ['qumus:decision:broadcast', 'qumus:decision:schedule'],
        active: true,
        secret: process.env.RRB_WEBHOOK_SECRET || 'secret-broadcast',
        retryPolicy: { maxRetries: 3, retryDelay: 5000 },
        createdAt: new Date(),
      },
      {
        id: 'sub-drone-1',
        name: 'Drone Fleet Webhook',
        url: process.env.DRONE_WEBHOOK_URL || 'http://localhost:3002/webhooks/qumus-decisions',
        events: ['qumus:decision:delivery', 'qumus:decision:routing'],
        active: true,
        secret: process.env.DRONE_WEBHOOK_SECRET || 'secret-drone',
        retryPolicy: { maxRetries: 3, retryDelay: 5000 },
        createdAt: new Date(),
      },
      {
        id: 'sub-fundraising-1',
        name: 'Fundraising Webhook',
        url: process.env.FUNDRAISING_WEBHOOK_URL || 'http://localhost:3003/webhooks/qumus-decisions',
        events: ['qumus:decision:fundraising', 'qumus:decision:campaign'],
        active: true,
        secret: process.env.FUNDRAISING_WEBHOOK_SECRET || 'secret-fundraising',
        retryPolicy: { maxRetries: 3, retryDelay: 5000 },
        createdAt: new Date(),
      },
    ];

    for (const subscriber of defaultSubscribers) {
      this.subscribers.set(subscriber.id, subscriber);
    }
  }

  /**
   * Register a webhook subscriber
   */
  public registerSubscriber(subscriber: Omit<WebhookSubscriber, 'id' | 'createdAt'>): WebhookSubscriber {
    const id = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newSubscriber: WebhookSubscriber = {
      ...subscriber,
      id,
      createdAt: new Date(),
    };

    this.subscribers.set(id, newSubscriber);
    return newSubscriber;
  }

  /**
   * Unregister a webhook subscriber
   */
  public unregisterSubscriber(subscriberId: string): boolean {
    return this.subscribers.delete(subscriberId);
  }

  /**
   * Get all subscribers
   */
  public getSubscribers(): WebhookSubscriber[] {
    return Array.from(this.subscribers.values());
  }

  /**
   * Get subscriber by ID
   */
  public getSubscriber(subscriberId: string): WebhookSubscriber | undefined {
    return this.subscribers.get(subscriberId);
  }

  /**
   * Update subscriber
   */
  public updateSubscriber(subscriberId: string, updates: Partial<WebhookSubscriber>): WebhookSubscriber | undefined {
    const subscriber = this.subscribers.get(subscriberId);
    if (!subscriber) return undefined;

    const updated = { ...subscriber, ...updates, id: subscriber.id, createdAt: subscriber.createdAt };
    this.subscribers.set(subscriberId, updated);
    return updated;
  }

  /**
   * Dispatch event to subscribers
   */
  public async dispatchEvent(event: WebhookEvent) {
    this.eventQueue.push(event);

    // Find matching subscribers
    for (const [, subscriber] of this.subscribers) {
      if (!subscriber.active) continue;

      if (subscriber.events.includes(event.event) || subscriber.events.includes('*')) {
        await this.deliverEvent(subscriber, event);
      }
    }
  }

  /**
   * Deliver event to subscriber
   */
  private async deliverEvent(subscriber: WebhookSubscriber, event: WebhookEvent) {
    const deliveryId = `del-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const delivery: WebhookDelivery = {
      id: deliveryId,
      subscriberId: subscriber.id,
      eventId: event.id,
      status: 'pending',
      attempts: 0,
    };

    this.deliveries.set(deliveryId, delivery);

    // Attempt delivery with retries
    await this.attemptDelivery(delivery, subscriber, event);
  }

  /**
   * Attempt to deliver event with retry logic
   */
  private async attemptDelivery(
    delivery: WebhookDelivery,
    subscriber: WebhookSubscriber,
    event: WebhookEvent
  ) {
    const maxRetries = subscriber.retryPolicy.maxRetries;

    while (delivery.attempts < maxRetries) {
      try {
        delivery.attempts++;

        const signature = this.generateSignature(JSON.stringify(event), subscriber.secret);

        const response = await fetch(subscriber.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-ID': delivery.id,
            'X-Event-ID': event.id,
          },
          body: JSON.stringify(event),
          timeout: 10000,
        });

        if (response.ok) {
          delivery.status = 'delivered';
          subscriber.lastDelivery = new Date();
          this.deliveries.set(delivery.id, delivery);
          console.log(`[Webhook] Successfully delivered ${event.event} to ${subscriber.name}`);
          return;
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        delivery.lastError = error instanceof Error ? error.message : 'Unknown error';

        if (delivery.attempts < maxRetries) {
          delivery.nextRetry = new Date(Date.now() + subscriber.retryPolicy.retryDelay * delivery.attempts);
          await this.sleep(subscriber.retryPolicy.retryDelay * delivery.attempts);
        } else {
          delivery.status = 'failed';
        }

        this.deliveries.set(delivery.id, delivery);
      }
    }

    console.error(`[Webhook] Failed to deliver ${event.event} to ${subscriber.name} after ${maxRetries} attempts`);
  }

  /**
   * Generate HMAC signature
   */
  private generateSignature(payload: string, secret: string): string {
    const crypto = require('crypto');
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get delivery status
   */
  public getDeliveryStatus(deliveryId: string): WebhookDelivery | undefined {
    return this.deliveries.get(deliveryId);
  }

  /**
   * Get all deliveries for subscriber
   */
  public getSubscriberDeliveries(subscriberId: string): WebhookDelivery[] {
    return Array.from(this.deliveries.values()).filter((d) => d.subscriberId === subscriberId);
  }

  /**
   * Get statistics
   */
  public getStats() {
    const deliveries = Array.from(this.deliveries.values());
    const delivered = deliveries.filter((d) => d.status === 'delivered').length;
    const failed = deliveries.filter((d) => d.status === 'failed').length;
    const pending = deliveries.filter((d) => d.status === 'pending').length;

    return {
      totalSubscribers: this.subscribers.size,
      activeSubscribers: Array.from(this.subscribers.values()).filter((s) => s.active).length,
      totalDeliveries: deliveries.length,
      deliveredCount: delivered,
      failedCount: failed,
      pendingCount: pending,
      successRate: deliveries.length > 0 ? (delivered / deliveries.length) * 100 : 0,
    };
  }
}

// Global instance
let webhookService: WebhookSubscriberService | null = null;

export function initializeWebhookSubscribers(): WebhookSubscriberService {
  if (!webhookService) {
    webhookService = new WebhookSubscriberService();
  }
  return webhookService;
}

export function getWebhookSubscribers(): WebhookSubscriberService | null {
  return webhookService;
}
