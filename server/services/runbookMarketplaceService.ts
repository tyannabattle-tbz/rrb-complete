export interface RunbookTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  version: string;
  rating: number; // 0-5
  downloads: number;
  tags: string[];
  steps: RunbookStep[];
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
}

export interface RunbookStep {
  id: string;
  order: number;
  title: string;
  description: string;
  action: string;
  parameters: Record<string, any>;
  timeout: number; // seconds
}

export interface RunbookReview {
  id: string;
  runbookId: string;
  userId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
}

export interface RunbookInstallation {
  id: string;
  runbookId: string;
  userId: string;
  installedAt: Date;
  usageCount: number;
  lastUsed: Date;
}

export class RunbookMarketplaceService {
  private templates: Map<string, RunbookTemplate> = new Map();
  private reviews: RunbookReview[] = [];
  private installations: Map<string, RunbookInstallation> = new Map();

  // Pre-built templates
  private builtInTemplates: RunbookTemplate[] = [
    {
      id: "tmpl-db-backup",
      name: "Database Backup",
      description: "Automated database backup runbook",
      category: "Database",
      author: "Manus",
      version: "1.0.0",
      rating: 4.8,
      downloads: 1250,
      tags: ["database", "backup", "disaster-recovery"],
      steps: [
        {
          id: "step-1",
          order: 1,
          title: "Stop Write Operations",
          description: "Pause all write operations to the database",
          action: "pause_writes",
          parameters: { timeout: 30 },
          timeout: 60,
        },
        {
          id: "step-2",
          order: 2,
          title: "Create Backup",
          description: "Create full database backup",
          action: "create_backup",
          parameters: { type: "full", compression: "gzip" },
          timeout: 300,
        },
        {
          id: "step-3",
          order: 3,
          title: "Resume Operations",
          description: "Resume write operations",
          action: "resume_writes",
          parameters: {},
          timeout: 30,
        },
      ],
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-15"),
      isPublished: true,
    },
    {
      id: "tmpl-service-restart",
      name: "Service Restart",
      description: "Graceful service restart with health checks",
      category: "Infrastructure",
      author: "Manus",
      version: "1.0.0",
      rating: 4.9,
      downloads: 2100,
      tags: ["service", "restart", "health-check"],
      steps: [
        {
          id: "step-1",
          order: 1,
          title: "Drain Connections",
          description: "Gracefully drain existing connections",
          action: "drain_connections",
          parameters: { timeout: 60 },
          timeout: 90,
        },
        {
          id: "step-2",
          order: 2,
          title: "Stop Service",
          description: "Stop the service",
          action: "stop_service",
          parameters: {},
          timeout: 30,
        },
        {
          id: "step-3",
          order: 3,
          title: "Start Service",
          description: "Start the service",
          action: "start_service",
          parameters: {},
          timeout: 30,
        },
        {
          id: "step-4",
          order: 4,
          title: "Health Check",
          description: "Verify service health",
          action: "health_check",
          parameters: { retries: 5, interval: 10 },
          timeout: 60,
        },
      ],
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-20"),
      isPublished: true,
    },
  ];

  constructor() {
    // Load built-in templates
    this.builtInTemplates.forEach((template) => {
      this.templates.set(template.id, template);
    });
  }

  searchTemplates(query: string, filters?: { category?: string; minRating?: number }): RunbookTemplate[] {
    return Array.from(this.templates.values()).filter((template) => {
      if (!template.isPublished) return false;

      const matchesQuery =
        template.name.toLowerCase().includes(query.toLowerCase()) ||
        template.description.toLowerCase().includes(query.toLowerCase()) ||
        template.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));

      if (!matchesQuery) return false;

      if (filters?.category && template.category !== filters.category) return false;
      if (filters?.minRating && template.rating < filters.minRating) return false;

      return true;
    });
  }

  getTemplate(templateId: string): RunbookTemplate | null {
    return this.templates.get(templateId) || null;
  }

  publishTemplate(template: RunbookTemplate): void {
    template.isPublished = true;
    template.updatedAt = new Date();
    this.templates.set(template.id, template);
  }

  installTemplate(templateId: string, userId: string): RunbookInstallation {
    const template = this.templates.get(templateId);
    if (!template) throw new Error("Template not found");

    const installationId = `inst-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const installation: RunbookInstallation = {
      id: installationId,
      runbookId: templateId,
      userId,
      installedAt: new Date(),
      usageCount: 0,
      lastUsed: new Date(),
    };

    this.installations.set(installationId, installation);

    // Increment download count
    template.downloads++;

    return installation;
  }

  recordTemplateUsage(installationId: string): void {
    const installation = this.installations.get(installationId);
    if (installation) {
      installation.usageCount++;
      installation.lastUsed = new Date();
    }
  }

  addReview(runbookId: string, userId: string, rating: number, comment: string): RunbookReview {
    const template = this.templates.get(runbookId);
    if (!template) throw new Error("Template not found");

    const review: RunbookReview = {
      id: `review-${Date.now()}`,
      runbookId,
      userId,
      rating,
      comment,
      createdAt: new Date(),
    };

    this.reviews.push(review);

    // Update template rating (simple average)
    const templateReviews = this.reviews.filter((r) => r.runbookId === runbookId);
    const avgRating = templateReviews.reduce((sum, r) => sum + r.rating, 0) / templateReviews.length;
    template.rating = Math.round(avgRating * 10) / 10;

    return review;
  }

  getTemplateReviews(templateId: string): RunbookReview[] {
    return this.reviews.filter((r) => r.runbookId === templateId);
  }

  getFeaturedTemplates(): RunbookTemplate[] {
    return Array.from(this.templates.values())
      .filter((t) => t.isPublished)
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 5);
  }

  getMarketplaceStats(): {
    totalTemplates: number;
    publishedTemplates: number;
    totalInstallations: number;
    totalReviews: number;
    averageRating: number;
  } {
    const templates = Array.from(this.templates.values());
    const published = templates.filter((t) => t.isPublished);
    const installations = Array.from(this.installations.values());

    const avgRating =
      published.length > 0 ? published.reduce((sum, t) => sum + t.rating, 0) / published.length : 0;

    return {
      totalTemplates: templates.length,
      publishedTemplates: published.length,
      totalInstallations: installations.length,
      totalReviews: this.reviews.length,
      averageRating: Math.round(avgRating * 10) / 10,
    };
  }
}
