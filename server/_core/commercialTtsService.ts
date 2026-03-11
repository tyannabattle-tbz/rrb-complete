/**
 * Commercial TTS Service
 * Generates audio files for UN campaign commercials using the Forge API TTS endpoint
 * Falls back to browser-based Web Speech API if server TTS is unavailable
 */

import { ENV } from "./env";
import { storagePut } from "../storage";

export interface CommercialAudio {
  id: string;
  title: string;
  audioUrl: string;
  audioKey: string;
  duration: number;
  djVoice: string;
  generatedAt: Date;
}

// Voice mapping for DJ personalities
// Using OpenAI-compatible voice names
const DJ_VOICE_MAP: Record<string, string> = {
  valanna: "nova",      // Warm, female, nurturing
  seraph: "onyx",       // Deep, authoritative, male
  candy: "echo",        // Warm, expressive, male (dad)
};

const DJ_VOICE_SPEED: Record<string, number> = {
  valanna: 0.95,   // Slightly slower, warm delivery
  seraph: 0.90,    // Measured, authoritative pace
  candy: 0.95,     // Warm, natural male delivery (dad)
};

class CommercialTtsService {
  private generatedAudio: Map<string, CommercialAudio> = new Map();
  private isForgeAvailable: boolean | null = null;

  /**
   * Check if Forge TTS endpoint is available
   */
  private async checkForgeAvailability(): Promise<boolean> {
    if (this.isForgeAvailable !== null) return this.isForgeAvailable;

    try {
      const baseUrl = ENV.forgeApiUrl?.replace(/\/$/, '');
      if (!baseUrl || !ENV.forgeApiKey) {
        this.isForgeAvailable = false;
        return false;
      }

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

      this.isForgeAvailable = response.ok;
      console.log(`[CommercialTTS] Forge TTS available: ${this.isForgeAvailable}`);
      return this.isForgeAvailable;
    } catch {
      this.isForgeAvailable = false;
      console.log('[CommercialTTS] Forge TTS not available, will use browser fallback');
      return false;
    }
  }

  /**
   * Generate audio for a single commercial using Forge TTS API
   */
  async generateCommercialAudio(
    commercialId: string,
    title: string,
    script: string,
    djVoice: string
  ): Promise<CommercialAudio | null> {
    // Check cache first
    if (this.generatedAudio.has(commercialId)) {
      return this.generatedAudio.get(commercialId)!;
    }

    const forgeAvailable = await this.checkForgeAvailability();

    if (forgeAvailable) {
      return this.generateViaForge(commercialId, title, script, djVoice);
    }

    // Return null — frontend will use Web Speech API fallback
    console.log(`[CommercialTTS] No server TTS for ${commercialId}, frontend will use Web Speech API`);
    return null;
  }

  /**
   * Generate via Forge API TTS endpoint
   */
  private async generateViaForge(
    commercialId: string,
    title: string,
    script: string,
    djVoice: string
  ): Promise<CommercialAudio | null> {
    try {
      const baseUrl = ENV.forgeApiUrl?.replace(/\/$/, '');
      const voice = DJ_VOICE_MAP[djVoice] || 'alloy';
      const speed = DJ_VOICE_SPEED[djVoice] || 1.0;

      const response = await fetch(`${baseUrl}/v1/audio/speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ENV.forgeApiKey}`,
        },
        body: JSON.stringify({
          model: 'tts-1-hd',
          input: script,
          voice,
          speed,
          response_format: 'mp3',
        }),
      });

      if (!response.ok) {
        console.error(`[CommercialTTS] Forge TTS failed: ${response.status}`);
        return null;
      }

      const audioBuffer = Buffer.from(await response.arrayBuffer());
      const fileKey = `commercials/${commercialId}-${Date.now()}.mp3`;
      const { url } = await storagePut(fileKey, audioBuffer, 'audio/mpeg');

      // Estimate duration from script word count
      const words = script.split(/\s+/).length;
      const duration = Math.round(words / 2.5); // ~150 wpm

      const audio: CommercialAudio = {
        id: commercialId,
        title,
        audioUrl: url,
        audioKey: fileKey,
        duration,
        djVoice,
        generatedAt: new Date(),
      };

      this.generatedAudio.set(commercialId, audio);
      console.log(`[CommercialTTS] Generated audio for "${title}" (${duration}s, voice: ${voice})`);
      return audio;
    } catch (error) {
      console.error(`[CommercialTTS] Error generating audio:`, error);
      return null;
    }
  }

  /**
   * Generate audio for all commercials
   */
  async generateAllCommercialAudio(
    commercials: Array<{ id: string; title: string; script: string; djVoice: string }>
  ): Promise<{ generated: CommercialAudio[]; fallback: string[] }> {
    const generated: CommercialAudio[] = [];
    const fallback: string[] = [];

    for (const commercial of commercials) {
      const audio = await this.generateCommercialAudio(
        commercial.id,
        commercial.title,
        commercial.script,
        commercial.djVoice
      );

      if (audio) {
        generated.push(audio);
      } else {
        fallback.push(commercial.id);
      }
    }

    return { generated, fallback };
  }

  /**
   * Get audio URL for a commercial (returns null if not generated)
   */
  getAudioUrl(commercialId: string): string | null {
    return this.generatedAudio.get(commercialId)?.audioUrl || null;
  }

  /**
   * Get all generated audio
   */
  getAllGeneratedAudio(): CommercialAudio[] {
    return Array.from(this.generatedAudio.values());
  }

  /**
   * Get generation statistics
   */
  getStats(): { total: number; generated: number; pending: number } {
    return {
      total: 12, // Total UN campaign commercials
      generated: this.generatedAudio.size,
      pending: 12 - this.generatedAudio.size,
    };
  }
}

export const commercialTtsService = new CommercialTtsService();
