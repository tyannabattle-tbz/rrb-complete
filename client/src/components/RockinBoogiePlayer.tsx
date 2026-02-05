/**
 * Rockin' Boogie Player Component
 * 
 * Professional radio/podcast player with all buttons controlled by QUMUS orchestration
 * - Play/Pause controlled by QUMUS engagement policy
 * - Channel select controlled by QUMUS engagement policy
 * - Volume controlled by QUMUS engagement policy
 * - Power controlled by QUMUS system policy
 */

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { usePreset } from '@/contexts/PresetContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Power } from 'lucide-react';
import { QueueManager } from './QueueManager';
import { ListenerMetrics } from './ListenerMetrics';

interface PlaybackState {
  userId: number;
  contentId: number | null;
  isPlaying: boolean;
  currentChannel: number;
  volume: number;
  currentTime: number;
  duration: number;
  queue: number[];
  queueIndex: number;
}

export function RockinBoogiePlayer() {
  // Initialize with default playback state
  const defaultState: PlaybackState = {
    userId: 0,
    contentId: null,
    isPlaying: false,
    currentChannel: 7,
    volume: 70,
    currentTime: 0,
    duration: 0,
    queue: [],
    queueIndex: 0,
  };

  const [playbackState, setPlaybackState] = useState<PlaybackState>(defaultState);
  const [isLoading, setIsLoading] = useState(false);
  const { appliedPreset } = usePreset();

  // Get current playback state
  const { data: currentState, refetch: refetchState } = trpc.playbackControl.getState.useQuery();

  // Playback mutations (all controlled by QUMUS)
  const playMutation = trpc.playbackControl.play.useMutation({
    onSuccess: (result) => {
      if (result.state) setPlaybackState(result.state);
      refetchState();
    },
  });

  const pauseMutation = trpc.playbackControl.pause.useMutation({
    onSuccess: (result) => {
      if (result.state) setPlaybackState(result.state);
      refetchState();
    },
  });

  const nextMutation = trpc.playbackControl.next.useMutation({
    onSuccess: (result) => {
      if (result.state) setPlaybackState(result.state);
      refetchState();
    },
  });

  const prevMutation = trpc.playbackControl.prev.useMutation({
    onSuccess: (result) => {
      if (result.state) setPlaybackState(result.state);
      refetchState();
    },
  });

  const selectChannelMutation = trpc.playbackControl.selectChannel.useMutation({
    onSuccess: (result) => {
      if (result.state) setPlaybackState(result.state);
      refetchState();
    },
  });

  const setVolumeMutation = trpc.playbackControl.setVolume.useMutation({
    onSuccess: (result) => {
      if (result.state) setPlaybackState(result.state);
      refetchState();
    },
  });

  const setPowerMutation = trpc.playbackControl.setPower.useMutation({
    onSuccess: (result) => {
      if (result.state) setPlaybackState(result.state);
      refetchState();
    },
  });

  // Update local state when server state changes
  useEffect(() => {
    if (currentState) {
      setPlaybackState(currentState);
    }
  }, [currentState]);

  // Listen for preset changes from Studio
  useEffect(() => {
    if (appliedPreset) {
      console.log('Studio preset applied to Rockin Boogie:', appliedPreset);
    }
  }, [appliedPreset]);

  // Ensure playbackState is never null
  const state = playbackState || defaultState;

  const handlePlay = async () => {
    setIsLoading(true);
    try {
      await playMutation.mutateAsync({
        contentId: playbackState?.contentId || 1,
        reason: 'User clicked play button',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = async () => {
    setIsLoading(true);
    try {
      await pauseMutation.mutateAsync({
        reason: 'User clicked pause button',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    setIsLoading(true);
    try {
      await nextMutation.mutateAsync({
        reason: 'User clicked next button',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrev = async () => {
    setIsLoading(true);
    try {
      await prevMutation.mutateAsync({
        reason: 'User clicked previous button',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChannelSelect = async (channel: number) => {
    setIsLoading(true);
    try {
      await selectChannelMutation.mutateAsync({
        channel,
        reason: `User selected channel ${channel}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolumeChange = async (value: number[]) => {
    const newVolume = value[0];
    setIsLoading(true);
    try {
      await setVolumeMutation.mutateAsync({
        volume: newVolume,
        reason: 'User adjusted volume',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePower = async () => {
    setIsLoading(true);
    try {
      const newState = !playbackState?.isPlaying;
      await setPowerMutation.mutateAsync({
        enabled: newState,
        reason: `User toggled power ${newState ? 'on' : 'off'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!playbackState) {
    return <div className="text-center p-4">Loading player...</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      {/* Now Playing */}
      <Card className="p-6 bg-gradient-to-r from-orange-900 to-orange-800 border-orange-700">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Rockin' Rockin' Boogie</h2>
          <p className="text-orange-100">Channel {state.currentChannel}</p>
          <p className="text-sm text-orange-200">
            {state.isPlaying ? '🔴 LIVE' : '⚫ OFFLINE'}
          </p>
        </div>
      </Card>

      {/* Channel Select */}
      <Card className="p-6 border-orange-700">
        <h3 className="text-lg font-semibold mb-4 text-orange-600">CHANNEL SELECT</h3>
        <div className="grid grid-cols-3 gap-3">
          {[7, 13, 9].map((channel) => (
            <Button
              key={channel}
              onClick={() => handleChannelSelect(channel)}
              disabled={isLoading}
              className={`py-3 font-bold text-lg ${
                state.currentChannel === channel
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-slate-600 hover:bg-slate-700 text-white'
              }`}
            >
              Channel {channel}
            </Button>
          ))}
        </div>
      </Card>

      {/* Volume Control */}
      <Card className="p-6 border-orange-700">
        <div className="flex items-center gap-4">
          <span className="text-orange-600 font-semibold">🔊</span>
          <Slider
            value={[state.volume]}
            onValueChange={handleVolumeChange}
            min={0}
            max={100}
            step={1}
            className="flex-1"
            disabled={isLoading}
          />
          <span className="text-orange-600 font-bold w-12 text-right">
            {state.volume}
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
            title="Previous track"
          >
            <SkipBack className="w-6 h-6" />
            <span className="hidden sm:inline ml-2">PREV</span>
          </Button>

          {state.isPlaying ? (
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
              title="Play content"
            >
              <Play className="w-6 h-6" />
              <span className="ml-2">PLAY</span>
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="bg-slate-600 hover:bg-slate-700 text-white py-6"
            title="Next track"
          >
            <SkipForward className="w-6 h-6" />
            <span className="hidden sm:inline ml-2">NEXT</span>
          </Button>
        </div>
      </Card>

      {/* Power Button */}
      <Card className="p-6 border-orange-700">
        <Button
          onClick={handlePower}
          disabled={isLoading}
          className={`w-full py-8 font-bold text-xl text-white ${
            state.isPlaying
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-orange-600 hover:bg-orange-700'
          }`}
          title="Toggle power"
        >
          <Power className="w-6 h-6 mr-2" />
          POWER
        </Button>
      </Card>

      {/* Listener Metrics */}
      <ListenerMetrics isLive={state.isPlaying} />

      {/* Queue Manager */}
      <QueueManager
        queue={[
          { id: 1, title: 'Rockin\' Rockin\' Boogie', artist: 'Little Richard', duration: 180, channel: 7 },
          { id: 2, title: 'Tutti Frutti', artist: 'Little Richard', duration: 160, channel: 7 },
          { id: 3, title: 'Long Tall Sally', artist: 'Little Richard', duration: 170, channel: 7 },
        ]}
        currentIndex={state.queueIndex}
        onReorder={(newQueue) => console.log('Queue reordered:', newQueue)}
        onRemove={(trackId) => console.log('Remove track:', trackId)}
        onPlayTrack={(index) => console.log('Play track at index:', index)}
      />

      {/* Status Info */}
      <Card className="p-4 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700">
        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
          <p>
            <strong>Status:</strong> {state.isPlaying ? 'Playing' : 'Stopped'}
          </p>
          <p>
            <strong>Volume:</strong> {state.volume}%
          </p>
          <p>
            <strong>Channel:</strong> {state.currentChannel}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            All controls are managed by QUMUS orchestration engine
          </p>
        </div>
      </Card>
    </div>
  );
}
