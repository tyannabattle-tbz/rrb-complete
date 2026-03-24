import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Volume2, BarChart3 } from 'lucide-react';

interface VisualizerTheme {
  name: string;
  colors: string[];
  style: 'bars' | 'waveform' | 'circular';
}

export function AudioVisualizerEnhanced() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(256));
  const [peakLevel, setPeakLevel] = useState(0);
  const [averageLevel, setAverageLevel] = useState(0);
  const [theme, setTheme] = useState<'bars' | 'waveform' | 'circular'>('bars');
  const [colorScheme, setColorScheme] = useState<'rainbow' | 'fire' | 'ice' | 'neon'>('rainbow');
  const animationFrameRef = useRef<number | null>(null);

  const themes: VisualizerTheme[] = [
    {
      name: 'Rainbow',
      colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'],
      style: 'bars',
    },
    {
      name: 'Fire',
      colors: ['#000000', '#ff0000', '#ff7f00', '#ffff00', '#ffffff'],
      style: 'bars',
    },
    {
      name: 'Ice',
      colors: ['#000033', '#0066cc', '#00ccff', '#ffffff'],
      style: 'waveform',
    },
    {
      name: 'Neon',
      colors: ['#ff00ff', '#00ffff', '#ffff00', '#ff0080'],
      style: 'circular',
    },
  ];

  const getColor = (index: number, value: number) => {
    const colors = {
      rainbow: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'],
      fire: ['#000000', '#ff0000', '#ff7f00', '#ffff00', '#ffffff'],
      ice: ['#000033', '#0066cc', '#00ccff', '#ffffff'],
      neon: ['#ff00ff', '#00ffff', '#ffff00', '#ff0080'],
    };
    const palette = colors[colorScheme];
    const colorIndex = Math.floor((value / 255) * (palette.length - 1));
    return palette[colorIndex];
  };

  const drawBars = (ctx: CanvasRenderingContext2D, data: Uint8Array) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const barWidth = width / data.length;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      const barHeight = (value / 255) * height;
      const x = i * barWidth;
      const y = height - barHeight;

      ctx.fillStyle = getColor(i, value);
      ctx.fillRect(x, y, barWidth - 1, barHeight);

      // Glow effect
      ctx.shadowColor = getColor(i, value);
      ctx.shadowBlur = 10;
    }
    ctx.shadowBlur = 0;
  };

  const drawWaveform = (ctx: CanvasRenderingContext2D, data: Uint8Array) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = getColor(0, data[0]);
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < data.length; i++) {
      const value = data[i] / 255;
      const x = (i / data.length) * width;
      const y = height / 2 + (value - 0.5) * height;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw center line
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  };

  const drawCircular = (ctx: CanvasRenderingContext2D, data: Uint8Array) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw center circle
    ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw frequency bars in circle
    for (let i = 0; i < data.length; i++) {
      const value = data[i] / 255;
      const angle = (i / data.length) * Math.PI * 2;
      const barLength = value * radius;

      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barLength);
      const y2 = centerY + Math.sin(angle) * (radius + barLength);

      ctx.strokeStyle = getColor(i, data[i]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate random frequency data
    const newData = new Uint8Array(256);
    for (let i = 0; i < newData.length; i++) {
      newData[i] = Math.floor(Math.random() * 255);
    }
    setFrequencyData(newData);

    // Calculate metrics
    const peak = Math.max(...newData);
    const average = newData.reduce((a, b) => a + b) / newData.length;
    setPeakLevel(peak);
    setAverageLevel(average);

    // Draw based on theme
    if (theme === 'bars') drawBars(ctx, newData);
    else if (theme === 'waveform') drawWaveform(ctx, newData);
    else if (theme === 'circular') drawCircular(ctx, newData);

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    animate();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [theme, colorScheme]);

  return (
    <div className="space-y-6">
      {/* Main Visualizer */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Real-Time Audio Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <canvas
            ref={canvasRef}
            width={800}
            height={300}
            className="w-full bg-slate-900 rounded border border-slate-700"
          />
        </CardContent>
      </Card>

      {/* Visualization Controls */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Visualization Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Style</label>
            <div className="grid grid-cols-3 gap-2">
              {(['bars', 'waveform', 'circular'] as const).map((style) => (
                <Button
                  key={style}
                  size="sm"
                  variant={theme === style ? 'default' : 'outline'}
                  onClick={() => setTheme(style)}
                  className="text-xs capitalize"
                >
                  {style}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-2 block">Color Scheme</label>
            <div className="grid grid-cols-4 gap-2">
              {(['rainbow', 'fire', 'ice', 'neon'] as const).map((scheme) => (
                <Button
                  key={scheme}
                  size="sm"
                  variant={colorScheme === scheme ? 'default' : 'outline'}
                  onClick={() => setColorScheme(scheme)}
                  className="text-xs capitalize"
                >
                  {scheme}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Meters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-green-400" />
            VU Meters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Peak Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Peak Level</span>
              <span className="text-lg font-bold text-red-400">{peakLevel}</span>
            </div>
            <div className="h-6 bg-slate-900 rounded border border-slate-700 flex items-center overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
                style={{ width: `${(peakLevel / 255) * 100}%` }}
              />
            </div>
          </div>

          {/* Average Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Average Level</span>
              <span className="text-lg font-bold text-yellow-400">{Math.round(averageLevel)}</span>
            </div>
            <div className="h-6 bg-slate-900 rounded border border-slate-700 flex items-center overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                style={{ width: `${(averageLevel / 255) * 100}%` }}
              />
            </div>
          </div>

          {/* Headroom */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Headroom</span>
              <span className="text-lg font-bold text-green-400">{Math.round(255 - peakLevel)} dB</span>
            </div>
            <div className="h-6 bg-slate-900 rounded border border-slate-700 flex items-center overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                style={{ width: `${((255 - peakLevel) / 255) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Frequency Analysis */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            Frequency Bands
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {[
              { name: 'Sub', range: '20-60Hz', color: 'bg-red-500' },
              { name: 'Bass', range: '60-250Hz', color: 'bg-orange-500' },
              { name: 'Mid', range: '250-2kHz', color: 'bg-yellow-500' },
              { name: 'Treble', range: '2-20kHz', color: 'bg-cyan-500' },
            ].map((band) => (
              <div key={band.name} className="bg-slate-900 rounded p-3 border border-slate-700 text-center">
                <div className="text-sm text-white font-semibold mb-2">{band.name}</div>
                <div className={`h-16 ${band.color} rounded mb-2 opacity-70`} />
                <div className="text-xs text-slate-400">{band.range}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Spectrum History */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Spectrum History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 bg-slate-900 rounded border border-slate-700 flex items-end justify-around p-2">
            {Array.from({ length: 32 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-t mx-0.5"
                style={{ height: `${Math.random() * 100}%` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
