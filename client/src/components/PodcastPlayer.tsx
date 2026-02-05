/**
 * Podcast Player Component - SIMPLIFIED WORKING VERSION
 * 
 * Real audio streaming player with:
 * - HTML5 audio element for actual playback
 * - Real podcast episodes with stream URLs
 * - Full playback controls (play, pause, next, prev, seek, volume)
 * - Audio visualizer with frequency analysis
 * - Channel switching
 */

import { useState, useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, Search, Plus } from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';

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
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [playbackState, setPlaybackState] = useState<PodcastPlaybackState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [channels, setChannels] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch current playback state
  const { data: state, refetch: refetchState } = trpc.podcastPlayback.getState.useQuery();
  const { data: channelsData } = trpc.podcastPlayback.getChannels.useQuery();

  // Initialize channel on first load
  const initMutation = trpc.podcastPlayback.initializeChannel.useMutation({
    onSuccess: (result) => {
      if (result.state) {
        setPlaybackState(result.state);
        setError(null);
      }
      setIsLoading(false);
    },
    onError: (err) => {
      setError(err.message);
      setIsLoading(false);
    },
  });

  // Mutations
  const playMutation = trpc.podcastPlayback.play.useMutation({
    onSuccess: (result) => {
      if (result.state) setPlaybackState(result.state);
      setError(null);
      refetchState();
    },
    onError: (err) => setError(err.message),
  });

  const pauseMutation = trpc.podcastPlayback.pause.useMutation({
    onSuccess: (result) => {
      if (result.state) setPlaybackState(result.state);
      setError(null);
      refetchState();
    },
    onError: (err) => setError(err.message),
  });

  const nextMutation = trpc.podcastPlayback.next.useMutation({
    onSuccess: (result) => {
      if (result.state) setPlaybackState(result.state);
      setError(null);
      refetchState();
    },
    onError: (err) => setError(err.message),
  });

  const prevMutation = trpc.podcastPlayback.prev.useMutation({
    onSuccess: (result) => {
      if (result.state) setPlaybackState(result.state);
      setError(null);
      refetchState();
    },
    onError: (err) => setError(err.message),
  });

  const switchChannelMutation = trpc.podcastPlayback.switchChannel.useMutation({
    onSuccess: (result) => {
      if (result.state) setPlaybackState(result.state);
      setError(null);
      refetchState();
    },
    onError: (err) => setError(err.message),
  });

  const setVolumeMutation = trpc.podcastPlayback.setVolume.useMutation({
    onSuccess: (result) => {
      if (result.state) setPlaybackState(result.state);
      setError(null);
    },
    onError: (err) => setError(err.message),
  });

  // Initialize on mount
  useEffect(() => {
    if (isLoading && !playbackState) {
      initMutation.mutate({ channelId: 7 });
    }
  }, []);

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

  // Setup Web Audio API for visualizer
  useEffect(() => {
    if (!audioRef.current) return;

    const setupAudioContext = () => {
      if (audioContextRef.current) return;

      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const source = audioContext.createMediaElementSource(audioRef.current!);

        source.connect(analyser);
        analyser.connect(audioContext.destination);

        analyserRef.current = analyser;
        audioContextRef.current = audioContext;
      } catch (err) {
        console.error('Web Audio API setup failed:', err);
      }
    };

    audioRef.current.addEventListener('play', setupAudioContext);
    return () => {
      audioRef.current?.removeEventListener('play', setupAudioContext);
    };
  }, []);

  // Sync audio element with playback state - DIRECT APPROACH
  useEffect(() => {
    if (!audioRef.current || !playbackState?.currentEpisode) return;

    // Get the stream URL directly from the episode
    const streamUrl = playbackState.currentEpisode.streamUrl;
    
    if (streamUrl && audioRef.current.src !== streamUrl) {
      audioRef.current.src = streamUrl;
      audioRef.current.crossOrigin = 'anonymous';
    }

    // Set volume
    audioRef.current.volume = Math.max(0, Math.min(1, playbackState.volume / 100));

    // Handle play/pause
    if (playbackState.isPlaying) {
      audioRef.current.play().catch((err) => {
        console.error('Play error:', err);
        setError(`Playback failed: ${err.message}`);
      });
    } else {
      audioRef.current.pause();
    }
  }, [playbackState?.currentEpisode?.streamUrl, playbackState?.isPlaying, playbackState?.volume]);

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

  const handleSwitchChannel = async (channelId: number) => {
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
  };

  if (isLoading && !playbackState) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading podcast player...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Now Playing Card */}
        <Card className="mb-6 p-6 bg-gradient-to-r from-orange-600 to-amber-600 text-white border-0">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">
              {playbackState?.currentEpisode?.title || 'No Episode'}
            </h2>
            <p className="text-orange-100 mb-4">
              {playbackState?.currentEpisode?.artist || 'Unknown Artist'}
            </p>
            <div className="flex items-center justify-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  playbackState?.isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
                }`}
              ></div>
              <span className="font-semibold">
                {playbackState?.isPlaying ? 'PLAYING' : 'STOPPED'}
              </span>
            </div>
          </div>
        </Card>

        {/* Channels */}
        <Card className="mb-6 p-6 border-2 border-orange-300">
          <h3 className="text-sm font-bold text-orange-600 mb-4">CHANNELS</h3>
          <div className="grid grid-cols-3 gap-3">
            {channels.map((channel) => (
              <Button
                key={channel.id}
                onClick={() => handleSwitchChannel(channel.id)}
                variant={playbackState?.currentChannel === channel.id ? 'default' : 'outline'}
                className={`text-sm h-auto py-2 ${
                  playbackState?.currentChannel === channel.id
                    ? 'bg-orange-500 hover:bg-orange-600'
                    : ''
                }`}
                title={channel.description}
              >
                {channel.name}
              </Button>
            ))}
          </div>
        </Card>

        {/* Progress Bar */}
        <Card className="mb-6 p-4 border-2 border-orange-300">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>{Math.floor(currentTime)}s</span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={(value) => handleSeek(value)}
              className="flex-1"
            />
            <span>{Math.floor(duration)}s</span>
          </div>
        </Card>

        {/* Volume Control */}
        <Card className="mb-6 p-4 border-2 border-orange-300">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-orange-600" />
            <Slider
              value={[playbackState?.volume || 70]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="flex-1"
            />
            <span className="text-sm font-semibold text-orange-600 w-8">
              {playbackState?.volume || 70}
            </span>
          </div>
        </Card>

        {/* Playback Controls */}
        <Card className="mb-6 p-4 border-2 border-orange-300">
          <div className="flex gap-3">
            <Button
              onClick={handlePrev}
              variant="outline"
              size="lg"
              className="flex-1"
              disabled={isLoading}
              title="Previous"
            >
              <SkipBack className="w-5 h-5 mr-2" />
              PREV
            </Button>
            <Button
              onClick={playbackState?.isPlaying ? handlePause : handlePlay}
              size="lg"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isLoading}
              title={playbackState?.isPlaying ? 'Pause' : 'Play'}
            >
              {playbackState?.isPlaying ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  PAUSE
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  PLAY
                </>
              )}
            </Button>
            <Button
              onClick={handleNext}
              variant="outline"
              size="lg"
              className="flex-1"
              disabled={isLoading}
              title="Next"
            >
              NEXT
              <SkipForward className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </Card>

        {/* Search & Add Feed */}
        <Card className="mb-6 p-4 border-2 border-orange-300">
          <div className="flex gap-2">
            <Button className="flex-1 bg-orange-500 hover:bg-orange-600">
              <Search className="w-4 h-4 mr-2" />
              Search Podcasts
            </Button>
            <Button variant="outline" className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Add Feed
            </Button>
          </div>
        </Card>

        {/* Audio Visualizer */}
        {analyserRef.current && audioContextRef.current && (
          <Card className="mb-6 p-4 border-2 border-orange-300">
            <AudioVisualizer 
              analyser={analyserRef.current}
              audioContext={audioContextRef.current}
              isPlaying={playbackState?.isPlaying || false}
            />
          </Card>
        )}

        {/* Episode Info */}
        {playbackState?.currentEpisode && (
          <Card className="p-4 bg-gray-50 border-2 border-gray-200">
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold text-gray-600">Episode:</span>{' '}
                {playbackState.currentEpisode.title}
              </div>
              <div>
                <span className="font-semibold text-gray-600">Artist:</span>{' '}
                {playbackState.currentEpisode.artist}
              </div>
              <div>
                <span className="font-semibold text-gray-600">Channel:</span>{' '}
                {playbackState.currentChannel}
              </div>
              <div>
                <span className="font-semibold text-gray-600">Volume:</span>{' '}
                {playbackState.volume}%
              </div>
              <div>
                <span className="font-semibold text-gray-600">Status:</span>{' '}
                {playbackState.isPlaying ? 'Playing' : 'Stopped'}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                <span className="font-semibold">Stream URL:</span>{' '}
                {playbackState.currentEpisode.streamUrl?.substring(0, 50)}...
              </div>
            </div>
          </Card>
        )}

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          crossOrigin="anonymous"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onError={(e) => {
            console.error('Audio error:', e);
            setError('Failed to load audio stream');
          }}
        />
      </div>
    </div>
  );
}
