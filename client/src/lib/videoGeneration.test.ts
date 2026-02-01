import { describe, it, expect } from 'vitest';
import {
  createKenBurnsAnimation,
  createParticleAnimation,
  createZoomInAnimation,
  createPanAnimation,
  createFadeAnimation,
  createRotateAnimation,
  createMusicAudio,
  createNarrationAudio,
  createSoundEffectAudio,
  createCinematicDragonPreset,
  createMagicalParticlesPreset,
  createEpicPanPreset,
  createFadeTransitionPreset,
  estimateFileSize,
  formatFileSize,
  getVideoPresets,
} from './videoGeneration';

describe('Video Generation Module', () => {
  describe('Animation Effects', () => {
    it('should create Ken Burns animation', () => {
      const anim = createKenBurnsAnimation(8, 0.6);
      expect(anim.effect).toBe('kenBurns');
      expect(anim.duration).toBe(8);
      expect(anim.intensity).toBe(0.6);
      expect(anim.easing).toBe('easeInOut');
    });

    it('should create particle animation', () => {
      const anim = createParticleAnimation(6, 0.8);
      expect(anim.effect).toBe('particles');
      expect(anim.duration).toBe(6);
      expect(anim.intensity).toBe(0.8);
      expect(anim.easing).toBe('linear');
    });

    it('should create zoom in animation', () => {
      const anim = createZoomInAnimation(5, 0.5);
      expect(anim.effect).toBe('zoomIn');
      expect(anim.duration).toBe(5);
      expect(anim.easing).toBe('easeOut');
    });

    it('should create pan left animation', () => {
      const anim = createPanAnimation('left', 4, 0.7);
      expect(anim.effect).toBe('panLeft');
      expect(anim.duration).toBe(4);
    });

    it('should create pan right animation', () => {
      const anim = createPanAnimation('right', 4, 0.7);
      expect(anim.effect).toBe('panRight');
    });

    it('should create fade animation', () => {
      const anim = createFadeAnimation(3, 1);
      expect(anim.effect).toBe('fade');
      expect(anim.easing).toBe('easeInOut');
    });

    it('should create rotate animation', () => {
      const anim = createRotateAnimation(8, 0.3);
      expect(anim.effect).toBe('rotate');
      expect(anim.easing).toBe('linear');
    });
  });

  describe('Audio Configuration', () => {
    it('should create music audio', () => {
      const audio = createMusicAudio('music.mp3', 0.5, 1, 1);
      expect(audio.type).toBe('music');
      expect(audio.url).toBe('music.mp3');
      expect(audio.volume).toBe(0.5);
      expect(audio.fadeIn).toBe(1);
      expect(audio.fadeOut).toBe(1);
    });

    it('should create narration audio', () => {
      const audio = createNarrationAudio('narration.mp3', 0.8, 2);
      expect(audio.type).toBe('narration');
      expect(audio.volume).toBe(0.8);
      expect(audio.startTime).toBe(2);
    });

    it('should create sound effect audio', () => {
      const audio = createSoundEffectAudio('effect.mp3', 0.6, 1);
      expect(audio.type).toBe('soundEffect');
      expect(audio.volume).toBe(0.6);
      expect(audio.startTime).toBe(1);
    });
  });

  describe('Video Presets', () => {
    it('should create cinematic dragon preset', () => {
      const preset = createCinematicDragonPreset('image.jpg', 8);
      expect(preset.imageUrl).toBe('image.jpg');
      expect(preset.duration).toBe(8);
      expect(preset.format).toBe('mp4');
      expect(preset.quality).toBe('4k');
      expect(preset.animations.length).toBe(2);
      expect(preset.watermark).toBe(true);
    });

    it('should create magical particles preset', () => {
      const preset = createMagicalParticlesPreset('image.jpg', 8);
      expect(preset.format).toBe('mp4');
      expect(preset.quality).toBe('high');
      expect(preset.animations.length).toBe(2);
    });

    it('should create epic pan preset', () => {
      const preset = createEpicPanPreset('image.jpg', 8);
      expect(preset.animations.length).toBe(2);
      expect(preset.animations[0].effect).toBe('panLeft');
    });

    it('should create fade transition preset', () => {
      const preset = createFadeTransitionPreset('image.jpg', 6);
      expect(preset.duration).toBe(6);
      expect(preset.animations.length).toBe(3);
      expect(preset.watermark).toBe(false);
    });
  });

  describe('File Size Estimation', () => {
    it('should estimate 4K file size', () => {
      const config = {
        imageUrl: 'image.jpg',
        duration: 10,
        format: 'mp4' as const,
        quality: '4k' as const,
        animations: [],
      };
      const size = estimateFileSize(config);
      expect(size).toBe(500); // 50 MB/s * 10s
    });

    it('should estimate high quality file size', () => {
      const config = {
        imageUrl: 'image.jpg',
        duration: 10,
        format: 'mp4' as const,
        quality: 'high' as const,
        animations: [],
      };
      const size = estimateFileSize(config);
      expect(size).toBe(250); // 25 MB/s * 10s
    });

    it('should estimate medium quality file size', () => {
      const config = {
        imageUrl: 'image.jpg',
        duration: 10,
        format: 'mp4' as const,
        quality: 'medium' as const,
        animations: [],
      };
      const size = estimateFileSize(config);
      expect(size).toBe(120); // 12 MB/s * 10s
    });

    it('should estimate low quality file size', () => {
      const config = {
        imageUrl: 'image.jpg',
        duration: 10,
        format: 'mp4' as const,
        quality: 'low' as const,
        animations: [],
      };
      const size = estimateFileSize(config);
      expect(size).toBe(60); // 6 MB/s * 10s
    });
  });

  describe('File Size Formatting', () => {
    it('should format bytes', () => {
      expect(formatFileSize(512)).toBe('512 Bytes');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should handle zero bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });
  });

  describe('Presets Registry', () => {
    it('should return all presets', () => {
      const presets = getVideoPresets();
      expect(Object.keys(presets)).toContain('cinematicDragon');
      expect(Object.keys(presets)).toContain('magicalParticles');
      expect(Object.keys(presets)).toContain('epicPan');
      expect(Object.keys(presets)).toContain('fadeTransition');
    });

    it('should have preset metadata', () => {
      const presets = getVideoPresets();
      const preset = presets.cinematicDragon;
      expect(preset.name).toBe('Cinematic Dragon');
      expect(preset.description).toBeTruthy();
      expect(typeof preset.create).toBe('function');
    });
  });
});
