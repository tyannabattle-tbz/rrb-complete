/**
 * Mixing Automation Engine
 * Preset profiles, audio analysis, and automatic mixing adjustments
 */

export interface EQSettings {
  lowFreq: number;
  lowGain: number;
  midFreq: number;
  midGain: number;
  highFreq: number;
  highGain: number;
}

export interface CompressorSettings {
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
}

export interface MixingPreset {
  id: string;
  name: string;
  description: string;
  eq: EQSettings;
  compressor: CompressorSettings;
  reverb: ReverbSettings;
  normalization: {
    targetLUFS: number;
    enabled: boolean;
  };
}

export interface AudioAnalysis {
  frequencyProfile: number[];
  peakFrequency: number;
  dynamicRange: number;
  averageLevel: number;
  peakLevel: number;
  spectralCentroid: number;
}

export const MIXING_PRESETS: Record<string, MixingPreset> = {
  balanced: {
    id: 'balanced',
    name: 'Balanced',
    description: 'Neutral mixing with flat response',
    eq: {
      lowFreq: 100,
      lowGain: 0,
      midFreq: 1000,
      midGain: 0,
      highFreq: 10000,
      highGain: 0,
    },
    compressor: {
      threshold: -20,
      ratio: 4,
      attack: 0.005,
      release: 0.1,
      makeup: 0,
    },
    reverb: {
      wet: 0.1,
      dry: 0.9,
      decay: 1.5,
    },
    normalization: {
      targetLUFS: -14,
      enabled: true,
    },
  },
  vocalFocus: {
    id: 'vocal_focus',
    name: 'Vocal Focus',
    description: 'Enhanced vocals with presence peak',
    eq: {
      lowFreq: 80,
      lowGain: -3,
      midFreq: 2000,
      midGain: 4,
      highFreq: 12000,
      highGain: 2,
    },
    compressor: {
      threshold: -18,
      ratio: 6,
      attack: 0.003,
      release: 0.08,
      makeup: 3,
    },
    reverb: {
      wet: 0.15,
      dry: 0.85,
      decay: 1.2,
    },
    normalization: {
      targetLUFS: -14,
      enabled: true,
    },
  },
  bassHeavy: {
    id: 'bass_heavy',
    name: 'Bass Heavy',
    description: 'Enhanced low-end with powerful bass',
    eq: {
      lowFreq: 60,
      lowGain: 6,
      midFreq: 500,
      midGain: 2,
      highFreq: 10000,
      highGain: -2,
    },
    compressor: {
      threshold: -22,
      ratio: 3,
      attack: 0.01,
      release: 0.15,
      makeup: 2,
    },
    reverb: {
      wet: 0.2,
      dry: 0.8,
      decay: 2,
    },
    normalization: {
      targetLUFS: -12,
      enabled: true,
    },
  },
  bright: {
    id: 'bright',
    name: 'Bright',
    description: 'Crisp and clear with enhanced highs',
    eq: {
      lowFreq: 100,
      lowGain: -2,
      midFreq: 3000,
      midGain: 3,
      highFreq: 15000,
      highGain: 4,
    },
    compressor: {
      threshold: -16,
      ratio: 5,
      attack: 0.004,
      release: 0.09,
      makeup: 2,
    },
    reverb: {
      wet: 0.08,
      dry: 0.92,
      decay: 1,
    },
    normalization: {
      targetLUFS: -14,
      enabled: true,
    },
  },
};

export class MixingAutomation {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private compressor: DynamicsCompressorNode | null = null;
  private convolver: ConvolverNode | null = null;
  private gainNode: GainNode | null = null;
  private currentPreset: MixingPreset | null = null;
  private listeners: Map<string, Function[]> = new Map();

  constructor(audioContext: AudioContext, gainNode: GainNode) {
    this.audioContext = audioContext;
    this.gainNode = gainNode;
    this.initializeNodes();
  }

  private initializeNodes(): void {
    if (!this.audioContext || !this.gainNode) return;

    // Create analyser
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;

    // Create compressor
    this.compressor = this.audioContext.createDynamicsCompressor();

    // Create convolver for reverb
    this.convolver = this.audioContext.createConvolver();

    // Create EQ filters (3-band)
    for (let i = 0; i < 3; i++) {
      const filter = this.audioContext.createBiquadFilter();
      this.eqFilters.push(filter);
    }

    // Set filter types
    this.eqFilters[0].type = 'lowshelf'; // Low frequencies
    this.eqFilters[1].type = 'peaking'; // Mid frequencies
    this.eqFilters[2].type = 'highshelf'; // High frequencies

    // Connect chain: gainNode -> compressor -> eq -> convolver -> analyser -> destination
    this.gainNode.connect(this.compressor);
    this.compressor.connect(this.eqFilters[0]);

    for (let i = 0; i < this.eqFilters.length - 1; i++) {
      this.eqFilters[i].connect(this.eqFilters[i + 1]);
    }

    this.eqFilters[this.eqFilters.length - 1].connect(this.convolver!);
    this.convolver!.connect(this.analyser!);
    this.analyser!.connect(this.audioContext.destination);
  }

