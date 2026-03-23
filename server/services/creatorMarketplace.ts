/**
 * Creator Marketplace Service
 * Platform for creators to upload content, earn revenue, and reach audiences
 * Integrated with RRB Radio channels and Canryn Production
 */

export interface Creator {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  verified: boolean;
  joinDate: number;
  totalEarnings: number;
  rating: number;
  followers: number;
  contentCount: number;
}

export interface Content {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  type: 'podcast' | 'music' | 'audiobook' | 'educational' | 'news' | 'entertainment';
  duration: number;
  fileUrl: string;
  thumbnail: string;
  uploadDate: number;
  plays: number;
  downloads: number;
  revenue: number;
  royaltyRate: number;
  channels: string[];
  tags: string[];
  metadata: Record<string, any>;
}

export interface Revenue {
  id: string;
  creatorId: string;
  contentId: string;
  amount: number;
  source: 'streams' | 'downloads' | 'sponsorship' | 'tips';
  date: number;
  status: 'pending' | 'processing' | 'completed';
}

export interface Sponsorship {
  id: string;
  creatorId: string;
  brand: string;
  amount: number;
  startDate: number;
  endDate: number;
  status: 'active' | 'completed' | 'cancelled';
  terms: string;
}

export class CreatorMarketplace {
  private creators: Map<string, Creator> = new Map();
  private content: Map<string, Content> = new Map();
  private revenues: Revenue[] = [];
  private sponsorships: Map<string, Sponsorship> = new Map();
  private platformFeePercentage = 15; // 15% platform fee, 85% to creator
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize marketplace
   */
  private initialize() {
    console.log('[Creator Marketplace] Initializing...');
    this.startRevenueProcessing();
    console.log('[Creator Marketplace] Ready for creators');
  }

