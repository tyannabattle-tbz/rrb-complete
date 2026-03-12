import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { RRBSongBadge } from '@/components/RRBSongBadge';
import { useLocation } from 'wouter';
import {
  Play, Pause, SkipForward, Volume2, VolumeX, Radio, Heart,
  Share2, Users, Music, Headphones, Wifi, Earth, ArrowRight,
  Calendar, MapPin, Phone, FileText, Search, ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRestreamUrl } from '@/hooks/useRestreamUrl';
import { useRadio } from '@/contexts/RadioContext';
import { trpc } from '@/lib/trpc';

// Genre categories for filtering
const GENRE_FILTERS = [
  'All', 'Music', 'Talk', 'AI-Curated', 'Wellness',
  'Education', 'Entertainment', 'Specialty', 'Community'
];

// Icon map for channels based on genre/name
const CHANNEL_ICONS: Record<string, string> = {
  'RRB Main Radio': '📻', 'Music Discovery': '🔍', 'Gospel & Praise': '🙏',
  'Smooth Jazz Lounge': '🎷', 'Hip-Hop Classics': '🎤', 'Neo-Soul': '🛋️',
  'Reggae & Dancehall': '🦁', 'Afrobeats Global': '🥁', 'Blues Highway': '🎸',
  'Classical Serenity': '🎻', 'Latin Rhythms': '💃', 'Country Crossroads': '🤠',
  'Electronic Pulse': '⚡', 'Rock Legends': '🎸', 'Worship & Devotional': '⛪',
  'Caribbean Vibes': '🏝️', 'Women in Music': '👩‍🎤', 'Indie & Underground': '🎵',
  'World Fusion': '🌐', 'Throwback Radio': '📼', 'Love Songs': '💕',
  'C.J. Battle Radio': '🎤', 'Podcast Network': '🎙️', 'Sports Talk': '🏈',
  'News & Current Affairs': '📰', 'Seraph AI Radio': '🤖', 'Candy AI Radio': '🍬',
  'Valanna AI Radio': '🧠', 'Drop Radio 432Hz': '🧘', 'Meditation & Mindfulness': '🕉️',
  'Health & Wellness': '💚', 'Workout & Energy': '💪', 'Sleep & Relaxation': '🌙',
  'Business & Finance': '💼', 'Science & Technology': '🔬', 'Education & Learning': '📚',
  'Audiobook Stream': '📖', 'Kids & Family': '👨‍👩‍👧‍👦', 'Spoken Word & Poetry': '📝',
  'Comedy Central': '😂', 'Drama & Theater': '🎭', 'Anime & Gaming': '🎮',
  'Gaming Battle Arena': '🕹️', 'HybridCast Emergency': '🚨', 'Ty Battle Live': '🎙️',
  'Canryn Production': '🎬', 'Dragon Frequencies': '🐉', 'Legacy Archives': '🏛️',
  'Community Voice': '📞', 'Sweet Miracles': '🍬', 'Open Mic': '🎤',
  'SQUADD Coalition Radio': '👑', 'UN Advocacy Radio': '🌍', 'Canryn Production Radio': '🏢',
};

