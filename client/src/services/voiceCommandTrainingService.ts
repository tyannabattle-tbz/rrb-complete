/**
 * Custom Voice Command Training Service
 * Allows users to record and train custom voice commands
 */

export interface VoiceCommand {
  id: string;
  trigger: string;
  action: string;
  recordings: AudioBuffer[];
  confidence: number;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
}

export interface TrainingSession {
  commandId: string;
  recordings: Blob[];
  targetAction: string;
  status: 'recording' | 'training' | 'completed' | 'failed';
  progress: number;
}

class VoiceCommandTrainingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private customCommands: Map<string, VoiceCommand> = new Map();
  private trainingSession: TrainingSession | null = null;
  private recordingChunks: Blob[] = [];

  constructor() {
    this.loadCustomCommands();
  }

  /**
   * Start recording a voice command
   */
  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.recordingChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordingChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      console.log('[VoiceTraining] Recording started');
    } catch (error) {
      console.error('[VoiceTraining] Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording and return audio blob
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.recordingChunks, { type: 'audio/webm' });
        resolve(audioBlob);
        console.log('[VoiceTraining] Recording stopped');
      };

      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    });
  }

  /**
   * Train a new voice command
   */
  async trainCommand(
    trigger: string,
    action: string,
    recordingCount: number = 3
  ): Promise<VoiceCommand> {
    const commandId = `cmd-${Date.now()}`;
    const recordings: Blob[] = [];

    this.trainingSession = {
      commandId,
      recordings: [],
      targetAction: action,
      status: 'recording',
      progress: 0,
    };

    try {
      // Collect multiple recordings for better accuracy
      for (let i = 0; i < recordingCount; i++) {
        console.log(`[VoiceTraining] Recording ${i + 1}/${recordingCount}`);

        await this.startRecording();
        await new Promise((resolve) => setTimeout(resolve, 3000)); // 3 second recording
        const blob = await this.stopRecording();
        recordings.push(blob);

        this.trainingSession.progress = ((i + 1) / recordingCount) * 50;
      }

      // Train ML model with recordings
      this.trainingSession.status = 'training';
      this.trainingSession.progress = 50;

      const confidence = await this.trainMLModel(recordings, trigger);

      // Create command object
      const command: VoiceCommand = {
        id: commandId,
        trigger,
        action,
        recordings: [], // Store only metadata, not actual audio
        confidence,
        createdAt: new Date(),
        usageCount: 0,
      };

      // Store command
      this.customCommands.set(commandId, command);
      this.saveCustomCommands();

      this.trainingSession.status = 'completed';
      this.trainingSession.progress = 100;

      console.log('[VoiceTraining] Command trained successfully:', command);
      return command;
    } catch (error) {
      this.trainingSession.status = 'failed';
      console.error('[VoiceTraining] Training failed:', error);
      throw error;
    }
  }

  /**
   * Train ML model with voice samples
   */
  private async trainMLModel(recordings: Blob[], trigger: string): Promise<number> {
    // Simulate ML training
    // In production, this would use TensorFlow.js or similar
    return new Promise((resolve) => {
      setTimeout(() => {
        // Confidence score based on number of recordings
        const confidence = Math.min(0.95, 0.7 + recordings.length * 0.08);
        resolve(confidence);
      }, 2000);
    });
  }

  /**
   * Recognize voice input against trained commands
   */
  async recognizeVoice(): Promise<VoiceCommand | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      mediaRecorder.start();
      await new Promise((resolve) => setTimeout(resolve, 3000)); // 3 second listening
      mediaRecorder.stop();
      stream.getTracks().forEach((track) => track.stop());

      const audioBlob = new Blob(chunks, { type: 'audio/webm' });

      // Match against trained commands
      let bestMatch: VoiceCommand | null = null;
      let bestScore = 0.5; // Confidence threshold

      for (const command of this.customCommands.values()) {
        const score = await this.compareAudio(audioBlob, command);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = command;
        }
      }

      if (bestMatch) {
        bestMatch.usageCount++;
        bestMatch.lastUsed = new Date();
        this.saveCustomCommands();
      }

      return bestMatch;
    } catch (error) {
      console.error('[VoiceTraining] Recognition failed:', error);
      return null;
    }
  }

  /**
   * Compare audio samples
   */
  private async compareAudio(audio1: Blob, command: VoiceCommand): Promise<number> {
    // Simulate audio comparison
    // In production, would use advanced audio processing
    return Math.random() * (command.confidence + 0.2);
  }

  /**
   * Execute custom voice command
   */
  async executeCommand(command: VoiceCommand): Promise<void> {
    console.log(`[VoiceTraining] Executing command: ${command.trigger} -> ${command.action}`);

    // Emit custom event for command execution
    const event = new CustomEvent('customVoiceCommand', {
      detail: { command, timestamp: Date.now() },
    });
    window.dispatchEvent(event);
  }

  /**
   * Get all custom commands
   */
  getCustomCommands(): VoiceCommand[] {
    return Array.from(this.customCommands.values());
  }

  /**
   * Delete custom command
   */
  deleteCommand(commandId: string): void {
    this.customCommands.delete(commandId);
    this.saveCustomCommands();
  }

  /**
   * Save commands to localStorage
   */
  private saveCustomCommands(): void {
    const data = Array.from(this.customCommands.values()).map((cmd) => ({
      ...cmd,
      createdAt: cmd.createdAt.toISOString(),
      lastUsed: cmd.lastUsed?.toISOString(),
    }));
    localStorage.setItem('qumus_custom_commands', JSON.stringify(data));
  }

  /**
   * Load commands from localStorage
   */
  private loadCustomCommands(): void {
    const data = localStorage.getItem('qumus_custom_commands');
    if (data) {
      try {
        const commands = JSON.parse(data);
        commands.forEach((cmd: any) => {
          this.customCommands.set(cmd.id, {
            ...cmd,
            createdAt: new Date(cmd.createdAt),
            lastUsed: cmd.lastUsed ? new Date(cmd.lastUsed) : undefined,
          });
        });
      } catch (error) {
        console.error('[VoiceTraining] Failed to load commands:', error);
      }
    }
  }

  /**
   * Get training progress
   */
  getTrainingProgress(): number {
    return this.trainingSession?.progress || 0;
  }

  /**
   * Get training status
   */
  getTrainingStatus(): string {
    return this.trainingSession?.status || 'idle';
  }
}

export const voiceTrainingService = new VoiceCommandTrainingService();
