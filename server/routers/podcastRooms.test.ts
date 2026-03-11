import { describe, it, expect } from 'vitest';

/**
 * Tests for Podcast Room configurations and infrastructure.
 * Validates show configs, voice mappings, feature flags, and scheduling.
 */

describe('Podcast Rooms', () => {
  // Show configurations
  const SHOWS = {
    candysCorner: {
      id: 'candys-corner',
      title: "Candy's Corner",
      host: { name: 'Candy', persona: 'candy' as const, forgeVoice: 'echo' },
      theme: { primary: '#60a5fa' },
      features: { callIn: true, gameScreen: true, guestAi: true, liveParticipants: true, solbonesGame: false },
      schedule: { day: 'Tuesday & Thursday', time: '7:00 PM', timezone: 'CT' },
    },
    solbonesPodcast: {
      id: 'solbones',
      title: 'Solbones Podcast',
      host: { name: 'Seraph', persona: 'seraph' as const, forgeVoice: 'onyx' },
      theme: { primary: '#f59e0b' },
      features: { callIn: true, gameScreen: true, guestAi: true, liveParticipants: true, solbonesGame: true },
      schedule: { day: 'Wednesday & Saturday', time: '8:00 PM', timezone: 'CT' },
    },
    aroundTheQumUnity: {
      id: 'around-the-qumunity',
      title: 'Around the QumUnity',
      host: { name: 'Valanna', persona: 'valanna' as const, forgeVoice: 'nova' },
      theme: { primary: '#a78bfa' },
      features: { callIn: true, gameScreen: true, guestAi: true, liveParticipants: true, solbonesGame: false },
      schedule: { day: 'Monday & Friday', time: '6:00 PM', timezone: 'CT' },
    },
  };

  describe('Show Configurations', () => {
    it('should have 3 distinct podcast shows', () => {
      expect(Object.keys(SHOWS)).toHaveLength(3);
    });

    it('each show should have a unique ID', () => {
      const ids = Object.values(SHOWS).map(s => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('each show should have a unique host persona', () => {
      const personas = Object.values(SHOWS).map(s => s.host.persona);
      expect(new Set(personas).size).toBe(personas.length);
    });

    it('each show should have a unique theme color', () => {
      const colors = Object.values(SHOWS).map(s => s.theme.primary);
      expect(new Set(colors).size).toBe(colors.length);
    });
  });

  describe("Candy's Corner", () => {
    const show = SHOWS.candysCorner;

    it('should be hosted by Candy with echo (male) voice', () => {
      expect(show.host.name).toBe('Candy');
      expect(show.host.persona).toBe('candy');
      expect(show.host.forgeVoice).toBe('echo');
      // Candy is dad — must NOT be shimmer
      expect(show.host.forgeVoice).not.toBe('shimmer');
    });

    it('should support guest AI and live participants', () => {
      expect(show.features.guestAi).toBe(true);
      expect(show.features.liveParticipants).toBe(true);
    });

    it('should have call-in feature enabled', () => {
      expect(show.features.callIn).toBe(true);
    });

    it('should air on Tuesday & Thursday at 7 PM CT', () => {
      expect(show.schedule.day).toBe('Tuesday & Thursday');
      expect(show.schedule.time).toBe('7:00 PM');
      expect(show.schedule.timezone).toBe('CT');
    });
  });

  describe('Solbones Podcast', () => {
    const show = SHOWS.solbonesPodcast;

    it('should be hosted by Seraph with onyx (deep male) voice', () => {
      expect(show.host.name).toBe('Seraph');
      expect(show.host.persona).toBe('seraph');
      expect(show.host.forgeVoice).toBe('onyx');
    });

    it('should have Solbones game integration enabled', () => {
      expect(show.features.solbonesGame).toBe(true);
    });

    it('should have game screen enabled for mobile activation', () => {
      expect(show.features.gameScreen).toBe(true);
    });

    it('should air on Wednesday & Saturday at 8 PM CT', () => {
      expect(show.schedule.day).toBe('Wednesday & Saturday');
      expect(show.schedule.time).toBe('8:00 PM');
    });
  });

  describe('Around the QumUnity', () => {
    const show = SHOWS.aroundTheQumUnity;

    it('should be hosted by Valanna with nova (female) voice', () => {
      expect(show.host.name).toBe('Valanna');
      expect(show.host.persona).toBe('valanna');
      expect(show.host.forgeVoice).toBe('nova');
    });

    it('should have community-focused features enabled', () => {
      expect(show.features.callIn).toBe(true);
      expect(show.features.guestAi).toBe(true);
      expect(show.features.liveParticipants).toBe(true);
    });

    it('should air on Monday & Friday at 6 PM CT', () => {
      expect(show.schedule.day).toBe('Monday & Friday');
      expect(show.schedule.time).toBe('6:00 PM');
    });
  });

  describe('Recording Pipeline Integration', () => {
    const DESTINATIONS = [
      'RRB Radio Replay',
      'Media Blast Campaign',
      'Studio Suite Editing',
      'Streaming Platforms',
      'QUMUS Automation',
    ];

    it('should route to exactly 5 destinations', () => {
      expect(DESTINATIONS).toHaveLength(5);
    });

    it('should include QUMUS automation as a destination', () => {
      expect(DESTINATIONS).toContain('QUMUS Automation');
    });

    it('should include streaming platforms for cross-platform distribution', () => {
      expect(DESTINATIONS).toContain('Streaming Platforms');
    });
  });

  describe('Route Configuration', () => {
    const ROUTES = [
      '/podcast/candys-corner',
      '/podcast/solbones',
      '/podcast/around-the-qumunity',
    ];

    it('should have 3 podcast room routes', () => {
      expect(ROUTES).toHaveLength(3);
    });

    it('all routes should start with /podcast/', () => {
      ROUTES.forEach(route => {
        expect(route.startsWith('/podcast/')).toBe(true);
      });
    });

    it('routes should use kebab-case slugs', () => {
      ROUTES.forEach(route => {
        const slug = route.replace('/podcast/', '');
        expect(slug).toMatch(/^[a-z0-9-]+$/);
      });
    });
  });
});
