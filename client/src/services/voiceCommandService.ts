/**
 * Voice Command Service
 * Handles voice recognition, text-to-speech, and AI persona responses
 */

export interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
}

export interface AIPersona {
  name: string;
  voice: SpeechSynthesisVoice | null;
  tone: 'analytical' | 'creative' | 'aggressive' | 'conservative';
  responsePrefix: string;
}

class VoiceCommandService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private commands: Map<string, VoiceCommand> = new Map();
  private isListening: boolean = false;
  private currentPersona: AIPersona | null = null;
  private personas: Map<string, AIPersona> = new Map();

  constructor() {
    this.initializeSpeechRecognition();
    this.initializeSpeechSynthesis();
    this.initializePersonas();
  }

  private initializeSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };
    }
  }

  private initializeSpeechSynthesis() {
    this.synthesis = window.speechSynthesis;
  }

  private initializePersonas() {
    const personas: Record<string, AIPersona> = {
      analytical: {
        name: 'Analytical',
        voice: null,
        tone: 'analytical',
        responsePrefix: 'Based on the data analysis, '
      },
      creative: {
        name: 'Creative',
        voice: null,
        tone: 'creative',
        responsePrefix: 'Imagine this possibility: '
      },
      aggressive: {
        name: 'Aggressive',
        voice: null,
        tone: 'aggressive',
        responsePrefix: 'Let\'s execute this immediately: '
      },
      conservative: {
        name: 'Conservative',
        voice: null,
        tone: 'conservative',
        responsePrefix: 'Proceeding with caution: '
      }
    };

    Object.entries(personas).forEach(([key, persona]) => {
      this.personas.set(key, persona);
    });

    this.currentPersona = personas.analytical;
  }

  registerCommand(command: string, action: () => void, description: string) {
    this.commands.set(command.toLowerCase(), {
      command,
      action,
      description
    });
  }

  startListening(onResult: (transcript: string) => void) {
    if (!this.recognition) {
      console.error('Speech Recognition not supported');
      return;
    }

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      const lowerTranscript = transcript.toLowerCase();
      onResult(transcript);

      // Check for voice commands
      for (const [commandKey, command] of this.commands) {
        if (lowerTranscript.includes(commandKey)) {
          command.action();
          this.speak(`Executing ${command.description}`);
          break;
        }
      }
    };

    this.recognition.start();
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  speak(text: string) {
    if (!this.synthesis) return;

    this.synthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (this.currentPersona?.voice) {
      utterance.voice = this.currentPersona.voice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    this.synthesis.speak(utterance);
  }

  setPersona(personaName: string) {
    const persona = this.personas.get(personaName);
    if (persona) {
      this.currentPersona = persona;
      this.speak(`Switching to ${persona.name} mode`);
    }
  }

  getPersonas() {
    return Array.from(this.personas.values());
  }

  getCurrentPersona() {
    return this.currentPersona;
  }

  isListeningActive() {
    return this.isListening;
  }
}

export const voiceCommandService = new VoiceCommandService();
