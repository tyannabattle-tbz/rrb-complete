/**
 * iTunes Podcast Service
 * Fetches real podcast data from iTunes Search API
 */

interface PodcastResult {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl600: string;
  feedUrl: string;
  trackCount: number;
  releaseDate: string;
  genres: string[];
}

interface Episode {
  id: string;
  title: string;
  artist: string;
  description: string;
  pubDate: string;
  duration: number;
  streamUrl: string;
  imageUrl: string;
  channel: string;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  episodes: Episode[];
  feedUrl?: string;
}

const ITUNES_API_BASE = "https://itunes.apple.com/search";

/**
 * Search for podcasts on iTunes
 */
export async function searchPodcasts(query: string, limit = 10): Promise<PodcastResult[]> {
  try {
    const response = await fetch(
      `${ITUNES_API_BASE}?term=${encodeURIComponent(query)}&media=podcast&limit=${limit}`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error searching podcasts:", error);
    return [];
  }
}

/**
 * Get popular podcasts by genre
 */
export async function getPopularPodcasts(genre = "Music", limit = 10): Promise<PodcastResult[]> {
  try {
    const response = await fetch(
      `${ITUNES_API_BASE}?term=${encodeURIComponent(genre)}&media=podcast&limit=${limit}`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching popular podcasts:", error);
    return [];
  }
}

/**
 * Convert iTunes podcast to Channel format
 */
export function podcastToChannel(podcast: PodcastResult, episodes: Episode[] = []): Channel {
  return {
    id: `itunes-${podcast.collectionId}`,
    name: podcast.collectionName,
    description: `By ${podcast.artistName}`,
    imageUrl: podcast.artworkUrl600,
    feedUrl: podcast.feedUrl,
    episodes: episodes.length > 0 ? episodes : generatePlaceholderEpisodes(podcast),
  };
}

/**
 * Generate placeholder episodes for a podcast
 */
function generatePlaceholderEpisodes(podcast: PodcastResult): Episode[] {
  const episodes: Episode[] = [];
  for (let i = 0; i < Math.min(5, podcast.trackCount); i++) {
    episodes.push({
      id: `${podcast.collectionId}-${i}`,
      title: `${podcast.collectionName} - Episode ${i + 1}`,
      artist: podcast.artistName,
      description: `Episode ${i + 1} of ${podcast.collectionName}`,
      pubDate: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 3600 + Math.random() * 3600, // 1-2 hours
      streamUrl: `https://ice1.somafm.com/groovesalad-128-mp3`,
      imageUrl: podcast.artworkUrl600,
      channel: podcast.collectionName,
    });
  }
  return episodes;
}

/**
 * Get featured podcasts (hardcoded popular ones)
 */
export async function getFeaturedPodcasts(): Promise<Channel[]> {
  const featuredSearches = ["The Joe Rogan Experience", "Serial", "Stuff You Should Know"];
  const channels: Channel[] = [];

  for (const search of featuredSearches) {
    const results = await searchPodcasts(search, 1);
    if (results.length > 0) {
      channels.push(podcastToChannel(results[0]));
    }
  }

  return channels;
}

/**
 * Search and get podcast channels
 */
export async function searchAndGetChannels(query: string, limit = 5): Promise<Channel[]> {
  const results = await searchPodcasts(query, limit);
  return results.map((podcast) => podcastToChannel(podcast));
}
