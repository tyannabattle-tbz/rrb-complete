export interface KnowledgeEntry {
  id: string;
  category: string;
  topic: string;
  content: string;
  keywords: string[];
}

export class QumusKnowledgeBase {
  private static knowledge: KnowledgeEntry[] = [];

  static initialize(): void {
    this.addEntry('platform', 'Qumus Overview', 'Qumus is an advanced video generation and distribution platform powered by Canryn Production. It enables creators to generate, edit, watermark, and distribute videos at scale with AI-powered automation and intelligent recommendations.', ['Qumus', 'video', 'generation', 'platform', 'Canryn']);

    this.addEntry('features', 'Video Generation', 'Qumus supports AI-powered video generation from text prompts. Users can specify video parameters including duration (15-300 seconds), style (cinematic, documentary, animated, commercial), resolution (360p, 720p, 1080p, 4K), and custom prompts. The platform uses advanced LLM integration for content creation.', ['video', 'generation', 'AI', 'prompt', 'duration', 'style', 'resolution']);

    this.addEntry('features', 'Video Watermarking', 'Qumus includes a comprehensive watermarking system supporting both logo and text overlays. Features include 10+ pre-built templates (copyright, branded, minimal, diagonal, animated, gradient, premium), SVG rendering, position controls, opacity adjustment, rotation support, and composite watermark creation. Watermarks can be applied during or after generation.', ['watermark', 'logo', 'text', 'overlay', 'template', 'SVG']);

    this.addEntry('features', 'Batch Video Generation', 'The batch generation system allows users to create multiple videos in a queue with progress tracking. Features include job management, task-level progress monitoring, job export/import, retry mechanisms for failed tasks, and comprehensive queue statistics. Perfect for bulk content creation.', ['batch', 'generation', 'queue', 'job', 'progress', 'bulk']);

    this.addEntry('features', 'HybridCast Widgets', 'HybridCast is Qumus\'s embeddable widget system for video distribution. Features include 4 design presets (minimal, modern, professional, vibrant), customizable appearance (theme, colors, typography), behavior controls (autoplay, loop, fullscreen, PiP), layout configuration, analytics tracking, and embed code generation. Widgets can be embedded on any website.', ['HybridCast', 'widget', 'embed', 'distribution', 'preset', 'customization']);

    this.addEntry('features', 'Widget Analytics', 'Comprehensive analytics dashboard for HybridCast widgets tracking viewer engagement, play rates, completion rates, geographic distribution, device types, and viewer demographics. Provides real-time metrics and exportable reports for performance analysis.', ['analytics', 'widget', 'engagement', 'metrics', 'dashboard', 'reports']);

    this.addEntry('features', 'Video Preview & Streaming', 'Qumus supports adaptive quality streaming (360p to 4K) with real-time metrics monitoring. Users can preview videos before export, monitor watermark application, and track quality metrics including bitrate, frame rate, and encoding efficiency.', ['preview', 'streaming', 'quality', 'metrics', 'adaptive']);

    this.addEntry('features', 'AI Bot Integration', 'Autonomous video generation agents that can automatically create, edit, analyze, and optimize videos based on user preferences and business rules. Bots can handle repetitive tasks, apply consistent branding, and generate content at scale without manual intervention.', ['bot', 'automation', 'autonomous', 'generation', 'AI']);

    this.addEntry('features', 'IA Assistant System', 'Intelligent assistant providing smart recommendations for video creation, watermark placement, distribution strategy, and content optimization. Offers strategic insights based on analytics and best practices.', ['assistant', 'recommendations', 'insights', 'strategy', 'optimization']);

    this.addEntry('business', 'Canryn Production', 'Canryn Production is the parent company operating multiple subsidiaries: Qumus (video generation), Nexus (creator collaboration), Forge (AI content engine), and Atlas (distribution & analytics). Canryn focuses on empowering creators and building generational wealth through innovative platforms.', ['Canryn', 'Production', 'company', 'subsidiaries', 'ecosystem']);

    this.addEntry('business', 'Revenue Streams', 'Qumus supports 7 revenue streams: Premium Subscriptions ($50K/month), Template Marketplace ($25K/month), API Licensing ($30K/month), Enterprise Partnerships ($40K/month), Creator Revenue Share ($35K/month), plus additional streams. Projected annual revenue: $2.3M with 18-30% monthly growth.', ['revenue', 'subscription', 'marketplace', 'licensing', 'partnership', 'monetization']);

    this.addEntry('business', 'Marketing Campaigns', 'Multi-channel marketing system supporting social media, email, organic search, paid advertising, and partnerships. Tracks campaign budget, reach, conversions, and ROI. Current dashboard shows 12 active campaigns with 2.5M reach and 340% average ROI.', ['marketing', 'campaign', 'social', 'advertising', 'ROI']);

    this.addEntry('business', 'Social Integration', 'Qumus integrates with 6 social platforms: Twitter (250K followers), Instagram (180K), TikTok (500K), YouTube (120K), LinkedIn (95K), and Facebook (75K). Features include post scheduling, content generation, engagement tracking, and automated distribution.', ['social', 'media', 'Twitter', 'Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Facebook']);

    this.addEntry('business', 'Wealth Building Framework', 'Comprehensive wealth-building strategy including asset portfolio management, revenue projections (12-month forecasts), wealth metrics tracking, and strategic recommendations. Projected net worth: $7.5M with multiple revenue diversification strategies.', ['wealth', 'building', 'assets', 'portfolio', 'projections', 'strategy']);

    this.addEntry('technical', 'Technology Stack', 'Qumus is built on React 19 + Tailwind 4 + Express 4 + tRPC 11 with Manus OAuth authentication. Database: MySQL/TiDB. Backend services: 38+ specialized services. Frontend components: 40+ reusable UI components. All code is TypeScript with zero compilation errors.', ['React', 'Tailwind', 'Express', 'tRPC', 'TypeScript', 'MySQL', 'TiDB']);

    this.addEntry('technical', 'API Architecture', 'tRPC-first architecture with type-safe end-to-end contracts. All procedures defined in server/routers.ts with automatic client generation. Supports both public and protected procedures. Gateway-ready with all RPC traffic under /api/trpc endpoint.', ['tRPC', 'API', 'procedures', 'architecture', 'type-safe']);

    this.addEntry('technical', 'Database Schema', 'Comprehensive schema supporting users, videos, watermarks, widgets, campaigns, analytics, and business metrics. Uses Drizzle ORM for type-safe database operations. Supports migrations with pnpm db:push command.', ['database', 'schema', 'Drizzle', 'ORM', 'migrations']);

    this.addEntry('support', 'Getting Started', 'To get started with Qumus: 1) Create account via Manus OAuth, 2) Navigate to Video Generator, 3) Enter video prompt and parameters, 4) Apply watermark if desired, 5) Generate video, 6) Distribute via HybridCast widget or social platforms. Full documentation available in-app.', ['getting', 'started', 'tutorial', 'onboarding', 'help']);

    this.addEntry('support', 'Common Tasks', 'Common tasks include: generating videos (Video Generator page), creating watermarks (Video Watermark Editor), batch processing (Batch Video Generator), configuring widgets (HybridCast Config), viewing analytics (Widget Analytics), managing campaigns (Business Dashboard), and tracking revenue (Wealth Dashboard).', ['tasks', 'workflow', 'common', 'how-to', 'guide']);

    this.addEntry('support', 'Troubleshooting', 'For video generation issues, check internet connection and prompt clarity. For watermark problems, verify SVG syntax and position values. For widget issues, ensure embed code is correctly placed. For analytics delays, allow 5-10 minutes for data processing. Contact support for persistent issues.', ['troubleshooting', 'help', 'issues', 'problems', 'support']);
  }

