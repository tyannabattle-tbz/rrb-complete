/**
 * Voice Command Interface for Qumus
 * Handles speech recognition, intent parsing, and command execution
 */

export type VoiceCommandIntent =
  | 'generate_video'
  | 'start_collaboration'
  | 'show_analytics'
  | 'create_preset'
  | 'batch_process'
  | 'show_storyboard'
  | 'export_project'
  | 'create_scene'
  | 'manage_team'
  | 'view_dashboard'
  | 'help'
  | 'unknown';

export interface VoiceCommand {
  intent: VoiceCommandIntent;
  text: string;
  confidence: number;
  parameters: Record<string, string | number | boolean>;
  timestamp: Date;
  audioUrl?: string;
}

export interface VoiceCommandResult {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

export interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  interimTranscript: string;
  lastCommand?: VoiceCommand;
  commandHistory: VoiceCommand[];
  error?: string;
}

// Intent patterns for voice command recognition
const INTENT_PATTERNS: Record<VoiceCommandIntent, RegExp[]> = {
  generate_video: [
    /generate\s+(?:a\s+)?video/i,
    /create\s+(?:a\s+)?video/i,
    /make\s+(?:a\s+)?video/i,
    /start\s+video\s+generation/i,
  ],
  start_collaboration: [
    /start\s+(?:a\s+)?collaboration/i,
    /collaborate/i,
    /invite\s+team/i,
    /share\s+project/i,
  ],
  show_analytics: [
    /show\s+analytics/i,
    /display\s+analytics/i,
    /view\s+analytics/i,
    /analytics/i,
  ],
  create_preset: [
    /create\s+(?:a\s+)?preset/i,
    /save\s+(?:as\s+)?preset/i,
    /new\s+preset/i,
  ],
  batch_process: [
    /batch\s+process/i,
    /process\s+batch/i,
    /queue\s+videos/i,
    /bulk\s+generate/i,
  ],
  show_storyboard: [
    /show\s+storyboard/i,
    /create\s+storyboard/i,
    /generate\s+storyboard/i,
    /view\s+storyboard/i,
  ],
  export_project: [
    /export\s+project/i,
    /download\s+project/i,
    /save\s+project/i,
  ],
  create_scene: [
    /create\s+(?:a\s+)?scene/i,
    /new\s+scene/i,
    /add\s+scene/i,
  ],
  manage_team: [
    /manage\s+team/i,
    /team\s+settings/i,
    /invite\s+member/i,
  ],
  view_dashboard: [
    /show\s+dashboard/i,
    /view\s+dashboard/i,
    /open\s+dashboard/i,
    /dashboard/i,
  ],
  help: [
    /help/i,
    /what\s+can\s+i\s+do/i,
    /show\s+commands/i,
    /voice\s+commands/i,
  ],
  unknown: [],
};

/**
 * Parse voice transcript to identify intent and extract parameters
 */
export function parseVoiceCommand(transcript: string): VoiceCommand {
  const text = transcript.trim();
  let intent: VoiceCommandIntent = 'unknown';
  let confidence = 0;
  const parameters: Record<string, string | number | boolean> = {};

  // Match against intent patterns
  for (const [intentName, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        intent = intentName as VoiceCommandIntent;
        confidence = 0.95; // High confidence for pattern match
        break;
      }
    }
    if (intent !== 'unknown') break;
  }

  // Extract parameters based on intent
  if (intent === 'generate_video') {
    const styleMatch = text.match(/style[:\s]+(\w+)/i);
    const durationMatch = text.match(/(\d+)\s*(?:second|sec|s)/i);
    const effectMatch = text.match(/(?:with|add)\s+(\w+)\s+effect/i);

    if (styleMatch) parameters.style = styleMatch[1];
    if (durationMatch) parameters.duration = parseInt(durationMatch[1]);
    if (effectMatch) parameters.effect = effectMatch[1];
  }

  if (intent === 'batch_process') {
    const countMatch = text.match(/(\d+)\s+videos?/i);
    const qualityMatch = text.match(/quality[:\s]+(\w+)/i);

    if (countMatch) parameters.videoCount = parseInt(countMatch[1]);
    if (qualityMatch) parameters.quality = qualityMatch[1];
  }

  if (intent === 'create_scene') {
    const nameMatch = text.match(/(?:called|named|titled)\s+['""]?([^'""\n]+)['""]?/i);
    if (nameMatch) parameters.sceneName = nameMatch[1];
  }

  return {
    intent,
    text,
    confidence,
    parameters,
    timestamp: new Date(),
  };
}

