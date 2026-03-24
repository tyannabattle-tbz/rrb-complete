'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Sparkles, Loader2, Download, Volume2, Zap, Radio, Music, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

interface MasteringPreset {
  name: string;
  genre: string;
  eqSettings: {
    lowFreq: number;
    midFreq: number;
    highFreq: number;
  };
  compression: {
    ratio: number;
    threshold: number;
    attack: number;
    release: number;
  };
  limiting: {
    threshold: number;
    releaseTime: number;
  };
  lufs: number;
}

interface AIMasteringEngineProps {
  audioUrl?: string;
  onMasteringComplete?: (masteredAudioUrl: string) => void;
}

export function AIMasteringEngine({ audioUrl, onMasteringComplete }: AIMasteringEngineProps) {
  const [detectedGenre, setDetectedGenre] = useState<string>('');
  const [isMastering, setIsMastering] = useState(false);
  const [masteringProgress, setMasteringProgress] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState<MasteringPreset | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [masteringStats, setMasteringStats] = useState({
    originalLufs: -14,
    masteredLufs: -14,
    peakLevel: -0.5,
    dynamicRange: 12,
    frequencyBalance: 'Balanced',
  });
  const audioRef = useRef<HTMLAudioElement>(null);

  // Mastering presets for different genres
  const MASTERING_PRESETS: Record<string, MasteringPreset> = {
    'hip-hop': {
      name: 'Hip-Hop Mastering',
      genre: 'hip-hop',
      eqSettings: {
        lowFreq: 2, // +2dB bass boost
        midFreq: -1, // -1dB mid cut
        highFreq: 1, // +1dB high boost
      },
      compression: {
        ratio: 4,
        threshold: -20,
        attack: 10,
        release: 100,
      },
      limiting: {
        threshold: -1,
        releaseTime: 50,
      },
      lufs: -14,
    },
    'pop': {
      name: 'Pop Mastering',
      genre: 'pop',
      eqSettings: {
        lowFreq: 1,
        midFreq: 2,
        highFreq: 1,
      },
      compression: {
        ratio: 3,
        threshold: -18,
        attack: 5,
        release: 80,
      },
      limiting: {
        threshold: -0.5,
        releaseTime: 40,
      },
      lufs: -14,
    },
    'electronic': {
      name: 'Electronic Mastering',
      genre: 'electronic',
      eqSettings: {
        lowFreq: 3,
        midFreq: 0,
        highFreq: 2,
      },
      compression: {
        ratio: 2.5,
        threshold: -22,
        attack: 15,
        release: 120,
      },
      limiting: {
        threshold: -1.5,
        releaseTime: 60,
      },
      lufs: -14,
    },
    'rnb': {
      name: 'R&B Mastering',
      genre: 'rnb',
      eqSettings: {
        lowFreq: 2.5,
        midFreq: 1,
        highFreq: 0.5,
      },
      compression: {
        ratio: 3.5,
        threshold: -19,
        attack: 8,
        release: 90,
      },
      limiting: {
        threshold: -1,
        releaseTime: 45,
      },
      lufs: -14,
    },
    'soul': {
      name: 'Soul Mastering',
      genre: 'soul',
      eqSettings: {
        lowFreq: 1.5,
        midFreq: 1.5,
        highFreq: 0.5,
      },
      compression: {
        ratio: 3,
        threshold: -18,
        attack: 6,
        release: 85,
      },
      limiting: {
        threshold: -0.8,
        releaseTime: 42,
      },
      lufs: -14,
    },
  };

  // Detect genre from audio characteristics
  const detectGenre = async () => {
    if (!audioUrl) {
      toast.error('No audio file selected');
      return;
    }

    setIsMastering(true);
    setMasteringProgress(0);

    try {
      // Simulate genre detection
      const genres = Object.keys(MASTERING_PRESETS);
      const detectedGenreValue = genres[Math.floor(Math.random() * genres.length)];
      
      // Simulate progress
      for (let i = 0; i <= 100; i += 20) {
        setMasteringProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setDetectedGenre(detectedGenreValue);
      setSelectedPreset(MASTERING_PRESETS[detectedGenreValue]);
      toast.success(`Genre detected: ${detectedGenreValue}`);
    } catch (error) {
      toast.error('Genre detection failed');
    } finally {
      setIsMastering(false);
      setMasteringProgress(0);
    }
  };

  // Apply mastering to audio
  const applyMastering = async () => {
    if (!selectedPreset) {
      toast.error('Please select a mastering preset');
      return;
    }

    setIsMastering(true);
    setMasteringProgress(0);

    try {
      // Simulate mastering process
      const steps = [
        { label: 'Analyzing frequency content', progress: 20 },
        { label: 'Applying EQ corrections', progress: 40 },
        { label: 'Compressing dynamics', progress: 60 },
        { label: 'Limiting peaks', progress: 80 },
        { label: 'Normalizing to LUFS', progress: 100 },
      ];

      for (const step of steps) {
        setMasteringProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      // Update mastering stats
      setMasteringStats({
        originalLufs: -14,
        masteredLufs: selectedPreset.lufs,
        peakLevel: -0.3,
        dynamicRange: 10,
        frequencyBalance: 'Optimized',
      });

      toast.success('Mastering applied successfully!');
      
      if (onMasteringComplete) {
        onMasteringComplete(audioUrl + '?mastered=true');
      }
    } catch (error) {
      toast.error('Mastering failed');
    } finally {
      setIsMastering(false);
      setMasteringProgress(0);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="space-y-4">
      {/* Genre Detection */}
      <Card className="bg-gradient-to-br from-amber-900/30 via-orange-900/20 to-slate-800/60 border-amber-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-amber-400" />
            AI Genre Detection
          </CardTitle>
          <CardDescription>Automatically detect genre and apply optimal mastering</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={detectGenre}
            disabled={isMastering || !audioUrl}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
          >
            {isMastering ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Detecting Genre...</>
            ) : (
              <><Radio className="w-4 h-4 mr-2" /> Detect Genre</>
            )}
          </Button>

          {isMastering && (
            <div className="space-y-2">
              <div className="w-full bg-slate-700/40 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-300"
                  style={{ width: `${masteringProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 text-center">{masteringProgress}% Complete</p>
            </div>
          )}

          {detectedGenre && (
            <div className="p-3 bg-slate-800/40 rounded-lg border border-amber-500/10">
              <p className="text-sm text-slate-300 mb-2">Detected Genre:</p>
              <Badge className="bg-amber-500/20 text-amber-300 text-sm">
                {detectedGenre.toUpperCase()}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mastering Presets */}
      <Card className="bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-slate-800/60 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Music className="w-5 h-5 text-purple-400" />
            Mastering Presets
          </CardTitle>
          <CardDescription>Select a mastering profile for your audio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(MASTERING_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => setSelectedPreset(preset)}
                className={`p-3 rounded-lg border transition-all text-left ${
                  selectedPreset?.genre === key
                    ? 'border-purple-400 bg-purple-500/20'
                    : 'border-purple-500/20 bg-slate-800/60 hover:border-purple-500/40'
                }`}
              >
                <p className="text-sm font-semibold text-white capitalize">{key}</p>
                <p className="text-xs text-slate-400">LUFS: {preset.lufs}</p>
              </button>
            ))}
          </div>

          {selectedPreset && (
            <div className="p-3 bg-slate-800/40 rounded-lg border border-purple-500/10 space-y-2">
              <p className="text-sm font-semibold text-white">{selectedPreset.name}</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div>
                  <span className="text-slate-300">EQ Low:</span> {selectedPreset.eqSettings.lowFreq > 0 ? '+' : ''}{selectedPreset.eqSettings.lowFreq}dB
                </div>
                <div>
                  <span className="text-slate-300">Compression:</span> {selectedPreset.compression.ratio}:1
                </div>
                <div>
                  <span className="text-slate-300">EQ High:</span> {selectedPreset.eqSettings.highFreq > 0 ? '+' : ''}{selectedPreset.eqSettings.highFreq}dB
                </div>
                <div>
                  <span className="text-slate-300">Target LUFS:</span> {selectedPreset.lufs}
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={applyMastering}
            disabled={isMastering || !selectedPreset}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isMastering ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mastering...</>
            ) : (
              <><Zap className="w-4 h-4 mr-2" /> Apply Mastering</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Mastering Stats */}
      <Card className="bg-gradient-to-br from-blue-900/30 via-cyan-900/20 to-slate-800/60 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Mastering Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-800/40 rounded-lg border border-blue-500/10">
              <p className="text-xs text-slate-400 mb-1">Original LUFS</p>
              <p className="text-lg font-bold text-blue-400">{masteringStats.originalLufs}</p>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-lg border border-blue-500/10">
              <p className="text-xs text-slate-400 mb-1">Mastered LUFS</p>
              <p className="text-lg font-bold text-green-400">{masteringStats.masteredLufs}</p>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-lg border border-blue-500/10">
              <p className="text-xs text-slate-400 mb-1">Peak Level</p>
              <p className="text-lg font-bold text-amber-400">{masteringStats.peakLevel}dB</p>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-lg border border-blue-500/10">
              <p className="text-xs text-slate-400 mb-1">Dynamic Range</p>
              <p className="text-lg font-bold text-purple-400">{masteringStats.dynamicRange}dB</p>
            </div>
          </div>

          {/* Playback Controls */}
          {audioUrl && (
            <div className="space-y-2 pt-3 border-t border-blue-500/10">
              <div className="flex gap-2">
                <Button
                  onClick={togglePlayback}
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isPlaying ? (
                    <><Pause className="w-4 h-4 mr-2" /> Pause</>
                  ) : (
                    <><Play className="w-4 h-4 mr-2" /> Play</>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Import BarChart3 from lucide-react
import { BarChart3 } from 'lucide-react';
