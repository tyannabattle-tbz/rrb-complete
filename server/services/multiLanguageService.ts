export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ja' | 'zh' | 'ar' | 'hi' | 'sw';

export interface TranslationKey {
  key: string;
  translations: Record<SupportedLanguage, string>;
}

export const translations: Record<string, TranslationKey> = {
  'app.title': {
    key: 'app.title',
    translations: {
      en: 'QUMUS Ecosystem',
      es: 'Ecosistema QUMUS',
      fr: 'Écosystème QUMUS',
      de: 'QUMUS-Ökosystem',
      pt: 'Ecossistema QUMUS',
      ja: 'QUMUSエコシステム',
      zh: 'QUMUS生态系统',
      ar: 'نظام QUMUS البيئي',
      hi: 'QUMUS इकोसिस्टम',
      sw: 'Mfumo wa QUMUS',
    },
  },
  'app.subtitle': {
    key: 'app.subtitle',
    translations: {
      en: 'Autonomous. Orchestrated. Yours.',
      es: 'Autónomo. Orquestado. Tuyo.',
      fr: 'Autonome. Orchestré. Le vôtre.',
      de: 'Autonom. Orchestriert. Deins.',
      pt: 'Autônomo. Orquestrado. Seu.',
      ja: '自律的。オーケストレーション。あなたのもの。',
      zh: '自主的。编排的。你的。',
      ar: 'مستقل. منسق. ملكك.',
      hi: 'स्वायत्त। आयोजित। आपका।',
      sw: 'Kujitegemea. Kuokezeshwa. Yako.',
    },
  },
  'nav.home': {
    key: 'nav.home',
    translations: {
      en: 'Home',
      es: 'Inicio',
      fr: 'Accueil',
      de: 'Startseite',
      pt: 'Início',
      ja: 'ホーム',
      zh: '首页',
      ar: 'الصفحة الرئيسية',
      hi: 'होम',
      sw: 'Nyumbani',
    },
  },
  'nav.radio': {
    key: 'nav.radio',
    translations: {
      en: 'Ty OS Radio',
      es: 'Radio Ty OS',
      fr: 'Radio Ty OS',
      de: 'Ty OS Radio',
      pt: 'Rádio Ty OS',
      ja: 'Ty OSラジオ',
      zh: 'Ty OS广播',
      ar: 'راديو Ty OS',
      hi: 'Ty OS रेडियो',
      sw: 'Ty OS Redio',
    },
  },
  'nav.emergency': {
    key: 'nav.emergency',
    translations: {
      en: 'Emergency Broadcast',
      es: 'Transmisión de Emergencia',
      fr: 'Diffusion d\'Urgence',
      de: 'Notfallübertragung',
      pt: 'Transmissão de Emergência',
      ja: '緊急放送',
      zh: '紧急广播',
      ar: 'البث الطارئ',
      hi: 'आपातकालीन प्रसारण',
      sw: 'Utangazaji wa Dharura',
    },
  },
  'nav.qumus': {
    key: 'nav.qumus',
    translations: {
      en: 'QUMUS Control',
      es: 'Control QUMUS',
      fr: 'Contrôle QUMUS',
      de: 'QUMUS-Steuerung',
      pt: 'Controle QUMUS',
      ja: 'QUMUS制御',
      zh: 'QUMUS控制',
      ar: 'تحكم QUMUS',
      hi: 'QUMUS नियंत्रण',
      sw: 'Udhibiti wa QUMUS',
    },
  },
  'button.listen': {
    key: 'button.listen',
    translations: {
      en: 'Listen on Ty OS Radio',
      es: 'Escuchar en Radio Ty OS',
      fr: 'Écouter sur Radio Ty OS',
      de: 'Auf Ty OS Radio hören',
      pt: 'Ouça na Rádio Ty OS',
      ja: 'Ty OSラジオで聴く',
      zh: '在Ty OS广播上收听',
      ar: 'استمع على راديو Ty OS',
      hi: 'Ty OS रेडियो पर सुनें',
      sw: 'Sikiliza kwenye Ty OS Redio',
    },
  },
  'button.emergency': {
    key: 'button.emergency',
    translations: {
      en: 'Emergency Broadcast',
      es: 'Transmisión de Emergencia',
      fr: 'Diffusion d\'Urgence',
      de: 'Notfallübertragung',
      pt: 'Transmissão de Emergência',
      ja: '緊急放送',
      zh: '紧急广播',
      ar: 'البث الطارئ',
      hi: 'आपातकालीन प्रसारण',
      sw: 'Utangazaji wa Dharura',
    },
  },
  'button.qumus': {
    key: 'button.qumus',
    translations: {
      en: 'QUMUS Control Center',
      es: 'Centro de Control QUMUS',
      fr: 'Centre de Contrôle QUMUS',
      de: 'QUMUS-Kontrollzentrum',
      pt: 'Centro de Controle QUMUS',
      ja: 'QUMUS制御センター',
      zh: 'QUMUS控制中心',
      ar: 'مركز تحكم QUMUS',
      hi: 'QUMUS नियंत्रण केंद्र',
      sw: 'Kituo cha Udhibiti wa QUMUS',
    },
  },
  'system.qumus': {
    key: 'system.qumus',
    translations: {
      en: 'QUMUS Engine',
      es: 'Motor QUMUS',
      fr: 'Moteur QUMUS',
      de: 'QUMUS-Motor',
      pt: 'Motor QUMUS',
      ja: 'QUMUSエンジン',
      zh: 'QUMUS引擎',
      ar: 'محرك QUMUS',
      hi: 'QUMUS इंजन',
      sw: 'Injini ya QUMUS',
    },
  },
  'system.radio': {
    key: 'system.radio',
    translations: {
      en: 'Ty OS Radio',
      es: 'Radio Ty OS',
      fr: 'Radio Ty OS',
      de: 'Ty OS Radio',
      pt: 'Rádio Ty OS',
      ja: 'Ty OSラジオ',
      zh: 'Ty OS广播',
      ar: 'راديو Ty OS',
      hi: 'Ty OS रेडियो',
      sw: 'Ty OS Redio',
    },
  },
  'system.hybridcast': {
    key: 'system.hybridcast',
    translations: {
      en: 'HybridCast Emergency',
      es: 'HybridCast Emergencia',
      fr: 'HybridCast Urgence',
      de: 'HybridCast Notfall',
      pt: 'HybridCast Emergência',
      ja: 'HybridCast緊急',
      zh: 'HybridCast紧急',
      ar: 'HybridCast الطارئة',
      hi: 'HybridCast आपातकाल',
      sw: 'HybridCast Dharura',
    },
  },
  'footer.credit': {
    key: 'footer.credit',
    translations: {
      en: 'A Canryn Production • Sweet Miracles • A Voice for the Voiceless',
      es: 'Una Producción Canryn • Milagros Dulces • Una Voz para los Sin Voz',
      fr: 'Une Production Canryn • Miracles Doux • Une Voix pour les Sans-Voix',
      de: 'Eine Canryn-Produktion • Süße Wunder • Eine Stimme für die Stimmlosen',
      pt: 'Uma Produção Canryn • Milagres Doces • Uma Voz para os Sem Voz',
      ja: 'Canryn制作 • スウィートミラクルズ • 声なき者の声',
      zh: 'Canryn制作 • 甜蜜奇迹 • 无声者的声音',
      ar: 'إنتاج Canryn • معجزات حلوة • صوت للصامتين',
      hi: 'Canryn निर्माण • मीठे चमत्कार • मूक लोगों की आवाज',
      sw: 'Uzalishaji wa Canryn • Miujiza Tamu • Sauti ya Wasiozungumza',
    },
  },
};

