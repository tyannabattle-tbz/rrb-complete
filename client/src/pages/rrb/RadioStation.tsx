'use client';

import { useState, useMemo } from 'react';
import { PageMeta } from '@/components/rrb/PageMeta';
import { RadioPlayer, Track } from '@/components/rrb/RadioPlayer';
import { HybridCastWidgetContainer } from '@/components/rrb/HybridCastWidgetContainer';
import RadioCommercials from '@/components/rrb/RadioCommercials';
import SeasonalCampaigns from '@/components/rrb/SeasonalCampaigns';
import { trpc } from '@/lib/trpc';
import { ChevronDown, Search, X } from 'lucide-react';

// 50+ Professional Channels
const ALL_CHANNELS = [
  // Music Channels (12)
  { id: 'rock', name: 'Rock Legends', category: 'Music', description: 'Classic and modern rock' },
  { id: 'jazz', name: 'Jazz Masters', category: 'Music', description: 'Smooth jazz and bebop' },
  { id: 'soul', name: 'Soul & R&B', category: 'Music', description: 'Soul, funk, and R&B classics' },
  { id: 'classical', name: 'Classical Symphonies', category: 'Music', description: 'Classical masterpieces' },
  { id: 'electronic', name: 'Electronic Vibes', category: 'Music', description: 'Electronic and synth' },
  { id: 'hiphop', name: 'Hip-Hop Culture', category: 'Music', description: 'Hip-hop and rap' },
  { id: 'pop', name: 'Pop Hits', category: 'Music', description: 'Contemporary pop music' },
  { id: 'country', name: 'Country Roads', category: 'Music', description: 'Country and Americana' },
  { id: 'blues', name: 'Blues Heritage', category: 'Music', description: 'Blues and soul blues' },
  { id: 'reggae', name: 'Reggae Rhythms', category: 'Music', description: 'Reggae and dancehall' },
  { id: 'latin', name: 'Latin Grooves', category: 'Music', description: 'Latin, salsa, and more' },
  { id: 'world', name: 'World Music', category: 'Music', description: 'Global music traditions' },

  // Talk & Community (10)
  { id: 'news', name: 'News & Current Affairs', category: 'Talk', description: 'Breaking news and analysis' },
  { id: 'interviews', name: 'Interviews & Stories', category: 'Talk', description: 'In-depth interviews' },
  { id: 'local', name: 'Local Community', category: 'Talk', description: 'Local news and events' },
  { id: 'podcasts', name: 'Podcast Network', category: 'Talk', description: 'Featured podcasts' },
  { id: 'storytelling', name: 'Storytelling Hour', category: 'Talk', description: 'Stories and narratives' },
  { id: 'education', name: 'Learning Center', category: 'Talk', description: 'Educational content' },
  { id: 'wellness', name: 'Wellness & Health', category: 'Talk', description: 'Health and wellness' },
  { id: 'spirituality', name: 'Spirituality & Faith', category: 'Talk', description: 'Spiritual content' },
  { id: 'arts', name: 'Arts & Culture', category: 'Talk', description: 'Arts and cultural topics' },
  { id: 'business', name: 'Business & Entrepreneurship', category: 'Talk', description: 'Business insights' },

  // 24/7 Streams (5)
  { id: 'healing', name: 'Healing Frequencies', category: '24/7', description: 'Solfeggio healing music' },
  { id: 'meditation', name: 'Meditation & Mindfulness', category: '24/7', description: 'Guided meditation' },
  { id: 'ambient', name: 'Ambient Soundscapes', category: '24/7', description: 'Ambient and atmospheric' },
  { id: 'sleep', name: 'Sleep & Relaxation', category: '24/7', description: 'Sleep music and sounds' },
  { id: 'focus', name: 'Focus & Productivity', category: '24/7', description: 'Concentration music' },

  // Operator Channels (8)
  { id: 'canryn', name: 'Canryn Productions', category: 'Operators', description: 'Canryn Production content' },
  { id: 'sweet-miracles', name: 'Sweet Miracles', category: 'Operators', description: 'Sweet Miracles nonprofit' },
  { id: 'legacy', name: 'Legacy Restored', category: 'Operators', description: 'Legacy preservation' },
  { id: 'studio', name: 'Studio Sessions', category: 'Operators', description: 'Live studio recordings' },
  { id: 'qmunity', name: 'QMunity', category: 'Operators', description: 'Community powered content' },
  { id: 'proof', name: 'Proof Vault', category: 'Operators', description: 'Archival documentation' },
  { id: 'music-radio', name: 'Music & Radio', category: 'Operators', description: 'Music and radio content' },
  { id: 'community', name: 'Community Voices', category: 'Operators', description: 'Community broadcasts' },

  // Special Events (6)
  { id: 'live-events', name: 'Live Events', category: 'Events', description: 'Live event broadcasts' },
  { id: 'conferences', name: 'Conferences & Summits', category: 'Events', description: 'Conference coverage' },
  { id: 'emergency', name: 'Emergency Broadcast', category: 'Events', description: 'HybridCast emergency' },
  { id: 'festivals', name: 'Music Festivals', category: 'Events', description: 'Festival coverage' },
  { id: 'workshops', name: 'Workshops & Training', category: 'Events', description: 'Educational workshops' },
  { id: 'archives', name: 'Archives & Classics', category: 'Events', description: 'Historical archives' },
];

