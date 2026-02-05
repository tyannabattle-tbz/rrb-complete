/**
 * Podcast Player Component
 * 
 * Real audio streaming player with:
 * - HTML5 audio element for actual playback
 * - Real podcast episodes with stream URLs
 * - Full playback controls (play, pause, next, prev, seek, volume)
 * - Channel switching
 * - Queue management
 * - Live listener metrics
 */

import { useState, useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Power, Volume2 } from 'lucide-react';
import { QueueManager } from './QueueManager';
import { ListenerMetrics } from './ListenerMetrics';

interface PodcastPlaybackState {
  userId: number;
  currentEpisode: {
    id: string;
    title: string;
    artist: string;
    description: string;
    duration: number;
    streamUrl: string;
    imageUrl: string;
    publishedAt: Date;
    channel: number;
  } | null;
  currentChannel: number;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  queue: any[];
  queueIndex: number;
  streamUrl: string | null;
}

export function PodcastPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playbackState, setPlaybackState] = useState<PodcastPlaybackState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [channels, setChannels] = useState<any[]>([]);

  // Fetch current playback state
  const { data: state, refetch: refetchState } = trpc.podcastPlayback.getState.useQuery();

  // Fetch available channels
  const { data: channelsData } = trpc.podcastPlayback.getChannels.useQuery();

  // Mutations
  const playMutation = trpc.podcastPlayback.play.useMutation({
    onSuccess: (result) => {
      if (result.state) setPlaybackState(result.state);
      refetchState();
    },
  });

  const pauseMutation = trpc.podcastPlayback.pause.useMutation({
    onSuccess: (result) => {
      if (result.state) setPlaybackState(result.state);
      refetchState();
    },
  });

  const nextMutation = trpc.podcastPlayback.next.useMutation({
    onSuccess: (result) => {
      if (result.state) setPlaybackState(result.state);
      refetchState();
    },
  });

  const prevMutation = trpc.podcastPlayback.prev.useMutation({
    onSuccess: (result) => {
      if (result.state) setPlaybackState(result.state);
      refetchState();
    },
  });

  const switchChannelMutation = trpc.podcastPlayback.switchChannel.useMutation({
    onSuccess: (result) => {
      if (result.state) setPlaybackState(result.state);
      refetchState();
    },
  });

  const setVolumeMutation = trpc.podcastPlayback.setVolume.useMutation({
    onSuccess: (result) => {
      if (result.state) setPlaybackState(result.state);
      refetchState();
    },
  });

  const seekMutation = trpc.podcastPlayback.seek.useMutation();

  // Update local state when server state changes
  useEffect(() => {
    if (state) {
      setPlaybackState(state);
    }
  }, [state]);

  // Update channels list
  useEffect(() => {
    if (channelsData) {
      setChannels(channelsData);
    }
  }, [channelsData]);

  // Sync audio element with playback state
  useEffect(() => {
    if (!audioRef.current || !playbackState) return;

    if (playbackState.streamUrl) {
      audioRef.current.src = playbackState.streamUrl;
    }

    if (playbackState.isPlaying) {
      audioRef.current.play().catch((err) => {
        console.error('Failed to play audio:', err);
      });
    } else {
      audioRef.current.pause();
    }

    audioRef.current.volume = playbackState.volume / 100;
  }, [playbackState?.streamUrl, playbackState?.isPlaying, playbackState?.volume]);

  // Handle audio events
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    // Auto-play next episode
    handleNext();
  };

  const handlePlay = async () => {
    setIsLoading(true);
    try {
      await playMutation.mutateAsync({ reason: 'User clicked play' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = async () => {
    setIsLoading(true);
    try {
      await pauseMutation.mutateAsync({ reason: 'User clicked pause' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    setIsLoading(true);
    try {
      await nextMutation.mutateAsync({ reason: 'User clicked next' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrev = async () => {
    setIsLoading(true);
    try {
      await prevMutation.mutateAsync({ reason: 'User clicked previous' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChannelSwitch = async (channelId: number) => {
    setIsLoading(true);
    try {
      await switchChannelMutation.mutateAsync({ channelId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolumeChange = async (value: number[]) => {
    const newVolume = value[0];
    setIsLoading(true);
    try {
      await setVolumeMutation.mutateAsync({ volume: newVolume });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeek = async (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    await seekMutation.mutateAsync({ time: newTime });
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!playbackState) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 text-center">
        <p className="text-slate-600 dark:text-slate-400">Initializing podcast player...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      {/* Hidden audio element for actual playback */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        crossOrigin="anonymous"
      />

      {/* Now Playing */}
      <Card className="p-6 bg-gradient-to-r from-orange-900 to-orange-800 border-orange-700">
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-white">
            {playbackState.currentEpisode?.title || 'Rockin\' Rockin\' Boogie'}
          </h2>
          <p className="text-orange-100">
            {playbackState.currentEpisode?.artist || 'Channel ' + playbackState.currentChannel}
          </p>
          <p className="text-sm text-orange-200">
            {playbackState.isPlaying ? '🔴 LIVE' : '⚫ OFFLINE'}
          </p>
          {playbackState.currentEpisode?.description && (
            <p className="text-sm text-orange-200 line-clamp-2">
              {playbackState.currentEpisode.description}
            </p>
          )}
        </div>
      </Card>

      {/* Channel Select */}
      <Card className="p-6 border-orange-700">
        <h3 className="text-lg font-semibold mb-4 text-orange-600">CHANNEL SELECT</h3>
        <div className="grid grid-cols-3 gap-3">
          {channels.map((channel) => (
            <Button
              key={channel.id}
              onClick={() => handleChannelSwitch(channel.id)}
              disabled={isLoading}
              className={`py-3 font-bold text-lg ${
                playbackState.currentChannel === channel.id
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-slate-600 hover:bg-slate-700 text-white'
              }`}
              title={channel.description}
            >
              {channel.name.split(' ')[0]}
            </Button>
          ))}
        </div>
      </Card>

      {/* Progress Bar */}
      <Card className="p-4 border-orange-700">
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            onValueChange={handleSeek}
            min={0}
            max={duration || 100}
            step={0.1}
            disabled={isLoading}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </Card>

      {/* Volume Control */}
      <Card className="p-6 border-orange-700">
        <div className="flex items-center gap-4">
          <Volume2 className="w-6 h-6 text-orange-600" />
          <Slider
            value={[playbackState.volume]}
            onValueChange={handleVolumeChange}
            min={0}
            max={100}
            step={1}
            className="flex-1"
            disabled={isLoading}
          />
          <span className="text-orange-600 font-bold w-12 text-right">
            {playbackState.volume}
          </span>
        </div>
      </Card>

      {/* Playback Controls */}
      <Card className="p-6 border-orange-700 space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <Button
            onClick={handlePrev}
            disabled={isLoading}
            className="bg-slate-600 hover:bg-slate-700 text-white py-6"
            title="Previous episode"
          >
            <SkipBack className="w-6 h-6" />
            <span className="hidden sm:inline ml-2">PREV</span>
          </Button>

          {playbackState.isPlaying ? (
            <Button
              onClick={handlePause}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white py-6 col-span-2 font-bold text-lg"
              title="Pause playback"
            >
              <Pause className="w-6 h-6" />
              <span className="ml-2">PAUSE</span>
            </Button>
          ) : (
            <Button
              onClick={handlePlay}
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white py-6 col-span-2 font-bold text-lg"
              title="Play episode"
            >
              <Play className="w-6 h-6" />
              <span className="ml-2">PLAY</span>
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="bg-slate-600 hover:bg-slate-700 text-white py-6"
            title="Next episode"
          >
            <SkipForward className="w-6 h-6" />
            <span className="hidden sm:inline ml-2">NEXT</span>
          </Button>
        </div>
      </Card>

      {/* Listener Metrics */}
      <ListenerMetrics isLive={playbackState.isPlaying} />

      {/* Queue Manager */}
      <QueueManager
        queue={playbackState.queue}
        currentIndex={playbackState.queueIndex}
        onReorder={(newQueue) => console.log('Queue reordered:', newQueue)}
        onRemove={(trackId) => console.log('Remove track:', trackId)}
        onPlayTrack={(index) => console.log('Play track at index:', index)}
      />

      {/* Status Info */}
      <Card className="p-4 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700">
        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
          <p>
            <strong>Status:</strong> {playbackState.isPlaying ? 'Playing' : 'Stopped'}
          </p>
          <p>
            <strong>Episode:</strong> {playbackState.currentEpisode?.title || 'None'}
          </p>
          <p>
            <strong>Channel:</strong> {playbackState.currentChannel}
          </p>
          <p>
            <strong>Volume:</strong> {playbackState.volume}%
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            Real audio streaming with QUMUS orchestration
          </p>
        </div>
      </Card>
    </div>
  );
}
