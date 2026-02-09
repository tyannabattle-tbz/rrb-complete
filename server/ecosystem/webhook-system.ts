/**
 * Webhook & Partnership Integration System
 * Enables third-party integrations and cross-platform communication
 */

import crypto from "crypto";
import { getEventBus } from "./event-bus";

export interface WebhookConfig {
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
  retryPolicy?: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelayMs: number;
  };
}

export interface WebhookRegistration {
  id: string;
  partnerId: string;
  config: WebhookConfig;
  createdAt: number;
  updatedAt: number;
  stats: {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    averageLatency: number;
  };
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  payload: Record<string, any>;
  status: "pending" | "delivered" | "failed";
  attempts: number;
  lastAttemptAt?: number;
  nextRetryAt?: number;
  error?: string;
}

/**
 * Webhook System implementation
 */
export class WebhookSystem {
  private eventBus = getEventBus();
  private webhooks: Map<string, WebhookRegistration> = new Map();
  private deliveryQueue: WebhookDelivery[] = [];
  private deliveryHistory: Map<string, WebhookDelivery> = new Map();

  constructor() {
    this.setupEventListeners();
    this.startDeliveryWorker();
  }

  /**
   * Register a webhook
   */
  public registerWebhook(
    partnerId: string,
    config: WebhookConfig
  ): WebhookRegistration {
    const webhookId = this.generateWebhookId();
    const secret = config.secret || this.generateSecret();

    const registration: WebhookRegistration = {
      id: webhookId,
      partnerId,
      config: {
        ...config,
        secret,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stats: {
        totalDeliveries: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
        averageLatency: 0,
      },
    };

    this.webhooks.set(webhookId, registration);
    return registration;
  }

  /**
   * Update webhook configuration
   */
  public updateWebhook(webhookId: string, config: Partial<WebhookConfig>): void {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) {
      throw new Error(`Webhook ${webhookId} not found`);
    }

    webhook.config = { ...webhook.config, ...config };
    webhook.updatedAt = Date.now();
  }

  /**
   * Deregister a webhook
   */
  public deregisterWebhook(webhookId: string): void {
    this.webhooks.delete(webhookId);
  }

  /**
   * Get webhook
   */
  public getWebhook(webhookId: string): WebhookRegistration | undefined {
    return this.webhooks.get(webhookId);
  }

  /**
   * Get webhooks for partner
   */
  public getPartnerWebhooks(partnerId: string): WebhookRegistration[] {
    return Array.from(this.webhooks.values()).filter((w) => w.partnerId === partnerId);
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    this.eventBus.subscribeAll(async (event) => {
      // Find webhooks interested in this event
      for (const webhook of this.webhooks.values()) {
        if (!webhook.config.active) continue;
        if (!webhook.config.events.includes(event.type) && !webhook.config.events.includes("*")) {
          continue;
        }

        // Queue delivery
        await this.queueDelivery(webhook, event);
      }
    });
  }

  /**
   * Queue webhook delivery
   */
  private async queueDelivery(
    webhook: WebhookRegistration,
    event: any
  ): Promise<void> {
    const delivery: WebhookDelivery = {
      id: this.generateDeliveryId(),
      webhookId: webhook.id,
      event: event.type,
      payload: event,
      status: "pending",
      attempts: 0,
    };

    this.deliveryQueue.push(delivery);
    this.deliveryHistory.set(delivery.id, delivery);
  }

  /**
   * Start delivery worker
   */
  private startDeliveryWorker(): void {
    setInterval(async () => {
      await this.processDeliveryQueue();
    }, 5000);
  }

  /**
   * Process delivery queue
   */
  private async processDeliveryQueue(): Promise<void> {
    const batch = this.deliveryQueue.splice(0, 10);

    for (const delivery of batch) {
      await this.deliverWebhook(delivery);
    }
  }

