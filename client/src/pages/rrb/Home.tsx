import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowRight, Radio, Podcast, Music, Zap, Heart, Signal, Sparkles, Users, BookOpen, Brain, Building2, Headphones, Play, Pause, Dice5, Globe, Trophy } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { CHANNEL_PRESETS, LIVE_STREAMS, RRB_LEGACY_TRACKS } from '@/lib/streamLibrary';
import RotatingVinylRecord from "@/components/rrb/RotatingVinylRecord";
import { QUMUSActivityFeed } from "@/components/rrb/QUMUSActivityFeed";
import { FrequencyTuner } from '@/components/rrb/FrequencyTuner';
import { ListenerStatsDisplay } from '@/components/rrb/ListenerStatsDisplay';
import { ChannelFavoritesButton } from '@/components/rrb/ChannelFavoritesButton';
import { AudioQualitySelector } from '@/components/rrb/AudioQualitySelector';
import { FavoriteChannels } from '@/components/rrb/FavoriteChannels';

// Platform showcase items
const PLATFORMS = [
  {
    id: 'radio',
    title: 'Radio Station',
    description: '24/7 streaming radio with live DJ control and listener engagement',
    icon: Radio,
    href: '/rrb/radio-station',
    color: 'from-blue-500/20 to-blue-600/20',
    badge: '🎙️ LIVE'
  },
  {
    id: 'podcast',
    title: 'Podcast Network',
    description: 'Multi-channel podcast platform with episodes, transcripts, and community',
    icon: Podcast,
    href: '/rrb/podcast-and-video',
    color: 'from-purple-500/20 to-purple-600/20',
    badge: '🎧 STREAMING'
  },
  {
    id: 'studio',
    title: 'Media Studio',
    description: 'Professional audio/video production tools and content creation suite',
    icon: Music,
    href: '/rrb/divisions',
    color: 'from-pink-500/20 to-pink-600/20',
    badge: '🎬 STUDIO'
  },
  {
    id: 'meditation',
    title: 'Meditation & Healing',
    description: 'Guided meditations with Drop Radio 432Hz streams and wellness content',
    icon: Sparkles,
    href: '/rrb/healing-music-frequencies',
    color: 'from-green-500/20 to-green-600/20',
    badge: '✨ WELLNESS'
  },
  {
    id: 'solbones',
    title: 'Solbones 4+3+2 Dice Game',
    description: 'Sacred math dice game with 9-player multiplayer, QUMUS AI opponents, and Solfeggio frequencies',
    icon: Dice5,
    href: '/solbones',
    color: 'from-orange-500/20 to-orange-600/20',
    badge: '🎲 PLAY NOW'
  },
  {
    id: 'legacy',
    title: 'The Legacy',
    description: 'Complete biography, timeline, and historical documentation',
    icon: BookOpen,
    href: '/rrb/the-legacy',
    color: 'from-amber-500/20 to-amber-600/20',
    badge: '📖 HISTORY'
  },
  {
    id: 'proof',
    title: 'Proof Vault',
    description: 'Verified documentation, evidence, and archival records',
    icon: Zap,
    href: '/rrb/proof-vault',
    color: 'from-red-500/20 to-red-600/20',
    badge: '✓ VERIFIED'
  },
  {
    id: 'grandma',
    title: 'Grandma Helen',
    description: 'Family history and genealogical records',
    icon: Users,
    href: '/rrb/grandma-helen',
    color: 'from-rose-500/20 to-rose-600/20',
    badge: '👵 FAMILY'
  },
  {
    id: 'qumus',
    title: 'QUMUS Orchestration',
    description: 'AI-powered autonomous decision engine with 12+ policies and real-time monitoring',
    icon: Brain,
    href: '/rrb/qumus',
    color: 'from-cyan-500/20 to-cyan-600/20',
    badge: '🤖 AI BRAIN'
  },
  {
    id: 'canryn',
    title: 'Canryn Production',
    description: 'Entertainment production and content creation division',
    icon: Building2,
    href: '/rrb/canryn-production',
    color: 'from-indigo-500/20 to-indigo-600/20',
    badge: '🎬 PRODUCTION'
  },
  {
    id: 'sweet',
    title: 'Sweet Miracles',
    description: 'Non-profit organization for community support and charitable giving',
    icon: Heart,
    href: '/rrb/sweet-miracles',
    color: 'from-pink-500/20 to-pink-600/20',
    badge: '❤️ CHARITY'
  },
  {
    id: 'hybridcast',
    title: 'HybridCast Emergency',
    description: 'Emergency broadcast system with offline capabilities and mesh networking',
    icon: Signal,
    href: '/rrb/hybridcast',
    color: 'from-red-500/20 to-red-600/20',
    badge: '⚠️ CONTROL'
  },
];

