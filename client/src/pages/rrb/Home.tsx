import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Link } from 'wouter';
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
    description: 'Media production company subsidiary with studio management and content creation',
    icon: Building2,
    href: '/rrb/canryn',
    color: 'from-indigo-500/20 to-indigo-600/20',
    badge: '🎬 STUDIO'
  },
  {
    id: 'sweet-miracles',
    title: 'Sweet Miracles NPO',
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
    <section className="py-16 md:py-24 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">🎧 Listen Now</h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Tap any channel to start streaming instantly. Audio plays across all pages.
          </p>
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
                    ? 'bg-amber-500/20 ring-2 ring-amber-500 scale-105'
                    : 'bg-white/5 hover:bg-white/10 hover:scale-105'
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
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    )}
                  </div>
                </button>
                <p className="text-sm font-medium truncate">{stream.label}</p>
                <p className="text-xs text-zinc-500 truncate">{stream.artist}</p>
                <div className="mt-2">
                  <ListenerStatsDisplay
                    channelId={stream.id}
                    compact
                    showTrend={false}
                  />
                </div>
                {isPlaying && (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-red-400 font-bold">LIVE</span>
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
            className="px-6 py-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-medium transition-colors"
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
            className="w-full px-6 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium transition-colors flex items-center justify-between"
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
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {CHANNEL_PRESETS.map((channel) => (
            <button
              key={`channel-${channel.id || 'unnamed'}`}
              onClick={() => audio.playQueue(channel.streams, 0)}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Radio className="w-3.5 h-3.5" style={{ color: channel.color }} />
              {channel.name}
            </button>
          ))}
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
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500 mx-auto mb-4" />
          <p className="text-zinc-400">Loading RRB...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 text-white">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-black/50 to-transparent">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Rockin' Rockin' Boogie
              </h1>
              <p className="text-xl text-zinc-300 mb-4">
                Seabrun Candy Hunter
              </p>
              <p className="text-lg text-zinc-400 mb-8 max-w-lg">
                A legacy restored — unified ecosystem of platforms, services, and autonomous intelligence
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black">
                  <Dice5 className="w-5 h-5 mr-2" />
                  Play Solbones 4+3+2
                </Button>
                <Button size="lg" variant="outline" className="border-amber-500 text-amber-400 hover:bg-amber-500/10">
                  <Zap className="w-5 h-5 mr-2" />
                  Explore the Proof Vault
                </Button>
              </div>
            </div>
            <div className="relative flex flex-col gap-6">
              <img 
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/IoCsbVOpgUYLbYGC.jpeg"
                alt="King Richard and Seabrun Candy Hunter - New Book Announcement"
                className="w-full h-auto rounded-lg shadow-2xl object-cover"
              />
              <RotatingVinylRecord />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Listen Section */}
      <QuickListenSection />

      {/* Platform Showcase */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Explore the Ecosystem</h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Discover all platforms, services, and autonomous systems powering the RRB legacy
            </p>
          </div>

          {/* Platform Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {PLATFORMS.map((platform, idx) => {
              const Icon = platform.icon;
              return (
                <Link key={platform.id} href={platform.href}>
                  <a className={`group p-6 rounded-xl bg-gradient-to-br ${platform.color} border border-white/10 hover:border-white/30 transition-all hover:scale-105 cursor-pointer h-full`}>
                    <div className="flex items-start justify-between mb-4">
                      <Icon className="w-8 h-8 text-amber-400" />
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-amber-400">
                        {platform.badge}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-amber-400 transition-colors">
                      {platform.title}
                    </h3>
                    <p className="text-sm text-zinc-400 mb-4">{platform.description}</p>
                    <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
                      Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* QUMUS Activity Feed */}
      <section className="py-16 md:py-24 bg-black/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">🤖 QUMUS Activity</h2>
            <p className="text-lg text-zinc-400">
              Real-time autonomous orchestration and decision-making
            </p>
          </div>
          <QUMUSActivityFeed />
        </div>
      </section>
    </div>
  );
}
