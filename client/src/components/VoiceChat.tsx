import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX, Send } from "lucide-react";
import { toast } from "sonner";

interface VoiceChatProps {
  onSendMessage?: (message: string) => void;
  onVoiceInput?: (transcript: string) => void;
}

export default function VoiceChat({ onSendMessage, onVoiceInput }: VoiceChatProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

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
          } else {
            interimTranscript += transcriptSegment;
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        toast.error(`Voice error: ${event.error}`);
        setIsListening(false);
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

  // Text to Speech
  const speakText = (text: string) => {
    if (!voiceEnabled) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

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
  };

  // Send voice message
  const sendVoiceMessage = () => {
    if (transcript.trim()) {
      onSendMessage?.(transcript.trim());
      setTranscript("");
      toast.success("Message sent");
    } else {
      toast.error("No message to send");
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="space-y-4">
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
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="p-3 bg-white rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-slate-700 mb-1">Your Message:</p>
            <p className="text-slate-900">{transcript}</p>
          </div>
        )}

        {/* Listening Indicator */}
        {isListening && (
          <div className="flex items-center gap-2 p-3 bg-blue-100 rounded-lg">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            </div>
            <span className="text-sm font-medium text-blue-700">Listening...</span>
          </div>
        )}

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="flex items-center gap-2 p-3 bg-green-100 rounded-lg">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0.1s" }} />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
            </div>
            <span className="text-sm font-medium text-green-700">Playing audio...</span>
            <Button
              onClick={stopSpeaking}
              variant="ghost"
              size="sm"
              className="ml-auto"
            >
              Stop
            </Button>
          </div>
        )}

        {/* Send Button */}
        {transcript && (
          <Button
            onClick={sendVoiceMessage}
            className="w-full gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            <Send className="w-4 h-4" />
            Send Voice Message
          </Button>
        )}
      </div>
    </Card>
  );
}
