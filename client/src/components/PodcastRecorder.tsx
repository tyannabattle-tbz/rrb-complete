/**
 * PodcastRecorder — MediaRecorder-based audio capture for podcast rooms.
 * 
 * Captures audio from microphone using MediaRecorder API, shows real-time
 * waveform visualization, uploads to S3 via tRPC, and auto-creates an
 * episode entry in the database. Accessible for impaired community.
 * 
 * A Canryn Production
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import {
  Mic, MicOff, Circle, Square, Upload, Loader2, Check,
  AlertCircle, Clock, Volume2, Pause, Play, Download, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface PodcastRecorderProps {
  showId: number;
  showSlug: string;
  showTitle: string;
  onEpisodeCreated?: (episodeId: number) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  accentColor?: string;
}

type RecorderState = 'idle' | 'preparing' | 'recording' | 'paused' | 'stopped' | 'uploading' | 'creating' | 'done' | 'error';

// ─── Audio Waveform Visualizer ───────────────────────────
function WaveformVisualizer({ analyser, isActive }: { analyser: AnalyserNode | null; isActive: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!analyser || !isActive || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#a855f7';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [analyser, isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={60}
      className="w-full h-[60px] rounded bg-black/30"
      aria-label="Audio waveform visualization"
    />
  );
}

// ─── Upload Progress Bar ─────────────────────────────────
function UploadProgress({ progress, label }: { progress: number; label: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-white/60">
        <span>{label}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Recorder Component ─────────────────────────────
export default function PodcastRecorder({
  showId,
  showSlug,
  showTitle,
  onEpisodeCreated,
  onRecordingStateChange,
  accentColor = '#a855f7',
}: PodcastRecorderProps) {
  const { user } = useAuth();
  const [state, setState] = useState<RecorderState>('idle');
  const [duration, setDuration] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [episodeDescription, setEpisodeDescription] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const levelIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // tRPC mutations
  const createEpisode = trpc.podcastManagement.createEpisode.useMutation();
  const uploadAudio = trpc.podcastManagement.uploadAudio.useMutation();
  const publishEpisode = trpc.podcastManagement.publishEpisode.useMutation();
  const utils = trpc.useUtils();

  // Format duration
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Auto-generate episode title
  useEffect(() => {
    if (!episodeTitle) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      setEpisodeTitle(`${showTitle} — ${dateStr}`);
    }
  }, [showTitle, episodeTitle]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (levelIntervalRef.current) clearInterval(levelIntervalRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      audioContextRef.current?.close();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // ─── Start Recording ───────────────────────────────────
  const startRecording = useCallback(async () => {
    setState('preparing');
    setErrorMsg('');
    audioChunksRef.current = [];

    try {
      // Request microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 2,
        },
      });
      streamRef.current = stream;

      // Set up audio analysis for waveform
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Audio level monitoring
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      levelIntervalRef.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(Math.min(100, avg * 1.5));
      }, 100);

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : 'audio/webm';

      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setState('stopped');
      };

      recorder.onerror = (event: any) => {
        setErrorMsg(`Recording error: ${event.error?.message || 'Unknown error'}`);
        setState('error');
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000); // Collect data every second

      // Start duration timer
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      setState('recording');
      onRecordingStateChange?.(true);
      toast.success('Recording started', { description: 'Audio capture active — speak into your microphone' });

    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to access microphone');
      setState('error');
      toast.error('Microphone access denied', { description: 'Please allow microphone access to record' });
    }
  }, [onRecordingStateChange]);

  // ─── Pause/Resume Recording ────────────────────────────
  const togglePause = useCallback(() => {
    if (!mediaRecorderRef.current) return;
    if (state === 'recording') {
      mediaRecorderRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      setState('paused');
      toast.info('Recording paused');
    } else if (state === 'paused') {
      mediaRecorderRef.current.resume();
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      setState('recording');
      toast.info('Recording resumed');
    }
  }, [state]);

  // ─── Stop Recording ────────────────────────────────────
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (levelIntervalRef.current) clearInterval(levelIntervalRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    onRecordingStateChange?.(false);
  }, [onRecordingStateChange]);

  // ─── Upload & Create Episode ───────────────────────────
  const uploadAndCreateEpisode = useCallback(async () => {
    if (!audioBlob) return;
    setState('uploading');
    setUploadProgress(0);

    try {
      // Step 1: Create episode entry
      setUploadProgress(10);
      setState('creating');
      const episode = await createEpisode.mutateAsync({
        showId,
        title: episodeTitle.trim() || `${showTitle} — ${new Date().toLocaleDateString()}`,
        description: episodeDescription.trim() || `Recorded live on ${showTitle}`,
        seasonNumber: 1,
        status: 'uploading',
      });
      setUploadProgress(25);

      // Step 2: Convert blob to base64 for upload
      setState('uploading');
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1]; // Remove data:audio/...;base64, prefix
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(audioBlob);
      const base64Data = await base64Promise;
      setUploadProgress(40);

      // Simulate progress during upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 5, 85));
      }, 500);

      // Step 3: Upload audio to S3
      const ext = audioBlob.type.includes('mp4') ? 'mp4' : 'webm';
      const uploadResult = await uploadAudio.mutateAsync({
        episodeId: episode.id,
        fileName: `${showSlug}-${Date.now()}.${ext}`,
        fileData: base64Data,
        contentType: audioBlob.type,
        duration,
        fileSize: audioBlob.size,
      });
      clearInterval(progressInterval);
      setUploadProgress(90);

      // Step 4: Auto-publish
      await publishEpisode.mutateAsync({ episodeId: episode.id });
      setUploadProgress(100);

      setState('done');
      toast.success('Episode published!', {
        description: `"${episodeTitle}" is now live and distributing to all platforms via QUMUS`,
      });

      // Invalidate queries to refresh episode lists
      utils.podcastManagement.getEpisodes.invalidate();
      utils.podcastManagement.getStats.invalidate();
      onEpisodeCreated?.(episode.id);

    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed');
      setState('error');
      toast.error('Upload failed', { description: err.message });
    }
  }, [audioBlob, episodeTitle, episodeDescription, showId, showSlug, showTitle, duration, createEpisode, uploadAudio, publishEpisode, utils, onEpisodeCreated]);

  // ─── Reset ─────────────────────────────────────────────
  const reset = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setUploadProgress(0);
    setErrorMsg('');
    setState('idle');
    audioChunksRef.current = [];
  }, [audioUrl]);

  // ─── Render ────────────────────────────────────────────
  return (
    <div className="space-y-3" role="region" aria-label="Podcast recorder">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-purple-400" />
          <span className="text-white/80 text-sm font-medium">Recorder</span>
        </div>
        <Badge
          variant="outline"
          className={
            state === 'recording' ? 'border-red-500 text-red-400 animate-pulse' :
            state === 'paused' ? 'border-yellow-500 text-yellow-400' :
            state === 'uploading' || state === 'creating' ? 'border-blue-500 text-blue-400' :
            state === 'done' ? 'border-green-500 text-green-400' :
            state === 'error' ? 'border-red-500 text-red-400' :
            'border-zinc-600 text-zinc-400'
          }
        >
          {state === 'idle' && 'Ready'}
          {state === 'preparing' && 'Preparing...'}
          {state === 'recording' && '● REC'}
          {state === 'paused' && '⏸ Paused'}
          {state === 'stopped' && 'Review'}
          {state === 'uploading' && 'Uploading...'}
          {state === 'creating' && 'Creating...'}
          {state === 'done' && '✓ Published'}
          {state === 'error' && '✕ Error'}
        </Badge>
      </div>

      {/* Waveform Visualizer */}
      {(state === 'recording' || state === 'paused') && (
        <WaveformVisualizer analyser={analyserRef.current} isActive={state === 'recording'} />
      )}

      {/* Audio Level Meter */}
      {(state === 'recording' || state === 'paused') && (
        <div className="flex items-center gap-2">
          <Volume2 className="w-3 h-3 text-white/40" />
          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${audioLevel}%`,
                backgroundColor: audioLevel > 80 ? '#ef4444' : audioLevel > 50 ? '#eab308' : '#22c55e',
              }}
            />
          </div>
          <span className="text-xs text-white/40 w-8 text-right">{Math.round(audioLevel)}%</span>
        </div>
      )}

      {/* Duration Display */}
      {(state === 'recording' || state === 'paused' || state === 'stopped') && (
        <div className="text-center">
          <span className="text-2xl font-mono text-white font-bold">{formatTime(duration)}</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {state === 'idle' && (
          <Button
            onClick={startRecording}
            className="bg-red-600 hover:bg-red-700 text-white"
            size="sm"
            aria-label="Start recording"
          >
            <Circle className="w-4 h-4 mr-2 fill-current" /> Start Recording
          </Button>
        )}

        {state === 'preparing' && (
          <Button disabled size="sm" className="bg-zinc-700 text-white/60">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Preparing...
          </Button>
        )}

        {(state === 'recording' || state === 'paused') && (
          <>
            <Button
              onClick={togglePause}
              variant="outline"
              size="sm"
              className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
              aria-label={state === 'recording' ? 'Pause recording' : 'Resume recording'}
            >
              {state === 'recording' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              onClick={stopRecording}
              className="bg-red-600 hover:bg-red-700 text-white"
              size="sm"
              aria-label="Stop recording"
            >
              <Square className="w-4 h-4 mr-2 fill-current" /> Stop
            </Button>
          </>
        )}
      </div>

      {/* Review & Upload Section */}
      {state === 'stopped' && audioUrl && (
        <div className="space-y-3 border border-zinc-700 rounded-lg p-3">
          <p className="text-white/60 text-xs font-medium">Review Recording</p>
          
          {/* Audio Player */}
          <audio
            src={audioUrl}
            controls
            className="w-full h-8"
            aria-label="Recorded audio playback"
          />

          {/* Episode Metadata */}
          <Input
            value={episodeTitle}
            onChange={(e) => setEpisodeTitle(e.target.value)}
            placeholder="Episode title..."
            className="bg-zinc-800 border-zinc-700 text-white text-xs"
            aria-label="Episode title"
          />
          <textarea
            value={episodeDescription}
            onChange={(e) => setEpisodeDescription(e.target.value)}
            placeholder="Episode description (optional)..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md text-white text-xs p-2 resize-none h-16"
            aria-label="Episode description"
          />

          {/* File Info */}
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>{formatTime(duration)} recorded</span>
            <span>{(audioBlob!.size / (1024 * 1024)).toFixed(1)} MB</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={uploadAndCreateEpisode}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              size="sm"
              aria-label="Upload and publish episode"
            >
              <Upload className="w-4 h-4 mr-2" /> Upload & Publish
            </Button>
            <Button
              onClick={() => {
                if (audioUrl) {
                  const a = document.createElement('a');
                  a.href = audioUrl;
                  a.download = `${showSlug}-${Date.now()}.webm`;
                  a.click();
                }
              }}
              variant="outline"
              size="sm"
              className="border-zinc-600 text-zinc-400 hover:bg-zinc-700"
              aria-label="Download recording"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              onClick={reset}
              variant="outline"
              size="sm"
              className="border-zinc-600 text-zinc-400 hover:bg-zinc-700"
              aria-label="Discard recording"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {(state === 'uploading' || state === 'creating') && (
        <div className="space-y-2 border border-zinc-700 rounded-lg p-3">
          <UploadProgress
            progress={uploadProgress}
            label={state === 'creating' ? 'Creating episode...' : 'Uploading to S3...'}
          />
          <p className="text-xs text-white/40 text-center">
            {uploadProgress < 25 && 'Creating episode entry...'}
            {uploadProgress >= 25 && uploadProgress < 85 && 'Uploading audio to cloud storage...'}
            {uploadProgress >= 85 && uploadProgress < 100 && 'Publishing and distributing via QUMUS...'}
            {uploadProgress >= 100 && 'Complete!'}
          </p>
        </div>
      )}

      {/* Done State */}
      {state === 'done' && (
        <div className="text-center space-y-2 border border-green-800 rounded-lg p-3 bg-green-900/10">
          <Check className="w-8 h-8 mx-auto text-green-400" />
          <p className="text-green-400 text-sm font-medium">Episode Published!</p>
          <p className="text-white/40 text-xs">Auto-distributing to Spotify, Apple, YouTube, and RSS</p>
          <Button onClick={reset} variant="outline" size="sm" className="border-zinc-600 text-zinc-400">
            Record Another
          </Button>
        </div>
      )}

      {/* Error State */}
      {state === 'error' && (
        <div className="text-center space-y-2 border border-red-800 rounded-lg p-3 bg-red-900/10">
          <AlertCircle className="w-6 h-6 mx-auto text-red-400" />
          <p className="text-red-400 text-xs">{errorMsg}</p>
          <Button onClick={reset} variant="outline" size="sm" className="border-zinc-600 text-zinc-400">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
