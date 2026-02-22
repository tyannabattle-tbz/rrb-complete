/**
 * Webhook Integration Service
 * Real-time event delivery to external systems
 */

import axios from 'axios';

export interface WebhookEvent {
  type: string;
  timestamp: Date;
  data: Record<string, any>;
  eventId: string;
  source: string;
}

export interface WebhookSubscription {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: Date;
  lastTriggeredAt?: Date;
  failureCount: number;
  maxRetries: number;
}

/**
 * Webhook manager for event delivery
 */
export class WebhookManager {
  private subscriptions = new Map<string, WebhookSubscription>();
  private eventQueue: WebhookEvent[] = [];
  private readonly maxRetries = 3;
  private readonly retryDelay = 5000; // 5 seconds

  /**
   * Subscribe to webhook events
   */
  subscribe(url: string, events: string[]): WebhookSubscription {
    const id = `webhook-${Date.now()}`;
    const subscription: WebhookSubscription = {
      id,
      url,
      events,
      active: true,
      createdAt: new Date(),
      failureCount: 0,
      maxRetries: this.maxRetries,
    };

    this.subscriptions.set(id, subscription);
    console.log(`[Webhook] Subscribed to ${events.join(', ')} at ${url}`);

    return subscription;
  }

  /**
   * Unsubscribe from webhooks
   */
  unsubscribe(webhookId: string): boolean {
    const removed = this.subscriptions.delete(webhookId);
    if (removed) {
      console.log(`[Webhook] Unsubscribed ${webhookId}`);
    }
    return removed;
  }

  /**
   * Emit event to all subscribed webhooks
   */
  async emit(event: WebhookEvent): Promise<void> {
    this.eventQueue.push(event);

    const matchingSubscriptions = Array.from(this.subscriptions.values()).filter(
      (sub) => sub.active && sub.events.includes(event.type)
    );

    console.log(`[Webhook] Emitting ${event.type} event to ${matchingSubscriptions.length} subscribers`);

    for (const subscription of matchingSubscriptions) {
      await this.deliverEvent(subscription, event);
    }
  }

  /**
   * Deliver event with retry logic
   */
  private async deliverEvent(subscription: WebhookSubscription, event: WebhookEvent): Promise<void> {
    let retryCount = 0;

    while (retryCount < subscription.maxRetries) {
      try {
        const response = await axios.post(subscription.url, event, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Event': event.type,
            'X-Webhook-ID': subscription.id,
            'X-Webhook-Timestamp': event.timestamp.toISOString(),
          },
        });

        if (response.status === 200 || response.status === 201) {
          subscription.lastTriggeredAt = new Date();
          subscription.failureCount = 0;
          console.log(`[Webhook] Successfully delivered ${event.type} to ${subscription.url}`);
          return;
        }
      } catch (error) {
        retryCount++;
        console.error(`[Webhook] Delivery attempt ${retryCount} failed for ${subscription.url}:`, error);

        if (retryCount < subscription.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay * retryCount));
        }
      }
    }

    // Mark as failed after all retries
    subscription.failureCount++;
    if (subscription.failureCount >= 5) {
      subscription.active = false;
      console.error(`[Webhook] Disabled ${subscription.url} after ${subscription.failureCount} failures`);
    }
  }

  /**
   * Get all subscriptions
   */
  getSubscriptions(): WebhookSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * Get subscription by ID
   */
  getSubscription(id: string): WebhookSubscription | null {
    return this.subscriptions.get(id) || null;
  }

  /**
   * Update subscription
   */
  updateSubscription(id: string, updates: Partial<WebhookSubscription>): WebhookSubscription | null {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return null;

    const updated = { ...subscription, ...updates };
    this.subscriptions.set(id, updated);
    return updated;
  }

  /**
   * Get event queue
   */
  getEventQueue(): WebhookEvent[] {
    return this.eventQueue;
  }

  /**
   * Clear event queue
   */
  clearEventQueue(): void {
    this.eventQueue = [];
  }

  /**
   * Get webhook health status
   */
  getHealth(): {
    totalSubscriptions: number;
    activeSubscriptions: number;
    failedSubscriptions: number;
    queuedEvents: number;
  } {
    const subscriptions = Array.from(this.subscriptions.values());
    return {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter((s) => s.active).length,
      failedSubscriptions: subscriptions.filter((s) => !s.active).length,
      queuedEvents: this.eventQueue.length,
    };
  }
}

