import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Play, Pause, Square, SkipBack, SkipForward, Repeat, Mic, Volume2,
  VolumeX, ChevronDown, ChevronRight, Folder, Music, Film, Image,
  Settings, Save, Download, Upload, Plus, Minus, Maximize2, Minimize2,
  Headphones, Radio, Sliders, Layers, Waveform, Zap, Eye, EyeOff,
  Lock, Unlock, Trash2, Copy, Scissors, RotateCcw, RotateCw,
  ZoomIn, ZoomOut, Grid, Magnet, Clock, Activity, Monitor,
  FolderOpen, FileDown, FileUp, FileText, Power, GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { trpc } from '@/lib/trpc';

// ============================================================
// TYPE DEFINITIONS
// ============================================================
type TrackType = 'audio' | 'midi' | 'video' | 'bus' | 'master';
type EffectType = 'eq' | 'compressor' | 'reverb' | 'delay' | 'chorus' | 'limiter' | 'gate' | 'distortion';

interface Track {
  id: string;
  name: string;
  type: TrackType;
  color: string;
  volume: number; // -60 to +6 dB
  pan: number; // -100 to +100
  muted: boolean;
  solo: boolean;
  armed: boolean;
  locked: boolean;
  visible: boolean;
  regions: Region[];
  effects: Effect[];
  automationVisible: boolean;
  inputSource: string;
  outputBus: string;
}

interface Region {
  id: string;
  name: string;
  startBeat: number;
  durationBeats: number;
  color: string;
  waveformData: number[];
  audioFile?: File;
  audioUrl?: string;
}

// Serializable project format for Save/Load
interface StudioProject {
  name: string;
  version: string;
  bpm: number;
  timeSignature: string;
  tracks: Track[];
  createdAt: number;
  updatedAt: number;
}

interface Effect {
  id: string;
  name: string;
  type: EffectType;
  enabled: boolean;
  params: Record<string, number>;
}

interface Marker {
  id: string;
  name: string;
  position: number;
  color: string;
}

// ============================================================
// CONSTANTS
// ============================================================
const TRACK_COLORS: Record<TrackType, string> = {
  audio: '#4ade80',
  midi: '#60a5fa',
  video: '#c084fc',
  bus: '#fbbf24',
  master: '#f87171',
};

const EFFECT_PRESETS: { name: string; type: EffectType }[] = [
  { name: 'Channel EQ', type: 'eq' },
  { name: 'Compressor', type: 'compressor' },
  { name: 'Space Designer', type: 'reverb' },
  { name: 'Tape Delay', type: 'delay' },
  { name: 'Ensemble', type: 'chorus' },
  { name: 'Adaptive Limiter', type: 'limiter' },
  { name: 'Noise Gate', type: 'gate' },
  { name: 'Overdrive', type: 'distortion' },
];

// Generate fake waveform data
const generateWaveform = (length: number): number[] =>
  Array.from({ length }, () => Math.random() * 0.8 + 0.1);

