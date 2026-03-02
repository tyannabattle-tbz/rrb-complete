import { describe, it, expect, beforeEach } from 'vitest';
import { VideoWatermarkService } from './_core/videoWatermarkService';

describe('VideoWatermarkService', () => {
  describe('getPresets', () => {
    it('should return all available presets', () => {
      const presets = VideoWatermarkService.getPresets();
      expect(presets).toBeDefined();
      expect(Object.keys(presets).length).toBeGreaterThan(0);
      expect(presets.copyright).toBeDefined();
      expect(presets.branded).toBeDefined();
      expect(presets.minimal).toBeDefined();
      expect(presets.diagonal).toBeDefined();
    });

    it('should have valid preset structure', () => {
      const presets = VideoWatermarkService.getPresets();
      Object.values(presets).forEach((preset) => {
        expect(preset).toHaveProperty('name');
        expect(preset).toHaveProperty('description');
      });
    });
  });

  describe('createLogoWatermark', () => {
    it('should create a valid logo watermark', () => {
      const watermark = VideoWatermarkService.createLogoWatermark(
        'https://example.com/logo.png',
        'top-right',
        {
          width: 100,
          height: 50,
          opacity: 0.8,
        }
      );

      expect(watermark).toBeDefined();
      expect(watermark.type).toBe('logo');
      expect(watermark.logoUrl).toBe('https://example.com/logo.png');
      expect(watermark.position).toBe('top-right');
      expect(watermark.width).toBe(100);
      expect(watermark.height).toBe(50);
      expect(watermark.opacity).toBe(0.8);
    });

    it('should apply default values', () => {
      const watermark = VideoWatermarkService.createLogoWatermark(
        'https://example.com/logo.png'
      );

      expect(watermark.width).toBeGreaterThan(0);
      expect(watermark.height).toBeGreaterThan(0);
      expect(watermark.opacity).toBeGreaterThan(0);
      expect(watermark.scale).toBeGreaterThan(0);
    });
  });

  describe('createTextWatermark', () => {
    it('should create a valid text watermark', () => {
      const watermark = VideoWatermarkService.createTextWatermark(
        'Copyright 2026',
        'bottom-right',
        {
          fontSize: 16,
          fontColor: '#FFFFFF',
          opacity: 0.8,
        }
      );

      expect(watermark).toBeDefined();
      expect(watermark.type).toBe('text');
      expect(watermark.text).toBe('Copyright 2026');
      expect(watermark.position).toBe('bottom-right');
      expect(watermark.fontSize).toBe(16);
      expect(watermark.fontColor).toBe('#FFFFFF');
      expect(watermark.opacity).toBe(0.8);
    });

    it('should apply default values', () => {
      const watermark = VideoWatermarkService.createTextWatermark('Test');

      expect(watermark.fontSize).toBeGreaterThan(0);
      expect(watermark.fontFamily).toBeDefined();
      expect(watermark.fontColor).toBeDefined();
      expect(watermark.opacity).toBeGreaterThan(0);
    });
  });

  describe('validateWatermark', () => {
    it('should validate a correct logo watermark', () => {
      const watermark = VideoWatermarkService.createLogoWatermark(
        'https://example.com/logo.png'
      );

      const validation = VideoWatermarkService.validateWatermark(watermark);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should validate a correct text watermark', () => {
      const watermark = VideoWatermarkService.createTextWatermark('Test');

      const validation = VideoWatermarkService.validateWatermark(watermark);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject invalid opacity', () => {
      const watermark = VideoWatermarkService.createLogoWatermark(
        'https://example.com/logo.png'
      );
      watermark.opacity = 1.5;

      const validation = VideoWatermarkService.validateWatermark(watermark);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid scale', () => {
      const watermark = VideoWatermarkService.createLogoWatermark(
        'https://example.com/logo.png'
      );
      watermark.scale = 2;

      const validation = VideoWatermarkService.validateWatermark(watermark);
      expect(validation.valid).toBe(false);
    });

    it('should reject invalid font color', () => {
      const watermark = VideoWatermarkService.createTextWatermark('Test');
      watermark.fontColor = 'invalid-color';

      const validation = VideoWatermarkService.validateWatermark(watermark);
      expect(validation.valid).toBe(false);
    });

    it('should reject invalid font size', () => {
      const watermark = VideoWatermarkService.createTextWatermark('Test');
      watermark.fontSize = 100;

      const validation = VideoWatermarkService.validateWatermark(watermark);
      expect(validation.valid).toBe(false);
    });
  });

  describe('generateWatermarkSVG', () => {
    it('should generate valid SVG for text watermark', () => {
      const watermark = VideoWatermarkService.createTextWatermark('Test');
      const svg = VideoWatermarkService.generateWatermarkSVG(watermark, 1280, 720);

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('Test');
    });

    it('should include watermark text in SVG', () => {
      const watermark = VideoWatermarkService.createTextWatermark('Copyright 2026');
      const svg = VideoWatermarkService.generateWatermarkSVG(watermark, 1280, 720);

      expect(svg).toContain('Copyright 2026');
    });

    it('should include background color if specified', () => {
      const watermark = VideoWatermarkService.createTextWatermark('Test', 'center', {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      });
      const svg = VideoWatermarkService.generateWatermarkSVG(watermark, 1280, 720);

      expect(svg).toContain('rect');
      expect(svg).toContain('rgba(0, 0, 0, 0.5)');
    });

    it('should include rotation if specified', () => {
      const watermark = VideoWatermarkService.createTextWatermark('Test', 'center', {
        rotation: -45,
      });
      const svg = VideoWatermarkService.generateWatermarkSVG(watermark, 1280, 720);

      expect(svg).toContain('rotate');
      expect(svg).toContain('-45');
    });
  });

  describe('applyPreset', () => {
    it('should apply copyright preset', () => {
      const preset = VideoWatermarkService.applyPreset('copyright');
      expect(preset).toBeDefined();
      expect(preset.name).toBe('Copyright');
    });

    it('should apply branded preset', () => {
      const preset = VideoWatermarkService.applyPreset('branded');
      expect(preset).toBeDefined();
      expect(preset.name).toBe('Branded');
    });

    it('should throw error for unknown preset', () => {
      expect(() => {
        VideoWatermarkService.applyPreset('unknown');
      }).toThrow();
    });
  });

  describe('getPositionCoordinates', () => {
    it('should calculate top-left position', () => {
      const coords = VideoWatermarkService.getPositionCoordinates(
        'top-left',
        1280,
        720,
        100,
        50
      );

      expect(coords.x).toBe(10);
      expect(coords.y).toBe(60);
    });

    it('should calculate top-right position', () => {
      const coords = VideoWatermarkService.getPositionCoordinates(
        'top-right',
        1280,
        720,
        100,
        50
      );

      expect(coords.x).toBe(1170);
      expect(coords.y).toBe(60);
    });

    it('should calculate bottom-left position', () => {
      const coords = VideoWatermarkService.getPositionCoordinates(
        'bottom-left',
        1280,
        720,
        100,
        50
      );

      expect(coords.x).toBe(10);
      expect(coords.y).toBe(710);
    });

    it('should calculate bottom-right position', () => {
      const coords = VideoWatermarkService.getPositionCoordinates(
        'bottom-right',
        1280,
        720,
        100,
        50
      );

      expect(coords.x).toBe(1170);
      expect(coords.y).toBe(710);
    });

    it('should calculate center position', () => {
      const coords = VideoWatermarkService.getPositionCoordinates(
        'center',
        1280,
        720,
        100,
        50
      );

      expect(coords.x).toBe(640);
      expect(coords.y).toBe(360);
    });
  });

  describe('createCompositeWatermark', () => {
    it('should create composite with logo and text', () => {
      const logo = VideoWatermarkService.createLogoWatermark(
        'https://example.com/logo.png'
      );
      const text = VideoWatermarkService.createTextWatermark('Test');

      const composite = VideoWatermarkService.createCompositeWatermark(logo, text);

      expect(composite.logo).toBeDefined();
      expect(composite.text).toBeDefined();
    });

    it('should create composite with only logo', () => {
      const logo = VideoWatermarkService.createLogoWatermark(
        'https://example.com/logo.png'
      );

      const composite = VideoWatermarkService.createCompositeWatermark(logo);

      expect(composite.logo).toBeDefined();
      expect(composite.text).toBeUndefined();
    });

    it('should create composite with only text', () => {
      const text = VideoWatermarkService.createTextWatermark('Test');

      const composite = VideoWatermarkService.createCompositeWatermark(undefined, text);

      expect(composite.logo).toBeUndefined();
      expect(composite.text).toBeDefined();
    });
  });
});
