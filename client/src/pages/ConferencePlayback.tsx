import { useState, useRef, useEffect, useMemo } from 'react';
import { useRoute, Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Download, FileText, Clock, Users, Calendar, Radio, Cpu, Shield, ChevronRight, Maximize2, Minimize2, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Chapter {
  id: number;
  title: string;
  startTime: number;
  endTime: number;
  speaker?: string;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ConferencePlayback() {
  const [, params] = useRoute('/conference/playback/:id');
  const conferenceId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();

  const { data: conference } = trpc.conference.getConference.useQuery(
    { id: conferenceId! },
    { enabled: conferenceId !== null }
  );
  const { data: transcript } = trpc.conference.getTranscript.useQuery(
    { conferenceId: conferenceId! },
    { enabled: conferenceId !== null }
  );

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [showTranscript, setShowTranscript] = useState(true);

  // Generate chapters from transcript or duration
  const chapters = useMemo<Chapter[]>(() => {
    if (!conference) return [];
    const totalDuration = (conference.duration_minutes || 60) * 60;
    const chapterCount = Math.min(Math.ceil(totalDuration / 300), 12); // ~5 min chapters, max 12
    const chapterDuration = totalDuration / chapterCount;

    const defaultChapters: Chapter[] = [];
    const labels = [
      'Opening & Welcome', 'Introductions', 'Agenda Overview', 'Main Discussion',
      'Key Presentations', 'Panel Discussion', 'Q&A Session', 'Working Groups',
      'Action Items', 'Next Steps', 'Open Floor', 'Closing Remarks'
    ];
    const speakers = ['Host', 'Speaker 1', 'Speaker 2', 'Panel', 'Audience', 'Moderator'];

    for (let i = 0; i < chapterCount; i++) {
      defaultChapters.push({
        id: i + 1,
        title: labels[i % labels.length],
        startTime: Math.floor(i * chapterDuration),
        endTime: Math.floor((i + 1) * chapterDuration),
        speaker: speakers[i % speakers.length],
      });
    }
    return defaultChapters;
  }, [conference]);

  // Update active chapter based on current time
  useEffect(() => {
    const idx = chapters.findIndex(ch => currentTime >= ch.startTime && currentTime < ch.endTime);
    if (idx >= 0) setActiveChapter(idx);
  }, [currentTime, chapters]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skipChapter = (direction: 'prev' | 'next') => {
    const newIdx = direction === 'next'
      ? Math.min(activeChapter + 1, chapters.length - 1)
      : Math.max(activeChapter - 1, 0);
    seekTo(chapters[newIdx].startTime);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: conference?.title || 'Conference Recording', url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied', description: 'Playback link copied to clipboard' });
    }
  };

  if (!conferenceId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Invalid conference ID</p>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 text-white">
      {/* Hidden audio element */}
      {conference?.recording_url && (
        <audio
          ref={audioRef}
          src={conference.recording_url}
          onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
          onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Header */}
      <div className="border-b border-purple-500/20 bg-gray-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/conference/recordings">
                <button className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors">
                  <ArrowLeft className="w-5 h-5 text-purple-400" />
                </button>
              </Link>
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-bold text-white truncate">
                  {conference?.title || 'Loading...'}
                </h1>
                <p className="text-xs text-gray-400 truncate">
                  {conference?.host_name} &bull; {conference?.created_at ? new Date(conference.created_at).toLocaleDateString() : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleShare} className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors">
                <Share2 className="w-4 h-4 text-purple-400" />
              </button>
              {conference?.recording_url && (
                <a href={conference.recording_url} download className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors">
                  <Download className="w-4 h-4 text-purple-400" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Player Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Player Visual */}
            <div className="relative bg-gradient-to-br from-purple-900/40 to-gray-900/60 rounded-xl overflow-hidden border border-purple-500/20">
              <div className="aspect-video flex items-center justify-center relative">
                {/* Waveform visualization placeholder */}
                <div className="absolute inset-0 flex items-end justify-center gap-[2px] px-8 pb-20 opacity-30">
                  {Array.from({ length: 60 }, (_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-purple-400 rounded-full transition-all duration-300"
                      style={{
                        height: `${Math.sin(i * 0.3 + currentTime * 2) * 30 + 40}%`,
                        opacity: isPlaying ? 0.6 + Math.sin(i * 0.5) * 0.4 : 0.3,
                      }}
                    />
                  ))}
                </div>
                <div className="z-10 text-center">
                  <div className="w-20 h-20 rounded-full bg-purple-500/20 border-2 border-purple-400/40 flex items-center justify-center mb-3 mx-auto cursor-pointer hover:bg-purple-500/30 transition-colors" onClick={togglePlay}>
                    {isPlaying ? <Pause className="w-8 h-8 text-purple-300" /> : <Play className="w-8 h-8 text-purple-300 ml-1" />}
                  </div>
                  <p className="text-sm text-gray-400">
                    {chapters[activeChapter]?.title || 'Conference Recording'}
                  </p>
                  <p className="text-xs text-purple-400 mt-1">
                    {chapters[activeChapter]?.speaker && `Speaker: ${chapters[activeChapter].speaker}`}
                  </p>
                </div>
                {/* Current chapter badge */}
                <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 rounded text-xs text-amber-400">
                  Chapter {activeChapter + 1}/{chapters.length}
                </div>
                <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 rounded text-xs text-gray-300">
                  {formatTime(currentTime)} / {formatTime(duration || (conference?.duration_minutes || 0) * 60)}
                </div>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="bg-gray-900/50 border border-purple-500/20 rounded-xl p-4 space-y-3">
              {/* Progress bar */}
              <div className="relative group cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                seekTo(pct * (duration || (conference?.duration_minutes || 0) * 60));
              }}>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-amber-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                {/* Chapter markers */}
                {chapters.map((ch, i) => {
                  const totalDur = duration || (conference?.duration_minutes || 0) * 60;
                  if (totalDur <= 0) return null;
                  const pos = (ch.startTime / totalDur) * 100;
                  return (
                    <div
                      key={i}
                      className="absolute top-0 w-0.5 h-2 bg-purple-300/50"
                      style={{ left: `${pos}%` }}
                      title={ch.title}
                    />
                  );
                })}
              </div>

              {/* Controls row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => skipChapter('prev')} className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
                    <SkipBack className="w-5 h-5 text-gray-300" />
                  </button>
                  <button onClick={togglePlay} className="p-3 rounded-full bg-purple-500/20 hover:bg-purple-500/30 transition-colors">
                    {isPlaying ? <Pause className="w-6 h-6 text-purple-300" /> : <Play className="w-6 h-6 text-purple-300 ml-0.5" />}
                  </button>
                  <button onClick={() => skipChapter('next')} className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
                    <SkipForward className="w-5 h-5 text-gray-300" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => { setIsMuted(!isMuted); if (audioRef.current) audioRef.current.muted = !isMuted; }} className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
                    {isMuted ? <VolumeX className="w-4 h-4 text-gray-400" /> : <Volume2 className="w-4 h-4 text-gray-400" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setVolume(v);
                      if (audioRef.current) audioRef.current.volume = v;
                      if (v > 0 && isMuted) setIsMuted(false);
                    }}
                    className="w-20 accent-purple-500 hidden sm:block"
                  />
                  <button onClick={() => setShowTranscript(!showTranscript)} className="p-2 rounded-lg hover:bg-gray-800 transition-colors lg:hidden">
                    <FileText className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Info bar */}
            <div className="flex flex-wrap gap-3 text-xs text-gray-400">
              {conference?.type && (
                <span className="flex items-center gap-1 px-2 py-1 bg-gray-900/50 rounded-lg">
                  <Radio className="w-3 h-3 text-amber-400" /> {conference.type}
                </span>
              )}
              {conference?.duration_minutes && (
                <span className="flex items-center gap-1 px-2 py-1 bg-gray-900/50 rounded-lg">
                  <Clock className="w-3 h-3 text-purple-400" /> {conference.duration_minutes}m
                </span>
              )}
              {conference?.actual_attendees > 0 && (
                <span className="flex items-center gap-1 px-2 py-1 bg-gray-900/50 rounded-lg">
                  <Users className="w-3 h-3 text-green-400" /> {conference.actual_attendees} attendees
                </span>
              )}
              <span className="flex items-center gap-1 px-2 py-1 bg-gray-900/50 rounded-lg">
                <Cpu className="w-3 h-3 text-purple-400" /> QUMUS Powered
              </span>
            </div>
          </div>

          {/* Sidebar: Chapters + Transcript */}
          <div className={`space-y-4 ${showTranscript ? '' : 'hidden lg:block'}`}>
            {/* Chapters */}
            <div className="bg-gray-900/50 border border-purple-500/20 rounded-xl overflow-hidden">
              <div className="p-3 border-b border-gray-800">
                <h3 className="text-sm font-semibold text-purple-300">Chapters</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {chapters.map((ch, i) => (
                  <button
                    key={ch.id}
                    onClick={() => seekTo(ch.startTime)}
                    className={`w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-purple-500/10 transition-colors border-b border-gray-800/50 last:border-0 ${
                      i === activeChapter ? 'bg-purple-500/15 border-l-2 border-l-purple-400' : ''
                    }`}
                  >
                    <span className="text-xs text-gray-500 w-10 shrink-0">{formatTime(ch.startTime)}</span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm truncate ${i === activeChapter ? 'text-purple-300 font-medium' : 'text-gray-300'}`}>
                        {ch.title}
                      </p>
                      {ch.speaker && (
                        <p className="text-xs text-gray-500 truncate">{ch.speaker}</p>
                      )}
                    </div>
                    {i === activeChapter && <ChevronRight className="w-3 h-3 text-purple-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Transcript */}
            <div className="bg-gray-900/50 border border-purple-500/20 rounded-xl overflow-hidden">
              <div className="p-3 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-purple-300">Transcript</h3>
                {transcript?.hasTranscript && (
                  <span className="text-xs text-green-400">Available</span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto p-3">
                {transcript?.hasTranscript ? (
                  <pre className="whitespace-pre-wrap text-xs text-gray-300 font-sans leading-relaxed">
                    {transcript.transcript}
                  </pre>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No transcript yet</p>
                    <p className="text-xs text-gray-600 mt-1">Use Recordings page to auto-transcribe</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-purple-500/10 mt-8 py-4 text-center text-xs text-gray-600">
        Canryn Production &bull; Conference Playback &bull; Powered by QUMUS
      </div>
    </div>
  );
}
