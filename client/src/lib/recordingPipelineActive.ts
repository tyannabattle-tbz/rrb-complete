/**
 * Recording Pipeline - Active Implementation
 * Captures microphone audio and uploads to S3 in real-time
 */

export interface RecordingSession {
  id: string;
  trackId: string;
  startTime: number;
  duration: number;
  format: 'wav' | 'mp3' | 'ogg';
  bitrate: number;
  sampleRate: number;
  s3Url?: string;
  metadata: {
    title: string;
    artist: string;
    tags: string[];
    notes: string;
  };
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  currentSession?: RecordingSession;
  recordedSessions: RecordingSession[];
  error?: string;
}

export class RecordingPipelineManager {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private state: RecordingState = {
    isRecording: false,
    isPaused: false,
    recordedSessions: [],
  };

  /**
   * Request microphone permissions and start recording
   */
  async startRecording(trackId: string, format: 'wav' | 'mp3' | 'ogg' = 'wav', bitrate: number = 128000): Promise<boolean> {
    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });

      // Create MediaRecorder
      const options = {
        mimeType: this.getMimeType(format),
        audioBitsPerSecond: bitrate,
      };

      this.mediaRecorder = new MediaRecorder(this.stream, options);
      this.audioChunks = [];

      // Collect audio data
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Handle recording stop
      this.mediaRecorder.onstop = async () => {
        await this.handleRecordingComplete(trackId, format);
      };

      this.mediaRecorder.start();

      // Update state
      this.state.isRecording = true;
      this.state.currentSession = {
        id: `rec-${Date.now()}`,
        trackId,
        startTime: Date.now(),
        duration: 0,
        format,
        bitrate,
        sampleRate: 48000,
        metadata: {
          title: `Recording - ${new Date().toLocaleString()}`,
          artist: 'RRB Studio',
          tags: ['recording', trackId],
          notes: '',
        },
      };

      console.log(`[Recording] Started recording to track: ${trackId}`);
      return true;
    } catch (error) {
      this.state.error = `Recording failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('[Recording] Error:', this.state.error);
      return false;
    }
  }

  /**
   * Stop recording
   */
  stopRecording(): boolean {
    if (!this.mediaRecorder || !this.state.isRecording) {
      return false;
    }

    this.mediaRecorder.stop();
    this.state.isRecording = false;
    this.state.isPaused = false;

    // Stop all tracks in the stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }

    console.log('[Recording] Recording stopped');
    return true;
  }

  /**
   * Pause recording
   */
  pauseRecording(): boolean {
    if (!this.mediaRecorder || !this.state.isRecording) {
      return false;
    }

    this.mediaRecorder.pause();
    this.state.isPaused = true;
    console.log('[Recording] Recording paused');
    return true;
  }

  /**
   * Resume recording
   */
  resumeRecording(): boolean {
    if (!this.mediaRecorder || !this.state.isPaused) {
      return false;
    }

    this.mediaRecorder.resume();
    this.state.isPaused = false;
    console.log('[Recording] Recording resumed');
    return true;
  }

  /**
   * Handle recording completion - upload to S3
   */
  private async handleRecordingComplete(trackId: string, format: string): Promise<void> {
    try {
      // Create blob from audio chunks
      const audioBlob = new Blob(this.audioChunks, { type: this.getMimeType(format) });

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', audioBlob, `recording-${Date.now()}.${format}`);
      formData.append('trackId', trackId);
      formData.append('timestamp', Date.now().toString());

      // Upload to server (which will handle S3 upload)
      const response = await fetch('/api/recordings/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Update session with S3 URL
      if (this.state.currentSession) {
        this.state.currentSession.s3Url = result.url;
        this.state.currentSession.duration = (Date.now() - this.state.currentSession.startTime) / 1000;
        this.state.recordedSessions.push(this.state.currentSession);
        this.state.currentSession = undefined;
      }

      console.log('[Recording] Upload complete:', result.url);
    } catch (error) {
      this.state.error = `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('[Recording] Upload error:', this.state.error);
    }
  }

  /**
   * Get MIME type for format
   */
  private getMimeType(format: string): string {
    switch (format) {
      case 'mp3':
        return 'audio/mpeg';
      case 'ogg':
        return 'audio/ogg';
      case 'wav':
      default:
        return 'audio/wav';
    }
  }

  /**
   * Get current recording state
   */
  getState(): RecordingState {
    return { ...this.state };
  }

  /**
   * Get recorded sessions
   */
  getRecordedSessions(): RecordingSession[] {
    return [...this.state.recordedSessions];
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.state.error = undefined;
  }
}

// Singleton instance
let recordingPipelineInstance: RecordingPipelineManager | null = null;

export const getRecordingPipeline = (): RecordingPipelineManager => {
  if (!recordingPipelineInstance) {
    recordingPipelineInstance = new RecordingPipelineManager();
  }
  return recordingPipelineInstance;
};