// Color map for channels
const CHANNEL_COLORS: Record<string, string> = {
  'RRB Main Radio': 'from-purple-600 to-blue-600', 'Music Discovery': 'from-violet-500 to-purple-600',
  'Gospel & Praise': 'from-pink-600 to-rose-600', 'Smooth Jazz Lounge': 'from-indigo-600 to-violet-600',
  'Hip-Hop Classics': 'from-red-600 to-orange-600', 'Neo-Soul': 'from-fuchsia-600 to-purple-700',
  'Reggae & Dancehall': 'from-yellow-600 to-green-700', 'Afrobeats Global': 'from-green-500 to-emerald-600',
  'Blues Highway': 'from-blue-800 to-indigo-900', 'Classical Serenity': 'from-amber-300 to-yellow-500',
  'Latin Rhythms': 'from-red-500 to-orange-500', 'Country Crossroads': 'from-amber-600 to-yellow-700',
  'Electronic Pulse': 'from-cyan-400 to-blue-500', 'Rock Legends': 'from-red-700 to-gray-800',
  'Worship & Devotional': 'from-sky-600 to-blue-700', 'Caribbean Vibes': 'from-cyan-500 to-green-500',
  'Women in Music': 'from-fuchsia-500 to-pink-600', 'Indie & Underground': 'from-zinc-600 to-slate-700',
  'World Fusion': 'from-teal-500 to-green-600', 'Throwback Radio': 'from-orange-500 to-amber-600',
  'Love Songs': 'from-rose-500 to-pink-600', 'C.J. Battle Radio': 'from-blue-600 to-cyan-500',
  'Podcast Network': 'from-red-500 to-pink-600', 'Sports Talk': 'from-green-600 to-teal-600',
  'News & Current Affairs': 'from-gray-600 to-slate-700', 'Seraph AI Radio': 'from-violet-600 to-purple-700',
  'Candy AI Radio': 'from-pink-500 to-fuchsia-600', 'Valanna AI Radio': 'from-indigo-500 to-blue-600',
  'Drop Radio 432Hz': 'from-green-600 to-emerald-600', 'Meditation & Mindfulness': 'from-emerald-500 to-teal-600',
  'Health & Wellness': 'from-teal-500 to-cyan-600', 'Workout & Energy': 'from-orange-500 to-red-500',
  'Sleep & Relaxation': 'from-indigo-700 to-purple-800', 'Business & Finance': 'from-slate-600 to-gray-700',
  'Science & Technology': 'from-blue-500 to-cyan-600', 'Education & Learning': 'from-green-500 to-teal-500',
  'Audiobook Stream': 'from-amber-400 to-orange-500', 'Kids & Family': 'from-pink-400 to-purple-400',
  'Spoken Word & Poetry': 'from-slate-600 to-gray-700', 'Comedy Central': 'from-yellow-400 to-orange-400',
  'Drama & Theater': 'from-red-700 to-rose-800', 'Anime & Gaming': 'from-purple-500 to-pink-500',
  'Gaming Battle Arena': 'from-green-600 to-cyan-600', 'HybridCast Emergency': 'from-red-700 to-red-900',
  'Ty Battle Live': 'from-orange-600 to-amber-600', 'Canryn Production': 'from-amber-500 to-orange-600',
  'Dragon Frequencies': 'from-emerald-600 to-teal-700', 'Legacy Archives': 'from-yellow-600 to-orange-600',
  'Community Voice': 'from-blue-600 to-indigo-700', 'Sweet Miracles': 'from-pink-500 to-fuchsia-600',
  'Open Mic': 'from-amber-400 to-yellow-500', 'SQUADD Coalition Radio': 'from-purple-600 to-fuchsia-700',
  'UN Advocacy Radio': 'from-blue-700 to-indigo-800', 'Canryn Production Radio': 'from-amber-600 to-orange-700',
};

// C.J. Battle artist links
const CJ_BATTLE_LINKS = {
  appleMusicUrl: 'https://music.apple.com/us/artist/c-j-battle/1438716457',
  spotifyUrl: 'https://open.spotify.com/artist/2kFnLPBd40yxliDHZZpAPy',
  soundcloudUrl: 'https://soundcloud.com/cjbttle',
  tidalUrl: 'https://tidal.com/artist/10464604',
  deezerUrl: 'https://www.deezer.com/en/artist/52608732',
  youtubeUrl: 'https://www.youtube.com/channel/UCR_UZEE4FkpCR9THocyutkQ',
  instagramUrl: 'https://www.instagram.com/c.j.battle/',
};

