import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Copy, Download, Trash2, Settings } from 'lucide-react';

/**
 * Advanced Voice Command UI
 * Transcription, decision logging, and command history
 * Integrated with Qumus, RRB, and HybridCast
 */

interface VoiceCommand {
  id: string;
  timestamp: number;
  transcript: string;
  confidence: number;
  system: 'qumus' | 'rrb' | 'hybridcast';
  command: string;
  parameters: Record<string, any>;
  decision: {
    approved: boolean;
    reasoning: string;
    timestamp: number;
  };
  result: {
    status: 'pending' | 'executing' | 'completed' | 'failed';
    output?: string;
    error?: string;
  };
}

interface TranscriptSegment {
  text: string;
  timestamp: number;
  confidence: number;
  isFinal: boolean;
}

export const AdvancedVoiceCommandUI: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [selectedCommand, setSelectedCommand] = useState<VoiceCommand | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<'qumus' | 'rrb' | 'hybridcast'>('qumus');

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setInterimTranscript('');
      };

      recognitionRef.current.onresult = (event: any) => {
        let interim = '';
        let final = '';
        let avgConfidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const conf = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            final += transcript + ' ';
            avgConfidence += conf;
          } else {
            interim += transcript;
          }
        }

        setTranscript((prev) => prev + final);
        setInterimTranscript(interim);
        setConfidence(avgConfidence / Math.max(1, event.results.length));
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('[Voice] Recognition error:', event.error);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Start listening
  const startListening = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start recording
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('[Voice] Microphone access denied:', error);
    }
  };

  // Stop listening
  const stopListening = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });

        // Process command
        await processCommand(transcript, selectedSystem, audioBlob);
      };
    }
  };

  // Process voice command
  const processCommand = async (
    text: string,
    system: 'qumus' | 'rrb' | 'hybridcast',
    audioBlob: Blob
  ) => {
    try {
      // Send to backend for processing
      const response = await fetch('/api/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          system,
          confidence,
          audioUrl: URL.createObjectURL(audioBlob),
        }),
      });

      const result = await response.json();

      // Create command record
      const command: VoiceCommand = {
        id: `cmd-${Date.now()}`,
        timestamp: Date.now(),
        transcript: text,
        confidence,
        system,
        command: result.command,
        parameters: result.parameters,
        decision: result.decision,
        result: {
          status: 'pending',
        },
      };

      setCommands((prev) => [command, ...prev]);

      // Execute command
      await executeCommand(command);
    } catch (error) {
      console.error('[Voice] Command processing failed:', error);
    }
  };

  // Execute command
  const executeCommand = async (command: VoiceCommand) => {
    try {
      const response = await fetch('/api/voice/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
      });

      const result = await response.json();

      // Update command status
      setCommands((prev) =>
        prev.map((cmd) =>
          cmd.id === command.id
            ? {
                ...cmd,
                result: {
                  status: result.status,
                  output: result.output,
                  error: result.error,
                },
              }
            : cmd
        )
      );
    } catch (error) {
      console.error('[Voice] Command execution failed:', error);
    }
  };

  // Export transcript
  const exportTranscript = (command: VoiceCommand) => {
    const content = `
Voice Command Transcript
========================
System: ${command.system}
Timestamp: ${new Date(command.timestamp).toISOString()}
Confidence: ${(command.confidence * 100).toFixed(1)}%

Transcript:
${command.transcript}

Command: ${command.command}
Parameters: ${JSON.stringify(command.parameters, null, 2)}

Decision:
Approved: ${command.decision.approved}
Reasoning: ${command.decision.reasoning}

Result:
Status: ${command.result.status}
Output: ${command.result.output || 'N/A'}
Error: ${command.result.error || 'N/A'}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${command.id}.txt`;
    a.click();
  };

  // Copy transcript
  const copyTranscript = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Mic className="w-6 h-6 text-cyan-400" />
          Voice Command Center
        </h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* System Selector */}
      <div className="mb-6 flex gap-2">
        {(['qumus', 'rrb', 'hybridcast'] as const).map((system) => (
          <button
            key={system}
            onClick={() => setSelectedSystem(system)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedSystem === system
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {system.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Voice Input */}
      <div className="mb-6 p-6 bg-slate-800 rounded-lg border-2 border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Live Transcription</h3>
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all"
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
            <span className="text-sm text-slate-400">{(confidence * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Transcript Display */}
        <div className="mb-4 p-4 bg-slate-900 rounded border border-slate-700 min-h-24">
          <p className="text-white">{transcript || interimTranscript || 'Awaiting input...'}</p>
          {interimTranscript && <p className="text-slate-500 italic mt-2">{interimTranscript}</p>}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`flex-1 px-4 py-3 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-cyan-500 hover:bg-cyan-600'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Start Listening
              </>
            )}
          </button>
        </div>
      </div>

      {/* Command History */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Command History</h3>

        {commands.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No commands yet. Start by saying something!</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {commands.map((command) => (
              <div
                key={command.id}
                onClick={() => setSelectedCommand(command)}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  selectedCommand?.id === command.id
                    ? 'bg-cyan-500/20 border-2 border-cyan-500'
                    : 'bg-slate-700 border-2 border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white font-medium">{command.command}</p>
                    <p className="text-sm text-slate-400">{command.transcript.substring(0, 50)}...</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        command.result.status === 'completed'
                          ? 'bg-green-500/20 text-green-300'
                          : command.result.status === 'failed'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}
                    >
                      {command.result.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {(command.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Command Details */}
      {selectedCommand && (
        <div className="p-6 bg-slate-800 rounded-lg border-2 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Command Details</h3>

          <div className="space-y-4">
            {/* Transcript */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Transcript</label>
              <div className="flex gap-2">
                <textarea
                  value={selectedCommand.transcript}
                  readOnly
                  className="flex-1 p-3 bg-slate-900 border border-slate-700 rounded text-white text-sm"
                  rows={3}
                />
                <button
                  onClick={() => copyTranscript(selectedCommand.transcript)}
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300"
                  title="Copy"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Decision */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Decision</label>
              <div className="p-3 bg-slate-900 border border-slate-700 rounded">
                <p className="text-white">
                  <span className="font-medium">Approved:</span>{' '}
                  <span className={selectedCommand.decision.approved ? 'text-green-400' : 'text-red-400'}>
                    {selectedCommand.decision.approved ? 'Yes' : 'No'}
                  </span>
                </p>
                <p className="text-slate-300 mt-2">{selectedCommand.decision.reasoning}</p>
              </div>
            </div>

            {/* Result */}
            {selectedCommand.result.output && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Result</label>
                <textarea
                  value={selectedCommand.result.output}
                  readOnly
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded text-white text-sm"
                  rows={3}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => exportTranscript(selectedCommand)}
                className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded text-white font-medium flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => {
                  setCommands((prev) => prev.filter((c) => c.id !== selectedCommand.id));
                  setSelectedCommand(null);
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-white font-medium flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedVoiceCommandUI;
