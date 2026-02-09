'use client';

import { useEffect, useRef, useState } from 'react';

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  height?: number;
  waveformColor?: string;
  spectrumColor?: string;
}

export function AudioVisualizer({
  audioRef,
  isPlaying,
  height = 100,
  waveformColor = '#d4af37',
  spectrumColor = '#d4af37',
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!audioRef.current || !canvasRef.current) return;

    try {
      // Initialize Web Audio API
      if (!audioContextRef.current) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        // Connect audio element to analyser
        const source = audioContext.createMediaElementAudioSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx || !analyserRef.current) return;

      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        animationIdRef.current = requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);

        // Clear canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw frequency spectrum
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height;

          // Gradient effect
          const hue = (i / bufferLength) * 60;
          ctx.fillStyle = spectrumColor;
          ctx.globalAlpha = 0.7 + (dataArray[i] / 255) * 0.3;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

          x += barWidth + 1;
        }

        ctx.globalAlpha = 1;
      };

      if (isPlaying) {
        draw();
      } else if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      return () => {
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
      };
    } catch (error) {
      console.error('Audio Visualizer Error:', error);
      setHasError(true);
    }
  }, [isPlaying, audioRef, height, spectrumColor]);

  if (hasError) {
    return null;
  }

  return (
    <div className="w-full rounded-lg overflow-hidden bg-background border border-border">
      <canvas
        ref={canvasRef}
        width={800}
        height={height}
        className="w-full"
        style={{ display: 'block' }}
      />
    </div>
  );
}
