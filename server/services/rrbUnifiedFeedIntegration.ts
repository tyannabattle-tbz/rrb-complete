/**
 * RRB Unified Feed Integration
 * Connects RRB to Ty OS unified feed
 * Handles stream URLs, fallback, and direct site feed
 */

import { tyOSFeedService } from './tyOSUnifiedFeedService';

interface RRBFeedConfig {
  syncInterval: number;
  fallbackStreamUrl: string;
  enableDirectSiteFeed: boolean;
}

class RRBUnifiedFeedIntegration {
  private config: RRBFeedConfig = {
    syncInterval: 2000, // 2 seconds (aggressive sync)
    fallbackStreamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3', // RRB Main Radio fallback
    enableDirectSiteFeed: true,
  };

  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000; // 1 second

  private currentChannel = 1; // Default to RRB Main Radio
  private isStreaming = false;
  private syncTimer: NodeJS.Timeout | null = null;
  private lastSyncTime = Date.now();

  constructor() {
    this.initialize();
  }

  private initialize() {
    console.log('[RRB Feed] Initializing unified feed integration...');
    this.startSync();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Listen to Ty OS feed health checks
    tyOSFeedService.on('health-check', (status) => {
      if (status.isHealthy && !this.isStreaming) {
        console.log('[RRB Feed] Ty OS feed healthy, starting stream...');
        this.startStream();
      } else if (!status.isHealthy && this.isStreaming) {
        console.log('[RRB Feed] Ty OS feed degraded, using fallback stream...');
        this.useFallbackStream();
      }
    });

    tyOSFeedService.on('channel-status-update', (update) => {
      if (update.numericId === this.currentChannel) {
        console.log(`[RRB Feed] Current channel ${update.numericId} status: ${update.status}`);
        if (update.status === 'offline') {
          this.switchToFallback();
        }
      }
    });
  }

  private startSync() {
    if (this.syncTimer) clearInterval(this.syncTimer);

    this.syncTimer = setInterval(() => {
      this.sync();
    }, this.config.syncInterval);

    // Initial sync
    this.sync();
  }

  private sync() {
    try {
      const feed = tyOSFeedService.getFeedForRRB();
      this.lastSyncTime = Date.now();

      if (feed.status === 'healthy') {
        this.isStreaming = true;
        this.reconnectAttempts = 0; // Reset on success
        console.log(`[RRB Feed] Sync successful: ${feed.channels.length} channels available`);
      } else {
        console.log('[RRB Feed] Sync degraded, attempting reconnect...');
        this.attemptReconnect();
      }
    } catch (error) {
      console.error('[RRB Feed] Sync failed:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[RRB Feed] Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      // Exponential backoff: 1s, 2s, 4s, 8s, etc.
      const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
      
      setTimeout(() => {
        this.sync();
      }, delay);
    } else {
      console.warn('[RRB Feed] Max reconnect attempts reached, using fallback');
      this.useFallbackStream();
    }
  }

  private startStream() {
    const channel = tyOSFeedService.getChannel(this.currentChannel);
    if (channel) {
      console.log(`[RRB Feed] Starting stream: ${channel.name} (${channel.streamUrl})`);
      this.isStreaming = true;
    }
  }

  private useFallbackStream() {
    console.log('[RRB Feed] Using fallback stream:', this.config.fallbackStreamUrl);
    this.isStreaming = false;
  }

  private switchToFallback() {
    console.log('[RRB Feed] Switching to fallback channel...');
    this.currentChannel = 1; // RRB Main Radio
    this.useFallbackStream();
  }

  /**
   * Get current stream URL
   */
  getCurrentStreamUrl(): string {
    const channel = tyOSFeedService.getChannel(this.currentChannel);
    if (channel && this.isStreaming) {
      return channel.streamUrl;
    }
    return this.config.fallbackStreamUrl;
  }

  /**
   * Switch to channel by ID
   */
  switchChannel(numericId: number) {
    const channel = tyOSFeedService.getChannel(numericId);
    if (channel) {
      this.currentChannel = numericId;
      console.log(`[RRB Feed] Switched to channel: ${channel.name}`);
      return channel.streamUrl;
    }
    console.warn(`[RRB Feed] Channel ${numericId} not found`);
    return this.config.fallbackStreamUrl;
  }

  /**
   * Get all channels for RRB selection
   */
  getAllChannels() {
    return tyOSFeedService.getFeedForRRB().channels;
  }

  /**
   * Get current channel info
   */
  getCurrentChannel() {
    return tyOSFeedService.getChannel(this.currentChannel);
  }

  /**
   * Get feed for RRB
   */
  getFeed() {
    return {
      ...tyOSFeedService.getFeedForRRB(),
      currentChannel: this.currentChannel,
      currentStreamUrl: this.getCurrentStreamUrl(),
      isStreaming: this.isStreaming,
      lastSync: this.lastSyncTime,
    };
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      isStreaming: this.isStreaming,
      currentChannel: this.currentChannel,
      currentStreamUrl: this.getCurrentStreamUrl(),
      lastSync: this.lastSyncTime,
      syncInterval: this.config.syncInterval,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      tyOSStatus: tyOSFeedService.getSyncStatus(),
    };
  }

  /**
   * Get team radio sync status (for dashboard)
   */
  getTeamRadioSyncStatus() {
    return {
      isStreaming: this.isStreaming,
      currentChannel: this.currentChannel,
      lastSyncTime: this.lastSyncTime,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      streamUrl: this.getCurrentStreamUrl(),
      channels: this.getAllChannels(),
      syncHealthy: this.isStreaming && this.reconnectAttempts === 0,
    };
  }

  /**
   * Force immediate sync
   */
  forceSyncNow() {
    console.log('[RRB Feed] Force sync triggered');
    this.reconnectAttempts = 0; // Reset attempts on manual trigger
    this.sync();
  }

  /**
   * Manually trigger sync
   */
  triggerSync() {
    console.log('[RRB Feed] Manual sync triggered');
    this.sync();
  }

  /**
   * Shutdown
   */
  shutdown() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    console.log('[RRB Feed] Shutdown complete');
  }
}

export const rrbUnifiedFeedIntegration = new RRBUnifiedFeedIntegration();
