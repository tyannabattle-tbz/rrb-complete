/**
 * Video Generation and Animation Module for Qumus
 * Handles image-to-video conversion with various animation effects
 */

export type AnimationEffect = 
  | 'kenBurns' 
  | 'panLeft' 
  | 'panRight' 
  | 'zoomIn' 
  | 'zoomOut' 
  | 'rotate' 
  | 'particles' 
  | 'fade' 
  | 'slideIn' 
  | 'slideOut';

export type VideoFormat = 'mp4' | 'webm' | 'gif';

export type VideoQuality = 'low' | 'medium' | 'high' | '4k';

export interface AnimationConfig {
  effect: AnimationEffect;
  duration: number; // in seconds
  intensity: number; // 0-1
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

export interface AudioConfig {
  type: 'music' | 'narration' | 'soundEffect';
  url?: string;
  volume: number; // 0-1
  fadeIn?: number; // in seconds
  fadeOut?: number; // in seconds
  startTime?: number; // in seconds
}

export interface VideoGenerationConfig {
  imageUrl: string;
  duration: number; // total video duration in seconds
  format: VideoFormat;
  quality: VideoQuality;
  animations: AnimationConfig[];
  audio?: AudioConfig[];
  backgroundColor?: string;
  fps?: number; // frames per second (default: 30)
  width?: number; // default: 1920
  height?: number; // default: 1080
  watermark?: boolean;
}

export interface VideoGenerationResult {
  videoUrl: string;
  duration: number;
  format: VideoFormat;
  quality: VideoQuality;
  fileSize: number;
  thumbnail?: string;
  createdAt: Date;
}

/**
 * Ken Burns Effect - Smooth zoom and pan
 */
export function createKenBurnsAnimation(
  duration: number,
  intensity: number = 0.5
): AnimationConfig {
  return {
    effect: 'kenBurns',
    duration,
    intensity,
    easing: 'easeInOut',
  };
}

/**
 * Particle Effect - Floating particles with parallax
 */
export function createParticleAnimation(
  duration: number,
  intensity: number = 0.7
): AnimationConfig {
  return {
    effect: 'particles',
    duration,
    intensity,
    easing: 'linear',
  };
}

/**
 * Zoom In Effect - Gradual zoom from 0.8x to 1.2x
 */
export function createZoomInAnimation(
  duration: number,
  intensity: number = 0.6
): AnimationConfig {
  return {
    effect: 'zoomIn',
    duration,
    intensity,
    easing: 'easeOut',
  };
}

/**
 * Pan Effect - Smooth panning across image
 */
export function createPanAnimation(
  direction: 'left' | 'right',
  duration: number,
  intensity: number = 0.5
): AnimationConfig {
  return {
    effect: direction === 'left' ? 'panLeft' : 'panRight',
    duration,
    intensity,
    easing: 'linear',
  };
}

/**
 * Fade Effect - Smooth fade in/out
 */
export function createFadeAnimation(
  duration: number,
  intensity: number = 1
): AnimationConfig {
  return {
    effect: 'fade',
    duration,
    intensity,
    easing: 'easeInOut',
  };
}

/**
 * Rotate Effect - Slow rotation
 */
export function createRotateAnimation(
  duration: number,
  intensity: number = 0.3
): AnimationConfig {
  return {
    effect: 'rotate',
    duration,
    intensity,
    easing: 'linear',
  };
}

/**
 * Create background music configuration
 */
export function createMusicAudio(
  url: string,
  volume: number = 0.5,
  fadeIn?: number,
  fadeOut?: number
): AudioConfig {
  return {
    type: 'music',
    url,
    volume,
    fadeIn,
    fadeOut,
  };
}

/**
 * Create narration configuration
 */
export function createNarrationAudio(
  url: string,
  volume: number = 0.8,
  startTime: number = 0
): AudioConfig {
  return {
    type: 'narration',
    url,
    volume,
    startTime,
  };
}

/**
 * Create sound effect configuration
 */
export function createSoundEffectAudio(
  url: string,
  volume: number = 0.6,
  startTime: number = 0
): AudioConfig {
  return {
    type: 'soundEffect',
    url,
    volume,
    startTime,
  };
}

/**
 * Preset: Cinematic Dragon
 * Perfect for fantasy/dragon images
 */
export function createCinematicDragonPreset(
  imageUrl: string,
  duration: number = 8
): VideoGenerationConfig {
  return {
    imageUrl,
    duration,
    format: 'mp4',
    quality: '4k',
    animations: [
      createKenBurnsAnimation(duration * 0.4, 0.6),
      createParticleAnimation(duration * 0.6, 0.8),
    ],
    audio: [
      createMusicAudio('', 0.5, 1, 1), // URL to be filled by user
    ],
    backgroundColor: '#1a1a1a',
    fps: 30,
    width: 1920,
    height: 1080,
    watermark: true,
  };
}

/**
 * Preset: Magical Particles
 * Floating particles with zoom effect
 */
export function createMagicalParticlesPreset(
  imageUrl: string,
  duration: number = 8
): VideoGenerationConfig {
  return {
    imageUrl,
    duration,
    format: 'mp4',
    quality: 'high',
    animations: [
      createZoomInAnimation(duration, 0.5),
      createParticleAnimation(duration, 1),
    ],
    backgroundColor: '#0a0a0a',
    fps: 30,
    width: 1920,
    height: 1080,
    watermark: true,
  };
}

/**
 * Preset: Epic Pan
 * Smooth panning with rotation
 */
export function createEpicPanPreset(
  imageUrl: string,
  duration: number = 8
): VideoGenerationConfig {
  return {
    imageUrl,
    duration,
    format: 'mp4',
    quality: 'high',
    animations: [
      createPanAnimation('left', duration * 0.5, 0.7),
      createRotateAnimation(duration * 0.5, 0.2),
    ],
    backgroundColor: '#000000',
    fps: 30,
    width: 1920,
    height: 1080,
    watermark: true,
  };
}

/**
 * Preset: Fade Transition
 * Smooth fade in and out
 */
export function createFadeTransitionPreset(
  imageUrl: string,
  duration: number = 6
): VideoGenerationConfig {
  return {
    imageUrl,
    duration,
    format: 'mp4',
    quality: 'medium',
    animations: [
      createFadeAnimation(duration * 0.3, 1),
      createKenBurnsAnimation(duration * 0.4, 0.3),
      createFadeAnimation(duration * 0.3, 1),
    ],
    backgroundColor: '#1a1a1a',
    fps: 30,
    width: 1920,
    height: 1080,
    watermark: false,
  };
}

/**
 * Generate video from configuration
 * This will call the backend API to process the video
 */
export async function generateVideo(
  config: VideoGenerationConfig
): Promise<VideoGenerationResult> {
  try {
    const response = await fetch('/api/trpc/video.generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Video generation failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('[VideoGeneration] Error:', error);
    throw error;
  }
}

/**
 * Get video generation presets
 */
export function getVideoPresets() {
  return {
    cinematicDragon: {
      name: 'Cinematic Dragon',
      description: 'Perfect for fantasy/dragon images with Ken Burns and particles',
      create: createCinematicDragonPreset,
    },
    magicalParticles: {
      name: 'Magical Particles',
      description: 'Floating particles with smooth zoom effect',
      create: createMagicalParticlesPreset,
    },
    epicPan: {
      name: 'Epic Pan',
      description: 'Smooth panning with rotation for dramatic effect',
      create: createEpicPanPreset,
    },
    fadeTransition: {
      name: 'Fade Transition',
      description: 'Smooth fade in and out with subtle movement',
      create: createFadeTransitionPreset,
    },
  };
}

/**
 * Estimate video file size based on configuration
 */
export function estimateFileSize(config: VideoGenerationConfig): number {
  const baseSizes = {
    '4k': 50, // MB per second
    'high': 25,
    'medium': 12,
    'low': 6,
  };

  const qualitySize = baseSizes[config.quality];
  const estimatedSize = qualitySize * config.duration;

  return Math.round(estimatedSize);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
