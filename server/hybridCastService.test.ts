import { describe, it, expect, beforeEach } from 'vitest';
import { HybridCastService } from './_core/hybridCastService';

describe('HybridCastService', () => {
  beforeEach(() => {
    // Reset service state before each test
  });

  describe('getPresets', () => {
    it('should return all available presets', () => {
      const presets = HybridCastService.getPresets();
      expect(presets).toBeDefined();
      expect(Object.keys(presets).length).toBeGreaterThan(0);
      expect(presets.minimal).toBeDefined();
      expect(presets.modern).toBeDefined();
      expect(presets.professional).toBeDefined();
      expect(presets.vibrant).toBeDefined();
    });

    it('should have valid preset structure', () => {
      const presets = HybridCastService.getPresets();
      Object.values(presets).forEach((preset) => {
        expect(preset).toHaveProperty('name');
        expect(preset).toHaveProperty('description');
        expect(preset).toHaveProperty('config');
      });
    });
  });

  describe('createConfig', () => {
    it('should create a valid configuration', () => {
      const config = HybridCastService.createConfig('test-widget', {
        appearance: {
          theme: 'dark',
          primaryColor: '#3B82F6',
          accentColor: '#1e40af',
          borderRadius: 8,
          fontSize: 14,
          fontFamily: 'Arial',
        },
      });

      expect(config).toBeDefined();
      expect(config.widgetId).toBe('test-widget');
      expect(config.appearance.theme).toBe('dark');
      expect(config.appearance.primaryColor).toBe('#3B82F6');
    });

    it('should apply default values for missing options', () => {
      const config = HybridCastService.createConfig('test-widget', {});

      expect(config.appearance.theme).toBeDefined();
      expect(config.appearance.primaryColor).toBeDefined();
      expect(config.behavior).toBeDefined();
    });
  });

  describe('validateConfig', () => {
    it('should validate a correct configuration', () => {
      const config = HybridCastService.createConfig('test-widget', {
        appearance: {
          theme: 'dark',
          primaryColor: '#3B82F6',
          accentColor: '#1e40af',
          borderRadius: 8,
          fontSize: 14,
          fontFamily: 'Arial',
        },
      });

      const validation = HybridCastService.validateConfig(config);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('applyPreset', () => {
    it('should apply minimal preset', () => {
      const config = HybridCastService.applyPreset('minimal');
      expect(config).toBeDefined();
      expect(config.appearance).toBeDefined();
    });

    it('should throw error for unknown preset', () => {
      expect(() => {
        HybridCastService.applyPreset('unknown-preset');
      }).toThrow();
    });
  });

  describe('generateEmbedCode', () => {
    it('should generate valid embed code', () => {
      const config = HybridCastService.createConfig('test-widget', {
        appearance: { theme: 'dark', primaryColor: '#3B82F6', accentColor: '#1e40af', borderRadius: 8, fontSize: 14, fontFamily: 'Arial' },
      });

      const embedCode = HybridCastService.generateEmbedCode(config);
      expect(embedCode).toBeDefined();
      expect(embedCode.scriptTag).toContain('<script');
      expect(embedCode.containerHtml).toContain('hybridcast-widget');
      expect(embedCode.containerHtml).toContain('test-widget');
    });
  });

  describe('exportConfig', () => {
    it('should export configuration as JSON', () => {
      const config = HybridCastService.createConfig('test-widget', {
        appearance: { theme: 'dark', primaryColor: '#3B82F6', accentColor: '#1e40af', borderRadius: 8, fontSize: 14, fontFamily: 'Arial' },
      });

      const json = HybridCastService.exportConfig(config);
      expect(typeof json).toBe('string');

      const parsed = JSON.parse(json);
      expect(parsed.widgetId).toBe('test-widget');
      expect(parsed.appearance.theme).toBe('dark');
    });
  });

  describe('importConfig', () => {
    it('should import configuration from JSON', () => {
      const original = HybridCastService.createConfig('test-widget', {
        appearance: { theme: 'dark', primaryColor: '#3B82F6', accentColor: '#1e40af', borderRadius: 8, fontSize: 14, fontFamily: 'Arial' },
      });

      const json = HybridCastService.exportConfig(original);
      const imported = HybridCastService.importConfig(json);

      expect(imported.widgetId).toBe(original.widgetId);
      expect(imported.appearance.theme).toBe(original.appearance.theme);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => {
        HybridCastService.importConfig('invalid json');
      }).toThrow();
    });
  });

  describe('getConfigStats', () => {
    it('should return configuration statistics', () => {
      const config = HybridCastService.createConfig('test-widget', {});
      const stats = HybridCastService.getConfigStats(config);

      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('complexity');
      expect(stats.size).toBeGreaterThan(0);
    });
  });}
});
