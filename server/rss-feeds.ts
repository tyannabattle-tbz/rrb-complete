/**
 * RSS Feed Endpoints for RRB Ecosystem
 * 
 * Generates Apple Podcasts / Spotify / Google Podcasts compatible RSS feeds
 * for podcast, news, and radio programming.
 * 
 * Endpoints:
 *   GET /api/rss/podcast  — Podcast RSS (iTunes/Spotify compatible)
 *   GET /api/rss/news     — News/Blog RSS
 *   GET /api/rss/radio    — Radio Programming RSS
 *   GET /api/rss/opml     — OPML directory of all feeds
 */

import { Express, Request, Response } from "express";

const SITE_URL = "https://www.rockinrockinboogie.com";
const SITE_TITLE = "Rockin' Rockin' Boogie";
const SITE_DESCRIPTION = "A legacy restored — unified ecosystem of platforms, services, and autonomous intelligence. Preserving the legacy of Seabrun Candy Hunter and Little Richard.";
const AUTHOR = "Canryn Production";
const OWNER_NAME = "Ty Bat Zan";
const OWNER_EMAIL = "info@canrynproduction.com";
const PODCAST_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/lQQnqXhOzXFMQWMX.png";
const COPYRIGHT = `© ${new Date().getFullYear()} Canryn Production and its subsidiaries. All rights reserved.`;

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function formatRFC822(date: Date): string {
  return date.toUTCString();
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Podcast Episodes ─────────────────────────────────────────────
const podcastEpisodes = [
  {
    id: "1", title: "Episode 1: The Beginning — Seabrun's Journey",
    description: "In this inaugural episode, we explore the early life of Seabrun Candy Hunter and how he became involved with Little Richard. From the streets of Georgia to the stages of the world, this is where the legacy began.",
    audioUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3",
    videoUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/cfWvEqBGZbBnvEIe.mp4",
    duration: 330, publishedAt: new Date("2024-01-15T12:00:00Z"), episodeNumber: 1, season: 1, fileSize: 5280000, mimeType: "audio/mpeg",
  },
  {
    id: "2", title: "Episode 2: The Music — Recordings & Performances",
    description: "Deep dive into the recordings, performances, and musical contributions of Seabrun Candy Hunter. The songs that defined an era.",
    audioUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/zByVVlWeoYCaITZI.mp3",
    videoUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/cfWvEqBGZbBnvEIe.mp4",
    duration: 372, publishedAt: new Date("2024-01-22T12:00:00Z"), episodeNumber: 2, season: 1, fileSize: 5952000, mimeType: "audio/mpeg",
  },
  {
    id: "3", title: "Episode 3: The Archive — Proof & Documentation",
    description: "Exploring the archival evidence, documentation, and verification of Seabrun's contributions to music history.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: 600, publishedAt: new Date("2024-01-29T12:00:00Z"), episodeNumber: 3, season: 1, fileSize: 9600000, mimeType: "audio/mpeg",
  },
  {
    id: "4", title: "Episode 4: Sweet Miracles — Voice for the Voiceless",
    description: "The story behind the Sweet Miracles Foundation 501(c)(3) / 508(c), its mission of legacy recovery, community empowerment, and the 'Voice for the Voiceless' initiative.",
    audioUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3",
    duration: 420, publishedAt: new Date("2024-02-05T12:00:00Z"), episodeNumber: 4, season: 1, fileSize: 6720000, mimeType: "audio/mpeg",
  },
  {
    id: "5", title: "Episode 5: HybridCast — Emergency Broadcast for the Community",
    description: "How HybridCast provides resilient emergency communications with offline-first architecture, mesh networking, and community-first design.",
    audioUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/zByVVlWeoYCaITZI.mp3",
    duration: 480, publishedAt: new Date("2024-02-12T12:00:00Z"), episodeNumber: 5, season: 1, fileSize: 7680000, mimeType: "audio/mpeg",
  },
  {
    id: "6", title: "Episode 6: QUMUS — The Autonomous Brain Behind It All",
    description: "Meet QUMUS, the autonomous orchestration engine running 90%+ of all platform operations. How AI manages radio, podcasts, grants, commercials, and emergency broadcasts 24/7.",
    audioUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3",
    duration: 540, publishedAt: new Date("2024-02-19T12:00:00Z"), episodeNumber: 6, season: 1, fileSize: 8640000, mimeType: "audio/mpeg",
  },
];

// ─── News Items ───────────────────────────────────────────────────
const newsItems = [
  { title: "RRB Ecosystem Launches with Full QUMUS Autonomous Control", description: "The Rockin' Rockin' Boogie ecosystem is now live with 90%+ autonomous operations managed by QUMUS, featuring 7-channel radio, podcast network, and HybridCast emergency broadcast.", link: `${SITE_URL}/rrb/news`, pubDate: new Date("2026-02-10T12:00:00Z"), category: "Platform Launch" },
  { title: "Sweet Miracles Foundation Receives 501(c)(3) / 508(c) Designation", description: "The Sweet Miracles Foundation has been officially recognized as a 501(c)(3) / 508(c) nonprofit organization, enabling tax-deductible donations for legacy recovery and community empowerment.", link: `${SITE_URL}/sweet-miracles`, pubDate: new Date("2026-01-15T12:00:00Z"), category: "Nonprofit" },
  { title: "HybridCast Emergency Broadcast System Goes Live", description: "HybridCast, the offline-first emergency broadcast PWA with mesh networking capabilities, is now operational.", link: `${SITE_URL}/hybridcast`, pubDate: new Date("2026-01-20T12:00:00Z"), category: "Emergency Services" },
  { title: "Grant Discovery Engine Finds $700,000 in Funding Opportunities", description: "The QUMUS-powered grant discovery engine has identified over $700,000 in potential funding for Sweet Miracles Foundation and Canryn Production.", link: `${SITE_URL}/rrb/sweet-miracles/fundraising`, pubDate: new Date("2026-02-05T12:00:00Z"), category: "Fundraising" },
  { title: "Solbones 4+3+2 Sacred Math Dice Game Now Available", description: "Play Solbones, the Solfeggio frequency-based dice game with multiplayer support and QUMUS AI opponents.", link: `${SITE_URL}/solbones`, pubDate: new Date("2026-02-01T12:00:00Z"), category: "Entertainment" },
  { title: "Seabrun Candy Hunter Legacy Archive Expanded", description: "New archival materials, verified sources, and documentation have been added to the Proof Vault.", link: `${SITE_URL}/rrb/proof-vault`, pubDate: new Date("2026-01-25T12:00:00Z"), category: "Legacy" },
  { title: "7-Channel Radio Station Broadcasting 24/7 at 432Hz", description: "All seven radio channels are now broadcasting around the clock with content tuned to 432Hz healing frequency.", link: `${SITE_URL}/rrb/radio-station`, pubDate: new Date("2026-01-30T12:00:00Z"), category: "Radio" },
];

// ─── Radio Channels ───────────────────────────────────────────────
const radioChannels = [
  { name: "RRB Original", description: "The original Rockin' Rockin' Boogie sound — Seabrun Candy Hunter and Little Richard classics", frequency: "432Hz", genre: "Rock & Roll / R&B" },
  { name: "RRB Gospel", description: "Gospel music celebrating faith and the spiritual roots of rock and roll", frequency: "432Hz", genre: "Gospel" },
  { name: "RRB Blues", description: "Deep blues from the roots of American music", frequency: "432Hz", genre: "Blues" },
  { name: "RRB Rock", description: "Classic rock and roll — the sound that changed the world", frequency: "432Hz", genre: "Rock" },
  { name: "RRB Jazz", description: "Smooth jazz and improvisational classics", frequency: "432Hz", genre: "Jazz" },
  { name: "RRB Classical", description: "Classical compositions and orchestral arrangements", frequency: "432Hz", genre: "Classical" },
  { name: "RRB Healing Frequencies", description: "Solfeggio frequencies and healing tones for meditation and wellness", frequency: "Various", genre: "Healing / Meditation" },
];

// ─── Podcast RSS Feed (iTunes/Spotify Compatible) ─────────────────
function generatePodcastRSS(): string {
  const lastBuildDate = formatRFC822(new Date());
  const items = podcastEpisodes
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .map((ep) => `    <item>
      <title>${escapeXml(ep.title)}</title>
      <description><![CDATA[${ep.description}]]></description>
      <link>${SITE_URL}/rrb/podcast-and-video</link>
      <guid isPermaLink="false">rrb-podcast-s${ep.season}e${ep.episodeNumber}</guid>
      <pubDate>${formatRFC822(ep.publishedAt)}</pubDate>
      <enclosure url="${ep.audioUrl}" length="${ep.fileSize}" type="${ep.mimeType}" />
      <itunes:title>${escapeXml(ep.title)}</itunes:title>
      <itunes:summary><![CDATA[${ep.description}]]></itunes:summary>
      <itunes:duration>${formatDuration(ep.duration)}</itunes:duration>
      <itunes:episode>${ep.episodeNumber}</itunes:episode>
      <itunes:season>${ep.season}</itunes:season>
      <itunes:episodeType>full</itunes:episodeType>
      <itunes:author>${escapeXml(AUTHOR)}</itunes:author>
      <itunes:explicit>false</itunes:explicit>${ep.videoUrl ? `\n      <media:content url="${ep.videoUrl}" type="video/mp4" medium="video" />` : ""}
    </item>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:podcast="https://podcastindex.org/namespace/1.0">
  <channel>
    <title>${escapeXml(SITE_TITLE)} Podcast</title>
    <link>${SITE_URL}/rrb/podcast-and-video</link>
    <description><![CDATA[${SITE_DESCRIPTION}]]></description>
    <language>en-us</language>
    <copyright>${escapeXml(COPYRIGHT)}</copyright>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/api/rss/podcast" rel="self" type="application/rss+xml" />
    <image>
      <url>${PODCAST_IMAGE}</url>
      <title>${escapeXml(SITE_TITLE)} Podcast</title>
      <link>${SITE_URL}/rrb/podcast-and-video</link>
    </image>
    <itunes:author>${escapeXml(AUTHOR)}</itunes:author>
    <itunes:summary><![CDATA[Exploring the legacy of Seabrun Candy Hunter and Little Richard through music, history, and archival stories. Produced by Canryn Production.]]></itunes:summary>
    <itunes:owner>
      <itunes:name>${escapeXml(OWNER_NAME)}</itunes:name>
      <itunes:email>${escapeXml(OWNER_EMAIL)}</itunes:email>
    </itunes:owner>
    <itunes:image href="${PODCAST_IMAGE}" />
    <itunes:category text="Music">
      <itunes:category text="Music History" />
    </itunes:category>
    <itunes:category text="Society &amp; Culture">
      <itunes:category text="Documentary" />
    </itunes:category>
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>episodic</itunes:type>
    <podcast:locked>no</podcast:locked>
    <podcast:funding url="${SITE_URL}/donate">Support Sweet Miracles Foundation</podcast:funding>
${items}
  </channel>
</rss>`;
}

// ─── News RSS Feed ────────────────────────────────────────────────
function generateNewsRSS(): string {
  const lastBuildDate = formatRFC822(new Date());
  const items = newsItems
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .map((item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <description><![CDATA[${item.description}]]></description>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <pubDate>${formatRFC822(item.pubDate)}</pubDate>
      <category>${escapeXml(item.category)}</category>
      <author>${escapeXml(OWNER_EMAIL)} (${escapeXml(AUTHOR)})</author>
    </item>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(SITE_TITLE)} — News &amp; Updates</title>
    <link>${SITE_URL}/rrb/news</link>
    <description><![CDATA[Latest news, milestones, and updates from the Rockin' Rockin' Boogie ecosystem — Canryn Production and its subsidiaries.]]></description>
    <language>en-us</language>
    <copyright>${escapeXml(COPYRIGHT)}</copyright>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/api/rss/news" rel="self" type="application/rss+xml" />
    <image>
      <url>${PODCAST_IMAGE}</url>
      <title>${escapeXml(SITE_TITLE)} News</title>
      <link>${SITE_URL}/rrb/news</link>
    </image>
    <managingEditor>${escapeXml(OWNER_EMAIL)} (${escapeXml(AUTHOR)})</managingEditor>
    <webMaster>${escapeXml(OWNER_EMAIL)} (${escapeXml(OWNER_NAME)})</webMaster>
${items}
  </channel>
</rss>`;
}

// ─── Radio Programming RSS Feed ──────────────────────────────────
function generateRadioRSS(): string {
  const lastBuildDate = formatRFC822(new Date());
  const items = radioChannels
    .map((ch) => `    <item>
      <title>${escapeXml(ch.name)}</title>
      <description><![CDATA[${ch.description}. Broadcasting at ${ch.frequency}. Genre: ${ch.genre}.]]></description>
      <link>${SITE_URL}/rrb/radio-station</link>
      <guid isPermaLink="false">rrb-radio-${ch.name.toLowerCase().replace(/\s+/g, "-")}</guid>
      <pubDate>${lastBuildDate}</pubDate>
      <category>${escapeXml(ch.genre)}</category>
    </item>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)} — Radio Programming</title>
    <link>${SITE_URL}/rrb/radio-station</link>
    <description><![CDATA[7-channel internet radio broadcasting 24/7 at 432Hz. Featuring original recordings, gospel, blues, rock, jazz, classical, and healing frequencies. Powered by QUMUS autonomous orchestration.]]></description>
    <language>en-us</language>
    <copyright>${escapeXml(COPYRIGHT)}</copyright>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/api/rss/radio" rel="self" type="application/rss+xml" />
    <image>
      <url>${PODCAST_IMAGE}</url>
      <title>${escapeXml(SITE_TITLE)} Radio</title>
      <link>${SITE_URL}/rrb/radio-station</link>
    </image>
    <managingEditor>${escapeXml(OWNER_EMAIL)} (${escapeXml(AUTHOR)})</managingEditor>
${items}
  </channel>
</rss>`;
}

// ─── Register Routes ──────────────────────────────────────────────
export function registerRSSRoutes(app: Express): void {
  app.get("/api/rss/podcast", (_req: Request, res: Response) => {
    res.set("Content-Type", "application/rss+xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=3600");
    res.send(generatePodcastRSS());
  });

  app.get("/api/rss/news", (_req: Request, res: Response) => {
    res.set("Content-Type", "application/rss+xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=1800");
    res.send(generateNewsRSS());
  });

  app.get("/api/rss/radio", (_req: Request, res: Response) => {
    res.set("Content-Type", "application/rss+xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=3600");
    res.send(generateRadioRSS());
  });

  app.get("/api/rss/opml", (_req: Request, res: Response) => {
    res.set("Content-Type", "text/x-opml; charset=utf-8");
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>${escapeXml(SITE_TITLE)} RSS Feeds</title>
    <dateCreated>${formatRFC822(new Date())}</dateCreated>
    <ownerName>${escapeXml(OWNER_NAME)}</ownerName>
  </head>
  <body>
    <outline text="Podcast" type="rss" xmlUrl="${SITE_URL}/api/rss/podcast" htmlUrl="${SITE_URL}/rrb/podcast-and-video" />
    <outline text="News" type="rss" xmlUrl="${SITE_URL}/api/rss/news" htmlUrl="${SITE_URL}/rrb/news" />
    <outline text="Radio" type="rss" xmlUrl="${SITE_URL}/api/rss/radio" htmlUrl="${SITE_URL}/rrb/radio-station" />
  </body>
</opml>`);
  });

  console.log("[RSS Feeds] Registered: /api/rss/podcast, /api/rss/news, /api/rss/radio, /api/rss/opml");
}