const CATEGORIES = ['All', 'Music', 'Talk', '24/7', 'Operators', 'Events'];

function formatPlayCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return count.toLocaleString();
}

const RANK_BADGES = ['🥇', '🥈', '🥉', '⭐'] as const;
const RANK_LABELS = ['#1 Most Played', '#2 Most Played', '#3 Most Played', 'Trending'] as const;
const BAR_WIDTHS = ['92%', '78%', '65%', '58%'] as const;

export default function RadioStation() {
  const [activeTab, setActiveTab] = useState<'radio-station' | 'rrb-radio'>('radio-station');
  const [selectedChannel, setSelectedChannel] = useState(ALL_CHANNELS[0]);
  const [showChannelSelector, setShowChannelSelector] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch tracks from database
  const { data: dbTracks } = trpc.radioContent.getTracks.useQuery();
  const { data: streamingChannels } = trpc.radioContent.getStreamingStatus.useQuery();
  const { data: playlists } = trpc.radioContent.getPlaylists.useQuery();
  const { data: playCountData } = trpc.audio.getPlayCounts.useQuery();

  // Filter channels based on category and search
  const filteredChannels = useMemo(() => {
    return ALL_CHANNELS.filter(channel => {
      const matchesCategory = selectedCategory === 'All' || channel.category === selectedCategory;
      const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           channel.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Curated playlist of Seabrun and Helen's music + Poetry Station (fallback)
  const fallbackTracks: Track[] = [
    {
      id: '1',
      title: 'Rockin\' Rockin\' Boogie',
      artist: 'Seabrun Candy Hunter & Little Richard',
      url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3',
      description: 'The iconic track that defined an era - 1970s soul and funk (Official Audio)',
      duration: 112,
    },
    {
      id: '2',
      title: 'California I\'m Coming',
      artist: 'Seabrun Candy Hunter',
      url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
      description: 'Limited edition unreleased track from 1975',
      duration: 240,
    },
    {
      id: '3',
      title: 'I Saw What You Did',
      artist: 'Seabrun Candy Hunter',
      url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
      description: 'Seabrun Candy Hunter original composition',
      duration: 210,
    },
    {
      id: '4',
      title: 'Voicemail to C.J. Battle from Dad',
      artist: 'Seabrun Candy Hunter',
      url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
      description: 'A heartfelt personal message to his grandson',
      duration: 89,
    },
    {
      id: '5',
      title: 'Can-Ryn Production Inc. - A Corporation with the Right Stuff',
      artist: 'Seabrun Candy Hunter',
      url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
      description: 'Overview of Can-Ryn Production and its six specialized subsidiaries',
      duration: 180,
    },
    {
      id: '6',
      title: 'Rare Photo of Candy and Richard at Piano',
      artist: 'Seabrun Candy Hunter',
      url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
      description: 'Candy shares gratitude for a rare photo and requests more for her book project',
      duration: 45,
    },
    {
      id: '7',
      title: 'Book Release Timeline Update',
      artist: 'Seabrun Candy Hunter',
      url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
      description: 'Candy provides an update on her book project timeline',
      duration: 38,
    },
    {
      id: '8',
      title: 'Piano Strings and Touring Memories',
      artist: 'Seabrun Candy Hunter',
      url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
      description: 'Candy shares anecdotes about traveling with Little Richard and his playing style',
      duration: 52,
    },
    {
      id: '9',
      title: 'Morning Glory Gospel',
      artist: 'RRB Gospel Choir',
      url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
      description: 'Uplifting gospel music',
      duration: 245,
    },
    {
      id: '10',
      title: 'Soul Revival',
      artist: 'Carlos Battle Legacy',
      url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
      description: 'Soulful revival music',
      duration: 312,
    },
    {
      id: '11',
      title: 'Healing Frequency 432Hz',
      artist: 'QUMUS Wellness',
      url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
      description: 'Healing frequency music',
      duration: 1800,
    },
    {
      id: '12',
      title: 'Healing Frequency 528Hz',
      artist: 'QUMUS Wellness',
      url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
      description: 'Healing frequency music',
      duration: 1800,
    },
    {
      id: '13',
      title: 'Rockin Boogie Shuffle',
      artist: 'RRB All-Stars',
      url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
      description: 'Upbeat boogie shuffle',
      duration: 198,
    },
    {
      id: '14',
      title: 'Sweet Miracles Theme',
      artist: 'Canryn Production',
      url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
      description: 'Sweet Miracles theme music',
      duration: 180,
    },
    {
      id: '15',
      title: 'Late Night Blues',
      artist: 'RRB Blues Band',
      url: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
      description: 'Late night blues music',
      duration: 360,
    },
  ];

  const tracks = dbTracks || fallbackTracks;
  const topTracks = tracks.slice(0, 4);
  const playlistsData = playlists || [];
  const channelsData = streamingChannels || [];

  const playlistsWithKeys = useMemo(() => {
    return (playlistsData || []).map((p, idx) => ({
      ...p,
      _uniqueKey: `playlist-${idx}-${Date.now()}`
    }));
  }, [playlistsData]);

  const channelsWithKeys = useMemo(() => {
    return (channelsData || []).map((c, idx) => ({
      ...c,
      _uniqueKey: `channel-${idx}-${Date.now()}`
    }));
  }, [channelsData]);

  return (
    <>
      <PageMeta title="Radio Station" description="RRB Radio with 50+ channels" />
      
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
              onClick={() => setActiveTab('rrb-radio')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'rrb-radio'
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🎙️ All Channels
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
                          key={cat}
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
                          key={channel.id}
                          onClick={() => {
                            setSelectedChannel(channel);
                            setShowChannelSelector(false);
                          }}
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

              {/* Radio Player */}
              <div className="mb-8">
                <RadioPlayer tracks={tracks} />
              </div>

              {/* Top Tracks */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">📊 Top Tracks</h2>
                <div className="grid gap-4">
                  {topTracks.map((track, idx) => (
                    <div key={`top-track-${idx}-${track.id}`} className="bg-slate-800/50 p-4 rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{RANK_BADGES[idx]}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{track.title}</h3>
                          <p className="text-sm text-slate-400">{track.artist}</p>
                        </div>
                        <span className="text-slate-400">{formatPlayCount(0)} plays</span>
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
              <h2 className="text-3xl font-bold text-white mb-8">🎙️ All Channels</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ALL_CHANNELS.map((channel, idx) => (
                  <button
                    key={`channel-${idx}-${channel.id}`}
                    onClick={() => {
                      setSelectedChannel(channel);
                      setActiveTab('radio-station');
                    }}
                    className="bg-gradient-to-br from-purple-600/20 to-orange-600/20 hover:from-purple-600/40 hover:to-orange-600/40 border border-purple-500/30 p-6 rounded-lg transition-all text-left"
                  >
                    <div className="font-semibold text-white text-lg mb-2">{channel.name}</div>
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
