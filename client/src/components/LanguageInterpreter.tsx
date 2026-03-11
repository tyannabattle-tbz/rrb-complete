/**
 * LanguageInterpreter — Real-time simultaneous interpretation component
 * 
 * Features:
 * - Live speech-to-text (Web Speech API)
 * - Real-time LLM-powered translation between any two languages
 * - Text-to-speech output in target language
 * - Dual transcript view (original + translated)
 * - Collapsible panel for embedding in conference rooms
 * - ADA accessible with keyboard navigation and ARIA labels
 * - 20 languages including African languages (Swahili, Yoruba, Amharic, Zulu, Hausa, Igbo, Twi, Ga)
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  Globe, Languages, Mic, MicOff, Volume2, VolumeX,
  ChevronDown, ChevronUp, Settings, ArrowRight, Pause,
  Play, Trash2, Download, X, Minimize2, Maximize2, Hand, Scan
} from 'lucide-react';
import SignLanguageAvatar from './SignLanguageAvatar';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '\u{1F1FA}\u{1F1F8}', speechCode: 'en-US' },
  { code: 'es', name: 'Spanish', flag: '\u{1F1EA}\u{1F1F8}', speechCode: 'es-ES' },
  { code: 'fr', name: 'French', flag: '\u{1F1EB}\u{1F1F7}', speechCode: 'fr-FR' },
  { code: 'de', name: 'German', flag: '\u{1F1E9}\u{1F1EA}', speechCode: 'de-DE' },
  { code: 'it', name: 'Italian', flag: '\u{1F1EE}\u{1F1F9}', speechCode: 'it-IT' },
  { code: 'pt', name: 'Portuguese', flag: '\u{1F1E7}\u{1F1F7}', speechCode: 'pt-BR' },
  { code: 'ru', name: 'Russian', flag: '\u{1F1F7}\u{1F1FA}', speechCode: 'ru-RU' },
  { code: 'zh', name: 'Chinese', flag: '\u{1F1E8}\u{1F1F3}', speechCode: 'zh-CN' },
  { code: 'ja', name: 'Japanese', flag: '\u{1F1EF}\u{1F1F5}', speechCode: 'ja-JP' },
  { code: 'ko', name: 'Korean', flag: '\u{1F1F0}\u{1F1F7}', speechCode: 'ko-KR' },
  { code: 'ar', name: 'Arabic', flag: '\u{1F1F8}\u{1F1E6}', speechCode: 'ar-SA' },
  { code: 'hi', name: 'Hindi', flag: '\u{1F1EE}\u{1F1F3}', speechCode: 'hi-IN' },
  { code: 'sw', name: 'Swahili', flag: '\u{1F1F0}\u{1F1EA}', speechCode: 'sw-KE' },
  { code: 'yo', name: 'Yoruba', flag: '\u{1F1F3}\u{1F1EC}', speechCode: 'yo-NG' },
  { code: 'am', name: 'Amharic', flag: '\u{1F1EA}\u{1F1F9}', speechCode: 'am-ET' },
  { code: 'zu', name: 'Zulu', flag: '\u{1F1FF}\u{1F1E6}', speechCode: 'zu-ZA' },
  { code: 'ha', name: 'Hausa', flag: '\u{1F1F3}\u{1F1EC}', speechCode: 'ha-NG' },
  { code: 'ig', name: 'Igbo', flag: '\u{1F1F3}\u{1F1EC}', speechCode: 'ig-NG' },
  { code: 'tw', name: 'Twi', flag: '\u{1F1EC}\u{1F1ED}', speechCode: 'ak-GH' },
  { code: 'ga', name: 'Ga', flag: '\u{1F1EC}\u{1F1ED}', speechCode: 'gaa-GH' },
];

interface TranscriptEntry {
  id: string;
  timestamp: Date;
  original: string;
  translated: string;
  sourceLang: string;
  targetLang: string;
}

interface LanguageInterpreterProps {
  /** Embed mode: 'panel' for side panel, 'overlay' for floating overlay, 'full' for full page */
  mode?: 'panel' | 'overlay' | 'full';
  /** Default source language code */
  defaultSourceLang?: string;
  /** Default target language code */
  defaultTargetLang?: string;
  /** Whether to auto-start listening */
  autoStart?: boolean;
  /** Callback when panel is closed */
  onClose?: () => void;
  /** Context label (e.g., conference name) */
  contextLabel?: string;
  /** Enable sign language avatar */
  enableSignLanguage?: boolean;
  /** Enable closed captions output callback */
  onCaptionUpdate?: (caption: { original: string; translated: string; sourceLang: string; targetLang: string }) => void;
}

