import { useEffect, useRef, useState, useCallback } from 'react';

export interface VoiceCommand {
  command: string;
  confidence: number;
  timestamp: number;
}

export interface VoiceCommandHandlers {
  onPlay?: () => void;
  onPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onVolumeUp?: () => void;
  onVolumeDown?: () => void;
  onMute?: () => void;
  onUnmute?: () => void;
  onSearch?: (query: string) => void;
  onCustomCommand?: (command: string) => void;
}

const VOICE_COMMANDS: Record<string, keyof VoiceCommandHandlers> = {
  'play': 'onPlay',
  'pause': 'onPause',
  'next': 'onNext',
  'next track': 'onNext',
  'skip': 'onNext',
  'previous': 'onPrevious',
  'prev': 'onPrevious',
  'back': 'onPrevious',
  'volume up': 'onVolumeUp',
  'louder': 'onVolumeUp',
  'volume down': 'onVolumeDown',
  'quieter': 'onVolumeDown',
  'mute': 'onMute',
  'unmute': 'onUnmute',
};

const CONFIDENCE_THRESHOLD = 0.7;

export function useVoiceCommands(handlers: VoiceCommandHandlers) {
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech Recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.language = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(interimTranscript || finalTranscript);

      // Process final transcript
      if (finalTranscript) {
        processVoiceCommand(finalTranscript.toLowerCase().trim(), handlers);
      }
    };

    recognition.onerror = (event: any) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [handlers]);

  const processVoiceCommand = useCallback((text: string, handlers: VoiceCommandHandlers) => {
    // Check for exact command matches
    for (const [command, handler] of Object.entries(VOICE_COMMANDS)) {
      if (text.includes(command)) {
        const handlerFn = handlers[handler];
        if (handlerFn) {
          handlerFn();
          setLastCommand({
            command,
            confidence: 0.95,
            timestamp: Date.now(),
          });
          return;
        }
      }
    }

    // Check for search queries
    if (text.includes('search') || text.includes('find')) {
      const query = text.replace(/search|find/gi, '').trim();
      if (query && handlers.onSearch) {
        handlers.onSearch(query);
        setLastCommand({
          command: `search: ${query}`,
          confidence: 0.85,
          timestamp: Date.now(),
        });
        return;
      }
    }

    // Custom command handler
    if (handlers.onCustomCommand) {
      handlers.onCustomCommand(text);
      setLastCommand({
        command: text,
        confidence: 0.7,
        timestamp: Date.now(),
      });
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    transcript,
    error,
    lastCommand,
    startListening,
    stopListening,
    toggleListening,
  };
}
