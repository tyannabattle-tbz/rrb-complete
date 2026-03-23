import express, { Request, Response } from 'express';
import { tyOSStatusFeed } from './tyOSStatusFeed';
import { qumusContentAgent } from './qumusContentAgent';
import { qumusHierarchyNotifier } from './qumusHierarchyNotifier';
import { qumusCrossPlatformSync } from './qumusCrossPlatformSync';

/**
 * QUMUS Webhook Integration
 * Allows external systems to trigger QUMUS actions via webhooks
 */

export interface WebhookEvent {
  id: string;
  timestamp: number;
  source: string;
  type: string;
  action: string;
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
}

export class QUMUSWebhookIntegration {
  private webhookConfigs: Map<string, WebhookConfig> = new Map();
  private webhookEvents: WebhookEvent[] = [];
  private router: express.Router;
  private maxEventsHistory = 1000;

  constructor() {
    this.router = express.Router();
    this.initializeWebhooks();
  }

  /**
   * Initialize webhook system
   */
  private initializeWebhooks() {
    console.log('[QUMUS Webhook Integration] Initializing...');

    // Register webhook routes
    this.setupRoutes();

    // Register default webhooks
    this.registerWebhook({
      id: 'github_webhook',
      name: 'GitHub Integration',
      url: '/webhooks/github',
      events: ['push', 'pull_request', 'release'],
      active: true,
    });

    this.registerWebhook({
      id: 'stripe_webhook',
      name: 'Stripe Payments',
      url: '/webhooks/stripe',
      events: ['charge.succeeded', 'charge.failed', 'customer.subscription.created'],
      active: true,
    });

    this.registerWebhook({
      id: 'twitter_webhook',
      name: 'Twitter Integration',
      url: '/webhooks/twitter',
      events: ['tweet_created', 'mention', 'follow'],
      active: true,
    });

    this.registerWebhook({
      id: 'hybridcast_webhook',
      name: 'HybridCast Events',
      url: '/webhooks/hybridcast',
      events: ['broadcast_started', 'broadcast_ended', 'emergency_alert'],
      active: true,
    });

    console.log('[QUMUS Webhook Integration] Initialized with', this.webhookConfigs.size, 'webhooks');
  }

  /**
   * Setup webhook routes
   */
  private setupRoutes() {
    // Generic webhook handler
    this.router.post('/webhooks/:source', async (req: Request, res: Response) => {
      const { source } = req.params;
      const event = req.body;

      await this.handleWebhookEvent(source, event);
      res.json({ success: true, eventId: event.id || 'unknown' });
    });

    // GitHub webhook
    this.router.post('/webhooks/github', async (req: Request, res: Response) => {
      const event = req.body;
      console.log('[QUMUS Webhook] GitHub event:', event.action);

      // Trigger content update on push
      if (event.action === 'push') {
        await qumusContentAgent.requestContent({
          type: 'article',
          topic: `GitHub Update: ${event.repository?.name || 'Repository'}`,
          audience: 'Developers',
        });
      }

      res.json({ success: true });
    });

    // Stripe webhook
    this.router.post('/webhooks/stripe', async (req: Request, res: Response) => {
      const event = req.body;
      console.log('[QUMUS Webhook] Stripe event:', event.type);

      // Trigger notification on successful charge
      if (event.type === 'charge.succeeded') {
        await tyOSStatusFeed.logDecision('payment_received', `Payment of $${event.data?.object?.amount / 100}`, 'Stripe webhook triggered', {
          chargeId: event.data?.object?.id,
          amount: event.data?.object?.amount,
        });
      }

      res.json({ success: true });
    });

    // Twitter webhook
    this.router.post('/webhooks/twitter', async (req: Request, res: Response) => {
      const event = req.body;
      console.log('[QUMUS Webhook] Twitter event:', event.type);

      // Trigger content creation on mention
      if (event.type === 'mention') {
        await qumusContentAgent.requestContent({
          type: 'social_media',
          topic: `Response to: ${event.text || 'Twitter mention'}`,
          style: 'engaging',
        });
      }

      res.json({ success: true });
    });

    // HybridCast webhook
    this.router.post('/webhooks/hybridcast', async (req: Request, res: Response) => {
      const event = req.body;
      console.log('[QUMUS Webhook] HybridCast event:', event.type);

      // Trigger hierarchy notification on broadcast
      if (event.type === 'broadcast_started') {
        await qumusHierarchyNotifier.notifyHierarchyChange({
          type: 'broadcast_started',
          channel: event.channel,
          timestamp: Date.now(),
        });
      }

      res.json({ success: true });
    });

    // Custom action webhook
    this.router.post('/webhooks/action', async (req: Request, res: Response) => {
      const { action, payload } = req.body;

      switch (action) {
        case 'create_content':
          await qumusContentAgent.requestContent(payload);
          break;
        case 'notify_systems':
          await qumusHierarchyNotifier.notifyHierarchyChange(payload);
          break;
        case 'sync_platforms':
          await qumusCrossPlatformSync.shareKnowledge(payload.platformId, payload.knowledge);
          break;
        case 'request_decision_support':
          const support = await qumusCrossPlatformSync.requestDecisionSupport(payload.platformId, payload.context);
          res.json({ recommendation: support });
          return;
        default:
          console.warn('[QUMUS Webhook] Unknown action:', action);
      }

      res.json({ success: true, action });
    });
  }

