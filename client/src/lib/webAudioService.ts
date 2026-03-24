/**
 * Web Audio API Service
 * Handles microphone input, audio processing, and recording
 */

export interface AudioLevels {
  host: number;
  guest1: number;
  music: number;
  sfx: number;
}

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  bitrate: number;
  format: 'wav' | 'mp3' | 'ogg';
}

class WebAudioService {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private isRecording = false;
  private recordingStartTime = 0;
  private audioLevels: AudioLevels = { host: 0, guest1: 0, music: 0, sfx: 0 };
  private animationFrameId: number | null = null;

  /**
   * Initialize Web Audio API context
   */
  async initialize(): Promise<void> {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
        video: false,
      });

      // Create audio nodes
      this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.gainNode = this.audioContext.createGain();

      // Set analyser properties
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      // Connect nodes
      this.microphone.connect(this.gainNode);
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      // Set default gain (volume)
      this.gainNode.gain.value = 1.0;

      console.log('[WebAudio] Initialized successfully');
      return Promise.resolve();
    } catch (error) {
      console.error('[WebAudio] Initialization failed:', error);
      throw new Error(`Failed to initialize Web Audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Start recording audio
   */
  startRecording(): void {
    if (!this.mediaStream || !this.audioContext) {
      throw new Error('Web Audio not initialized');
    }

    this.audioChunks = [];
    this.isRecording = true;
    this.recordingStartTime = Date.now();

    // Create media recorder
    const options = {
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: 128000,
    };

    try {
      this.mediaRecorder = new MediaRecorder(this.mediaStream, options);

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onerror = (event: MediaRecorderErrorEvent) => {
        console.error('[WebAudio] Recording error:', event.error);
      };

      this.mediaRecorder.start();
      this.startLevelMonitoring();

      console.log('[WebAudio] Recording started');
    } catch (error) {
      console.error('[WebAudio] Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording and return audio blob
   */
  async stopRecording(): Promise<Blob> {
    if (!this.mediaRecorder || !this.isRecording) {
      throw new Error('Recording not in progress');
    }

    return new Promise((resolve, reject) => {
      this.mediaRecorder!.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.isRecording = false;
        this.stopLevelMonitoring();
        console.log('[WebAudio] Recording stopped');
        resolve(audioBlob);
      };

      this.mediaRecorder!.stop();
    });
  }

  /**
   * Start monitoring audio levels
   */
  private startLevelMonitoring(): void {
    if (!this.analyser) return;

    const updateLevels = () => {
      if (!this.analyser || !this.isRecording) return;

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(dataArray);

      // Calculate average level
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const normalizedLevel = Math.min(100, (average / 255) * 100);

      // Update levels (simplified - in real app would have separate tracks)
      this.audioLevels.host = normalizedLevel;
      this.audioLevels.guest1 = normalizedLevel * 0.8;
      this.audioLevels.music = normalizedLevel * 0.6;
      this.audioLevels.sfx = normalizedLevel * 0.4;

      this.animationFrameId = requestAnimationFrame(updateLevels);
    };

    updateLevels();
  }

  /**
   * Stop monitoring audio levels
   */
  private stopLevelMonitoring(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Get current audio levels
   */
  getLevels(): AudioLevels {
    return { ...this.audioLevels };
  }

  /**
   * Set microphone gain (volume)
   */
  setMicrophoneGain(value: number): void {
    if (!this.gainNode) return;
    // Clamp value between 0 and 2
    this.gainNode.gain.value = Math.max(0, Math.min(2, value));
  }

  /**
   * Get microphone gain
   */
  getMicrophoneGain(): number {
    return this.gainNode?.gain.value ?? 1.0;
  }

  /**
   * Mute microphone
   */
  mute(): void {
    if (this.gainNode) {
      this.gainNode.gain.value = 0;
    }
  }

  /**
   * Unmute microphone
   */
  unmute(): void {
    if (this.gainNode) {
      this.gainNode.gain.value = 1.0;
    }
  }

  /**
   * Check if currently recording
   */
  isRecordingNow(): boolean {
    return this.isRecording;
  }

  /**
   * Get recording duration in seconds
   */
  getRecordingDuration(): number {
    if (!this.isRecording) return 0;
    return Math.floor((Date.now() - this.recordingStartTime) / 1000);
  }

  /**
   * Export recording as WAV file
   */
  async exportAsWAV(): Promise<Blob> {
    if (this.audioChunks.length === 0) {
      throw new Error('No audio data to export');
    }

    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
    // In production, would convert to WAV using a library like wav-encoder
    return audioBlob;
  }

  /**
   * Play audio blob
   */
  playAudio(blob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);

        audio.onended = () => {
          URL.revokeObjectURL(url);
          resolve();
        };

        audio.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to play audio'));
        };

        audio.play().catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stopLevelMonitoring();

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.microphone = null;
    this.analyser = null;
    this.gainNode = null;
    this.audioChunks = [];

    console.log('[WebAudio] Cleaned up');
  }

  /**
   * Get audio context state
   */
  getState(): string {
    return this.audioContext?.state ?? 'closed';
  }

  /**
   * Resume audio context (required after user interaction)
   */
  async resumeContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      console.log('[WebAudio] Context resumed');
    }
  }
}

// Export singleton instance
export const webAudioService = new WebAudioService();
export default webAudioService;