/**
 * Global webhook manager instance
 */
export const globalWebhookManager = new WebhookManager();

/**
 * Predefined webhook event types
 */
export const WebhookEventTypes = {
  PANELIST_INVITED: 'panelist.invited',
  PANELIST_CONFIRMED: 'panelist.confirmed',
  PANELIST_DECLINED: 'panelist.declined',
  REMINDER_SENT: 'reminder.sent',
  REMINDER_FAILED: 'reminder.failed',
  EVENT_CREATED: 'event.created',
  EVENT_UPDATED: 'event.updated',
  EVENT_CANCELLED: 'event.cancelled',
  EVENT_STARTED: 'event.started',
  EVENT_COMPLETED: 'event.completed',
  ANALYTICS_UPDATED: 'analytics.updated',
  SURVEY_SUBMITTED: 'survey.submitted',
} as const;

/**
 * Emit panelist invited event
 */
export async function emitPanelistInvited(panelistId: string, eventId: string, email: string): Promise<void> {
  await globalWebhookManager.emit({
    type: WebhookEventTypes.PANELIST_INVITED,
    timestamp: new Date(),
    data: { panelistId, eventId, email },
    eventId,
    source: 'panelist-service',
  });
}

/**
 * Emit panelist response event
 */
export async function emitPanelistResponse(
  panelistId: string,
  eventId: string,
  status: 'confirmed' | 'declined'
): Promise<void> {
  const eventType = status === 'confirmed' ? WebhookEventTypes.PANELIST_CONFIRMED : WebhookEventTypes.PANELIST_DECLINED;

  await globalWebhookManager.emit({
    type: eventType,
    timestamp: new Date(),
    data: { panelistId, eventId, status },
    eventId,
    source: 'panelist-service',
  });
}

/**
 * Emit reminder sent event
 */
export async function emitReminderSent(eventId: string, panelistId: string, reminderType: string): Promise<void> {
  await globalWebhookManager.emit({
    type: WebhookEventTypes.REMINDER_SENT,
    timestamp: new Date(),
    data: { eventId, panelistId, reminderType },
    eventId,
    source: 'reminder-service',
  });
}

/**
 * Emit event status change
 */
export async function emitEventStatusChange(
  eventId: string,
  status: 'created' | 'updated' | 'cancelled' | 'started' | 'completed'
): Promise<void> {
  const eventTypeMap = {
    created: WebhookEventTypes.EVENT_CREATED,
    updated: WebhookEventTypes.EVENT_UPDATED,
    cancelled: WebhookEventTypes.EVENT_CANCELLED,
    started: WebhookEventTypes.EVENT_STARTED,
    completed: WebhookEventTypes.EVENT_COMPLETED,
  };

  await globalWebhookManager.emit({
    type: eventTypeMap[status],
    timestamp: new Date(),
    data: { eventId, status },
    eventId,
    source: 'event-service',
  });
}

/**
 * Emit analytics update
 */
export async function emitAnalyticsUpdate(eventId: string, metrics: Record<string, any>): Promise<void> {
  await globalWebhookManager.emit({
    type: WebhookEventTypes.ANALYTICS_UPDATED,
    timestamp: new Date(),
    data: { eventId, metrics },
    eventId,
    source: 'analytics-service',
  });
}

/**
 * Emit survey submission
 */
export async function emitSurveySubmitted(eventId: string, panelistId: string, responses: Record<string, any>): Promise<void> {
  await globalWebhookManager.emit({
    type: WebhookEventTypes.SURVEY_SUBMITTED,
    timestamp: new Date(),
    data: { eventId, panelistId, responses },
    eventId,
    source: 'survey-service',
  });
}
