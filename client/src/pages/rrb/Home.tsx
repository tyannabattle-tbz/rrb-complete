import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowRight, Radio, Podcast, Music, Zap, Heart, Signal, Sparkles, Users, BookOpen, Brain, Building2, Headphones, Play, Pause } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { CHANNEL_PRESETS, LIVE_STREAMS, RRB_LEGACY_TRACKS } from '@/lib/streamLibrary';
import RotatingVinylRecord from "@/components/rrb/RotatingVinylRecord";

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
    title: 'Solbones 4+3+2 Music',
    description: 'Exclusive music collection and audio archive from the legacy',
    icon: Headphones,
    href: '/rrb/the-music',
    color: 'from-orange-500/20 to-orange-600/20',
    badge: '🎵 MUSIC'
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
    id: 'hybridcast',
    title: 'HybridCast',
    description: 'Emergency broadcast system with offline mesh networking',
    icon: Signal,
    href: '/rrb/hybridcast',
    color: 'from-cyan-500/20 to-cyan-600/20',
    badge: '📡 BROADCAST'
  },
  {
    id: 'qumus',
    title: 'QUMUS Brain',
    description: 'Autonomous orchestration engine controlling all platforms',
    icon: Brain,
    href: '/rrb/qumus/admin',
    color: 'from-indigo-500/20 to-indigo-600/20',
    badge: '🤖 AI'
  },
  {
    id: 'sweet-miracles',
    title: 'Sweet Miracles',
    description: 'Community support, grants, and social impact initiatives',
    icon: Heart,
    href: '/rrb/canryn-production',
    color: 'from-fuchsia-500/20 to-fuchsia-600/20',
    badge: '💝 COMMUNITY'
  },
  {
    id: 'ecosystem',
    title: 'Unified Dashboard',
    description: 'Central control center for all ecosystem services and monitoring',
    icon: Zap,
    href: '/rrb/divisions',
    color: 'from-violet-500/20 to-violet-600/20',
    badge: '⚙️ CONTROL'
  },
];

