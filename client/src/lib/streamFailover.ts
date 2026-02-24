/**
 * Automatic Stream Failover Service
 * Detects broken streams and automatically switches to working alternatives
 */

export interface StreamEndpoint {
  url: string;
  format: string;
  bitrate?: number;
  priority?: number;
}

export interface StreamFailoverConfig {
  primary: StreamEndpoint;
  fallbacks: StreamEndpoint[];
  healthCheckInterval?: number;
  maxRetries?: number;
  timeout?: number;
}

class StreamFailoverManager {
  private config: StreamFailoverConfig;
  private currentEndpoint: StreamEndpoint;
  private failoverIndex: number = 0;
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private failureCount: number = 0;
  private listeners: ((endpoint: StreamEndpoint) => void)[] = [];

  constructor(config: StreamFailoverConfig) {
    this.config = {
      healthCheckInterval: 30000, // 30 seconds
      maxRetries: 3,
      timeout: 5000,
      ...config,
    };
    this.currentEndpoint = this.config.primary;
  }

  /**
   * Get the current active endpoint
   */
  getCurrentEndpoint(): StreamEndpoint {
    return this.currentEndpoint;
  }

  /**
   * Check if a stream endpoint is accessible
   */
  async checkStreamHealth(endpoint: StreamEndpoint): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(endpoint.url, {
        method: 'HEAD',
        signal: controller.signal,
      }).catch(() => {
        // Try GET if HEAD fails
        return fetch(endpoint.url, {
          method: 'GET',
          signal: controller.signal,
          headers: { Range: 'bytes=0-1' },
        });
      });

      clearTimeout(timeoutId);
      return response.ok || response.status === 206; // 206 = Partial Content
    } catch (error) {
      return false;
    }
  }

  /**
   * Switch to a fallback endpoint
   */
  async switchToFallback(): Promise<StreamEndpoint | null> {
    const fallbacks = this.config.fallbacks || [];

    for (let i = 0; i < fallbacks.length; i++) {
      const endpoint = fallbacks[i];
      const isHealthy = await this.checkStreamHealth(endpoint);

      if (isHealthy) {
        this.currentEndpoint = endpoint;
        this.failoverIndex = i;
        this.failureCount = 0;
        this.notifyListeners(endpoint);
        console.log(`[Failover] Switched to fallback: ${endpoint.url}`);
        return endpoint;
      }
    }

    console.warn('[Failover] All fallback endpoints failed');
    return null;
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring(): void {
    if (this.healthCheckTimer) return;

    this.healthCheckTimer = setInterval(async () => {
      const isHealthy = await this.checkStreamHealth(this.currentEndpoint);

      if (!isHealthy) {
        this.failureCount++;

        if (this.failureCount >= (this.config.maxRetries || 3)) {
          console.warn(
            `[Failover] Primary endpoint failed ${this.failureCount} times, attempting failover`
          );
          await this.switchToFallback();
        }
      } else {
        this.failureCount = 0;
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  /**
   * Register listener for endpoint changes
   */
  onEndpointChange(listener: (endpoint: StreamEndpoint) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Notify all listeners of endpoint change
   */
  private notifyListeners(endpoint: StreamEndpoint): void {
    this.listeners.forEach(listener => listener(endpoint));
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopHealthMonitoring();
    this.listeners = [];
  }
}

/**
 * Create a failover manager for a stream
 */
export function createStreamFailover(config: StreamFailoverConfig): StreamFailoverManager {
  return new StreamFailoverManager(config);
}

/**
 * Predefined failover configurations for RRB streams
 */
export const RRB_STREAM_FAILOVERS = {
  radioParadise: {
    primary: { url: 'https://stream.radioparadise.com/aac-128', format: 'aac', bitrate: 128 },
    fallbacks: [
      { url: 'https://stream.radioparadise.com/mp3-128', format: 'mp3', bitrate: 128 },
      { url: 'https://stream.radioparadise.com/aac-320', format: 'aac', bitrate: 320 },
    ],
  },
  bbcRadio1: {
    primary: {
      url: 'https://a.files.bbci.co.uk/media/live/manifesto/audio/simulcast/hls/nonuk/llnw/bbc_radio_one.m3u8',
      format: 'hls',
    },
    fallbacks: [
      {
        url: 'https://a.files.bbci.co.uk/media/live/manifesto/audio/simulcast/hls/nonuk/llnw/bbc_radio_one_128k.m3u8',
        format: 'hls',
      },
    ],
  },
  bbcRadio3: {
    primary: {
      url: 'https://a.files.bbci.co.uk/media/live/manifesto/audio/simulcast/hls/nonuk/llnw/bbc_radio_three.m3u8',
      format: 'hls',
    },
    fallbacks: [
      {
        url: 'https://a.files.bbci.co.uk/media/live/manifesto/audio/simulcast/hls/nonuk/llnw/bbc_radio_three_128k.m3u8',
        format: 'hls',
      },
    ],
  },
  franceInter: {
    primary: { url: 'https://direct.franceinter.fr/live/franceinter-midfi.mp3', format: 'mp3' },
    fallbacks: [
      { url: 'https://direct.franceinter.fr/live/franceinter-hifi.mp3', format: 'mp3' },
    ],
  },
  deutschlandfunk: {
    primary: {
      url: 'https://dradio-dlf-live.akamaized.net/hls/live/2043737/dlf/master.m3u8',
      format: 'hls',
    },
    fallbacks: [
      {
        url: 'https://dradio-dlf-live.akamaized.net/hls/live/2043737/dlf/master.m3u8',
        format: 'hls',
      },
    ],
  },
};

export default StreamFailoverManager;
