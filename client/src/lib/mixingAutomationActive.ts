/**
 * Mixing Automation Engine - Active Implementation
 * Wires all 4 presets (Balanced, Vocal Focus, Bass Heavy, Bright) to Studio Suite
 */

export interface MixingPreset {
  id: string;
  name: string;
  description: string;
  eq: {
    low: { gain: number; freq: number };
    mid: { gain: number; freq: number };
    high: { gain: number; freq: number };
  };
  compression: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
    makeup: number;
  };
  reverb: {
    wet: number;
    dry: number;
    decay: number;
    preDelay: number;
  };
}

export const MIXING_PRESETS: Record<string, MixingPreset> = {
  balanced: {
    id: 'balanced',
    name: 'Balanced',
    description: 'Neutral, flat frequency response',
    eq: {
      low: { gain: 0, freq: 100 },
      mid: { gain: 0, freq: 1000 },
      high: { gain: 0, freq: 10000 },
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
  vocal_focus: {
    id: 'vocal_focus',
    name: 'Vocal Focus',
    description: 'Enhanced vocals with presence peak',
    eq: {
      low: { gain: -3, freq: 100 },
      mid: { gain: 6, freq: 2000 },
      high: { gain: 3, freq: 8000 },
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
  bass_heavy: {
    id: 'bass_heavy',
    name: 'Bass Heavy',
    description: 'Powerful low-end emphasis',
    eq: {
      low: { gain: 8, freq: 80 },
      mid: { gain: -2, freq: 1000 },
      high: { gain: 2, freq: 10000 },
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
  bright: {
    id: 'bright',
    name: 'Bright',
    description: 'Crisp, clear, enhanced highs',
    eq: {
      low: { gain: -2, freq: 100 },
      mid: { gain: 2, freq: 1000 },
      high: { gain: 6, freq: 12000 },
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
};

export class MixingAutomationEngine {
  private audioContext: AudioContext;
  private currentPreset: MixingPreset | null = null;
  private eqNodes: Map<string, BiquadFilterNode> = new Map();
  private compressorNode: DynamicsCompressor | null = null;
  private reverbNode: ConvolverNode | null = null;
  private dryGain: GainNode;
  private wetGain: GainNode;
  private masterGain: GainNode;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.masterGain = audioContext.createGain();
    this.dryGain = audioContext.createGain();
    this.wetGain = audioContext.createGain();
    this.dryGain.connect(this.masterGain);
    this.wetGain.connect(this.masterGain);
    this.masterGain.connect(audioContext.destination);
  }

  /**
   * Apply mixing preset to current audio
   */
  applyPreset(presetId: string): boolean {
    const preset = MIXING_PRESETS[presetId];
    if (!preset) {
      console.error(`Preset not found: ${presetId}`);
      return false;
    }

    this.currentPreset = preset;

    // Apply EQ
    this.applyEQ(preset.eq);

    // Apply compression
    this.applyCompression(preset.compression);

    // Apply reverb
    this.applyReverb(preset.reverb);

    console.log(`[Mixing] Applied preset: ${preset.name}`);
    return true;
  }

  /**
   * Apply 3-band EQ
   */
  private applyEQ(eqSettings: any): void {
    // Create or update low shelf filter
    let lowFilter = this.eqNodes.get('low');
    if (!lowFilter) {
      lowFilter = this.audioContext.createBiquadFilter();
      lowFilter.type = 'lowshelf';
      this.eqNodes.set('low', lowFilter);
    }
    lowFilter.frequency.value = eqSettings.low.freq;
    lowFilter.gain.value = eqSettings.low.gain;

    // Create or update mid peaking filter
    let midFilter = this.eqNodes.get('mid');
    if (!midFilter) {
      midFilter = this.audioContext.createBiquadFilter();
      midFilter.type = 'peaking';
      this.eqNodes.set('mid', midFilter);
    }
    midFilter.frequency.value = eqSettings.mid.freq;
    midFilter.gain.value = eqSettings.mid.gain;
    midFilter.Q.value = 1;

    // Create or update high shelf filter
    let highFilter = this.eqNodes.get('high');
    if (!highFilter) {
      highFilter = this.audioContext.createBiquadFilter();
      highFilter.type = 'highshelf';
      this.eqNodes.set('high', highFilter);
    }
    highFilter.frequency.value = eqSettings.high.freq;
    highFilter.gain.value = eqSettings.high.gain;

    // Chain filters
    lowFilter.connect(midFilter);
    midFilter.connect(highFilter);
    highFilter.connect(this.dryGain);
  }

  /**
   * Apply dynamic range compression
   */
  private applyCompression(compressionSettings: any): void {
    if (!this.compressorNode) {
      this.compressorNode = this.audioContext.createDynamicsCompressor();
    }

    this.compressorNode.threshold.value = compressionSettings.threshold;
    this.compressorNode.ratio.value = compressionSettings.ratio;
    this.compressorNode.attack.value = compressionSettings.attack / 1000;
    this.compressorNode.release.value = compressionSettings.release / 1000;
    this.compressorNode.knee.value = 30;

    // Connect compressor after EQ
    const highFilter = this.eqNodes.get('high');
    if (highFilter) {
      highFilter.disconnect();
      highFilter.connect(this.compressorNode);
      this.compressorNode.connect(this.dryGain);
    }
  }

  /**
   * Apply reverb effect
   */
  private applyReverb(reverbSettings: any): void {
    if (!this.reverbNode) {
      this.reverbNode = this.audioContext.createConvolver();
      // In production, load actual impulse response
      // For now, use simple reverb simulation
    }

    this.dryGain.gain.value = reverbSettings.dry;
    this.wetGain.gain.value = reverbSettings.wet;

    // Connect reverb
    const highFilter = this.eqNodes.get('high');
    if (highFilter && this.reverbNode) {
      highFilter.connect(this.reverbNode);
      this.reverbNode.connect(this.wetGain);
    }
  }

  /**
   * Get current preset
   */
  getCurrentPreset(): MixingPreset | null {
    return this.currentPreset;
  }

  /**
   * List all available presets
   */
  listPresets(): MixingPreset[] {
    return Object.values(MIXING_PRESETS);
  }

  /**
   * Adjust individual EQ band
   */
  adjustEQBand(band: 'low' | 'mid' | 'high', gain: number): void {
    const filter = this.eqNodes.get(band);
    if (filter) {
      filter.gain.value = gain;
      console.log(`[Mixing] Adjusted ${band} EQ to ${gain}dB`);
    }
  }

  /**
   * Adjust compression threshold
   */
  adjustCompressionThreshold(threshold: number): void {
    if (this.compressorNode) {
      this.compressorNode.threshold.value = threshold;
      console.log(`[Mixing] Adjusted compression threshold to ${threshold}dB`);
    }
  }

  /**
   * Adjust reverb wet/dry mix
   */
  adjustReverbMix(wet: number, dry: number): void {
    this.wetGain.gain.value = wet;
    this.dryGain.gain.value = dry;
    console.log(`[Mixing] Adjusted reverb mix: wet=${wet}, dry=${dry}`);
  }

  /**
   * Get master output node for connection
   */
  getMasterOutput(): GainNode {
    return this.masterGain;
  }
}

// Singleton instance
let mixingAutomationInstance: MixingAutomationEngine | null = null;

export const getMixingAutomation = (audioContext: AudioContext): MixingAutomationEngine => {
  if (!mixingAutomationInstance) {
    mixingAutomationInstance = new MixingAutomationEngine(audioContext);
  }
  return mixingAutomationInstance;
};
