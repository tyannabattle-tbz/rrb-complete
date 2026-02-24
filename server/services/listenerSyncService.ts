/**
 * Real-time Listener Sync Service
 * Fetches live listener counts from SomaFM API every 30 seconds
 */

import { RRB_RADIO_CHANNELS } from '@/lib/rrbRadioStations';

export interface ListenerUpdate {
  channelId: string;
  channelName: string;
  listeners: number;
  timestamp: number;
  trending: boolean;
}

class ListenerSyncService {
  private updateInterval: NodeJS.Timer | null = null;
  private lastUpdate: Map<string, number> = new Map();
  private listenerHistory: Map<string, number[]> = new Map();
  private maxHistoryLength = 288; // 24 hours at 5-min intervals

  /**
   * Start syncing listener counts from SomaFM
   */
  public start() {
    if (this.updateInterval) return;

    console.log('[ListenerSync] Starting listener sync service');
    this.updateListeners();
    
    // Update every 30 seconds
    this.updateInterval = setInterval(() => {
      this.updateListeners();
    }, 30000);
  }

  /**
   * Stop syncing listener counts
   */
  public stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('[ListenerSync] Stopped listener sync service');
    }
  }

  /**
   * Fetch live listener counts from SomaFM
   */
  private async updateListeners() {
    try {
      const updates: ListenerUpdate[] = [];

      // Map SomaFM channel IDs to RRB channels
      const somaFmChannels = [
        { rrbId: 'jazz-paradise', somaId: 'lush' },
        { rrbId: 'smooth-jazz', somaId: 'sonicuniverse' },
        { rrbId: 'jazz-fusion', somaId: 'secretagent' },
        { rrbId: 'blues-hour', somaId: 'deepspaceone' },
        { rrbId: 'delta-blues', somaId: 'bootliquor' },
        { rrbId: 'soul-legends', somaId: 'groovesalad' },
        { rrbId: 'funk-central', somaId: 'poptron' },
        { rrbId: 'groove-station', somaId: 'cliqhop' },
        { rrbId: 'rock-legends', somaId: 'radioparadise' },
      ];

      // Fetch listener counts from SomaFM
      for (const mapping of somaFmChannels) {
        try {
          const response = await fetch(`https://somafm.com/channels/${mapping.somaId}/info.json`);
          if (response.ok) {
            const data = await response.json();
            const listeners = data.listeners || 0;
            
            const rrbChannel = RRB_RADIO_CHANNELS.find(ch => ch.id === mapping.rrbId);
            if (rrbChannel) {
              // Track listener history for trending calculation
              this.addToHistory(mapping.rrbId, listeners);
              
              const isTrending = this.isTrending(mapping.rrbId, listeners);
              
              updates.push({
                channelId: mapping.rrbId,
                channelName: rrbChannel.name,
                listeners,
                timestamp: Date.now(),
                trending: isTrending,
              });

              this.lastUpdate.set(mapping.rrbId, listeners);
            }
          }
        } catch (err) {
          console.error(`[ListenerSync] Failed to fetch ${mapping.somaId}:`, err);
        }
      }

      // Add static channels with simulated listeners
      const staticChannels = RRB_RADIO_CHANNELS.filter(
        ch => !somaFmChannels.some(s => s.rrbId === ch.id)
      );

      for (const channel of staticChannels) {
        // Simulate listener fluctuation for static channels
        const baseListeners = channel.listeners || 1000;
        const variance = Math.floor(Math.random() * (baseListeners * 0.2));
        const listeners = baseListeners + variance - (baseListeners * 0.1);

        this.addToHistory(channel.id, listeners);
        const isTrending = this.isTrending(channel.id, listeners);

        updates.push({
          channelId: channel.id,
          channelName: channel.name,
          listeners: Math.max(0, listeners),
          timestamp: Date.now(),
          trending: isTrending,
        });

        this.lastUpdate.set(channel.id, listeners);
      }

      // Broadcast updates via WebSocket or store in cache
      this.cacheUpdates(updates);
    } catch (err) {
      console.error('[ListenerSync] Update failed:', err);
    }
  }

  /**
   * Add listener count to history for trending calculation
   */
  private addToHistory(channelId: string, listeners: number) {
    if (!this.listenerHistory.has(channelId)) {
      this.listenerHistory.set(channelId, []);
    }

    const history = this.listenerHistory.get(channelId)!;
    history.push(listeners);

    // Keep only recent history
    if (history.length > this.maxHistoryLength) {
      history.shift();
    }
  }

  /**
   * Determine if channel is trending (increasing listeners)
   */
  private isTrending(channelId: string, currentListeners: number): boolean {
    const history = this.listenerHistory.get(channelId);
    if (!history || history.length < 2) return false;

    // Check if listeners increased in last 3 updates
    const recentHistory = history.slice(-3);
    const trend = recentHistory[recentHistory.length - 1] > recentHistory[0];
    
    return trend;
  }

  /**
   * Cache updates for API retrieval
   */
  private cacheUpdates(updates: ListenerUpdate[]) {
    // Store in memory cache (could be Redis in production)
    this.lastUpdate.clear();
    for (const update of updates) {
      this.lastUpdate.set(update.channelId, update.listeners);
    }
  }

  /**
   * Get current listener counts for all channels
   */
  public getListenerCounts(): Map<string, number> {
    return new Map(this.lastUpdate);
  }

  /**
   * Get trending channels
   */
  public getTrendingChannels(limit = 5): ListenerUpdate[] {
    const trending: ListenerUpdate[] = [];

    for (const [channelId, listeners] of this.lastUpdate) {
      const channel = RRB_RADIO_CHANNELS.find(ch => ch.id === channelId);
      if (channel && this.isTrending(channelId, listeners)) {
        trending.push({
          channelId,
          channelName: channel.name,
          listeners,
          timestamp: Date.now(),
          trending: true,
        });
      }
    }

    return trending.sort((a, b) => b.listeners - a.listeners).slice(0, limit);
  }

  /**
   * Get listener statistics for a channel
   */
  public getChannelStats(channelId: string) {
    const history = this.listenerHistory.get(channelId) || [];
    if (history.length === 0) return null;

    const current = history[history.length - 1];
    const average = history.reduce((a, b) => a + b, 0) / history.length;
    const peak = Math.max(...history);
    const low = Math.min(...history);
    const trend = this.isTrending(channelId, current);

    return {
      channelId,
      current,
      average: Math.round(average),
      peak,
      low,
      trend,
      historyLength: history.length,
    };
  }
}

// Singleton instance
export const listenerSyncService = new ListenerSyncService();