// ============================================================
// DEFAULT TRACKS (like opening a Logic Pro template)
// ============================================================
const DEFAULT_TRACKS: Track[] = [
  {
    id: 't1', name: 'Lead Vocals', type: 'audio', color: '#4ade80',
    volume: -6, pan: 0, muted: false, solo: false, armed: false, locked: false, visible: true,
    regions: [
      { id: 'r1', name: 'Verse 1', startBeat: 8, durationBeats: 32, color: '#4ade80', waveformData: generateWaveform(128) },
      { id: 'r2', name: 'Chorus', startBeat: 48, durationBeats: 24, color: '#4ade80', waveformData: generateWaveform(96) },
    ],
    effects: [
      { id: 'e1', name: 'Channel EQ', type: 'eq', enabled: true, params: { low: -2, mid: 3, high: 1 } },
      { id: 'e2', name: 'Compressor', type: 'compressor', enabled: true, params: { threshold: -18, ratio: 4, attack: 10, release: 100 } },
    ],
    automationVisible: false, inputSource: 'Input 1', outputBus: 'Stereo Out',
  },
  {
    id: 't2', name: 'Background Vox', type: 'audio', color: '#34d399',
    volume: -12, pan: -30, muted: false, solo: false, armed: false, locked: false, visible: true,
    regions: [
      { id: 'r3', name: 'BG Chorus', startBeat: 48, durationBeats: 24, color: '#34d399', waveformData: generateWaveform(96) },
    ],
    effects: [
      { id: 'e3', name: 'Channel EQ', type: 'eq', enabled: true, params: { low: -4, mid: 0, high: 2 } },
    ],
    automationVisible: false, inputSource: 'Input 2', outputBus: 'Stereo Out',
  },
  {
    id: 't3', name: 'Drums', type: 'audio', color: '#f97316',
    volume: -4, pan: 0, muted: false, solo: false, armed: false, locked: false, visible: true,
    regions: [
      { id: 'r4', name: 'Beat Pattern', startBeat: 0, durationBeats: 80, color: '#f97316', waveformData: generateWaveform(320) },
    ],
    effects: [
      { id: 'e4', name: 'Compressor', type: 'compressor', enabled: true, params: { threshold: -12, ratio: 6, attack: 5, release: 50 } },
    ],
    automationVisible: false, inputSource: 'Input 3-4', outputBus: 'Stereo Out',
  },
  {
    id: 't4', name: 'Bass', type: 'audio', color: '#a78bfa',
    volume: -8, pan: 0, muted: false, solo: false, armed: false, locked: false, visible: true,
    regions: [
      { id: 'r5', name: 'Bass Line', startBeat: 0, durationBeats: 80, color: '#a78bfa', waveformData: generateWaveform(320) },
    ],
    effects: [
      { id: 'e5', name: 'Channel EQ', type: 'eq', enabled: true, params: { low: 4, mid: -2, high: -6 } },
    ],
    automationVisible: false, inputSource: 'Input 5', outputBus: 'Stereo Out',
  },
  {
    id: 't5', name: 'Keys / Synth', type: 'midi', color: '#60a5fa',
    volume: -10, pan: 20, muted: false, solo: false, armed: false, locked: false, visible: true,
    regions: [
      { id: 'r6', name: 'Pad', startBeat: 0, durationBeats: 80, color: '#60a5fa', waveformData: generateWaveform(320) },
    ],
    effects: [
      { id: 'e6', name: 'Space Designer', type: 'reverb', enabled: true, params: { size: 60, decay: 2.5, mix: 25 } },
    ],
    automationVisible: false, inputSource: 'Virtual', outputBus: 'Stereo Out',
  },
  {
    id: 't6', name: 'Guitar', type: 'audio', color: '#fbbf24',
    volume: -9, pan: -20, muted: false, solo: false, armed: false, locked: false, visible: true,
    regions: [
      { id: 'r7', name: 'Rhythm', startBeat: 4, durationBeats: 40, color: '#fbbf24', waveformData: generateWaveform(160) },
      { id: 'r8', name: 'Solo', startBeat: 56, durationBeats: 16, color: '#fbbf24', waveformData: generateWaveform(64) },
    ],
    effects: [
      { id: 'e7', name: 'Overdrive', type: 'distortion', enabled: false, params: { drive: 40, tone: 60, level: 70 } },
      { id: 'e8', name: 'Tape Delay', type: 'delay', enabled: true, params: { time: 375, feedback: 30, mix: 20 } },
    ],
    automationVisible: false, inputSource: 'Input 6', outputBus: 'Stereo Out',
  },
  {
    id: 't7', name: 'Video', type: 'video', color: '#c084fc',
    volume: 0, pan: 0, muted: false, solo: false, armed: false, locked: true, visible: true,
    regions: [
      { id: 'r9', name: 'Main Video', startBeat: 0, durationBeats: 80, color: '#c084fc', waveformData: generateWaveform(320) },
    ],
    effects: [],
    automationVisible: false, inputSource: 'Camera 1', outputBus: 'Video Out',
  },
  {
    id: 't8', name: 'Master', type: 'master', color: '#f87171',
    volume: 0, pan: 0, muted: false, solo: false, armed: false, locked: true, visible: true,
    regions: [],
    effects: [
      { id: 'e9', name: 'Adaptive Limiter', type: 'limiter', enabled: true, params: { ceiling: -0.3, gain: 0, release: 100 } },
    ],
    automationVisible: false, inputSource: 'All', outputBus: 'Stereo Out',
  },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export function StudioSuite() {
  // Audio Engine
  const audioEngine = useAudioEngine();

  // Transport state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [currentBeat, setCurrentBeat] = useState(0);
  const [totalBeats] = useState(96);

  // Tracks
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_TRACKS);
  const [selectedTrackId, setSelectedTrackId] = useState<string>('t1');

  // UI state
  const [showMixer, setShowMixer] = useState(true);
  const [showInspector, setShowInspector] = useState(true);
  const [showBrowser, setShowBrowser] = useState(true);
  const [showEffects, setShowEffects] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracks' | 'mixer' | 'editor'>('tracks');
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [projectName, setProjectName] = useState('Untitled Project');
  const [isDirty, setIsDirty] = useState(false);
  const [dragOverTrackId, setDragOverTrackId] = useState<string | null>(null);
  const [draggingRegion, setDraggingRegion] = useState<{ trackId: string; regionId: string; startX: number; startBeat: number } | null>(null);

  // File input ref for importing
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const importTrackIdRef = useRef<string>('');

  // Meters — use real engine meters when available, fall back to simulated
  const [meterLevels, setMeterLevels] = useState({ left: -12, right: -14 });

  // Playback timer
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentBeat(prev => {
          const next = prev + 0.25;
          if (next >= totalBeats) return isLooping ? 0 : totalBeats;
          return next;
        });
      }, (60 / bpm / 4) * 1000);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current); };
  }, [isPlaying, bpm, isLooping, totalBeats]);

  // Meter animation — use real audio engine meters when initialized, otherwise simulate
  useEffect(() => {
    const meterInterval = setInterval(() => {
      if (audioEngine.engineState.isInitialized) {
        setMeterLevels({
          left: audioEngine.masterMeters.leftPeak,
          right: audioEngine.masterMeters.rightPeak,
        });
      } else if (isPlaying) {
        setMeterLevels({
          left: -20 + Math.random() * 18,
          right: -20 + Math.random() * 18,
        });
      } else {
        setMeterLevels({ left: -60, right: -60 });
      }
    }, 50);
    return () => clearInterval(meterInterval);
  }, [isPlaying, audioEngine.engineState.isInitialized, audioEngine.masterMeters]);

  // Sync track volume/pan/mute changes to audio engine
  useEffect(() => {
    if (!audioEngine.engineState.isInitialized) return;
    tracks.forEach(track => {
      audioEngine.setTrackVolume(track.id, track.volume);
      audioEngine.setTrackPan(track.id, track.pan);
      audioEngine.setTrackMute(track.id, track.muted);
    });
  }, [tracks, audioEngine]);

  // Track operations
  const updateTrack = useCallback((id: string, updates: Partial<Track>) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    setIsDirty(true);
  }, []);

  const selectedTrack = useMemo(() => tracks.find(t => t.id === selectedTrackId), [tracks, selectedTrackId]);

  const formatTimecode = (beat: number) => {
    const bar = Math.floor(beat / 4) + 1;
    const beatInBar = Math.floor(beat % 4) + 1;
    const tick = Math.floor((beat % 1) * 240);
    return `${bar.toString().padStart(3, ' ')}.${beatInBar}.${tick.toString().padStart(3, '0')}`;
  };

  const formatTimeSeconds = (beat: number) => {
    const seconds = (beat / bpm) * 60;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const dBToPercent = (db: number) => Math.max(0, Math.min(100, ((db + 60) / 66) * 100));

  // Add new track
  const addTrack = useCallback((type: TrackType) => {
    const id = `t${Date.now()}`;
    const names: Record<TrackType, string> = {
      audio: `Audio ${tracks.filter(t => t.type === 'audio').length + 1}`,
      midi: `MIDI ${tracks.filter(t => t.type === 'midi').length + 1}`,
      video: `Video ${tracks.filter(t => t.type === 'video').length + 1}`,
      bus: `Bus ${tracks.filter(t => t.type === 'bus').length + 1}`,
      master: 'Master',
    };
    const newTrack: Track = {
      id, name: names[type], type, color: TRACK_COLORS[type],
      volume: -12, pan: 0, muted: false, solo: false, armed: false, locked: false, visible: true,
      regions: [], effects: [], automationVisible: false,
      inputSource: type === 'midi' ? 'Virtual' : `Input ${tracks.length + 1}`,
      outputBus: 'Stereo Out',
    };
    setTracks(prev => [...prev.filter(t => t.type !== 'master'), newTrack, ...prev.filter(t => t.type === 'master')]);
    setSelectedTrackId(id);
    toast.success(`Added ${names[type]} track`);
  }, [tracks]);

  // Delete selected track
  const deleteTrack = useCallback(() => {
    if (selectedTrack && selectedTrack.type !== 'master') {
      setTracks(prev => prev.filter(t => t.id !== selectedTrackId));
      setSelectedTrackId(tracks[0]?.id || '');
      setIsDirty(true);
      toast.success(`Deleted ${selectedTrack.name}`);
    }
  }, [selectedTrack, selectedTrackId, tracks]);

  // ============================================================
  // AUDIO ENGINE INTEGRATION
  // ============================================================
  const handleInitAudio = useCallback(async () => {
    const success = await audioEngine.initEngine();
    if (success) {
      toast.success('Audio engine initialized — 48kHz / 24-bit');
      // Create nodes for all existing tracks
      tracks.forEach(track => {
        audioEngine.createTrackNode(track.id);
        audioEngine.setTrackVolume(track.id, track.volume);
        audioEngine.setTrackPan(track.id, track.pan);
      });
    } else {
      toast.error('Failed to initialize audio engine');
    }
  }, [audioEngine, tracks]);

  const handlePlayWithEngine = useCallback(() => {
    if (audioEngine.engineState.isInitialized) {
      audioEngine.playAll(currentBeat, bpm);
    }
    setIsPlaying(true);
  }, [audioEngine, currentBeat, bpm]);

  const handleStopWithEngine = useCallback(() => {
    if (audioEngine.engineState.isInitialized) {
      audioEngine.stopAll();
    }
    setIsPlaying(false);
  }, [audioEngine]);

  // Load audio file onto a track (with real waveform extraction)
  const handleLoadAudioToTrack = useCallback(async (trackId: string, file: File) => {
    if (!audioEngine.engineState.isInitialized) {
      await handleInitAudio();
    }
    const success = await audioEngine.loadAudioToTrack(trackId, file);
    if (success) {
      // Extract REAL waveform from the loaded AudioBuffer
      const realWaveform = audioEngine.getTrackWaveform(trackId, 200);
      const waveform = realWaveform || generateWaveform(200);

      // Get real duration and convert to beats
      const duration = await audioEngine.getAudioDuration(file);
      const durationBeats = duration > 0 ? Math.ceil((duration / 60) * bpm) : 32;

      const track = tracks.find(t => t.id === trackId);
      const lastRegionEnd = track?.regions.reduce((max, r) => Math.max(max, r.startBeat + r.durationBeats), 0) || 0;

      const newRegion: Region = {
        id: `r${Date.now()}`,
        name: file.name.replace(/\.[^.]+$/, ''),
        startBeat: lastRegionEnd,
        durationBeats: durationBeats,
        color: tracks.find(t => t.id === trackId)?.color || '#4ade80',
        waveformData: waveform,
        audioFile: file,
      };
      setTracks(prev => prev.map(t =>
        t.id === trackId
          ? { ...t, regions: [...t.regions, newRegion] }
          : t
      ));
      setIsDirty(true);

      // Upload to S3 in background
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          if (base64) {
            uploadAudioMutation.mutate({
              fileName: file.name,
              fileData: base64,
              mimeType: file.type || 'audio/wav',
              trackId,
              projectName,
            });
          }
        };
        reader.readAsDataURL(file);
      } catch { /* S3 upload is best-effort */ }

      toast.success(`Loaded "${file.name}" onto track (${duration.toFixed(1)}s)`);
    } else {
      toast.error(`Failed to load "${file.name}"`);
    }
  }, [audioEngine, handleInitAudio, tracks, bpm, projectName]);

  // S3 upload mutation
  const uploadAudioMutation = trpc.studioAudio.uploadAudio.useMutation({
    onSuccess: (data) => {
      console.log('[Studio] Audio uploaded to S3:', data.url);
    },
    onError: (err) => {
      console.warn('[Studio] S3 upload failed (non-critical):', err.message);
    },
  });

  // Recording handlers
  const handleStartRecording = useCallback(async () => {
    if (!selectedTrack || selectedTrack.type === 'master') {
      toast.error('Select a track to record to');
      return;
    }
    if (!audioEngine.engineState.isInitialized) {
      await handleInitAudio();
    }
    const success = await audioEngine.startRecording(selectedTrack.id);
    if (success) {
      setIsRecording(true);
      setIsPlaying(true);
      toast.success(`Recording to ${selectedTrack.name}...`);
    } else {
      toast.error('Failed to start recording — check microphone permissions');
    }
  }, [audioEngine, selectedTrack, handleInitAudio]);

  const handleStopRecording = useCallback(async () => {
    const result = await audioEngine.stopRecording();
    setIsRecording(false);
    if (!result) {
      toast.error('No recording data captured');
      return;
    }

    const { blob, duration, mimeType } = result;
    const trackId = selectedTrack?.id;
    if (!trackId) return;

    // Load recording into the track's AudioBuffer
    const loaded = await audioEngine.loadRecordingToTrack(trackId, blob);
    if (loaded) {
      // Extract real waveform from the recording
      const realWaveform = audioEngine.getTrackWaveform(trackId, 200);
      const waveform = realWaveform || generateWaveform(200);
      const durationBeats = Math.ceil((duration / 60) * bpm);

      const track = tracks.find(t => t.id === trackId);
      const lastRegionEnd = track?.regions.reduce((max, r) => Math.max(max, r.startBeat + r.durationBeats), 0) || 0;

      const newRegion: Region = {
        id: `r${Date.now()}`,
        name: `Recording ${new Date().toLocaleTimeString()}`,
        startBeat: lastRegionEnd,
        durationBeats: durationBeats,
        color: '#ef4444',
        waveformData: waveform,
      };
      setTracks(prev => prev.map(t =>
        t.id === trackId
          ? { ...t, regions: [...t.regions, newRegion] }
          : t
      ));
      setIsDirty(true);

      // Upload recording to S3 in background
      try {
        const base64 = await audioEngine.blobToBase64(blob);
        uploadRecordingMutation.mutate({
          fileName: `recording_${Date.now()}`,
          fileData: base64,
          mimeType,
          trackId,
          duration,
        });
      } catch { /* best-effort */ }

      toast.success(`Recording saved (${duration.toFixed(1)}s) with real waveform`);
    } else {
      toast.error('Failed to process recording');
    }
  }, [audioEngine, selectedTrack, tracks, bpm]);

  const uploadRecordingMutation = trpc.studioAudio.uploadRecording.useMutation({
    onSuccess: (data) => {
      console.log('[Studio] Recording uploaded to S3:', data.url);
    },
    onError: (err) => {
      console.warn('[Studio] Recording upload failed (non-critical):', err.message);
    },
  });

  // ============================================================
  // DRAG AND DROP
  // ============================================================
  const handleFileDrop = useCallback((trackId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTrackId(null);

    // Handle files from browser panel (data transfer)
    const browserFileName = e.dataTransfer.getData('text/plain');
    if (browserFileName) {
      // Simulate adding a region from browser panel
      const track = tracks.find(t => t.id === trackId);
      if (track) {
        const lastRegionEnd = track.regions.reduce((max, r) => Math.max(max, r.startBeat + r.durationBeats), 0);
        const newRegion: Region = {
          id: `r${Date.now()}`,
          name: browserFileName.replace(/\.[^.]+$/, ''),
          startBeat: snapToGrid ? Math.round(lastRegionEnd / 4) * 4 : lastRegionEnd,
          durationBeats: 16,
          color: track.color,
          waveformData: generateWaveform(64),
        };
        updateTrack(trackId, { regions: [...track.regions, newRegion] });
        toast.success(`Added "${browserFileName}" to ${track.name}`);
      }
      return;
    }

    // Handle real audio files dropped from OS
    const files = Array.from(e.dataTransfer.files);
    const audioFiles = files.filter(f => f.type.startsWith('audio/') || /\.(wav|mp3|ogg|m4a|flac|aac)$/i.test(f.name));
    if (audioFiles.length > 0) {
      audioFiles.forEach(file => handleLoadAudioToTrack(trackId, file));
    } else if (files.length > 0) {
      toast.error('Only audio files can be dropped onto tracks');
    }
  }, [tracks, snapToGrid, updateTrack, handleLoadAudioToTrack]);

  const handleDragOver = useCallback((trackId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTrackId(trackId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverTrackId(null);
  }, []);

  // Region drag to reposition
  const handleRegionDragStart = useCallback((trackId: string, regionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const startX = e.clientX;
    const region = tracks.find(t => t.id === trackId)?.regions.find(r => r.id === regionId);
    if (region) {
      setDraggingRegion({ trackId, regionId, startX, startBeat: region.startBeat });
    }
  }, [tracks]);

  // Mouse move handler for region dragging
  useEffect(() => {
    if (!draggingRegion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - draggingRegion.startX;
      const beatsPerPixel = totalBeats / (window.innerWidth * zoom * 0.6);
      let newStart = draggingRegion.startBeat + deltaX * beatsPerPixel;
      if (snapToGrid) newStart = Math.round(newStart / 4) * 4;
      newStart = Math.max(0, newStart);

      setTracks(prev => prev.map(t =>
        t.id === draggingRegion.trackId
          ? { ...t, regions: t.regions.map(r => r.id === draggingRegion.regionId ? { ...r, startBeat: newStart } : r) }
          : t
      ));
    };

    const handleMouseUp = () => {
      setDraggingRegion(null);
      setIsDirty(true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingRegion, totalBeats, zoom, snapToGrid]);

  // ============================================================
  // FILE MENU: SAVE / EXPORT / IMPORT
  // ============================================================
  const serializeProject = useCallback((): StudioProject => {
    return {
      name: projectName,
      version: '1.0.0',
      bpm,
      timeSignature,
      tracks: tracks.map(t => ({
        ...t,
        regions: t.regions.map(r => ({ ...r, audioFile: undefined })),
      })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }, [projectName, bpm, timeSignature, tracks]);

  const handleSaveProject = useCallback(() => {
    const project = serializeProject();
    localStorage.setItem('rrb-studio-project', JSON.stringify(project));
    setIsDirty(false);
    toast.success(`Project "${projectName}" saved`);
  }, [serializeProject, projectName]);

  const handleExportProject = useCallback(() => {
    const project = serializeProject();
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}.rrbstudio`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported "${projectName}.rrbstudio"`);
  }, [serializeProject, projectName]);

  const handleImportProject = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const project: StudioProject = JSON.parse(ev.target?.result as string);
        setProjectName(project.name);
        setBpm(project.bpm);
        setTimeSignature(project.timeSignature);
        setTracks(project.tracks);
        setSelectedTrackId(project.tracks[0]?.id || '');
        setIsDirty(false);
        toast.success(`Imported project "${project.name}"`);
      } catch {
        toast.error('Invalid project file');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleLoadSavedProject = useCallback(() => {
    const saved = localStorage.getItem('rrb-studio-project');
    if (saved) {
      try {
        const project: StudioProject = JSON.parse(saved);
        setProjectName(project.name);
        setBpm(project.bpm);
        setTimeSignature(project.timeSignature);
        setTracks(project.tracks);
        setSelectedTrackId(project.tracks[0]?.id || '');
        setIsDirty(false);
        toast.success(`Loaded project "${project.name}"`);
      } catch {
        toast.error('Failed to load saved project');
      }
    } else {
      toast.info('No saved project found');
    }
  }, []);

  const handleNewProject = useCallback(() => {
    setProjectName('Untitled Project');
    setBpm(120);
    setTimeSignature('4/4');
    setTracks(DEFAULT_TRACKS);
    setSelectedTrackId('t1');
    setCurrentBeat(0);
    setIsPlaying(false);
    setIsRecording(false);
    setIsDirty(false);
    toast.success('New project created');
  }, []);

  // Handle audio file import for track
  const handleAudioFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !importTrackIdRef.current) return;
    handleLoadAudioToTrack(importTrackIdRef.current, file);
    if (audioFileInputRef.current) audioFileInputRef.current.value = '';
  }, [handleLoadAudioToTrack]);

  // Keyboard shortcuts (Logic Pro style) — placed after all callbacks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (isPlaying) { handleStopWithEngine(); } else { handlePlayWithEngine(); }
          break;
        case 'r':
        case 'R':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            if (isRecording) { handleStopRecording(); } else { handleStartRecording(); }
          }
          break;
        case 'Enter':
          e.preventDefault();
          handleStopWithEngine();
          setCurrentBeat(0);
          break;
        case 'c':
        case 'C':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            setIsLooping(prev => !prev);
          }
          break;
        case 'm':
        case 'M':
          if (selectedTrack && !e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            updateTrack(selectedTrack.id, { muted: !selectedTrack.muted });
          }
          break;
        case 's':
        case 'S':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            handleSaveProject();
          } else if (selectedTrack) {
            e.preventDefault();
            updateTrack(selectedTrack.id, { solo: !selectedTrack.solo });
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          {
            const visibleTracks = tracks.filter(t => t.visible);
            const idx = visibleTracks.findIndex(t => t.id === selectedTrackId);
            if (idx > 0) setSelectedTrackId(visibleTracks[idx - 1].id);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          {
            const visibleTracks = tracks.filter(t => t.visible);
            const idx = visibleTracks.findIndex(t => t.id === selectedTrackId);
            if (idx < visibleTracks.length - 1) setSelectedTrackId(visibleTracks[idx + 1].id);
          }
          break;
        case '=':
        case '+':
          e.preventDefault();
          setZoom(prev => Math.min(4, prev + 0.25));
          break;
        case '-':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            setZoom(prev => Math.max(0.25, prev - 0.25));
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTrack, selectedTrackId, tracks, updateTrack, isPlaying, isRecording, handlePlayWithEngine, handleStopWithEngine, handleSaveProject, handleStartRecording, handleStopRecording]);

  // Auto-load saved project on mount
  useEffect(() => {
    const saved = localStorage.getItem('rrb-studio-project');
    if (saved) {
      try {
        const project: StudioProject = JSON.parse(saved);
        setProjectName(project.name);
        setBpm(project.bpm);
        setTimeSignature(project.timeSignature);
        setTracks(project.tracks);
        setSelectedTrackId(project.tracks[0]?.id || '');
      } catch { /* use defaults */ }
    }
  }, []);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className={`flex flex-col bg-[#1a1a1a] text-[#cccccc] select-none ${fullscreen ? 'fixed inset-0 z-[9999]' : 'min-h-screen'}`}
      style={{ fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace", fontSize: '11px' }}>

      {/* ====== TOP MENU BAR ====== */}
      <div className="flex items-center h-7 bg-[#2a2a2a] border-b border-[#3a3a3a] px-2 gap-1 shrink-0"
        style={{ fontSize: '11px' }}>
        <span className="font-bold text-[#e0e0e0] mr-3" style={{ fontSize: '12px' }}>⚡ RRB Studio Pro</span>
        {/* File Menu with dropdown */}
        <div className="relative">
          <button className={`px-2 py-0.5 rounded text-[#bbbbbb] transition-colors ${showFileMenu ? 'bg-[#4a4a4a]' : 'hover:bg-[#4a4a4a]'}`}
            onClick={() => setShowFileMenu(!showFileMenu)}>
            File
          </button>
          {showFileMenu && (
            <div className="absolute top-full left-0 mt-0.5 w-56 bg-[#333] border border-[#4a4a4a] rounded-md shadow-xl z-50 py-1"
              onMouseLeave={() => setShowFileMenu(false)}>
              <button onClick={() => { handleNewProject(); setShowFileMenu(false); }}
                className="w-full px-3 py-1.5 text-left text-[11px] text-[#ccc] hover:bg-[#4a6fa5] hover:text-white flex items-center gap-2">
                <FileText className="w-3 h-3" /> New Project
                <span className="ml-auto text-[9px] text-[#666]">⌘N</span>
              </button>
              <button onClick={() => { handleLoadSavedProject(); setShowFileMenu(false); }}
                className="w-full px-3 py-1.5 text-left text-[11px] text-[#ccc] hover:bg-[#4a6fa5] hover:text-white flex items-center gap-2">
                <FolderOpen className="w-3 h-3" /> Open Saved Project
                <span className="ml-auto text-[9px] text-[#666]">⌘O</span>
              </button>
              <div className="border-t border-[#4a4a4a] my-1" />
              <button onClick={() => { handleSaveProject(); setShowFileMenu(false); }}
                className="w-full px-3 py-1.5 text-left text-[11px] text-[#ccc] hover:bg-[#4a6fa5] hover:text-white flex items-center gap-2">
                <Save className="w-3 h-3" /> Save Project
                <span className="ml-auto text-[9px] text-[#666]">⌘S</span>
              </button>
              <button onClick={() => { handleExportProject(); setShowFileMenu(false); }}
                className="w-full px-3 py-1.5 text-left text-[11px] text-[#ccc] hover:bg-[#4a6fa5] hover:text-white flex items-center gap-2">
                <FileDown className="w-3 h-3" /> Export Project (.rrbstudio)
                <span className="ml-auto text-[9px] text-[#666]">⇧⌘E</span>
              </button>
              <button onClick={() => { fileInputRef.current?.click(); setShowFileMenu(false); }}
                className="w-full px-3 py-1.5 text-left text-[11px] text-[#ccc] hover:bg-[#4a6fa5] hover:text-white flex items-center gap-2">
                <FileUp className="w-3 h-3" /> Import Project (.rrbstudio)
                <span className="ml-auto text-[9px] text-[#666]">⇧⌘I</span>
              </button>
              <div className="border-t border-[#4a4a4a] my-1" />
              <button onClick={() => { toast.info('Bounce/Export audio — coming soon'); setShowFileMenu(false); }}
                className="w-full px-3 py-1.5 text-left text-[11px] text-[#ccc] hover:bg-[#4a6fa5] hover:text-white flex items-center gap-2">
                <Download className="w-3 h-3" /> Bounce / Export Audio
                <span className="ml-auto text-[9px] text-[#666]">⌘B</span>
              </button>
            </div>
          )}
        </div>
        {['Edit', 'Track', 'Mix', 'Navigate', 'Window', 'Help'].map(menu => (
          <button key={menu} className="px-2 py-0.5 hover:bg-[#4a4a4a] rounded text-[#bbbbbb] transition-colors"
            onClick={() => toast.info(`${menu} menu — Feature coming soon`)}>
            {menu}
          </button>
        ))}
        {/* Hidden file inputs */}
        <input ref={fileInputRef} type="file" accept=".rrbstudio,.json" className="hidden" onChange={handleImportProject} />
        <input ref={audioFileInputRef} type="file" accept="audio/*,.wav,.mp3,.ogg,.m4a,.flac,.aac" className="hidden" onChange={handleAudioFileImport} />
        <div className="w-px h-4 bg-[#3a3a3a] mx-1" />
        <div className="flex items-center gap-0.5">
          <button onClick={() => addTrack('audio')}
            className="px-1.5 py-0.5 rounded text-[9px] text-[#4ade80] hover:bg-[#333] flex items-center gap-0.5"
            title="Add Audio Track">
            <Plus className="w-2.5 h-2.5" /> Audio
          </button>
          <button onClick={() => addTrack('midi')}
            className="px-1.5 py-0.5 rounded text-[9px] text-[#60a5fa] hover:bg-[#333] flex items-center gap-0.5"
            title="Add MIDI Track">
            <Plus className="w-2.5 h-2.5" /> MIDI
          </button>
          <button onClick={() => addTrack('video')}
            className="px-1.5 py-0.5 rounded text-[9px] text-[#c084fc] hover:bg-[#333] flex items-center gap-0.5"
            title="Add Video Track">
            <Plus className="w-2.5 h-2.5" /> Video
          </button>
          {selectedTrack && selectedTrack.type !== 'master' && (
            <button onClick={deleteTrack}
              className="px-1.5 py-0.5 rounded text-[9px] text-[#f87171] hover:bg-[#333] flex items-center gap-0.5"
              title="Delete Selected Track">
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <button onClick={() => setShowInspector(!showInspector)}
            className={`px-1.5 py-0.5 rounded text-[10px] ${showInspector ? 'bg-[#4a6fa5] text-white' : 'text-[#888]'}`}>
            Inspector
          </button>
          <button onClick={() => setShowBrowser(!showBrowser)}
            className={`px-1.5 py-0.5 rounded text-[10px] ${showBrowser ? 'bg-[#4a6fa5] text-white' : 'text-[#888]'}`}>
            Browser
          </button>
          <button onClick={() => setShowMixer(!showMixer)}
            className={`px-1.5 py-0.5 rounded text-[10px] ${showMixer ? 'bg-[#4a6fa5] text-white' : 'text-[#888]'}`}>
            Mixer
          </button>
          <button onClick={() => setShowEffects(!showEffects)}
            className={`px-1.5 py-0.5 rounded text-[10px] ${showEffects ? 'bg-[#4a6fa5] text-white' : 'text-[#888]'}`}>
            Effects
          </button>
          <button onClick={() => setFullscreen(!fullscreen)}
            className="px-1.5 py-0.5 rounded text-[#888] hover:text-white">
            {fullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* ====== TRANSPORT BAR ====== */}
      <div className="flex items-center h-14 bg-gradient-to-b from-[#333333] to-[#2a2a2a] border-b border-[#1a1a1a] px-3 gap-3 shrink-0">
        {/* Transport Controls */}
        <div className="flex items-center gap-0.5 bg-[#222222] rounded-md p-1 border border-[#3a3a3a]">
          <button onClick={() => setCurrentBeat(0)}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#4a4a4a] text-[#aaa] hover:text-white transition-colors"
            title="Return to Start">
            <SkipBack className="w-4 h-4" />
          </button>
          <button onClick={() => setCurrentBeat(Math.max(0, currentBeat - 4))}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#4a4a4a] text-[#aaa] hover:text-white transition-colors"
            title="Rewind">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => { if (!isPlaying) { handlePlayWithEngine(); toast.success('Playback started'); } else { handleStopWithEngine(); } }}
            className={`w-9 h-8 flex items-center justify-center rounded transition-colors ${isPlaying ? 'bg-[#4a6fa5] text-white' : 'hover:bg-[#4a4a4a] text-[#aaa] hover:text-white'}`}
            title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button onClick={() => { handleStopWithEngine(); setCurrentBeat(0); }}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#4a4a4a] text-[#aaa] hover:text-white transition-colors"
            title="Stop">
            <Square className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => { if (isRecording) { handleStopRecording(); } else { handleStartRecording(); } }}
            className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'hover:bg-[#4a4a4a] text-[#aaa] hover:text-white'}`}
            title={isRecording ? 'Stop Recording' : 'Record (requires microphone)'}>
            <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-white' : 'bg-red-500'}`} />
          </button>
          <button onClick={() => setCurrentBeat(Math.min(totalBeats, currentBeat + 4))}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#4a4a4a] text-[#aaa] hover:text-white transition-colors"
            title="Forward">
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setIsLooping(!isLooping)}
            className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${isLooping ? 'bg-[#6b4fa5] text-white' : 'hover:bg-[#4a4a4a] text-[#aaa] hover:text-white'}`}
            title="Cycle/Loop">
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* LCD Display */}
        <div className="flex items-center bg-[#111111] rounded-md border border-[#3a3a3a] overflow-hidden">
          <div className="px-3 py-1 border-r border-[#2a2a2a]">
            <div className="text-[9px] text-[#666] uppercase tracking-wider">Position</div>
            <div className="text-lg font-bold text-[#00ff88] font-mono leading-tight tracking-wider">
              {formatTimecode(currentBeat)}
            </div>
          </div>
          <div className="px-3 py-1 border-r border-[#2a2a2a]">
            <div className="text-[9px] text-[#666] uppercase tracking-wider">Time</div>
            <div className="text-lg font-bold text-[#00ff88] font-mono leading-tight tracking-wider">
              {formatTimeSeconds(currentBeat)}
            </div>
          </div>
          <div className="px-3 py-1 border-r border-[#2a2a2a]">
            <div className="text-[9px] text-[#666] uppercase tracking-wider">Tempo</div>
            <div className="flex items-center gap-1">
              <input type="number" value={bpm} onChange={e => setBpm(Number(e.target.value))}
                className="w-12 bg-transparent text-lg font-bold text-[#ffaa00] font-mono leading-tight text-center outline-none"
                min={20} max={300} />
              <span className="text-[9px] text-[#666]">BPM</span>
            </div>
          </div>
          <div className="px-3 py-1">
            <div className="text-[9px] text-[#666] uppercase tracking-wider">Time Sig</div>
            <div className="text-lg font-bold text-[#ffaa00] font-mono leading-tight">
              {timeSignature}
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {/* Master Meters */}
        <div className="flex items-center gap-1">
          <div className="text-[9px] text-[#666] mr-1">MASTER</div>
          <MeterBar level={meterLevels.left} label="L" />
          <MeterBar level={meterLevels.right} label="R" />
        </div>

        {/* Zoom & Grid */}
        <div className="flex items-center gap-1 bg-[#222222] rounded-md p-1 border border-[#3a3a3a]">
          <button onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#4a4a4a] text-[#aaa]">
            <ZoomOut className="w-3 h-3" />
          </button>
          <span className="text-[10px] text-[#888] w-8 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(Math.min(4, zoom + 0.25))}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#4a4a4a] text-[#aaa]">
            <ZoomIn className="w-3 h-3" />
          </button>
          <div className="w-px h-4 bg-[#3a3a3a] mx-0.5" />
          <button onClick={() => setSnapToGrid(!snapToGrid)}
            className={`w-6 h-6 flex items-center justify-center rounded ${snapToGrid ? 'bg-[#4a6fa5] text-white' : 'text-[#888]'}`}
            title="Snap to Grid">
            <Magnet className="w-3 h-3" />
          </button>
        </div>

        {/* Audio Engine Init */}
        <button onClick={handleInitAudio}
          className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
            audioEngine.engineState.isInitialized
              ? 'bg-[#1a3a1a] border-[#4ade80] text-[#4ade80]'
              : 'bg-[#3a2a1a] border-[#fbbf24] text-[#fbbf24] hover:bg-[#4a3a2a]'
          }`}
          title={audioEngine.engineState.isInitialized ? 'Audio Engine Active' : 'Click to Initialize Audio Engine'}>
          <Power className="w-3 h-3" />
          <span className="text-[10px]">{audioEngine.engineState.isInitialized ? 'Engine ON' : 'Init Audio'}</span>
        </button>

        {/* Save */}
        <button onClick={handleSaveProject}
          className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
            isDirty
              ? 'bg-[#3a2a1a] border-[#fbbf24] text-[#fbbf24] hover:bg-[#4a3a2a]'
              : 'bg-[#222222] border-[#3a3a3a] text-[#aaa] hover:bg-[#3a3a3a] hover:text-white'
          }`}>
          <Save className="w-3 h-3" />
          <span className="text-[10px]">{isDirty ? 'Save*' : 'Save'}</span>
        </button>
      </div>

      {/* ====== MAIN CONTENT AREA ====== */}
      <div className="flex flex-1 overflow-hidden" style={{ height: fullscreen ? 'calc(100vh - 84px)' : 'calc(100vh - 84px)' }}>

        {/* ====== LEFT: INSPECTOR PANEL ====== */}
        {showInspector && selectedTrack && (
          <div className="w-56 bg-[#252525] border-r border-[#3a3a3a] flex flex-col shrink-0 overflow-y-auto">
            <div className="px-2 py-1.5 bg-[#2a2a2a] border-b border-[#3a3a3a] flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#999] uppercase tracking-wider">Inspector</span>
              <button onClick={() => setShowInspector(false)} className="text-[#666] hover:text-white">
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Track Info */}
            <div className="p-2 border-b border-[#3a3a3a]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: selectedTrack.color }} />
                <span className="text-[11px] font-semibold text-white">{selectedTrack.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div className="text-[#666]">Type</div>
                <div className="text-[#aaa] capitalize">{selectedTrack.type}</div>
                <div className="text-[#666]">Input</div>
                <div className="text-[#aaa]">{selectedTrack.inputSource}</div>
                <div className="text-[#666]">Output</div>
                <div className="text-[#aaa]">{selectedTrack.outputBus}</div>
              </div>
            </div>

            {/* Channel Strip */}
            <div className="p-2 border-b border-[#3a3a3a]">
              <div className="text-[10px] font-bold text-[#999] uppercase tracking-wider mb-2">Channel Strip</div>
              {/* EQ Curve Preview */}
              <div className="h-16 bg-[#1a1a1a] rounded border border-[#3a3a3a] mb-2 relative overflow-hidden">
                <svg viewBox="0 0 200 60" className="w-full h-full">
                  <line x1="0" y1="30" x2="200" y2="30" stroke="#333" strokeWidth="0.5" />
                  <path d="M0,30 Q30,35 50,28 T100,25 T150,32 T200,30" fill="none" stroke="#4ade80" strokeWidth="1.5" />
                  <text x="5" y="10" fill="#555" fontSize="6">+12dB</text>
                  <text x="5" y="58" fill="#555" fontSize="6">-12dB</text>
                </svg>
              </div>
              {/* Volume */}
              <div className="mb-2">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-[#666]">Volume</span>
                  <span className="text-[#aaa] font-mono">{selectedTrack.volume.toFixed(1)} dB</span>
                </div>
                <input type="range" min={-60} max={6} step={0.1} value={selectedTrack.volume}
                  onChange={e => updateTrack(selectedTrack.id, { volume: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-[#333] rounded appearance-none cursor-pointer accent-[#4a6fa5]" />
              </div>
              {/* Pan */}
              <div className="mb-2">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-[#666]">Pan</span>
                  <span className="text-[#aaa] font-mono">
                    {selectedTrack.pan === 0 ? 'C' : selectedTrack.pan < 0 ? `L${Math.abs(selectedTrack.pan)}` : `R${selectedTrack.pan}`}
                  </span>
                </div>
                <input type="range" min={-100} max={100} value={selectedTrack.pan}
                  onChange={e => updateTrack(selectedTrack.id, { pan: parseInt(e.target.value) })}
                  className="w-full h-1 bg-[#333] rounded appearance-none cursor-pointer accent-[#4a6fa5]" />
              </div>
            </div>

            {/* Effects Chain */}
            <div className="p-2">
              <div className="text-[10px] font-bold text-[#999] uppercase tracking-wider mb-2">Effects</div>
              {selectedTrack.effects.map(fx => (
                <div key={fx.id} className={`flex items-center gap-1.5 px-2 py-1 rounded mb-1 text-[10px] cursor-pointer ${fx.enabled ? 'bg-[#2a3a4a] text-[#88bbff]' : 'bg-[#2a2a2a] text-[#555]'}`}
                  onClick={() => {
                    const newEffects = selectedTrack.effects.map(e => e.id === fx.id ? { ...e, enabled: !e.enabled } : e);
                    updateTrack(selectedTrack.id, { effects: newEffects });
                  }}>
                  <div className={`w-1.5 h-1.5 rounded-full ${fx.enabled ? 'bg-[#4ade80]' : 'bg-[#555]'}`} />
                  <span>{fx.name}</span>
                </div>
              ))}
              <button className="w-full mt-1 px-2 py-1 rounded border border-dashed border-[#3a3a3a] text-[10px] text-[#555] hover:text-[#aaa] hover:border-[#555] transition-colors">
                + Add Effect
              </button>
            </div>
          </div>
        )}

        {/* ====== CENTER: TRACKS AREA ====== */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Ruler / Time Bar */}
          <div className="h-6 bg-[#2a2a2a] border-b border-[#3a3a3a] flex items-center shrink-0 relative overflow-hidden">
            <div className="w-48 shrink-0 bg-[#252525] border-r border-[#3a3a3a] px-2 text-[9px] text-[#666] flex items-center">
              <span>TRACKS ({tracks.filter(t => t.visible).length})</span>
            </div>
            <div className="flex-1 relative h-full">
              {/* Bar numbers */}
              {Array.from({ length: Math.ceil(totalBeats / 4) + 1 }, (_, i) => (
                <div key={i} className="absolute top-0 h-full flex items-end pb-0.5"
                  style={{ left: `${(i * 4 * zoom * 100) / totalBeats}%` }}>
                  <span className="text-[9px] text-[#555] font-mono ml-1">{i + 1}</span>
                  <div className="absolute top-0 bottom-0 w-px bg-[#3a3a3a]" />
                </div>
              ))}
              {/* Playhead indicator on ruler */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-[#ff4444] z-10"
                style={{ left: `${(currentBeat * zoom * 100) / totalBeats}%` }}>
                <div className="absolute -top-0 -left-1 w-2.5 h-2.5 bg-[#ff4444]"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
              </div>
            </div>
          </div>

          {/* Track Rows */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {tracks.filter(t => t.visible).map(track => (
              <div key={track.id}
                className={`flex border-b border-[#2a2a2a] cursor-pointer transition-colors ${selectedTrackId === track.id ? 'bg-[#1e2a3a]' : 'hover:bg-[#222222]'}`}
                style={{ height: track.type === 'master' ? '48px' : '56px' }}
                onClick={() => setSelectedTrackId(track.id)}>

                {/* Track Header */}
                <div className="w-48 shrink-0 bg-[#252525] border-r border-[#3a3a3a] flex items-center px-2 gap-1.5">
                  <div className="w-2 h-full shrink-0" style={{ backgroundColor: track.color + '40' }}>
                    <div className="w-full" style={{ backgroundColor: track.color, height: `${dBToPercent(track.volume)}%`, marginTop: 'auto' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium text-[#ddd] truncate">{track.name}</div>
                    <div className="text-[9px] text-[#555] capitalize">{track.type}</div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={e => { e.stopPropagation(); updateTrack(track.id, { muted: !track.muted }); }}
                      className={`w-5 h-4 rounded text-[8px] font-bold flex items-center justify-center ${track.muted ? 'bg-[#ff6b35] text-white' : 'bg-[#333] text-[#666] hover:text-[#aaa]'}`}>
                      M
                    </button>
                    <button onClick={e => { e.stopPropagation(); updateTrack(track.id, { solo: !track.solo }); }}
                      className={`w-5 h-4 rounded text-[8px] font-bold flex items-center justify-center ${track.solo ? 'bg-[#fbbf24] text-black' : 'bg-[#333] text-[#666] hover:text-[#aaa]'}`}>
                      S
                    </button>
                    {track.type !== 'master' && (
                      <button onClick={e => { e.stopPropagation(); updateTrack(track.id, { armed: !track.armed }); }}
                        className={`w-5 h-4 rounded text-[8px] font-bold flex items-center justify-center ${track.armed ? 'bg-red-600 text-white animate-pulse' : 'bg-[#333] text-[#666] hover:text-[#aaa]'}`}>
                        R
                      </button>
                    )}
                  </div>
                </div>

                {/* Track Lane (Regions/Waveforms) — Drop Target */}
                <div className={`flex-1 relative overflow-hidden transition-colors ${dragOverTrackId === track.id ? 'ring-1 ring-[#4a6fa5] bg-[#1a2a3a]' : ''}`}
                  style={{ backgroundColor: dragOverTrackId === track.id ? undefined : (track.muted ? '#1a1a1a' : '#1e1e1e') }}
                  onDragOver={(e) => handleDragOver(track.id, e)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleFileDrop(track.id, e)}>
                  {/* Grid lines */}
                  {Array.from({ length: Math.ceil(totalBeats / 4) + 1 }, (_, i) => (
                    <div key={i} className="absolute top-0 bottom-0 w-px bg-[#2a2a2a]"
                      style={{ left: `${(i * 4 * zoom * 100) / totalBeats}%` }} />
                  ))}

                  {/* Drop hint */}
                  {dragOverTrackId === track.id && (
                    <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                      <div className="bg-[#4a6fa5] bg-opacity-20 border-2 border-dashed border-[#4a6fa5] rounded px-3 py-1 text-[10px] text-[#88bbff]">
                        Drop audio file here
                      </div>
                    </div>
                  )}

                  {/* Regions — draggable */}
                  {track.regions.map(region => (
                    <div key={region.id}
                      className={`absolute top-1 bottom-1 rounded-sm overflow-hidden border border-opacity-30 cursor-grab active:cursor-grabbing ${draggingRegion?.regionId === region.id ? 'ring-1 ring-white opacity-80' : ''}`}
                      style={{
                        left: `${(region.startBeat * zoom * 100) / totalBeats}%`,
                        width: `${(region.durationBeats * zoom * 100) / totalBeats}%`,
                        backgroundColor: region.color + '20',
                        borderColor: region.color + '60',
                      }}
                      onMouseDown={(e) => handleRegionDragStart(track.id, region.id, e)}>
                      {/* Drag handle */}
                      <div className="absolute top-0 left-0 w-3 h-full flex items-center justify-center opacity-30 hover:opacity-80 z-20">
                        <GripVertical className="w-2 h-2" style={{ color: region.color }} />
                      </div>
                      {/* Region name */}
                      <div className="absolute top-0 left-3 text-[8px] font-medium z-10"
                        style={{ color: region.color }}>
                        {region.name}
                      </div>
                      {/* Waveform */}
                      <svg className="w-full h-full" preserveAspectRatio="none" viewBox={`0 0 ${region.waveformData.length} 100`}>
                        {region.waveformData.map((val, i) => (
                          <rect key={i} x={i} y={50 - val * 40} width={0.8} height={val * 80}
                            fill={track.muted ? '#444' : region.color + '80'} />
                        ))}
                      </svg>
                    </div>
                  ))}

                  {/* Playhead */}
                  <div className="absolute top-0 bottom-0 w-px bg-[#ff4444] z-20 pointer-events-none"
                    style={{ left: `${(currentBeat * zoom * 100) / totalBeats}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* ====== EFFECTS RACK PANEL ====== */}
          {showEffects && selectedTrack && (
            <div className="h-40 bg-[#1e1e1e] border-t border-[#3a3a3a] shrink-0 overflow-hidden">
              <div className="flex items-center h-6 bg-[#2a2a2a] border-b border-[#3a3a3a] px-2">
                <span className="text-[10px] font-bold text-[#999] uppercase tracking-wider">Effects Rack — {selectedTrack.name}</span>
                <div className="flex-1" />
                <button onClick={() => setShowEffects(false)} className="text-[#666] hover:text-white">
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              <div className="flex h-[calc(100%-24px)] overflow-x-auto">
                {selectedTrack.effects.map(fx => (
                  <div key={fx.id} className="w-48 shrink-0 border-r border-[#2a2a2a] p-2 flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-medium text-[#ccc]">{fx.name}</span>
                      <button onClick={() => {
                        const newEffects = selectedTrack.effects.map(e => e.id === fx.id ? { ...e, enabled: !e.enabled } : e);
                        updateTrack(selectedTrack.id, { effects: newEffects });
                      }}
                        className={`w-4 h-4 rounded-full border text-[7px] flex items-center justify-center ${fx.enabled ? 'border-[#4ade80] text-[#4ade80]' : 'border-[#555] text-[#555]'}`}>
                        {fx.enabled ? '●' : '○'}
                      </button>
                    </div>
                    {/* Effect-specific visualization */}
                    {fx.type === 'eq' && (
                      <div className="flex-1 bg-[#111] rounded border border-[#333] relative overflow-hidden">
                        <svg viewBox="0 0 200 80" className="w-full h-full">
                          <defs>
                            <linearGradient id={`eqGrad-${fx.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#4ade80" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {[0.25, 0.5, 0.75].map(y => (
                            <line key={y} x1="0" y1={y * 80} x2="200" y2={y * 80} stroke="#222" strokeWidth="0.5" />
                          ))}
                          <path d={`M0,40 Q30,${40 - (fx.params.low || 0) * 3} 60,${40 - (fx.params.low || 0) * 2} T100,${40 - (fx.params.mid || 0) * 2} T160,${40 - (fx.params.high || 0) * 2} T200,40`}
                            fill={`url(#eqGrad-${fx.id})`} stroke="#4ade80" strokeWidth="1.5" />
                        </svg>
                        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[7px] text-[#555]">
                          <span>20Hz</span><span>1kHz</span><span>20kHz</span>
                        </div>
                      </div>
                    )}
                    {fx.type === 'compressor' && (
                      <div className="flex-1 bg-[#111] rounded border border-[#333] relative overflow-hidden">
                        <svg viewBox="0 0 100 80" className="w-full h-full">
                          <line x1="0" y1="80" x2="100" y2="0" stroke="#333" strokeWidth="0.5" strokeDasharray="2" />
                          <path d={`M0,80 L${50 + (fx.params.threshold || -18) / 2},${30 - (fx.params.threshold || -18) / 3} L100,${10}`}
                            fill="none" stroke="#60a5fa" strokeWidth="1.5" />
                          <circle cx={50 + (fx.params.threshold || -18) / 2} cy={30 - (fx.params.threshold || -18) / 3} r="3" fill="#60a5fa" />
                        </svg>
                        <div className="absolute top-1 right-1 text-[7px] text-[#60a5fa]">
                          {fx.params.ratio || 4}:1
                        </div>
                      </div>
                    )}
                    {fx.type === 'reverb' && (
                      <div className="flex-1 bg-[#111] rounded border border-[#333] relative overflow-hidden">
                        <svg viewBox="0 0 200 80" className="w-full h-full">
                          <path d="M10,70 Q20,10 40,30 T80,50 T120,60 T160,65 T200,70" fill="none" stroke="#c084fc" strokeWidth="1" opacity="0.5" />
                          <path d="M10,70 Q25,15 50,35 T90,55 T130,62 T170,67 T200,70" fill="none" stroke="#c084fc" strokeWidth="1.5" />
                        </svg>
                        <div className="absolute top-1 left-1 text-[7px] text-[#c084fc]">
                          {fx.params.decay || 2.5}s
                        </div>
                      </div>
                    )}
                    {!['eq', 'compressor', 'reverb'].includes(fx.type) && (
                      <div className="flex-1 bg-[#111] rounded border border-[#333] flex items-center justify-center">
                        <Sliders className="w-4 h-4 text-[#444]" />
                      </div>
                    )}
                    {/* Param knobs */}
                    <div className="flex justify-between mt-1">
                      {Object.entries(fx.params).slice(0, 3).map(([key, val]) => (
                        <div key={key} className="text-center">
                          <div className="text-[7px] text-[#555] capitalize">{key}</div>
                          <div className="text-[8px] text-[#aaa] font-mono">{typeof val === 'number' ? val.toFixed(val % 1 ? 1 : 0) : val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {/* Add effect slot */}
                <div className="w-48 shrink-0 border-r border-[#2a2a2a] p-2 flex items-center justify-center">
                  <button className="px-3 py-2 rounded border border-dashed border-[#3a3a3a] text-[10px] text-[#555] hover:text-[#aaa] hover:border-[#555] transition-colors">
                    + Insert Effect
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ====== BOTTOM: MIXER PANEL ====== */}
          {showMixer && (
            <div className="h-52 bg-[#222222] border-t border-[#3a3a3a] flex shrink-0 overflow-x-auto">
              {tracks.filter(t => t.visible).map(track => (
                <ChannelStrip
                  key={track.id}
                  track={track}
                  isSelected={track.id === selectedTrackId}
                  onSelect={() => setSelectedTrackId(track.id)}
                  onUpdate={(updates) => updateTrack(track.id, updates)}
                  isPlaying={isPlaying}
                />
              ))}
            </div>
          )}
        </div>

        {/* ====== RIGHT: BROWSER PANEL ====== */}
        {showBrowser && (
          <div className="w-52 bg-[#252525] border-l border-[#3a3a3a] flex flex-col shrink-0 overflow-y-auto">
            <div className="px-2 py-1.5 bg-[#2a2a2a] border-b border-[#3a3a3a] flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#999] uppercase tracking-wider">Browser</span>
              <button onClick={() => setShowBrowser(false)} className="text-[#666] hover:text-white">
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Browser Tabs */}
            <div className="flex border-b border-[#3a3a3a]">
              {[
                { icon: Music, label: 'Audio' },
                { icon: Film, label: 'Video' },
                { icon: Layers, label: 'Loops' },
              ].map(({ icon: Icon, label }) => (
                <button key={label} className="flex-1 py-1.5 text-[9px] text-[#666] hover:text-[#aaa] flex flex-col items-center gap-0.5 hover:bg-[#2a2a2a]">
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>

            {/* File Tree */}
            <div className="p-2 space-y-0.5">
              <BrowserFolder name="Project Files" defaultOpen>
                <BrowserFile name="Lead_Vocal_Take3.wav" type="audio" />
                <BrowserFile name="BG_Vocals_Stack.wav" type="audio" />
                <BrowserFile name="Drum_Loop_120bpm.wav" type="audio" />
                <BrowserFile name="Bass_DI.wav" type="audio" />
              </BrowserFolder>
              <BrowserFolder name="RRB Library">
                <BrowserFile name="Boogie_Beat_01.wav" type="audio" />
                <BrowserFile name="Funk_Bass_Groove.wav" type="audio" />
                <BrowserFile name="Soul_Keys_Pad.wav" type="audio" />
                <BrowserFile name="Gospel_Choir_Loop.wav" type="audio" />
              </BrowserFolder>
              <BrowserFolder name="Video Assets">
                <BrowserFile name="Interview_Cam1.mp4" type="video" />
                <BrowserFile name="B_Roll_Studio.mp4" type="video" />
                <BrowserFile name="Logo_Animation.mov" type="video" />
              </BrowserFolder>
              <BrowserFolder name="Imports">
                <BrowserFile name="Reference_Mix.wav" type="audio" />
                <BrowserFile name="Stems_Export.zip" type="other" />
              </BrowserFolder>
            </div>
          </div>
        )}
      </div>

      {/* ====== STATUS BAR ====== */}
      <div className="h-5 bg-[#2a2a2a] border-t border-[#3a3a3a] flex items-center px-3 gap-4 shrink-0 text-[9px] text-[#555]">
        <span>Sample Rate: 48kHz</span>
        <span>Bit Depth: 24-bit</span>
        <span>Buffer: 256 samples</span>
        <span>Latency: 5.3ms</span>
        <span className="text-[#666]">|</span>
        <span>Shortcuts: Space=Play  R=Record  Enter=Stop  C=Loop  M=Mute  S=Solo  ↑↓=Track  +/-=Zoom</span>
        <div className="flex-1" />
        <span className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${audioEngine.engineState.isInitialized ? 'bg-[#4ade80]' : 'bg-[#fbbf24]'}`} />
          {audioEngine.engineState.isInitialized ? 'Audio Engine Active' : 'Audio Engine Standby'}
        </span>
        <span>CPU: {audioEngine.engineState.isInitialized ? `${Math.round(audioEngine.engineState.cpuLoad)}%` : '—'}</span>
        <span>SR: {audioEngine.engineState.sampleRate}Hz</span>
        <span>Disk: 2.1 MB/s</span>
        <span className="text-[#888]">Canryn Production &amp; Subsidiaries</span>
      </div>
    </div>
  );
}

// ============================================================
// CHANNEL STRIP COMPONENT (Mixer)
// ============================================================
function ChannelStrip({ track, isSelected, onSelect, onUpdate, isPlaying }: {
  track: Track;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Track>) => void;
  isPlaying: boolean;
}) {
  const [meterLevel, setMeterLevel] = useState(-60);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && !track.muted) {
        setMeterLevel(-30 + Math.random() * (30 + track.volume));
      } else {
        setMeterLevel(-60);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [isPlaying, track.muted, track.volume]);

  const meterPercent = Math.max(0, Math.min(100, ((meterLevel + 60) / 66) * 100));

  return (
    <div className={`w-16 shrink-0 flex flex-col border-r border-[#2a2a2a] cursor-pointer transition-colors ${isSelected ? 'bg-[#1e2a3a]' : 'hover:bg-[#282828]'}`}
      onClick={onSelect}>
      {/* Track name */}
      <div className="px-1 py-0.5 text-center border-b border-[#2a2a2a]" style={{ backgroundColor: track.color + '15' }}>
        <div className="text-[8px] font-medium truncate" style={{ color: track.color }}>{track.name}</div>
      </div>

      {/* Effects slots indicator */}
      <div className="flex justify-center gap-0.5 py-0.5 border-b border-[#2a2a2a]">
        {track.effects.slice(0, 4).map(fx => (
          <div key={fx.id} className={`w-1 h-1 rounded-full ${fx.enabled ? 'bg-[#4ade80]' : 'bg-[#444]'}`} />
        ))}
      </div>

      {/* Pan knob (visual) */}
      <div className="flex justify-center py-1 border-b border-[#2a2a2a]">
        <div className="w-6 h-6 rounded-full bg-[#333] border border-[#444] relative flex items-center justify-center">
          <div className="w-0.5 h-2 bg-[#aaa] rounded-full origin-bottom"
            style={{ transform: `rotate(${track.pan * 1.35}deg)` }} />
        </div>
      </div>

      {/* Fader + Meter */}
      <div className="flex-1 flex items-stretch px-1.5 py-1 gap-1">
        {/* Meter */}
        <div className="w-2 bg-[#111] rounded-sm overflow-hidden flex flex-col-reverse">
          <div className="transition-all duration-75"
            style={{
              height: `${meterPercent}%`,
              background: meterPercent > 85 ? 'linear-gradient(to top, #4ade80, #fbbf24, #ef4444)' :
                meterPercent > 60 ? 'linear-gradient(to top, #4ade80, #fbbf24)' : '#4ade80',
            }} />
        </div>
        {/* Fader */}
        <div className="flex-1 flex flex-col items-center relative">
          <input type="range" min={-60} max={6} step={0.5} value={track.volume}
            onChange={e => onUpdate({ volume: parseFloat(e.target.value) })}
            className="h-full w-4 appearance-none cursor-pointer bg-transparent"
            style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
            onClick={e => e.stopPropagation()} />
        </div>
        {/* Meter */}
        <div className="w-2 bg-[#111] rounded-sm overflow-hidden flex flex-col-reverse">
          <div className="transition-all duration-75"
            style={{
              height: `${Math.max(0, meterPercent - 2 + Math.random() * 4)}%`,
              background: meterPercent > 85 ? 'linear-gradient(to top, #4ade80, #fbbf24, #ef4444)' :
                meterPercent > 60 ? 'linear-gradient(to top, #4ade80, #fbbf24)' : '#4ade80',
            }} />
        </div>
      </div>

      {/* dB readout */}
      <div className="text-center text-[8px] font-mono text-[#888] py-0.5 border-t border-[#2a2a2a]">
        {track.volume.toFixed(1)}
      </div>

      {/* M/S buttons */}
      <div className="flex border-t border-[#2a2a2a]">
        <button onClick={e => { e.stopPropagation(); onUpdate({ muted: !track.muted }); }}
          className={`flex-1 py-0.5 text-[8px] font-bold ${track.muted ? 'bg-[#ff6b35] text-white' : 'text-[#555] hover:text-[#aaa]'}`}>
          M
        </button>
        <button onClick={e => { e.stopPropagation(); onUpdate({ solo: !track.solo }); }}
          className={`flex-1 py-0.5 text-[8px] font-bold border-l border-[#2a2a2a] ${track.solo ? 'bg-[#fbbf24] text-black' : 'text-[#555] hover:text-[#aaa]'}`}>
          S
        </button>
      </div>
    </div>
  );
}

// ============================================================
// METER BAR (Transport)
// ============================================================
function MeterBar({ level, label }: { level: number; label: string }) {
  const percent = Math.max(0, Math.min(100, ((level + 60) / 66) * 100));
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="w-3 h-8 bg-[#111] rounded-sm overflow-hidden flex flex-col-reverse border border-[#333]">
        <div className="transition-all duration-75"
          style={{
            height: `${percent}%`,
            background: percent > 85 ? 'linear-gradient(to top, #4ade80, #fbbf24, #ef4444)' :
              percent > 60 ? 'linear-gradient(to top, #4ade80, #fbbf24)' : '#4ade80',
          }} />
      </div>
      <span className="text-[7px] text-[#555]">{label}</span>
    </div>
  );
}

// ============================================================
// BROWSER COMPONENTS
// ============================================================
function BrowserFolder({ name, children, defaultOpen = false }: {
  name: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1 w-full py-0.5 text-[10px] text-[#aaa] hover:text-white">
        {open ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
        <Folder className="w-3 h-3 text-[#fbbf24]" />
        <span>{name}</span>
      </button>
      {open && <div className="ml-4 space-y-0.5">{children}</div>}
    </div>
  );
}

function BrowserFile({ name, type }: { name: string; type: 'audio' | 'video' | 'other' }) {
  const Icon = type === 'audio' ? Music : type === 'video' ? Film : Layers;
  const color = type === 'audio' ? '#4ade80' : type === 'video' ? '#c084fc' : '#888';
  return (
    <div className="flex items-center gap-1.5 py-0.5 px-1 rounded hover:bg-[#333] cursor-grab active:cursor-grabbing text-[10px] text-[#888] hover:text-[#ccc]"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', name);
        e.dataTransfer.effectAllowed = 'copy';
        // Create a drag image
        const ghost = document.createElement('div');
        ghost.textContent = name;
        ghost.style.cssText = 'position:fixed;top:-100px;background:#333;color:#ccc;padding:2px 8px;border-radius:4px;font-size:10px;font-family:monospace';
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 0, 0);
        setTimeout(() => document.body.removeChild(ghost), 0);
      }}>
      <GripVertical className="w-2 h-2 opacity-30" style={{ color }} />
      <Icon className="w-3 h-3 shrink-0" style={{ color }} />
      <span className="truncate">{name}</span>
    </div>
  );
}