export class MultiLanguageService {
  private defaultLanguage: SupportedLanguage = 'en';
  private supportedLanguages: SupportedLanguage[] = [
    'en',
    'es',
    'fr',
    'de',
    'pt',
    'ja',
    'zh',
    'ar',
    'hi',
    'sw',
  ];

  translate(key: string, language: SupportedLanguage = this.defaultLanguage): string {
    const translationKey = translations[key];
    if (!translationKey) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }

    const translation = translationKey.translations[language];
    if (!translation) {
      console.warn(`Translation not found for ${key} in ${language}, falling back to English`);
      return translationKey.translations['en'] || key;
    }

    return translation;
  }

  getSupportedLanguages(): Array<{ code: SupportedLanguage; name: string }> {
    const languageNames: Record<SupportedLanguage, string> = {
      en: 'English',
      es: 'Español',
      fr: 'Français',
      de: 'Deutsch',
      pt: 'Português',
      ja: '日本語',
      zh: '中文',
      ar: 'العربية',
      hi: 'हिन्दी',
      sw: 'Swahili',
    };

    return this.supportedLanguages.map((code) => ({
      code,
      name: languageNames[code],
    }));
  }

  detectLanguage(acceptLanguage: string): SupportedLanguage {
    // Parse Accept-Language header
    const languages = acceptLanguage
      .split(',')
      .map((lang) => lang.split(';')[0].trim().split('-')[0].toLowerCase() as SupportedLanguage)
      .filter((lang) => this.supportedLanguages.includes(lang));

    return languages.length > 0 ? languages[0] : this.defaultLanguage;
  }

  setDefaultLanguage(language: SupportedLanguage): void {
    if (this.supportedLanguages.includes(language)) {
      this.defaultLanguage = language;
    } else {
      console.warn(`Language ${language} is not supported`);
    }
  }

  addTranslation(key: string, translations: Record<SupportedLanguage, string>): void {
    if (!translations.translations) {
      translations.translations = translations;
    }
    translations[key] = {
      key,
      translations,
    };
  }
}

export const multiLanguageService = new MultiLanguageService();
