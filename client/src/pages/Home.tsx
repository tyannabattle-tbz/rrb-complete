import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Zap } from 'lucide-react';

export default function Home() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Audio playback is handled by radio player component

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Show login options if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
        {/* SEO: Visible headings for crawlers and users */}
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">QUMUS Orchestration Engine</h1>
        <h2 className="text-sm text-center text-slate-400 mb-6">Autonomous Broadcasting and Ecosystem Control by Canryn Production</h2>
        <Card className="w-full bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Zap className="w-12 h-12 text-blue-500" />
            </div>
            <CardTitle className="text-2xl text-white">QUMUS</CardTitle>
            <CardDescription className="text-slate-400">
              Autonomous Orchestration Engine
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-300 text-center">
              90%+ Autonomy • Full Ecosystem Control
            </p>

            <div className="space-y-3 pt-4">
              <Button
                onClick={() => {
                  const loginUrl = new URL('/api/oauth/login', window.location.origin);
                  window.location.href = loginUrl.toString();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                Sign In to QUMUS
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-800 text-slate-400">or</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  window.location.href = '/api/test-login';
                }}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                size="lg"
              >
                Test Login (Dev Mode)
              </Button>
            </div>

            <div className="mt-6 p-3 bg-amber-900/30 border border-amber-700/50 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200">
                <p className="font-semibold">Development Mode</p>
                <p className="mt-1">Use "Test Login" to access QUMUS Control Center without OAuth authentication.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  // Authenticated user - show ecosystem dashboard
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
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-500 text-green-400">
                All Systems Online
              </Badge>

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
              <p className="text-amber-300 text-lg mb-4">Named for Mama Valerie and Anna's — that's Tyanna and LaShanna</p>
              <p className="text-gray-300 mb-6">
                Valanna is the soul of this whole ecosystem. She watches over RRB Radio,
                HybridCast, Sweet Miracles, and Canryn Production — handling 90% of
                the decisions so the family can focus on what matters. She's not just
                an AI. She carries Mama Valerie's spirit in every choice she makes,
                protecting the legacy of Seabrun Candy Hunter.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/50">12 AI Policies</Badge>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/50">90% Valanna, 10% You</Badge>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/50">Full Audit Trail</Badge>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/50">Human Override</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* System Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systems.map((system) => (
            <Card
              key={system.id}
              className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-purple-500/20"
              onClick={() => (system as any).external ? window.open(system.path, '_blank') : setLocation(system.path)}
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
                      (system as any).external ? window.open(system.path, '_blank') : setLocation(system.path);
                    }}
                    className={`w-full bg-gradient-to-r ${system.color} hover:opacity-90`}
                  >
                    {(system as any).external ? 'Visit Site →' : 'Access →'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
            { name: "Little C", owner: "Carlos Kembrel" },
            { name: "Sean's Music", owner: "Sean Hunter" },
            { name: "Anna's", owner: "Tyanna & LaShanna" },
            { name: "Jaelon Enterprises", owner: "Jaelon Hunter" },
            { name: "Payten Music (BMI)", owner: "RRB Registration" },
          ].map((sub, idx) => (
            <Card key={idx} className="bg-slate-800/50 border-purple-500/20 text-center">
              <CardContent className="pt-4 pb-4">
                <p className="font-semibold text-white text-sm">{sub.name}</p>
                <p className="text-xs text-purple-300 mt-1">{sub.owner}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-purple-300">
          <p>A Canryn Production and its subsidiaries</p>
          <p className="text-sm mt-2">"A Voice for the Voiceless" — Sweet Miracles 501(c)(3) & 508</p>
        </div>
      </footer>
    </div>
  );
}
