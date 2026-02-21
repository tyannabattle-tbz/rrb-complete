/**
 * Live Transcription & Captions Service
 * Handles real-time speech-to-text and multi-language caption generation
 */

interface Caption {
  id: string;
  text: string;
  startTime: number; // milliseconds
  endTime: number;
  language: string;
  speaker?: string;
  confidence: number; // 0-1
  edited: boolean;
}

interface TranscriptionSegment {
  id: string;
  text: string;
  timestamp: number;
  language: string;
  speaker?: string;
  confidence: number;
}

type SupportedLanguage = 'en' | 'fr' | 'es' | 'sw' | 'ar' | 'pt' | 'zh' | 'de';

interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}

export class LiveTranscriptionService {
  private captions: Map<string, Caption> = new Map();
  private transcriptions: TranscriptionSegment[] = [];
  private currentLanguage: SupportedLanguage = 'en';
  private supportedLanguages: Map<SupportedLanguage, LanguageConfig> = new Map([
    ['en', { code: 'en', name: 'English', nativeName: 'English' }],
    ['fr', { code: 'fr', name: 'French', nativeName: 'Français' }],
    ['es', { code: 'es', name: 'Spanish', nativeName: 'Español' }],
    ['sw', { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' }],
    ['ar', { code: 'ar', name: 'Arabic', nativeName: 'العربية' }],
    ['pt', { code: 'pt', name: 'Portuguese', nativeName: 'Português' }],
    ['zh', { code: 'zh', name: 'Mandarin', nativeName: '中文' }],
    ['de', { code: 'de', name: 'German', nativeName: 'Deutsch' }],
  ]);

  /**
   * Add a new caption
   */
  addCaption(caption: Omit<Caption, 'id' | 'edited'>): Caption {
    const id = `cap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullCaption: Caption = {
      ...caption,
      id,
      edited: false,
    };

    this.captions.set(id, fullCaption);
    console.log(`[Transcription] Caption added: ${id}`);

    return fullCaption;
  }

  /**
   * Update caption text (for moderator corrections)
   */
  updateCaption(id: string, text: string): Caption | null {
    const caption = this.captions.get(id);
    if (!caption) return null;

    caption.text = text;
    caption.edited = true;
    console.log(`[Transcription] Caption updated: ${id}`);

    return caption;
  }

  /**
   * Get captions for a time range
   */
  getCaptionsForTimeRange(startTime: number, endTime: number): Caption[] {
    return Array.from(this.captions.values()).filter(
      cap => cap.startTime >= startTime && cap.endTime <= endTime
    );
  }

  /**
   * Get all captions
   */
  getAllCaptions(): Caption[] {
    return Array.from(this.captions.values()).sort((a, b) => a.startTime - b.startTime);
  }

  /**
   * Get captions for current language
   */
  getCaptionsForLanguage(language: SupportedLanguage): Caption[] {
    return Array.from(this.captions.values())
      .filter(cap => cap.language === language)
      .sort((a, b) => a.startTime - b.startTime);
  }

  /**
   * Transcribe audio segment (simulated - in production use Whisper API)
   */
  async transcribeAudioSegment(
    audioUrl: string,
    language: SupportedLanguage = 'en'
  ): Promise<TranscriptionSegment> {
    try {
      console.log(`[Transcription] Transcribing audio in ${language}...`);

      // In production, call actual Whisper API
      const transcription = await this.simulateWhisperTranscription(audioUrl, language);

      this.transcriptions.push(transcription);
      console.log(`[Transcription] Transcription complete: ${transcription.id}`);

      return transcription;
    } catch (error) {
      console.error('[Transcription] Transcription failed:', error);
      throw error;
    }
  }

  /**
   * Simulate Whisper API transcription (for development)
   */
  private async simulateWhisperTranscription(
    audioUrl: string,
    language: SupportedLanguage
  ): Promise<TranscriptionSegment> {
    return new Promise(resolve => {
      setTimeout(() => {
        const mockTranscriptions: Record<SupportedLanguage, string> = {
          en: 'This is a sample transcription in English.',
          fr: 'Ceci est une transcription exemple en français.',
          es: 'Esta es una transcripción de ejemplo en español.',
          sw: 'Hii ni sampuli ya maandishi katika Kiswahili.',
          ar: 'هذا نموذج نص باللغة العربية.',
          pt: 'Esta é uma transcrição de exemplo em português.',
          zh: '这是中文的示例转录。',
          de: 'Dies ist eine Beispieltranskription auf Deutsch.',
        };

        resolve({
          id: `trans-${Date.now()}`,
          text: mockTranscriptions[language],
          timestamp: Date.now(),
          language,
          confidence: 0.95,
        });
      }, 1000);
    });
  }

  /**
   * Translate caption to another language
   */
  async translateCaption(captionId: string, targetLanguage: SupportedLanguage): Promise<Caption | null> {
    const caption = this.captions.get(captionId);
    if (!caption) return null;

    try {
      console.log(`[Transcription] Translating caption to ${targetLanguage}...`);

      // In production, use translation API
      const translatedText = await this.simulateTranslation(caption.text, caption.language, targetLanguage);

      // Create new caption for translated version
      const translatedCaption = this.addCaption({
        text: translatedText,
        startTime: caption.startTime,
        endTime: caption.endTime,
        language: targetLanguage,
        speaker: caption.speaker,
        confidence: caption.confidence * 0.9, // Slightly lower confidence for translations
      });

      return translatedCaption;
    } catch (error) {
      console.error('[Transcription] Translation failed:', error);
      throw error;
    }
  }

  /**
   * Simulate translation (for development)
   */
  private async simulateTranslation(
    text: string,
    sourceLanguage: SupportedLanguage,
    targetLanguage: SupportedLanguage
  ): Promise<string> {
    return new Promise(resolve => {
      setTimeout(() => {
        // Simulate translation delay
        const translations: Record<string, string> = {
          'en-fr': 'Ceci est un exemple de traduction.',
          'en-es': 'Este es un ejemplo de traducción.',
          'en-sw': 'Hii ni mfano wa tafsiri.',
          'fr-en': 'This is a translation example.',
          'es-en': 'This is a translation example.',
        };

        const key = `${sourceLanguage}-${targetLanguage}`;
        resolve(translations[key] || text);
      }, 500);
    });
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): LanguageConfig[] {
    return Array.from(this.supportedLanguages.values());
  }

  /**
   * Set current language
   */
  setCurrentLanguage(language: SupportedLanguage): boolean {
    if (!this.supportedLanguages.has(language)) {
      console.error(`[Transcription] Unsupported language: ${language}`);
      return false;
    }

    this.currentLanguage = language;
    console.log(`[Transcription] Current language set to: ${language}`);
    return true;
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Export captions as VTT format (for video players)
   */
  exportAsVTT(language?: SupportedLanguage): string {
    const captions = language
      ? this.getCaptionsForLanguage(language)
      : this.getAllCaptions();

    let vtt = 'WEBVTT\n\n';

    captions.forEach(cap => {
      const startTime = this.formatVTTTime(cap.startTime);
      const endTime = this.formatVTTTime(cap.endTime);
      vtt += `${startTime} --> ${endTime}\n${cap.text}\n\n`;
    });

    return vtt;
  }

  /**
   * Export captions as SRT format
   */
  exportAsSRT(language?: SupportedLanguage): string {
    const captions = language
      ? this.getCaptionsForLanguage(language)
      : this.getAllCaptions();

    let srt = '';
    captions.forEach((cap, idx) => {
      const startTime = this.formatSRTTime(cap.startTime);
      const endTime = this.formatSRTTime(cap.endTime);
      srt += `${idx + 1}\n${startTime} --> ${endTime}\n${cap.text}\n\n`;
    });

    return srt;
  }

  /**
   * Export captions as JSON
   */
  exportAsJSON(language?: SupportedLanguage): string {
    const captions = language
      ? this.getCaptionsForLanguage(language)
      : this.getAllCaptions();

    return JSON.stringify(captions, null, 2);
  }

  /**
   * Format time for VTT format (HH:MM:SS.mmm)
   */
  private formatVTTTime(ms: number): string {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = ms % 1000;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
  }

  /**
   * Format time for SRT format (HH:MM:SS,mmm)
   */
  private formatSRTTime(ms: number): string {
    const vttTime = this.formatVTTTime(ms);
    return vttTime.replace('.', ',');
  }

  /**
   * Get transcription statistics
   */
  getStatistics(): {
    totalCaptions: number;
    totalTranscriptions: number;
    languagesUsed: string[];
    averageConfidence: number;
    editedCaptions: number;
  } {
    const captions = Array.from(this.captions.values());
    const languages = new Set(captions.map(c => c.language));
    const avgConfidence =
      captions.length > 0
        ? captions.reduce((sum, c) => sum + c.confidence, 0) / captions.length
        : 0;

    return {
      totalCaptions: captions.length,
      totalTranscriptions: this.transcriptions.length,
      languagesUsed: Array.from(languages),
      averageConfidence: Math.round(avgConfidence * 100) / 100,
      editedCaptions: captions.filter(c => c.edited).length,
    };
  }

  /**
   * Clear all captions and transcriptions
   */
  clearAll(): void {
    this.captions.clear();
    this.transcriptions = [];
    console.log('[Transcription] All captions and transcriptions cleared');
  }
}

// Export singleton instance
export const liveTranscriptionService = new LiveTranscriptionService();
