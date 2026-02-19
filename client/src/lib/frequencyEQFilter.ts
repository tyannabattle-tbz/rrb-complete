/**
 * Frequency-based EQ Filter Service
 * Applies Solfeggio frequency-based audio adjustments with healing properties
 */

export interface FrequencyConfig {
  frequency: number;
  name: string;
  healingProperty: string;
  eqPreset: {
    bass: number;
    lowMid: number;
    mid: number;
    highMid: number;
    treble: number;
  };
}

export const SOLFEGGIO_FREQUENCIES: Record<number, FrequencyConfig> = {
  174: {
    frequency: 174,
    name: '174 Hz',
    healingProperty: 'Pain Relief & Protection',
    eqPreset: { bass: 2, lowMid: 1, mid: 0, highMid: -1, treble: -2 },
  },
  285: {
    frequency: 285,
    name: '285 Hz',
    healingProperty: 'Tissue Repair & Healing',
    eqPreset: { bass: 1, lowMid: 2, mid: 1, highMid: 0, treble: -1 },
  },
  396: {
    frequency: 396,
    name: '396 Hz',
    healingProperty: 'Liberation from Fear & Guilt',
    eqPreset: { bass: 0, lowMid: 1, mid: 2, highMid: 1, treble: 0 },
  },
  417: {
    frequency: 417,
    name: '417 Hz',
    healingProperty: 'Facilitating Change & Transformation',
    eqPreset: { bass: -1, lowMid: 0, mid: 2, highMid: 2, treble: 1 },
  },
  528: {
    frequency: 528,
    name: '528 Hz',
    healingProperty: 'Love & DNA Repair (Miracle Tone)',
    eqPreset: { bass: 0, lowMid: 1, mid: 3, highMid: 2, treble: 1 },
  },
  639: {
    frequency: 639,
    name: '639 Hz',
    healingProperty: 'Harmony & Relationships',
    eqPreset: { bass: -1, lowMid: 0, mid: 2, highMid: 3, treble: 2 },
  },
  741: {
    frequency: 741,
    name: '741 Hz',
    healingProperty: 'Awakening Intuition & Expression',
    eqPreset: { bass: -2, lowMid: -1, mid: 1, highMid: 3, treble: 3 },
  },
  852: {
    frequency: 852,
    name: '852 Hz',
    healingProperty: 'Return to Spiritual Order',
    eqPreset: { bass: -3, lowMid: -2, mid: 0, highMid: 2, treble: 4 },
  },
  432: {
    frequency: 432,
    name: '432 Hz',
    healingProperty: 'Natural Tuning & Harmony',
    eqPreset: { bass: 1, lowMid: 2, mid: 2, highMid: 1, treble: 0 },
  },
  440: {
    frequency: 440,
    name: '440 Hz',
    healingProperty: 'Standard Tuning (Reference)',
    eqPreset: { bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0 },
  },
};

export class FrequencyEQFilter {
  private audioContext: AudioContext | null = null;
  private source: AudioBufferSourceNode | MediaElementAudioSourceNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private lowMidFilter: BiquadFilterNode | null = null;
  private midFilter: BiquadFilterNode | null = null;
  private highMidFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private currentFrequency: number = 440;
  private isInitialized: boolean = false;

  constructor(private audioElement: HTMLAudioElement) {
    this.initialize().catch(err => console.error('Failed to initialize FrequencyEQFilter:', err));
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.audioContext) {
      // Resume existing context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      return;
    }

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Set crossOrigin before creating source
      if (this.audioElement.crossOrigin !== 'anonymous') {
        this.audioElement.crossOrigin = 'anonymous';
      }
      
      this.source = this.audioContext.createMediaElementAudioSource(this.audioElement);

    this.bassFilter = this.audioContext.createBiquadFilter();
    this.bassFilter.type = 'lowshelf';
    this.bassFilter.frequency.value = 100;

    this.lowMidFilter = this.audioContext.createBiquadFilter();
    this.lowMidFilter.type = 'peaking';
    this.lowMidFilter.frequency.value = 300;
    this.lowMidFilter.Q.value = 1;

    this.midFilter = this.audioContext.createBiquadFilter();
    this.midFilter.type = 'peaking';
    this.midFilter.frequency.value = 1000;
    this.midFilter.Q.value = 1;

    this.highMidFilter = this.audioContext.createBiquadFilter();
    this.highMidFilter.type = 'peaking';
    this.highMidFilter.frequency.value = 3000;
    this.highMidFilter.Q.value = 1;

    this.trebleFilter = this.audioContext.createBiquadFilter();
    this.trebleFilter.type = 'highshelf';
    this.trebleFilter.frequency.value = 10000;

    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 1;

      this.source.connect(this.bassFilter);
      this.bassFilter.connect(this.lowMidFilter);
      this.lowMidFilter.connect(this.midFilter);
      this.midFilter.connect(this.highMidFilter);
      this.highMidFilter.connect(this.trebleFilter);
      this.trebleFilter.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing FrequencyEQFilter:', error);
      this.isInitialized = false;
    }
  }

  async applyFrequency(frequency: number): Promise<void> {
    await this.initialize();

    const config = SOLFEGGIO_FREQUENCIES[frequency];
    if (!config) {
      console.warn(`Frequency ${frequency} not found in presets`);
      return;
    }

    this.currentFrequency = frequency;

    if (!this.audioContext) {
      console.warn('AudioContext not initialized');
      return;
    }
    
    // Resume context if suspended
    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (err) {
        console.error('Failed to resume AudioContext:', err);
      }
    }

    const now = this.audioContext.currentTime;
    const smoothTime = 0.1; // 100ms smooth transition

    if (this.bassFilter) {
      this.bassFilter.gain.linearRampToValueAtTime(config.eqPreset.bass, now + smoothTime);
    }
    if (this.lowMidFilter) {
      this.lowMidFilter.gain.linearRampToValueAtTime(config.eqPreset.lowMid, now + smoothTime);
    }
    if (this.midFilter) {
      this.midFilter.gain.linearRampToValueAtTime(config.eqPreset.mid, now + smoothTime);
    }
    if (this.highMidFilter) {
      this.highMidFilter.gain.linearRampToValueAtTime(config.eqPreset.highMid, now + smoothTime);
    }
    if (this.trebleFilter) {
      this.trebleFilter.gain.linearRampToValueAtTime(config.eqPreset.treble, now + smoothTime);
    }

    console.log(`Applied frequency: ${frequency} Hz (${config.healingProperty})`);
  }

  async reset(): Promise<void> {
    await this.applyFrequency(440);
  }

  getCurrentFrequency(): number {
    return this.currentFrequency;
  }

  setFrequency(frequency: number): void {
    this.applyFrequency(frequency).catch(err => console.error('Error applying frequency:', err));
  }

  destroy(): void {
    try {
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close();
      }
    } catch (error) {
      console.error('Error closing AudioContext:', error);
    }
    this.audioContext = null;
    this.isInitialized = false;
  }
}

export function getFrequencyConfig(frequency: number): FrequencyConfig | null {
  return SOLFEGGIO_FREQUENCIES[frequency] || null;
}

export function getAllFrequencies(): FrequencyConfig[] {
  return Object.values(SOLFEGGIO_FREQUENCIES).sort((a, b) => a.frequency - b.frequency);
}
