/**
 * Real Text-to-Speech Service
 * Uses the Forge API's OpenAI-compatible TTS endpoint for actual audio generation.
 * Supports multiple voices, speeds, and uploads to S3.
 * No VEO or proprietary dependencies.
 */
import { ENV } from "./env";
import { storagePut } from "../storage";

export interface TtsOptions {
  text: string;
  voice?: string;
  speed?: number;
  model?: string;
}

export interface TtsResult {
  success: boolean;
  audioUrl?: string;
  audioKey?: string;
  duration?: number;
  voice: string;
  error?: string;
}

// Available voices (OpenAI-compatible)
export const AVAILABLE_VOICES = [
  { id: 'alloy', name: 'Alloy', gender: 'neutral', description: 'Versatile, balanced voice' },
  { id: 'echo', name: 'Echo', gender: 'male', description: 'Warm, conversational male voice' },
  { id: 'fable', name: 'Fable', gender: 'male', description: 'Expressive, storytelling voice' },
  { id: 'onyx', name: 'Onyx', gender: 'male', description: 'Deep, authoritative voice' },
  { id: 'nova', name: 'Nova', gender: 'female', description: 'Warm, nurturing female voice' },
  { id: 'shimmer', name: 'Shimmer', gender: 'female', description: 'Bright, energetic female voice' },
];

// DJ personality voice mapping
export const DJ_VOICES: Record<string, string> = {
  valanna: 'nova',
  seraph: 'onyx',
  candy: 'echo',
  qumus: 'alloy',
};

class RealTtsService {
  private isAvailable: boolean | null = null;

  /**
   * Check if the Forge TTS endpoint is available
   */
  async checkAvailability(): Promise<boolean> {
    if (this.isAvailable !== null) return this.isAvailable;
    try {
      const baseUrl = ENV.forgeApiUrl?.replace(/\/$/, '');
      if (!baseUrl || !ENV.forgeApiKey) {
        this.isAvailable = false;
        return false;
      }
      // Quick test with minimal input
      const response = await fetch(`${baseUrl}/v1/audio/speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ENV.forgeApiKey}`,
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: 'Test.',
          voice: 'alloy',
        }),
      });
      this.isAvailable = response.ok;
      console.log(`[RealTTS] Forge TTS available: ${this.isAvailable}`);
      return this.isAvailable;
    } catch {
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Generate speech audio from text
   */
  async generateSpeech(options: TtsOptions): Promise<TtsResult> {
    const voice = options.voice || 'alloy';
    const speed = options.speed || 1.0;
    const model = options.model || 'tts-1-hd';

    const available = await this.checkAvailability();
    if (!available) {
      return {
        success: false,
        voice,
        error: 'TTS service not available. Frontend will use Web Speech API fallback.',
      };
    }

    try {
      const baseUrl = ENV.forgeApiUrl?.replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/v1/audio/speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ENV.forgeApiKey}`,
        },
        body: JSON.stringify({
          model,
          input: options.text,
          voice,
          speed,
          response_format: 'mp3',
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          voice,
          error: `TTS API returned ${response.status}: ${response.statusText}`,
        };
      }

      const audioBuffer = Buffer.from(await response.arrayBuffer());
      const fileKey = `tts/${Date.now()}-${Math.random().toString(36).substr(2, 6)}.mp3`;
      const { url } = await storagePut(fileKey, audioBuffer, 'audio/mpeg');

      // Estimate duration from word count
      const words = options.text.split(/\s+/).length;
      const duration = Math.round((words / 2.5) / speed);

      return {
        success: true,
        audioUrl: url,
        audioKey: fileKey,
        duration,
        voice,
      };
    } catch (error: any) {
      return {
        success: false,
        voice,
        error: error.message || 'TTS generation failed',
      };
    }
  }

  /**
   * Generate speech with a DJ personality voice
   */
  async generateDjSpeech(text: string, djName: string, speed?: number): Promise<TtsResult> {
    const voice = DJ_VOICES[djName.toLowerCase()] || 'alloy';
    return this.generateSpeech({ text, voice, speed });
  }

  /**
   * Get list of available voices
   */
  getVoices() {
    return AVAILABLE_VOICES;
  }
}

export const realTtsService = new RealTtsService();
