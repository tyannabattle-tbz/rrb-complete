import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Square, Copy, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Recording {
  id: string;
  text: string;
  duration: number;
  timestamp: number;
}

export function VoiceToText() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [transcribedText, setTranscribedText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const duration = (Date.now() - startTimeRef.current) / 1000;
        
        setIsTranscribing(true);
        try {
          // Simulate transcription
          const text = `[Transcribed audio - ${Math.round(duration)}s]`;
          const recording: Recording = {
            id: `rec-${Date.now()}`,
            text,
            duration,
            timestamp: Date.now(),
          };
          setRecordings(prev => [recording, ...prev]);
          setTranscribedText(text);
          toast.success('Audio transcribed successfully');
        } catch (error) {
          toast.error('Transcription failed');
        } finally {
          setIsTranscribing(false);
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const deleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
    toast.success('Recording deleted');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Recording Controls */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Voice to Text</h2>
          <p className="text-slate-400 text-center">Record your voice and convert it to text</p>
          
          <div className="flex gap-4">
            <Button
              onClick={startRecording}
              disabled={isRecording}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Mic className="w-4 h-4" />
              Start Recording
            </Button>
            <Button
              onClick={stopRecording}
              disabled={!isRecording}
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              <Square className="w-4 h-4" />
              Stop Recording
            </Button>
          </div>

          {isRecording && (
            <div className="flex items-center gap-2 text-red-400">
              <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
              Recording...
            </div>
          )}
        </div>
      </Card>

      {/* Transcribed Text */}
      {transcribedText && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Transcribed Text</h3>
              <Button
                size="sm"
                onClick={() => copyToClipboard(transcribedText)}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>
            </div>
            <div className="bg-slate-700 rounded p-4 text-slate-100 min-h-20">
              {isTranscribing ? (
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Transcribing...
                </div>
              ) : (
                transcribedText
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Recording History */}
      {recordings.length > 0 && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recording History</h3>
          <div className="space-y-3">
            {recordings.map(recording => (
              <div key={recording.id} className="bg-slate-700 rounded p-4 flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-slate-300 text-sm">{recording.text}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    {Math.round(recording.duration)}s • {new Date(recording.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(recording.text)}
                    className="border-slate-600"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteRecording(recording.id)}
                    className="border-red-600 text-red-400 hover:bg-red-600/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
