import { invokeLLM } from './_core/llm';

export interface LanguageSupport {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
}

export interface LocalizedContent {
  episodeId: string;
  language: string;
  title: string;
  description: string;
  transcription: string;
  subtitles: string;
}

export class MultiLanguageSupport {
  private supportedLanguages: LanguageSupport[] = [
    { code: 'en', name: 'English', nativeName: 'English', rtl: false },
    { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false },
    { code: 'fr', name: 'French', nativeName: 'Français', rtl: false },
    { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', rtl: false },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', rtl: false },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', rtl: false },
    { code: 'zh', name: 'Chinese', nativeName: '中文', rtl: false },
    { code: 'ko', name: 'Korean', nativeName: '한국어', rtl: false },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', rtl: false },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', rtl: false },
  ];

  async translateContent(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<{ success: boolean; translation?: string; error?: string }> {
    try {
      const targetLangName = this.getLanguageName(targetLanguage);

      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following podcast content to ${targetLangName}. Maintain the tone, style, and meaning. Do not add explanations, only provide the translation.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
      });

      if (!response || !response.choices || !response.choices[0]) {
        return { success: false, error: 'Translation failed' };
      }

      const translation = response.choices[0].message?.content || '';

      return {
        success: true,
        translation,
      };
    } catch (error) {
      return {
        success: false,
        error: `Translation error: ${error}`,
      };
    }
  }

  async generateMultilingualSubtitles(
    episodeId: string,
    englishSubtitles: string,
    targetLanguages: string[]
  ): Promise<Map<string, string>> {
    const subtitles = new Map<string, string>();

    // Add English
    subtitles.set('en', englishSubtitles);

    // Translate to other languages
    for (const lang of targetLanguages) {
      if (lang === 'en') continue;

      try {
        const result = await this.translateContent(englishSubtitles, 'en', lang);

        if (result.success && result.translation) {
          subtitles.set(lang, result.translation);
        }
      } catch (error) {
        console.error(`Failed to generate subtitles for ${lang}:`, error);
      }
    }

    return subtitles;
  }

  async generateLocalizedMetadata(
    episodeId: string,
    englishTitle: string,
    englishDescription: string,
    targetLanguages: string[]
  ): Promise<Map<string, { title: string; description: string }>> {
    const metadata = new Map<string, { title: string; description: string }>();

    // Add English
    metadata.set('en', {
      title: englishTitle,
      description: englishDescription,
    });

    // Translate to other languages
    for (const lang of targetLanguages) {
      if (lang === 'en') continue;

      try {
        const titleResult = await this.translateContent(englishTitle, 'en', lang);
        const descResult = await this.translateContent(englishDescription, 'en', lang);

        if (titleResult.success && descResult.success) {
          metadata.set(lang, {
            title: titleResult.translation || englishTitle,
            description: descResult.translation || englishDescription,
          });
        }
      } catch (error) {
        console.error(`Failed to generate metadata for ${lang}:`, error);
      }
    }

    return metadata;
  }

  async detectLanguage(text: string): Promise<{ language: string; confidence: number }> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'Detect the language of the following text. Respond with only the language code (e.g., "en", "es", "fr").',
          },
          {
            role: 'user',
            content: text.substring(0, 500),
          },
        ],
      });

      if (!response || !response.choices || !response.choices[0]) {
        return { language: 'en', confidence: 0 };
      }

      const detectedLang = response.choices[0].message?.content?.toLowerCase().trim() || 'en';

      return {
        language: detectedLang,
        confidence: 0.95,
      };
    } catch (error) {
      console.error('Language detection failed:', error);
      return { language: 'en', confidence: 0 };
    }
  }

  async generateAccessibleAudio(
    episodeId: string,
    text: string,
    language: string
  ): Promise<{ success: boolean; audioUrl?: string; error?: string }> {
    try {
      // In production, use text-to-speech API (e.g., Google Cloud TTS, AWS Polly)
      console.log(`[Audio] Generating accessible audio for episode ${episodeId} in ${language}`);

      // Placeholder: would call TTS API
      const audioUrl = `https://audio.example.com/${episodeId}_${language}.mp3`;

      return {
        success: true,
        audioUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: `Audio generation failed: ${error}`,
      };
    }
  }

  async createLocalizedEpisode(
    episodeId: string,
    englishContent: {
      title: string;
      description: string;
      transcription: string;
      subtitles: string;
      audioUrl: string;
    },
    targetLanguages: string[]
  ): Promise<Map<string, LocalizedContent>> {
    const localizedContent = new Map<string, LocalizedContent>();

    // Add English
    localizedContent.set('en', {
      episodeId,
      language: 'en',
      title: englishContent.title,
      description: englishContent.description,
      transcription: englishContent.transcription,
      subtitles: englishContent.subtitles,
    });

    // Generate localized versions
    for (const lang of targetLanguages) {
      if (lang === 'en') continue;

      try {
        console.log(`[Localization] Creating ${lang} version of episode ${episodeId}`);

        // Translate metadata
        const titleResult = await this.translateContent(englishContent.title, 'en', lang);
        const descResult = await this.translateContent(englishContent.description, 'en', lang);
        const transcResult = await this.translateContent(englishContent.transcription, 'en', lang);
        const subResult = await this.translateContent(englishContent.subtitles, 'en', lang);

        // Generate accessible audio
        const audioResult = await this.generateAccessibleAudio(episodeId, transcResult.translation || '', lang);

        localizedContent.set(lang, {
          episodeId,
          language: lang,
          title: titleResult.translation || englishContent.title,
          description: descResult.translation || englishContent.description,
          transcription: transcResult.translation || englishContent.transcription,
          subtitles: subResult.translation || englishContent.subtitles,
        });

        console.log(`[Localization] Completed ${lang} version of episode ${episodeId}`);
      } catch (error) {
        console.error(`Failed to create ${lang} version:`, error);
      }
    }

    return localizedContent;
  }

  getSupportedLanguages(): LanguageSupport[] {
    return this.supportedLanguages;
  }

  private getLanguageName(code: string): string {
    const lang = this.supportedLanguages.find((l) => l.code === code);
    return lang ? lang.name : code;
  }
}

export const multiLanguageSupport = new MultiLanguageSupport();