// Now Playing defaults (will be replaced by real data when available)
const NOW_PLAYING: Record<string, string> = {
  'RRB Main Radio': 'Community Hour with Sweet Miracles',
  'C.J. Battle Radio': 'C.J. Battle — OLD SOUL',
  'Seraph AI Radio': 'Seraph Selection',
  'Candy AI Radio': 'Candy Legacy Mix',
  'Valanna AI Radio': "Valanna's Evening Selection",
  'HybridCast Emergency': 'All Clear — No Active Alerts',
};

interface ChannelData {
  id: number;
  name: string;
  genre: string;
  frequency: string;
  streamUrl: string;
  fallbackUrl?: string;
  metadata?: Record<string, any>;
  icon: string;
  color: string;
  description: string;
  category: string;
  listeners: number;
  nowPlaying: string;
  isArtistStation?: boolean;
  coverImage?: string;
}

function mapDbChannelToLocal(dbCh: any): ChannelData {
  const meta = dbCh.metadata || {};
  return {
    id: dbCh.id,
    name: dbCh.name,
    genre: dbCh.genre || 'General',
    frequency: dbCh.frequency || '432 Hz',
    streamUrl: dbCh.streamUrl,
    fallbackUrl: meta.fallbackUrl || undefined,
    metadata: meta,
    icon: meta.icon || CHANNEL_ICONS[dbCh.name] || '📻',
    color: CHANNEL_COLORS[dbCh.name] || 'from-gray-600 to-gray-700',
    description: meta.description || dbCh.name,
    category: meta.category || 'Music',
    listeners: dbCh.currentListeners || Math.floor(Math.random() * 150) + 20,
    nowPlaying: NOW_PLAYING[dbCh.name] || `Now Playing on ${dbCh.name}`,
    isArtistStation: dbCh.name === 'C.J. Battle Radio',
    coverImage: undefined,
  };
}

