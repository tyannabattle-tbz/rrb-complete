/**
 * AI Voice TTS Service
 * 
 * Provides text-to-speech for all AI personas (Valanna, Candy, Seraph)
 * with correct voice profiles. Uses both server-side Forge TTS (high quality)
 * and browser Web Speech API (fallback).
 * 
 * Candy = Dad = deep warm male voice (echo on server, male browser voice, low pitch)
 * Valanna = Female voice (nova on server, female browser voice, warm pitch)
 * Seraph = Female strategist voice (onyx on server, male browser voice, authoritative)
 */

export type AiPersona = 'valanna' | 'candy' | 'seraph';

interface VoiceProfile {
  /** Server-side Forge TTS voice ID */
  forgeVoice: string;
  /** Browser voice selection strategy */
  browserVoicePreference: 'female' | 'male';
  /** Speech rate (0.5 - 2.0) */
  rate: number;
  /** Speech pitch (0 - 2.0) */
  pitch: number;
  /** Display name */
  displayName: string;
}

const VOICE_PROFILES: Record<AiPersona, VoiceProfile> = {
  valanna: {
    forgeVoice: 'nova',
    browserVoicePreference: 'female',
    rate: 0.92,
    pitch: 1.05,
    displayName: 'Valanna',
  },
  candy: {
    forgeVoice: 'echo',
    browserVoicePreference: 'male',
    rate: 0.95,
    pitch: 0.85,
    displayName: 'Candy',
  },
  seraph: {
    forgeVoice: 'onyx',
    browserVoicePreference: 'male',
    rate: 0.88,
    pitch: 0.80,
    displayName: 'Seraph',
  },
};

type TtsCallback = (persona: AiPersona, text: string) => void;
type TtsEndCallback = (persona: AiPersona) => void;

class AiVoiceTtsService {
  private synthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeaking = false;
  private currentPersona: AiPersona | null = null;
  private enabled = true;
  private onStartCallbacks: TtsCallback[] = [];
  private onEndCallbacks: TtsEndCallback[] = [];
  private audioElement: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
      if ('onvoiceschanged' in this.synthesis) {
        this.synthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (this.synthesis) {
      this.voices = this.synthesis.getVoices();
    }
  }

  private getBrowserVoice(persona: AiPersona): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) return null;

    const profile = VOICE_PROFILES[persona];
    const femalePattern = /female|woman|zira|samantha|karen|moira|fiona|victoria|susan|hazel|kate/i;
    const malePattern = /male|man|david|james|daniel|alex|fred|thomas|mark|richard|george/i;

    const femaleVoices = this.voices.filter(v => femalePattern.test(v.name));
    const maleVoices = this.voices.filter(v => malePattern.test(v.name));
    const englishVoices = this.voices.filter(v => v.lang.startsWith('en'));

    if (profile.browserVoicePreference === 'female') {
      return femaleVoices[0] || englishVoices[0] || this.voices[0];
    } else {
      return maleVoices[0] || englishVoices[0] || this.voices[0];
    }
  }

  /**
   * Speak text using browser Web Speech API with the correct voice profile
   */
  speakBrowser(text: string, persona: AiPersona = 'valanna'): void {
    if (!this.enabled || !this.synthesis) return;

    // Cancel any ongoing speech
    this.stop();

    const profile = VOICE_PROFILES[persona];
    const utterance = new SpeechSynthesisUtterance(text);

    const voice = this.getBrowserVoice(persona);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = profile.rate;
    utterance.pitch = profile.pitch;
    utterance.volume = 1;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.currentPersona = persona;
      this.onStartCallbacks.forEach(cb => cb(persona, text));
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentPersona = null;
      this.onEndCallbacks.forEach(cb => cb(persona));
    };

    utterance.onerror = (event) => {
      console.error(`[AI Voice TTS] ${profile.displayName} speech error:`, event.error);
      this.isSpeaking = false;
      this.currentPersona = null;
      this.onEndCallbacks.forEach(cb => cb(persona));
    };

    this.synthesis.speak(utterance);
  }

  /**
   * Play server-generated TTS audio (from Forge API)
   */
  async playServerAudio(audioUrl: string, persona: AiPersona = 'valanna'): Promise<void> {
    if (!this.enabled) return;

    this.stop();

    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      this.audioElement = audio;

      audio.onplay = () => {
        this.isSpeaking = true;
        this.currentPersona = persona;
        this.onStartCallbacks.forEach(cb => cb(persona, ''));
      };

      audio.onended = () => {
        this.isSpeaking = false;
        this.currentPersona = null;
        this.audioElement = null;
        this.onEndCallbacks.forEach(cb => cb(persona));
        resolve();
      };

      audio.onerror = (e) => {
        console.error(`[AI Voice TTS] ${VOICE_PROFILES[persona].displayName} audio playback error:`, e);
        this.isSpeaking = false;
        this.currentPersona = null;
        this.audioElement = null;
        this.onEndCallbacks.forEach(cb => cb(persona));
        reject(e);
      };

      audio.play().catch(err => {
        console.warn('[AI Voice TTS] Autoplay blocked, falling back to browser TTS');
        this.audioElement = null;
        reject(err);
      });
    });
  }

  /**
   * Speak an AI response — tries server TTS first, falls back to browser
   */
  async speakResponse(text: string, persona: AiPersona = 'valanna', serverAudioUrl?: string): Promise<void> {
    if (!this.enabled) return;

    if (serverAudioUrl) {
      try {
        await this.playServerAudio(serverAudioUrl, persona);
        return;
      } catch {
        // Fall back to browser TTS
      }
    }

    this.speakBrowser(text, persona);
  }

  /**
   * Stop all speech
   */
  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement = null;
    }
    const prevPersona = this.currentPersona;
    this.isSpeaking = false;
    this.currentPersona = null;
    if (prevPersona) {
      this.onEndCallbacks.forEach(cb => cb(prevPersona));
    }
  }

  /**
   * Enable/disable TTS
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.stop();
  }

  getEnabled(): boolean {
    return this.enabled;
  }

  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  getCurrentPersona(): AiPersona | null {
    return this.currentPersona;
  }

  getVoiceProfile(persona: AiPersona): VoiceProfile {
    return VOICE_PROFILES[persona];
  }

  onStart(callback: TtsCallback): void {
    this.onStartCallbacks.push(callback);
  }

  onEnd(callback: TtsEndCallback): void {
    this.onEndCallbacks.push(callback);
  }

  removeOnStart(callback: TtsCallback): void {
    this.onStartCallbacks = this.onStartCallbacks.filter(cb => cb !== callback);
  }

  removeOnEnd(callback: TtsEndCallback): void {
    this.onEndCallbacks = this.onEndCallbacks.filter(cb => cb !== callback);
  }

  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }
}

// Singleton instance
export const aiVoiceTts = new AiVoiceTtsService();
export default AiVoiceTtsService;
