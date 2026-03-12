import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Earth, Languages, Mic, MicOff, Volume2, VolumeX, Settings, Check } from "lucide-react";

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '\ud83c\uddfa\ud83c\uddf8' },
  { code: 'es', name: 'Spanish', flag: '\ud83c\uddea\ud83c\uddf8' },
  { code: 'fr', name: 'French', flag: '\ud83c\uddeb\ud83c\uddf7' },
  { code: 'de', name: 'German', flag: '\ud83c\udde9\ud83c\uddea' },
  { code: 'it', name: 'Italian', flag: '\ud83c\uddee\ud83c\uddf9' },
  { code: 'pt', name: 'Portuguese', flag: '\ud83c\udde7\ud83c\uddf7' },
  { code: 'ru', name: 'Russian', flag: '\ud83c\uddf7\ud83c\uddfa' },
  { code: 'zh', name: 'Chinese', flag: '\ud83c\udde8\ud83c\uddf3' },
  { code: 'ja', name: 'Japanese', flag: '\ud83c\uddef\ud83c\uddf5' },
  { code: 'ko', name: 'Korean', flag: '\ud83c\uddf0\ud83c\uddf7' },
  { code: 'ar', name: 'Arabic', flag: '\ud83c\uddf8\ud83c\udde6' },
  { code: 'hi', name: 'Hindi', flag: '\ud83c\uddee\ud83c\uddf3' },
  { code: 'sw', name: 'Swahili', flag: '\ud83c\uddf0\ud83c\uddea' },
  { code: 'yo', name: 'Yoruba', flag: '\ud83c\uddf3\ud83c\uddec' },
  { code: 'am', name: 'Amharic', flag: '\ud83c\uddea\ud83c\uddf9' },
  { code: 'zu', name: 'Zulu', flag: '\ud83c\uddff\ud83c\udde6' },
];

export default function ConferenceTranslation() {
  const params = useParams<{ id: string }>();
  const conferenceId = parseInt(params.id || "0");
  const { toast } = useToast();
  const [selectedLang, setSelectedLang] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const { data: translationConfig } = trpc.conference.getTranslationConfig.useQuery({ conferenceId });
  const { data: conference } = trpc.conference.getConference.useQuery({ id: conferenceId });

  const enableMutation = trpc.conference.enableTranslation.useMutation({
    onSuccess: () => {
      toast({ title: "Translation Enabled", description: `Multi-language translation activated for this conference` });
    },
  });

  // Scroll to bottom of transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [transcript]);

  // Speech Recognition
  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Not Supported", description: "Speech recognition is not supported in this browser", variant: "destructive" });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLang;

    recognition.onresult = (event: any) => {
      const results = Array.from(event.results);
      const latestResult = results[results.length - 1] as any;
      if (latestResult.isFinal) {
        const text = latestResult[0].transcript;
        setTranscript(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${text}`]);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start(); // Auto-restart
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    toast({ title: "Listening", description: `Speech recognition active in ${SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.name}` });
  }, [selectedLang, isListening, toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Text-to-Speech
  const speakText = useCallback((text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLang;
    utterance.rate = speechRate;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [selectedLang, speechRate]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/20 to-gray-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/conference/room/${conferenceId}`}>
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Conference
              </Button>
            </Link>
            <div className="h-4 w-px bg-white/20" />
            <h1 className="text-lg font-semibold text-white flex items-center gap-2">
              <Languages className="w-5 h-5 text-blue-400" />
              Live Translation
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="text-white/60 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Conference Info */}
        {conference && (
          <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <h2 className="text-white font-semibold">{conference.title}</h2>
            <p className="text-white/40 text-sm">{conference.description || 'Live conference with multi-language translation'}</p>
          </div>
        )}

        {/* Language Selector */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Earth className="w-5 h-5 text-blue-400" />
              Select Language ({SUPPORTED_LANGUAGES.length} Available)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {SUPPORTED_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLang(lang.code);
                    if (isListening) {
                      stopListening();
                      setTimeout(() => startListening(), 300);
                    }
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all ${
                    selectedLang === lang.code
                      ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400'
                      : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                  aria-label={`Select ${lang.name} language`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="truncate w-full text-center">{lang.name}</span>
                  {selectedLang === lang.code && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings Panel */}
        {showSettings && (
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-3">Translation Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-white/60 text-sm block mb-1">Speech Rate: {speechRate.toFixed(1)}x</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full accent-blue-500"
                    aria-label="Adjust speech rate"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => enableMutation.mutate({
                      conferenceId,
                      languages: SUPPORTED_LANGUAGES.map(l => l.code),
                    })}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={enableMutation.isPending}
                  >
                    Enable All Languages
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            onClick={isListening ? stopListening : startListening}
            className={`${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
            size="lg"
          >
            {isListening ? <MicOff className="w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </Button>

          {transcript.length > 0 && (
            <Button
              onClick={() => isSpeaking ? stopSpeaking() : speakText(transcript[transcript.length - 1]?.replace(/\[.*?\]\s*/, '') || '')}
              variant="outline"
              size="lg"
              className={`border-blue-500 ${isSpeaking ? 'text-red-400 border-red-500' : 'text-blue-400'}`}
            >
              {isSpeaking ? <VolumeX className="w-5 h-5 mr-2" /> : <Volume2 className="w-5 h-5 mr-2" />}
              {isSpeaking ? 'Stop Speaking' : 'Read Aloud'}
            </Button>
          )}

          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-lg">{currentLang?.flag}</span>
            <span className="text-white text-sm font-medium">{currentLang?.name}</span>
            {isListening && <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
          </div>
        </div>

        {/* Live Transcript */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Languages className="w-5 h-5 text-blue-400" />
              Live Transcript
              {isListening && (
                <span className="ml-2 px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Recording
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[200px] max-h-[400px] overflow-y-auto space-y-2 p-4 rounded-lg bg-black/30">
              {transcript.length === 0 ? (
                <div className="text-center py-12">
                  <Languages className="w-12 h-12 text-blue-400/20 mx-auto mb-3" />
                  <p className="text-white/40">Click "Start Listening" to begin real-time translation</p>
                  <p className="text-white/20 text-sm mt-1">Select your preferred language above</p>
                </div>
              ) : (
                transcript.map((line, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-white/5 text-white/80 text-sm cursor-pointer hover:bg-white/10"
                    onClick={() => speakText(line.replace(/\[.*?\]\s*/, ''))}
                    role="button"
                    aria-label={`Click to read aloud: ${line}`}
                  >
                    {line}
                  </div>
                ))
              )}
              <div ref={transcriptEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Notice */}
        <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <Earth className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-blue-400 font-semibold text-sm">Accessibility & Inclusion</h3>
              <p className="text-blue-300/60 text-sm mt-1">
                This translation system supports 16 languages including African languages (Swahili, Yoruba, Amharic, Zulu) 
                to ensure inclusive participation at the UN CSW70 world stage. Click any transcript line to hear it read aloud.
                Designed with the impaired community in mind.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-white/30 text-xs">
            QUMUS Multi-Language Translation | Web Speech API | Canryn Production | A Voice for the Voiceless
          </p>
        </div>
      </div>
    </div>
  );
}
