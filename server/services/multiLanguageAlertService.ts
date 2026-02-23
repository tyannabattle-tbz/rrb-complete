/**
 * Multi-Language Text-to-Speech Alert Service
 * Generates emergency alerts in multiple languages using Web Speech API
 */

export type Language = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ja' | 'zh' | 'ar';

export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  voiceIndex: number;
}

export interface AlertTranslation {
  language: Language;
  title: string;
  message: string;
  audioUrl?: string;
  synthesized: boolean;
}

export interface MultiLanguageAlert {
  id: string;
  type: 'weather' | 'public_safety' | 'health' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  translations: Map<Language, AlertTranslation>;
  createdAt: Date;
  regions: string[];
}

class MultiLanguageAlertService {
  private alerts: Map<string, MultiLanguageAlert> = new Map();
  private translationCache: Map<string, string> = new Map();

  private languageConfigs: LanguageConfig[] = [
    { code: 'en', name: 'English', nativeName: 'English', voiceIndex: 0 },
    { code: 'es', name: 'Spanish', nativeName: 'Español', voiceIndex: 1 },
    { code: 'fr', name: 'French', nativeName: 'Français', voiceIndex: 2 },
    { code: 'de', name: 'German', nativeName: 'Deutsch', voiceIndex: 3 },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', voiceIndex: 4 },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', voiceIndex: 5 },
    { code: 'zh', name: 'Chinese', nativeName: '中文', voiceIndex: 6 },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', voiceIndex: 7 },
  ];

  /**
   * Create multi-language alert
   */
  createAlert(
    type: 'weather' | 'public_safety' | 'health' | 'critical',
    priority: 'low' | 'medium' | 'high' | 'critical',
    titleEn: string,
    messageEn: string,
    regions: string[]
  ): MultiLanguageAlert {
    const alertId = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const translations = new Map<Language, AlertTranslation>();

    // English (base language)
    translations.set('en', {
      language: 'en',
      title: titleEn,
      message: messageEn,
      synthesized: false,
    });

    // Auto-translate to other languages
    const translatedLanguages: Language[] = ['es', 'fr', 'de', 'pt', 'ja', 'zh', 'ar'];
    for (const lang of translatedLanguages) {
      const translated = this.translateText(titleEn, messageEn, lang);
      translations.set(lang, {
        language: lang,
        title: translated.title,
        message: translated.message,
        synthesized: false,
      });
    }

    const alert: MultiLanguageAlert = {
      id: alertId,
      type,
      priority,
      translations,
      createdAt: new Date(),
      regions,
    };

    this.alerts.set(alertId, alert);

    console.log(`[MultiLanguage] Alert created: ${alertId} in ${translations.size} languages`);

    return alert;
  }

  /**
   * Translate text to target language
   */
  private translateText(title: string, message: string, targetLang: Language): { title: string; message: string } {
    const cacheKey = `${title}|${message}|${targetLang}`;

    if (this.translationCache.has(cacheKey)) {
      const cached = this.translationCache.get(cacheKey)!;
      const [translatedTitle, translatedMessage] = cached.split('||');
      return { title: translatedTitle, message: translatedMessage };
    }

    // Simulate translation (in production, use Google Translate API or similar)
    const translations: Record<Language, Record<string, string>> = {
      es: {
        'Severe Weather Warning': 'Advertencia de Clima Severo',
        'Tornado warning in effect': 'Advertencia de tornado en vigencia',
        'Public Safety Alert': 'Alerta de Seguridad Pública',
        'Missing person alert': 'Alerta de persona desaparecida',
      },
      fr: {
        'Severe Weather Warning': 'Avertissement de Météo Sévère',
        'Tornado warning in effect': 'Avertissement de tornade en vigueur',
        'Public Safety Alert': 'Alerte de Sécurité Publique',
        'Missing person alert': 'Alerte de personne disparue',
      },
      de: {
        'Severe Weather Warning': 'Warnung vor schwerem Wetter',
        'Tornado warning in effect': 'Tornadowarnung in Kraft',
        'Public Safety Alert': 'Öffentliche Sicherheitsmitteilung',
        'Missing person alert': 'Vermisste Person Warnung',
      },
      pt: {
        'Severe Weather Warning': 'Aviso de Tempo Severo',
        'Tornado warning in effect': 'Aviso de tornado em vigor',
        'Public Safety Alert': 'Alerta de Segurança Pública',
        'Missing person alert': 'Alerta de pessoa desaparecida',
      },
      ja: {
        'Severe Weather Warning': '悪天候警告',
        'Tornado warning in effect': '竜巻警告が有効',
        'Public Safety Alert': '公安警告',
        'Missing person alert': '行方不明者アラート',
      },
      zh: {
        'Severe Weather Warning': '恶劣天气警告',
        'Tornado warning in effect': '龙卷风警告生效',
        'Public Safety Alert': '公共安全警报',
        'Missing person alert': '失踪人员警报',
      },
      ar: {
        'Severe Weather Warning': 'تحذير الطقس الشديد',
        'Tornado warning in effect': 'تحذير الإعصار ساري المفعول',
        'Public Safety Alert': 'تنبيه السلامة العامة',
        'Missing person alert': 'تنبيه الشخص المفقود',
      },
      en: {},
    };

    const langTranslations = translations[targetLang] || {};
    const translatedTitle = langTranslations[title] || title;
    const translatedMessage = langTranslations[message] || message;

    const cached = `${translatedTitle}||${translatedMessage}`;
    this.translationCache.set(cacheKey, cached);

    return { title: translatedTitle, message: translatedMessage };
  }

  /**
   * Synthesize alert to speech for all languages
   */
  async synthesizeAlert(alertId: string): Promise<Map<Language, string>> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    const audioUrls = new Map<Language, string>();

    for (const [lang, translation] of alert.translations) {
      const audioUrl = await this.synthesizeToSpeech(
        translation.title,
        translation.message,
        lang
      );

      translation.audioUrl = audioUrl;
      translation.synthesized = true;

      audioUrls.set(lang, audioUrl);

      console.log(`[TTS] Synthesized ${lang}: ${audioUrl}`);
    }

    return audioUrls;
  }

  /**
   * Synthesize text to speech
   */
  private async synthesizeToSpeech(title: string, message: string, language: Language): Promise<string> {
    // In production, use Web Speech API or external TTS service
    // For now, return a mock audio URL
    const text = `${title}. ${message}`;
    const encodedText = encodeURIComponent(text);
    const lang = this.getLanguageCode(language);

    // Mock Google Text-to-Speech URL format
    const audioUrl = `data:audio/mpeg;base64,//NExAAR8AJVAAAAAExBTUUzLjk4LjIAA==`;

    return audioUrl;
  }

  /**
   * Get language code for TTS
   */
  private getLanguageCode(lang: Language): string {
    const codes: Record<Language, string> = {
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      pt: 'pt-BR',
      ja: 'ja-JP',
      zh: 'zh-CN',
      ar: 'ar-SA',
    };
    return codes[lang];
  }

  /**
   * Get alert in specific language
   */
  getAlertTranslation(alertId: string, language: Language): AlertTranslation | null {
    const alert = this.alerts.get(alertId);
    if (!alert) return null;

    return alert.translations.get(language) || null;
  }

  /**
   * Get all translations for alert
   */
  getAllTranslations(alertId: string): Map<Language, AlertTranslation> {
    const alert = this.alerts.get(alertId);
    if (!alert) return new Map();

    return alert.translations;
  }

  /**
   * Get available languages
   */
  getAvailableLanguages(): LanguageConfig[] {
    return this.languageConfigs;
  }

  /**
   * Get language name
   */
  getLanguageName(lang: Language): string {
    const config = this.languageConfigs.find(c => c.code === lang);
    return config ? config.name : lang;
  }

  /**
   * Get language native name
   */
  getLanguageNativeName(lang: Language): string {
    const config = this.languageConfigs.find(c => c.code === lang);
    return config ? config.nativeName : lang;
  }

  /**
   * Get alert statistics
   */
  getAlertStats(): {
    totalAlerts: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    synthesized: number;
  } {
    const alerts = Array.from(this.alerts.values());

    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let synthesized = 0;

    for (const alert of alerts) {
      byType[alert.type] = (byType[alert.type] || 0) + 1;
      byPriority[alert.priority] = (byPriority[alert.priority] || 0) + 1;

      const isSynthesized = Array.from(alert.translations.values()).every(t => t.synthesized);
      if (isSynthesized) synthesized++;
    }

    return {
      totalAlerts: alerts.length,
      byType,
      byPriority,
      synthesized,
    };
  }

  /**
   * Clear old alerts
   */
  clearOldAlerts(daysOld: number = 7): number {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    let cleared = 0;

    for (const [id, alert] of this.alerts) {
      if (alert.createdAt < cutoffDate) {
        this.alerts.delete(id);
        cleared++;
      }
    }

    return cleared;
  }
}

export const multiLanguageAlertService = new MultiLanguageAlertService();
