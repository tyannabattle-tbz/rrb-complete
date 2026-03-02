/**
 * Adaptive Streaming Service
 * Manages video quality presets and adaptive bitrate streaming
 */

export interface QualityPreset {
  name: string;
  resolution: string;
  width: number;
  height: number;
  bitrate: number; // kbps
  fps: number;
  codec: string;
}

export interface StreamingProfile {
  videoId: string;
  availableQualities: QualityPreset[];
  recommendedQuality: QualityPreset;
  manifestUrl: string;
}

export class AdaptiveStreamingService {
  private qualityPresets: Map<string, QualityPreset> = new Map();

  constructor() {
    this.initializePresets();
  }

  /**
   * Initialize standard quality presets
   */
  private initializePresets(): void {
    const presets: QualityPreset[] = [
      {
        name: '480p',
        resolution: '480p',
        width: 854,
        height: 480,
        bitrate: 1200,
        fps: 24,
        codec: 'h264',
      },
      {
        name: '720p',
        resolution: '720p',
        width: 1280,
        height: 720,
        bitrate: 2500,
        fps: 30,
        codec: 'h264',
      },
      {
        name: '1080p',
        resolution: '1080p',
        width: 1920,
        height: 1080,
        bitrate: 5000,
        fps: 30,
        codec: 'h264',
      },
      {
        name: '1440p',
        resolution: '1440p',
        width: 2560,
        height: 1440,
        bitrate: 8000,
        fps: 30,
        codec: 'h264',
      },
      {
        name: '4K',
        resolution: '4k',
        width: 3840,
        height: 2160,
        bitrate: 15000,
        fps: 30,
        codec: 'h265',
      },
    ];

    presets.forEach((preset) => {
      this.qualityPresets.set(preset.resolution, preset);
    });
  }

  /**
   * Get all available quality presets
   */
  getAvailableQualities(): QualityPreset[] {
    return Array.from(this.qualityPresets.values());
  }

  /**
   * Get quality preset by resolution
   */
  getQualityPreset(resolution: string): QualityPreset | undefined {
    return this.qualityPresets.get(resolution);
  }

  /**
   * Recommend quality based on bandwidth
   */
  recommendQuality(bandwidthMbps: number): QualityPreset {
    const bandwidthKbps = bandwidthMbps * 1000;

    // Recommend quality based on available bandwidth
    if (bandwidthKbps >= 15000) {
      return this.qualityPresets.get('4k')!;
    } else if (bandwidthKbps >= 8000) {
      return this.qualityPresets.get('1440p')!;
    } else if (bandwidthKbps >= 5000) {
      return this.qualityPresets.get('1080p')!;
    } else if (bandwidthKbps >= 2500) {
      return this.qualityPresets.get('720p')!;
    } else {
      return this.qualityPresets.get('480p')!;
    }
  }

  /**
   * Create HLS manifest for adaptive streaming
   */
  createHLSManifest(videoId: string, duration: number): string {
    const qualities = this.getAvailableQualities();

    let manifest = '#EXTM3U\n';
    manifest += '#EXT-X-VERSION:3\n';
    manifest += '#EXT-X-TARGETDURATION:10\n';
    manifest += '#EXT-X-MEDIA-SEQUENCE:0\n';

    // Add variant streams for each quality
    qualities.forEach((quality) => {
      manifest += `#EXT-X-STREAM-INF:BANDWIDTH=${quality.bitrate * 1000},RESOLUTION=${quality.width}x${quality.height}\n`;
      manifest += `/videos/${videoId}-${quality.resolution}.m3u8\n`;
    });

    manifest += '#EXT-X-ENDLIST\n';
    return manifest;
  }

  /**
   * Create DASH manifest for MPEG-DASH streaming
   */
  createDASHManifest(videoId: string, duration: number): string {
    const qualities = this.getAvailableQualities();
    const durationSeconds = Math.ceil(duration);

    let manifest = '<?xml version="1.0" encoding="UTF-8"?>\n';
    manifest += '<MPD xmlns="urn:mpeg:dash:schema:mpd:2011" mediaPresentationDuration="PT' + durationSeconds + 'S" minBufferTime="PT2S" profiles="urn:mpeg:dash:profile:isoff-live:2011" type="static">\n';
    manifest += '  <Period>\n';

    qualities.forEach((quality) => {
      manifest += `    <AdaptationSet mimeType="video/mp4" segmentAlignment="true">\n`;
      manifest += `      <Representation id="${quality.resolution}" bandwidth="${quality.bitrate * 1000}" width="${quality.width}" height="${quality.height}">\n`;
      manifest += `        <BaseURL>/videos/${videoId}-${quality.resolution}.mp4</BaseURL>\n`;
      manifest += `      </Representation>\n`;
      manifest += `    </AdaptationSet>\n`;
    });

    manifest += '  </Period>\n';
    manifest += '</MPD>\n';
    return manifest;
  }

  /**
   * Create streaming profile for a video
   */
  createStreamingProfile(videoId: string, duration: number, requestedResolution?: string): StreamingProfile {
    const availableQualities = this.getAvailableQualities();
    const recommendedQuality = requestedResolution
      ? this.qualityPresets.get(requestedResolution) || this.qualityPresets.get('1080p')!
      : this.qualityPresets.get('1080p')!;

    return {
      videoId,
      availableQualities,
      recommendedQuality,
      manifestUrl: `/manifests/${videoId}.m3u8`,
    };
  }

  /**
   * Calculate transcoding parameters
   */
  getTranscodingParams(sourceResolution: string, targetResolution: string): {
    scale: string;
    bitrate: string;
    fps: number;
  } {
    const source = this.qualityPresets.get(sourceResolution);
    const target = this.qualityPresets.get(targetResolution);

    if (!source || !target) {
      throw new Error(`Invalid resolution: source=${sourceResolution}, target=${targetResolution}`);
    }

    return {
      scale: `${target.width}:${target.height}`,
      bitrate: `${target.bitrate}k`,
      fps: target.fps,
    };
  }

  /**
   * Estimate file size for quality
   */
  estimateFileSize(durationSeconds: number, resolution: string): number {
    const quality = this.qualityPresets.get(resolution);
    if (!quality) return 0;

    // Estimate: bitrate * duration / 8 (convert kbps to bytes)
    return (quality.bitrate * durationSeconds) / 8;
  }

  /**
   * Get streaming recommendations based on device
   */
  getDeviceRecommendations(deviceType: 'mobile' | 'tablet' | 'desktop'): QualityPreset {
    switch (deviceType) {
      case 'mobile':
        return this.qualityPresets.get('480p')!;
      case 'tablet':
        return this.qualityPresets.get('720p')!;
      case 'desktop':
      default:
        return this.qualityPresets.get('1080p')!;
    }
  }
}

export const adaptiveStreamingService = new AdaptiveStreamingService();
