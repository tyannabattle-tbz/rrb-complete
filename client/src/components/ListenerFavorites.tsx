import React, { useState, useEffect } from 'react';
import { Heart, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface Favorite {
  id: string;
  channelId: string;
  channelName: string;
  addedAt: Date;
  lastListened?: Date;
}

interface ListenerFavoritesProps {
  channelId: string;
  channelName: string;
  onFavoriteToggle?: (isFavorited: boolean) => void;
  showList?: boolean;
  onSelectFavorite?: (channelId: string, channelName: string) => void;
}

export const ListenerFavorites: React.FC<ListenerFavoritesProps> = ({
  channelId,
  channelName,
  onFavoriteToggle,
  showList = false,
  onSelectFavorite,
}) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFavoritesList, setShowFavoritesList] = useState(showList);

  // Load favorites from localStorage (client-side persistence)
  useEffect(() => {
    if (!user) return;

    const storedFavorites = localStorage.getItem(`favorites-${user.id}`);
    if (storedFavorites) {
      try {
        const parsed = JSON.parse(storedFavorites) as Favorite[];
        setFavorites(parsed);
        setIsFavorited(parsed.some(f => f.channelId === channelId));
      } catch (error) {
        console.error('Failed to parse favorites:', error);
      }
    }
  }, [user, channelId]);

  const toggleFavorite = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      if (isFavorited) {
        // Remove from favorites
        const updated = favorites.filter(f => f.channelId !== channelId);
        setFavorites(updated);
        localStorage.setItem(`favorites-${user.id}`, JSON.stringify(updated));
        setIsFavorited(false);
      } else {
        // Add to favorites
        const newFavorite: Favorite = {
          id: `${user.id}-${channelId}-${Date.now()}`,
          channelId,
          channelName,
          addedAt: new Date(),
        };
        const updated = [...favorites, newFavorite];
        setFavorites(updated);
        localStorage.setItem(`favorites-${user.id}`, JSON.stringify(updated));
        setIsFavorited(true);
      }
      onFavoriteToggle?.(!isFavorited);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = (channelId: string) => {
    if (!user) return;

    const updated = favorites.filter(f => f.channelId !== channelId);
    setFavorites(updated);
    localStorage.setItem(`favorites-${user.id}`, JSON.stringify(updated));

    if (channelId === channelId) {
      setIsFavorited(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={toggleFavorite}
        disabled={isLoading || !user}
        variant={isFavorited ? 'default' : 'outline'}
        size="sm"
        className={`flex items-center gap-2 ${isFavorited ? 'bg-red-600 hover:bg-red-700' : ''}`}
        title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        <span className="text-xs font-medium">{isFavorited ? 'Favorited' : 'Add to Favorites'}</span>
      </Button>

      {showList && favorites.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowFavoritesList(!showFavoritesList)}
            className="text-sm font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-2"
          >
            <Heart className="w-4 h-4 fill-current" />
            My Favorites ({favorites.length})
          </button>

          {showFavoritesList && (
            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
              {favorites.map(fav => (
                <div
                  key={fav.id}
                  className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <button
                    onClick={() => {
                      onSelectFavorite?.(fav.channelId, fav.channelName);
                      setShowFavoritesList(false);
                    }}
                    className="flex-1 text-left"
                  >
                    <div className="text-sm font-medium text-white hover:text-amber-400 transition-colors">
                      {fav.channelName}
                    </div>
                    {fav.lastListened && (
                      <div className="text-xs text-slate-400">
                        Last listened: {new Date(fav.lastListened).toLocaleDateString()}
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => removeFavorite(fav.channelId)}
                    className="p-1 hover:bg-red-600/20 rounded transition-colors"
                    title="Remove from favorites"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ListenerFavorites;
