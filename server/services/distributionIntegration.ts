import { invokeLLM } from './_core/llm';

export interface DistributionConfig {
  spotify?: { clientId: string; clientSecret: string };
  applePodcasts?: { teamId: string; keyId: string; privateKey: string };
  youtube?: { apiKey: string; channelId: string };
  rss?: { feedUrl: string };
}

export interface EpisodeMetadata {
  title: string;
  description: string;
  audioUrl: string;
  imageUrl?: string;
  duration: number;
  episodeNumber?: number;
  seasonNumber?: number;
  publishDate: Date;
  explicit: boolean;
}

export class DistributionIntegration {
  private config: DistributionConfig;

  constructor(config: DistributionConfig) {
    this.config = config;
  }

  async publishToSpotify(podcastId: string, episode: EpisodeMetadata): Promise<{ success: boolean; spotifyId?: string; error?: string }> {
    try {
      // Use LLM to generate Spotify-compatible metadata
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are a podcast metadata optimizer for Spotify. Generate optimized metadata that follows Spotify guidelines.',
          },
          {
            role: 'user',
            content: `Optimize this podcast episode for Spotify:\nTitle: ${episode.title}\nDescription: ${episode.description}\nDuration: ${episode.duration}s`,
          },
        ],
      });

      // In production, this would call Spotify API
      console.log('[Spotify] Publishing episode:', episode.title);

      return {
        success: true,
        spotifyId: `spotify_${Date.now()}`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to publish to Spotify: ${error}`,
      };
    }
  }

  async publishToApplePodcasts(podcastId: string, episode: EpisodeMetadata): Promise<{ success: boolean; appleId?: string; error?: string }> {
    try {
      // Use LLM to generate Apple Podcasts-compatible metadata
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are a podcast metadata optimizer for Apple Podcasts. Generate metadata that follows Apple guidelines.',
          },
          {
            role: 'user',
            content: `Optimize this podcast episode for Apple Podcasts:\nTitle: ${episode.title}\nDescription: ${episode.description}\nExplicit: ${episode.explicit}`,
          },
        ],
      });

      // In production, this would call Apple Podcasts API
      console.log('[Apple Podcasts] Publishing episode:', episode.title);

      return {
        success: true,
        appleId: `apple_${Date.now()}`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to publish to Apple Podcasts: ${error}`,
      };
    }
  }

  async publishToYouTube(podcastId: string, episode: EpisodeMetadata, videoUrl: string): Promise<{ success: boolean; youtubeId?: string; error?: string }> {
    try {
      // Use LLM to generate YouTube-optimized description and tags
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are a YouTube content optimizer. Generate optimized title, description, and tags for podcast episodes.',
          },
          {
            role: 'user',
            content: `Create YouTube metadata for this podcast episode:\nTitle: ${episode.title}\nDescription: ${episode.description}\nDuration: ${episode.duration}s`,
          },
        ],
      });

      // In production, this would call YouTube API
      console.log('[YouTube] Publishing episode:', episode.title);

      return {
        success: true,
        youtubeId: `youtube_${Date.now()}`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to publish to YouTube: ${error}`,
      };
    }
  }

  async generateRSSFeed(podcastId: string, episodes: EpisodeMetadata[]): Promise<string> {
    const now = new Date().toUTCString();

    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>Podcast</title>
    <link>https://podcast.example.com</link>
    <description>Podcast Description</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <itunes:explicit>false</itunes:explicit>
`;

    episodes.forEach((episode) => {
      rss += `
    <item>
      <title>${this.escapeXml(episode.title)}</title>
      <description>${this.escapeXml(episode.description)}</description>
      <link>https://podcast.example.com/episodes/${episode.episodeNumber}</link>
      <enclosure url="${episode.audioUrl}" type="audio/mpeg" length="0" />
      <pubDate>${episode.publishDate.toUTCString()}</pubDate>
      <itunes:duration>${episode.duration}</itunes:duration>
      <itunes:explicit>${episode.explicit ? 'true' : 'false'}</itunes:explicit>
      ${episode.episodeNumber ? `<itunes:episode>${episode.episodeNumber}</itunes:episode>` : ''}
      ${episode.seasonNumber ? `<itunes:season>${episode.seasonNumber}</itunes:season>` : ''}
    </item>
`;
    });

    rss += `
  </channel>
</rss>`;

    return rss;
  }

  async publishToAllPlatforms(
    podcastId: string,
    episode: EpisodeMetadata,
    videoUrl?: string
  ): Promise<{
    spotify?: { success: boolean; id?: string };
    applePodcasts?: { success: boolean; id?: string };
    youtube?: { success: boolean; id?: string };
    rss?: { success: boolean };
  }> {
    const results: any = {};

    // Publish to Spotify
    if (this.config.spotify) {
      const spotifyResult = await this.publishToSpotify(podcastId, episode);
      results.spotify = { success: spotifyResult.success, id: spotifyResult.spotifyId };
    }

    // Publish to Apple Podcasts
    if (this.config.applePodcasts) {
      const appleResult = await this.publishToApplePodcasts(podcastId, episode);
      results.applePodcasts = { success: appleResult.success, id: appleResult.appleId };
    }

    // Publish to YouTube
    if (this.config.youtube && videoUrl) {
      const youtubeResult = await this.publishToYouTube(podcastId, episode, videoUrl);
      results.youtube = { success: youtubeResult.success, id: youtubeResult.youtubeId };
    }

    // Generate RSS feed
    if (this.config.rss) {
      try {
        const rssFeed = await this.generateRSSFeed(podcastId, [episode]);
        // In production, this would be saved and served
        results.rss = { success: true };
      } catch (error) {
        results.rss = { success: false };
      }
    }

    return results;
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

export const distributionIntegration = new DistributionIntegration({
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID || '',
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
  },
  applePodcasts: {
    teamId: process.env.APPLE_TEAM_ID || '',
    keyId: process.env.APPLE_KEY_ID || '',
    privateKey: process.env.APPLE_PRIVATE_KEY || '',
  },
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY || '',
    channelId: process.env.YOUTUBE_CHANNEL_ID || '',
  },
  rss: {
    feedUrl: process.env.RSS_FEED_URL || 'https://podcast.example.com/feed.xml',
  },
});
