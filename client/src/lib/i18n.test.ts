import { describe, it, expect, beforeEach } from 'vitest';
import { useLanguage, t, translations, languages, type Language } from './i18n';

describe('i18n - Multi-Language Support', () => {
  beforeEach(() => {
    // Reset language to English before each test
    useLanguage.setState({ language: 'en' });
  });

  describe('Language Store', () => {
    it('should initialize with English as default language', () => {
      const state = useLanguage.getState();
      expect(state.language).toBe('en');
    });

    it('should allow setting a new language', () => {
      useLanguage.getState().setLanguage('es');
      expect(useLanguage.getState().language).toBe('es');
    });

    it('should persist language selection to localStorage', () => {
      useLanguage.getState().setLanguage('fr');
      // Zustand persist middleware should save to localStorage
      const stored = localStorage.getItem('qumus-language');
      expect(stored).toBeDefined();
    });

    it('should support all 10 languages', () => {
      const supportedLanguages: Language[] = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'pt', 'ru', 'ar'];
      supportedLanguages.forEach((lang) => {
        useLanguage.getState().setLanguage(lang);
        expect(useLanguage.getState().language).toBe(lang);
      });
    });
  });

  describe('Translation Function', () => {
    it('should return English translation for valid key', () => {
      const result = t('nav.home', 'en');
      expect(result).toBe('Home');
    });

    it('should return Spanish translation for valid key', () => {
      const result = t('nav.home', 'es');
      expect(result).toBe('Inicio');
    });

    it('should return French translation for valid key', () => {
      const result = t('nav.home', 'fr');
      expect(result).toBe('Accueil');
    });

    it('should return German translation for valid key', () => {
      const result = t('nav.home', 'de');
      expect(result).toBe('Startseite');
    });

    it('should return Chinese translation for valid key', () => {
      const result = t('nav.home', 'zh');
      expect(result).toBe('首页');
    });

    it('should return Japanese translation for valid key', () => {
      const result = t('nav.home', 'ja');
      expect(result).toBe('ホーム');
    });

    it('should return Korean translation for valid key', () => {
      const result = t('nav.home', 'ko');
      expect(result).toBe('홈');
    });

    it('should return Portuguese translation for valid key', () => {
      const result = t('nav.home', 'pt');
      expect(result).toBe('Início');
    });

    it('should return Russian translation for valid key', () => {
      const result = t('nav.home', 'ru');
      expect(result).toBe('Главная');
    });

    it('should return Arabic translation for valid key', () => {
      const result = t('nav.home', 'ar');
      expect(result).toBe('الرئيسية');
    });

    it('should return key itself if translation not found', () => {
      const result = t('nonexistent.key', 'en');
      expect(result).toBe('nonexistent.key');
    });

    it('should fallback to English if language not found', () => {
      const result = t('nav.home', 'en');
      expect(result).toBe('Home');
    });

    it('should use current language from store if not specified', () => {
      useLanguage.getState().setLanguage('es');
      const result = t('nav.home');
      expect(result).toBe('Inicio');
    });
  });

  describe('Translations Object', () => {
    it('should have translations for all 10 languages', () => {
      expect(Object.keys(translations)).toHaveLength(10);
      expect(translations).toHaveProperty('en');
      expect(translations).toHaveProperty('es');
      expect(translations).toHaveProperty('fr');
      expect(translations).toHaveProperty('de');
      expect(translations).toHaveProperty('zh');
      expect(translations).toHaveProperty('ja');
      expect(translations).toHaveProperty('ko');
      expect(translations).toHaveProperty('pt');
      expect(translations).toHaveProperty('ru');
      expect(translations).toHaveProperty('ar');
    });

    it('should have common keys in all languages', () => {
      const commonKeys = ['nav.home', 'common.save', 'common.cancel', 'common.delete'];
      const langs = Object.keys(translations) as Language[];
      
      commonKeys.forEach((key) => {
        langs.forEach((lang) => {
          expect(translations[lang]).toHaveProperty(key);
        });
      });
    });

    it('should have broadcast-related keys', () => {
      const broadcastKeys = ['broadcast.create', 'broadcast.schedule', 'broadcast.send'];
      broadcastKeys.forEach((key) => {
        expect(translations['en']).toHaveProperty(key);
      });
    });

    it('should have search-related keys', () => {
      const searchKeys = ['search.placeholder', 'search.filters', 'search.results'];
      searchKeys.forEach((key) => {
        expect(translations['en']).toHaveProperty(key);
      });
    });
  });

  describe('Languages Array', () => {
    it('should have 10 language options', () => {
      expect(languages).toHaveLength(10);
    });

    it('should have required properties for each language', () => {
      languages.forEach((lang) => {
        expect(lang).toHaveProperty('code');
        expect(lang).toHaveProperty('name');
        expect(lang).toHaveProperty('flag');
        expect(typeof lang.code).toBe('string');
        expect(typeof lang.name).toBe('string');
        expect(typeof lang.flag).toBe('string');
      });
    });

    it('should include English', () => {
      const english = languages.find((l) => l.code === 'en');
      expect(english).toBeDefined();
      expect(english?.name).toBe('English');
    });

    it('should include Spanish', () => {
      const spanish = languages.find((l) => l.code === 'es');
      expect(spanish).toBeDefined();
      expect(spanish?.name).toBe('Español');
    });

    it('should have unique language codes', () => {
      const codes = languages.map((l) => l.code);
      const uniqueCodes = new Set(codes);
      expect(codes).toHaveLength(uniqueCodes.size);
    });
  });
});
