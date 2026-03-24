/**
 * Web Audio API Engine for RRB Advanced Studio
 * Real-time audio synthesis, effects processing, and playback
 */

export interface AudioEngineConfig {
  sampleRate?: number;
  bufferSize?: number;
  masterVolume?: number;
}

export interface ChannelConfig {
  id: number;
  name: string;
  frequency?: number;
  waveType?: 'sine' | 'square' | 'sawtooth' | 'triangle';
  volume?: number;
  enabled?: boolean;
}

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private channels: Map<number, ChannelNode> = new Map();
  private isInitialized = false;
  private masterVolume = 0.7;

  constructor(config?: AudioEngineConfig) {
    this.masterVolume = config?.masterVolume ?? 0.7;
  }

  /**
   * Initialize the audio context and master gain node
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();

      // Resume audio context if suspended (required by browser autoplay policies)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create master gain node
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.audioContext.destination);

      this.isInitialized = true;
      console.log('[AudioEngine] Initialized successfully');
    } catch (error) {
      console.error('[AudioEngine] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create a new audio channel with oscillator
   */
  createChannel(config: ChannelConfig): ChannelNode {
    if (!this.audioContext || !this.masterGain) {
      throw new Error('AudioEngine not initialized');
    }

    const channel = new ChannelNode(this.audioContext, this.masterGain, config);
    this.channels.set(config.id, channel);
    return channel;
  }

  /**
   * Get an existing channel
   */
  getChannel(id: number): ChannelNode | undefined {
    return this.channels.get(id);
  }

  /**
   * Start audio playback on a channel
   */
  playChannel(id: number, frequency: number = 432): void {
    const channel = this.channels.get(id);
    if (channel) {
      channel.play(frequency);
    }
  }

  /**
   * Stop audio playback on a channel
   */
  stopChannel(id: number): void {
    const channel = this.channels.get(id);
    if (channel) {
      channel.stop();
    }
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterVolume = Math.max(0, Math.min(1, volume));
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.audioContext!.currentTime);
    }
  }

  /**
   * Get master volume
   */
  getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Stop all channels
   */
  stopAll(): void {
    this.channels.forEach(channel => channel.stop());
  }

  /**
   * Get audio context state
   */
  getState(): AudioContextState {
    return this.audioContext?.state ?? 'closed';
  }

  /**
   * Resume audio context (for autoplay policy)
   */
  async resume(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      console.log('[AudioEngine] Audio context resumed');
    }
  }

  /**
   * Load and decode an audio file
   */
  async loadAudioFile(path: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('AudioEngine not initialized');
    }

    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio file: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      console.log('[AudioEngine] Loaded audio file:', path);
      return audioBuffer;
    } catch (error) {
      console.error('[AudioEngine] Failed to load audio file:', path, error);
      throw error;
    }
  }

  /**
   * Resume audio context alias for compatibility
   */
  async resumeContext(): Promise<void> {
    return this.resume();
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stopAll();
    this.channels.clear();
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.isInitialized = false;
  }
}

/**
 * Individual audio channel with oscillator, effects, and gain control
 */
export class ChannelNode {
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode;
  private filterNode: BiquadFilterNode;
  private compressorNode: DynamicsCompressorNode;
  private isPlaying = false;
  private config: ChannelConfig;
  private audioContext: AudioContext;

  constructor(
    audioContext: AudioContext,
    masterGain: GainNode,
    config: ChannelConfig
  ) {
    this.audioContext = audioContext;
    this.config = config;

    // Create gain node for channel volume
    this.gainNode = audioContext.createGain();
    this.gainNode.gain.value = config.volume ?? 0.5;

    // Create filter node for EQ
    this.filterNode = audioContext.createBiquadFilter();
    this.filterNode.type = 'peaking';
    this.filterNode.frequency.value = 1000;
    this.filterNode.gain.value = 0;
    this.filterNode.Q.value = 1;

    // Create compressor for dynamics control
    this.compressorNode = audioContext.createDynamicsCompressor();
    this.compressorNode.threshold.value = -24;
    this.compressorNode.knee.value = 30;
    this.compressorNode.ratio.value = 12;
    this.compressorNode.attack.value = 0.003;
    this.compressorNode.release.value = 0.25;

    // Connect nodes: oscillator -> gain -> filter -> compressor -> master
    this.gainNode.connect(this.filterNode);
    this.filterNode.connect(this.compressorNode);
    this.compressorNode.connect(masterGain);
  }

