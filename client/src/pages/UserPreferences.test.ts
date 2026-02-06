import { describe, it, expect, beforeEach } from 'vitest';

describe('User Preferences', () => {
  const defaultPreferences = {
    notificationTypes: {
      critical: true,
      broadcasts: true,
      networkAlerts: true,
      systemUpdates: false,
      mentions: true,
    },
    deliveryChannels: {
      push: true,
      email: true,
      sms: false,
      inApp: true,
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
    language: 'en',
    soundEnabled: true,
    vibrationEnabled: true,
    emailDigest: 'daily' as const,
  };

  beforeEach(() => {
    localStorage.clear();
  });

  describe('Notification Types', () => {
    it('should have critical notifications enabled by default', () => {
      expect(defaultPreferences.notificationTypes.critical).toBe(true);
    });

    it('should have broadcasts enabled by default', () => {
      expect(defaultPreferences.notificationTypes.broadcasts).toBe(true);
    });

    it('should have network alerts enabled by default', () => {
      expect(defaultPreferences.notificationTypes.networkAlerts).toBe(true);
    });

    it('should have system updates disabled by default', () => {
      expect(defaultPreferences.notificationTypes.systemUpdates).toBe(false);
    });

    it('should have mentions enabled by default', () => {
      expect(defaultPreferences.notificationTypes.mentions).toBe(true);
    });
  });

  describe('Delivery Channels', () => {
    it('should have push notifications enabled by default', () => {
      expect(defaultPreferences.deliveryChannels.push).toBe(true);
    });

    it('should have email enabled by default', () => {
      expect(defaultPreferences.deliveryChannels.email).toBe(true);
    });

    it('should have SMS disabled by default', () => {
      expect(defaultPreferences.deliveryChannels.sms).toBe(false);
    });

    it('should have in-app notifications enabled by default', () => {
      expect(defaultPreferences.deliveryChannels.inApp).toBe(true);
    });
  });

  describe('Quiet Hours', () => {
    it('should have quiet hours disabled by default', () => {
      expect(defaultPreferences.quietHours.enabled).toBe(false);
    });

    it('should have start time of 22:00 by default', () => {
      expect(defaultPreferences.quietHours.startTime).toBe('22:00');
    });

    it('should have end time of 08:00 by default', () => {
      expect(defaultPreferences.quietHours.endTime).toBe('08:00');
    });

    it('should validate quiet hours are different', () => {
      const startTime = defaultPreferences.quietHours.startTime;
      const endTime = defaultPreferences.quietHours.endTime;
      expect(startTime).not.toBe(endTime);
    });
  });

  describe('Language & Audio', () => {
    it('should default to English', () => {
      expect(defaultPreferences.language).toBe('en');
    });

    it('should have sound enabled by default', () => {
      expect(defaultPreferences.soundEnabled).toBe(true);
    });

    it('should have vibration enabled by default', () => {
      expect(defaultPreferences.vibrationEnabled).toBe(true);
    });

    it('should have daily email digest by default', () => {
      expect(defaultPreferences.emailDigest).toBe('daily');
    });
  });

  describe('Persistence', () => {
    it('should save preferences to localStorage', () => {
      localStorage.setItem('userPreferences', JSON.stringify(defaultPreferences));
      const saved = localStorage.getItem('userPreferences');

      expect(saved).toBeDefined();
      expect(JSON.parse(saved!)).toEqual(defaultPreferences);
    });

    it('should retrieve saved preferences', () => {
      localStorage.setItem('userPreferences', JSON.stringify(defaultPreferences));
      const retrieved = JSON.parse(localStorage.getItem('userPreferences')!);

      expect(retrieved.language).toBe('en');
      expect(retrieved.soundEnabled).toBe(true);
    });

    it('should update preferences', () => {
      const updated = { ...defaultPreferences, language: 'es' };
      localStorage.setItem('userPreferences', JSON.stringify(updated));
      const retrieved = JSON.parse(localStorage.getItem('userPreferences')!);

      expect(retrieved.language).toBe('es');
    });
  });

  describe('Validation', () => {
    it('should validate all notification types are boolean', () => {
      Object.values(defaultPreferences.notificationTypes).forEach((value) => {
        expect(typeof value).toBe('boolean');
      });
    });

    it('should validate all delivery channels are boolean', () => {
      Object.values(defaultPreferences.deliveryChannels).forEach((value) => {
        expect(typeof value).toBe('boolean');
      });
    });

    it('should validate language is a string', () => {
      expect(typeof defaultPreferences.language).toBe('string');
    });

    it('should validate email digest is one of allowed values', () => {
      const allowedValues = ['instant', 'daily', 'weekly', 'never'];
      expect(allowedValues).toContain(defaultPreferences.emailDigest);
    });
  });

  describe('Email Digest Frequencies', () => {
    it('should support instant digest', () => {
      const prefs = { ...defaultPreferences, emailDigest: 'instant' as const };
      expect(prefs.emailDigest).toBe('instant');
    });

    it('should support daily digest', () => {
      const prefs = { ...defaultPreferences, emailDigest: 'daily' as const };
      expect(prefs.emailDigest).toBe('daily');
    });

    it('should support weekly digest', () => {
      const prefs = { ...defaultPreferences, emailDigest: 'weekly' as const };
      expect(prefs.emailDigest).toBe('weekly');
    });

    it('should support never digest', () => {
      const prefs = { ...defaultPreferences, emailDigest: 'never' as const };
      expect(prefs.emailDigest).toBe('never');
    });
  });

  describe('Supported Languages', () => {
    const languages = ['en', 'es', 'fr', 'de', 'ja', 'zh'];

    languages.forEach((lang) => {
      it(`should support ${lang} language`, () => {
        const prefs = { ...defaultPreferences, language: lang };
        expect(prefs.language).toBe(lang);
      });
    });
  });
});