export default function LanguageInterpreter({
  mode = 'overlay',
  defaultSourceLang = 'en',
  defaultTargetLang = 'es',
  autoStart = false,
  onClose,
  contextLabel,
  enableSignLanguage = false,
  onCaptionUpdate,
}: LanguageInterpreterProps) {
  const [sourceLang, setSourceLang] = useState(defaultSourceLang);
  const [targetLang, setTargetLang] = useState(defaultTargetLang);
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [interimText, setInterimText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  const [autoDetect, setAutoDetect] = useState(false);
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [showSignLanguage, setShowSignLanguage] = useState(enableSignLanguage);
  const [latestTranslation, setLatestTranslation] = useState('');

  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const translateMutation = trpc.interpreter.translate.useMutation();

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Auto-start if requested
  useEffect(() => {
    if (autoStart && !isListening) {
      startListening();
    }
    return () => { stopListening(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    const srcLang = LANGUAGES.find(l => l.code === sourceLang);
    recognition.lang = srcLang?.speechCode || 'en-US';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const text = result[0].transcript.trim();
          if (text) {
            // Auto-detect: check if the recognition detected a different language
            if (autoDetect && result[0].confidence > 0) {
              // Use the recognition's detected language if available
              const detLang = (event as any).results?.[i]?.language;
              if (detLang) {
                const matchedLang = LANGUAGES.find(l => l.speechCode.startsWith(detLang.split('-')[0]));
                if (matchedLang && matchedLang.code !== sourceLang) {
                  setDetectedLang(matchedLang.code);
                  setSourceLang(matchedLang.code);
                  toast.info(`Auto-detected: ${matchedLang.name} ${matchedLang.flag}`);
                }
              }
            }
            handleTranslate(text);
          }
          setInterimText('');
        } else {
          interim += result[0].transcript;
        }
      }
      if (interim) setInterimText(interim);
    };

    recognition.onerror = (event: any) => {
      console.error('[Interpreter] Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please allow microphone permissions.');
        setIsListening(false);
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        toast.error(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      // Auto-restart if still supposed to be listening
      if (recognitionRef.current && isListening) {
        try { recognition.start(); } catch { /* ignore */ }
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
      toast.success(`Interpreter active: ${srcLang?.name || 'Unknown'} → ${LANGUAGES.find(l => l.code === targetLang)?.name || 'Unknown'}`);
    } catch (err) {
      toast.error('Failed to start speech recognition');
    }
  }, [sourceLang, targetLang, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // Prevent auto-restart
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText('');
  }, []);

  const handleTranslate = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setIsTranslating(true);

    try {
      const result = await translateMutation.mutateAsync({
        text,
        sourceLang,
        targetLang,
      });

      const entry: TranscriptEntry = {
        id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date(),
        original: text,
        translated: result.translatedText,
        sourceLang,
        targetLang,
      };

      setTranscript(prev => [...prev, entry]);
      setLatestTranslation(result.translatedText);

      // Send caption update for closed captions overlay
      if (onCaptionUpdate) {
        onCaptionUpdate({
          original: text,
          translated: result.translatedText,
          sourceLang,
          targetLang,
        });
      }

      // Auto-detect language from LLM response
      if (autoDetect && result.detectedLanguage) {
        const matchedLang = LANGUAGES.find(l => l.code === result.detectedLanguage);
        if (matchedLang && matchedLang.code !== sourceLang) {
          setDetectedLang(matchedLang.code);
          toast.info(`Language detected: ${matchedLang.name} ${matchedLang.flag}`);
        }
      }

      // Auto-speak the translation
      if (autoSpeak && result.translatedText) {
        speakText(result.translatedText, targetLang);
      }
    } catch (err) {
      console.error('[Interpreter] Translation failed:', err);
      // Still add the original text to transcript
      setTranscript(prev => [...prev, {
        id: `t-${Date.now()}`,
        timestamp: new Date(),
        original: text,
        translated: '[Translation failed]',
        sourceLang,
        targetLang,
      }]);
    } finally {
      setIsTranslating(false);
    }
  }, [sourceLang, targetLang, autoSpeak, translateMutation]);

  const speakText = useCallback((text: string, lang: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langInfo = LANGUAGES.find(l => l.code === lang);
    utterance.lang = langInfo?.speechCode || 'en-US';
    utterance.rate = speechRate;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [speechRate]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript([]);
    toast.success('Transcript cleared');
  }, []);

  const exportTranscript = useCallback(() => {
    const lines = transcript.map(e =>
      `[${e.timestamp.toLocaleTimeString()}] (${e.sourceLang}→${e.targetLang})\nOriginal: ${e.original}\nTranslated: ${e.translated}\n`
    ).join('\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interpreter-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Transcript exported');
  }, [transcript]);

  const swapLanguages = useCallback(() => {
    const wasListening = isListening;
    if (wasListening) stopListening();
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    if (wasListening) {
      setTimeout(() => startListening(), 300);
    }
  }, [sourceLang, targetLang, isListening, stopListening, startListening]);

  const srcLangInfo = LANGUAGES.find(l => l.code === sourceLang);
  const tgtLangInfo = LANGUAGES.find(l => l.code === targetLang);

  // ─── Language Picker Dropdown ───
  const LanguagePicker = ({ value, onChange, onClose: closePicker, label }: {
    value: string; onChange: (code: string) => void; onClose: () => void; label: string;
  }) => (
    <div className="absolute top-full left-0 mt-1 z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-2 w-64 max-h-72 overflow-y-auto" role="listbox" aria-label={label}>
      <div className="grid grid-cols-2 gap-1">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => { onChange(lang.code); closePicker(); }}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-all ${
              value === lang.code
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-white/70 hover:bg-white/10'
            }`}
            role="option"
            aria-selected={value === lang.code}
          >
            <span>{lang.flag}</span>
            <span className="truncate">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // ─── Minimized View ───
  if (isMinimized) {
    return (
      <div className={`${mode === 'overlay' ? 'fixed bottom-4 right-4 z-50' : ''}`}>
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-cyan-600 text-white shadow-lg hover:bg-cyan-700 transition-all"
          aria-label="Expand interpreter"
        >
          <Languages className="w-4 h-4" />
          <span className="text-xs font-medium">Interpreter</span>
          {isListening && <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
          {isTranslating && <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />}
          <Maximize2 className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // ─── Container Classes ───
  const containerClass = mode === 'overlay'
    ? 'fixed bottom-4 right-4 z-50 w-[380px] max-h-[600px] flex flex-col bg-gray-950/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl'
    : mode === 'panel'
    ? 'w-full h-full flex flex-col bg-gray-950/95 border-l border-gray-700/50'
    : 'w-full min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-cyan-950/10 to-gray-950';

  return (
    <div className={containerClass} role="region" aria-label="Language Interpreter">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700/50 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center">
            <Languages className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold">Live Interpreter</h3>
            {contextLabel && <p className="text-white/40 text-[10px]">{contextLabel}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isListening && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live
            </span>
          )}
          <button onClick={() => setShowSettings(!showSettings)} className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white" aria-label="Settings">
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setIsMinimized(true)} className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white" aria-label="Minimize">
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white" aria-label="Close interpreter">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Language Selector Bar ── */}
      <div className="flex items-center justify-center gap-2 px-3 py-2 border-b border-gray-800/50 shrink-0">
        <div className="relative">
          <button
            onClick={() => { setShowSourcePicker(!showSourcePicker); setShowTargetPicker(false); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 text-sm text-white transition-all"
            aria-label={`Source language: ${srcLangInfo?.name}`}
          >
            <span>{srcLangInfo?.flag}</span>
            <span className="text-xs font-medium">{srcLangInfo?.name}</span>
            <ChevronDown className="w-3 h-3 text-white/40" />
          </button>
          {showSourcePicker && (
            <LanguagePicker
              value={sourceLang}
              onChange={(code) => {
                const wasListening = isListening;
                if (wasListening) stopListening();
                setSourceLang(code);
                if (wasListening) setTimeout(() => startListening(), 300);
              }}
              onClose={() => setShowSourcePicker(false)}
              label="Select source language"
            />
          )}
        </div>

        <button
          onClick={swapLanguages}
          className="p-1.5 rounded-full bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all"
          aria-label="Swap languages"
          title="Swap languages"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <div className="relative">
          <button
            onClick={() => { setShowTargetPicker(!showTargetPicker); setShowSourcePicker(false); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 text-sm text-white transition-all"
            aria-label={`Target language: ${tgtLangInfo?.name}`}
          >
            <span>{tgtLangInfo?.flag}</span>
            <span className="text-xs font-medium">{tgtLangInfo?.name}</span>
            <ChevronDown className="w-3 h-3 text-white/40" />
          </button>
          {showTargetPicker && (
            <LanguagePicker
              value={targetLang}
              onChange={setTargetLang}
              onClose={() => setShowTargetPicker(false)}
              label="Select target language"
            />
          )}
        </div>
      </div>

      {/* ── Settings Panel ── */}
      {showSettings && (
        <div className="px-3 py-2 border-b border-gray-800/50 space-y-2 shrink-0 bg-gray-900/50">
          <div className="flex items-center justify-between">
            <label className="text-white/60 text-xs">Auto-speak translations</label>
            <button
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`w-8 h-4 rounded-full transition-all ${autoSpeak ? 'bg-cyan-500' : 'bg-gray-600'}`}
              role="switch"
              aria-checked={autoSpeak}
              aria-label="Toggle auto-speak"
            >
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${autoSpeak ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div>
            <label className="text-white/60 text-xs block mb-1">Speech Rate: {speechRate.toFixed(1)}x</label>
            <input
              type="range" min="0.5" max="2.0" step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 h-1"
              aria-label="Adjust speech rate"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-white/60 text-xs flex items-center gap-1.5">
              <Scan className="w-3 h-3" /> Auto-detect language
            </label>
            <button
              onClick={() => setAutoDetect(!autoDetect)}
              className={`w-8 h-4 rounded-full transition-all ${autoDetect ? 'bg-green-500' : 'bg-gray-600'}`}
              role="switch"
              aria-checked={autoDetect}
              aria-label="Toggle auto-detect language"
            >
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${autoDetect ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
          {autoDetect && detectedLang && (
            <p className="text-green-400/70 text-[10px] flex items-center gap-1">
              <Scan className="w-2.5 h-2.5" />
              Detected: {LANGUAGES.find(l => l.code === detectedLang)?.name} {LANGUAGES.find(l => l.code === detectedLang)?.flag}
            </p>
          )}
          <div className="flex items-center justify-between">
            <label className="text-white/60 text-xs flex items-center gap-1.5">
              <Hand className="w-3 h-3" /> Sign language avatar
            </label>
            <button
              onClick={() => setShowSignLanguage(!showSignLanguage)}
              className={`w-8 h-4 rounded-full transition-all ${showSignLanguage ? 'bg-indigo-500' : 'bg-gray-600'}`}
              role="switch"
              aria-checked={showSignLanguage}
              aria-label="Toggle sign language avatar"
            >
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${showSignLanguage ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <p className="text-white/30 text-[10px]">
            {LANGUAGES.length} languages supported including African languages (Swahili, Yoruba, Amharic, Zulu, Hausa, Igbo, Twi, Ga).
            Designed for inclusive multilingual participation.
          </p>
        </div>
      )}

      {/* ── Controls ── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-800/50 shrink-0">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-cyan-600 hover:bg-cyan-700 text-white'
          }`}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {isListening ? 'Stop' : 'Start Interpreter'}
        </button>

        {isSpeaking ? (
          <button onClick={stopSpeaking} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30" aria-label="Stop speaking">
            <VolumeX className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              const last = transcript[transcript.length - 1];
              if (last) speakText(last.translated, last.targetLang);
            }}
            disabled={transcript.length === 0}
            className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-30"
            aria-label="Replay last translation"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        )}

        <button onClick={clearTranscript} disabled={transcript.length === 0} className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-30" aria-label="Clear transcript">
          <Trash2 className="w-4 h-4" />
        </button>
        <button onClick={exportTranscript} disabled={transcript.length === 0} className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-30" aria-label="Export transcript">
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* ── Interim Text (what's being spoken right now) ── */}
      {interimText && (
        <div className="px-3 py-1.5 bg-yellow-500/10 border-b border-yellow-500/20 shrink-0">
          <p className="text-yellow-300/80 text-xs italic flex items-center gap-1.5">
            <Mic className="w-3 h-3 animate-pulse" />
            {interimText}
          </p>
        </div>
      )}

      {/* ── Translation in progress ── */}
      {isTranslating && (
        <div className="px-3 py-1 bg-cyan-500/10 border-b border-cyan-500/20 shrink-0">
          <p className="text-cyan-300/80 text-[10px] flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Translating...
          </p>
        </div>
      )}

      {/* ── Transcript ── */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0">
        {transcript.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Globe className="w-10 h-10 text-cyan-400/20 mb-3" />
            <p className="text-white/40 text-sm">Ready to interpret</p>
            <p className="text-white/20 text-xs mt-1">
              Select languages above and click "Start Interpreter"
            </p>
            <p className="text-white/15 text-[10px] mt-3">
              Supports {LANGUAGES.length} languages including Swahili, Yoruba, Amharic, Zulu, Hausa, Igbo, Twi, and Ga
            </p>
          </div>
        ) : (
          transcript.map((entry) => (
            <div
              key={entry.id}
              className="rounded-lg bg-white/5 border border-white/5 p-2.5 space-y-1.5 hover:border-cyan-500/20 transition-all"
            >
              {/* Timestamp */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/30">
                  {entry.timestamp.toLocaleTimeString()}
                </span>
                <span className="text-[10px] text-white/30">
                  {LANGUAGES.find(l => l.code === entry.sourceLang)?.flag} → {LANGUAGES.find(l => l.code === entry.targetLang)?.flag}
                </span>
              </div>

              {/* Original */}
              <div
                className="text-white/60 text-xs cursor-pointer hover:text-white/80"
                onClick={() => speakText(entry.original, entry.sourceLang)}
                role="button"
                aria-label={`Click to hear original: ${entry.original}`}
              >
                <span className="text-white/30 text-[10px] mr-1">[{LANGUAGES.find(l => l.code === entry.sourceLang)?.name}]</span>
                {entry.original}
              </div>

              {/* Translated */}
              <div
                className="text-cyan-300 text-sm font-medium cursor-pointer hover:text-cyan-200"
                onClick={() => speakText(entry.translated, entry.targetLang)}
                role="button"
                aria-label={`Click to hear translation: ${entry.translated}`}
              >
                <span className="text-cyan-400/40 text-[10px] mr-1">[{LANGUAGES.find(l => l.code === entry.targetLang)?.name}]</span>
                {entry.translated}
              </div>
            </div>
          ))
        )}
        <div ref={transcriptEndRef} />
      </div>

      {/* ── Footer ── */}
      <div className="px-3 py-1.5 border-t border-gray-800/50 shrink-0">
        <div className="flex items-center justify-between">
          <p className="text-white/20 text-[10px]">
            QUMUS Interpreter | {LANGUAGES.length} Languages | ADA Accessible
          </p>
          <div className="flex items-center gap-1.5">
            {autoDetect && <span className="text-green-400/50 text-[10px]">Auto</span>}
            {showSignLanguage && <Hand className="w-2.5 h-2.5 text-indigo-400/50" />}
            {isListening && <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
            <span className="text-white/20 text-[10px]">
              {transcript.length} entries
            </span>
          </div>
        </div>
      </div>

      {/* ── Sign Language Avatar ── */}
      <SignLanguageAvatar
        text={latestTranslation}
        isActive={showSignLanguage && isListening}
        onClose={() => setShowSignLanguage(false)}
        position="bottom-left"
        size="medium"
      />
    </div>
  );
}
