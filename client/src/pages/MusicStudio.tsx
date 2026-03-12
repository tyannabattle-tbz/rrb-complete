import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';
import {
  Play, Pause, Square, Circle, SkipBack, SkipForward, Volume2, VolumeX,
  Plus, Trash2, Music, Mic, Headphones, Sliders, Download, Upload,
  Layers, Wand2, Copy, Scissors, ZoomIn, ZoomOut, Undo2, Redo2,
  Settings, Save, FolderOpen, Share2, Radio, Waves, Piano,
  Drum, Guitar, Timer, Gauge, ChevronDown, ChevronUp, Lock, Unlock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Track types
type TrackType = 'audio' | 'midi' | 'drum' | 'synth' | 'vocal' | 'master';

interface AudioClip {
  id: string;
  name: string;
  startBeat: number;
  durationBeats: number;
  color: string;
  volume: number;
  muted: boolean;
  waveformData?: number[];
}

interface Track {
  id: string;
  name: string;
  type: TrackType;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  armed: boolean;
  locked: boolean;
  color: string;
  clips: AudioClip[];
  effects: AudioEffect[];
}

interface AudioEffect {
  id: string;
  name: string;
  type: 'reverb' | 'delay' | 'eq' | 'compressor' | 'distortion' | 'chorus' | 'phaser' | 'filter';
  enabled: boolean;
  params: Record<string, number>;
}

// Virtual instruments
const INSTRUMENTS = [
  { id: 'piano', name: 'Grand Piano', icon: '🎹', type: 'midi' as TrackType },
  { id: 'synth', name: 'Analog Synth', icon: '🎛️', type: 'synth' as TrackType },
  { id: 'bass', name: 'Electric Bass', icon: '🎸', type: 'midi' as TrackType },
  { id: 'drums', name: 'Drum Kit', icon: '🥁', type: 'drum' as TrackType },
  { id: 'strings', name: 'String Ensemble', icon: '🎻', type: 'midi' as TrackType },
  { id: 'pad', name: 'Ambient Pad', icon: '🌊', type: 'synth' as TrackType },
  { id: 'vocal', name: 'Vocal Track', icon: '🎤', type: 'vocal' as TrackType },
  { id: 'fx', name: 'Sound FX', icon: '💫', type: 'audio' as TrackType },
];

const EFFECT_PRESETS: AudioEffect[] = [
  { id: 'rev1', name: 'Hall Reverb', type: 'reverb', enabled: true, params: { decay: 3.5, mix: 0.35, preDelay: 0.02 } },
  { id: 'del1', name: 'Stereo Delay', type: 'delay', enabled: true, params: { time: 0.375, feedback: 0.4, mix: 0.25 } },
  { id: 'eq1', name: 'Parametric EQ', type: 'eq', enabled: true, params: { low: 0, mid: 2, high: 1, freq: 2000 } },
  { id: 'comp1', name: 'Compressor', type: 'compressor', enabled: true, params: { threshold: -18, ratio: 4, attack: 10, release: 100 } },
  { id: 'dist1', name: 'Overdrive', type: 'distortion', enabled: true, params: { drive: 0.5, tone: 0.6, mix: 0.3 } },
  { id: 'cho1', name: 'Chorus', type: 'chorus', enabled: true, params: { rate: 1.5, depth: 0.5, mix: 0.3 } },
  { id: 'pha1', name: 'Phaser', type: 'phaser', enabled: true, params: { rate: 0.5, depth: 0.7, mix: 0.4 } },
  { id: 'flt1', name: 'Low-Pass Filter', type: 'filter', enabled: true, params: { frequency: 8000, resonance: 1, type: 0 } },
];

const TRACK_COLORS = ['#D4A843', '#8B5CF6', '#3B82F6', '#22C55E', '#EF4444', '#F97316', '#EC4899', '#06B6D4', '#A855F7', '#F59E0B'];

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

function generateWaveform(length: number): number[] {
  const data: number[] = [];
  for (let i = 0; i < length; i++) {
    data.push(Math.random() * 0.8 + 0.1);
  }
  return data;
}

export default function MusicStudio() {
  const { user } = useAuth();
  const [projectName, setProjectName] = useState('Untitled Project');
  const [bpm, setBpm] = useState(120);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [totalBeats, setTotalBeats] = useState(64);
  const [zoom, setZoom] = useState(1);
  const [masterVolume, setMasterVolume] = useState(80);
  const [masterMuted, setMasterMuted] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [selectedEffectId, setSelectedEffectId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'mixer' | 'effects' | 'instruments' | 'settings'>('mixer');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [frequency, setFrequency] = useState(432);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize with default tracks
  useEffect(() => {
    if (tracks.length === 0) {
      setTracks([
        {
          id: generateId(), name: 'Drums', type: 'drum', volume: 75, pan: 0, muted: false, solo: false,
          armed: false, locked: false, color: TRACK_COLORS[0],
          clips: [{ id: generateId(), name: 'Beat 1', startBeat: 0, durationBeats: 16, color: TRACK_COLORS[0], volume: 1, muted: false, waveformData: generateWaveform(64) }],
          effects: []
        },
        {
          id: generateId(), name: 'Bass', type: 'midi', volume: 70, pan: 0, muted: false, solo: false,
          armed: false, locked: false, color: TRACK_COLORS[1],
          clips: [{ id: generateId(), name: 'Bass Line', startBeat: 0, durationBeats: 16, color: TRACK_COLORS[1], volume: 1, muted: false, waveformData: generateWaveform(64) }],
          effects: []
        },
        {
          id: generateId(), name: 'Keys', type: 'midi', volume: 65, pan: -20, muted: false, solo: false,
          armed: false, locked: false, color: TRACK_COLORS[2],
          clips: [{ id: generateId(), name: 'Chords', startBeat: 4, durationBeats: 12, color: TRACK_COLORS[2], volume: 1, muted: false, waveformData: generateWaveform(48) }],
          effects: []
        },
        {
          id: generateId(), name: 'Vocals', type: 'vocal', volume: 80, pan: 0, muted: false, solo: false,
          armed: false, locked: false, color: TRACK_COLORS[3],
          clips: [],
          effects: [{ ...EFFECT_PRESETS[0], id: generateId() }, { ...EFFECT_PRESETS[3], id: generateId() }]
        },
      ]);
    }
  }, []);

  // Playback simulation
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentBeat(prev => {
          if (prev >= totalBeats - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, (60 / bpm) * 250); // Quarter of a beat for smoother animation
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, bpm, totalBeats]);

  const selectedTrack = tracks.find(t => t.id === selectedTrackId);

  const addTrack = useCallback((instrument: typeof INSTRUMENTS[0]) => {
    const colorIndex = tracks.length % TRACK_COLORS.length;
    const newTrack: Track = {
      id: generateId(), name: instrument.name, type: instrument.type,
      volume: 75, pan: 0, muted: false, solo: false, armed: false, locked: false,
      color: TRACK_COLORS[colorIndex], clips: [], effects: []
    };
    setTracks(prev => [...prev, newTrack]);
    setSelectedTrackId(newTrack.id);
    toast.success(`Added ${instrument.name} track`);
  }, [tracks.length]);

  const removeTrack = useCallback((trackId: string) => {
    setTracks(prev => prev.filter(t => t.id !== trackId));
    if (selectedTrackId === trackId) setSelectedTrackId(null);
    toast.success('Track removed');
  }, [selectedTrackId]);

  const updateTrack = useCallback((trackId: string, updates: Partial<Track>) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, ...updates } : t));
  }, []);

  const toggleMute = useCallback((trackId: string) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t));
  }, []);

  const toggleSolo = useCallback((trackId: string) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, solo: t.id === trackId ? !t.solo : t.solo } : t));
  }, []);

  const toggleArm = useCallback((trackId: string) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, armed: !t.armed } : t));
  }, []);

  const addEffectToTrack = useCallback((trackId: string, effect: AudioEffect) => {
    const newEffect = { ...effect, id: generateId() };
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, effects: [...t.effects, newEffect] } : t));
    toast.success(`Added ${effect.name} to track`);
  }, []);

  const addClipToTrack = useCallback((trackId: string) => {
    const newClip: AudioClip = {
      id: generateId(), name: 'New Clip', startBeat: currentBeat,
      durationBeats: 8, color: tracks.find(t => t.id === trackId)?.color || TRACK_COLORS[0],
      volume: 1, muted: false, waveformData: generateWaveform(32)
    };
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, clips: [...t.clips, newClip] } : t));
  }, [currentBeat, tracks]);

  const handleRecord = useCallback(async () => {
    if (isRecording) {
      setIsRecording(false);
      setIsPlaying(false);
      toast.success('Recording stopped');
      return;
    }
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop()); // Just checking permission
      setIsRecording(true);
      setIsPlaying(true);
      toast.success('Recording started — speak or play into your microphone');
    } catch {
      toast.error('Microphone access denied. Please allow microphone access to record.');
    }
  }, [isRecording]);

  const handleExport = useCallback(() => {
    // Generate a project JSON export
    const project = {
      name: projectName,
      bpm,
      timeSignature,
      frequency,
      totalBeats,
      tracks: tracks.map(t => ({
        name: t.name, type: t.type, volume: t.volume, pan: t.pan,
        clips: t.clips.length, effects: t.effects.map(e => e.name)
      })),
      exportedAt: new Date().toISOString(),
      credit: '© Canryn Production and its subsidiaries'
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}_project.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Project exported');
  }, [projectName, bpm, timeSignature, frequency, totalBeats, tracks]);

  const formatTime = (beat: number) => {
    const bar = Math.floor(beat / 4) + 1;
    const beatInBar = (beat % 4) + 1;
    return `${bar}:${beatInBar}`;
  };

  const beatToPixels = (beats: number) => beats * 24 * zoom;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E8E0D0] flex flex-col">
      {/* Transport Bar */}
      <div className="border-b border-[#D4A843]/20 bg-[#0A0A0A]/95 backdrop-blur px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Music className="w-6 h-6 text-[#D4A843]" />
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-transparent border-none text-lg font-bold text-[#D4A843] w-56 focus:ring-0 px-0"
            />
            <Badge className="bg-[#D4A843]/10 text-[#D4A843] text-xs">{tracks.length} tracks</Badge>
          </div>

          {/* Transport Controls */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setCurrentBeat(0)} title="Rewind">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className={isPlaying ? 'bg-[#D4A843] text-black' : 'bg-[#222] text-[#D4A843]'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setIsPlaying(false); setCurrentBeat(0); }} title="Stop">
              <Square className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleRecord}
              className={isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-[#222] text-red-400'}
              title="Record"
            >
              <Circle className="w-4 h-4" fill={isRecording ? 'currentColor' : 'none'} />
            </Button>

            {/* Time display */}
            <div className="bg-[#111] border border-[#D4A843]/20 rounded px-3 py-1 font-mono text-sm text-[#D4A843] min-w-[80px] text-center">
              {formatTime(currentBeat)}
            </div>
          </div>

          {/* BPM & Settings */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-[#D4A843]/60" />
              <Input
                type="number"
                value={bpm}
                onChange={(e) => setBpm(Math.max(20, Math.min(300, parseInt(e.target.value) || 120)))}
                className="w-16 bg-[#111] border-[#D4A843]/20 text-center text-sm"
              />
              <span className="text-xs text-[#E8E0D0]/40">BPM</span>
            </div>
            <div className="flex items-center gap-1">
              <Waves className="w-3 h-3 text-[#D4A843]/60" />
              <Select value={String(frequency)} onValueChange={(v) => setFrequency(Number(v))}>
                <SelectTrigger className="w-20 bg-[#111] border-[#D4A843]/20 text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="432">432 Hz</SelectItem>
                  <SelectItem value="440">440 Hz</SelectItem>
                  <SelectItem value="528">528 Hz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}><ZoomOut className="w-3 h-3" /></Button>
              <span className="text-xs text-[#E8E0D0]/40">{Math.round(zoom * 100)}%</span>
              <Button size="sm" variant="ghost" onClick={() => setZoom(z => Math.min(4, z + 0.25))}><ZoomIn className="w-3 h-3" /></Button>
            </div>
            <Button size="sm" variant="outline" onClick={handleExport} className="border-[#D4A843]/30 text-[#D4A843]">
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Track List & Timeline */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Timeline ruler */}
          <div className="flex border-b border-[#D4A843]/10 bg-[#050505]">
            <div className="w-52 flex-shrink-0 border-r border-[#D4A843]/10 px-2 py-1 flex items-center justify-between">
              <span className="text-[10px] text-[#E8E0D0]/40 font-bold">TRACKS</span>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0"><Plus className="w-3 h-3 text-[#D4A843]" /></Button>
                </DialogTrigger>
                <DialogContent className="bg-[#111] border-[#D4A843]/20 text-[#E8E0D0]">
                  <DialogHeader>
                    <DialogTitle className="text-[#D4A843]">Add Instrument Track</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {INSTRUMENTS.map(inst => (
                      <button
                        key={inst.id}
                        onClick={() => addTrack(inst)}
                        className="p-3 rounded-lg border border-[#D4A843]/20 hover:border-[#D4A843] hover:bg-[#D4A843]/10 transition-all text-left flex items-center gap-3"
                      >
                        <span className="text-2xl">{inst.icon}</span>
                        <div>
                          <div className="text-sm font-bold">{inst.name}</div>
                          <div className="text-[10px] text-[#E8E0D0]/40">{inst.type.toUpperCase()}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex-1 overflow-x-auto">
              <div className="relative h-6" style={{ width: `${beatToPixels(totalBeats)}px` }}>
                {Array.from({ length: Math.ceil(totalBeats / 4) }, (_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 h-full border-l border-[#D4A843]/10 text-[8px] text-[#E8E0D0]/30 pl-1"
                    style={{ left: `${beatToPixels(i * 4)}px` }}
                  >
                    {i + 1}
                  </div>
                ))}
                {/* Playhead */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-[#D4A843] z-10"
                  style={{ left: `${beatToPixels(currentBeat)}px`, transition: 'left 0.05s linear' }}
                />
              </div>
            </div>
          </div>

          {/* Track rows */}
          <div className="flex-1 overflow-y-auto">
            {tracks.map(track => (
              <div
                key={track.id}
                className={`flex border-b border-[#D4A843]/5 ${
                  selectedTrackId === track.id ? 'bg-[#D4A843]/5' : 'hover:bg-[#111]'
                }`}
                onClick={() => setSelectedTrackId(track.id)}
              >
                {/* Track header */}
                <div className="w-52 flex-shrink-0 border-r border-[#D4A843]/10 p-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-8 rounded-full" style={{ backgroundColor: track.color }} />
                    <div className="flex-1 min-w-0">
                      <Input
                        value={track.name}
                        onChange={(e) => updateTrack(track.id, { name: e.target.value })}
                        className="bg-transparent border-none text-xs font-bold p-0 h-5 focus:ring-0"
                      />
                      <span className="text-[8px] text-[#E8E0D0]/30 uppercase">{track.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleMute(track.id); }}
                      className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${track.muted ? 'bg-yellow-500/20 text-yellow-400' : 'bg-[#222] text-[#E8E0D0]/40'}`}
                    >
                      M
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSolo(track.id); }}
                      className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${track.solo ? 'bg-blue-500/20 text-blue-400' : 'bg-[#222] text-[#E8E0D0]/40'}`}
                    >
                      S
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleArm(track.id); }}
                      className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${track.armed ? 'bg-red-500/20 text-red-400' : 'bg-[#222] text-[#E8E0D0]/40'}`}
                    >
                      R
                    </button>
                    <div className="flex-1 mx-1">
                      <Slider
                        value={[track.volume]}
                        onValueChange={([v]) => updateTrack(track.id, { volume: v })}
                        max={100} min={0} step={1}
                        className="h-1"
                      />
                    </div>
                    <span className="text-[8px] text-[#E8E0D0]/30 w-6 text-right">{track.volume}</span>
                  </div>
                </div>

                {/* Track timeline */}
                <div className="flex-1 overflow-x-auto relative" style={{ minHeight: '60px' }}>
                  <div className="relative h-full" style={{ width: `${beatToPixels(totalBeats)}px` }}>
                    {/* Grid lines */}
                    {Array.from({ length: Math.ceil(totalBeats / 4) }, (_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 h-full border-l border-[#D4A843]/5"
                        style={{ left: `${beatToPixels(i * 4)}px` }}
                      />
                    ))}
                    {/* Clips */}
                    {track.clips.map(clip => (
                      <div
                        key={clip.id}
                        className="absolute top-1 bottom-1 rounded overflow-hidden cursor-pointer hover:brightness-110 transition-all"
                        style={{
                          left: `${beatToPixels(clip.startBeat)}px`,
                          width: `${beatToPixels(clip.durationBeats)}px`,
                          backgroundColor: `${clip.color}20`,
                          border: `1px solid ${clip.color}60`,
                        }}
                        onDoubleClick={() => addClipToTrack(track.id)}
                      >
                        <div className="px-1 py-0.5 text-[8px] font-bold truncate" style={{ color: clip.color }}>
                          {clip.name}
                        </div>
                        {/* Waveform visualization */}
                        {clip.waveformData && (
                          <div className="flex items-end h-6 px-0.5 gap-px">
                            {clip.waveformData.slice(0, Math.floor(beatToPixels(clip.durationBeats) / 3)).map((v, i) => (
                              <div
                                key={i}
                                className="flex-1 rounded-t-sm"
                                style={{
                                  height: `${v * 100}%`,
                                  backgroundColor: `${clip.color}80`,
                                  minWidth: '1px',
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {/* Playhead */}
                    <div
                      className="absolute top-0 h-full w-0.5 bg-[#D4A843] z-10 pointer-events-none"
                      style={{ left: `${beatToPixels(currentBeat)}px`, transition: 'left 0.05s linear' }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Add track row */}
            <div className="flex items-center justify-center py-4 border-b border-[#D4A843]/5">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="text-[#D4A843]/40 hover:text-[#D4A843]">
                    <Plus className="w-4 h-4 mr-1" /> Add Track
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#111] border-[#D4A843]/20 text-[#E8E0D0]">
                  <DialogHeader>
                    <DialogTitle className="text-[#D4A843]">Add Instrument Track</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {INSTRUMENTS.map(inst => (
                      <button
                        key={inst.id}
                        onClick={() => addTrack(inst)}
                        className="p-3 rounded-lg border border-[#D4A843]/20 hover:border-[#D4A843] hover:bg-[#D4A843]/10 transition-all text-left flex items-center gap-3"
                      >
                        <span className="text-2xl">{inst.icon}</span>
                        <div>
                          <div className="text-sm font-bold">{inst.name}</div>
                          <div className="text-[10px] text-[#E8E0D0]/40">{inst.type.toUpperCase()}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Right Panel - Mixer/Effects/Instruments */}
        <div className="w-72 border-l border-[#D4A843]/10 bg-[#050505] overflow-y-auto flex-shrink-0">
          <Tabs value={activePanel} onValueChange={(v) => setActivePanel(v as any)}>
            <TabsList className="w-full bg-[#111] rounded-none border-b border-[#D4A843]/10">
              <TabsTrigger value="mixer" className="flex-1 text-[10px]">Mixer</TabsTrigger>
              <TabsTrigger value="effects" className="flex-1 text-[10px]">FX</TabsTrigger>
              <TabsTrigger value="instruments" className="flex-1 text-[10px]">Inst</TabsTrigger>
              <TabsTrigger value="settings" className="flex-1 text-[10px]">Set</TabsTrigger>
            </TabsList>

            {/* Mixer */}
            <TabsContent value="mixer" className="p-3 space-y-3">
              <h4 className="text-xs font-bold text-[#D4A843]">Channel Mixer</h4>
              {/* Master */}
              <div className="p-2 rounded-lg bg-[#111] border border-[#D4A843]/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#D4A843]">MASTER</span>
                  <button onClick={() => setMasterMuted(!masterMuted)}>
                    {masterMuted ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3 text-[#D4A843]" />}
                  </button>
                </div>
                <Slider value={[masterVolume]} onValueChange={([v]) => setMasterVolume(v)} max={100} min={0} />
                <div className="text-[8px] text-center text-[#E8E0D0]/30 mt-1">{masterVolume}%</div>
              </div>
              {/* Track channels */}
              {tracks.map(track => (
                <div
                  key={track.id}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    selectedTrackId === track.id ? 'bg-[#D4A843]/5 border-[#D4A843]/30' : 'bg-[#111] border-[#D4A843]/10'
                  }`}
                  onClick={() => setSelectedTrackId(track.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: track.color }} />
                      <span className="text-[10px] font-bold truncate">{track.name}</span>
                    </div>
                    <div className="flex gap-0.5">
                      <button onClick={(e) => { e.stopPropagation(); toggleMute(track.id); }}
                        className={`text-[7px] px-1 rounded ${track.muted ? 'text-yellow-400' : 'text-[#E8E0D0]/20'}`}>M</button>
                      <button onClick={(e) => { e.stopPropagation(); toggleSolo(track.id); }}
                        className={`text-[7px] px-1 rounded ${track.solo ? 'text-blue-400' : 'text-[#E8E0D0]/20'}`}>S</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] text-[#E8E0D0]/30">Vol</span>
                    <Slider value={[track.volume]} onValueChange={([v]) => updateTrack(track.id, { volume: v })} max={100} min={0} className="flex-1" />
                    <span className="text-[8px] text-[#E8E0D0]/30 w-5 text-right">{track.volume}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] text-[#E8E0D0]/30">Pan</span>
                    <Slider value={[track.pan + 50]} onValueChange={([v]) => updateTrack(track.id, { pan: v - 50 })} max={100} min={0} className="flex-1" />
                    <span className="text-[8px] text-[#E8E0D0]/30 w-5 text-right">{track.pan > 0 ? `R${track.pan}` : track.pan < 0 ? `L${Math.abs(track.pan)}` : 'C'}</span>
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* Effects */}
            <TabsContent value="effects" className="p-3 space-y-3">
              <h4 className="text-xs font-bold text-[#D4A843]">
                {selectedTrack ? `FX: ${selectedTrack.name}` : 'Select a track'}
              </h4>
              {selectedTrack && (
                <>
                  {/* Current effects */}
                  {selectedTrack.effects.map(effect => (
                    <div key={effect.id} className="p-2 rounded-lg bg-[#111] border border-[#D4A843]/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold">{effect.name}</span>
                        <button
                          onClick={() => {
                            setTracks(prev => prev.map(t => t.id === selectedTrackId
                              ? { ...t, effects: t.effects.map(e => e.id === effect.id ? { ...e, enabled: !e.enabled } : e) }
                              : t
                            ));
                          }}
                          className={`text-[8px] px-1.5 py-0.5 rounded ${effect.enabled ? 'bg-green-500/20 text-green-400' : 'bg-[#222] text-[#E8E0D0]/30'}`}
                        >
                          {effect.enabled ? 'ON' : 'OFF'}
                        </button>
                      </div>
                      {Object.entries(effect.params).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 mb-1">
                          <span className="text-[8px] text-[#E8E0D0]/40 w-12 capitalize">{key}</span>
                          <Slider
                            value={[typeof value === 'number' ? value * 10 : 0]}
                            onValueChange={([v]) => {
                              setTracks(prev => prev.map(t => t.id === selectedTrackId
                                ? { ...t, effects: t.effects.map(e => e.id === effect.id
                                  ? { ...e, params: { ...e.params, [key]: v / 10 } } : e) }
                                : t
                              ));
                            }}
                            max={100} min={0} className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                  {/* Add effect */}
                  <div>
                    <h5 className="text-[10px] text-[#E8E0D0]/40 mb-1">Add Effect</h5>
                    <div className="grid grid-cols-2 gap-1">
                      {EFFECT_PRESETS.map(effect => (
                        <button
                          key={effect.id}
                          onClick={() => addEffectToTrack(selectedTrackId!, effect)}
                          className="p-1.5 rounded border border-[#D4A843]/10 hover:border-[#D4A843]/50 text-[9px] text-left transition-all"
                        >
                          {effect.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Instruments */}
            <TabsContent value="instruments" className="p-3 space-y-3">
              <h4 className="text-xs font-bold text-[#D4A843]">Virtual Instruments</h4>
              <div className="space-y-2">
                {INSTRUMENTS.map(inst => (
                  <button
                    key={inst.id}
                    onClick={() => addTrack(inst)}
                    className="w-full p-3 rounded-lg border border-[#D4A843]/10 hover:border-[#D4A843] hover:bg-[#D4A843]/10 transition-all text-left flex items-center gap-3"
                  >
                    <span className="text-2xl">{inst.icon}</span>
                    <div>
                      <div className="text-sm font-bold">{inst.name}</div>
                      <div className="text-[10px] text-[#E8E0D0]/40">{inst.type.toUpperCase()} Track</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="border-t border-[#D4A843]/10 pt-3">
                <h5 className="text-[10px] text-[#D4A843] font-bold mb-2">Sample Library</h5>
                <div className="space-y-1">
                  {['Kick Drum', 'Snare', 'Hi-Hat', 'Clap', 'Bass Drop', 'Vocal Chop', '808 Sub', 'Cymbal Crash'].map(sample => (
                    <button
                      key={sample}
                      className="w-full text-left text-[10px] p-1.5 rounded hover:bg-[#D4A843]/10 text-[#E8E0D0]/60 transition-all flex items-center gap-2"
                      onClick={() => toast.info(`${sample} — drag to timeline to use`)}
                    >
                      <Music className="w-3 h-3 text-[#D4A843]/40" /> {sample}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings" className="p-3 space-y-3">
              <h4 className="text-xs font-bold text-[#D4A843]">Project Settings</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-[#E8E0D0]/50">Project Name</label>
                  <Input value={projectName} onChange={(e) => setProjectName(e.target.value)}
                    className="bg-[#111] border-[#D4A843]/20 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-[#E8E0D0]/50">Tempo (BPM)</label>
                  <Input type="number" value={bpm} onChange={(e) => setBpm(Number(e.target.value))}
                    className="bg-[#111] border-[#D4A843]/20 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-[#E8E0D0]/50">Time Signature</label>
                  <Select value={timeSignature} onValueChange={setTimeSignature}>
                    <SelectTrigger className="bg-[#111] border-[#D4A843]/20 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4/4">4/4</SelectItem>
                      <SelectItem value="3/4">3/4</SelectItem>
                      <SelectItem value="6/8">6/8</SelectItem>
                      <SelectItem value="2/4">2/4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-[#E8E0D0]/50">Base Frequency</label>
                  <Select value={String(frequency)} onValueChange={(v) => setFrequency(Number(v))}>
                    <SelectTrigger className="bg-[#111] border-[#D4A843]/20 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="432">432 Hz (Healing)</SelectItem>
                      <SelectItem value="440">440 Hz (Standard)</SelectItem>
                      <SelectItem value="528">528 Hz (Love)</SelectItem>
                      <SelectItem value="396">396 Hz (Liberation)</SelectItem>
                      <SelectItem value="639">639 Hz (Connection)</SelectItem>
                      <SelectItem value="741">741 Hz (Expression)</SelectItem>
                      <SelectItem value="852">852 Hz (Intuition)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-[#E8E0D0]/50">Total Bars</label>
                  <Input type="number" value={totalBeats / 4} onChange={(e) => setTotalBeats(Math.max(4, Number(e.target.value) * 4))}
                    className="bg-[#111] border-[#D4A843]/20 text-sm" />
                </div>
              </div>
              <div className="border-t border-[#D4A843]/10 pt-3">
                <h5 className="text-[10px] text-[#D4A843] font-bold mb-2">Quick Actions</h5>
                <div className="space-y-1">
                  <Button size="sm" variant="ghost" className="w-full justify-start text-xs" onClick={handleExport}>
                    <Download className="w-3 h-3 mr-2" /> Export Project
                  </Button>
                  <Button size="sm" variant="ghost" className="w-full justify-start text-xs" onClick={() => toast.info('Connect to RRB Radio for live broadcast')}>
                    <Radio className="w-3 h-3 mr-2" /> Broadcast to RRB Radio
                  </Button>
                  <Button size="sm" variant="ghost" className="w-full justify-start text-xs" onClick={() => toast.info('Share project with collaborators')}>
                    <Share2 className="w-3 h-3 mr-2" /> Share Project
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#D4A843]/10 bg-[#050505] px-4 py-1 flex items-center justify-between">
        <span className="text-[10px] text-[#E8E0D0]/30">© Canryn Production and its subsidiaries. Music Studio powered by QUMUS.</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#E8E0D0]/30">{frequency} Hz • {bpm} BPM • {timeSignature}</span>
          {isRecording && <Badge className="bg-red-500/20 text-red-400 text-[8px] animate-pulse">REC</Badge>}
        </div>
      </div>
    </div>
  );
}
