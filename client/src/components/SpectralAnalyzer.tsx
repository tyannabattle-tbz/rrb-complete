import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Zap, Settings } from 'lucide-react';

export function SpectralAnalyzer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [frequency, setFrequency] = useState(1000);
  const [harmonics, setHarmonics] = useState<number[]>([]);
  const [balanceMode, setBalanceMode] = useState<'auto' | 'manual'>('auto');

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawSpectrum = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw frequency grid
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) {
        const x = (i / 10) * canvas.width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw frequency bars
      const barWidth = canvas.width / 64;
      for (let i = 0; i < 64; i++) {
        const height = Math.random() * canvas.height * 0.8;
        const hue = (i / 64) * 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 2, height);
      }

      // Draw harmonic peaks
      if (harmonics.length > 0) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        harmonics.forEach((harmonic) => {
          const x = (harmonic / 20000) * canvas.width;
          ctx.beginPath();
          ctx.moveTo(x, canvas.height);
          ctx.lineTo(x, canvas.height - 100);
          ctx.stroke();
        });
      }

      if (isAnalyzing) {
        requestAnimationFrame(drawSpectrum);
      }
    };

    drawSpectrum();
  }, [isAnalyzing, harmonics]);

  const analyzeFrequency = () => {
    setIsAnalyzing(true);
    const detected = [frequency, frequency * 2, frequency * 3, frequency * 4];
    setHarmonics(detected);

    setTimeout(() => {
      setIsAnalyzing(false);
    }, 3000);
  };

  const autoBalance = () => {
    setBalanceMode('auto');
    // Simulate AI-powered frequency balancing
    setFrequency(432); // Solfeggio frequency
  };

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            Real-Time Spectral Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <canvas
            ref={canvasRef}
            width={600}
            height={300}
            className="w-full bg-slate-900 rounded border border-slate-700"
          />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-2">Fundamental Frequency (Hz)</label>
              <input
                type="range"
                min="20"
                max="20000"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-white font-semibold mt-1">{frequency} Hz</div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-2">Analysis Mode</label>
              <select
                value={balanceMode}
                onChange={(e) => setBalanceMode(e.target.value as 'auto' | 'manual')}
                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-slate-300"
              >
                <option value="manual">Manual</option>
                <option value="auto">AI Auto-Balance</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-2">Detected Harmonics</label>
              <div className="text-sm text-green-400 font-semibold">{harmonics.length} peaks</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={analyzeFrequency}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Analyze Spectrum
            </Button>
            <Button
              onClick={autoBalance}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              AI Auto-Balance
            </Button>
          </div>

          {harmonics.length > 0 && (
            <div className="bg-slate-900 rounded p-3 border border-slate-700">
              <div className="text-xs text-slate-400 mb-2">Harmonic Series:</div>
              <div className="text-xs text-green-400 space-y-1">
                {harmonics.map((h, i) => (
                  <div key={i}>
                    Harmonic {i + 1}: {h} Hz ({(h / frequency).toFixed(1)}x)
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
