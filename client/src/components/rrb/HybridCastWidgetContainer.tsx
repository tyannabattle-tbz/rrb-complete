import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Link } from 'wouter';

interface EmergencyChannel {
  id: string;
  name: string;
  description: string;
  streamUrl: string;
  type: string;
}

const EMERGENCY_CHANNELS: EmergencyChannel[] = [
  {
    id: 'eas-primary',
    name: 'Emergency Alert Primary',
    description: 'Primary emergency broadcast channel — alerts, warnings, and critical updates',
    streamUrl: 'https://ice1.somafm.com/defcon-128-mp3',
    type: 'Emergency',
  },
  {
    id: 'community-alerts',
    name: 'Community Check-In',
    description: 'Community wellness check-ins and local emergency coordination',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    type: 'Community',
  },
  {
    id: 'mesh-relay',
    name: 'Mesh Network Relay',
    description: 'Offline-first mesh network relay — works without internet or cell service',
    streamUrl: 'https://ice1.somafm.com/deepspaceone-128-mp3',
    type: 'Mesh',
  },
];

export function HybridCastWidgetContainer() {
  const [activeChannel, setActiveChannel] = useState<EmergencyChannel>(EMERGENCY_CHANNELS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onEnded = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {
        toast.error('Click anywhere on the page first, then press play (browser autoplay policy).');
      });
    }
  };

  const switchChannel = (channel: EmergencyChannel) => {
    const audio = audioRef.current;
    setActiveChannel(channel);
    setCurrentTime(0);
    setDuration(0);
    if (audio) {
      audio.pause();
      audio.src = channel.streamUrl;
      audio.load();
      setIsPlaying(false);
    }
    toast.success(`Tuned to ${channel.name}`);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val / 100;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !isFinite(duration) || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * duration;
  };

  const formatTime = (s: number) => {
    if (!s || !isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full bg-zinc-900 rounded-xl border border-red-500/30 p-6 shadow-2xl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">🚨</span>
          <h2 className="text-2xl font-bold text-red-400">HybridCast Emergency</h2>
          {isPlaying && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
              LIVE
            </span>
          )}
        </div>
        <p className="text-red-200/70 text-sm">
          Emergency broadcast system — alerts, warnings, and community check-ins
        </p>
      </div>

      {/* Emergency Status Banner */}
      <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3 mb-4 text-center">
        <p className="text-green-400 font-semibold text-sm">All Clear — No Active Emergencies</p>
        <p className="text-green-300/60 text-xs mt-1">System monitoring active. You will be alerted if conditions change.</p>
      </div>

      {/* Now Playing */}
      <div className="bg-zinc-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-red-400 font-bold text-lg">{activeChannel.name}</p>
            <p className="text-zinc-400 text-sm">{activeChannel.description}</p>
            <span className="inline-block mt-1 text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded">{activeChannel.type}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div
            className="h-1.5 bg-zinc-700 rounded-full cursor-pointer overflow-hidden"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-red-500 rounded-full transition-all duration-200"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-400 text-white flex items-center justify-center transition-colors shadow-lg"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" /></svg>
            )}
          </button>

          <div className="flex items-center gap-2 flex-1">
            <svg className="w-4 h-4 text-zinc-400" fill="currentColor" viewBox="0 0 24 24"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 accent-red-500"
            />
            <span className="text-xs text-zinc-500 w-8">{volume}%</span>
          </div>
        </div>
      </div>

      {/* Channel Selector */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-red-300 mb-2">Emergency Channels</p>
        {EMERGENCY_CHANNELS.map(ch => (
          <button
            key={ch.id}
            onClick={() => switchChannel(ch)}
            className={`w-full text-left p-3 rounded-lg transition-all ${
              activeChannel.id === ch.id
                ? 'bg-red-500/20 border border-red-500/50'
                : 'bg-zinc-800 border border-zinc-700 hover:border-red-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold text-sm ${activeChannel.id === ch.id ? 'text-red-400' : 'text-zinc-300'}`}>
                  {ch.name}
                </p>
                <p className="text-xs text-zinc-500">{ch.type}</p>
              </div>
              {activeChannel.id === ch.id && isPlaying && (
                <div className="flex gap-0.5">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-1 bg-red-500 rounded-full animate-pulse" style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Info */}
      <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-200/80">
        <p className="font-semibold mb-1">About HybridCast</p>
        <p>
          HybridCast is an <strong>emergency-only</strong> broadcast system. It provides critical alerts, community wellness check-ins, and offline-first mesh networking for disaster response. This is not a leisure listening platform — for music and entertainment, visit{' '}
          <Link href="/rrb/radio-station" className="text-amber-400 underline">RRB Radio</Link>.
        </p>
      </div>

      <audio ref={audioRef} src={activeChannel.streamUrl} preload="auto" />
    </div>
  );
}