export const RRBRadioIntegration: React.FC = () => {
  const [, navigate] = useLocation();
  const { openRestream } = useRestreamUrl();
  const { radio, play: globalPlay, pause: globalPause, setVolume: globalSetVolume, toggleMute: globalToggleMute } = useRadio();

  // Load channels from database API
  const { data: dbChannels, isLoading } = trpc.ecosystemIntegration.getAllChannels.useQuery(undefined, {
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  // Map database channels to local format
  const channels: ChannelData[] = useMemo(() => {
    if (!dbChannels || dbChannels.length === 0) return [];
    return dbChannels.map(mapDbChannelToLocal);
  }, [dbChannels]);

  const [selectedChannel, setSelectedChannel] = useState<ChannelData | null>(null);
  const isPlaying = radio.isPlaying;
  const volume = radio.volume;
  const isMuted = radio.isMuted;
  const audioError = radio.errorMessage || null;
  const [totalListeners, setTotalListeners] = useState(3847);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showAllFilters, setShowAllFilters] = useState(false);

  // Set initial channel once data loads
  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      if (radio.channel) {
        const found = channels.find(c => c.id === radio.channel!.id);
        if (found) { setSelectedChannel(found); return; }
      }
      setSelectedChannel(channels[0]);
    }
  }, [channels, selectedChannel, radio.channel]);

  // Sync selected channel from global context
  useEffect(() => {
    if (radio.channel && channels.length > 0) {
      const found = channels.find(c => c.id === radio.channel!.id);
      if (found && found.id !== selectedChannel?.id) {
        setSelectedChannel(found);
      }
    }
  }, [radio.channel, channels]);

  // Filtered channels
  const filteredChannels = useMemo(() => {
    return channels.filter(ch => {
      const matchesFilter = activeFilter === 'All' || ch.category === activeFilter;
      const matchesSearch = searchQuery === '' ||
        ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [channels, activeFilter, searchQuery]);

  // Listener count simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalListeners(prev => Math.max(2500, prev + Math.floor(Math.random() * 21) - 10));
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleChannelSelect = useCallback((channel: ChannelData) => {
    setSelectedChannel(channel);
    if (isPlaying) {
      globalPlay(channel);
    }
  }, [isPlaying, globalPlay]);

  const handlePlayPause = useCallback(() => {
    if (!selectedChannel) return;
    if (isPlaying) {
      globalPause();
    } else {
      globalPlay(selectedChannel);
    }
  }, [isPlaying, selectedChannel, globalPlay, globalPause]);

  const handleNextChannel = useCallback(() => {
    if (!selectedChannel || channels.length === 0) return;
    const currentIndex = channels.findIndex(c => c.id === selectedChannel.id);
    const nextChannel = channels[(currentIndex + 1) % channels.length];
    handleChannelSelect(nextChannel);
  }, [selectedChannel, channels, handleChannelSelect]);

  if (isLoading || !selectedChannel) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#E8E0D0] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#D4A843] animate-spin mx-auto mb-4" />
          <p className="text-[#E8E0D0]/60">Loading RRB Radio channels...</p>
        </div>
      </div>
    );
  }

  const isArtistStation = selectedChannel.name === 'C.J. Battle Radio';

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E8E0D0]">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-[#D4A843]/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A2E] via-[#0A0A0A] to-[#1A3A5C]/20" />
        <div className="relative container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <Radio className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#D4A843]">RRB Radio</h1>
              <p className="text-[#E8E0D0]/60">Rockin' Rockin' Boogie &bull; Payten Music (BMI) &bull; Canryn Production</p>
              <div className="mt-1"><RRBSongBadge variant="inline" /></div>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#E8E0D0]/50 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-[#D4A843]" /> {channels.length} Channels
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#D4A843]" /> {totalListeners.toLocaleString()} Listeners
            </span>
            <span className="flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-green-500" /> 24/7 Live
            </span>
            <span className="flex items-center gap-1.5">
              <Music className="w-4 h-4 text-[#D4A843]" /> 432 Hz Default
            </span>
          </div>
        </div>
      </div>

      {/* Now Playing Bar */}
      <div className="bg-[#111] border-b border-[#D4A843]/10 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayPause}
                className="w-14 h-14 rounded-full bg-[#D4A843] hover:bg-[#E8C860] transition-colors flex items-center justify-center text-[#0A0A0A] flex-shrink-0"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </button>
              <button onClick={handleNextChannel} className="w-10 h-10 rounded-full bg-[#222] hover:bg-[#333] flex items-center justify-center text-[#E8E0D0]/60" aria-label="Next channel">
                <SkipForward className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedChannel.icon}</span>
                  <h2 className="text-xl font-bold text-[#E8E0D0]">{selectedChannel.name}</h2>
                  {isPlaying && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse text-xs">
                      LIVE
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-[#E8E0D0]/50">
                  {selectedChannel.genre} &bull; {selectedChannel.frequency} &bull; {selectedChannel.nowPlaying}
                </p>
                {audioError && <p className="text-xs text-amber-400 mt-1">{audioError}</p>}
                {isArtistStation && (
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <a href={CJ_BATTLE_LINKS.appleMusicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity">
                      <Music className="w-3.5 h-3.5" /> Apple Music
                    </a>
                    <a href={CJ_BATTLE_LINKS.spotifyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity">
                      <Headphones className="w-3.5 h-3.5" /> Spotify
                    </a>
                    <a href={CJ_BATTLE_LINKS.soundcloudUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity">
                      <Wifi className="w-3.5 h-3.5" /> SoundCloud
                    </a>
                    <a href={CJ_BATTLE_LINKS.tidalUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-gradient-to-r from-slate-700 to-slate-800 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity">
                      <Music className="w-3.5 h-3.5" /> TIDAL
                    </a>
                    <a href={CJ_BATTLE_LINKS.deezerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-violet-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity">
                      <Music className="w-3.5 h-3.5" /> Deezer
                    </a>
                    <a href={CJ_BATTLE_LINKS.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity">
                      <Play className="w-3.5 h-3.5" /> YouTube
                    </a>
                    <a href={CJ_BATTLE_LINKS.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity">
                      <Heart className="w-3.5 h-3.5" /> Instagram
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button onClick={() => globalToggleMute()} className="text-[#E8E0D0]/60 hover:text-[#E8E0D0]">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range" min="0" max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => { globalSetVolume(parseInt(e.target.value)); }}
                  className="w-24 h-1 accent-[#D4A843]"
                />
              </div>
              <span className="text-xs text-[#E8E0D0]/40 flex items-center gap-1">
                <Headphones className="w-3.5 h-3.5" /> {selectedChannel.listeners}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#0D0D0D] border-b border-[#D4A843]/10">
        <div className="container mx-auto px-4 py-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E8E0D0]/30" />
            <input
              type="text"
              placeholder={`Search ${channels.length} channels by name, genre, or description...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#111] border border-[#222] rounded-lg text-[#E8E0D0] placeholder-[#E8E0D0]/30 focus:border-[#D4A843]/50 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(showAllFilters ? GENRE_FILTERS : GENRE_FILTERS.slice(0, 6)).map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-[#D4A843] text-[#0A0A0A]'
                    : 'bg-[#111] text-[#E8E0D0]/60 border border-[#222] hover:border-[#D4A843]/30'
                }`}
              >
                {filter}
              </button>
            ))}
            <button
              onClick={() => setShowAllFilters(!showAllFilters)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#111] text-[#D4A843] border border-[#D4A843]/30 hover:bg-[#D4A843]/10 flex items-center gap-1"
            >
              {showAllFilters ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> {GENRE_FILTERS.length - 6} More</>}
            </button>
          </div>
        </div>
      </div>

      {/* Channel Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#D4A843]">
            {activeFilter === 'All' ? 'All Channels' : activeFilter}
            <span className="text-sm font-normal text-[#E8E0D0]/40 ml-2">({filteredChannels.length})</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChannels.map(channel => (
            <button
              key={channel.id}
              onClick={() => handleChannelSelect(channel)}
              className={`text-left p-5 rounded-lg border transition-all ${
                selectedChannel.id === channel.id
                  ? 'bg-[#D4A843]/10 border-[#D4A843]/50'
                  : 'bg-[#111] border-[#222] hover:border-[#D4A843]/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${channel.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {channel.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[#E8E0D0]">{channel.name}</h3>
                    {selectedChannel.id === channel.id && isPlaying && (
                      <div className="flex gap-0.5">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-1 bg-[#D4A843] rounded-full animate-pulse" style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[#D4A843]/70 mb-1">{channel.genre} &bull; {channel.frequency}</p>
                  <p className="text-xs text-[#E8E0D0]/40 line-clamp-2">{channel.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[#E8E0D0]/30">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {channel.listeners}</span>
                    <span className="italic truncate">{channel.nowPlaying}</span>
                  </div>
                  {channel.isArtistStation && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <a href={CJ_BATTLE_LINKS.appleMusicUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs bg-gradient-to-r from-pink-500 to-red-500 text-white px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity flex items-center gap-1">
                        <Music className="w-3 h-3" /> Apple
                      </a>
                      <a href={CJ_BATTLE_LINKS.spotifyUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity flex items-center gap-1">
                        <Music className="w-3 h-3" /> Spotify
                      </a>
                      <a href={CJ_BATTLE_LINKS.soundcloudUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity">
                        SC
                      </a>
                      <a href={CJ_BATTLE_LINKS.tidalUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs bg-slate-700 text-white px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity">
                        TIDAL
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
        {filteredChannels.length === 0 && (
          <div className="text-center py-12">
            <Radio className="w-12 h-12 text-[#E8E0D0]/20 mx-auto mb-4" />
            <p className="text-[#E8E0D0]/40">No channels match your search. Try a different filter or keyword.</p>
          </div>
        )}
      </div>

      {/* Frequency Info */}
      <div className="border-t border-[#D4A843]/10 bg-[#111]/50">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-[#D4A843] mb-6">Healing Frequencies</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { hz: '432 Hz', name: 'Universal Harmony', desc: 'Natural tuning — reduces anxiety, promotes calm' },
              { hz: '528 Hz', name: 'Love Frequency', desc: 'DNA repair, transformation, miracles' },
              { hz: '639 Hz', name: 'Connection', desc: 'Harmonizing relationships, communication' },
              { hz: '741 Hz', name: 'Awakening', desc: 'Intuition, problem solving, self-expression' },
            ].map(freq => (
              <div key={freq.hz} className="p-4 bg-[#0A0A0A] border border-[#D4A843]/10 rounded-lg">
                <p className="text-2xl font-bold text-[#D4A843] mb-1">{freq.hz}</p>
                <p className="text-sm font-semibold text-[#E8E0D0]/80 mb-1">{freq.name}</p>
                <p className="text-xs text-[#E8E0D0]/40">{freq.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Valanna & Call-In Section */}
      <div className="border-t border-[#D4A843]/10 bg-gradient-to-r from-purple-900/20 to-[#0A0A0A]">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-[#111] border border-purple-500/20 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm">V</div>
                <div>
                  <h3 className="font-bold text-[#E8E0D0]">Valanna AI</h3>
                  <p className="text-xs text-purple-400">QUMUS-Powered Voice Assistant</p>
                </div>
              </div>
              <p className="text-sm text-[#E8E0D0]/60 mb-4">
                Valanna guides your experience across the entire Canryn Production ecosystem — from RRB Radio to HybridCast emergency broadcasts.
              </p>
              <Button className="bg-purple-600 hover:bg-purple-500 text-white w-full" onClick={() => navigate('/flyer')}>
                <FileText className="w-4 h-4 mr-2" /> Open Interactive Flyer
              </Button>
            </div>
            <div className="p-6 bg-[#111] border border-[#D4A843]/20 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="w-8 h-8 text-[#D4A843]" />
                <div>
                  <h3 className="font-bold text-[#E8E0D0]">Call-In Line</h3>
                  <p className="text-xs text-[#D4A843]/70">Live Feedback & Interaction</p>
                </div>
              </div>
              <p className="text-sm text-[#E8E0D0]/60 mb-4">
                Join the conversation live during broadcasts. Share your story, ask questions, or send a shout-out.
              </p>
              <Button variant="outline" className="border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/10 w-full" onClick={openRestream}>
                <Wifi className="w-4 h-4 mr-2" /> Join Live Broadcast
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="border-t border-[#D4A843]/10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button className="bg-[#D4A843] text-[#0A0A0A] hover:bg-[#E8C860]" onClick={openRestream}>
              <Radio className="w-4 h-4 mr-2" /> Live Stream
            </Button>
            <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10" onClick={() => navigate('/flyer')}>
              <Share2 className="w-4 h-4 mr-2" /> Interactive Flyer
            </Button>
            <Button variant="outline" className="border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/10" onClick={() => navigate('/selma')}>
              <MapPin className="w-4 h-4 mr-2" /> Selma Event
            </Button>
            <Button variant="outline" className="border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/10" onClick={() => navigate('/squadd')}>
              <Earth className="w-4 h-4 mr-2" /> SQUADD Goals
            </Button>
            <Button variant="outline" className="border-[#E8E0D0]/20 text-[#E8E0D0]/60 hover:bg-[#E8E0D0]/10" onClick={() => navigate('/')}>
              <ArrowRight className="w-4 h-4 mr-2" /> Ecosystem Home
            </Button>
          </div>
          <p className="text-center text-xs text-[#E8E0D0]/30 mt-6">
            Payten Music (BMI) &bull; Canryn Production &bull; QUMUS Autonomous Engine &bull; In Honor of Seabrun Candy Hunter
          </p>
          <p className="text-center text-xs text-[#E8E0D0]/20 mt-2">
            All content is protected under applicable copyright laws. Unauthorized reproduction or distribution is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RRBRadioIntegration;
