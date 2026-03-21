import { transcribeAudio } from './_core/voiceTranscription';
import { invokeLLM } from './_core/llm';
import { db } from '../db';

export interface TranscriptionResult {
  episodeId: string;
  text: string;
  language: string;
  segments: Array<{
    id: number;
    seek: number;
    start: number;
    end: number;
    text: string;
    tokens: number[];
    temperature: number;
    avg_logprob: number;
    compression_ratio: number;
    no_speech_prob: number;
  }>;
  duration: number;
}

export interface TranslationResult {
  episodeId: string;
  language: string;
  text: string;
  segments: Array<{
    timestamp: string;
    text: string;
  }>;
}

export class AITranscriptionService {
  async transcribeEpisode(episodeId: string, audioUrl: string): Promise<TranscriptionResult | null> {
    try {
      console.log(`[Transcription] Starting transcription for episode ${episodeId}`);

      // Call Whisper API via transcribeAudio helper
      const result = await transcribeAudio({
        audioUrl,
        language: 'en',
        prompt: 'This is a podcast episode. Transcribe all dialogue accurately.',
      });

      if (!result) {
        return null;
      }

      const transcription: TranscriptionResult = {
        episodeId,
        text: result.text,
        language: result.language || 'en',
        segments: result.segments || [],
        duration: result.duration || 0,
      };

      // Store in database
      await this.storeTranscription(episodeId, transcription);

      console.log(`[Transcription] Completed for episode ${episodeId}`);

      return transcription;
    } catch (error) {
      console.error(`[Transcription] Failed for episode ${episodeId}:`, error);
      return null;
    }
  }

  async generateSubtitles(episodeId: string, transcription: TranscriptionResult): Promise<string> {
    try {
      console.log(`[Subtitles] Generating subtitles for episode ${episodeId}`);

      let srt = '';
      let index = 1;

      transcription.segments.forEach((segment) => {
        const startTime = this.formatTimestamp(segment.start);
        const endTime = this.formatTimestamp(segment.end);

        srt += `${index}\n`;
        srt += `${startTime} --> ${endTime}\n`;
        srt += `${segment.text}\n\n`;
        index++;
      });

      // Store subtitles
      await this.storeSubtitles(episodeId, srt);

      console.log(`[Subtitles] Generated for episode ${episodeId}`);

      return srt;
    } catch (error) {
      console.error(`[Subtitles] Failed for episode ${episodeId}:`, error);
      return '';
    }
  }

