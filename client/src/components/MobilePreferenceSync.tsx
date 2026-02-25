import React, { useState, useEffect } from 'react';
import { Smartphone, Cloud, Heart, Play, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PlaybackPosition {
  contentId: string;
  position: number;
  duration: number;
  deviceId: string;
  timestamp: number;
}

interface MobilePreferenceSyncProps {
  deviceId: string;
  onSync?: () => void;
}

export default function MobilePreferenceSync({ deviceId, onSync }: MobilePreferenceSyncProps) {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<number>(0);
  const [playbackPositions, setPlaybackPositions] = useState<PlaybackPosition[]>([]);
  const [autoSync, setAutoSync] = useState(true);

  // Simulate auto-sync every 5 minutes
  useEffect(() => {
    if (!autoSync) return;

    const interval = setInterval(() => {
      handleSync();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoSync]);

  const handleSync = async () => {
    setSyncStatus('syncing');
    try {
      // Simulate sync delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get local data
      const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const localPositions = JSON.parse(localStorage.getItem('playbackPositions') || '[]');

      setFavorites(localFavorites.length);
      setPlaybackPositions(localPositions);
      setLastSync(Date.now());
      setSyncStatus('synced');

      if (onSync) onSync();

      // Reset status after 2 seconds
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="px-4">
        <div className="flex items-center gap-2 mb-2">
          <Cloud className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Device Sync</h3>
        </div>
        <p className="text-purple-200 text-sm">Device ID: {deviceId}</p>
      </div>

      {/* Sync Status Card */}
      <Card className="bg-slate-800 border-purple-500 border mx-4 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-purple-400" />
            <span className="text-white font-semibold">Sync Status</span>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              syncStatus === 'synced'
                ? 'bg-green-500 text-white'
                : syncStatus === 'syncing'
                  ? 'bg-yellow-500 text-white'
                  : syncStatus === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-slate-700 text-gray-300'
            }`}
          >
            {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'synced' ? '✓ Synced' : syncStatus === 'error' ? '✗ Error' : 'Ready'}
          </div>
        </div>

        {lastSync && (
          <p className="text-purple-300 text-xs mb-4">Last sync: {formatTime(lastSync)}</p>
        )}

        {/* Sync Button */}
        <Button
          onClick={handleSync}
          disabled={syncStatus === 'syncing'}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
        >
          {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
        </Button>
      </Card>

      {/* Auto Sync Toggle */}
      <Card className="bg-slate-800 border-slate-700 border mx-4 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" />
          <span className="text-white font-semibold">Auto Sync</span>
        </div>
        <button
          onClick={() => setAutoSync(!autoSync)}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            autoSync ? 'bg-green-600 text-white' : 'bg-slate-700 text-gray-300'
          }`}
        >
          {autoSync ? 'On' : 'Off'}
        </button>
      </Card>

      {/* Favorites */}
      <Card className="bg-slate-800 border-slate-700 border mx-4 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-5 h-5 text-red-400" />
          <span className="text-white font-semibold">Favorites</span>
        </div>
        <p className="text-2xl font-bold text-purple-400">{favorites}</p>
        <p className="text-purple-300 text-xs mt-1">Synced across devices</p>
      </Card>

      {/* Recent Playback Positions */}
      {playbackPositions.length > 0 && (
        <Card className="bg-slate-800 border-slate-700 border mx-4 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Play className="w-5 h-5 text-blue-400" />
            <span className="text-white font-semibold">Resume Points</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {playbackPositions.slice(0, 3).map((pos, idx) => (
              <div key={idx} className="bg-slate-700 p-3 rounded-lg">
                <p className="text-white text-sm font-semibold truncate">
                  Content {pos.contentId.slice(0, 8)}...
                </p>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex-1 bg-slate-600 rounded-full h-1 mr-2">
                    <div
                      className="bg-purple-500 h-1 rounded-full"
                      style={{
                        width: `${(pos.position / pos.duration) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-purple-300 text-xs whitespace-nowrap">
                    {formatDuration(pos.position)} / {formatDuration(pos.duration)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Storage Info */}
      <Card className="bg-slate-800 border-slate-700 border mx-4 p-4">
        <p className="text-purple-300 text-xs">
          Preferences synced across all your devices. Enable auto-sync to keep everything up to date.
        </p>
      </Card>
    </div>
  );
}
