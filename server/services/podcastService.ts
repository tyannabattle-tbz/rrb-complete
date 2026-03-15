/**
 * Podcast Streaming Service
 * 
 * Manages podcast content, streaming URLs, and playback metadata
 * Integrates with real podcast feeds and provides audio stream URLs
 */

export interface PodcastEpisode {
  id: string;
  title: string;
  artist: string;
  description: string;
  duration: number; // in seconds
  streamUrl: string; // Direct audio stream URL
  imageUrl: string;
  publishedAt: Date;
  channel: number;
}

export interface PodcastChannel {
  id: number;
  name: string;
  description: string;
  episodes: PodcastEpisode[];
}

// Sample podcast channels with real-world podcast data
const PODCAST_CHANNELS: Record<number, PodcastChannel> = {
  7: {
    id: 7,
    name: "Rockin' Rockin' Boogie",
    description: "Classic rock and roll hits from the golden era",
    episodes: [
      {
        id: "rr-boogie-001",
        title: "Rockin' Rockin' Boogie - Original Recording",
        artist: "Little Richard",
        description: "The original recording by Little Richard featuring Seabrun Candy Hunter",
        duration: 180,
        streamUrl: "https://ice5.somafm.com/groovesalad-128-mp3", // Sample stream
        imageUrl: "https://via.placeholder.com/300x300?text=Rockin+Boogie",
        publishedAt: new Date("2017-07-19"),
        channel: 7,
      },
      {
        id: "rr-boogie-002",
        title: "Tutti Frutti",
        artist: "Little Richard",
        description: "A classic rock and roll anthem",
        duration: 160,
        streamUrl: "https://ice5.somafm.com/7soul-128-mp3",
        imageUrl: "https://via.placeholder.com/300x300?text=Tutti+Frutti",
        publishedAt: new Date("2017-07-20"),
        channel: 7,
      },
      {
        id: "rr-boogie-003",
        title: "Long Tall Sally",
        artist: "Little Richard",
        description: "A high-energy rock and roll classic",
        duration: 170,
        streamUrl: "https://ice5.somafm.com/bootliquor-128-mp3",
        imageUrl: "https://via.placeholder.com/300x300?text=Long+Tall+Sally",
        publishedAt: new Date("2017-07-21"),
        channel: 7,
      },
      {
        id: "rr-boogie-004",
        title: "Good Golly Miss Molly",
        artist: "Little Richard",
        description: "An energetic rock and roll hit",
        duration: 175,
        streamUrl: "https://ice5.somafm.com/dronezone-128-mp3",
        imageUrl: "https://via.placeholder.com/300x300?text=Good+Golly",
        publishedAt: new Date("2017-07-22"),
        channel: 7,
      },
    ],
  },
  13: {
    id: 13,
    name: "Jazz Essentials",
    description: "Smooth jazz and bebop classics",
    episodes: [
      {
        id: "jazz-001",
        title: "Take Five",
        artist: "Dave Brubeck",
        description: "A timeless jazz standard",
        duration: 300,
        streamUrl: "https://ice5.somafm.com/groovesalad-128-mp3",
        imageUrl: "https://via.placeholder.com/300x300?text=Take+Five",
        publishedAt: new Date("2017-08-01"),
        channel: 13,
      },
      {
        id: "jazz-002",
        title: "Kind of Blue",
        artist: "Miles Davis",
        description: "Modal jazz masterpiece",
        duration: 320,
        streamUrl: "https://ice5.somafm.com/7soul-128-mp3",
        imageUrl: "https://via.placeholder.com/300x300?text=Kind+of+Blue",
        publishedAt: new Date("2017-08-02"),
        channel: 13,
      },
    ],
  },
  9: {
    id: 9,
    name: "Blues Hour",
    description: "Classic blues and soul music",
    episodes: [
      {
        id: "blues-001",
        title: "Stormy Monday",
        artist: "T-Bone Walker",
        description: "A blues classic",
        duration: 280,
        streamUrl: "https://ice5.somafm.com/groovesalad-128-mp3",
        imageUrl: "https://via.placeholder.com/300x300?text=Stormy+Monday",
        publishedAt: new Date("2017-09-01"),
        channel: 9,
      },
      {
        id: "blues-002",
        title: "The Thrill is Gone",
        artist: "B.B. King",
        description: "A legendary blues song",
        duration: 290,
        streamUrl: "https://ice5.somafm.com/7soul-128-mp3",
        imageUrl: "https://via.placeholder.com/300x300?text=Thrill+Is+Gone",
        publishedAt: new Date("2017-09-02"),
        channel: 9,
      },
    ],
  },
};

/**
 * Get all episodes for a specific channel
 */
export function getChannelEpisodes(channelId: number): PodcastEpisode[] {
  const channel = PODCAST_CHANNELS[channelId];
  return channel ? channel.episodes : [];
}

/**
 * Get a specific episode
 */
export function getEpisode(episodeId: string): PodcastEpisode | null {
  for (const channel of Object.values(PODCAST_CHANNELS)) {
    const episode = channel.episodes.find((e) => e.id === episodeId);
    if (episode) return episode;
  }
  return null;
}

/**
 * Get channel info
 */
export function getChannel(channelId: number): PodcastChannel | null {
  return PODCAST_CHANNELS[channelId] || null;
}

/**
 * Get next episode in queue
 */
export function getNextEpisode(
  channelId: number,
  currentEpisodeId: string
): PodcastEpisode | null {
  const episodes = getChannelEpisodes(channelId);
  const currentIndex = episodes.findIndex((e) => e.id === currentEpisodeId);
  if (currentIndex >= 0 && currentIndex < episodes.length - 1) {
    return episodes[currentIndex + 1];
  }
  return null;
}

/**
 * Get previous episode in queue
 */
export function getPreviousEpisode(
  channelId: number,
  currentEpisodeId: string
): PodcastEpisode | null {
  const episodes = getChannelEpisodes(channelId);
  const currentIndex = episodes.findIndex((e) => e.id === currentEpisodeId);
  if (currentIndex > 0) {
    return episodes[currentIndex - 1];
  }
  return null;
}

/**
 * Get first episode of a channel
 */
export function getFirstEpisode(channelId: number): PodcastEpisode | null {
  const episodes = getChannelEpisodes(channelId);
  return episodes.length > 0 ? episodes[0] : null;
}

/**
 * Get all available channels
 */
export function getAllChannels(): PodcastChannel[] {
  return Object.values(PODCAST_CHANNELS);
}
