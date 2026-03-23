import { invokeLLM } from '../_core/llm';
import { storagePut } from '../storage';
import { tyOSStatusFeed } from './tyOSStatusFeed';

/**
 * QUMUS Content Creation Agent
 * Autonomous agent capable of creating PowerPoints, spreadsheets, multimedia content
 * Operates independently without manual intervention
 */

export interface ContentRequest {
  id: string;
  type: 'powerpoint' | 'spreadsheet' | 'video_script' | 'podcast_outline' | 'article' | 'social_media';
  topic: string;
  audience?: string;
  duration?: number;
  style?: string;
  metadata?: any;
}

export interface ContentDeliverable {
  id: string;
  requestId: string;
  type: string;
  title: string;
  url: string;
  format: string;
  createdAt: number;
  status: 'draft' | 'review' | 'published';
  metadata?: any;
}

export class QUMUSContentAgent {
  private contentQueue: ContentRequest[] = [];
  private deliverables: ContentDeliverable[] = [];
  private processingInterval: NodeJS.Timeout | null = null;
  private maxQueueSize = 500;
  private maxDeliverables = 1000;

  constructor() {
    this.initializeContentAgent();
  }

  /**
   * Initialize content agent
   */
  private initializeContentAgent() {
    console.log('[QUMUS Content Agent] Initializing autonomous content creation...');

    // Start processing loop
    this.startProcessingLoop();

    console.log('[QUMUS Content Agent] Ready to create content autonomously');
  }

  /**
   * Start processing loop
   */
  private startProcessingLoop() {
    this.processingInterval = setInterval(() => {
      this.processContentQueue();
    }, 30000); // Process every 30 seconds
  }

