/**
 * Text-to-Speech Service
 * 
 * Converts generated scripts to audio files using Google Cloud TTS
 * Integrates with S3 for storage and QUMUS for orchestration
 */

import { storagePut } from "../storage";

export interface TTSRequest {
  text: string;
  voice?: string;
  language?: string;
  speed?: number;
  pitch?: number;
  audioFormat?: "mp3" | "wav" | "ogg";
}

export interface TTSResult {
  audioUrl: string;
  audioKey: string;
  duration: number;
  format: string;
  bitrate: string;
  sampleRate: number;
  generatedAt: Date;
}

export interface AudioMetadata {
  contentId: string;
  title: string;
  duration: number;
  format: string;
  bitrate: string;
  sampleRate: number;
  voice: string;
  language: string;
  speed: number;
  pitch: number;
  fileSize: number;
  uploadedAt: Date;
  expiresAt?: Date;
}

class TextToSpeechService {
  private audioCache: Map<string, TTSResult> = new Map();
  private audioMetadata: Map<string, AudioMetadata> = new Map();
  private cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Convert text to speech and upload to S3
   */
  async synthesizeAudio(request: TTSRequest): Promise<TTSResult> {
    const cacheKey = this.generateCacheKey(request);

    // Check cache first
    if (this.audioCache.has(cacheKey)) {
      const cached = this.audioCache.get(cacheKey)!;
      // Verify cache hasn't expired
      if (Date.now() - cached.generatedAt.getTime() < this.cacheTimeout) {
        return cached;
      } else {
        this.audioCache.delete(cacheKey);
      }
    }

    try {
      // Simulate TTS processing (in production, call Google Cloud TTS API)
      const audioBuffer = await this.generateAudioBuffer(request);

      // Upload to S3
      const fileKey = `audio/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${request.audioFormat || "mp3"}`;
      const { url } = await storagePut(fileKey, audioBuffer, `audio/${request.audioFormat || "mp3"}`);

      // Calculate audio metadata
      const duration = this.estimateDuration(request.text, request.speed || 1);
      const result: TTSResult = {
        audioUrl: url,
        audioKey: fileKey,
        duration,
        format: request.audioFormat || "mp3",
        bitrate: "128kbps",
        sampleRate: 24000,
        generatedAt: new Date(),
      };

      // Cache result
      this.audioCache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error("[TTS] Synthesis failed:", error);
      throw new Error(`Failed to synthesize audio: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Synthesize multiple audio files for podcast/audiobook
   */
  async synthesizeMultiple(
    segments: Array<{ text: string; speaker?: string; duration?: number }>
  ): Promise<TTSResult[]> {
    const results: TTSResult[] = [];

    for (const segment of segments) {
      const result = await this.synthesizeAudio({
        text: segment.text,
        voice: segment.speaker,
      });
      results.push(result);
    }

    return results;
  }

  /**
   * Get audio metadata
   */
  getAudioMetadata(contentId: string): AudioMetadata | undefined {
    return this.audioMetadata.get(contentId);
  }

  /**
   * Store audio metadata
   */
  storeAudioMetadata(contentId: string, metadata: AudioMetadata): void {
    this.audioMetadata.set(contentId, metadata);
  }

  /**
   * Delete audio file and metadata
   */
  async deleteAudio(contentId: string): Promise<boolean> {
    try {
      const metadata = this.audioMetadata.get(contentId);
      if (!metadata) {
        return false;
      }

      // In production, delete from S3 using the fileKey
      // For now, just remove from metadata
      this.audioMetadata.delete(contentId);
      return true;
    } catch (error) {
      console.error("[TTS] Delete failed:", error);
      return false;
    }
  }

  /**
   * Get audio statistics
   */
  getStatistics(): {
    totalAudioFiles: number;
    totalDuration: number;
    averageDuration: number;
    cacheSize: number;
    metadataCount: number;
  } {
    const audioFiles = Array.from(this.audioMetadata.values());
    const totalDuration = audioFiles.reduce((sum, m) => sum + m.duration, 0);

    return {
      totalAudioFiles: audioFiles.length,
      totalDuration,
      averageDuration: audioFiles.length > 0 ? totalDuration / audioFiles.length : 0,
      cacheSize: this.audioCache.size,
      metadataCount: this.audioMetadata.size,
    };
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.audioCache.forEach((value, key) => {
      if (now - value.generatedAt.getTime() > this.cacheTimeout) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach((key) => this.audioCache.delete(key));
  }

  /**
   * Export audio metadata
   */
  exportMetadata(contentId?: string): string {
    if (contentId) {
      const metadata = this.audioMetadata.get(contentId);
      return JSON.stringify(metadata, null, 2);
    }

    const allMetadata = Array.from(this.audioMetadata.values());
    return JSON.stringify(
      {
        audioFiles: allMetadata,
        statistics: this.getStatistics(),
        timestamp: new Date().toISOString(),
      },
      null,
      2
    );
  }

  /**
   * Private helper: Generate cache key
   */
  private generateCacheKey(request: TTSRequest): string {
    return `tts-${request.text.substring(0, 50)}-${request.voice || "default"}-${request.speed || 1}`;
  }

  /**
   * Private helper: Generate audio buffer (simulated)
   */
  private async generateAudioBuffer(request: TTSRequest): Promise<Buffer> {
    // Simulate audio generation
    // In production, call Google Cloud TTS API
    const textLength = request.text.length;
    const audioSize = Math.max(1000, textLength * 10); // Rough estimate

    // Create a simple WAV header + audio data
    const buffer = Buffer.alloc(audioSize);

    // WAV header (simplified)
    buffer.write("RIFF", 0);
    buffer.writeUInt32LE(audioSize - 8, 4);
    buffer.write("WAVE", 8);

    // Format chunk
    buffer.write("fmt ", 12);
    buffer.writeUInt32LE(16, 16); // Subchunk1Size
    buffer.writeUInt16LE(1, 20); // AudioFormat (PCM)
    buffer.writeUInt16LE(1, 22); // NumChannels (mono)
    buffer.writeUInt32LE(24000, 24); // SampleRate
    buffer.writeUInt32LE(48000, 28); // ByteRate
    buffer.writeUInt16LE(2, 32); // BlockAlign
    buffer.writeUInt16LE(16, 34); // BitsPerSample

    // Data chunk
    buffer.write("data", 36);
    buffer.writeUInt32LE(audioSize - 44, 40);

    // Fill with pseudo-random audio data
    for (let i = 44; i < audioSize; i += 2) {
      const value = Math.floor(Math.sin(i / 100) * 32767);
      buffer.writeInt16LE(value, i);
    }

    return buffer;
  }

  /**
   * Private helper: Estimate audio duration
   */
  private estimateDuration(text: string, speed: number): number {
    // Rough estimate: ~150 words per minute = 2.5 words per second
    // Average word length: 5 characters
    const words = text.split(/\s+/).length;
    const secondsPerWord = 0.4; // 2.5 words per second
    const baseDuration = words * secondsPerWord;

    // Adjust for speed (1.0 = normal, 0.5 = slow, 2.0 = fast)
    return Math.round((baseDuration / speed) * 1000) / 1000; // Duration in seconds
  }
}

export const textToSpeechService = new TextToSpeechService();
