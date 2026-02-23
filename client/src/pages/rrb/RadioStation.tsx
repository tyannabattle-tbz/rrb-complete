
import React, { useState, useMemo, useEffect } from 'react';
import { PageMeta } from '@/components/rrb/PageMeta';
import { RadioPlayer, Track } from '@/components/rrb/RadioPlayer';
import { HybridCastWidgetContainer } from '@/components/rrb/HybridCastWidgetContainer';
import RadioCommercials from '@/components/rrb/RadioCommercials';
import SeasonalCampaigns from '@/components/rrb/SeasonalCampaigns';
import { ChevronDown, Search, Radio, Play, Pause, Loader } from 'lucide-react';
import { getCuratedStationsByGenre, searchRadioStations } from '@/lib/radioGardenService';
import { VintageRadioTuner } from '@/components/VintageRadioTuner';

// Genre categories for Radio Garden API
const GENRE_CATEGORIES = {
  'R&B/Soul': 'R&B/Soul',
  'Jazz': 'Jazz',
  'Blues': 'Blues',
  'Rock': 'Rock',
  'Country': 'Country',
  '90s Hip-Hop': '90s Hip-Hop',
  'Talk': 'Talk',
  'Meditation': 'Meditation',
};

// Fallback static channels (for when API is unavailable)
const FALLBACK_CHANNELS = [
  { id: 'rrb-main', name: 'RRB Main', category: 'Operators', description: 'Rockin\' Rockin\' Boogie Main Channel', streamUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3' },
  { id: 'canryn-main', name: 'Canryn Productions', category: 'Operators', description: 'Canryn Production content', streamUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3' },
  { id: 'sweet-miracles', name: 'Sweet Miracles', category: 'Operators', description: 'Sweet Miracles nonprofit', streamUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3' },
];

const CATEGORIES = ['All', 'R&B/Soul', 'Jazz', 'Blues', 'Rock', 'Country', '90s Hip-Hop', 'Talk', 'Meditation', 'Operators'];
const RANK_BADGES = ['🥇', '🥈', '🥉', '⭐'] as const;

interface Channel {
  id: string;
  title: string;
  url: string;
  genre: string;
  country?: string;
  city?: string;
  favicon?: string;
}

// Fallback tracks
const FALLBACK_TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Rockin\' Rockin\' Boogie',
    artist: 'Seabrun Candy Hunter & Little Richard',
    url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3',
    description: 'The iconic track that defined an era',
    duration: 112,
  },
  {
    id: 'track-2',
    title: 'California I\'m Coming',
    artist: 'Seabrun Candy Hunter',
    url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3',
    description: 'A classic journey through California',
    duration: 245,
  },
];

export default function RadioStation() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loadingGenre, setLoadingGenre] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('R&B/Soul');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentFrequency, setCurrentFrequency] = useState(432);
  const [tunerVolume, setTunerVolume] = useState(70);
  const [showTuner, setShowTuner] = useState(false);

  // Load channels for selected genre
  useEffect(() => {
    const loadChannels = async () => {
      if (selectedCategory === 'All' || selectedCategory === 'Operators') {
        setChannels(FALLBACK_CHANNELS.map(c => ({
          id: c.id,
          title: c.name,
          url: c.streamUrl,
          genre: c.category,
        })));
        return;
      }

      setLoadingGenre(selectedCategory);
      try {
        const stations = await getCuratedStationsByGenre(selectedCategory);
        if (stations.length > 0) {
          setChannels(stations.map(s => ({
            id: s.id,
            title: s.title,
            url: s.url,
            genre: s.genre,
            country: s.country,
            city: s.city,
            favicon: s.favicon,
          })));
        } else {
          setChannels(FALLBACK_CHANNELS.map(c => ({
            id: c.id,
            title: c.name,
            url: c.streamUrl,
            genre: c.category,
          })));
        }
      } catch (err) {
        console.error('Failed to load channels:', err);
        setChannels(FALLBACK_CHANNELS.map(c => ({
          id: c.id,
          title: c.name,
          url: c.streamUrl,
          genre: c.category,
        })));
      } finally {
        setLoadingGenre(null);
      }
    };

    loadChannels();
  }, [selectedCategory]);

  // Search for stations
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      // Reload current category
      const stations = await getCuratedStationsByGenre(selectedCategory);
      setChannels(stations.length > 0 ? stations.map(s => ({
        id: s.id,
        title: s.title,
        url: s.url,
        genre: s.genre,
        country: s.country,
        city: s.city,
        favicon: s.favicon,
      })) : FALLBACK_CHANNELS.map(c => ({
        id: c.id,
        title: c.name,
        url: c.streamUrl,
        genre: c.category,
      })));
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchRadioStations(query);
      if (results.length > 0) {
        setChannels(results.map(s => ({
          id: s.id,
          title: s.title,
          url: s.url,
          genre: s.genre,
          country: s.country,
          city: s.city,
          favicon: s.favicon,
        })));
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Set first channel when channels load
  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0]);
    }
  }, [channels, selectedChannel]);

  const handleToggleFavorite = (channelId: string) => {
    setFavorites(prev =>
      prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  return (
    <>
      <PageMeta
        title="RRB Radio Station - Global Live Streams"
        description="Stream thousands of live radio stations from around the world with Radio Garden integration"
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Radio className="w-8 h-8 text-purple-400" />
              <h1 className="text-4xl font-bold text-white">RRB Radio Station</h1>
            </div>
            <p className="text-gray-300">Powered by Radio Garden • Global stations • Live streaming</p>
          </div>

          {/* Vintage Radio Tuner Toggle */}
          <div className="mb-6 flex justify-center">
            <button
              onClick={() => setShowTuner(!showTuner)}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-lg transition-all shadow-lg"
            >
              {showTuner ? 'Hide Vintage Tuner' : 'Show Vintage Tuner'}
            </button>
          </div>

          {/* Vintage Radio Tuner */}
          {showTuner && (
            <div className="mb-8 bg-slate-800 rounded-lg p-6">
              <VintageRadioTuner
                onFrequencyChange={(freq) => setCurrentFrequency(freq)}
                onVolumeChange={(vol) => setTunerVolume(vol)}
              />
              <div className="mt-4 p-4 bg-slate-700 rounded-lg text-center">
                <p className="text-amber-300 font-mono text-sm">Current Frequency: {currentFrequency} Hz - Volume: {tunerVolume}%</p>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search stations by genre or name..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 text-white rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none"
              />
              {isSearching && <Loader className="absolute right-3 top-3 w-5 h-5 text-purple-400 animate-spin" />}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setSearchQuery('');
                }}
                disabled={loadingGenre === category}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                } ${loadingGenre === category ? 'opacity-50 cursor-wait' : ''}`}
              >
                {loadingGenre === category ? (
                  <span className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    {category}
                  </span>
                ) : (
                  category
                )}
              </button>
            ))}
          </div>

          {/* Loading indicator */}
          {loadingGenre && (
            <div className="mb-6 p-4 bg-blue-900/30 border border-blue-600/50 rounded-lg">
              <p className="text-blue-200 text-sm flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Loading {loadingGenre} stations from Radio Garden...
              </p>
            </div>
          )}

          {/* Main Player */}
          <div className="mb-8">
            {selectedChannel ? (
              <>
                <div className="bg-slate-800 rounded-lg p-6 mb-4">
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedChannel.title}</h2>
                  <p className="text-gray-300 mb-4">{selectedChannel.genre}</p>
                  {selectedChannel.country && (
                    <p className="text-sm text-gray-400">📍 {selectedChannel.city}, {selectedChannel.country}</p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleToggleFavorite(selectedChannel.id)}
                      className={`px-4 py-2 rounded-lg ${
                        favorites.includes(selectedChannel.id)
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      {favorites.includes(selectedChannel.id) ? '❤️ Favorited' : '🔍 Add to Favorites'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-slate-800 rounded-lg p-6 text-center">
                <p className="text-gray-400">Loading station...</p>
              </div>
            )}
          </div>

          {/* Available Channels */}
          {channels.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span>📻</span> Available Stations ({channels.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {channels.map((channel, idx) => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedChannel?.id === channel.id
                        ? 'border-purple-500 bg-purple-900/50'
                        : 'border-slate-700 bg-slate-800 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white line-clamp-2">{channel.title}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(channel.id);
                        }}
                        className="text-lg flex-shrink-0"
                      >
                        {favorites.includes(channel.id) ? '❤️' : '🔍'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 mb-2 line-clamp-2">{channel.genre}</p>
                    {channel.country && (
                      <p className="text-xs text-gray-500 mb-2">📍 {channel.city}, {channel.country}</p>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-300">Live Stream</span>
                      {idx < RANK_BADGES.length && <span>{RANK_BADGES[idx]}</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {channels.length === 0 && !loadingGenre && (
            <div className="mb-8 p-6 bg-slate-800 rounded-lg text-center">
              <p className="text-gray-400">No stations found. Try a different genre or search term.</p>
            </div>
          )}

          {/* Featured Channels */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Featured Channels</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FALLBACK_CHANNELS.map(channel => (
                <div
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel as any)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedChannel?.id === channel.id
                      ? 'border-purple-500 bg-purple-900/50'
                      : 'border-slate-700 bg-slate-800 hover:border-purple-500/50'
                  }`}
                >
                  <h3 className="font-semibold text-white mb-2">{channel.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">{channel.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-300">{channel.category}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(channel.id);
                      }}
                      className="text-lg"
                    >
                      {favorites.includes(channel.id) ? '❤️' : '🔍'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commercials */}
          <RadioCommercials />

          {/* Seasonal Campaigns */}
          <SeasonalCampaigns />

          {/* HybridCast Widget */}
          <HybridCastWidgetContainer />
        </div>
      </div>
    </>
  );
}
