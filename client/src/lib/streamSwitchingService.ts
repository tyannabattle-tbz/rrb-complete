/**
 * Stream Switching Service
 * Handles intelligent stream switching with quality auto-adjustment
 * based on network conditions and bitrate compatibility
 */

export type QualityLevel = 'low' | 'medium' | 'high' | 'lossless';

interface StreamQualityMap {
  [key: string]: {
    bitrate: number; // in kbps
    url: string;
  };
}

interface SwitchingConfig {
  autoAdjustQuality: boolean;
  minimumBitrate: number; // kbps
  maximumBitrate: number; // kbps
  bufferThreshold: number; // seconds
  switchingDelay: number; // ms to wait before switching
}

interface StreamMetrics {
  currentBitrate: number;
  networkSpeed: number; // kbps
  bufferHealth: number; // 0-100%
  packetLoss: number; // 0-100%
  latency: number; // ms
  recommendedQuality: QualityLevel;
}

class StreamSwitchingService {
  private config: SwitchingConfig = {
    autoAdjustQuality: true,
    minimumBitrate: 64,
    maximumBitrate: 320,
    bufferThreshold: 2,
    switchingDelay: 1000,
  };

  private metrics: StreamMetrics = {
    currentBitrate: 128,
    networkSpeed: 1000,
    bufferHealth: 100,
    packetLoss: 0,
    latency: 50,
    recommendedQuality: 'medium',
  };

  private switchingInProgress = false;
  private lastSwitchTime = 0;
  private qualityHistory: QualityLevel[] = [];