  /**
   * Start playing the channel
   */
  play(frequency: number = this.config.frequency ?? 432): void {
    if (this.isPlaying) {
      this.stop();
    }

    try {
      // Create oscillator
      this.oscillator = this.audioContext.createOscillator();
      this.oscillator.type = (this.config.waveType ?? 'sine') as OscillatorType;
      this.oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

      // Connect oscillator to gain node
      this.oscillator.connect(this.gainNode);

      // Start playback
      this.oscillator.start(this.audioContext.currentTime);
      this.isPlaying = true;

      console.log(`[ChannelNode] Playing ${this.config.name} at ${frequency}Hz`);
    } catch (error) {
      console.error(`[ChannelNode] Play failed for ${this.config.name}:`, error);
    }
  }

  /**
   * Stop playing the channel
   */
  stop(): void {
    if (this.oscillator && this.isPlaying) {
      try {
        // Fade out over 100ms
        const fadeTime = 0.1;
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.audioContext.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + fadeTime);

        setTimeout(() => {
          if (this.oscillator) {
            this.oscillator.stop(this.audioContext.currentTime);
            this.oscillator.disconnect();
            this.oscillator = null;
          }
        }, fadeTime * 1000);

        this.isPlaying = false;
        console.log(`[ChannelNode] Stopped ${this.config.name}`);
      } catch (error) {
        console.error(`[ChannelNode] Stop failed for ${this.config.name}:`, error);
      }
    }
  }

  /**
   * Set channel volume (0-1)
   */
  setVolume(volume: number): void {
    this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.audioContext.currentTime);
  }

  /**
   * Get channel volume
   */
  getVolume(): number {
    return this.gainNode.gain.value;
  }

  /**
   * Set frequency
   */
  setFrequency(frequency: number): void {
    if (this.oscillator && this.isPlaying) {
      this.oscillator.frequency.setTargetAtTime(frequency, this.audioContext.currentTime, 0.01);
    }
  }

  /**
   * Set waveform type
   */
  setWaveType(type: 'sine' | 'square' | 'sawtooth' | 'triangle'): void {
    if (this.oscillator && this.isPlaying) {
      this.oscillator.type = type as OscillatorType;
    }
  }

  /**
   * Apply EQ filter
   */
  setEQ(frequency: number, gain: number, q: number = 1): void {
    this.filterNode.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    this.filterNode.gain.setValueAtTime(gain, this.audioContext.currentTime);
    this.filterNode.Q.setValueAtTime(q, this.audioContext.currentTime);
  }

  /**
   * Check if channel is playing
   */
  isChannelPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.stop();
    this.gainNode.disconnect();
    this.filterNode.disconnect();
    this.compressorNode.disconnect();
  }
}

/**
 * Solfeggio frequency presets
 */
export const SOLFEGGIO_FREQUENCIES = {
  UT: { hz: 174, name: 'UT', description: 'Root chakra activation' },
  RE: { hz: 285, name: 'RE', description: 'Sacral chakra activation' },
  MI: { hz: 369, name: 'MI', description: 'Solar plexus activation' },
  FA: { hz: 432, name: 'FA', description: 'Heart chakra activation' },
  SOL: { hz: 528, name: 'SOL', description: 'Throat chakra activation' },
  LA: { hz: 639, name: 'LA', description: 'Third eye activation' },
  TI: { hz: 741, name: 'TI', description: 'Crown chakra activation' },
  SI: { hz: 852, name: 'SI', description: 'Spiritual awakening' },
  DO: { hz: 963, name: 'DO', description: 'Divine connection' },
};

/**
 * Create a global audio engine instance
 */
let globalAudioEngine: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!globalAudioEngine) {
    globalAudioEngine = new AudioEngine({ masterVolume: 0.7 });
  }
  return globalAudioEngine;
}

export function initializeAudioEngine(): Promise<void> {
  return getAudioEngine().initialize();
}
