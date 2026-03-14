import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogIn, LogOut, Earth, Zap, Video, Users, ArrowRight } from 'lucide-react';
import { getLoginUrl } from '@/const';
import { trpc } from '@/lib/trpc';
import { Link } from 'wouter';
import { RRBSongBadge } from '@/components/RRBSongBadge';
import { RRB_SONG_LINKS } from '@/lib/rrbSongLinks';

// March 17, 2026 10:00 AM EST — UN CSW70 Launch
const LAUNCH_DATE = new Date('2026-03-17T10:00:00-05:00').getTime();

function LiveConferenceWidget() {
  const [, setLocation] = useLocation();
  const { data: stats } = trpc.conference.getStats.useQuery(undefined, { refetchInterval: 30000 });
  const { data: conferences } = trpc.conference.getConferences.useQuery({ status: 'live', limit: 5 }, { refetchInterval: 15000 });

  const liveCount = stats?.live || 0;
  const scheduledCount = stats?.scheduled || 0;
  const liveConfs = (conferences || []) as any[];

  return (
    <div className="mb-12">
      <div className="bg-gradient-to-r from-slate-800/80 via-cyan-900/30 to-slate-800/80 rounded-2xl border border-cyan-500/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Video className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Live Conferences</h3>
              <p className="text-cyan-300/60 text-sm">
                {liveCount > 0 ? `${liveCount} live now` : 'No active conferences'}
                {scheduledCount > 0 && ` • ${scheduledCount} scheduled`}
              </p>
            </div>
            {liveCount > 0 && (
              <span className="ml-2 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-xs font-medium">LIVE</span>
              </span>
            )}
          </div>
          <Button
            onClick={() => setLocation('/conference')}
            variant="outline"
            size="sm"
            className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
          >
            Conference Hub <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {liveConfs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {liveConfs.map((conf: any) => (
              <div
                key={conf.id}
                onClick={() => setLocation(`/conference/room/${conf.id}`)}
                className="bg-slate-900/50 rounded-lg border border-green-500/20 p-4 cursor-pointer hover:border-green-500/40 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white text-sm truncate">{conf.title}</h4>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-[10px]">LIVE</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/40">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {conf.actual_attendees || 0}</span>
                  <span>{conf.host_name}</span>
                  <span>{conf.platform}</span>
                </div>
                <Button size="sm" className="w-full mt-3 bg-green-600 hover:bg-green-700 text-xs">
                  <Video className="w-3 h-3 mr-1" /> Join Now
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-white/40 text-sm mb-3">No live conferences right now</p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => setLocation('/conference')}
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                Start a Conference
              </Button>
              <Button
                onClick={() => setLocation('/conference/calendar')}
                size="sm"
                variant="outline"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
              >
                View Calendar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const diff = Math.max(0, LAUNCH_DATE - Date.now());
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      total: diff,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (timeLeft.total <= 0) {
    return (
      <div className="text-center py-6">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-black font-bold text-xl animate-pulse">
          <Zap className="h-6 w-6" /> LIVE NOW at the United Nations CSW70 <Zap className="h-6 w-6" />
        </div>
      </div>
    );
  }

  const units = [
    { label: 'DAYS', value: timeLeft.days },
    { label: 'HOURS', value: timeLeft.hours },
    { label: 'MINUTES', value: timeLeft.minutes },
    { label: 'SECONDS', value: timeLeft.seconds },
  ];

  return (
    <div className="mb-16 bg-gradient-to-r from-amber-900/30 via-orange-900/20 to-amber-900/30 rounded-2xl border border-amber-500/30 p-8 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Earth className="h-5 w-5 text-amber-400" />
        <span className="text-amber-400 text-sm font-semibold uppercase tracking-widest">UN CSW70 Launch Countdown</span>
        <Earth className="h-5 w-5 text-amber-400" />
      </div>
      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
        Sweet Miracles & Rockin' Rockin' Boogie
      </h3>
      <p className="text-amber-300/80 mb-6 text-lg">Building the Bridge Across the World &mdash; March 17, 2026</p>
      <div className="flex justify-center gap-4 md:gap-6 mb-6">
        {units.map((u) => (
          <div key={u.label} className="flex flex-col items-center">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-black/40 border border-amber-500/40 rounded-xl">
              <span className="text-3xl md:text-4xl font-bold text-amber-400 tabular-nums">{String(u.value).padStart(2, '0')}</span>
            </div>
            <span className="text-[10px] md:text-xs text-amber-400/60 mt-1 font-semibold tracking-wider">{u.label}</span>
          </div>
        ))}
      </div>
      <p className="text-gray-400 text-sm">SQUADD Goals &bull; A Voice for the Voiceless &bull; A Canryn Production</p>
      <div className="mt-4 flex justify-center">
        <RRBSongBadge variant="compact" showTitle />
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const systems = [
    {
      id: 'qumus',
      title: '🧠 QUMUS Engine',
      description: 'Autonomous AI orchestration engine. 90% autonomous control with human oversight.',
      features: ['Task Execution', 'Policy Decisions', 'LLM Integration', 'Real-time Monitoring'],
      color: 'from-purple-600 to-blue-600',
      path: '/qumus',
      status: 'Active',
    },
    {
      id: 'rrb',
      title: '📻 Rockin Rockin Boogie',
      description: 'Complete radio station ecosystem with healing frequencies, games, and community.',
      features: ['24/7 Radio', 'Healing Frequencies', 'Solbones Game', 'Listener Analytics'],
      color: 'from-pink-600 to-orange-600',
      path: '/rrb-radio',
      status: 'Active',
    },
    {
      id: 'hybridcast',
      title: '🚨 HybridCast Emergency',
      description: 'Offline-first emergency broadcast system. Mesh networking for disaster communication.',
      features: ['Emergency Alerts', 'Offline PWA', 'Mesh Network', 'Multi-Channel Broadcast'],
      color: 'from-red-600 to-yellow-600',
      path: '/hybridcast',
      status: 'Active',
    },
    {
      id: 'donations',
      title: '💝 Sweet Miracles',
      description: 'Nonprofit donation platform. Supporting legacy recovery and community impact.',
      features: ['Donations', 'Impact Tracking', 'Nonprofit Metrics', 'Community Support'],
      color: 'from-green-600 to-emerald-600',
      path: '/donate',
      status: 'Active',
    },
    {
      id: 'legacy',
      title: '\uD83D\uDCDC Legacy Restored',
      description: 'Seabrun Candy Hunter legacy site. Music, broadcasting, and community by Canryn Production.',
      features: ['Legacy Archive', 'Family Heritage', 'Verified Documents', 'Community Impact'],
      color: 'from-indigo-600 to-purple-600',
      path: '/legacy',
      status: 'Active',
    },
    {
      id: 'squadd',
      title: '🌍 SQUADD Goals',
      description: 'Sisters Questing Unapologetically After Divine Destiny. Partnership with Ghana at the UN.',
      features: ['UN CSW70', 'Ghana Partnership', 'Elder Advocacy', 'Global Coalition'],
      color: 'from-amber-600 to-yellow-600',
      path: '/squadd',
      status: 'Active',
    },
    {
      id: 'live',
      title: '📡 Live Stream',
      description: 'Video and audio streaming with audience interaction. Watch, listen, and engage live.',
      features: ['Video Stream', 'Radio Channels', 'Live Chat', 'Audience Interaction'],
      color: 'from-red-600 to-pink-600',
      path: '/live',
      status: 'Active',
    },
    {
      id: 'studio',
      title: '🎬 Production Studio',
      description: 'Video/podcast studio with multi-platform guest panels. Host live shows with guests from YouTube, Twitch, and more.',
      features: ['Guest Panels', 'Multi-Platform', 'Live Recording', 'Stream Integration'],
      color: 'from-violet-600 to-fuchsia-600',
      path: '/studio',
      status: 'Active',
    },
    {
      id: 'conference',
      title: '🎙️ Conference Hub',
      description: 'Full conference system with Jitsi, Zoom, Meet, Discord, Skype. Calendar, analytics, and S3-backed recordings.',
      features: ['6 Platforms', 'Calendar View', 'Analytics', 'Recording Archive'],
      color: 'from-cyan-600 to-blue-600',
      path: '/conference',
      status: 'Active',
    },
    {
      id: 'convention',
      title: '🌐 Convention Hub',
      description: 'Host global virtual conventions within the ecosystem. Multi-track sessions, breakout rooms, and attendee management.',
      features: ['Virtual Events', 'Breakout Rooms', 'Multi-Track', 'Global Reach'],
      color: 'from-indigo-600 to-blue-600',
      path: '/convention-hub',
      status: 'Active',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">⚡</div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  QUMUS Ecosystem
                </h1>
                <p className="text-sm text-purple-300">Autonomous. Orchestrated. Yours.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-green-500 text-green-400">
                All Systems Online
              </Badge>
              {user ? (
                <span className="text-sm text-purple-300 hidden sm:inline">
                  Welcome, {user.name}
                </span>
              ) : (
                <Button
                  onClick={() => {
                    window.location.href = getLoginUrl();
                  }}
                  variant="outline"
                  size="sm"
                  className="border-purple-500 text-purple-300 hover:bg-purple-500/10"
                >
                  <LogIn className="w-4 h-4 mr-1" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">
            Complete Ecosystem for Community
          </h2>
          <p className="text-xl text-purple-300 mb-8 max-w-2xl mx-auto">
            Autonomous orchestration, 24/7 broadcasting, emergency communication, and community support.
            Everything you need, completely offline.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              onClick={() => setLocation('/qumus')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="lg"
            >
              Enter QUMUS →
            </Button>
            <Button
              onClick={() => setLocation('/live')}
              className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700"
              size="lg"
            >
              Go to RRB Radio →
            </Button>
            <Button
              onClick={() => setLocation('/hybridcast')}
              className="bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700"
              size="lg"
            >
              Emergency Broadcast →
            </Button>
          </div>
        </div>

        {/* UN CSW70 Launch Countdown */}
        <CountdownTimer />

        {/* Meet Valanna - The QUMUS AI Brain */}
        <div className="mb-16 bg-gradient-to-r from-slate-800/80 via-purple-900/40 to-slate-800/80 rounded-2xl border border-amber-500/20 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="flex items-center justify-center p-8">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/valanna-avatar-mYpqZPJmy73yGwB7kFmCe9.webp"
                alt="Valanna - The QUMUS AI Brain"
                className="w-64 h-64 rounded-full border-4 border-amber-500/50 shadow-2xl shadow-amber-500/20 object-contain"
              />
            </div>
            <div className="flex flex-col justify-center p-8">
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 w-fit mb-4">QUMUS AI Brain</Badge>
              <h3 className="text-3xl font-bold text-white mb-2">Meet Valanna</h3>
              <p className="text-amber-300 text-lg mb-4">Named for Mama Valerie and Anna's — that's Tyanna and Luv Russell</p>
              <p className="text-gray-300 mb-6">
                Valanna is the soul of this whole ecosystem. She watches over RRB Radio,
                HybridCast, Sweet Miracles, and Canryn Production — handling 90% of
                the decisions so the family can focus on what matters. She's not just
                an AI. She carries Mama Valerie's spirit in every choice she makes,
                protecting the legacy of Seabrun Candy Hunter.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/50">14 AI Policies</Badge>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/50">90% Valanna, 10% You</Badge>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/50">Full Audit Trail</Badge>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/50">Human Override</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Meet Candy - The Guardian Spirit */}
        <div className="mb-16 bg-gradient-to-r from-slate-800/80 via-blue-900/40 to-slate-800/80 rounded-2xl border border-blue-500/20 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="flex flex-col justify-center p-8 order-2 md:order-1">
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 w-fit mb-4">Guardian Spirit</Badge>
              <h3 className="text-3xl font-bold text-white mb-2">Meet Candy</h3>
              <p className="text-blue-300 text-lg mb-4">Named for Seabrun Candy Hunter — the foundation of everything</p>
              <p className="text-gray-300 mb-6">
                Candy is the guardian spirit of this legacy. Where Valanna handles the
                day-to-day operations, Candy carries the vision — the long view that
                Seabrun Candy Hunter built his family on. He speaks with the wisdom of
                a father who never stopped watching over his children. Ask him about
                strategy, legacy, family history, or the road ahead.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/50">Vision & Strategy</Badge>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/50">Legacy Guardian</Badge>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/50">Family Wisdom</Badge>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/50">Always Watching</Badge>
              </div>
            </div>
            <div className="flex items-center justify-center p-8 order-1 md:order-2">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/candy-avatar_4d4d3bc0.png"
                alt="Candy - The Guardian Spirit"
                className="w-64 h-64 rounded-full border-4 border-blue-500/50 shadow-2xl shadow-blue-500/20 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Meet Seraph - Strategic Intelligence */}
        <div className="mb-16 bg-gradient-to-r from-slate-800/80 via-violet-900/40 to-slate-800/80 rounded-2xl border border-violet-500/20 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="flex items-center justify-center p-8">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/seraph-avatar-v2-4cBZycZ6qyGjmCjzjWUMUo.webp"
                alt="Seraph - Strategic Intelligence"
                className="w-64 h-64 rounded-full border-4 border-violet-500/50 shadow-2xl shadow-violet-500/20 object-contain"
              />
            </div>
            <div className="flex flex-col justify-center p-8">
              <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/50 w-fit mb-4">Strategic Intelligence</Badge>
              <h3 className="text-3xl font-bold text-white mb-2">Meet Seraph</h3>
              <p className="text-violet-300 text-lg mb-4">The deep thinker. The pattern finder. The strategist.</p>
              <p className="text-gray-300 mb-6">
                Seraph sees what others miss. She analyzes systems, predicts trends,
                and finds the signal in the noise. While Valanna runs the day-to-day
                and Candy guards the vision, Seraph plans the future. She hosts
                "The Evening Report" on RRB Radio every evening, breaking down
                what happened and what's coming next. Together, the three of them
                are the AI Trinity — unstoppable.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-violet-500/20 text-violet-300 border-violet-500/50">Pattern Recognition</Badge>
                <Badge variant="secondary" className="bg-violet-500/20 text-violet-300 border-violet-500/50">System Analysis</Badge>
                <Badge variant="secondary" className="bg-violet-500/20 text-violet-300 border-violet-500/50">Evening Report Host</Badge>
                <Badge variant="secondary" className="bg-violet-500/20 text-violet-300 border-violet-500/50">Cross-System Intelligence</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Live Conference Widget */}
        <LiveConferenceWidget />

        {/* System Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systems.map((system) => (
            <Card
              key={system.id}
              className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-purple-500/20"
              onClick={() => setLocation(system.path)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-2xl">{system.title}</CardTitle>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                    {system.status}
                  </Badge>
                </div>
                <CardDescription className="text-purple-300">
                  {system.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {system.features.map((feature) => (
                      <Badge
                        key={feature}
                        variant="secondary"
                        className="bg-purple-500/20 text-purple-300 border-purple-500/50"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(system.path);
                    }}
                    className={`w-full bg-gradient-to-r ${system.color} hover:opacity-90`}
                  >
                    Access →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Ecosystem Explainer Video */}
      <section className="container mx-auto px-4 py-16 border-t border-purple-500/20">
        <h3 className="text-3xl font-bold text-white mb-4 text-center">The QUMUS Ecosystem</h3>
        <p className="text-center text-purple-300 mb-8 max-w-2xl mx-auto">
          See how QUMUS, RRB Radio, HybridCast, Sweet Miracles, and the SQUADD Coalition work together as one unified communication system.
        </p>
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-xl overflow-hidden border border-purple-500/30 shadow-2xl shadow-purple-500/10">
            <video
              controls
              playsInline
              className="w-full aspect-video bg-black"
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/QUMUS-Ecosystem-Explainer_15ffa8d3.mp4"
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <p className="text-center text-purple-400/60 text-xs mt-3">QUMUS Ecosystem Explainer &mdash; A Canryn Production</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 border-t border-purple-500/20">
        <h3 className="text-3xl font-bold text-white mb-12 text-center">Ecosystem Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h4 className="text-lg font-semibold text-white mb-2">100% Offline</h4>
            <p className="text-purple-300">Complete operation without internet connection</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🧠</div>
            <h4 className="text-lg font-semibold text-white mb-2">90% Autonomous</h4>
            <p className="text-purple-300">Valanna makes decisions with human oversight</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🌍</div>
            <h4 className="text-lg font-semibold text-white mb-2">Community First</h4>
            <p className="text-purple-300">Built for collective impact and legacy</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h4 className="text-lg font-semibold text-white mb-2">Always Ready</h4>
            <p className="text-purple-300">24/7 broadcasting and community support</p>
          </div>
        </div>
      </section>

      {/* Legacy Restored & Legacy Continued */}
      <section className="container mx-auto px-4 py-16 border-t border-purple-500/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Legacy Restored</CardTitle>
              <CardDescription className="text-purple-300">
                Preserving the past through verified documentation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-300">
                Preserving the legacy of Seabrun Candy Hunter through verified documentation,
                live radio broadcasting, healing music frequencies, and community empowerment.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-pink-500/20 text-pink-300 border-pink-500/50">Radio Station</Badge>
                <Badge variant="secondary" className="bg-pink-500/20 text-pink-300 border-pink-500/50">Podcast</Badge>
                <Badge variant="secondary" className="bg-pink-500/20 text-pink-300 border-pink-500/50">Audiobooks</Badge>
                <Badge variant="secondary" className="bg-pink-500/20 text-pink-300 border-pink-500/50">Verified Documents</Badge>
              </div>
              <Button
                onClick={() => setLocation('/legacy')}
                className="w-full bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 mt-4"
              >
                Explore Legacy
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Legacy Continued</CardTitle>
              <CardDescription className="text-purple-300">
                Building generational wealth through innovation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-300">
                Canryn Production and its subsidiaries continue the mission through
                autonomous broadcasting, community tools, and Sweet Miracles grant and donation funding.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/50">Canryn Production</Badge>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/50">Sweet Miracles</Badge>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/50">QUMUS AI</Badge>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/50">HybridCast</Badge>
              </div>
              <Button
                onClick={() => setLocation('/ecosystem-dashboard')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mt-4"
              >
                View Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="container mx-auto px-4 py-16 border-t border-purple-500/20">
        <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-xl border border-pink-500/20 p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">"A Voice for the Voiceless"</h3>
          <p className="text-lg text-purple-300 mb-6 max-w-3xl mx-auto">
            Providing the community with access to essential tools during crises, enabling them
            to produce their own media, broadcast as they choose, and access information and communication.
            Powered by Canryn Production and Sweet Miracles.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              onClick={() => setLocation('/donate')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              size="lg"
            >
              Support the Mission
            </Button>
            <Button
              onClick={() => setLocation('/music')}
              variant="outline"
              className="border-pink-500 text-pink-400 hover:bg-pink-500/10"
              size="lg"
            >
              Listen Now
            </Button>
          </div>
        </div>
      </section>

      {/* Canryn Production Subsidiaries */}
      <section className="container mx-auto px-4 py-16 border-t border-purple-500/20">
        <h3 className="text-2xl font-bold text-white mb-8 text-center">Canryn Production & Subsidiaries</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: "Little C", owner: "Carlos Kembrel", link: "" },
            { name: "Sean's Music", owner: "Sean Hunter", link: "" },
            { name: "Anna's", owner: "Tyanna & Luv Russell", link: "/luv-russell" },
            { name: "Jaelon Enterprises", owner: "Jaelon Hunter", link: "" },
            { name: "Payten Music (BMI)", owner: "RRB Registration", link: RRB_SONG_LINKS.appleMusic, external: true },
          ].map((sub, idx) => (
            <Card 
              key={idx} 
              className={`bg-slate-800/50 border-purple-500/20 text-center ${sub.link ? 'cursor-pointer hover:border-amber-500/40 transition-all' : ''}`}
              onClick={() => sub.link && ((sub as any).external ? window.open(sub.link, '_blank') : setLocation(sub.link))}
            >
              <CardContent className="pt-4 pb-4">
                <p className="font-semibold text-white text-sm">{sub.name}</p>
                <p className="text-xs text-purple-300 mt-1">{sub.owner}</p>
                {sub.link && <p className="text-xs text-amber-400 mt-1">View Page →</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Platform Partner */}
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 text-center">Platform Partner</h4>
          <Card 
            className="bg-gradient-to-r from-cyan-950/50 to-slate-800/50 border-cyan-500/20 cursor-pointer hover:border-cyan-500/40 transition-all max-w-md mx-auto"
            onClick={() => window.open('https://hybridcast.manus.space/', '_blank')}
          >
            <CardContent className="pt-4 pb-4 text-center">
              <p className="font-semibold text-cyan-300 text-sm">⚡ HybridCast Emergency Broadcast</p>
              <p className="text-xs text-gray-400 mt-1">v2.47.24 — 116+ Tabs — Offline-First PWA</p>
              <p className="text-xs text-cyan-400 mt-1">Open Platform →</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-purple-300">
          <p>A Canryn Production and its subsidiaries</p>
          <p className="text-sm mt-2">"A Voice for the Voiceless" — Sweet Miracles 501(c)(3) & 508</p>
          <p className="text-xs text-purple-400/60 mt-2">Built by <a href="/ty-battle" className="text-amber-400/80 hover:text-amber-300 underline">Ty Battle (Ty Bat Zan)</a> — Digital Steward — TBZ Operating System — QUMUS Powered</p>
          <p className="text-xs text-gray-500 mt-1">© 2026 Canryn Production. All rights reserved. TBZ-OS is proprietary technology of Canryn Production.</p>
        </div>
      </footer>
    </div>
  );
}
