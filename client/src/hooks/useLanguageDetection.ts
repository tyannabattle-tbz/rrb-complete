import { useState, useEffect } from 'react';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ja' | 'zh' | 'ar';

interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGE_CONFIGS: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
];

/**
 * Detect browser language and provide language selection
 */
export function useLanguageDetection() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [detectedLanguage, setDetectedLanguage] = useState<Language>('en');
  const [isAutoDetected, setIsAutoDetected] = useState(false);

  useEffect(() => {
    // Get browser language
    const browserLang = navigator.language.split('-')[0].toLowerCase();

    // Map browser language to supported languages
    const languageMap: Record<string, Language> = {
      en: 'en',
      es: 'es',
      fr: 'fr',
      de: 'de',
      pt: 'pt',
      ja: 'ja',
      zh: 'zh',
      ar: 'ar',
    };

    const detected = (languageMap[browserLang] || 'en') as Language;
    setDetectedLanguage(detected);
    setSelectedLanguage(detected);
    setIsAutoDetected(true);

    // Store preference in localStorage
    localStorage.setItem('preferredLanguage', detected);
  }, []);

  const changeLanguage = (lang: Language) => {
    setSelectedLanguage(lang);
    setIsAutoDetected(false);
    localStorage.setItem('preferredLanguage', lang);
  };

  const getLanguageConfig = (lang: Language): LanguageConfig => {
    return LANGUAGE_CONFIGS.find(c => c.code === lang) || LANGUAGE_CONFIGS[0];
  };

  const getLanguageName = (lang: Language): string => {
    return getLanguageConfig(lang).name;
  };

  const getLanguageNativeName = (lang: Language): string => {
    return getLanguageConfig(lang).nativeName;
  };

  const getLanguageFlag = (lang: Language): string => {
    return getLanguageConfig(lang).flag;
  };

  return {
    selectedLanguage,
    detectedLanguage,
    isAutoDetected,
    changeLanguage,
    getLanguageConfig,
    getLanguageName,
    getLanguageNativeName,
    getLanguageFlag,
    availableLanguages: LANGUAGE_CONFIGS,
  };
}

/**
 * Get translation for a key
 */
