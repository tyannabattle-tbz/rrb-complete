/**
 * Podcast RSS Feed Generator
 * 
 * Generates valid RSS 2.0 XML with iTunes podcast namespace tags
 * for each podcast show. Enables subscription in Apple Podcasts,
 * Spotify, Overcast, and any podcast app.
 * 
 * A Canryn Production
 */
import type { Express, Request, Response } from 'express';
import { getDb } from '../db';
import { podcastShows, podcastEpisodes } from '../../drizzle/schema';
import { eq, desc, and } from 'drizzle-orm';

// ─── XML Escape Helper ───────────────────────────────────
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ─── Duration Formatter (seconds → HH:MM:SS) ────────────
function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '00:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ─── RFC 2822 Date Formatter ─────────────────────────────
function toRfc2822(timestamp: number | null): string {
  if (!timestamp) return new Date().toUTCString();
  return new Date(timestamp).toUTCString();
}

// ─── Show Metadata Mapping ───────────────────────────────
const showMetadata: Record<string, {
  author: string;
  category: string;
  subcategory?: string;
  imageUrl: string;
  language: string;
  explicit: boolean;
  copyright: string;
  ownerName: string;
  ownerEmail: string;
}> = {
  'candys-corner': {
    author: 'Candy — Canryn Production',
    category: 'Society &amp; Culture',
    subcategory: 'Personal Journals',
    imageUrl: '/podcast-covers/candys-corner.jpg',
    language: 'en-us',
    explicit: false,
    copyright: '© 2025 Canryn Production and its subsidiaries. All rights reserved.',
    ownerName: 'Canryn Production',
    ownerEmail: 'podcasts@canrynproduction.com',
  },
  'solbones': {
    author: 'Seraph AI — Canryn Production',
    category: 'Leisure',
    subcategory: 'Games',
    imageUrl: '/podcast-covers/solbones-podcast.jpg',
    language: 'en-us',
    explicit: false,
    copyright: '© 2025 Canryn Production and its subsidiaries. All rights reserved.',
    ownerName: 'Canryn Production',
    ownerEmail: 'podcasts@canrynproduction.com',
  },
  'around-the-qumunity': {
    author: 'Valanna AI — Canryn Production',
    category: 'Technology',
    subcategory: 'Tech News',
    imageUrl: '/podcast-covers/around-the-qumunity.jpg',
    language: 'en-us',
    explicit: false,
    copyright: '© 2025 Canryn Production and its subsidiaries. All rights reserved.',
    ownerName: 'Canryn Production',
    ownerEmail: 'podcasts@canrynproduction.com',
  },
};