  /**
   * Apply mixing preset
   */
  applyPreset(presetId: string): void {
    const preset = MIXING_PRESETS[presetId];
    if (!preset) {
      console.error('[MixingAutomation] Preset not found:', presetId);
      return;
    }

    this.currentPreset = preset;

    // Apply EQ
    this.applyEQ(preset.eq);

    // Apply compressor
    this.applyCompressor(preset.compressor);

    // Apply reverb
    this.applyReverb(preset.reverb);

    this.emit('presetApplied', { presetId, preset });
  }

  /**
   * Apply EQ settings
   */
  private applyEQ(eq: EQSettings): void {
    if (this.eqFilters.length < 3) return;

    // Low shelf
    this.eqFilters[0].frequency.value = eq.lowFreq;
    this.eqFilters[0].gain.value = eq.lowGain;

    // Mid peaking
    this.eqFilters[1].frequency.value = eq.midFreq;
    this.eqFilters[1].gain.value = eq.midGain;
    this.eqFilters[1].Q.value = 1;

    // High shelf
    this.eqFilters[2].frequency.value = eq.highFreq;
    this.eqFilters[2].gain.value = eq.highGain;
  }

  /**
   * Apply compressor settings
   */
  private applyCompressor(settings: CompressorSettings): void {
    if (!this.compressor) return;

    this.compressor.threshold.value = settings.threshold;
    this.compressor.ratio.value = settings.ratio;
    this.compressor.attack.value = settings.attack;
    this.compressor.release.value = settings.release;
    this.compressor.knee.value = 30;
  }

  /**
   * Apply reverb settings
   */
  private applyReverb(settings: ReverbSettings): void {
    if (!this.convolver) return;

    // Simplified reverb using convolver gain
    // In production, would use impulse response files
    const dryGain = this.gainNode!.gain.value * settings.dry;
    const wetGain = this.gainNode!.gain.value * settings.wet;

    // This is simplified - in production would use separate dry/wet paths
    this.convolver.connect(this.analyser!);
  }

  /**
   * Analyze audio for automatic preset recommendation
   */
  analyzeAudio(): AudioAnalysis {
    if (!this.analyser) {
      return {
        frequencyProfile: [],
        peakFrequency: 0,
        dynamicRange: 0,
        averageLevel: 0,
        peakLevel: 0,
        spectralCentroid: 0,
      };
    }

    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(frequencyData);

    const waveformData = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(waveformData);

    // Calculate metrics
    let peakFrequency = 0;
    let peakLevel = 0;
    let sum = 0;

    for (let i = 0; i < frequencyData.length; i++) {
      if (frequencyData[i] > peakLevel) {
        peakLevel = frequencyData[i];
        peakFrequency = (i / frequencyData.length) * (this.audioContext!.sampleRate / 2);
      }
      sum += frequencyData[i];
    }

    const averageLevel = sum / frequencyData.length;

    // Calculate dynamic range
    let min = 255;
    let max = 0;
    for (let i = 0; i < waveformData.length; i++) {
      min = Math.min(min, waveformData[i]);
      max = Math.max(max, waveformData[i]);
    }
    const dynamicRange = (max - min) / 255;

    // Calculate spectral centroid
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      const freq = (i / frequencyData.length) * (this.audioContext!.sampleRate / 2);
      numerator += freq * frequencyData[i];
      denominator += frequencyData[i];
    }
    const spectralCentroid = denominator > 0 ? numerator / denominator : 0;

    return {
      frequencyProfile: Array.from(frequencyData),
      peakFrequency,
      dynamicRange,
      averageLevel: averageLevel / 255,
      peakLevel: peakLevel / 255,
      spectralCentroid,
    };
  }

  /**
   * Recommend preset based on audio analysis
   */
  recommendPreset(): string {
    const analysis = this.analyzeAudio();

    // Simple heuristic-based recommendation
    if (analysis.spectralCentroid < 2000) {
      return 'bass_heavy';
    } else if (analysis.spectralCentroid > 8000) {
      return 'bright';
    } else if (analysis.dynamicRange > 0.7) {
      return 'vocal_focus';
    }

    return 'balanced';
  }

  /**
   * Get current preset
   */
  getCurrentPreset(): MixingPreset | null {
    return this.currentPreset;
  }

  /**
   * Get all presets
   */
  getPresets(): MixingPreset[] {
    return Object.values(MIXING_PRESETS);
  }

  /**
   * Event emitter
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Emit event
   */
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.eqFilters.forEach((filter) => filter.disconnect());
    if (this.compressor) this.compressor.disconnect();
    if (this.convolver) this.convolver.disconnect();
    if (this.analyser) this.analyser.disconnect();
    this.listeners.clear();
  }
}