  /**
   * Deliver webhook with retry logic
   */
  private async deliverWebhook(delivery: WebhookDelivery): Promise<void> {
    const webhook = this.webhooks.get(delivery.webhookId);
    if (!webhook) {
      delivery.status = "failed";
      delivery.error = "Webhook not found";
      return;
    }

    const retryPolicy = webhook.config.retryPolicy || {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelayMs: 1000,
    };

    // Check if we should retry
    if (delivery.attempts > 0 && delivery.nextRetryAt && Date.now() < delivery.nextRetryAt) {
      this.deliveryQueue.push(delivery);
      return;
    }

    try {
      const startTime = Date.now();

      // Create signature
      const signature = this.createSignature(
        JSON.stringify(delivery.payload),
        webhook.config.secret!
      );

      // Send webhook
      const response = await fetch(webhook.config.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
          "X-Webhook-ID": webhook.id,
          "X-Delivery-ID": delivery.id,
        },
        body: JSON.stringify(delivery.payload),
        timeout: 10000,
      });

      const latency = Date.now() - startTime;

      if (response.ok) {
        delivery.status = "delivered";
        delivery.lastAttemptAt = Date.now();

        // Update stats
        webhook.stats.successfulDeliveries++;
        webhook.stats.totalDeliveries++;
        webhook.stats.averageLatency =
          (webhook.stats.averageLatency * (webhook.stats.successfulDeliveries - 1) + latency) /
          webhook.stats.successfulDeliveries;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      delivery.attempts++;
      delivery.lastAttemptAt = Date.now();

      if (delivery.attempts <= retryPolicy.maxRetries) {
        // Schedule retry
        const delay =
          retryPolicy.initialDelayMs * Math.pow(retryPolicy.backoffMultiplier, delivery.attempts - 1);
        delivery.nextRetryAt = Date.now() + delay;
        delivery.status = "pending";

        // Re-queue
        this.deliveryQueue.push(delivery);
      } else {
        delivery.status = "failed";
        delivery.error = error instanceof Error ? error.message : "Unknown error";

        // Update stats
        webhook.stats.failedDeliveries++;
        webhook.stats.totalDeliveries++;
      }
    }
  }

  /**
   * Create webhook signature
   */
  private createSignature(payload: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(payload).digest("hex");
  }

  /**
   * Verify webhook signature
   */
  public verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.createSignature(payload, secret);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  }

  /**
   * Get delivery history
   */
  public getDeliveryHistory(webhookId: string, limit: number = 100): WebhookDelivery[] {
    return Array.from(this.deliveryHistory.values())
      .filter((d) => d.webhookId === webhookId)
      .slice(-limit);
  }

  /**
   * Get delivery status
   */
  public getDeliveryStatus(deliveryId: string): WebhookDelivery | undefined {
    return this.deliveryHistory.get(deliveryId);
  }

  /**
   * Retry failed delivery
   */
  public async retryDelivery(deliveryId: string): Promise<void> {
    const delivery = this.deliveryHistory.get(deliveryId);
    if (!delivery) {
      throw new Error(`Delivery ${deliveryId} not found`);
    }

    delivery.attempts = 0;
    delivery.status = "pending";
    delivery.nextRetryAt = undefined;

    this.deliveryQueue.push(delivery);
  }

  /**
   * Get webhook statistics
   */
  public getStats(): {
    totalWebhooks: number;
    activeWebhooks: number;
    pendingDeliveries: number;
    totalDeliveries: number;
  } {
    const webhooks = Array.from(this.webhooks.values());
    const totalDeliveries = webhooks.reduce((sum, w) => sum + w.stats.totalDeliveries, 0);

    return {
      totalWebhooks: webhooks.length,
      activeWebhooks: webhooks.filter((w) => w.config.active).length,
      pendingDeliveries: this.deliveryQueue.length,
      totalDeliveries,
    };
  }

  /**
   * Generate webhook ID
   */
  private generateWebhookId(): string {
    return `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate delivery ID
   */
  private generateDeliveryId(): string {
    return `del_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate secret
   */
  private generateSecret(): string {
    return crypto.randomBytes(32).toString("hex");
  }
}

// Singleton instance
let webhookSystemInstance: WebhookSystem | null = null;

/**
 * Get or create webhook system
 */
export function getWebhookSystem(): WebhookSystem {
  if (!webhookSystemInstance) {
    webhookSystemInstance = new WebhookSystem();
  }
  return webhookSystemInstance;
}
