import React, { useState, useEffect, useRef } from 'react';

// Declare Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Mic,
  MicOff,
  Volume2,
  Copy,
  Trash2,
  Play,
  Square,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface VoiceCommand {
  id: string;
  text: string;
  intent: string;
  confidence: number;
  timestamp: Date;
  result?: string;
}

export const VoiceCommandInterface: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([]);
  const [waveformData, setWaveformData] = useState<number[]>(
    Array(50).fill(0)
  );
  const recognitionRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setInterimTranscript('');
        animateWaveform();
      };

      recognitionRef.current.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptSegment = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            final += transcriptSegment + ' ';
          } else {
            interim += transcriptSegment;
          }
        }

        setTranscript((prev) => prev + final);
        setInterimTranscript(interim);
      };

      recognitionRef.current.onerror = (event: any) => {
        toast.error(`Speech recognition error: ${event.error}`);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        setWaveformData(Array(50).fill(0));
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const animateWaveform = () => {
    setWaveformData((prev) => {
      const newData = prev.slice(1);
      newData.push(Math.random() * 100);
      return newData;
    });
    animationRef.current = requestAnimationFrame(animateWaveform);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const executeCommand = async () => {
    if (!transcript.trim()) {
      toast.error('No command to execute');
      return;
    }

    try {
      const result = await (trpc as any).voice.executeCommand.mutate({
        transcript: transcript.trim(),
      });

      const command: VoiceCommand = {
        id: `cmd-${Date.now()}`,
        text: transcript.trim(),
        intent: result.intent,
        confidence: result.confidence,
        timestamp: new Date(),
        result: result.message,
      };

      setCommandHistory((prev) => [command, ...prev]);
      setTranscript('');
      toast.success(result.message);
    } catch (error) {
      toast.error('Failed to execute command');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const clearHistory = () => {
    setCommandHistory([]);
    toast.success('History cleared');
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="interface" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="interface">Voice Control</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="help">Help</TabsTrigger>
        </TabsList>

        {/* Voice Control Tab */}
        <TabsContent value="interface" className="space-y-4">
          {/* Waveform Visualization */}
          <Card className="p-6 bg-slate-900 border-slate-700">
            <div className="flex items-end justify-center gap-1 h-32">
              {waveformData.map((value, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all"
                  style={{
                    height: `${isListening ? value : 10}%`,
                  }}
                />
              ))}
            </div>
          </Card>

          {/* Transcript Display */}
          <Card className="p-4 bg-slate-900 border-slate-700 min-h-24">
            <p className="text-sm text-slate-400 mb-2">Transcript</p>
            <div className="space-y-2">
              {transcript && (
                <p className="text-white font-medium">{transcript}</p>
              )}
              {interimTranscript && (
                <p className="text-slate-400 italic">{interimTranscript}</p>
              )}
              {!transcript && !interimTranscript && (
                <p className="text-slate-500">
                  {isListening
                    ? 'Listening...'
                    : 'Click the microphone to start'}
                </p>
              )}
            </div>
          </Card>

          {/* Controls */}
          <div className="flex gap-2">
            <Button
              onClick={startListening}
              disabled={isListening}
              className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Mic className="w-4 h-4" />
              Start Recording
            </Button>

            <Button
              onClick={stopListening}
              disabled={!isListening}
              className="flex-1 gap-2 bg-red-600 hover:bg-red-700"
            >
              <MicOff className="w-4 h-4" />
              Stop Recording
            </Button>

            <Button
              onClick={executeCommand}
              disabled={!transcript.trim()}
              className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4" />
              Execute
            </Button>
          </div>

          {/* Quick Commands */}
          <Card className="p-4 bg-slate-900 border-slate-700">
            <p className="text-sm font-semibold text-white mb-3">
              Quick Commands
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Generate video',
                'Show analytics',
                'Start collaboration',
                'Create storyboard',
              ].map((cmd) => (
                <Button
                  key={cmd}
                  onClick={() => {
                    setTranscript(cmd);
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  {cmd}
                </Button>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-white">Command History</h3>
            <Button
              onClick={clearHistory}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          </div>

          <ScrollArea className="h-96 border border-slate-700 rounded-lg p-4">
            {commandHistory.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                No commands yet
              </p>
            ) : (
              <div className="space-y-3">
                {commandHistory.map((cmd) => (
                  <Card
                    key={cmd.id}
                    className="p-3 bg-slate-800 border-slate-700"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          {cmd.text}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Intent: {cmd.intent} (
                          {(cmd.confidence * 100).toFixed(0)}%)
                        </p>
                        {cmd.result && (
                          <p className="text-xs text-green-400 mt-1">
                            {cmd.result}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                          {cmd.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => copyToClipboard(cmd.text)}
                        variant="ghost"
                        size="sm"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Help Tab */}
        <TabsContent value="help" className="space-y-4">
          <Card className="p-4 bg-slate-900 border-slate-700">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Supported Commands
                </h4>
                <ul className="text-sm text-slate-300 space-y-2">
                  <li>
                    <strong>Generate video:</strong> Create a new video
                  </li>
                  <li>
                    <strong>Show analytics:</strong> Display analytics
                    dashboard
                  </li>
                  <li>
                    <strong>Start collaboration:</strong> Invite team members
                  </li>
                  <li>
                    <strong>Create storyboard:</strong> Generate scene
                    breakdown
                  </li>
                  <li>
                    <strong>Batch process:</strong> Queue multiple videos
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Tips</h4>
                <ul className="text-sm text-slate-300 space-y-2">
                  <li>• Speak clearly for better recognition</li>
                  <li>• Use natural language - no special syntax needed</li>
                  <li>• Commands are saved in history for reference</li>
                  <li>• Confidence score shows recognition accuracy</li>
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VoiceCommandInterface;
