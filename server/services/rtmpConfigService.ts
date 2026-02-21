/**
 * RTMP Configuration Service
 * Manages RTMP endpoint configuration and stream output for UN WCS broadcast
 */

interface RTMPEndpoint {
  id: string;
  name: string;
  url: string;
  key: string;
  platform: 'primary' | 'secondary' | 'tertiary';
  isActive: boolean;
  createdAt: number;
  lastTested?: number;
  testResult?: 'success' | 'failed' | 'pending';
}

interface StreamConfig {
  bitrate: number; // kbps
  resolution: string; // e.g., "1920x1080"
  fps: number;
  audioCodec: string;
  videoCodec: string;
  preset: 'ultrafast' | 'fast' | 'medium' | 'slow';
}

interface RTMPTestResult {
  endpoint: string;
  success: boolean;
  latency: number;
  bandwidth: number;
  timestamp: number;
  error?: string;
}

export class RTMPConfigService {
  private endpoints: Map<string, RTMPEndpoint> = new Map();
  private streamConfig: StreamConfig;
  private testResults: RTMPTestResult[] = [];

  constructor() {
    this.streamConfig = {
      bitrate: 5000, // 5 Mbps for 1080p
      resolution: '1920x1080',
      fps: 30,
      audioCodec: 'aac',
      videoCodec: 'h264',
      preset: 'medium',
    };

    this.initializeDefaultEndpoints();
  }

  /**
   * Initialize default RTMP endpoints
   */
  private initializeDefaultEndpoints(): void {
    const defaultEndpoints: RTMPEndpoint[] = [
      {
        id: 'primary-un-wcs',
        name: 'UN WCS Primary',
        url: process.env.PRIMARY_RTMP_URL || 'rtmp://wcs-primary.example.com/live',
        key: process.env.PRIMARY_RTMP_KEY || 'primary-stream-key',
        platform: 'primary',
        isActive: true,
        createdAt: Date.now(),
      },
      {
        id: 'secondary-backup',
        name: 'Secondary Backup',
        url: process.env.SECONDARY_RTMP_URL || 'rtmp://wcs-secondary.example.com/live',
        key: process.env.SECONDARY_RTMP_KEY || 'secondary-stream-key',
        platform: 'secondary',
        isActive: false,
        createdAt: Date.now(),
      },
      {
        id: 'tertiary-backup',
        name: 'Tertiary Backup',
        url: process.env.TERTIARY_RTMP_URL || 'rtmp://wcs-tertiary.example.com/live',
        key: process.env.TERTIARY_RTMP_KEY || 'tertiary-stream-key',
        platform: 'tertiary',
        isActive: false,
        createdAt: Date.now(),
      },
    ];

    defaultEndpoints.forEach(ep => this.endpoints.set(ep.id, ep));
    console.log('[RTMP Config] Initialized with 3 default endpoints');
  }

  /**
   * Add or update RTMP endpoint
   */
  addEndpoint(endpoint: RTMPEndpoint): RTMPEndpoint {
    this.endpoints.set(endpoint.id, endpoint);
    console.log(`[RTMP Config] Added endpoint: ${endpoint.name}`);
    return endpoint;
  }

  /**
   * Get all endpoints
   */
  getAllEndpoints(): RTMPEndpoint[] {
    return Array.from(this.endpoints.values());
  }

  /**
   * Get active endpoint
   */
  getActiveEndpoint(): RTMPEndpoint | null {
    const active = Array.from(this.endpoints.values()).find(ep => ep.isActive);
    return active || null;
  }

  /**
   * Set active endpoint
   */
  setActiveEndpoint(endpointId: string): boolean {
    const endpoint = this.endpoints.get(endpointId);
    if (!endpoint) {
      console.error(`[RTMP Config] Endpoint not found: ${endpointId}`);
      return false;
    }

    // Deactivate all others
    this.endpoints.forEach(ep => {
      ep.isActive = ep.id === endpointId;
    });

    console.log(`[RTMP Config] Set active endpoint: ${endpoint.name}`);
    return true;
  }

  /**
   * Get RTMP URL for streaming
   */
  getRTMPURL(endpointId?: string): string | null {
    const endpoint = endpointId
      ? this.endpoints.get(endpointId)
      : this.getActiveEndpoint();

    if (!endpoint) return null;

    // Format: rtmp://server/app/streamkey
    return `${endpoint.url}/${endpoint.key}`;
  }

  /**
   * Get stream configuration
   */
  getStreamConfig(): StreamConfig {
    return { ...this.streamConfig };
  }

  /**
   * Update stream configuration
   */
  updateStreamConfig(config: Partial<StreamConfig>): StreamConfig {
    this.streamConfig = { ...this.streamConfig, ...config };
    console.log('[RTMP Config] Stream configuration updated', this.streamConfig);
    return this.streamConfig;
  }

