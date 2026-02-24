import React, { useState, useMemo } from 'react';
import { PageMeta } from '@/components/rrb/PageMeta';
import { Play, Pause, Radio, Search, Zap, TrendingUp } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { RRB_RADIO_CHANNELS, getFeaturedChannels, getChannelsByGenre, getAllGenres, searchChannels, getTrendingChannels } from '@/lib/rrbRadioStations';
import type { RRBRadioChannel } from '@/lib/rrbRadioStations';

export default function RadioStationChannels() {
  const audio = useAudio();
  const [selectedChannel, setSelectedChannel] = useState<RRBRadioChannel | null>(RRB_RADIO_CHANNELS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Get all unique genres
  const genres = useMemo(() => ['All', ...getAllGenres()], []);

  // Filter channels based on search and genre
  const filteredChannels = useMemo(() => {
    let result = RRB_RADIO_CHANNELS;

    if (selectedGenre !== 'All') {
      result = result.filter(ch => ch.genre === selectedGenre);
    }

    if (searchQuery) {
      result = searchChannels(searchQuery);
    }

    return result;
  }, [selectedGenre, searchQuery]);

  // Get featured channels
  const featured = useMemo(() => getFeaturedChannels(), []);

  // Get trending channels
  const trending = useMemo(() => getTrendingChannels(5), []);

  const handlePlayChannel = (channel: RRBRadioChannel) => {
    setSelectedChannel(channel);
    audio.play({
      id: channel.id,
      title: channel.name,
      artist: channel.genre,
      url: channel.streamUrl,
      channel: 'RRB Radio',
      isLiveStream: true,
    });
  };

  const toggleFavorite = (channelId: string) => {
    setFavorites(prev =>
      prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const isPlaying = selectedChannel && audio.currentTrack?.id === selectedChannel.id && audio.isPlaying;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <PageMeta
        title="RRB Radio Station - 40+ Channels"
        description="Rockin' Rockin' Boogie Radio - Jazz, Blues, Soul, Rock, Hip-Hop, Wellness & More"
      />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-slate-950/95 to-purple-950/95 backdrop-blur border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">RRB Radio Station</h1>
                <p className="text-sm text-purple-300">40+ Channels • Live Streaming • 24/7 Availability</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Now Playing */}
        {selectedChannel && (
          <div className="mb-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-purple-100 mb-1">NOW PLAYING</p>
                <h2 className="text-3xl font-bold mb-2">{selectedChannel.name}</h2>
                <p className="text-purple-100 mb-4">{selectedChannel.description}</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handlePlayChannel(selectedChannel)}
                    className="flex items-center gap-2 bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Play
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => toggleFavorite(selectedChannel.id)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      favorites.includes(selectedChannel.id)
                        ? 'bg-yellow-400 text-purple-900'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {favorites.includes(selectedChannel.id) ? '⭐ Favorited' : '☆ Add to Favorites'}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">{selectedChannel.listeners?.toLocaleString() || '0'}</p>
                <p className="text-purple-100 text-sm">Listeners</p>
              </div>
            </div>
          </div>
        )}

        {/* Featured Channels */}
        {featured.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              Featured Channels
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => handlePlayChannel(channel)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedChannel?.id === channel.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-purple-500/30 bg-slate-900/50 hover:border-purple-500/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{channel.emoji}</span>
                    {isPlaying && selectedChannel?.id === channel.id && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  <h4 className="font-bold text-white mb-1">{channel.name}</h4>
                  <p className="text-sm text-purple-300 mb-2">{channel.description}</p>
                  <div className="flex items-center justify-between text-xs text-purple-400">
                    <span>{channel.genre}</span>
                    <span>{channel.listeners?.toLocaleString() || '0'} listeners</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trending Channels */}
        {trending.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-red-400" />
              Trending Now
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {trending.map((channel, idx) => (
                <button
                  key={channel.id}
                  onClick={() => handlePlayChannel(channel)}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    selectedChannel?.id === channel.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-purple-500/20 bg-slate-900/50 hover:border-purple-500/40'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{['🥇', '🥈', '🥉', '⭐', '✨'][idx]}</span>
                    <span className="text-2xl">{channel.emoji}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm mb-1">{channel.name}</h4>
                  <p className="text-xs text-purple-300">{channel.listeners?.toLocaleString() || '0'}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Genre Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-3">Browse by Genre</h3>
          <div className="flex flex-wrap gap-2">
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedGenre === genre
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-900/50 text-purple-300 hover:bg-slate-900'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Channels Grid */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">
            {selectedGenre === 'All' ? 'All Channels' : `${selectedGenre} Channels`}
            <span className="text-purple-400 text-lg ml-2">({filteredChannels.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChannels.map(channel => (
              <button
                key={channel.id}
                onClick={() => handlePlayChannel(channel)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedChannel?.id === channel.id
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-purple-500/30 bg-slate-900/50 hover:border-purple-500/60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{channel.emoji}</span>
                  <div className="flex items-center gap-2">
                    {isPlaying && selectedChannel?.id === channel.id && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(channel.id);
                      }}
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      {favorites.includes(channel.id) ? '⭐' : '☆'}
                    </button>
                  </div>
                </div>
                <h4 className="font-bold text-white mb-1 text-lg">{channel.name}</h4>
                <p className="text-sm text-purple-300 mb-3">{channel.description}</p>
                <div className="flex items-center justify-between text-xs text-purple-400 border-t border-purple-500/20 pt-3">
                  <span>{channel.genre}</span>
                  <span>{channel.listeners?.toLocaleString() || '0'} listeners</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
