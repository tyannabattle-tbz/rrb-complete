import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, Sliders, Music } from 'lucide-react';
import { toast } from 'sonner';

interface Track {
  id: string;
  name: string;
  volume: number;
  pan: number;
  isSolo: boolean;
  isMuted: boolean;
  isPlaying: boolean;
  peakLevel: number;
}

interface MultiTrackMixerProps {
  audioBuffers: Map<string, AudioBuffer>;
  onMixerStateChange?: (state: any) => void;
}

export function MultiTrackMixer({ audioBuffers, onMixerStateChange }: MultiTrackMixerProps) {
  const [tracks, setTracks] = useState<Track[]>([
    { id: 'lead_vocals', name: 'Lead Vocals', volume: 80, pan: 0, isSolo: false, isMuted: false, isPlaying: false, peakLevel: 0 },
    { id: 'drums', name: 'Drums', volume: 75, pan: 0, isSolo: false, isMuted: false, isPlaying: false, peakLevel: 0 },
    { id: 'bass', name: 'Bass', volume: 70, pan: 0, isSolo: false, isMuted: false, isPlaying: false, peakLevel: 0 },
  ]);

  const [masterVolume, setMasterVolume] = useState(85);
  const [masterPan, setMasterPan] = useState(0);
  const [isLimiterActive, setIsLimiterActive] = useState(true);

  const updateTrackVolume = (trackId: string, volume: number) => {
    setTracks(tracks.map(t => t.id === trackId ? { ...t, volume } : t));
    toast.success(`${tracks.find(t => t.id === trackId)?.name} volume: ${volume}%`);
  };

  const updateTrackPan = (trackId: string, pan: number) => {
    setTracks(tracks.map(t => t.id === trackId ? { ...t, pan } : t));
  };

  const toggleTrackSolo = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (track?.isSolo) {
      setTracks(tracks.map(t => ({ ...t, isSolo: false })));
    } else {
      setTracks(tracks.map(t => ({ ...t, isSolo: t.id === trackId })));
    }
    toast.success(`Solo ${track?.name}: ${!track?.isSolo ? 'ON' : 'OFF'}`);
  };

  const toggleTrackMute = (trackId: string) => {
    setTracks(tracks.map(t => t.id === trackId ? { ...t, isMuted: !t.isMuted } : t));
    const track = tracks.find(t => t.id === trackId);
    toast.success(`Mute ${track?.name}: ${!track?.isMuted ? 'ON' : 'OFF'}`);
  };

  const playAllTracks = () => {
    setTracks(tracks.map(t => ({ ...t, isPlaying: true })));
    toast.success('All tracks playing');
  };

  const stopAllTracks = () => {
    setTracks(tracks.map(t => ({ ...t, isPlaying: false })));
    toast.success('All tracks stopped');
  };

  return (
    <div className="space-y-6">
      {/* Master Controls */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Music className="w-4 h-4 text-yellow-400" />
            Master Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Master Volume</label>
              <input
                type="range"
                min="0"
                max="100"
                value={masterVolume}
                onChange={(e) => setMasterVolume(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-slate-400 text-center mt-1">{masterVolume}%</div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Master Pan</label>
              <input
                type="range"
                min="-100"
                max="100"
                value={masterPan}
                onChange={(e) => setMasterPan(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-slate-400 text-center mt-1">{masterPan > 0 ? 'R' : masterPan < 0 ? 'L' : 'C'}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 flex-1" onClick={playAllTracks}>
              Play All
            </Button>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 flex-1" onClick={stopAllTracks}>
              Stop All
            </Button>
            <Button
              size="sm"
              variant={isLimiterActive ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => {
                setIsLimiterActive(!isLimiterActive);
                toast.success(`Limiter: ${!isLimiterActive ? 'ON' : 'OFF'}`);
              }}
            >
              Limiter {isLimiterActive ? 'ON' : 'OFF'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Individual Track Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tracks.map((track) => (
          <Card key={track.id} className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-xs">{track.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Peak Meter */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Peak Level</label>
                <div className="h-6 bg-slate-900 rounded border border-slate-700 flex items-center overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
                    style={{ width: `${Math.min(track.peakLevel, 100)}%` }}
                  />
                </div>
              </div>

              {/* Volume Fader */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Volume</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={track.volume}
                  onChange={(e) => updateTrackVolume(track.id, parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-slate-400 text-center">{track.volume}%</div>
              </div>

              {/* Pan Control */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Pan</label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={track.pan}
                  onChange={(e) => updateTrackPan(track.id, parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-slate-400 text-center">
                  {track.pan > 0 ? 'R' : track.pan < 0 ? 'L' : 'C'} {Math.abs(track.pan)}
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={track.isSolo ? 'default' : 'outline'}
                  className="flex-1 text-xs"
                  onClick={() => toggleTrackSolo(track.id)}
                >
                  {track.isSolo ? 'S' : 's'}
                </Button>
                <Button
                  size="sm"
                  variant={track.isMuted ? 'destructive' : 'outline'}
                  className="flex-1 text-xs"
                  onClick={() => toggleTrackMute(track.id)}
                >
                  {track.isMuted ? 'M' : 'm'}
                </Button>
              </div>

              {/* Status Indicator */}
              <div className="text-xs text-slate-400 text-center">
                {track.isPlaying ? (
                  <span className="text-green-400">● Playing</span>
                ) : (
                  <span className="text-slate-500">○ Stopped</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mixing Presets */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Mixing Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button size="sm" variant="outline" onClick={() => toast.success('Balanced preset loaded')}>
              Balanced
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.success('Vocal-focused preset loaded')}>
              Vocal Focus
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.success('Bass-heavy preset loaded')}>
              Bass Heavy
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.success('Bright preset loaded')}>
              Bright
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