  /**
   * Detect network speed using performance API and estimation
   */
  detectNetworkSpeed(): number {
    // Check if browser supports Network Information API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink || 1;

        // Map effective type to estimated bitrate (Mbps)
        const typeMap: { [key: string]: number } = {
          '4g': downlink * 1000, // Convert Mbps to kbps
          '3g': 2000,
          '2g': 400,
          'slow-2g': 50,
        };

        return typeMap[effectiveType] || 1000;
      }
    }

    // Fallback: estimate based on device capabilities
    return this.estimateNetworkSpeedFallback();
  }

  /**
   * Estimate network speed using device info
   */
  private estimateNetworkSpeedFallback(): number {
    // Check device memory as proxy for network capability
    if ('deviceMemory' in navigator) {
      const memory = (navigator as any).deviceMemory;
      if (memory >= 8) return 5000; // High-end device
      if (memory >= 4) return 2000;
      if (memory >= 2) return 1000;
      return 500;
    }

    // Check if mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    return isMobile ? 1000 : 3000;
  }

  /**
   * Recommend quality level based on network conditions
   */
  recommendQuality(networkSpeed: number, bufferHealth: number): QualityLevel {
    // If buffer is critical, downgrade quality
    if (bufferHealth < 20) {
      return 'low';
    }

    // If buffer is low, use medium
    if (bufferHealth < 50) {
      return 'medium';
    }

    // Map network speed to quality
    if (networkSpeed >= 5000) {
      return 'lossless'; // 320 kbps
    } else if (networkSpeed >= 2000) {
      return 'high'; // 192 kbps
    } else if (networkSpeed >= 500) {
      return 'medium'; // 128 kbps
    } else {
      return 'low'; // 64 kbps
    }
  }

  /**
   * Get bitrate for quality level
   */
  getBitrateForQuality(quality: QualityLevel): number {
    const bitrateMap: { [key in QualityLevel]: number } = {
      low: 64,
      medium: 128,
      high: 192,
      lossless: 320,
    };
    return bitrateMap[quality];
  }

  /**
   * Calculate data usage for streaming
   */
  calculateDataUsage(bitrate: number, durationMinutes: number): number {
    // bitrate in kbps, duration in minutes
    // Result in MB
    return (bitrate * durationMinutes * 60) / 8 / 1024;
  }

  /**
   * Estimate streaming time with available data
   */
  estimateStreamingTime(bitrate: number, availableDataMB: number): number {
    // Result in minutes
    return (availableDataMB * 1024 * 8) / (bitrate * 60);
  }

  /**
   * Switch stream with quality adjustment
   */
  async switchStream(
    audioElement: HTMLAudioElement,
    newStreamUrl: string,
    targetQuality: QualityLevel,
    onProgress?: (status: string) => void
  ): Promise<boolean> {
    if (this.switchingInProgress) {
      onProgress?.('Stream switch already in progress');
      return false;
    }

    // Check if enough time has passed since last switch
    const timeSinceLastSwitch = Date.now() - this.lastSwitchTime;
    if (timeSinceLastSwitch < this.config.switchingDelay) {
      onProgress?.('Waiting before next switch...');
      await new Promise(resolve =>
        setTimeout(resolve, this.config.switchingDelay - timeSinceLastSwitch)
      );
    }

    try {
      this.switchingInProgress = true;
      onProgress?.('Switching stream...');

      const wasPlaying = !audioElement.paused;
      const currentTime = audioElement.currentTime;

      // Pause current stream
      audioElement.pause();
      onProgress?.('Pausing current stream...');

      // Update stream URL
      audioElement.src = newStreamUrl;
      onProgress?.('Loading new stream...');

      // Update metrics
      this.metrics.currentBitrate = this.getBitrateForQuality(targetQuality);
      this.metrics.recommendedQuality = targetQuality;
      this.qualityHistory.push(targetQuality);

      // Keep history size manageable
      if (this.qualityHistory.length > 100) {
        this.qualityHistory.shift();
      }

      // Attempt to resume playback if it was playing
      if (wasPlaying) {
        onProgress?.('Resuming playback...');
        try {
          await audioElement.play();
        } catch (error) {
          onProgress?.('Stream ready (click play to start)');
        }
      }

      this.lastSwitchTime = Date.now();
      onProgress?.(`Switched to ${targetQuality} quality`);
      return true;
    } catch (error) {
      onProgress?.(`Switch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      this.switchingInProgress = false;
    }
  }

  /**
   * Auto-adjust quality based on network conditions
   */
  async autoAdjustQuality(
    audioElement: HTMLAudioElement,
    currentStreamUrl: string,
    qualityMap: StreamQualityMap
  ): Promise<QualityLevel | null> {
    if (!this.config.autoAdjustQuality) {
      return null;
    }

    // Detect current network speed
    const networkSpeed = this.detectNetworkSpeed();
    this.metrics.networkSpeed = networkSpeed;

    // Estimate buffer health (simplified)
    const bufferHealth = audioElement.buffered.length > 0
      ? Math.min(100, (audioElement.buffered.end(audioElement.buffered.length - 1) / 30) * 100)
      : 100;
    this.metrics.bufferHealth = bufferHealth;

    // Get recommendation
    const recommendedQuality = this.recommendQuality(networkSpeed, bufferHealth);

    // Check if we should switch
    if (recommendedQuality !== this.metrics.recommendedQuality) {
      const targetUrl = qualityMap[recommendedQuality]?.url;
      if (targetUrl && targetUrl !== currentStreamUrl) {
        await this.switchStream(audioElement, targetUrl, recommendedQuality);
        return recommendedQuality;
      }
    }

    return null;
  }

  /**
   * Get current streaming metrics
   */
  getMetrics(): StreamMetrics {
    return { ...this.metrics };
  }

  /**
   * Get quality history
   */
  getQualityHistory(): QualityLevel[] {
    return [...this.qualityHistory];
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SwitchingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Reset service state
   */
  reset(): void {
    this.switchingInProgress = false;
    this.lastSwitchTime = 0;
    this.qualityHistory = [];
    this.metrics = {
      currentBitrate: 128,
      networkSpeed: 1000,
      bufferHealth: 100,
      packetLoss: 0,
      latency: 50,
      recommendedQuality: 'medium',
    };
  }
}

// Export singleton instance
export const streamSwitchingService = new StreamSwitchingService();

// Export type for external use
export type { StreamMetrics, SwitchingConfig, StreamQualityMap };
