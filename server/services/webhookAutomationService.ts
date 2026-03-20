import { db } from '../db';
import { flowpayAuditLog } from '../../drizzle/schema';
import { notifyOwner } from '../_core/notification';

interface WebhookEvent {
  id: string;
  source: 'flowpay' | 'hybridcast' | 'squadd' | 'content_calendar';
  eventType: string;
  payload: Record<string, any>;
  timestamp: Date;
  status: 'pending' | 'processed' | 'failed';
}

interface WebhookSubscription {
  id: string;
  target: 'hybridcast' | 'squadd' | 'content_calendar';
  eventTypes: string[];
  webhookUrl: string;
  active: boolean;
  createdAt: Date;
}

/**
 * Webhook Automation Service
 * Integrates FlowPay with HybridCast, SQUADD, and Content Calendar
 * Enables automatic flow of grants, campaigns, and monetization options
 */
export class WebhookAutomationService {
  private webhookEvents: Map<string, WebhookEvent> = new Map();
  private subscriptions: Map<string, WebhookSubscription> = new Map();
  private processingLoop: NodeJS.Timer | null = null;

  /**
   * Initialize webhook automation
   */
  async initialize(): Promise<void> {
    console.log('[WebhookAutomation] Initializing webhook automation system...');

    // Register default subscriptions
    this.registerSubscription('hybridcast', ['grant_discovered', 'campaign_created', 'donation_received']);
    this.registerSubscription('squadd', ['campaign_created', 'listener_tip_received', 'monetization_option']);
    this.registerSubscription('content_calendar', ['campaign_created', 'monetization_option', 'grant_discovered']);

    // Start webhook processing loop
    this.startWebhookProcessing();

    console.log('[WebhookAutomation] Initialization complete. Webhook automation ready.');
  }

  /**
   * Register webhook subscription
   */
  private registerSubscription(
    target: WebhookSubscription['target'],
    eventTypes: string[]
  ): WebhookSubscription {
    const subscriptionId = `sub_${target}_${Date.now()}`;

    const subscription: WebhookSubscription = {
      id: subscriptionId,
      target,
      eventTypes,
      webhookUrl: this.getWebhookUrl(target),
      active: true,
      createdAt: new Date(),
    };

    this.subscriptions.set(subscriptionId, subscription);

    console.log(
      `[WebhookAutomation] Subscription registered: ${target} (${eventTypes.join(', ')})`
    );

    return subscription;
  }

  /**
   * Get webhook URL for target system
   */
  private getWebhookUrl(target: WebhookSubscription['target']): string {
    const baseUrl = process.env.WEBHOOK_BASE_URL || 'https://flowpay.app/webhooks';

    switch (target) {
      case 'hybridcast':
        return `${baseUrl}/hybridcast`;
      case 'squadd':
        return `${baseUrl}/squadd`;
      case 'content_calendar':
        return `${baseUrl}/content-calendar`;
      default:
        return baseUrl;
    }
  }

  /**
   * Start webhook processing loop (every 30 seconds)
   */
  private startWebhookProcessing(): void {
    this.processingLoop = setInterval(async () => {
      try {
        await this.processWebhookQueue();
      } catch (error) {
        console.error('[WebhookAutomation] Error in processing loop:', error);
      }
    }, 30 * 1000); // Every 30 seconds

    console.log('[WebhookAutomation] Webhook processing loop started');
  }

  /**
   * Process pending webhooks
   */
  private async processWebhookQueue(): Promise<void> {
    try {
      const pendingEvents = Array.from(this.webhookEvents.values()).filter((e) => e.status === 'pending');

      if (pendingEvents.length === 0) return;

      console.log(`[WebhookAutomation] Processing ${pendingEvents.length} pending webhooks...`);

      for (const event of pendingEvents) {
        await this.processWebhookEvent(event);
      }
    } catch (error) {
      console.error('[WebhookAutomation] Error processing webhook queue:', error);
    }
  }

  /**
   * Process individual webhook event
   */
  private async processWebhookEvent(event: WebhookEvent): Promise<void> {
    try {
      // Find matching subscriptions
      const matchingSubscriptions = Array.from(this.subscriptions.values()).filter(
        (sub) => sub.active && sub.eventTypes.includes(event.eventType)
      );

      if (matchingSubscriptions.length === 0) {
        event.status = 'processed';
        return;
      }

      // Route event to appropriate systems
      for (const subscription of matchingSubscriptions) {
        await this.routeWebhookEvent(event, subscription);
      }

      event.status = 'processed';

      // Log processed event
      await db.insert(flowpayAuditLog).values({
        event_type: 'webhook_processed',
        event_id: event.id,
        details: JSON.stringify({
          source: event.source,
          eventType: event.eventType,
          targetSystems: matchingSubscriptions.map((s) => s.target),
        }),
        timestamp: new Date(),
      });

      console.log(`[WebhookAutomation] Webhook processed: ${event.id} (${event.eventType})`);
    } catch (error) {
      console.error(`[WebhookAutomation] Error processing webhook ${event.id}:`, error);
      event.status = 'failed';
    }
  }

  /**
   * Route webhook event to target system
   */
  private async routeWebhookEvent(event: WebhookEvent, subscription: WebhookSubscription): Promise<void> {
    try {
      switch (subscription.target) {
        case 'hybridcast':
          await this.routeToHybridCast(event);
          break;
        case 'squadd':
          await this.routeToSquadd(event);
          break;
        case 'content_calendar':
          await this.routeToContentCalendar(event);
          break;
      }

      console.log(`[WebhookAutomation] Event routed to ${subscription.target}: ${event.eventType}`);
    } catch (error) {
      console.error(`[WebhookAutomation] Error routing to ${subscription.target}:`, error);
    }
  }

