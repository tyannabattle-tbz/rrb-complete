/**
 * iTunes API Service
 * Provides podcast search and discovery using the iTunes Search API
 * No authentication required - public API
 */

import axios from 'axios';

const ITUNES_API_BASE = 'https://itunes.apple.com/search';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

interface PodcastResult {
  id: string;
  collectionId: number;
  trackId: number;
  collectionName: string;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  artworkUrl600: string;
  feedUrl?: string;
  trackViewUrl: string;
  collectionViewUrl: string;
  description?: string;
  releaseDate?: string;
  trackCount?: number;
  genres?: string[];
  contentAdvisoryRating?: string;
}

interface PodcastSearchResult {
  resultCount: number;
  results: PodcastResult[];
}

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  pubDate: string;
  link: string;
  enclosure?: {
    url: string;
    type: string;
    length: string;
  };
  duration?: string;
  image?: string;
}

interface PodcastFeed {
  title: string;
  description: string;
  link: string;
  image: string;
  episodes: PodcastEpisode[];
  lastUpdated: string;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

/**
 * Search for podcasts on iTunes
 * @param query Search query (podcast name, artist, etc.)
 * @param limit Number of results to return (default: 20, max: 200)
 */
export async function searchPodcasts(
  query: string,
  limit: number = 20
): Promise<PodcastResult[]> {
  const cacheKey = `search:${query}:${limit}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await axios.get<PodcastSearchResult>(ITUNES_API_BASE, {
      params: {
        term: query,
        media: 'podcast',
        limit: Math.min(limit, 200),
        entity: 'podcast',
      },
      timeout: 10000,
    });

    const results = response.data.results.map((item: any) => ({
      id: `podcast-${item.collectionId}`,
      collectionId: item.collectionId,
      trackId: item.trackId,
      collectionName: item.collectionName,
      trackName: item.trackName,
      artistName: item.artistName,
      artworkUrl100: item.artworkUrl100,
      artworkUrl600: item.artworkUrl600,
      feedUrl: item.feedUrl,
      trackViewUrl: item.trackViewUrl,
      collectionViewUrl: item.collectionViewUrl,
      description: item.description,
      releaseDate: item.releaseDate,
      trackCount: item.trackCount,
      genres: item.genres,
      contentAdvisoryRating: item.contentAdvisoryRating,
    }));

    cache.set(cacheKey, { data: results, timestamp: Date.now() });
    return results;
  } catch (error) {
    console.error('iTunes API search error:', error);
    throw new Error('Failed to search podcasts');
  }
}

/**
 * Get top podcasts by genre
 * @param genreId iTunes genre ID (26 = podcasts)
 * @param limit Number of results
 */
export async function getTopPodcasts(
  genreId: number = 26,
  limit: number = 20
): Promise<PodcastResult[]> {
  const cacheKey = `top:${genreId}:${limit}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await axios.get<PodcastSearchResult>(ITUNES_API_BASE, {
      params: {
        genreId,
        media: 'podcast',
        limit: Math.min(limit, 200),
        entity: 'podcast',
      },
      timeout: 10000,
    });

    const results = response.data.results.map((item: any) => ({
      id: `podcast-${item.collectionId}`,
      collectionId: item.collectionId,
      trackId: item.trackId,
      collectionName: item.collectionName,
      trackName: item.trackName,
      artistName: item.artistName,
      artworkUrl100: item.artworkUrl100,
      artworkUrl600: item.artworkUrl600,
      feedUrl: item.feedUrl,
      trackViewUrl: item.trackViewUrl,
      collectionViewUrl: item.collectionViewUrl,
      description: item.description,
      releaseDate: item.releaseDate,
      trackCount: item.trackCount,
      genres: item.genres,
      contentAdvisoryRating: item.contentAdvisoryRating,
    }));

    cache.set(cacheKey, { data: results, timestamp: Date.now() });
    return results;
  } catch (error) {
    console.error('iTunes API top podcasts error:', error);
    throw new Error('Failed to fetch top podcasts');
  }
}

/**
 * Get podcast details by collection ID
 */
export async function getPodcastDetails(
  collectionId: number
): Promise<PodcastResult | null> {
  const cacheKey = `details:${collectionId}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await axios.get<PodcastSearchResult>(ITUNES_API_BASE, {
      params: {
        id: collectionId,
        media: 'podcast',
        entity: 'podcast',
      },
      timeout: 10000,
    });

    if (response.data.results.length === 0) {
      return null;
    }

    const item = response.data.results[0];
    const result: PodcastResult = {
      id: `podcast-${item.collectionId}`,
      collectionId: item.collectionId,
      trackId: item.trackId,
      collectionName: item.collectionName,
      trackName: item.trackName,
      artistName: item.artistName,
      artworkUrl100: item.artworkUrl100,
      artworkUrl600: item.artworkUrl600,
      feedUrl: item.feedUrl,
      trackViewUrl: item.trackViewUrl,
      collectionViewUrl: item.collectionViewUrl,
      description: item.description,
      releaseDate: item.releaseDate,
      trackCount: item.trackCount,
      genres: item.genres,
      contentAdvisoryRating: item.contentAdvisoryRating,
    };

    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error('iTunes API details error:', error);
    throw new Error('Failed to fetch podcast details');
  }
}

/**
 * Search for podcasts by artist
 */
export async function searchPodcastsByArtist(
  artistName: string,
  limit: number = 20
): Promise<PodcastResult[]> {
  const cacheKey = `artist:${artistName}:${limit}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await axios.get<PodcastSearchResult>(ITUNES_API_BASE, {
      params: {
        term: artistName,
        media: 'podcast',
        entity: 'podcast',
        attribute: 'artistTerm',
        limit: Math.min(limit, 200),
      },
      timeout: 10000,
    });

    const results = response.data.results.map((item: any) => ({
      id: `podcast-${item.collectionId}`,
      collectionId: item.collectionId,
      trackId: item.trackId,
      collectionName: item.collectionName,
      trackName: item.trackName,
      artistName: item.artistName,
      artworkUrl100: item.artworkUrl100,
      artworkUrl600: item.artworkUrl600,
      feedUrl: item.feedUrl,
      trackViewUrl: item.trackViewUrl,
      collectionViewUrl: item.collectionViewUrl,
      description: item.description,
      releaseDate: item.releaseDate,
      trackCount: item.trackCount,
      genres: item.genres,
      contentAdvisoryRating: item.contentAdvisoryRating,
    }));

    cache.set(cacheKey, { data: results, timestamp: Date.now() });
    return results;
  } catch (error) {
    console.error('iTunes API artist search error:', error);
    throw new Error('Failed to search podcasts by artist');
  }
}

/**
 * Clear cache (useful for testing or manual refresh)
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: cache.size,
    entries: Array.from(cache.keys()),
  };
}
