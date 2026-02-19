/**
 * Spoke Feeds & Open Source Channel Service
 * Aggregates RSS/Atom feeds from multiple sources
 * Provides autopilot content scheduling
 */

import axios from 'axios';
import { parseStringPromise } from 'xml2js';

const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

interface FeedItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: Date;
  author?: string;
  imageUrl?: string;
  duration?: number;
  mediaUrl?: string;
  source: string;
}

interface FeedSource {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'atom' | 'youtube';
  category: string;
  items: FeedItem[];
}

const cache = new Map<string, { data: any; timestamp: number }>();

// Predefined open source and community channels
const SPOKE_FEEDS: FeedSource[] = [
  {
    id: 'rrb-official',
    name: 'Rockin\' Rockin\' Boogie Official',
    url: 'https://www.rockinrockinboogie.com/api/rss/podcast',
    type: 'rss',
    category: 'Official',
    items: [],
  },
  {
    id: 'archive-org',
    name: 'Archive.org Open Source Media',
    url: 'https://archive.org/advancedsearch.php?q=collection%3Aopensource_audio&output=rss&rows=50',
    type: 'rss',
    category: 'Open Source',
    items: [],
  },
  {
    id: 'creative-commons',
    name: 'Creative Commons Audio',
    url: 'https://feeds.ccmixter.org/feeds/latest.xml',
    type: 'rss',
    category: 'Creative Commons',
    items: [],
  },
  {
    id: 'podcast-index',
    name: 'Podcast Index - Independent Podcasts',
    url: 'https://podcastindex.org/feeds/recent',
    type: 'rss',
    category: 'Podcast Index',
    items: [],
  },
  {
    id: 'open-music',
    name: 'Open Music Archive',
    url: 'https://www.openmusic.community/feed',
    type: 'rss',
    category: 'Music',
    items: [],
  },
];

/**
 * Parse RSS feed
 */
async function parseRSSFeed(url: string): Promise<FeedItem[]> {
  try {
    const response = await axios.get(url, { timeout: 15000 });
    const parsed = await parseStringPromise(response.data);

    const channel = parsed.rss?.channel?.[0] || parsed.feed?.[0];
    if (!channel) return [];

    const items = (channel.item || channel.entry || []).map((item: any, idx: number) => {
      const title = item.title?.[0] || item['atom:title']?.[0] || 'Untitled';
      const description = item.description?.[0] || item.summary?.[0] || '';
      const link = item.link?.[0]?.$ ?.href || item.link?.[0] || '';
      const pubDate = new Date(item.pubDate?.[0] || item.published?.[0] || Date.now());
      const author = item.author?.[0]?.name?.[0] || item['dc:creator']?.[0] || undefined;
      const imageUrl = item.image?.[0]?.url?.[0] || item['media:thumbnail']?.[0]?.$ ?.url || undefined;
      const mediaUrl = item['media:content']?.[0]?.$ ?.url || item.enclosure?.[0]?.$ ?.url || undefined;

      return {
        id: `${url}-${idx}`,
        title,
        description,
        link,
        pubDate,
        author,
        imageUrl,
        mediaUrl,
        source: url,
      };
    });

    return items;
  } catch (error) {
    console.error(`[Spoke Feeds] Error parsing RSS from ${url}:`, error);
    return [];
  }
}

/**
 * Fetch all spoke feeds
 */
export async function fetchAllSpokeFeeds(): Promise<FeedSource[]> {
  const cacheKey = 'all-spoke-feeds';
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const feedPromises = SPOKE_FEEDS.map(async (feed) => {
      try {
        const items = await parseRSSFeed(feed.url);
        return {
          ...feed,
          items: items.slice(0, 20), // Limit to 20 items per feed
        };
      } catch (error) {
        console.error(`[Spoke Feeds] Failed to fetch ${feed.name}:`, error);
        return feed;
      }
    });

    const results = await Promise.all(feedPromises);
    cache.set(cacheKey, { data: results, timestamp: Date.now() });
    return results;
  } catch (error) {
    console.error('[Spoke Feeds] Error fetching all feeds:', error);
    return SPOKE_FEEDS;
  }
}

/**
 * Get aggregated feed items from all sources
 */
export async function getAggregatedFeedItems(limit: number = 100): Promise<FeedItem[]> {
  const feeds = await fetchAllSpokeFeeds();
  const allItems: FeedItem[] = [];

  for (const feed of feeds) {
    allItems.push(...feed.items);
  }

  // Sort by publish date (newest first)
  return allItems
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, limit);
}

/**
 * Get items by category
 */
export async function getItemsByCategory(category: string, limit: number = 50): Promise<FeedItem[]> {
  const feeds = await fetchAllSpokeFeeds();
  const categoryFeeds = feeds.filter((f) => f.category === category);
  const items: FeedItem[] = [];

  for (const feed of categoryFeeds) {
    items.push(...feed.items);
  }

  return items
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, limit);
}

/**
 * Add custom spoke feed
 */
export async function addSpokeFeed(
  name: string,
  url: string,
  category: string
): Promise<FeedSource> {
  const feed: FeedSource = {
    id: `custom-${Date.now()}`,
    name,
    url,
    type: 'rss',
    category,
    items: [],
  };

  try {
    const items = await parseRSSFeed(url);
    feed.items = items.slice(0, 20);
    SPOKE_FEEDS.push(feed);
    cache.delete('all-spoke-feeds'); // Invalidate cache
    return feed;
  } catch (error) {
    console.error(`[Spoke Feeds] Error adding feed ${name}:`, error);
    throw error;
  }
}

/**
 * Search across all feeds
 */
export async function searchFeeds(query: string, limit: number = 50): Promise<FeedItem[]> {
  const items = await getAggregatedFeedItems(1000);
  const queryLower = query.toLowerCase();

  return items
    .filter(
      (item) =>
        item.title.toLowerCase().includes(queryLower) ||
        item.description.toLowerCase().includes(queryLower)
    )
    .slice(0, limit);
}

/**
 * Get trending items (most viewed/popular)
 */
export async function getTrendingItems(limit: number = 20): Promise<FeedItem[]> {
  const items = await getAggregatedFeedItems(500);
  
  // Sort by recency and source diversity
  return items
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, limit);
}

/**
 * Get next items for autopilot queue
 */
export async function getAutopilotQueue(
  currentItemId?: string,
  queueSize: number = 10
): Promise<FeedItem[]> {
  const items = await getAggregatedFeedItems(500);

  if (!currentItemId) {
    return items.slice(0, queueSize);
  }

  const currentIdx = items.findIndex((i) => i.id === currentItemId);
  if (currentIdx === -1) {
    return items.slice(0, queueSize);
  }

  return items.slice(currentIdx + 1, currentIdx + 1 + queueSize);
}
