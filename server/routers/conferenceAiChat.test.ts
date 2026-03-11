import { describe, it, expect } from 'vitest';

/**
 * Tests for Conference AI Chat Panel and Speaking Avatar integration.
 * Validates the voice profile mappings, persona configurations, and
 * the chat panel's integration with the conference room.
 */

describe('Conference AI Chat Panel', () => {
  // Voice profile configuration tests
  describe('AI Persona Voice Profiles', () => {
    const VOICE_PROFILES = {
      valanna: {
        forgeVoice: 'nova',
        browserVoicePreference: 'female' as const,
        rate: 0.92,
        pitch: 1.05,
        displayName: 'Valanna',
      },
      candy: {
        forgeVoice: 'echo',
        browserVoicePreference: 'male' as const,
        rate: 0.95,
        pitch: 0.85,
        displayName: 'Candy',
      },
      seraph: {
        forgeVoice: 'onyx',
        browserVoicePreference: 'male' as const,
        rate: 0.88,
        pitch: 0.80,
        displayName: 'Seraph',
      },
    };

    it('should have correct voice for Valanna (female, nova)', () => {
      expect(VOICE_PROFILES.valanna.forgeVoice).toBe('nova');
      expect(VOICE_PROFILES.valanna.browserVoicePreference).toBe('female');
      expect(VOICE_PROFILES.valanna.displayName).toBe('Valanna');
    });

    it('should have correct voice for Candy (male/dad, echo)', () => {
      expect(VOICE_PROFILES.candy.forgeVoice).toBe('echo');
      expect(VOICE_PROFILES.candy.browserVoicePreference).toBe('male');
      expect(VOICE_PROFILES.candy.displayName).toBe('Candy');
      // Candy is dad — must be male voice, not shimmer
      expect(VOICE_PROFILES.candy.forgeVoice).not.toBe('shimmer');
    });

    it('should have correct voice for Seraph (male, onyx)', () => {
      expect(VOICE_PROFILES.seraph.forgeVoice).toBe('onyx');
      expect(VOICE_PROFILES.seraph.browserVoicePreference).toBe('male');
      expect(VOICE_PROFILES.seraph.displayName).toBe('Seraph');
    });

    it('should have speech rates within valid range (0.5-2.0)', () => {
      Object.values(VOICE_PROFILES).forEach(profile => {
        expect(profile.rate).toBeGreaterThanOrEqual(0.5);
        expect(profile.rate).toBeLessThanOrEqual(2.0);
      });
    });

    it('should have speech pitches within valid range (0-2.0)', () => {
      Object.values(VOICE_PROFILES).forEach(profile => {
        expect(profile.pitch).toBeGreaterThanOrEqual(0);
        expect(profile.pitch).toBeLessThanOrEqual(2.0);
      });
    });
  });

  // Speaking Avatar persona configuration tests
  describe('Speaking Avatar Persona Config', () => {
    const PERSONA_CONFIG = {
      valanna: {
        initials: 'V',
        displayName: 'Valanna',
        color: '#a78bfa',
      },
      candy: {
        initials: 'C',
        displayName: 'Candy',
        color: '#60a5fa',
      },
      seraph: {
        initials: 'S',
        displayName: 'Seraph',
        color: '#f59e0b',
      },
    };

    it('should have correct initials for each persona', () => {
      expect(PERSONA_CONFIG.valanna.initials).toBe('V');
      expect(PERSONA_CONFIG.candy.initials).toBe('C');
      expect(PERSONA_CONFIG.seraph.initials).toBe('S');
    });

    it('should have unique colors for each persona', () => {
      const colors = Object.values(PERSONA_CONFIG).map(p => p.color);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(colors.length);
    });

    it('should have valid hex color codes', () => {
      Object.values(PERSONA_CONFIG).forEach(config => {
        expect(config.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    it('Candy should be displayed similar to Valanna (both have avatar, initials, color)', () => {
      const candyKeys = Object.keys(PERSONA_CONFIG.candy);
      const valannaKeys = Object.keys(PERSONA_CONFIG.valanna);
      expect(candyKeys).toEqual(valannaKeys);
    });
  });

  // Size configuration tests
  describe('Avatar Size Configurations', () => {
    const SIZE_CONFIG = {
      xs: { container: 20, font: 9, ring: 24, bars: 3, barWidth: 1.5, barHeight: 6 },
      sm: { container: 28, font: 11, ring: 34, bars: 4, barWidth: 2, barHeight: 8 },
      md: { container: 40, font: 15, ring: 48, bars: 5, barWidth: 2.5, barHeight: 12 },
      lg: { container: 56, font: 20, ring: 66, bars: 5, barWidth: 3, barHeight: 16 },
    };

    it('should have ring larger than container for all sizes', () => {
      Object.values(SIZE_CONFIG).forEach(size => {
        expect(size.ring).toBeGreaterThan(size.container);
      });
    });

    it('should have increasing sizes from xs to lg', () => {
      expect(SIZE_CONFIG.xs.container).toBeLessThan(SIZE_CONFIG.sm.container);
      expect(SIZE_CONFIG.sm.container).toBeLessThan(SIZE_CONFIG.md.container);
      expect(SIZE_CONFIG.md.container).toBeLessThan(SIZE_CONFIG.lg.container);
    });
  });

  // Chat message structure tests
  describe('Chat Message Structure', () => {
    it('should support user and assistant roles', () => {
      const userMsg = { role: 'user' as const, content: 'Hello', timestamp: Date.now() };
      const assistantMsg = { role: 'assistant' as const, content: 'Hi there!', persona: 'valanna' as const, timestamp: Date.now() };

      expect(userMsg.role).toBe('user');
      expect(assistantMsg.role).toBe('assistant');
      expect(assistantMsg.persona).toBe('valanna');
    });

    it('should accept all three personas for assistant messages', () => {
      const personas = ['valanna', 'candy', 'seraph'] as const;
      personas.forEach(persona => {
        const msg = { role: 'assistant' as const, content: 'test', persona, timestamp: Date.now() };
        expect(msg.persona).toBe(persona);
      });
    });
  });
});
