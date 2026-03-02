/**
 * Voice Service Module
 * Provides voice recognition, text-to-speech, and voice command capabilities
 */

export interface VoiceRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export interface VoiceCommand {
  command: string;
  action: () => void;
}

class VoiceService {
  private recognition: any;
  private synthesis: SpeechSynthesis;
  private isListening: boolean = false;
  private commands: Map<string, VoiceCommand> = new Map();
  private onTranscript: ((text: string, isFinal: boolean) => void) | null = null;
  private onError: ((error: string) => void) | null = null;

  constructor() {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.setupRecognitionListeners();
    }

    // Initialize Text-to-Speech
    this.synthesis = window.speechSynthesis;
  }

  /**
   * Setup speech recognition event listeners
   */
  private setupRecognitionListeners() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        this.onTranscript?.(finalTranscript.trim(), true);
        this.processVoiceCommand(finalTranscript.trim());
      } else if (interimTranscript) {
        this.onTranscript?.(interimTranscript, false);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  /**
   * Start listening for voice input
   */
  startListening(options: VoiceRecognitionOptions = {}) {
    if (!this.recognition) {
      this.onError?.('Speech Recognition not supported in this browser');
      return;
    }

    this.recognition.language = options.language || 'en-US';
    this.recognition.continuous = options.continuous || false;
    this.recognition.interimResults = options.interimResults !== false;

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  }

  /**
   * Stop listening for voice input
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * Speak text using text-to-speech
   */
  speak(text: string, options: SpeechSynthesisUtterance = {}) {
    if (!this.synthesis) {
      this.onError?.('Text-to-Speech not supported');
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    this.synthesis.speak(utterance);
  }

  /**
   * Register a voice command
   */
  registerCommand(trigger: string, action: () => void) {
    this.commands.set(trigger.toLowerCase(), {
      command: trigger,
      action,
    });
  }

  /**
   * Process voice command
   */
  private processVoiceCommand(transcript: string) {
    const lowerTranscript = transcript.toLowerCase();

    for (const [trigger, cmd] of this.commands) {
      if (lowerTranscript.includes(trigger)) {
        cmd.action();
        this.speak(`Executing ${cmd.command}`);
        return;
      }
    }
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  /**
   * Set voice for text-to-speech
   */
  setVoice(voiceIndex: number) {
    const voices = this.getAvailableVoices();
    if (voices[voiceIndex]) {
      // Store for later use in speak()
      (this as any).selectedVoice = voices[voiceIndex];
    }
  }

  /**
   * Check if listening
   */
  isListeningActive(): boolean {
    return this.isListening;
  }

  /**
   * Set transcript callback
   */
  onTranscriptChange(callback: (text: string, isFinal: boolean) => void) {
    this.onTranscript = callback;
  }

  /**
   * Set error callback
   */
  onVoiceError(callback: (error: string) => void) {
    this.onError = callback;
  }

  /**
   * Clear all commands
   */
  clearCommands() {
    this.commands.clear();
  }

  /**
   * Get voice support status
   */
  isSupported(): boolean {
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      window.speechSynthesis
    );
  }
}

// Export singleton instance
export const voiceService = new VoiceService();
