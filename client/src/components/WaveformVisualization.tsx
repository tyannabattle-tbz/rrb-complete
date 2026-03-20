import React, { useEffect, useRef, useState } from 'react';

interface WaveformProps {
  audioUrl?: string;
  isPlaying?: boolean;
  currentTime?: number;
  duration?: number;
  height?: number;
  width?: number;
  color?: string;
  backgroundColor?: string;
  onTimeUpdate?: (time: number) => void;
}

export function WaveformVisualization({
  audioUrl,
  isPlaying = false,
  currentTime = 0,
  duration = 0,
  height = 100,
  width = 800,
  color = '#00d4ff',
  backgroundColor = '#1a1a2e',
  onTimeUpdate,
}: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Initialize audio context and analyser
  useEffect(() => {
    if (!audioUrl) return;

    const initAudio = async () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        dataArrayRef.current = dataArray;

        // Load and decode audio
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Extract waveform data from audio buffer
        const rawData = audioBuffer.getChannelData(0);
        const samples = Math.floor(rawData.length / (width / 4));
        const filteredData: number[] = [];

        for (let i = 0; i < width; i++) {
          let sum = 0;
          for (let j = 0; j < samples; j++) {
            sum += Math.abs(rawData[i * samples + j]);
          }
          filteredData.push(sum / samples);
        }

        setWaveformData(filteredData);
      } catch (error) {
        console.error('Failed to load audio:', error);
      }
    };

    initAudio();
  }, [audioUrl, width]);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    if (waveformData.length === 0) return;

    // Draw waveform
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    const centerY = height / 2;
    const maxAmplitude = Math.max(...waveformData) || 1;

    for (let i = 0; i < waveformData.length; i++) {
      const x = (i / waveformData.length) * width;
      const normalizedValue = waveformData[i] / maxAmplitude;
      const y = centerY - normalizedValue * (height / 2);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // Draw playback position
    if (duration > 0) {
      const playbackX = (currentTime / duration) * width;
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playbackX, 0);
      ctx.lineTo(playbackX, height);
      ctx.stroke();
    }

    // Draw time grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    const gridSpacing = width / 10;
    for (let i = 0; i <= 10; i++) {
      const x = i * gridSpacing;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  }, [waveformData, currentTime, duration, width, height, color, backgroundColor]);

  // Handle canvas click for seeking
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !duration) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / width;
    const newTime = percentage * duration;

    onTimeUpdate?.(newTime);
  };

  return (
    <div className="w-full bg-[#1a1a2e] rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleCanvasClick}
        className="w-full cursor-pointer hover:opacity-80 transition-opacity"
        style={{ display: 'block' }}
      />
      <div className="px-4 py-2 bg-[#0f0f1e] text-xs text-gray-400 flex justify-between">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
