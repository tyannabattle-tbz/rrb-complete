/**
 * Live Broadcast Stream Player Component
 * Persistent audio player widget with real-time metrics
 * Features: Playback controls, listener count, frequency info, stream status
 */

import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, Radio, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';

export const LiveBroadcastPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch broadcast status
  const { data: broadcastStatus, refetch } = trpc.rrbNavigation.getBroadcastStatus.useQuery(undefined, {
    refetchInterval: autoRefresh ? 5000 : false,
  });

  // Fetch health check
  const { data: healthCheck } = trpc.rrbNavigation.getBroadcastHealth.useQuery(undefined, {
    refetchInterval: autoRefresh ? 10000 : false,
  });

  // Activate broadcast mutation
  const { mutate: activateBroadcast, isPending: isActivating } =
    trpc.rrbNavigation.activateBroadcast.useMutation({
      onSuccess: () => {
        refetch();
      },
    });

  const handlePlayPause = () => {
    if (!isPlaying && broadcastStatus?.status === 'offline') {
      activateBroadcast();
    }
    setIsPlaying(!isPlaying);
  };

  const isOnline = broadcastStatus?.status === 'online';
  const listenerCount = broadcastStatus?.listeners || 0;

  return (
    <Card className="fixed bottom-4 right-4 w-80 bg-gradient-to-br from-blue-900 to-blue-950 border-blue-700 shadow-2xl z-50">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white">Live Broadcast</h3>
          </div>
          <div
            className={cn(
              'w-3 h-3 rounded-full animate-pulse',
              isOnline ? 'bg-green-500' : 'bg-red-500'
            )}
          />
        </div>

        {/* Station Info */}
        <div className="space-y-2 bg-blue-950 rounded-lg p-3">
          <p className="text-sm text-blue-300">
            <span className="font-semibold">{broadcastStatus?.stationName}</span>
          </p>
          <p className="text-xs text-blue-400">
            {broadcastStatus?.frequencyLabel} • {broadcastStatus?.tuning}Hz
          </p>
          <p className="text-xs text-blue-400">{broadcastStatus?.description}</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-950 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-300">Listeners</span>
            </div>
            <p className="text-lg font-bold text-white">{listenerCount.toLocaleString()}</p>
          </div>
          <div className="bg-blue-950 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-300">Status</span>
            </div>
            <p className={cn('text-lg font-bold', isOnline ? 'text-green-400' : 'text-red-400')}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </p>
          </div>
        </div>

        {/* Health Indicator */}
        {healthCheck && (
          <div className="bg-blue-950 rounded-lg p-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-300">Health:</span>
              <span className={cn('font-semibold', healthCheck.healthy ? 'text-green-400' : 'text-red-400')}>
                {healthCheck.healthy ? '✓ Healthy' : '✗ Degraded'}
              </span>
            </div>
            <div className="mt-1 h-1 bg-blue-900 rounded-full overflow-hidden">
              <div
                className={cn('h-full transition-all', healthCheck.healthy ? 'bg-green-500' : 'bg-red-500')}
                style={{ width: healthCheck.healthy ? '100%' : '60%' }}
              />
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="space-y-3">
          {/* Play/Pause Button */}
          <Button
            onClick={handlePlayPause}
            disabled={isActivating}
            className={cn(
              'w-full font-semibold transition-all',
              isPlaying
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            )}
          >
            {isActivating ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⟳</span>
                Activating...
              </span>
            ) : isPlaying ? (
              <span className="flex items-center gap-2">
                <Pause className="w-4 h-4" />
                Stop
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Play
              </span>
            )}
          </Button>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-blue-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-xs text-blue-300 w-8 text-right">{volume}%</span>
          </div>

          {/* Auto-Refresh Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="auto-refresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded accent-blue-500"
            />
            <label htmlFor="auto-refresh" className="text-xs text-blue-300 cursor-pointer">
              Auto-refresh metrics
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-blue-400 text-center border-t border-blue-800 pt-2">
          Last updated: {new Date(broadcastStatus?.lastUpdated || Date.now()).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveBroadcastPlayer;