  async translateTranscription(
    episodeId: string,
    transcription: TranscriptionResult,
    targetLanguage: string
  ): Promise<TranslationResult | null> {
    try {
      console.log(`[Translation] Translating episode ${episodeId} to ${targetLanguage}`);

      // Use LLM to translate transcription
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `You are a professional podcast translator. Translate the following podcast transcription to ${targetLanguage} while preserving the tone and meaning. Return the translation in the same format with timestamps.`,
          },
          {
            role: 'user',
            content: `Transcription:\n${transcription.text}`,
          },
        ],
      });

      if (!response || !response.choices || !response.choices[0]) {
        return null;
      }

      const translatedText = response.choices[0].message?.content || '';

      const translation: TranslationResult = {
        episodeId,
        language: targetLanguage,
        text: translatedText,
        segments: this.parseTranslatedSegments(translatedText),
      };

      // Store translation
      await this.storeTranslation(episodeId, translation);

      console.log(`[Translation] Completed for episode ${episodeId}`);

      return translation;
    } catch (error) {
      console.error(`[Translation] Failed for episode ${episodeId}:`, error);
      return null;
    }
  }

  async generateChapters(episodeId: string, transcription: TranscriptionResult): Promise<Array<{ timestamp: string; title: string }>> {
    try {
      console.log(`[Chapters] Generating chapters for episode ${episodeId}`);

      // Use LLM to identify natural chapter breaks
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content:
              'You are a podcast editor. Analyze this transcription and identify 3-5 natural chapter breaks. Return JSON with timestamp and title for each chapter.',
          },
          {
            role: 'user',
            content: `Transcription:\n${transcription.text.substring(0, 2000)}...`,
          },
        ],
      });

      if (!response || !response.choices || !response.choices[0]) {
        return [];
      }

      const chaptersText = response.choices[0].message?.content || '';

      try {
        const chapters = JSON.parse(chaptersText);
        await this.storeChapters(episodeId, chapters);
        console.log(`[Chapters] Generated for episode ${episodeId}`);
        return chapters;
      } catch {
        console.warn('[Chapters] Failed to parse LLM response');
        return [];
      }
    } catch (error) {
      console.error(`[Chapters] Failed for episode ${episodeId}:`, error);
      return [];
    }
  }

  async generateSearchableIndex(episodeId: string, transcription: TranscriptionResult): Promise<void> {
    try {
      console.log(`[Search Index] Creating searchable index for episode ${episodeId}`);

      // Split transcription into searchable chunks
      const chunks = this.createSearchChunks(transcription);

      // Store in database for full-text search
      await this.storeSearchIndex(episodeId, chunks);

      console.log(`[Search Index] Created for episode ${episodeId}`);
    } catch (error) {
      console.error(`[Search Index] Failed for episode ${episodeId}:`, error);
    }
  }

  private formatTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
  }

  private parseTranslatedSegments(text: string): Array<{ timestamp: string; text: string }> {
    // Parse translated text into timestamped segments
    const segments: Array<{ timestamp: string; text: string }> = [];
    const lines = text.split('\n');

    lines.forEach((line) => {
      if (line.includes('-->')) {
        segments.push({
          timestamp: line,
          text: '',
        });
      } else if (segments.length > 0 && line.trim()) {
        segments[segments.length - 1].text += line + ' ';
      }
    });

    return segments;
  }

  private createSearchChunks(transcription: TranscriptionResult): Array<{ timestamp: string; text: string; keywords: string[] }> {
    const chunks: Array<{ timestamp: string; text: string; keywords: string[] }> = [];
    const chunkSize = 500; // characters per chunk

    let currentChunk = '';
    let startTime = 0;

    transcription.segments.forEach((segment) => {
      currentChunk += segment.text + ' ';

      if (currentChunk.length >= chunkSize) {
        const keywords = this.extractKeywords(currentChunk);
        chunks.push({
          timestamp: this.formatTimestamp(startTime),
          text: currentChunk.trim(),
          keywords,
        });
        currentChunk = '';
        startTime = segment.end;
      }
    });

    // Add remaining chunk
    if (currentChunk.trim()) {
      const keywords = this.extractKeywords(currentChunk);
      chunks.push({
        timestamp: this.formatTimestamp(startTime),
        text: currentChunk.trim(),
        keywords,
      });
    }

    return chunks;
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction (in production, use NLP library)
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were']);

    return words.filter((word) => word.length > 4 && !stopWords.has(word)).slice(0, 10);
  }

  private async storeTranscription(episodeId: string, transcription: TranscriptionResult): Promise<void> {
    // Store in database
    console.log(`[DB] Storing transcription for episode ${episodeId}`);
  }

  private async storeSubtitles(episodeId: string, srt: string): Promise<void> {
    // Store in database or S3
    console.log(`[DB] Storing subtitles for episode ${episodeId}`);
  }

  private async storeTranslation(episodeId: string, translation: TranslationResult): Promise<void> {
    // Store in database
    console.log(`[DB] Storing translation for episode ${episodeId}`);
  }

  private async storeChapters(episodeId: string, chapters: any[]): Promise<void> {
    // Store in database
    console.log(`[DB] Storing chapters for episode ${episodeId}`);
  }

  private async storeSearchIndex(episodeId: string, chunks: any[]): Promise<void> {
    // Store in database for full-text search
    console.log(`[DB] Storing search index for episode ${episodeId}`);
  }
}

export const aiTranscriptionService = new AITranscriptionService();
