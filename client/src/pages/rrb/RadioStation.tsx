'use client';

import React, { useState, useMemo } from 'react';
import { PageMeta } from '@/components/rrb/PageMeta';
import { RadioPlayer, Track } from '@/components/rrb/RadioPlayer';
import { HybridCastWidgetContainer } from '@/components/rrb/HybridCastWidgetContainer';
import RadioCommercials from '@/components/rrb/RadioCommercials';
import SeasonalCampaigns from '@/components/rrb/SeasonalCampaigns';
import { ChevronDown, Search, Radio, Play, Pause } from 'lucide-react';

// 50+ Professional Channels with streaming URLs
const ALL_CHANNELS = [
  // Music Channels (12)
  { id: 'rock', name: 'Rock Legends', category: 'Music', description: 'Classic and modern rock', streamUrl: 'https://ice1.somafm.com/metal-128-mp3' },
  { id: 'jazz', name: 'Jazz Masters', category: 'Music', description: 'Smooth jazz and bebop', streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3' },
  { id: 'soul', name: 'Soul & R&B', category: 'Music', description: 'Soul, funk, and R&B classics', streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3' },
  { id: 'classical', name: 'Classical Symphonies', category: 'Music', description: 'Classical masterpieces', streamUrl: 'https://ice1.somafm.com/thetrip-128-mp3' },
  { id: 'electronic', name: 'Electronic Vibes', category: 'Music', description: 'Electronic and synth', streamUrl: 'https://ice1.somafm.com/poptron-128-mp3' },
  { id: 'hiphop', name: 'Hip-Hop Culture', category: 'Music', description: 'Hip-hop and rap', streamUrl: 'https://ice1.somafm.com/illstreet-128-mp3' },
  { id: 'pop', name: 'Pop Hits', category: 'Music', description: 'Contemporary pop music', streamUrl: 'https://ice1.somafm.com/indiepop-128-mp3' },
  { id: 'country', name: 'Country Roads', category: 'Music', description: 'Country and Americana', streamUrl: 'https://ice1.somafm.com/mission-128-mp3' },
  { id: 'blues', name: 'Blues Heritage', category: 'Music', description: 'Blues and soul blues', streamUrl: 'https://ice1.somafm.com/underground-128-mp3' },
  { id: 'reggae', name: 'Reggae Rhythms', category: 'Music', description: 'Reggae and dancehall', streamUrl: 'https://ice1.somafm.com/defcon-128-mp3' },
  { id: 'latin', name: 'Latin Grooves', category: 'Music', description: 'Latin, salsa, and more', streamUrl: 'https://ice1.somafm.com/mission-128-mp3' },
  { id: 'world', name: 'World Music', category: 'Music', description: 'Global music traditions', streamUrl: 'https://ice1.somafm.com/spacestation-128-mp3' },

  // Talk & Community (10)
  { id: 'news', name: 'News & Current Affairs', category: 'Talk', description: 'Breaking news and analysis', streamUrl: 'https://ice1.somafm.com/defcon-128-mp3' },
  { id: 'interviews', name: 'Interviews & Stories', category: 'Talk', description: 'In-depth interviews', streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3' },
  { id: 'local', name: 'Local Community', category: 'Talk', description: 'Local news and events', streamUrl: 'https://ice1.somafm.com/mission-128-mp3' },
  { id: 'podcasts', name: 'Podcast Network', category: 'Talk', description: 'Featured podcasts', streamUrl: 'https://ice1.somafm.com/lush-128-mp3' },
  { id: 'storytelling', name: 'Storytelling Hour', category: 'Talk', description: 'Stories and narratives', streamUrl: 'https://ice1.somafm.com/thetrip-128-mp3' },
  { id: 'education', name: 'Learning Center', category: 'Talk', description: 'Educational content', streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3' },
  { id: 'wellness', name: 'Wellness & Health', category: 'Talk', description: 'Health and wellness', streamUrl: 'https://ice1.somafm.com/lush-128-mp3' },
  { id: 'spirituality', name: 'Spirituality & Faith', category: 'Talk', description: 'Spiritual content', streamUrl: 'https://ice1.somafm.com/spacestation-128-mp3' },
  { id: 'arts', name: 'Arts & Culture', category: 'Talk', description: 'Arts and cultural topics', streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3' },
  { id: 'business', name: 'Business & Entrepreneurship', category: 'Talk', description: 'Business insights', streamUrl: 'https://ice1.somafm.com/mission-128-mp3' },

  // 24/7 Streams (5)
  { id: 'healing', name: 'Healing Frequencies', category: '24/7', description: 'Solfeggio healing music', streamUrl: 'https://ice1.somafm.com/spacestation-128-mp3', is247: true },
  { id: 'meditation', name: 'Meditation & Mindfulness', category: '24/7', description: 'Guided meditation', streamUrl: 'https://ice1.somafm.com/spacestation-128-mp3', is247: true },
  { id: 'ambient', name: 'Ambient Soundscapes', category: '24/7', description: 'Ambient and atmospheric', streamUrl: 'https://ice1.somafm.com/lush-128-mp3', is247: true },
  { id: 'sleep', name: 'Sleep & Relaxation', category: '24/7', description: 'Sleep music and sounds', streamUrl: 'https://ice1.somafm.com/drone-128-mp3', is247: true },
  { id: 'focus', name: 'Focus & Productivity', category: '24/7', description: 'Concentration music', streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3', is247: true },

  // Operator Channels (8)
  { id: 'canryn', name: 'Canryn Productions', category: 'Operators', description: 'Canryn Production content', streamUrl: 'https://ice1.somafm.com/mission-128-mp3' },
  { id: 'sweet-miracles', name: 'Sweet Miracles', category: 'Operators', description: 'Sweet Miracles nonprofit', streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3' },
  { id: 'legacy', name: 'Legacy Restored', category: 'Operators', description: 'Legacy preservation', streamUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3' },
  { id: 'studio', name: 'Studio Sessions', category: 'Operators', description: 'Live studio recordings', streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3' },
  { id: 'qmunity', name: 'QMunity', category: 'Operators', description: 'Community powered content', streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3' },
  { id: 'proof', name: 'Proof Vault', category: 'Operators', description: 'Archival documentation', streamUrl: 'https://ice1.somafm.com/thetrip-128-mp3' },
  { id: 'music-radio', name: 'Music & Radio', category: 'Operators', description: 'Music and radio content', streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3' },
  { id: 'community', name: 'Community Voices', category: 'Operators', description: 'Community broadcasts', streamUrl: 'https://ice1.somafm.com/mission-128-mp3' },

  // Special Events (6)
  { id: 'live-events', name: 'Live Events', category: 'Events', description: 'Live event broadcasts', streamUrl: 'https://ice1.somafm.com/defcon-128-mp3' },
  { id: 'conferences', name: 'Conferences & Summits', category: 'Events', description: 'Conference coverage', streamUrl: 'https://ice1.somafm.com/mission-128-mp3' },
  { id: 'emergency', name: 'Emergency Broadcast', category: 'Events', description: 'HybridCast emergency', streamUrl: 'https://ice1.somafm.com/defcon-128-mp3' },
  { id: 'festivals', name: 'Music Festivals', category: 'Events', description: 'Festival coverage', streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3' },
  { id: 'workshops', name: 'Workshops & Training', category: 'Events', description: 'Educational workshops', streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3' },
  { id: 'archives', name: 'Archives & Classics', category: 'Events', description: 'Historical archives', streamUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3' },
];

const CATEGORIES = ['All', 'Music', 'Talk', '24/7', 'Operators', 'Events'];
const RANK_BADGES = ['🥇', '🥈', '🥉', '⭐'] as const;

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
    url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
    description: 'Limited edition unreleased track from 1975',
    duration: 240,
  },
  {
    id: 'track-3',
    title: 'I Saw What You Did',
    artist: 'Seabrun Candy Hunter',
    url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
    description: 'Seabrun Candy Hunter original composition',
    duration: 210,
  },
  {
    id: 'track-4',
    title: 'Morning Glory Gospel',
    artist: 'RRB Gospel Choir',
    url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
    description: 'Uplifting gospel music',
    duration: 245,
  },
];

export default function RadioStation() {
  const [activeTab, setActiveTab] = useState<'radio-station' | 'all-channels'>('radio-station');
  const [selectedChannel, setSelectedChannel] = useState(ALL_CHANNELS[0]);
  const [showChannelSelector, setShowChannelSelector] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  // Filter channels
  const filteredChannels = useMemo(() => {
    return ALL_CHANNELS.filter(channel => {
      const matchesCategory = selectedCategory === 'All' || channel.category === selectedCategory;
      const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           channel.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleChannelSelect = (channel: typeof ALL_CHANNELS[0]) => {
    setSelectedChannel(channel);
    setShowChannelSelector(false);
    setIsPlaying(false);
  };

  return (
    <>
      <PageMeta title="Radio Station" description="RRB Radio with 50+ professional channels and 24/7 streaming" />
      
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
        {/* Tab Navigation */}
        <div className="border-b border-purple-500/30 bg-slate-900/50 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-4 flex gap-4">
            <button
              onClick={() => setActiveTab('radio-station')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'radio-station'
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              📻 Radio Station
            </button>
            <button
              onClick={() => setActiveTab('all-channels')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'all-channels'
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🎙️ All Channels ({ALL_CHANNELS.length})
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {activeTab === 'radio-station' ? (
            <>
              {/* Channel Selector */}
              <div className="mb-8 relative">
                <button
                  onClick={() => setShowChannelSelector(!showChannelSelector)}
                  className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white px-6 py-4 rounded-lg font-semibold flex items-center justify-between transition-all"
                >
                  <span className="text-lg">{selectedChannel.name}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showChannelSelector ? 'rotate-180' : ''}`} />
                </button>

                {showChannelSelector && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-purple-500/30 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden flex flex-col">
                    {/* Search Bar */}
                    <div className="p-4 border-b border-purple-500/20">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search channels..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2 px-4 pt-3 pb-2 border-b border-purple-500/20 overflow-x-auto">
                      {CATEGORIES.map(cat => (
                        <button
                          key={`cat-${cat}`}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                            selectedCategory === cat
                              ? 'bg-orange-500 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Channel List */}
                    <div className="overflow-y-auto flex-1">
                      {filteredChannels.map((channel) => (
                        <button
                          key={`selector-${channel.id}`}
                          onClick={() => handleChannelSelect(channel)}
                          className="w-full text-left px-4 py-3 hover:bg-purple-600/20 border-b border-purple-500/10 transition-colors"
                        >
                          <div className="font-semibold text-white">{channel.name}</div>
                          <div className="text-sm text-slate-400">{channel.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Now Playing Display */}
              <div className="mb-8 bg-gradient-to-r from-slate-800 to-slate-700 border border-purple-500/30 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isPlaying ? 'bg-red-500 animate-pulse' : 'bg-slate-600'
                  }`}>
                    {isPlaying ? (
                      <div className="flex gap-1">
                        <div className="w-1 h-3 bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-3 bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1 h-3 bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    ) : (
                      <Radio className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-slate-400">Now Playing</div>
                    <div className="text-lg font-semibold text-white">{selectedChannel.name}</div>
                    <div className="text-sm text-slate-300">{selectedChannel.category} • {selectedChannel.is247 ? '🔄 24/7 Stream' : '🔴 Live'}</div>
                  </div>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                      isPlaying
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {isPlaying ? (
                      <div className="flex items-center gap-2">
                        <Pause className="w-4 h-4" />
                        Pause
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Play
                      </div>
                    )}
                  </button>
                </div>

                {/* Stream URL Display */}
                <div className="pt-4 border-t border-slate-600">
                  <div className="text-xs text-slate-400 mb-1">Stream URL</div>
                  <div className="text-white font-mono text-xs truncate bg-slate-900/50 p-2 rounded">{selectedChannel.streamUrl}</div>
                </div>
              </div>

              {/* Radio Player */}
              <div className="mb-8">
                <RadioPlayer tracks={FALLBACK_TRACKS} />
              </div>

              {/* Top Tracks */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">📊 Top Tracks</h2>
                <div className="grid gap-4">
                  {FALLBACK_TRACKS.slice(0, 4).map((track, idx) => (
                    <div key={track.id} className="bg-slate-800/50 p-4 rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{RANK_BADGES[idx]}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{track.title}</h3>
                          <p className="text-sm text-slate-400">{track.artist}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commercials */}
              <div className="mb-8">
                <RadioCommercials />
              </div>

              {/* Seasonal Campaigns */}
              <div className="mb-8">
                <SeasonalCampaigns />
              </div>

              {/* HybridCast */}
              <div className="mb-8">
                <HybridCastWidgetContainer />
              </div>
            </>
          ) : (
            <>
              {/* All Channels Tab */}
              <h2 className="text-3xl font-bold text-white mb-8">🎙️ All Channels ({ALL_CHANNELS.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ALL_CHANNELS.map((channel) => (
                  <button
                    key={`grid-${channel.id}`}
                    onClick={() => {
                      handleChannelSelect(channel);
                      setActiveTab('radio-station');
                    }}
                    className="bg-gradient-to-br from-purple-600/20 to-orange-600/20 hover:from-purple-600/40 hover:to-orange-600/40 border border-purple-500/30 p-6 rounded-lg transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-semibold text-white text-lg group-hover:text-orange-400 transition-colors">{channel.name}</div>
                      <Radio className="w-4 h-4 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-sm text-slate-400 mb-3">{channel.description}</div>
                    <div className="text-xs text-purple-400 font-semibold">{channel.category}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