export function useTranslation(language: Language) {
  const translations: Record<Language, Record<string, string>> = {
    en: {
      'Enter Phone Number': 'Enter Phone Number',
      'Send OTP': 'Send OTP',
      'Enter Verification Code': 'Enter Verification Code',
      'Verify': 'Verify',
      'Call-In': 'Call-In',
      'Queue Position': 'Queue Position',
      'Estimated Wait': 'Estimated Wait',
      'SOS': 'SOS',
      'I\'m OK': 'I\'m OK',
      'Select Frequency': 'Select Frequency',
      'Hz': 'Hz',
      'minutes': 'minutes',
      'You\'re in the queue': 'You\'re in the queue! Your call will connect shortly.',
      'Phone verified': 'Phone verified',
      'Waiting for operator': 'Waiting for operator...',
    },
    es: {
      'Enter Phone Number': 'Ingrese el número de teléfono',
      'Send OTP': 'Enviar OTP',
      'Enter Verification Code': 'Ingrese el código de verificación',
      'Verify': 'Verificar',
      'Call-In': 'Llamada entrante',
      'Queue Position': 'Posición en la cola',
      'Estimated Wait': 'Espera estimada',
      'SOS': 'SOS',
      'I\'m OK': 'Estoy bien',
      'Select Frequency': 'Seleccionar frecuencia',
      'Hz': 'Hz',
      'minutes': 'minutos',
      'You\'re in the queue': '¡Estás en la cola! Tu llamada se conectará pronto.',
      'Phone verified': 'Teléfono verificado',
      'Waiting for operator': 'Esperando operador...',
    },
    fr: {
      'Enter Phone Number': 'Entrez le numéro de téléphone',
      'Send OTP': 'Envoyer OTP',
      'Enter Verification Code': 'Entrez le code de vérification',
      'Verify': 'Vérifier',
      'Call-In': 'Appel entrant',
      'Queue Position': 'Position dans la file',
      'Estimated Wait': 'Attente estimée',
      'SOS': 'SOS',
      'I\'m OK': 'Je vais bien',
      'Select Frequency': 'Sélectionner la fréquence',
      'Hz': 'Hz',
      'minutes': 'minutes',
      'You\'re in the queue': 'Vous êtes dans la file! Votre appel se connectera bientôt.',
      'Phone verified': 'Téléphone vérifié',
      'Waiting for operator': 'En attente d\'un opérateur...',
    },
    de: {
      'Enter Phone Number': 'Telefonnummer eingeben',
      'Send OTP': 'OTP senden',
      'Enter Verification Code': 'Verifizierungscode eingeben',
      'Verify': 'Überprüfen',
      'Call-In': 'Anruf',
      'Queue Position': 'Position in der Warteschlange',
      'Estimated Wait': 'Geschätzte Wartezeit',
      'SOS': 'SOS',
      'I\'m OK': 'Mir geht es gut',
      'Select Frequency': 'Frequenz auswählen',
      'Hz': 'Hz',
      'minutes': 'Minuten',
      'You\'re in the queue': 'Sie sind in der Warteschlange! Ihr Anruf wird bald verbunden.',
      'Phone verified': 'Telefon verifiziert',
      'Waiting for operator': 'Warten auf Operator...',
    },
    pt: {
      'Enter Phone Number': 'Digite o número de telefone',
      'Send OTP': 'Enviar OTP',
      'Enter Verification Code': 'Digite o código de verificação',
      'Verify': 'Verificar',
      'Call-In': 'Chamada',
      'Queue Position': 'Posição na fila',
      'Estimated Wait': 'Tempo de espera estimado',
      'SOS': 'SOS',
      'I\'m OK': 'Estou bem',
      'Select Frequency': 'Selecionar frequência',
      'Hz': 'Hz',
      'minutes': 'minutos',
      'You\'re in the queue': 'Você está na fila! Sua chamada será conectada em breve.',
      'Phone verified': 'Telefone verificado',
      'Waiting for operator': 'Aguardando operador...',
    },
    ja: {
      'Enter Phone Number': '電話番号を入力してください',
      'Send OTP': 'OTPを送信',
      'Enter Verification Code': '確認コードを入力してください',
      'Verify': '確認',
      'Call-In': '通話',
      'Queue Position': 'キューの位置',
      'Estimated Wait': '推定待機時間',
      'SOS': 'SOS',
      'I\'m OK': '大丈夫です',
      'Select Frequency': '周波数を選択',
      'Hz': 'Hz',
      'minutes': '分',
      'You\'re in the queue': 'キューに入っています。すぐに通話が接続されます。',
      'Phone verified': '電話が確認されました',
      'Waiting for operator': 'オペレーターを待機中...',
    },
    zh: {
      'Enter Phone Number': '输入电话号码',
      'Send OTP': '发送OTP',
      'Enter Verification Code': '输入验证码',
      'Verify': '验证',
      'Call-In': '来电',
      'Queue Position': '队列位置',
      'Estimated Wait': '预计等待时间',
      'SOS': 'SOS',
      'I\'m OK': '我很好',
      'Select Frequency': '选择频率',
      'Hz': 'Hz',
      'minutes': '分钟',
      'You\'re in the queue': '您在队列中！您的通话将很快接通。',
      'Phone verified': '电话已验证',
      'Waiting for operator': '等待接线员...',
    },
    ar: {
      'Enter Phone Number': 'أدخل رقم الهاتف',
      'Send OTP': 'إرسال OTP',
      'Enter Verification Code': 'أدخل رمز التحقق',
      'Verify': 'تحقق',
      'Call-In': 'استدعاء',
      'Queue Position': 'موضع الطابور',
      'Estimated Wait': 'وقت الانتظار المقدر',
      'SOS': 'SOS',
      'I\'m OK': 'أنا بخير',
      'Select Frequency': 'اختر التردد',
      'Hz': 'Hz',
      'minutes': 'دقائق',
      'You\'re in the queue': 'أنت في الطابور! سيتم توصيل مكالمتك قريباً.',
      'Phone verified': 'تم التحقق من الهاتف',
      'Waiting for operator': 'في انتظار المشغل...',
    },
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return { t, translations };
}
