import { z } from 'zod';
import crypto from 'crypto';

/**
 * Webhook Service
 * Manages webhook endpoints for external system integrations
 */

export interface Webhook {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: WebhookEvent[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastTriggeredAt?: Date;
  deliveryCount: number;
  failureCount: number;
}

export type WebhookEvent =
  | 'broadcast.created'
  | 'broadcast.sent'
  | 'broadcast.delivered'
  | 'broadcast.failed'
  | 'broadcast.viewed'
  | 'user.created'
  | 'template.created'
  | 'template.updated';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, any>;
  webhookId: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: WebhookPayload;
  status: 'pending' | 'delivered' | 'failed';
  statusCode?: number;
  responseBody?: string;
  attempts: number;
  nextRetryAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage (replace with database in production)
const webhooks: Map<string, Webhook> = new Map();
const deliveries: Map<string, WebhookDelivery> = new Map();

export class WebhookService {
  /**
   * Create a new webhook
   */
  static createWebhook(
    name: string,
    url: string,
    events: WebhookEvent[]
  ): Webhook {
    const id = `wh_${crypto.randomBytes(12).toString('hex')}`;
    const secret = crypto.randomBytes(32).toString('hex');

    const webhook: Webhook = {
      id,
      name,
      url,
      secret,
      events,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deliveryCount: 0,
      failureCount: 0,
    };

    webhooks.set(id, webhook);
    return webhook;
  }

  /**
   * Get webhook by ID
   */
  static getWebhook(id: string): Webhook | undefined {
    return webhooks.get(id);
  }

  /**
   * List all webhooks
   */
  static listWebhooks(): Webhook[] {
    return Array.from(webhooks.values());
  }

  /**
   * Update webhook
   */
  static updateWebhook(
    id: string,
    updates: Partial<Webhook>
  ): Webhook | undefined {
    const webhook = webhooks.get(id);
    if (!webhook) return undefined;

    const updated = {
      ...webhook,
      ...updates,
      id: webhook.id, // Don't allow ID change
      secret: webhook.secret, // Don't allow secret change
      createdAt: webhook.createdAt, // Don't allow creation date change
      updatedAt: new Date(),
    };

    webhooks.set(id, updated);
    return updated;
  }

  /**
   * Delete webhook
   */
  static deleteWebhook(id: string): boolean {
    return webhooks.delete(id);
  }

  /**
   * Rotate webhook secret
   */
  static rotateSecret(id: string): string | undefined {
    const webhook = webhooks.get(id);
    if (!webhook) return undefined;

    const newSecret = crypto.randomBytes(32).toString('hex');
    webhook.secret = newSecret;
    webhook.updatedAt = new Date();
    webhooks.set(id, webhook);

    return newSecret;
  }

  /**
   * Trigger webhook event
   */
  static async triggerEvent(
    event: WebhookEvent,
    data: Record<string, any>
  ): Promise<void> {
    const activeWebhooks = Array.from(webhooks.values()).filter(
      (w) => w.active && w.events.includes(event)
    );

    for (const webhook of activeWebhooks) {
      await this.deliverWebhook(webhook, event, data);
    }
  }

  /**
   * Deliver webhook to endpoint
   */
  private static async deliverWebhook(
    webhook: Webhook,
    event: WebhookEvent,
    data: Record<string, any>
  ): Promise<void> {
    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
      webhookId: webhook.id,
    };

    const signature = this.generateSignature(
      JSON.stringify(payload),
      webhook.secret
    );

    const delivery: WebhookDelivery = {
      id: `wd_${crypto.randomBytes(12).toString('hex')}`,
      webhookId: webhook.id,
      event,
      payload,
      status: 'pending',
      attempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    deliveries.set(delivery.id, delivery);

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-ID': webhook.id,
          'X-Webhook-Event': event,
        },
        body: JSON.stringify(payload),
        timeout: 10000,
      });

      delivery.attempts++;
      delivery.statusCode = response.status;
      delivery.responseBody = await response.text();

      if (response.ok) {
        delivery.status = 'delivered';
        webhook.deliveryCount++;
      } else {
        delivery.status = 'failed';
        webhook.failureCount++;
        delivery.nextRetryAt = new Date(Date.now() + 5 * 60 * 1000); // Retry in 5 minutes
      }
    } catch (error) {
      delivery.attempts++;
      delivery.status = 'failed';
      delivery.responseBody = String(error);
      webhook.failureCount++;
      delivery.nextRetryAt = new Date(Date.now() + 5 * 60 * 1000);
    }

    webhook.lastTriggeredAt = new Date();
    webhook.updatedAt = new Date();
    webhooks.set(webhook.id, webhook);
    deliveries.set(delivery.id, delivery);
  }

  /**
   * Generate webhook signature
   */
  static generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Verify webhook signature
   */
  static verifySignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Get webhook deliveries
   */
  static getDeliveries(webhookId: string): WebhookDelivery[] {
    return Array.from(deliveries.values()).filter(
      (d) => d.webhookId === webhookId
    );
  }

  /**
   * Get delivery by ID
   */
  static getDelivery(id: string): WebhookDelivery | undefined {
    return deliveries.get(id);
  }

  /**
   * Retry failed delivery
   */
  static async retryDelivery(deliveryId: string): Promise<void> {
    const delivery = deliveries.get(deliveryId);
    if (!delivery) return;

    const webhook = webhooks.get(delivery.webhookId);
    if (!webhook) return;

    await this.deliverWebhook(webhook, delivery.event, delivery.payload.data);
  }

  /**
   * Get webhook statistics
   */
  static getStats(webhookId: string): {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    successRate: number;
    lastDelivery?: Date;
  } {
    const webhookDeliveries = this.getDeliveries(webhookId);
    const successful = webhookDeliveries.filter(
      (d) => d.status === 'delivered'
    ).length;
    const failed = webhookDeliveries.filter((d) => d.status === 'failed').length;
    const total = webhookDeliveries.length;

    return {
      totalDeliveries: total,
      successfulDeliveries: successful,
      failedDeliveries: failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      lastDelivery: webhookDeliveries[webhookDeliveries.length - 1]?.updatedAt,
    };
  }
}

// Webhook event schema for validation
export const WebhookEventSchema = z.enum([
  'broadcast.created',
  'broadcast.sent',
  'broadcast.delivered',
  'broadcast.failed',
  'broadcast.viewed',
  'user.created',
  'template.created',
  'template.updated',
]);

export const CreateWebhookSchema = z.object({
  name: z.string().min(1).max(255),
  url: z.string().url(),
  events: z.array(WebhookEventSchema).min(1),
});

export const UpdateWebhookSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  active: z.boolean().optional(),
  events: z.array(WebhookEventSchema).optional(),
});