  /**
   * Register a webhook
   */
  registerWebhook(config: WebhookConfig): void {
    this.webhookConfigs.set(config.id, config);
    console.log(`[QUMUS Webhook] Registered: ${config.name}`);
  }

  /**
   * Handle webhook event
   */
  private async handleWebhookEvent(source: string, event: any): Promise<void> {
    const webhookEvent: WebhookEvent = {
      id: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      source,
      type: event.type || 'unknown',
      action: event.action || 'unknown',
      payload: event,
      status: 'processing',
    };

    this.webhookEvents.push(webhookEvent);

    if (this.webhookEvents.length > this.maxEventsHistory) {
      this.webhookEvents.shift();
    }

    console.log(`[QUMUS Webhook] Processing event from ${source}: ${webhookEvent.type}`);

    try {
      // Route to appropriate handler
      switch (source) {
        case 'github':
          await this.handleGitHubEvent(event);
          break;
        case 'stripe':
          await this.handleStripeEvent(event);
          break;
        case 'twitter':
          await this.handleTwitterEvent(event);
          break;
        case 'hybridcast':
          await this.handleHybridCastEvent(event);
          break;
      }

      webhookEvent.status = 'completed';
    } catch (error) {
      console.error(`[QUMUS Webhook] Error processing event:`, error);
      webhookEvent.status = 'failed';
    }

    await tyOSStatusFeed.logDecision('webhook_event', `${source}: ${webhookEvent.type}`, `Status: ${webhookEvent.status}`, {
      source,
      type: webhookEvent.type,
      status: webhookEvent.status,
    });
  }

  /**
   * Handle GitHub events
   */
  private async handleGitHubEvent(event: any): Promise<void> {
    console.log('[QUMUS Webhook] GitHub:', event.action);

    if (event.action === 'push') {
      // Create update article
      await qumusContentAgent.requestContent({
        type: 'article',
        topic: `Code Update: ${event.repository?.name}`,
        audience: 'Development Team',
      });
    }

    if (event.action === 'pull_request' && event.pull_request?.action === 'opened') {
      // Create PR summary
      await qumusContentAgent.requestContent({
        type: 'article',
        topic: `Pull Request: ${event.pull_request?.title}`,
        audience: 'Code Reviewers',
      });
    }
  }

  /**
   * Handle Stripe events
   */
  private async handleStripeEvent(event: any): Promise<void> {
    console.log('[QUMUS Webhook] Stripe:', event.type);

    if (event.type === 'charge.succeeded') {
      await tyOSStatusFeed.logDecision('payment', 'Charge succeeded', `Amount: $${event.data?.object?.amount / 100}`, {
        chargeId: event.data?.object?.id,
      });
    }

    if (event.type === 'customer.subscription.created') {
      await qumusContentAgent.requestContent({
        type: 'social_media',
        topic: 'New subscription activated',
        style: 'celebratory',
      });
    }
  }

  /**
   * Handle Twitter events
   */
  private async handleTwitterEvent(event: any): Promise<void> {
    console.log('[QUMUS Webhook] Twitter:', event.type);

    if (event.type === 'mention') {
      // Create response content
      await qumusContentAgent.requestContent({
        type: 'social_media',
        topic: `Responding to: ${event.text}`,
        style: 'professional',
      });
    }

    if (event.type === 'follow') {
      // Log follower activity
      await tyOSStatusFeed.logDecision('social_follow', `New follower: ${event.user?.name}`, 'Twitter event', {
        userId: event.user?.id,
      });
    }
  }

  /**
   * Handle HybridCast events
   */
  private async handleHybridCastEvent(event: any): Promise<void> {
    console.log('[QUMUS Webhook] HybridCast:', event.type);

    if (event.type === 'broadcast_started') {
      await qumusHierarchyNotifier.notifyHierarchyChange({
        type: 'broadcast_started',
        channel: event.channel,
      });
    }

    if (event.type === 'emergency_alert') {
      // Trigger emergency response
      await tyOSStatusFeed.logDecision('emergency_alert', 'Emergency broadcast triggered', event.message, {
        severity: event.severity,
      });
    }
  }

  /**
   * Get webhook config
   */
  getWebhookConfig(id: string): WebhookConfig | undefined {
    return this.webhookConfigs.get(id);
  }

  /**
   * Get all webhook configs
   */
  getAllWebhooks(): WebhookConfig[] {
    return Array.from(this.webhookConfigs.values());
  }

  /**
   * Get webhook events
   */
  getWebhookEvents(limit: number = 50): WebhookEvent[] {
    return this.webhookEvents.slice(-limit);
  }

  /**
   * Get webhook statistics
   */
  getWebhookStats() {
    const totalEvents = this.webhookEvents.length;
    const completedEvents = this.webhookEvents.filter((e) => e.status === 'completed').length;
    const failedEvents = this.webhookEvents.filter((e) => e.status === 'failed').length;

    return {
      totalWebhooks: this.webhookConfigs.size,
      activeWebhooks: Array.from(this.webhookConfigs.values()).filter((w) => w.active).length,
      totalEvents,
      completedEvents,
      failedEvents,
      successRate: totalEvents > 0 ? ((completedEvents / totalEvents) * 100).toFixed(1) : 0,
    };
  }

  /**
   * Get router
   */
  getRouter(): express.Router {
    return this.router;
  }
}

// Singleton instance
export const qumusWebhookIntegration = new QUMUSWebhookIntegration();
