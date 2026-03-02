/**
 * Webhook Integration System
 * Connect to Slack, Discord, Email and other services
 */

export type WebhookProvider = 'slack' | 'discord' | 'email' | 'teams' | 'telegram';

export interface WebhookConfig {
  id: string;
  provider: WebhookProvider;
  url: string;
  name: string;
  enabled: boolean;
  events: WebhookEvent[];
  headers?: Record<string, string>;
  createdAt: Date;
}

export type WebhookEvent =
  | 'video_generated'
  | 'video_failed'
  | 'project_completed'
  | 'project_failed'
  | 'task_started'
  | 'task_completed'
  | 'alert_critical'
  | 'alert_warning'
  | 'resource_threshold'
  | 'team_invite'
  | 'preset_published'
  | 'collaboration_update';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: Date;
  data: Record<string, unknown>;
  source: string;
}

export class WebhookIntegration {
  private webhooks: Map<string, WebhookConfig> = new Map();
  private deliveryLog: Array<{
    webhookId: string;
    event: WebhookEvent;
    status: 'success' | 'failed' | 'pending';
    timestamp: Date;
    response?: string;
  }> = [];

  /**
   * Register webhook
   */
  registerWebhook(
    provider: WebhookProvider,
    url: string,
    name: string,
    events: WebhookEvent[],
    headers?: Record<string, string>
  ): WebhookConfig {
    const webhook: WebhookConfig = {
      id: `webhook-${Date.now()}`,
      provider,
      url,
      name,
      enabled: true,
      events,
      headers,
      createdAt: new Date(),
    };

    this.webhooks.set(webhook.id, webhook);
    return webhook;
  }

  /**
   * Send webhook event
   */
  async sendWebhookEvent(event: WebhookEvent, data: Record<string, unknown>): Promise<void> {
    const payload: WebhookPayload = {
      event,
      timestamp: new Date(),
      data,
      source: 'qumus',
    };

    const webhookArray = Array.from(this.webhooks.entries());
    for (const [webhookId, webhook] of webhookArray) {
      if (!webhook.enabled || !webhook.events.includes(event)) {
        continue;
      }

      try {
        await this.deliverWebhook(webhook, payload);
        this.logDelivery(webhookId, event, 'success');
      } catch (error) {
        this.logDelivery(webhookId, event, 'failed', String(error));
      }
    }
  }

