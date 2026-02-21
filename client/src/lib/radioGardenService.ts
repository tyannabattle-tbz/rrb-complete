/**
 * Radio Garden API Service
 * Provides access to global radio stations with genre-specific filtering
 * Uses Radio Garden's free API (no authentication required)
 */

export interface RadioStation {
  id: string;
  title: string;
  subtitle?: string;
  url: string; // Direct MP3 stream URL
  genre: string;
  country?: string;
  city?: string;
  favicon?: string;
}

const RADIO_GARDEN_API = 'http://radio.garden/api';

// Genre-to-search-term mapping
const GENRE_SEARCH_TERMS: Record<string, string[]> = {
  'R&B/Soul': ['R&B', 'Soul', 'Funk'],
  'Jazz': ['Jazz', 'Smooth Jazz'],
  'Blues': ['Blues', 'Classic Blues'],
  'Rock': ['Rock', '70s Rock', '80s Rock', 'Classic Rock'],
  'Country': ['Country', 'Americana'],
  '90s Hip-Hop': ['Hip Hop', 'Rap', '90s Hip Hop'],
  'Talk': ['Talk', 'News', 'Sports Talk'],
  'Meditation': ['Ambient', 'Meditation', 'Relaxation', 'Chill'],
};

/**
 * Search Radio Garden for stations by genre
 */
export async function searchRadioGardenByGenre(genre: string): Promise<RadioStation[]> {
  try {
    const searchTerms = GENRE_SEARCH_TERMS[genre] || [genre];
    const results: RadioStation[] = [];
    const seenIds = new Set<string>();

    for (const term of searchTerms) {
      try {
        const response = await fetch(`${RADIO_GARDEN_API}/search?query=${encodeURIComponent(term)}`);
        if (!response.ok) continue;

        const data = await response.json();
        
        if (data.hits && Array.isArray(data.hits)) {
          for (const hit of data.hits) {
            if (hit.id && !seenIds.has(hit.id)) {
              seenIds.add(hit.id);
              
              // Get stream URL for this station
              const streamUrl = await getStationStreamUrl(hit.id);
              if (streamUrl) {
                results.push({
                  id: hit.id,
                  title: hit.title || 'Unknown Station',
                  subtitle: hit.subtitle,
                  url: streamUrl,
                  genre: genre,
                  country: hit.country,
                  city: hit.city,
                  favicon: hit.favicon,
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn(`Failed to search for "${term}":`, err);
      }
    }

    return results;
  } catch (err) {
    console.error('Radio Garden search failed:', err);
    return [];
  }
}

/**
 * Get direct stream URL for a radio station
 */
export async function getStationStreamUrl(channelId: string): Promise<string | null> {
  try {
    // Direct stream URL format from Radio Garden
    return `${RADIO_GARDEN_API}/ara/content/listen/${channelId}/channel.mp3`;
  } catch (err) {
    console.error('Failed to get stream URL:', err);
    return null;
  }
}

/**
 * Get station details
 */
export async function getStationDetails(channelId: string): Promise<any> {
  try {
    const response = await fetch(`${RADIO_GARDEN_API}/ara/content/channel/${channelId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error('Failed to get station details:', err);
    return null;
  }
}

/**
 * Search for stations by keyword
 */
export async function searchRadioStations(query: string): Promise<RadioStation[]> {
  try {
    const response = await fetch(`${RADIO_GARDEN_API}/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) return [];

    const data = await response.json();
    const results: RadioStation[] = [];

    if (data.hits && Array.isArray(data.hits)) {
      for (const hit of data.hits) {
        if (hit.id) {
          const streamUrl = await getStationStreamUrl(hit.id);
          if (streamUrl) {
            results.push({
              id: hit.id,
              title: hit.title || 'Unknown Station',
              subtitle: hit.subtitle,
              url: streamUrl,
              genre: 'Mixed',
              country: hit.country,
              city: hit.city,
              favicon: hit.favicon,
            });
          }
        }
      }
    }

    return results;
  } catch (err) {
    console.error('Radio station search failed:', err);
    return [];
  }
}

/**
 * Get popular stations by location
 */
export async function getPopularStationsByLocation(placeId: string): Promise<RadioStation[]> {
  try {
    const response = await fetch(`${RADIO_GARDEN_API}/ara/content/page/${placeId}/channels`);
    if (!response.ok) return [];

    const data = await response.json();
    const results: RadioStation[] = [];

    if (data.channels && Array.isArray(data.channels)) {
      for (const channel of data.channels) {
        if (channel.id) {
          const streamUrl = await getStationStreamUrl(channel.id);
          if (streamUrl) {
            results.push({
              id: channel.id,
              title: channel.title || 'Unknown Station',
              url: streamUrl,
              genre: 'Local',
              favicon: channel.favicon,
            });
          }
        }
      }
    }

    return results;
  } catch (err) {
    console.error('Failed to get popular stations:', err);
    return [];
  }
}

/**
 * Verify if a stream URL is accessible
 */
export async function verifyStreamUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (err) {
    console.warn('Stream URL verification failed:', url, err);
    return false;
  }
}

/**
 * Get curated genre-specific stations (cached)
 */
const genreStationCache: Record<string, { data: RadioStation[]; timestamp: number }> = {};
const CACHE_DURATION = 3600000; // 1 hour

export async function getCuratedStationsByGenre(genre: string): Promise<RadioStation[]> {
  const now = Date.now();
  
  // Check cache
  if (genreStationCache[genre]) {
    const cached = genreStationCache[genre];
    if (now - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
  }

  // Fetch fresh data
  const stations = await searchRadioGardenByGenre(genre);
  
  // Cache results
  genreStationCache[genre] = {
    data: stations,
    timestamp: now,
  };

  return stations;
}
