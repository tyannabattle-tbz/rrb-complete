import * as db from "../db";

/**
 * Webhook Marketplace Service - Pre-built integrations
 */

export interface WebhookTemplate {
  id: number;
  name: string;
  description?: string | null;
  category: string;
  icon?: string | null;
  webhookUrl: string;
  events: string | string[];
  configSchema?: Record<string, any> | null;
  documentation?: string | null;
  downloads: number | null;
  rating: number | string | null;
  reviews: number | null;
}

export interface MarketplaceStats {
  totalTemplates: number;
  totalInstallations: number;
  topCategories: Array<{ category: string; count: number }>;
  topRated: WebhookTemplate[];
  mostDownloaded: WebhookTemplate[];
}

export const BUILT_IN_TEMPLATES = [
  {
    name: "Slack Notifications",
    category: "slack",
    description: "Send agent session updates to Slack channels",
    icon: "https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png",
    webhookUrl: "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
    events: ["session.completed", "session.failed", "agent.error"],
    configSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Slack channel name" },
        username: { type: "string", description: "Bot username" },
        mentionOnError: { type: "boolean", description: "Mention on errors" },
      },
    },
  },
  {
    name: "Discord Webhooks",
    category: "discord",
    description: "Post agent notifications to Discord servers",
    icon: "https://discord.com/assets/192443b8910afa3f804f784b1d5f4fe6.png",
    webhookUrl: "https://discordapp.com/api/webhooks/YOUR/WEBHOOK",
    events: ["session.completed", "session.failed", "tool.executed"],
    configSchema: {
      type: "object",
      properties: {
        username: { type: "string", description: "Webhook username" },
        color: { type: "string", description: "Embed color (hex)" },
        includeMetrics: { type: "boolean", description: "Include performance metrics" },
      },
    },
  },
  {
    name: "GitHub Issues",
    category: "github",
    description: "Create GitHub issues from agent errors",
    icon: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    webhookUrl: "https://api.github.com/repos/YOUR/REPO/issues",
    events: ["session.failed", "agent.error"],
    configSchema: {
      type: "object",
      properties: {
        repo: { type: "string", description: "GitHub repository" },
        labels: { type: "array", description: "Issue labels" },
        assignee: { type: "string", description: "Default assignee" },
      },
    },
  },
  {
    name: "Email Notifications",
    category: "email",
    description: "Send email summaries of agent sessions",
    icon: "https://www.google.com/favicon.ico",
    webhookUrl: "https://your-email-service.com/send",
    events: ["session.completed", "session.failed"],
    configSchema: {
      type: "object",
      properties: {
        recipients: { type: "array", description: "Email recipients" },
        includeAttachments: { type: "boolean", description: "Include session logs" },
        template: { type: "string", description: "Email template" },
      },
    },
  },
  {
    name: "Zapier Integration",
    category: "zapier",
    description: "Connect to 5000+ apps via Zapier",
    icon: "https://zapier.com/static/images/z-logo.png",
    webhookUrl: "https://hooks.zapier.com/hooks/catch/YOUR/WEBHOOK",
    events: ["session.completed", "session.failed", "tool.executed"],
    configSchema: {
      type: "object",
      properties: {
        webhookId: { type: "string", description: "Zapier webhook ID" },
        customData: { type: "object", description: "Custom data to pass" },
      },
    },
  },
  {
    name: "PagerDuty Alerts",
    category: "pagerduty",
    description: "Create incidents in PagerDuty for critical errors",
    icon: "https://www.pagerduty.com/favicon.ico",
    webhookUrl: "https://events.pagerduty.com/v2/enqueue",
    events: ["agent.error"],
    configSchema: {
      type: "object",
      properties: {
        integrationKey: { type: "string", description: "PagerDuty integration key" },
        severity: { type: "string", description: "Incident severity" },
        service: { type: "string", description: "Service name" },
      },
    },
  },
];

export class WebhookMarketplaceService {
  /**
   * Get marketplace statistics
   */
  static async getMarketplaceStats(): Promise<MarketplaceStats> {
    const templates = await db.getPublicWebhookTemplates();
    const installations = await db.getAllWebhookInstallations();

    const categories = new Map<string, number>();
    templates.forEach((t) => {
      categories.set(t.category, (categories.get(t.category) || 0) + 1);
    });

    const topRated = templates.sort((a, b) => {
      const aRating = typeof a.rating === 'number' ? a.rating : parseFloat(a.rating as string) || 0;
      const bRating = typeof b.rating === 'number' ? b.rating : parseFloat(b.rating as string) || 0;
      return bRating - aRating;
    }).slice(0, 5);
    const mostDownloaded = templates.sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 5);

