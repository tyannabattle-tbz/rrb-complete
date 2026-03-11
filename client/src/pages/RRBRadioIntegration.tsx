import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import {
  Play, Pause, SkipForward, Volume2, VolumeX, Radio, Heart,
  Share2, Users, Music, Headphones, Wifi, Globe, ArrowRight,
  Calendar, MapPin, Phone, FileText, Search, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRestreamUrl } from '@/hooks/useRestreamUrl';

// Genre categories for filtering
const GENRE_FILTERS = [
  'All', 'Flagship', 'Gospel & Worship', 'Healing & Meditation', 'Talk & Community',
  'Jazz, Soul & Blues', 'R&B & Hip-Hop', 'African Diaspora & Caribbean',
  'Classics & Legacy', 'Kids & Family', 'Late Night & Chill', 'Podcast & Special'
];

// RRB Radio — 42 Channels: Industry-leading lineup for Canryn Production
const channels = [
  // === FLAGSHIP ===
  { id: 1, name: 'RRB Main', icon: '📻', genre: 'Mixed', frequency: '432 Hz', color: 'from-purple-600 to-blue-600', description: 'Flagship channel — music, talk, community voices. The heartbeat of Canryn Production.', streamUrl: 'https://ice5.somafm.com/groovesalad-128-mp3', listeners: 127, nowPlaying: 'Community Hour with Sweet Miracles', category: 'Flagship' },
  { id: 2, name: 'RRB Gold', icon: '✨', genre: 'Mixed', frequency: '432 Hz', color: 'from-yellow-500 to-amber-600', description: 'Premium curated mix — the best of RRB across all genres, hand-picked by QUMUS.', streamUrl: 'https://ice5.somafm.com/secretagent-128-mp3', listeners: 215, nowPlaying: 'QUMUS Gold Hour', category: 'Flagship' },
  { id: 3, name: "Valanna's Pick", icon: '🤖', genre: 'Mixed', frequency: '432 Hz', color: 'from-violet-600 to-purple-700', description: 'AI-curated by Valanna — she picks what the community needs to hear right now.', streamUrl: 'https://ice5.somafm.com/lush-128-mp3', listeners: 183, nowPlaying: "Valanna's Evening Selection", category: 'Flagship' },
  // === GOSPEL & WORSHIP ===
  { id: 4, name: 'Gospel Hour', icon: '🙏', genre: 'Gospel', frequency: '528 Hz', color: 'from-pink-600 to-rose-600', description: 'Uplifting gospel and spiritual music. The Love Frequency at 528 Hz.', streamUrl: 'https://ice5.somafm.com/covers-128-mp3', listeners: 84, nowPlaying: 'Sunday Morning Praise', category: 'Gospel & Worship' },
  { id: 5, name: 'Praise & Worship', icon: '🕊️', genre: 'Worship', frequency: '528 Hz', color: 'from-sky-500 to-blue-600', description: 'Contemporary worship, praise anthems, and devotional music for the spirit.', streamUrl: 'https://ice5.somafm.com/covers-128-mp3', listeners: 72, nowPlaying: 'Worship Flow', category: 'Gospel & Worship' },
  { id: 6, name: 'Country Gospel', icon: '🤠', genre: 'Country Gospel', frequency: '432 Hz', color: 'from-amber-600 to-yellow-700', description: 'Where faith meets the countryside — gospel with country soul.', streamUrl: 'https://ice5.somafm.com/folkfwd-128-mp3', listeners: 41, nowPlaying: 'Country Chapel Hour', category: 'Gospel & Worship' },
  { id: 7, name: 'Gospel Classics', icon: '⛪', genre: 'Gospel', frequency: '432 Hz', color: 'from-rose-700 to-red-800', description: 'Timeless gospel from Mahalia Jackson to Kirk Franklin. The roots of praise.', streamUrl: 'https://ice5.somafm.com/covers-128-mp3', listeners: 63, nowPlaying: 'Classic Gospel Greats', category: 'Gospel & Worship' },
  // === HEALING & MEDITATION ===
  { id: 8, name: 'Healing Frequencies', icon: '🧘', genre: 'Meditation', frequency: '432 Hz', color: 'from-green-600 to-emerald-600', description: 'Solfeggio frequencies — 432 Hz, 528 Hz, 639 Hz healing tones for mind and body.', streamUrl: 'https://ice5.somafm.com/dronezone-128-mp3', listeners: 203, nowPlaying: '432 Hz Deep Healing Session', category: 'Healing & Meditation' },
  { id: 9, name: '528 Hz Love', icon: '💚', genre: 'Meditation', frequency: '528 Hz', color: 'from-emerald-500 to-teal-600', description: 'Pure 528 Hz Love Frequency — DNA repair, transformation, miracles.', streamUrl: 'https://ice5.somafm.com/dronezone-128-mp3', listeners: 156, nowPlaying: '528 Hz Miracle Tones', category: 'Healing & Meditation' },
  { id: 10, name: '639 Hz Connection', icon: '🔗', genre: 'Meditation', frequency: '639 Hz', color: 'from-teal-500 to-cyan-600', description: 'Harmonizing relationships and communication. The frequency of connection.', streamUrl: 'https://ice5.somafm.com/deepspaceone-128-mp3', listeners: 89, nowPlaying: '639 Hz Harmony Flow', category: 'Healing & Meditation' },
  { id: 11, name: '741 Hz Awakening', icon: '🌟', genre: 'Meditation', frequency: '741 Hz', color: 'from-cyan-500 to-blue-600', description: 'Intuition, problem solving, self-expression. Wake your higher self.', streamUrl: 'https://ice5.somafm.com/deepspaceone-128-mp3', listeners: 77, nowPlaying: '741 Hz Intuition Session', category: 'Healing & Meditation' },
  { id: 12, name: 'Sleep & Rest', icon: '🌙', genre: 'Meditation', frequency: '432 Hz', color: 'from-indigo-800 to-slate-900', description: 'Deep sleep sounds, binaural beats, and gentle frequencies for rest.', streamUrl: 'https://ice5.somafm.com/dronezone-128-mp3', listeners: 312, nowPlaying: 'Deep Sleep 432 Hz', category: 'Healing & Meditation' },
  { id: 13, name: 'Morning Meditation', icon: '🌅', genre: 'Meditation', frequency: '432 Hz', color: 'from-orange-400 to-pink-500', description: 'Start your day centered — guided meditations and calming frequencies.', streamUrl: 'https://ice5.somafm.com/dronezone-128-mp3', listeners: 94, nowPlaying: 'Sunrise Meditation', category: 'Healing & Meditation' },
  // === TALK & COMMUNITY ===
  { id: 14, name: 'Community Talk', icon: '🎙️', genre: 'Talk Radio', frequency: 'Standard', color: 'from-orange-600 to-amber-600', description: 'Elder advocacy, civil rights, community voices. SQUADD Goals discussions.', streamUrl: 'https://ice5.somafm.com/live-128-mp3', listeners: 56, nowPlaying: 'SQUADD Goals Roundtable', category: 'Talk & Community' },
  { id: 15, name: 'Sweet Miracles Radio', icon: '🍬', genre: 'Talk Radio', frequency: 'Standard', color: 'from-pink-500 to-fuchsia-600', description: 'Nonprofit spotlight — elder advocacy, grant updates, and community empowerment.', streamUrl: 'https://ice5.somafm.com/live-128-mp3', listeners: 38, nowPlaying: 'Elder Advocacy Hour', category: 'Talk & Community' },
  { id: 16, name: 'SQUADD Goals Live', icon: '🌍', genre: 'Talk Radio', frequency: 'Standard', color: 'from-blue-600 to-indigo-700', description: 'UN NGO coalition updates, Ghana partnership, and global community building.', streamUrl: 'https://ice5.somafm.com/live-128-mp3', listeners: 45, nowPlaying: 'CSW70 Prep Session', category: 'Talk & Community' },
  { id: 17, name: 'News & Current Events', icon: '📰', genre: 'News', frequency: 'Standard', color: 'from-gray-600 to-slate-700', description: 'Community news, civil rights updates, and current events that matter.', streamUrl: 'https://ice5.somafm.com/live-128-mp3', listeners: 67, nowPlaying: 'Evening News Roundup', category: 'Talk & Community' },
  { id: 18, name: 'Selma Stories', icon: '🏛️', genre: 'Spoken Word', frequency: 'Standard', color: 'from-red-700 to-rose-800', description: 'Oral histories from Selma, Alabama — civil rights, community, and legacy.', streamUrl: 'https://ice5.somafm.com/live-128-mp3', listeners: 29, nowPlaying: 'Voices of the Bridge', category: 'Talk & Community' },
  // === JAZZ, SOUL & BLUES ===
  { id: 19, name: 'Jazz & Soul', icon: '🎷', genre: 'Jazz', frequency: '432 Hz', color: 'from-indigo-600 to-violet-600', description: 'Classic jazz, R&B, and soul — the soundtrack of legacy.', streamUrl: 'https://ice5.somafm.com/fluid-128-mp3', listeners: 91, nowPlaying: 'Late Night Jazz Sessions', category: 'Jazz, Soul & Blues' },
  { id: 20, name: 'Smooth Jazz', icon: '🎺', genre: 'Jazz', frequency: '432 Hz', color: 'from-purple-500 to-indigo-600', description: 'Smooth jazz instrumentals for relaxation and focus. Saxophone dreams.', streamUrl: 'https://ice5.somafm.com/fluid-128-mp3', listeners: 108, nowPlaying: 'Smooth Sax Sessions', category: 'Jazz, Soul & Blues' },
  { id: 21, name: 'Blues Highway', icon: '🎸', genre: 'Blues', frequency: '432 Hz', color: 'from-blue-800 to-indigo-900', description: 'Delta blues to Chicago blues — the road that built American music.', streamUrl: 'https://ice5.somafm.com/bootliquor-128-mp3', listeners: 54, nowPlaying: 'Mississippi Delta Blues', category: 'Jazz, Soul & Blues' },
  { id: 22, name: 'Neo Soul Lounge', icon: '🛋️', genre: 'R&B', frequency: '432 Hz', color: 'from-fuchsia-600 to-purple-700', description: 'Erykah Badu to H.E.R. — neo soul vibes for the conscious mind.', streamUrl: 'https://ice5.somafm.com/7soul-128-mp3', listeners: 76, nowPlaying: 'Neo Soul Essentials', category: 'Jazz, Soul & Blues' },
  // === R&B & HIP-HOP ===
  { id: 23, name: 'R&B Classics', icon: '💜', genre: 'R&B', frequency: '432 Hz', color: 'from-purple-600 to-pink-600', description: 'Motown to modern R&B — love songs and slow jams across decades.', streamUrl: 'https://ice5.somafm.com/7soul-128-mp3', listeners: 119, nowPlaying: 'R&B Love Songs', category: 'R&B & Hip-Hop' },
  { id: 24, name: 'Hip-Hop Nation', icon: '🎤', genre: 'Hip-Hop', frequency: 'Standard', color: 'from-red-600 to-orange-600', description: 'From the Bronx to the world — classic and conscious hip-hop.', streamUrl: 'https://ice5.somafm.com/bagel-128-mp3', listeners: 142, nowPlaying: 'Conscious Hip-Hop Hour', category: 'R&B & Hip-Hop' },
  { id: 25, name: 'Old School Jams', icon: '🕺', genre: 'R&B', frequency: '432 Hz', color: 'from-orange-500 to-red-600', description: "70s, 80s, 90s — the golden era of funk, disco, and R&B.", streamUrl: 'https://ice5.somafm.com/secretagent-128-mp3', listeners: 97, nowPlaying: 'Funk & Disco Classics', category: 'R&B & Hip-Hop' },
  { id: 26, name: 'Spoken Word', icon: '📝', genre: 'Spoken Word', frequency: 'Standard', color: 'from-slate-600 to-gray-700', description: 'Poetry, storytelling, and spoken word performances. Words that move.', streamUrl: 'https://ice5.somafm.com/bagel-128-mp3', listeners: 33, nowPlaying: 'Open Mic Poetry', category: 'R&B & Hip-Hop' },
  // === AFRICAN DIASPORA & CARIBBEAN ===
  { id: 27, name: 'African Diaspora', icon: '🌍', genre: 'African Diaspora', frequency: '432 Hz', color: 'from-green-700 to-yellow-600', description: 'Music connecting Africa to the Americas — Afrobeat, highlife, and diaspora sounds.', streamUrl: 'https://ice5.somafm.com/suburbsofgoa-128-mp3', listeners: 65, nowPlaying: 'Afrobeat Essentials', category: 'African Diaspora & Caribbean' },
  { id: 28, name: 'Afrobeats Radio', icon: '🥁', genre: 'Afrobeats', frequency: '432 Hz', color: 'from-green-500 to-emerald-600', description: 'Burna Boy, Wizkid, Tems — the sound of modern Africa.', streamUrl: 'https://ice5.somafm.com/suburbsofgoa-128-mp3', listeners: 178, nowPlaying: 'Afrobeats Top Hits', category: 'African Diaspora & Caribbean' },
  { id: 29, name: 'Ghana Connection', icon: '🇬🇭', genre: 'African Diaspora', frequency: '432 Hz', color: 'from-red-600 to-yellow-500', description: 'Highlife, hiplife, and gospel from Ghana — honoring the SQUADD partnership.', streamUrl: 'https://ice5.somafm.com/suburbsofgoa-128-mp3', listeners: 42, nowPlaying: 'Ghanaian Highlife Classics', category: 'African Diaspora & Caribbean' },
  { id: 30, name: 'Caribbean Vibes', icon: '🏝️', genre: 'Caribbean', frequency: '432 Hz', color: 'from-cyan-500 to-green-500', description: 'Reggae, dancehall, soca, and calypso — island rhythms for the soul.', streamUrl: 'https://ice5.somafm.com/lush-128-mp3', listeners: 87, nowPlaying: 'Reggae Roots', category: 'African Diaspora & Caribbean' },
  { id: 31, name: 'Reggae Roots', icon: '🦁', genre: 'Reggae', frequency: '432 Hz', color: 'from-yellow-600 to-green-700', description: 'Bob Marley to Chronixx — roots reggae and conscious vibes.', streamUrl: 'https://ice5.somafm.com/lush-128-mp3', listeners: 73, nowPlaying: 'One Love Sessions', category: 'African Diaspora & Caribbean' },
  // === CLASSICS & LEGACY ===
  { id: 32, name: 'Legacy Classics', icon: '🎵', genre: 'Classics', frequency: '432 Hz', color: 'from-yellow-600 to-orange-600', description: 'Honoring Seabrun Candy Hunter — classic hits and memories.', streamUrl: 'https://ice5.somafm.com/sonicuniverse-128-mp3', listeners: 68, nowPlaying: 'Seabrun Hunter Legacy Mix', category: 'Classics & Legacy' },
  { id: 33, name: "Mama Valerie's Hour", icon: '👑', genre: 'Classics', frequency: '432 Hz', color: 'from-amber-400 to-amber-600', description: "Dedicated to Mama Valerie — her favorite songs, her spirit, her legacy.", streamUrl: 'https://ice5.somafm.com/sonicuniverse-128-mp3', listeners: 51, nowPlaying: "Mama's Favorites", category: 'Classics & Legacy' },
  { id: 34, name: 'Motown Memories', icon: '🎹', genre: 'Classics', frequency: '432 Hz', color: 'from-blue-600 to-purple-600', description: "The Temptations, Supremes, Stevie Wonder — Motown's greatest.", streamUrl: 'https://ice5.somafm.com/sonicuniverse-128-mp3', listeners: 82, nowPlaying: 'Motown Greatest Hits', category: 'Classics & Legacy' },
  // === KIDS & FAMILY ===
  { id: 35, name: 'Kids & Family', icon: '👨‍👩‍👧‍👦', genre: 'Kids & Family', frequency: '432 Hz', color: 'from-pink-400 to-purple-400', description: 'Family-friendly music, stories, and educational content for all ages.', streamUrl: 'https://ice5.somafm.com/indiepop-128-mp3', listeners: 44, nowPlaying: 'Storytime Adventures', category: 'Kids & Family' },
  { id: 36, name: 'Bedtime Stories', icon: '🌜', genre: 'Kids & Family', frequency: '432 Hz', color: 'from-indigo-700 to-purple-800', description: 'Gentle stories and lullabies to help little ones drift off to sleep.', streamUrl: 'https://ice5.somafm.com/dronezone-128-mp3', listeners: 37, nowPlaying: 'Goodnight Moon', category: 'Kids & Family' },
  // === LATE NIGHT & CHILL ===
  { id: 37, name: 'Late Night Vibes', icon: '🌃', genre: 'Late Night', frequency: '432 Hz', color: 'from-slate-800 to-indigo-900', description: 'After midnight — slow jams, chill beats, and quiet storm.', streamUrl: 'https://ice5.somafm.com/cliqhop-128-mp3', listeners: 134, nowPlaying: 'Quiet Storm', category: 'Late Night & Chill' },
  { id: 38, name: 'Lo-Fi Beats', icon: '🎧', genre: 'Lo-Fi', frequency: '432 Hz', color: 'from-slate-600 to-zinc-700', description: 'Lo-fi hip-hop beats for studying, working, and relaxing.', streamUrl: 'https://ice5.somafm.com/poptron-128-mp3', listeners: 201, nowPlaying: 'Lo-Fi Study Session', category: 'Late Night & Chill' },
  { id: 39, name: 'Chill & Focus', icon: '🎯', genre: 'Lo-Fi', frequency: '432 Hz', color: 'from-teal-600 to-emerald-700', description: 'Ambient and instrumental music for deep focus and productivity.', streamUrl: 'https://ice5.somafm.com/groovesalad-128-mp3', listeners: 167, nowPlaying: 'Focus Flow', category: 'Late Night & Chill' },
  // === PODCAST & SPECIAL ===
  { id: 40, name: 'RRB Podcast Network', icon: '🎙️', genre: 'Podcast', frequency: 'Standard', color: 'from-red-500 to-pink-600', description: 'Original podcasts from the Canryn Production family — interviews, stories, and more.', streamUrl: 'https://ice5.somafm.com/live-128-mp3', listeners: 58, nowPlaying: 'The Canryn Chronicles', category: 'Podcast & Special' },
  { id: 41, name: 'HybridCast Emergency', icon: '🚨', genre: 'News', frequency: 'Standard', color: 'from-red-700 to-red-900', description: 'Emergency broadcast channel — weather alerts, community safety, and disaster response.', streamUrl: 'https://ice5.somafm.com/defcon-128-mp3', listeners: 22, nowPlaying: 'All Clear — No Active Alerts', category: 'Podcast & Special' },
  { id: 42, name: 'Solbones Soundscapes', icon: '🎲', genre: 'Meditation', frequency: '432 Hz', color: 'from-amber-500 to-orange-600', description: 'Sacred math frequencies from the Solbones dice game — Solfeggio tones meet play.', streamUrl: 'https://ice5.somafm.com/digitalis-128-mp3', listeners: 31, nowPlaying: 'Solfeggio Dice Tones', category: 'Podcast & Special' },
  // === C.J. BATTLE ===
  { id: 43, name: 'C.J. Battle Radio', icon: '🎤', genre: 'Hip-Hop', frequency: '432 Hz', color: 'from-blue-600 to-cyan-500', description: 'C.J. Battle — OLD SOUL, Searching, TRIGONOMETRY and more. Most.High.Ova.Everything. Stream direct from Apple Music.', streamUrl: 'https://ice5.somafm.com/bagel-128-mp3', listeners: 89, nowPlaying: 'C.J. Battle — OLD SOUL', category: 'R&B & Hip-Hop', appleMusicUrl: 'https://music.apple.com/us/artist/c-j-battle/1438716457', spotifyUrl: 'https://open.spotify.com/artist/2kFnLPBd40yxliDHZZpAPy', isArtistStation: true },
];

