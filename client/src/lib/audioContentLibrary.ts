/**
 * Audio Content Library - Manages all audio content for Studio Suite
 * Supports real files, synthesis, and streaming from multiple sources
 */

export interface AudioTrack {
  id: string;
  name: string;
  type: 'audio' | 'midi' | 'video';
  source: 'file' | 'synthesis' | 'stream' | 'microphone';
  url?: string;
  frequency?: number;
  duration: number;
  buffer?: AudioBuffer;
}

export interface ContentLibrary {
  tracks: AudioTrack[];
  presets: MixingPreset[];
  recordings: RecordedSession[];
}

export interface MixingPreset {
  id: string;
  name: string;
  description: string;
  eq: EQSettings;
  compression: CompressionSettings;
  reverb: ReverbSettings;
}

export interface EQSettings {
  lowGain: number;
  midGain: number;
  highGain: number;
  lowFreq: number;
  midFreq: number;
  highFreq: number;
}

export interface CompressionSettings {
  threshold: number;
  ratio: number;
  attack: number;
  release: number;
  makeup: number;
}

export interface ReverbSettings {
  wet: number;
  dry: number;
  decay: number;
  preDelay: number;
}

export interface RecordedSession {
  id: string;
  timestamp: number;
  duration: number;
  trackId: string;
  url: string;
  metadata: Record<string, any>;
}

// Default RRB Content Library
export const RRB_CONTENT_LIBRARY: ContentLibrary = {
  tracks: [
    {
      id: 'lead-vocals',
      name: 'Lead Vocals',
      type: 'audio',
      source: 'file',
      url: '/audio/lead-vocals.mp3',
      duration: 240,
    },
    {
      id: 'background-vox',
      name: 'Background Vox',
      type: 'audio',
      source: 'file',
      url: '/audio/background-vocals.mp3',
      duration: 240,
    },
    {
      id: 'drums',
      name: 'Drums',
      type: 'audio',
      source: 'file',
      url: '/audio/drums.mp3',
      duration: 240,
    },
    {
      id: 'bass',
      name: 'Bass',
      type: 'audio',
      source: 'file',
      url: '/audio/bass.mp3',
      duration: 240,
    },
    {
      id: 'keys-synth',
      name: 'Keys / Synth',
      type: 'midi',
      source: 'synthesis',
      frequency: 440,
      duration: 240,
    },
    {
      id: 'guitar',
      name: 'Guitar',
      type: 'audio',
      source: 'file',
      url: '/audio/guitar.mp3',
      duration: 240,
    },
    {
      id: 'video',
      name: 'Video',
      type: 'video',
      source: 'file',
      url: '/video/main-performance.mp4',
      duration: 240,
    },
  ],
  presets: [
    {
      id: 'balanced',
      name: 'Balanced',
      description: 'Neutral, flat frequency response',
      eq: {
        lowGain: 0,
        midGain: 0,
        highGain: 0,
        lowFreq: 100,
        midFreq: 1000,
        highFreq: 10000,
      },
      compression: {
        threshold: -20,
        ratio: 4,
        attack: 10,
        release: 100,
        makeup: 0,
      },
      reverb: {
        wet: 0.2,
        dry: 0.8,
        decay: 1.5,
        preDelay: 20,
      },
    },
    {
      id: 'vocal-focus',
      name: 'Vocal Focus',
      description: 'Enhanced vocals with presence peak',
      eq: {
        lowGain: -3,
        midGain: 6,
        highGain: 3,
        lowFreq: 100,
        midFreq: 2000,
        highFreq: 8000,
      },
      compression: {
        threshold: -18,
        ratio: 6,
        attack: 5,
        release: 80,
        makeup: 3,
      },
      reverb: {
        wet: 0.15,
        dry: 0.85,
        decay: 1.2,
        preDelay: 15,
      },
    },
    {
      id: 'bass-heavy',
      name: 'Bass Heavy',
      description: 'Powerful low-end emphasis',
      eq: {
        lowGain: 8,
        midGain: -2,
        highGain: 2,
        lowFreq: 80,
        midFreq: 1000,
        highFreq: 10000,
      },
      compression: {
        threshold: -22,
        ratio: 3,
        attack: 15,
        release: 120,
        makeup: 2,
      },
      reverb: {
        wet: 0.25,
        dry: 0.75,
        decay: 2,
        preDelay: 25,
      },
    },
    {
      id: 'bright',
      name: 'Bright',
      description: 'Crisp, clear, enhanced highs',
      eq: {
        lowGain: -2,
        midGain: 2,
        highGain: 6,
        lowFreq: 100,
        midFreq: 1000,
        highFreq: 12000,
      },
      compression: {
        threshold: -16,
        ratio: 5,
        attack: 8,
        release: 90,
        makeup: 2,
      },
      reverb: {
        wet: 0.1,
        dry: 0.9,
        decay: 1,
        preDelay: 10,
      },
    },
  ],
  recordings: [],
};

// Streaming sources
export const STREAMING_SOURCES = {
  somafm: {
    'soul-rb': 'https://ice5.somafm.com/7soul-128-mp3',
    'indie-pop': 'https://ice1.somafm.com/indiepop-128-mp3',
    'groove-salad': 'https://ice1.somafm.com/groovesalad-128-mp3',
    'jazz': 'https://ice1.somafm.com/jazz-128-mp3',
  },
  broadcast: {
    'rrb-main': 'https://broadcast.example.com/rrb-main',
    'rrb-backup': 'https://broadcast.example.com/rrb-backup',
  },
};

// Audio synthesis templates for MIDI tracks
export const SYNTHESIS_TEMPLATES = {
  pad: {
    waveform: 'sine',
    frequency: 220,
    attack: 0.5,
    decay: 0.3,
    sustain: 0.8,
    release: 1,
  },
  bass: {
    waveform: 'square',
    frequency: 55,
    attack: 0.05,
    decay: 0.2,
    sustain: 0.9,
    release: 0.5,
  },
  lead: {
    waveform: 'sawtooth',
    frequency: 440,
    attack: 0.1,
    decay: 0.15,
    sustain: 0.85,
    release: 0.3,
  },
};

export class AudioContentLibraryManager {
  private library: ContentLibrary;
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.library = JSON.parse(JSON.stringify(RRB_CONTENT_LIBRARY));
  }

  /**
   * Load audio file from URL and decode to AudioBuffer
   */
  async loadAudioFile(url: string): Promise<AudioBuffer> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error(`Failed to load audio from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Get track by ID
   */
  getTrack(trackId: string): AudioTrack | undefined {
    return this.library.tracks.find(t => t.id === trackId);
  }

  /**
   * Get mixing preset by ID
   */
  getPreset(presetId: string): MixingPreset | undefined {
    return this.library.presets.find(p => p.id === presetId);
  }

  /**
   * List all available presets
   */
  listPresets(): MixingPreset[] {
    return this.library.presets;
  }

  /**
   * Add recording to library
   */
  addRecording(session: RecordedSession): void {
    this.library.recordings.push(session);
  }

  /**
   * Get all recordings
   */
  getRecordings(): RecordedSession[] {
    return this.library.recordings;
  }

  /**
   * Export library as JSON
   */
  exportLibrary(): string {
    return JSON.stringify(this.library, null, 2);
  }

  /**
   * Import library from JSON
   */
  importLibrary(json: string): void {
    try {
      this.library = JSON.parse(json);
    } catch (error) {
      console.error('Failed to import library:', error);
      throw error;
    }
  }
}

export const createAudioContentLibraryManager = (audioContext: AudioContext) => {
  return new AudioContentLibraryManager(audioContext);
};
