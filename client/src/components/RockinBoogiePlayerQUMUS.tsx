'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Settings, BarChart3, History, Heart, Search, Plus, Download, Wifi, WifiOff, Music } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface Episode {
  id: string;
  title: string;
  artist: string;
  duration: number;
  streamUrl: string;
  description?: string;
  imageUrl?: string;
  pubDate?: string;
}

interface Channel {
  id: string;
  name: string;
  episodes: Episode[];
}

interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  currentEpisodeId: string;
  currentChannelId: string;
}

const RockinBoogiePlayerQUMUS: React.FC = () => {
  // Audio refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Local state for UI
  const [channels, setChannels] = useState<Channel[]>([]);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 70,
    currentEpisodeId: '',
    currentChannelId: '',
  });
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoPlay, setAutoPlay] = useState(true);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const [audioQuality, setAudioQuality] = useState<'low' | 'medium' | 'high'>('high');
  const [listeningTime, setListeningTime] = useState(0);
  const [episodesPlayed, setEpisodesPlayed] = useState(0);
  const [playbackHistory, setPlaybackHistory] = useState<Array<{ episodeId: string; timestamp: number }>>([]);
  const [decisionId, setDecisionId] = useState<string | null>(null);

  // tRPC mutations for QUMUS-orchestrated playback
  const playMutation = trpc.podcastPlayback.play.useMutation({
    onSuccess: (data) => {
      console.log('[QUMUS Decision]', data.decisionId);
      setDecisionId(data.decisionId);
      setPlaybackState((prev) => ({ ...prev, isPlaying: true }));
      drawVisualizer();
    },
    onError: (error) => {
      console.error('[QUMUS Error] Play failed:', error);
      alert(`Play failed: ${error.message}`);
    },
  });

  const pauseMutation = trpc.podcastPlayback.pause.useMutation({
    onSuccess: (data) => {
      console.log('[QUMUS Decision]', data.decisionId);
      setDecisionId(data.decisionId);
      setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
    },
    onError: (error) => {
      console.error('[QUMUS Error] Pause failed:', error);
    },
  });

  const nextMutation = trpc.podcastPlayback.next.useMutation({
    onSuccess: (data) => {
      console.log('[QUMUS Decision]', data.decisionId);
      setDecisionId(data.decisionId);
      if (data.state?.currentEpisode) {
        setPlaybackState((prev) => ({
          ...prev,
          currentEpisodeId: data.state!.currentEpisode!.id,
          currentTime: 0,
        }));
        // Auto-play next episode if currently playing
        if (playbackState.isPlaying) {
          setTimeout(() => playMutation.mutate({ reason: 'auto-next' }), 500);
        }
      }
    },
    onError: (error) => {
      console.error('[QUMUS Error] Next failed:', error);
    },
  });

  const prevMutation = trpc.podcastPlayback.prev.useMutation({
    onSuccess: (data) => {
      console.log('[QUMUS Decision]', data.decisionId);
      setDecisionId(data.decisionId);
      if (data.state?.currentEpisode) {
        setPlaybackState((prev) => ({
          ...prev,
          currentEpisodeId: data.state!.currentEpisode!.id,
          currentTime: 0,
        }));
        // Auto-play previous episode if currently playing
        if (playbackState.isPlaying) {
          setTimeout(() => playMutation.mutate({ reason: 'auto-prev' }), 500);
        }
      }
    },
    onError: (error) => {
      console.error('[QUMUS Error] Prev failed:', error);
    },
  });

  const switchChannelMutation = trpc.podcastPlayback.switchChannel.useMutation({
    onSuccess: (data) => {
      console.log('[QUMUS Decision]', data.decisionId);
      setDecisionId(data.decisionId);
      if (data.state?.currentEpisode) {
        setPlaybackState((prev) => ({
          ...prev,
          currentChannelId: data.state!.currentChannel.toString(),
          currentEpisodeId: data.state!.currentEpisode!.id,
          currentTime: 0,
        }));
      }
    },
    onError: (error) => {
      console.error('[QUMUS Error] Channel switch failed:', error);
    },
  });

  const setVolumeMutation = trpc.podcastPlayback.setVolume.useMutation({
    onSuccess: (data) => {
      console.log('[QUMUS Decision]', data.decisionId);
      setDecisionId(data.decisionId);
      setPlaybackState((prev) => ({ ...prev, volume: data.state?.volume || prev.volume }));
    },
    onError: (error) => {
      console.error('[QUMUS Error] Volume set failed:', error);
    },
  });

  // Query backend state (optional - for future sync)
  // const getStateMutation = trpc.podcastPlayback.getState.useQuery();
  // const getChannelsMutation = trpc.podcastPlayback.getChannels.useQuery();

  // Initialize channels
  const initializeChannels = useCallback(async () => {
    try {
      const channels: Channel[] = [];

      // Channel 1: Rockin' Rockin' Boogie
      channels.push({
        id: 'rockin',
        name: "Rockin' Rockin' Boogie",
        episodes: [
          {
            id: 'rock-1',
            title: "Rockin' Rockin' Boogie - Original Recording",
            artist: 'Little Richard',
            duration: 180,
            streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            description: 'The original recording of Rockin Rockin Boogie',
            imageUrl: 'https://via.placeholder.com/100?text=Rock',
            pubDate: new Date().toISOString(),
          },
          {
            id: 'rock-2',
            title: 'Tutti Frutti',
            artist: 'Little Richard',
            duration: 160,
            streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            description: 'Classic rock and roll',
            imageUrl: 'https://via.placeholder.com/100?text=Rock',
            pubDate: new Date().toISOString(),
          },
          {
            id: 'rock-3',
            title: 'Johnny B. Goode',
            artist: 'Chuck Berry',
            duration: 170,
            streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
            description: 'Rock and roll classic',
            imageUrl: 'https://via.placeholder.com/100?text=Rock',
            pubDate: new Date().toISOString(),
          },
        ],
      });

      // Channel 2: Blues Hour
      channels.push({
        id: 'blues',
        name: 'Blues Hour',
        episodes: [
          {
            id: 'blues-1',
            title: 'The Thrill is Gone',
            artist: 'B.B. King',
            duration: 200,
            streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
            description: 'Classic blues',
            imageUrl: 'https://via.placeholder.com/100?text=Blues',
            pubDate: new Date().toISOString(),
          },
          {
            id: 'blues-2',
            title: 'Stormy Monday',
            artist: 'T-Bone Walker',
            duration: 190,
            streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
            description: 'Blues standard',
            imageUrl: 'https://via.placeholder.com/100?text=Blues',
            pubDate: new Date().toISOString(),
          },
        ],
      });

      // Channel 3: Jazz Essentials
      channels.push({
        id: 'jazz',
        name: 'Jazz Essentials',
        episodes: [
          {
            id: 'jazz-1',
            title: 'Take Five',
            artist: 'Dave Brubeck Quartet',
            duration: 330,
            streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
            description: 'Jazz classic',
            imageUrl: 'https://via.placeholder.com/100?text=Jazz',
            pubDate: new Date().toISOString(),
          },
          {
            id: 'jazz-2',
            title: 'Autumn Leaves',
            artist: 'Bill Evans',
            duration: 300,
            streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
            description: 'Jazz standard',
            imageUrl: 'https://via.placeholder.com/100?text=Jazz',
            pubDate: new Date().toISOString(),
          },
        ],
      });

      setChannels(channels);

      // Set first episode as current
      if (channels.length > 0 && channels[0].episodes.length > 0) {
        setPlaybackState((prev) => ({
          ...prev,
          currentChannelId: channels[0].id,
          currentEpisodeId: channels[0].episodes[0].id,
        }));
      }
    } catch (error) {
      console.error('Failed to initialize channels:', error);
    }
  }, []);

  // Initialize audio context
  const initializeAudioContext = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(audioRef.current);

      source.connect(analyser);
      analyser.connect(audioContext.destination);
      analyser.fftSize = 256;

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      console.log('Audio context initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }, []);

  // Draw visualizer
  const drawVisualizer = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    ctx.fillStyle = 'rgb(20, 20, 20)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;

      ctx.fillStyle = `hsl(${(i / bufferLength) * 360}, 100%, 50%)`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }

    requestAnimationFrame(drawVisualizer);
  }, []);

  // Handle play via QUMUS
  const handlePlay = useCallback(() => {
    if (!audioRef.current) return;

    const currentChannel = channels.find((c) => c.id === playbackState.currentChannelId);
    const currentEpisode = currentChannel?.episodes.find((e) => e.id === playbackState.currentEpisodeId);

    if (!currentEpisode) return;

    // Initialize audio context on first play
    if (!audioContextRef.current) {
      initializeAudioContext();
    }

    audioRef.current.src = currentEpisode.streamUrl;
    audioRef.current.play().catch((error) => {
      console.error('Failed to play audio:', error);
    });

    // Call QUMUS backend
    playMutation.mutate({ reason: 'user-play' });

    // Add to history
    setPlaybackHistory((prev) => [
      ...prev,
      { episodeId: currentEpisode.id, timestamp: Date.now() },
    ]);
    setEpisodesPlayed((prev) => prev + 1);
  }, [channels, playbackState.currentChannelId, playbackState.currentEpisodeId, initializeAudioContext, playMutation]);

  // Handle pause via QUMUS
  const handlePause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      pauseMutation.mutate({ reason: 'user-pause' });
    }
  }, [pauseMutation]);

  // Handle next via QUMUS
  const handleNext = useCallback(() => {
    nextMutation.mutate({ reason: 'user-next' });
  }, [nextMutation]);

  // Handle previous via QUMUS
  const handlePrev = useCallback(() => {
    prevMutation.mutate({ reason: 'user-prev' });
  }, [prevMutation]);

  // Handle channel switch via QUMUS
  const handleChannelSwitch = useCallback((channelId: string) => {
    const channel = channels.find((c) => c.id === channelId);
    if (channel) {
      switchChannelMutation.mutate({ channelId: parseInt(channelId) || 7 });
    }
  }, [channels, switchChannelMutation]);

  // Handle volume change via QUMUS
  const handleVolumeChange = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
    setVolumeMutation.mutate({ volume });
  }, [setVolumeMutation]);

  // Initialize on mount
  useEffect(() => {
    initializeChannels();
  }, [initializeChannels]);

  // Update audio time
  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current) {
        setPlaybackState((prev) => ({
          ...prev,
          currentTime: audioRef.current?.currentTime || 0,
          duration: audioRef.current?.duration || 0,
        }));
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const currentChannel = channels.find((c) => c.id === playbackState.currentChannelId);
  const currentEpisode = currentChannel?.episodes.find((e) => e.id === playbackState.currentEpisodeId);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-amber-300 mb-2">🎵 Rockin' Rockin' Boogie</h1>
        <p className="text-amber-200/80">QUMUS-Orchestrated Podcast Player</p>
        {decisionId && (
          <p className="text-xs text-green-400 mt-2">Decision ID: {decisionId}</p>
        )}
      </div>

      {/* Main Player */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Current Episode */}
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur rounded-lg p-6 border border-amber-500/30">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <Music className="w-16 h-16 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-amber-300 mb-2">{currentEpisode?.title || 'Select Episode'}</h2>
              <p className="text-amber-200/80 mb-4">{currentEpisode?.artist || 'Unknown Artist'}</p>
              <p className="text-sm text-slate-400">{currentEpisode?.description || 'No description'}</p>
            </div>
          </div>

          {/* Visualizer */}
          <canvas
            ref={canvasRef}
            width={400}
            height={100}
            className="w-full h-24 bg-slate-900/50 rounded mb-6 border border-amber-500/20"
          />

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-slate-700/50 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full transition-all"
                style={{
                  width: currentEpisode?.duration
                    ? `${(playbackState.currentTime / currentEpisode.duration) * 100}%`
                    : '0%',
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>{Math.floor(playbackState.currentTime / 60)}:{String(Math.floor(playbackState.currentTime % 60)).padStart(2, '0')}</span>
              <span>{currentEpisode?.duration ? `${Math.floor(currentEpisode.duration / 60)}:${String(Math.floor(currentEpisode.duration % 60)).padStart(2, '0')}` : '0:00'}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={handlePrev}
              className="p-3 rounded-full bg-amber-600/30 hover:bg-amber-600/50 transition"
              title="Previous"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={playbackState.isPlaying ? handlePause : handlePlay}
              className="p-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 transition"
              title={playbackState.isPlaying ? 'Pause' : 'Play'}
            >
              {playbackState.isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white" />
              )}
            </button>

            <button
              onClick={handleNext}
              className="p-3 rounded-full bg-amber-600/30 hover:bg-amber-600/50 transition"
              title="Next"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-4">
            <Volume2 className="w-5 h-5 text-amber-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={playbackState.volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="flex-1 h-2 bg-slate-700/50 rounded-full appearance-none cursor-pointer"
            />
            <span className="text-sm text-amber-200/80 w-8">{playbackState.volume}%</span>
          </div>
        </div>

        {/* Channels */}
        <div className="bg-slate-800/50 backdrop-blur rounded-lg p-6 border border-amber-500/30">
          <h3 className="text-lg font-bold text-amber-300 mb-4">Channels</h3>
          <div className="space-y-2">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => handleChannelSwitch(channel.id)}
                className={`w-full p-3 rounded-lg transition text-left ${
                  playbackState.currentChannelId === channel.id
                    ? 'bg-amber-600/50 border border-amber-400'
                    : 'bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30'
                }`}
              >
                <p className="font-semibold text-sm">{channel.name}</p>
                <p className="text-xs text-slate-400">{channel.episodes.length} episodes</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Episodes List */}
      <div className="bg-slate-800/50 backdrop-blur rounded-lg p-6 border border-amber-500/30">
        <h3 className="text-lg font-bold text-amber-300 mb-4">Episodes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentChannel?.episodes.map((episode) => (
            <button
              key={episode.id}
              onClick={() => {
                setPlaybackState((prev) => ({
                  ...prev,
                  currentEpisodeId: episode.id,
                }));
                setTimeout(() => playMutation.mutate({ reason: 'episode-select' }), 100);
              }}
              className={`p-4 rounded-lg transition text-left ${
                playbackState.currentEpisodeId === episode.id
                  ? 'bg-amber-600/50 border border-amber-400'
                  : 'bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30'
              }`}
            >
              <p className="font-semibold text-sm text-amber-300 line-clamp-2">{episode.title}</p>
              <p className="text-xs text-slate-400 mt-1">{episode.artist}</p>
              <p className="text-xs text-slate-500 mt-2">{Math.floor(episode.duration / 60)}:{String(Math.floor(episode.duration % 60)).padStart(2, '0')}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onEnded={() => {
          if (autoPlay) {
            handleNext();
          }
        }}
      />
    </div>
  );
};

export default RockinBoogiePlayerQUMUS;
