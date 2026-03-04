/**
 * Voice Recognition Service
 * Handles speech-to-text conversion using Web Speech API
 */

interface VoiceRecognitionConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

type VoiceRecognitionCallback = (result: VoiceRecognitionResult) => void;
type VoiceRecognitionErrorCallback = (error: string) => void;

class VoiceRecognitionService {
  private recognition: any;
  private isListening: boolean = false;
  private transcript: string = '';
  private callbacks: VoiceRecognitionCallback[] = [];
  private errorCallbacks: VoiceRecognitionErrorCallback[] = [];

  constructor() {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech Recognition API not supported');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.recognition) return;

    // Start listening
    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('Voice recognition started');
    };

    // Handle results
    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        const isFinal = event.results[i].isFinal;

        if (isFinal) {
          this.transcript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }

        // Call registered callbacks
        this.callbacks.forEach(callback => {
          callback({
            transcript: isFinal ? this.transcript : interimTranscript,
            confidence,
            isFinal
          });
        });
      }
    };

    // Handle errors
    this.recognition.onerror = (event: any) => {
      const errorMessage = this.getErrorMessage(event.error);
      console.error('Voice recognition error:', errorMessage);
      this.errorCallbacks.forEach(callback => callback(errorMessage));
    };

    // Stop listening
    this.recognition.onend = () => {
      this.isListening = false;
      console.log('Voice recognition ended');
    };
  }

  private getErrorMessage(error: string): string {
    const errorMessages: { [key: string]: string } = {
      'no-speech': 'No speech detected. Please try again.',
      'audio-capture': 'No microphone found. Ensure it is connected.',
      'network': 'Network error. Please check your connection.',
      'aborted': 'Voice recognition was aborted.',
      'service-not-allowed': 'Speech recognition service is not allowed.',
      'bad-grammar': 'Grammar error in speech recognition.',
      'network-timeout': 'Network timeout. Please try again.'
    };
    return errorMessages[error] || `Unknown error: ${error}`;
  }

  /**
   * Start listening for voice input
   */
  public start(config: VoiceRecognitionConfig = {}) {
    if (!this.recognition) {
      this.errorCallbacks.forEach(cb => cb('Speech Recognition API not supported'));
      return;
    }

    this.transcript = '';
    
    // Configure recognition
    this.recognition.language = config.language || 'en-US';
    this.recognition.continuous = config.continuous || false;
    this.recognition.interimResults = config.interimResults !== false;
    this.recognition.maxAlternatives = config.maxAlternatives || 1;

    this.recognition.start();
  }

  /**
   * Stop listening
   */
  public stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * Abort recognition
   */
  public abort() {
    if (this.recognition) {
      this.recognition.abort();
    }
  }

  /**
   * Get current transcript
   */
  public getTranscript(): string {
    return this.transcript.trim();
  }

  /**
   * Check if currently listening
   */
  public getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Register callback for recognition results
   */
  public onResult(callback: VoiceRecognitionCallback) {
    this.callbacks.push(callback);
  }

  /**
   * Register callback for errors
   */
  public onError(callback: VoiceRecognitionErrorCallback) {
    this.errorCallbacks.push(callback);
  }

  /**
   * Remove callback
   */
  public removeCallback(callback: VoiceRecognitionCallback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  /**
   * Remove error callback
   */
  public removeErrorCallback(callback: VoiceRecognitionErrorCallback) {
    this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Check if Speech Recognition is supported
   */
  public static isSupported(): boolean {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    return !!SpeechRecognition;
  }

  /**
   * Get available languages
   */
  public static getAvailableLanguages(): string[] {
    return [
      'en-US', 'en-GB', 'en-AU',
      'es-ES', 'es-MX',
      'fr-FR',
      'de-DE',
      'it-IT',
      'ja-JP',
      'ko-KR',
      'zh-CN', 'zh-TW',
      'pt-BR',
      'ru-RU',
      'ar-SA',
      'hi-IN'
    ];
  }
}

// Export singleton instance
export const voiceRecognitionService = new VoiceRecognitionService();
export default VoiceRecognitionService;
