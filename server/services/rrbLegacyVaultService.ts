/**
 * RRB Legacy Vault Service
 * Manages RRB as a legacy archive and historical content repository
 * Links to Ty OS for current streaming
 */

export interface LegacyContent {
  id: string;
  title: string;
  description: string;
  date: Date;
  category: 'broadcast' | 'podcast' | 'interview' | 'event' | 'archive';
  duration?: number;
  archiveUrl?: string;
  transcription?: string;
  metadata?: Record<string, any>;
}

export interface LegacyVaultMetrics {
  totalArchives: number;
  totalBroadcasts: number;
  totalPodcasts: number;
  totalInterviews: number;
  totalEvents: number;
  oldestArchive?: Date;
  newestArchive?: Date;
  totalDuration: number;
}

export interface TyOSLink {
  type: 'radio' | 'podcast' | 'video';
  channel?: string;
  url: string;
  label: string;
}

class RRBLegacyVaultService {
  private legacyContent: Map<string, LegacyContent> = new Map();
  private categories: Map<string, LegacyContent[]> = new Map();

  constructor() {
    this.initializeCategories();
  }

  private initializeCategories(): void {
    this.categories.set('broadcast', []);
    this.categories.set('podcast', []);
    this.categories.set('interview', []);
    this.categories.set('event', []);
    this.categories.set('archive', []);
  }

  /**
   * Add legacy content to the vault
   */
  addLegacyContent(content: LegacyContent): string {
    const id = content.id || `legacy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const legacyItem = { ...content, id };
    
    this.legacyContent.set(id, legacyItem);
    
    const categoryItems = this.categories.get(content.category) || [];
    categoryItems.push(legacyItem);
    this.categories.set(content.category, categoryItems);
    
    return id;
  }

  /**
   * Get all legacy content
   */
  getAllLegacyContent(): LegacyContent[] {
    return Array.from(this.legacyContent.values());
  }

  /**
   * Get legacy content by category
   */
  getContentByCategory(category: LegacyContent['category']): LegacyContent[] {
    return this.categories.get(category) || [];
  }

  /**
   * Search legacy content
   */
  searchLegacyContent(query: string): LegacyContent[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.legacyContent.values()).filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get legacy content by date range
   */
  getContentByDateRange(startDate: Date, endDate: Date): LegacyContent[] {
    return Array.from(this.legacyContent.values()).filter(
      (item) => item.date >= startDate && item.date <= endDate
    );
  }

  /**
   * Get legacy vault metrics
   */
  getVaultMetrics(): LegacyVaultMetrics {
    const allContent = Array.from(this.legacyContent.values());
    const broadcasts = this.getContentByCategory('broadcast');
    const podcasts = this.getContentByCategory('podcast');
    const interviews = this.getContentByCategory('interview');
    const events = this.getContentByCategory('event');
    const archives = this.getContentByCategory('archive');

    const totalDuration = allContent.reduce((sum, item) => sum + (item.duration || 0), 0);
    const dates = allContent.map((item) => item.date).sort();

    return {
      totalArchives: allContent.length,
      totalBroadcasts: broadcasts.length,
      totalPodcasts: podcasts.length,
      totalInterviews: interviews.length,
      totalEvents: events.length,
      oldestArchive: dates.length > 0 ? dates[0] : undefined,
      newestArchive: dates.length > 0 ? dates[dates.length - 1] : undefined,
      totalDuration,
    };
  }

  /**
   * Generate Ty OS link for current streaming
   */
  generateTyOSLink(type: 'radio' | 'podcast' | 'video', channel?: string): TyOSLink {
    const baseUrl = 'https://tyos.manus.space';
    
    switch (type) {
      case 'radio':
        return {
          type: 'radio',
          channel: channel || 'RRB Main Radio',
          url: `${baseUrl}/radio?channel=${encodeURIComponent(channel || 'RRB Main Radio')}`,
          label: `Listen on Ty OS - ${channel || 'RRB Main Radio'}`,
        };
      case 'podcast':
        return {
          type: 'podcast',
          url: `${baseUrl}/podcasts`,
          label: 'Listen to Podcasts on Ty OS',
        };
      case 'video':
        return {
          type: 'video',
          url: `${baseUrl}/videos`,
          label: 'Watch Videos on Ty OS',
        };
      default:
        return {
          type: 'radio',
          url: baseUrl,
          label: 'Listen Live on Ty OS',
        };
    }
  }

  /**
   * Create legacy content summary
   */
  createLegacyContentSummary(): {
    title: string;
    description: string;
    metrics: LegacyVaultMetrics;
    tyOSLink: TyOSLink;
  } {
    return {
      title: 'RRB Legacy Vault',
      description:
        'Rockin Rockin Boogie Legacy Archive - Historical broadcasts, podcasts, interviews, and events preserved for future generations',
      metrics: this.getVaultMetrics(),
      tyOSLink: this.generateTyOSLink('radio'),
    };
  }

  /**
   * Export legacy content as JSON
   */
  exportLegacyContentAsJSON(): string {
    const allContent = Array.from(this.legacyContent.values());
    return JSON.stringify(
      {
        vault: 'RRB Legacy Vault',
        exportDate: new Date().toISOString(),
        metrics: this.getVaultMetrics(),
        content: allContent,
      },
      null,
      2
    );
  }

  /**
   * Get featured legacy content
   */
  getFeaturedContent(limit: number = 5): LegacyContent[] {
    const allContent = Array.from(this.legacyContent.values());
    return allContent.slice(-limit).reverse();
  }

  /**
   * Get legacy content statistics
   */
  getStatistics(): {
    totalItems: number;
    byCategory: Record<string, number>;
    averageDuration: number;
    totalHours: number;
  } {
    const allContent = Array.from(this.legacyContent.values());
    const byCategory: Record<string, number> = {
      broadcast: this.getContentByCategory('broadcast').length,
      podcast: this.getContentByCategory('podcast').length,
      interview: this.getContentByCategory('interview').length,
      event: this.getContentByCategory('event').length,
      archive: this.getContentByCategory('archive').length,
    };

    const totalDuration = allContent.reduce((sum, item) => sum + (item.duration || 0), 0);
    const averageDuration = allContent.length > 0 ? totalDuration / allContent.length : 0;
    const totalHours = totalDuration / 3600;

    return {
      totalItems: allContent.length,
      byCategory,
      averageDuration,
      totalHours,
    };
  }
}

export const rrbLegacyVaultService = new RRBLegacyVaultService();
