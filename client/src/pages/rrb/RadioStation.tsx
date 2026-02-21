
import React, { useState, useMemo } from 'react';
import { PageMeta } from '@/components/rrb/PageMeta';
import { RadioPlayer, Track } from '@/components/rrb/RadioPlayer';
import { HybridCastWidgetContainer } from '@/components/rrb/HybridCastWidgetContainer';
import RadioCommercials from '@/components/rrb/RadioCommercials';
import SeasonalCampaigns from '@/components/rrb/SeasonalCampaigns';
import { ChevronDown, Search, Radio, Play, Pause } from 'lucide-react';

// 40+ Professional Channels (26 verified SomaFM + 14 placeholders)
const ALL_CHANNELS = [
  // ============ VERIFIED SOMAFM CHANNELS (26) ============
  
  // Music Channels - Rock/Metal/Alternative
  { id: 'metal', name: 'Metal Mayhem', category: 'Music', description: 'Heavy metal and hard rock', streamUrl: 'https://ice1.somafm.com/metal-128-mp3' },
  { id: 'defcon', name: 'Defcon Radio', category: 'Music', description: 'Industrial and electronic', streamUrl: 'https://ice1.somafm.com/defcon-128-mp3' },
  { id: 'doomed', name: 'Doomed', category: 'Music', description: 'Doom, sludge, and stoner rock', streamUrl: 'https://ice1.somafm.com/doomed-128-mp3' },
  
  // Music Channels - Jazz/Soul/Funk
  { id: 'secretagent', name: 'Secret Agent', category: 'Music', description: 'Smooth jazz and spy music', streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3' },
  { id: 'groovesalad', name: 'Groove Salad', category: 'Music', description: 'Downtempo and soul grooves', streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3' },
  { id: 'lush', name: 'Lush', category: 'Music', description: 'Ambient and downtempo', streamUrl: 'https://ice1.somafm.com/lush-128-mp3' },
  
  // Music Channels - Electronic/Synth/Indie
  { id: 'poptron', name: 'Poptron', category: 'Music', description: 'Synth-pop and electronic', streamUrl: 'https://ice1.somafm.com/poptron-128-mp3' },
  { id: 'cliqhop', name: 'Cliq Hop', category: 'Music', description: 'Intelligent hip-hop and beats', streamUrl: 'https://ice1.somafm.com/cliqhop-128-mp3' },
  { id: 'beatblender', name: 'Beat Blender', category: 'Music', description: 'Electronic and experimental', streamUrl: 'https://ice1.somafm.com/beatblender-128-mp3' },
  { id: 'digitalis', name: 'Digitalis', category: 'Music', description: 'Digital and glitch music', streamUrl: 'https://ice1.somafm.com/digitalis-128-mp3' },
  { id: 'indiepop', name: 'Indie Pop', category: 'Music', description: 'Indie pop and alternative', streamUrl: 'https://ice1.somafm.com/indiepop-128-mp3' },
  
  // Music Channels - Folk/World/Reggae
  { id: 'folkfwd', name: 'Folk Forward', category: 'Music', description: 'Folk, Americana, and roots', streamUrl: 'https://ice1.somafm.com/folkfwd-128-mp3' },
  { id: 'reggae', name: 'Reggae Vibes', category: 'Music', description: 'Reggae and dancehall', streamUrl: 'https://ice1.somafm.com/reggae-128-mp3' },
  { id: 'illstreet', name: 'Ill Street', category: 'Music', description: 'Hip-hop and urban music', streamUrl: 'https://ice1.somafm.com/illstreet-128-mp3' },
  { id: 'bagel', name: 'Bagel Radio', category: 'Music', description: 'Jewish and world music', streamUrl: 'https://ice1.somafm.com/bagel-128-mp3' },
  
  // Music Channels - Experimental/Ambient
  { id: 'dronezone', name: 'Drone Zone', category: 'Music', description: 'Ambient drone and soundscapes', streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3' },
  { id: 'sonicuniverse', name: 'Sonic Universe', category: 'Music', description: 'Experimental and avant-garde', streamUrl: 'https://ice1.somafm.com/sonicuniverse-128-mp3' },
  { id: 'thetrip', name: 'The Trip', category: 'Music', description: 'Psychedelic and trippy music', streamUrl: 'https://ice1.somafm.com/thetrip-128-mp3' },
  { id: 'thistle', name: 'Thistle', category: 'Music', description: 'Celtic and world music', streamUrl: 'https://ice1.somafm.com/thistle-128-mp3' },
  
  // Talk & Community
  { id: 'missioncontrol', name: 'Mission Control', category: 'Talk', description: 'News and current affairs', streamUrl: 'https://ice1.somafm.com/missioncontrol-128-mp3' },
  { id: 'spacestation', name: 'Space Station', category: 'Talk', description: 'Science and exploration', streamUrl: 'https://ice1.somafm.com/spacestation-128-mp3' },
  { id: 'deepspaceone', name: 'Deep Space One', category: 'Talk', description: 'Space and astronomy', streamUrl: 'https://ice1.somafm.com/deepspaceone-128-mp3' },
  { id: 'suburbsofgoa', name: 'Suburbs of Goa', category: 'Talk', description: 'World music and culture', streamUrl: 'https://ice1.somafm.com/suburbsofgoa-128-mp3' },
  
  // Special Events/Archives
  { id: 'covers', name: 'Covers', category: 'Events', description: 'Cover songs and remixes', streamUrl: 'https://ice1.somafm.com/covers-128-mp3' },
  { id: 'u80s', name: 'Underground 80s', category: 'Events', description: 'Alternative 80s music', streamUrl: 'https://ice1.somafm.com/u80s-128-mp3' },
  { id: 'sf1033', name: 'SF 10/33', category: 'Events', description: 'San Francisco community radio', streamUrl: 'https://ice1.somafm.com/sf1033-128-mp3' },
  
  // ============ PLACEHOLDER CHANNELS FOR FUTURE RRB CONTENT (14) ============
  
  // Canryn Production Channels
  { id: 'canryn-main', name: 'Canryn Productions', category: 'Operators', description: 'Coming Soon: Canryn Production content', streamUrl: 'https://ice1.somafm.com/metal-128-mp3', placeholder: true },
  { id: 'canryn-live', name: 'Canryn Live', category: 'Operators', description: 'Coming Soon: Live Canryn broadcasts', streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3', placeholder: true },
  
  // Sweet Miracles Nonprofit
  { id: 'sweet-miracles', name: 'Sweet Miracles', category: 'Operators', description: 'Coming Soon: Sweet Miracles nonprofit', streamUrl: 'https://ice1.somafm.com/lush-128-mp3', placeholder: true },
  
  // Legacy & Archives
  { id: 'legacy-restored', name: 'Legacy Restored', category: 'Operators', description: 'Coming Soon: Legacy preservation and archives', streamUrl: 'https://ice1.somafm.com/thetrip-128-mp3', placeholder: true },
  { id: 'rrb-classics', name: 'RRB Classics', category: 'Operators', description: 'Coming Soon: Rockin\' Rockin\' Boogie classics', streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3', placeholder: true },
  
  // Studio & Production
  { id: 'studio-sessions', name: 'Studio Sessions', category: 'Operators', description: 'Coming Soon: Live studio recordings', streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3', placeholder: true },
  { id: 'production-lab', name: 'Production Lab', category: 'Operators', description: 'Coming Soon: Behind-the-scenes production', streamUrl: 'https://ice1.somafm.com/poptron-128-mp3', placeholder: true },
  
  // Community & Wellness
  { id: 'qmunity', name: 'QMunity', category: 'Operators', description: 'Coming Soon: Community-powered content', streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3', placeholder: true },
  { id: 'wellness-hub', name: 'Wellness Hub', category: '24/7', description: 'Coming Soon: Health and wellness content', streamUrl: 'https://ice1.somafm.com/lush-128-mp3', placeholder: true },
  { id: 'meditation-center', name: 'Meditation Center', category: '24/7', description: 'Coming Soon: Guided meditation and mindfulness', streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3', placeholder: true },
  
  // Healing & Frequencies
  { id: 'healing-frequencies', name: 'Healing Frequencies', category: '24/7', description: 'Coming Soon: Solfeggio and healing music', streamUrl: 'https://ice1.somafm.com/lush-128-mp3', placeholder: true },
  { id: 'frequency-lab', name: 'Frequency Lab', category: '24/7', description: 'Coming Soon: Experimental frequency research', streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3', placeholder: true },
  
  // Emergency & Special
  { id: 'emergency-broadcast', name: 'Emergency Broadcast', category: 'Events', description: 'Coming Soon: HybridCast emergency system', streamUrl: 'https://ice1.somafm.com/defcon-128-mp3', placeholder: true },
  { id: 'special-events', name: 'Special Events', category: 'Events', description: 'Coming Soon: Live events and festivals', streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3', placeholder: true },
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
  const [selectedChannel, setSelectedChannel] = useState(ALL_CHANNELS[0]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredChannels = useMemo(() => {
    return ALL_CHANNELS.filter(channel => {
      const matchesCategory = selectedCategory === 'All' || channel.category === selectedCategory;
      const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          channel.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleToggleFavorite = (channelId: string) => {
    setFavorites(prev =>
      prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const topChannels = useMemo(() => {
    return filteredChannels.slice(0, 5);
  }, [filteredChannels]);

  return (
    <>
      <PageMeta
        title="RRB Radio Station - 40+ Live Channels"
        description="Stream 40+ live radio channels including verified SomaFM streams and future RRB content"
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Radio className="w-8 h-8 text-purple-400" />
              <h1 className="text-4xl font-bold text-white">RRB Radio Station</h1>
            </div>
            <p className="text-gray-300">40+ channels • Live streaming • 24/7 availability</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 text-white rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Main Player */}
          <div className="mb-8">
            <RadioPlayer channel={selectedChannel} tracks={FALLBACK_TRACKS} />
            {selectedChannel.placeholder && (
              <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
                <p className="text-yellow-200 text-sm">
                  ℹ️ This channel is coming soon. Currently playing placeholder content.
                </p>
              </div>
            )}
          </div>

          {/* Top Channels */}
          {topChannels.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🔥</span> Top Channels
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {topChannels.map((channel, idx) => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel)}
                    className={`p-4 rounded-lg transition-all ${
                      selectedChannel.id === channel.id
                        ? 'bg-purple-600 ring-2 ring-purple-400'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-lg">{RANK_BADGES[idx]}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(channel.id);
                        }}
                        className="text-xl"
                      >
                        {favorites.includes(channel.id) ? '❤️' : '🤍'}
                      </button>
                    </div>
                    <h3 className="font-bold text-white text-left">{channel.name}</h3>
                    <p className="text-xs text-gray-400 text-left">{channel.category}</p>
                    {channel.placeholder && <p className="text-xs text-yellow-400 mt-1">Coming Soon</p>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* All Channels Grid */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">All Channels ({filteredChannels.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredChannels.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`p-4 rounded-lg transition-all text-left ${
                    selectedChannel.id === channel.id
                      ? 'bg-purple-600 ring-2 ring-purple-400'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-white flex-1">{channel.name}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(channel.id);
                      }}
                      className="text-lg ml-2"
                    >
                      {favorites.includes(channel.id) ? '❤️' : '🤍'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{channel.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-purple-900/50 px-2 py-1 rounded">{channel.category}</span>
                    {channel.placeholder && <span className="text-xs bg-yellow-900/50 px-2 py-1 rounded text-yellow-200">Coming Soon</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Commercials and Campaigns */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RadioCommercials />
            <SeasonalCampaigns />
          </div>

          {/* HybridCast Widget */}
          <div className="mt-12">
            <HybridCastWidgetContainer />
          </div>
        </div>
      </div>
    </>
  );
}
