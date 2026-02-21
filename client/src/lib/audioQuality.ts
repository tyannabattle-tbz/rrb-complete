/**
 * Audio Quality Service
 * Manages audio bitrate selection and stream URL generation
 */

export type AudioQuality = '128' | '192' | '320';

export interface QualityOption {
  value: AudioQuality;
  label: string;
  description: string;
  bitrate: number;
  fileSize: string;
}

const QUALITY_OPTIONS: Record<AudioQuality, QualityOption> = {
  '128': {
    value: '128',
    label: '128 kbps',
    description: 'Low quality, minimal data usage',
    bitrate: 128,
    fileSize: '~0.9 MB/min',
  },
  '192': {
    value: '192',
    label: '192 kbps',
    description: 'Balanced quality and data usage',
    bitrate: 192,
    fileSize: '~1.4 MB/min',
  },
  '320': {
    value: '320',
    label: '320 kbps',
    description: 'High quality, best audio fidelity',
    bitrate: 320,
    fileSize: '~2.4 MB/min',
  },
};

const QUALITY_STORAGE_KEY = 'rrb_audio_quality';
const DEFAULT_QUALITY: AudioQuality = '192';

/**
 * Get all available quality options
 */
export function getQualityOptions(): QualityOption[] {
  return Object.values(QUALITY_OPTIONS);
}

/**
 * Get current selected quality
 */
export function getCurrentQuality(): AudioQuality {
  try {
    const stored = localStorage.getItem(QUALITY_STORAGE_KEY);
    if (stored && (stored === '128' || stored === '192' || stored === '320')) {
      return stored as AudioQuality;
    }
  } catch (error) {
    console.error('Error reading quality preference:', error);
  }
  return DEFAULT_QUALITY;
}

/**
 * Set audio quality preference
 */
export function setQuality(quality: AudioQuality): boolean {
  try {
    if (!QUALITY_OPTIONS[quality]) {
      console.warn(`Invalid quality: ${quality}`);
      return false;
    }
    localStorage.setItem(QUALITY_STORAGE_KEY, quality);
    return true;
  } catch (error) {
    console.error('Error setting quality:', error);
    return false;
  }
}

/**
 * Get quality option details
 */
export function getQualityDetails(quality: AudioQuality): QualityOption {
  return QUALITY_OPTIONS[quality] || QUALITY_OPTIONS[DEFAULT_QUALITY];
}

/**
 * Convert SomaFM URL to specific quality
 * SomaFM URLs follow pattern: https://ice1.somafm.com/{channel}-{quality}-mp3
 */
export function convertStreamUrl(baseUrl: string, quality: AudioQuality): string {
  // If URL already has quality specified, replace it
  const qualityPattern = /-(?:128|192|320)-mp3$/;
  if (qualityPattern.test(baseUrl)) {
    return baseUrl.replace(qualityPattern, `-${quality}-mp3`);
  }
  
  // If URL doesn't have quality, append it
  if (baseUrl.endsWith('-mp3')) {
    return baseUrl.replace(/-mp3$/, `-${quality}-mp3`);
  }
  
  // Fallback: just append quality
  return `${baseUrl}-${quality}-mp3`;
}

/**
 * Get estimated data usage for listening duration
 */
export function estimateDataUsage(quality: AudioQuality, durationMinutes: number): string {
  const option = QUALITY_OPTIONS[quality];
  const mbPerMinute = option.bitrate / 8 / 1024; // Convert kbps to MB/min
  const totalMB = (mbPerMinute * durationMinutes).toFixed(1);
  return `~${totalMB} MB`;
}

/**
 * Recommend quality based on connection type
 */
export function recommendQuality(connectionType: '4g' | '3g' | 'wifi' | 'unknown'): AudioQuality {
  switch (connectionType) {
    case 'wifi':
      return '320';
    case '4g':
      return '192';
    case '3g':
      return '128';
    default:
      return DEFAULT_QUALITY;
  }
}

/**
 * Get connection type (requires Network Information API)
 */
export function getConnectionType(): '4g' | '3g' | 'wifi' | 'unknown' {
  if (typeof navigator === 'undefined') return 'unknown';
  
  // @ts-ignore - Network Information API not in standard types
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) return 'unknown';
  
  const effectiveType = connection.effectiveType;
  if (effectiveType === '4g') return '4g';
  if (effectiveType === '3g') return '3g';
  if (effectiveType === '2g') return '3g';
  
  return 'unknown';
}