/**
 * Voice Command Manager - handles speech recognition and execution
 */
export class VoiceCommandManager {
  private recognition: SpeechRecognition | null = null;
  private state: VoiceState = {
    isListening: false,
    isProcessing: false,
    transcript: '',
    interimTranscript: '',
    commandHistory: [],
  };
  private commandHandlers: Map<
    VoiceCommandIntent,
    (cmd: VoiceCommand) => Promise<VoiceCommandResult>
  > = new Map();
  private onStateChange: ((state: VoiceState) => void) | null = null;
  private synthesis: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.setupRecognition();
      }
      this.synthesis = window.speechSynthesis;
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.state.isListening = true;
      this.state.transcript = '';
      this.state.interimTranscript = '';
      this.state.error = undefined;
      this.notifyStateChange();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          this.state.transcript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      this.state.interimTranscript = interimTranscript;
      this.notifyStateChange();
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.state.error = `Speech recognition error: ${event.error}`;
      this.notifyStateChange();
    };

    this.recognition.onend = () => {
      this.state.isListening = false;
      this.notifyStateChange();
    };
  }

  /**
   * Start listening for voice commands
   */
  startListening() {
    if (!this.recognition) {
      this.state.error = 'Speech recognition not supported in this browser';
      this.notifyStateChange();
      return;
    }

    this.state.transcript = '';
    this.state.interimTranscript = '';
    this.recognition.start();
  }

  /**
   * Stop listening for voice commands
   */
  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  /**
   * Register a command handler
   */
  registerHandler(
    intent: VoiceCommandIntent,
    handler: (cmd: VoiceCommand) => Promise<VoiceCommandResult>
  ) {
    this.commandHandlers.set(intent, handler);
  }

  /**
   * Execute a voice command
   */
  async executeCommand(command: VoiceCommand): Promise<VoiceCommandResult> {
    this.state.isProcessing = true;
    this.state.lastCommand = command;
    this.notifyStateChange();

    try {
      const handler = this.commandHandlers.get(command.intent);

      if (!handler) {
        const result: VoiceCommandResult = {
          success: false,
          message: `No handler registered for intent: ${command.intent}`,
          error: 'Handler not found',
        };
        this.state.isProcessing = false;
        this.notifyStateChange();
        return result;
      }

      const result = await handler(command);

      // Add to history
      this.state.commandHistory.push(command);

      // Provide voice feedback
      this.speak(result.message);

      this.state.isProcessing = false;
      this.notifyStateChange();

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const result: VoiceCommandResult = {
        success: false,
        message: `Error executing command: ${errorMessage}`,
        error: errorMessage,
      };

      this.state.isProcessing = false;
      this.notifyStateChange();

      return result;
    }
  }

  /**
   * Process transcript and execute command
   */
  async processTranscript(transcript: string): Promise<VoiceCommandResult> {
    const command = parseVoiceCommand(transcript);
    return this.executeCommand(command);
  }

  /**
   * Speak text using text-to-speech
   */
  speak(text: string) {
    if (!this.synthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    this.synthesis.speak(utterance);
  }

  /**
   * Get current state
   */
  getState(): VoiceState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   */
  onStateChangeListener(callback: (state: VoiceState) => void) {
    this.onStateChange = callback;
  }

  private notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange({ ...this.state });
    }
  }

  /**
   * Get command history
   */
  getCommandHistory(): VoiceCommand[] {
    return [...this.state.commandHistory];
  }

  /**
   * Clear command history
   */
  clearHistory() {
    this.state.commandHistory = [];
    this.notifyStateChange();
  }

  /**
   * Check if voice commands are supported
   */
  isSupported(): boolean {
    return this.recognition !== null;
  }
}

// Export singleton instance
export const voiceCommandManager = new VoiceCommandManager();
