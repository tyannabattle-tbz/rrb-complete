import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { toast } from "sonner";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onVoicePlay?: () => void;
  isListening?: boolean;
}

export default function VoiceInput({
  onTranscript,
  onVoicePlay,
  isListening = false,
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.language = "en-US";

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
      toast.success("Listening...");
    };

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + transcriptSegment);
        } else {
          interimTranscript += transcriptSegment;
        }
      }
      if (interimTranscript) {
        setTranscript((prev) => prev + interimTranscript);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      toast.error(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
      if (transcript) {
        onTranscript(transcript);
        setTranscript("");
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript, transcript]);

  const handleStartRecording = () => {
    if (recognitionRef.current) {
      setTranscript("");
      recognitionRef.current.start();
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleTextToSpeech = (text: string) => {
    if (!text) {
      toast.error("No text to speak");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      onVoicePlay?.();
      toast.success("Playing audio...");
    };

    utterance.onerror = (event) => {
      toast.error(`Speech synthesis error: ${event.error}`);
    };

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={
          isRecording ? handleStopRecording : handleStartRecording
        }
        className={`h-8 w-8 p-0 ${isRecording ? "bg-red-500/20 text-red-600" : ""}`}
        title={isRecording ? "Stop recording" : "Start recording"}
      >
        {isRecording ? (
          <MicOff size={18} />
        ) : (
          <Mic size={18} />
        )}
      </Button>
      {transcript && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleTextToSpeech(transcript)}
          className="h-8 w-8 p-0"
          title="Play audio"
        >
          <Volume2 size={18} />
        </Button>
      )}
    </div>
  );
}
