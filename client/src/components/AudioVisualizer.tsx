/**
 * Audio Visualizer Component
 * 
 * Real-time audio visualization using Web Audio API
 * Shows frequency spectrum and waveform
 */

import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

interface AudioVisualizerProps {
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}

export function AudioVisualizer({
  audioContext,
  analyser,
  isPlaying,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    // Configure analyser
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      if (!isPlaying) {
        // Draw static bars when not playing
        ctx.fillStyle = 'rgb(30, 30, 30)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = 'rgb(100, 100, 100)';
        const barWidth = width / bufferLength;
        for (let i = 0; i < bufferLength; i++) {
          ctx.fillRect(i * barWidth, height - 10, barWidth - 1, 10);
        }
        return;
      }

      // Get frequency data
      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.fillStyle = 'rgb(30, 30, 30)';
      ctx.fillRect(0, 0, width, height);

      // Draw frequency bars
      const barWidth = width / bufferLength;
      let hue = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;

        // Color gradient based on frequency
        hue = (i / bufferLength) * 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(
          i * barWidth,
          height - barHeight,
          barWidth - 1,
          barHeight
        );

        // Add reflection effect
        ctx.globalAlpha = 0.3;
        ctx.fillRect(
          i * barWidth,
          height,
          barWidth - 1,
          barHeight * 0.3
        );
        ctx.globalAlpha = 1;
      }

      // Draw waveform
      analyser.getByteTimeDomainData(dataArray);

      ctx.strokeStyle = 'rgb(0, 255, 100)';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isPlaying]);

  return (
    <Card className="p-4 border-orange-700 bg-slate-900">
      <canvas
        ref={canvasRef}
        className="w-full h-32 rounded"
        style={{ display: 'block' }}
      />
      <p className="text-xs text-slate-400 mt-2 text-center">
        {isPlaying ? '🎵 Real-time audio visualization' : '⚫ Visualizer inactive'}
      </p>
    </Card>
  );
}
