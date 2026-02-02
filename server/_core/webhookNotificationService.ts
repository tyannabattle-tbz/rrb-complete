/**
 * Webhook Notification Service
 * Sends notifications to external services when video generation completes
 */

export interface WebhookConfig {
  url: string;
  events: WebhookEvent[];
  active: boolean;
  retries: number;
  timeout: number;
}

export type WebhookEvent = 'video.completed' | 'video.failed' | 'video.started' | 'video.progress';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: Date;
  videoId: string;
  jobId: string;
  status: string;
  progress?: number;
  url?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export class WebhookNotificationService {
  private webhooks: Map<string, WebhookConfig> = new Map();
  private deliveryLog: Map<string, WebhookPayload[]> = new Map();

  /**
   * Register a webhook
   */
  registerWebhook(id: string, config: WebhookConfig): void {
    this.webhooks.set(id, config);
    this.deliveryLog.set(id, []);
  }

  /**
   * Unregister a webhook
   */
  unregisterWebhook(id: string): boolean {
    this.deliveryLog.delete(id);
    return this.webhooks.delete(id);
  }

  /**
   * Get webhook configuration
   */
  getWebhook(id: string): WebhookConfig | undefined {
    return this.webhooks.get(id);
  }

  /**
   * List all webhooks
   */
  listWebhooks(): Array<{ id: string; config: WebhookConfig }> {
    return Array.from(this.webhooks.entries()).map(([id, config]) => ({ id, config }));
  }

  /**
   * Send webhook notification
   */
  async sendNotification(payload: WebhookPayload): Promise<void> {
    const webhooksToNotify = Array.from(this.webhooks.entries()).filter(([, config]) =>
      config.active && config.events.includes(payload.event)
    );

    for (const [id, config] of webhooksToNotify) {
      await this.deliverWebhook(id, config, payload);
    }
  }

  /**
   * Deliver webhook with retry logic
   */
  private async deliverWebhook(
    id: string,
    config: WebhookConfig,
    payload: WebhookPayload,
    attempt: number = 1
  ): Promise<void> {
    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': payload.event,
          'X-Webhook-ID': id,
          'X-Webhook-Timestamp': payload.timestamp.toISOString(),
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(config.timeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Log successful delivery
      const log = this.deliveryLog.get(id) || [];
      log.push(payload);
      this.deliveryLog.set(id, log.slice(-100)); // Keep last 100 deliveries
    } catch (error) {
      if (attempt < config.retries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        setTimeout(() => this.deliverWebhook(id, config, payload, attempt + 1), delay);
      } else {
        console.error(`Webhook delivery failed for ${id} after ${config.retries} attempts:`, error);
      }
    }
  }

  /**
   * Get delivery log for a webhook
   */
  getDeliveryLog(id: string, limit: number = 50): WebhookPayload[] {
    const log = this.deliveryLog.get(id) || [];
    return log.slice(-limit);
  }

  /**
   * Get webhook statistics
   */
  getStats(id: string) {
    const log = this.deliveryLog.get(id) || [];
    const config = this.webhooks.get(id);

    return {
      webhookId: id,
      active: config?.active || false,
      totalDeliveries: log.length,
      eventCounts: {
        completed: log.filter((p) => p.event === 'video.completed').length,
        failed: log.filter((p) => p.event === 'video.failed').length,
        started: log.filter((p) => p.event === 'video.started').length,
        progress: log.filter((p) => p.event === 'video.progress').length,
      },
      lastDelivery: log.length > 0 ? log[log.length - 1].timestamp : null,
    };
  }

  /**
   * Test webhook delivery
   */
  async testWebhook(id: string): Promise<boolean> {
    const config = this.webhooks.get(id);
    if (!config) return false;

    const testPayload: WebhookPayload = {
      event: 'video.completed',
      timestamp: new Date(),
      videoId: 'test-video-id',
      jobId: 'test-job-id',
      status: 'completed',
      progress: 100,
      url: 'https://example.com/videos/test.mp4',
      metadata: { test: true },
    };

    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': 'video.completed',
          'X-Webhook-ID': id,
          'X-Webhook-Test': 'true',
        },
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(5000),
      });

      return response.ok;
    } catch (error) {
      console.error('Webhook test failed:', error);
      return false;
    }
  }

  /**
   * Notify on video completion
   */
  async notifyVideoCompleted(videoId: string, jobId: string, url: string, metadata?: Record<string, any>): Promise<void> {
    await this.sendNotification({
      event: 'video.completed',
      timestamp: new Date(),
      videoId,
      jobId,
      status: 'completed',
      progress: 100,
      url,
      metadata,
    });
  }

  /**
   * Notify on video failure
   */
  async notifyVideoFailed(videoId: string, jobId: string, error: string, metadata?: Record<string, any>): Promise<void> {
    await this.sendNotification({
      event: 'video.failed',
      timestamp: new Date(),
      videoId,
      jobId,
      status: 'failed',
      error,
      metadata,
    });
  }

  /**
   * Notify on video progress
   */
  async notifyVideoProgress(videoId: string, jobId: string, progress: number, metadata?: Record<string, any>): Promise<void> {
    await this.sendNotification({
      event: 'video.progress',
      timestamp: new Date(),
      videoId,
      jobId,
      status: 'processing',
      progress,
      metadata,
    });
  }

  /**
   * Notify on video started
   */
  async notifyVideoStarted(videoId: string, jobId: string, metadata?: Record<string, any>): Promise<void> {
    await this.sendNotification({
      event: 'video.started',
      timestamp: new Date(),
      videoId,
      jobId,
      status: 'processing',
      progress: 0,
      metadata,
    });
  }

  /**
   * Clear delivery logs
   */
  clearLogs(id?: string): void {
    if (id) {
      this.deliveryLog.delete(id);
    } else {
      this.deliveryLog.clear();
    }
  }
}

export const webhookNotificationService = new WebhookNotificationService();
