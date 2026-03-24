/**
 * Audio Playback Manager
 * Real-time audio playback with waveform visualization and time scrubbing
 */

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  loop: boolean;
}

export interface PlaybackMetrics {
  frequencyData: Uint8Array | null;
  waveformData: Uint8Array | null;
  peakLevel: number;
  averageLevel: number;
}

export class AudioPlaybackManager {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private currentBuffer: AudioBuffer | null = null;
  private startTime: number = 0;
  private pausedTime: number = 0;
  private isPlaying: boolean = false;
  private playbackRate: number = 1;
  private loop: boolean = false;
  private listeners: Map<string, Function[]> = new Map();

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.initializeNodes();
  }

  private initializeNodes(): void {
    if (!this.audioContext) return;

    // Create analyser for visualization
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;

    // Create gain node for volume control
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0.7;

    // Connect nodes
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }

  /**
   * Play audio buffer
   */
  play(buffer: AudioBuffer): void {
    if (!this.audioContext || !this.gainNode) {
      throw new Error('Audio context not initialized');
    }

    // Stop current playback
    if (this.currentSource) {
      this.currentSource.stop();
    }

    this.currentBuffer = buffer;
    this.currentSource = this.audioContext.createBufferSource();
    this.currentSource.buffer = buffer;
    this.currentSource.playbackRate.value = this.playbackRate;
    this.currentSource.loop = this.loop;
    this.currentSource.connect(this.gainNode);

    // Handle playback end
    this.currentSource.onended = () => {
      if (!this.loop) {
        this.isPlaying = false;
        this.emit('playbackEnded', {});
      }
    };

    this.startTime = this.audioContext.currentTime;
    this.pausedTime = 0;
    this.isPlaying = true;
    this.currentSource.start(0);

    this.emit('playbackStarted', { duration: buffer.duration });
  }

  /**
   * Pause playback
   */
  pause(): void {
    if (!this.isPlaying || !this.currentSource || !this.audioContext) return;

    this.pausedTime = this.audioContext.currentTime - this.startTime;
    this.currentSource.stop();
    this.isPlaying = false;

    this.emit('playbackPaused', { currentTime: this.pausedTime });
  }

  /**
   * Resume playback
   */
  resume(): void {
    if (this.isPlaying || !this.currentBuffer) return;

    if (!this.audioContext || !this.gainNode) {
      throw new Error('Audio context not initialized');
    }

    this.currentSource = this.audioContext.createBufferSource();
    this.currentSource.buffer = this.currentBuffer;
    this.currentSource.playbackRate.value = this.playbackRate;
    this.currentSource.loop = this.loop;
    this.currentSource.connect(this.gainNode);

    this.currentSource.onended = () => {
      if (!this.loop) {
        this.isPlaying = false;
        this.emit('playbackEnded', {});
      }
    };

    this.startTime = this.audioContext.currentTime - this.pausedTime;
    this.isPlaying = true;
    this.currentSource.start(0, this.pausedTime);

    this.emit('playbackResumed', { currentTime: this.pausedTime });
  }

  /**
   * Stop playback
   */
  stop(): void {
    if (this.currentSource) {
      this.currentSource.stop();
    }

    this.isPlaying = false;
    this.pausedTime = 0;
    this.currentBuffer = null;
    this.currentSource = null;

    this.emit('playbackStopped', {});
  }

  /**
   * Seek to time
   */
  seek(time: number): void {
    if (!this.currentBuffer) return;

    const wasPlaying = this.isPlaying;

    if (this.isPlaying) {
      this.pause();
    }

    this.pausedTime = Math.max(0, Math.min(time, this.currentBuffer.duration));

    if (wasPlaying) {
      this.resume();
    }

    this.emit('seeked', { currentTime: this.pausedTime });
  }

  /**
   * Set playback rate (0.5, 1, 1.5, 2)
   */
  setPlaybackRate(rate: number): void {
    this.playbackRate = Math.max(0.25, Math.min(2, rate));

    if (this.currentSource) {
      this.currentSource.playbackRate.value = this.playbackRate;
    }

    this.emit('playbackRateChanged', { playbackRate: this.playbackRate });
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
      this.emit('volumeChanged', { volume: this.gainNode.gain.value });
    }
  }

  /**
   * Set loop
   */
  setLoop(loop: boolean): void {
    this.loop = loop;

    if (this.currentSource) {
      this.currentSource.loop = loop;
    }

    this.emit('loopChanged', { loop });
  }

  /**
   * Get current playback state
   */
  getState(): PlaybackState {
    let currentTime = this.pausedTime;

    if (this.isPlaying && this.audioContext) {
      currentTime = this.audioContext.currentTime - this.startTime;
    }

    return {
      isPlaying: this.isPlaying,
      currentTime,
      duration: this.currentBuffer?.duration ?? 0,
      volume: this.gainNode?.gain.value ?? 0.7,
      playbackRate: this.playbackRate,
      loop: this.loop,
    };
  }

  /**
   * Get playback metrics for visualization
   */
  getMetrics(): PlaybackMetrics {
    if (!this.analyser) {
      return {
        frequencyData: null,
        waveformData: null,
        peakLevel: 0,
        averageLevel: 0,
      };
    }

    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(frequencyData);

    const waveformData = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(waveformData);

    // Calculate peak and average levels
    let peak = 0;
    let sum = 0;

    for (let i = 0; i < frequencyData.length; i++) {
      peak = Math.max(peak, frequencyData[i]);
      sum += frequencyData[i];
    }

    const average = sum / frequencyData.length;

    return {
      frequencyData,
      waveformData,
      peakLevel: peak / 255,
      averageLevel: average / 255,
    };
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
   * Remove event listener
   */
  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
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
    this.stop();
    if (this.gainNode) {
      this.gainNode.disconnect();
    }
    if (this.analyser) {
      this.analyser.disconnect();
    }
    this.listeners.clear();
  }
}
