'use client';

import React, { useState, useMemo } from 'react';
import { CHANNELS } from '@/shared/channels';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Play, Pause, Volume2, VolumeX, Eye, EyeOff, Radio, Music, Mic } from 'lucide-react';

export default function RadioStationEnhanced() {
  const [selectedChannelId, setSelectedChannelId] = useState('music-rock');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showDJMonitor, setShowDJMonitor] = useState(false);
  const [showListenerView, setShowListenerView] = useState(false);

  const audioPlayer = useAudioPlayer();

  // Get selected channel
  const selectedChannel = useMemo(() => {
    return CHANNELS.find(ch => ch.id === selectedChannelId);
  }, [selectedChannelId]);

  // Filter channels
  const filteredChannels = useMemo(() => {
    let filtered = CHANNELS;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(ch => ch.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        ch =>
          ch.name.toLowerCase().includes(query) ||
          ch.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(CHANNELS.map(ch => ch.category));
    return ['All', ...Array.from(cats)];
  }, []);

  // Handle channel selection and play
  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId);
    const channel = CHANNELS.find(ch => ch.id === channelId);
    if (channel && channel.streams[0]) {
      audioPlayer.play(channel.streams[0], {
        title: channel.name,
        artist: channel.subcategory,
        channelId: channel.id,
        channelName: channel.name,
        duration: 0,
      });
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📻 Radio Station</h1>
          <p className="text-slate-400">Stream 40+ channels with live DJ shows and 24/7 broadcasts</p>
        </div>

        {/* Now Playing */}
        {audioPlayer.currentTrack && (
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/50 rounded-lg p-6 mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Radio className="w-6 h-6 text-orange-400 animate-pulse" />
                  Now Playing
                </h2>
                <div className="mt-2">
                  <div className="text-xl font-semibold text-white">{audioPlayer.currentTrack.title}</div>
                  <div className="text-sm text-slate-400">{audioPlayer.currentTrack.artist}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDJMonitor(!showDJMonitor)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    showDJMonitor
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                  title="DJ Monitor - Hear your stream before going live"
                >
                  <Mic className="w-4 h-4 inline mr-2" />
                  DJ Monitor
                </button>
                <button
                  onClick={() => setShowListenerView(!showListenerView)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    showListenerView
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                  title="Listener View - See what listeners hear"
                >
                  {showListenerView ? <EyeOff className="w-4 h-4 inline mr-2" /> : <Eye className="w-4 h-4 inline mr-2" />}
                  Listener View
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-slate-400">{formatTime(audioPlayer.currentTime)}</span>
                <div className="flex-1 bg-slate-700 rounded-full h-2 cursor-pointer" onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  audioPlayer.seek(percent * (audioPlayer.duration || 0));
                }}>
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${audioPlayer.duration ? (audioPlayer.currentTime / audioPlayer.duration) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-slate-400">{formatTime(audioPlayer.duration || 0)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={audioPlayer.togglePlayPause}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                {audioPlayer.isPlaying ? (
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

              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <button
                  onClick={audioPlayer.toggleMute}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
                >
                  {audioPlayer.isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={audioPlayer.volume}
                  onChange={(e) => audioPlayer.setVolume(parseFloat(e.target.value))}
                  className="w-24 h-2 bg-slate-700 rounded-full appearance-none cursor-pointer"
                />
              </div>

              {/* Stream URL */}
              <div className="ml-auto text-right">
                <div className="text-xs text-slate-500 mb-1">Stream URL</div>
                <div className="text-xs text-slate-400 font-mono truncate max-w-xs">
                  {audioPlayer.currentTrack.streamUrl}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DJ Monitor View */}
        {showDJMonitor && audioPlayer.currentTrack && (
          <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">🎙️ DJ Monitor Preview</h3>
            <p className="text-slate-400 mb-4">
              This is what you're broadcasting to listeners. Use this to verify audio quality before going live.
            </p>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-sm text-slate-400 mb-2">Broadcasting to listeners:</div>
              <div className="text-white font-semibold">{audioPlayer.currentTrack.channelName}</div>
              <div className="text-sm text-slate-400 mt-2">Status: {audioPlayer.isPlaying ? '🔴 LIVE' : '⏸️ PAUSED'}</div>
            </div>
          </div>
        )}

        {/* Listener View */}
        {showListenerView && audioPlayer.currentTrack && (
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">👥 Listener View</h3>
            <p className="text-slate-400 mb-4">
              This is exactly what listeners are hearing right now on {audioPlayer.currentTrack.channelName}.
            </p>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-400">Now Playing</div>
                  <div className="text-white font-semibold">{audioPlayer.currentTrack.title}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Playback Status</div>
                  <div className="text-white font-semibold">{audioPlayer.isPlaying ? '▶️ Playing' : '⏸️ Paused'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Current Time</div>
                  <div className="text-white font-semibold">{formatTime(audioPlayer.currentTime)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Volume</div>
                  <div className="text-white font-semibold">{Math.round(audioPlayer.volume * 100)}%</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-purple-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
          />

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChannels.map(channel => (
            <button
              key={channel.id}
              onClick={() => handleChannelSelect(channel.id)}
              className={`p-4 rounded-lg transition-all text-left ${
                selectedChannelId === channel.id
                  ? 'ring-2 ring-orange-500 bg-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-2xl">{channel.icon}</div>
                <div className="text-xs text-slate-400">{channel.category}</div>
              </div>
              <h3 className="font-semibold text-white mb-1">{channel.name}</h3>
              <p className="text-sm text-slate-400 mb-3">{channel.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{channel.listeners.toLocaleString()} listeners</span>
                <span>{channel.isLive ? '🔴 Live' : '⏸️ Offline'}</span>
              </div>
            </button>
          ))}
        </div>

        {filteredChannels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No channels found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