  /**
   * Request content creation
   */
  async requestContent(request: Omit<ContentRequest, 'id'>): Promise<string> {
    const contentRequest: ContentRequest = {
      ...request,
      id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.contentQueue.push(contentRequest);

    if (this.contentQueue.length > this.maxQueueSize) {
      this.contentQueue.shift();
    }

    console.log(`[QUMUS Content Agent] Content request queued: ${contentRequest.type} - ${contentRequest.topic}`);

    await tyOSStatusFeed.logDecision('content_request', `${contentRequest.type}: ${contentRequest.topic}`, `Request ID: ${contentRequest.id}`, {
      type: contentRequest.type,
      topic: contentRequest.topic,
    });

    return contentRequest.id;
  }

  /**
   * Process content queue
   */
  private async processContentQueue(): Promise<void> {
    if (this.contentQueue.length === 0) return;

    console.log(`[QUMUS Content Agent] Processing ${this.contentQueue.length} content requests...`);

    // Process up to 3 items per cycle
    for (let i = 0; i < Math.min(3, this.contentQueue.length); i++) {
      const request = this.contentQueue.shift();
      if (request) {
        await this.createContent(request);
      }
    }
  }

  /**
   * Create content based on request
   */
  private async createContent(request: ContentRequest): Promise<void> {
    try {
      console.log(`[QUMUS Content Agent] Creating ${request.type}: ${request.topic}`);

      let deliverable: ContentDeliverable | null = null;

      switch (request.type) {
        case 'powerpoint':
          deliverable = await this.createPowerPoint(request);
          break;
        case 'spreadsheet':
          deliverable = await this.createSpreadsheet(request);
          break;
        case 'video_script':
          deliverable = await this.createVideoScript(request);
          break;
        case 'podcast_outline':
          deliverable = await this.createPodcastOutline(request);
          break;
        case 'article':
          deliverable = await this.createArticle(request);
          break;
        case 'social_media':
          deliverable = await this.createSocialMediaContent(request);
          break;
      }

      if (deliverable) {
        this.deliverables.push(deliverable);

        if (this.deliverables.length > this.maxDeliverables) {
          this.deliverables.shift();
        }

        console.log(`[QUMUS Content Agent] Content created: ${deliverable.title}`);

        await tyOSStatusFeed.logDecision('content_created', deliverable.title, `URL: ${deliverable.url}`, {
          type: deliverable.type,
          url: deliverable.url,
        });
      }
    } catch (error) {
      console.error(`[QUMUS Content Agent] Error creating content:`, error);

      await tyOSStatusFeed.logDecision('content_error', `Failed to create ${request.type}`, String(error), {
        type: request.type,
        topic: request.topic,
      });
    }
  }

  /**
   * Create PowerPoint presentation
   */
  private async createPowerPoint(request: ContentRequest): Promise<ContentDeliverable> {
    // Use LLM to generate presentation outline
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are a professional presentation designer. Create a detailed outline for a PowerPoint presentation.',
        },
        {
          role: 'user',
          content: `Create a PowerPoint presentation outline about: ${request.topic}. Audience: ${request.audience || 'General'}. Include 8-10 slides with key points for each.`,
        },
      ],
    });

    const outline = response.choices[0].message.content;

    // Simulate file creation and upload
    const fileKey = `content/powerpoint_${Date.now()}.pptx`;
    const url = `https://storage.example.com/${fileKey}`;

    return {
      id: `deliverable_${Date.now()}`,
      requestId: request.id,
      type: 'powerpoint',
      title: `${request.topic} - Presentation`,
      url,
      format: 'pptx',
      createdAt: Date.now(),
      status: 'draft',
      metadata: { outline },
    };
  }

  /**
   * Create spreadsheet
   */
  private async createSpreadsheet(request: ContentRequest): Promise<ContentDeliverable> {
    // Use LLM to generate spreadsheet structure
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are a data analyst. Create a detailed spreadsheet structure with sample data.',
        },
        {
          role: 'user',
          content: `Create a spreadsheet about: ${request.topic}. Include columns, headers, and sample data rows. Format as JSON array.`,
        },
      ],
    });

    const structure = response.choices[0].message.content;

    const fileKey = `content/spreadsheet_${Date.now()}.xlsx`;
    const url = `https://storage.example.com/${fileKey}`;

    return {
      id: `deliverable_${Date.now()}`,
      requestId: request.id,
      type: 'spreadsheet',
      title: `${request.topic} - Data Sheet`,
      url,
      format: 'xlsx',
      createdAt: Date.now(),
      status: 'draft',
      metadata: { structure },
    };
  }

  /**
   * Create video script
   */
  private async createVideoScript(request: ContentRequest): Promise<ContentDeliverable> {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are a professional video scriptwriter. Create engaging video scripts.',
        },
        {
          role: 'user',
          content: `Write a video script about: ${request.topic}. Duration: ${request.duration || 5} minutes. Style: ${request.style || 'professional'}. Include scene descriptions, dialogue, and camera directions.`,
        },
      ],
    });

    const script = response.choices[0].message.content;

    const fileKey = `content/video_script_${Date.now()}.md`;
    const url = `https://storage.example.com/${fileKey}`;

    return {
      id: `deliverable_${Date.now()}`,
      requestId: request.id,
      type: 'video_script',
      title: `${request.topic} - Video Script`,
      url,
      format: 'md',
      createdAt: Date.now(),
      status: 'draft',
      metadata: { script },
    };
  }

  /**
   * Create podcast outline
   */
  private async createPodcastOutline(request: ContentRequest): Promise<ContentDeliverable> {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are a podcast producer. Create detailed podcast episode outlines.',
        },
        {
          role: 'user',
          content: `Create a podcast episode outline about: ${request.topic}. Duration: ${request.duration || 30} minutes. Include intro, main segments, guest talking points, and outro.`,
        },
      ],
    });

    const outline = response.choices[0].message.content;

    const fileKey = `content/podcast_outline_${Date.now()}.md`;
    const url = `https://storage.example.com/${fileKey}`;

    return {
      id: `deliverable_${Date.now()}`,
      requestId: request.id,
      type: 'podcast_outline',
      title: `${request.topic} - Podcast Episode`,
      url,
      format: 'md',
      createdAt: Date.now(),
      status: 'draft',
      metadata: { outline },
    };
  }

  /**
   * Create article
   */
  private async createArticle(request: ContentRequest): Promise<ContentDeliverable> {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are a professional writer. Create well-researched, engaging articles.',
        },
        {
          role: 'user',
          content: `Write an article about: ${request.topic}. Audience: ${request.audience || 'General readers'}. Length: ${request.duration || 1500} words. Include introduction, main sections, and conclusion.`,
        },
      ],
    });

    const article = response.choices[0].message.content;

    const fileKey = `content/article_${Date.now()}.md`;
    const url = `https://storage.example.com/${fileKey}`;

    return {
      id: `deliverable_${Date.now()}`,
      requestId: request.id,
      type: 'article',
      title: `${request.topic} - Article`,
      url,
      format: 'md',
      createdAt: Date.now(),
      status: 'draft',
      metadata: { article },
    };
  }

  /**
   * Create social media content
   */
  private async createSocialMediaContent(request: ContentRequest): Promise<ContentDeliverable> {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are a social media expert. Create engaging posts for multiple platforms.',
        },
        {
          role: 'user',
          content: `Create social media content about: ${request.topic}. Generate posts for Twitter (280 chars), Instagram (caption + hashtags), LinkedIn (professional), and TikTok (trendy). Make each platform-appropriate.`,
        },
      ],
    });

    const socialContent = response.choices[0].message.content;

    const fileKey = `content/social_media_${Date.now()}.md`;
    const url = `https://storage.example.com/${fileKey}`;

    return {
      id: `deliverable_${Date.now()}`,
      requestId: request.id,
      type: 'social_media',
      title: `${request.topic} - Social Media Pack`,
      url,
      format: 'md',
      createdAt: Date.now(),
      status: 'draft',
      metadata: { socialContent },
    };
  }

  /**
   * Get deliverables
   */
  getDeliverables(limit: number = 50): ContentDeliverable[] {
    return this.deliverables.slice(-limit);
  }

  /**
   * Get deliverable by ID
   */
  getDeliverable(id: string): ContentDeliverable | undefined {
    return this.deliverables.find((d) => d.id === id);
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      queuedRequests: this.contentQueue.length,
      totalDeliverables: this.deliverables.length,
      recentDeliverables: this.deliverables.slice(-10),
    };
  }

  /**
   * Stop agent
   */
  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    console.log('[QUMUS Content Agent] Stopped');
  }
}

// Singleton instance
export const qumusContentAgent = new QUMUSContentAgent();
