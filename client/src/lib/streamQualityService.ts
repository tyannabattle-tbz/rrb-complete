/**
 * Stream Quality Selector Service
 * Manages audio bitrate selection and quality preferences
 */

export type StreamQuality = 'low' | 'medium' | 'high' | 'lossless';

export interface QualityOption {
  id: StreamQuality;
  label: string;
  bitrate: number;
  sampleRate: number;
  codec: string;
  bandwidth: string;
  description: string;
}

export interface UserQualityPreference {
  userId: string;
  preferredQuality: StreamQuality;
  autoQuality: boolean;
  maxBandwidth: number; // in kbps
  lastUpdated: number;
}

export const QUALITY_OPTIONS: Record<StreamQuality, QualityOption> = {
  low: {
    id: 'low',
    label: 'Low (Mobile)',
    bitrate: 64,
    sampleRate: 22050,
    codec: 'AAC',
    bandwidth: '~50 kbps',
    description: 'Best for mobile data, minimal bandwidth usage'
  },
  medium: {
    id: 'medium',
    label: 'Medium (Standard)',
    bitrate: 128,
    sampleRate: 44100,
    codec: 'MP3/AAC',
    bandwidth: '~100 kbps',
    description: 'Good quality with moderate bandwidth usage'
  },
  high: {
    id: 'high',
    label: 'High (Premium)',
    bitrate: 192,
    sampleRate: 48000,
    codec: 'AAC/Opus',
    bandwidth: '~150 kbps',
    description: 'High quality audio for better listening experience'
  },
  lossless: {
    id: 'lossless',
    label: 'Lossless (Studio)',
    bitrate: 320,
    sampleRate: 44100,
    codec: 'FLAC',
    bandwidth: '~250 kbps',
    description: 'Studio-quality audio, highest bandwidth usage'
  }
};

/**
 * Get quality option by ID
 */
export function getQualityOption(quality: StreamQuality): QualityOption {
  return QUALITY_OPTIONS[quality];
}

/**
 * Get all quality options
 */
export function getAllQualityOptions(): QualityOption[] {
  return Object.values(QUALITY_OPTIONS);
}

/**
 * Detect user's network speed and recommend quality
 */
export async function detectNetworkSpeed(): Promise<StreamQuality> {
  try {
    // Use Network Information API if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const effectiveType = connection?.effectiveType || '4g';
      const downlink = connection?.downlink || 10;

      // Recommend based on connection type and speed
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        return 'low';
      } else if (effectiveType === '3g') {
        return downlink < 2 ? 'low' : 'medium';
      } else if (effectiveType === '4g') {
        return downlink < 5 ? 'medium' : 'high';
      } else {
        return 'high'; // 5g or better
      }
    }

    // Fallback: assume medium quality
    return 'medium';
  } catch (error) {
    console.error('Error detecting network speed:', error);
    return 'medium';
  }
}

/**
 * Get stream URL with quality parameter
 */
export function getStreamUrlWithQuality(baseUrl: string, quality: StreamQuality): string {
  const qualityOption = QUALITY_OPTIONS[quality];
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}bitrate=${qualityOption.bitrate}`;
}

/**
 * Calculate estimated data usage
 */
export function calculateDataUsage(
  quality: StreamQuality,
  durationMinutes: number
): { bytes: number; mb: number; gb: number } {
  const qualityOption = QUALITY_OPTIONS[quality];
  const kilobitsPerSecond = qualityOption.bitrate;
  const kilobitsTotal = kilobitsPerSecond * durationMinutes * 60;
  const bytes = kilobitsTotal / 8;

  return {
    bytes,
    mb: bytes / (1024 * 1024),
    gb: bytes / (1024 * 1024 * 1024)
  };
}

/**
 * Format data usage for display
 */
export function formatDataUsage(usage: { bytes: number; mb: number; gb: number }): string {
  if (usage.gb >= 1) {
    return `${usage.gb.toFixed(2)} GB`;
  } else if (usage.mb >= 1) {
    return `${usage.mb.toFixed(2)} MB`;
  } else {
    return `${(usage.bytes / 1024).toFixed(2)} KB`;
  }
}

/**
 * Get quality recommendation based on device type
 */
export function getQualityRecommendation(deviceType: 'mobile' | 'tablet' | 'desktop'): StreamQuality {
  switch (deviceType) {
    case 'mobile':
      return 'medium';
    case 'tablet':
      return 'high';
    case 'desktop':
      return 'high';
    default:
      return 'medium';
  }
}

/**
 * Check if quality is available for current bandwidth
 */
export function isQualityAvailable(quality: StreamQuality, availableBandwidth: number): boolean {
  const qualityOption = QUALITY_OPTIONS[quality];
  return availableBandwidth >= qualityOption.bitrate * 1.5; // Add 50% buffer
}

/**
 * Get best quality available for bandwidth
 */
export function getBestQualityForBandwidth(availableBandwidth: number): StreamQuality {
  const qualities: StreamQuality[] = ['lossless', 'high', 'medium', 'low'];

  for (const quality of qualities) {
    if (isQualityAvailable(quality, availableBandwidth)) {
      return quality;
    }
  }

  return 'low'; // Fallback to lowest quality
}

/**
 * Save user quality preference
 */
export function saveQualityPreference(preference: UserQualityPreference): void {
  try {
    localStorage.setItem(
      `quality_preference_${preference.userId}`,
      JSON.stringify({
        ...preference,
        lastUpdated: Date.now()
      })
    );
  } catch (error) {
    console.error('Error saving quality preference:', error);
  }
}

/**
 * Load user quality preference
 */
export function loadQualityPreference(userId: string): UserQualityPreference | null {
  try {
    const stored = localStorage.getItem(`quality_preference_${userId}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading quality preference:', error);
    return null;
  }
}

/**
 * Clear user quality preference
 */
export function clearQualityPreference(userId: string): void {
  try {
    localStorage.removeItem(`quality_preference_${userId}`);
  } catch (error) {
    console.error('Error clearing quality preference:', error);
  }
}

/**
 * Get quality comparison data
 */
export function getQualityComparison(): Array<{
  quality: StreamQuality;
  bitrate: number;
  sampleRate: number;
  codec: string;
  bandwidth: string;
  oneHourUsage: string;
  eightHourUsage: string;
}> {
  return getAllQualityOptions().map(option => {
    const oneHour = calculateDataUsage(option.id, 60);
    const eightHours = calculateDataUsage(option.id, 480);

    return {
      quality: option.id,
      bitrate: option.bitrate,
      sampleRate: option.sampleRate,
      codec: option.codec,
      bandwidth: option.bandwidth,
      oneHourUsage: formatDataUsage(oneHour),
      eightHourUsage: formatDataUsage(eightHours)
    };
  });
}

/**
 * Estimate streaming time with available data
 */
export function estimateStreamingTime(
  quality: StreamQuality,
  availableDataMB: number
): { hours: number; minutes: number } {
  const qualityOption = QUALITY_OPTIONS[quality];
  const kilobitsPerSecond = qualityOption.bitrate;
  const availableKilobits = availableDataMB * 1024 * 8;
  const totalSeconds = availableKilobits / kilobitsPerSecond;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return { hours, minutes };
}
