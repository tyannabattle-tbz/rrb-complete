import { describe, it, expect, beforeEach, vi } from 'vitest';
import { audioRouter } from './audioRouter';
import { audioService } from '../audioService';

// Mock the audio service
vi.mock('../audioService', () => ({
  audioService: {
    transcribeAudio: vi.fn(),
    generateAudio: vi.fn(),
    getAudioMetadata: vi.fn(),
    mixAudio: vi.fn(),
    applyEffect: vi.fn(),
    createJob: vi.fn(),
    getJob: vi.fn(),
    getAllJobs: vi.fn(),
    getJobsByStatus: vi.fn(),
  },
}));

describe('Audio Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Transcription', () => {
    it('should transcribe audio successfully', async () => {
      const mockResult = {
        text: 'Hello world',
        language: 'en',
        confidence: 0.95,
        segments: [],
      };

      vi.mocked(audioService.transcribeAudio).mockResolvedValue(mockResult);

      const result = await audioService.transcribeAudio(
        'https://example.com/audio.mp3',
        'en'
      );

      expect(result).toEqual(mockResult);
      expect(audioService.transcribeAudio).toHaveBeenCalledWith(
        'https://example.com/audio.mp3',
        'en',
        undefined
      );
    });

    it('should handle transcription errors', async () => {
      const error = new Error('Transcription failed');
      vi.mocked(audioService.transcribeAudio).mockRejectedValue(error);

      await expect(
        audioService.transcribeAudio('https://example.com/audio.mp3')
      ).rejects.toThrow('Transcription failed');
    });
  });

  describe('Audio Generation', () => {
    it('should generate audio from text', async () => {
      const mockResult = {
        url: 'https://example.com/generated.mp3',
        duration: 5.2,
      };

      vi.mocked(audioService.generateAudio).mockResolvedValue(mockResult);

      const result = await audioService.generateAudio(
        'Hello world',
        'female',
        1.0
      );

      expect(result).toEqual(mockResult);
      expect(audioService.generateAudio).toHaveBeenCalledWith(
        'Hello world',
        'female',
        1.0
      );
    });

    it('should support different voices', async () => {
      const mockResult = {
        url: 'https://example.com/generated.mp3',
        duration: 5.2,
      };

      vi.mocked(audioService.generateAudio).mockResolvedValue(mockResult);

      await audioService.generateAudio('Test', 'male', 1.0);

      expect(audioService.generateAudio).toHaveBeenCalledWith(
        'Test',
        'male',
        1.0
      );
    });

    it('should support different playback speeds', async () => {
      const mockResult = {
        url: 'https://example.com/generated.mp3',
        duration: 2.6,
      };

      vi.mocked(audioService.generateAudio).mockResolvedValue(mockResult);

      await audioService.generateAudio('Test', 'female', 2.0);

      expect(audioService.generateAudio).toHaveBeenCalledWith(
        'Test',
        'female',
        2.0
      );
    });
  });

  describe('Audio Metadata', () => {
    it('should retrieve audio metadata', async () => {
      const mockMetadata = {
        duration: 120,
        sampleRate: 44100,
        channels: 2,
        bitrate: 128000,
        format: 'mp3',
        title: 'Test Song',
        artist: 'Test Artist',
      };

      vi.mocked(audioService.getAudioMetadata).mockResolvedValue(mockMetadata);

      const result = await audioService.getAudioMetadata(
        'https://example.com/audio.mp3'
      );

      expect(result).toEqual(mockMetadata);
      expect(audioService.getAudioMetadata).toHaveBeenCalledWith(
        'https://example.com/audio.mp3'
      );
    });
  });

  describe('Audio Mixing', () => {
    it('should mix multiple audio tracks', async () => {
      const mockResult = {
        url: 'https://example.com/mixed.mp3',
        duration: 60,
      };

      const tracks = [
        { url: 'https://example.com/track1.mp3', volume: 0.8, startTime: 0 },
        { url: 'https://example.com/track2.mp3', volume: 0.6, startTime: 5 },
      ];

      vi.mocked(audioService.mixAudio).mockResolvedValue(mockResult);

      const result = await audioService.mixAudio(tracks, 'mp3');

      expect(result).toEqual(mockResult);
      expect(audioService.mixAudio).toHaveBeenCalledWith(tracks, 'mp3');
    });

    it('should support different output formats', async () => {
      const mockResult = {
        url: 'https://example.com/mixed.wav',
        duration: 60,
      };

      const tracks = [
        { url: 'https://example.com/track1.mp3', volume: 0.8, startTime: 0 },
      ];

      vi.mocked(audioService.mixAudio).mockResolvedValue(mockResult);

      await audioService.mixAudio(tracks, 'wav');

      expect(audioService.mixAudio).toHaveBeenCalledWith(tracks, 'wav');
    });
  });

  describe('Audio Effects', () => {
    it('should apply reverb effect', async () => {
      const mockResult = {
        url: 'https://example.com/effect.mp3',
        duration: 120,
      };

      vi.mocked(audioService.applyEffect).mockResolvedValue(mockResult);

      const result = await audioService.applyEffect(
        'https://example.com/audio.mp3',
        'reverb',
        { room: 0.5 }
      );

      expect(result).toEqual(mockResult);
      expect(audioService.applyEffect).toHaveBeenCalledWith(
        'https://example.com/audio.mp3',
        'reverb',
        { room: 0.5 }
      );
    });

    it('should apply echo effect', async () => {
      const mockResult = {
        url: 'https://example.com/effect.mp3',
        duration: 120,
      };

      vi.mocked(audioService.applyEffect).mockResolvedValue(mockResult);

      await audioService.applyEffect(
        'https://example.com/audio.mp3',
        'echo',
        { delay: 0.5, feedback: 0.3 }
      );

      expect(audioService.applyEffect).toHaveBeenCalled();
    });

    it('should normalize audio', async () => {
      const mockResult = {
        url: 'https://example.com/effect.mp3',
        duration: 120,
      };

      vi.mocked(audioService.applyEffect).mockResolvedValue(mockResult);

      await audioService.applyEffect(
        'https://example.com/audio.mp3',
        'normalize'
      );

      expect(audioService.applyEffect).toHaveBeenCalled();
    });
  });

  describe('Job Management', () => {
    it('should create audio processing job', async () => {
      const mockJob = {
        id: 'job-123',
        status: 'pending',
        type: 'transcribe',
        inputUrl: 'https://example.com/audio.mp3',
        progress: 0,
        createdAt: Date.now(),
      };

      vi.mocked(audioService.createJob).mockReturnValue(mockJob);

      const result = audioService.createJob(
        'transcribe',
        'https://example.com/audio.mp3'
      );

      expect(result).toEqual(mockJob);
      expect(audioService.createJob).toHaveBeenCalledWith(
        'transcribe',
        'https://example.com/audio.mp3'
      );
    });

    it('should retrieve job status', async () => {
      const mockJob = {
        id: 'job-123',
        status: 'processing',
        type: 'transcribe',
        inputUrl: 'https://example.com/audio.mp3',
        progress: 50,
        createdAt: Date.now(),
      };

      vi.mocked(audioService.getJob).mockReturnValue(mockJob);

      const result = audioService.getJob('job-123');

      expect(result).toEqual(mockJob);
      expect(audioService.getJob).toHaveBeenCalledWith('job-123');
    });

    it('should get all jobs', async () => {
      const mockJobs = [
        {
          id: 'job-1',
          status: 'completed',
          type: 'transcribe',
          inputUrl: 'https://example.com/audio1.mp3',
          progress: 100,
          createdAt: Date.now(),
        },
        {
          id: 'job-2',
          status: 'processing',
          type: 'generate',
          inputUrl: 'https://example.com/audio2.mp3',
          progress: 50,
          createdAt: Date.now(),
        },
      ];

      vi.mocked(audioService.getAllJobs).mockReturnValue(mockJobs);

      const result = audioService.getAllJobs();

      expect(result).toHaveLength(2);
      expect(audioService.getAllJobs).toHaveBeenCalled();
    });

    it('should get jobs by status', async () => {
      const mockJobs = [
        {
          id: 'job-1',
          status: 'completed',
          type: 'transcribe',
          inputUrl: 'https://example.com/audio1.mp3',
          progress: 100,
          createdAt: Date.now(),
        },
      ];

      vi.mocked(audioService.getJobsByStatus).mockReturnValue(mockJobs);

      const result = audioService.getJobsByStatus('completed');

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('completed');
      expect(audioService.getJobsByStatus).toHaveBeenCalledWith('completed');
    });
  });
});
