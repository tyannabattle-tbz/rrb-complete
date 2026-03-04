import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX, Send, Settings, Loader } from "lucide-react";
import { toast } from "sonner";
import { voiceRecognitionService } from "@/services/voiceRecognition";
import { textToSpeechService } from "@/services/textToSpeech";

interface VoiceChatProps {
  onSendMessage?: (message: string) => void;
  onVoiceInput?: (transcript: string) => void;
}

interface VoiceMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

// Re-export services for external use
export { voiceRecognitionService, textToSpeechService };

export default function VoiceChat({ onSendMessage, onVoiceInput }: VoiceChatProps) {
  // Initialize enhanced voice services
  useEffect(() => {
    // Verify services are available
    if (voiceRecognitionService) {
      console.log('Voice Recognition Service initialized');
    }
    if (textToSpeechService) {
      console.log('Text-to-Speech Service initialized');
    }
  }, []);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [language, setLanguage] = useState('en-US');
  const [showSettings, setShowSettings] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        toast.info("Listening...");
      };

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptSegment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript((prev) => prev + transcriptSegment + " ");
            onVoiceInput?.(transcriptSegment);
            // Add to messages
            const userMsg: VoiceMessage = {
              id: Date.now().toString(),
              text: transcriptSegment,
              sender: 'user',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, userMsg]);
          } else {
            interimTranscript += transcriptSegment;
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        toast.error(`Voice error: ${event.error}`);
        setIsListening(false);
        // Add error message to chat
        const errorMsg: VoiceMessage = {
          id: Date.now().toString(),
          text: `Error: ${event.error}`,
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMsg]);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [onVoiceInput]);

  // Start listening
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript("");
      recognitionRef.current.start();
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Text to Speech
  const speakText = (text: string) => {
    if (!voiceEnabled) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    utterance.volume = 1;
    utterance.lang = language;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      toast.error("Failed to play audio");
    };

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    toast.info('Audio stopped');
  };

  // Send voice message
  const sendVoiceMessage = () => {
    if (transcript.trim()) {
      onSendMessage?.(transcript.trim());
      setTranscript("");
      toast.success("Message sent");
      // Add assistant response
      setTimeout(() => {
        const assistantMsg: VoiceMessage = {
          id: (Date.now() + 1).toString(),
          text: `Processing your request: "${transcript.trim()}"`,
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMsg]);
        if (voiceEnabled) {
          speakText(assistantMsg.text);
        }
      }, 500);
    } else {
      toast.error("No message to send");
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500 h-full flex flex-col">
      <div className="space-y-4 flex-1 flex flex-col">
        {/* Settings */}
        {showSettings && (
          <div className="p-3 bg-slate-800 rounded-lg border border-purple-500 space-y-3">
            <div>
              <label className="text-sm text-purple-200">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full mt-1 px-2 py-1 bg-slate-700 border border-purple-500 text-white rounded text-sm"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
                <option value="ja-JP">Japanese</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-purple-200">Speech Rate: {speechRate.toFixed(1)}x</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-purple-200">Pitch: {speechPitch.toFixed(1)}</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speechPitch}
                onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                className="w-full mt-1"
              />
            </div>
          </div>
        )}

      {/* Voice Controls */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "default"}
            className="gap-2 flex-1"
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Start Voice Input
              </>
            )}
          </Button>

          <Button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            variant={voiceEnabled ? "default" : "outline"}
            className="gap-2"
          >
            {voiceEnabled ? (
              <>
                <Volume2 className="w-4 h-4" />
                Audio On
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                Audio Off
              </>
            )}
          </Button>

          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            className="gap-2 border-purple-500 text-purple-200"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages Display */}
        {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto space-y-2 p-3 bg-slate-800 rounded-lg border border-purple-500/30 mb-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  msg.sender === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-purple-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Transcript Display */}
        {transcript && (
          <div className="p-3 bg-slate-700 rounded-lg border border-purple-500">
            <p className="text-sm font-medium text-purple-200 mb-1">Current Input:</p>
            <p className="text-white italic">{transcript}</p>
          </div>
        )}

        {/* Listening Indicator */}
        {isListening && (
          <div className="flex items-center gap-2 p-3 bg-green-500/20 rounded-lg border border-green-500">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            </div>
            <span className="text-sm font-medium text-green-400">Listening...</span>
          </div>
        )}

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="flex items-center gap-2 p-3 bg-blue-500/20 rounded-lg border border-blue-500">
            <Loader className="w-4 h-4 text-blue-400 animate-spin" />
            <span className="text-sm font-medium text-blue-400">Playing audio...</span>
            <Button
              onClick={stopSpeaking}
              variant="ghost"
              size="sm"
              className="ml-auto text-blue-400 hover:text-blue-300"
            >
              Stop
            </Button>
          </div>
        )}

        {/* Send Button */}
        {transcript && (
          <Button
            onClick={sendVoiceMessage}
            className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Send className="w-4 h-4" />
            Send Voice Message
          </Button>
        )}
      </div>
    </Card>
  );
}
