/**
 * Webhook Integration Service
 * Handles event-driven autonomous task execution
 */

import { EventEmitter } from 'events';

export interface WebhookEvent {
  id: string;
  type: string;
  timestamp: number;
  source: string;
  data: Record<string, any>;
  processed: boolean;
  result?: any;
  error?: string;
}

export interface WebhookTrigger {
  id: string;
  name: string;
  eventType: string;
  condition: (event: WebhookEvent) => boolean;
  action: (event: WebhookEvent) => Promise<any>;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface WebhookPolicy {
  id: string;
  name: string;
  description: string;
  triggers: string[]; // Trigger IDs
  autonomyLevel: number;
  requiresApproval: boolean;
  enabled: boolean;
}

export class WebhookService extends EventEmitter {
  private triggers: Map<string, WebhookTrigger> = new Map();
  private policies: Map<string, WebhookPolicy> = new Map();
  private eventHistory: WebhookEvent[] = [];
  private maxHistorySize: number = 1000;

  constructor() {
    super();
    this.initializeDefaultTriggers();
  }

  /**
   * Initialize default webhook triggers
   */
  private initializeDefaultTriggers(): void {
    // Broadcast created trigger
    this.registerTrigger({
      id: 'trigger-broadcast-created',
      name: 'Broadcast Created',
      eventType: 'broadcast.created',
      condition: (event) => event.type === 'broadcast.created',
      action: async (event) => {
        console.log('[Webhook] Processing broadcast created event:', event.data);
        return { status: 'scheduled', broadcastId: event.data.broadcastId };
      },
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Content generated trigger
    this.registerTrigger({
      id: 'trigger-content-generated',
      name: 'Content Generated',
      eventType: 'content.generated',
      condition: (event) => event.type === 'content.generated',
      action: async (event) => {
        console.log('[Webhook] Processing content generated event:', event.data);
        return { status: 'ready', contentId: event.data.contentId };
      },
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Broadcast scheduled trigger
    this.registerTrigger({
      id: 'trigger-broadcast-scheduled',
      name: 'Broadcast Scheduled',
      eventType: 'broadcast.scheduled',
      condition: (event) => event.type === 'broadcast.scheduled',
      action: async (event) => {
        console.log('[Webhook] Processing broadcast scheduled event:', event.data);
        return { status: 'scheduled', scheduleTime: event.data.scheduleTime };
      },
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Agent decision trigger
    this.registerTrigger({
      id: 'trigger-agent-decision',
      name: 'Agent Decision',
      eventType: 'agent.decision',
      condition: (event) => event.type === 'agent.decision',
      action: async (event) => {
        console.log('[Webhook] Processing agent decision event:', event.data);
        return { status: 'decision_recorded', decisionId: event.data.decisionId };
      },
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  /**
   * Register a webhook trigger
   */
  registerTrigger(trigger: WebhookTrigger): void {
    this.triggers.set(trigger.id, trigger);
    console.log(`[Webhook] Registered trigger: ${trigger.name}`);
  }

  /**
   * Unregister a webhook trigger
   */
  unregisterTrigger(triggerId: string): boolean {
    return this.triggers.delete(triggerId);
  }

  /**
   * Get a trigger by ID
   */
  getTrigger(triggerId: string): WebhookTrigger | undefined {
    return this.triggers.get(triggerId);
  }

  /**
   * Get all triggers
   */
  getAllTriggers(): WebhookTrigger[] {
    return Array.from(this.triggers.values());
  }

  /**
   * Create a webhook policy
   */
  createPolicy(policy: WebhookPolicy): void {
    this.policies.set(policy.id, policy);
    console.log(`[Webhook] Created policy: ${policy.name}`);
  }

  /**
   * Get a policy by ID
   */
  getPolicy(policyId: string): WebhookPolicy | undefined {
    return this.policies.get(policyId);
  }

  /**
   * Get all policies
   */
  getAllPolicies(): WebhookPolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Update a policy
   */
  updatePolicy(policyId: string, updates: Partial<WebhookPolicy>): boolean {
    const policy = this.policies.get(policyId);
    if (!policy) return false;

    Object.assign(policy, updates);
    return true;
  }

  /**
   * Delete a policy
   */
  deletePolicy(policyId: string): boolean {
    return this.policies.delete(policyId);
  }

  /**
   * Process a webhook event
   */
  async processEvent(event: Omit<WebhookEvent, 'id' | 'timestamp' | 'processed'>): Promise<WebhookEvent> {
    const webhookEvent: WebhookEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      processed: false,
    };

    try {
      // Find matching triggers
      const matchingTriggers = Array.from(this.triggers.values()).filter(
        (trigger) => trigger.enabled && trigger.condition(webhookEvent)
      );

      console.log(`[Webhook] Found ${matchingTriggers.length} matching triggers for event: ${event.type}`);

      // Execute matching triggers
      for (const trigger of matchingTriggers) {
        try {
          const result = await trigger.action(webhookEvent);
          webhookEvent.result = result;
          webhookEvent.processed = true;

          this.emit('trigger-executed', {
            triggerId: trigger.id,
            eventId: webhookEvent.id,
            result,
          });
        } catch (error) {
          console.error(`[Webhook] Error executing trigger ${trigger.id}:`, error);
          webhookEvent.error = (error as Error).message;

          this.emit('trigger-error', {
            triggerId: trigger.id,
            eventId: webhookEvent.id,
            error,
          });
        }
      }

      // Store in history
      this.eventHistory.push(webhookEvent);
      if (this.eventHistory.length > this.maxHistorySize) {
        this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
      }

      // Emit event
      this.emit('event-processed', webhookEvent);

      return webhookEvent;
    } catch (error) {
      console.error('[Webhook] Error processing event:', error);
      webhookEvent.error = (error as Error).message;
      return webhookEvent;
    }
  }

  /**
   * Get event history
   */
  getEventHistory(filters?: {
    type?: string;
    source?: string;
    processed?: boolean;
    limit?: number;
  }): WebhookEvent[] {
    let history = this.eventHistory;

    if (filters?.type) {
      history = history.filter((e) => e.type === filters.type);
    }

    if (filters?.source) {
      history = history.filter((e) => e.source === filters.source);
    }

    if (filters?.processed !== undefined) {
      history = history.filter((e) => e.processed === filters.processed);
    }

    const limit = filters?.limit || 100;
    return history.slice(-limit);
  }

  /**
   * Clear event history
   */
  clearEventHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get webhook statistics
   */
  getStatistics(): {
    totalEvents: number;
    processedEvents: number;
    failedEvents: number;
    totalTriggers: number;
    enabledTriggers: number;
    totalPolicies: number;
    enabledPolicies: number;
  } {
    const totalEvents = this.eventHistory.length;
    const processedEvents = this.eventHistory.filter((e) => e.processed).length;
    const failedEvents = this.eventHistory.filter((e) => e.error).length;
    const totalTriggers = this.triggers.size;
    const enabledTriggers = Array.from(this.triggers.values()).filter((t) => t.enabled).length;
    const totalPolicies = this.policies.size;
    const enabledPolicies = Array.from(this.policies.values()).filter((p) => p.enabled).length;

    return {
      totalEvents,
      processedEvents,
      failedEvents,
      totalTriggers,
      enabledTriggers,
      totalPolicies,
      enabledPolicies,
    };
  }

  /**
   * Retry failed events
   */
  async retryFailedEvents(): Promise<number> {
    const failedEvents = this.eventHistory.filter((e) => e.error);
    let retryCount = 0;

    for (const event of failedEvents) {
      try {
        await this.processEvent({
          type: event.type,
          source: event.source,
          data: event.data,
        });
        retryCount++;
      } catch (error) {
        console.error('[Webhook] Retry failed for event:', event.id, error);
      }
    }

    return retryCount;
  }
}

// Export singleton instance
export const webhookService = new WebhookService();