  /**
   * Register creator
   */
  registerCreator(
    name: string,
    email: string,
    bio: string,
    avatar: string,
  ): Creator {
    const creator: Creator = {
      id: `creator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      bio,
      avatar,
      verified: false,
      joinDate: Date.now(),
      totalEarnings: 0,
      rating: 5,
      followers: 0,
      contentCount: 0,
    };

    this.creators.set(creator.id, creator);
    console.log(`[Creator Marketplace] Creator registered: ${name}`);

    return creator;
  }

  /**
   * Upload content
   */
  uploadContent(
    creatorId: string,
    title: string,
    description: string,
    type: string,
    duration: number,
    fileUrl: string,
    thumbnail: string,
    channels: string[],
    tags: string[],
  ): Content {
    const creator = this.creators.get(creatorId);
    if (!creator) {
      throw new Error('Creator not found');
    }

    const content: Content = {
      id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      creatorId,
      title,
      description,
      type: type as any,
      duration,
      fileUrl,
      thumbnail,
      uploadDate: Date.now(),
      plays: 0,
      downloads: 0,
      revenue: 0,
      royaltyRate: 85, // Creator gets 85%
      channels,
      tags,
      metadata: {
        format: 'mp3',
        bitrate: '192kbps',
        quality: 'high',
      },
    };

    this.content.set(content.id, content);
    creator.contentCount++;

    console.log(`[Creator Marketplace] Content uploaded: ${title} by ${creator.name}`);

    return content;
  }

  /**
   * Record play/stream
   */
  recordPlay(contentId: string, duration: number): void {
    const content = this.content.get(contentId);
    if (!content) return;

    content.plays++;

    // Calculate revenue (example: $0.003 per stream)
    const streamRevenue = 0.003;
    content.revenue += streamRevenue;

    // Create revenue record
    const revenue: Revenue = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      creatorId: content.creatorId,
      contentId,
      amount: streamRevenue,
      source: 'streams',
      date: Date.now(),
      status: 'pending',
    };

    this.revenues.push(revenue);
  }

  /**
   * Record download
   */
  recordDownload(contentId: string): void {
    const content = this.content.get(contentId);
    if (!content) return;

    content.downloads++;

    // Calculate revenue (example: $0.50 per download)
    const downloadRevenue = 0.5;
    content.revenue += downloadRevenue;

    const revenue: Revenue = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      creatorId: content.creatorId,
      contentId,
      amount: downloadRevenue,
      source: 'downloads',
      date: Date.now(),
      status: 'pending',
    };

    this.revenues.push(revenue);
  }

  /**
   * Start revenue processing
   */
  private startRevenueProcessing() {
    this.processingInterval = setInterval(() => {
      this.processRevenue();
    }, 60000); // Process every minute
  }

  /**
   * Process pending revenue
   */
  private processRevenue(): void {
    const pendingRevenue = this.revenues.filter((r) => r.status === 'pending');

    pendingRevenue.forEach((revenue) => {
      const creator = this.creators.get(revenue.creatorId);
      if (creator) {
        const creatorShare = revenue.amount * (this.platformFeePercentage / 100);
        creator.totalEarnings += creatorShare;
        revenue.status = 'completed';

        console.log(`[Creator Marketplace] Revenue processed: $${creatorShare.toFixed(2)} for ${creator.name}`);
      }
    });
  }

  /**
   * Get creator stats
   */
  getCreatorStats(creatorId: string) {
    const creator = this.creators.get(creatorId);
    if (!creator) return null;

    const creatorContent = Array.from(this.content.values()).filter((c) => c.creatorId === creatorId);
    const totalPlays = creatorContent.reduce((sum, c) => sum + c.plays, 0);
    const totalDownloads = creatorContent.reduce((sum, c) => sum + c.downloads, 0);
    const totalRevenue = creatorContent.reduce((sum, c) => sum + c.revenue, 0);

    return {
      creator,
      contentCount: creatorContent.length,
      totalPlays,
      totalDownloads,
      totalRevenue,
      avgPlaysPerContent: (totalPlays / creatorContent.length).toFixed(0),
      topContent: creatorContent.sort((a, b) => b.plays - a.plays).slice(0, 5),
    };
  }

  /**
   * Get marketplace stats
   */
  getMarketplaceStats() {
    const totalCreators = this.creators.size;
    const totalContent = this.content.size;
    const totalPlays = Array.from(this.content.values()).reduce((sum, c) => sum + c.plays, 0);
    const totalRevenue = Array.from(this.content.values()).reduce((sum, c) => sum + c.revenue, 0);
    const totalCreatorEarnings = Array.from(this.creators.values()).reduce((sum, c) => sum + c.totalEarnings, 0);

    return {
      totalCreators,
      totalContent,
      totalPlays,
      totalRevenue,
      totalCreatorEarnings,
      platformEarnings: totalRevenue - totalCreatorEarnings,
      avgContentPerCreator: (totalContent / totalCreators).toFixed(1),
      avgPlaysPerContent: (totalPlays / totalContent).toFixed(0),
    };
  }

  /**
   * Get top creators
   */
  getTopCreators(limit: number = 10) {
    return Array.from(this.creators.values())
      .sort((a, b) => b.totalEarnings - a.totalEarnings)
      .slice(0, limit);
  }

  /**
   * Get trending content
   */
  getTrendingContent(limit: number = 20) {
    return Array.from(this.content.values())
      .sort((a, b) => b.plays - a.plays)
      .slice(0, limit);
  }

  /**
   * Add sponsorship
   */
  addSponsorship(
    creatorId: string,
    brand: string,
    amount: number,
    duration: number,
  ): Sponsorship {
    const creator = this.creators.get(creatorId);
    if (!creator) {
      throw new Error('Creator not found');
    }

    const sponsorship: Sponsorship = {
      id: `sponsor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      creatorId,
      brand,
      amount,
      startDate: Date.now(),
      endDate: Date.now() + duration,
      status: 'active',
      terms: `Sponsorship with ${brand} for ${(duration / (1000 * 60 * 60 * 24)).toFixed(0)} days`,
    };

    this.sponsorships.set(sponsorship.id, sponsorship);
    creator.totalEarnings += amount;

    console.log(`[Creator Marketplace] Sponsorship added: ${brand} - $${amount} for ${creator.name}`);

    return sponsorship;
  }

  /**
   * Get creator by ID
   */
  getCreator(creatorId: string): Creator | undefined {
    return this.creators.get(creatorId);
  }

  /**
   * Get content by ID
   */
  getContent(contentId: string): Content | undefined {
    return this.content.get(contentId);
  }

  /**
   * Get all creators
   */
  getAllCreators(): Creator[] {
    return Array.from(this.creators.values());
  }

  /**
   * Get all content
   */
  getAllContent(): Content[] {
    return Array.from(this.content.values());
  }

  /**
   * Stop marketplace
   */
  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    console.log('[Creator Marketplace] Stopped');
  }
}

// Singleton instance
export const creatorMarketplace = new CreatorMarketplace();
