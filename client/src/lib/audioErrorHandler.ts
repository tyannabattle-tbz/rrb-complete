/**
 * Audio Error Handler — Comprehensive error detection and recovery
 * 
 * Handles all audio playback errors with:
 * - Specific error identification
 * - User-friendly error messages
 * - Automatic fallback to working streams
 * - Error logging and recovery
 */

export type AudioErrorType = 
  | 'NETWORK_ERROR'
  | 'CORS_ERROR'
  | 'FORMAT_ERROR'
  | 'TIMEOUT_ERROR'
  | 'PERMISSION_ERROR'
  | 'UNKNOWN_ERROR'
  | 'STREAM_UNAVAILABLE';

export interface AudioError {
  type: AudioErrorType;
  message: string;
  originalError?: Error;
  timestamp: Date;
  streamUrl?: string;
}

export interface AudioErrorContext {
  streamUrl: string;
  trackTitle?: string;
  trackArtist?: string;
  channelName?: string;
}

// Fallback streams — reliable SomaFM channels
const FALLBACK_STREAMS = [
  'https://ice1.somafm.com/groovesalad-128-mp3',
  'https://ice1.somafm.com/lush-128-mp3',
  'https://ice1.somafm.com/sonicuniverse-128-mp3',
  'https://ice1.somafm.com/dronezone-128-mp3',
  'https://ice1.somafm.com/deepspaceone-128-mp3',
];

/**
 * Identify the type of audio error
 */
export function identifyAudioError(error: any, context: AudioErrorContext): AudioError {
  const timestamp = new Date();
  
  // Network errors
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('network')) {
    return {
      type: 'NETWORK_ERROR',
      message: `Network error loading stream: ${context.trackTitle || 'Unknown track'}. Check your internet connection.`,
      originalError: error,
      timestamp,
      streamUrl: context.streamUrl,
    };
  }

  // CORS errors
  if (error?.message?.includes('CORS') || error?.message?.includes('cross-origin')) {
    return {
      type: 'CORS_ERROR',
      message: `Stream is not accessible from this location. Trying alternative source...`,
      originalError: error,
      timestamp,
      streamUrl: context.streamUrl,
    };
  }

  // Format errors
  if (error?.code === 'MEDIA_ERR_SRC_NOT_SUPPORTED' || error?.message?.includes('format')) {
    return {
      type: 'FORMAT_ERROR',
      message: `Audio format not supported. Switching to compatible stream...`,
      originalError: error,
      timestamp,
      streamUrl: context.streamUrl,
    };
  }

  // Timeout errors
  if (error?.code === 'MEDIA_ERR_ABORTED' || error?.message?.includes('timeout')) {
    return {
      type: 'TIMEOUT_ERROR',
      message: `Stream connection timed out. Retrying with fallback source...`,
      originalError: error,
      timestamp,
      streamUrl: context.streamUrl,
    };
  }

  // Permission errors
  if (error?.code === 'MEDIA_ERR_PERMISSION' || error?.message?.includes('permission')) {
    return {
      type: 'PERMISSION_ERROR',
      message: `Permission denied. Please allow audio playback in your browser settings.`,
      originalError: error,
      timestamp,
      streamUrl: context.streamUrl,
    };
  }

  // Stream unavailable
  if (error?.code === 'MEDIA_ERR_NETWORK' || error?.status === 404) {
    return {
      type: 'STREAM_UNAVAILABLE',
      message: `Stream unavailable: ${context.trackTitle || 'Unknown track'}. Using alternative source...`,
      originalError: error,
      timestamp,
      streamUrl: context.streamUrl,
    };
  }

  // Unknown error
  return {
    type: 'UNKNOWN_ERROR',
    message: `Playback error: ${error?.message || 'Unknown error'}. Attempting recovery...`,
    originalError: error,
    timestamp,
    streamUrl: context.streamUrl,
  };
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: AudioError): string {
  switch (error.type) {
    case 'NETWORK_ERROR':
      return '🌐 Network Error: Check your internet connection and try again.';
    case 'CORS_ERROR':
      return '🔒 Access Restricted: Stream is not accessible. Using fallback...';
    case 'FORMAT_ERROR':
      return '📻 Format Issue: Switching to compatible audio format...';
    case 'TIMEOUT_ERROR':
      return '⏱️ Connection Timeout: Stream took too long to load. Retrying...';
    case 'PERMISSION_ERROR':
      return '🔐 Permission Denied: Allow audio in browser settings to play.';
    case 'STREAM_UNAVAILABLE':
      return '📡 Stream Unavailable: Using backup stream...';
    default:
      return '❌ Playback Error: Attempting to recover...';
  }
}

/**
 * Get a random fallback stream
 */
export function getFallbackStream(): string {
  return FALLBACK_STREAMS[Math.floor(Math.random() * FALLBACK_STREAMS.length)];
}

/**
 * Validate audio stream URL
 */
export async function validateAudioStream(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return response.status !== 404;
  } catch (error) {
    // CORS or network error — assume stream might be valid
    return true;
  }
}

/**
 * Log audio error for debugging
 */
export function logAudioError(error: AudioError): void {
  const logEntry = {
    timestamp: error.timestamp.toISOString(),
    type: error.type,
    message: error.message,
    streamUrl: error.streamUrl,
    originalError: error.originalError?.message,
  };

  console.error('[Audio Error]', logEntry);

  // Store in localStorage for debugging
  try {
    const logs = JSON.parse(localStorage.getItem('audioErrorLogs') || '[]');
    logs.push(logEntry);
    // Keep only last 50 errors
    if (logs.length > 50) logs.shift();
    localStorage.setItem('audioErrorLogs', JSON.stringify(logs));
  } catch (e) {
    // Ignore localStorage errors
  }
}

/**
 * Get all logged audio errors
 */
export function getAudioErrorLogs(): any[] {
  try {
    return JSON.parse(localStorage.getItem('audioErrorLogs') || '[]');
  } catch {
    return [];
  }
}

/**
 * Clear audio error logs
 */
export function clearAudioErrorLogs(): void {
  try {
    localStorage.removeItem('audioErrorLogs');
  } catch {
    // Ignore
  }
}
