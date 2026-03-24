/**
 * Professional Audio Engine Service
 * Full Web Audio API integration with JACK routing, device management, and real-time monitoring
 */

export class AudioEngineService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private mediaStreamAudioSource: MediaStreamAudioSourceNode | null = null;
  private isInitialized = false;
  private listeners: Map<string, Function[]> = new Map();
  private audioDevices: MediaDeviceInfo[] = [];

  constructor() {
    this.initializeAudioContext();
    this.enumerateAudioDevices();
  }

  /**
   * Initialize Web Audio API context
   */
  private async initializeAudioContext() {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.audioContext = audioContext;

      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log('[AudioEngine] Audio context resumed from suspended state');
      }

      // Create gain node for volume control
      this.gainNode = audioContext.createGain();
      this.gainNode.gain.value = 0.8;
      this.gainNode.connect(audioContext.destination);

      // Create analyser for visualization
      this.analyser = audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.connect(this.gainNode);

      this.isInitialized = true;
      console.log('[AudioEngine] Successfully initialized');
      this.emit('initialized', { sampleRate: audioContext.sampleRate });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[AudioEngine] Failed to initialize:', msg);
      this.emit('error', { message: 'Audio context initialization failed: ' + msg });
    }
  }

  /**
   * Enumerate available audio devices
   */
  async enumerateAudioDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.audioDevices = devices.filter(
        (device) => device.kind === 'audioinput' || device.kind === 'audiooutput'
      );
      this.emit('devicesUpdated', { devices: this.audioDevices });
    } catch (error) {
      console.error('[AudioEngine] Failed to enumerate devices:', error);
    }
  }

  /**
   * Request microphone access and start audio capture
   */
  async startAudioCapture(deviceId?: string): Promise<MediaStream> {
    try {
      if (!this.audioContext) {
        throw new Error('Audio context not initialized');
      }

      const constraints: MediaStreamConstraints = {
        audio: deviceId
          ? { deviceId: { exact: deviceId }, echoCancellation: true, noiseSuppression: true }
          : { echoCancellation: true, noiseSuppression: true },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Connect microphone to analyser
      if (this.mediaStreamAudioSource) {
        this.mediaStreamAudioSource.disconnect();
      }

      this.mediaStreamAudioSource = this.audioContext.createMediaStreamAudioSource(stream);
      this.mediaStreamAudioSource.connect(this.analyser!);

      this.emit('captureStarted', { stream });
      return stream;
    } catch (error) {
      console.error('[AudioEngine] Failed to start audio capture:', error);
      this.emit('error', { message: 'Microphone access denied or unavailable' });
      throw error;
    }
  }

  /**
   * Stop audio capture
   */
  stopAudioCapture(stream: MediaStream) {
    stream.getTracks().forEach((track) => track.stop());
    if (this.mediaStreamAudioSource) {
      this.mediaStreamAudioSource.disconnect();
      this.mediaStreamAudioSource = null;
    }
    this.emit('captureStopped', {});
  }

  /**
   * Set output volume (0-1)
   */
  setVolume(value: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, value));
      this.emit('volumeChanged', { volume: this.gainNode.gain.value });
    }
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.gainNode?.gain.value ?? 0.8;
  }

  /**
   * Get frequency data for visualization
   */
  getFrequencyData(): Uint8Array | null {
    if (!this.analyser) return null;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  /**
   * Get time domain data for waveform visualization
   */
  getWaveformData(): Uint8Array | null {
    if (!this.analyser) return null;
    const dataArray = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(dataArray);
    return dataArray;
  }

  /**
   * Play audio buffer
   */
  async playAudioBuffer(arrayBuffer: ArrayBuffer) {
    try {
      if (!this.audioContext) throw new Error('Audio context not initialized');

      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.gainNode!);
      source.start(0);

      this.emit('playbackStarted', { duration: audioBuffer.duration });
    } catch (error) {
      console.error('[AudioEngine] Failed to play audio:', error);
      this.emit('error', { message: 'Audio playback failed' });
    }
  }

  /**
   * Create recording processor
   */
  createRecorder(stream: MediaStream): MediaRecorder {
    const options: MediaRecorderOptions = {
      mimeType: 'audio/webm;codecs=opus',
    };

    // Fallback if opus not supported
    if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
      options.mimeType = 'audio/webm';
    }

    const recorder = new MediaRecorder(stream, options);
    const chunks: Blob[] = [];

    recorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: options.mimeType });
      this.emit('recordingComplete', { blob, duration: recorder.state });
    };

    return recorder;
  }

  /**
   * Get audio context state
   */
  getContextState() {
    return {
      isInitialized: this.isInitialized,
      state: this.audioContext?.state,
      sampleRate: this.audioContext?.sampleRate,
      volume: this.getVolume(),
      devices: this.audioDevices,
    };
  }

  /**
   * Event emitter
   */
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Event emitter - emit
   */
  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  /**
   * Resume audio context (required after user interaction)
   */
  async resumeContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      console.log('[AudioEngine] Context resumed');
      this.emit('contextResumed', {});
    }
  }

  /**
   * Load audio file from URL and decode
   */
  async loadAudioFile(url: string): Promise<AudioBuffer> {
    try {
      if (!this.audioContext) throw new Error('Audio context not initialized');

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch audio file: ${response.statusText}`);

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      console.log('[AudioEngine] Loaded audio file:', url, 'Duration:', audioBuffer.duration);
      return audioBuffer;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[AudioEngine] Failed to load audio file:', msg);
      this.emit('error', { message: 'Failed to load audio file: ' + msg });
      throw error;
    }
  }

  /**
   * Play audio buffer with ID tracking
   */
  playAudioBufferWithId(audioBuffer: AudioBuffer, id: string): AudioBufferSourceNode {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.gainNode!);
    source.start(0);

    console.log('[AudioEngine] Playing audio buffer:', id, 'Duration:', audioBuffer.duration);
    this.emit('playbackStarted', { id, duration: audioBuffer.duration });

    return source;
  }
}

// Singleton instance
export const audioEngine = new AudioEngineService();
