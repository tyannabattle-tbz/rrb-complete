import { publicProcedure, router } from '../_core/trpc';
import { z } from 'zod';

/**
 * RSS Feed Router
 * Generates RSS feeds for podcast distribution to Apple Podcasts, Spotify, Google Podcasts, Amazon Music, and TuneIn
 */

export const rssFeedRouter = router({
  /**
   * Generate main RSS feed for all broadcasts
   */
  generateMainFeed: publicProcedure.query(async ({ ctx }) => {
    const now = new Date().toISOString();
    const baseUrl = process.env.VITE_APP_URL || 'https://manus.space';

    const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:itunes="http://www.itunes.com/dtds/podcast.dtd" xmlns:googleplay="http://www.google.com/schemas/play-podcasts/1.0">
  <channel>
    <title>Rockin Rockin Boogie - Legacy Radio</title>
    <link>${baseUrl}/rrb/radio-station</link>
    <description>Continuous Canryn Production Inc. &amp; Music Rotation - Preserving the legacy of Seabrun Candy Hunter through verified documentation, live radio broadcasting, healing music frequencies, and community empowerment. Powered by Canryn Production and Sweet Miracles — A Voice for the Voiceless.</description>
    <language>en-us</language>
    <copyright>© 2026 Canryn Production Inc. All rights reserved.</copyright>
    <lastBuildDate>${now}</lastBuildDate>
    <ttl>60</ttl>
    
    <!-- iTunes Podcast Specific Tags -->
    <itunes:author>Canryn Production Inc.</itunes:author>
    <itunes:owner>
      <itunes:name>Canryn Production Inc.</itunes:name>
      <itunes:email>info@canrynproduction.com</itunes:email>
    </itunes:owner>
    <itunes:explicit>false</itunes:explicit>
    <itunes:category text="Music"/>
    <itunes:category text="News &amp; Politics"/>
    <itunes:image href="${baseUrl}/rrb-logo-3000x3000.png"/>
    
    <!-- Google Play Podcasts Tags -->
    <googleplay:author>Canryn Production Inc.</googleplay:author>
    <googleplay:description>Continuous Canryn Production Inc. &amp; Music Rotation</googleplay:description>
    <googleplay:explicit>false</googleplay:explicit>
    <googleplay:category text="Music"/>
    <googleplay:image url="${baseUrl}/rrb-logo-3000x3000.png"/>
    
    <!-- Sample Episodes -->
    <item>
      <title>Morning Glory Gospel - RRB Gospel Choir</title>
      <description>A beautiful morning gospel performance featuring the RRB Gospel Choir. Tune in for uplifting music and spiritual messages.</description>
      <link>${baseUrl}/rrb/radio-station</link>
      <guid isPermaLink="false">episode-morning-glory-001</guid>
      <pubDate>Wed, 20 Feb 2026 06:00:00 GMT</pubDate>
      <itunes:duration>240</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
      <itunes:image href="${baseUrl}/rrb-logo-1400x1400.png"/>
      <enclosure url="${baseUrl}/api/audio/morning-glory-gospel.mp3" length="14400000" type="audio/mpeg"/>
      <content:encoded><![CDATA[<p>Morning Glory Gospel - RRB Gospel Choir</p><p>A beautiful morning gospel performance featuring the RRB Gospel Choir. Tune in for uplifting music and spiritual messages.</p>]]></content:encoded>
    </item>
    
    <item>
      <title>Soul Revival - Carlos Battle Legacy</title>
      <description>A soulful tribute to the Carlos Battle Legacy. Experience the power of soul music and cultural heritage.</description>
      <link>${baseUrl}/rrb/radio-station</link>
      <guid isPermaLink="false">episode-soul-revival-001</guid>
      <pubDate>Tue, 19 Feb 2026 12:00:00 GMT</pubDate>
      <itunes:duration>312</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
      <itunes:image href="${baseUrl}/rrb-logo-1400x1400.png"/>
      <enclosure url="${baseUrl}/api/audio/soul-revival.mp3" length="18720000" type="audio/mpeg"/>
      <content:encoded><![CDATA[<p>Soul Revival - Carlos Battle Legacy</p><p>A soulful tribute to the Carlos Battle Legacy. Experience the power of soul music and cultural heritage.</p>]]></content:encoded>
    </item>
    
    <item>
      <title>Healing Frequency 432Hz - QUMUS Wellness</title>
      <description>Experience the healing power of 432Hz frequency music. Perfect for meditation, relaxation, and wellness.</description>
      <link>${baseUrl}/rrb/radio-station</link>
      <guid isPermaLink="false">episode-healing-432-001</guid>
      <pubDate>Mon, 18 Feb 2026 18:00:00 GMT</pubDate>
      <itunes:duration>1800</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
      <itunes:image href="${baseUrl}/rrb-logo-1400x1400.png"/>
      <enclosure url="${baseUrl}/api/audio/healing-432hz.mp3" length="108000000" type="audio/mpeg"/>
      <content:encoded><![CDATA[<p>Healing Frequency 432Hz - QUMUS Wellness</p><p>Experience the healing power of 432Hz frequency music. Perfect for meditation, relaxation, and wellness.</p>]]></content:encoded>
    </item>
  </channel>
</rss>`;

    return {
      success: true,
      contentType: 'application/rss+xml',
      content: rssContent,
      url: `${baseUrl}/api/rss/broadcasts`,
    };
  }),

  /**
   * Generate Spotify-compatible RSS feed
   */
  generateSpotifyFeed: publicProcedure.query(async ({ ctx }) => {
    const now = new Date().toISOString();
    const baseUrl = process.env.VITE_APP_URL || 'https://manus.space';

    const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:spotify="http://www.spotify.com/ns/rss" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Rockin Rockin Boogie - Spotify</title>
    <link>${baseUrl}/rrb/radio-station</link>
    <description>Continuous Canryn Production Inc. &amp; Music Rotation</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <spotify:countryOfOrigin>US</spotify:countryOfOrigin>
    
    <item>
      <title>Morning Glory Gospel</title>
      <description>RRB Gospel Choir Performance</description>
      <link>${baseUrl}/rrb/radio-station</link>
      <guid>episode-spotify-001</guid>
      <pubDate>Wed, 20 Feb 2026 06:00:00 GMT</pubDate>
      <enclosure url="${baseUrl}/api/audio/morning-glory-gospel.mp3" type="audio/mpeg"/>
    </item>
  </channel>
</rss>`;

    return {
      success: true,
      contentType: 'application/rss+xml',
      content: rssContent,
      platform: 'Spotify',
      url: `${baseUrl}/api/rss/spotify`,
    };
  }),

  /**
   * Generate Google Podcasts-compatible RSS feed
   */
  generateGoogleFeed: publicProcedure.query(async ({ ctx }) => {
    const now = new Date().toISOString();
    const baseUrl = process.env.VITE_APP_URL || 'https://manus.space';

    const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:googleplay="http://www.google.com/schemas/play-podcasts/1.0">
  <channel>
    <title>Rockin Rockin Boogie - Google Podcasts</title>
    <link>${baseUrl}/rrb/radio-station</link>
    <description>Continuous Canryn Production Inc. &amp; Music Rotation</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <googleplay:author>Canryn Production Inc.</googleplay:author>
    <googleplay:category text="Music"/>
    <googleplay:explicit>false</googleplay:explicit>
    
    <item>
      <title>Morning Glory Gospel</title>
      <description>RRB Gospel Choir Performance</description>
      <link>${baseUrl}/rrb/radio-station</link>
      <guid>episode-google-001</guid>
      <pubDate>Wed, 20 Feb 2026 06:00:00 GMT</pubDate>
      <enclosure url="${baseUrl}/api/audio/morning-glory-gospel.mp3" type="audio/mpeg"/>
    </item>
  </channel>
</rss>`;

    return {
      success: true,
      contentType: 'application/rss+xml',
      content: rssContent,
      platform: 'Google Podcasts',
      url: `${baseUrl}/api/rss/google`,
    };
  }),

  /**
   * Generate Amazon Music-compatible RSS feed
   */
  generateAmazonFeed: publicProcedure.query(async ({ ctx }) => {
    const now = new Date().toISOString();
    const baseUrl = process.env.VITE_APP_URL || 'https://manus.space';

    const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Rockin Rockin Boogie - Amazon Music</title>
    <link>${baseUrl}/rrb/radio-station</link>
    <description>Continuous Canryn Production Inc. &amp; Music Rotation</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <copyright>© 2026 Canryn Production Inc.</copyright>
    
    <item>
      <title>Morning Glory Gospel</title>
      <description>RRB Gospel Choir Performance</description>
      <link>${baseUrl}/rrb/radio-station</link>
      <guid>episode-amazon-001</guid>
      <pubDate>Wed, 20 Feb 2026 06:00:00 GMT</pubDate>
      <enclosure url="${baseUrl}/api/audio/morning-glory-gospel.mp3" type="audio/mpeg"/>
    </item>
  </channel>
</rss>`;

    return {
      success: true,
      contentType: 'application/rss+xml',
      content: rssContent,
      platform: 'Amazon Music',
      url: `${baseUrl}/api/rss/amazon`,
    };
  }),

  /**
   * Get RSS feed submission URLs for all platforms
   */
  getSubmissionUrls: publicProcedure.query(async ({ ctx }) => {
    const baseUrl = process.env.VITE_APP_URL || 'https://manus.space';

    return {
      success: true,
      feeds: {
        main: `${baseUrl}/api/rss/broadcasts`,
        spotify: `${baseUrl}/api/rss/spotify`,
        googlePodcasts: `${baseUrl}/api/rss/google`,
        applePodcasts: `${baseUrl}/api/rss/broadcasts`, // Uses main feed
        amazonMusic: `${baseUrl}/api/rss/amazon`,
        tuneIn: `${baseUrl}/api/rss/broadcasts`, // Uses main feed
      },
      submissionGuide: {
        applePodcasts: {
          url: 'https://podcastsconnect.apple.com',
          steps: [
            'Log into Apple Podcasts Connect with your Apple ID',
            'Click "Add a Show"',
            'Paste the RSS feed URL above',
            'Verify your show details and artwork',
            'Submit for review (typically 24-48 hours)',
          ],
        },
        spotify: {
          url: 'https://podcasters.spotify.com',
          steps: [
            'Log into Spotify for Podcasters',
            'Click "Add a show"',
            'Paste the RSS feed URL above',
            'Verify your show details',
            'Submit for distribution',
          ],
        },
        googlePodcasts: {
          url: 'https://podcasts.google.com/podcasts/new',
          steps: [
            'Visit Google Podcasts Manager',
            'Paste the RSS feed URL above',
            'Verify your show details',
            'Submit for indexing',
          ],
        },
        amazonMusic: {
          url: 'https://musicforpodcasters.amazon.com',
          steps: [
            'Log into Amazon Music for Podcasters',
            'Click "Add a show"',
            'Paste the RSS feed URL above',
            'Verify your show details',
            'Submit for distribution',
          ],
        },
        tuneIn: {
          url: 'https://tunein.com/podcasters',
          steps: [
            'Log into TuneIn Podcasters',
            'Click "Add a podcast"',
            'Paste the RSS feed URL above',
            'Verify your show details',
            'Submit for distribution',
          ],
        },
      },
    };
  }),
});
