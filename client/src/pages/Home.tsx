import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogIn, LogOut, Zap, Video, Users, ArrowRight, Radio, Headphones, Podcast, BarChart3, AlertTriangle } from 'lucide-react';
import { getLoginUrl } from '@/const';
import { trpc } from '@/lib/trpc';
import { Link } from 'wouter';
import { RRBSongBadge } from '@/components/RRBSongBadge';
import { RRB_SONG_LINKS } from '@/lib/rrbSongLinks';

function EcosystemOverview() {
  const [, setLocation] = useLocation();

  return (
    <div className="mb-12">
      <div className="bg-gradient-to-br from-slate-900/90 via-purple-900/40 to-slate-900/90 rounded-2xl border border-purple-500/30 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">QUMUS Ecosystem</h2>
            <p className="text-purple-300/70">Autonomous. Orchestrated. Yours.</p>
          </div>
          <div className="text-right">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-sm px-3 py-1">
              All Systems Online
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-lg border border-purple-500/20 p-4 hover:border-purple-500/40 transition-all cursor-pointer" onClick={() => setLocation('/qumus')}>
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-white">QUMUS Control</h3>
            </div>
            <p className="text-sm text-white/60">Backend orchestration, 90% autonomous</p>
          </div>

          <div className="bg-slate-800/50 rounded-lg border border-blue-500/20 p-4 hover:border-blue-500/40 transition-all cursor-pointer" onClick={() => window.open('https://tyos.manus.space', '_blank')}>
            <div className="flex items-center gap-3 mb-3">
              <Radio className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Ty OS Radio</h3>
            </div>
            <p className="text-sm text-white/60">54 channels, single streaming source</p>
          </div>

          <div className="bg-slate-800/50 rounded-lg border border-red-500/20 p-4 hover:border-red-500/40 transition-all cursor-pointer" onClick={() => setLocation('/hybridcast')}>
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="font-semibold text-white">HybridCast</h3>
            </div>
            <p className="text-sm text-white/60">Emergency broadcast, offline-first</p>
          </div>

          <div className="bg-slate-800/50 rounded-lg border border-amber-500/20 p-4 hover:border-amber-500/40 transition-all cursor-pointer" onClick={() => setLocation('/rrb-legacy')}>
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white">RRB Legacy</h3>
            </div>
            <p className="text-sm text-white/60">Archive, heritage, community vault</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAccessButtons() {
  const [, setLocation] = useLocation();

  return (
    <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
      <Button
        onClick={() => window.open('https://tyos.manus.space', '_blank')}
        className="h-16 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold text-lg"
      >
        <Radio className="w-6 h-6 mr-3" />
        Listen on Ty OS Radio
      </Button>

      <Button
        onClick={() => setLocation('/hybridcast')}
        className="h-16 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold text-lg"
      >
        <AlertTriangle className="w-6 h-6 mr-3" />
        Emergency Broadcast
      </Button>

      <Button
        onClick={() => setLocation('/qumus')}
        className="h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-lg"
      >
        <Zap className="w-6 h-6 mr-3" />
        QUMUS Control Center
      </Button>
    </div>
  );
}

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
      id: 'tyos',
      title: '📻 Ty OS Radio',
      description: 'Single streaming source with 54 radio channels. Music, podcasts, healing frequencies.',
      features: ['54 Channels', 'Live Streaming', 'Healing Frequencies', 'Listener Analytics'],
      color: 'from-blue-600 to-cyan-600',
      path: 'https://tyos.manus.space',
      status: 'Active',
      external: true,
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
      id: 'rrb-legacy',
      title: '📚 RRB Legacy Vault',
      description: 'Archive and heritage vault. Links to Ty OS for streaming, preserves community history.',
      features: ['Legacy Archive', 'Family Heritage', 'Community Vault', 'Ty OS Integration'],
      color: 'from-amber-600 to-yellow-600',
      path: '/rrb-legacy',
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
      id: 'squadd',
      title: '🌍 SQUADD Goals',
      description: 'Sisters Questing Unapologetically After Divine Destiny. Community partnership platform.',
      features: ['Community Goals', 'Member Tracking', 'Progress Updates', 'Global Coalition'],
      color: 'from-amber-600 to-yellow-600',
      path: '/squadd',
      status: 'Active',
    },
    {
      id: 'podcast',
      title: '🎙️ Podcast Studio',
      description: 'Interactive podcast player with video, games, AI personalities, and live call-ins.',
      features: ['Video Integration', 'AI Personalities', 'Live Call-in', 'Multi-Platform'],
      color: 'from-violet-600 to-fuchsia-600',
      path: '/podcast-player',
      status: 'Active',
    },
    {
      id: 'analytics',
      title: '📊 Analytics Dashboard',
      description: 'Real-time listener analytics, affiliate program, and community leaderboards.',
      features: ['Listener Metrics', 'Affiliate Tracking', 'Leaderboards', 'Engagement Scoring'],
      color: 'from-indigo-600 to-purple-600',
      path: '/listener-analytics',
      status: 'Active',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            QUMUS Ecosystem
          </h1>
          <p className="text-xl text-purple-300/80 mb-2">
            Autonomous. Orchestrated. Yours.
          </p>
          <p className="text-sm text-white/60">
            Complete ecosystem for community, broadcasting, and autonomous orchestration
          </p>
        </div>

        {/* Quick Access */}
        <QuickAccessButtons />

        {/* Ecosystem Overview */}
        <EcosystemOverview />

        {/* Live Conferences */}
        <LiveConferenceWidget />

        {/* Systems Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">All Systems</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systems.map((system) => (
              <Card
                key={system.id}
                className={`bg-gradient-to-br ${system.color} border-0 cursor-pointer hover:shadow-lg transition-all`}
                onClick={() => {
                  if (system.external) {
                    window.open(system.path, '_blank');
                  } else {
                    setLocation(system.path);
                  }
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-white text-lg">{system.title}</CardTitle>
                    <Badge className="bg-white/20 text-white border-white/30">{system.status}</Badge>
                  </div>
                  <CardDescription className="text-white/80">{system.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {system.features.map((feature, idx) => (
                      <div key={idx} className="text-sm text-white/70 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-white/60 text-sm mb-2">
            A Canryn Production • Sweet Miracles • A Voice for the Voiceless
          </p>
          <div className="flex justify-center">
            <RRBSongBadge variant="compact" showTitle />
          </div>
        </div>
      </div>
    </div>
  );
}
