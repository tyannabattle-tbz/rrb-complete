import { publicProcedure, router } from '../_core/trpc';

/**
 * Sitemap Router - Generates XML sitemaps for search engine indexing
 * Supports multiple sitemap types: main, broadcasts, channels, archives
 */

export const sitemapRouter = router({
  /**
   * Main sitemap index - references all other sitemaps
   */
  mainSitemap: publicProcedure.query(async () => {
    const baseUrl = 'https://www.rockinrockinboogie.com';
    const now = new Date().toISOString().split('T')[0];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-pages.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-broadcasts.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-channels.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-archives.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;

    return { xml, contentType: 'application/xml' };
  }),

  /**
   * Pages sitemap - Main pages and routes
   */
  pagesSitemap: publicProcedure.query(async () => {
    const baseUrl = 'https://www.rockinrockinboogie.com';
    const now = new Date().toISOString().split('T')[0];

    const pages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/rrb', priority: '0.9', changefreq: 'daily' },
      { path: '/rrb/radio-station', priority: '1.0', changefreq: 'hourly' },
      { path: '/rrb/poetry-station', priority: '0.8', changefreq: 'daily' },
      { path: '/rrb/healing-frequencies', priority: '0.8', changefreq: 'daily' },
      { path: '/rrb/about', priority: '0.7', changefreq: 'monthly' },
      { path: '/rrb/contact', priority: '0.7', changefreq: 'monthly' },
      { path: '/rrb/archive', priority: '0.8', changefreq: 'daily' },
      { path: '/rrb/proof-vault', priority: '0.8', changefreq: 'weekly' },
      { path: '/rrb/merchandise', priority: '0.8', changefreq: 'weekly' },
    ];

    const urlEntries = pages
      .map(
        (page) => `  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
      )
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

    return { xml, contentType: 'application/xml' };
  }),

  /**
   * Broadcasts sitemap - Dynamic broadcast pages
   */
  broadcastsSitemap: publicProcedure.query(async ({ ctx }) => {
    const baseUrl = 'https://www.rockinrockinboogie.com';
    const now = new Date().toISOString().split('T')[0];

    // Get broadcasts from database
    const broadcasts = await ctx.db.query.broadcasts
      .findMany({
        limit: 50000, // Google sitemap limit
      })
      .catch(() => []);

    const urlEntries = broadcasts
      .map(
        (broadcast: any) => `  <url>
    <loc>${baseUrl}/rrb/broadcast/${broadcast.id}</loc>
    <lastmod>${broadcast.updatedAt?.toISOString().split('T')[0] || now}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.7</priority>
  </url>`
      )
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

    return { xml, contentType: 'application/xml' };
  }),

  /**
   * Channels sitemap - Radio channels and streams
   */
  channelsSitemap: publicProcedure.query(async ({ ctx }) => {
    const baseUrl = 'https://www.rockinrockinboogie.com';
    const now = new Date().toISOString().split('T')[0];

    // Get streaming channels from database
    const channels = await ctx.db.query.streamingChannels
      .findMany({
        limit: 50000,
      })
      .catch(() => []);

    const urlEntries = channels
      .map(
        (channel: any) => `  <url>
    <loc>${baseUrl}/rrb/channel/${channel.id}</loc>
    <lastmod>${channel.updatedAt?.toISOString().split('T')[0] || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      )
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

    return { xml, contentType: 'application/xml' };
  }),

  /**
   * Archives sitemap - Broadcast archives and VOD
   */
  archivesSitemap: publicProcedure.query(async ({ ctx }) => {
    const baseUrl = 'https://www.rockinrockinboogie.com';
    const now = new Date().toISOString().split('T')[0];

    // Get archived broadcasts from database
    const archives = await ctx.db.query.broadcastArchives
      .findMany({
        limit: 50000,
      })
      .catch(() => []);

    const urlEntries = archives
      .map(
        (archive: any) => `  <url>
    <loc>${baseUrl}/rrb/archive/${archive.id}</loc>
    <lastmod>${archive.createdAt?.toISOString().split('T')[0] || now}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.6</priority>
  </url>`
      )
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

    return { xml, contentType: 'application/xml' };
  }),
});
