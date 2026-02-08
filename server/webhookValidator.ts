import { z } from 'zod';

// Define webhook payload schemas
export const BroadcastEventSchema = z.object({
  eventType: z.enum(['broadcast.started', 'broadcast.completed', 'broadcast.failed', 'broadcast.scheduled']),
  broadcastId: z.string().uuid(),
  timestamp: z.string().datetime(),
  metadata: z.object({
    title: z.string().optional(),
    duration: z.number().optional(),
    viewerCount: z.number().optional(),
    platform: z.string().optional(),
  }).optional(),
});

export const AutomationEventSchema = z.object({
  eventType: z.enum(['automation.triggered', 'automation.completed', 'automation.failed']),
  ruleId: z.string().uuid(),
  timestamp: z.string().datetime(),
  action: z.string(),
  result: z.object({
    success: z.boolean(),
    message: z.string().optional(),
    data: z.any().optional(),
  }),
});

export const ContentEventSchema = z.object({
  eventType: z.enum(['content.created', 'content.updated', 'content.deleted', 'content.published']),
  contentId: z.string().uuid(),
  contentType: z.enum(['video', 'audio', 'image', 'text', 'podcast', 'commercial']),
  timestamp: z.string().datetime(),
  metadata: z.object({
    title: z.string().optional(),
    duration: z.number().optional(),
    size: z.number().optional(),
    format: z.string().optional(),
  }).optional(),
});

export const AnalyticsEventSchema = z.object({
  eventType: z.enum(['analytics.updated', 'analytics.milestone']),
  timestamp: z.string().datetime(),
  metrics: z.object({
    viewerCount: z.number(),
    engagementRate: z.number(),
    avgWatchTime: z.number(),
    shareCount: z.number().optional(),
    likeCount: z.number().optional(),
  }),
  milestone: z.string().optional(),
});

export type BroadcastEvent = z.infer<typeof BroadcastEventSchema>;
export type AutomationEvent = z.infer<typeof AutomationEventSchema>;
export type ContentEvent = z.infer<typeof ContentEventSchema>;
export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

export type WebhookPayload = BroadcastEvent | AutomationEvent | ContentEvent | AnalyticsEvent;

export class WebhookValidator {
  static validateBroadcastEvent(payload: unknown): { valid: boolean; data?: BroadcastEvent; error?: string } {
    try {
      const data = BroadcastEventSchema.parse(payload);
      return { valid: true, data };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof z.ZodError ? error.errors[0].message : 'Invalid broadcast event',
      };
    }
  }

  static validateAutomationEvent(payload: unknown): { valid: boolean; data?: AutomationEvent; error?: string } {
    try {
      const data = AutomationEventSchema.parse(payload);
      return { valid: true, data };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof z.ZodError ? error.errors[0].message : 'Invalid automation event',
      };
    }
  }

  static validateContentEvent(payload: unknown): { valid: boolean; data?: ContentEvent; error?: string } {
    try {
      const data = ContentEventSchema.parse(payload);
      return { valid: true, data };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof z.ZodError ? error.errors[0].message : 'Invalid content event',
      };
    }
  }

  static validateAnalyticsEvent(payload: unknown): { valid: boolean; data?: AnalyticsEvent; error?: string } {
    try {
      const data = AnalyticsEventSchema.parse(payload);
      return { valid: true, data };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof z.ZodError ? error.errors[0].message : 'Invalid analytics event',
      };
    }
  }

  static validateWebhookPayload(payload: unknown): { valid: boolean; data?: WebhookPayload; error?: string } {
    if (!payload || typeof payload !== 'object') {
      return { valid: false, error: 'Payload must be an object' };
    }

    const obj = payload as Record<string, unknown>;
    const eventType = obj.eventType as string;

    if (!eventType) {
      return { valid: false, error: 'Missing eventType field' };
    }

    // Route to appropriate validator based on event type
    if (eventType.startsWith('broadcast.')) {
      return this.validateBroadcastEvent(payload);
    } else if (eventType.startsWith('automation.')) {
      return this.validateAutomationEvent(payload);
    } else if (eventType.startsWith('content.')) {
      return this.validateContentEvent(payload);
    } else if (eventType.startsWith('analytics.')) {
      return this.validateAnalyticsEvent(payload);
    }

    return { valid: false, error: `Unknown event type: ${eventType}` };
  }

  static validateSignature(payload: string, signature: string, secret: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  }
}

export function createWebhookPayload(
  eventType: string,
  data: Record<string, unknown>
): WebhookPayload {
  return {
    eventType: eventType as any,
    timestamp: new Date().toISOString(),
    ...data,
  } as WebhookPayload;
}
