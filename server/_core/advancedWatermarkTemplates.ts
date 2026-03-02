export interface WatermarkTemplate {
  templateId: string;
  name: string;
  category: 'animated' | 'gradient' | 'branded' | 'minimal' | 'premium';
  svgTemplate: string;
  cssAnimation?: string;
  previewUrl?: string;
  tags: string[];
  compatible: ('logo' | 'text' | 'both')[];
}

export class AdvancedWatermarkTemplates {
  private static templates: Map<string, WatermarkTemplate> = new Map();

  static initialize(): void {
    this.addTemplate({
      templateId: 'animated-pulse',
      name: 'Animated Pulse',
      category: 'animated',
      svgTemplate: `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" stroke-width="2" class="pulse"/></svg>`,
      cssAnimation: `@keyframes pulse { 0% { r: 80; opacity: 1; } 100% { r: 120; opacity: 0; } }`,
      tags: ['animated', 'attention-grabbing', 'modern'],
      compatible: ['both'],
    });

    this.addTemplate({
      templateId: 'gradient-modern',
      name: 'Gradient Modern',
      category: 'gradient',
      svgTemplate: `<defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" /><stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" /></linearGradient></defs><rect width="200" height="200" fill="url(#grad)"/>`,
      tags: ['gradient', 'modern', 'professional'],
      compatible: ['both'],
    });

    this.addTemplate({
      templateId: 'branded-premium',
      name: 'Branded Premium',
      category: 'branded',
      svgTemplate: `<rect x="10" y="10" width="180" height="180" fill="none" stroke="gold" stroke-width="3" rx="10"/><text x="100" y="110" text-anchor="middle" font-size="24" fill="gold" font-weight="bold">PREMIUM</text>`,
      tags: ['branded', 'premium', 'luxury'],
      compatible: ['text'],
    });

    this.addTemplate({
      templateId: 'minimal-corner',
      name: 'Minimal Corner',
      category: 'minimal',
      svgTemplate: `<line x1="10" y1="10" x2="50" y2="10" stroke="white" stroke-width="2"/><line x1="10" y1="10" x2="10" y2="50" stroke="white" stroke-width="2"/>`,
      tags: ['minimal', 'corner', 'subtle'],
      compatible: ['both'],
    });

    this.addTemplate({
      templateId: 'animated-slide',
      name: 'Animated Slide',
      category: 'animated',
      svgTemplate: `<g class="slide-animation"><rect x="0" y="0" width="200" height="200" fill="rgba(0,0,0,0.3)"/></g>`,
      cssAnimation: `@keyframes slide { 0% { transform: translateX(-200px); } 100% { transform: translateX(0); } }`,
      tags: ['animated', 'entrance', 'dynamic'],
      compatible: ['both'],
    });

    this.addTemplate({
      templateId: 'gradient-sunset',
      name: 'Gradient Sunset',
      category: 'gradient',
      svgTemplate: `<defs><linearGradient id="sunset" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1" /><stop offset="50%" style="stop-color:#FFA500;stop-opacity:1" /><stop offset="100%" style="stop-color:#FFD700;stop-opacity:1" /></linearGradient></defs><rect width="200" height="200" fill="url(#sunset)"/>`,
      tags: ['gradient', 'warm', 'sunset'],
      compatible: ['both'],
    });

    this.addTemplate({
      templateId: 'branded-studio',
      name: 'Branded Studio',
      category: 'branded',
      svgTemplate: `<rect x="5" y="5" width="190" height="190" fill="none" stroke="white" stroke-width="2"/><circle cx="100" cy="100" r="60" fill="none" stroke="white" stroke-width="1"/>`,
      tags: ['branded', 'professional', 'studio'],
      compatible: ['both'],
    });

    this.addTemplate({
      templateId: 'minimal-dot',
      name: 'Minimal Dot',
      category: 'minimal',
      svgTemplate: `<circle cx="100" cy="100" r="8" fill="white"/>`,
      tags: ['minimal', 'dot', 'simple'],
      compatible: ['both'],
    });

    this.addTemplate({
      templateId: 'animated-glow',
      name: 'Animated Glow',
      category: 'animated',
      svgTemplate: `<defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><circle cx="100" cy="100" r="50" fill="white" filter="url(#glow)" class="glow-animation"/>`,
      cssAnimation: `@keyframes glow { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }`,
      tags: ['animated', 'glow', 'attention'],
      compatible: ['both'],
    });

    this.addTemplate({
      templateId: 'gradient-ocean',
      name: 'Gradient Ocean',
      category: 'gradient',
      svgTemplate: `<defs><linearGradient id="ocean" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#0EA5E9;stop-opacity:1" /><stop offset="100%" style="stop-color:#06B6D4;stop-opacity:1" /></linearGradient></defs><rect width="200" height="200" fill="url(#ocean)"/>`,
      tags: ['gradient', 'cool', 'ocean'],
      compatible: ['both'],
    });
  }

  private static addTemplate(template: WatermarkTemplate): void {
    this.templates.set(template.templateId, template);
  }

  static getTemplate(templateId: string): WatermarkTemplate | null {
    return this.templates.get(templateId) || null;
  }

  static listTemplates(category?: WatermarkTemplate['category']): WatermarkTemplate[] {
    const templates = Array.from(this.templates.values());
    return category ? templates.filter(t => t.category === category) : templates;
  }

  static searchTemplates(query: string): WatermarkTemplate[] {
    const lower = query.toLowerCase();
    return Array.from(this.templates.values()).filter(
      t => t.name.toLowerCase().includes(lower) || t.tags.some(tag => tag.includes(lower))
    );
  }

  static getRandomTemplate(): WatermarkTemplate {
    const templates = Array.from(this.templates.values());
    return templates[Math.floor(Math.random() * templates.length)];
  }

  static getTemplatesByCategory(category: WatermarkTemplate['category']): WatermarkTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.category === category);
  }

  static exportTemplate(templateId: string): string {
    const template = this.getTemplate(templateId);
    if (!template) throw new Error('Template not found');
    return JSON.stringify(template, null, 2);
  }

  static importTemplate(json: string): WatermarkTemplate {
    const template = JSON.parse(json) as WatermarkTemplate;
    if (!template.templateId || !template.name) throw new Error('Invalid template format');
    this.addTemplate(template);
    return template;
  }

  static getStats(): { total: number; byCategory: Record<string, number> } {
    const byCategory: Record<string, number> = {};
    Array.from(this.templates.values()).forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + 1;
    });
    return { total: this.templates.size, byCategory };
  }
}

AdvancedWatermarkTemplates.initialize();
