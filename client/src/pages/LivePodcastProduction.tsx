"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mic, MicOff, Pause, Play, Square, Flag, Scissors, BookmarkPlus,
  StickyNote, Volume2, Music, Zap, Download, Clock, Users, Tag,
  AlertTriangle, ChevronRight, Trash2, Radio, Headphones, ArrowLeft,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "wouter";

// Marker type colors
const MARKER_COLORS: Record<string, string> = {
  highlight: 'bg-green-500',
  cut: 'bg-red-500',
  edit: 'bg-amber-500',
  review: 'bg-blue-500',
  keep: 'bg-emerald-500',
  remove: 'bg-rose-600',
};

// Segment type icons
const SEGMENT_LABELS: Record<string, { icon: string; color: string }> = {
  intro: { icon: '🎬', color: 'bg-purple-600' },
  discussion: { icon: '💬', color: 'bg-blue-600' },
  interview: { icon: '🎤', color: 'bg-cyan-600' },
  break: { icon: '☕', color: 'bg-amber-600' },
  'ad-read': { icon: '📢', color: 'bg-orange-600' },
  music: { icon: '🎵', color: 'bg-pink-600' },
  outro: { icon: '👋', color: 'bg-indigo-600' },
  custom: { icon: '⚡', color: 'bg-gray-600' },
};

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function LivePodcastProduction() {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState<string>('preparing');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Setup form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [guestInput, setGuestInput] = useState('');
  const [guests, setGuests] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [episodeNumber, setEpisodeNumber] = useState<number | undefined>();
  const [season, setSeason] = useState<number | undefined>();

  // Note input
  const [noteContent, setNoteContent] = useState('');
  const [notePriority, setNotePriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');

  // Audio levels (simulated for visual feedback)
  const [audioLevel, setAudioLevel] = useState({ left: 0, right: 0 });
  const audioLevelRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Mutations
  const createSession = trpc.livePodcastProduction.createSession.useMutation();
  const startRecording = trpc.livePodcastProduction.startRecording.useMutation();
  const pauseRecording = trpc.livePodcastProduction.pauseRecording.useMutation();
  const stopRecording = trpc.livePodcastProduction.stopRecording.useMutation();
  const addMarker = trpc.livePodcastProduction.addMarker.useMutation();
  const startSegment = trpc.livePodcastProduction.startSegment.useMutation();
  const endSegment = trpc.livePodcastProduction.endSegment.useMutation();
  const addNote = trpc.livePodcastProduction.addNote.useMutation();
  const triggerSound = trpc.livePodcastProduction.triggerSound.useMutation();
  const exportSession = trpc.livePodcastProduction.exportSession.useMutation();

  // Queries
  const sessionQuery = trpc.livePodcastProduction.getSession.useQuery(
    { sessionId: sessionId || '' },
    { enabled: !!sessionId, refetchInterval: status === 'recording' ? 2000 : 5000 }
  );
  const soundBoard = trpc.livePodcastProduction.getSoundBoard.useQuery();
  const sessionList = trpc.livePodcastProduction.listSessions.useQuery();

  // Timer
  useEffect(() => {
    if (status === 'recording') {
      timerRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000);
      // Simulate audio levels
      audioLevelRef.current = setInterval(() => {
        setAudioLevel({
          left: Math.random() * 0.6 + 0.2,
          right: Math.random() * 0.6 + 0.2,
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioLevelRef.current) clearInterval(audioLevelRef.current);
      if (status !== 'recording') setAudioLevel({ left: 0, right: 0 });
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioLevelRef.current) clearInterval(audioLevelRef.current);
    };
  }, [status]);

  // Keyboard shortcuts for sound board
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'recording' || !sessionId) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const sound = soundBoard.data?.sounds.find(s => s.key === e.key);
      if (sound) {
        e.preventDefault();
        handleTriggerSound(sound.id);
      }

      // Quick marker shortcuts
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleAddMarker('highlight', 'Quick Marker');
      }
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleAddMarker('cut', 'Cut Point');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, sessionId, soundBoard.data]);

  const handleCreateSession = async () => {
    if (!title.trim()) { toast.error('Enter an episode title'); return; }
    try {
      const result = await createSession.mutateAsync({
        title, description, guests, tags, episodeNumber, season,
      });
      setSessionId(result.sessionId);
      setStatus('preparing');
      toast.success(result.message);
    } catch { toast.error('Failed to create session'); }
  };

  const handleStartRecording = async () => {
    if (!sessionId) return;
    try {
      const result = await startRecording.mutateAsync({ sessionId });
      setStatus('recording');
      if (result.elapsed) setElapsed(result.elapsed);
      toast.success(result.message);
    } catch { toast.error('Failed to start recording'); }
  };

  const handlePauseRecording = async () => {
    if (!sessionId) return;
    try {
      const result = await pauseRecording.mutateAsync({ sessionId });
      setStatus('paused');
      toast.info(result.message);
    } catch { toast.error('Failed to pause'); }
  };

  const handleStopRecording = async () => {
    if (!sessionId) return;
    try {
      const result = await stopRecording.mutateAsync({ sessionId });
      setStatus('stopped');
      toast.success(result.message);
    } catch { toast.error('Failed to stop recording'); }
  };

  const handleAddMarker = async (type: string, label: string, note?: string) => {
    if (!sessionId) return;
    try {
      const result = await addMarker.mutateAsync({
        sessionId, type: type as any, label, note,
      });
      toast.success(result.message);
      sessionQuery.refetch();
    } catch { toast.error('Failed to add marker'); }
  };

  const handleStartSegment = async (type: string, label?: string) => {
    if (!sessionId) return;
    try {
      const result = await startSegment.mutateAsync({
        sessionId, type: type as any, label,
      });
      toast.success(result.message);
      sessionQuery.refetch();
    } catch { toast.error('Failed to start segment'); }
  };

  const handleAddNote = async () => {
    if (!sessionId || !noteContent.trim()) return;
    try {
      const result = await addNote.mutateAsync({
        sessionId, content: noteContent, priority: notePriority,
      });
      setNoteContent('');
      toast.success(result.message);
      sessionQuery.refetch();
    } catch { toast.error('Failed to add note'); }
  };

  const handleTriggerSound = async (soundId: string) => {
    if (!sessionId) return;
    try {
      const result = await triggerSound.mutateAsync({ sessionId, soundId });
      // Play the sound locally using Web Audio API
      playLocalSound(result.sound);
      toast.success(result.message);
    } catch { toast.error('Failed to trigger sound'); }
  };

  const handleExport = async () => {
    if (!sessionId) return;
    try {
      const result = await exportSession.mutateAsync({ sessionId, format: 'json' });
      toast.success(`Exported: ${result.summary.title} — ${result.summary.duration}`);
      if (result.manifestUrl) window.open(result.manifestUrl, '_blank');
    } catch { toast.error('Failed to export'); }
  };

  // Play sound locally using Web Audio API oscillator
  const playLocalSound = useCallback((sound: any) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      // Different sounds get different frequencies
      const freqMap: Record<string, number> = {
        'transition-whoosh': 800, 'transition-sweep': 600,
        'stinger-news': 880, 'stinger-break': 660,
        'jingle-rrb': 440, 'jingle-canryn': 528,
        'sfx-applause': 300, 'sfx-rimshot': 1200,
        'sfx-airhorn': 1000, 'sfx-bell': 1760,
        'countdown-3': 440, 'silence-2s': 0, 'tone-440': 440,
      };

      osc.frequency.value = freqMap[sound.id] || 440;
      osc.type = sound.category === 'sfx' ? 'square' : 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + Math.min(sound.duration, 2));
      osc.start();
      osc.stop(ctx.currentTime + Math.min(sound.duration, 2));
    } catch { /* Audio context not available */ }
  }, []);

  // ========== SETUP SCREEN ==========
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Link href="/rrb/podcast-and-video">
              <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Mic className="w-8 h-8 text-red-500" />
                Live Podcast Production
              </h1>
              <p className="text-slate-400 text-sm">A Canryn Production — QUMUS Orchestrated</p>
            </div>
          </div>

          {/* Previous Sessions */}
          {sessionList.data && sessionList.data.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sessionList.data.slice(0, 5).map(s => (
                  <button
                    key={s.sessionId}
                    onClick={() => { setSessionId(s.sessionId); setStatus(s.status); setElapsed(s.duration); }}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors text-left"
                  >
                    <div>
                      <p className="text-white font-medium">{s.title}</p>
                      <p className="text-slate-400 text-xs">{formatTime(s.duration)} · {s.markers} markers · {s.segments} segments</p>
                    </div>
                    <Badge variant={s.status === 'recording' ? 'destructive' : s.status === 'stopped' ? 'secondary' : 'outline'}>
                      {s.status}
                    </Badge>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* New Session Form */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">New Episode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Episode Title *</label>
                  <Input
                    value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="e.g., The Legacy of Seabrun Candy Hunter"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-300">Season</label>
                    <Input
                      type="number" value={season || ''} onChange={e => setSeason(Number(e.target.value) || undefined)}
                      placeholder="1" className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-300">Episode #</label>
                    <Input
                      type="number" value={episodeNumber || ''} onChange={e => setEpisodeNumber(Number(e.target.value) || undefined)}
                      placeholder="1" className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Description</label>
                <Textarea
                  value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Episode description..."
                  className="bg-slate-700 border-slate-600 text-white min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Guests</label>
                  <div className="flex gap-2">
                    <Input
                      value={guestInput} onChange={e => setGuestInput(e.target.value)}
                      placeholder="Guest name" className="bg-slate-700 border-slate-600 text-white"
                      onKeyDown={e => { if (e.key === 'Enter' && guestInput.trim()) { setGuests([...guests, guestInput.trim()]); setGuestInput(''); } }}
                    />
                    <Button variant="outline" size="sm" onClick={() => { if (guestInput.trim()) { setGuests([...guests, guestInput.trim()]); setGuestInput(''); } }}>
                      <Users className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {guests.map((g, i) => (
                      <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => setGuests(guests.filter((_, j) => j !== i))}>
                        {g} ×
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Tags</label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput} onChange={e => setTagInput(e.target.value)}
                      placeholder="Tag" className="bg-slate-700 border-slate-600 text-white"
                      onKeyDown={e => { if (e.key === 'Enter' && tagInput.trim()) { setTags([...tags, tagInput.trim()]); setTagInput(''); } }}
                    />
                    <Button variant="outline" size="sm" onClick={() => { if (tagInput.trim()) { setTags([...tags, tagInput.trim()]); setTagInput(''); } }}>
                      <Tag className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tags.map((t, i) => (
                      <Badge key={i} variant="outline" className="cursor-pointer" onClick={() => setTags(tags.filter((_, j) => j !== i))}>
                        {t} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={handleCreateSession} disabled={createSession.isPending || !title.trim()} className="w-full bg-red-600 hover:bg-red-700 text-white">
                <Mic className="w-4 h-4 mr-2" />
                {createSession.isPending ? 'Creating...' : 'Create Production Session'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ========== PRODUCTION INTERFACE ==========
  const session = sessionQuery.data;
  const isRecording = status === 'recording';
  const isPaused = status === 'paused';
  const isStopped = status === 'stopped';
  const activeSegment = session?.segments?.find((s: any) => s.status === 'active');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Top Bar — Recording Status */}
      <div className={`sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b ${
        isRecording ? 'bg-red-950/90 border-red-800' : isPaused ? 'bg-amber-950/90 border-amber-800' : 'bg-slate-900/90 border-slate-700'
      } backdrop-blur-sm`}>
        <div className="flex items-center gap-3">
          <button onClick={() => { setSessionId(null); setStatus('preparing'); setElapsed(0); }} className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          {isRecording && <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />}
          {isPaused && <span className="w-3 h-3 rounded-full bg-amber-500" />}
          <div>
            <h2 className="text-white font-semibold text-sm md:text-base truncate max-w-[200px] md:max-w-none">{session?.title || title}</h2>
            <p className="text-xs text-slate-400">
              {isRecording ? 'RECORDING' : isPaused ? 'PAUSED' : isStopped ? 'STOPPED' : 'READY'}
              {activeSegment && ` · ${SEGMENT_LABELS[activeSegment.type]?.icon || '⚡'} ${activeSegment.label}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className={`font-mono text-2xl md:text-3xl font-bold ${isRecording ? 'text-red-400' : isPaused ? 'text-amber-400' : 'text-white'}`}>
            {formatTime(elapsed)}
          </div>

          {/* Audio Level Meters */}
          <div className="hidden md:flex flex-col gap-0.5 w-24">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full transition-all duration-100"
                style={{ width: `${audioLevel.left * 100}%` }} />
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full transition-all duration-100"
                style={{ width: `${audioLevel.right * 100}%` }} />
            </div>
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>L</span><span>R</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-7xl mx-auto">
        {/* Transport Controls */}
        <div className="flex flex-wrap items-center gap-2 justify-center">
          {status === 'preparing' && (
            <Button onClick={handleStartRecording} className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg">
              <Mic className="w-6 h-6 mr-2" /> Start Recording
            </Button>
          )}
          {isRecording && (
            <>
              <Button onClick={handlePauseRecording} variant="outline" className="border-amber-600 text-amber-400 hover:bg-amber-950 px-6 py-5">
                <Pause className="w-5 h-5 mr-2" /> Pause
              </Button>
              <Button onClick={handleStopRecording} variant="outline" className="border-red-600 text-red-400 hover:bg-red-950 px-6 py-5">
                <Square className="w-5 h-5 mr-2" /> Stop
              </Button>
            </>
          )}
          {isPaused && (
            <>
              <Button onClick={handleStartRecording} className="bg-green-600 hover:bg-green-700 text-white px-6 py-5">
                <Play className="w-5 h-5 mr-2" /> Resume
              </Button>
              <Button onClick={handleStopRecording} variant="outline" className="border-red-600 text-red-400 hover:bg-red-950 px-6 py-5">
                <Square className="w-5 h-5 mr-2" /> Stop
              </Button>
            </>
          )}
          {isStopped && (
            <Button onClick={handleExport} disabled={exportSession.isPending} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-5">
              <Download className="w-5 h-5 mr-2" /> {exportSession.isPending ? 'Exporting...' : 'Export Production'}
            </Button>
          )}
        </div>

        {/* Main Production Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* LEFT: Markers & Segments */}
          <div className="space-y-4">
            {/* Quick Markers */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Flag className="w-4 h-4 text-green-400" /> Quick Markers
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs" disabled={!isRecording}
                  onClick={() => handleAddMarker('highlight', 'Highlight')}>
                  ✨ Highlight
                </Button>
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-xs" disabled={!isRecording}
                  onClick={() => handleAddMarker('cut', 'Cut')}>
                  ✂️ Cut
                </Button>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-xs" disabled={!isRecording}
                  onClick={() => handleAddMarker('edit', 'Edit')}>
                  ✏️ Edit
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs" disabled={!isRecording}
                  onClick={() => handleAddMarker('review', 'Review')}>
                  👁️ Review
                </Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs" disabled={!isRecording}
                  onClick={() => handleAddMarker('keep', 'Keep')}>
                  ✅ Keep
                </Button>
                <Button size="sm" className="bg-rose-700 hover:bg-rose-800 text-xs" disabled={!isRecording}
                  onClick={() => handleAddMarker('remove', 'Remove')}>
                  🗑️ Remove
                </Button>
              </CardContent>
            </Card>

            {/* Segment Controls */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-blue-400" /> Segments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(SEGMENT_LABELS).map(([type, { icon, color }]) => (
                    <Button key={type} size="sm" variant="outline"
                      className={`text-xs justify-start ${activeSegment?.type === type ? color + ' text-white border-transparent' : 'border-slate-600 text-slate-300'}`}
                      disabled={!isRecording}
                      onClick={() => handleStartSegment(type)}>
                      {icon} {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                    </Button>
                  ))}
                </div>
                {activeSegment && (
                  <Button size="sm" variant="outline" className="w-full border-slate-600 text-slate-300"
                    onClick={() => endSegment.mutate({ sessionId: sessionId! })}>
                    End Current Segment
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Marker Timeline */}
            <Card className="bg-slate-800/50 border-slate-700 max-h-[300px] overflow-y-auto">
              <CardHeader className="pb-2 sticky top-0 bg-slate-800/90 backdrop-blur-sm z-10">
                <CardTitle className="text-sm text-white">
                  Timeline ({session?.markers?.length || 0} markers · {session?.segments?.length || 0} segments)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {session?.markers?.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-2 text-xs p-1.5 rounded bg-slate-700/50">
                    <span className={`w-2 h-2 rounded-full ${MARKER_COLORS[m.type] || 'bg-gray-500'}`} />
                    <span className="text-slate-400 font-mono w-12">{formatTime(m.timestamp)}</span>
                    <span className="text-white flex-1 truncate">{m.label}</span>
                    <Badge variant="outline" className="text-[10px]">{m.type}</Badge>
                  </div>
                ))}
                {(!session?.markers || session.markers.length === 0) && (
                  <p className="text-slate-500 text-xs text-center py-4">No markers yet. Press M for quick marker during recording.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* CENTER: Sound Board */}
          <div className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" /> Sound Board
                  <span className="text-[10px] text-slate-500 ml-auto">Keyboard: 0-9, Q-Y</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="transitions">
                  <TabsList className="grid grid-cols-3 mb-2 bg-slate-700">
                    <TabsTrigger value="transitions" className="text-xs">Transitions</TabsTrigger>
                    <TabsTrigger value="sfx" className="text-xs">SFX</TabsTrigger>
                    <TabsTrigger value="music" className="text-xs">Music</TabsTrigger>
                  </TabsList>
                  {['transitions', 'sfx', 'music'].map(cat => (
                    <TabsContent key={cat} value={cat} className="grid grid-cols-2 gap-2">
                      {soundBoard.data?.sounds
                        .filter(s => cat === 'music' ? s.category.includes('music') || s.category === 'jingles' : cat === 'sfx' ? s.category === 'sfx' || s.category === 'utility' : s.category === cat || s.category === 'stingers')
                        .map(sound => (
                          <Button key={sound.id} size="sm" variant="outline"
                            className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs h-auto py-2 flex-col items-start"
                            disabled={!isRecording && !isPaused}
                            onClick={() => handleTriggerSound(sound.id)}>
                            <span className="font-medium">{sound.name}</span>
                            <span className="text-[10px] text-slate-500">{sound.duration}s · Key: {sound.key.toUpperCase()}</span>
                          </Button>
                        ))}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Sound Trigger History */}
            <Card className="bg-slate-800/50 border-slate-700 max-h-[200px] overflow-y-auto">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Music className="w-4 h-4 text-pink-400" /> Sound Log ({session?.soundTriggers?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {session?.soundTriggers?.slice().reverse().map((t: any) => (
                  <div key={t.id} className="flex items-center gap-2 text-xs p-1 rounded bg-slate-700/30">
                    <span className="text-slate-400 font-mono w-12">{formatTime(t.timestamp)}</span>
                    <span className="text-white">{t.soundName}</span>
                  </div>
                ))}
                {(!session?.soundTriggers || session.soundTriggers.length === 0) && (
                  <p className="text-slate-500 text-xs text-center py-2">No sounds triggered yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Production Notes */}
          <div className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-amber-400" /> Production Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={noteContent} onChange={e => setNoteContent(e.target.value)}
                  placeholder="Add a timestamped production note..."
                  className="bg-slate-700 border-slate-600 text-white min-h-[60px] text-sm"
                  onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) { handleAddNote(); } }}
                />
                <div className="flex items-center gap-2">
                  <select
                    value={notePriority}
                    onChange={e => setNotePriority(e.target.value as any)}
                    className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <Button size="sm" onClick={handleAddNote} disabled={!noteContent.trim()} className="flex-1 bg-amber-600 hover:bg-amber-700 text-xs">
                    <BookmarkPlus className="w-3 h-3 mr-1" /> Add Note (Ctrl+Enter)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notes List */}
            <Card className="bg-slate-800/50 border-slate-700 max-h-[300px] overflow-y-auto">
              <CardHeader className="pb-2 sticky top-0 bg-slate-800/90 backdrop-blur-sm z-10">
                <CardTitle className="text-sm text-white">Notes ({session?.notes?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {session?.notes?.slice().reverse().map((n: any) => (
                  <div key={n.id} className={`p-2 rounded text-xs border-l-2 ${
                    n.priority === 'urgent' ? 'border-red-500 bg-red-950/30' :
                    n.priority === 'high' ? 'border-amber-500 bg-amber-950/30' :
                    n.priority === 'normal' ? 'border-blue-500 bg-blue-950/30' :
                    'border-slate-500 bg-slate-700/30'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-400 font-mono">{formatTime(n.timestamp)}</span>
                      <Badge variant="outline" className="text-[10px]">{n.priority}</Badge>
                      <span className="text-slate-500 text-[10px] ml-auto">{n.author}</span>
                    </div>
                    <p className="text-white">{n.content}</p>
                  </div>
                ))}
                {(!session?.notes || session.notes.length === 0) && (
                  <p className="text-slate-500 text-xs text-center py-4">No notes yet. Add notes during recording for post-production reference.</p>
                )}
              </CardContent>
            </Card>

            {/* Session Info */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-red-400" /> Session Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-slate-400">
                {session?.episodeNumber && <p>Episode {session.episodeNumber}{session.season ? `, Season ${session.season}` : ''}</p>}
                {session?.guests && session.guests.length > 0 && (
                  <p className="flex items-center gap-1"><Users className="w-3 h-3" /> {session.guests.join(', ')}</p>
                )}
                {session?.tags && session.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {session.tags.map((t: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-[10px]">{t}</Badge>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-slate-500 mt-2">
                  Keyboard: M = marker, C = cut point, 0-9/Q-Y = sound board
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Segment Timeline Bar */}
        {session?.segments && session.segments.length > 0 && elapsed > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-3">
              <p className="text-xs text-slate-400 mb-2">Segment Timeline</p>
              <div className="relative h-8 bg-slate-700 rounded-full overflow-hidden">
                {session.segments.map((seg: any) => {
                  const start = (seg.startTime / elapsed) * 100;
                  const width = ((seg.endTime || elapsed) - seg.startTime) / elapsed * 100;
                  const info = SEGMENT_LABELS[seg.type] || SEGMENT_LABELS.custom;
                  return (
                    <div
                      key={seg.id}
                      className={`absolute top-0 h-full ${info.color} opacity-80 flex items-center justify-center text-[10px] text-white font-medium overflow-hidden`}
                      style={{ left: `${start}%`, width: `${Math.max(width, 1)}%` }}
                      title={`${seg.label}: ${formatTime(seg.startTime)} - ${seg.endTime ? formatTime(seg.endTime) : 'now'}`}
                    >
                      {width > 8 && `${info.icon} ${seg.label}`}
                    </div>
                  );
                })}
                {/* Marker dots */}
                {session.markers?.map((m: any) => (
                  <div
                    key={m.id}
                    className={`absolute top-0 w-1 h-full ${MARKER_COLORS[m.type] || 'bg-white'}`}
                    style={{ left: `${(m.timestamp / elapsed) * 100}%` }}
                    title={`${m.label} at ${formatTime(m.timestamp)}`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0:00</span>
                <span>{formatTime(elapsed)}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
