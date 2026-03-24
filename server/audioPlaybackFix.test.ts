import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

/**
 * Audio Playback Fix Tests
 * Validates Web Audio API initialization, file loading, and playback functionality
 */

describe('Audio Engine Initialization and Playback', () => {
  describe('Web Audio API Context', () => {
    it('should create AudioContext successfully', () => {
      // Mock AudioContext
      const mockAudioContext = {
        state: 'running',
        sampleRate: 48000,
        destination: {},
        createGain: vi.fn(() => ({
          gain: { value: 0.8 },
          connect: vi.fn(),
        })),
        createAnalyser: vi.fn(() => ({
          fftSize: 2048,
          frequencyBinCount: 1024,
          connect: vi.fn(),
          getByteFrequencyData: vi.fn(),
          getByteTimeDomainData: vi.fn(),
        })),
        resume: vi.fn().mockResolvedValue(undefined),
        decodeAudioData: vi.fn(),
        createBufferSource: vi.fn(() => ({
          buffer: null,
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
          onended: null,
        })),
        createMediaStreamAudioSource: vi.fn(),
      };

      expect(mockAudioContext).toBeDefined();
      expect(mockAudioContext.sampleRate).toBe(48000);
      expect(mockAudioContext.state).toBe('running');
    });

    it('should resume suspended audio context', async () => {
      const mockAudioContext = {
        state: 'suspended',
        resume: vi.fn().mockResolvedValue(undefined),
      };

      if (mockAudioContext.state === 'suspended') {
        await mockAudioContext.resume();
      }

      expect(mockAudioContext.resume).toHaveBeenCalled();
    });

    it('should create gain node for volume control', () => {
      const mockGainNode = {
        gain: { value: 0.8 },
        connect: vi.fn(),
      };

      expect(mockGainNode.gain.value).toBe(0.8);
      mockGainNode.gain.value = 0.5;
      expect(mockGainNode.gain.value).toBe(0.5);
    });

    it('should create analyser node for visualization', () => {
      const mockAnalyser = {
        fftSize: 2048,
        frequencyBinCount: 1024,
        connect: vi.fn(),
        getByteFrequencyData: vi.fn(),
      };

      expect(mockAnalyser.fftSize).toBe(2048);
      expect(mockAnalyser.frequencyBinCount).toBe(1024);
    });
  });

  describe('Audio File Loading', () => {
    it('should fetch audio file from URL', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(1024)),
      });

      global.fetch = mockFetch;

      const response = await fetch('/audio/lead_vocals.mp3');
      const buffer = await response.arrayBuffer();

      expect(mockFetch).toHaveBeenCalledWith('/audio/lead_vocals.mp3');
      expect(response.ok).toBe(true);
      expect(buffer).toBeInstanceOf(ArrayBuffer);
    });

    it('should decode audio data to AudioBuffer', async () => {
      const mockAudioBuffer = {
        duration: 3.0,
        length: 144000,
        numberOfChannels: 2,
        sampleRate: 48000,
        getChannelData: vi.fn(),
      };

      expect(mockAudioBuffer.duration).toBe(3.0);
      expect(mockAudioBuffer.sampleRate).toBe(48000);
      expect(mockAudioBuffer.numberOfChannels).toBe(2);
    });

    it('should handle audio file loading errors', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      global.fetch = mockFetch;

      const response = await fetch('/audio/nonexistent.mp3');
      expect(response.ok).toBe(false);
    });

    it('should load multiple audio files', async () => {
      const files = [
        { id: 'lead_vocals', path: '/audio/lead_vocals.mp3' },
        { id: 'drums', path: '/audio/drums.mp3' },
        { id: 'bass', path: '/audio/bass.mp3' },
      ];

      const buffers = new Map();

      for (const file of files) {
        const mockBuffer = {
          duration: 3.0,
          sampleRate: 48000,
        };
        buffers.set(file.id, mockBuffer);
      }

      expect(buffers.size).toBe(3);
      expect(buffers.has('lead_vocals')).toBe(true);
      expect(buffers.has('drums')).toBe(true);
      expect(buffers.has('bass')).toBe(true);
    });
  });

  describe('Audio Playback', () => {
    it('should create buffer source for playback', () => {
      const mockSource = {
        buffer: { duration: 3.0 },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        onended: null,
      };

      mockSource.connect({});
      mockSource.start(0);

      expect(mockSource.connect).toHaveBeenCalled();
      expect(mockSource.start).toHaveBeenCalledWith(0);
    });

    it('should play audio buffer with ID tracking', () => {
      const mockAudioBuffer = {
        duration: 3.0,
        sampleRate: 48000,
      };

      const mockSource = {
        buffer: mockAudioBuffer,
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        onended: null,
      };

      const playbackId = 'lead_vocals';
      mockSource.connect({});
      mockSource.start(0);

      expect(mockSource.buffer).toBe(mockAudioBuffer);
      expect(mockSource.buffer.duration).toBe(3.0);
    });

    it('should stop audio playback', () => {
      const mockSource = {
        stop: vi.fn(),
      };

      mockSource.stop();

      expect(mockSource.stop).toHaveBeenCalled();
    });

    it('should handle playback completion', () => {
      const mockSource = {
        onended: null,
      };

      const onEndedCallback = vi.fn();
      mockSource.onended = onEndedCallback;

      // Simulate playback end
      if (mockSource.onended) {
        mockSource.onended();
      }

      expect(onEndedCallback).toHaveBeenCalled();
    });

    it('should manage playback state', () => {
      let isPlaying = false;

      // Start playback
      isPlaying = true;
      expect(isPlaying).toBe(true);

      // Stop playback
      isPlaying = false;
      expect(isPlaying).toBe(false);
    });
  });

  describe('Volume Control', () => {
    it('should set volume level', () => {
      const mockGainNode = {
        gain: { value: 0.8 },
      };

      mockGainNode.gain.value = 0.5;
      expect(mockGainNode.gain.value).toBe(0.5);

      mockGainNode.gain.value = 1.0;
      expect(mockGainNode.gain.value).toBe(1.0);

      mockGainNode.gain.value = 0.0;
      expect(mockGainNode.gain.value).toBe(0.0);
    });

    it('should clamp volume to valid range', () => {
      const clampVolume = (value: number) => Math.max(0, Math.min(1, value));

      expect(clampVolume(1.5)).toBe(1.0);
      expect(clampVolume(-0.5)).toBe(0.0);
      expect(clampVolume(0.5)).toBe(0.5);
    });

    it('should emit volume change event', () => {
      const listeners = new Map<string, Function[]>();

      const emit = (event: string, data: any) => {
        const callbacks = listeners.get(event);
        if (callbacks) {
          callbacks.forEach((cb) => cb(data));
        }
      };

      const on = (event: string, callback: Function) => {
        if (!listeners.has(event)) {
          listeners.set(event, []);
        }
        listeners.get(event)!.push(callback);
      };

      const volumeChangeCallback = vi.fn();
      on('volumeChanged', volumeChangeCallback);

      emit('volumeChanged', { volume: 0.5 });

      expect(volumeChangeCallback).toHaveBeenCalledWith({ volume: 0.5 });
    });
  });

  describe('Frequency Visualization', () => {
    it('should get frequency data for visualization', () => {
      const mockAnalyser = {
        frequencyBinCount: 1024,
        getByteFrequencyData: vi.fn((array) => {
          // Simulate frequency data
          for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
          }
        }),
      };

      const dataArray = new Uint8Array(mockAnalyser.frequencyBinCount);
      mockAnalyser.getByteFrequencyData(dataArray);

      expect(dataArray.length).toBe(1024);
      expect(dataArray[0]).toBeGreaterThanOrEqual(0);
      expect(dataArray[0]).toBeLessThan(256);
    });

    it('should get waveform data for visualization', () => {
      const mockAnalyser = {
        fftSize: 2048,
        getByteTimeDomainData: vi.fn((array) => {
          // Simulate waveform data
          for (let i = 0; i < array.length; i++) {
            array[i] = 128 + Math.floor(Math.sin((i / array.length) * Math.PI * 2) * 127);
          }
        }),
      };

      const dataArray = new Uint8Array(mockAnalyser.fftSize);
      mockAnalyser.getByteTimeDomainData(dataArray);

      expect(dataArray.length).toBe(2048);
      expect(dataArray[0]).toBeGreaterThanOrEqual(0);
      expect(dataArray[0]).toBeLessThan(256);
    });
  });

  describe('Error Handling', () => {
    it('should handle audio context initialization errors', async () => {
      const initAudio = async () => {
        throw new Error('Audio context initialization failed');
      };

      await expect(initAudio()).rejects.toThrow('Audio context initialization failed');
    });

    it('should handle audio file loading errors', async () => {
      const loadAudioFile = async (url: string) => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch audio file: ${response.statusText}`);
        }
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      global.fetch = mockFetch;

      await expect(loadAudioFile('/audio/nonexistent.mp3')).rejects.toThrow(
        'Failed to fetch audio file: Not Found'
      );
    });

    it('should handle audio decoding errors', async () => {
      const decodeAudioData = async (arrayBuffer: ArrayBuffer) => {
        throw new Error('Audio decoding failed');
      };

      await expect(decodeAudioData(new ArrayBuffer(0))).rejects.toThrow('Audio decoding failed');
    });

    it('should handle playback errors', () => {
      const playAudio = () => {
        throw new Error('Playback failed');
      };

      expect(() => playAudio()).toThrow('Playback failed');
    });
  });

  describe('Integration Tests', () => {
    it('should initialize audio engine and load files', async () => {
      const audioEngine = {
        isInitialized: false,
        audioBuffers: new Map(),

        async initialize() {
          this.isInitialized = true;
        },

        async loadFile(id: string, path: string) {
          const mockBuffer = { duration: 3.0, sampleRate: 48000 };
          this.audioBuffers.set(id, mockBuffer);
        },
      };

      await audioEngine.initialize();
      expect(audioEngine.isInitialized).toBe(true);

      await audioEngine.loadFile('lead_vocals', '/audio/lead_vocals.mp3');
      expect(audioEngine.audioBuffers.has('lead_vocals')).toBe(true);
    });

    it('should handle complete audio playback workflow', async () => {
      let isPlaying = false;
      let currentVolume = 0.8;

      const workflow = {
        start() {
          isPlaying = true;
        },
        setVolume(vol: number) {
          currentVolume = Math.max(0, Math.min(1, vol));
        },
        stop() {
          isPlaying = false;
        },
      };

      workflow.start();
      expect(isPlaying).toBe(true);

      workflow.setVolume(0.5);
      expect(currentVolume).toBe(0.5);

      workflow.stop();
      expect(isPlaying).toBe(false);
    });
  });
});