  /**
   * Test RTMP endpoint connectivity
   */
  async testEndpoint(endpointId: string): Promise<RTMPTestResult> {
    const endpoint = this.endpoints.get(endpointId);
    if (!endpoint) {
      return {
        endpoint: endpointId,
        success: false,
        latency: 0,
        bandwidth: 0,
        timestamp: Date.now(),
        error: 'Endpoint not found',
      };
    }

    try {
      const startTime = Date.now();
      
      // Simulate RTMP connection test
      const response = await this.simulateRTMPConnection(endpoint.url);
      
      const latency = Date.now() - startTime;
      const testResult: RTMPTestResult = {
        endpoint: endpoint.name,
        success: response.ok,
        latency,
        bandwidth: response.bandwidth || 0,
        timestamp: Date.now(),
      };

      // Update endpoint test result
      endpoint.lastTested = Date.now();
      endpoint.testResult = response.ok ? 'success' : 'failed';

      this.testResults.push(testResult);
      console.log(`[RTMP Config] Test result for ${endpoint.name}:`, testResult);

      return testResult;
    } catch (error) {
      const testResult: RTMPTestResult = {
        endpoint: endpoint.name,
        success: false,
        latency: 0,
        bandwidth: 0,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      endpoint.testResult = 'failed';
      this.testResults.push(testResult);
      console.error(`[RTMP Config] Test failed for ${endpoint.name}:`, error);

      return testResult;
    }
  }

  /**
   * Simulate RTMP connection (in production, use actual RTMP library)
   */
  private async simulateRTMPConnection(url: string): Promise<{ ok: boolean; bandwidth?: number }> {
    return new Promise(resolve => {
      // Simulate network latency
      setTimeout(() => {
        // In production, this would actually connect to RTMP server
        const isHealthy = Math.random() > 0.1; // 90% success rate
        resolve({
          ok: isHealthy,
          bandwidth: isHealthy ? Math.random() * 10000 : 0,
        });
      }, 500);
    });
  }

  /**
   * Get test results
   */
  getTestResults(limit: number = 10): RTMPTestResult[] {
    return this.testResults.slice(-limit);
  }

  /**
   * Get endpoint status summary
   */
  getStatusSummary(): {
    activeEndpoint: RTMPEndpoint | null;
    totalEndpoints: number;
    healthyEndpoints: number;
    lastTestTime?: number;
    streamConfig: StreamConfig;
  } {
    const endpoints = Array.from(this.endpoints.values());
    const healthyEndpoints = endpoints.filter(
      ep => ep.testResult === 'success' || !ep.testResult
    ).length;

    const lastTest = this.testResults[this.testResults.length - 1];

    return {
      activeEndpoint: this.getActiveEndpoint(),
      totalEndpoints: endpoints.length,
      healthyEndpoints,
      lastTestTime: lastTest?.timestamp,
      streamConfig: this.streamConfig,
    };
  }

  /**
   * Generate FFmpeg command for streaming
   */
  generateFFmpegCommand(inputFile: string, endpointId?: string): string {
    const rtmpUrl = this.getRTMPURL(endpointId);
    if (!rtmpUrl) {
      throw new Error('No active RTMP endpoint configured');
    }

    const config = this.streamConfig;

    return `ffmpeg -i "${inputFile}" \
      -c:v ${config.videoCodec} \
      -preset ${config.preset} \
      -b:v ${config.bitrate}k \
      -s ${config.resolution} \
      -r ${config.fps} \
      -c:a ${config.audioCodec} \
      -b:a 128k \
      -f flv "${rtmpUrl}"`;
  }

  /**
   * Generate OBS streaming settings
   */
  generateOBSSettings(endpointId?: string): {
    server: string;
    streamKey: string;
    bitrate: number;
    fps: number;
    resolution: string;
  } {
    const endpoint = endpointId
      ? this.endpoints.get(endpointId)
      : this.getActiveEndpoint();

    if (!endpoint) {
      throw new Error('No RTMP endpoint configured');
    }

    return {
      server: endpoint.url,
      streamKey: endpoint.key,
      bitrate: this.streamConfig.bitrate,
      fps: this.streamConfig.fps,
      resolution: this.streamConfig.resolution,
    };
  }

  /**
   * Validate RTMP URL format
   */
  validateRTMPURL(url: string): boolean {
    const rtmpRegex = /^rtmp[s]?:\/\/[a-zA-Z0-9.-]+\/[a-zA-Z0-9_-]+$/;
    return rtmpRegex.test(url);
  }

  /**
   * Export configuration for backup
   */
  exportConfiguration(): {
    endpoints: RTMPEndpoint[];
    streamConfig: StreamConfig;
    exportedAt: number;
  } {
    return {
      endpoints: Array.from(this.endpoints.values()),
      streamConfig: this.streamConfig,
      exportedAt: Date.now(),
    };
  }

  /**
   * Import configuration from backup
   */
  importConfiguration(config: {
    endpoints: RTMPEndpoint[];
    streamConfig: StreamConfig;
  }): void {
    this.endpoints.clear();
    config.endpoints.forEach(ep => this.endpoints.set(ep.id, ep));
    this.streamConfig = config.streamConfig;
    console.log('[RTMP Config] Configuration imported');
  }
}

// Export singleton instance
export const rtmpConfigService = new RTMPConfigService();
