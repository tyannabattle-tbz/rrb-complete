import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Copy, Download } from "lucide-react";

interface TranscriptEntry {
  id: string;
  speaker: string;
  text: string;
  timestamp: Date;
  confidence: number;
}

export const RealTimeTranscription: React.FC = () => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentText, setCurrentText] = useState("");
  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onstart = () => {
        setIsTranscribing(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const isFinal = event.results[i].isFinal;
          const confidence = event.results[i][0].confidence;

          if (isFinal) {
            const newEntry: TranscriptEntry = {
              id: `entry_${Date.now()}_${i}`,
              speaker: "User",
              text: transcript,
              timestamp: new Date(),
              confidence: confidence,
            };
            setTranscript((prev) => [...prev, newEntry]);
            setCurrentText("");
          } else {
            interimTranscript += transcript;
          }
        }

        setCurrentText(interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
      };

      recognitionRef.current.onend = () => {
        setIsTranscribing(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [transcript, currentText]);

  const toggleTranscription = () => {
    if (isTranscribing) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const copyToClipboard = () => {
    const fullText = transcript.map((e) => `${e.speaker}: ${e.text}`).join("\n");
    navigator.clipboard.writeText(fullText);
    alert("Transcript copied to clipboard!");
  };

  const downloadTranscript = () => {
    const fullText = transcript
      .map((e) => `[${e.timestamp.toLocaleTimeString()}] ${e.speaker}: ${e.text}`)
      .join("\n");

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(fullText));
    element.setAttribute("download", `transcript_${Date.now()}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const clearTranscript = () => {
    setTranscript([]);
    setCurrentText("");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Mic className="text-blue-600" />
            Real-Time Transcription
          </h2>
          <span className="text-sm text-gray-600">
            {isTranscribing ? (
              <span className="flex items-center gap-2 text-green-600">
                <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                Recording...
              </span>
            ) : (
              <span className="text-gray-600">Ready</span>
            )}
          </span>
        </div>

        {/* Transcript Display */}
        <div className="bg-white rounded-lg p-4 h-64 overflow-y-auto border border-gray-200">
          <div className="space-y-3">
            {transcript.map((entry) => (
              <div key={entry.id} className="text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-blue-600">{entry.speaker}</span>
                  <span className="text-xs text-gray-500">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">{entry.text}</p>
                <div className="mt-1 text-xs text-gray-400">
                  Confidence: {(entry.confidence * 100).toFixed(0)}%
                </div>
              </div>
            ))}

            {/* Interim Results */}
            {currentText && (
              <div className="text-sm italic text-gray-500 bg-gray-50 p-2 rounded">
                {currentText}
              </div>
            )}

            <div ref={transcriptEndRef} />
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={toggleTranscription}
            className={`flex items-center gap-2 ${
              isTranscribing ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isTranscribing ? (
              <>
                <MicOff size={18} />
                Stop Recording
              </>
            ) : (
              <>
                <Mic size={18} />
                Start Recording
              </>
            )}
          </Button>

          <Button
            onClick={copyToClipboard}
            disabled={transcript.length === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Copy size={18} />
            Copy
          </Button>

          <Button
            onClick={downloadTranscript}
            disabled={transcript.length === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download size={18} />
            Download
          </Button>

          <Button
            onClick={clearTranscript}
            disabled={transcript.length === 0}
            variant="outline"
            className="text-red-600 hover:text-red-700"
          >
            Clear
          </Button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-gray-700">
          <p className="font-semibold mb-1">💡 Accessibility Features:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Real-time speech-to-text transcription</li>
            <li>Confidence score for each phrase</li>
            <li>Timestamp for each entry</li>
            <li>Copy to clipboard functionality</li>
            <li>Download as text file</li>
            <li>Perfect for hearing-impaired users</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};
