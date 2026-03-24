'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, Copy, Scissors, Undo2, Redo2, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

interface WaveformEditorProps {
  audioUrl?: string;
  onExport?: (audioBlob: Blob) => void;
}

export const AudioWaveformEditor: React.FC<WaveformEditorProps> = ({ audioUrl, onExport }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceRef = useRef<AudioBufferAudioNode | null>(null);
  
  const [zoom, setZoom] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedStart, setSelectedStart] = useState<number | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<number | null>(null);
  const [history, setHistory] = useState<AudioBuffer[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize audio context
  useEffect(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;

    return () => {
      audioContext.close();
    };
  }, []);

  // Load audio file
  useEffect(() => {
    if (!audioUrl || !audioContextRef.current) return;

    const loadAudio = async () => {
      try {
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
        
        audioBufferRef.current = audioBuffer;
        setDuration(audioBuffer.duration);
        drawWaveform(audioBuffer);
        
        // Initialize history
        setHistory([audioBuffer]);
        setHistoryIndex(0);
        
        toast.success('Audio loaded successfully');
      } catch (error) {
        console.error('Failed to load audio:', error);
        toast.error('Failed to load audio file');
      }
    };

    loadAudio();
  }, [audioUrl]);

  // Draw waveform
  const drawWaveform = (audioBuffer: AudioBuffer) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const data = audioBuffer.getChannelData(0);

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1;
    ctx.beginPath();

    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;

      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      ctx.moveTo(i, amp - max * amp);
      ctx.lineTo(i, amp - min * amp);
    }

    ctx.stroke();

    // Draw selection
    if (selectedStart !== null && selectedEnd !== null) {
      const startX = (selectedStart / duration) * width;
      const endX = (selectedEnd / duration) * width;

      ctx.fillStyle = 'rgba(100, 200, 255, 0.2)';
      ctx.fillRect(startX, 0, endX - startX, height);
    }

    // Draw playhead
    const playheadX = (currentTime / duration) * width;
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
  };

  // Redraw on updates
  useEffect(() => {
    if (audioBufferRef.current) {
      drawWaveform(audioBufferRef.current);
    }
  }, [currentTime, selectedStart, selectedEnd, zoom]);

  // Play audio
  const handlePlay = () => {
    if (!audioContextRef.current || !audioBufferRef.current) return;

    if (isPlaying) {
      sourceRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(analyserRef.current!);
    analyserRef.current!.connect(audioContextRef.current.destination);

    source.start(0, currentTime);
    sourceRef.current = source;
    setIsPlaying(true);

    // Update playhead
    const startTime = audioContextRef.current.currentTime;
    const interval = setInterval(() => {
      const elapsed = audioContextRef.current!.currentTime - startTime;
      setCurrentTime(Math.min(elapsed + currentTime, duration));

      if (elapsed + currentTime >= duration) {
        clearInterval(interval);
        setIsPlaying(false);
      }
    }, 100);
  };

  // Handle canvas click for selection
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickTime = (x / canvasRef.current.width) * duration;

    if (selectedStart === null) {
      setSelectedStart(clickTime);
    } else if (selectedEnd === null) {
      setSelectedEnd(Math.max(clickTime, selectedStart));
    } else {
      setSelectedStart(clickTime);
      setSelectedEnd(null);
    }
  };

  // Effects
  const applyEffect = (effectType: 'eq' | 'compression' | 'reverb') => {
    if (!audioBufferRef.current) return;

    toast.success(`Applied ${effectType} effect`);
    // Effect implementation would go here
  };

  // Undo/Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      audioBufferRef.current = history[newIndex];
      drawWaveform(history[newIndex]);
      toast.success('Undo successful');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      audioBufferRef.current = history[newIndex];
      drawWaveform(history[newIndex]);
      toast.success('Redo successful');
    }
  };

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Audio Waveform Editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Waveform Canvas */}
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          onClick={handleCanvasClick}
          className="w-full border border-slate-700 rounded cursor-crosshair bg-black"
        />

        {/* Timeline */}
        <div className="flex justify-between text-xs text-slate-400">
          <span>0:00</span>
          <span>{Math.floor(currentTime)}s / {Math.floor(duration)}s</span>
        </div>

        {/* Playback Controls */}
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={handlePlay} className="bg-purple-600 hover:bg-purple-700">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>

          <Button size="sm" variant="outline" onClick={handleUndo} className="border-slate-600">
            <Undo2 className="w-4 h-4" />
          </Button>

          <Button size="sm" variant="outline" onClick={handleRedo} className="border-slate-600">
            <Redo2 className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="border-slate-600"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom(Math.min(4, zoom + 0.1))}
            className="border-slate-600"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <span className="text-xs text-slate-400 self-center">Zoom: {zoom.toFixed(1)}x</span>
        </div>

        {/* Effects */}
        <div className="space-y-2">
          <p className="text-sm text-slate-300 font-semibold">Effects</p>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => applyEffect('eq')} className="border-slate-600">
              EQ
            </Button>
            <Button size="sm" variant="outline" onClick={() => applyEffect('compression')} className="border-slate-600">
              Compression
            </Button>
            <Button size="sm" variant="outline" onClick={() => applyEffect('reverb')} className="border-slate-600">
              Reverb
            </Button>
          </div>
        </div>

        {/* Selection Info */}
        {selectedStart !== null && selectedEnd !== null && (
          <div className="bg-slate-800 p-3 rounded text-sm text-slate-300">
            Selection: {selectedStart.toFixed(2)}s - {selectedEnd.toFixed(2)}s ({(selectedEnd - selectedStart).toFixed(2)}s)
          </div>
        )}
      </CardContent>
    </Card>
  );
};
