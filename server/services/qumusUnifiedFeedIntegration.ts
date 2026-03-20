/**
 * QUMUS Unified Feed Integration
 * Connects QUMUS to Ty OS unified feed
 * Handles WebSocket sync, auto-reconnect, and fallback
 */

import { tyOSFeedService } from './tyOSUnifiedFeedService';

interface QUMUSFeedConfig {
  syncInterval: number; // milliseconds
  reconnectDelay: number; // milliseconds
  maxReconnectAttempts: number;
  fallbackChannelId: number; // Default channel if sync fails
}

class QUMUSUnifiedFeedIntegration {
  private config: QUMUSFeedConfig = {
    syncInterval: 2000, // 2 seconds (aggressive sync)
    reconnectDelay: 500, // 500ms (faster reconnect)
    maxReconnectAttempts: 15, // More attempts
    fallbackChannelId: 1, // RRB Main Radio
  };

  private exponentialBackoffMultiplier = 1.5; // Exponential backoff factor

  private isConnected = false;
  private reconnectAttempts = 0;
  private syncTimer: NodeJS.Timeout | null = null;
  private lastSyncTime = Date.now();

  constructor() {
    this.initialize();
  }

  private initialize() {
    console.log('[QUMUS Feed] Initializing unified feed integration...');
    this.startSync();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Listen to Ty OS feed health checks
    tyOSFeedService.on('health-check', (status) => {
      if (status.isHealthy && !this.isConnected) {
        console.log('[QUMUS Feed] Ty OS feed healthy, reconnecting...');
        this.reconnect();
      } else if (!status.isHealthy && this.isConnected) {
        console.log('[QUMUS Feed] Ty OS feed degraded, preparing fallback...');
        this.prepareFallback();
      }
    });

    tyOSFeedService.on('channel-status-update', (update) => {
      console.log(`[QUMUS Feed] Channel ${update.numericId} status: ${update.status}`);
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
      const feed = tyOSFeedService.getFeedForQUMUS();
      this.lastSyncTime = Date.now();

      if (feed.status === 'healthy') {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log(`[QUMUS Feed] Sync successful: ${feed.totalChannels} channels, ${feed.channels.length} available`);
      } else {
        console.log('[QUMUS Feed] Sync degraded, attempting reconnect...');
        this.reconnect();
      }
    } catch (error) {
      console.error('[QUMUS Feed] Sync failed:', error);
      this.reconnect();
    }
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.log('[QUMUS Feed] Max reconnect attempts reached, using fallback...');
      this.useFallback();
      return;
    }

    this.reconnectAttempts++;
    console.log(`[QUMUS Feed] Reconnect attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`);

    setTimeout(() => {
      this.sync();
    }, this.config.reconnectDelay * this.reconnectAttempts);
  }

  private prepareFallback() {
    console.log('[QUMUS Feed] Preparing fallback mode...');
    // Fallback: Use cached channels or local database
  }

  private useFallback() {
    console.log('[QUMUS Feed] Using fallback channel:', this.config.fallbackChannelId);
    this.isConnected = false;
    // Switch to fallback channel
  }

  /**
   * Get current feed for QUMUS
   */
  getCurrentFeed() {
    return {
      ...tyOSFeedService.getFeedForQUMUS(),
      isConnected: this.isConnected,
      lastSync: this.lastSyncTime,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  /**
   * Get specific channel for QUMUS
   */
  getChannel(numericId: number) {
    return tyOSFeedService.getChannel(numericId);
  }

  /**
   * Get channels by genre for QUMUS filtering
   */
  getChannelsByGenre(genre: string) {
    return tyOSFeedService.getChannelsByGenre(genre);
  }

  /**
   * Get all channels for QUMUS
   */
  getAllChannels() {
    return tyOSFeedService.getAllChannels();
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      isConnected: this.isConnected,
      lastSync: this.lastSyncTime,
      reconnectAttempts: this.reconnectAttempts,
      syncInterval: this.config.syncInterval,
      tyOSStatus: tyOSFeedService.getSyncStatus(),
    };
  }

  /**
   * Manually trigger sync
   */
  triggerSync() {
    console.log('[QUMUS Feed] Manual sync triggered');
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
    console.log('[QUMUS Feed] Shutdown complete');
  }
}

export const qumusUnifiedFeedIntegration = new QUMUSUnifiedFeedIntegration();