// ─── Generate RSS XML ────────────────────────────────────
async function generateRssFeed(slug: string, baseUrl: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  // Get show
  const [show] = await db
    .select()
    .from(podcastShows)
    .where(eq(podcastShows.slug, slug))
    .limit(1);

  if (!show) return null;

  // Get published episodes
  const episodes = await db
    .select()
    .from(podcastEpisodes)
    .where(and(
      eq(podcastEpisodes.showId, show.id),
      eq(podcastEpisodes.status, 'published'),
    ))
    .orderBy(desc(podcastEpisodes.publishedAt))
    .limit(100);

  const meta = showMetadata[slug] || showMetadata['candys-corner'];
  const feedUrl = `${baseUrl}/api/podcasts/${slug}/feed.xml`;
  const siteUrl = `${baseUrl}/podcasts`;
  const imageUrl = meta.imageUrl.startsWith('http') ? meta.imageUrl : `${baseUrl}${meta.imageUrl}`;

  // Build RSS XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:podcast="https://podcastindex.org/namespace/1.0">
  <channel>
    <title>${escapeXml(show.title)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(show.description || `${show.title} — A Canryn Production podcast`)}</description>
    <language>${meta.language}</language>
    <copyright>${meta.copyright}</copyright>
    <lastBuildDate>${toRfc2822(Date.now())}</lastBuildDate>
    <generator>QUMUS Podcast Engine — Canryn Production</generator>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />

    <itunes:author>${meta.author}</itunes:author>
    <itunes:summary>${escapeXml(show.description || show.title)}</itunes:summary>
    <itunes:type>episodic</itunes:type>
    <itunes:owner>
      <itunes:name>${meta.ownerName}</itunes:name>
      <itunes:email>${meta.ownerEmail}</itunes:email>
    </itunes:owner>
    <itunes:image href="${imageUrl}" />
    <itunes:category text="${meta.category}"${meta.subcategory ? `>
      <itunes:category text="${meta.subcategory}" />
    </itunes:category` : ' /'}>
    <itunes:explicit>${meta.explicit ? 'true' : 'false'}</itunes:explicit>

    <image>
      <url>${imageUrl}</url>
      <title>${escapeXml(show.title)}</title>
      <link>${siteUrl}</link>
    </image>
`;

  // Add episodes
  for (const ep of episodes) {
    const audioUrl = ep.audioUrl || '';
    const pubDate = toRfc2822(ep.publishedAt);
    const duration = formatDuration(ep.duration);
    const episodeUrl = `${baseUrl}/podcast/${slug}/episode/${ep.id}`;
    const guid = `canryn-${slug}-ep-${ep.id}`;
    const fileSize = ep.fileSize || 0;
    const mimeType = audioUrl.includes('.mp4') ? 'audio/mp4' :
                     audioUrl.includes('.mp3') ? 'audio/mpeg' :
                     'audio/webm';

    xml += `
    <item>
      <title>${escapeXml(ep.title)}</title>
      <description>${escapeXml(ep.description || '')}</description>
      <link>${episodeUrl}</link>
      <guid isPermaLink="false">${guid}</guid>
      <pubDate>${pubDate}</pubDate>
      <enclosure url="${escapeXml(audioUrl)}" length="${fileSize}" type="${mimeType}" />
      <itunes:title>${escapeXml(ep.title)}</itunes:title>
      <itunes:summary>${escapeXml(ep.description || '')}</itunes:summary>
      <itunes:duration>${duration}</itunes:duration>
      <itunes:episode>${ep.episodeNumber || 1}</itunes:episode>
      <itunes:season>${ep.seasonNumber || 1}</itunes:season>
      <itunes:episodeType>full</itunes:episodeType>
      <itunes:explicit>${meta.explicit ? 'true' : 'false'}</itunes:explicit>
    </item>`;
  }

  xml += `
  </channel>
</rss>`;

  return xml;
}

// ─── Register RSS Routes ─────────────────────────────────
export function registerPodcastRssRoutes(app: Express) {
  // RSS feed endpoint: /api/podcasts/:slug/feed.xml
  app.get('/api/podcasts/:slug/feed.xml', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const protocol = req.protocol;
      const host = req.get('host') || 'localhost:3000';
      const baseUrl = `${protocol}://${host}`;

      const xml = await generateRssFeed(slug, baseUrl);

      if (!xml) {
        return res.status(404).type('text/plain').send('Podcast not found');
      }

      res.set({
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300', // 5 min cache
        'X-Powered-By': 'QUMUS Podcast Engine',
      });
      res.send(xml);

      console.log(`[RSS] Served feed for ${slug}`);
    } catch (error) {
      console.error('[RSS] Feed generation error:', error);
      res.status(500).type('text/plain').send('Feed generation failed');
    }
  });

  // OPML export — all shows in one file
  app.get('/api/podcasts/opml', async (req: Request, res: Response) => {
    try {
      const db = await getDb();
      if (!db) return res.status(500).send('Database unavailable');

      const protocol = req.protocol;
      const host = req.get('host') || 'localhost:3000';
      const baseUrl = `${protocol}://${host}`;

      const shows = await db
        .select()
        .from(podcastShows)
        .where(eq(podcastShows.isActive, 1));

      let opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Canryn Production Podcasts</title>
    <dateCreated>${new Date().toUTCString()}</dateCreated>
    <ownerName>Canryn Production</ownerName>
  </head>
  <body>
    <outline text="Canryn Production Podcasts">`;

      for (const show of shows) {
        opml += `
      <outline type="rss" text="${escapeXml(show.title)}" xmlUrl="${baseUrl}/api/podcasts/${show.slug}/feed.xml" htmlUrl="${baseUrl}/podcasts" />`;
      }

      opml += `
    </outline>
  </body>
</opml>`;

      res.set({
        'Content-Type': 'text/x-opml; charset=utf-8',
        'Content-Disposition': 'attachment; filename="canryn-production-podcasts.opml"',
      });
      res.send(opml);
    } catch (error) {
      console.error('[OPML] Generation error:', error);
      res.status(500).send('OPML generation failed');
    }
  });

  console.log('[RSS] Podcast RSS feed routes registered');
}
