import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Volume2, BarChart3, Sliders } from 'lucide-react';
import { toast } from 'sonner';

interface MasteringPreset {
  name: string;
  genre: string;
  eq: { low: number; mid: number; high: number };
  compression: { threshold: number; ratio: number; makeup: number };
  limiting: { threshold: number; release: number };
  loudness: number; // LUFS
}

interface MasteringAnalysis {
  genre: string;
  confidence: number;
  peakLevel: number;
  averageLevel: number;
  dynamicRange: number;
  frequencyBalance: string;
}

export function MasteringEngine() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMastering, setIsMastering] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('pop');
  const [analysis, setAnalysis] = useState<MasteringAnalysis | null>(null);
  const [masteringSettings, setMasteringSettings] = useState<MasteringPreset>({
    name: 'Custom Master',
    genre: 'pop',
    eq: { low: 0, mid: 0, high: 0 },
    compression: { threshold: -20, ratio: 4, makeup: 0 },
    limiting: { threshold: -3, release: 100 },
    loudness: -14, // Standard loudness
  });

  const genrePresets: Record<string, MasteringPreset> = {
    pop: {
      name: 'Pop Master',
      genre: 'pop',
      eq: { low: 2, mid: -1, high: 3 },
      compression: { threshold: -18, ratio: 3, makeup: 2 },
      limiting: { threshold: -3, release: 100 },
      loudness: -14,
    },
    rock: {
      name: 'Rock Master',
      genre: 'rock',
      eq: { low: 4, mid: 0, high: 2 },
      compression: { threshold: -20, ratio: 4, makeup: 3 },
      limiting: { threshold: -2, release: 80 },
      loudness: -12,
    },
    hiphop: {
      name: 'Hip-Hop Master',
      genre: 'hiphop',
      eq: { low: 5, mid: -2, high: 1 },
      compression: { threshold: -15, ratio: 5, makeup: 4 },
      limiting: { threshold: -1, release: 120 },
      loudness: -13,
    },
    electronic: {
      name: 'Electronic Master',
      genre: 'electronic',
      eq: { low: 3, mid: 1, high: 4 },
      compression: { threshold: -22, ratio: 3, makeup: 1 },
      limiting: { threshold: -4, release: 150 },
      loudness: -15,
    },
    jazz: {
      name: 'Jazz Master',
      genre: 'jazz',
      eq: { low: 1, mid: 2, high: 1 },
      compression: { threshold: -25, ratio: 2, makeup: 1 },
      limiting: { threshold: -5, release: 200 },
      loudness: -16,
    },
    classical: {
      name: 'Classical Master',
      genre: 'classical',
      eq: { low: 0, mid: 0, high: 0 },
      compression: { threshold: -30, ratio: 1.5, makeup: 0 },
      limiting: { threshold: -6, release: 300 },
      loudness: -18,
    },
  };

  const analyzeAudio = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const analysisResult: MasteringAnalysis = {
      genre: selectedGenre,
      confidence: 0.87 + Math.random() * 0.1,
      peakLevel: -2.3 + Math.random() * 1,
      averageLevel: -18.5 + Math.random() * 2,
      dynamicRange: 12 + Math.random() * 4,
      frequencyBalance: 'Balanced with slight bass emphasis',
    };

    setAnalysis(analysisResult);
    setIsAnalyzing(false);
    toast.success('Audio analysis complete');
  };

  const applyMastering = async () => {
    if (!analysis) {
      toast.error('Please analyze audio first');
      return;
    }

    setIsMastering(true);
    // Simulate mastering process
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const preset = genrePresets[selectedGenre];
    setMasteringSettings(preset);
    setIsMastering(false);
    toast.success(`Applied ${preset.name} preset`);
  };

  const updateEQ = (band: 'low' | 'mid' | 'high', value: number) => {
    setMasteringSettings({
      ...masteringSettings,
      eq: { ...masteringSettings.eq, [band]: value },
    });
  };

  const updateCompression = (param: 'threshold' | 'ratio' | 'makeup', value: number) => {
    setMasteringSettings({
      ...masteringSettings,
      compression: { ...masteringSettings.compression, [param]: value },
    });
  };

  const updateLimiting = (param: 'threshold' | 'release', value: number) => {
    setMasteringSettings({
      ...masteringSettings,
      limiting: { ...masteringSettings.limiting, [param]: value },
    });
  };

  return (
    <div className="space-y-6">
      {/* Analysis Section */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Audio Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Detected Genre</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300"
            >
              <option value="pop">Pop</option>
              <option value="rock">Rock</option>
              <option value="hiphop">Hip-Hop</option>
              <option value="electronic">Electronic</option>
              <option value="jazz">Jazz</option>
              <option value="classical">Classical</option>
            </select>
          </div>

          <Button
            onClick={analyzeAudio}
            disabled={isAnalyzing}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Audio'}
          </Button>

          {analysis && (
            <div className="bg-slate-900 rounded p-3 border border-slate-700 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Genre Confidence:</span>
                  <div className="text-green-400 font-semibold">{(analysis.confidence * 100).toFixed(0)}%</div>
                </div>
                <div>
                  <span className="text-slate-400">Peak Level:</span>
                  <div className="text-yellow-400 font-semibold">{analysis.peakLevel.toFixed(1)} dB</div>
                </div>
                <div>
                  <span className="text-slate-400">Average Level:</span>
                  <div className="text-blue-400 font-semibold">{analysis.averageLevel.toFixed(1)} dB</div>
                </div>
                <div>
                  <span className="text-slate-400">Dynamic Range:</span>
                  <div className="text-purple-400 font-semibold">{analysis.dynamicRange.toFixed(1)} dB</div>
                </div>
              </div>
              <div className="text-xs text-slate-300">
                <span className="text-slate-400">Frequency Balance:</span> {analysis.frequencyBalance}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mastering Controls */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            Mastering Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={applyMastering}
            disabled={isMastering || !analysis}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isMastering ? 'Mastering...' : 'Apply AI Mastering'}
          </Button>

          {/* EQ Section */}
          <div className="space-y-2">
            <div className="text-sm text-slate-300 font-semibold">EQ</div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Low (100Hz)</span>
                  <span>{masteringSettings.eq.low} dB</span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  value={masteringSettings.eq.low}
                  onChange={(e) => updateEQ('low', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Mid (1kHz)</span>
                  <span>{masteringSettings.eq.mid} dB</span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  value={masteringSettings.eq.mid}
                  onChange={(e) => updateEQ('mid', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>High (10kHz)</span>
                  <span>{masteringSettings.eq.high} dB</span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  value={masteringSettings.eq.high}
                  onChange={(e) => updateEQ('high', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Compression Section */}
          <div className="space-y-2">
            <div className="text-sm text-slate-300 font-semibold">Compression</div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Threshold</span>
                  <span>{masteringSettings.compression.threshold} dB</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="0"
                  value={masteringSettings.compression.threshold}
                  onChange={(e) => updateCompression('threshold', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Ratio</span>
                  <span>{masteringSettings.compression.ratio}:1</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.1"
                  value={masteringSettings.compression.ratio}
                  onChange={(e) => updateCompression('ratio', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Makeup Gain</span>
                  <span>{masteringSettings.compression.makeup} dB</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  value={masteringSettings.compression.makeup}
                  onChange={(e) => updateCompression('makeup', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Limiting Section */}
          <div className="space-y-2">
            <div className="text-sm text-slate-300 font-semibold">Limiting</div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Threshold</span>
                  <span>{masteringSettings.limiting.threshold} dB</span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="0"
                  value={masteringSettings.limiting.threshold}
                  onChange={(e) => updateLimiting('threshold', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Release (ms)</span>
                  <span>{masteringSettings.limiting.release}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  value={masteringSettings.limiting.release}
                  onChange={(e) => updateLimiting('release', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Loudness */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Target Loudness (LUFS)</span>
              <span>{masteringSettings.loudness}</span>
            </div>
            <input
              type="range"
              min="-20"
              max="-8"
              value={masteringSettings.loudness}
              onChange={(e) =>
                setMasteringSettings({
                  ...masteringSettings,
                  loudness: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Before/After Comparison */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            Before/After Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 rounded p-3 border border-slate-700">
              <div className="text-xs text-slate-400 mb-2">Before Mastering</div>
              <div className="h-20 bg-slate-800 rounded flex items-end justify-around p-2">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-red-500 to-red-300 rounded-t mx-0.5"
                    style={{ height: `${Math.random() * 80 + 20}%` }}
                  />
                ))}
              </div>
              <div className="text-xs text-slate-400 mt-2">Peak: -2.3 dB</div>
            </div>
            <div className="bg-slate-900 rounded p-3 border border-slate-700">
              <div className="text-xs text-slate-400 mb-2">After Mastering</div>
              <div className="h-20 bg-slate-800 rounded flex items-end justify-around p-2">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-green-500 to-green-300 rounded-t mx-0.5"
                    style={{ height: `${Math.random() * 70 + 30}%` }}
                  />
                ))}
              </div>
              <div className="text-xs text-slate-400 mt-2">Peak: -1.2 dB</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Genre Presets Info */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Available Presets</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-slate-400 space-y-1">
          <div>✓ Pop - Bright, punchy, radio-ready</div>
          <div>✓ Rock - Aggressive, powerful, dynamic</div>
          <div>✓ Hip-Hop - Heavy bass, tight compression</div>
          <div>✓ Electronic - Clean, modern, loud</div>
          <div>✓ Jazz - Natural, dynamic, spacious</div>
          <div>✓ Classical - Transparent, minimal processing</div>
        </CardContent>
      </Card>
    </div>
  );
}
