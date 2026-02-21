/**
 * Listener Stats Service
 * Manages real-time listener counts for channels
 * Uses mock data that can be replaced with API calls
 */

export interface ChannelStats {
  channelId: string;
  listenerCount: number;
  peakListeners: number;
  averageListeners: number;
  lastUpdated: number;
}

// Mock listener data - in production, fetch from API
const MOCK_LISTENER_DATA: Record<string, ChannelStats> = {
  'funky-radio': {
    channelId: 'funky-radio',
    listenerCount: 2847,
    peakListeners: 5230,
    averageListeners: 1950,
    lastUpdated: Date.now(),
  },
  'drone-zone': {
    channelId: 'drone-zone',
    listenerCount: 1234,
    peakListeners: 2100,
    averageListeners: 890,
    lastUpdated: Date.now(),
  },
  'sonic-universe': {
    channelId: 'sonic-universe',
    listenerCount: 3456,
    peakListeners: 6200,
    averageListeners: 2340,
    lastUpdated: Date.now(),
  },
  'lush': {
    channelId: 'lush',
    listenerCount: 2100,
    peakListeners: 4500,
    averageListeners: 1670,
    lastUpdated: Date.now(),
  },
  'radio-paradise': {
    channelId: 'radio-paradise',
    listenerCount: 4200,
    peakListeners: 7800,
    averageListeners: 3100,
    lastUpdated: Date.now(),
  },
  'secret-agent': {
    channelId: 'secret-agent',
    listenerCount: 1890,
    peakListeners: 3400,
    averageListeners: 1200,
    lastUpdated: Date.now(),
  },
};

/**
 * Get listener stats for a channel
 * Simulates real-time updates with slight randomization
 */
export function getChannelStats(channelId: string): ChannelStats {
  const baseStats = MOCK_LISTENER_DATA[channelId];
  
  if (!baseStats) {
    return {
      channelId,
      listenerCount: Math.floor(Math.random() * 5000) + 500,
      peakListeners: Math.floor(Math.random() * 10000) + 2000,
      averageListeners: Math.floor(Math.random() * 5000) + 500,
      lastUpdated: Date.now(),
    };
  }

  // Add slight randomization to simulate real-time changes
  const variance = Math.floor((Math.random() - 0.5) * 200);
  return {
    ...baseStats,
    listenerCount: Math.max(100, baseStats.listenerCount + variance),
    lastUpdated: Date.now(),
  };
}

/**
 * Format listener count for display
 */
export function formatListenerCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
}

/**
 * Get trending channels (highest listener count)
 */
export function getTrendingChannels(channelIds: string[], limit: number = 5): string[] {
  return channelIds
    .map(id => ({
      id,
      stats: getChannelStats(id),
    }))
    .sort((a, b) => b.stats.listenerCount - a.stats.listenerCount)
    .slice(0, limit)
    .map(item => item.id);
}