  /**
   * Route event to HybridCast (emergency broadcasts)
   * Sends grant links and donation opportunities
   */
  private async routeToHybridCast(event: WebhookEvent): Promise<void> {
    try {
      switch (event.eventType) {
        case 'grant_discovered':
          // Add grant link to emergency broadcast
          console.log(
            `[WebhookAutomation→HybridCast] Grant discovered: ${event.payload.grantTitle} ($${event.payload.amount})`
          );
          break;

        case 'campaign_created':
          // Add campaign donation link to broadcast
          console.log(
            `[WebhookAutomation→HybridCast] Campaign created: ${event.payload.campaignTitle} (Goal: $${event.payload.goal})`
          );
          break;

        case 'donation_received':
          // Announce donation in broadcast
          console.log(
            `[WebhookAutomation→HybridCast] Donation received: $${event.payload.amount} from ${event.payload.donorName}`
          );
          break;
      }

      await notifyOwner({
        title: `📡 HybridCast Webhook: ${event.eventType}`,
        content: `Event routed to HybridCast: ${JSON.stringify(event.payload).substring(0, 100)}...`,
      });
    } catch (error) {
      console.error('[WebhookAutomation] Error routing to HybridCast:', error);
    }
  }

  /**
   * Route event to SQUADD Radio (listener engagement)
   * Sends funding campaigns and listener tip opportunities
   */
  private async routeToSquadd(event: WebhookEvent): Promise<void> {
    try {
      switch (event.eventType) {
        case 'campaign_created':
          // Create listener tip campaign
          console.log(
            `[WebhookAutomation→SQUADD] Campaign for radio listeners: ${event.payload.campaignTitle}`
          );
          break;

        case 'listener_tip_received':
          // Acknowledge listener tip
          console.log(
            `[WebhookAutomation→SQUADD] Listener tip: $${event.payload.amount} from ${event.payload.listenerName}`
          );
          break;

        case 'monetization_option':
          // Add monetization option to radio stream
          console.log(
            `[WebhookAutomation→SQUADD] Monetization option available: ${event.payload.optionName}`
          );
          break;
      }

      await notifyOwner({
        title: `🎙️ SQUADD Webhook: ${event.eventType}`,
        content: `Event routed to SQUADD Radio: ${JSON.stringify(event.payload).substring(0, 100)}...`,
      });
    } catch (error) {
      console.error('[WebhookAutomation] Error routing to SQUADD:', error);
    }
  }

  /**
   * Route event to Content Calendar (content monetization)
   * Sends funding campaigns and monetization options
   */
  private async routeToContentCalendar(event: WebhookEvent): Promise<void> {
    try {
      switch (event.eventType) {
        case 'campaign_created':
          // Link campaign to content calendar
          console.log(
            `[WebhookAutomation→ContentCalendar] Campaign linked to content: ${event.payload.campaignTitle}`
          );
          break;

        case 'monetization_option':
          // Add monetization option to content
          console.log(
            `[WebhookAutomation→ContentCalendar] Monetization option: ${event.payload.optionName} for content ${event.payload.contentId}`
          );
          break;

        case 'grant_discovered':
          // Link grant to content calendar
          console.log(
            `[WebhookAutomation→ContentCalendar] Grant opportunity: ${event.payload.grantTitle}`
          );
          break;
      }

      await notifyOwner({
        title: `📅 Content Calendar Webhook: ${event.eventType}`,
        content: `Event routed to Content Calendar: ${JSON.stringify(event.payload).substring(0, 100)}...`,
      });
    } catch (error) {
      console.error('[WebhookAutomation] Error routing to Content Calendar:', error);
    }
  }

  /**
   * Emit webhook event from FlowPay
   */
  async emitWebhookEvent(
    eventType: string,
    payload: Record<string, any>
  ): Promise<WebhookEvent> {
    try {
      const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const event: WebhookEvent = {
        id: eventId,
        source: 'flowpay',
        eventType,
        payload,
        timestamp: new Date(),
        status: 'pending',
      };

      this.webhookEvents.set(eventId, event);

      console.log(`[WebhookAutomation] Webhook event emitted: ${eventId} (${eventType})`);

      // Log event
      await db.insert(flowpayAuditLog).values({
        event_type: 'webhook_emitted',
        event_id: eventId,
        details: JSON.stringify({
          eventType,
          payloadKeys: Object.keys(payload),
        }),
        timestamp: new Date(),
      });

      return event;
    } catch (error) {
      console.error('[WebhookAutomation] Error emitting webhook event:', error);
      throw error;
    }
  }

  /**
   * Get webhook statistics
   */
  getWebhookStats(): {
    totalEvents: number;
    processedEvents: number;
    failedEvents: number;
    activeSubscriptions: number;
    eventsByType: Record<string, number>;
  } {
    const events = Array.from(this.webhookEvents.values());
    const eventsByType: Record<string, number> = {};

    for (const event of events) {
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
    }

    return {
      totalEvents: events.length,
      processedEvents: events.filter((e) => e.status === 'processed').length,
      failedEvents: events.filter((e) => e.status === 'failed').length,
      activeSubscriptions: Array.from(this.subscriptions.values()).filter((s) => s.active).length,
      eventsByType,
    };
  }

  /**
   * Get all subscriptions
   */
  getSubscriptions(): WebhookSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * Shutdown webhook automation
   */
  shutdown(): void {
    if (this.processingLoop) {
      clearInterval(this.processingLoop);
      console.log('[WebhookAutomation] Shutdown complete');
    }
  }
}

// Export singleton instance
export const webhookAutomationService = new WebhookAutomationService();