function QuickListenSection() {
  const audio = useAudio();
  const [selectedFrequency, setSelectedFrequency] = useState(432);
  const [showQualitySelector, setShowQualitySelector] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  const quickStreams = [
    { ...LIVE_STREAMS.funkyRadio, label: 'Soul & Funk', emoji: '🎷' },
    { ...LIVE_STREAMS.droneZone, label: 'Ambient Meditation', emoji: '🧘' },
    { ...LIVE_STREAMS.sonicUniverse, label: 'Jazz Fusion', emoji: '🎺' },
    { ...LIVE_STREAMS.lush, label: 'Chillout', emoji: '🌊' },
    { ...LIVE_STREAMS.radioParadise, label: "70s Rock & Roll", emoji: '🎸' },
    { ...LIVE_STREAMS.secretAgent, label: 'Lounge', emoji: '🍸' },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">🎧 Listen Now</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Tap any channel to start streaming instantly. Audio plays across all pages.
          </p>
        </div>

        {/* UN WCS Event - LIVE BANNER */}
        <div className="mb-8 p-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl shadow-2xl text-center animate-pulse">
          <h2 className="text-3xl font-bold mb-2">🔴 LIVE: UN WCS Parallel Event</h2>
          <p className="text-lg mb-4">March 17th - Worldwide Broadcast with Ghana Partners</p>
          <Link href="/simple-broadcast">
            <a className="inline-block px-8 py-3 bg-white text-red-600 font-bold rounded-lg hover:bg-gray-100 transition-colors">
              Join the Broadcast Now
            </a>
          </Link>
        </div>

        {/* Frequency Tuner */}
        <div className="mb-8 max-w-2xl mx-auto">
          <FrequencyTuner 
            currentFrequency={selectedFrequency}
            onFrequencyChange={setSelectedFrequency}
          />
        </div>

        {/* Quick Stream Cards with Stats and Favorites */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {quickStreams.map((stream) => {
            const isActive = audio.currentTrack?.id === stream.id;
            const isPlaying = isActive && audio.isPlaying;
            return (
              <div
                key={stream.id}
                className={`p-4 rounded-xl transition-all group relative ${
                  isActive
                    ? 'bg-amber-100 ring-2 ring-amber-500 scale-105 shadow-lg'
                    : 'bg-white hover:bg-slate-50 hover:scale-105 shadow-md hover:shadow-lg'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-2xl">{stream.emoji}</div>
                  <ChannelFavoritesButton
                    channelId={stream.id}
                    channelLabel={stream.label}
                    compact
                  />
                </div>
                <button
                  onClick={() => {
                    if (isActive) {
                      audio.togglePlayPause();
                    } else {
                      audio.play(stream);
                    }
                  }}
                  className="w-full"
                >
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-amber-600" />
                    ) : (
                      <Play className="w-5 h-5 text-slate-700 ml-0.5" />
                    )}
                  </div>
                </button>
                <p className="text-sm font-medium truncate text-slate-900">{stream.label}</p>
                <p className="text-xs text-slate-500 truncate">{stream.artist}</p>
                <div className="mt-2">
                  <ListenerStatsDisplay
                    channelId={stream.id}
                    compact
                    showTrend={false}
                  />
                </div>
                {isPlaying && (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-red-600 font-bold">LIVE</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Audio Quality Selector Toggle */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowQualitySelector(!showQualitySelector)}
            className="px-6 py-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium transition-colors shadow-md"
          >
            {showQualitySelector ? '✕ Hide Quality Settings' : '🔊 Audio Quality'}
          </button>
        </div>

        {showQualitySelector && (
          <div className="max-w-2xl mx-auto mb-8">
            <AudioQualitySelector compact={false} showRecommendation={true} />
          </div>
        )}

        {/* Favorite Channels Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className="w-full px-6 py-3 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-medium transition-colors flex items-center justify-between shadow-md"
          >
            <span className="flex items-center gap-2">
              <Heart className="w-5 h-5 fill-current" />
              My Favorite Channels
            </span>
            <span className="text-sm">{showFavorites ? '▼' : '▶'}</span>
          </button>
          
          {showFavorites && (
            <div className="mt-4">
              <FavoriteChannels />
            </div>
          )}
        </div>

        {/* Channel Presets */}
        <div className="text-center">
          <p className="text-sm font-medium text-slate-600 mb-4">Browse by Category</p>
          <div className="flex flex-wrap justify-center gap-2">
            {CHANNEL_PRESETS.map((channel) => (
              <button
                key={`channel-${channel.id || 'unnamed'}`}
                onClick={() => audio.playQueue(channel.streams, 0)}
                className="px-4 py-2 rounded-full bg-white hover:bg-slate-100 text-slate-700 text-sm font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md border border-slate-200"
              >
                <Radio className="w-3.5 h-3.5" style={{ color: channel.color }} />
                {channel.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { user, loading, error, isAuthenticated, logout } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState(0);
  const audio = useAudio();
  const autoplayAttempted = useRef(false);

  // Autoplay "Rockin' Rockin' Boogie" at low volume on first visit
  useEffect(() => {
    if (autoplayAttempted.current) return;
    if (audio.currentTrack) return; // Don't interrupt if something is already playing
    autoplayAttempted.current = true;

    const rrb = RRB_LEGACY_TRACKS[0]; // "Rockin' Rockin' Boogie — Original"
    if (!rrb) return;

    // Set low volume first, then play
    audio.setVolume(0.15);
    audio.play(rrb);
  }, [audio]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading RRB...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      {/* Hero Section - Redesigned Layout */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
        <div className="container">
          {/* Top Row: Title Left, Vinyl Right */}
          <div className="grid md:grid-cols-2 gap-8 items-start mb-8">
            {/* Left: Title and Description */}
            <div className="flex flex-col justify-start">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight text-slate-900">
                Rockin' Rockin' Boogie
              </h1>
              <p className="text-2xl font-semibold text-amber-600 mb-3">
                Seabrun Candy Hunter
              </p>
              <p className="text-lg text-slate-700 mb-6 max-w-lg leading-relaxed">
                A legacy restored — unified ecosystem of platforms, services, and autonomous intelligence
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg cursor-pointer"
                  onClick={() => window.location.href = '/solbones'}
                >
                  <Dice5 className="w-5 h-5 mr-2" />
                  Play Solbones 4+3+2
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-amber-500 text-amber-600 hover:bg-amber-50 shadow-md cursor-pointer"
                  onClick={() => window.location.href = '/rrb/proof-vault'}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Explore the Proof Vault
                </Button>
              </div>
            </div>

            {/* Right: Vinyl Record */}
            <div className="flex justify-center md:justify-end">
              <div className="w-full max-w-sm">
                <RotatingVinylRecord />
              </div>
            </div>
          </div>

          {/* Bottom: King Richard Image Centered */}
          <div className="flex justify-center mt-12">
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/IoCsbVOpgUYLbYGC.jpeg"
              alt="King Richard and Seabrun Candy Hunter - New Book Announcement"
              className="w-full max-w-2xl h-auto rounded-xl shadow-2xl object-cover border-4 border-white"
            />
          </div>
        </div>
      </section>

      {/* Quick Listen Section */}
      <QuickListenSection />

      {/* Platform Showcase */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">Explore the Ecosystem</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Access all platforms, services, and features of the RRB legacy
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLATFORMS.map((platform, idx) => {
              const Icon = platform.icon;
              return (
                <Link key={platform.id} href={platform.href}>
                  <a className="group block h-full">
                    <div className={`h-full p-8 rounded-xl bg-gradient-to-br ${platform.color} border border-slate-200 hover:border-amber-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                      <div className="flex items-start justify-between mb-4">
                        <Icon className="w-8 h-8 text-slate-700" />
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-slate-700 shadow-sm">
                          {platform.badge}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-slate-900 group-hover:text-amber-600 transition-colors">
                        {platform.title}
                      </h3>
                      <p className="text-slate-700 mb-4 leading-relaxed">
                        {platform.description}
                      </p>
                      <div className="flex items-center gap-2 text-amber-600 font-semibold group-hover:gap-3 transition-all">
                        <span>Explore</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* QUMUS Activity Feed */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">System Activity</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Real-time QUMUS orchestration and autonomous decision-making
            </p>
          </div>
          <QUMUSActivityFeed />
        </div>
      </section>
    </div>
  );
}