export const RRBRadioIntegration: React.FC = () => {
  const [, navigate] = useLocation();
  const { openRestream } = useRestreamUrl();
  const [selectedChannel, setSelectedChannel] = useState(channels[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [totalListeners, setTotalListeners] = useState(3847);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showAllFilters, setShowAllFilters] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
  }, [activeFilter, searchQuery]);

  // Create audio element
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'none';
    audioRef.current = audio;

    audio.addEventListener('error', () => {
      setAudioError('Stream temporarily unavailable. Try another channel.');
      setIsPlaying(false);
    });
    audio.addEventListener('playing', () => setAudioError(null));

    return () => { audio.pause(); audio.src = ''; };
  }, []);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Listener count simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalListeners(prev => Math.max(2500, prev + Math.floor(Math.random() * 21) - 10));
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleChannelSelect = (channel: typeof channels[0]) => {
    const wasPlaying = isPlaying;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setSelectedChannel(channel);
    setAudioError(null);
    if (wasPlaying && audioRef.current) {
      audioRef.current.src = channel.streamUrl;
      audioRef.current.play().catch(() => {
        setAudioError('Tap play to start streaming');
        setIsPlaying(false);
      });
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setAudioError(null);
      audioRef.current.src = selectedChannel.streamUrl;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
        setAudioError('Unable to connect. Please try again.');
        setIsPlaying(false);
      });
    }
  };

  const handleNextChannel = () => {
    const currentIndex = channels.findIndex(c => c.id === selectedChannel.id);
    const nextChannel = channels[(currentIndex + 1) % channels.length];
    handleChannelSelect(nextChannel);
  };

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
              <p className="text-[#E8E0D0]/60">Rockin' Rockin' Boogie • Payten Music (BMI) • Canryn Production</p>
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
                  {selectedChannel.genre} • {selectedChannel.frequency} • {selectedChannel.nowPlaying}
                </p>
                {audioError && <p className="text-xs text-amber-400 mt-1">{audioError}</p>}
                {(selectedChannel as any).isArtistStation && (
                  <div className="flex items-center gap-3 mt-3">
                    {(selectedChannel as any).appleMusicUrl && (
                      <a href={(selectedChannel as any).appleMusicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
                        <Music className="w-4 h-4" /> Apple Music
                      </a>
                    )}
                    {(selectedChannel as any).spotifyUrl && (
                      <a href={(selectedChannel as any).spotifyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
                        <Headphones className="w-4 h-4" /> Spotify
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setIsMuted(!isMuted)} className="text-[#E8E0D0]/60 hover:text-[#E8E0D0]">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range" min="0" max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => { setVolume(parseInt(e.target.value)); setIsMuted(false); }}
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
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E8E0D0]/30" />
            <input
              type="text"
              placeholder="Search 50 channels by name, genre, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#111] border border-[#222] rounded-lg text-[#E8E0D0] placeholder-[#E8E0D0]/30 focus:border-[#D4A843]/50 focus:outline-none"
            />
          </div>
          {/* Genre Filters */}
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
                  <p className="text-xs text-[#D4A843]/70 mb-1">{channel.genre} • {channel.frequency}</p>
                  <p className="text-xs text-[#E8E0D0]/40 line-clamp-2">{channel.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[#E8E0D0]/30">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {channel.listeners}</span>
                    <span className="italic truncate">{channel.nowPlaying}</span>
                  </div>
                  {(channel as any).isArtistStation && (
                    <div className="flex items-center gap-2 mt-2">
                      {(channel as any).appleMusicUrl && (
                        <a href={(channel as any).appleMusicUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs bg-gradient-to-r from-pink-500 to-red-500 text-white px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity flex items-center gap-1">
                          <Music className="w-3 h-3" /> Apple Music
                        </a>
                      )}
                      {(channel as any).spotifyUrl && (
                        <a href={(channel as any).spotifyUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity flex items-center gap-1">
                          <Music className="w-3 h-3" /> Spotify
                        </a>
                      )}
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
                Valanna guides your experience across the entire Canryn Production ecosystem — from RRB Radio to HybridCast emergency broadcasts. She speaks, she listens, she delivers.
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
                Join the conversation live during broadcasts. Share your story, ask questions, or send a shout-out to the community. Your voice matters.
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
              <Globe className="w-4 h-4 mr-2" /> SQUADD Goals
            </Button>
            <Button variant="outline" className="border-[#E8E0D0]/20 text-[#E8E0D0]/60 hover:bg-[#E8E0D0]/10" onClick={() => navigate('/')}>
              <ArrowRight className="w-4 h-4 mr-2" /> Ecosystem Home
            </Button>
          </div>
          <p className="text-center text-xs text-[#E8E0D0]/30 mt-6">
            Payten Music (BMI) • Canryn Production • QUMUS Autonomous Engine • In Honor of Seabrun Candy Hunter
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
