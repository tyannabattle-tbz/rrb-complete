import React, { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { CHANNEL_PRESETS, LIVE_STREAMS, type AudioTrack } from '@/lib/streamLibrary';

interface ChannelSearchFilterProps {
  onChannelSelect: (channel: AudioTrack) => void;
  onClose?: () => void;
}

export const ChannelSearchFilter: React.FC<ChannelSearchFilterProps> = ({ onChannelSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const allChannels = Object.values(LIVE_STREAMS);
  const genres = [...new Set(allChannels.map(ch => ch.channel))];

  const filteredChannels = useMemo(() => {
    return allChannels.filter(channel => {
      const matchesSearch = 
        channel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.channel.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGenre = !selectedGenre || channel.channel === selectedGenre;

      return matchesSearch && matchesGenre;
    });
  }, [searchQuery, selectedGenre]);

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search channels, artists, genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition-colors flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Genre Filter */}
      {isOpen && (
        <div className="mb-4 p-3 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-sm font-semibold text-white mb-2">Filter by Genre:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGenre(null)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedGenre === null
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              All
            </button>
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedGenre === genre
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
        {filteredChannels.length > 0 ? (
          filteredChannels.map(channel => (
            <button
              key={channel.id}
              onClick={() => {
                onChannelSelect(channel);
                setSearchQuery('');
                setSelectedGenre(null);
              }}
              className="p-3 bg-slate-800 border border-slate-700 rounded-lg hover:border-orange-500 transition-all text-left group"
            >
              <p className="font-semibold text-white group-hover:text-orange-400 transition-colors truncate">
                {channel.title}
              </p>
              <p className="text-sm text-slate-400 truncate">
                {channel.artist}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {channel.channel}
              </p>
            </button>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-slate-400">
            <p>No channels found matching your search</p>
          </div>
        )}
      </div>

      {/* Result Count */}
      <div className="mt-3 text-sm text-slate-400 text-center">
        {filteredChannels.length} channel{filteredChannels.length !== 1 ? 's' : ''} found
      </div>
    </div>
  );
};

export default ChannelSearchFilter;
