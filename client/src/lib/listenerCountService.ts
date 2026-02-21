/**
 * Real-time Listener Count Service
 * Simulates live listener updates every 5 seconds
 */

export interface ChannelListeners {
  channelId: string;
  channelName: string;
  currentListeners: number;
  peakListeners: number;
  averageListeners: number;
  trend: 'up' | 'down' | 'stable';
}

class ListenerCountService {
  private listenerCounts: Map<string, ChannelListeners> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(data: Map<string, ChannelListeners>) => void> = new Set();

  constructor() {
    this.initializeChannels();
  }

  private initializeChannels() {
    const channels = [
      { id: 'music-rock', name: 'Rock Legends', base: 2847 },
      { id: 'music-jazz', name: 'Jazz Nights', base: 1923 },
      { id: 'music-soul', name: 'Soul & R&B', base: 2156 },
      { id: 'music-classical', name: 'Classical Masters', base: 1245 },
      { id: 'music-electronic', name: 'Electronic Pulse', base: 3421 },
      { id: 'music-hiphop', name: 'Hip-Hop Central', base: 3892 },
      { id: 'music-pop', name: 'Pop Hits', base: 2567 },
      { id: 'music-country', name: 'Country Roads', base: 1834 },
      { id: 'music-blues', name: 'Blues Heritage', base: 1456 },
      { id: 'music-reggae', name: 'Reggae Rhythms', base: 1678 },
      { id: 'music-latin', name: 'Latin Grooves', base: 2234 },
      { id: 'music-world', name: 'World Music', base: 1567 },
      { id: 'talk-news', name: 'News & Updates', base: 3456 },
      { id: 'talk-podcast', name: 'Podcast Central', base: 2789 },
      { id: 'talk-interviews', name: 'Interviews & Stories', base: 2123 },
      { id: 'talk-comedy', name: 'Comedy Hour', base: 1945 },
      { id: '24-7-healing', name: 'Healing Frequencies', base: 4567 },
      { id: '24-7-meditation', name: 'Meditation & Mindfulness', base: 3234 },
      { id: '24-7-ambient', name: 'Ambient & Chill', base: 2876 },
      { id: '24-7-sleep', name: 'Sleep & Relaxation', base: 5123 },
      { id: '24-7-focus', name: 'Focus & Study', base: 3456 },
    ];

    channels.forEach(channel => {
      this.listenerCounts.set(channel.id, {
        channelId: channel.id,
        channelName: channel.name,
        currentListeners: channel.base,
        peakListeners: Math.floor(channel.base * 1.5),
        averageListeners: channel.base,
        trend: 'stable',
      });
    });
  }

  /**
   * Start real-time listener count updates
   */
  startUpdates() {
    if (this.updateInterval) return;

    this.updateInterval = setInterval(() => {
      this.updateListenerCounts();
      this.notifyListeners();
    }, 5000); // Update every 5 seconds
  }

  /**
   * Stop real-time updates
   */
  stopUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Update listener counts with realistic variations
   */
  private updateListenerCounts() {
    this.listenerCounts.forEach((data, channelId) => {
      // Simulate natural listener fluctuations
      const variation = (Math.random() - 0.5) * 200; // ±100 listeners
      const newCount = Math.max(0, Math.floor(data.currentListeners + variation));

      // Update trend
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (newCount > data.currentListeners) trend = 'up';
      else if (newCount < data.currentListeners) trend = 'down';

      // Update peak if needed
      const newPeak = Math.max(data.peakListeners, newCount);

      // Update average
      const newAverage = Math.floor((data.averageListeners + newCount) / 2);

      this.listenerCounts.set(channelId, {
        ...data,
        currentListeners: newCount,
        peakListeners: newPeak,
        averageListeners: newAverage,
        trend,
      });
    });
  }

  /**
   * Subscribe to listener count updates
   */
  subscribe(callback: (data: Map<string, ChannelListeners>) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all subscribers of updates
   */
  private notifyListeners() {
    this.listeners.forEach(callback => {
      callback(new Map(this.listenerCounts));
    });
  }

  /**
   * Get current listener count for a channel
   */
  getChannelListeners(channelId: string): ChannelListeners | undefined {
    return this.listenerCounts.get(channelId);
  }

  /**
   * Get all listener counts
   */
  getAllListeners(): Map<string, ChannelListeners> {
    return new Map(this.listenerCounts);
  }

  /**
   * Get top channels by listener count
   */
  getTopChannels(limit: number = 5): ChannelListeners[] {
    return Array.from(this.listenerCounts.values())
      .sort((a, b) => b.currentListeners - a.currentListeners)
      .slice(0, limit);
  }

  /**
   * Get trending channels
   */
  getTrendingChannels(limit: number = 5): ChannelListeners[] {
    return Array.from(this.listenerCounts.values())
      .filter(c => c.trend === 'up')
      .sort((a, b) => b.currentListeners - a.currentListeners)
      .slice(0, limit);
  }
}

// Export singleton instance
export const listenerCountService = new ListenerCountService();
