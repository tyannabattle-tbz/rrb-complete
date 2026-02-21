/**
 * Channel Favorites Button Component
 * Allows users to bookmark/favorite channels
 */

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { isFavorited, toggleFavorite } from '@/lib/channelFavorites';

interface ChannelFavoritesButtonProps {
  channelId: string;
  channelLabel?: string;
  compact?: boolean;
  onToggle?: (isFavorited: boolean) => void;
}

export function ChannelFavoritesButton({
  channelId,
  channelLabel,
  compact = false,
  onToggle,
}: ChannelFavoritesButtonProps) {
  const [favorited, setFavorited] = useState(() => isFavorited(channelId));
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    const newState = toggleFavorite(channelId, channelLabel);
    setFavorited(newState);
    onToggle?.(newState);

    // Reset animation
    setTimeout(() => setIsAnimating(false), 300);
  };

  if (compact) {
    return (
      <button
        onClick={handleToggle}
        className={`p-2 rounded-lg transition-all ${
          favorited
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
        } ${isAnimating ? 'scale-110' : 'scale-100'}`}
        title={favorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart
          className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`}
        />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        favorited
          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
      } ${isAnimating ? 'scale-105' : 'scale-100'}`}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={`w-4 h-4 ${favorited ? 'fill-current' : ''} ${
          isAnimating ? 'animate-pulse' : ''
        }`}
      />
      <span className="text-sm font-medium">
        {favorited ? 'Favorited' : 'Add to Favorites'}
      </span>
    </button>
  );
}
