/**
 * SomaFM API Service
 * Fetches real-time listener counts and channel metadata from SomaFM
 */

interface SomaFMChannel {
  id: string;
  title: string;
  dj: string;
  description: string;
  genre: string;
  listeners: number;
  updated: number;
}

interface SomaFMChannelList {
  channels: SomaFMChannel[];
}

const SOMAFM_API = "https://api.somafm.com/channels.json";
const CACHE_DURATION = 60000; // 1 minute cache

let cachedChannels: Map<string, { data: SomaFMChannel; timestamp: number }> = new Map();

/**
 * Fetch all SomaFM channels with real listener counts
 */
export async function fetchSomaFMChannels(): Promise<SomaFMChannel[]> {
  try {
    const response = await fetch(SOMAFM_API, {
      headers: {
        "User-Agent": "RRB-Radio-Station/1.0",
      },
    });

    if (!response.ok) {
      console.error(`SomaFM API error: ${response.status}`);
      return [];
    }

    const data = (await response.json()) as SomaFMChannelList;
    
    // Update cache
    data.channels.forEach((channel) => {
      cachedChannels.set(channel.id, {
        data: channel,
        timestamp: Date.now(),
      });
    });

    return data.channels;
  } catch (error) {
    console.error("Failed to fetch SomaFM channels:", error);
    return [];
  }
}

/**
 * Get listener count for a specific channel
 * Uses cache if available and fresh
 */
export async function getChannelListeners(channelId: string): Promise<number> {
  const cached = cachedChannels.get(channelId);

  // Return cached data if fresh
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data.listeners;
  }

  try {
    const channels = await fetchSomaFMChannels();
    const channel = channels.find((c) => c.id === channelId);
    return channel?.listeners ?? 0;
  } catch (error) {
    console.error(`Failed to get listeners for ${channelId}:`, error);
    return 0;
  }
}

/**
 * Get all channels with listener counts
 * Returns a map of channel ID to listener count
 */
export async function getAllChannelListeners(): Promise<Record<string, number>> {
  try {
    const channels = await fetchSomaFMChannels();
    const listeners: Record<string, number> = {};

    channels.forEach((channel) => {
      listeners[channel.id] = channel.listeners;
    });

    return listeners;
  } catch (error) {
    console.error("Failed to get all channel listeners:", error);
    return {};
  }
}

/**
 * Clear the cache (useful for manual refresh)
 */
export function clearCache(): void {
  cachedChannels.clear();
}
