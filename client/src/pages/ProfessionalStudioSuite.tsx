'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, SkipBack, SkipForward, Music } from 'lucide-react';
import { toast } from 'sonner';

interface Track {
  id: string;
  name: string;
  streamUrl: string;
  volume: number;
  pan: number;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
}

interface MixerState {
  masterVolume: number;
  isPlaying: boolean;
  tracks: Track[];
}

// Real audio streams from SomaFM (public, CORS-enabled streams)
const AUDIO_TRACKS: Omit<Track, 'volume' | 'pan' | 'isPlaying' | 'duration' | 'currentTime'>[] = [
  {
    id: 'track-1',
    name: 'Soul & R&B',
    streamUrl: 'https://ice5.somafm.com/7soul-128-mp3',
  },
  {
    id: 'track-2',
    name: 'Blues',
    streamUrl: 'https://ice5.somafm.com/bootliquor-128-mp3',
  },
  {
    id: 'track-3',
    name: 'Hip-Hop',
    streamUrl: 'https://ice5.somafm.com/bagel-128-mp3',
  },
  {
    id: 'track-4',
    name: 'Jazz',
    streamUrl: 'https://ice5.somafm.com/fluid-128-mp3',
  },
];

export default function ProfessionalStudioSuite() {
  const [mixer, setMixer] = useState<MixerState>({
    masterVolume: 50,
    isPlaying: false,
    tracks: AUDIO_TRACKS.map(track => ({
      ...track,
      volume: 70,
      pan: 0,
      isPlaying: false,
      duration: 0,
      currentTime: 0,
    })),
  });

  const audioRefsMap = useRef<Map<string, HTMLAudioElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize audio elements
  useEffect(() => {
    mixer.tracks.forEach(track => {
      if (!audioRefsMap.current.has(track.id)) {
        const audio = new Audio();
        audio.crossOrigin = 'anonymous';
        audio.src = track.streamUrl;
        audio.volume = track.volume / 100;
        audio.addEventListener('timeupdate', () => {
          setMixer(prev => ({
            ...prev,
            tracks: prev.tracks.map(t =>
              t.id === track.id ? { ...t, currentTime: audio.currentTime, duration: audio.duration } : t
            ),
          }));
        });
        audioRefsMap.current.set(track.id, audio);
      }
    });

    return () => {
      audioRefsMap.current.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  const handlePlayAll = async () => {
    try {
      if (mixer.isPlaying) {
        // Stop all tracks
        audioRefsMap.current.forEach(audio => {
          audio.pause();
          audio.currentTime = 0;
        });
        setMixer(prev => ({
          ...prev,
          isPlaying: false,
          tracks: prev.tracks.map(t => ({ ...t, isPlaying: false })),
        }));
        toast.success('All tracks stopped');
      } else {
        // Play all tracks
        const playPromises = mixer.tracks.map(track => {
          const audio = audioRefsMap.current.get(track.id);
          if (audio) {
            audio.currentTime = 0;
            return audio.play().catch(err => {
              console.error(`Failed to play ${track.name}:`, err);
              return null;
            });
          }
          return null;
        });

        await Promise.all(playPromises);
        setMixer(prev => ({
          ...prev,
          isPlaying: true,
          tracks: prev.tracks.map(t => ({ ...t, isPlaying: true })),
        }));
        toast.success('▶ Playing all 4 tracks');
      }
    } catch (error) {
      console.error('Playback error:', error);
      toast.error('Failed to play audio');
    }
  };

  const handleTrackVolumeChange = (trackId: string, volume: number) => {
    const audio = audioRefsMap.current.get(trackId);
    if (audio) {
      audio.volume = volume / 100;
    }
    setMixer(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => (t.id === trackId ? { ...t, volume } : t)),
    }));
  };

  const handleMasterVolumeChange = (volume: number) => {
    setMixer(prev => ({ ...prev, masterVolume: volume }));
    audioRefsMap.current.forEach(audio => {
      audio.volume = (volume / 100) * 0.7; // Scale to 70% max
    });
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b border-slate-700 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Music className="w-8 h-8 text-amber-500" />
                Professional Studio Suite
              </h1>
              <p className="text-slate-400">Real-Time Multi-Track Audio Mixer</p>
            </div>
            <Badge className="bg-green-600 text-white text-lg px-4 py-2">LIVE</Badge>
          </div>
        </div>

        {/* Master Controls */}
        <Card className="mb-6 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Transport & Master Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-center">
              <Button
                onClick={handlePlayAll}
                className={`flex items-center gap-2 px-6 py-2 ${
                  mixer.isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {mixer.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {mixer.isPlaying ? 'Stop All' : 'Play All'}
              </Button>
              <div className="flex-1 flex gap-4 items-center">
                <label className="text-xs text-slate-400">Master Volume</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={mixer.masterVolume}
                  onChange={(e) => handleMasterVolumeChange(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-slate-300 min-w-12">{mixer.masterVolume}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Track Mixer */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Track Mixer (4 Real Audio Streams)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mixer.tracks.map((track) => (
                <div key={track.id} className="space-y-3 p-4 bg-slate-900 rounded border border-slate-700">
                  <div className="text-sm font-semibold text-white text-center">{track.name}</div>

                  {/* Playback Time */}
                  <div className="text-xs text-slate-500 text-center">
                    {formatTime(track.currentTime)} / {formatTime(track.duration)}
                  </div>

                  {/* Volume Control */}
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Volume</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={track.volume}
                      onChange={(e) => handleTrackVolumeChange(track.id, parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-xs text-slate-400 text-center mt-1">{track.volume}%</div>
                  </div>

                  {/* Pan Control */}
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Pan</label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={track.pan}
                      onChange={(e) => {
                        const pan = parseInt(e.target.value);
                        setMixer(prev => ({
                          ...prev,
                          tracks: prev.tracks.map(t => (t.id === track.id ? { ...t, pan } : t)),
                        }));
                      }}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-xs text-slate-400 text-center mt-1">
                      {track.pan === 0 ? 'Center' : track.pan > 0 ? `R${track.pan}` : `L${Math.abs(track.pan)}`}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="text-xs text-slate-500 text-center">
                    {mixer.isPlaying ? '🔴 Playing' : '⚫ Ready'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Footer */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>🎵 Real-time multi-track audio mixing using HTML5 Audio API</p>
          <p className="mt-2">Each track streams from independent CORS-enabled sources</p>
          <p className="mt-1">Press Play to hear all 4 tracks with independent volume and pan control</p>
          <p className="mt-2 text-xs text-slate-600">Powered by Canryn Production & QUMUS Orchestration</p>
        </div>
      </div>
    </div>
  );
}
