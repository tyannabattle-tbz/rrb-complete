/**
 * Text-to-Speech Service
 * Handles text-to-speech conversion using Web Speech Synthesis API
 */

interface TextToSpeechConfig {
  text: string;
  language?: string;
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  volume?: number; // 0 to 1
  voiceIndex?: number;
}

interface VoiceInfo {
  name: string;
  lang: string;
  default: boolean;
  localService: boolean;
}

type TextToSpeechCallback = () => void;
type TextToSpeechErrorCallback = (error: string) => void;

class TextToSpeechService {
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;
  private callbacks: TextToSpeechCallback[] = [];
  private errorCallbacks: TextToSpeechErrorCallback[] = [];

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
    
    // Reload voices when they change
    if ('onvoiceschanged' in this.synthesis) {
      this.synthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices() {
    this.voices = this.synthesis.getVoices();
    console.log(`Loaded ${this.voices.length} voices`);
  }

  /**
   * Speak text
   */
  public speak(config: TextToSpeechConfig) {
    if (!this.synthesis) {
      this.errorCallbacks.forEach(cb => cb('Speech Synthesis API not supported'));
      return;
    }

    // Cancel any ongoing speech
    if (this.isSpeaking) {
      this.synthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(config.text);

    // Set voice
    if (config.voiceIndex !== undefined && this.voices[config.voiceIndex]) {
      utterance.voice = this.voices[config.voiceIndex];
    } else {
      // Use default voice for language
      const lang = config.language || 'en-US';
      const voice = this.voices.find(v => v.lang.startsWith(lang.split('-')[0]));
      if (voice) {
        utterance.voice = voice;
      }
    }

    // Set properties
    utterance.rate = config.rate || 1;
    utterance.pitch = config.pitch || 1;
    utterance.volume = config.volume || 1;
    utterance.lang = config.language || 'en-US';

    // Setup event handlers
    utterance.onstart = () => {
      this.isSpeaking = true;
      console.log('Speech started');
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.callbacks.forEach(cb => cb());
      console.log('Speech ended');
    };

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      this.isSpeaking = false;
      const errorMessage = `Speech synthesis error: ${event.error}`;
      console.error(errorMessage);
      this.errorCallbacks.forEach(cb => cb(errorMessage));
    };

    this.currentUtterance = utterance;
    this.synthesis.speak(utterance);
  }

  /**
   * Pause speech
   */
  public pause() {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.pause();
    }
  }

  /**
   * Resume speech
   */
  public resume() {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.resume();
    }
  }

  /**
   * Stop speech
   */
  public stop() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  /**
   * Check if currently speaking
   */
  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Get available voices
   */
  public getVoices(): VoiceInfo[] {
    return this.voices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      default: voice.default,
      localService: voice.localService
    }));
  }

  /**
   * Get voices for specific language
   */
  public getVoicesByLanguage(language: string): VoiceInfo[] {
    return this.voices
      .filter(voice => voice.lang.startsWith(language.split('-')[0]))
      .map(voice => ({
        name: voice.name,
        lang: voice.lang,
        default: voice.default,
        localService: voice.localService
      }));
  }

  /**
   * Register callback for when speech ends
   */
  public onEnd(callback: TextToSpeechCallback) {
    this.callbacks.push(callback);
  }

  /**
   * Register callback for errors
   */
  public onError(callback: TextToSpeechErrorCallback) {
    this.errorCallbacks.push(callback);
  }

  /**
   * Remove callback
   */
  public removeCallback(callback: TextToSpeechCallback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  /**
   * Remove error callback
   */
  public removeErrorCallback(callback: TextToSpeechErrorCallback) {
    this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Check if Text-to-Speech is supported
   */
  public static isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  /**
   * Get available languages
   */
  public static getAvailableLanguages(): string[] {
    return [
      'en-US', 'en-GB', 'en-AU',
      'es-ES', 'es-MX',
      'fr-FR',
      'de-DE',
      'it-IT',
      'ja-JP',
      'ko-KR',
      'zh-CN', 'zh-TW',
      'pt-BR',
      'ru-RU',
      'ar-SA',
      'hi-IN'
    ];
  }
}

// Export singleton instance
export const textToSpeechService = new TextToSpeechService();
export default TextToSpeechService;
