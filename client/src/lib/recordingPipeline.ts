/**
 * Recording Pipeline
 * Microphone input capture, recording, and S3 storage
 */

export interface RecordingConfig {
  mimeType?: string;
  audioBitsPerSecond?: number;
  sampleRate?: number;
}

export interface RecordingMetadata {
  id: string;
  timestamp: number;
  duration: number;
  format: string;
  size: number;
  sampleRate: number;
  channels: number;
}

export interface RecordingState {
  isRecording: boolean;
  duration: number;
  size: number;
  peakLevel: number;
}

export class RecordingPipeline {
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStreamAudioSource: MediaStreamAudioSourceNode | null = null;
  private recordedChunks: Blob[] = [];
  private startTime: number = 0;
  private isRecording: boolean = false;
  private listeners: Map<string, Function[]> = new Map();
  private recordingId: string = '';
  private sampleRate: number = 44100;
  private channels: number = 2;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  /**
   * Start recording from microphone
   */
  async startRecording(config?: RecordingConfig): Promise<void> {
    try {
      // Request microphone access
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });

      // Create analyser for level monitoring
      if (this.audioContext && !this.analyser) {
        this.mediaStreamAudioSource = this.audioContext.createMediaStreamAudioSource(this.audioStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.mediaStreamAudioSource.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
      }

      // Create media recorder
      const mimeType = config?.mimeType || this.getSupportedMimeType();
      const options: MediaRecorderOptions = {
        mimeType,
        audioBitsPerSecond: config?.audioBitsPerSecond || 128000,
      };

      this.mediaRecorder = new MediaRecorder(this.audioStream, options);
      this.recordedChunks = [];
      this.recordingId = this.generateRecordingId();
      this.startTime = Date.now();
      this.isRecording = true;

      // Handle data available
      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      // Handle stop
      this.mediaRecorder.onstop = async () => {
        await this.handleRecordingStop();
      };

      this.mediaRecorder.start();
      this.emit('recordingStarted', { recordingId: this.recordingId });
    } catch (error) {
      console.error('[RecordingPipeline] Failed to start recording:', error);
      this.emit('error', { message: 'Microphone access denied or unavailable' });
      throw error;
    }
  }

  /**
   * Stop recording
   */
  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  /**
   * Pause recording
   */
  pauseRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.pause();
      this.emit('recordingPaused', {});
    }
  }

  /**
   * Resume recording
   */
  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.emit('recordingResumed', {});
    }
  }

  /**
   * Handle recording stop
   */
  private async handleRecordingStop(): Promise<void> {
    const blob = new Blob(this.recordedChunks, { type: this.mediaRecorder?.mimeType });
    const duration = (Date.now() - this.startTime) / 1000;

    const metadata: RecordingMetadata = {
      id: this.recordingId,
      timestamp: this.startTime,
      duration,
      format: this.mediaRecorder?.mimeType || 'audio/webm',
      size: blob.size,
      sampleRate: this.sampleRate,
      channels: this.channels,
    };

    // Stop audio stream
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
    }

    this.emit('recordingComplete', { blob, metadata });
  }

  /**
   * Upload recording to S3
   */
  async uploadToS3(blob: Blob, metadata: RecordingMetadata): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', blob);
      formData.append('metadata', JSON.stringify(metadata));

      const response = await fetch('/api/recordings/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const { url } = await response.json();
      this.emit('uploadComplete', { url, metadata });
      return url;
    } catch (error) {
      console.error('[RecordingPipeline] Upload failed:', error);
      this.emit('error', { message: 'Recording upload failed' });
      throw error;
    }
  }

  /**
   * Get recording state
   */
  getState(): RecordingState {
    const duration = this.isRecording ? (Date.now() - this.startTime) / 1000 : 0;
    const size = this.recordedChunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const peakLevel = this.getPeakLevel();

    return {
      isRecording: this.isRecording,
      duration,
      size,
      peakLevel,
    };
  }

  /**
   * Get peak level from analyser
   */
  private getPeakLevel(): number {
    if (!this.analyser) return 0;

    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(frequencyData);

    let peak = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      peak = Math.max(peak, frequencyData[i]);
    }

    return peak / 255;
  }

  /**
   * Get supported MIME type
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm;codecs=vorbis',
      'audio/webm',
      'audio/mp4',
      'audio/ogg',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm';
  }

  /**
   * Generate recording ID
   */
  private generateRecordingId(): string {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
    this.stopRecording();

    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
    }

    if (this.mediaStreamAudioSource) {
      this.mediaStreamAudioSource.disconnect();
    }

    if (this.analyser) {
      this.analyser.disconnect();
    }

    this.recordedChunks = [];
    this.listeners.clear();
  }
}
