/**
 * Channel Discovery Page
 * Browse, search, and filter all available radio channels
 */

import React, { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAudio } from '@/contexts/AudioContext';
import { ListenerStatsDisplay } from '@/components/rrb/ListenerStatsDisplay';
import { ChannelFavoritesButton } from '@/components/rrb/ChannelFavoritesButton';
import { CHANNEL_PRESETS, LIVE_STREAMS } from '@/lib/streamLibrary';

type GenreFilter = string | null;

export function ChannelDiscovery() {
  const { play } = useAudio();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<GenreFilter>(null);
  const [sortBy, setSortBy] = useState<'name' | 'listeners'>('name');

  // Get all unique genres from presets
  const genres = useMemo(() => {
    return Array.from(new Set(CHANNEL_PRESETS.map((p) => p.label)));
  }, []);

  // Filter and search channels
  const filteredChannels = useMemo(() => {
    let filtered = LIVE_STREAMS;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (channel) =>
          channel.title.toLowerCase().includes(query) ||
          channel.description.toLowerCase().includes(query) ||
          channel.category.toLowerCase().includes(query)
      );
    }

    // Filter by genre
    if (selectedGenre) {
      filtered = filtered.filter((channel) => channel.category === selectedGenre);
    }

    // Sort
    if (sortBy === 'listeners') {
      filtered = [...filtered].sort((a, b) => {
        const aListeners = a.listeners || 0;
        const bListeners = b.listeners || 0;
        return bListeners - aListeners;
      });
    } else {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [searchQuery, selectedGenre, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black pt-20 pb-12">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Channel Discovery</h1>
          <p className="text-xl text-zinc-400">
            Explore {LIVE_STREAMS.length}+ channels across all genres
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              type="text"
              placeholder="Search channels by name, genre, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-3 bg-white/10 border-white/20 text-white placeholder:text-zinc-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-semibold text-zinc-300">Filter by Genre:</span>
          </div>

          <Button
            variant={selectedGenre === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedGenre(null)}
            className={selectedGenre === null ? 'bg-amber-500 hover:bg-amber-600' : ''}
          >
            All Genres
          </Button>

          {genres.map((genre) => (
            <Button
              key={genre}
              variant={selectedGenre === genre ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGenre(genre)}
              className={selectedGenre === genre ? 'bg-amber-500 hover:bg-amber-600' : ''}
            >
              {genre}
            </Button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="mb-8 flex items-center gap-4">
          <span className="text-sm font-semibold text-zinc-300">Sort by:</span>
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'name' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('name')}
              className={sortBy === 'name' ? 'bg-amber-500 hover:bg-amber-600' : ''}
            >
              Name
            </Button>
            <Button
              variant={sortBy === 'listeners' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('listeners')}
              className={sortBy === 'listeners' ? 'bg-amber-500 hover:bg-amber-600' : ''}
            >
              Listeners
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-zinc-400">
          Showing {filteredChannels.length} of {LIVE_STREAMS.length} channels
        </div>

        {/* Channels Grid */}
        {filteredChannels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChannels.map((channel) => (
              <Card
                key={channel.id}
                className="bg-gradient-to-br from-zinc-800 to-zinc-900 border-white/10 hover:border-amber-500/50 transition-all group cursor-pointer overflow-hidden"
                onClick={() => play(channel)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
                        {channel.title}
                      </h3>
                      <p className="text-sm text-amber-400">{channel.category}</p>
                    </div>
                    <ChannelFavoritesButton channelId={channel.id} />
                  </div>

                  {/* Description */}
                  <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                    {channel.description}
                  </p>

                  {/* Stats */}
                  <div className="mb-4">
                    <ListenerStatsDisplay
                      channelId={channel.id}
                      showTrend={true}
                      compact={true}
                    />
                  </div>

                  {/* Play Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      play(channel);
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                  >
                    Play Channel
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-zinc-400 mb-4">No channels found</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre(null);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
