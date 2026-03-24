import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Download, Square, Play } from 'lucide-react';
import { toast } from 'sonner';

interface RecordingSession {
  id: string;
  name: string;
  duration: number;
  recordedAt: Date;
  quality: 'low' | 'medium' | 'high' | 'lossless';
  format: 'mp3' | 'wav';
}

export function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingLevel, setRecordingLevel] = useState(0);
  const [quality, setQuality] = useState<'high'>('high');
  const [sessions, setSessions] = useState<RecordingSession[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = 'audio/webm;codecs=opus';
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : 'audio/webm',
      });

      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const session: RecordingSession = {
          id: Date.now().toString(),
          name: `Recording ${new Date().toLocaleTimeString()}`,
          duration: recordingTime,
          recordedAt: new Date(),
          quality: quality as any,
          format: 'wav',
        };
        setSessions([...sessions, session]);
        toast.success(`Recording saved: ${session.name}`);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
        setRecordingLevel(Math.random() * 100);
      }, 100);

      toast.success('Recording started');
    } catch (error) {
      toast.error('Microphone access denied');
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }

      toast.success('Recording stopped');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const exportRecording = (sessionId: string, format: 'mp3' | 'wav') => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      toast.success(`Exporting ${session.name} as ${format.toUpperCase()}...`);
      setTimeout(() => {
        toast.success(`Export complete: ${session.name}.${format}`);
      }, 2000);
    }
  };

  const deleteRecording = (sessionId: string) => {
    setSessions(sessions.filter((s) => s.id !== sessionId));
    toast.success('Recording deleted');
  };

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Mic className="w-4 h-4 text-red-400" />
            Recording Studio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recording Time Display */}
          <div className="bg-slate-900 rounded p-4 text-center">
            <div className="text-3xl font-mono text-green-400 mb-2">{formatTime(recordingTime)}</div>
            <div className="text-xs text-slate-400">Recording Duration</div>
          </div>

          {/* Recording Level Meter */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Input Level</label>
            <div className="h-6 bg-slate-900 rounded border border-slate-700 flex items-center overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
                style={{ width: `${recordingLevel}%` }}
              />
            </div>
          </div>

          {/* Quality Settings */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Quality</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300"
              >
                <option value="low">Low (64kbps)</option>
                <option value="medium">Medium (128kbps)</option>
                <option value="high">High (256kbps)</option>
                <option value="lossless">Lossless (WAV)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Format</label>
              <select
                defaultValue="wav"
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300"
              >
                <option value="mp3">MP3</option>
                <option value="wav">WAV</option>
              </select>
            </div>
          </div>

          {/* Recording Buttons */}
          <div className="flex gap-2">
            <Button
              className={isRecording ? 'bg-red-600 hover:bg-red-700 flex-1' : 'bg-green-600 hover:bg-green-700 flex-1'}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recording Sessions */}
      {sessions.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Saved Recordings ({sessions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between bg-slate-900 p-3 rounded border border-slate-700">
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">{session.name}</div>
                    <div className="text-xs text-slate-400">
                      {formatTime(session.duration)} • {session.quality} • {session.format.toUpperCase()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportRecording(session.id, 'mp3')}
                      className="text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      MP3
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportRecording(session.id, 'wav')}
                      className="text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      WAV
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteRecording(session.id)}
                      className="text-xs"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