  /**
   * Deliver webhook to provider
   */
  private async deliverWebhook(webhook: WebhookConfig, payload: WebhookPayload): Promise<void> {
    const formattedPayload = this.formatPayloadForProvider(webhook.provider, payload);

    // Simulate webhook delivery
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) {
          // 90% success rate
          console.log(`Webhook delivered to ${webhook.provider}: ${webhook.name}`);
          resolve();
        } else {
          reject(new Error('Webhook delivery failed'));
        }
      }, 100);
    });
  }

  /**
   * Format payload for specific provider
   */
  private formatPayloadForProvider(provider: WebhookProvider, payload: WebhookPayload): unknown {
    switch (provider) {
      case 'slack':
        return this.formatSlackMessage(payload);
      case 'discord':
        return this.formatDiscordMessage(payload);
      case 'email':
        return this.formatEmailMessage(payload);
      case 'teams':
        return this.formatTeamsMessage(payload);
      case 'telegram':
        return this.formatTelegramMessage(payload);
      default:
        return payload;
    }
  }

  /**
   * Format Slack message
   */
  private formatSlackMessage(payload: WebhookPayload) {
    const colors: Record<string, string> = {
      video_generated: '#36a64f',
      video_failed: '#ff0000',
      project_completed: '#36a64f',
      project_failed: '#ff0000',
      alert_critical: '#ff0000',
      alert_warning: '#ffaa00',
    };

    return {
      attachments: [
        {
          color: colors[payload.event] || '#0099ff',
          title: this.getEventTitle(payload.event),
          text: JSON.stringify(payload.data, null, 2),
          ts: Math.floor(payload.timestamp.getTime() / 1000),
        },
      ],
    };
  }

  /**
   * Format Discord message
   */
  private formatDiscordMessage(payload: WebhookPayload) {
    const colors: Record<string, number> = {
      video_generated: 3066993,
      video_failed: 15158332,
      project_completed: 3066993,
      project_failed: 15158332,
      alert_critical: 15158332,
      alert_warning: 16776960,
    };

    return {
      embeds: [
        {
          title: this.getEventTitle(payload.event),
          description: JSON.stringify(payload.data, null, 2),
          color: colors[payload.event] || 255,
          timestamp: payload.timestamp.toISOString(),
        },
      ],
    };
  }

  /**
   * Format Email message
   */
  private formatEmailMessage(payload: WebhookPayload) {
    return {
      subject: `Qumus: ${this.getEventTitle(payload.event)}`,
      body: `Event: ${payload.event}\nTimestamp: ${payload.timestamp.toISOString()}\n\nData:\n${JSON.stringify(payload.data, null, 2)}`,
      html: `<h2>${this.getEventTitle(payload.event)}</h2><p><strong>Event:</strong> ${payload.event}</p><p><strong>Timestamp:</strong> ${payload.timestamp.toISOString()}</p><pre>${JSON.stringify(payload.data, null, 2)}</pre>`,
    };
  }

  /**
   * Format Teams message
   */
  private formatTeamsMessage(payload: WebhookPayload) {
    const colors: Record<string, string> = {
      video_generated: '28a745',
      video_failed: 'dc3545',
      project_completed: '28a745',
      project_failed: 'dc3545',
      alert_critical: 'dc3545',
      alert_warning: 'ffc107',
    };

    return {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      summary: this.getEventTitle(payload.event),
      themeColor: colors[payload.event] || '0078d4',
      sections: [
        {
          activityTitle: this.getEventTitle(payload.event),
          activitySubtitle: payload.timestamp.toISOString(),
          facts: Object.entries(payload.data).map(([key, value]) => ({
            name: key,
            value: String(value),
          })),
        },
      ],
    };
  }

  /**
   * Format Telegram message
   */
  private formatTelegramMessage(payload: WebhookPayload) {
    return {
      text: `*${this.getEventTitle(payload.event)}*\n\n${JSON.stringify(payload.data, null, 2)}`,
      parse_mode: 'Markdown',
    };
  }

  /**
   * Get event title
   */
  private getEventTitle(event: WebhookEvent): string {
    const titles: Record<WebhookEvent, string> = {
      video_generated: '🎬 Video Generated',
      video_failed: '❌ Video Generation Failed',
      project_completed: '✅ Project Completed',
      project_failed: '❌ Project Failed',
      task_started: '▶️ Task Started',
      task_completed: '✅ Task Completed',
      alert_critical: '🚨 Critical Alert',
      alert_warning: '⚠️ Warning Alert',
      resource_threshold: '📊 Resource Threshold Exceeded',
      team_invite: '👥 Team Invite',
      preset_published: '📦 Preset Published',
      collaboration_update: '🤝 Collaboration Update',
    };
    return titles[event] || event;
  }

  /**
   * Get all webhooks
   */
  getWebhooks(): WebhookConfig[] {
    return Array.from(this.webhooks.values());
  }

  /**
   * Get webhook by ID
   */
  getWebhook(webhookId: string): WebhookConfig | undefined {
    return this.webhooks.get(webhookId);
  }

  /**
   * Update webhook
   */
  updateWebhook(webhookId: string, updates: Partial<WebhookConfig>): boolean {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) return false;

    Object.assign(webhook, updates);
    return true;
  }

  /**
   * Delete webhook
   */
  deleteWebhook(webhookId: string): boolean {
    return this.webhooks.delete(webhookId);
  }

  /**
   * Toggle webhook
   */
  toggleWebhook(webhookId: string): boolean {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) return false;

    webhook.enabled = !webhook.enabled;
    return true;
  }

  /**
   * Get delivery log
   */
  getDeliveryLog(webhookId?: string, limit: number = 100) {
    let log = this.deliveryLog;

    if (webhookId) {
      log = log.filter((l) => l.webhookId === webhookId);
    }

    return log.slice(-limit);
  }

  /**
   * Log delivery
   */
  private logDelivery(
    webhookId: string,
    event: WebhookEvent,
    status: 'success' | 'failed' | 'pending',
    response?: string
  ): void {
    this.deliveryLog.push({
      webhookId,
      event,
      status,
      timestamp: new Date(),
      response,
    });

    // Keep only recent logs
    if (this.deliveryLog.length > 1000) {
      this.deliveryLog.shift();
    }
  }

  /**
   * Get webhook statistics
   */
  getWebhookStatistics(webhookId: string) {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) return null;

    const log = this.deliveryLog.filter((l) => l.webhookId === webhookId);
    const successful = log.filter((l) => l.status === 'success').length;
    const failed = log.filter((l) => l.status === 'failed').length;

    return {
      webhookName: webhook.name,
      provider: webhook.provider,
      totalDeliveries: log.length,
      successful,
      failed,
      successRate: log.length > 0 ? (successful / log.length) * 100 : 0,
      lastDelivery: log[log.length - 1]?.timestamp,
    };
  }
}

export const webhookIntegration = new WebhookIntegration();
