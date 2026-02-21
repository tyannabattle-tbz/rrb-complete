'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Heart, Play, Pause, Volume2, Search, TrendingUp } from 'lucide-react';
import { CHANNELS } from '@/shared/channels';
import { listenerCountService, type ChannelListeners } from '@/lib/listenerCountService';
import { favoritesService } from '@/lib/favoritesService';
import { useAudioPlayback } from '@/hooks/useAudioPlayback';

export default function RadioStationFixed() {
  const [selectedChannel, setSelectedChannel] = useState(CHANNELS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [listenerCounts, setListenerCounts] = useState<Map<string, ChannelListeners>>(new Map());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Use audio playback hook
  const audio = useAudioPlayback();

  // Initialize services
  useEffect(() => {
    listenerCountService.startUpdates();
    favoritesService.subscribe(setFavorites);
    
    const unsubscribe = listenerCountService.subscribe(setListenerCounts);

    return () => {
      listenerCountService.stopUpdates();
      unsubscribe();
    };
  }, []);

  // Filter channels
  const filteredChannels = CHANNELS.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         channel.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || channel.category === selectedCategory;
    const matchesFavorites = !showFavoritesOnly || favorites.has(channel.id);
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  // Get trending channels
  const trendingChannels = listenerCountService.getTrendingChannels(5);

  // Get top channels
  const topChannels = listenerCountService.getTopChannels(5);

  const handlePlayPause = async () => {
    if (selectedChannel.streams[0]) {
      audio.togglePlayPause(selectedChannel.streams[0]);
    }
  };

  const handleChannelSelect = (channel: typeof CHANNELS[0]) => {
    setSelectedChannel(channel);
    // Auto-play when channel is selected
    if (channel.streams[0]) {
      audio.play(channel.streams[0]);
    }
  };

  const handleToggleFavorite = (channelId: string) => {
    favoritesService.toggleFavorite(channelId);
  };

  const categories = ['All', 'Music', 'Talk', '24/7 Streams', 'Operator', 'Special Events'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">🎙️ RRB Radio Station</h1>
          <p className="text-purple-200">40+ channels • Live streaming • 24/7 availability</p>
        </div>

        {/* Now Playing */}
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 p-6 mb-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-purple-100">Now Playing</p>
              <h2 className="text-3xl font-bold">{selectedChannel.name}</h2>
              <p className="text-purple-100">{selectedChannel.category} • {selectedChannel.subcategory}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-100">Listeners</p>
              <p className="text-3xl font-bold">
                {listenerCounts.get(selectedChannel.id)?.currentListeners || selectedChannel.listeners}
              </p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={handlePlayPause}
              className={`rounded-full w-16 h-16 flex items-center justify-center transition-all ${
                audio.isPlaying
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-white text-purple-600 hover:bg-purple-100'
              }`}
            >
              {audio.isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
            </Button>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={audio.volume}
                  onChange={(e) => audio.setVolume(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-purple-300 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm w-8">{audio.volume}%</span>
              </div>
            </div>

            <Button
              onClick={() => handleToggleFavorite(selectedChannel.id)}
              variant="ghost"
              className={`rounded-full w-12 h-12 flex items-center justify-center ${
                favorites.has(selectedChannel.id)
                  ? 'bg-red-500 text-white border-0'
                  : 'bg-white/20 text-white border-white/50'
              }`}
            >
              <Heart className="w-6 h-6" fill={favorites.has(selectedChannel.id) ? 'currentColor' : 'none'} />
            </Button>
          </div>

          {/* Error Message */}
          {audio.error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-3">
              <p className="text-sm text-red-200">⚠️ {audio.error}</p>
            </div>
          )}

          {/* Stream Info */}
          <div className="bg-black/30 rounded-lg p-3">
            <p className="text-xs text-purple-100">Stream URL</p>
            <p className="text-sm font-mono text-white break-all">{selectedChannel.streams[0]}</p>
          </div>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Top Channels */}
          <Card className="bg-slate-800 border-slate-700 p-4">
            <h3 className="text-white font-bold mb-3">🔥 Top Channels</h3>
            <div className="space-y-2">
              {topChannels.slice(0, 3).map(channel => (
                <div key={channel.channelId} className="flex justify-between text-sm">
                  <span className="text-gray-300">{channel.channelName}</span>
                  <span className="text-purple-400 font-bold">{channel.currentListeners.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Trending Channels */}
          <Card className="bg-slate-800 border-slate-700 p-4">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Trending
            </h3>
            <div className="space-y-2">
              {trendingChannels.slice(0, 3).map(channel => (
                <div key={channel.channelId} className="flex justify-between text-sm">
                  <span className="text-gray-300">{channel.channelName}</span>
                  <span className="text-green-400 font-bold">↑ {channel.currentListeners.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Favorites */}
          <Card className="bg-slate-800 border-slate-700 p-4">
            <h3 className="text-white font-bold mb-3">❤️ Favorites</h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Saved channels</span>
              <span className="text-2xl font-bold text-red-400">{favorites.size}</span>
            </div>
            <Button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              variant={showFavoritesOnly ? 'default' : 'outline'}
              className="w-full mt-3"
            >
              {showFavoritesOnly ? 'Show All' : 'Show Favorites'}
            </Button>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className={selectedCategory === category ? 'bg-purple-600' : 'bg-slate-800 border-slate-700 text-gray-300'}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChannels.map(channel => {
            const listeners = listenerCounts.get(channel.id);
            const currentListeners = listeners?.currentListeners || channel.listeners;
            const trend = listeners?.trend || 'stable';
            const isFavorite = favorites.has(channel.id);
            const isSelected = selectedChannel.id === channel.id;

            return (
              <Card
                key={channel.id}
                className={`bg-slate-800 border-slate-700 p-4 cursor-pointer transition-all hover:border-purple-500 ${
                  isSelected ? 'border-purple-500 ring-2 ring-purple-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{channel.icon}</span>
                    <div>
                      <h3 className="text-white font-bold">{channel.name}</h3>
                      <p className="text-xs text-gray-400">{channel.subcategory}</p>
                    </div>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(channel.id);
                    }}
                    variant="ghost"
                    className="p-0 h-auto"
                  >
                    <Heart
                      className="w-5 h-5"
                      fill={isFavorite ? 'currentColor' : 'none'}
                      color={isFavorite ? '#ef4444' : '#9ca3af'}
                    />
                  </Button>
                </div>

                <p className="text-sm text-gray-300 mb-3">{channel.description}</p>

                {/* Listener Count */}
                <div className="bg-slate-700 rounded-lg p-2 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Live Listeners</span>
                    <span className={`text-sm font-bold ${
                      trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-300'
                    }`}>
                      {currentListeners.toLocaleString()}
                      {trend === 'up' && ' ↑'}
                      {trend === 'down' && ' ↓'}
                    </span>
                  </div>
                </div>

                {/* Play Button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChannelSelect(channel);
                  }}
                  className={`w-full transition-all ${
                    isSelected && audio.isPlaying
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {isSelected && audio.isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </>
                  )}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* No Results */}
        {filteredChannels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No channels found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
