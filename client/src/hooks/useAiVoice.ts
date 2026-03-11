/**
 * useAiVoice Hook
 * 
 * React hook that provides AI voice TTS functionality for chat components.
 * Auto-speaks AI responses with the correct voice profile for each persona.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { aiVoiceTts, type AiPersona } from '@/services/aiVoiceTts';

interface UseAiVoiceOptions {
  /** Which AI persona to use for voice */
  persona?: AiPersona;
  /** Whether voice is enabled by default */
  defaultEnabled?: boolean;
  /** Auto-speak new messages */
  autoSpeak?: boolean;
}

interface UseAiVoiceReturn {
  /** Whether TTS is currently enabled */
  voiceEnabled: boolean;
  /** Toggle voice on/off */
  toggleVoice: () => void;
  /** Set voice enabled state */
  setVoiceEnabled: (enabled: boolean) => void;
  /** Whether currently speaking */
  isSpeaking: boolean;
  /** Which persona is currently speaking */
  currentSpeaker: AiPersona | null;
  /** Speak text with the configured persona */
  speak: (text: string, persona?: AiPersona) => void;
  /** Stop all speech */
  stop: () => void;
  /** Speak an AI response (auto-detects persona from text or uses configured) */
  speakAiResponse: (text: string, persona?: AiPersona) => void;
}

export function useAiVoice(options: UseAiVoiceOptions = {}): UseAiVoiceReturn {
  const {
    persona = 'valanna',
    defaultEnabled = true,
    autoSpeak = true,
  } = options;

  const [voiceEnabled, setVoiceEnabled] = useState(defaultEnabled);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<AiPersona | null>(null);
  const lastSpokenRef = useRef<string>('');

  useEffect(() => {
    aiVoiceTts.setEnabled(voiceEnabled);
  }, [voiceEnabled]);

  useEffect(() => {
    const onStart = (p: AiPersona) => {
      setIsSpeaking(true);
      setCurrentSpeaker(p);
    };
    const onEnd = () => {
      setIsSpeaking(false);
      setCurrentSpeaker(null);
    };

    aiVoiceTts.onStart(onStart);
    aiVoiceTts.onEnd(onEnd);

    return () => {
      aiVoiceTts.removeOnStart(onStart);
      aiVoiceTts.removeOnEnd(onEnd);
    };
  }, []);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled(prev => {
      const next = !prev;
      aiVoiceTts.setEnabled(next);
      if (!next) aiVoiceTts.stop();
      return next;
    });
  }, []);

  const speak = useCallback((text: string, overridePersona?: AiPersona) => {
    if (!voiceEnabled) return;
    const p = overridePersona || persona;
    aiVoiceTts.speakBrowser(text, p);
  }, [voiceEnabled, persona]);

  const stop = useCallback(() => {
    aiVoiceTts.stop();
  }, []);

  const speakAiResponse = useCallback((text: string, overridePersona?: AiPersona) => {
    if (!voiceEnabled || !autoSpeak) return;
    // Avoid speaking the same text twice
    if (text === lastSpokenRef.current) return;
    lastSpokenRef.current = text;

    const p = overridePersona || persona;
    
    // Truncate very long responses to first 500 chars for TTS
    const speakText = text.length > 500 ? text.slice(0, 500) + '...' : text;
    aiVoiceTts.speakBrowser(speakText, p);
  }, [voiceEnabled, autoSpeak, persona]);

  return {
    voiceEnabled,
    toggleVoice,
    setVoiceEnabled,
    isSpeaking,
    currentSpeaker,
    speak,
    stop,
    speakAiResponse,
  };
}
