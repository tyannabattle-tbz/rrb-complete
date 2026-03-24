import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, Zap, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceCommand {
  id: string;
  command: string;
  action: string;
  system: string;
  timestamp: Date;
  status: 'pending' | 'executing' | 'completed' | 'failed';
}

interface CommandMapping {
  patterns: string[];
  action: string;
  system: string;
  execute: () => void;
}

export function VoiceCommandProcessor() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef<any>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [feedbackVolume, setFeedbackVolume] = useState(70);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        toast.info('Listening for voice commands...');
      };

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            setConfidence(Math.round(confidence * 100));
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript.trim());
          processVoiceCommand(finalTranscript.trim());
        } else {
          setTranscript(interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        toast.error(`Voice recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const commandMappings: CommandMapping[] = [
    {
      patterns: ['start recording', 'begin recording', 'record'],
      action: 'start_recording',
      system: 'RRB Studio',
      execute: () => toast.success('Recording started'),
    },
    {
      patterns: ['stop recording', 'end recording', 'stop'],
      action: 'stop_recording',
      system: 'RRB Studio',
      execute: () => toast.success('Recording stopped'),
    },
    {
      patterns: ['play', 'start playback', 'play audio'],
      action: 'play_audio',
      system: 'RRB Studio',
      execute: () => toast.success('Playback started'),
    },
    {
      patterns: ['pause', 'pause playback'],
      action: 'pause_audio',
      system: 'RRB Studio',
      execute: () => toast.success('Playback paused'),
    },
    {
      patterns: ['increase volume', 'turn up', 'louder', 'volume up'],
      action: 'increase_volume',
      system: 'RRB Studio',
      execute: () => toast.success('Volume increased'),
    },
    {
      patterns: ['decrease volume', 'turn down', 'quieter', 'volume down'],
      action: 'decrease_volume',
      system: 'RRB Studio',
      execute: () => toast.success('Volume decreased'),
    },
    {
      patterns: ['mute', 'silence'],
      action: 'mute',
      system: 'RRB Studio',
      execute: () => toast.success('Muted'),
    },
    {
      patterns: ['unmute', 'unmute audio'],
      action: 'unmute',
      system: 'RRB Studio',
      execute: () => toast.success('Unmuted'),
    },
    {
      patterns: ['start streaming', 'go live', 'start broadcast'],
      action: 'start_stream',
      system: 'QUMUS',
      execute: () => toast.success('Stream started'),
    },
    {
      patterns: ['stop streaming', 'end broadcast', 'stop live'],
      action: 'stop_stream',
      system: 'QUMUS',
      execute: () => toast.success('Stream stopped'),
    },
    {
      patterns: ['share session', 'create share', 'invite'],
      action: 'share_session',
      system: 'Collaboration',
      execute: () => toast.success('Session shared'),
    },
    {
      patterns: ['analyze spectrum', 'spectral analysis', 'analyze frequency'],
      action: 'analyze_spectrum',
      system: 'RRB Studio',
      execute: () => toast.success('Spectral analysis started'),
    },
    {
      patterns: ['auto balance', 'balance audio', 'optimize'],
      action: 'auto_balance',
      system: 'RRB Studio',
      execute: () => toast.success('Auto-balance applied'),
    },
  ];

  const processVoiceCommand = (text: string) => {
    const lowerText = text.toLowerCase();
    let matched = false;

    for (const mapping of commandMappings) {
      for (const pattern of mapping.patterns) {
        if (lowerText.includes(pattern)) {
          const command: VoiceCommand = {
            id: Date.now().toString(),
            command: text,
            action: mapping.action,
            system: mapping.system,
            timestamp: new Date(),
            status: 'executing',
          };

          setCommands([command, ...commands]);
          mapping.execute();
          playVoiceFeedback(`Executing ${mapping.action}`);

          setTimeout(() => {
            setCommands((prev) =>
              prev.map((c) =>
                c.id === command.id ? { ...c, status: 'completed' } : c
              )
            );
          }, 1000);

          matched = true;
          break;
        }
      }
      if (matched) break;
    }

    if (!matched) {
      toast.warning('Command not recognized. Try: "start recording", "play", "increase volume"');
    }
  };

  const playVoiceFeedback = (message: string) => {
    if (voiceEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.volume = feedbackVolume / 100;
      speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current?.start();
    }
  };

  const clearHistory = () => {
    setCommands([]);
    toast.success('Command history cleared');
  };

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Mic className="w-4 h-4 text-red-400" />
            Voice Command Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Microphone Status */}
          <div className="bg-slate-900 rounded p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-slate-400">Microphone Status</div>
              <div className="flex items-center gap-2">
                {isListening && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs text-red-400">LISTENING</span>
                  </div>
                )}
                {!isListening && voiceEnabled && (
                  <span className="text-xs text-slate-400">Ready</span>
                )}
              </div>
            </div>

            <Button
              onClick={toggleListening}
              className={`w-full ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Start Listening
                </>
              )}
            </Button>
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="bg-slate-900 rounded p-3 border border-slate-700">
              <div className="text-xs text-slate-400 mb-2">Current Transcript</div>
              <div className="text-sm text-white font-semibold">{transcript}</div>
              <div className="text-xs text-green-400 mt-2">Confidence: {confidence}%</div>
            </div>
          )}

          {/* Voice Settings */}
          <div className="space-y-3 bg-slate-900 rounded p-3 border border-slate-700">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-400 flex items-center gap-2">
                <Volume2 className="w-3 h-3" />
                Voice Feedback
              </label>
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                className="rounded"
              />
            </div>

            {voiceEnabled && (
              <div>
                <label className="text-xs text-slate-400 block mb-2">Feedback Volume</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={feedbackVolume}
                  onChange={(e) => setFeedbackVolume(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-slate-400 mt-1">{feedbackVolume}%</div>
              </div>
            )}
          </div>

          {/* Available Commands */}
          <div className="bg-slate-900 rounded p-3 border border-slate-700">
            <div className="text-xs text-slate-400 mb-2 font-semibold">Available Commands</div>
            <div className="text-xs text-slate-400 space-y-1">
              <div>🎙️ "start recording" - Begin audio recording</div>
              <div>🎙️ "stop recording" - End recording</div>
              <div>🎙️ "play" - Start playback</div>
              <div>🎙️ "pause" - Pause playback</div>
              <div>🎙️ "increase volume" - Raise volume</div>
              <div>🎙️ "decrease volume" - Lower volume</div>
              <div>🎙️ "mute" - Mute audio</div>
              <div>🎙️ "start streaming" - Begin broadcast</div>
              <div>🎙️ "share session" - Create shareable session</div>
              <div>🎙️ "analyze spectrum" - Run spectral analysis</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Command History */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Command History
            </span>
            {commands.length > 0 && (
              <Button size="sm" variant="destructive" onClick={clearHistory}>
                Clear
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {commands.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">
              No commands executed yet. Start listening to execute voice commands!
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {commands.map((cmd) => (
                <div key={cmd.id} className="bg-slate-900 rounded p-2 border border-slate-700">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <div className="text-xs text-white font-semibold">{cmd.command}</div>
                      <div className="text-xs text-slate-400">{cmd.system}</div>
                    </div>
                    <div className="text-xs">
                      {cmd.status === 'completed' && <span className="text-green-400">✓</span>}
                      {cmd.status === 'executing' && <span className="text-yellow-400">⟳</span>}
                      {cmd.status === 'failed' && <span className="text-red-400">✗</span>}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {cmd.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
