/**
 * Podcast Discovery & Search Page
 * 
 * Search for podcasts using iTunes API
 * Browse podcast directories
 * Add new shows to channels
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Plus, Music } from 'lucide-react';

interface PodcastResult {
  id: number;
  name: string;
  artist: string;
  description: string;
  imageUrl: string;
  feedUrl?: string;
}

export default function PodcastDiscovery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<PodcastResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&media=podcast&limit=20`
      );
      const data = await response.json();

      const podcasts = data.results?.map((result: any) => ({
        id: result.collectionId,
        name: result.collectionName,
        artist: result.artistName,
        description: result.collectionViewUrl,
        imageUrl: result.artworkUrl600 || result.artworkUrl100,
        feedUrl: result.feedUrl,
      })) || [];

      setResults(podcasts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPodcast = (podcast: PodcastResult) => {
    // TODO: Implement adding podcast to channel
    console.log('Adding podcast:', podcast);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-orange-600">🎙️ Podcast Discovery</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Search and discover podcasts from iTunes
        </p>
      </div>

      {/* Search Form */}
      <Card className="p-6 border-orange-700">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for podcasts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
          <p className="text-xs text-slate-500">
            Search by podcast name, topic, or artist
          </p>
        </form>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="p-4 bg-red-100 border-red-300">
          <p className="text-red-800 text-sm">{error}</p>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="p-6 text-center">
          <p className="text-slate-600 dark:text-slate-400">Searching podcasts...</p>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-orange-600">
            Found {results.length} podcasts
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((podcast) => (
              <Card key={podcast.id} className="p-4 border-orange-700 hover:shadow-lg transition">
                <div className="flex gap-4">
                  {/* Podcast Image */}
                  <img
                    src={podcast.imageUrl}
                    alt={podcast.name}
                    className="w-20 h-20 rounded object-cover"
                  />

                  {/* Podcast Info */}
                  <div className="flex-1 space-y-2">
                    <h3 className="font-bold text-orange-600 line-clamp-2">
                      {podcast.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {podcast.artist}
                    </p>
                    <Button
                      onClick={() => handleAddPodcast(podcast)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add to Channel
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && results.length === 0 && searchQuery && (
        <Card className="p-6 text-center border-orange-700">
          <Music className="w-12 h-12 mx-auto text-slate-400 mb-2" />
          <p className="text-slate-600 dark:text-slate-400">
            No podcasts found for "{searchQuery}"
          </p>
        </Card>
      )}

      {/* Featured Podcasts */}
      {!searchQuery && (
        <Card className="p-6 border-orange-700 bg-orange-50 dark:bg-orange-950">
          <h2 className="text-xl font-bold text-orange-600 mb-4">📻 Featured Podcasts</h2>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p>Try searching for:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>The Joe Rogan Experience</li>
              <li>Stuff You Should Know</li>
              <li>Serial</li>
              <li>NPR News Now</li>
              <li>Radiolab</li>
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
}
