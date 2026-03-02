import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Search, Play, Heart } from 'lucide-react';

interface Podcast {
  id: string;
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl600: string;
  artworkUrl100: string;
  description?: string;
  trackCount?: number;
  genres?: string[];
  feedUrl?: string;
  trackViewUrl: string;
}

export default function PodcastDiscovery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'search' | 'popular' | 'favorites'>('popular');
  const [isLoading, setIsLoading] = useState(false);

  // tRPC mutations
  const searchMutation = trpc.itunesPodcasts.search.useMutation();
  const popularMutation = trpc.itunesPodcasts.getPopular.useMutation();

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('favoritePodcasts');
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save favorites to localStorage
  const saveFavorites = (newFavorites: Set<string>) => {
    setFavorites(newFavorites);
    localStorage.setItem('favoritePodcasts', JSON.stringify(Array.from(newFavorites)));
  };

  // Search podcasts
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setActiveTab('search');
    
    try {
      const response = await searchMutation.mutateAsync({
        query: searchQuery,
        limit: 20,
      });

      if (response.success) {
        setPodcasts(response.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get popular podcasts
  const getPopular = async () => {
    setIsLoading(true);
    setActiveTab('popular');
    
    try {
      const response = await popularMutation.mutateAsync();
      if (response.success) {
        setPodcasts(response.data);
      }
    } catch (error) {
      console.error('Popular podcasts error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle favorite
  const toggleFavorite = (podcastId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(podcastId)) {
      newFavorites.delete(podcastId);
    } else {
      newFavorites.add(podcastId);
    }
    saveFavorites(newFavorites);
  };

  // Get favorite podcasts
  const getFavorites = () => {
    setActiveTab('favorites');
    const favoritePodcasts = podcasts.filter((p) => favorites.has(p.id));
    setPodcasts(favoritePodcasts);
  };

  // Load popular podcasts on mount
  useEffect(() => {
    getPopular();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-800 to-orange-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎙️ Podcast Discovery</h1>
          <p className="text-orange-100">Search and discover podcasts from iTunes</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-orange-300 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search podcasts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-orange-400 text-white placeholder:text-orange-200"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <Button
            onClick={getPopular}
            variant={activeTab === 'popular' ? 'default' : 'outline'}
            className={
              activeTab === 'popular'
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'border-orange-400 text-orange-100 hover:bg-orange-900/50'
            }
          >
            Popular
          </Button>
          <Button
            onClick={getFavorites}
            variant={activeTab === 'favorites' ? 'default' : 'outline'}
            className={
              activeTab === 'favorites'
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'border-orange-400 text-orange-100 hover:bg-orange-900/50'
            }
          >
            Favorites ({favorites.size})
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-300" />
          </div>
        )}

        {/* Podcasts Grid */}
        {!isLoading && podcasts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {podcasts.map((podcast) => (
              <Card
                key={podcast.id}
                className="bg-white/10 border-orange-400 backdrop-blur-sm hover:bg-white/20 transition-all overflow-hidden group"
              >
                <div className="relative">
                  <img
                    src={podcast.artworkUrl600 || podcast.artworkUrl100}
                    alt={podcast.collectionName}
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
                        onClick={() => window.open(podcast.trackViewUrl, '_blank')}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/20 hover:bg-white/30 text-white border-white rounded-full"
                        onClick={() => toggleFavorite(podcast.id)}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            favorites.has(podcast.id) ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-white text-sm line-clamp-2 mb-1">
                    {podcast.collectionName}
                  </h3>
                  <p className="text-orange-100 text-xs mb-2">{podcast.artistName}</p>

                  {podcast.trackCount && (
                    <p className="text-orange-200 text-xs mb-2">
                      {podcast.trackCount} episodes
                    </p>
                  )}

                  {podcast.genres && podcast.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {podcast.genres.slice(0, 2).map((genre, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-orange-600/50 text-orange-100 px-2 py-1 rounded"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}

                  {podcast.description && (
                    <p className="text-orange-100 text-xs mt-2 line-clamp-2">
                      {podcast.description}
                    </p>
                  )}

                  <Button
                    size="sm"
                    className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => toggleFavorite(podcast.id)}
                  >
                    {favorites.has(podcast.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && podcasts.length === 0 && activeTab === 'search' && (
          <div className="text-center py-12">
            <p className="text-orange-100 text-lg">No podcasts found. Try a different search.</p>
          </div>
        )}

        {!isLoading && podcasts.length === 0 && activeTab === 'favorites' && (
          <div className="text-center py-12">
            <p className="text-orange-100 text-lg">No favorite podcasts yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
