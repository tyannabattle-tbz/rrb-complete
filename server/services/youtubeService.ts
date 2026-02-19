/**
 * YouTube Integration Service
 * Fetches video metadata, playlists, and channel content from YouTube Data API
 * Provides autopilot video feed for RRB ecosystem
 */

import axios from 'axios';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  publishedAt: Date;
  channelTitle: string;
  viewCount: number;
  likeCount?: number;
  commentCount?: number;
}

interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  itemCount: number;
  videos: YouTubeVideo[];
}

interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: string;
  videoCount: number;
  videos: YouTubeVideo[];
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

/**
 * Parse ISO 8601 duration to seconds
 */
function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Get videos from a YouTube channel
 */
export async function getChannelVideos(
  channelId: string,
  maxResults: number = 20
): Promise<YouTubeVideo[]> {
  const cacheKey = `channel:${channelId}:${maxResults}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.warn('[YouTube] API key not configured');
      return [];
    }

    // Get uploads playlist ID
    const channelRes = await axios.get(`${YOUTUBE_API_BASE}/channels`, {
      params: {
        part: 'contentDetails',
        id: channelId,
        key: apiKey,
      },
      timeout: 10000,
    });

    if (!channelRes.data.items?.[0]) return [];

    const uploadsPlaylistId = channelRes.data.items[0].contentDetails.relatedPlaylists.uploads;

    // Get videos from uploads playlist
    const videosRes = await axios.get(`${YOUTUBE_API_BASE}/playlistItems`, {
      params: {
        part: 'snippet,contentDetails',
        playlistId: uploadsPlaylistId,
        maxResults: Math.min(maxResults, 50),
        key: apiKey,
      },
      timeout: 10000,
    });

    const videoIds = videosRes.data.items?.map((item: any) => item.contentDetails.videoId) || [];

    if (videoIds.length === 0) return [];

    // Get video details (duration, stats)
    const detailsRes = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: 'contentDetails,statistics',
        id: videoIds.join(','),
        key: apiKey,
      },
      timeout: 10000,
    });

    const videos: YouTubeVideo[] = videosRes.data.items.map((item: any, idx: number) => {
      const details = detailsRes.data.items?.[idx];
      return {
        id: item.contentDetails.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url || '',
        duration: details ? parseDuration(details.contentDetails.duration) : 0,
        publishedAt: new Date(item.snippet.publishedAt),
        channelTitle: item.snippet.channelTitle,
        viewCount: parseInt(details?.statistics?.viewCount) || 0,
        likeCount: parseInt(details?.statistics?.likeCount) || 0,
        commentCount: parseInt(details?.statistics?.commentCount) || 0,
      };
    });

    cache.set(cacheKey, { data: videos, timestamp: Date.now() });
    return videos;
  } catch (error) {
    console.error('[YouTube] Error fetching channel videos:', error);
    return [];
  }
}

/**
 * Get videos from a YouTube playlist
 */
export async function getPlaylistVideos(
  playlistId: string,
  maxResults: number = 20
): Promise<YouTubeVideo[]> {
  const cacheKey = `playlist:${playlistId}:${maxResults}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.warn('[YouTube] API key not configured');
      return [];
    }

    const res = await axios.get(`${YOUTUBE_API_BASE}/playlistItems`, {
      params: {
        part: 'snippet,contentDetails',
        playlistId,
        maxResults: Math.min(maxResults, 50),
        key: apiKey,
      },
      timeout: 10000,
    });

    const videoIds = res.data.items?.map((item: any) => item.contentDetails.videoId) || [];

    if (videoIds.length === 0) return [];

    // Get video details
    const detailsRes = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: 'contentDetails,statistics',
        id: videoIds.join(','),
        key: apiKey,
      },
      timeout: 10000,
    });

    const videos: YouTubeVideo[] = res.data.items.map((item: any, idx: number) => {
      const details = detailsRes.data.items?.[idx];
      return {
        id: item.contentDetails.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url || '',
        duration: details ? parseDuration(details.contentDetails.duration) : 0,
        publishedAt: new Date(item.snippet.publishedAt),
        channelTitle: item.snippet.channelTitle,
        viewCount: parseInt(details?.statistics?.viewCount) || 0,
        likeCount: parseInt(details?.statistics?.likeCount) || 0,
        commentCount: parseInt(details?.statistics?.commentCount) || 0,
      };
    });

    cache.set(cacheKey, { data: videos, timestamp: Date.now() });
    return videos;
  } catch (error) {
    console.error('[YouTube] Error fetching playlist videos:', error);
    return [];
  }
}

/**
 * Search YouTube videos
 */
export async function searchVideos(
  query: string,
  maxResults: number = 20
): Promise<YouTubeVideo[]> {
  const cacheKey = `search:${query}:${maxResults}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.warn('[YouTube] API key not configured');
      return [];
    }

    const res = await axios.get(`${YOUTUBE_API_BASE}/search`, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: Math.min(maxResults, 50),
        order: 'relevance',
        key: apiKey,
      },
      timeout: 10000,
    });

    const videoIds = res.data.items?.map((item: any) => item.id.videoId) || [];

    if (videoIds.length === 0) return [];

    // Get video details
    const detailsRes = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: 'contentDetails,statistics',
        id: videoIds.join(','),
        key: apiKey,
      },
      timeout: 10000,
    });

    const videos: YouTubeVideo[] = res.data.items.map((item: any, idx: number) => {
      const details = detailsRes.data.items?.[idx];
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url || '',
        duration: details ? parseDuration(details.contentDetails.duration) : 0,
        publishedAt: new Date(item.snippet.publishedAt),
        channelTitle: item.snippet.channelTitle,
        viewCount: parseInt(details?.statistics?.viewCount) || 0,
        likeCount: parseInt(details?.statistics?.likeCount) || 0,
        commentCount: parseInt(details?.statistics?.commentCount) || 0,
      };
    });

    cache.set(cacheKey, { data: videos, timestamp: Date.now() });
    return videos;
  } catch (error) {
    console.error('[YouTube] Error searching videos:', error);
    return [];
  }
}

/**
 * Get RRB official channel videos
 */
export async function getRRBChannelVideos(maxResults: number = 30): Promise<YouTubeVideo[]> {
  // This would use the actual RRB YouTube channel ID
  // For now, returning empty array - configure with actual channel ID
  const rrbChannelId = process.env.RRB_YOUTUBE_CHANNEL_ID || '';
  if (!rrbChannelId) {
    console.warn('[YouTube] RRB channel ID not configured');
    return [];
  }
  return getChannelVideos(rrbChannelId, maxResults);
}
