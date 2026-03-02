/**
 * Live Data Integration Service
 * 
 * Connects external data sources to WebSocket channels for real-time streaming
 */

import { getWebSocketManager } from './websocket';

export interface DataSourceConfig {
  name: string;
  type: 'broadcast' | 'drone' | 'fundraising' | 'qumus' | 'recommendation' | 'map';
  endpoint: string;
  channels: string[];
  refreshInterval: number;
  enabled: boolean;
}

export interface DataSourceStatus {
  name: string;
  connected: boolean;
  lastUpdate: Date | null;
  messageCount: number;
  errorCount: number;
  uptime: number;
}

class LiveDataIntegrationService {
  private sources: Map<string, DataSourceConfig> = new Map();
  private status: Map<string, DataSourceStatus> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeDefaultSources();
  }

  /**
   * Initialize default data sources
   */
  private initializeDefaultSources() {
    const defaultSources: DataSourceConfig[] = [
      {
        name: 'RRB Broadcast Service',
        type: 'broadcast',
        endpoint: process.env.RRB_BROADCAST_API || 'http://localhost:3001/api/broadcast',
        channels: ['broadcast:metrics', 'broadcast:engagement', 'broadcast:viewers'],
        refreshInterval: 5000,
        enabled: true,
      },
      {
        name: 'Drone Fleet Service',
        type: 'drone',
        endpoint: process.env.DRONE_API || 'http://localhost:3002/api/fleet',
        channels: ['drone:tracking', 'drone:fleet', 'drone:health'],
        refreshInterval: 3000,
        enabled: true,
      },
      {
        name: 'Fundraising Service',
        type: 'fundraising',
        endpoint: process.env.FUNDRAISING_API || 'http://localhost:3003/api/donations',
        channels: ['fundraising:donations', 'fundraising:impact', 'fundraising:campaigns'],
        refreshInterval: 10000,
        enabled: true,
      },
      {
        name: 'Qumus Orchestration Service',
        type: 'qumus',
        endpoint: process.env.QUMUS_API || 'http://localhost:3004/api/decisions',
        channels: ['qumus:decisions', 'qumus:policies', 'qumus:health'],
        refreshInterval: 2000,
        enabled: true,
      },
      {
        name: 'Content Recommendation Service',
        type: 'recommendation',
        endpoint: process.env.RECOMMENDATION_API || 'http://localhost:3005/api/trending',
        channels: ['recommendations:trending', 'recommendations:personalized'],
        refreshInterval: 15000,
        enabled: true,
      },
      {
        name: 'Map Arsenal Service',
        type: 'map',
        endpoint: process.env.MAP_API || 'http://localhost:3006/api/assets',
        channels: ['map:assets', 'map:incidents'],
        refreshInterval: 4000,
        enabled: true,
      },
    ];

    for (const source of defaultSources) {
      this.registerSource(source);
    }
  }

  /**
   * Register a data source
   */
  public registerSource(config: DataSourceConfig) {
    this.sources.set(config.name, config);
    this.status.set(config.name, {
      name: config.name,
      connected: false,
      lastUpdate: null,
      messageCount: 0,
      errorCount: 0,
      uptime: 0,
    });

    if (config.enabled) {
      this.startSource(config.name);
    }
  }

  /**
   * Start polling a data source
   */
  public startSource(sourceName: string) {
    const config = this.sources.get(sourceName);
    if (!config) return;

    // Clear existing interval if any
    const existingInterval = this.intervals.get(sourceName);
    if (existingInterval) clearInterval(existingInterval);

    // Start polling
    const interval = setInterval(() => {
      this.pollDataSource(sourceName);
    }, config.refreshInterval);

    this.intervals.set(sourceName, interval);

    // Initial poll
    this.pollDataSource(sourceName);
  }

  /**
   * Stop polling a data source
   */
  public stopSource(sourceName: string) {
    const interval = this.intervals.get(sourceName);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(sourceName);
    }
  }

  /**
   * Poll a data source
   */
  private async pollDataSource(sourceName: string) {
    const config = this.sources.get(sourceName);
    const status = this.status.get(sourceName);

    if (!config || !status) return;

    try {
      const response = await fetch(config.endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.DATA_SOURCE_TOKEN || ''}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Broadcast to all channels for this source
      const wsManager = getWebSocketManager();
      if (wsManager) {
        for (const channel of config.channels) {
          wsManager.broadcastStreamData(channel, data);
        }
      }

      // Update status
      status.connected = true;
      status.lastUpdate = new Date();
      status.messageCount++;
    } catch (error) {
      status.connected = false;
      status.errorCount++;
      console.error(`[DataIntegration] Error polling ${sourceName}:`, error);
    }
  }

  /**
   * Get all registered sources
   */
  public getSources(): DataSourceConfig[] {
    return Array.from(this.sources.values());
  }

  /**
   * Get source status
   */
  public getSourceStatus(sourceName: string): DataSourceStatus | undefined {
    return this.status.get(sourceName);
  }

  /**
   * Get all source statuses
   */
  public getAllStatus(): DataSourceStatus[] {
    return Array.from(this.status.values());
  }

  /**
   * Get health summary
   */
  public getHealthSummary() {
    const statuses = Array.from(this.status.values());
    const connected = statuses.filter((s) => s.connected).length;
    const totalMessages = statuses.reduce((sum, s) => sum + s.messageCount, 0);
    const totalErrors = statuses.reduce((sum, s) => sum + s.errorCount, 0);

    return {
      totalSources: statuses.length,
      connectedSources: connected,
      totalMessages,
      totalErrors,
      errorRate: totalMessages > 0 ? (totalErrors / (totalMessages + totalErrors)) * 100 : 0,
      sources: statuses,
    };
  }

  /**
   * Shutdown all sources
   */
  public shutdown() {
    for (const [sourceName] of this.intervals) {
      this.stopSource(sourceName);
    }
  }
}

// Global instance
let integrationService: LiveDataIntegrationService | null = null;

export function initializeLiveDataIntegration(): LiveDataIntegrationService {
  if (!integrationService) {
    integrationService = new LiveDataIntegrationService();
  }
  return integrationService;
}

export function getLiveDataIntegration(): LiveDataIntegrationService | null {
  return integrationService;
}