    return {
      totalTemplates: templates.length,
      totalInstallations: installations.length,
      topCategories: Array.from(categories.entries()).map(([category, count]) => ({ category, count })),
      topRated,
      mostDownloaded,
    };
  }

  /**
   * Get all marketplace templates
   */
  static async getTemplates(filters?: { category?: string; search?: string; limit?: number }) {
    const templates = await db.getPublicWebhookTemplates();

    let filtered = templates;

    if (filters?.category) {
      filtered = filtered.filter((t) => t.category === filters.category);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(search) || t.description?.toLowerCase().includes(search)
      );
    }

    return filtered.slice(0, filters?.limit || 20);
  }

  /**
   * Get template details
   */
  static async getTemplate(templateId: number) {
    return db.getWebhookTemplate(templateId);
  }

  /**
   * Install a template
   */
  static async installTemplate(userId: number, templateId: number, name: string, config: Record<string, any>) {
    const template = await db.getWebhookTemplate(templateId);
    if (!template) throw new Error("Template not found");

    // Validate config against schema
    if (template.configSchema) {
      this.validateConfig(config, template.configSchema);
    }

    const installationId = await db.createWebhookInstallation(userId, templateId, name, config);

    // Increment download count
    await db.incrementTemplateDownloads(templateId);

    return installationId;
  }

  /**
   * Get user's installed templates
   */
  static async getUserInstallations(userId: number) {
    return db.getUserWebhookInstallations(userId);
  }

  /**
   * Update installation
   */
  static async updateInstallation(userId: number, installationId: number, config: Record<string, any>) {
    const installation = await db.getWebhookInstallation(installationId);
    if (!installation || installation.userId !== userId) {
      throw new Error("Installation not found or unauthorized");
    }

    await db.updateWebhookInstallation(installationId, config);
  }

  /**
   * Delete installation
   */
  static async deleteInstallation(userId: number, installationId: number) {
    const installation = await db.getWebhookInstallation(installationId);
    if (!installation || installation.userId !== userId) {
      throw new Error("Installation not found or unauthorized");
    }

    await db.deleteWebhookInstallation(installationId);
  }

  /**
   * Rate a template
   */
  static async rateTemplate(userId: number, templateId: number, rating: number, review?: string) {
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    await db.createWebhookMarketplaceReview(templateId, userId, rating, review);

    // Update template rating
    const reviews = await db.getTemplateReviews(templateId);
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await db.updateTemplateRating(templateId, avgRating, reviews.length);
  }

  /**
   * Get template reviews
   */
  static async getTemplateReviews(templateId: number) {
    return db.getTemplateReviews(templateId);
  }

  /**
   * Create custom template
   */
  static async createCustomTemplate(
    userId: number,
    name: string,
    description: string,
    category: string,
    webhookUrl: string,
    events: string[],
    configSchema?: Record<string, any>
  ) {
    return db.createWebhookTemplate({
      name,
      description,
      category,
      webhookUrl,
      events: JSON.stringify(events),
      configSchema,
      isPublic: false,
      createdBy: userId,
    });
  }

  /**
   * Publish custom template to marketplace
   */
  static async publishTemplate(userId: number, templateId: number) {
    const template = await db.getWebhookTemplate(templateId);
    if (!template || template.createdBy !== userId) {
      throw new Error("Template not found or unauthorized");
    }

    await db.updateTemplatePublicStatus(templateId, true);
  }

  /**
   * Get template usage statistics
   */
  static async getTemplateStats(templateId: number) {
    const installations = await db.getTemplateInstallations(templateId);
    const reviews = await db.getTemplateReviews(templateId);

    const successCount = installations.reduce((sum: number, i: any) => sum + (i.successCount || 0), 0);
    const failureCount = installations.reduce((sum: number, i: any) => sum + (i.failureCount || 0), 0);

    return {
      totalInstallations: installations.length,
      totalInvocations: successCount + failureCount,
      successRate: successCount + failureCount > 0 ? (successCount / (successCount + failureCount)) * 100 : 0,
      averageRating: reviews.length > 0 ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length : 0,
      reviewCount: reviews.length,
    };
  }

  /**
   * Validate config against JSON schema
   */
  private static validateConfig(config: Record<string, any>, schema: Record<string, any>): void {
    if (!schema.properties) return;

    for (const [key, prop] of Object.entries(schema.properties)) {
      const propSchema = prop as any;
      const value = config[key];

      if ((propSchema as any).required && value === undefined) {
        throw new Error(`Missing required field: ${key}`);
      }

      if (value !== undefined && (propSchema as any).type) {
        const actualType = Array.isArray(value) ? "array" : typeof value;
        if (actualType !== (propSchema as any).type) {
          throw new Error(`Invalid type for ${key}: expected ${(propSchema as any).type}, got ${actualType}`);
        }
      }
    }
  }
}
