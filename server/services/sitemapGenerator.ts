/**
 * SEO Sitemap Generator
 * Automatically generates sitemap.xml with breadcrumb schema integration
 * Helps search engines understand site structure and improve indexing
 */

import { Router } from 'express';

export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

export class SitemapGenerator {
  private entries: SitemapEntry[] = [];
  private baseUrl: string;

  constructor(baseUrl: string = 'https://www.rockinrockinboogie.com') {
    this.baseUrl = baseUrl;
    this.initializeDefaultEntries();
  }

  private initializeDefaultEntries(): void {
    // Home and main pages
    this.addEntry({
      url: '/',
      changefreq: 'weekly',
      priority: 1.0,
      lastmod: new Date().toISOString().split('T')[0]
    });

    // The Legacy section
    this.addEntry({
      url: '/rrb/the-legacy',
      changefreq: 'monthly',
      priority: 0.9,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'The Legacy', url: '/rrb/the-legacy' }
      ]
    });

    // Little Richard pages
    this.addEntry({
      url: '/rrb/little-richard-biography',
      changefreq: 'monthly',
      priority: 0.95,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'The Legacy', url: '/rrb/the-legacy' },
        { name: 'Little Richard Biography', url: '/rrb/little-richard-biography' }
      ]
    });

    this.addEntry({
      url: '/rrb/little-richard-discography',
      changefreq: 'monthly',
      priority: 0.95,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'The Legacy', url: '/rrb/the-legacy' },
        { name: 'Little Richard Discography', url: '/rrb/little-richard-discography' }
      ]
    });

    this.addEntry({
      url: '/rrb/little-richard-faq',
      changefreq: 'monthly',
      priority: 0.85,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'The Legacy', url: '/rrb/the-legacy' },
        { name: 'Little Richard FAQ', url: '/rrb/little-richard-faq' }
      ]
    });

    this.addEntry({
      url: '/rrb/little-richard-connection',
      changefreq: 'monthly',
      priority: 0.9,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'The Legacy', url: '/rrb/the-legacy' },
        { name: 'Little Richard Connection', url: '/rrb/little-richard-connection' }
      ]
    });

    // Music & Radio section
    this.addEntry({
      url: '/rrb/the-music',
      changefreq: 'weekly',
      priority: 0.95,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Music & Radio', url: '/rrb/the-music' }
      ]
    });

    this.addEntry({
      url: '/rrb/radio-station',
      changefreq: 'daily',
      priority: 0.95,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Music & Radio', url: '/rrb/the-music' },
        { name: 'Radio Station', url: '/rrb/radio-station' }
      ]
    });

    this.addEntry({
      url: '/rrb/dj-control',
      changefreq: 'daily',
      priority: 0.8,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Music & Radio', url: '/rrb/the-music' },
        { name: 'DJ Control', url: '/rrb/dj-control' }
      ]
    });

    this.addEntry({
      url: '/rrb/schedule',
      changefreq: 'daily',
      priority: 0.8,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Music & Radio', url: '/rrb/the-music' },
        { name: 'Schedule', url: '/rrb/schedule' }
      ]
    });

    // Family & Community section
    this.addEntry({
      url: '/rrb/family-tree-visualization',
      changefreq: 'monthly',
      priority: 0.85,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Community', url: '/rrb/family-tree-visualization' }
      ]
    });

    this.addEntry({
      url: '/rrb/grandma-helen',
      changefreq: 'monthly',
      priority: 0.8,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Community', url: '/rrb/family-tree-visualization' },
        { name: 'Grandma Helen', url: '/rrb/grandma-helen' }
      ]
    });

    this.addEntry({
      url: '/rrb/seabrun-whitney-hunter-sr',
      changefreq: 'monthly',
      priority: 0.8,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Community', url: '/rrb/family-tree-visualization' },
        { name: 'Seabrun Whitney Hunter Sr', url: '/rrb/seabrun-whitney-hunter-sr' }
      ]
    });

    // Studio & Production section
    this.addEntry({
      url: '/rrb/broadcast/admin',
      changefreq: 'weekly',
      priority: 0.8,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Studio', url: '/rrb/broadcast/admin' }
      ]
    });

    // Community section
    this.addEntry({
      url: '/rrb/sweet-miracles/fundraising',
      changefreq: 'weekly',
      priority: 0.85,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Community', url: '/rrb/sweet-miracles/fundraising' }
      ]
    });

    // Additional important pages
    this.addEntry({
      url: '/rrb/candy-through-the-years',
      changefreq: 'monthly',
      priority: 0.85,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'The Legacy', url: '/rrb/the-legacy' },
        { name: 'Candy Through the Years', url: '/rrb/candy-through-the-years' }
      ]
    });

    this.addEntry({
      url: '/rrb/poetry-hour',
      changefreq: 'weekly',
      priority: 0.75,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Community', url: '/rrb/poetry-hour' }
      ]
    });

    this.addEntry({
      url: '/rrb/proof-vault',
      changefreq: 'monthly',
      priority: 0.8,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'The Legacy', url: '/rrb/the-legacy' },
        { name: 'Proof Vault', url: '/rrb/proof-vault' }
      ]
    });
  }

  addEntry(entry: SitemapEntry): void {
    this.entries.push(entry);
  }

  addEntries(entries: SitemapEntry[]): void {
    this.entries.push(...entries);
  }

  generateXML(): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
                       '         xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"\n' +
                       '         xmlns:xhtml="http://www.w3.org/1999/xhtml"\n' +
                       '         xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"\n' +
                       '         xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n' +
                       '         xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n';

    const urlEntries = this.entries
      .map(entry => this.generateURLEntry(entry))
      .join('');

    const urlsetClose = '</urlset>';

    return xmlHeader + urlsetOpen + urlEntries + urlsetClose;
  }

  private generateURLEntry(entry: SitemapEntry): string {
    const fullUrl = `${this.baseUrl}${entry.url}`;
    const lastmod = entry.lastmod || new Date().toISOString().split('T')[0];
    const changefreq = entry.changefreq || 'monthly';
    const priority = entry.priority ?? 0.5;

    let xml = '  <url>\n';
    xml += `    <loc>${this.escapeXML(fullUrl)}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;

    // Add breadcrumb schema as extension
    if (entry.breadcrumbs && entry.breadcrumbs.length > 0) {
      xml += this.generateBreadcrumbExtension(entry.breadcrumbs);
    }

    xml += '  </url>\n';
    return xml;
  }

  private generateBreadcrumbExtension(breadcrumbs: Array<{ name: string; url: string }>): string {
    let xml = '    <breadcrumbs>\n';
    breadcrumbs.forEach((crumb, index) => {
      xml += `      <breadcrumb position="${index + 1}" name="${this.escapeXML(crumb.name)}" url="${this.escapeXML(`${this.baseUrl}${crumb.url}`)}" />\n`;
    });
    xml += '    </breadcrumbs>\n';
    return xml;
  }

  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  generateJSON(): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Rockin\' Rockin\' Boogie',
      url: this.baseUrl,
      description: 'A legacy restored — unified ecosystem of platforms, services, and autonomous intelligence',
      siteMap: {
        '@type': 'SiteMap',
        url: `${this.baseUrl}/sitemap.xml`,
        entries: this.entries.map(entry => ({
          url: `${this.baseUrl}${entry.url}`,
          lastmod: entry.lastmod,
          changefreq: entry.changefreq,
          priority: entry.priority,
          breadcrumbs: entry.breadcrumbs
        }))
      }
    };
  }

  getEntryCount(): number {
    return this.entries.length;
  }

  getEntries(): SitemapEntry[] {
    return [...this.entries];
  }
}

/**
 * Express middleware to serve sitemap.xml
 */
export function createSitemapRouter(baseUrl?: string): Router {
  const router = Router();
  const generator = new SitemapGenerator(baseUrl);

  router.get('/sitemap.xml', (req, res) => {
    res.header('Content-Type', 'application/xml');
    res.send(generator.generateXML());
  });

  router.get('/sitemap.json', (req, res) => {
    res.header('Content-Type', 'application/json');
    res.json(generator.generateJSON());
  });

  router.get('/sitemap/entries', (req, res) => {
    res.json({
      total: generator.getEntryCount(),
      entries: generator.getEntries()
    });
  });

  return router;
}

export default SitemapGenerator;
