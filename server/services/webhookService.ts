import crypto from "crypto";
import * as db from "../db";

/**
 * Webhook Service - Manages session webhooks and event delivery
 */

export type WebhookEventType =
  | "session.created"
  | "session.started"
  | "session.completed"
  | "session.failed"
  | "message.added"
  | "tool.executed"
  | "task.completed"
  | "agent.error";

export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: number;
  data: Record<string, any>;
  signature: string; // HMAC-SHA256 signature for verification
}

export interface WebhookEvent {
  type: WebhookEventType;
  sessionId: number;
  data: Record<string, any>;
}

/**
 * Webhook Service
 */
export class WebhookService {
  /**
   * Trigger webhooks for an event
   */
  static async triggerEvent(userId: number, event: WebhookEvent): Promise<void> {
    try {
      // Get all active webhooks for this user
      const webhooks = await db.getActiveWebhooks(userId);

      for (const webhook of webhooks) {
        // Check if webhook is subscribed to this event type
        const events = JSON.parse(webhook.events);
        if (!events.includes(event.type) && !events.includes("*")) {
          continue;
        }

        // Queue webhook delivery
        await this.deliverWebhook(webhook, event);
      }
    } catch (error) {
      console.error("Error triggering webhooks:", error);
    }
  }

  /**
   * Deliver webhook with retry logic
   */
  private static async deliverWebhook(
    webhook: any,
    event: WebhookEvent,
    retryCount: number = 0
  ): Promise<void> {
    try {
      const payload: WebhookPayload = {
        event: event.type,
        timestamp: Date.now(),
        data: event.data,
        signature: "", // Will be set below
      };

      // Generate HMAC signature
      payload.signature = this.generateSignature(JSON.stringify(payload), webhook.secret);

      // Send webhook
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": payload.signature,
          "X-Webhook-Event": event.type,
          "X-Webhook-Timestamp": payload.timestamp.toString(),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Log webhook delivery
      await db.addWebhookLog(webhook.id, event.type, JSON.stringify(payload), response.status, await response.text());

      if (!response.ok && retryCount < webhook.retryCount) {
        // Retry on failure
        setTimeout(() => {
          this.deliverWebhook(webhook, event, retryCount + 1);
        }, Math.pow(2, retryCount) * 1000); // Exponential backoff
      }
    } catch (error) {
      console.error(`Error delivering webhook to ${webhook.url}:`, error);
      await db.addWebhookLog(
        webhook.id,
        event.type,
        JSON.stringify(event),
        0,
        (error as Error).message
      );

      // Retry on network error
      if (retryCount < webhook.retryCount) {
        setTimeout(() => {
          this.deliverWebhook(webhook, event, retryCount + 1);
        }, Math.pow(2, retryCount) * 1000);
      }
    }
  }

  /**
   * Generate HMAC-SHA256 signature
   */
  static generateSignature(payload: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(payload).digest("hex");
  }

  /**
   * Verify webhook signature
   */
  static verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  }

  /**
   * Create a new webhook endpoint
   */
  static async createWebhook(
    userId: number,
    url: string,
    events: string[],
    retryCount: number = 3
  ): Promise<{ id: number; secret: string }> {
    const secret = crypto.randomBytes(32).toString("hex");
    const id = await db.createWebhook(userId, url, events, secret, retryCount);
    return { id, secret };
  }

  /**
   * Delete a webhook
   */
  static async deleteWebhook(webhookId: number): Promise<void> {
    await db.deleteWebhook(webhookId);
  }

  /**
   * Update webhook configuration
   */
  static async updateWebhook(
    webhookId: number,
    updates: {
      url?: string;
      events?: string[];
      isActive?: boolean;
      retryCount?: number;
    }
  ): Promise<void> {
    await db.updateWebhook(webhookId, updates);
  }

  /**
   * Get webhook logs for debugging
   */
  static async getWebhookLogs(webhookId: number, limit: number = 50): Promise<any[]> {
    return db.getWebhookLogs(webhookId, limit);
  }
}

/**
 * Webhook event builders - Helper functions to create properly formatted events
 */
export const webhookEvents = {
  sessionCreated: (sessionId: number, sessionName: string, userId: number): WebhookEvent => ({
    type: "session.created",
    sessionId,
    data: {
      sessionId,
      sessionName,
      userId,
      timestamp: Date.now(),
    },
  }),

  sessionStarted: (sessionId: number, userId: number): WebhookEvent => ({
    type: "session.started",
    sessionId,
    data: {
      sessionId,
      userId,
      timestamp: Date.now(),
    },
  }),

  sessionCompleted: (
    sessionId: number,
    userId: number,
    duration: number,
    messageCount: number,
    toolCount: number
  ): WebhookEvent => ({
    type: "session.completed",
    sessionId,
    data: {
      sessionId,
      userId,
      duration,
      messageCount,
      toolCount,
      timestamp: Date.now(),
    },
  }),

  sessionFailed: (sessionId: number, userId: number, error: string): WebhookEvent => ({
    type: "session.failed",
    sessionId,
    data: {
      sessionId,
      userId,
      error,
      timestamp: Date.now(),
    },
  }),

  messageAdded: (sessionId: number, userId: number, role: string, content: string): WebhookEvent => ({
    type: "message.added",
    sessionId,
    data: {
      sessionId,
      userId,
      role,
      contentLength: content.length,
      timestamp: Date.now(),
    },
  }),

  toolExecuted: (
    sessionId: number,
    userId: number,
    toolName: string,
    status: string,
    duration: number
  ): WebhookEvent => ({
    type: "tool.executed",
    sessionId,
    data: {
      sessionId,
      userId,
      toolName,
      status,
      duration,
      timestamp: Date.now(),
    },
  }),

  taskCompleted: (
    sessionId: number,
    userId: number,
    taskDescription: string,
    status: string,
    duration: number
  ): WebhookEvent => ({
    type: "task.completed",
    sessionId,
    data: {
      sessionId,
      userId,
      taskDescription,
      status,
      duration,
      timestamp: Date.now(),
    },
  }),

  agentError: (sessionId: number, userId: number, error: string, errorType: string): WebhookEvent => ({
    type: "agent.error",
    sessionId,
    data: {
      sessionId,
      userId,
      error,
      errorType,
      timestamp: Date.now(),
    },
  }),
};
