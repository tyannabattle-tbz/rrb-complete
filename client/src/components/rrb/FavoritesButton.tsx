import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface FavoritesButtonProps {
  channelId: string;
  channelName: string;
  genre: string;
  onFavoriteChange?: (isFavorited: boolean) => void;
}

export const FavoritesButton: React.FC<FavoritesButtonProps> = ({
  channelId,
  channelName,
  genre,
  onFavoriteChange,
}) => {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if channel is favorited
    const favorites = localStorage.getItem(`favorites_${user?.id}`);
    if (favorites) {
      const favList = JSON.parse(favorites);
      setIsFavorited(favList.some((fav: any) => fav.channelId === channelId));
    }
  }, [channelId, user?.id]);

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('Please log in to save favorites');
      return;
    }

    setIsLoading(true);
    try {
      const storageKey = `favorites_${user.id}`;
      const favorites = localStorage.getItem(storageKey);
      let favList = favorites ? JSON.parse(favorites) : [];

      if (isFavorited) {
        // Remove from favorites
        favList = favList.filter((fav: any) => fav.channelId !== channelId);
      } else {
        // Add to favorites
        favList.push({ channelId, channelName, genre, addedAt: new Date().toISOString() });
      }

      localStorage.setItem(storageKey, JSON.stringify(favList));
      setIsFavorited(!isFavorited);
      onFavoriteChange?.(!isFavorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorites');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`p-2 rounded-lg transition-all ${
        isFavorited
          ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
          : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-300'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
    </button>
  );
};

export default FavoritesButton;
