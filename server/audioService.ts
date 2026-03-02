import { invokeLLM } from "./server/_core/llm";
import { storagePut, storageGet } from "./storage";

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  bitDepth: number;
  codec: 'mp3' | 'wav' | 'aac' | 'flac';
  quality: 'low' | 'medium' | 'high' | 'lossless';
}

export interface AudioMetadata {
  duration: number;
  sampleRate: number;
  channels: number;
  bitrate: number;
  format: string;
  title?: string;
  artist?: string;
  album?: string;
}

export interface TranscriptionResult {
  text: string;
  language: string;
  confidence: number;
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
}

export interface AudioProcessingJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  type: 'transcribe' | 'generate' | 'mix' | 'effect' | 'export';
  inputUrl: string;
  outputUrl?: string;
  metadata?: AudioMetadata;
  error?: string;
  progress: number;
  createdAt: number;
  completedAt?: number;
}

class AudioService {
  private jobs: Map<string, AudioProcessingJob> = new Map();

  /**
   * Transcribe audio to text using Whisper API
   */
  async transcribeAudio(
    audioUrl: string,
    language?: string,
    prompt?: string
  ): Promise<TranscriptionResult> {
    try {
      const response = await fetch(
        `${process.env.BUILT_IN_FORGE_API_URL}/audio/transcribe`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audioUrl,
            language,
            prompt,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Audio transcription error:', error);
      throw error;
    }
  }

  /**
   * Generate audio from text using text-to-speech
   */
  async generateAudio(
    text: string,
    voice: 'male' | 'female' = 'female',
    speed: number = 1.0
  ): Promise<{ url: string; duration: number }> {
    try {
      const response = await fetch(
        `${process.env.BUILT_IN_FORGE_API_URL}/audio/generate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            voice,
            speed,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Audio generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Audio generation error:', error);
      throw error;
    }
  }

  /**
   * Upload audio file to S3
   */
  async uploadAudio(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string = 'audio/mpeg'
  ): Promise<{ url: string; key: string }> {
    try {
      const fileKey = `audio/${Date.now()}-${filename}`;
      const result = await storagePut(fileKey, fileBuffer, mimeType);
      return result;
    } catch (error) {
      console.error('Audio upload error:', error);
      throw error;
    }
  }

  /**
   * Get audio metadata
   */
  async getAudioMetadata(audioUrl: string): Promise<AudioMetadata> {
    try {
      const response = await fetch(
        `${process.env.BUILT_IN_FORGE_API_URL}/audio/metadata`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ audioUrl }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get metadata: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Metadata retrieval error:', error);
      throw error;
    }
  }

  /**
   * Mix multiple audio tracks
   */
  async mixAudio(
    tracks: Array<{ url: string; volume: number; startTime: number }>,
    outputFormat: 'mp3' | 'wav' = 'mp3'
  ): Promise<{ url: string; duration: number }> {
    try {
      const response = await fetch(
        `${process.env.BUILT_IN_FORGE_API_URL}/audio/mix`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tracks,
            outputFormat,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Audio mixing failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Audio mixing error:', error);
      throw error;
    }
  }

  /**
   * Apply audio effects
   */
  async applyEffect(
    audioUrl: string,
    effect: 'reverb' | 'echo' | 'normalize' | 'compress' | 'equalize',
    params: Record<string, any> = {}
  ): Promise<{ url: string; duration: number }> {
    try {
      const response = await fetch(
        `${process.env.BUILT_IN_FORGE_API_URL}/audio/effect`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audioUrl,
            effect,
            params,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Effect application failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Audio effect error:', error);
      throw error;
    }
  }

  /**
   * Create audio processing job
   */
  createJob(
    type: AudioProcessingJob['type'],
    inputUrl: string
  ): AudioProcessingJob {
    const job: AudioProcessingJob = {
      id: `job-${Date.now()}`,
      status: 'pending',
      type,
      inputUrl,
      progress: 0,
      createdAt: Date.now(),
    };

    this.jobs.set(job.id, job);
    return job;
  }

  /**
   * Get job status
   */
  getJob(jobId: string): AudioProcessingJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Update job status
   */
  updateJob(
    jobId: string,
    updates: Partial<AudioProcessingJob>
  ): AudioProcessingJob | undefined {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;

    const updated = { ...job, ...updates };
    this.jobs.set(jobId, updated);
    return updated;
  }

  /**
   * Get all jobs
   */
  getAllJobs(): AudioProcessingJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get jobs by status
   */
  getJobsByStatus(status: AudioProcessingJob['status']): AudioProcessingJob[] {
    return Array.from(this.jobs.values()).filter(j => j.status === status);
  }
}

export const audioService = new AudioService();
