'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume2, Zap, Music, Mic, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface Track {
  id: string;
  name: string;
  volume: number;
  pan: number;
  solo: boolean;
  mute: boolean;
  automation: boolean;
  peakLevel: number;
}

interface MixingConsoleProps {
  onMixUpdate?: (tracks: Track[]) => void;
}

export const MultiTrackMixingConsole: React.FC<MixingConsoleProps> = ({ onMixUpdate }) => {
  const [tracks, setTracks] = useState<Track[]>([
    { id: '1', name: 'Lead Vocals', volume: 75, pan: 0, solo: false, mute: false, automation: false, peakLevel: 0 },
    { id: '2', name: 'Background Vocals', volume: 60, pan: -20, solo: false, mute: false, automation: false, peakLevel: 0 },
    { id: '3', name: 'Drums', volume: 70, pan: 0, solo: false, mute: false, automation: false, peakLevel: 0 },
    { id: '4', name: 'Bass', volume: 65, pan: 10, solo: false, mute: false, automation: false, peakLevel: 0 },
    { id: '5', name: 'Guitars', volume: 55, pan: -30, solo: false, mute: false, automation: false, peakLevel: 0 },
    { id: '6', name: 'Keys', volume: 50, pan: 30, solo: false, mute: false, automation: false, peakLevel: 0 },
  ]);

  const [masterVolume, setMasterVolume] = useState(80);
  const [masterPan, setMasterPan] = useState(0);
  const [limiterActive, setLimiterActive] = useState(true);

  const updateTrack = (id: string, updates: Partial<Track>) => {
    const updatedTracks = tracks.map((track) => (track.id === id ? { ...track, ...updates } : track));
    setTracks(updatedTracks);
    onMixUpdate?.(updatedTracks);
  };

  const toggleSolo = (id: string) => {
    const track = tracks.find((t) => t.id === id);
    if (!track) return;

    const newSoloState = !track.solo;
    const updatedTracks = tracks.map((t) => ({
      ...t,
      solo: t.id === id ? newSoloState : false,
    }));

    setTracks(updatedTracks);
    toast.success(`${track.name} ${newSoloState ? 'soloed' : 'unsoloed'}`);
  };

  const toggleMute = (id: string) => {
    const track = tracks.find((t) => t.id === id);
    if (!track) return;

    updateTrack(id, { mute: !track.mute });
    toast.success(`${track.name} ${!track.mute ? 'muted' : 'unmuted'}`);
  };

  const toggleAutomation = (id: string) => {
    const track = tracks.find((t) => t.id === id);
    if (!track) return;

    updateTrack(id, { automation: !track.automation });
    toast.success(`Automation ${!track.automation ? 'enabled' : 'disabled'} for ${track.name}`);
  };

  const simulatePeakLevel = (trackId: string) => {
    const newLevel = Math.random() * 100;
    updateTrack(trackId, { peakLevel: newLevel });
  };

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Multi-Track Mixing Console
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Controls */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <h3 className="text-white font-semibold mb-4">Master Output</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Master Volume</label>
              <Slider
                value={[masterVolume]}
                onValueChange={(value) => setMasterVolume(value[0])}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-slate-400 mt-1">{masterVolume}%</div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-2 block">Master Pan</label>
              <Slider
                value={[masterPan]}
                onValueChange={(value) => setMasterPan(value[0])}
                min={-100}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-slate-400 mt-1">{masterPan > 0 ? 'R' : 'L'} {Math.abs(masterPan)}</div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button
              size="sm"
              variant={limiterActive ? 'default' : 'outline'}
              onClick={() => setLimiterActive(!limiterActive)}
              className={limiterActive ? 'bg-red-600 hover:bg-red-700' : 'border-slate-600'}
            >
              <Zap className="w-4 h-4 mr-2" />
              Limiter {limiterActive ? 'ON' : 'OFF'}
            </Button>
            <span className="text-xs text-slate-400">Protects against clipping</span>
          </div>
        </div>

        {/* Individual Tracks */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {tracks.map((track) => (
            <div key={track.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-semibold text-sm">{track.name}</h4>
                  <div className="flex gap-2 mt-1">
                    <Button
                      size="xs"
                      variant={track.solo ? 'default' : 'outline'}
                      onClick={() => toggleSolo(track.id)}
                      className={track.solo ? 'bg-blue-600 hover:bg-blue-700 h-6 px-2' : 'border-slate-600 h-6 px-2'}
                    >
                      <span className="text-xs">S</span>
                    </Button>
                    <Button
                      size="xs"
                      variant={track.mute ? 'default' : 'outline'}
                      onClick={() => toggleMute(track.id)}
                      className={track.mute ? 'bg-red-600 hover:bg-red-700 h-6 px-2' : 'border-slate-600 h-6 px-2'}
                    >
                      <span className="text-xs">M</span>
                    </Button>
                    <Button
                      size="xs"
                      variant={track.automation ? 'default' : 'outline'}
                      onClick={() => toggleAutomation(track.id)}
                      className={track.automation ? 'bg-purple-600 hover:bg-purple-700 h-6 px-2' : 'border-slate-600 h-6 px-2'}
                    >
                      <span className="text-xs">A</span>
                    </Button>
                  </div>
                </div>

                {/* Peak Meter */}
                <div className="text-right">
                  <div className="w-8 h-24 bg-slate-900 rounded border border-slate-600 relative">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 rounded transition-all"
                      style={{ height: `${track.peakLevel}%` }}
                    />
                  </div>
                  <button
                    onClick={() => simulatePeakLevel(track.id)}
                    className="text-xs text-slate-400 hover:text-slate-300 mt-1"
                  >
                    Peak
                  </button>
                </div>
              </div>

              {/* Volume Fader */}
              <div className="mb-3">
                <label className="text-xs text-slate-400 mb-1 block">Volume</label>
                <Slider
                  value={[track.volume]}
                  onValueChange={(value) => updateTrack(track.id, { volume: value[0] })}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-slate-400 mt-1">{track.volume}%</div>
              </div>

              {/* Pan Control */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Pan</label>
                <Slider
                  value={[track.pan]}
                  onValueChange={(value) => updateTrack(track.id, { pan: value[0] })}
                  min={-100}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-slate-400 mt-1">{track.pan > 0 ? 'R' : 'L'} {Math.abs(track.pan)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Mixing Presets */}
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400 mb-2">Quick Presets</p>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" className="border-slate-600 text-xs" onClick={() => toast.success('Vocal-focused mix applied')}>
              Vocal Focus
            </Button>
            <Button size="sm" variant="outline" className="border-slate-600 text-xs" onClick={() => toast.success('Drum-heavy mix applied')}>
              Drum Heavy
            </Button>
            <Button size="sm" variant="outline" className="border-slate-600 text-xs" onClick={() => toast.success('Balanced mix applied')}>
              Balanced
            </Button>
            <Button size="sm" variant="outline" className="border-slate-600 text-xs" onClick={() => toast.success('Instrumental mix applied')}>
              Instrumental
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
