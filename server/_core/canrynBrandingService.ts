export interface CompanyInfo {
  name: string;
  tagline: string;
  description: string;
  founded: number;
  headquarters: string;
  website: string;
  logo: string;
  colors: { primary: string; secondary: string; accent: string };
}

export interface Subsidiary {
  id: string;
  name: string;
  description: string;
  focus: string;
  website?: string;
  logo?: string;
}

export interface BrandAsset {
  assetId: string;
  type: 'logo' | 'color' | 'font' | 'guideline' | 'template';
  name: string;
  url: string;
  version: string;
}

export class CanrynBrandingService {
  private static company: CompanyInfo = {
    name: 'Canryn Production',
    tagline: 'Empowering Creators, Building Wealth',
    description: 'Canryn Production and its subsidiaries create innovative video generation and distribution platforms for creators worldwide.',
    founded: 2024,
    headquarters: 'Global',
    website: 'https://canrynproduction.com',
    logo: 'https://cdn.canrynproduction.com/logo.svg',
    colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#EC4899',
    },
  };

  private static subsidiaries: Subsidiary[] = [
    {
      id: 'qumus',
      name: 'Qumus',
      description: 'Advanced video generation and distribution platform',
      focus: 'Video Creation & Distribution',
      website: 'https://qumus.canrynproduction.com',
    },
    {
      id: 'nexus',
      name: 'Nexus',
      description: 'Creator collaboration and monetization hub',
      focus: 'Creator Economy',
      website: 'https://nexus.canrynproduction.com',
    },
    {
      id: 'forge',
      name: 'Forge',
      description: 'AI-powered content generation engine',
      focus: 'AI & Automation',
      website: 'https://forge.canrynproduction.com',
    },
    {
      id: 'atlas',
      name: 'Atlas',
      description: 'Global distribution and analytics network',
      focus: 'Distribution & Analytics',
      website: 'https://atlas.canrynproduction.com',
    },
  ];

  private static brandAssets: BrandAsset[] = [
    {
      assetId: 'logo-primary',
      type: 'logo',
      name: 'Canryn Primary Logo',
      url: 'https://cdn.canrynproduction.com/logo-primary.svg',
      version: '1.0',
    },
    {
      assetId: 'color-primary',
      type: 'color',
      name: 'Primary Blue',
      url: '#3B82F6',
      version: '1.0',
    },
    {
      assetId: 'font-primary',
      type: 'font',
      name: 'Inter',
      url: 'https://fonts.google.com/specimen/Inter',
      version: '1.0',
    },
  ];

  static getCompanyInfo(): CompanyInfo {
    return this.company;
  }

  static getSubsidiaries(): Subsidiary[] {
    return this.subsidiaries;
  }

  static getSubsidiary(id: string): Subsidiary | null {
    return this.subsidiaries.find(s => s.id === id) || null;
  }

  static getBrandAssets(type?: BrandAsset['type']): BrandAsset[] {
    return type ? this.brandAssets.filter(a => a.type === type) : this.brandAssets;
  }

  static getBrandingFooter(): string {
    return `© ${new Date().getFullYear()} Canryn Production and its subsidiaries. All rights reserved.`;
  }

  static getBrandingDisclaimer(): string {
    return `This platform is powered by Canryn Production, a leader in video generation and creator economy solutions. Canryn Production operates multiple subsidiaries including Qumus, Nexus, Forge, and Atlas.`;
  }

  static getComplianceInfo() {
    return {
      company: 'Canryn Production',
      subsidiaries: this.subsidiaries.map(s => s.name),
      privacyPolicy: 'https://canrynproduction.com/privacy',
      termsOfService: 'https://canrynproduction.com/terms',
      contactEmail: 'legal@canrynproduction.com',
      dataProtection: 'GDPR, CCPA Compliant',
    };
  }

  static generateBrandedContent(contentType: 'email' | 'social' | 'web' | 'app'): string {
    const footer = this.getBrandingFooter();
    const disclaimer = this.getBrandingDisclaimer();
    return `${disclaimer}\n\n${footer}`;
  }
}
