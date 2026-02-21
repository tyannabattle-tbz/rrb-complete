/**
 * Favorite Channels Component
 * Displays user's bookmarked channels
 */

import React, { useState, useEffect } from 'react';
import { Heart, Play, Pause } from 'lucide-react';
import { getFavorites, removeFavorite } from '@/lib/channelFavorites';
import { useAudio } from '@/contexts/AudioContext';
import { LIVE_STREAMS } from '@/lib/streamLibrary';
import { ListenerStatsDisplay } from './ListenerStatsDisplay';

export function FavoriteChannels() {
  const [favorites, setFavorites] = useState(() => getFavorites());
  const audio = useAudio();

  // Refresh favorites when they change
  useEffect(() => {
    const interval = setInterval(() => {
      setFavorites(getFavorites());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRemoveFavorite = (channelId: string) => {
    removeFavorite(channelId);
    setFavorites(getFavorites());
  };

  if (favorites.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <Heart className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-400">No favorite channels yet</p>
        <p className="text-sm text-zinc-500 mt-1">
          Click the heart icon on any channel to add it to your favorites
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5 text-red-400 fill-current" />
        <h3 className="text-lg font-bold">My Favorite Channels ({favorites.length})</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {favorites.map(favorite => {
          // Find the stream by channel ID
          const stream = Object.values(LIVE_STREAMS).find(
            s => s.id === favorite.channelId
          );

          if (!stream) return null;

          const isActive = audio.currentTrack?.id === stream.id;
          const isPlaying = isActive && audio.isPlaying;

          return (
            <div
              key={favorite.channelId}
              className={`p-4 rounded-lg border-2 transition-all ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-white">{stream.title}</h4>
                  <p className="text-sm text-zinc-400">{stream.artist}</p>
                </div>
                <button
                  onClick={() => handleRemoveFavorite(favorite.channelId)}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                  title="Remove from favorites"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <ListenerStatsDisplay
                  channelId={favorite.channelId}
                  compact
                  showTrend={false}
                />

                <button
                  onClick={() => {
                    if (isActive) {
                      audio.togglePlayPause();
                    } else {
                      audio.play(stream);
                    }
                  }}
                  className="p-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
