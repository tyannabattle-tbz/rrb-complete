import { AutomationEngine } from './automationEngine';
import { ContentSourceIntegration } from './contentSourceIntegration';
import { HybridCastIntegration } from './hybridcastIntegration';
import { notifyOwner } from './notification';

/**
 * RRB (Rockin Rockin Boogie) Ecosystem Integration
 * Connects RRB Radio Station to Qumus scheduling and broadcast systems
 */

export interface RRBStreamConfig {
  stationName: string;
  streamUrl: string;
  bitrate: number;
  format: 'mp3' | 'aac' | 'ogg' | 'flac';
  frequency?: number; // Hz (432, 528, etc.)
  description: string;
}

export interface RRBBroadcastMetrics {
  listeners: number;
  uptime: number;
  bitrate: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  lastUpdate: number;
}

export class RRBEcosystemIntegration {
  private static streamConfig: RRBStreamConfig | null = null;
  private static metrics: RRBBroadcastMetrics | null = null;
  private static isStreaming: boolean = false;
  private static healthCheckInterval: NodeJS.Timeout | null = null;
  private static listeners: Set<(metrics: RRBBroadcastMetrics) => void> = new Set();

  /**
   * Initialize RRB ecosystem
   */
  static async initialize(config: RRBStreamConfig) {
    console.log('[RRBEcosystemIntegration] Initializing RRB ecosystem...');

    this.streamConfig = config;
    this.metrics = {
      listeners: 0,
      uptime: 0,
      bitrate: config.bitrate,
      quality: 'good',
      lastUpdate: Date.now(),
    };

    // Register RRB as content source
    ContentSourceIntegration.registerSource({
      id: 'rrb-radio',
      name: config.stationName,
      type: 'radio',
      url: config.streamUrl,
      metadata: {
        frequency: config.frequency,
        bitrate: config.bitrate,
        format: config.format,
      },
    });

    // Start health checks
    this.startHealthChecks();

    // Connect to automation engine
    await this.connectToAutomationEngine();

    await notifyOwner({
      title: 'RRB Ecosystem Initialized',
      content: `${config.stationName} is now integrated with Qumus scheduling system.`,
    });

    console.log('[RRBEcosystemIntegration] RRB ecosystem initialized successfully');
  }

  /**
   * Connect RRB to Qumus automation engine
   */
  private static async connectToAutomationEngine() {
    const engine = AutomationEngine.getInstance();

    // Subscribe to queue changes
    engine.onQueueChange(() => {
      this.updateStreamMetadata();
    });

    console.log('[RRBEcosystemIntegration] Connected to Qumus automation engine');
  }

  /**
   * Start health checks
   */
  private static startHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 30000); // Check every 30 seconds

    console.log('[RRBEcosystemIntegration] Health checks started');
  }

  /**
   * Perform health check
   */
  private static async performHealthCheck() {
    try {
      if (!this.streamConfig) return;

      // Check stream connectivity
      const response = await fetch(this.streamConfig.streamUrl, {
        method: 'HEAD',
        timeout: 5000,
      }).catch(() => null);

      if (!response) {
        this.updateMetrics({
          quality: 'poor',
          uptime: 0,
        });

        await notifyOwner({
          title: 'RRB Stream Health Alert',
          content: 'RRB radio stream is unreachable. Please check connectivity.',
        });

        return;
      }

      // Update metrics
      this.updateMetrics({
        quality: 'excellent',
        uptime: this.metrics?.uptime || 0 + 30,
      });

      // Notify listeners
      this.notifyListeners();
    } catch (error) {
      console.error('[RRBEcosystemIntegration] Health check error:', error);
    }
  }

  /**
   * Update stream metadata
   */
  private static updateStreamMetadata() {
    if (!this.streamConfig) return;

    const engine = AutomationEngine.getInstance();
    const currentContent = engine.getCurrentContent();

    console.log(`[RRBEcosystemIntegration] Now playing: ${currentContent?.title || 'Unknown'}`);
  }

  /**
   * Update metrics
   */
  private static updateMetrics(partial: Partial<RRBBroadcastMetrics>) {
    if (!this.metrics) return;

    this.metrics = {
      ...this.metrics,
      ...partial,
      lastUpdate: Date.now(),
    };
  }

  /**
   * Set listener count
   */
  static setListenerCount(count: number) {
    this.updateMetrics({ listeners: count });
    this.notifyListeners();
  }

  /**
   * Get current metrics
   */
  static getMetrics(): RRBBroadcastMetrics | null {
    return this.metrics ? { ...this.metrics } : null;
  }

  /**
   * Get stream config
   */
  static getStreamConfig(): RRBStreamConfig | null {
    return this.streamConfig ? { ...this.streamConfig } : null;
  }

  /**
   * Start streaming
   */
  static async startStreaming() {
    if (!this.streamConfig) {
      throw new Error('RRB stream config not initialized');
    }

    this.isStreaming = true;
    this.updateMetrics({ uptime: 0 });

    console.log(`[RRBEcosystemIntegration] Started streaming: ${this.streamConfig.stationName}`);

    await notifyOwner({
      title: 'RRB Streaming Started',
      content: `${this.streamConfig.stationName} is now live on air.`,
    });
  }

  /**
   * Stop streaming
   */
  static async stopStreaming() {
    this.isStreaming = false;

    console.log('[RRBEcosystemIntegration] Stopped streaming');

    await notifyOwner({
      title: 'RRB Streaming Stopped',
      content: 'RRB radio station has gone offline.',
    });
  }

  /**
   * Check if streaming
   */
  static isLive(): boolean {
    return this.isStreaming;
  }

  /**
   * Subscribe to metrics updates
   */
  static subscribe(callback: (metrics: RRBBroadcastMetrics) => void): () => void {
    this.listeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners
   */
  private static notifyListeners() {
    if (!this.metrics) return;

    this.listeners.forEach(callback => {
      try {
        callback(this.metrics!);
      } catch (error) {
        console.error('[RRBEcosystemIntegration] Error notifying listener:', error);
      }
    });
  }

  /**
   * Get status
   */
  static getStatus() {
    return {
      isLive: this.isStreaming,
      config: this.streamConfig,
      metrics: this.metrics,
      listenerCount: this.metrics?.listeners || 0,
      quality: this.metrics?.quality || 'unknown',
    };
  }

  /**
   * Shutdown RRB ecosystem
   */
  static async shutdown() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    await this.stopStreaming();

    console.log('[RRBEcosystemIntegration] RRB ecosystem shutdown complete');
  }

  /**
   * Get broadcast statistics
   */
  static getStatistics() {
    return {
      totalListeners: this.metrics?.listeners || 0,
      uptime: this.metrics?.uptime || 0,
      bitrate: this.metrics?.bitrate || 0,
      quality: this.metrics?.quality || 'unknown',
      frequency: this.streamConfig?.frequency,
      format: this.streamConfig?.format,
      isLive: this.isStreaming,
    };
  }
}

/**
 * Initialize RRB ecosystem with default configuration
 */
export async function initializeRRBEcosystem() {
  const config: RRBStreamConfig = {
    stationName: 'Rockin Rockin Boogie Radio',
    streamUrl: process.env.RRB_STREAM_URL || 'https://stream.rockinrockinboogie.com/live',
    bitrate: 320,
    format: 'mp3',
    frequency: 432, // Healing frequency
    description: 'A legacy restored - Rockin Rockin Boogie Radio Station',
  };

  await RRBEcosystemIntegration.initialize(config);
  return RRBEcosystemIntegration;
}