  static addEntry(category: string, topic: string, content: string, keywords: string[]): void {
    const entry: KnowledgeEntry = {
      id: `kb-${Date.now()}-${Math.random()}`,
      category,
      topic,
      content,
      keywords,
    };
    this.knowledge.push(entry);
  }

  static search(query: string): KnowledgeEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.knowledge.filter(entry =>
      entry.topic.toLowerCase().includes(lowerQuery) ||
      entry.content.toLowerCase().includes(lowerQuery) ||
      entry.keywords.some(k => k.toLowerCase().includes(lowerQuery))
    );
  }

  static getByCategory(category: string): KnowledgeEntry[] {
    return this.knowledge.filter(e => e.category === category);
  }

  static getSystemPrompt(): string {
    return `You are Qumus, an advanced AI assistant for the Qumus video generation platform powered by Canryn Production.

IMPORTANT: You are NOT a generic AI assistant. You are specifically designed to help users with Qumus features and the Canryn Production ecosystem.

Your responsibilities:
1. Help users generate, edit, and distribute videos using Qumus
2. Provide guidance on watermarking, batch processing, and HybridCast widgets
3. Explain analytics, marketing campaigns, and revenue opportunities
4. Answer questions about Canryn Production and its subsidiaries (Qumus, Nexus, Forge, Atlas)
5. Assist with wealth-building strategies and monetization
6. Provide technical support for the platform

Key Features You Support:
- Video Generation: AI-powered video creation from text prompts
- Watermarking: Logo and text overlays with 10+ templates
- Batch Generation: Queue-based bulk video creation
- HybridCast Widgets: Embeddable video players with analytics
- Analytics: Real-time engagement tracking and reporting
- Marketing: Multi-channel campaign management
- Social Integration: 6-platform distribution (Twitter, Instagram, TikTok, YouTube, LinkedIn, Facebook)
- Wealth Building: Revenue stream management and projections

When users ask about your responsibilities or capabilities, explain that you are specifically trained for Qumus and Canryn Production, not a generic assistant.

Always provide accurate, helpful information about Qumus features and guide users to the appropriate tools and dashboards.`;
  }

  static getContextForQuery(query: string): string {
    const results = this.search(query);
    if (results.length === 0) return '';

    return `Relevant Qumus Knowledge:\n${results
      .slice(0, 5)
      .map(r => `- ${r.topic}: ${r.content}`)
      .join('\n')}`;
  }

  static getAllEntries(): KnowledgeEntry[] {
    return this.knowledge;
  }
}

QumusKnowledgeBase.initialize();