function QuickListenSection() {
  const audio = useAudio();

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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickStreams.map((stream) => {
            const isActive = audio.currentTrack?.id === stream.id;
            const isPlaying = isActive && audio.isPlaying;
            return (
              <button
                key={stream.id}
                onClick={() => {
                  if (isActive) {
                    audio.togglePlayPause();
                  } else {
                    audio.play(stream);
                  }
                }}
                className={`p-5 rounded-xl text-center transition-all group ${
                  isActive
                    ? 'bg-amber-500/20 ring-2 ring-amber-500 scale-105'
                    : 'bg-white/5 hover:bg-white/10 hover:scale-105'
                }`}
              >
                <div className="text-3xl mb-2">{stream.emoji}</div>
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  )}
                </div>
                <p className="text-sm font-medium truncate">{stream.label}</p>
                <p className="text-xs text-zinc-500 truncate">{stream.artist}</p>
                {isPlaying && (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-red-400 font-bold">LIVE</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Channel Presets */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {CHANNEL_PRESETS.map(channel => (
            <button
              key={channel.id}
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
    
    // Use a click listener to start playback (browsers require user gesture)
    const startAutoplay = () => {
      if (!audio.currentTrack) {
        audio.play(rrb);
      }
      document.removeEventListener('click', startAutoplay);
      document.removeEventListener('touchstart', startAutoplay);
      document.removeEventListener('scroll', startAutoplay);
      document.removeEventListener('keydown', startAutoplay);
    };

    // Try immediate play first (may work if user has interacted before)
    const tryAutoplay = async () => {
      try {
        audio.setVolume(0.15);
        audio.play(rrb);
      } catch {
        // If autoplay blocked, wait for first user interaction
        document.addEventListener('click', startAutoplay, { once: true });
        document.addEventListener('touchstart', startAutoplay, { once: true });
        document.addEventListener('scroll', startAutoplay, { once: true });
        document.addEventListener('keydown', startAutoplay, { once: true });
      }
    };

    // Small delay to let the page render first
    const timer = setTimeout(tryAutoplay, 500);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', startAutoplay);
      document.removeEventListener('touchstart', startAutoplay);
      document.removeEventListener('scroll', startAutoplay);
      document.removeEventListener('keydown', startAutoplay);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <main className="min-h-screen">
        {/* Disclaimer */}
        <section className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <div className="container py-4 px-4">
            <div className="flex gap-3 items-start">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold text-yellow-900 dark:text-yellow-100">
                  This is an archival documentation site
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  All content is for historical preservation and educational purposes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary/20 to-background">
          <div className="absolute inset-0 opacity-10">
            <RotatingVinylRecord />
          </div>
          
          <div className="relative container flex flex-col items-center justify-center text-center gap-6 py-20">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground drop-shadow-lg">
              Rockin' Rockin' Boogie
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 drop-shadow-md">
              <span className="font-semibold">Seabrun Candy Hunter</span>
            </p>
            <p className="text-xl md:text-2xl text-foreground/90 drop-shadow-md max-w-2xl">
              A legacy restored — unified ecosystem of platforms, services, and autonomous intelligence
            </p>
            <div className="flex gap-4 flex-wrap justify-center">
              <Link href="/rrb/proof-vault">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Explore the Proof Vault
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/rrb/ecosystem/dashboard">
                <Button size="lg" variant="outline">
                  View Ecosystem Dashboard
                  <Zap className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* King Richard and I — Featured Photo */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-background to-card">
          <div className="container max-w-4xl">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border">
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/eciPCZbjkGWvgSVs.jpeg"
                alt="King Richard and I — Canryn Production Inc. announcement documenting 50 years of being R&R stars on and off stage, featuring Little Richard"
                className="w-full h-auto object-contain"
                loading="eager"
              />
            </div>
            <div className="mt-6 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                &ldquo;King Richard and I&rdquo;
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                The book documenting 50 years of being Rock &amp; Roll stars on and off stage. A Canryn Production.
              </p>
              <Link href="/rrb/the-legacy">
                <Button variant="outline" className="mt-4">
                  Read the Full Legacy <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container max-w-3xl">
            <div className="mb-8 pb-8 border-b border-border">
              <h3 className="text-2xl font-bold text-accent mb-2">The Artist</h3>
              <p className="text-lg text-foreground/70">
                <strong>Seabrun Candy Hunter</strong> — Songwriter, vocalist, lyricist, and creative visionary who shaped the sound of an era and built a lasting musical legacy.
              </p>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Our Mission
            </h2>
            <p className="text-lg text-foreground/80 leading-relaxed mb-8">
              RockinRockinBoogie.com is a unified ecosystem designed to preserve, document, and protect a 1970s-era musical legacy through verified credits, touring records, testimony, and archival proof — all organized in one intelligent, autonomous platform.
            </p>
            <p className="text-lg text-foreground/80 leading-relaxed mb-8">
              Every claim, credit, and historical point is supported by public records, archival documents, witness testimony, or licensing evidence. This is not speculation—this is documentation.
            </p>
            <p className="text-lg text-foreground/80 leading-relaxed">
              Powered by QUMUS autonomous orchestration, this ecosystem provides 90% autonomous decision-making with 10% human oversight, ensuring continuous operation and community access to essential tools and media.
            </p>
          </div>
        </section>

        {/* Unified Ecosystem Showcase */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Unified Ecosystem
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                12 integrated platforms working together through autonomous orchestration
              </p>
            </div>

            {/* Platform Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {PLATFORMS.map((platform, idx) => {
                const Icon = platform.icon;
                return (
                  <Link key={platform.id} href={platform.href}>
                    <div className={`p-6 rounded-lg border border-border hover:border-accent transition cursor-pointer group bg-gradient-to-br ${platform.color}`}>
                      <div className="flex items-start justify-between mb-4">
                        <Icon className="w-8 h-8 text-accent group-hover:scale-110 transition" />
                        <span className="text-xs font-bold px-2 py-1 rounded bg-accent/20 text-accent">
                          {platform.badge}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-accent transition">
                        {platform.title}
                      </h3>
                      <p className="text-sm text-foreground/70 mb-4">
                        {platform.description}
                      </p>
                      <div className="flex items-center text-accent font-semibold text-sm">
                        Access <ArrowRight className="ml-2 w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Ecosystem Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-card p-8 rounded-lg border border-border">
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">12</p>
                <p className="text-sm text-foreground/60 mt-2">Integrated Platforms</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">90%</p>
                <p className="text-sm text-foreground/60 mt-2">Autonomous Control</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">24/7</p>
                <p className="text-sm text-foreground/60 mt-2">Live Broadcasting</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">∞</p>
                <p className="text-sm text-foreground/60 mt-2">Community Access</p>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Categories */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-foreground text-center">
              Platform Categories
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Legacy Restored */}
              <div className="p-8 rounded-lg border border-border bg-gradient-to-br from-blue-500/10 to-blue-600/10">
                <h3 className="text-2xl font-bold mb-4 text-foreground">📖 Legacy Restored</h3>
                <p className="text-foreground/70 mb-6">
                  Historical content and archival materials documenting the original legacy
                </p>
                <ul className="space-y-2 text-sm text-foreground/70">
                  <li>✓ The Legacy (Biography & Timeline)</li>
                  <li>✓ The Music (Recordings & Credits)</li>
                  <li>✓ Proof Vault (Verified Evidence)</li>
                  <li>✓ Grandma Helen (Family History)</li>
                  <li>✓ Solbones 4+3+2 Music Archive</li>
                </ul>
              </div>

              {/* Live Services */}
              <div className="p-8 rounded-lg border border-border bg-gradient-to-br from-purple-500/10 to-purple-600/10">
                <h3 className="text-2xl font-bold mb-4 text-foreground">🎙️ Live Services</h3>
                <p className="text-foreground/70 mb-6">
                  Real-time broadcasting and streaming platforms
                </p>
                <ul className="space-y-2 text-sm text-foreground/70">
                  <li>✓ Radio Station (24/7 Streaming)</li>
                  <li>✓ Podcast Network (Multi-channel)</li>
                  <li>✓ Media Studio (Production Suite)</li>
                  <li>✓ HybridCast (Emergency Broadcast)</li>
                  <li>✓ Meditation & Healing</li>
                </ul>
              </div>

              {/* Autonomous Control */}
              <div className="p-8 rounded-lg border border-border bg-gradient-to-br from-indigo-500/10 to-indigo-600/10">
                <h3 className="text-2xl font-bold mb-4 text-foreground">🤖 Autonomous Control</h3>
                <p className="text-foreground/70 mb-6">
                  Intelligent orchestration and community support systems
                </p>
                <ul className="space-y-2 text-sm text-foreground/70">
                  <li>✓ QUMUS Brain (AI Orchestration)</li>
                  <li>✓ Unified Dashboard (Central Control)</li>
                  <li>✓ Sweet Miracles (Community Support)</li>
                  <li>✓ Autonomous Decision Making</li>
                  <li>✓ Human Review & Oversight</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Content */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-foreground text-center">
              Featured Content
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Listen to the Music */}
              <Link href="/rrb/the-music">
                <div className="p-8 rounded-lg border border-border hover:border-accent transition cursor-pointer group bg-gradient-to-br from-orange-500/10 to-orange-600/10">
                  <div className="text-4xl mb-4">🎵</div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-accent transition">
                    Listen to the Music
                  </h3>
                  <p className="text-foreground/70 mb-4">
                    Explore the complete discography, recordings, and musical legacy with verified credits and production details.
                  </p>
                  <div className="flex items-center text-accent font-semibold">
                    Explore Music <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </div>
              </Link>

              {/* Explore the Proof Vault */}
              <Link href="/rrb/proof-vault">
                <div className="p-8 rounded-lg border border-border hover:border-accent transition cursor-pointer group bg-gradient-to-br from-red-500/10 to-red-600/10">
                  <div className="text-4xl mb-4">✓</div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-accent transition">
                    Explore the Proof Vault
                  </h3>
                  <p className="text-foreground/70 mb-4">
                    Dive into our comprehensive archive of verified documentation, organized by category. Every claim is backed by evidence.
                  </p>
                  <div className="flex items-center text-accent font-semibold">
                    Enter Vault <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Listen Section */}
        <QuickListenSection />

        {/* Call to Action */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Explore the Complete Ecosystem
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
              Navigate through 12 integrated platforms powered by autonomous QUMUS orchestration. Everything from archival documentation to live broadcasting, all working together seamlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/rrb/ecosystem/dashboard">
                <Button size="lg" variant="secondary">
                  View Dashboard
                  <Zap className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/rrb/proof-vault">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Proof Vault
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
